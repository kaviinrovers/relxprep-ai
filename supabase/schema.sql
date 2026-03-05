-- =============================================
-- RelxPrep AI - Supabase Database Schema
-- =============================================

-- Users profile table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  exam_date DATE NOT NULL,
  units_count INTEGER DEFAULT 5,
  schedule JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  duration_min INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study progress table (unit completion tracking)
CREATE TABLE IF NOT EXISTS study_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  unit_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question papers table
CREATE TABLE IF NOT EXISTS question_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  file_url TEXT,
  extracted_text TEXT,
  analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Important questions table
CREATE TABLE IF NOT EXISTS important_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  question TEXT NOT NULL,
  importance TEXT DEFAULT 'moderate' CHECK (importance IN ('very_important', 'important', 'moderate')),
  probability INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mock tests table
CREATE TABLE IF NOT EXISTS mock_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'written' CHECK (type IN ('written', 'voice')),
  questions JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test results table
CREATE TABLE IF NOT EXISTS test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_test_id UUID REFERENCES mock_tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  total_marks INTEGER DEFAULT 0,
  obtained_marks INTEGER DEFAULT 0,
  ai_feedback JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proctor logs table
CREATE TABLE IF NOT EXISTS proctor_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_test_id UUID REFERENCES mock_tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  violation_type TEXT NOT NULL CHECK (violation_type IN ('no_face', 'multiple_faces', 'looking_away', 'tab_switch', 'background_talking')),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Row Level Security Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE important_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE proctor_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Exams policies
CREATE POLICY "Users can view own exams" ON exams FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own exams" ON exams FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exams" ON exams FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own exams" ON exams FOR DELETE USING (auth.uid() = user_id);

-- Study sessions policies
CREATE POLICY "Users can view own sessions" ON study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sessions" ON study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON study_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Study progress policies
CREATE POLICY "Users can view own progress" ON study_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own progress" ON study_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON study_progress FOR UPDATE USING (auth.uid() = user_id);

-- Question papers policies
CREATE POLICY "Users can view own papers" ON question_papers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upload own papers" ON question_papers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Important questions policies
CREATE POLICY "Users can view own questions" ON important_questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own questions" ON important_questions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mock tests policies
CREATE POLICY "Users can view own tests" ON mock_tests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tests" ON mock_tests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tests" ON mock_tests FOR UPDATE USING (auth.uid() = user_id);

-- Test results policies
CREATE POLICY "Users can view own results" ON test_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own results" ON test_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Proctor logs policies
CREATE POLICY "Users can view own logs" ON proctor_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own logs" ON proctor_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- Indexes for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_exams_user_id ON exams(user_id);
CREATE INDEX IF NOT EXISTS idx_exams_date ON exams(exam_date);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_start ON study_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_study_progress_user_exam ON study_progress(user_id, exam_id);
CREATE INDEX IF NOT EXISTS idx_question_papers_user_id ON question_papers(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_tests_user_id ON mock_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_proctor_logs_test ON proctor_logs(mock_test_id);

-- =============================================
-- Function: Auto-create user profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
