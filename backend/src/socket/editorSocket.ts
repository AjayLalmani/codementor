import { Server, Socket } from 'socket.io';

export const registerEditorHandlers = (io: Server, socket: Socket) => {
  socket.on('editor:change', (data: { sessionId: string; code: string; language: string; userId: string }) => {
    // Broadcast the changes to everyone else in the room
    socket.to(data.sessionId).emit('editor:update', {
      code: data.code,
      language: data.language,
      userId: data.userId,
    });
  });
};
