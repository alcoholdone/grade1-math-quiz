import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
} from "firebase/firestore";

// ดึงการตั้งค่า Firebase จากแอปตัวอย่าง
const firebaseConfig = {
  apiKey: "AIzaSyBg6LnkFij--QQjt9Ijd3jYHWyHMjF7llY",
  authDomain: "grade1-math-quiz.firebaseapp.com",
  projectId: "grade1-math-quiz",
  storageBucket: "grade1-math-quiz.firebasestorage.app",
  messagingSenderId: "261424251709",
  appId: "1:261424251709:web:ab7eac8c096ff3eddcfb54",
  measurementId: "G-JE4ED7TRC5",
};

// ตรวจสอบความพร้อมการรันบนฝั่ง Client เท่านั้น
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let db: Firestore;
if (typeof window !== "undefined") {
  try {
    // ตั้งค่า local cache ใน firestore เพื่อรองรับการทำงานแบบ offline-first
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch (err) {
    console.warn(
      "Firestore cache initialization failed, falling back to default configuration:",
      err,
    );
    // ในกรณีที่ tabManager ไม่ได้รับการสนับสนุนหรือรันซ้ำ จะ fallback ไปใช้ config ปกติ
    db = initializeFirestore(app, {});
  }
} else {
  db = initializeFirestore(app, {});
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export { app, db, auth, googleProvider };
