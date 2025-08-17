# 🚀 PlayGrid Setup Guide

## System Requirements

### Minimum Requirements
- **Node.js**: 18.x or higher (20.x recommended)
- **npm**: 9.x or higher (comes with Node.js)
- **Git**: Latest version
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space

### Supported Operating Systems
- **macOS**: 10.15 (Catalina) or later
- **Windows**: 10 or later, WSL2 recommended for development
- **Linux**: Ubuntu 18.04+, Debian 10+, or equivalent

### Browser Support
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

---

## 📥 Installation Methods

### Method 1: Standard Installation

#### 1. Clone the Repository
```bash
# Clone from GitHub
git clone https://github.com/PlayGridAI/PlayGrid.git
cd PlayGrid

# Or download ZIP and extract
curl -L https://github.com/PlayGridAI/PlayGrid/archive/main.zip -o playgrid.zip
unzip playgrid.zip
cd PlayGrid-main
```

#### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root directory
cd ..
```

#### 3. Environment Configuration
Create environment files for configuration:

**Backend Environment (`backend/.env`):**
```ini
# Server Configuration
PORT=4000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Game Configuration
DEFAULT_MAX_PLAYERS=8
ROOM_DISCONNECT_GRACE_MS=300000
GAME_TIMEOUT_MS=1800000

# Logging
LOG_LEVEL=info
```

**Frontend Environment (`frontend/.env`):**
```ini
# API Configuration
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000

# App Configuration
VITE_APP_NAME=PlayGrid
VITE_MAX_RECONNECT_ATTEMPTS=5
```

#### 4. Start Development Servers
```bash
# Method A: Using separate terminals
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

```bash
# Method B: Using process managers (optional)
# Install concurrently globally
npm install -g concurrently

# From root directory
concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

#### 5. Verify Installation
- **Backend**: Open http://localhost:4000/health - should return `{"status":"ok"}`
- **Frontend**: Open http://localhost:5173 - should show PlayGrid home page
- **Socket Connection**: Check browser console for "Connected to server" message

---

### Method 2: Docker Installation

#### Prerequisites
- **Docker**: 20.x or higher
- **Docker Compose**: 2.x or higher

#### 1. Create Docker Configuration

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=development
      - PORT=4000
      - CORS_ORIGIN=http://localhost:5173
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - redis

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:4000
      - VITE_SOCKET_URL=http://localhost:4000
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

**Backend Dockerfile (`backend/Dockerfile`):**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Start application
CMD ["npm", "start"]
```

**Frontend Dockerfile (`frontend/Dockerfile`):**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

#### 2. Run with Docker
```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

### Method 3: Automated Setup Script

Create a setup script for automated installation:

**setup.sh (Linux/macOS):**
```bash
#!/bin/bash

echo "🎲 PlayGrid Setup Script"
echo "========================"

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Clone repository if not already present
if [ ! -d "PlayGrid" ]; then
    echo "📥 Cloning PlayGrid repository..."
    git clone https://github.com/PlayGridAI/PlayGrid.git
    cd PlayGrid
else
    echo "📁 Using existing PlayGrid directory"
    cd PlayGrid
    git pull origin main
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create environment files
echo "⚙️ Creating environment files..."
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOF
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
DEFAULT_MAX_PLAYERS=8
ROOM_DISCONNECT_GRACE_MS=300000
GAME_TIMEOUT_MS=1800000
LOG_LEVEL=info
EOF
    echo "✅ Created backend/.env"
fi

if [ ! -f "frontend/.env" ]; then
    cat > frontend/.env << EOF
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
VITE_APP_NAME=PlayGrid
VITE_MAX_RECONNECT_ATTEMPTS=5
EOF
    echo "✅ Created frontend/.env"
fi

# Build applications
echo "🔨 Building applications..."
cd backend
npm run build
cd ../frontend
npm run build
cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start development servers:"
echo "  Backend:  cd backend && npm run dev"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "To start production servers:"
echo "  Backend:  cd backend && npm start"
echo "  Frontend: cd frontend && npm run preview"
echo ""
echo "Visit http://localhost:5173 to access PlayGrid!"
```

**setup.ps1 (Windows PowerShell):**
```powershell
Write-Host "🎲 PlayGrid Setup Script" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green

# Check Node.js
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Clone repository
if (!(Test-Path "PlayGrid")) {
    Write-Host "📥 Cloning PlayGrid repository..." -ForegroundColor Blue
    git clone https://github.com/PlayGridAI/PlayGrid.git
    Set-Location PlayGrid
} else {
    Write-Host "📁 Using existing PlayGrid directory" -ForegroundColor Yellow
    Set-Location PlayGrid
    git pull origin main
}

# Install dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Blue
Set-Location backend
npm install
Set-Location ..

Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Blue
Set-Location frontend
npm install
Set-Location ..

# Create environment files
Write-Host "⚙️ Creating environment files..." -ForegroundColor Blue

$backendEnv = @"
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
DEFAULT_MAX_PLAYERS=8
ROOM_DISCONNECT_GRACE_MS=300000
GAME_TIMEOUT_MS=1800000
LOG_LEVEL=info
"@

$frontendEnv = @"
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
VITE_APP_NAME=PlayGrid
VITE_MAX_RECONNECT_ATTEMPTS=5
"@

if (!(Test-Path "backend\.env")) {
    $backendEnv | Out-File -FilePath "backend\.env" -Encoding UTF8
    Write-Host "✅ Created backend/.env" -ForegroundColor Green
}

if (!(Test-Path "frontend\.env")) {
    $frontendEnv | Out-File -FilePath "frontend\.env" -Encoding UTF8
    Write-Host "✅ Created frontend/.env" -ForegroundColor Green
}

# Build applications
Write-Host "🔨 Building applications..." -ForegroundColor Blue
Set-Location backend
npm run build
Set-Location ..\frontend
npm run build
Set-Location ..

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start development servers:"
Write-Host "  Backend:  cd backend && npm run dev"
Write-Host "  Frontend: cd frontend && npm run dev"
Write-Host ""
Write-Host "Visit http://localhost:5173 to access PlayGrid!"
```

---

## 🔧 Configuration Options

### Backend Configuration

**config.ts options:**
```typescript
export const config = {
    // Server settings
    PORT: process.env.PORT || 4000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // CORS settings
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
    
    // Game settings
    DEFAULT_MAX_PLAYERS: Number(process.env.DEFAULT_MAX_PLAYERS) || 8,
    ROOM_DISCONNECT_GRACE_MS: Number(process.env.ROOM_DISCONNECT_GRACE_MS) || 300000,
    GAME_TIMEOUT_MS: Number(process.env.GAME_TIMEOUT_MS) || 1800000,
    
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    
    // Database (future)
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL
};
```

### Frontend Configuration

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        host: true, // Allow external connections
        cors: true
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    socket: ['socket.io-client'],
                    router: ['react-router-dom']
                }
            }
        }
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }
});
```

---

## 🧪 Testing Installation

### Automated Tests
```bash
# Run backend tests (when available)
cd backend
npm test

# Run frontend tests (when available)
cd frontend
npm test

# Integration tests
npm run test:integration
```

### Manual Verification Checklist

**Backend Health Check:**
- [ ] Server starts without errors
- [ ] Health endpoint responds: `curl http://localhost:4000/health`
- [ ] Socket.IO connects successfully
- [ ] Environment variables loaded correctly

**Frontend Health Check:**
- [ ] Development server starts without errors
- [ ] Home page loads at http://localhost:5173
- [ ] No console errors in browser
- [ ] Socket connection establishes

**Full Integration Test:**
1. [ ] Create a room
2. [ ] Join room with second browser tab
3. [ ] Start a game
4. [ ] Perform game actions
5. [ ] Test reconnection (refresh page)

---

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Find process using port
lsof -i :4000  # macOS/Linux
netstat -ano | findstr :4000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

**Node.js Version Issues:**
```bash
# Install Node Version Manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node.js 20
nvm install 20
nvm use 20
```

**Permission Errors:**
```bash
# Fix npm permissions (Linux/macOS)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

**Socket Connection Issues:**
1. Check firewall settings
2. Verify CORS configuration
3. Ensure backend is running before frontend
4. Check browser console for errors

**Build Failures:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Debug Mode

**Backend Debug:**
```bash
# Enable debug logging
DEBUG=socket.io:* npm run dev

# Or set environment variable
export DEBUG=playgrid:*
npm run dev
```

**Frontend Debug:**
```bash
# Enable verbose logging
VITE_LOG_LEVEL=debug npm run dev
```

---

## 🚀 Production Deployment

### Build for Production
```bash
# Backend production build
cd backend
npm run build
npm start

# Frontend production build
cd frontend
npm run build
npm run preview
```

### Environment Variables for Production
```ini
# Backend production .env
NODE_ENV=production
PORT=4000
CORS_ORIGIN=https://your-domain.com
LOG_LEVEL=error

# Frontend production .env
VITE_API_URL=https://api.your-domain.com
VITE_SOCKET_URL=https://api.your-domain.com
```

---

**Next: [Deployment Guide](./deployment/README.md)**
