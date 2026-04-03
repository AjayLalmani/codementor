import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import sessionsRouter from './routes/sessions';
import { registerEditorHandlers } from './socket/editorSocket';
import { registerChatHandlers } from './socket/chatSocket';
import { registerSignalingHandlers } from './socket/signalingSocket';
import { supabaseAdmin } from './lib/supabaseAdmin';

dotenv.config();

const app = express();
const server = http.createServer(app);

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: frontendUrl,
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/sessions', sessionsRouter);

const io = new Server(server, {
  cors: {
    origin: frontendUrl,
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Store user connection info
  let currentSessionId: string | null = null;
  let currentUser: { id: string, name: string } | null = null;

  socket.on('session:join', async (data: { sessionId: string; userId: string; userName: string }) => {
    socket.join(data.sessionId);
    currentSessionId = data.sessionId;
    currentUser = { id: data.userId, name: data.userName };

    // System message about user joining
    try {
      const { data: msgRow } = await supabaseAdmin.from('messages').insert({
        session_id: data.sessionId,
        sender_id: data.userId,
        content: `${data.userName} joined the session`,
        type: 'system'
      }).select().single();

      if (msgRow) {
        io.in(data.sessionId).emit('chat:message', {
          id: msgRow.id,
          content: msgRow.content,
          senderId: msgRow.sender_id,
          senderName: 'System',
          type: 'system',
          createdAt: msgRow.created_at
        });
      }
    } catch (e) {
      console.error('System message insert error:', e);
    }
  });

  socket.on('session:end', async (data: { sessionId: string }) => {
    // Broadcast end session globally to room
    io.in(data.sessionId).emit('session:ended');

    // System message about mentor ending session
    if (currentUser) {
      try {
        const { data: msgRow } = await supabaseAdmin.from('messages').insert({
          session_id: data.sessionId,
          sender_id: currentUser.id,
          content: 'Mentor ended the session',
          type: 'system'
        }).select().single();

        if (msgRow) {
          io.in(data.sessionId).emit('chat:message', {
            id: msgRow.id,
            content: msgRow.content,
            senderId: msgRow.sender_id,
            senderName: 'System',
            type: 'system',
            createdAt: msgRow.created_at
          });
        }
      } catch (e) {
        console.error('System message insert error:', e);
      }
    }
  });

  registerEditorHandlers(io, socket);
  registerChatHandlers(io, socket);
  registerSignalingHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (currentSessionId && currentUser) {
      try {
        supabaseAdmin.from('messages').insert({
          session_id: currentSessionId,
          sender_id: currentUser.id,
          content: `${currentUser.name} disconnected`,
          type: 'system'
        }).select().single().then(({ data: msgRow }) => {
          if (msgRow) {
            io.in(currentSessionId as string).emit('chat:message', {
              id: msgRow.id,
              content: msgRow.content,
              senderId: msgRow.sender_id,
              senderName: 'System',
              type: 'system',
              createdAt: msgRow.created_at
            });
          }
        });
      } catch (e) {
        console.error(e);
      }
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
