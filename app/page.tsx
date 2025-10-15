import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, History, AlertCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Sage Question</h1>
          <p className="text-muted-foreground">Sage Question 是一个简单的自测知识点应用，通过答题的形式来让我们更牢固的记住关键知识点</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          <Link href="/question-banks">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle>题库管理</CardTitle>
                </div>
                <CardDescription>管理和创建题库，开始测试</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">导入题库、编辑题目、开始考试</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/exam-history">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  <CardTitle>考试历史</CardTitle>
                </div>
                <CardDescription>查看历史考试记录</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">回顾成绩、分析错题、重新测试</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/wrong-answers">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  <CardTitle>错题本</CardTitle>
                </div>
                <CardDescription>专项练习错题</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">针对性复习，提高正确率</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
