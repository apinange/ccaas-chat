import request from "../utils/request";

export const getToken = () =>
  request.post("/api/token", { callId: "34555442" });
