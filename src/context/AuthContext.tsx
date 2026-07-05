"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      console.error("Google Sign-In Error:", error);
      const err = error as { code?: string };
      const code = err?.code || "";
      let msg = "เข้าสู่ระบบไม่สำเร็จ";
      if (code === "auth/unauthorized-domain") {
        msg = `โดเมนนี้ยังไม่ได้รับอนุญาต\n\nไปที่ Firebase Console -> Authentication -> Settings -> Authorized domains แล้วเพิ่มโดเมนของเว็บนี้: ${window.location.hostname}`;
      } else if (code === "auth/operation-not-allowed") {
        msg = "ยังไม่ได้เปิด Google sign-in\n\nไปที่ Firebase Console -> Authentication -> Sign-in method -> เปิด Google";
      } else if (code === "auth/popup-closed-by-user") {
        msg = "คุณปิดหน้าต่างล็อกอินก่อนเสร็จ ลองกดใหม่อีกครั้ง";
      } else if (code === "auth/network-request-failed") {
        msg = "เชื่อมต่อเน็ตไม่ได้ ลองเช็กสัญญาณแล้วกดใหม่";
      }
      alert(msg);
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign-Out Error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
