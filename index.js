// server/index.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const http = require('http'); // 1. Import http
const { Server } = require("socket.io"); // 2. Import Server from socket.io
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app); // 3. Create an HTTP server from the Express app

// 4. Create a Socket.IO server and configure CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your React app's URL
    methods: ["GET", "POST"]
  }
});

const PORT = 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/insights', require('./routes/insights'));
app.use('/api/questions', require('./routes/questions'));

// In server/index.js
app.use('/api/messages', require('./routes/messages'));
// Add this in server/index.js
app.use('/api/ai', require('./routes/ai'));

app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Campus Connect API!" });
});

// --- Socket.IO Connection Logic ---
let onlineUsers = {}; // Simple in-memory store for online users { userId: socketId }

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for a user adding themselves to the online list
  socket.on('add-user', (userId) => {
    onlineUsers[userId] = socket.id;
    console.log('Online users:', onlineUsers);
    
    io.emit('update-online-users', Object.keys(onlineUsers));
  });

  // In server/index.js

  // In server/index.js

socket.on('private-message', async ({ recipientId, message }) => {
  try {
    const senderId = Object.keys(onlineUsers).find(key => onlineUsers[key] === socket.id);
    
    const newMessage = new Message({
      sender: senderId,
      recipient: recipientId,
      content: message,
    });
    await newMessage.save();

    // Send the saved message to the recipient if they are online
    const recipientSocketId = onlineUsers[recipientId];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('private-message', newMessage);
    }
    
    // ## NEW PART: Also send the message back to the sender ##
    // This confirms the message was sent and provides the real _id from the database
    socket.emit('private-message', newMessage);

  } catch (error) {
    console.error('Error handling private message:', error);
  }
});
  // Add these inside the io.on('connection', ...) block in server/index.js

  // Listen for a message delete request
  socket.on('delete-message', async ({ messageId }) => {
    try {
      const senderId = Object.keys(onlineUsers).find(key => onlineUsers[key] === socket.id);
      const message = await Message.findById(messageId);

      // Verify the user owns the message
      if (message && message.sender.toString() === senderId) {
        await Message.findByIdAndDelete(messageId);

        // Notify the recipient that the message was deleted
        const recipientSocketId = onlineUsers[message.recipient.toString()];
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('message-deleted', { messageId });
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  });

  // Listen for a message edit request
  socket.on('edit-message', async ({ messageId, newContent }) => {
    try {
      const senderId = Object.keys(onlineUsers).find(key => onlineUsers[key] === socket.id);
      const message = await Message.findById(messageId);

      // Verify the user owns the message
      if (message && message.sender.toString() === senderId) {
        message.content = newContent;
        message.isEdited = true;
        await message.save();

        // Notify the recipient that the message was edited
        const recipientSocketId = onlineUsers[message.recipient.toString()];
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('message-edited', { messageId, newContent });
        }
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    // Remove user from onlineUsers
    for (const userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
        break;
      }
    }
    
    io.emit('update-online-users', Object.keys(onlineUsers));
    console.log('A user disconnected:', socket.id);
    console.log('Online users:', onlineUsers);
  });

});



// 5. Change app.listen to server.listen
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});