# CodeMentor

## Project Description
CodeMentor is a 1-on-1 real-time collaborative coding platform designed for seamless mentoring sessions. It features a live code editor, an integrated chat system, and WebRTC-powered video calling in a unified interface.

## Features
- Real-time collaborative code editor (Monaco Editor)
- Synchronized multi-language editor support
- Real-time chat with system event messages
- Integrated 1-on-1 WebRTC video block with mic/camera toggle
- Role-based accounts (Mentor / Student) with isolated session management

## Tech Stack
| Tier | Technologies |
| --- | --- |
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, Monaco Editor, Socket.io-client, WebRTC |
| **Backend** | Node.js, Express.js, Socket.io, JWT |
| **Database** | Supabase (PostgreSQL), Supabase Auth |

## Architecture Diagram
```ascii
  +------------------+         +------------------+
  |    Mentor /      |         |   Student /      |
  |    Client 1      |<--+  +->|   Client 2       |
  +------------------+   |  |  +------------------+
    |           ^        |  |        ^          |
    v           |        v  v        |          v
  +---+      +----+    +------+    +----+     +---+
  |Vid|      |WebS|    | REST |    |WebS|     |Vid|
  +---+      +----+    +------+    +----+     +---+
    |          |          |          |          |
 (P2P)|-------|----------|----------|---------(P2P)
 WebRTC        |          |          |
               v          v          v
          +--------------------------------+
          |      Express Backend Server    |
          |  (Socket.io, Auth, Express)    |
          +--------------------------------+
                          |
                          v
          +--------------------------------+
          |           Supabase             |
          |       (Auth, PostgreSQL)       |
          +--------------------------------+
```

## Setup Instructions

1. **Clone the repository**
```bash
git clone <repo-url>
cd codementor
```

2. **Supabase Setup**
- Create a new project on [Supabase](https://supabase.com).
- Run the provided SQL script located at `supabase/migrations/001_initial_schema.sql` in your Supabase SQL Editor to schema the database and add RLS security.
- Note your Project URL, Anon Key, Service Role Key, and JWT Secret.

3. **Backend Setup**
```bash
cd backend
npm install
```
Create a `.env` in the `/backend` folder:
```env
PORT=4000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-supabase-jwt-secret
FRONTEND_URL=http://localhost:3000
```
Run locally:
```bash
npm run dev
```

4. **Frontend Setup**
```bash
cd frontend
npm install
```
Create a `.env.local` in the `/frontend` folder:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```
Run locally:
```bash
npm run dev
```

## Deployment Guide
- **Backend (Render / Railway):** Create a new Web Service pointing to the `backend` folder. Set environment variables exactly as in `.env`.
- **Frontend (Vercel):** Import the repository and select the `frontend` directory as the Root Directory. Add environment variables specified in `.env.local`. Ensure `next.config.js` is active so API routes correctly proxy.

## API Reference
- `POST /api/sessions/create`: Creates a new session returning `{ sessionId, inviteToken, inviteLink }` (Mentor only).
- `POST /api/sessions/join`: Joins a session via token (Student only).
- `GET /api/sessions/:id`: Retrieves full session payload.
- `PATCH /api/sessions/:id/end`: Closes the session permanently.

## Socket Events Reference
- **Editor**:
  - `editor:change` (Client->Server): `{ sessionId, code, language, userId }`
  - `editor:update` (Server->Client): `{ code, language, userId }`
- **Chat**:
  - `chat:message` (Client->Server): `{ sessionId, content, senderId, senderName }`
  - `chat:message` (Server->Client): `{ id, content, senderId, senderName, type, createdAt }`
- **Signaling**:
  - `signal:offer`, `signal:answer`, `signal:ice-candidate` to relay WebRTC session primitives.

## Known Limitations
- No screen sharing.
- No recording capabilities.
- 1-on-1 calls only (maximum 2 participants).

## License
MIT
