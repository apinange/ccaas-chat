import styled from "styled-components";
import { colors } from "@omilia/theme";
import Button from "@omilia/button";

export const SMainContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  min-width: 600px;
  display: flex;
  flex-direction: row;
`;
export const SLeftBox = styled.div`
  width: 30%;
  min-height: 100vh;
  // background-color: ${colors.COLOR_BLACK};
`;
export const SCenterBox = styled.div`
  width: 40%;
  min-height: 100vh;
  // background-color: ${colors.COLOR_BLACK};
`;
export const SRightBox = styled.div`
  width: 30%;
  min-height: 100vh;
  // background-color: ${colors.COLOR_BLACK};
`;
export const SBoxRadius = styled.div`
  position: relative;
  background: white;
  border-radius: 6px;
  border: 1px solid #e1e1e1;
  box-shadow: 5px 10px 20px 0 rgba(0, 0, 0, 0.15);
  margin: 5px;
  max-width: 350px;
  min-width: 330px;
  padding: 35px;
`;

export const SCard = styled.div`
  border: solid 1px ${colors.COLOR_GREY_300};
  background-color: ${colors.COLOR_CYAN_500};
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.6);
  border-radius: 5px;
  margin: 10px;
  padding: 5px;
`;

export const SButtonsGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 5px;
`;

export const SBigButton = styled(Button)`
  width: 270px;
  margin-top: 10px;
`;

export const SCircle = styled.div`
  align-items: center;
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.6);
  background-color: ${colors.COLOR_GREEN_400};
  border-radius: 50%;
  display: flex;
  height: 100px;
  width: 100px;
  justify-content: center;
`;
export const SCircleScore = styled.span`
  font-size: 33px;
`;

export const getColorByScore = (score: number) => {
  if (score >= 0 && score <= 15) {
    return colors.COLOR_RED_800;
  }

  if (score >= 15 && score <= 30) {
    return colors.COLOR_RED_600;
  }

  if (score >= 30 && score <= 45) {
    return colors.COLOR_ORANGE_700;
  }

  if (score >= 45 && score <= 60) {
    return colors.COLOR_ORANGE_300;
  }

  if (score >= 60 && score <= 75) {
    return colors.COLOR_GREEN_300;
  }

  if (score >= 75 && score <= 90) {
    return colors.COLOR_GREEN_600;
  }
  if (score >= 90 && score <= 100) {
    return colors.COLOR_GREEN_900;
  }

  return "";
};
