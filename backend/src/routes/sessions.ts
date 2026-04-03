import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Create new session
router.post('/create', authenticateToken, async (req, res) => {
  const { title, language } = req.body;
  const user = (req as any).user;

  try {
    const { data: session, error } = await supabaseAdmin
      .from('sessions')
      .insert({
        title,
        mentor_id: user.id,
        language: language || 'javascript' // default
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(400).json({ error: error.message });
    }

    // Default invite link formation depending on frontend setup
    const inviteLink = `${process.env.FRONTEND_URL}/dashboard?invite=${session.invite_token}`;
    
    return res.status(200).json({ 
      sessionId: session.id, 
      inviteToken: session.invite_token, 
      inviteLink 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Join session
router.post('/join', authenticateToken, async (req, res) => {
  const { inviteToken } = req.body;
  const user = (req as any).user;

  try {
    // 1. Find session by inviteToken
    const { data: session, error: findError } = await supabaseAdmin
      .from('sessions')
      .select(`id, title, status, mentor_id, profiles!sessions_mentor_id_fkey(full_name)`)
      .eq('invite_token', inviteToken)
      .single();

    if (findError || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status === 'ended') {
      return res.status(400).json({ error: 'Session has already ended' });
    }

    if (session.mentor_id === user.id) {
       // Mentor re-joining their own session
       const mentor1 = session.profiles as unknown as { full_name: string } | null;
       return res.status(200).json({ 
         sessionId: session.id, 
         title: session.title, 
         mentorName: mentor1?.full_name 
       });
    }

    // 2. Set student_id and status to active
    const { error: updateError } = await supabaseAdmin
      .from('sessions')
      .update({
        student_id: user.id,
        status: 'active',
        started_at: new Date().toISOString()
      })
      .eq('id', session.id);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    const mentor2 = session.profiles as unknown as { full_name: string } | null;
    return res.status(200).json({ 
      sessionId: session.id, 
      title: session.title, 
      mentorName: mentor2?.full_name 
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// End session
router.patch('/:id/end', authenticateToken, async (req, res) => {
  const sessionId = req.params.id;
  const user = (req as any).user;

  try {
    // Check ownership
    const { data: session, error: findError } = await supabaseAdmin
      .from('sessions')
      .select('mentor_id')
      .eq('id', sessionId)
      .single();

    if (findError || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.mentor_id !== user.id) {
      return res.status(403).json({ error: 'Only mentors can end sessions' });
    }

    const { error: updateError } = await supabaseAdmin
      .from('sessions')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // Will notify connected clients via general socket or system message from index.ts / socket handler
    return res.status(200).json({ message: 'Session ended successfully' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get session details
router.get('/:id', authenticateToken, async (req, res) => {
  const sessionId = req.params.id;
  
  try {
    const { data: session, error } = await supabaseAdmin
      .from('sessions')
      .select(`
        *,
        mentor:profiles!sessions_mentor_id_fkey(id, full_name, role),
        student:profiles!sessions_student_id_fkey(id, full_name, role)
      `)
      .eq('id', sessionId)
      .single();

    if (error || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.status(200).json(session);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
