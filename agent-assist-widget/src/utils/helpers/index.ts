import { SentimentTypes } from "../../types";
import { colors } from "@omilia/theme";

export function isEmptyObject(obj: {}) {
  return JSON.stringify(obj) === "{}";
}

export const getSentimentColor = (sentimentStatus: SentimentTypes) => {
  switch (sentimentStatus) {
    case "negative": {
      return colors.COLOR_RED_500;
    }
    case "neutral": {
      return colors.COLOR_GREY_500;
    }
    case "positive": {
      return colors.COLOR_GREEN_500;
    }
    default: {
      return colors.COLOR_GREY_700;
    }
  }
};
