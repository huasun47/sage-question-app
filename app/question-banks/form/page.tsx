import { createClient } from "@/lib/supabase/server"
import { QuestionBankForm } from "@/components/question-bank-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  searchParams: Promise<{ id?: string }>
}

export default async function QuestionBankFormPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  let questionBank = null

  if (params.id) {
    const { data, error } = await supabase.from("question_banks").select("*").eq("id", params.id).single()

    if (error) {
      console.error("[v0] Error fetching question bank:", error)
    } else {
      questionBank = data
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/question-banks">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{questionBank ? "编辑题库" : "新建题库"}</h1>
            <p className="text-muted-foreground">填写题库信息或导入Excel文件</p>
          </div>
        </div>

        <QuestionBankForm questionBank={questionBank} />
      </div>
    </div>
  )
}
