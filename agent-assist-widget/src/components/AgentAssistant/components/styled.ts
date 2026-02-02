import styled, { css, keyframes } from "styled-components";
import { Text } from "@omilia/typography";
import { ReactComponent as SpoofIcon } from "../../../icons/SpoofIcon.svg";

import {
  AgeGenderMatchStatusType,
  FALSE_LOW,
  TRUE_HIGH,
  TRUE_LOW,
  TRUE_MEDIUM,
} from "../../../types";
import { colors } from "@omilia/theme";
import {
  NotificationVerifyIcon,
  NotificationErrorIcon,
  UserEnrolledIcon,
  UserNotEnrolledIcon,
} from "@omilia/icon";

const pulse = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
`;
export const SToastBoxContainer = styled.div`
  background-color: ${colors.COLOR_OMILIA_BLUE_100};
  border: 1px solid ${colors.COLOR_OMILIA_BLUE_200};
  color: black;
  padding: 10px;
  padding-top: 25px;
  width: 100%;
  border-radius: 12px;
`;

export const SToastBoxTitleContainer = styled.div`
  position: absolute;
  top: 9px;
  left: 9px;
  border-radius: 8px;
  background-color: ${colors.COLOR_OMILIA_BLUE_700};
  color: white;
  width: 115px;
  height: 20px;
  font-size: 10px;
  justify-content: space-evenly;
  display: flex;
  align-items: center;
`;

export const SToastBoxBodyContainer = styled.div``;
export const SToastBoxText = styled(Text)`
  padding-left: 5px;
`;

export const SToastBodyText = styled.div`
  font-size: 12px;
  font-weight: lighter;
  // animation: ${pulse} 5s ease-in;
`;
export const SScoresContainer = styled.div`
  padding-top: 5px;
  display: flex;
  justify-content: space-between;
`;

//-----------------------------------Prompts Component Style----------------------------------
export const SThumbsContainer = styled.div`
  width: 100px;
  display: flex;
  align-items: end;
`;

export const PromptContainer = styled.div`
  padding-top: 5px;
  border-bottom: 1px solid white;
`;

export const SIconContainerS = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
  margin: 5px;
`;

export const SPromptBodyContainer = styled.div`
  display: flex;
  padding-bottom: 10px;
`;

export const SStatusIconButtonContainer = styled.div`
  position: absolute;
  right: 20px;
  bottom: 20px;
`;

//---------------------------AI SUGGESTIONS ----------------------------

export const SThumbContainer2 = styled.div<{
  isActive: boolean;
  borderColor: string;
  backgroundColor: string;
}>`
  ${() => css`
    width: 35px;
    height: 35px;
    display: flex;
    color: black;
    justify-content: center;
    align-items: center;
    background-color: ${({ backgroundColor }) => backgroundColor};
    border-radius: 8px;
    border: ${({ borderColor }) => `1px solid ${borderColor} `};
    :checked + && {
      background-color: orange;
    }
  `}
`;

export const SThumbContainer = styled.div<{
  isActive: boolean;
  borderColor: string;
  backgroundColor: string;
}>`
  width: 35px;
  height: 35px;
  display: flex;
  color: black;
  justify-content: center;
  align-items: center;
  background-color: ${({ isActive, backgroundColor, borderColor }) =>
    isActive ? borderColor : backgroundColor};
  border-radius: 8px;
  border: ${({ isActive, backgroundColor, borderColor }) =>
    isActive ? `1px solid ${backgroundColor} ` : `1px solid ${borderColor} `};
  :active {
    box-shadow: 0 1px #666;
    transform: translateY(1px);
    background-color: ${({ borderColor }) => borderColor};
    border: ${({ backgroundColor }) => `1px solid ${backgroundColor} `};
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;
export const SAISuggestionsContainer = styled.div`
  animation: ${fadeIn} 1.5s ease-in-out;
`;

export const SAISuggestionsText = styled.div`
  padding: 15px;
  animation: ${pulse} 3s ease-in;
`;

export const SAISuggestionsButtonsContainer = styled.div`
  width: 100%;
  display: flex;
  gap: 5px;
  position: relative;
  justify-content: end;
`;

//-----------------------------Chat History Style-------------------------

export const SChatHistoryContainer = styled.div`
  padding-top: 5px;
  border-bottom: 1px solid white;
`;

export const SChatHistoryBodyContainer = styled.div`
  display: flex;
  padding-bottom: 10px;
`;

export const SChatInfoContainer = styled.div``;

//------------------------------Identification Style-----------------------------------

export const SCheckBadgeWrapper = styled.div<{ backgroundColor: string }>`
  position: absolute;
  bottom: 20px;
  right: 30px;
  width: 25px;
  height: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ backgroundColor }) => backgroundColor};
  border-radius: 50%;
`;

export const SIconTextContainer = styled.div`
  display: flex;
  width: 100%;
`;

export const SIconTextTitleContainer = styled.div`
  display: flex;
  padding-top: 5px;
`;

export const SLozengeContainer = styled.div`
  //padding: 5px;
  width: 100%;
  padding-left: 10px;
  display: flex;
  gap: 5px;
`;

export const SBodyContainer = styled.div`
  padding-top: 10px;
`;

export const SUserBioDataContainer = styled.div<{ isBlocklisted: boolean }>`
  align-items: center;
  background-color: ${colors.COLOR_WHITE};
  border: ${({ isBlocklisted }) =>
    isBlocklisted
      ? `2px solid ${colors.COLOR_RED_500}`
      : `1px solid ${colors.COLOR_GREY_300}`};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  padding: 8px 4px 12px;
  position: relative;
`;

export const SUserBioHeader = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 8px;
  position: relative;
  width: 100%;
`;

export const SUserInfoBoxContainer = styled.div`
  width: 50%;
  justify-content: space-between;
`;
export const SFlexDiv = styled.div`
  display: flex;
`;

export const SUserInfoHeader = styled.div`
  display: flex;
  width: 100%;
  padding: 5px;
  // border-bottom: 2px solid ${colors.COLOR_GREY_700};
`;
export const SUserInfoRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  padding: 5px;
  justify-content: space-between;
`;

export const SCustomLongLozenge = styled.div<{
  background: string;
  color: string;
}>`
  width: 100%;
  height: 25px;
  display: flex;
  margin-bottom: 5px;
  font-size: 13px;
  font-weight: bold;
  align-items: center;
  justify-content: center;
  background-color: ${({ background }) => background};
  color: ${({ color }) => color};
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

const SSpoof = styled(SpoofIcon)`
  width: 12px;
  height: 12px;
  color: ${colors.COLOR_RED_900};
`;

export const getTTSIcon = (ttsLabel: string) => {
  if (ttsLabel === "GENUINE") {
    return NotificationVerifyIcon;
  } else if (ttsLabel === "SYNTHETIC") {
    return SSpoof;
  } else {
    return NotificationErrorIcon;
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

export const getVerifyImage = (verifyStatus: boolean) => {
  return verifyStatus ? UserEnrolledIcon : UserNotEnrolledIcon;
};
export const getVerifyBackgroundColor = (verifyStatus: boolean) => {
  return verifyStatus ? colors.COLOR_GREEN_200 : colors.COLOR_RED_200;
};

export const getTTSColor = (ttsStatus: string) => {
  return ttsStatus === "GENUINE"
    ? colors.COLOR_GREEN_700
    : colors.COLOR_RED_700;
};
export const getTTSBackgroundColor = (ttsStatus: string) => {
  return ttsStatus === "GENUINE"
    ? colors.COLOR_GREEN_200
    : colors.COLOR_RED_200;
};
export const getVerifyColor = (verifyStatus: boolean) => {
  return verifyStatus ? colors.COLOR_GREEN_700 : colors.COLOR_RED_700;
};
export const SUserInfoValueContainer = styled.div`
  width: 150px;
  display: flex;
  padding-left: 5px;
  justify-content: space-between;
  // justify-content: space-around;
`;
export const SVerificationIconContainer = styled.div`
  display: flex;
  position: relative;
  right: 0;
  justify-content: end;
`;

// @ts-ignore
export const STextWithColorByStatus = styled<{
  status: AgeGenderMatchStatusType;
}>(Text)`
  padding-left: 5px;
  color: ${({ status }) => getColorForAgeAndGenderByStatus(status)};
`;

export const getColorForAgeAndGenderByStatus = (
  status: AgeGenderMatchStatusType | undefined | null | any
) => {
  switch (status) {
    case "UNKNOWN":
      return colors.COLOR_GREY_700;
    case "NOT_VERIFIED":
      return colors.COLOR_GREY_700;
    case "BIO_ESTIMATION":
      return colors.COLOR_GREEN_700;
    case "MATCH_HIGH":
      return colors.COLOR_BLUE_700;
    case "MATCH_MEDIUM":
      return colors.COLOR_ORANGE_700;
    case "MATCH_LOW":
      return colors.COLOR_RED_700;
    default:
      return colors.COLOR_GREY_700;
  }
};

//------------------------------Notes-----------------------------------

export const SNoteContainer = styled.div`
  padding-top: 5px;
  display: flex;
  justify-content: space-between;
`;
