CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('mentor', 'student')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can read their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  mentor_id UUID REFERENCES profiles(id) NOT NULL,
  student_id UUID REFERENCES profiles(id),
  invite_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  status TEXT CHECK (status IN ('waiting', 'active', 'ended')) DEFAULT 'waiting',
  language TEXT DEFAULT 'javascript',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mentor can manage own sessions" ON sessions FOR ALL USING (auth.uid() = mentor_id);
CREATE POLICY "Student can view joined sessions" ON sessions FOR SELECT USING (auth.uid() = student_id);

CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('user', 'system')) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Session participants can view messages" ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = session_id
      AND (s.mentor_id = auth.uid() OR s.student_id = auth.uid())
    )
  );
