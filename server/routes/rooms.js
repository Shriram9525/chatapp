const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Message = require('../models/Message');

// GET /api/rooms — fetch all rooms
router.get('/', async (req, res) => {
    try {
        // Exclude passwords from public room list
        const rooms = await Room.find().select('-password').sort({ createdAt: -1 });
        res.json(rooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ error: 'Server error fetching rooms' });
    }
});

// POST /api/rooms — create a new room
router.post('/', async (req, res) => {
    try {
        const { name, description, createdBy, isPrivate, password } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Room name is required' });
        }

        const newRoom = new Room({
            name,
            description: description || '',
            createdBy: createdBy || 'admin',
            isPrivate: Boolean(isPrivate),
            password: password || ''
        });

        const savedRoom = await newRoom.save();
        res.status(201).json(savedRoom);
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ error: 'Server error creating room' });
    }
});

// DELETE /api/rooms/:roomId — delete a room and its messages
router.delete('/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        await Room.findByIdAndDelete(roomId);
        await Message.deleteMany({ roomId });
        res.status(200).json({ message: 'Room and associated messages deleted successfully' });
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ error: 'Server error deleting room' });
    }
});

// GET /api/rooms/:roomId/messages — fetch last 50 messages for a room
router.get('/:roomId/messages', async (req, res) => {
    try {
        const { roomId } = req.params;
        const messages = await Message.find({ roomId })
            .sort({ createdAt: -1 })
            .limit(50);

        // Reverse because we want oldest to newest for displaying
        res.json(messages.reverse());
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Server error fetching messages' });
    }
});

// POST /api/rooms/:roomId/verify — check room password
router.post('/:roomId/verify', async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        if (!room.isPrivate) {
            return res.json({ success: true, name: room.name });
        }

        if (room.password === req.body.password) {
            return res.json({ success: true, name: room.name });
        }

        return res.status(401).json({ error: 'Invalid password' });
    } catch (error) {
        console.error('Error verifying room:', error);
        res.status(500).json({ error: 'Server error verifying room' });
    }
});

module.exports = router;
