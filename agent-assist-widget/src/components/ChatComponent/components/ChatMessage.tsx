import React from "react";
import { useTranslation } from "react-i18next";
import {
  SCircleBlack,
  SMessageBox,
  SMessageBoxContainer,
  SMessageBoxIconContainer,
} from "../../styled";
import AudioPlayer from "./AudioPlayer";
import TranscriptionText from "./TranscriptionText";
import { TranscriptionType } from "../../types";
import { _conf } from "../../../config";
import styled from "styled-components";

interface ChatMessageProp {
  text: string;
  isUser: boolean;
  isFinal: boolean;
  transcriptionData?: TranscriptionType;
}

const SMessageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const getAudioUrl = (audioFile?: string, audioUrl?: string): string | null => {
  if (audioUrl) {
    return audioUrl.startsWith("http") ? audioUrl : `${_conf.REACT_APP_API}/${audioUrl}`;
  }
  if (audioFile) {
    const baseUrl = _conf.REACT_APP_WS.replace("ws://", "http://").replace("wss://", "https://");
    return `${baseUrl}/uploads/${audioFile}`;
  }
  return null;
};

const ChatMessage = ({ text, isUser, isFinal, transcriptionData }: ChatMessageProp) => {
  const { t } = useTranslation();
  
  const audioUrl = transcriptionData
    ? getAudioUrl(transcriptionData.audio_file, transcriptionData.audio_url)
    : null;
  const transcription = transcriptionData?.transcription || text;

  return (
    <SMessageBoxContainer isUser={isUser}>
      <SMessageBoxIconContainer>
        {isUser ? (
          <SCircleBlack>{t('chat.user', 'U')}</SCircleBlack>
        ) : (
          <SCircleBlack>{t('chat.agent', 'A')}</SCircleBlack>
        )}
      </SMessageBoxIconContainer>
      <SMessageBox isUser={isUser}>
        <SMessageContent>
          {audioUrl && (
            <AudioPlayer audioUrl={audioUrl} isUser={isUser} />
          )}
          {transcription && (
            <TranscriptionText
              transcription={transcription}
              isUser={isUser}
            />
          )}
        </SMessageContent>
      </SMessageBox>
    </SMessageBoxContainer>
  );
};

export default ChatMessage;
