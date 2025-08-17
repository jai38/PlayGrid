# 🏛️ PlayGrid Technical Architecture

## System Overview

PlayGrid is a modern, real-time multiplayer board game platform built with a microservices-inspired architecture. The system is designed for scalability, maintainability, and extensibility, supporting multiple games and thousands of concurrent players.

## 🏗️ High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web Browser]
        Mobile[Mobile Browser]
        PWA[PWA App]
    end
    
    subgraph "CDN/Edge"
        CDN[Vercel CDN]
    end
    
    subgraph "Frontend (React)"
        FE[Frontend Application]
        Router[React Router]
        Socket[Socket.IO Client]
        State[State Management]
    end
    
    subgraph "Backend Services"
        API[Express API Server]
        WS[WebSocket Server]
        GameEngine[Game Engine]
        RoomMgr[Room Manager]
    end
    
    subgraph "Data Layer"
        Memory[In-Memory Store]
        Redis[Redis Cache]
        DB[(Future Database)]
    end
    
    Web --> CDN
    Mobile --> CDN
    PWA --> CDN
    CDN --> FE
    
    FE --> Router
    FE --> Socket
    FE --> State
    
    Socket <--> WS
    FE --> API
    
    WS --> GameEngine
    WS --> RoomMgr
    API --> RoomMgr
    
    GameEngine --> Memory
    RoomMgr --> Memory
    Memory --> Redis
    Redis --> DB
```

## 🧩 Component Architecture

### Frontend Architecture

```mermaid
graph TB
    subgraph "React Application"
        App[App.tsx]
        
        subgraph "Pages"
            Home[Home Page]
            Lobby[Lobby Page]
            Room[Room Page]
            Game[Game Page]
        end
        
        subgraph "Components"
            Navbar[Navigation]
            Toast[Notifications]
            Dice[Dice Roller]
            GameBoard[Game Board]
        end
        
        subgraph "Game Components"
            CoupGame[Coup Game]
            MonopolyGame[Monopoly Game]
            GameLoader[Game Loader]
        end
        
        subgraph "Services"
            SocketService[Socket Service]
            GameAPI[Game API]
        end
        
        subgraph "Hooks"
            useSocket[useSocket Hook]
            useGame[useGame Hook]
        end
    end
    
    App --> Home
    App --> Lobby
    App --> Room
    App --> Game
    
    Game --> CoupGame
    Game --> MonopolyGame
    Game --> GameLoader
    
    Pages --> Components
    Components --> Services
    Services --> Hooks
```

### Backend Architecture

```mermaid
graph TB
    subgraph "Express Server"
        Server[Server Entry Point]
        CORS[CORS Middleware]
        Health[Health Check]
    end
    
    subgraph "Socket.IO Server"
        SocketInit[Socket Initialization]
        EventHandlers[Event Handlers]
        
        subgraph "Event Types"
            RoomEvents[Room Events]
            GameEvents[Game Events]
            ChatEvents[Chat Events]
        end
    end
    
    subgraph "Game System"
        GameManager[Game Manager]
        IGame[IGame Interface]
        
        subgraph "Game Implementations"
            Coup[Coup Game]
            Monopoly[Monopoly Game]
        end
    end
    
    subgraph "Room System"
        RoomManager[Room Manager]
        PlayerManager[Player Manager]
        ReconnectLogic[Reconnect Logic]
    end
    
    Server --> SocketInit
    SocketInit --> EventHandlers
    EventHandlers --> RoomEvents
    EventHandlers --> GameEvents
    EventHandlers --> ChatEvents
    
    GameEvents --> GameManager
    GameManager --> IGame
    IGame --> Coup
    IGame --> Monopoly
    
    RoomEvents --> RoomManager
    RoomManager --> PlayerManager
    PlayerManager --> ReconnectLogic
```

## 🔄 Data Flow Architecture

### Game State Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant WS as WebSocket Server
    participant GM as Game Manager
    participant GI as Game Instance
    participant RM as Room Manager
    
    C->>WS: Game Action
    WS->>GM: Validate & Process Action
    GM->>GI: Apply Game Logic
    GI->>GI: Update Game State
    GI-->>GM: Return New State
    GM->>RM: Update Room State
    GM->>WS: Broadcast State Update
    WS->>C: Updated Game State
    
    Note over C,RM: Real-time synchronization
```

### Room Management Flow

```mermaid
sequenceDiagram
    participant C1 as Client 1
    participant C2 as Client 2
    participant WS as WebSocket Server
    participant RM as Room Manager
    
    C1->>WS: Create Room
    WS->>RM: Create Room Instance
    RM-->>WS: Room Created
    WS-->>C1: Room Data
    
    C2->>WS: Join Room
    WS->>RM: Add Player to Room
    RM-->>WS: Updated Room Data
    WS->>C1: Player Joined Event
    WS->>C2: Room Data
    
    Note over C1,RM: Real-time room updates
```

## 📊 Component Responsibilities

### Frontend Components

| Component | Responsibility | Key Features |
|-----------|---------------|--------------|
| **App.tsx** | Main application shell | Routing, global state, error boundaries |
| **useSocket** | Socket connection management | Auto-reconnect, event subscription |
| **Room Manager** | Room UI and state | Player list, chat, game controls |
| **Game Loader** | Dynamic game loading | Game selection, initialization |
| **Game Components** | Game-specific UI | Game boards, actions, modals |

### Backend Components

| Component | Responsibility | Key Features |
|-----------|---------------|--------------|
| **Socket Server** | Real-time communication | Event handling, broadcasting |
| **Game Manager** | Game orchestration | Game lifecycle, state management |
| **Room Manager** | Room lifecycle | Creation, joining, cleanup |
| **Game Instances** | Game logic implementation | Rules, validation, state updates |
| **Player Manager** | Player state tracking | Authentication, reconnection |

## 🔌 Event Architecture

### Socket Event Categories

```mermaid
graph LR
    subgraph "Connection Events"
        Connect[connect]
        Disconnect[disconnect]
        Reconnect[reconnect]
    end
    
    subgraph "Room Events"
        CreateRoom[createRoom]
        JoinRoom[joinRoom]
        LeaveRoom[leaveRoom]
        RoomUpdate[room:update]
    end
    
    subgraph "Game Events"
        StartGame[game:start]
        GameAction[game:action]
        GameState[game:state]
        GameEnd[game:end]
    end
    
    subgraph "Chat Events"
        ChatMessage[chat:message]
        ChatHistory[chat:history]
    end
```

### Event Flow Patterns

**Request-Response Pattern:**
```typescript
// Client sends action
socket.emit('game:action', payload, (response) => {
  // Handle server response
});

// Server responds with acknowledgment
callback({ success: true, data: newGameState });
```

**Broadcast Pattern:**
```typescript
// Server broadcasts to all room members
io.to(roomId).emit('game:stateUpdate', gameState);
```

## 🗄️ Data Management

### State Storage Strategy

```mermaid
graph TB
    subgraph "Client State"
        LocalState[Component State]
        LocalStorage[Browser Storage]
        SocketState[Socket State]
    end
    
    subgraph "Server State"
        Memory[In-Memory Maps]
        GameState[Game State Objects]
        RoomState[Room State Objects]
    end
    
    subgraph "Persistence (Future)"
        Redis[Redis Cache]
        Database[PostgreSQL]
    end
    
    LocalState <--> SocketState
    SocketState <--> Memory
    Memory --> GameState
    Memory --> RoomState
    Memory --> Redis
    Redis --> Database
```

### State Synchronization

**Client State Management:**
- React useState/useReducer for UI state
- Socket.IO events for server state synchronization
- LocalStorage for persistence across browser sessions

**Server State Management:**
- In-memory Maps for fast access
- Game instance state isolation
- Cleanup routines for abandoned rooms

## 🏗️ Scalability Considerations

### Current Limitations (Phase 1)
- **Max Players per Room**: 8 (configurable)
- **Max Concurrent Rooms**: ~50 (memory limited)
- **Storage**: In-memory only
- **Single Server Instance**: No horizontal scaling

### Planned Improvements (Phase 2+)

```mermaid
graph TB
    subgraph "Load Balancer"
        LB[Load Balancer]
    end
    
    subgraph "Backend Cluster"
        BE1[Backend Instance 1]
        BE2[Backend Instance 2]
        BE3[Backend Instance N]
    end
    
    subgraph "Shared Storage"
        Redis[Redis Cluster]
        DB[(PostgreSQL)]
    end
    
    LB --> BE1
    LB --> BE2
    LB --> BE3
    
    BE1 --> Redis
    BE2 --> Redis
    BE3 --> Redis
    
    Redis --> DB
```

### Performance Optimizations
- **Connection Pooling**: Efficient socket management
- **Event Batching**: Reduce unnecessary broadcasts
- **State Compression**: Minimize data transfer
- **Lazy Loading**: Dynamic game component loading

## 🔒 Security Architecture

### Authentication & Authorization
- Socket-based session management
- Room-level access control
- Rate limiting for API endpoints
- Input validation and sanitization

### Data Protection
- No persistent user data storage
- Session-based player identification
- Secure WebSocket connections (WSS in production)
- CORS configuration for API security

## 🚀 Technology Stack Details

### Frontend Stack
```typescript
{
  "framework": "React 18",
  "buildTool": "Vite 5",
  "styling": "TailwindCSS 3",
  "language": "TypeScript 5",
  "realtime": "Socket.IO Client 4",
  "routing": "React Router 7",
  "state": "React Built-in Hooks"
}
```

### Backend Stack
```typescript
{
  "runtime": "Node.js 20+",
  "framework": "Express 4",
  "realtime": "Socket.IO 4",
  "language": "TypeScript 5",
  "testing": "Jest",
  "validation": "Custom validators"
}
```

### Development Tools
```typescript
{
  "packageManager": "npm",
  "linting": "ESLint",
  "formatting": "Prettier",
  "bundling": "Vite (Frontend), TSC (Backend)",
  "deployment": "Vercel (Frontend), Railway/Render (Backend)"
}
```

---

**Next: [Backend Details](./backend/README.md)**
