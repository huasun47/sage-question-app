import { createClient } from "@/lib/supabase/server"
import { ExamResults } from "@/components/exam-results"
import { redirect } from "next/navigation"

interface PageProps {
  params: Promise<{ examId: string }>
}

export default async function ResultsPage({ params }: PageProps) {
  const { examId } = await params
  const supabase = await createClient()

  const { data: examHistory, error } = await supabase.from("exam_history").select("*").eq("id", examId).single()

  if (error || !examHistory) {
    console.error("[v0] Error fetching exam results:", error)
    redirect("/exam-history")
  }

  return <ExamResults examHistory={examHistory} />
}
