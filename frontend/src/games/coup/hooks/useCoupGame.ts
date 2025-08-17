// src/games/coup/hooks/useCoupGame.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useSocket } from '../../../hooks/useSocket';
import {
    type CoupGameState,
    type CurrentPlayer,
    type CoinAnimation,
    type GameAction,
    ActionType,
    ACTION_COSTS,
    ACTIONS_REQUIRING_TARGET
} from '../types/coup.types';

interface UseCoupGameReturn {
    state: CoupGameState | null;
    currentPlayer: CurrentPlayer;
    myPlayerState: any;
    isMyTurn: boolean;
    aliveOpponents: any[];
    error: string;
    selectedTarget: string | null;
    animateCoin: CoinAnimation | null;
    showLoseModal: boolean;
    cardsToChoose: string[];
    showExchangeModal: boolean;
    exchangeData: { availableCards: string[], cardsToKeep: number } | null;
    setSelectedTarget: (target: string | null) => void;
    sendAction: (type: string, payload?: any) => void;
    onActionClick: (type: string) => void;
    onBlock: () => void;
    onChallenge: () => void;
    onResolve: () => void;
    loseCardChoice: (card: string) => void;
    exchangeCardChoice: (cards: string[]) => void;
}

export const useCoupGame = (roomId: string | undefined): UseCoupGameReturn => {
    const [state, setState] = useState<CoupGameState | null>(null);
    const [currentPlayer] = useState<CurrentPlayer>(() => {
        try {
            const stored = localStorage.getItem('currentPlayer');
            return stored ? JSON.parse(stored) : { playerId: '', name: '' };
        } catch {
            return { playerId: '', name: '' };
        }
    });
    const [error, setError] = useState<string>('');
    const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
    const [animateCoin, setAnimateCoin] = useState<CoinAnimation | null>(null);
    const lastCoinsRef = useRef<Record<string, number>>({});
    const [showLoseModal, setShowLoseModal] = useState(false);
    const [cardsToChoose, setCardsToChoose] = useState<string[]>([]);
    const [showExchangeModal, setShowExchangeModal] = useState(false);
    const [exchangeData, setExchangeData] = useState<{ availableCards: string[], cardsToKeep: number } | null>(null);

    /* -------------------- Socket Event Handlers -------------------- */
    const setupEvents = useCallback((socket: Socket) => {
        const handleGameState = (gameState: CoupGameState) => {
            setState((prevState) => {
                // Detect coin changes and trigger animations
                if (prevState && prevState.players) {
                    const prevCoins = prevState.players.reduce<Record<string, number>>(
                        (acc, p) => ({ ...acc, [p.playerId]: p.coins }),
                        {}
                    );

                    for (const player of gameState.players) {
                        const prevCoinCount = prevCoins[player.playerId];
                        if (prevCoinCount != null && prevCoinCount !== player.coins) {
                            setAnimateCoin({
                                id: player.playerId,
                                amount: player.coins - prevCoinCount,
                            });
                        }
                    }
                }

                // Update coin reference
                lastCoinsRef.current = gameState.players.reduce(
                    (acc, p) => ({ ...acc, [p.playerId]: p.coins }),
                    {}
                );

                return gameState;
            });
        };

        const handleError = (msg: any) => {
            const errorMessage = typeof msg === 'string' ? msg : msg?.message || 'Unknown error';
            setError(errorMessage);
            setTimeout(() => setError(''), 3000);
        };

        const handlePlayerDisconnected = (data: any) => {
            setError(`Player disconnected: ${data?.playerId || 'Unknown player'}`);
            setTimeout(() => setError(''), 3000);
        };

        const handlePlayerReconnected = () => {
            setError('Player reconnected');
            setTimeout(() => setError(''), 2000);
        };
        const handleChooseCardToLose = (data: any) => {
            setShowLoseModal(currentPlayer.playerId === data.playerId);
            setCardsToChoose(data.cards);
        };
        
        const handleChooseExchangeCards = (data: any) => {
            if (currentPlayer.playerId === data.playerId) {
                setShowExchangeModal(true);
                setExchangeData({
                    availableCards: data.availableCards,
                    cardsToKeep: data.cardsToKeep
                });
            }
        };

        socket.on('game:state', handleGameState);
        socket.on('errorMessage', handleError);
        socket.on('player:disconnected', handlePlayerDisconnected);
        socket.on('player:reconnected', handlePlayerReconnected);
        socket.on("coup:chooseCardToLose", handleChooseCardToLose);
        socket.on("coup:chooseExchangeCards", handleChooseExchangeCards);

        return () => {
            socket.off('game:state', handleGameState);
            socket.off('errorMessage', handleError);
            socket.off('player:disconnected', handlePlayerDisconnected);
            socket.off('player:reconnected', handlePlayerReconnected);
            socket.off("coup:chooseCardToLose", handleChooseCardToLose);
            socket.off("coup:chooseExchangeCards", handleChooseExchangeCards);
        };
    }, []);

    const socket = useSocket(setupEvents);

    /* -------------------- Effects -------------------- */
    useEffect(() => {
        if (socket && roomId && currentPlayer.playerId) {
            socket.emit('game:join', { roomId, gameId: 'coup' });
        }
    }, [socket, roomId, currentPlayer.playerId]);

    const loseCardChoice = (card: string) => {
        console.log(`Player ${currentPlayer.playerId} chose to lose card: ${card}`);
        if (socket && roomId && card && currentPlayer) {
            socket.emit("coup:loseCardChoice", { roomId, action: { type: "LOSE_CARD", playerId: currentPlayer.playerId, payload: { card } } });
            setShowLoseModal(false);
        }
    };

    const exchangeCardChoice = (selectedCards: string[]) => {
        console.log(`Player ${currentPlayer.playerId} chose exchange cards:`, selectedCards);
        if (socket && roomId && selectedCards && currentPlayer) {
            socket.emit("coup:exchangeCardsChoice", { 
                roomId, 
                action: { 
                    type: "EXCHANGE_CARDS", 
                    playerId: currentPlayer.playerId, 
                    payload: { selectedCards } 
                } 
            });
            setShowExchangeModal(false);
            setExchangeData(null);
        }
    };

    // Clear coin animation after duration
    useEffect(() => {
        if (!animateCoin) return;
        const timeout = setTimeout(() => setAnimateCoin(null), 900);
        return () => clearTimeout(timeout);
    }, [animateCoin]);

    /* -------------------- Derived Values -------------------- */
    const myPlayerState = useMemo(() => {
        if (!state?.players || !currentPlayer.playerId) return null;
        return state.players.find(p => p.playerId === currentPlayer.playerId) || null;
    }, [state?.players, currentPlayer.playerId]);

    const isMyTurn = useMemo(() =>
        state?.currentTurnPlayerId === currentPlayer.playerId,
        [state?.currentTurnPlayerId, currentPlayer.playerId]
    );

    const aliveOpponents = useMemo(() => {
        if (!state?.players) return [];
        return state.players.filter(
            p => p.isAlive && p.playerId !== currentPlayer.playerId
        );
    }, [state?.players, currentPlayer.playerId]);

    // Auto-select first opponent if none selected
    useEffect(() => {
        if (!selectedTarget && aliveOpponents.length > 0) {
            setSelectedTarget(aliveOpponents[0].playerId);
        }
    }, [aliveOpponents, selectedTarget]);

    /* -------------------- Action Handlers -------------------- */
    const sendAction = useCallback((type: string, payload?: any) => {
        if (!socket || !state || !currentPlayer.playerId) {
            setError('Unable to send action: missing connection or player data');
            setTimeout(() => setError(''), 2000);
            return;
        }

        const action: GameAction = {
            type,
            payload,
            playerId: currentPlayer.playerId,
        };

        socket.emit('game:action', {
            roomId,
            gameId: 'coup',
            action,
        });
    }, [socket, state, currentPlayer.playerId, roomId]);

    const onActionClick = useCallback((type: string) => {
        if (!myPlayerState?.isAlive) {
            setError('You cannot act while eliminated');
            setTimeout(() => setError(''), 2000);
            return;
        }

        if (!isMyTurn) {
            setError('It is not your turn');
            setTimeout(() => setError(''), 2000);
            return;
        }

        // Check if action requires coins
        const requiredCoins = ACTION_COSTS[type];
        if (requiredCoins && (myPlayerState?.coins || 0) < requiredCoins) {
            setError(`Not enough coins. Need ${requiredCoins} coins`);
            setTimeout(() => setError(''), 2000);
            return;
        }

        // Check if action requires target
        if (ACTIONS_REQUIRING_TARGET.includes(type as ActionType)) {
            if (!selectedTarget) {
                setError('Please select a target first');
                setTimeout(() => setError(''), 2000);
                return;
            }
            sendAction(type, { targetId: selectedTarget });
        } else {
            sendAction(type);
        }
    }, [myPlayerState, isMyTurn, selectedTarget, sendAction]);

    const onBlock = useCallback(() => {
        if (!state?.pendingAction) return;
        sendAction(ActionType.BLOCK, { targetId: state.pendingAction.fromPlayerId });
    }, [state?.pendingAction, sendAction]);

    const onChallenge = useCallback(() => {
        if (!state?.pendingAction) return;
        sendAction(ActionType.CHALLENGE, { targetId: state.pendingAction.fromPlayerId });
    }, [state?.pendingAction, sendAction]);

    const onResolve = useCallback(() => {
        sendAction(ActionType.RESOLVE_ACTION);
    }, [sendAction]);

    return {
        state,
        currentPlayer,
        myPlayerState,
        isMyTurn,
        aliveOpponents,
        error,
        selectedTarget,
        animateCoin,
        showLoseModal,
        cardsToChoose,
        showExchangeModal,
        exchangeData,
        setSelectedTarget,
        sendAction,
        onActionClick,
        onBlock,
        onChallenge,
        onResolve,
        loseCardChoice,
        exchangeCardChoice,
    };
};