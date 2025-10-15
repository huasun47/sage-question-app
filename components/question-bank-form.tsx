"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { QuestionBank, Question, ExcelQuestion } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Upload, Save, Download, FileSpreadsheet } from "lucide-react"
import * as XLSX from "xlsx"

interface QuestionBankFormProps {
  questionBank?: QuestionBank | null
}

export function QuestionBankForm({ questionBank }: QuestionBankFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: questionBank?.name || "",
    category: questionBank?.category || "",
    time_limit: questionBank?.time_limit || 60,
    allow_pause: questionBank?.allow_pause ?? true,
    rating: questionBank?.rating || 0,
  })

  const [questions, setQuestions] = useState<Question[]>(questionBank?.questions || [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (questions.length === 0) {
        alert("请至少添加一道题目")
        setIsLoading(false)
        return
      }

      const data = {
        ...formData,
        questions,
        updated_at: new Date().toISOString(),
      }

      if (questionBank?.id) {
        // Update existing
        const { error } = await supabase.from("question_banks").update(data).eq("id", questionBank.id)

        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase.from("question_banks").insert(data)

        if (error) throw error
      }

      router.push("/question-banks")
    } catch (error) {
      console.error("[v0] Error saving question bank:", error)
      alert("保存失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json<ExcelQuestion>(worksheet)

      // Convert Excel format to Question format
      const importedQuestions: Question[] = jsonData.map((row, index) => {
        const type = row.题目类型 === "单选" ? "single" : row.题目类型 === "多选" ? "multiple" : "judge"

        const options: string[] = []
        if (row.选项A) options.push(row.选项A)
        if (row.选项B) options.push(row.选项B)
        if (row.选项C) options.push(row.选项C)
        if (row.选项D) options.push(row.选项D)
        if (row.选项E) options.push(row.选项E)
        if (row.选项F) options.push(row.选项F)

        // Parse correct answer
        let correctAnswer: string | string[]
        if (type === "multiple") {
          // For multiple choice, split by comma or semicolon
          correctAnswer = row.正确答案.split(/[,，;；]/).map((a) => a.trim())
        } else {
          correctAnswer = row.正确答案
        }

        return {
          id: `imported-${index}`,
          type,
          question: row.题目,
          options: type !== "judge" ? options : undefined,
          correctAnswer,
          explanation: row.解析,
        }
      })

      setQuestions(importedQuestions)
      alert(`成功导入 ${importedQuestions.length} 道题目`)
    } catch (error) {
      console.error("[v0] Error parsing Excel file:", error)
      alert("Excel文件解析失败，请检查格式是否正确")
    }

    // Reset file input
    e.target.value = ""
  }

  const handleExportTemplate = () => {
    const template: ExcelQuestion[] = [
      {
        题目类型: "单选",
        题目: "示例单选题：1+1等于几？",
        选项A: "1",
        选项B: "2",
        选项C: "3",
        选项D: "4",
        正确答案: "2",
        解析: "1加1等于2",
      },
      {
        题目类型: "多选",
        题目: "示例多选题：以下哪些是偶数？",
        选项A: "1",
        选项B: "2",
        选项C: "3",
        选项D: "4",
        正确答案: "2,4",
        解析: "2和4都是偶数",
      },
      {
        题目类型: "判断",
        题目: "示例判断题：地球是圆的",
        正确答案: "正确",
        解析: "地球是一个球体",
      },
    ]

    const worksheet = XLSX.utils.json_to_sheet(template)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "题库模板")

    // Set column widths
    worksheet["!cols"] = [
      { wch: 10 }, // 题目类型
      { wch: 40 }, // 题目
      { wch: 20 }, // 选项A
      { wch: 20 }, // 选项B
      { wch: 20 }, // 选项C
      { wch: 20 }, // 选项D
      { wch: 20 }, // 选项E
      { wch: 20 }, // 选项F
      { wch: 20 }, // 正确答案
      { wch: 30 }, // 解析
    ]

    XLSX.writeFile(workbook, "题库导入模板.xlsx")
  }

  const handleExportQuestions = () => {
    if (questions.length === 0) {
      alert("没有题目可以导出")
      return
    }

    const excelData: ExcelQuestion[] = questions.map((q) => {
      const row: ExcelQuestion = {
        题目类型: q.type === "single" ? "单选" : q.type === "multiple" ? "多选" : "判断",
        题目: q.question,
        正确答案: Array.isArray(q.correctAnswer) ? q.correctAnswer.join(",") : q.correctAnswer,
        解析: q.explanation,
      }

      if (q.options) {
        q.options.forEach((option, index) => {
          const key = `选项${String.fromCharCode(65 + index)}` as keyof ExcelQuestion
          row[key] = option
        })
      }

      return row
    })

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "题库")

    worksheet["!cols"] = [
      { wch: 10 },
      { wch: 40 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 30 },
    ]

    const fileName = formData.name ? `${formData.name}.xlsx` : "题库导出.xlsx"
    XLSX.writeFile(workbook, fileName)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>设置题库的基本信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">题库名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例如：数学期末考试"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">分类</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="例如：数学、英语"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time_limit">考试时长（分钟）*</Label>
            <Input
              id="time_limit"
              type="number"
              min="1"
              value={formData.time_limit}
              onChange={(e) => setFormData({ ...formData, time_limit: Number.parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="allow_pause">允许暂停</Label>
            <Switch
              id="allow_pause"
              checked={formData.allow_pause}
              onCheckedChange={(checked) => setFormData({ ...formData, allow_pause: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">难度评级（0-5星）</Label>
            <Input
              id="rating"
              type="number"
              min="0"
              max="5"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: Number.parseInt(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>题目管理</CardTitle>
          <CardDescription>导入或导出Excel格式的题目</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <Input id="file-upload" type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" />
            <Label htmlFor="file-upload" className="cursor-pointer">
              <Button type="button" variant="outline" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  导入Excel
                </span>
              </Button>
            </Label>

            <Button type="button" variant="outline" onClick={handleExportTemplate}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              下载模板
            </Button>

            {questions.length > 0 && (
              <Button type="button" variant="outline" onClick={handleExportQuestions}>
                <Download className="h-4 w-4 mr-2" />
                导出题目
              </Button>
            )}
          </div>

          {questions.length > 0 && (
            <div className="bg-muted p-4 rounded">
              <p className="text-sm font-medium mb-2">已导入题目预览：</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {questions.slice(0, 5).map((q, index) => (
                  <div key={q.id} className="text-sm">
                    <span className="font-medium">{index + 1}. </span>
                    <span className="text-muted-foreground">
                      [{q.type === "single" ? "单选" : q.type === "multiple" ? "多选" : "判断"}]
                    </span>{" "}
                    {q.question}
                  </div>
                ))}
                {questions.length > 5 && (
                  <p className="text-sm text-muted-foreground">... 还有 {questions.length - 5} 道题目</p>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">共 {questions.length} 道题目</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "保存中..." : "保存题库"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/question-banks")}>
          取消
        </Button>
      </div>
    </form>
  )
}
