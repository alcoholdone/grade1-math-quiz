"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { chapters, Question } from "@/lib/chapters";
import { generateQuestions } from "@/lib/questionGenerator";
import { useStars } from "@/context/StarContext";
import SpeechButton from "@/components/SpeechButton";
import CuteDialog from "@/components/CuteDialog";
import { Star, ArrowLeft, RotateCcw, Home, Sparkles } from "lucide-react";

// ดึงข้อสอบ dynamic auto-generate ในรอบถัดไป

export default function QuizClient({ chapterId }: { chapterId: string }) {
  const router = useRouter();
  const { addStars } = useStars();

  // ดึงข้อมูลบทเรียน
  const chapter = chapters.find((c) => c.id === chapterId);

  // States สำหรับสุ่มข้อสอบ Dynamic
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  
  // States สำหรับกล่องข้อความแจ้งเตือน (Custom Cute Dialog)
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [isIncompleteDialogOpen, setIsIncompleteDialogOpen] = useState(false);
  
  // สำหรับระบบลากวาง (Drag & Drop / Tap to Place)
  const [selectedDragItem, setSelectedDragItem] = useState<string | null>(null);
  const [slotsAnswer, setSlotsAnswer] = useState<Record<number, string>>({}); // slotIndex -> ตัวเลขที่วาง
  
  // สถานะคำตอบในข้อปัจจุบัน
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  const [score, setScore] = useState(0);
  
  // สถานะหลังทำครบทุกข้อ
  const [showResult, setShowResult] = useState(false);

  // ฟังก์ชันเตรียมและสุ่มสร้างชุดข้อสอบจาก Dynamic Math Generator (DMG) 100%
  const initializeQuiz = useCallback(() => {
    if (!chapter) return;
    
    // ผลิตข้อสอบสดใหม่ 10 ข้อแบบสุ่มไม่ซ้ำ และสลับตัวเลือกคำตอบออโต้
    const prepared = generateQuestions(chapterId, 10);
    
    setShuffledQuestions(prepared);
    setCurrentIdx(0);
    setSelectedChoice(null);
    setSelectedDragItem(null);
    setSlotsAnswer({});
    setIsAnswered(false);
    setShowResult(false);
    setScore(0);
    setStarsEarned(0);
  }, [chapter, chapterId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      initializeQuiz();
    }, 0);
    return () => clearTimeout(timer);
  }, [initializeQuiz]);

  // นำเสียงเอฟเฟกต์ประกอบการเรียนมาใช้อ่านเบื้องต้น
  const playSoundEffect = (type: "correct" | "incorrect" | "victory") => {
    if (typeof window === "undefined") return;
    try {
      const audioCtx = new (
        window.AudioContext || 
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      )();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "correct") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else if (type === "incorrect") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        osc.frequency.linearRampToValueAtTime(110, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } else if (type === "victory") {
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        notes.forEach((freq, i) => {
          const noteOsc = audioCtx.createOscillator();
          const noteGain = audioCtx.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(audioCtx.destination);
          noteOsc.type = "triangle";
          noteOsc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.15);
          noteGain.gain.setValueAtTime(0.2, audioCtx.currentTime + i * 0.15);
          noteGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.15 + 0.3);
          noteOsc.start(audioCtx.currentTime + i * 0.15);
          noteOsc.stop(audioCtx.currentTime + i * 0.15 + 0.3);
        });
      }
    } catch (e) {
      console.warn("Audio Context support is blocked or not available:", e);
    }
  };

  if (!chapter) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50">
        <h2 className="text-2xl font-black text-red-500 mb-4">ไม่พบบทเรียนนี้ 🦖</h2>
        <button
          onClick={() => router.push("/")}
          className="py-3 px-6 bg-sky-400 text-white rounded-2xl font-bold shadow-md"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  // หากอยู่ในช่วงเตรียมข้อสอบ
  if (shuffledQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-4">
        <div className="animate-bounce text-6xl">🦕</div>
        <p className="mt-4 text-sky-800 font-extrabold text-xl animate-pulse">กำลังสุ่มเตรียมโจทย์คณิตศาสตร์สุดสนุก...</p>
      </div>
    );
  }

  const currentQuestion: Question = shuffledQuestions[currentIdx];

  // 1. ตรวจสอบคำตอบแบบ Choice
  const handleChoiceSelect = (choice: string) => {
    if (isAnswered) return;
    setSelectedChoice(choice);
    setIsAnswered(true);

    const correct = choice === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
      setStarsEarned((prev) => prev + 1);
      playSoundEffect("correct");
    } else {
      playSoundEffect("incorrect");
    }
  };

  // 2. ลอจิกแบบ Drag & Drop / Tap to Place
  const handleDragItemSelect = (item: string) => {
    if (isAnswered) return;
    setSelectedDragItem(item);
  };

  const handleSlotClick = (slotIdx: number) => {
    if (isAnswered || !selectedDragItem) return;
    
    setSlotsAnswer((prev) => ({
      ...prev,
      [slotIdx]: selectedDragItem,
    }));
    
    setSelectedDragItem(null);
  };

  const handleClearSlots = () => {
    if (isAnswered) return;
    setSlotsAnswer({});
    setSelectedDragItem(null);
  };

  const handleSubmitDragDrop = () => {
    if (isAnswered || !currentQuestion.dropSlots) return;
    
    const filledCount = Object.keys(slotsAnswer).length;
    if (filledCount < currentQuestion.dropSlots.length) {
      setIsIncompleteDialogOpen(true);
      return;
    }

    setIsAnswered(true);

    let correct = true;
    currentQuestion.dropSlots.forEach((slot, idx) => {
      if (slotsAnswer[idx] !== slot.answer) {
        correct = false;
      }
    });

    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
      setStarsEarned((prev) => prev + 1);
      playSoundEffect("correct");
    } else {
      playSoundEffect("incorrect");
    }
  };

  // 3. เปลี่ยนไปข้อถัดไปหรือแสดงสรุป
  const handleNext = () => {
    setSelectedChoice(null);
    setSelectedDragItem(null);
    setSlotsAnswer({});
    setIsAnswered(false);

    if (currentIdx + 1 < shuffledQuestions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // บันทึกดาวสะสม
      addStars(chapterId, starsEarned, score, shuffledQuestions.length);
      setShowResult(true);
      playSoundEffect("victory");
    }
  };

  const handleRestart = () => {
    initializeQuiz();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-amber-50 to-amber-100 pb-12 select-none font-sans">
      {/* ส่วนหัวแสดงความคืบหน้า */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm border-b-4 border-amber-200 px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => setIsExitDialogOpen(true)}
          className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl flex items-center gap-1.5 transition-all active:scale-95 border-b-4 border-slate-300 active:border-b-0 text-sm"
        >
          <ArrowLeft size={18} />
          <span>ออก</span>
        </button>

        {/* ชื่อวิชา / ความก้าวหน้า */}
        <div className="text-center">
          <h2 className="text-md sm:text-lg font-black text-sky-600">{chapter.title}</h2>
          <div className="w-32 bg-slate-200 h-3.5 rounded-full overflow-hidden border-2 border-white shadow-inner mx-auto mt-1">
            <div
              className="bg-emerald-400 h-full transition-all duration-300"
              style={{
                width: `${((currentIdx + (isAnswered ? 1 : 0)) / shuffledQuestions.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* จำนวนดาวในเซสชันนี้ */}
        <div className="bg-amber-100 border border-amber-400 rounded-full py-1.5 px-4 flex items-center gap-1.5 shadow-sm text-sm">
          <Star className="text-amber-500 fill-amber-500 animate-pulse" size={18} />
          <span className="text-amber-800 font-black">{starsEarned} ดวง</span>
        </div>
      </header>

      {/* หน้าสรุปผลลัพธ์ด่านเมื่อทำเสร็จ */}
      {showResult ? (
        <div className="max-w-md mx-auto px-4 mt-12 text-center">
          <div className="bg-white border-4 border-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-2 left-2 text-yellow-300 animate-spin-slow">
              <Star size={36} fill="currentColor" />
            </div>
            <div className="absolute top-4 right-4 text-pink-300 animate-bounce">
              <Sparkles size={28} />
            </div>

            <span className="text-8xl">🏆</span>
            <h1 className="text-3xl font-black text-emerald-500 tracking-wide mt-6 mb-2">
              เก่งมากเลยเด็กดี!
            </h1>
            <p className="text-slate-500 font-bold mb-6 text-sm">
              หนูทำแบบฝึกหัดได้เกรด A เลยครับ!
            </p>

            {/* คะแนนและดาว */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 mb-8 text-center flex flex-col items-center justify-center">
              <p className="text-slate-600 font-extrabold text-sm mb-2">ดาวสะสมที่เพิ่มขึ้น:</p>
              <div className="flex gap-2 mb-4">
                {Array.from({ length: starsEarned }).map((_, idx) => (
                  <Star
                    key={idx}
                    className="text-amber-500 fill-amber-500 scale-120 animate-bounce"
                    style={{ animationDelay: `${idx * 150}ms` }}
                    size={32}
                  />
                ))}
                {starsEarned === 0 && <span className="text-slate-400 font-bold">พยายามใหม่อีกนิดนะ!</span>}
              </div>
              <p className="text-slate-800 font-black text-2xl">
                ได้คะแนน {score} / {shuffledQuestions.length} คะแนน
              </p>
            </div>

            {/* ปุ่มกดนำทาง */}
            <div className="space-y-4">
              <button
                onClick={() => router.push("/")}
                className="w-full py-4 bg-gradient-to-r from-sky-400 to-indigo-400 hover:from-sky-500 hover:to-indigo-500 text-white rounded-2xl font-black text-lg shadow-md hover:shadow-lg transition-all active:scale-95 border-b-4 border-indigo-600 active:border-b-0 flex items-center justify-center gap-2"
              >
                <Home size={20} />
                <span>กลับโรงเรียน (หน้าหลัก)</span>
              </button>
              <button
                onClick={handleRestart}
                className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-md transition-all active:scale-95 border-b-4 border-slate-300 active:border-b-0 flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} />
                <span>ฝึกฝนบทนี้ใหม่อีกครั้ง</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* โครงสร้างหน้าทำโจทย์ปกติ */
        <main className="max-w-2xl mx-auto px-4 mt-8">
          <div className="bg-white border-4 border-white rounded-3xl p-6 shadow-lg min-h-[400px] flex flex-col justify-between quiz-card">
            {/* 1. ส่วนคำถาม */}
            <div>
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex-1">
                  <span className="inline-block py-1 px-3 bg-sky-100 text-sky-700 font-black text-xs rounded-full mb-2">
                    ข้อที่ {currentIdx + 1} จาก {shuffledQuestions.length}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-wide thai-wrap">
                    {currentQuestion.questionText}
                  </h3>
                </div>
                {currentQuestion.audioText && (
                  <SpeechButton text={currentQuestion.audioText} />
                )}
              </div>

              {/* วาดรูป Emoji ในกรณีนับจำนวนแยกเป็น 2 ฝั่ง ซ้าย-ขวา */}
              {currentQuestion.leftCount !== undefined && currentQuestion.rightCount !== undefined ? (
                <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 mb-6">
                  {/* กล่องฝั่งซ้าย */}
                  <div className="flex-1 w-full bg-sky-50/70 border-4 border-dashed border-sky-200 rounded-2xl p-4 text-center min-h-[140px] flex flex-col justify-between shadow-inner">
                    <div className="flex flex-wrap gap-2 items-center justify-center">
                      {Array.from({ length: currentQuestion.leftCount }).map((_, idx) => (
                        <span
                          key={idx}
                          className="text-4xl transform hover:scale-115 transition-transform duration-200 inline-block drop-shadow-sm cursor-pointer animate-bounce"
                          style={{ animationDelay: `${idx * 80}ms` }}
                        >
                          {currentQuestion.leftEmoji}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-black text-sky-600 bg-sky-100 py-1 px-2.5 rounded-full inline-block mx-auto mt-2 select-none thai-wrap">
                      ฝั่งซ้าย: {currentQuestion.leftCount} ชิ้น
                    </span>
                  </div>

                  {/* ป้ายสัญลักษณ์เชื่อมโยงคั่นกลาง */}
                  <div className="w-12 h-12 rounded-full bg-amber-100 border-4 border-amber-300 text-amber-600 flex items-center justify-center font-black text-xl shadow-md animate-pulse self-center shrink-0">
                    {chapterId === "addition" ? "➕" : currentQuestion.id.includes("gen-sub-img") ? "➖" : "🆚"}
                  </div>

                  {/* กล่องฝั่งขวา */}
                  <div className="flex-1 w-full bg-pink-50/70 border-4 border-dashed border-pink-200 rounded-2xl p-4 text-center min-h-[140px] flex flex-col justify-between shadow-inner">
                    <div className="flex flex-wrap gap-2 items-center justify-center">
                      {Array.from({ length: currentQuestion.rightCount }).map((_, idx) => (
                        <span
                          key={idx}
                          className="text-4xl transform hover:scale-115 transition-transform duration-200 inline-block drop-shadow-sm cursor-pointer animate-bounce"
                          style={{ animationDelay: `${idx * 80}ms` }}
                        >
                          {currentQuestion.rightEmoji}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-black text-pink-600 bg-pink-100 py-1 px-2.5 rounded-full inline-block mx-auto mt-2 select-none thai-wrap">
                      {currentQuestion.id.includes("gen-sub-img") ? "หักออกไป" : "ฝั่งขวา"}: {currentQuestion.rightCount} ชิ้น
                    </span>
                  </div>
                </div>
              ) : (
                /* วาดรูป Emoji ในกรณีนับจำนวนกลุ่มเดียวแบบปกติ */
                currentQuestion.imageEmoji && currentQuestion.imageCount !== undefined && (
                  <div className="flex flex-wrap gap-4 items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-2xl mb-6 shadow-inner min-h-[100px]">
                    {Array.from({ length: currentQuestion.imageCount }).map((_, idx) => (
                      <span
                        key={idx}
                        className="text-5xl transform hover:scale-115 transition-transform duration-200 inline-block drop-shadow-md cursor-pointer animate-bounce"
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        {currentQuestion.imageEmoji}
                      </span>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* 2. ส่วนปฏิสัมพันธ์โจทย์ (Choice หรือ Drag-Drop) */}
            <div className="my-6">
              {currentQuestion.type === "choice" ? (
                /* โหมดแบบ Multiple Choice */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentQuestion.options?.map((option, idx) => {
                    const isSelected = selectedChoice === option;
                    let btnStyle = "bg-slate-50 hover:bg-sky-50 text-slate-700 border-slate-300 border-b-4 active:border-b-0";

                    if (isAnswered) {
                      if (option === currentQuestion.correctAnswer) {
                        btnStyle = "bg-green-100 text-green-700 border-green-400 border-2";
                      } else if (isSelected) {
                        btnStyle = "bg-red-100 text-red-700 border-red-400 border-2";
                      } else {
                        btnStyle = "bg-slate-50 text-slate-400 border-slate-200 opacity-60";
                      }
                    } else if (isSelected) {
                      btnStyle = "bg-sky-100 text-sky-700 border-sky-400 border-2";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleChoiceSelect(option)}
                        disabled={isAnswered}
                        className={`py-3.5 px-4 rounded-2xl font-black text-md sm:text-lg md:text-xl transition-all transform active:scale-97 flex items-center justify-center shadow-sm min-h-[60px] thai-wrap break-keep ${btnStyle}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* โหมดแบบ Drag & Drop (Tap to Place) */
                <div className="flex flex-col gap-6">
                  {/* ช่อง Slot ที่ให้คำตอบลากมาใส่ */}
                  <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-inner">
                    {currentQuestion.dropSlots?.map((slot, idx) => {
                      const currentVal = slotsAnswer[idx];
                      const isCorrectSlot = currentVal === slot.answer;
                      let slotColor = "bg-white border-dashed border-sky-300 text-sky-600";

                      if (isAnswered) {
                        slotColor = isCorrectSlot
                          ? "bg-green-100 border-solid border-green-500 text-green-700 font-bold"
                          : "bg-red-100 border-solid border-red-500 text-red-700 font-bold";
                      } else if (currentVal) {
                        slotColor = "bg-sky-50 border-solid border-sky-400 text-sky-800 font-bold shadow-md";
                      }

                      return (
                        <div key={idx} className="flex items-center gap-3 justify-between">
                          <span className="flex-1 text-sm sm:text-base md:text-lg font-bold text-slate-700 thai-wrap leading-tight">{slot.label}</span>
                          <button
                            onClick={() => handleSlotClick(idx)}
                            disabled={isAnswered}
                            className={`w-16 sm:w-20 h-12 sm:h-14 rounded-2xl border-4 text-center flex items-center justify-center font-black transition-all active:scale-95 shrink-0 ${slotColor}`}
                          >
                            {currentVal || "?"}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* ตัวเลือกลาก/กดวางด้านล่าง (Drag Items) */}
                  {!isAnswered && (
                    <div className="flex flex-wrap gap-4 justify-center items-center">
                      {currentQuestion.dragItems?.map((item, idx) => {
                        const isChosen = selectedDragItem === item;
                        const isPlaced = Object.values(slotsAnswer).includes(item);

                        let itemStyle = "bg-white hover:bg-amber-50 text-slate-700 border-slate-200 border-b-4 hover:border-amber-400 hover:scale-105 active:border-b-0";

                        if (isPlaced) {
                          itemStyle = "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed opacity-40";
                        } else if (isChosen) {
                          itemStyle = "bg-amber-200 text-amber-900 border-amber-500 border-4 scale-110 animate-pulse";
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => !isPlaced && handleDragItemSelect(item)}
                            disabled={isPlaced}
                            className={`w-14 h-14 rounded-2xl font-black text-xl flex items-center justify-center shadow-md transition-all transform active:scale-90 ${itemStyle}`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* แผงควบคุมการลากวาง */}
                  {!isAnswered && (
                    <div className="flex gap-4 mt-2 justify-center">
                      <button
                        onClick={handleClearSlots}
                        className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-all active:scale-95 border border-slate-300"
                      >
                        ล้างคำตอบ
                      </button>
                      <button
                        onClick={handleSubmitDragDrop}
                        className="py-2.5 px-6 bg-emerald-400 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-sm shadow-md border-b-4 border-emerald-600 active:border-b-0 transition-all active:scale-95"
                      >
                        ส่งคำตอบ
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. แถบป้ายผลลัพธ์ตอบถูก/ผิด และปุ่มข้อถัดไป */}
            <div>
              {isAnswered && (
                <div className="pt-4 border-t-2 border-slate-100">
                  <div
                    className={`rounded-2xl p-4 mb-4 flex items-center justify-between gap-3 ${
                      isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{isCorrect ? "🎉" : "🦖"}</span>
                      <div>
                        <p className="font-extrabold text-md leading-none">
                          {isCorrect ? "คำตอบถูกต้องครับ!" : "ไม่เป็นไรนะ ลองใหม่อีกรอบครับ"}
                        </p>
                        <p className="font-bold text-xs mt-1">
                          {isCorrect ? "คุณเก่งมาก ได้รับดาว 1 ดวง!" : `ข้อนี้เฉลยคือ: ${currentQuestion.correctAnswer}`}
                        </p>
                      </div>
                    </div>
                    {isCorrect && (
                      <div className="text-yellow-500 animate-spin-slow">
                        <Star fill="currentColor" size={28} />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full py-4 bg-gradient-to-r from-sky-400 to-indigo-400 hover:from-sky-500 hover:to-indigo-500 text-white rounded-2xl font-black text-lg shadow-md hover:shadow-lg transition-all active:scale-95 border-b-4 border-indigo-600 active:border-b-0 flex items-center justify-center gap-2"
                  >
                    <span>{currentIdx + 1 === shuffledQuestions.length ? "ดูผลการเรียน" : "ข้อต่อไป 🚀"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* Dialog ยืนยันการออกจากด่านกลางคัน */}
      <CuteDialog
        isOpen={isExitDialogOpen}
        title="กลับหน้าหลักไหมเอ่ย? 🦕"
        description={`หนูต้องการกลับไปหน้าแรกและบันทึกคะแนนดาวที่ทำได้ในด่านนี้ (${starsEarned} ดวง) ไว้ใช่ไหมครับ?`}
        type="warning"
        confirmText="ใช่ กลับหน้าแรก"
        cancelText="ไม่ใช่ ทำต่อ"
        onConfirm={() => {
          if (starsEarned > 0) {
            addStars(chapterId, starsEarned, score, shuffledQuestions.length);
          }
          router.push("/");
        }}
        onClose={() => setIsExitDialogOpen(false)}
      />

      {/* Dialog เตือนกรณีตอบลากวางไม่ครบช่อง */}
      <CuteDialog
        isOpen={isIncompleteDialogOpen}
        title="อุ๊ย! ยังตอบไม่ครบจ้า 🐸"
        description="หนูช่วยลากหรือกดเลือกตัวเลขมาเติมในช่องว่างให้ครบทุกช่องก่อนนะจ๊ะคนเก่ง 🌟"
        type="info"
        confirmText="เข้าใจแล้วจ้า"
        onConfirm={() => {}}
        onClose={() => setIsIncompleteDialogOpen(false)}
      />
    </div>
  );
}
