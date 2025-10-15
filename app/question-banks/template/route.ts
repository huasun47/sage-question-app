import { NextResponse } from "next/server"
import * as XLSX from "xlsx"

export async function GET() {
  try {
    const template = [
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

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="题库导入模板.xlsx"',
      },
    })
  } catch (error) {
    console.error("[v0] Error generating template:", error)
    return NextResponse.json({ error: "Failed to generate template" }, { status: 500 })
  }
}
