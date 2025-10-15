"use client"

import type { QuestionBank } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Edit, Trash2, Clock, FileQuestion } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

interface QuestionBankListProps {
  questionBanks: QuestionBank[]
}

export function QuestionBankList({ questionBanks: initialBanks }: QuestionBankListProps) {
  const [questionBanks, setQuestionBanks] = useState(initialBanks)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个题库吗？")) return

    const { error } = await supabase.from("question_banks").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting question bank:", error)
      alert("删除失败")
      return
    }

    setQuestionBanks(questionBanks.filter((bank) => bank.id !== id))
  }

  const handleStartExam = (id: string) => {
    router.push(`/taking/${id}`)
  }

  if (questionBanks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">还没有题库，创建一个开始吧</p>
          <Link href="/question-banks/form">
            <Button>新建题库</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {questionBanks.map((bank) => (
        <Card key={bank.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{bank.name}</CardTitle>
                {bank.category && (
                  <CardDescription className="mt-1">
                    <Badge variant="secondary">{bank.category}</Badge>
                  </CardDescription>
                )}
              </div>
              <div className="flex gap-1">
                <Link href={`/question-banks/form?id=${bank.id}`}>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(bank.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileQuestion className="h-4 w-4" />
                <span>{bank.questions.length} 道题目</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{bank.time_limit} 分钟</span>
              </div>
              {bank.rating > 0 && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < bank.rating ? "text-yellow-500" : "text-gray-300"}>
                      ★
                    </span>
                  ))}
                </div>
              )}
              <Button className="w-full mt-4" onClick={() => handleStartExam(bank.id)}>
                <Play className="h-4 w-4 mr-2" />
                开始考试
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
