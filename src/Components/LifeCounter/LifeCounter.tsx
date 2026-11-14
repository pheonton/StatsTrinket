import { useEffect, useRef, useState } from 'react';
import { twc } from 'react-twc';
import { useGlobalSettings } from '../../Hooks/useGlobalSettings';
import { usePlayers } from '../../Hooks/usePlayers';
import { recentDifferenceTTL } from '../../Data/constants';
import { Cog, Trophy } from '../../Icons/generated';
import { Player, Rotation } from '../../Types/Player';
import {
  RotationButtonProps,
  RotationDivProps,
} from '../Buttons/CommanderDamage';
import { FinishGameButton, LoseGameButton } from '../Buttons/LoseButton';
import CommanderDamageBar from '../Counters/CommanderDamageBar';
import ExtraCountersBar from '../Counters/ExtraCountersBar';
import PlayerMenu from '../Players/PlayerMenu';
import { StartingPlayerCard } from './StartingPlayerCard';
import Health from './Health';
import { useCommanderArt } from '../../Hooks/useCommanderArt';

const SettingsButtonTwc = twc.button<RotationButtonProps>((props) => [
  'absolute flex-grow border-none outline-none cursor-pointer bg-transparent z-[2] select-none  webkit-user-select-none opacity-50',
  props.$rotation === Rotation.Side || props.$rotation === Rotation.SideFlipped
    ? `right-auto top-[1vmax] left-[27%]`
    : 'top-1/4 right-[1vmax]',
]);

type MatchScoreBadgeProps = RotationDivProps & {
  $useCommanderDamage: boolean;
};

const MatchScoreBadge = twc.div<MatchScoreBadgeProps>((props) => [
  'absolute',
  'w-[8vmin] h-[8vmin]',
  'font-bold',
  'text-[3vmin] leading-none tabular-nums',
  'z-[1]',
  'pointer-events-none',
  'select-none webkit-user-select-none',
  props.$rotation === Rotation.Side || props.$rotation === Rotation.SideFlipped
    ? `left-[6.5vmax] bottom-[1vmax]`
    : props.$useCommanderDamage
      ? 'left-[0.5vmax] top-[11.5vmin]'
      : 'left-[0.5vmax] top-[1vmax]',
]);

type SettingsButtonProps = {
  onClick: () => void;
  rotation: Rotation;
  iconTheme: 'light' | 'dark';
};

const SettingsButton = ({
  onClick,
  rotation,
  iconTheme,
}: SettingsButtonProps) => {
  return (
    <SettingsButtonTwc
      onClick={onClick}
      $rotation={rotation}
      aria-label={`Settings`}
    >
      <Cog
        size="5vmin"
        data-contrast={iconTheme}
        className="data-[contrast=dark]:text-icons-dark data-[contrast=light]:text-icons-light"
      />
    </SettingsButtonTwc>
  );
};

const LifeCounterContentWrapper = twc.div`
  relative flex flex-grow flex-col items-center w-full h-full overflow-hidden`;

const LifeCounterWrapper = twc.div<RotationDivProps>((props) => [
  'relative flex items-center w-full h-full z-[1]',
  props.$rotation === Rotation.SideFlipped || props.$rotation === Rotation.Side
    ? `flex-row`
    : `flex-col`,
]);

const PlayerLostWrapper = twc.div<RotationDivProps>((props) => [
  'z-[2] flex absolute w-full h-full justify-center items-center select-none webkit-user-select-none bg-lifeCounter-lostWrapper opacity-75',
  props.$rotation === Rotation.SideFlipped || props.$rotation === Rotation.Side
    ? `rotate-[${props.$rotation - 90}deg]`
    : '',
]);

const hasCommanderDamageReached21 = (player: Player) => {
  const commanderDamageTotals = player.commanderDamage.map(
    (commanderDamage) => commanderDamage.damageTotal
  );

  const partnerDamageTotals = player.commanderDamage.map(
    (commanderDamage) => commanderDamage.partnerDamageTotal
  );

  return (
    commanderDamageTotals.some((damageTotal) => damageTotal >= 21) ||
    partnerDamageTotals.some((partnerDamageTotal) => partnerDamageTotal >= 21)
  );
};

const playerCanLose = (player: Player) => {
  const poisonCounter = player.extraCounters.find(
    (counter) => counter.type === 'poison'
  );

  return (
    player.lifeTotal < 1 ||
    hasCommanderDamageReached21(player) ||
    (poisonCounter && poisonCounter.value >= 10)
  );
};

type LifeCounterProps = {
  player: Player;
  opponents: Player[];
  isStartingPlayer?: boolean;
  matchScore?: number;
  onFinishGame?: () => void;
};

const LifeCounter = ({
  player,
  opponents,
  matchScore,
  onFinishGame,
}: LifeCounterProps) => {
  const { updatePlayer, updateLifeTotal } = usePlayers();
  const { settings, playing, addLifeHistoryEvent } = useGlobalSettings();

  const { artUrl: commanderArtUrl } = useCommanderArt(
    player.settings.useCommanderDamage ? player.commanderName : ''
  );
  // Over the dark art scrim, always render icons/labels light regardless of
  // the player's chosen colour.
  const displayPlayer: Player = commanderArtUrl
    ? { ...player, iconTheme: 'light' }
    : player;
  const recentDifferenceTimerRef = useRef<NodeJS.Timeout | undefined>(
    undefined
  );

  const [showPlayerMenu, setShowPlayerMenu] = useState(false);
  const [recentDifference, setRecentDifference] = useState(0);
  const [differenceKey, setDifferenceKey] = useState(Date.now());

  // Track initial state for history batching
  const initialLifeTotalRef = useRef<number | null>(null);
  const damageSourcesMapRef = useRef<
    Map<
      string,
      {
        opponentId: number;
        opponentName: string;
        opponentColor: string;
        isPartner: boolean;
        amount: number;
      }
    >
  >(new Map());

  useEffect(() => {
    // Only exit early if there's no difference AND no damage sources to track
    if (recentDifference === 0 && damageSourcesMapRef.current.size === 0) {
      clearTimeout(recentDifferenceTimerRef.current);
      initialLifeTotalRef.current = null;
      damageSourcesMapRef.current.clear();
      return;
    }

    // Capture initial life total when difference starts accumulating or damage sources are added
    if (initialLifeTotalRef.current === null) {
      initialLifeTotalRef.current = player.lifeTotal - recentDifference;
    }

    recentDifferenceTimerRef.current = setTimeout(() => {
      // Record history after animation completes
      if (initialLifeTotalRef.current !== null) {
        const finalLifeTotal = player.lifeTotal;
        const damageSources = Array.from(damageSourcesMapRef.current.values());

        addLifeHistoryEvent({
          playerId: player.index,
          playerName: player.name || `Player ${player.index + 1}`,
          playerColor: player.color,
          oldTotal: initialLifeTotalRef.current,
          newTotal: finalLifeTotal,
          difference: finalLifeTotal - initialLifeTotalRef.current,
          timestamp: Date.now(),
          damageSources: damageSources.length > 0 ? damageSources : undefined,
        });

        initialLifeTotalRef.current = null;
        damageSourcesMapRef.current.clear();
      }

      setRecentDifference(0);
    }, recentDifferenceTTL);

    return () => {
      clearTimeout(recentDifferenceTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentDifference]);

  const handleLifeChange = (
    updatedLifeTotal: number,
    commanderDamageContext?: {
      opponentId: number;
      opponentName: string;
      opponentColor: string;
      isPartner: boolean;
    }
  ) => {
    const difference = updateLifeTotal(player, updatedLifeTotal);

    // Accumulate commander damage sources
    if (commanderDamageContext) {
      const key = `${commanderDamageContext.opponentId}-${commanderDamageContext.isPartner}`;
      const existing = damageSourcesMapRef.current.get(key);

      if (existing) {
        // Accumulate amount for this source
        existing.amount += difference;
      } else {
        // Add new damage source
        damageSourcesMapRef.current.set(key, {
          ...commanderDamageContext,
          amount: difference,
        });
      }
    }

    setRecentDifference(recentDifference + difference);
    setDifferenceKey(Date.now());
  };

  const toggleGameLost = () => {
    const updatedPlayer = { ...player, hasLost: !player.hasLost };
    updatePlayer(updatedPlayer);
  };

  const calcRotation =
    player.settings.rotation === Rotation.SideFlipped ||
    player.settings.rotation === Rotation.Side
      ? player.settings.rotation - 90
      : player.settings.rotation;

  const amountOfPlayers = opponents.length + 1;

  const isSideRotation =
    player.settings.rotation === Rotation.Side ||
    player.settings.rotation === Rotation.SideFlipped;

  return (
    <LifeCounterContentWrapper style={{ background: player.color }}>
      <LifeCounterWrapper
        $rotation={player.settings.rotation}
        style={{ rotate: `${calcRotation}deg` }}
      >
        {commanderArtUrl && (
          <div
            aria-hidden
            className="absolute z-[-1] isolate overflow-hidden pointer-events-none [container-type:size]"
            style={
              // Starts right after the commander-damage bar (10vmin / 6vmax).
              isSideRotation
                ? { top: 0, bottom: 0, left: '6vmax', right: 0 }
                : { top: '10vmin', bottom: 0, left: 0, right: 0 }
            }
          >
            {/* Sized to this region (width/height swapped for the side seats so
                that after the -90deg turn its footprint is still the region),
                so `background-position` actually controls the crop instead of
                the art always being centre-clipped. 50% 20% = keep the top of
                the art (the commander), crop the sides and bottom. */}
            <div
              className="absolute left-1/2 top-1/2 bg-cover bg-no-repeat"
              style={{
                width: isSideRotation ? '100cqh' : '100cqw',
                height: isSideRotation ? '100cqw' : '100cqh',
                // Match the net on-screen rotation of the life number: the
                // wrapper already contributes calcRotation (0 or 180); side
                // seats need a further -90 to end up facing the player.
                transform: `translate(-50%, -50%) rotate(${
                  isSideRotation ? -90 : 0
                }deg)`,
                backgroundImage: `url("${commanderArtUrl}")`,
                backgroundPosition: '50% 20%',
              }}
            />
            {/* Same treatment as the opponent art in the damage bar: the
                player's colour multiplied over the art - dims for legibility
                and casts the art toward the player's hue. */}
            <div
              className="absolute inset-0 mix-blend-multiply"
              style={{ backgroundColor: player.color, opacity: 0.55 }}
            />
            <div className="absolute inset-0 bg-black/15" />
          </div>
        )}
        {amountOfPlayers > 1 &&
          !playing &&
          settings.showStartingPlayer &&
          player.isStartingPlayer && <StartingPlayerCard player={player} />}
        {/* Blocks every tap on the card except the cog above it: once out, a
            player only comes back through the skull in their player menu. */}
        {player.hasLost && (
          <PlayerLostWrapper $rotation={player.settings.rotation} />
        )}
        <CommanderDamageBar
          opponents={opponents}
          player={player}
          key={player.index}
          handleLifeChange={handleLifeChange}
        />
        {matchScore !== undefined && matchScore > 0 && (
          <MatchScoreBadge
            $rotation={player.settings.rotation}
            $useCommanderDamage={player.settings.useCommanderDamage}
            style={{
              rotate:
                player.settings.rotation === Rotation.Side ||
                player.settings.rotation === Rotation.SideFlipped
                  ? `-90deg`
                  : '0deg',
            }}
          >
            {/* Same treatment as the cog: light or dark by card colour, 50%. */}
            <Trophy
              size="100%"
              data-contrast={displayPlayer.iconTheme}
              className="absolute inset-0 opacity-50 data-[contrast=dark]:text-icons-dark data-[contrast=light]:text-icons-light"
            />
            {/* Spans the trophy's cup (y 64-300 of its 512 viewBox), in the
                opposite tone so it reads against the cup. */}
            <span
              data-contrast={displayPlayer.iconTheme}
              className="absolute inset-x-0 top-[12.5%] h-[46%] flex items-center justify-center data-[contrast=dark]:text-icons-light data-[contrast=light]:text-icons-dark"
            >
              {matchScore}
            </span>
          </MatchScoreBadge>
        )}
        <SettingsButton
          onClick={() => {
            setShowPlayerMenu(!showPlayerMenu);
          }}
          rotation={player.settings.rotation}
          iconTheme={displayPlayer.iconTheme}
        />
        {onFinishGame ? (
          <FinishGameButton
            rotation={player.settings.rotation}
            onClick={onFinishGame}
          />
        ) : (
          playerCanLose(player) &&
          !player.hasLost && (
            <LoseGameButton
              rotation={player.settings.rotation}
              onClick={toggleGameLost}
            />
          )
        )}
        <Health
          player={displayPlayer}
          rotation={player.settings.rotation}
          differenceKey={differenceKey}
          recentDifference={recentDifference}
          handleLifeChange={handleLifeChange}
          hasCommanderArt={!!commanderArtUrl}
        />

        <ExtraCountersBar player={displayPlayer} />
        <PlayerMenu
          isShown={showPlayerMenu}
          player={player}
          setShowPlayerMenu={setShowPlayerMenu}
          onForfeit={toggleGameLost}
          totalPlayers={opponents.length + 1}
        />
      </LifeCounterWrapper>
    </LifeCounterContentWrapper>
  );
};

export default LifeCounter;
