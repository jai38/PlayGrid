# PlayGrid – Socket.IO Event Definitions (Phase 1)

All events use **camelCase** names. Payloads are typed in TypeScript.

---

## Connection Flow

### `connect`

- Sent automatically by Socket.IO when connected.

### `disconnect`

- Sent automatically when user loses connection.

---

## Lobby Events

### `createRoom`

**Client → Server**

```ts
{
  roomName: string;
  isPrivate: boolean;
  password?: string;
  playerName: string;
}
```

**Server → Client**

```ts
{
  roomId: string;
  players: Player[];
}
```

### `joinRoom`

**Client → Server**

```ts
{
  roomId: string;
  playerName: string;
  password?: string;
}

```

**Server → Client (success)**

```ts
{
  roomId: string;
  players: Player[];
}
```

## Room Events

### `playerJoined`

**Server → All Clients in Room**

```ts
{
  player: Player;
}
```

### `playerLeft`

**Server → All Clients in Room**

```ts
{
  playerId: string;
}
```

### `chatMessage`

**Client → Server**

```ts
{
  roomId: string;
  sender: string;
  message: string;
}
```

**Server → All Clients in Room**

```ts
{
  sender: string;
  message: string;
  timestamp: number;
}
```

**Types**

```ts
type Player = {
  id: string;
  name: string;
  isHost: boolean;
};
```
