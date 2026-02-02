import { useEffect, useRef, useState } from "react";
import { _conf } from "../../config";
import { SocketValueType } from "../../types";

export function useWebSocket(token: string | null) {
  const [isReady, setIsReady] = useState(false);
  const [socketValue, setSocketValue] = useState<SocketValueType | null>(null);
  const ws = useRef(null);
  useEffect(() => {
    // Only connect to WebSocket if token is provided
    if (!token) {
      console.log("No token provided, skipping WebSocket connection");
      return;
    }

    const socket = new WebSocket(`${_conf.REACT_APP_WS}/frame?token=${token}`);
    console.group("Socket Console ");
    socket.onopen = () => {
      console.log("on Open socket");
      setIsReady(true);
    };
    socket.onclose = () => {
      console.log("on Close socket");
      setIsReady(false);
    };
    socket.onerror = (error) => {
      console.log("WebSocket error:", error);
      setIsReady(false);
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("on message event data ", data);
      console.log("Received ai_info:", data.ai_info);
      console.log("Received agent_suggested_prompt:", data.ai_info?.agent_suggested_prompt);
      console.log("Received dialog_info:", data.dialog_info);
      console.log("Received dialog_info utt_list length:", data.dialog_info?.utt_list?.length || 0);
      console.log("Received call_summary:", data.call_summary);
      if (data.call_summary) {
        console.log("[useWebSocket] Call summary details:", {
          topic: data.call_summary.topic,
          summary: data.call_summary.summary?.substring(0, 100) + '...',
          timestamp: data.call_summary.timestamp
        });
      }
      if (data.dialog_info) {
        console.log("[useWebSocket] Dialog info details:", {
          utt_list_length: data.dialog_info.utt_list?.length || 0,
          last_message: data.dialog_info.utt_list?.[data.dialog_info.utt_list.length - 1]
        });
      }
      setSocketValue(data);
    };

    console.groupEnd();
    // @ts-ignore
    ws.current = socket;

    return function () {
      if (socket) socket.close();
    };
  }, [token]);

  return [isReady, socketValue, ws] as const;
}

// , ws.current?.send.bind(ws.current)
