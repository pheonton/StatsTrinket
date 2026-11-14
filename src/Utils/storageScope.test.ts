import { describe, it, expect } from 'vitest';
import {
  DEVICE_SCOPED_KEYS,
  GAME_SCOPED_KEYS,
  KEPT_BY_GO_TO_START,
  SESSION_SCOPED_KEYS,
  clearKeys,
  keysToClearOnGoToStart,
} from './storageScope';

const fakeStorage = (entries: Record<string, string>) => {
  const store = { ...entries };
  return {
    store,
    removeItem: (key: string) => {
      delete store[key];
    },
  };
};

describe('the persisted key lists', () => {
  it('names every key that belongs to one game', () => {
    expect([...GAME_SCOPED_KEYS].sort()).toEqual(
      [
        'gameScore',
        'lifeHistory',
        'players',
        'startingPlayerIndex',
        'timerAccumulatedMs',
        'timerStartedAt',
      ].sort()
    );
  });

  it('names the keys that belong to the device', () => {
    expect([...DEVICE_SCOPED_KEYS].sort()).toEqual(
      ['initialGameSettings', 'settings'].sort()
    );
  });

  it('puts every persisted key in exactly one list', () => {
    const all = [
      ...GAME_SCOPED_KEYS,
      ...DEVICE_SCOPED_KEYS,
      ...SESSION_SCOPED_KEYS,
    ];
    expect(new Set(all).size).toBe(all.length);
  });

  it('never lets a device-scoped key into the game-scoped list', () => {
    for (const key of DEVICE_SCOPED_KEYS) {
      expect(GAME_SCOPED_KEYS).not.toContain(key);
    }
  });
});

describe('clearKeys', () => {
  it('removes the named keys and leaves everything else alone', () => {
    const storage = fakeStorage({
      players: '[]',
      gameScore: '{"0":1}',
      lifeHistory: '[]',
      timerStartedAt: '1',
      timerAccumulatedMs: '2',
      startingPlayerIndex: '0',
      settings: '{}',
      initialGameSettings: '{}',
      savedGame: 'null',
    });

    clearKeys(GAME_SCOPED_KEYS, storage);

    expect(Object.keys(storage.store).sort()).toEqual([
      'initialGameSettings',
      'savedGame',
      'settings',
    ]);
  });

  it('removes nothing when given no keys', () => {
    const storage = fakeStorage({ players: '[]', gameScore: '{"0":1}' });
    clearKeys([], storage);
    expect(Object.keys(storage.store).sort()).toEqual(['gameScore', 'players']);
  });
});

describe('keysToClearOnGoToStart', () => {
  // Pins the set `removeLocalStorage` has always cleared. It is not the
  // game-scoped list: it drops the setup and the view flags as well, and it
  // keeps the two keys in KEPT_BY_GO_TO_START.
  it('clears exactly what going back to the start menu has always cleared', () => {
    expect([...keysToClearOnGoToStart()].sort()).toEqual(
      [
        'initialGameSettings',
        'players',
        'playing',
        'showPlay',
        'gameScore',
        'timerStartedAt',
        'timerAccumulatedMs',
      ].sort()
    );
  });

  it('clears every game-scoped key it does not deliberately keep', () => {
    for (const key of GAME_SCOPED_KEYS) {
      if (KEPT_BY_GO_TO_START.includes(key)) {
        expect(keysToClearOnGoToStart()).not.toContain(key);
      } else {
        expect(keysToClearOnGoToStart()).toContain(key);
      }
    }
  });

  it('keeps only keys that are game-scoped in the first place', () => {
    for (const key of KEPT_BY_GO_TO_START) {
      expect(GAME_SCOPED_KEYS).toContain(key);
    }
  });
});
