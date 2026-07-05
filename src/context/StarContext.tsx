"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";

// คีย์หลักใน localStorage
const APP_PREFIX = "grade1_math_";
const STARS_KEY = `${APP_PREFIX}stars`;
const HISTORY_KEY = `${APP_PREFIX}history`;
const LAST_SYNC_KEY = `${APP_PREFIX}last_sync_ms`;
const CLIENT_ID_KEY = `${APP_PREFIX}client_id`;

interface QuizAttempt {
  chapterId: string;
  score: number;
  total: number;
  starsEarned: number;
  timestamp: number;
}

interface RemoteNewerData {
  stars: Record<string, number>;
  history: QuizAttempt[];
  updatedAtMs: number;
}

interface StarContextType {
  stars: Record<string, number>; // map ของ chapterId -> จำนวนดาวสะสม
  history: QuizAttempt[];
  addStars: (chapterId: string, earnedStars: number, score: number, total: number) => void;
  clearProgress: () => void;
  syncStatus: "synced" | "syncing" | "offline" | "idle" | "error" | "conflict";
  remoteNewerData: RemoteNewerData | null;
  applyRemoteData: () => void;
}

const StarContext = createContext<StarContextType>({
  stars: {},
  history: [],
  addStars: () => {},
  clearProgress: () => {},
  syncStatus: "offline",
  remoteNewerData: null,
  applyRemoteData: () => {},
});

// สร้าง Client ID ในครั้งแรกเพื่อไม่ให้ซิงค์ข้อมูลซ้ำจากเครื่องตัวเอง
const getClientId = () => {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = "c_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
};

export const StarProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [stars, setStars] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [syncStatus, setSyncStatus] = useState<StarContextType["syncStatus"]>("offline");
  const [remoteNewerData, setRemoteNewerData] = useState<RemoteNewerData | null>(null);

  const clientId = useRef<string>("");
  const skipSyncRef = useRef<boolean>(false);
  const pushTimerRef = useRef<NodeJS.Timeout | null>(null);
  const unsubscribeSnapshotRef = useRef<(() => void) | null>(null);

  // สร้าง Refs สำหรับเก็บข้อมูลล่าสุด ป้องกัน Stale Closure ใน Snapshot Listener และกำจัดปัญหา Lint warning
  const starsRef = useRef(stars);
  const historyRef = useRef(history);
  const userRef = useRef(user);

  useEffect(() => {
    starsRef.current = stars;
  }, [stars]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Push ข้อมูลจริงไปยัง Firestore (Hoistable function declaration)
  async function pushNow(uid: string, currentStars: Record<string, number>, currentHistory: QuizAttempt[]) {
    try {
      setSyncStatus("syncing");
      const userDocRef = doc(db, "users", uid);
      const nowMs = Date.now();
      
      await setDoc(userDocRef, {
        stars: currentStars,
        history: currentHistory,
        updatedAtMs: nowMs,
        updatedBy: clientId.current,
        updatedAt: serverTimestamp(),
      });
      
      localStorage.setItem(LAST_SYNC_KEY, String(nowMs));
      setSyncStatus("synced");
    } catch (e) {
      console.error("Firestore push error:", e);
      setSyncStatus("error");
    }
  }

  // วางเวลา Debounce ในการ Push ปัดเป่า Lint exhaustive-deps warning ด้วย useCallback
  const schedulePush = useCallback(() => {
    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    pushTimerRef.current = setTimeout(() => {
      const currUser = userRef.current;
      if (currUser) {
        pushNow(currUser.uid, starsRef.current, historyRef.current);
      }
    }, 1500);
  }, []);

  // 1. โหลดข้อมูลเบื้องต้นจาก localStorage (Offline-first)
  useEffect(() => {
    clientId.current = getClientId();
    
    const localStars = localStorage.getItem(STARS_KEY);
    const localHistory = localStorage.getItem(HISTORY_KEY);
    
    // ห่อด้วย setTimeout เพื่อหลีกเลี่ยง synchronous rendering warning ใน effect
    setTimeout(() => {
      if (localStars) {
        try { setStars(JSON.parse(localStars)); } catch (e) { console.error(e); }
      }
      if (localHistory) {
        try { setHistory(JSON.parse(localHistory)); } catch (e) { console.error(e); }
      }
    }, 0);
  }, []);

  // 2. ดักการเปลี่ยนของข้อมูลดาวและประวัติเพื่อเซฟลง localStorage และเตรียม Push ขึ้น Firestore
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    localStorage.setItem(STARS_KEY, JSON.stringify(stars));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

    if (user && !skipSyncRef.current) {
      schedulePush();
    }
  }, [stars, history, user, schedulePush]);

  // 3. จัดการ Real-time Sync ด้วย Firestore Snapshot เมื่อผู้ใช้ล็อกอิน
  useEffect(() => {
    if (!user) {
      // เมื่อ logout ให้เคลียร์การฟังสัญญาณ และรีเซ็ตข้อมูลภายในสเตท (ตามพฤติกรรมความปลอดภัย)
      if (unsubscribeSnapshotRef.current) {
        unsubscribeSnapshotRef.current();
        unsubscribeSnapshotRef.current = null;
      }
      
      // หลีกเลี่ยง warning เรื่องการเรียก setState สวนกลับใน body ของ effect ด้วย setTimeout
      setTimeout(() => {
        setSyncStatus("offline");
        setRemoteNewerData(null);
      }, 0);
      return;
    }

    // ห่อด้วย setTimeout เพื่อป้องกัน warning เรื่องการเรียก setState สวนกลับใน body ของ effect
    setTimeout(() => {
      setSyncStatus("syncing");
    }, 0);

    const userDocRef = doc(db, "users", user.uid);

    // เริ่มการดักฟังแบบเรียลไทม์
    unsubscribeSnapshotRef.current = onSnapshot(
      userDocRef,
      (docSnap) => {
        // ดึงข้อมูลล่าสุดผ่าน Ref เพื่อความถูกต้อง ปลอดภัยต่อ Closure issues
        const currentStars = starsRef.current;
        const currentHistory = historyRef.current;

        if (!docSnap.exists()) {
          // ยังไม่มีข้อมูลในคลาวด์เลย -> ดันชุดแรกขึ้นทันที
          pushNow(user.uid, currentStars, currentHistory);
          setSyncStatus("synced");
          return;
        }

        const remoteData = docSnap.data();
        const localLastSync = Number(localStorage.getItem(LAST_SYNC_KEY) || 0);
        
        // เปรียบเทียบข้อมูล
        const remoteUpdatedBy = remoteData.updatedBy;
        const remoteUpdatedAtMs = remoteData.updatedAtMs || 0;

        // แปลงข้อมูลรีโมตมาเปรียบเทียบเนื้อหา
        const remoteStars = remoteData.stars || {};
        const remoteHistory = remoteData.history || [];

        const isContentIdentical = 
          JSON.stringify(remoteStars) === JSON.stringify(currentStars) &&
          JSON.stringify(remoteHistory) === JSON.stringify(currentHistory);

        if (isContentIdentical) {
          setSyncStatus("synced");
          setRemoteNewerData(null);
          return;
        }

        // หากเนื้อหาไม่ตรงกัน ให้พิจารณาว่าใครใหม่กว่า
        if (remoteUpdatedBy !== clientId.current) {
          if (remoteUpdatedAtMs > localLastSync) {
            // คลาวด์ใหม่กว่า -> ตั้งค่าสถานะ conflict เพื่อแจ้งเตือน (หรืออัปเดตออโต้หากเป็นจังหวะ login ครั้งแรก)
            const isFirstLoadSync = localLastSync === 0;
            if (isFirstLoadSync) {
              // ดึงข้อมูลมาอัปเดตทันทีหากเพิ่งเข้าสู่ระบบ
              applyData(remoteStars, remoteHistory, remoteUpdatedAtMs);
            } else {
              setSyncStatus("conflict");
              setRemoteNewerData({
                stars: remoteStars,
                history: remoteHistory,
                updatedAtMs: remoteUpdatedAtMs,
              });
            }
          } else {
            // ฝั่งเครื่องนี้ใหม่กว่า -> เขียนทับขึ้นคลาวด์
            schedulePush();
          }
        }
      },
      (error) => {
        console.error("Firestore sync error:", error);
        setSyncStatus("error");
      }
    );

    return () => {
      if (unsubscribeSnapshotRef.current) {
        unsubscribeSnapshotRef.current();
        unsubscribeSnapshotRef.current = null;
      }
    };
  }, [user, schedulePush]);

  // ฟังก์ชันช่วยบันทึกการอัปเดตลง State (ย้ายมาใช้รูปแบบฟังก์ชันทั่วไปเพื่อให้ Hoist ไปเรียกใช้งานด้านบนได้)
  function applyData(remoteStars: Record<string, number>, remoteHistory: QuizAttempt[], updatedAtMs: number) {
    skipSyncRef.current = true;
    try {
      setStars(remoteStars);
      setHistory(remoteHistory);
      localStorage.setItem(STARS_KEY, JSON.stringify(remoteStars));
      localStorage.setItem(HISTORY_KEY, JSON.stringify(remoteHistory));
      localStorage.setItem(LAST_SYNC_KEY, String(updatedAtMs));
      setSyncStatus("synced");
      setRemoteNewerData(null);
    } finally {
      // เปิดท้อกลับตามปกติหลังเซฟเสร็จ
      setTimeout(() => {
        skipSyncRef.current = false;
      }, 500);
    }
  }

  // ดึงข้อมูลใหม่จากอีกเครื่องมาแทนที่เมื่อผู้ใช้กดยอมรับ
  const applyRemoteData = () => {
    if (remoteNewerData) {
      applyData(remoteNewerData.stars, remoteNewerData.history, remoteNewerData.updatedAtMs);
    }
  };

  // เพิ่มดาวจากการเรียน/ทำโจทย์
  const addStars = (chapterId: string, earnedStars: number, score: number, total: number) => {
    if (earnedStars <= 0) return;

    // อัปเดตข้อมูลสเตท Stars
    setStars((prev) => {
      const current = prev[chapterId] || 0;
      const nextStars = current + earnedStars;
      return {
        ...prev,
        [chapterId]: nextStars,
      };
    });

    // เพิ่มในประวัติความคืบหน้า
    const attempt: QuizAttempt = {
      chapterId,
      score,
      total,
      starsEarned: earnedStars,
      timestamp: Date.now(),
    };
    setHistory((prev) => [attempt, ...prev]);
  };

  // ลบข้อมูลเพื่อเริ่มใหม่ หรือล้างข้อมูลตอนผู้ใช้ออกจากระบบป้องกันการปนเปื้อนข้อมูล
  const clearProgress = () => {
    skipSyncRef.current = true;
    try {
      setStars({});
      setHistory([]);
      localStorage.removeItem(STARS_KEY);
      localStorage.removeItem(HISTORY_KEY);
      localStorage.removeItem(LAST_SYNC_KEY);
      setRemoteNewerData(null);
      setSyncStatus(user ? "synced" : "offline");
    } finally {
      setTimeout(() => {
        skipSyncRef.current = false;
      }, 500);
    }
  };

  return (
    <StarContext.Provider
      value={{
        stars,
        history,
        addStars,
        clearProgress,
        syncStatus,
        remoteNewerData,
        applyRemoteData,
      }}
    >
      {children}
    </StarContext.Provider>
  );
};

export const useStars = () => useContext(StarContext);
