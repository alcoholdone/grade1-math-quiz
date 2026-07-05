/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import CuteDialog from "@/components/CuteDialog";
import { useAuth } from "@/context/AuthContext";
import { useStars } from "@/context/StarContext";
import { chapters } from "@/lib/chapters";
import { LogIn, LogOut, Star, Sparkles, RefreshCw, Trash2, Award } from "lucide-react";

export default function HomePage() {
  const { user, logOut, signInWithGoogle } = useAuth();
  const { stars, syncStatus, remoteNewerData, applyRemoteData, clearProgress } = useStars();
  const router = useRouter();
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  // คำนวณดาวสะสมทั้งหมด
  const totalStars = Object.values(stars).reduce((sum, count) => sum + count, 0);

  const handleStartQuiz = (chapterId: string) => {
    router.push(`/quiz/${chapterId}`);
  };

  const handleClear = () => {
    setIsClearDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-amber-100 to-amber-50 pb-16 select-none font-sans">
      {/* 1. แถบหัวข้อด้านบน (Top Navigation Bar) */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-md border-b-4 border-amber-200 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl animate-bounce">🦖</span>
          <div>
            <h1 className="text-2xl font-extrabold text-sky-600 tracking-wide">เก่งเลข ป.1 🌟</h1>
            <p className="text-slate-500 font-bold text-xs">ทบทวนเตรียมสอบกลางภาค</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* ป้ายดาวสะสม */}
          <div className="bg-amber-100 border-2 border-amber-400 rounded-2xl py-2 px-4 flex items-center gap-2 shadow-sm">
            <Star className="text-amber-500 fill-amber-500 animate-spin-slow" size={24} />
            <span className="text-amber-800 font-extrabold text-xl">{totalStars} ดวง</span>
          </div>

          {/* ข้อมูลล็อกอินและการเชื่อมต่อ */}
          {user ? (
            <div className="flex items-center gap-3 bg-sky-50 border-2 border-sky-200 rounded-2xl py-1.5 px-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "user"}
                  className="w-8 h-8 rounded-full border border-sky-400"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-xl">🐱</span>
              )}
              <div className="text-left hidden sm:block">
                <p className="text-sky-800 font-bold text-xs max-w-[120px] truncate">
                  {user.displayName || "เด็กน้อยเก่งเลข"}
                </p>
                <span className="text-[10px] text-green-500 font-semibold flex items-center gap-1">
                  ● คลาวด์ซิงค์
                </span>
              </div>
              <button
                onClick={logOut}
                className="p-2 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-xl transition-all active:scale-95"
                title="ออกจากระบบ"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="py-2.5 px-5 bg-sky-400 hover:bg-sky-500 text-white rounded-2xl font-extrabold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 border-b-4 border-sky-600 active:border-b-0 flex items-center gap-2"
            >
              <LogIn size={18} />
              <span>เซฟดาวข้ามเครื่อง</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. ตัวแจ้งเตือน Sync Status Conflict */}
      {remoteNewerData && (
        <div className="max-w-4xl mx-auto mt-6 px-4">
          <div className="bg-amber-100 border-4 border-amber-400 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-lg animate-pulse">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔄</span>
              <p className="text-amber-800 font-bold text-sm text-center sm:text-left">
                พบข้อมูลความคืบหน้า (ดาวสะสม) ใหม่จากอุปกรณ์อีกเครื่องของคุณ!
              </p>
            </div>
            <button
              onClick={applyRemoteData}
              className="py-2 px-6 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 border-b-4 border-amber-700"
            >
              <RefreshCw size={18} className="animate-spin" />
              <span>ดึงข้อมูลล่าสุดเลย</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. ส่วนเนื้อหาหลัก */}
      <main className="max-w-4xl mx-auto px-4 mt-10">
        {/* แบนเนอร์ต้อนรับสุดน่ารัก */}
        <div className="bg-white/70 backdrop-blur-sm border-4 border-white rounded-3xl p-8 text-center relative overflow-hidden shadow-lg mb-10">
          <div className="absolute top-2 left-2 text-sky-200 animate-bounce">
            <Sparkles size={40} />
          </div>
          <div className="absolute bottom-2 right-2 text-pink-200 animate-bounce delay-300">
            <Award size={48} />
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-sky-600 mb-3 tracking-wide">
            โรงเรียนคณิตศาสตร์แสนสนุก 🎪
          </h2>
          <p className="text-slate-600 font-bold max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            มาร่วมผจญภัยในโลกของตัวเลข เพื่อทบทวนเตรียมตัวสอบกลางภาคด้วยกันนะ!
            ตอบถูกรับดาวทันที ลากคำตอบหรือกดเลือกเพื่อผ่านด่าน ไม่ต้องพิมพ์คีย์บอร์ดเลยจ้า!
          </p>
        </div>

        {/* รายชื่อบทเรียน */}
        <div className="space-y-6">
          {chapters.map((chapter) => {
            const earnedStars = stars[chapter.id] || 0;
            return (
              <div
                key={chapter.id}
                onClick={() => handleStartQuiz(chapter.id)}
                className="bg-white hover:bg-sky-50/50 cursor-pointer border-4 border-white hover:border-sky-300 rounded-3xl p-6 shadow-md hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 active:scale-99 transition-all duration-300 flex flex-col md:flex-row justify-between items-center gap-6"
              >
                <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
                  <span className="text-7xl bg-sky-100 rounded-2xl p-4 w-24 h-24 flex items-center justify-center border-2 border-sky-200">
                    {chapter.emoji}
                  </span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-wide mb-1">
                      {chapter.title}
                    </h3>
                    <p className="text-slate-500 font-bold text-sm">
                      {chapter.description}
                    </p>
                  </div>
                </div>

                {/* แสดงจำนวนดาวที่ทำได้ในบทนี้ */}
                <div className="flex flex-col items-center gap-2 min-w-[120px]">
                  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 rounded-full py-1 px-4 shadow-sm">
                    <Star className="text-amber-500 fill-amber-500" size={18} />
                    <span className="text-amber-700 font-extrabold text-md">
                      ได้สะสม {earnedStars} ดวง
                    </span>
                  </div>
                  <button className="py-2.5 px-6 bg-emerald-400 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-sm shadow-md hover:shadow-lg border-b-4 border-emerald-600 active:border-b-0 transition-all">
                    {earnedStars > 0 ? "ทบทวนอีกครั้ง" : "เริ่มลุยเลย! 🚀"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* แถบการจัดการและซิงค์เพิ่มเติม */}
        <div className="mt-12 flex justify-between items-center flex-wrap gap-4 border-t border-amber-200/50 pt-6">
          <p className="text-xs font-semibold text-slate-400">
            สถานะคลาวด์: <span className="capitalize font-bold text-slate-600">{syncStatus}</span>
          </p>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 py-2 px-4 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 font-extrabold rounded-xl text-xs border border-red-200 transition-all active:scale-95"
          >
            <Trash2 size={14} />
            <span>เริ่มต้นสะสมดาวใหม่</span>
          </button>
        </div>
      </main>

      <CuteDialog
        isOpen={isClearDialogOpen}
        title="เริ่มต้นสะสมดาวใหม่?"
        description="คุณต้องการลบดาวสะสมทั้งหมดและประวัติทำแบบฝึกหัด เพื่อเริ่มต้นเล่นใหม่อีกรอบใช่ไหมครับ? 🌟"
        type="warning"
        confirmText="ใช่ เริ่มต้นใหม่เลย"
        cancelText="ไม่ใช่ ยกเลิก"
        onConfirm={clearProgress}
        onClose={() => setIsClearDialogOpen(false)}
      />
    </div>
  );
}
