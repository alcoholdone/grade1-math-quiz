"use client";

import React, { useEffect, useState } from "react";

interface CuteDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string; // ข้อความปุ่มตกลง (ถ้าไม่มีจะใช้คำว่า "ตกลง")
  cancelText?: string;  // ข้อความปุ่มยกเลิก (ถ้าส่งมาจะเปิดโหมด Confirm ถ้าไม่มีจะเป็นโหมด Alert)
  onConfirm: () => void;
  onClose: () => void;
  type?: "info" | "success" | "error" | "warning";
}

export default function CuteDialog({
  isOpen,
  title,
  description,
  confirmText = "ตกลงนะ 🌟",
  cancelText,
  onConfirm,
  onClose,
  type = "info"
}: CuteDialogProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShouldRender(true), 0);
      return () => clearTimeout(timer);
    } else {
      // หน่วงเวลาปิดเพื่อเปิดโอกาสให้แอนิเมชัน Fade-out ทำงาน (ถ้ามี)
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  // เลือกไอคอน Emoji ตามประเภทของการแจ้งเตือน
  let emoji = "🦖";
  let titleColor = "text-sky-600";
  let borderTheme = "border-sky-300";

  if (type === "success") {
    emoji = "🎉";
    titleColor = "text-emerald-500";
    borderTheme = "border-emerald-300";
  } else if (type === "error") {
    emoji = "😢";
    titleColor = "text-red-500";
    borderTheme = "border-red-300";
  } else if (type === "warning") {
    emoji = "🦊";
    titleColor = "text-amber-500";
    borderTheme = "border-amber-300";
  }

  return (
    <div
      className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`bg-white rounded-3xl p-8 max-w-sm w-full border-4 ${borderTheme} shadow-2xl text-center transform transition-transform duration-300 ${
          isOpen ? "scale-100" : "scale-90"
        }`}
      >
        {/* Emoji ดุ๊กดิ๊กด้านบน */}
        <div className="text-7xl mb-4 animate-wiggle inline-block">
          {emoji}
        </div>

        {/* หัวข้อและคำอธิบาย */}
        <h3 className={`text-2xl font-black mb-2 tracking-wide ${titleColor}`}>
          {title}
        </h3>
        <p className="text-slate-600 font-extrabold text-sm mb-6 whitespace-pre-line leading-relaxed">
          {description}
        </p>

        {/* แผงควบคุมปุ่มกด */}
        <div className="flex gap-4 justify-center items-center">
          {/* ปุ่มยกเลิก (แสดงเฉพาะโหมด Confirm เมื่อส่ง cancelText เข้ามา) */}
          {cancelText && (
            <button
              onClick={onClose}
              type="button"
              className="flex-1 py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-600 rounded-2xl font-black text-md shadow-md border-b-4 border-slate-300 active:border-b-0 active:scale-95 transition-all"
            >
              {cancelText}
            </button>
          )}

          {/* ปุ่มตกลง/ยืนยัน */}
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            type="button"
            className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-md text-white shadow-md active:scale-95 transition-all ${
              type === "error"
                ? "bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500 border-b-4 border-red-600 active:border-b-0"
                : type === "success"
                ? "bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 border-b-4 border-emerald-600 active:border-b-0"
                : type === "warning"
                ? "bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 border-b-4 border-orange-600 active:border-b-0"
                : "bg-gradient-to-r from-sky-400 to-indigo-400 hover:from-sky-500 hover:to-indigo-500 border-b-4 border-indigo-600 active:border-b-0"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
