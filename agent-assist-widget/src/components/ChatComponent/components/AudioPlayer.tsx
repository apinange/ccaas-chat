import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { colors } from "@omilia/theme";

interface AudioPlayerProps {
  audioUrl: string;
  isUser: boolean;
}

const SAudioPlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const SAudioControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SPlayButton = styled.button<{ isUser: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background-color: ${({ isUser }) =>
    isUser ? colors.COLOR_WHITE : colors.COLOR_OMILIA_BLUE_600};
  color: ${({ isUser }) =>
    isUser ? colors.COLOR_OMILIA_BLUE_600 : colors.COLOR_WHITE};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6;
  }
`;

const SProgressContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SProgressBar = styled.div<{ isUser: boolean }>`
  flex: 1;
  height: 4px;
  background-color: ${({ isUser }) =>
    isUser ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.1)"};
  border-radius: 2px;
  position: relative;
  cursor: pointer;
`;

const SProgressFill = styled.div<{ progress: number; isUser: boolean }>`
  height: 100%;
  width: ${({ progress }) => `${progress}%`};
  background-color: ${({ isUser }) =>
    isUser ? colors.COLOR_WHITE : colors.COLOR_OMILIA_BLUE_600};
  border-radius: 2px;
  transition: width 0.1s linear;
`;

const STimeDisplay = styled.span<{ isUser: boolean }>`
  font-size: 10px;
  color: ${({ isUser }) =>
    isUser ? colors.COLOR_WHITE : colors.COLOR_BLACK};
  min-width: 45px;
  text-align: right;
`;

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, isUser }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <SAudioPlayerContainer>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <SAudioControls>
        <SPlayButton isUser={isUser} onClick={togglePlayPause}>
          {isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </SPlayButton>
        <SProgressContainer>
          <SProgressBar isUser={isUser} onClick={handleProgressClick}>
            <SProgressFill progress={progress} isUser={isUser} />
          </SProgressBar>
          <STimeDisplay isUser={isUser}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </STimeDisplay>
        </SProgressContainer>
      </SAudioControls>
    </SAudioPlayerContainer>
  );
};

export default AudioPlayer;

