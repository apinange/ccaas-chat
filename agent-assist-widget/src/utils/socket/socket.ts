import { _conf } from "../../config";

export const Socket = (token: string | null) =>
  new WebSocket(`${_conf.REACT_APP_WS}/frame?token=${token}`);
