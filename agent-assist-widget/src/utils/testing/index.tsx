import React from "react";
import { Router } from "react-router-dom";
import { createMemoryHistory, MemoryHistory } from "history";
import { render } from "@testing-library/react";

type RouterType = {
  route?: string;
  history?: MemoryHistory;
};

export function renderWithRouter(
  ui: any,
  {
    route = "/",
    history = createMemoryHistory({ initialEntries: [route] }),
  }: RouterType = {}
) {
  return {
    ...render(
      <Router location={history?.location} navigator={history}>
        {ui}
      </Router>
    ),
    // adding `history` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    history,
  };
}

export const UsersMock = (item = {}) => [
  { user_id: "Member:D" },
  { user_id: "Adwnios" },
  { ...item },
];

export const EventsMock = (item = {}) => [
  {
    result_type: "EARLY",
    bio_user_id: "Adwnios",
    bio_result: "TRUE_MEDIUM",
    bio_score: 0.8,
    llr: -13.29,
    speech_millis: 5000,
  },
  {
    result_type: "EARLY",
    bio_user_id: "Member:D",
    bio_result: "FALSE_LOW",
    bio_score: 0.45,
    llr: -13.29,
    speech_millis: 5000,
  },
  { ...item },
];

export const getBiokeysWithUsersMock = () => ({
  users: [{ user_id: "Adwnios" }],
  biokeys: [
    {
      key: "memberID",
      value: "Adwnios",
      display_name: "Member ID",
      priority: 1,
      sensitive: false,
      is_user_id: true,
    },
    {
      key: "Ani",
      value: "ani_ani",
      display_name: "Ani",
      priority: 2,
      sensitive: false,
      is_user_id: false,
    },
  ],
});

export const getStatusSseDataMock = () => "CALL_OPENED";

export const getVerificationDataSseMock = () => ({
  bio_result: "TRUE_HIGH",
  bio_score: 0.98,
  bio_user_id: "764231",
  llr: 27.318289,
  result_type: "EARLY",
  speech_millis: 2720,
});
