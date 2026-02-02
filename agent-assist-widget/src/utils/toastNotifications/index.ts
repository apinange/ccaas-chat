import { Toast } from "@omilia/toast";
import { get } from "lodash-es";

export const notifyForSuccess = (message: string) => {
  Toast.success({
    title: message,
  });
};

export const notifyForError = (title: string, message: string) => {
  Toast.error({
    title: title,
    description: message,
  });
};
