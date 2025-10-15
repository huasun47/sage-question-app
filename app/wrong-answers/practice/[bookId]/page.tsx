import { createClient } from "@/lib/supabase/server"
import { WrongAnswerPractice } from "@/components/wrong-answer-practice"
import { redirect } from "next/navigation"

interface PageProps {
  params: Promise<{ bookId: string }>
}

export default async function WrongAnswerPracticePage({ params }: PageProps) {
  const { bookId } = await params
  const supabase = await createClient()

  const { data: wrongAnswerBook, error } = await supabase
    .from("wrong_answer_books")
    .select("*")
    .eq("id", bookId)
    .single()

  if (error || !wrongAnswerBook) {
    console.error("[v0] Error fetching wrong answer book:", error)
    redirect("/wrong-answers")
  }

  return <WrongAnswerPractice wrongAnswerBook={wrongAnswerBook} />
}
