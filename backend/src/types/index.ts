export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'mentor' | 'student';
  created_at: string;
}

export interface Session {
  id: string;
  title: string;
  mentor_id: string;
  student_id: string | null;
  invite_token: string;
  status: 'waiting' | 'active' | 'ended';
  language: string;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export interface AuthRequest extends Express.Request {
  user?: {
    id: string;
    role?: string;
  };
}
