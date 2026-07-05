import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { StarProvider } from "@/context/StarContext";

const promptFont = Prompt({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["thai", "latin"],
  display: "swap",
  variable: "--font-prompt",
});

export const metadata: Metadata = {
  title: "เก่งเลข ป.1 🌟 แบบฝึกหัดทบทวนคณิตศาสตร์แสนสนุก",
  description: "แบบฝึกหัดทบทวนก่อนสอบกลางภาค วิชาคณิตศาสตร์สำหรับเด็ก ป.1 สะสมดาวรางวัล",
  manifest: "/grade1-math-quiz/manifest.json",
  appleWebApp: {
    capable: true,
    title: "เก่งเลข ป.1",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${promptFont.variable} h-full antialiased`}>
      <body className="min-h-full font-sans bg-amber-50 text-slate-800">
        <AuthProvider>
          <StarProvider>{children}</StarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
