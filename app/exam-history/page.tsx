import { createClient } from "@/lib/supabase/server"
import { ExamHistoryList } from "@/components/exam-history-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Home } from "lucide-react"

export default async function ExamHistoryPage() {
  const supabase = await createClient()

  const { data: examHistory, error } = await supabase
    .from("exam_history")
    .select("*")
    .order("exam_date", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching exam history:", error)
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
            <h1 className="text-3xl font-bold">考试历史</h1>
            <p className="text-muted-foreground">查看您的历史考试记录</p>
          </div>
        </div>

        <ExamHistoryList examHistory={examHistory || []} />
      </div>
    </div>
  )
}
