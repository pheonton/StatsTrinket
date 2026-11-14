import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Player } from '../Types/Player';
import { PlayersContextType, PlayersContext } from '../Contexts/PlayersContext';
import {
  InitialGameSettings,
  initialGameSettingsSchema,
} from '../Types/Settings';
import type { SharedGameState } from '../Types/SharedState';

/** The settings the player last used, or null when there are none to read. */
const readSavedGameSettings = (): InitialGameSettings | null => {
  const saved = localStorage.getItem('initialGameSettings');
  if (!saved) {
    return null;
  }
  try {
    const parsed = initialGameSettingsSchema.safeParse(JSON.parse(saved));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

/** The life total a reset goes back to, or null when nothing says. */
const readStartingLifeTotal = (): number | null =>
  readSavedGameSettings()?.startingLifeTotal ?? null;

export const PlayersProvider = ({
  children,
  sharedState,
}: {
  children: ReactNode;
  sharedState?: SharedGameState | null;
}) => {
  // Prioritize shared state over localStorage
  const savedPlayers = sharedState?.players || localStorage.getItem('players');
  const savedStartingPlayerIndex =
    sharedState?.startingPlayerIndex ?? localStorage.getItem('startingPlayerIndex');

  const [startingPlayerIndex, setStartingPlayerIndex] = useState<number>(() => {
    if (sharedState?.startingPlayerIndex !== undefined) {
      return sharedState.startingPlayerIndex;
    }
    if (savedStartingPlayerIndex !== null) {
      return typeof savedStartingPlayerIndex === 'number'
        ? savedStartingPlayerIndex
        : parseInt(savedStartingPlayerIndex);
    }
    return -1;
  });

  const setStartingPlayerIndexAndLocalStorage = useCallback((index: number) => {
    setStartingPlayerIndex(index);
    localStorage.setItem('startingPlayerIndex', String(index));
  }, []);

  const [players, setPlayers] = useState<Player[]>(() => {
    if (sharedState?.players) {
      return sharedState.players;
    }
    if (typeof savedPlayers === 'string') {
      return JSON.parse(savedPlayers);
    }
    if (Array.isArray(savedPlayers)) {
      return savedPlayers;
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('players', JSON.stringify(players));
  }, [players]);

  const ctxValue = useMemo((): PlayersContextType => {
    const updatePlayer = (updatedPlayer: Player) => {
      const updatedPlayers = players.map((player) =>
        player.index === updatedPlayer.index ? updatedPlayer : player
      );

      setPlayers(updatedPlayers);
    };

    const updateLifeTotal = (
      player: Player,
      updatedLifeTotal: number
    ): number => {
      const difference = updatedLifeTotal - player.lifeTotal;
      const updatedPlayer = {
        ...player,
        lifeTotal: updatedLifeTotal,
      };
      updatePlayer(updatedPlayer);

      return difference;
    };

    const resetCurrentGame = () => {
      const startingLifeTotal = readStartingLifeTotal();

      if (startingLifeTotal === null) {
        return;
      }

      // Use the saved starting player index if available, otherwise random
      const newStartingPlayerIndex =
        startingPlayerIndex >= 0
          ? startingPlayerIndex
          : Math.floor(Math.random() * players.length);

      players.forEach((player: Player) => {
        player.commanderDamage.map((damage) => {
          damage.damageTotal = 0;
          damage.partnerDamageTotal = 0;
        });

        player.extraCounters.map((counter) => {
          counter.value = 0;
        });

        player.lifeTotal = startingLifeTotal;
        player.hasLost = false;

        player.isStartingPlayer = newStartingPlayerIndex === player.index;

        updatePlayer(player);
      });
      localStorage.setItem('playing', 'false');
    };

    return {
      players,
      setPlayers,
      updatePlayer,
      updateLifeTotal,
      resetCurrentGame,
      startingPlayerIndex,
      setStartingPlayerIndex: setStartingPlayerIndexAndLocalStorage,
    };
  }, [
    players,
    startingPlayerIndex,
    setStartingPlayerIndexAndLocalStorage,
  ]);

  return (
    <PlayersContext.Provider value={ctxValue}>
      {children}
    </PlayersContext.Provider>
  );
};
