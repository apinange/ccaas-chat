import { useEffect } from "react";

export interface Event {
  name: string;
  handler(...args: any[]): any;
}

export function useSocketWithEvents(socket: any, events: Event[]) {
  useEffect(() => {
    for (const event of events) {
      socket.on(event.name, event.handler);
    }

    return function () {
      console.log("IN UN MOUND.....");
      for (const event of events) {
        socket.off(event.name);
      }
      if (socket) socket.close();
    };
  }, []);
}
