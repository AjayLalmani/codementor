import { Server, Socket } from 'socket.io';

export const registerSignalingHandlers = (io: Server, socket: Socket) => {
  socket.on('signal:offer', (data: { sessionId: string; sdp: any }) => {
    socket.to(data.sessionId).emit('signal:offer', data.sdp);
  });

  socket.on('signal:answer', (data: { sessionId: string; sdp: any }) => {
    socket.to(data.sessionId).emit('signal:answer', data.sdp);
  });

  socket.on('signal:ice-candidate', (data: { sessionId: string; candidate: any }) => {
    socket.to(data.sessionId).emit('signal:ice-candidate', data.candidate);
  });

  socket.on('signal:ready', (data: { sessionId: string }) => {
    socket.to(data.sessionId).emit('signal:ready');
  });
};
