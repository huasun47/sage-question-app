import { createClient } from "@/lib/supabase/server"
import { QuestionBankList } from "@/components/question-bank-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Home } from "lucide-react"

export default async function QuestionBanksPage() {
  const supabase = await createClient()

  const { data: questionBanks, error } = await supabase
    .from("question_banks")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching question banks:", error)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">题库管理</h1>
              <p className="text-muted-foreground">管理您的题库和开始测试</p>
            </div>
          </div>
          <Link href="/question-banks/form">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新建题库
            </Button>
          </Link>
        </div>

        <QuestionBankList questionBanks={questionBanks || []} />
      </div>
    </div>
  )
}
