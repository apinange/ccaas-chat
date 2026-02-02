import { useState } from "react";
import {
  SAISuggestionsButtonsContainer,
  SAISuggestionsContainer,
  SAISuggestionsText,
  SThumbContainer,
} from "./styled";
import { Text } from "@omilia/typography";
import { colors } from "@omilia/theme";
import { ReactComponent as ThumbsUp } from "../../../icons/ThumbsUp.svg";
import { ReactComponent as ThumbsDown } from "../../../icons/ThumbsDown.svg";
import { SuggestionType } from "../../../types";

interface Props {
  suggestionObj: SuggestionType;
}

const AISuggestionsComponent = ({ suggestionObj }: Props) => {
  const [clickedButton, setClickedButton] = useState<string>("");

  const clickedThumb = (thumb: string) => {
    setClickedButton(thumb);
    console.log(thumb);
  };

  // Ensure we have valid data
  if (!suggestionObj) {
    return (
      <SAISuggestionsContainer>
        <SAISuggestionsText>
          <Text level={3}>Carregando análise...</Text>
        </SAISuggestionsText>
      </SAISuggestionsContainer>
    );
  }

  const actionText = suggestionObj.suggestion || 'Ação não disponível';
  const reasoningText = suggestionObj.reasoning;

  return (
    <SAISuggestionsContainer>
      {reasoningText && (
        <SAISuggestionsText key={`reasoning-${actionText}`}>
          <Text level={3} style={{ marginBottom: '12px', fontWeight: 500 }}>
            {reasoningText}
          </Text>
        </SAISuggestionsText>
      )}
      <SAISuggestionsText key={actionText}>
        <Text level={3} style={{ fontWeight: 600, color: colors.COLOR_OMILIA_BLUE_700 }}>
          {actionText}
        </Text>
      </SAISuggestionsText>
      {suggestionObj.htmlString && !reasoningText && (
        <div dangerouslySetInnerHTML={{ __html: suggestionObj.htmlString }} />
      )}
      <SAISuggestionsButtonsContainer>
        <SThumbContainer
          isActive={clickedButton == "ThumbsUp"}
          onClick={() => clickedThumb("ThumbsUp")}
          borderColor={colors.COLOR_GREEN_900}
          backgroundColor={colors.COLOR_GREEN_300}
        >
          <ThumbsUp
            width={24}
            height={24}
            style={{
              color:
                clickedButton == "ThumbsUp"
                  ? colors.COLOR_GREEN_200
                  : colors.COLOR_GREEN_900,
            }}
          />
        </SThumbContainer>
        <SThumbContainer
          isActive={clickedButton == "ThumbsDown"}
          onClick={() => clickedThumb("ThumbsDown")}
          borderColor={colors.COLOR_RED_900}
          backgroundColor={colors.COLOR_RED_300}
        >
          <ThumbsDown
            width={24}
            height={24}
            style={{
              color:
                clickedButton == "ThumbsDown"
                  ? colors.COLOR_RED_200
                  : colors.COLOR_RED_900,
            }}
          />
        </SThumbContainer>
      </SAISuggestionsButtonsContainer>
    </SAISuggestionsContainer>
  );
};

export default AISuggestionsComponent;
