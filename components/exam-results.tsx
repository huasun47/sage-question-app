"use client"

import type { ExamHistory } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle2, XCircle, Clock, FileText } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface ExamResultsProps {
  examHistory: ExamHistory
}

export function ExamResults({ examHistory }: ExamResultsProps) {
  const [showExplanations, setShowExplanations] = useState(false)

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}分${secs}秒`
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const formatAnswer = (answer: string | string[] | undefined) => {
    if (!answer) return "未作答"
    if (Array.isArray(answer)) return answer.join(", ")
    return answer
  }

  const percentage = (examHistory.correct_count / examHistory.total_count) * 100

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/exam-history">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">考试结果</h1>
            <p className="text-muted-foreground">{examHistory.bank_name}</p>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>成绩概览</CardTitle>
            <CardDescription>{formatDate(examHistory.exam_date)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Score */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">总分</p>
                <p className={`text-6xl font-bold ${getScoreColor(examHistory.total_score)}`}>
                  {examHistory.total_score}
                </p>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">正确率</span>
                  <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{examHistory.total_count}</p>
                  <p className="text-xs text-muted-foreground">总题数</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{examHistory.correct_count}</p>
                  <p className="text-xs text-muted-foreground">正确</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {examHistory.total_count - examHistory.correct_count}
                  </p>
                  <p className="text-xs text-muted-foreground">错误</p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">用时: {formatTime(examHistory.time_used)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Toggle Explanations */}
        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={() => setShowExplanations(!showExplanations)}>
            {showExplanations ? "隐藏解析" : "显示解析"}
          </Button>
        </div>

        {/* Questions Review */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">答题详情</h2>
          {examHistory.questions.map((question, index) => (
            <Card key={question.id} className={question.isCorrect ? "border-green-200" : "border-red-200"}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">
                    {index + 1}. {question.question}
                  </CardTitle>
                  {question.isCorrect ? (
                    <Badge className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      正确
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      错误
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Options for single/multiple choice */}
                {question.type !== "judge" && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => {
                      const isCorrect = Array.isArray(question.correctAnswer)
                        ? question.correctAnswer.includes(option)
                        : question.correctAnswer === option
                      const isUserAnswer = Array.isArray(question.userAnswer)
                        ? question.userAnswer?.includes(option)
                        : question.userAnswer === option

                      return (
                        <div
                          key={optIndex}
                          className={`p-2 rounded ${
                            isCorrect
                              ? "bg-green-50 border border-green-200"
                              : isUserAnswer
                                ? "bg-red-50 border border-red-200"
                                : ""
                          }`}
                        >
                          <span className="text-sm">
                            {isCorrect && <CheckCircle2 className="inline h-4 w-4 text-green-600 mr-1" />}
                            {isUserAnswer && !isCorrect && <XCircle className="inline h-4 w-4 text-red-600 mr-1" />}
                            {option}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Answer summary */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">您的答案:</p>
                    <p className={question.isCorrect ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {formatAnswer(question.userAnswer)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">正确答案:</p>
                    <p className="text-green-600 font-medium">{formatAnswer(question.correctAnswer)}</p>
                  </div>
                </div>

                {/* Explanation */}
                {showExplanations && question.explanation && (
                  <div className="bg-muted p-3 rounded">
                    <p className="text-sm font-medium mb-1">解析:</p>
                    <p className="text-sm text-muted-foreground">{question.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <Link href="/exam-history">
            <Button variant="outline">返回历史记录</Button>
          </Link>
          <Link href="/question-banks">
            <Button>继续练习</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
