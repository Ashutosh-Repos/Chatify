import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { parse as parseCookie } from "cookie";
import { decode } from "next-auth/jwt";

const app = express();
const server = createServer(app);

// Internal API key for Next.js to Socket server communication
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "chatify-internal-key";

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  },
});

// User socket mapping: userId -> socketId
const userSocketMap: Record<string, string> = {};

export function getReceiverSocketId(userId: string): string | undefined {
  return userSocketMap[userId];
}

// Extend Socket type to include user data
interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    user: {
      id: string;
      email?: string;
      name?: string;
    };
  };
}

// Socket authentication middleware using NextAuth decode
io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;
    
    if (!cookieHeader) {
      console.log("Socket connection rejected: No cookies");
      return next(new Error("Unauthorized - No session"));
    }

    const cookies = parseCookie(cookieHeader);
    
    // NextAuth v5 cookie names in order of preference
    const cookieNames = [
      "__Secure-authjs.session-token",  // Production HTTPS
      "authjs.session-token",           // Development HTTP
      "__Secure-next-auth.session-token", // Legacy HTTPS
      "next-auth.session-token",        // Legacy HTTP
    ];

    let sessionToken: string | undefined;
    let usedCookieName: string | undefined;

    for (const name of cookieNames) {
      if (cookies[name]) {
        sessionToken = cookies[name];
        usedCookieName = name;
        break;
      }
    }

    if (!sessionToken || !usedCookieName) {
      console.log("Socket connection rejected: No session token found");
      return next(new Error("Unauthorized - No session token"));
    }

    const secret = process.env.AUTH_SECRET;
    if (!secret) {
      console.error("AUTH_SECRET not configured");
      return next(new Error("Server configuration error"));
    }

    // Use NextAuth's decode function with proper salt
    const decoded = await decode({
      token: sessionToken,
      secret,
      salt: usedCookieName,
    });

    if (!decoded) {
      console.log("Socket connection rejected: Token decode failed");
      return next(new Error("Unauthorized - Invalid session"));
    }

    const userId = (decoded.sub || decoded.id) as string | undefined;
    if (!userId) {
      console.log("Socket connection rejected: No user ID in token");
      return next(new Error("Unauthorized - Invalid session"));
    }

    // Attach user to socket
    socket.data.userId = userId;
    socket.data.user = {
      id: userId,
      email: decoded.email as string | undefined,
      name: decoded.name as string | undefined,
    };

    console.log(`Socket authenticated for user: ${decoded.name || userId}`);
    next();
  } catch (error) {
    console.error("Socket auth error:", error);
    next(new Error("Unauthorized - Authentication failed"));
  }
});

io.on("connection", (socket: AuthenticatedSocket) => {
  const userId = socket.data.userId;
  console.log(`User connected: ${userId}`);

  // Map user to socket
  userSocketMap[userId] = socket.id;

  // Broadcast online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${userId}`);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Middleware
app.use(cors({ 
  origin: process.env.CLIENT_URL || "http://localhost:3000", 
  credentials: true 
}));
app.use(express.json());

// Rate limiting configuration
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const notifyLimiter = rateLimit({
  windowMs: 1 * 1000, // 1 second
  max: 50, // 50 notifications per second (for high message volume)
  message: { error: "Rate limit exceeded" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Health check endpoint
app.get("/health", (_, res) => {
  res.json({ 
    status: "ok", 
    onlineUsers: Object.keys(userSocketMap).length,
    timestamp: new Date().toISOString(),
  });
});

// Protected endpoint for Next.js to notify about new messages
app.post("/notify", notifyLimiter, (req, res) => {
  // Verify internal API key
  const apiKey = req.headers["x-internal-api-key"];
  if (apiKey !== INTERNAL_API_KEY) {
    console.log("Notify endpoint: Invalid API key");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { receiverId, message } = req.body;

  if (!receiverId || !message) {
    return res.status(400).json({ error: "receiverId and message required" });
  }

  const receiverSocketId = getReceiverSocketId(receiverId);

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", message);
    console.log(`Message delivered to user ${receiverId} via socket`);
  } else {
    console.log(`User ${receiverId} is offline, message saved to DB only`);
  }

  res.json({ success: true, delivered: !!receiverSocketId });
});

// Endpoint to get online users (for debugging/admin)
app.get("/online-users", (req, res) => {
  const apiKey = req.headers["x-internal-api-key"];
  if (apiKey !== INTERNAL_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.json({ 
    count: Object.keys(userSocketMap).length,
    users: Object.keys(userSocketMap),
  });
});

const PORT = process.env.SOCKET_PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Socket server running on port ${PORT}`);
  console.log(`   Client URL: ${process.env.CLIENT_URL || "http://localhost:3000"}`);
  console.log(`   Rate limiting: 100 req/min general, 50 notifications/sec`);
});

export { io };
