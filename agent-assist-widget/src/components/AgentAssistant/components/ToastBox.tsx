import React from "react";
import { SToastBoxContainer, SToastBoxTitleContainer } from "./styled";

type Props = {
  toastProps?: {};
  category: string;
  children?: React.ReactNode;
};

const ToastBox = ({
  toastProps,
  category = "Transcription",
  children,
}: Props) => {
  return (
    <SToastBoxContainer>
      <SToastBoxTitleContainer>{category}</SToastBoxTitleContainer>

      <>{children}</>

      {/*{showedComponent(category)}*/}
      {/*{category == "Prompt" ? (*/}
      {/*  promptsArray.map((item) => (*/}
      {/*    <PromptsComponent title={item.title} msg={item.msg} />*/}
      {/*  ))*/}
      {/*) : (*/}
      {/*  <SummaryComponent msg={msg} />*/}
      {/*)}*/}
    </SToastBoxContainer>
  );
};

export default ToastBox;
