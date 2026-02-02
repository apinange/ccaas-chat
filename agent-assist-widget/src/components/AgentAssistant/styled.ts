import styled from "styled-components";
import { colors } from "@omilia/theme";
import { TableBodyCell } from "@omilia/table";

export const SMainCircleButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  box-shadow: 0 0 0 8px ${colors.COLOR_OMILIA_BLUE_400};
  background-color: ${colors.COLOR_OMILIA_BLUE_700};
  // box-shadow: 0 0 0 9px ${colors.COLOR_GREY_700};
`;
export const SMainExpandedMenu = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 7px;
  align-items: center;
  height: 50px;
  max-width: 550px;
  border-radius: 32px;
  background-color: ${colors.COLOR_OMILIA_BLUE_600};
  box-shadow: 0 0 0 5px ${colors.COLOR_OMILIA_BLUE_600};
`;

export const SButtonContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 10px;
  z-index: 999;
`;

export const SLongButton = styled.div<{ backgroundColor: string }>`
  background-color: ${({ backgroundColor }) => backgroundColor};
  padding: 1%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 45px;
  width: 135px;
  border-radius: 24px;
  color: white;
  font-size: 8px;
  cursor: pointer;
`;

export const SWhiteLine = styled.div`
  height: 37px;
  width: 2px;
  background-color: white;
`;

export const SIconContainer = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${colors.COLOR_OMILIA_BLUE_700};
  margin: 5px;
`;

export const SIconContainerWithBackgroundColor = styled.div<{
  backgroundColor: string;
}>`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ backgroundColor }) => backgroundColor};
  margin: 5px;
`;

export const SSmallIconContainer = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${colors.COLOR_OMILIA_BLUE_900};
  margin: 3px;
`;

export const SDoubleIconContainer = styled.div`
  width: 80px;
  height: 40px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: ${colors.COLOR_OMILIA_BLUE_700};
  margin: 5px;
`;

export const getColorByStatus = (status: string | undefined | null) => {
  switch (status) {
    case "ACTIVE":
      return colors.COLOR_GREEN_700;
    case "NOT_ENROLLED":
      return colors.COLOR_RED_700;
    default:
      return colors.COLOR_GREY_700;
  }
};

export const getColorByRiskLevel = (riskLevel: string | undefined | null) => {
  console.log("RISK LEVEL IN GET COLOR", riskLevel);
  switch (riskLevel) {
    case "LOW_RISK":
      return colors.COLOR_GREEN_700;
    case "MEDIUM_RISK":
      return colors.COLOR_YELLOW_700;
    case "HIGH_RISK":
      return colors.COLOR_RED_700;
    case "FRAUD":
      return colors.COLOR_RED_700;
    default:
      return colors.COLOR_OMILIA_BLUE_700;
  }
};

export const STableLeftBodyCell = styled(TableBodyCell)`
  font-weight: bold;
`;
export const STableRightBodyCell = styled(TableBodyCell)`
  td{
    padding: 3px; !important;
  }
`;
