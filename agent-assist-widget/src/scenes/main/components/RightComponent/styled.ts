import styled from "styled-components";
import { colors } from "@omilia/theme";
import Button from "@omilia/button";

export const SContainer = styled.div`
  height: 100vh;
`;
export const SUpContainer = styled.div`
  height: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
`;
export const SDownContainer = styled.div`
  height: 50%;
`;
export const SCrmHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  height: 25px;
  background-color: ${colors.COLOR_GREY_500};
`;

export const SCrmBody = styled.div`
  height: calc(100% - 25px);
  background-color: ${colors.COLOR_BLUE_300};
  color: ${colors.COLOR_GREEN_300};
`;

export const SArticleButton = styled(Button)`
  height: 50px;
  margin: 10px;
`;
