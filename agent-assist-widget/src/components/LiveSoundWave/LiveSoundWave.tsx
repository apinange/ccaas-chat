import React from "react";
import { SBox, SBoxCenter, SBoxContainer, SSoundWaveContainer } from "./styled";
import { SoundVolumeTypes } from "../../types";
import Tooltip from "@omilia/tooltip";
import { useTranslation } from "react-i18next";

interface Props {
  soundVolume: number;
  onClickTranscription: () => void;
}

const LiveSoundWave = ({ onClickTranscription, soundVolume = 0 }: Props) => {
  const { t } = useTranslation();
  return (
    <Tooltip content={t('features.currentConversation', 'Current Conversation')}>
      <SSoundWaveContainer onClick={onClickTranscription}>
        <SBoxContainer>
          <SBox soundVolume={soundVolume} />
          <SBoxCenter soundVolume={soundVolume} />
          <SBox soundVolume={soundVolume} />
        </SBoxContainer>
      </SSoundWaveContainer>
    </Tooltip>
  );
};

export default LiveSoundWave;
