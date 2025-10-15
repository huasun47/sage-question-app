"use client"

import type { ExamHistory } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Trash2, Clock, Calendar, Target, FileText } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

interface ExamHistoryListProps {
  examHistory: ExamHistory[]
}

export function ExamHistoryList({ examHistory: initialHistory }: ExamHistoryListProps) {
  const [examHistory, setExamHistory] = useState(initialHistory)
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这条记录吗？")) return

    const { error } = await supabase.from("exam_history").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting exam history:", error)
      alert("删除失败")
      return
    }

    setExamHistory(examHistory.filter((exam) => exam.id !== id))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}分${secs}秒`
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  if (examHistory.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">还没有考试记录</p>
          <Link href="/question-banks">
            <Button>开始考试</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {examHistory.map((exam) => (
        <Card key={exam.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{exam.bank_name}</CardTitle>
                <CardDescription className="mt-1 flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  {formatDate(exam.exam_date)}
                </CardDescription>
              </div>
              <div className="flex gap-1">
                <Link href={`/results/${exam.id}`}>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(exam.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">得分</p>
                  <p className={`text-lg font-bold ${getScoreColor(exam.total_score)}`}>{exam.total_score}分</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">正确率</p>
                  <p className="text-lg font-bold">
                    {exam.correct_count}/{exam.total_count}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">用时</p>
                  <p className="text-lg font-bold">{formatTime(exam.time_used)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">来源</p>
                  <Badge variant={exam.source === "question_bank" ? "default" : "secondary"}>
                    {exam.source === "question_bank" ? "题库" : "错题本"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
