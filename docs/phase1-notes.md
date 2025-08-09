# PlayGrid – Phase 1 Notes

## Decisions

- **Monorepo**: Yes, `frontend` + `backend` + `docs`
- **TypeScript**: Yes, for both backend & frontend
- **Socket.IO**: WebSocket layer
- **In-Memory Store**: For MVP; Redis optional later
- **Room Persistence**: Store nickname & room ID in LocalStorage to allow reconnect
- **Animations**: Basic (Framer Motion) for smooth UI

## Todo

- [ ] Backend: Basic Socket.IO server with room handling
- [ ] Frontend: Connect to server, create/join room
- [ ] Docs: Add Monopoly rules customization (Phase 2)
- [ ] Add basic lobby UI
- [ ] Test reconnect logic
