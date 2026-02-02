import styled, { keyframes } from "styled-components";
import { colors } from "@omilia/theme";

const quiet = keyframes`
  25%{
    transform: scaleY(0);
  }
  50%{
    transform: scaleY(0);
  }
  75%{
    transform: scaleY(0);
  }
`;

const normal = keyframes`
  25%{
    transform: scaleY(.3);
  }
  50%{
    transform: scaleY(.1);
  }
  75%{
    transform: scaleY(.4);
  }
`;

const loud = keyframes`
  25%{
    transform: scaleY(.5);
  }
  50%{
    transform: scaleY(.4);
  }
  75%{
    transform: scaleY(.7);
  }
`;

//-----------------------------------------keyframes--------------------------------------------------

export const getAnimation = (soundVolume: number) => {
  switch (soundVolume) {
    case 0:
      return quiet;
    case 1:
      return normal;
    case 2:
      return loud;
    default:
      return quiet;
  }
};
export const SBoxContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  --boxSize: 5px;
  --gutter: 3px;
  width: calc((var(--boxSize) + var(--gutter)) * 5);
`;

export const SSoundWaveContainer = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid white;
  background-color: ${colors.COLOR_BLUE_700};
  padding: 3px;
  margin: 3px;
`;

export const SBox = styled.div<{ soundVolume: number }>`
  transform: scaleY(0.4);
  height: ${({ soundVolume }: { soundVolume: number }) =>
    soundVolume <= 0  ? "15%" : "50%"};
  width: var(--boxSize);
  background: white;
  animation-duration: ${({ soundVolume }: { soundVolume: number }) =>
    soundVolume <= 0  ? "0" : "750ms"};
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  border-radius: 8px;
  animation-name: ${({ soundVolume }: { soundVolume: number }) =>
    getAnimation(soundVolume)};
`;
export const SBoxCenter = styled.div<{ soundVolume: number }>`
  transform: scaleY(0.4);
  height: ${({ soundVolume }: { soundVolume: number }) =>
    soundVolume <= 0  ? "15%" : "70%"};
  width: var(--boxSize);
  background: white;
  animation-duration: ${({ soundVolume }: { soundVolume: number }) =>
    soundVolume <= 0   ? "0" : "750ms"};
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  border-radius: 8px;
  animation-name: ${({ soundVolume }: { soundVolume: number }) =>
    getAnimation(soundVolume)};
`;
