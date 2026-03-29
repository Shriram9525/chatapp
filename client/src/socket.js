import { io } from 'socket.io-client';

// Use the environment variable for the API URL, or fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const socket = io(API_URL, {
    autoConnect: false, // Connect manually when needed
});

export default socket;
