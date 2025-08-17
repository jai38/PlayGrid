# 🤝 Contributing to PlayGrid

Thank you for your interest in contributing to PlayGrid! 🎉 As an open-source project, we welcome contributions from developers, designers, game enthusiasts, and community members of all skill levels.

## 🌟 Ways to Contribute

### 🎮 Game Development
- **Implement New Games**: Add classic board games or create original ones
- **Game Features**: Enhance existing games with new features or variants
- **Game Balance**: Help balance gameplay mechanics and rules
- **Game UI/UX**: Design and implement game-specific interfaces

### 💻 Platform Development  
- **Backend Features**: Improve server performance, add new APIs
- **Frontend Components**: Create reusable UI components
- **Real-time Features**: Enhance Socket.IO implementation
- **Mobile Support**: Improve responsive design and PWA features

### 🎨 Design & User Experience
- **UI/UX Design**: Design interfaces, improve user flows
- **Visual Assets**: Create game pieces, boards, animations
- **Accessibility**: Make PlayGrid accessible to all users
- **Branding**: Help establish visual identity

### 📚 Documentation & Community
- **Documentation**: Write guides, tutorials, API documentation
- **Testing**: Write tests, perform QA testing
- **Bug Reports**: Find and report issues
- **Community Support**: Help other developers and users

---

## 🚀 Getting Started

### 1. Set Up Development Environment

**Prerequisites:**
- Node.js 20+
- Git
- Code editor (VS Code recommended)

**Quick Setup:**
```bash
# Clone the repository
git clone https://github.com/PlayGridAI/PlayGrid.git
cd PlayGrid

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start development servers
cd backend && npm run dev     # Terminal 1
cd frontend && npm run dev    # Terminal 2
```

**Verify Setup:**
- Backend: http://localhost:4000/health
- Frontend: http://localhost:5173

### 2. Understand the Architecture

**Repository Structure:**
```
PlayGrid/
├── backend/          # Node.js + Express + Socket.IO
├── frontend/         # React + TypeScript + Vite
├── docs/            # Comprehensive documentation
├── .github/         # GitHub workflows and templates
└── README.md        # Project overview
```

**Key Technologies:**
- **Backend**: TypeScript, Node.js, Express, Socket.IO
- **Frontend**: TypeScript, React, Vite, TailwindCSS
- **Real-time**: Socket.IO for multiplayer communication
- **Testing**: Jest, Playwright (planned)

### 3. Explore the Codebase

**Start with these files:**
```bash
# Backend entry points
backend/src/server.ts         # Main server
backend/src/socket.ts         # Socket event handling
backend/src/games/            # Game implementations

# Frontend entry points  
frontend/src/App.tsx          # Main app component
frontend/src/pages/           # Page components
frontend/src/games/           # Game-specific components
```

**Key Concepts:**
- **Rooms**: Players join rooms before starting games
- **Games**: Each game implements the `IGame` interface
- **Socket Events**: Real-time communication between client/server
- **Game State**: Centralized state management for each game

---

## 🎯 Contribution Workflows

### For New Contributors

**1. Start with "Good First Issues"**
- Look for issues labeled `good first issue`
- These are beginner-friendly tasks
- Ask questions in the issue comments

**2. Documentation Improvements**
- Fix typos or unclear explanations
- Add examples to existing docs
- Translate documentation to other languages

**3. UI Enhancements**
- Improve button styles or layouts
- Add loading states or animations
- Fix responsive design issues

### For Experienced Developers

**1. Game Implementation**
- Add new board games following the `IGame` interface
- Implement complex game mechanics
- Add AI opponents for existing games

**2. Platform Features**
- Enhance real-time performance
- Add advanced authentication
- Implement analytics or monitoring

**3. Architecture Improvements**
- Optimize database queries
- Improve error handling
- Add comprehensive testing

---

## 🎮 Adding a New Game

### Step 1: Game Planning

**Before coding, document your game:**
```markdown
## Game: [Name]
- **Players**: 2-6
- **Duration**: ~30 minutes  
- **Description**: Brief game description
- **Key Mechanics**: List main game mechanics
- **Victory Conditions**: How players win
- **Special Features**: Unique aspects of this game
```

**Create an issue with your game proposal for discussion.**

### Step 2: Backend Implementation

**1. Create Game Interface Implementation**
```typescript
// backend/src/games/mygame/MyGame.ts
import { IGame, GameAction, GameState } from '../IGame';

export interface MyGameState extends GameState {
    // Add game-specific state properties
    gamePhase: 'SETUP' | 'PLAYING' | 'FINISHED';
    specialData: any;
}

export class MyGame implements IGame {
    gameId = 'mygame';
    
    initGame(roomId: string, players: Player[]): MyGameState {
        return {
            players: players.map(p => ({
                ...p,
                // Add game-specific player properties
                score: 0,
                resources: []
            })),
            currentTurnPlayerId: players[0].playerId,
            gamePhase: 'SETUP',
            specialData: this.initializeSpecialData()
        };
    }
    
    validateAction(action: GameAction, state: MyGameState): boolean {
        // Validate if the action is legal
        return true;
    }
    
    handleAction(roomId: string, action: GameAction, state: MyGameState): MyGameState {
        // Process the action and return new state
        const newState = { ...state };
        
        switch (action.type) {
            case 'MY_ACTION':
                // Handle specific action
                break;
            default:
                break;
        }
        
        return newState;
    }
}
```

**2. Register the Game**
```typescript
// backend/src/games/GameManager.ts
import { MyGame } from './mygame/MyGame';

constructor(io: Server) {
    // ... existing code
    this.registerGame(new MyGame());
}
```

### Step 3: Frontend Implementation

**1. Create Game Component**
```typescript
// frontend/src/games/mygame/MyGameComponent.tsx
import React, { useState, useCallback } from 'react';
import { useSocket } from '../../hooks/useSocket';

interface MyGameProps {
    roomId: string;
}

export default function MyGameComponent({ roomId }: MyGameProps) {
    const [gameState, setGameState] = useState(null);
    
    const setupGameEvents = useCallback((socket) => {
        socket.on('game:stateUpdate', (newState) => {
            setGameState(newState);
        });
        
        return () => {
            socket.off('game:stateUpdate');
        };
    }, []);
    
    const socket = useSocket(setupGameEvents);
    
    const handleAction = (actionType: string, payload?: any) => {
        socket?.emit('game:action', {
            roomId,
            gameId: 'mygame',
            action: {
                type: actionType,
                payload,
                playerId: getCurrentPlayerId()
            }
        });
    };
    
    return (
        <div className="game-container">
            <GameBoard gameState={gameState} />
            <ActionPanel onAction={handleAction} />
        </div>
    );
}
```

**2. Add Game to Router**
```typescript
// frontend/src/pages/GameLoader.tsx
case 'mygame':
    const { default: MyGameComponent } = await import('../games/mygame/MyGameComponent');
    setGameComponent(() => MyGameComponent);
    break;
```

### Step 4: Testing Your Game

**1. Manual Testing Checklist**
- [ ] Game creates successfully with 2+ players
- [ ] All players see synchronized game state
- [ ] Actions are processed correctly
- [ ] Turn order works properly
- [ ] Game ends correctly
- [ ] Players can reconnect mid-game

**2. Write Unit Tests**
```typescript
// backend/src/games/mygame/__tests__/MyGame.test.ts
import { MyGame } from '../MyGame';

describe('MyGame', () => {
    let game: MyGame;
    
    beforeEach(() => {
        game = new MyGame();
    });
    
    it('should initialize game state correctly', () => {
        const players = [
            { playerId: '1', name: 'Player 1' },
            { playerId: '2', name: 'Player 2' }
        ];
        
        const state = game.initGame('room1', players);
        
        expect(state.players).toHaveLength(2);
        expect(state.gamePhase).toBe('SETUP');
        expect(state.currentTurnPlayerId).toBe('1');
    });
});
```

---

## 📝 Code Standards & Guidelines

### TypeScript Guidelines

**1. Use Strict Types**
```typescript
// ✅ Good
interface Player {
    playerId: string;
    name: string;
    isHost: boolean;
}

// ❌ Avoid
const player: any = { id: '123', name: 'John' };
```

**2. Consistent Naming**
```typescript
// ✅ Good - camelCase for variables/functions
const currentPlayer = getCurrentPlayer();
const handlePlayerAction = () => {};

// ✅ Good - PascalCase for types/interfaces
interface GameState {}
class CoupGame {}

// ✅ Good - UPPER_CASE for constants
const MAX_PLAYERS = 8;
const DEFAULT_TIMEOUT = 30000;
```

**3. Document Complex Functions**
```typescript
/**
 * Calculates the optimal move for an AI player using Monte Carlo Tree Search
 * @param gameState Current game state
 * @param playerId ID of the AI player
 * @param difficulty AI difficulty level (1-10)
 * @returns The best action to take
 */
function calculateAIMove(
    gameState: GameState, 
    playerId: string, 
    difficulty: number
): GameAction {
    // Implementation...
}
```

### React Component Guidelines

**1. Use Functional Components with Hooks**
```typescript
// ✅ Good
export function PlayerList({ players, onPlayerClick }: PlayerListProps) {
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
    
    return (
        <div className="player-list">
            {players.map(player => (
                <PlayerCard 
                    key={player.playerId}
                    player={player}
                    isSelected={selectedPlayer === player.playerId}
                    onClick={() => onPlayerClick(player.playerId)}
                />
            ))}
        </div>
    );
}
```

**2. Extract Custom Hooks for Logic**
```typescript
// ✅ Good - Custom hook for game logic
function useGameActions(socket: Socket, roomId: string) {
    const performAction = useCallback((action: GameAction) => {
        socket?.emit('game:action', {
            roomId,
            action
        });
    }, [socket, roomId]);
    
    return { performAction };
}
```

**3. Use Proper PropTypes**
```typescript
interface ComponentProps {
    requiredProp: string;
    optionalProp?: number;
    children: React.ReactNode;
    onAction: (action: string) => void;
}
```

### CSS/Styling Guidelines

**1. Use TailwindCSS Classes**
```typescript
// ✅ Good - Utility classes
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
    Click me
</button>

// ✅ Good - Component-specific styles when needed
<div className="game-board relative w-full h-96 bg-green-100 border-2 border-green-500">
    {/* Game content */}
</div>
```

**2. Responsive Design**
```typescript
// ✅ Good - Mobile-first responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Responsive grid */}
</div>
```

---

## 🔄 Development Workflow

### Branch Strategy

**Branch Naming:**
```bash
# Features
feature/add-catan-game
feature/improve-socket-reconnection
feature/player-statistics

# Bug fixes  
fix/coup-challenge-bug
fix/mobile-layout-issue

# Documentation
docs/api-reference
docs/game-implementation-guide

# Refactoring
refactor/game-state-management
refactor/component-structure
```

### Commit Messages

**Format:**
```
type(scope): brief description

Longer description if needed

Fixes #123
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(games): add Catan board game implementation

- Implement resource management system
- Add dice rolling mechanics  
- Create trading interface
- Add development cards

Fixes #45

fix(socket): resolve reconnection timeout issue

The reconnection logic wasn't properly clearing old timers,
causing memory leaks and connection issues.

Fixes #78

docs(api): add Socket.IO event documentation

Add comprehensive documentation for all Socket.IO events
including request/response payloads and examples.
```

### Pull Request Process

**1. Before Creating PR:**
- [ ] Code follows style guidelines
- [ ] All tests pass locally
- [ ] Documentation is updated
- [ ] Manual testing completed
- [ ] No console errors or warnings

**2. PR Description Template:**
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing (if UI changes)

## Screenshots (if applicable)
Add screenshots of UI changes.

## Checklist
- [ ] Code follows project guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

**3. Review Process:**
- All PRs require at least one review
- Maintainers will review within 48 hours
- Address feedback and re-request review
- PRs are squashed and merged

---

## 🧪 Testing Guidelines

### Unit Testing

**Backend Tests:**
```typescript
// games/__tests__/CoupGame.test.ts
describe('CoupGame', () => {
    describe('handleAction', () => {
        it('should process INCOME action correctly', () => {
            const game = new CoupGame();
            const initialState = createTestGameState();
            
            const action: GameAction = {
                type: 'INCOME',
                playerId: 'player1'
            };
            
            const newState = game.handleAction('room1', action, initialState);
            const player = newState.players.find(p => p.playerId === 'player1');
            
            expect(player.coins).toBe(initialState.players[0].coins + 1);
        });
    });
});
```

**Frontend Tests:**
```typescript
// components/__tests__/Button.test.tsx
describe('Button', () => {
    it('calls onClick when clicked', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Test</Button>);
        
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
```

### Integration Testing

**Socket.IO Tests:**
```typescript
describe('Game Socket Events', () => {
    it('should handle complete game flow', async () => {
        const client1 = io('http://localhost:4000');
        const client2 = io('http://localhost:4000');
        
        // Test room creation, joining, and game start
        const roomId = await createRoom(client1, 'Test Room');
        await joinRoom(client2, roomId);
        await startGame(client1, roomId, 'coup');
        
        // Verify both clients receive game state
        expect(await getGameState(client1)).toBeDefined();
        expect(await getGameState(client2)).toBeDefined();
    });
});
```

---

## 🛠️ Debugging & Troubleshooting

### Common Development Issues

**1. Socket Connection Issues**
```bash
# Check if backend is running
curl http://localhost:4000/health

# Enable Socket.IO debug logs
DEBUG=socket.io:* npm run dev

# Check browser console for connection errors
```

**2. Game State Synchronization**
```typescript
// Add debug logging in game components
useEffect(() => {
    console.log('Game state updated:', gameState);
}, [gameState]);

// Check server logs for action processing
console.log('Processing action:', action, 'Current state:', state);
```

**3. Build Issues**
```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Check for TypeScript errors
npm run build
```

### Development Tools

**Recommended VS Code Extensions:**
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Prettier - Code formatter
- ESLint
- Tailwind CSS IntelliSense
- Auto Rename Tag

**Browser DevTools:**
- React Developer Tools
- Redux DevTools (if using Redux)
- Network tab for Socket.IO debugging

---

## 🏆 Recognition & Rewards

### Contributor Levels

**🥉 Bronze Contributors (1-5 contributions)**
- Listed in CONTRIBUTORS.md
- Discord contributor role
- Early access to new features

**🥈 Silver Contributors (6-15 contributions)**
- Featured on project website
- Input on roadmap planning
- Exclusive contributor swag

**🥇 Gold Contributors (16+ contributions)**
- Maintainer privileges
- Direct commit access
- PlayGrid conference speaking opportunities

### Hall of Fame

Our top contributors are recognized in the [Hall of Fame](./HALL_OF_FAME.md) with:
- Profile highlighting their contributions
- Links to their work and social profiles
- Special thanks for their impact on PlayGrid

---

## 📞 Getting Help

### Communication Channels

**💬 Discord Server**
- Real-time chat with other contributors
- Game nights and community events
- Direct access to maintainers
- Join: [discord.gg/playgrid](https://discord.gg/playgrid)

**📧 GitHub Discussions**
- Feature proposals and long-form discussions
- Q&A for development questions
- Community showcase
- Visit: [GitHub Discussions](https://github.com/PlayGridAI/PlayGrid/discussions)

**🐛 GitHub Issues**
- Bug reports with templates
- Feature requests
- Task coordination
- Create: [New Issue](https://github.com/PlayGridAI/PlayGrid/issues/new)

### Mentorship Program

**For New Contributors:**
- Paired with experienced contributors
- Guided through first contributions
- Regular check-ins and support
- Apply: Contact maintainers on Discord

**For Game Developers:**
- Specialized mentorship for game implementation
- Code reviews and architecture guidance
- Game design consultation
- Apply: Create issue with `mentorship` label

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a friendly, safe, and welcoming environment for all contributors, regardless of experience level, gender identity, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, nationality, or other characteristics.

### Expected Behavior

- **Be respectful** of differing viewpoints and experiences
- **Be collaborative** and helpful to other contributors
- **Be patient** with newcomers and those learning
- **Give credit** where credit is due
- **Focus on the project** and avoid personal conflicts

### Unacceptable Behavior

- Harassment, intimidation, or discrimination
- Offensive comments or inappropriate content
- Personal attacks or trolling
- Publishing private information without permission
- Any conduct that creates an unwelcoming environment

### Enforcement

Community leaders will:
- Remove inappropriate comments or content
- Provide warnings for first-time violations
- Temporarily or permanently ban repeat offenders
- Make decisions transparently and fairly

Report violations to: [conduct@playgrid.app](mailto:conduct@playgrid.app)

---

## 🎉 Thank You!

Your contributions make PlayGrid better for everyone. Whether you're fixing a typo, implementing a new game, or helping other developers, every contribution matters.

**Ready to contribute?** Check out our [good first issues](https://github.com/PlayGridAI/PlayGrid/labels/good%20first%20issue) and join our community!

---

**Next Steps:**
- 📖 Read the [Technical Architecture](./docs/architecture.md)
- 🚀 Follow the [Setup Guide](./docs/setup-guide.md)  
- 🎮 Check the [Roadmap](./docs/roadmap.md) for upcoming features
- 💬 Join our [Discord](https://discord.gg/playgrid)

**Happy coding! 🚀**
