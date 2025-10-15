import { createClient } from "@/lib/supabase/server"
import { ExamInterface } from "@/components/exam-interface"
import { redirect } from "next/navigation"

interface PageProps {
  params: Promise<{ examId: string }>
}

export default async function TakingExamPage({ params }: PageProps) {
  const { examId } = await params
  const supabase = await createClient()

  // Check if it's a question bank or wrong answer book
  const { data: questionBank, error } = await supabase.from("question_banks").select("*").eq("id", examId).single()

  if (error || !questionBank) {
    console.error("[v0] Error fetching question bank:", error)
    redirect("/question-banks")
  }

  return <ExamInterface questionBank={questionBank} />
}
