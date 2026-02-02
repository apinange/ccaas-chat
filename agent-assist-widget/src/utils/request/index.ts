/* eslint-disable no-console */
import axios from "axios";
import { get } from "lodash-es";
import { _conf } from "../../config";

const request = axios.create({
  baseURL: _conf.REACT_APP_API,
  timeout: 60000,
});

request.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = get(error, "response.data.error_message", error.message);
    const status = get(error, "response.status");
    request.defaults.headers.common["Access-Control-Allow-Origin"] = "*";
    console.log("Message: ", message);
    console.log("Status: ", status);

    throw error;
  }
);

export const setSessionToken = (token: string) => {
  request.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export const clearSessionToken = () => {
  request.defaults.headers.common["Authorization"] = "";
};

export default request;
