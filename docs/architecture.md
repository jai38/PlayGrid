# PlayGrid – Phase 1 Architecture

## Overview

PlayGrid is a responsive real-time board game platform that supports:

- Creating public or private rooms
- Joining rooms via lobby
- Real-time player updates via WebSockets
- Persistent reconnect (user rejoins after refresh or network drop)
- Monopoly as the first playable game (custom rules coming later)

Tech stack:

- **Backend:** Node.js + Express + Socket.IO + TypeScript
- **Frontend:** React + Vite + TailwindCSS + Socket.IO Client + TypeScript
- **State Storage:** In-memory + Redis (optional for scaling/reconnect persistence)
- **Hosting:** Vercel/Netlify for frontend, Render/Fly.io/Heroku for backend (MVP)

---

## Architecture Diagram

    ┌───────────────────┐
    │     Frontend      │
    │ React + TS + Vite │
    │   TailwindCSS     │
    └───────┬───────────┘
            │ WebSocket (Socket.IO)
            ▼
    ┌───────────────────┐
    │     Backend       │
    │ Node.js + TS      │
    │ Express + Socket.IO
    ├───────────────────┤
    │ Rooms Manager     │
    │ Game Manager      │
    │ (Monopoly Logic)  │
    └───────┬───────────┘
            │ In-memory store / Redis
            ▼
    ┌───────────────────┐
    │  Persistence Layer│
    │(optional for MVP) │
    └───────────────────┘

---

## Key Components

### Frontend

- **Pages**: Nickname, Lobby, Room
- **Socket Hook**: `useSocket` for event subscription
- **State Persistence**: LocalStorage for nickname + room ID
- **Animations**: Framer Motion for basic UI animations

### Backend

- **Room Manager**: Handles creation, joining, leaving, and cleanup
- **Player Manager**: Tracks player state inside a room
- **Game Manager**: Monopoly logic (phase 2 will add customization)
- **Reconnect Logic**: Matches user socket ID with stored player ID

---

## Phase 1 Limits

- **Max Players/Room**: 8 (configurable)
- **Max Rooms**: Limited by server RAM; ~50 for MVP on small hosting tier
- **Game**: Monopoly only
