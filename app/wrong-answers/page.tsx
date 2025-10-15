import { createClient } from "@/lib/supabase/server"
import { WrongAnswerBookList } from "@/components/wrong-answer-book-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Home } from "lucide-react"

export default async function WrongAnswersPage() {
  const supabase = await createClient()

  const { data: wrongAnswerBooks, error } = await supabase
    .from("wrong_answer_books")
    .select("*")
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching wrong answer books:", error)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">错题本</h1>
            <p className="text-muted-foreground">专项练习错题，提高正确率</p>
          </div>
        </div>

        <WrongAnswerBookList wrongAnswerBooks={wrongAnswerBooks || []} />
      </div>
    </div>
  )
}
