import styled from "styled-components";
import {
  NotificationVerifyIcon,
  NotificationErrorIcon,
  NotificationWarningIcon,
} from "@omilia/icon";
import { colors } from "@omilia/theme";
import { FALSE_LOW, TRUE_HIGH, TRUE_LOW, TRUE_MEDIUM } from "../../types";

export const SProgressBarContainer = styled.div`
  display: flex;
`;

export const SSpinnerContainer = styled.div`
  margin-right: 10px;
`;

export const SProgressIcon = styled.div``;

export const SScoreText = styled.div<{ bio_result: string }>`
  //height: 24px;
  //width: 33px;
  color: ${({ bio_result }) => getIconColor(bio_result)};
  font-family: Montserrat;
  font-size: 18px;
  letter-spacing: 0;
  justify-content: center;
  align-items: center;
  display: flex;
  text-align: center;
  margin-left: 10px;
`;
export const SLozengeContainer = styled.div`
  margin-left: 10px;
  height: 22px;
`;

export const getIconColor = (bioResult: string) => {
  if (bioResult === TRUE_MEDIUM || bioResult === TRUE_HIGH) {
    return colors.COLOR_GREEN_700;
  } else if (bioResult === FALSE_LOW || bioResult === TRUE_LOW) {
    return colors.COLOR_ORANGE_700;
  } else {
    return colors.COLOR_RED_700;
  }
};

export const getIconImage = (bioResult: string) => {
  if (bioResult === TRUE_MEDIUM || bioResult === TRUE_HIGH) {
    return NotificationVerifyIcon;
  } else if (bioResult === FALSE_LOW || bioResult === TRUE_LOW) {
    return NotificationErrorIcon;
  } else {
    return NotificationErrorIcon;
  }
};
