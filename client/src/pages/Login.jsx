import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Palette, UserCircle } from 'lucide-react';
import clsx from 'clsx';

const AVATAR_STYLES = ['fun-emoji', 'bottts', 'adventurer', 'avataaars', 'pixel-art'];
const COLORS = ['#6D28D9', '#0a819eff', '#ad0b34ff', '#047857', '#B45309', '#1D4ED8'];

export default function Login({ setUser }) {
    const [inputData, setInputData] = useState('');
    const [avatarStyle, setAvatarStyle] = useState(AVATAR_STYLES[0]);
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        const trimmed = inputData.trim();
        if (!trimmed) {
            setError('Please enter a username');
            return;
        }
        if (trimmed.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }
        setUser({ username: trimmed, avatar: avatarStyle, color: selectedColor });
        navigate('/rooms');
    };

    return (
        <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
            {/* Animated Blobs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-chat-primary/20 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-chat-secondary/20 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob" style={{ animationDelay: '2s' }}></div>
            <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob" style={{ animationDelay: '4s' }}></div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-3xl glass-panel shadow-2xl border border-chat-primary/30 transform transition-all hover:scale-[1.01] duration-300">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-chat-primary to-chat-secondary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-chat-primary/20">
                        <MessageSquare size={32} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-chat-text-muted text-center">
                        ChatSphere
                    </h1>
                    <p className="text-chat-text-muted mt-2 text-center text-sm font-medium">
                        Enter the realm of real-time conversations.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-chat-text-muted mb-2">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={inputData}
                            onChange={(e) => {
                                setInputData(e.target.value);
                                setError('');
                            }}
                            placeholder="e.g. JohnDoe"
                            className="w-full px-5 py-4 rounded-xl bg-chat-bg/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-chat-primary/50 focus:border-chat-primary transition-all duration-300"
                            autoComplete="off"
                        />
                    </div>

                    {/* Avatar Selection */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-chat-text-muted mb-3">
                            <UserCircle size={16} /> Choose Avatar Style
                        </label>
                        <div className="flex justify-between gap-2 overflow-x-auto scrollbar-hide pb-2">
                            {AVATAR_STYLES.map((style) => (
                                <button
                                    key={style}
                                    type="button"
                                    onClick={() => setAvatarStyle(style)}
                                    className={clsx(
                                        'relative w-14 h-14 rounded-2xl flex-shrink-0 transition-all duration-300',
                                        avatarStyle === style ? 'bg-white/10 shadow-lg scale-110' : 'hover:bg-white/5 opacity-60 hover:opacity-100'
                                    )}
                                    style={{ borderColor: avatarStyle === style ? selectedColor : 'transparent', borderWidth: '2px' }}
                                >
                                    <img
                                        src={`https://api.dicebear.com/9.x/${style}/svg?seed=${inputData || 'guest'}&backgroundColor=transparent`}
                                        alt={style}
                                        className="w-full h-full p-1"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-chat-text-muted mb-3">
                            <Palette size={16} /> Theme Color
                        </label>
                        <div className="flex justify-center gap-4">
                            {COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setSelectedColor(c)}
                                    className={clsx(
                                        'w-8 h-8 rounded-full transition-all duration-300',
                                        selectedColor === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-chat-bg' : 'hover:scale-110 opacity-70 hover:opacity-100'
                                    )}
                                    style={{ backgroundColor: c, boxShadow: selectedColor === c ? `0 0 15px ${c}` : 'none' }}
                                />
                            ))}
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-400 mt-2 text-sm animate-fade-in-up text-center">{error}</p>
                    )}
                    <button
                        type="submit"
                        className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 active:translate-y-0 active:scale-95 mt-4"
                        style={{ backgroundColor: selectedColor, boxShadow: `0 4px 20px ${selectedColor}40` }}
                    >
                        Enter ChatSphere
                    </button>
                </form>
            </div>
        </div>
    );
}
