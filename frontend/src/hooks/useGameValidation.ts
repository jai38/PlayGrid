// src/hooks/useGameValidation.ts
import { useMemo } from "react";

// Define available games for validation
const AVAILABLE_GAMES = ["coup", "monopoly"] as const;
type GameId = typeof AVAILABLE_GAMES[number];

interface GameValidation {
    hasRequiredParams: boolean;
    normalizedGameId: GameId | null;
    isValidGame: boolean;
    errorMessage?: string;
}

export function useGameValidation(gameId?: string, roomId?: string): GameValidation {
    return useMemo(() => {
        const hasRequiredParams = Boolean(gameId && roomId);

        if (!hasRequiredParams) {
            return {
                hasRequiredParams: false,
                normalizedGameId: null,
                isValidGame: false,
                errorMessage: "Missing game ID or room ID",
            };
        }

        const normalizedGameId = gameId?.toLowerCase() as GameId;
        const isValidGame = normalizedGameId && AVAILABLE_GAMES.includes(normalizedGameId);

        return {
            hasRequiredParams: true,
            normalizedGameId: isValidGame ? normalizedGameId : null,
            isValidGame,
            errorMessage: isValidGame ? undefined : `Game "${gameId}" is not available`,
        };
    }, [gameId, roomId]);
}
