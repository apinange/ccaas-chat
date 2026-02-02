import React from "react";
import {
  SIconTextTitleContainer,
  SScoresContainer,
  SToastBodyText,
  SToastBoxBodyContainer,
  SToastBoxText,
} from "./styled";
import { ReactComponent as Sparkles } from "../../../icons/Sparkles.svg";
import { colors } from "@omilia/theme";

type Props = {
  title: string;
  summary: string;
};
const SummaryComponent = ({ title, summary }: Props) => {
  return (
    <>
      <SToastBoxBodyContainer>
        <SIconTextTitleContainer>
          <Sparkles
            style={{
              width: "17px",
              height: "17px",
              color: colors.COLOR_YELLOW_700,
            }}
          />
          <SToastBoxText level={1}> {title}</SToastBoxText>
        </SIconTextTitleContainer>
        <SToastBodyText>{summary}</SToastBodyText>
      </SToastBoxBodyContainer>
      <SScoresContainer>
        {/*<SToastBoxText level={4}>Result Confidence: 92.5%</SToastBoxText>*/}
        {/*<SToastBoxText level={4}>World Confidence: 87.4%</SToastBoxText>*/}
      </SScoresContainer>
      {/*<StatusIconButton />*/}
    </>
  );
};

export default SummaryComponent;
