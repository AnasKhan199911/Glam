const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../backend/.env' });

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const dbConfig = {
    host: 'localhost', // Changed from 127.0.0.1 to localhost
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'glam_app',
    connectTimeout: 10000 // 10 seconds
};

let connection;

async function connectDB() {
    try {
        console.log('Attempting to connect to MySQL for sockets at ' + dbConfig.host);
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL for sockets');
    } catch (err) {
        console.error('Error connecting to MySQL:', err);
    }
}

connectDB();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    socket.on('send_message', async (data) => {
        const { sender_id, sender_type, receiver_id, receiver_type, message } = data;
        
        try {
            const [result] = await connection.execute(
                'INSERT INTO chat_messages (sender_id, sender_type, receiver_id, receiver_type, message) VALUES (?, ?, ?, ?, ?)',
                [sender_id, sender_type, receiver_id, receiver_type, message]
            );

            const newMessage = {
                id: result.insertId,
                sender_id,
                sender_type,
                receiver_id,
                receiver_type,
                message,
                created_at: new Date()
            };

            const userRoom = `${receiver_type}_${receiver_id}`;
            const senderRoom = `${sender_type}_${sender_id}`;
            
            io.to(userRoom).emit('receive_message', newMessage);
            io.to(senderRoom).emit('message_sent', newMessage);

        } catch (err) {
            console.error('Error saving message:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = 5001;
server.listen(PORT, () => {
    console.log(`Socket server running on port ${PORT}`);
});
