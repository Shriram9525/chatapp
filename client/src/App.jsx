import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Rooms from './pages/Rooms';
import Chat from './pages/Chat';
import { useEffect, useState } from 'react';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('chatUser');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    const oldUser = localStorage.getItem('username');
    if (oldUser) return { username: oldUser, avatar: 'fun-emoji', color: '#7C3AED' };
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('chatUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('chatUser');
    }
  }, [user]);

  return (
    <div className="w-full h-screen bg-chat-bg text-chat-text flex flex-col overflow-hidden relative">
      {/* Background Noise Overlay */}
      <div className="absolute inset-0 bg-noise z-0 pointer-events-none"></div>

      <div className="relative z-10 w-full h-full">
        <Routes>
          <Route path="/" element={
            user ? <Navigate to="/rooms" /> : <Login setUser={setUser} />
          } />
          <Route path="/rooms" element={
            user ? <Rooms user={user} setUser={setUser} /> : <Navigate to="/" />
          } />
          <Route path="/chat/:roomId" element={
            user ? <Chat user={user} /> : <Navigate to="/" />
          } />
        </Routes>
      </div>
    </div>
  );
}

export default App;
