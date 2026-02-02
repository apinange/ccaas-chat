import React, { useState } from "react";
import styled from "styled-components";
import { colors } from "@omilia/theme";

interface TranscriptionTextProps {
  transcription: string;
  isUser: boolean;
  maxLength?: number;
}

const STranscriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const STranscriptionText = styled.div<{ isUser: boolean }>`
  font-size: 9px;
  color: ${({ isUser }) =>
    isUser ? "rgba(255, 255, 255, 0.9)" : colors.COLOR_BLACK};
  line-height: 1.4;
  word-wrap: break-word;
`;

const SShowMoreButton = styled.button<{ isUser: boolean }>`
  background: none;
  border: none;
  font-size: 10px;
  color: ${({ isUser }) =>
    isUser ? "rgba(255, 255, 255, 0.8)" : colors.COLOR_OMILIA_BLUE_600};
  cursor: pointer;
  padding: 0;
  text-align: left;
  text-decoration: underline;
  margin-top: 4px;

  &:hover {
    opacity: 0.8;
  }
`;

const TranscriptionText: React.FC<TranscriptionTextProps> = ({
  transcription,
  isUser,
  maxLength = 150,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = transcription.length > maxLength;
  const displayText = isExpanded || !shouldTruncate
    ? transcription
    : `${transcription.substring(0, maxLength)}...`;

  if (!transcription) {
    return null;
  }

  return (
    <STranscriptionContainer>
      <STranscriptionText isUser={isUser}>"{displayText}"</STranscriptionText>
      {shouldTruncate && (
        <SShowMoreButton
          isUser={isUser}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Mostrar menos" : "Mostrar mais"}
        </SShowMoreButton>
      )}
    </STranscriptionContainer>
  );
};

export default TranscriptionText;

