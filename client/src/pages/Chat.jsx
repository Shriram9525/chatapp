import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Users, Send, ArrowLeft, MoreVertical, Hash, Info, Loader2, MessageSquare, Smile, Lock } from 'lucide-react';
import clsx from 'clsx';

const EMOJIS = ['😀', '😂', '🥺', '😭', '🥰', '😍', '😎', '😡', '🥳', '🤯', '🙄', '🥱', '😴', '🤩', '🥶', '🥵', '🤡', '👻', '👽', '🤖', '💀', '💩', '💯', '🔥', '💖', '✨', '👍', '👎', '👏', '🙌', '🤝', '🙏'];
import { format } from 'date-fns';
import socket from '../socket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Chat({ user }) {
    const { username, avatar, color } = user;
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const roomName = searchParams.get('name') || 'Chat Room';

    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [showSidebar, setShowSidebar] = useState(false); // Mobile sidebar toggle
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Private Room State
    const [isVerified, setIsVerified] = useState(false);
    const [roomPassword, setRoomPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [isVerifying, setIsVerifying] = useState(true);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Verify Private Room Access
    useEffect(() => {
        const verifyRoomAccess = async () => {
            try {
                const res = await fetch(`${API_URL}/api/rooms/${roomId}/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: '' })
                });
                if (res.ok) {
                    setIsVerified(true);
                } else {
                    setIsVerified(false);
                }
            } catch (err) {
                console.error('Verification error:', err);
                setIsVerified(false);
            } finally {
                setIsVerifying(false);
            }
        };
        verifyRoomAccess();
    }, [roomId]);

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setAuthError('');
        try {
            const res = await fetch(`${API_URL}/api/rooms/${roomId}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: roomPassword })
            });
            if (res.ok) {
                setIsVerified(true);
            } else {
                setAuthError('Incorrect password. Please try again.');
            }
        } catch (err) {
            setAuthError('Error communicating with server.');
        }
    };

    // Fetch initial messages and manage socket connection
    useEffect(() => {
        if (!isVerified) return;

        // 1. Fetch historical messages
        const fetchMessages = async () => {
            try {
                const res = await fetch(`${API_URL}/api/rooms/${roomId}/messages`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Fetch error');
                setMessages(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch messages:', error);
                setMessages([]);
            } finally {
                setLoading(false);
                scrollToBottom();
            }
        };
        fetchMessages();

        // 2. Connect and join room via Socket
        socket.connect();
        socket.emit('join_room', { roomId, ...user });

        // 3. Setup Socket event listeners
        socket.on('receive_message', (message) => {
            setMessages((prev) => [...prev, message]);
            scrollToBottom();
        });

        socket.on('online_users_update', (users) => {
            setOnlineUsers(users);
        });

        socket.on('user_typing', ({ username: typingUsername }) => {
            setTypingUsers((prev) => {
                const newSet = new Set(prev);
                newSet.add(typingUsername);
                return newSet;
            });
            scrollToBottom();
        });

        socket.on('user_stopped_typing', ({ username: typingUsername }) => {
            setTypingUsers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(typingUsername);
                return newSet;
            });
        });

        // Cleanup on unmount
        return () => {
            socket.off('receive_message');
            socket.off('online_users_update');
            socket.off('user_typing');
            socket.off('user_stopped_typing');
            socket.disconnect();
        };
    }, [roomId, username, isVerified]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleEmojiClick = (emoji) => {
        setInputValue(prev => prev + emoji);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        setShowEmojiPicker(false);

        const newMsg = {
            roomId,
            ...user,
            text: inputValue.trim(),
        };

        socket.emit('send_message', newMsg);
        socket.emit('stop_typing', { roomId, username });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        setInputValue('');
    };

    const handleTyping = (e) => {
        setInputValue(e.target.value);

        socket.emit('typing', { roomId, username });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', { roomId, username });
        }, 1500);
    };

    const myBubbleClass = 'bg-gradient-to-br from-chat-primary to-indigo-600 rounded-tr-sm rounded-l-2xl rounded-br-2xl shadow-md text-white';
    const otherBubbleClass = 'bg-chat-bubble-other border border-white/5 rounded-tl-sm rounded-r-2xl rounded-bl-2xl shadow-sm text-chat-text';

    if (isVerifying) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-chat-bg">
                <Loader2 className="animate-spin text-chat-primary" size={48} />
            </div>
        );
    }

    if (!isVerified) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-chat-bg p-4 relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-chat-primary/20 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-chat-secondary/20 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob" style={{ animationDelay: '2s' }}></div>

                <div className="relative z-10 w-full max-w-md bg-chat-sidebar/90 backdrop-blur-xl border border-chat-border rounded-3xl p-8 shadow-2xl animate-fade-in-up">
                    <div className="w-16 h-16 bg-gradient-to-br from-chat-primary to-chat-secondary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-chat-primary/20 mx-auto">
                        <Lock size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-center text-white mb-2">Private Room</h2>
                    <p className="text-sm text-center text-chat-text-muted mb-8">This room is secured. Please enter the password to join.</p>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={roomPassword}
                                onChange={(e) => setRoomPassword(e.target.value)}
                                placeholder="Enter room password"
                                className="w-full bg-chat-bg border border-chat-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-chat-primary focus:ring-1 focus:ring-chat-primary transition-all duration-300 text-center tracking-widest"
                                autoFocus
                            />
                        </div>
                        {authError && <p className="text-red-400 text-center text-sm font-medium">{authError}</p>}
                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl font-medium bg-chat-primary hover:bg-chat-primary-hover text-white flex items-center justify-center gap-2 shadow-lg shadow-chat-primary/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                            disabled={!roomPassword}
                        >
                            <Lock size={18} />
                            Unlock Room
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/rooms')}
                            className="w-full py-3 rounded-xl font-medium text-chat-text-muted hover:text-white transition-colors"
                        >
                            Back to Rooms
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-chat-bg relative">
            <div className="absolute inset-0 bg-noise z-0 pointer-events-none"></div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative z-10 h-full">
                {/* Chat Header */}
                <header className="h-20 glass-panel border-b border-chat-border flex items-center justify-between px-6 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/rooms')}
                            className="p-2 -ml-2 rounded-full hover:bg-white/5 text-chat-text-muted hover:text-white transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <Hash size={18} className="text-chat-primary" />
                                <h1 className="text-xl font-heading font-bold text-white leading-tight">
                                    {roomName}
                                </h1>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-xs text-chat-text-muted font-medium">
                                    {onlineUsers.length} online
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        className="p-2 rounded-xl bg-chat-sidebar border border-chat-border text-chat-text-muted hover:text-white hover:border-chat-primary/50 transition-all md:hidden"
                        onClick={() => setShowSidebar(!showSidebar)}
                    >
                        <Users size={20} />
                    </button>
                </header>

                {/* Messages List Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin flex flex-col gap-6">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="animate-spin text-chat-primary" size={32} />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-chat-text-muted space-y-4">
                            <MessageSquare size={48} className="opacity-20" />
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg, idx) => {
                                const isMine = msg.username === username;
                                const showAvatar = !isMine && (idx === 0 || messages[idx - 1].username !== msg.username);

                                return (
                                    <div
                                        key={msg._id || idx}
                                        className={clsx('flex flex-col animate-fade-in-up', isMine ? 'items-end' : 'items-start')}
                                    >
                                        {!isMine && showAvatar && (
                                            <span
                                                className="text-xs ml-12 mb-1 block font-bold"
                                                style={{ color: msg.color || '#06B6D4' }}
                                            >
                                                {msg.username}
                                            </span>
                                        )}
                                        <div className={clsx('flex gap-3 max-w-[85%] md:max-w-[70%]', isMine ? 'flex-row-reverse' : 'flex-row')}>
                                            {!isMine ? (
                                                <div
                                                    className={clsx('w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border', showAvatar ? 'shadow-lg bg-chat-bg' : 'opacity-0')}
                                                    style={{ borderColor: showAvatar ? (msg.color || '#06B6D4') : 'transparent' }}
                                                >
                                                    {showAvatar && (
                                                        <img
                                                            src={`https://api.dicebear.com/9.x/${msg.avatar || 'fun-emoji'}/svg?seed=${msg.username || 'guest'}&backgroundColor=transparent`}
                                                            alt="avatar"
                                                            className="w-full h-full rounded-full"
                                                        />
                                                    )}
                                                </div>
                                            ) : null}

                                            <div className="flex flex-col group">
                                                <div
                                                    className={clsx(
                                                        'px-5 py-3 text-[15px] leading-relaxed text-white',
                                                        isMine ? 'rounded-tr-sm rounded-l-2xl rounded-br-2xl shadow-md' : 'rounded-tl-sm rounded-r-2xl rounded-bl-2xl shadow-sm'
                                                    )}
                                                    style={{ backgroundColor: isMine ? (color || '#7C3AED') : (msg.color || '#1F2937'), backgroundImage: 'none' }}
                                                >
                                                    {msg.text}
                                                </div>
                                                <span className={clsx('text-[11px] text-chat-text-muted mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity', isMine ? 'text-right mr-1' : 'ml-1')}>
                                                    {format(new Date(msg.createdAt || Date.now()), 'h:mm a')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Typing Indicators */}
                            {typingUsers.size > 0 && (
                                <div className="flex items-center gap-3 animate-fade-in-up">
                                    <div className="w-9 h-9 rounded-full bg-chat-sidebar border border-white/5 flex items-center justify-center flex-shrink-0">
                                        <MoreVertical size={16} className="text-chat-text-muted" />
                                    </div>
                                    <div className="bg-chat-sidebar border border-white/5 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                                        <div className="w-1.5 h-1.5 bg-chat-text-muted rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-chat-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-1.5 h-1.5 bg-chat-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                    <span className="text-xs text-chat-text-muted">
                                        {Array.from(typingUsers).join(', ')} typing...
                                    </span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 sm:p-6 bg-transparent border-t border-white/5 relative">
                    {/* Emoji Picker Popup */}
                    {showEmojiPicker && (
                        <div className="absolute bottom-full left-4 sm:left-6 mb-2 w-72 max-w-[calc(100vw-2rem)] bg-chat-sidebar border border-chat-border rounded-2xl p-4 shadow-2xl z-50 animate-fade-in-up">
                            <h4 className="text-xs font-bold text-chat-text-muted uppercase tracking-wider mb-3">Emojis</h4>
                            <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto scrollbar-thin">
                                {EMOJIS.map(emoji => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => handleEmojiClick(emoji)}
                                        className="text-xl py-1.5 focus:outline-none hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center transform hover:scale-110 active:scale-95"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <form
                        onSubmit={handleSendMessage}
                        className="flex items-center gap-1 sm:gap-3 max-w-5xl mx-auto bg-chat-sidebar/80 backdrop-blur border border-chat-border rounded-full p-1.5 sm:p-2 shadow-xl focus-within:border-chat-primary/50 focus-within:shadow-chat-primary/10 transition-all duration-300 relative"
                    >
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className={clsx(
                                "p-2 sm:p-3 rounded-full transition-colors flex-shrink-0",
                                showEmojiPicker ? "bg-chat-primary/20 text-chat-primary" : "text-chat-text-muted hover:text-white"
                            )}
                        >
                            <Smile size={20} />
                        </button>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleTyping}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent px-2 sm:px-3 py-2 sm:py-3 text-white focus:outline-none placeholder-chat-text-muted text-sm sm:text-base"
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className="w-10 h-10 sm:w-12 sm:h-12 bg-chat-primary hover:bg-chat-primary-hover disabled:bg-chat-sidebar disabled:text-chat-text-muted text-white rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 transform active:scale-95 disabled:active:scale-100"
                        >
                            <Send size={18} className="ml-1" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Right Sidebar - Online Users */}
            <div className={clsx(
                "fixed inset-y-0 right-0 w-72 bg-[#0A0D18]/95 backdrop-blur-xl border-l border-chat-border flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:bg-chat-sidebar md:bg-opacity-100",
                showSidebar ? "translate-x-0" : "translate-x-full"
            )}>
                <div className="h-20 px-6 border-b border-chat-border flex items-center justify-between">
                    <h2 className="font-heading font-medium text-white flex items-center gap-2">
                        <Users size={18} className="text-chat-secondary" />
                        Members
                    </h2>
                    <button
                        className="md:hidden text-chat-text-muted p-2"
                        onClick={() => setShowSidebar(false)}
                    >
                        &times;
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
                    <div className="space-y-1">
                        <h3 className="text-[11px] font-bold text-chat-text-muted uppercase tracking-wider px-2 mb-3">
                            Online — {onlineUsers.length}
                        </h3>
                        {onlineUsers.map((ou, i) => (
                            <div key={ou.username + i} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors group cursor-default">
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center border shadow-inner transition-colors" style={{ borderColor: ou.color || '#7C3AED' }}>
                                        <img src={`https://api.dicebear.com/9.x/${ou.avatar || 'fun-emoji'}/svg?seed=${ou.username || 'guest'}&backgroundColor=transparent`} alt="avatar" className="w-full h-full rounded-full" />
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-chat-sidebar"></div>
                                </div>
                                <span className="text-sm font-medium line-clamp-1 flex-1" style={{ color: ou.color || '#ffffff' }}>
                                    {ou.username} {ou.username === username && <span className="text-chat-text-muted text-xs font-normal ml-1">(You)</span>}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-chat-bg/50 rounded-2xl border border-white/5 disabled">
                        <div className="flex items-center gap-2 text-chat-secondary mb-2">
                            <Info size={16} />
                            <h4 className="text-xs font-heading font-bold uppercase">Room Info</h4>
                        </div>
                        <p className="text-xs text-chat-text-muted leading-relaxed">
                            You are securely connected via WebSocket. Messages sync in real-time.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
