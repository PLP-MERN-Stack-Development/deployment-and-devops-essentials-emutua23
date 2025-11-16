# 💬 Real-Time Chat Application

A modern, colorful real-time chat application built with Socket.io, React, and Express. Features include multiple chat rooms, private messaging, typing indicators, reactions, and beautiful animations!

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### Core Functionality
- 🔄 **Real-time messaging** with Socket.io
- 🏠 **Multiple chat rooms** (General, Random, Tech Talk)
- 💬 **Private messaging** between users
- ⌨️ **Typing indicators** - see when others are typing
- ❤️ **Message reactions** - react with emojis
- 📢 **System notifications** for user join/leave events
- 🔊 **Sound notifications** for new messages
- 👥 **Online user list** with avatars

### Enhanced UI/UX (New! 🎉)
- 🌈 **Vibrant gradient color scheme** - Purple, pink, and blue
- ✨ **Smooth animations** - Messages slide in, avatars rotate on hover
- 💅 **Modern glassmorphism effects** - Translucent backgrounds and blur
- 🎨 **Colorful badges and indicators** - Pulsing unread counts
- 🎯 **Interactive elements** - Buttons scale and glow on hover
- 📱 **Responsive design** - Works on all device sizes

### Technical Features
- ✅ **Fixed audio notification** - Resolved 416 Range Request error
- 🚀 **Production-ready** - Configured for Railway and GitHub Pages
- 🔐 **CORS enabled** - Secure cross-origin requests
- 🎭 **Dynamic avatars** - Using DiceBear API
- 📦 **Modern build tools** - Vite for fast development

## 🚀 Quick Start

### Prerequisites
- Node.js v18 or higher
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd YOUR_REPO_NAME
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   cp .env.example .env
   npm run dev
   ```
   Server will start on http://localhost:3001

3. **Setup Frontend** (in a new terminal)
   ```bash
   cd client
   npm install
   cp .env.example .env
   npm run dev
   ```
   Client will start on http://localhost:5173

4. **Open in browser**
   - Navigate to http://localhost:5173
   - Enter a username and start chatting!

## 📦 Project Structure

```
chat-app/
├── client/                 # React frontend
│   ├── public/
│   │   ├── notification.mp3  # Sound effect
│   │   └── vite.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatRoom.jsx
│   │   │   ├── ChatRoom.css
│   │   │   ├── Login.jsx
│   │   │   ├── Login.css
│   │   │   ├── Notification.jsx
│   │   │   ├── Notification.css
│   │   │   ├── Sidebar.jsx
│   │   │   └── Sidebar.css
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   ├── socket.js
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express + Socket.io backend
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── railway.json
│   └── Procfile
├── .github/
│   └── workflows/
│       └── deploy-frontend.yml
├── DEPLOYMENT_GUIDE.md
└── README.md
```

## 🌐 Deployment

### Railway (Backend)
1. Create a new project on [Railway](https://railway.app)
2. Deploy from your GitHub repository
3. Set environment variables:
   - `PORT=3001`
   - `CLIENT_URL=https://your-frontend-url`
4. Railway will auto-deploy on push

### GitHub Pages (Frontend)
1. Enable GitHub Pages in repository settings
2. Set source to "GitHub Actions"
3. Add secret `VITE_SERVER_URL` with your Railway backend URL
4. Push to main branch to trigger deployment

**📖 For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

## 🎨 UI/UX Enhancements

### Color Palette
- **Primary**: #667eea (Purple Blue)
- **Secondary**: #764ba2 (Purple)
- **Accent**: #f093fb (Pink)
- **Success**: #68d391 (Green)
- **Error**: #fc8181 (Red)

### Animations
- **Messages**: Slide in with bounce effect
- **Avatars**: Rotate on hover
- **Buttons**: Scale and glow on interaction
- **Notifications**: Slide from right with bounce
- **Typing Indicator**: Bouncing dots animation

### Interactions
- Hover effects on all interactive elements
- Smooth transitions between states
- Pulsing indicators for activity
- Gradient backgrounds throughout

## 🔧 Technical Details

### Backend (server/)
- **Framework**: Express.js
- **Real-time**: Socket.io
- **Features**: CORS, Range header support for audio
- **Port**: 3001 (configurable)

### Frontend (client/)
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: CSS with CSS3 animations
- **Icons**: React Icons
- **Date Formatting**: date-fns

### Socket Events
- `user:join` - User joins the chat
- `message:send` - Send a message
- `message:receive` - Receive a message
- `private:send` - Send private message
- `private:receive` - Receive private message
- `typing:start` - User starts typing
- `typing:stop` - User stops typing
- `message:react` - React to a message
- `room:join` - Join a room

## 🐛 Bug Fixes

### Fixed in v2.0.0
- ✅ **Notification.mp3 416 Error**: Added proper Range header support in server
- ✅ **Audio Streaming**: Implemented HTTP range requests for audio files
- ✅ **CORS Issues**: Enhanced CORS configuration for production
- ✅ **Asset Loading**: Fixed relative paths for GitHub Pages deployment

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Socket.io for real-time communication
- DiceBear for avatar generation
- React Icons for beautiful icons
- Railway for easy backend hosting
- GitHub Pages for frontend hosting

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Made with ❤️ and lots of ☕
