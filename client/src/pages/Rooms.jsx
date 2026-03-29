import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Hash, LogOut, Loader2, Trash2, Lock } from 'lucide-react';

export default function Rooms({ user, setUser }) {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomDesc, setNewRoomDesc] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms`);
            const data = await res.json();
            setRooms(data);
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (!newRoomName.trim()) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newRoomName, description: newRoomDesc, createdBy: user.username, isPrivate, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Server Error');
            setIsModalOpen(false);
            setNewRoomName('');
            setNewRoomDesc('');
            setIsPrivate(false);
            setPassword('');
            navigate(`/chat/${data._id}?name=${encodeURIComponent(data.name)}`);
        } catch (error) {
            console.error('Failed to create room:', error);
            alert('Error creating room: ' + error.message);
        }
    };

    const handleDeleteRoom = async (e, roomId) => {
        e.preventDefault();
        e.stopPropagation(); // prevent navigating to the room

        // Optimistically remove it from the webpage instantly
        setRooms((prev) => prev.filter(r => r._id !== roomId));

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/${roomId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete room from server');
        } catch (error) {
            console.error('Error deleting room:', error);
            alert('Failed to delete room from the server.');
            fetchRooms(); // Refresh the list if it failed
        }
    };

    const handleLogout = () => {
        setUser(null);
        navigate('/');
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar / Profile Area */}
            <div className="w-64 bg-chat-sidebar flex flex-col border-r border-chat-border hidden md:flex">
                <div className="p-6 border-b border-chat-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2" style={{ borderColor: user.color || '#7C3AED' }}>
                            <img src={`https://api.dicebear.com/9.x/${user.avatar || 'fun-emoji'}/svg?seed=${user.username || 'guest'}&backgroundColor=transparent`} alt="avatar" className="w-full h-full rounded-full" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white line-clamp-1">{user.username}</p>
                            <p className="text-xs" style={{ color: user.color || '#06B6D4' }}>Online</p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 p-6 space-y-4">
                    <h2 className="text-xs font-heading font-bold text-chat-text-muted uppercase tracking-wider mb-4">Navigation</h2>
                    <button className="flex items-center gap-3 w-full p-3 rounded-xl bg-chat-bg text-white border border-chat-primary/20 shadow-inner">
                        <Hash className="text-chat-primary" size={20} />
                        <span className="font-medium">Explore Rooms</span>
                    </button>
                </div>
                <div className="p-6 border-t border-chat-border">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-chat-text-muted hover:text-red-400 transition-colors duration-200"
                    >
                        <LogOut size={18} />
                        <span className="text-sm font-medium">Disconnect</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col pt-0 relative z-10">
                <div className="h-20 px-8 flex items-center justify-between border-b border-chat-border md:hidden">
                    <div className="flex items-center gap-2">
                        <Hash className="text-chat-primary" />
                        <span className="font-heading font-bold text-xl">Explore</span>
                    </div>
                    <button onClick={handleLogout} className="text-chat-text-muted hover:text-red-400">
                        <LogOut size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-10 scrollbar-thin">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                            <div>
                                <h1 className="text-4xl font-heading font-bold text-white mb-2">Available Rooms</h1>
                                <p className="text-chat-text-muted">Join a conversation or create your own space.</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 bg-chat-primary hover:bg-chat-primary-hover text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-chat-primary/20 hover:shadow-chat-primary/40 transform hover:-translate-y-1"
                            >
                                <Plus size={20} />
                                Create Room
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="animate-spin text-chat-primary" size={48} />
                            </div>
                        ) : rooms.length === 0 ? (
                            <div className="text-center py-20 bg-chat-sidebar/50 rounded-2xl border border-white/5">
                                <Hash size={48} className="mx-auto text-chat-text-muted mb-4 opacity-50" />
                                <h3 className="text-xl font-medium text-white mb-2">No rooms found</h3>
                                <p className="text-chat-text-muted mb-6">Be the first to create a discussion space.</p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="text-chat-secondary hover:text-white transition-colors"
                                >
                                    Create one now &rarr;
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {(Array.isArray(rooms) ? rooms : []).map((room) => (
                                    <div
                                        key={room._id}
                                        onClick={() => navigate(`/chat/${room._id}?name=${encodeURIComponent(room.name)}`)}
                                        className="group bg-chat-sidebar hover:bg-[#151f33] border border-chat-border hover:border-chat-primary/50 rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl hover:shadow-chat-primary/10 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-chat-primary/5 rounded-full filter blur-2xl group-hover:bg-chat-primary/20 transition-all duration-500 transform translate-x-10 -translate-y-10"></div>
                                        <div className="flex items-start justify-between mb-4 relative z-10">
                                            <div className="w-12 h-12 rounded-xl bg-chat-bg flex items-center justify-center text-chat-primary group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                                {room.isPrivate ? <Lock size={20} /> : <Hash size={24} />}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {(user.username.toLowerCase() === 'admin' || room.createdBy === user.username) && (
                                                    <button
                                                        onClick={(e) => handleDeleteRoom(e, room._id)}
                                                        className="p-1.5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors border border-red-500/20"
                                                        title="Delete Room"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-chat-bg border border-chat-border text-xs text-chat-text-muted">
                                                    <Users size={12} className="text-chat-secondary" />
                                                    <span>Join</span>
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2 font-heading group-hover:text-chat-secondary transition-colors line-clamp-1 relative z-10">
                                            {room.name}
                                        </h3>
                                        <p className="text-sm text-chat-text-muted line-clamp-2 relative z-10">
                                            {room.description || 'No description provided.'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Room Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative z-10 w-full max-w-md bg-chat-sidebar border border-chat-border rounded-3xl p-8 shadow-2xl animate-fade-in-up">
                        <h2 className="text-2xl font-heading font-bold text-white mb-2">Create New Room</h2>
                        <p className="text-sm text-chat-text-muted mb-6">Set up a space for your topic.</p>

                        <form onSubmit={handleCreateRoom} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-chat-text-muted mb-1.5">Room Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-chat-bg border border-chat-border text-white focus:outline-none focus:border-chat-primary focus:ring-1 focus:ring-chat-primary transition-all"
                                    placeholder="e.g. General Discussion"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-chat-text-muted mb-1.5">Description (Optional)</label>
                                <textarea
                                    value={newRoomDesc}
                                    onChange={(e) => setNewRoomDesc(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-chat-bg border border-chat-border text-white focus:outline-none focus:border-chat-primary focus:ring-1 focus:ring-chat-primary transition-all resize-none"
                                    placeholder="What is this room about?"
                                    rows={3}
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={isPrivate} onChange={() => setIsPrivate(!isPrivate)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-chat-primary"></div>
                                </label>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-white flex items-center gap-1">
                                        <Lock size={14} className="text-chat-primary" /> Private Room
                                    </span>
                                    <span className="text-xs text-chat-text-muted">Requires a password to join</span>
                                </div>
                            </div>

                            {isPrivate && (
                                <div className="animate-fade-in-up">
                                    <label className="block text-sm font-medium text-chat-text-muted mb-1.5 border-t border-chat-border pt-4">Room Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter a secure password..."
                                        className="w-full bg-chat-bg border border-chat-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-chat-primary focus:ring-1 focus:ring-chat-primary transition-all duration-300 tracking-widest"
                                        required={isPrivate}
                                    />
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 rounded-xl font-medium text-chat-text-muted hover:bg-chat-bg hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl font-medium bg-chat-primary hover:bg-chat-primary-hover text-white shadow-lg shadow-chat-primary/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
