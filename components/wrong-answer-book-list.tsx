"use client"

import type { WrongAnswerBook } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Trash2, FileQuestion, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

interface WrongAnswerBookListProps {
  wrongAnswerBooks: WrongAnswerBook[]
}

export function WrongAnswerBookList({ wrongAnswerBooks: initialBooks }: WrongAnswerBookListProps) {
  const [wrongAnswerBooks, setWrongAnswerBooks] = useState(initialBooks)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个错题本吗？")) return

    const { error } = await supabase.from("wrong_answer_books").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting wrong answer book:", error)
      alert("删除失败")
      return
    }

    setWrongAnswerBooks(wrongAnswerBooks.filter((book) => book.id !== id))
  }

  const handleStartPractice = (id: string) => {
    router.push(`/wrong-answers/practice/${id}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  if (wrongAnswerBooks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">还没有错题记录</p>
          <p className="text-sm text-muted-foreground mb-4">完成考试后，错题会自动收集到这里</p>
          <Link href="/question-banks">
            <Button>开始考试</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {wrongAnswerBooks.map((book) => (
        <Card key={book.id} className="hover:shadow-lg transition-shadow border-red-200">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{book.bank_name}</CardTitle>
                {book.category && (
                  <CardDescription className="mt-1">
                    <Badge variant="secondary">{book.category}</Badge>
                  </CardDescription>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(book.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileQuestion className="h-4 w-4" />
                <span>{book.questions.length} 道错题</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>更新于 {formatDate(book.updated_at)}</span>
              </div>
              {book.rating > 0 && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < book.rating ? "text-yellow-500" : "text-gray-300"}>
                      ★
                    </span>
                  ))}
                </div>
              )}
              <Button className="w-full mt-4" variant="destructive" onClick={() => handleStartPractice(book.id)}>
                <Play className="h-4 w-4 mr-2" />
                开始练习
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
