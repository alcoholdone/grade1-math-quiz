"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface SpeechButtonProps {
  text: string;
}

export default function SpeechButton({ text }: SpeechButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setTimeout(() => {
        setIsSupported(true);
      }, 0);
    }
  }, []);

  const handleSpeak = () => {
    if (!isSupported) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel(); // หยุดการพูดเดิมก่อน

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "th-TH"; // กำหนดให้ออกเสียงภาษาไทย
    
    // พยายามหาเสียงคนไทยที่ดีที่สุดในเครื่อง
    const voices = window.speechSynthesis.getVoices();
    const thaiVoice = voices.find(voice => voice.lang.includes("th-TH") || voice.lang.includes("TH"));
    if (thaiVoice) {
      utterance.voice = thaiVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  // หากเล่นค้างอยู่ตอนกำลังเปลี่ยนโจทย์ ให้หยุดการพูดอัตโนมัติ
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text]);

  if (!isSupported) return null;

  return (
    <button
      onClick={handleSpeak}
      type="button"
      className={`p-3 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-md ${
        isPlaying
          ? "bg-red-400 hover:bg-red-500 text-white animate-pulse"
          : "bg-sky-400 hover:bg-sky-500 text-white hover:scale-105 border-b-4 border-sky-600 active:border-b-0"
      }`}
      title="ฟังเสียงโจทย์"
    >
      {isPlaying ? <VolumeX size={24} /> : <Volume2 size={24} className="animate-bounce" />}
    </button>
  );
}
