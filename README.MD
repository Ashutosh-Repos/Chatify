# Chatify - Real-time Chat Application

A modern, full-stack real-time chat application built with Next.js 16, Socket.io, and PostgreSQL.

![Chatify Screenshot](/client/public/og-image.png)

## ✨ Features

- **Real-time Messaging** - Instant message delivery with Socket.io
- **User Authentication** - Secure auth with NextAuth.js v5
- **Online Status** - See who's online in real-time
- **Image Sharing** - Upload and share images via Cloudinary
- **Sound Notifications** - Audio alerts for new messages
- **Responsive Design** - Works on desktop and mobile
- **Rate Limiting** - Protection against spam and abuse

## 🛠️ Tech Stack

### Client (Next.js App)
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Auth:** NextAuth.js v5
- **State:** Zustand
- **Styling:** Tailwind CSS
- **Database:** Prisma 7 + PostgreSQL

### Socket Server
- **Runtime:** Node.js + Express
- **WebSockets:** Socket.io
- **Auth:** NextAuth JWT decode

## 📁 Project Structure

```
chatify/
├── client/              # Next.js frontend application
│   ├── src/
│   │   ├── app/         # App router pages
│   │   ├── components/  # React components
│   │   ├── stores/      # Zustand state stores
│   │   ├── lib/         # Utilities (auth, prisma, etc.)
│   │   └── types/       # TypeScript types
│   └── prisma/          # Database schema
│
├── socket-server/       # Socket.io server
│   └── src/
│       └── index.ts     # Server entry point
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudinary account (for image uploads)

### Environment Variables

#### Client (`client/.env`)

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/chatify"

# Auth
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_TRUST_HOST=true
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Socket Server
SOCKET_SERVER_URL="http://localhost:4000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:4000"
INTERNAL_API_KEY="your-internal-key"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

#### Socket Server (`socket-server/.env`)

```env
PORT=4000
AUTH_SECRET="same-as-client"
CLIENT_URL="http://localhost:3000"
INTERNAL_API_KEY="same-as-client"
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/chatify.git
   cd chatify
   ```

2. **Install client dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Set up database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Install socket server dependencies**
   ```bash
   cd ../socket-server
   npm install
   ```

5. **Start development servers**

   Terminal 1 (Client):
   ```bash
   cd client && npm run dev
   ```

   Terminal 2 (Socket):
   ```bash
   cd socket-server && npm run dev
   ```

6. **Open http://localhost:3000**

## 🌐 Deployment

### Client → Vercel
1. Push to GitHub
2. Import project in Vercel
3. Set root directory to `client`
4. Add environment variables
5. Deploy

### Socket Server → Railway/Render
1. Create new service
2. Set root directory to `socket-server`
3. Add environment variables
4. Deploy

> **Note:** Update `SOCKET_SERVER_URL` and `CLIENT_URL` with production URLs after deployment.

## 📝 API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | * | NextAuth endpoints |
| `/api/auth/check` | GET | Get current user |
| `/api/auth/signup` | POST | Register new user |
| `/api/auth/update-profile` | PUT | Update profile picture |
| `/api/messages/contacts` | GET | Get all contacts |
| `/api/messages/chats` | GET | Get chat partners |
| `/api/messages/[userId]` | GET | Get messages with user |
| `/api/messages/send/[userId]` | POST | Send message |

## 🔒 Security

- Password hashing with bcrypt
- JWT session encryption
- Rate limiting on all endpoints
- CORS protection
- Input validation

## 📄 License

MIT License - feel free to use this project for learning or production.

---

Built with ❤️ using Next.js and Socket.io
