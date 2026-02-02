import React from "react";
import {
  PromptContainer,
  SIconContainerS,
  SIconTextTitleContainer,
  SPromptBodyContainer,
  SThumbsContainer,
  SToastBodyText,
  SToastBoxText,
} from "./styled";
import { ReactComponent as Sparkles } from "../../../icons/Sparkles.svg";
import { ReactComponent as HandThumbDown } from "../../../icons/HandThumbDown.svg";
import { ReactComponent as HandThumbUp } from "../../../icons/HandThumbUp.svg";
import { colors } from "@omilia/theme";
type Props = {
  prompts: { title: string; msg: string }[];
};
const PromptsComponent = ({ prompts }: Props) => {
  return (
    <>
      {prompts.map((item: { title: string; msg: string }) => {
        return (
          <PromptContainer>
            <SIconTextTitleContainer>
              <Sparkles
                style={{
                  width: "17px",
                  height: "17px",
                  color: colors.COLOR_YELLOW_700,
                }}
              />
              <SToastBoxText level={1}> {item.title}</SToastBoxText>
            </SIconTextTitleContainer>
            <SPromptBodyContainer>
              <SToastBodyText>{item.msg}</SToastBodyText>
              <SThumbsContainer>
                <SIconContainerS>
                  <HandThumbDown
                    style={{
                      width: "17px",
                      height: "17px",
                      color: colors.COLOR_WHITE,
                    }}
                  />
                </SIconContainerS>
                <SIconContainerS>
                  <HandThumbUp
                    style={{
                      width: "17px",
                      height: "17px",
                      color: colors.COLOR_WHITE,
                    }}
                  />
                </SIconContainerS>
              </SThumbsContainer>
            </SPromptBodyContainer>
          </PromptContainer>
        );
      })}
    </>
  );
};

export default PromptsComponent;
