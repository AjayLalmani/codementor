import { Server, Socket } from 'socket.io';
import { supabaseAdmin } from '../lib/supabaseAdmin';

export const registerChatHandlers = (io: Server, socket: Socket) => {
  socket.on('chat:message', async (data: { sessionId: string; content: string; senderId: string; senderName: string }) => {
    
    try {
      // Persist the message via Supabase Admin (or allow RLS by using the user's token, but admin is simpler here)
      const { data: messageRecord, error } = await supabaseAdmin
        .from('messages')
        .insert({
          session_id: data.sessionId,
          sender_id: data.senderId,
          content: data.content,
          type: 'user'
        })
        .select()
        .single();
        
      if (error) throw error;
      
      const broadcastData = {
        id: messageRecord.id,
        content: messageRecord.content,
        senderId: messageRecord.sender_id,
        senderName: data.senderName,
        type: messageRecord.type,
        createdAt: messageRecord.created_at
      };

      // Broadcast to room (including sender if desired, or exclude. Often better to broadcast to all and client filters, or exclude and client handles optimistic updates)
      // Here we broadcast to entire room including sender so the sender gets the DB-generated timestamp/id
      io.in(data.sessionId).emit('chat:message', broadcastData);
      
    } catch (err) {
      console.error('Error saving chat message', err);
    }
  });
};
