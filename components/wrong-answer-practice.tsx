"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { WrongAnswerBook, Question } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { CircularTimer } from "@/components/circular-timer"
import { Send } from "lucide-react"

interface WrongAnswerPracticeProps {
  wrongAnswerBook: WrongAnswerBook
}

export function WrongAnswerPractice({ wrongAnswerBook }: WrongAnswerPracticeProps) {
  const router = useRouter()
  const supabase = createClient()

  // Shuffle questions
  const [questions, setQuestions] = useState<Question[]>(() => {
    const shuffled = [...wrongAnswerBook.questions].sort(() => Math.random() - 0.5)
    return shuffled.map((q, index) => ({ ...q, id: `${index}` }))
  })

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  // Default 30 minutes for wrong answer practice
  const [timeRemaining, setTimeRemaining] = useState(30 * 60)
  const [startTime] = useState(Date.now())

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining])

  const currentQuestion = questions[currentQuestionIndex]

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = useCallback(async () => {
    const timeUsed = Math.floor((Date.now() - startTime) / 1000)

    // Grade the practice
    const gradedQuestions = questions.map((q) => {
      const userAnswer = answers[q.id]
      let isCorrect = false

      if (q.type === "multiple") {
        const correctSet = new Set(Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer])
        const userSet = new Set(Array.isArray(userAnswer) ? userAnswer : [])
        isCorrect = correctSet.size === userSet.size && [...correctSet].every((a) => userSet.has(a))
      } else {
        isCorrect = userAnswer === q.correctAnswer
      }

      return {
        ...q,
        userAnswer,
        isCorrect,
      }
    })

    const correctCount = gradedQuestions.filter((q) => q.isCorrect).length
    const totalScore = Math.round((correctCount / questions.length) * 100)

    // Save to exam history
    const { data, error } = await supabase
      .from("exam_history")
      .insert({
        bank_name: `${wrongAnswerBook.bank_name} - 错题练习`,
        time_used: timeUsed,
        total_score: totalScore,
        correct_count: correctCount,
        total_count: questions.length,
        source: "wrong_answer_book",
        questions: gradedQuestions,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error saving practice history:", error)
      alert("提交失败")
      return
    }

    // Update wrong answer book - remove correctly answered questions
    const stillWrongQuestions = gradedQuestions.filter((q) => !q.isCorrect)

    if (stillWrongQuestions.length === 0) {
      // All questions answered correctly, delete the book
      await supabase.from("wrong_answer_books").delete().eq("id", wrongAnswerBook.id)
    } else {
      // Update with remaining wrong questions
      await supabase
        .from("wrong_answer_books")
        .update({
          questions: stillWrongQuestions,
          updated_at: new Date().toISOString(),
        })
        .eq("id", wrongAnswerBook.id)
    }

    // Redirect to results
    router.push(`/results/${data.id}`)
  }, [answers, questions, wrongAnswerBook, startTime, supabase, router])

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header with timer */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{wrongAnswerBook.bank_name} - 错题练习</h1>
            <p className="text-sm text-muted-foreground">
              题目 {currentQuestionIndex + 1} / {questions.length}
            </p>
          </div>
          <CircularTimer timeRemaining={timeRemaining} totalTime={30 * 60} isPaused={false} />
        </div>

        {/* Progress bar */}
        <Progress value={progress} className="mb-6" />

        {/* Question card */}
        <Card className="mb-6 border-red-200">
          <CardHeader>
            <CardTitle className="text-lg">
              {currentQuestionIndex + 1}. {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentQuestion.type === "single" && (
              <RadioGroup
                value={answers[currentQuestion.id] as string}
                onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
              >
                {currentQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === "multiple" && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => {
                  const currentAnswers = (answers[currentQuestion.id] as string[]) || []
                  const isChecked = currentAnswers.includes(option)

                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        id={`option-${index}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const newAnswers = checked
                            ? [...currentAnswers, option]
                            : currentAnswers.filter((a) => a !== option)
                          handleAnswer(currentQuestion.id, newAnswers)
                        }}
                      />
                      <Label htmlFor={`option-${index}`} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  )
                })}
              </div>
            )}

            {currentQuestion.type === "judge" && (
              <RadioGroup
                value={answers[currentQuestion.id] as string}
                onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
              >
                <div className="flex items-center space-x-2 mb-3">
                  <RadioGroupItem value="正确" id="true" />
                  <Label htmlFor="true" className="cursor-pointer">
                    正确
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="错误" id="false" />
                  <Label htmlFor="false" className="cursor-pointer">
                    错误
                  </Label>
                </div>
              </RadioGroup>
            )}

            {/* Show explanation for wrong answer practice */}
            {currentQuestion.explanation && (
              <div className="mt-4 bg-muted p-3 rounded">
                <p className="text-sm font-medium mb-1">提示:</p>
                <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
          >
            上一题
          </Button>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button onClick={handleSubmit}>
              <Send className="h-4 w-4 mr-2" />
              提交练习
            </Button>
          ) : (
            <Button onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}>
              下一题
            </Button>
          )}
        </div>

        {/* Question navigator */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">答题卡</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {questions.map((q, index) => {
                const isAnswered = answers[q.id] !== undefined
                const isCurrent = index === currentQuestionIndex

                return (
                  <Button
                    key={q.id}
                    variant={isCurrent ? "default" : isAnswered ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setCurrentQuestionIndex(index)}
                    className="w-full"
                  >
                    {index + 1}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
