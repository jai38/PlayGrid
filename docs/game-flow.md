# 🎯 PlayGrid Game Flow Documentation

## Overview

This document provides a comprehensive walkthrough of the game flow in PlayGrid, from initial connection to game completion. It includes sequence diagrams, state transitions, and detailed explanations of each phase.

## 🔄 Complete User Journey

### 1. Initial Connection & Setup

```mermaid
sequenceDiagram
    participant U as User Browser
    participant F as Frontend App
    participant S as Socket Server
    participant RM as Room Manager
    
    U->>F: Visit PlayGrid URL
    F->>F: Load React App
    F->>S: Socket.IO Connect
    S-->>F: Connection Established
    
    Note over F: Check localStorage for existing session
    
    alt Existing Session Found
        F->>S: Reconnect Request
        S->>RM: Validate Session
        RM-->>S: Session Valid/Invalid
        S-->>F: Reconnection Result
        
        alt Valid Session
            F->>F: Redirect to Room/Game
        else Invalid Session
            F->>F: Show Home Page
        end
    else No Existing Session
        F->>F: Show Home Page
    end
```

### 2. Room Creation Flow

```mermaid
sequenceDiagram
    participant P as Player
    participant F as Frontend
    participant S as Socket Server
    participant RM as Room Manager
    
    P->>F: Enter Nickname & Room Details
    F->>F: Validate Input
    F->>S: createRoom Event
    
    Note over S: { playerName, roomName, isPrivate, password }
    
    S->>RM: Create New Room
    RM->>RM: Generate Room ID
    RM->>RM: Add Host Player
    RM-->>S: Room Created Successfully
    
    S->>S: Join Socket to Room Channel
    S-->>F: Room Creation Response
    
    Note over F: { success: true, roomId, player, room }
    
    F->>F: Store Room Data in localStorage
    F->>F: Navigate to Room Page
    F->>F: Display Room Interface
```

### 3. Room Joining Flow

```mermaid
sequenceDiagram
    participant P as Player
    participant F as Frontend
    participant S as Socket Server
    participant RM as Room Manager
    participant O as Other Players
    
    P->>F: Click Join Room / Enter Room ID
    F->>S: joinRoom Event
    
    Note over S: { roomId, playerName, playerId?, password? }
    
    S->>RM: Validate Room & Player
    
    alt Room Exists & Has Space
        RM->>RM: Add Player to Room
        RM-->>S: Player Added Successfully
        
        S->>S: Join Socket to Room Channel
        S-->>F: Join Success Response
        S->>O: Broadcast playerJoined Event
        
        F->>F: Store Room Data
        F->>F: Navigate to Room Page
        O->>O: Update Player List
        
    else Room Full/Not Found/Wrong Password
        RM-->>S: Join Failed
        S-->>F: Error Response
        F->>F: Display Error Message
    end
```

### 4. Game Initialization Flow

```mermaid
sequenceDiagram
    participant H as Host Player
    participant P as Other Players  
    participant F as Frontend
    participant S as Socket Server
    participant GM as Game Manager
    participant GI as Game Instance
    
    H->>F: Select Game & Click Start
    F->>S: game:start Event
    
    Note over S: { roomId, gameId }
    
    S->>GM: Start Game Request
    GM->>GM: Validate Players & Game
    GM->>GI: Initialize Game State
    
    Note over GI: Create initial game state with players
    
    GI-->>GM: Initial Game State
    GM->>GM: Store Game Instance
    GM-->>S: Game Started Successfully
    
    S->>F: Broadcast game:started Event
    S->>P: Broadcast game:started Event
    
    Note over F,P: { gameId, roomId, initialState }
    
    F->>F: Navigate to Game Page
    P->>P: Navigate to Game Page
    F->>F: Load Game Component
    P->>P: Load Game Component
```

## 🃏 Coup Game Flow Example

### Game Setup & Initial State

```mermaid
stateDiagram-v2
    [*] --> GameStarted
    GameStarted --> PlayerTurn
    PlayerTurn --> ActionSelected
    ActionSelected --> PendingAction
    PendingAction --> ChallengeWindow
    PendingAction --> BlockWindow
    PendingAction --> ActionResolved
    ChallengeWindow --> ChallengeResolution
    BlockWindow --> BlockResolution
    ChallengeResolution --> ActionResolved
    BlockResolution --> ActionResolved
    ActionResolved --> PlayerTurn
    ActionResolved --> GameEnded
    GameEnded --> [*]
```

### Detailed Coup Action Flow

```mermaid
sequenceDiagram
    participant P1 as Current Player
    participant P2 as Target Player
    participant P3 as Other Players
    participant S as Server
    participant G as Coup Game Logic
    
    Note over P1: Player's Turn - Choose Action
    
    P1->>S: Game Action (e.g., ASSASSINATE)
    S->>G: Process Action
    
    alt Action Requires Character (e.g., Assassin)
        G->>G: Create Pending Action
        G-->>S: Pending Action State
        S->>P1: Action Pending
        S->>P2: Action Pending (you're targeted)
        S->>P3: Action Pending (can challenge)
        
        Note over P2,P3: Challenge/Block Window (10 seconds)
        
        alt Someone Challenges
            P3->>S: CHALLENGE Action
            S->>G: Process Challenge
            G->>G: Resolve Challenge
            
            alt Challenge Successful
                G->>G: Claimed Player Loses Influence
                G-->>S: Challenge Won
                S->>P1: Lost Influence
                S->>P3: Challenge Successful
            else Challenge Failed
                G->>G: Challenger Loses Influence
                G->>G: Shuffle Card Back to Deck
                G-->>S: Challenge Lost
                S->>P3: Lost Influence
                S->>P1: Challenge Failed
                
                Note over G: Continue with original action
            end
            
        else Someone Blocks
            P2->>S: BLOCK Action
            S->>G: Process Block
            
            alt Block Can Be Challenged
                Note over P1,P3: New Challenge Window
                P1->>S: CHALLENGE Block
                S->>G: Process Block Challenge
                
                alt Block Challenge Successful
                    G->>G: Blocker Loses Influence
                    G-->>S: Block Invalid
                    Note over G: Continue with original action
                else Block Challenge Failed
                    G->>G: Block Challenger Loses Influence
                    G-->>S: Block Successful
                    Note over G: Action blocked, end turn
                end
            else Block Cannot Be Challenged
                G-->>S: Action Blocked
                Note over G: Action blocked, end turn
            end
            
        else No Challenge/Block
            Note over G: Timer expires, resolve action
            G->>G: Execute Action
            
            alt Action Eliminates Player
                G->>G: Target Loses Influence
                G-->>S: Player Eliminated
                S->>P2: You were eliminated
            else Other Effect
                G->>G: Apply Action Effect
                G-->>S: Action Applied
            end
        end
        
    else Action Cannot Be Challenged (Income, Coup)
        G->>G: Execute Immediately
        G-->>S: Action Applied
    end
    
    G->>G: Check Win Condition
    
    alt Game Over
        G-->>S: Game Ended
        S->>P1: Game Over
        S->>P2: Game Over  
        S->>P3: Game Over
    else Game Continues
        G->>G: Advance Turn
        G-->>S: Next Player's Turn
        S->>P1: Turn Updated
        S->>P2: Turn Updated
        S->>P3: Turn Updated
    end
```

### Coup Card Loss Flow

```mermaid
sequenceDiagram
    participant P as Player
    participant F as Frontend
    participant S as Server
    participant G as Game Logic
    
    Note over P: Player must lose influence card
    
    G->>G: Trigger Card Loss
    G-->>S: Player Must Choose Card
    S->>F: Show Card Selection Modal
    
    F->>F: Display LoseCardModal
    
    Note over F: Show player's influence cards
    
    P->>F: Select Card to Lose
    F->>S: chooseCardToLose Event
    
    Note over S: { cardIndex, playerId }
    
    S->>G: Process Card Loss
    G->>G: Move Card to Revealed
    G->>G: Check if Player Eliminated
    
    alt Player Has No Cards Left
        G->>G: Mark Player as Dead
        G-->>S: Player Eliminated
        S->>F: Show Elimination Message
        
    else Player Still Alive
        G-->>S: Card Lost Successfully
        S->>F: Update Game State
    end
    
    G->>G: Check Win Condition
    
    alt Only One Player Left
        G-->>S: Game Over
        S->>F: Show Winner Screen
    else Game Continues
        G->>G: Continue Game Flow
        G-->>S: Updated Game State
        S->>F: Update UI
    end
```

## 🎲 Turn Management System

### Turn Progression Logic

```mermaid
flowchart TD
    A[Current Player's Turn] --> B{Action Selected?}
    B -->|Yes| C{Requires Challenge/Block?}
    B -->|No| D[Wait for Action]
    
    C -->|Yes| E[Start Timer]
    C -->|No| F[Execute Immediately]
    
    E --> G{Challenge/Block Received?}
    G -->|Yes| H[Resolve Challenge/Block]
    G -->|No| I[Timer Expires]
    
    H --> J{Action Blocked?}
    I --> F
    
    J -->|Yes| K[End Turn]
    J -->|No| F
    
    F --> L{Player Eliminated?}
    L -->|Yes| M[Check Win Condition]
    L -->|No| N[Apply Effects]
    
    N --> K
    K --> O[Advance to Next Player]
    M --> P{Game Over?}
    P -->|Yes| Q[End Game]
    P -->|No| O
    
    O --> R[Update UI]
    R --> A
    Q --> S[Show Results]
```

### Timer Management

**Challenge/Block Windows:**
```typescript
// 10-second window for challenges/blocks
const CHALLENGE_WINDOW_MS = 10000;

// Server-side timer management
function startChallengeTimer(roomId: string, actionId: string) {
    const timer = setTimeout(() => {
        resolveAction(roomId, actionId);
    }, CHALLENGE_WINDOW_MS);
    
    challengeTimers.set(actionId, timer);
}

function cancelChallengeTimer(actionId: string) {
    const timer = challengeTimers.get(actionId);
    if (timer) {
        clearTimeout(timer);
        challengeTimers.delete(actionId);
    }
}
```

**Client-side countdown:**
```typescript
// Frontend countdown display
function useCountdown(initialSeconds: number) {
    const [seconds, setSeconds] = useState(initialSeconds);
    
    useEffect(() => {
        if (seconds > 0) {
            const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [seconds]);
    
    return seconds;
}
```

## 🔄 Reconnection Flow

### Player Reconnection Process

```mermaid
sequenceDiagram
    participant P as Player
    participant F as Frontend  
    participant S as Server
    participant RM as Room Manager
    participant GM as Game Manager
    
    Note over P: Player refreshes/reconnects
    
    F->>F: Check localStorage for session
    F->>S: reconnectToRoom Event
    
    Note over S: { roomId, playerId, playerName }
    
    S->>RM: Find Player in Room
    
    alt Player Found in Room
        RM->>RM: Update Socket ID
        RM->>RM: Clear Disconnect Timer
        RM-->>S: Reconnection Successful
        
        S->>GM: Check Active Game
        
        alt Game Active
            GM-->>S: Current Game State
            S-->>F: Reconnection + Game State
            
            Note over F: { success: true, hasActiveGame: true, gameState }
            
            F->>F: Navigate to Game Page
            F->>F: Restore Game UI
            
        else No Active Game
            S-->>F: Reconnection Success
            
            Note over F: { success: true, hasActiveGame: false }
            
            F->>F: Navigate to Room Page
            F->>F: Restore Room UI
        end
        
        S->>P: Broadcast playerReconnected
        
    else Player Not Found
        RM-->>S: Reconnection Failed
        S-->>F: Error Response
        F->>F: Clear localStorage
        F->>F: Navigate to Home
    end
```

### Game State Synchronization

When a player reconnects mid-game:

```typescript
// Server sends complete game state
const gameState = gameManager.getGameState(roomId);
const playerState = gameState.players.find(p => p.playerId === playerId);

socket.emit('game:stateSync', {
    gameState,
    playerState,
    currentTurn: gameState.currentTurnPlayerId,
    pendingActions: gameState.pendingActions
});
```

```typescript
// Client receives and applies state
socket.on('game:stateSync', ({ gameState, playerState, currentTurn, pendingActions }) => {
    setGameState(gameState);
    setCurrentPlayer(playerState);
    setCurrentTurn(currentTurn);
    
    // Show any pending modals/actions
    if (pendingActions?.requiresPlayerChoice) {
        showPendingActionModal(pendingActions);
    }
});
```

## 📊 State Management Throughout Game Flow

### Client State Hierarchy

```mermaid
graph TB
    subgraph "Application State"
        AppState[App Level State]
        RouteState[Route Level State]
        ComponentState[Component State]
    end
    
    subgraph "Persistent State"
        LocalStorage[Browser Storage]
        SessionStorage[Session Storage]
    end
    
    subgraph "Server State"
        RoomState[Room State]
        GameState[Game State]
        PlayerState[Player State]
    end
    
    AppState --> RouteState
    RouteState --> ComponentState
    
    ComponentState <--> LocalStorage
    ComponentState <--> SessionStorage
    
    ComponentState <--> RoomState
    RoomState <--> GameState
    GameState <--> PlayerState
```

### State Synchronization Patterns

**Optimistic Updates:**
```typescript
// Immediate UI update, then sync with server
const handlePlayerAction = (action: GameAction) => {
    // 1. Optimistic update
    const newState = applyOptimisticUpdate(gameState, action);
    setGameState(newState);
    
    // 2. Send to server
    socket.emit('game:action', action);
    
    // 3. Server will send authoritative update
};

socket.on('game:stateUpdate', (authoritativeState) => {
    // Always trust server state
    setGameState(authoritativeState);
});
```

**Conflict Resolution:**
```typescript
// Handle state conflicts gracefully
socket.on('game:actionRejected', ({ reason, currentState }) => {
    // Revert optimistic update
    setGameState(currentState);
    
    // Show user-friendly error
    showNotification({
        type: 'error',
        message: getActionRejectionMessage(reason)
    });
});
```

## 🎮 Game-Specific Flow Variations

### Monopoly Game Flow (Planned)

```mermaid
stateDiagram-v2
    [*] --> Setup
    Setup --> RollDice
    RollDice --> Moving
    Moving --> PropertyLanded
    PropertyLanded --> PropertyAction
    PropertyAction --> EndTurn
    
    PropertyAction --> BuyProperty
    PropertyAction --> PayRent
    PropertyAction --> DrawCard
    PropertyAction --> PayTax
    
    BuyProperty --> EndTurn
    PayRent --> EndTurn
    DrawCard --> CardAction
    PayTax --> EndTurn
    CardAction --> EndTurn
    
    EndTurn --> CheckBankruptcy
    CheckBankruptcy --> RollDice
    CheckBankruptcy --> GameOver
    GameOver --> [*]
```

### Custom Game Integration

```typescript
// Game registration system
interface GameDefinition {
    gameId: string;
    name: string;
    minPlayers: number;
    maxPlayers: number;
    estimatedDuration: number;
    component: React.ComponentType<GameProps>;
    rules: GameRules;
}

// Register new games
const gameRegistry = new Map<string, GameDefinition>();

function registerGame(definition: GameDefinition) {
    gameRegistry.set(definition.gameId, definition);
}

// Dynamic game loading
async function loadGame(gameId: string) {
    const definition = gameRegistry.get(gameId);
    if (!definition) {
        throw new Error(`Game ${gameId} not found`);
    }
    
    return definition;
}
```

## 🚨 Error Handling & Edge Cases

### Network Disconnection Handling

```mermaid
sequenceDiagram
    participant P as Player
    participant F as Frontend
    participant S as Server
    participant RM as Room Manager
    
    Note over P,S: Player loses connection
    
    S->>RM: Player Disconnected Event
    RM->>RM: Start Disconnect Timer (5 minutes)
    RM->>RM: Mark Player as Disconnected
    S->>P: Broadcast playerDisconnected
    
    Note over F: Show "Attempting to reconnect..."
    
    alt Reconnects Within Grace Period
        F->>S: Reconnection Attempt
        S->>RM: Cancel Disconnect Timer
        RM->>RM: Mark Player as Connected
        S->>P: Broadcast playerReconnected
        Note over F: Hide reconnection message
        
    else Grace Period Expires
        RM->>RM: Remove Player from Room
        S->>P: Broadcast playerLeft
        Note over RM: Game continues with remaining players
    end
```

### Game State Corruption Recovery

```typescript
// Server-side validation and recovery
function validateGameState(state: GameState): boolean {
    // Validate player counts, card counts, etc.
    const isValid = checkPlayerIntegrity(state) && 
                   checkCardIntegrity(state) &&
                   checkTurnIntegrity(state);
    
    if (!isValid) {
        logStateCorruption(state);
        return false;
    }
    
    return true;
}

function recoverFromCorruption(roomId: string) {
    // Attempt to restore from last known good state
    const lastGoodState = getLastKnownGoodState(roomId);
    if (lastGoodState) {
        setGameState(roomId, lastGoodState);
        broadcastStateReset(roomId);
    } else {
        // Last resort: end game gracefully
        endGameWithError(roomId, "Game state corrupted");
    }
}
```

---

**Next: [Enhanced Setup Guide](./setup-guide.md)**