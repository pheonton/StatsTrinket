import { twc } from 'react-twc';
import { Skull, Trophy } from '../../Icons/generated';
import { Rotation } from '../../Types/Player';
import { RotationDivProps } from './CommanderDamage';

const LoseButton = twc.div<RotationDivProps>((props) => [
  'absolute flex-grow border-none outline-none cursor-pointer bg-interface-loseButton-background rounded-lg select-none z-[1] webkit-user-select-none py-2 px-4 ',

  props.$rotation === Rotation.SideFlipped || props.$rotation === Rotation.Side
    ? `left-[21%]`
    : 'top-[21%]',
]);

type LoseButtonProps = {
  onClick: () => void;
  rotation: Rotation;
};

const iconRotation = (rotation: Rotation) =>
  rotation === Rotation.SideFlipped
    ? rotation
    : rotation === Rotation.Side
    ? rotation - 180
    : rotation === Rotation.Flipped
    ? rotation - 180
    : rotation;

// Shown on the last player still in after "Back to Game"; reopens the end screen.
export const FinishGameButton = ({ rotation, onClick }: LoseButtonProps) => (
  <LoseButton
    $rotation={rotation}
    onClick={onClick}
    aria-label="Finish Game"
    style={{ rotate: `${iconRotation(rotation)}deg` }}
  >
    <Trophy size="8vmin" className="text-icons-gold motion-safe:animate-wiggleBurst" />
  </LoseButton>
);

export const LoseGameButton = ({ rotation, onClick }: LoseButtonProps) => {
  const calcRotation = iconRotation(rotation);

  return (
    <LoseButton
      $rotation={rotation}
      onClick={onClick}
      aria-label={`Lose Game`}
      style={{ rotate: `${calcRotation}deg` }}
    >
      <Skull size="8vmin" className="text-red-500 motion-safe:animate-wiggleBurst" />
    </LoseButton>
  );
};
