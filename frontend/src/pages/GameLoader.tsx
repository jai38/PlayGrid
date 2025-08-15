// src/pages/GameLoader.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import { useGameValidation } from "../hooks/useGameValidation";
import { useSocket } from "../hooks/useSocket";

// Lazy load game components for better performance
const CoupUI = lazy(() => import("../games/coup/CoupUI3D"));
const MonopolyUI = lazy(() => import("../games/monopoly/MonopolyUI"));

// Define available games with lazy loading
const AVAILABLE_GAMES = {
  coup: CoupUI,
  monopoly: MonopolyUI,
} as const;

// Loading component for lazy-loaded games
const GameLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen text-white">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p>Loading game...</p>
    </div>
  </div>
);

// Error component for invalid games
const GameNotFound = ({
  gameId,
  onBack,
}: {
  gameId: string;
  onBack: () => void;
}) => (
  <div className="flex items-center justify-center min-h-screen text-white">
    <div className="text-center p-6 bg-gray-800 rounded-lg shadow-lg max-w-md">
      <h2 className="text-xl font-bold mb-4 text-red-400">Game Not Found</h2>
      <p className="mb-6 text-gray-300">
        The game "{gameId}" is not available or not implemented yet.
      </p>
      <button
        onClick={onBack}
        className="bg-blue-500 px-6 py-3 rounded-lg hover:bg-blue-400 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900">
        Back to Lobby
      </button>
    </div>
  </div>
);

export default function GameLoader() {
  const { gameId, roomId } = useParams<{ gameId: string; roomId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRejoining, setIsRejoining] = useState(false);

  // Use custom hook for validation
  const validation = useGameValidation(gameId, roomId);

  // Socket connection for rejoin functionality
  const socket = useSocket();

  // Single validation effect with optimized dependencies
  useEffect(() => {
    if (!validation.hasRequiredParams) {
      navigate("/lobby");
      return;
    }

    if (!validation.isValidGame) {
      // Show error after a brief loading state for better UX
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }

    // Check if this is a rejoin scenario
    const storedPlayer = localStorage.getItem("currentPlayer");
    const storedRoomId = localStorage.getItem("roomId");

    if (storedPlayer && storedRoomId === roomId && socket) {
      const player = JSON.parse(storedPlayer);
      console.log("GameLoader: Checking for rejoin scenario", {
        storedPlayerId: player.playerId,
        roomId,
        gameId,
      });

      // Attempt to rejoin the game
      // setIsRejoining(true);
      socket.emit("game:join", { roomId, gameId });

      // Set up listener for game state
      const handleGameState = (gameState: any) => {
        console.log("GameLoader: Received game state on rejoin", gameState);
        setIsRejoining(false);
        setIsLoading(false);
      };

      const handleGameError = (error: any) => {
        console.error("GameLoader: Error rejoining game", error);
        setIsRejoining(false);
        setIsLoading(false);
      };

      const handleGameRejoined = (data: any) => {
        console.log("GameLoader: Game rejoined event received", data);
        setIsRejoining(false);
        setIsLoading(false);
      };

      socket.on("game:state", handleGameState);
      socket.on("game:error", handleGameError);
      socket.on("game:rejoined", handleGameRejoined);

      // Cleanup listeners
      return () => {
        socket.off("game:state", handleGameState);
        socket.off("game:error", handleGameError);
        socket.off("game:rejoined", handleGameRejoined);
      };
    }

    // Valid game - stop loading
    setIsLoading(false);
  }, [
    validation.hasRequiredParams,
    validation.isValidGame,
    navigate,
    roomId,
    gameId,
    socket,
  ]);

  // Error boundary for component failures
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.log("Game component error:", event);
      setError("Failed to load game component");
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  // Show loading state
  if (isLoading || isRejoining) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>{isRejoining ? "Rejoining game..." : "Loading game..."}</p>
          {isRejoining && (
            <p className="text-sm text-gray-400 mt-2">
              Reconnecting to your game session...
            </p>
          )}
        </div>
      </div>
    );
  }

  // Handle missing parameters (shouldn't happen due to useEffect, but safety check)
  if (!validation.hasRequiredParams) {
    return null;
  }

  // Handle invalid game
  if (!validation.isValidGame) {
    return <GameNotFound gameId={gameId!} onBack={() => navigate("/lobby")} />;
  }

  // Handle component loading errors
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="text-center p-6 bg-gray-800 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold mb-4 text-red-400">Loading Error</h2>
          <p className="mb-6 text-gray-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 px-6 py-3 rounded-lg hover:bg-blue-400 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render the appropriate game component with Suspense
  const GameComponent = validation.normalizedGameId
    ? AVAILABLE_GAMES[
        validation.normalizedGameId as keyof typeof AVAILABLE_GAMES
      ]
    : null;

  if (!GameComponent) {
    return null; // This shouldn't happen due to validation, but safety check
  }

  return (
    <Suspense fallback={<GameLoadingFallback />}>
      <GameComponent />
    </Suspense>
  );
}
