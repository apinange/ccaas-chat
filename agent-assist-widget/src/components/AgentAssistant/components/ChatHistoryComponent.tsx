import React from "react";
import {
  SChatHistoryBodyContainer,
  SChatHistoryContainer,
  SChatInfoContainer,
  SToastBodyText,
  SToastBoxText,
} from "./styled";
import { colors } from "@omilia/theme";
import { ReactComponent as Sparkles } from "../../../icons/Sparkles.svg";

type Props = {
  title: string;
  msg: string;
  date: string;
  duration: string;
};
const ChatHistoryComponent = ({ title, msg, date, duration }: Props) => {
  return (
    <SChatHistoryContainer>
      <SToastBoxText level={1}>
        <Sparkles
          style={{
            width: "17px",
            height: "17px",
            color: colors.COLOR_WHITE,
          }}
        />
        {title}
      </SToastBoxText>
      <SChatHistoryBodyContainer>
        <SToastBodyText>{msg}</SToastBodyText>
        <SChatInfoContainer>
          <>
            <SToastBoxText level={1}>Date:</SToastBoxText>
            <SToastBoxText level={2}>{date}</SToastBoxText>
          </>
          <>
            <SToastBoxText level={1}>Duration: {duration}</SToastBoxText>
            <SToastBoxText level={2}>{duration}</SToastBoxText>
          </>
        </SChatInfoContainer>
      </SChatHistoryBodyContainer>
    </SChatHistoryContainer>
  );
};

export default ChatHistoryComponent;
