import React, { useEffect, useRef } from "react";
import { SChatBoxContainer } from "../styled";
import ChatMessage from "./components/ChatMessage";
import { TranscriptionType } from "../../types";
import useIsInViewport from "../../utils/hooks/useIsInViewport";

interface ChatComponentProps {
  utt_list?: TranscriptionType[] | null;
  real_time_agent?: TranscriptionType | null;
  real_time_user?: TranscriptionType | null;
}

const ChatComponent = ({
  utt_list,
  real_time_agent,
  real_time_user,
}: ChatComponentProps) => {
  const scrollRef = useRef<null | HTMLDivElement>(null);
  const isInViewPort = useIsInViewport(scrollRef);
  const localHistoryRef = useRef<TranscriptionType[] | undefined | null>([]);
  const liveAgentValueRef = useRef<string>("");
  const liveUserValueRef = useRef<string>("");

  const [, updateState] = React.useState();
  // @ts-ignore
  const forceUpdate = React.useCallback(() => updateState({}), []);

  useEffect(() => {
    // 👇️ scroll to bottom every time messages change
    isInViewPort &&
      scrollRef.current?.lastElementChild !== null &&
      scrollDown(scrollRef);
  }, [real_time_user, real_time_agent, localHistoryRef.current]);

  function scrollDown(ref: any) {
    if (ref.current !== undefined && localHistoryRef.current!.length > 3) {
      ref.current.lastElementChild.scrollIntoView({
        block: "nearest",
        inline: "end",
        behavior: "smooth",
      });
    }
  }
  useEffect(() => {
    let socketHistory = utt_list || [];
    if (socketHistory.length > localHistoryRef.current!.length) {
      localHistoryRef.current = utt_list;
      forceUpdate();
    }
  }, [localHistoryRef.current, utt_list]);

  useEffect(() => {
    if (real_time_agent && real_time_agent.utt.length > 0) {
      liveAgentValueRef.current = real_time_agent.utt;
      if (real_time_agent.is_final) {
        addToHistory("AGENT", real_time_agent);
      }
    }

    if (real_time_user && real_time_user.utt.length > 0) {
      liveUserValueRef.current = real_time_user.utt;
      if (real_time_user.is_final) {
        addToHistory("USER", real_time_user);
      }
    }
  }, [real_time_user, real_time_agent]);

  function addToHistory(about: string, addObject: TranscriptionType) {
    if (about === "USER") {
      liveUserValueRef.current = "";
    }
    if (about === "AGENT") {
      liveAgentValueRef.current = "";
    }
    localHistoryRef.current = [...localHistoryRef.current!, addObject];
    console.log("THIS MSG IS IN HISTORY NOW", addObject);
  }

  return (
    <SChatBoxContainer id="chat-box" ref={scrollRef}>
      {localHistoryRef &&
        localHistoryRef.current!.length > 0 &&
        localHistoryRef.current!.map((m: TranscriptionType, index: number) => {
          return (
            <ChatMessage
              key={`history-${index}`}
              text={m.utt}
              isUser={m.leg === "USER"}
              isFinal={m.is_final}
              transcriptionData={m}
            />
          );
        })}

      {real_time_agent && liveAgentValueRef.current.length > 0 && (
        <ChatMessage
          text={liveAgentValueRef.current}
          isUser={false}
          isFinal={real_time_agent && real_time_agent.is_final}
          transcriptionData={real_time_agent}
        />
      )}
      {real_time_user && liveUserValueRef.current.length > 0 && (
        <ChatMessage
          text={liveUserValueRef.current}
          isUser={true}
          isFinal={real_time_user && real_time_user.is_final}
          transcriptionData={real_time_user}
        />
      )}
    </SChatBoxContainer>
  );
};

export default ChatComponent;
