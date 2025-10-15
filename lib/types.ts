// Question type definition
export interface Question {
  id: string
  type: "single" | "multiple" | "judge" // 单选、多选、判断
  question: string
  options?: string[] // For single/multiple choice
  correctAnswer: string | string[] // Single answer or array for multiple choice
  userAnswer?: string | string[] // User's answer during exam
  isCorrect?: boolean // Whether user answered correctly
  explanation?: string // Optional explanation
}

// Question Bank type
export interface QuestionBank {
  id: string
  name: string
  category?: string
  time_limit: number // in minutes
  allow_pause: boolean
  rating: number
  questions: Question[]
  created_at: string
  updated_at: string
}

// Exam History type
export interface ExamHistory {
  id: string
  bank_id?: string
  bank_name: string
  exam_date: string
  time_used: number // in seconds
  total_score: number
  correct_count: number
  total_count: number
  source: "question_bank" | "wrong_answer_book"
  questions: Question[]
  created_at: string
}

// Wrong Answer Book type
export interface WrongAnswerBook {
  id: string
  bank_name: string
  category?: string
  rating: number
  questions: Question[]
  created_at: string
  updated_at: string
}

// Excel import format
export interface ExcelQuestion {
  题目类型: "单选" | "多选" | "判断"
  题目: string
  选项A?: string
  选项B?: string
  选项C?: string
  选项D?: string
  选项E?: string
  选项F?: string
  正确答案: string
  解析?: string
}
