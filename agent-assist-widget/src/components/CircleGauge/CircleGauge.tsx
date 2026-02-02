import React from "react";
import {
  FALSE_HIGH,
  FALSE_LOW,
  FALSE_MEDIUM,
  TRUE_HIGH,
  TRUE_LOW,
  TRUE_MEDIUM,
} from "../../types";
import { capitalize } from "lodash-es";
import { Circle, Container, FilledCircle, Text } from "./styled";

export const getText = (score: number, thresholds: string[]) => {
  let scoreText = FALSE_HIGH;

  if (score >= 0 && score <= Number(thresholds[0])) {
    scoreText = FALSE_HIGH;
  }

  if (score >= Number(thresholds[0]) && score <= Number(thresholds[1])) {
    scoreText = FALSE_MEDIUM;
  }

  if (score >= Number(thresholds[1]) && score <= Number(thresholds[2])) {
    scoreText = FALSE_LOW;
  }

  if (score >= Number(thresholds[2]) && score <= Number(thresholds[3])) {
    scoreText = TRUE_LOW;
  }

  if (score >= Number(thresholds[3]) && score <= Number(thresholds[4])) {
    scoreText = TRUE_MEDIUM;
  }

  if (score >= Number(thresholds[4]) && score <= 1) {
    scoreText = TRUE_HIGH;
  }

  return capitalize(scoreText.replace("_", " ").toLocaleLowerCase());
};

interface Props {
  score: number;
  result: string;
  thresholdsArray: string[];
  label?: string;
  width?: number;
}

const CircleGauge = ({
  score,
  result,
  thresholdsArray,
  label,
  width = 40,
}: Props) => {
  const strokeWidth = 7;
  const radius = 100 / 2 - strokeWidth * 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - ((score * 100) / 100) * circumference;

  return (
    <Container>
      <svg
        aria-label={label}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={score * 100}
        height={width}
        role="progressbar"
        width={width}
        viewBox="0 0 100 100"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <Circle cx="50" cy="50" r={radius} strokeWidth={strokeWidth} />

        <FilledCircle
          cx="50"
          cy="50"
          data-testid="progress-bar-bar"
          r={radius}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeWidth={strokeWidth}
          result={result}
        />
      </svg>
      <Text result={result}>{Math.round(score * 100)}%</Text>
    </Container>
  );
};

export default CircleGauge;
