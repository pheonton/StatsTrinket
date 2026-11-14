import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useWakeLock } from 'react-screen-wake-lock';
import {
  GameScore,
  GlobalSettingsContext,
  GlobalSettingsContextType,
  SavedGame,
} from '../Contexts/GlobalSettingsContext';
import {
  InitialGameSettings,
  Settings,
  defaultInitialGameSettings,
  defaultSettings,
  initialGameSettingsSchema,
  lifeHistorySchema,
  settingsSchema,
} from '../Types/Settings';
import { LifeHistoryEvent, Player } from '../Types/Player';
import {
  DeckStats,
  deckStatsSchema,
  recordGameToDeckStats,
} from '../Types/DeckStats';
import { gte as semverGreaterThanOrEqual } from 'semver';
import type { SharedGameState } from '../Types/SharedState';
import { clearKeys, keysToClearOnGoToStart } from '../Utils/storageScope';

export const GlobalSettingsProvider = ({
  children,
  sharedState,
}: {
  children: ReactNode;
  sharedState?: SharedGameState | null;
}) => {

  const localSavedGame = localStorage.getItem('savedGame');
  const [savedGame, setCurrentGame] = useState<SavedGame>(
    localSavedGame ? JSON.parse(localSavedGame) : null
  );
  const setCurrentGameAndLocalStorage = (savedGame: SavedGame) => {
    if (!savedGame) {
      setCurrentGame(savedGame);
      localStorage.removeItem('savedGame');
      return;
    }
    setCurrentGame(savedGame);
    localStorage.setItem('savedGame', JSON.stringify(savedGame));
  };

  const savedPlaying = localStorage.getItem('playing');
  const [playing, setPlaying] = useState<boolean>(() => {
    // A shared game starts straight away
    if (sharedState) {
      return true;
    }
    return savedPlaying ? savedPlaying === 'true' : false;
  });
  const setPlayingAndLocalStorage = (playing: boolean) => {
    setPlaying(playing);
    localStorage.setItem('playing', String(playing));
  };

  const savedShowPlay = localStorage.getItem('showPlay');
  const [showPlay, setShowPlay] = useState<boolean>(() => {
    // A shared game opens the play view
    if (sharedState) {
      return true;
    }
    return savedShowPlay ? savedShowPlay === 'true' : false;
  });
  const setShowPlayAndLocalStorage = (showPlay: boolean) => {
    setShowPlay(showPlay);
    localStorage.setItem('showPlay', String(showPlay));
  };

  const savedSettings = localStorage.getItem('settings');
  const [settings, setSettings] = useState<Settings>(() => {
    if (!savedSettings) return defaultSettings;
    const parsed = settingsSchema.safeParse(JSON.parse(savedSettings));
    if (!parsed.success) {
      console.error('invalid settings, using default settings');
      return defaultSettings;
    }
    return parsed.data;
  });

  const setSettingsAndLocalStorage = (settings: Settings) => {
    setSettings(settings);
    localStorage.setItem('settings', JSON.stringify(settings));
  };

  const savedGameSettings = localStorage.getItem('initialGameSettings');

  const [initialGameSettings, setInitialGameSettings] =
    useState<InitialGameSettings>(() => {
      // Prioritize shared state
      if (sharedState?.initialGameSettings) {
        return sharedState.initialGameSettings;
      }
      if (!savedGameSettings) return defaultInitialGameSettings;
      const parsed = initialGameSettingsSchema.safeParse(
        JSON.parse(savedGameSettings)
      );
      if (!parsed.success) {
        console.error('invalid game settings, using default settings');
        return defaultInitialGameSettings;
      }
      return parsed.data;
    });

  const setInitialGameSettingsAndLocalStorage = (
    initialGameSettings: InitialGameSettings
  ) => {
    setInitialGameSettings(initialGameSettings);
    localStorage.setItem(
      'initialGameSettings',
      JSON.stringify(initialGameSettings)
    );
  };

  const savedGameScore = localStorage.getItem('gameScore');
  const [gameScore, setGameScore] = useState<GameScore>(() => {
    // Prioritize shared state
    if (sharedState?.gameScore) {
      return sharedState.gameScore;
    }
    return savedGameScore ? JSON.parse(savedGameScore) : {};
  });
  const setGameScoreAndLocalStorage = (score: GameScore) => {
    setGameScore(score);
    localStorage.setItem('gameScore', JSON.stringify(score));
  };

  const savedLifeHistory = localStorage.getItem('lifeHistory');
  const [lifeHistory, setLifeHistory] = useState<LifeHistoryEvent[]>(() => {
    // Prioritize shared state
    if (sharedState?.lifeHistory) {
      return sharedState.lifeHistory;
    }
    if (!savedLifeHistory) return [];
    const parsed = lifeHistorySchema.safeParse(JSON.parse(savedLifeHistory));
    if (!parsed.success) {
      console.error('invalid life history, using empty array');
      return [];
    }
    return parsed.data;
  });
  const addLifeHistoryEvent = useCallback((event: LifeHistoryEvent) => {
    setLifeHistory((prevHistory) => {
      const updatedHistory = [...prevHistory, event];
      localStorage.setItem('lifeHistory', JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  }, []);
  const clearLifeHistory = useCallback(() => {
    setLifeHistory([]);
    localStorage.removeItem('lifeHistory');
  }, []);

  const [deckStats, setDeckStats] = useState<DeckStats>(() => {
    const saved = localStorage.getItem('deckStats');
    if (!saved) return {};
    const parsed = deckStatsSchema.safeParse(JSON.parse(saved));
    if (!parsed.success) {
      console.error('invalid deck stats, using empty object');
      return {};
    }
    return parsed.data;
  });
  const persistDeckStats = useCallback((next: DeckStats) => {
    setDeckStats(next);
    if (Object.keys(next).length === 0) {
      localStorage.removeItem('deckStats');
    } else {
      localStorage.setItem('deckStats', JSON.stringify(next));
    }
  }, []);
  const recordGame = useCallback(
    (gamePlayers: Player[], winnerIndex: number) => {
      setDeckStats((prev) => {
        const next = recordGameToDeckStats(prev, gamePlayers, winnerIndex);
        if (next === prev) return prev;
        localStorage.setItem('deckStats', JSON.stringify(next));
        return next;
      });
    },
    []
  );
  const clearDeckStats = useCallback(() => {
    persistDeckStats({});
  }, [persistDeckStats]);
  const deleteDeck = useCallback((normalizedName: string) => {
    setDeckStats((prev) => {
      if (!(normalizedName in prev)) return prev;
      const next = { ...prev };
      delete next[normalizedName];
      if (Object.keys(next).length === 0) {
        localStorage.removeItem('deckStats');
      } else {
        localStorage.setItem('deckStats', JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // This is called when fullscreen is entered or exited, by any means
    const fullscreenChangeHandler = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', fullscreenChangeHandler);

    return () => {
      document.removeEventListener('fullscreenchange', fullscreenChangeHandler);
    };
  }, []);

  const [isLatestVersion, setIsLatestVersion] = useState(false);
  const [remoteVersion, setRemoteVersion] = useState<string | undefined>(
    undefined
  );

  const { isSupported, release, released, request, type } = useWakeLock();

  const active = settings.keepAwake;

  if (active && released === undefined) {
    request();
  }

  // Persist the life history of a game loaded from a share link
  useEffect(() => {
    if (sharedState?.lifeHistory && sharedState.lifeHistory.length > 0) {
      localStorage.setItem(
        'lifeHistory',
        JSON.stringify(sharedState.lifeHistory)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const ctxValue = useMemo((): GlobalSettingsContextType => {
    const removeLocalStorage = async () => {
      // The list lives in Utils/storageScope, next to the game-scoped keys it
      // is derived from, so this path and a new game cannot drift apart.
      clearKeys(keysToClearOnGoToStart());

      setPlaying(false);
      setShowPlay(false);
      setSettings({ ...settings, useMonarch: false });
      setGameScore({});
    };

    const goToStart = removeLocalStorage;

    const toggleWakeLock = async () => {
      if (active) {
        setSettings({ ...settings, keepAwake: false });
        release();
        return;
      }

      setSettings({ ...settings, keepAwake: true });
      request();
    };

    const enableFullscreen = () => {
      if (document?.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().then(() => {
          setIsFullscreen(true);
        });
      }
    };

    const disableFullscreen = () => {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        });
      }
    };

    async function checkForNewVersion() {
      try {
        // Unauthenticated on purpose: anything built into the app is public,
        // and GitHub's 60 requests/hour per address is plenty for this check.
        const result = await fetch(
          'https://api.github.com/repos/pheonton/StatsTrinket/releases/latest',
          {
            headers: {
              Accept: 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28',
            },
          }
        );
        const data = await result.json();
        // The tag is always the bare version; the release title is free text.
        const latestVersion: string | undefined = data.tag_name;

        if (!latestVersion) {
          // No published release to compare against (e.g. a fresh fork).
          // Treat the installed build as current rather than nagging.
          setRemoteVersion(undefined);
          setIsLatestVersion(true);
          return;
        }

        setRemoteVersion(latestVersion);

        const isLatest = semverGreaterThanOrEqual(
          import.meta.env.VITE_APP_VERSION,
          latestVersion
        );

        if (isLatest) {
          setIsLatestVersion(true);
          return;
        }

        setIsLatestVersion(false);
      } catch (error) {
        console.error('error getting latest version string', error);
      }
    }

    return {
      fullscreen: { isFullscreen, enableFullscreen, disableFullscreen },
      wakeLock: {
        isSupported,
        release,
        active,
        request,
        type,
        toggleWakeLock,
      },
      goToStart,
      showPlay,
      setShowPlay: setShowPlayAndLocalStorage,
      playing,
      setPlaying: setPlayingAndLocalStorage,
      initialGameSettings,
      setInitialGameSettings: setInitialGameSettingsAndLocalStorage,
      settings,
      setSettings: setSettingsAndLocalStorage,
      isPWA: window?.matchMedia('(display-mode: standalone)').matches,
      savedGame,
      saveCurrentGame: setCurrentGameAndLocalStorage,
      version: {
        installedVersion: import.meta.env.VITE_APP_VERSION,
        remoteVersion,
        isLatest: isLatestVersion,
        checkForNewVersion,
      },
      gameScore,
      setGameScore: setGameScoreAndLocalStorage,
      lifeHistory,
      addLifeHistoryEvent,
      clearLifeHistory,
      deckStats,
      recordGame,
      clearDeckStats,
      deleteDeck,
      replaceDeckStats: persistDeckStats,
    };
  }, [
    isFullscreen,
    isSupported,
    release,
    active,
    request,
    type,
    showPlay,
    playing,
    initialGameSettings,
    settings,
    savedGame,
    remoteVersion,
    isLatestVersion,
    gameScore,
    lifeHistory,
    addLifeHistoryEvent,
    clearLifeHistory,
    deckStats,
    recordGame,
    clearDeckStats,
    deleteDeck,
    persistDeckStats,
  ]);

  return (
    <GlobalSettingsContext.Provider value={ctxValue}>
      {children}
    </GlobalSettingsContext.Provider>
  );
};
