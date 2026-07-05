"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogIn, Sparkles, Star } from "lucide-react";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  // หากล็อกอินสำเร็จแล้วให้ส่งไปหน้าแรก
  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-4">
        <div className="animate-bounce text-6xl">🐹</div>
        <p className="mt-4 text-amber-800 font-bold text-xl animate-pulse">กำลังโหลดข้อมูลการ์ตูนสุดสนุก...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-emerald-100 to-amber-50 flex flex-col items-center justify-center p-6 select-none">
      {/* การ์ดเข้าสู่ระบบ */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-white text-center transform transition-all hover:scale-102">
        {/* หัวข้อน่ารักๆ */}
        <div className="relative mb-6 inline-block">
          <span className="text-8xl">🦖</span>
          <div className="absolute -top-2 -right-2 text-yellow-400 animate-spin-slow">
            <Star size={36} fill="currentColor" />
          </div>
          <div className="absolute -bottom-2 -left-2 text-pink-400 animate-bounce">
            <Sparkles size={28} fill="currentColor" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-sky-600 tracking-wide mb-2">
          เก่งเลข ป.1 🌟
        </h1>
        <p className="text-slate-600 font-medium mb-6 text-sm">
          สะสมดาวผู้กล้าเพื่อรับรางวัลสุดพิเศษ! <br />
          (ให้คุณพ่อคุณแม่ช่วยล็อกอินผ่าน Google นะครับ)
        </p>

        {/* ปุ่ม Login */}
        <button
          onClick={signInWithGoogle}
          className="w-full py-4 px-6 bg-gradient-to-r from-sky-400 to-indigo-400 hover:from-sky-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-indigo-600"
        >
          <LogIn size={24} />
          <span>เข้าสู่ระบบด้วย Google</span>
        </button>

        {/* โหมดออฟไลน์ */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <button
            onClick={() => router.push("/")}
            className="text-sky-500 hover:text-sky-600 font-bold text-md transition-colors underline decoration-2 underline-offset-4"
          >
            เล่นโหมดออฟไลน์ (ไม่เซฟดาวข้ามเครื่อง) 🚀
          </button>
        </div>
      </div>

      {/* เครดิตเล็กๆ ท้ายหน้า */}
      <p className="mt-8 text-slate-500 text-xs font-semibold">
        © 2026 เกมทบทวนคณิตศาสตร์ ป.1 แสนสนุก
      </p>
    </div>
  );
}
