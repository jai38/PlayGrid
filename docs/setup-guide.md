# PlayGrid – Local Setup Guide

## Prerequisites

- Node.js 20+
- npm or pnpm
- Git

---

## Clone Repo

```bash
git clone https://github.com/your-username/playgrid.git
cd playgrid
```

## Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## Run in Dev Mode

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

## Environment Variables (Backend)

Create **.env** in **/backend**

```ini
PORT=4000
```

## Build for Production

```bash
# Backend
npm run build

# Frontend
npm run build
```
