import { Rotation } from '../../Types/Player';

import { twc } from 'react-twc';
//TODO Create provider for this

const Container = twc.div`
  flex
  relative
  w-full
  h-full
  items-center
  justify-center
  `;

const CenteredText = twc.div`absolute select-none text-common-black text-[6vmin] stroke-common-white
webkit-user-select-none tabular-nums`;

const CenteredTextOutline = twc.span`
  absolute
  left-0
  stroke-none
  pointer-events-none
  `;

type OutlinedTextProps = {
  children?: React.ReactNode;
  fontSize?: string;
  fontWeight?: string;
  strokeWidth?: string;
  strokeColor?: string;
  fillColor?: string;
  rotation?: Rotation;
};

export const OutlinedText: React.FC<OutlinedTextProps> = ({
  children,
  fontSize,
  fontWeight,
  strokeWidth,
  strokeColor,
  fillColor,
  rotation,
}) => {
  const calcRotation =
    rotation === Rotation.Side
      ? rotation - 180
      : rotation === Rotation.SideFlipped
      ? rotation
      : 0;

  return (
    <Container>
      <CenteredText
        style={{
          fontSize,
          fontWeight,
          strokeWidth: strokeWidth || '1vmin',
          color: fillColor || 'var(--color-common-black)',
          WebkitTextStroke: `${strokeWidth || '1vmin'} ${
            strokeColor ||
            'color-mix(in srgb, var(--color-common-white) 60%, transparent)'
          }`,
          WebkitTextFillColor:
            fillColor || 'var(--color-common-black)',
          rotate: `${calcRotation}deg`,
        }}
      >
        {children}
        <CenteredTextOutline aria-hidden style={{ WebkitTextStroke: 0 }}>
          {children}
        </CenteredTextOutline>
      </CenteredText>
    </Container>
  );
};
