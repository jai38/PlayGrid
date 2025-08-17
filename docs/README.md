# 🎲 PlayGrid Documentation

**Official documentation for PlayGrid - A real-time online multiplayer board game platform**

Welcome to the comprehensive documentation for PlayGrid, an open-source platform that brings classic board games to the web with real-time multiplayer functionality.

## 📚 Documentation Index

### Getting Started
- [🚀 Introduction](./introduction.md) - What PlayGrid is, features, and why it exists
- [⚡ Quick Start](./setup-guide.md) - Get up and running in minutes
- [🏗️ Installation Guide](./installation.md) - Detailed setup instructions

### Architecture & Design
- [🏛️ Technical Architecture](./architecture.md) - High-level system overview
- [📊 System Components](./components.md) - Component responsibilities and interactions
- [🔄 Data Flow](./data-flow.md) - How data moves through the system
- [📡 Socket Events](./socket-events.md) - Real-time communication protocol

### Backend Development
- [⚙️ Backend Overview](./backend/README.md) - Tech stack and architecture
- [🎮 Game Engine](./backend/game-engine.md) - Game state management and engine
- [🔌 Event Handling](./backend/event-handling.md) - Socket event processing
- [📝 API Reference](./backend/api-reference.md) - REST and Socket.IO API docs

### Frontend Development
- [🎨 Frontend Overview](./frontend/README.md) - Tech stack and structure
- [🧩 Component Guide](./frontend/components.md) - Component architecture
- [🔗 Socket Integration](./frontend/socket-integration.md) - Client-side socket management
- [🎪 Game Components](./frontend/game-components.md) - Game-specific UI components

### Game Development
- [🎯 Game Flow](./game-flow.md) - Step-by-step gameplay mechanics
- [🃏 Implementing Games](./game-implementation.md) - How to add new games
- [📋 Game Rules](./games/) - Individual game documentation

### Deployment & Operations
- [🚀 Deployment Guide](./deployment/README.md) - Production deployment
- [🐳 Docker Setup](./deployment/docker.md) - Containerized deployment
- [☁️ Cloud Hosting](./deployment/cloud.md) - AWS, Vercel, and other platforms
- [📊 Monitoring](./deployment/monitoring.md) - Health checks and monitoring

### Development Workflow
- [🤝 Contributing](../CONTRIBUTING.md) - How to contribute to PlayGrid
- [🧪 Testing](./testing/README.md) - Testing strategy and examples
- [🔍 Debugging](./testing/debugging.md) - Common issues and solutions
- [📏 Code Standards](./development/code-standards.md) - Coding guidelines

### Advanced Topics
- [🔮 Future Enhancements](./roadmap.md) - Planned features and improvements
- [🤖 AI Integration](./advanced/ai-bots.md) - Adding AI bot support
- [🏆 Leaderboards](./advanced/leaderboards.md) - Ranking and statistics
- [⚡ Performance](./advanced/performance.md) - Optimization strategies

## 🎮 Supported Games

| Game | Status | Players | Description |
|------|---------|---------|-------------|
| **Coup** | ✅ Complete | 2-6 | Bluffing and deduction card game |
| **Monopoly** | 🚧 In Progress | 2-8 | Classic property trading game |
| **Custom Games** | 📋 Planned | Varies | Extensible game engine for new games |

## 🛠️ Tech Stack Overview

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Real-time**: Socket.IO
- **Language**: TypeScript
- **Testing**: Jest

### Frontend  
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Language**: TypeScript
- **Real-time**: Socket.IO Client

### Infrastructure
- **Database**: In-memory (Redis planned)
- **Hosting**: Vercel (Frontend), Render/Railway (Backend)
- **CI/CD**: GitHub Actions

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/PlayGridAI/PlayGrid.git
cd PlayGrid

# Start backend
cd backend
npm install
npm run dev

# Start frontend (in new terminal)
cd frontend  
npm install
npm run dev
```

Visit `http://localhost:5173` to access PlayGrid!

## 🤝 Community

- 📞 [Discord](https://discord.gg/playgrid) - Chat with the community
- 🐛 [Issues](https://github.com/PlayGridAI/PlayGrid/issues) - Report bugs and request features
- 💡 [Discussions](https://github.com/PlayGridAI/PlayGrid/discussions) - Ask questions and share ideas
- 📖 [Wiki](https://github.com/PlayGridAI/PlayGrid/wiki) - Community-driven documentation

## 📜 License

PlayGrid is open source and released under the [MIT License](../LICENSE).

---

**Made with ❤️ by the PlayGrid community**

*Last updated: January 2025*