import styled from "styled-components";
import { colors } from "@omilia/theme";

export const SChatBoxContainer = styled.div`
  height: 150px;
  overflow: auto;
  background-color: transparent;
  // border: solid 1px ${colors.COLOR_BLACK};
  border-radius: 5px;
  margin: 5px;
  //padding: 5px;
`;

export const SMessageBoxContainer = styled.div<{ isUser: boolean }>`
  display: flex;
  flex-direction: ${({ isUser }) => (isUser ? "row-reverse" : "row")};
`;

export const SCircleBlack = styled.div`
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.COLOR_WHITE};
  background-color: ${colors.COLOR_BLACK};
`;

export const SMessageBoxIconContainer = styled.div`
  margin: 5px;
`;
export const SMessageBox = styled.div<{ isUser: boolean }>`
  background-color: ${({ isUser }) =>
    isUser ? colors.COLOR_OMILIA_BLUE_600 : colors.COLOR_WHITE};
  color: ${({ isUser }) => (isUser ? colors.COLOR_WHITE : colors.COLOR_BLACK)};
  font-size: 10px;
  border-radius: 8px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  margin: 5px;
  padding: 10px;
  min-width: 200px;
  max-width: 80%;
`;

export const SGreenMessageBox = styled.div`
  background-color: ${colors.COLOR_GREEN_200};
  border-radius: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px;
  padding: 15px;
`;

export const SPurpleMessageBox = styled.div`
  background-color: ${colors.COLOR_PURPLE_900};
  color: white;
  border-radius: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px;
  padding: 15px;
`;
