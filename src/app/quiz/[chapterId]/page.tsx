import { chapters } from "@/lib/chapters";
import QuizClient from "./QuizClient";

export function generateStaticParams() {
  return chapters.map((c) => ({
    chapterId: c.id,
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  return <QuizClient chapterId={chapterId} />;
}
