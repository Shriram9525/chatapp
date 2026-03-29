# ChatSphere - Real-Time Group Chat Application

A visually stunning, full-stack real-time group chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io. Features dark mode UI with modern glassmorphism aesthetics, live messaging, typing indicators, and active user tracking.

## Features
- **Authentication**: Simple username-based session logic.
- **Rooms**: View multiple chat rooms, and create new ones instantly.
- **Real-Time Communication**: Instant syncing of messages using WebSocket (Socket.io).
- **Users Online**: Live indicator of connected users in each room.
- **Typing Indicators**: Real-time bouncy bubble indicators when someone is typing.
- **Premium UI**: Crafted with Tailwind CSS using custom themes, responsive layouts, and smooth animations.

## Tech Stack
- Frontend: React (Vite), Tailwind CSS, React-Router-Dom, Lucide React Icon, Socket.io-client
- Backend: Node.js, Express, Socket.io, Mongoose, CORS
- Database: MongoDB

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB running locally (or a MongoDB URI)

### 1. Database Setup
Ensure MongoDB is running locally on port `27017` or setup a cloud cluster via MongoDB Atlas.

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the `.env` file (one is already created with defaults):
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/chatsphere
   PORT=5000
   ```
4. Start the backend server:
   ```bash
   npm run dev
   # Server listens on http://localhost:5000
   ```

### 3. Frontend Setup
1. Open another terminal and navigate to the frontend directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React app:
   ```bash
   npm run dev
   # Server runs on http://localhost:5173
   ```

### 4. Experience ChatSphere
- Navigate to `http://localhost:5173` in your browser.
- Open a second (incognito) window or another browser.
- Log in with two different usernames, join the same created room, and test the real-time messages!
