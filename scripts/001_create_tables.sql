-- Create question_banks table
CREATE TABLE IF NOT EXISTS question_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  time_limit INTEGER NOT NULL, -- in minutes
  allow_pause BOOLEAN DEFAULT true,
  rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  questions JSONB NOT NULL, -- Array of question objects
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exam_history table
CREATE TABLE IF NOT EXISTS exam_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id UUID REFERENCES question_banks(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  exam_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_used INTEGER NOT NULL, -- in seconds
  total_score INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  total_count INTEGER NOT NULL,
  source TEXT NOT NULL, -- 'question_bank' or 'wrong_answer_book'
  questions JSONB NOT NULL, -- Array of question objects with user answers
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wrong_answer_books table
CREATE TABLE IF NOT EXISTS wrong_answer_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name TEXT NOT NULL,
  category TEXT,
  rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  questions JSONB NOT NULL, -- Array of wrong answer question objects
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_question_banks_category ON question_banks(category);
CREATE INDEX IF NOT EXISTS idx_question_banks_created_at ON question_banks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exam_history_bank_id ON exam_history(bank_id);
CREATE INDEX IF NOT EXISTS idx_exam_history_exam_date ON exam_history(exam_date DESC);
CREATE INDEX IF NOT EXISTS idx_wrong_answer_books_bank_name ON wrong_answer_books(bank_name);

-- Since this app doesn't require authentication, we'll disable RLS
-- This allows public access to all tables
ALTER TABLE question_banks DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE wrong_answer_books DISABLE ROW LEVEL SECURITY;
