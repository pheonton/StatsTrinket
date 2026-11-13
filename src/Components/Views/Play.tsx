import { useEffect, useState } from 'react';
import { twc } from 'react-twc';
import { useGlobalSettings } from '../../Hooks/useGlobalSettings';
import { usePlayers } from '../../Hooks/usePlayers';
import { Orientation, PreStartMode } from '../../Types/Settings';
import { GameTimer } from '../GameTimer/GameTimer';
import { Players } from '../Players/Players';
import { PreStart } from '../PreStartGame/PreStart';
import { GameOver } from '../GameOver/GameOver';
import { useGameTracker } from '../../Hooks/useGameTracker';
import { TrackingContext } from '../../Contexts/TrackingContext';

const MainWrapper = twc.div`relative w-[100dvmax] h-[100dvmin] overflow-hidden, setPlayers`;

// Each name is a `.grid-areas-*` class defined in src/index.css.
export type GridLayout =
  | 'grid-areas-onePlayerLandscape'
  | 'grid-areas-onePlayerPortrait'
  | 'grid-areas-twoPlayersOppositeLandscape'
  | 'grid-areas-twoPlayersOppositePortrait'
  | 'grid-areas-twoPlayersSameSideLandscape'
  | 'grid-areas-threePlayers'
  | 'grid-areas-threePlayersSide'
  | 'grid-areas-fourPlayerPortrait'
  | 'grid-areas-fourPlayer'
  | 'grid-areas-fivePlayers'
  | 'grid-areas-fivePlayersSide'
  | 'grid-areas-sixPlayers'
  | 'grid-areas-sixPlayersSide';

export const Play = () => {
  const {
    players,
    setPlayers,
    resetCurrentGame,
    setStartingPlayerIndex,
  } = usePlayers();
  const {
    initialGameSettings,
    playing,
    settings,
    preStartCompleted,
    gameScore,
    setGameScore,
    recordGame,
    trackedGameId,
  } = useGlobalSettings();
  const [winner, setWinner] = useState<number | null>(null);
  // Set by "Back to Game": the end screen stays closed for this winner until
  // the table changes (someone is brought back), so it doesn't reopen at once.
  // Meanwhile the winner's card shows a trophy that reopens it.
  const [dismissedWinner, setDismissedWinner] = useState<number | null>(null);
  const hasDeckNames = players.some((p) => p.deckName.trim() !== '');

  // Idle and inert unless a track link started this game.
  const tracker = useGameTracker({
    gameId: trackedGameId,
    players,
    winner,
    gameScore,
    // Spec 17: a device opening the link for a match already in progress has
    // nothing of its own, and must take what the node carries rather than
    // publish 0-0 and 20-20 over a real tournament match. Both setters are
    // required by the hook: there is no useful way to let it read the node
    // and then have nowhere to put the answer.
    onAdoptScore: setGameScore,
    onAdoptPlayers: setPlayers,
  });

  let gridLayout: GridLayout;
  switch (players.length) {
    case 1:
      if (initialGameSettings?.orientation === Orientation.Portrait) {
        gridLayout = 'grid-areas-onePlayerPortrait';
      }
      gridLayout = 'grid-areas-onePlayerLandscape';
      break;
    case 2:
      switch (initialGameSettings?.orientation) {
        case Orientation.Portrait:
          gridLayout = 'grid-areas-twoPlayersOppositePortrait';
          break;
        default:
        case Orientation.Landscape:
          gridLayout = 'grid-areas-twoPlayersSameSideLandscape';
          break;
        case Orientation.OppositeLandscape:
          gridLayout = 'grid-areas-twoPlayersOppositeLandscape';
          break;
      }
      break;
    case 3:
      if (initialGameSettings?.orientation === Orientation.Portrait) {
        gridLayout = 'grid-areas-threePlayersSide';
        break;
      }
      gridLayout = 'grid-areas-threePlayers';
      break;
    default:
    case 4:
      if (initialGameSettings?.orientation === Orientation.Portrait) {
        gridLayout = 'grid-areas-fourPlayerPortrait';
        break;
      }
      gridLayout = 'grid-areas-fourPlayer';
      break;
    case 5:
      if (initialGameSettings?.orientation === Orientation.Portrait) {
        gridLayout = 'grid-areas-fivePlayersSide';
        break;
      }
      gridLayout = 'grid-areas-fivePlayers';
      break;
    case 6:
      if (initialGameSettings?.orientation === Orientation.Portrait) {
        gridLayout = 'grid-areas-sixPlayersSide';
        break;
      }
      gridLayout = 'grid-areas-sixPlayers';
      break;
  }

  useEffect(() => {
    if (settings.preStartMode !== PreStartMode.None) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * players.length);

    setPlayers(
      players.map((p) =>
        p.index === randomIndex
          ? {
              ...p,
              isStartingPlayer: true,
            }
          : {
              ...p,
              isStartingPlayer: false,
            }
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check for game over when only one player remains
  useEffect(() => {
    if (players.length < 2 || winner !== null || !settings.showMatchScore) {
      return;
    }

    const activePlayers = players.filter((p) => !p.hasLost);

    if (activePlayers.length !== 1) {
      if (dismissedWinner !== null) setDismissedWinner(null);
      return;
    }

    // If only one player is alive, they are the winner
    if (activePlayers[0].index !== dismissedWinner) {
      setWinner(activePlayers[0].index);
    }
  }, [players, winner, dismissedWinner, settings.showMatchScore]);

  const handleStartNextGame = (save: boolean) => {
    if (winner === null) return;

    if (save) recordGame(players, winner);

    // Update score
    const newScore = { ...gameScore };
    newScore[winner] = (newScore[winner] || 0) + 1;
    setGameScore(newScore);

    // Set the loser as the starting player for next game
    const loserIndex = players.find((p) => p.index !== winner)?.index ?? 0;
    setStartingPlayerIndex(loserIndex);

    // Reset game
    resetCurrentGame();
    setWinner(null);
  };

  // Nothing is counted: no win, no deck stats, and the defeated players stay
  // out. Bringing one back from their player menu reopens the question.
  const handleBackToGame = () => {
    setDismissedWinner(winner);
    setWinner(null);
  };

  return (
    <MainWrapper>
      {players.length > 1 &&
        !preStartCompleted &&
        settings.preStartMode !== PreStartMode.None &&
        !playing &&
        settings.showStartingPlayer && <PreStart />}

      {/* The player menu shows the tracking status, and it sits three
          components below this one. Context rather than three layers of
          props for a readout that most games never have. */}
      <TrackingContext.Provider
        value={{
          status: tracker.status,
          lastSentAt: tracker.lastSentAt,
          forceUpdate: tracker.forceUpdate,
        }}
      >
        <Players
          gridLayout={gridLayout}
          finishGame={
            dismissedWinner === null
              ? undefined
              : {
                  playerIndex: dismissedWinner,
                  onFinish: () => {
                    setWinner(dismissedWinner);
                    setDismissedWinner(null);
                  },
                }
          }
        />
      </TrackingContext.Provider>

      {/* Mounted whatever `showTimer` says: a tracked round end overrides
          that preference, and only the component knows whether it has one.
          It renders nothing at all otherwise. */}
      <GameTimer />

      {winner !== null && (
        <GameOver
          winner={players[winner]}
          canSave={hasDeckNames}
          onStartNextGame={handleStartNextGame}
          onBackToGame={handleBackToGame}
        />
      )}
    </MainWrapper>
  );
};
