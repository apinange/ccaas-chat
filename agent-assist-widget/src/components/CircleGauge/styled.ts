import styled from "styled-components";
import { colors } from "@omilia/theme";
import {
  FALSE_HIGH,
  FALSE_LOW,
  FALSE_MEDIUM, NO_DATA,
  TRUE_HIGH,
  TRUE_LOW,
  TRUE_MEDIUM,
} from "../../types";

export const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const Circle = styled.circle`
  fill: transparent;
  stroke: hsla(225, 20%, 92%, 0.9);
  stroke-linecap: round;
`;

export const FilledCircle = styled(Circle)<{ result: string }>`
  stroke: ${({ result }: { result: string }) =>
    getGaugeColorByResult(result) || "none"};
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dashoffset 0.5s ease-out;
`;

export const Text = styled.div<{ result: string }>`
  align-items: center;
  color: ${({ result }: { result: string }) =>
    getGaugeColorByResult(result) || "none"};
  font-size: 9px;
  display: flex;
  font-weight: bold;
  height: 100%;
  justify-content: center;
  left: 0;
  letter-spacing: 0.025em;
  margin-bottom: 0.5rem;
  position: absolute;
  right: 0;
  top: 0;
  width: 100%;
  z-index: 100;
`;
export const SCircleProgressContainer = styled.div<{ size: number }>`
  display: block;
  overflow: hidden;
  position: absolute;
  border-radius: 50%;
  bottom: 25px;
  left: 25px;
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
`;

export const SProgressText = styled.div`
  color: hsla(225, 23%, 62%, 1);
  font-weight: bold;
  letter-spacing: 0.025em;
  margin-bottom: 1rem;
  text-align: center;
  width: 100%;
`;

export const SProgressBar = styled.div`
  background: hsla(225, 20%, 92%, 0.9);
  border-radius: 0.5rem;
  height: 0.75rem;
  width: 100%;
`;
export const SFilledBar = styled(SProgressBar)<{ width: number }>`
  background: hsla(225, 23%, 72%, 0.9);
  transition: width 0.5s ease-out;
  width: ${(props) => props.width}%;
`;

export const getGaugeColorByResult = (result: string) => {
  switch (result) {
    case NO_DATA:
      return colors.COLOR_WHITE
    case FALSE_HIGH:
      return colors.COLOR_RED_300;
    case FALSE_MEDIUM:
      return colors.COLOR_RED_500;
    case FALSE_LOW:
      return colors.COLOR_ORANGE_500;
    case TRUE_LOW:
      return colors.COLOR_YELLOW_500;
    case TRUE_MEDIUM:
      return colors.COLOR_GREEN_300;
    case TRUE_HIGH:
      return colors.COLOR_GREEN_500;
    default:
      return colors.COLOR_GREY_700;
  }
};
export const getGaugeColor = (score: number, thresholds: string[]) => {
  if (score >= 0 && score <= Number(thresholds[0])) {
    return colors.COLOR_RED_800;
  }

  if (score >= Number(thresholds[0]) && score <= Number(thresholds[1])) {
    return colors.COLOR_RED_600;
  }

  if (score >= Number(thresholds[1]) && score <= Number(thresholds[2])) {
    return colors.COLOR_ORANGE_600;
  }

  if (score >= Number(thresholds[2]) && score <= Number(thresholds[3])) {
    return colors.COLOR_YELLOW_600;
  }

  if (score >= Number(thresholds[3]) && score <= Number(thresholds[4])) {
    return colors.COLOR_GREEN_600;
  }

  if (score >= Number(thresholds[4]) && score <= 1) {
    return colors.COLOR_GREEN_800;
  }

  return "";
};
