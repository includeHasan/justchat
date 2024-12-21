
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const passport = require('passport');
const chatRoutes = require('./routes/chatRoutes');
const SocketService = require('./services/socketService');
const socketAuthMiddleware = require('./middleware/socketAuthMiddleware');
const socketIo = require('socket.io');
const http = require('http');
const adminRoutes = require('./routes/adminRoutes');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');



// Verify environment variables are loaded
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Defined' : 'Not defined');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"]
    }
  });
// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(passport.initialize());
app.use(morgan('dev'));
app.use(cookieParser());

// Socket.IO Configuration
const socketService = new SocketService(io);
io.on('connection', (socket) => {
    socketService.init(socket);
  });
  
io.use(socketAuthMiddleware);

// Connect to Database
connectDB();

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/chat', chatRoutes);
app.use('/admin', adminRoutes); 

app.get('/', (req, res) => {
    res.send('server is running....');
  });


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});