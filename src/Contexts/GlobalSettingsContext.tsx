import { createContext } from 'react';
import { InitialGameSettings, Settings } from '../Types/Settings';
import { LifeHistoryEvent, Player } from '../Types/Player';
import { DeckStats } from '../Types/DeckStats';
import type { TimerSnapshot } from '../Hooks/useGameTimer';

type Version = {
  installedVersion: string;
  isLatest: boolean;
  checkForNewVersion: () => Promise<void>;
  remoteVersion?: string;
};

export type SavedGame = {
  initialGameSettings: InitialGameSettings;
  players: Player[];
  gameScore?: GameScore;
  // Going to the start menu clears both, so a paused game carries its own.
  timer?: TimerSnapshot;
  useMonarch?: boolean;
} | null;

export type GameScore = {
  [playerIndex: number]: number;
};

export type GlobalSettingsContextType = {
  fullscreen: {
    isFullscreen: boolean;
    enableFullscreen: () => void;
    disableFullscreen: () => void;
  };
  wakeLock: {
    isSupported: boolean;
    release: () => void;
    active: boolean;
    request: () => void;
    type: 'screen' | undefined;
    toggleWakeLock: () => void;
  };
  goToStart: () => void;
  showPlay: boolean;
  setShowPlay: (showPlay: boolean) => void;
  initialGameSettings: InitialGameSettings;
  setInitialGameSettings: (initialGameSettings: InitialGameSettings) => void;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  isPWA: boolean;
  version: Version;
  savedGame: SavedGame;
  saveCurrentGame: (currentGame: SavedGame) => void;
  gameScore: GameScore;
  setGameScore: (score: GameScore) => void;
  lifeHistory: LifeHistoryEvent[];
  addLifeHistoryEvent: (event: LifeHistoryEvent) => void;
  clearLifeHistory: () => void;
  deckStats: DeckStats;
  recordGame: (players: Player[], winnerIndex: number) => void;
  clearDeckStats: () => void;
  deleteDeck: (normalizedName: string) => void;
  replaceDeckStats: (stats: DeckStats) => void;
};

export const GlobalSettingsContext =
  createContext<GlobalSettingsContextType | null>(null);
