import React from "react";
import BioInfoBar from "./BioInfoBar";
import { cleanup } from "@testing-library/react";
import { BioResultType } from "../../types";
import { renderWithRouter } from "../../utils/testing";

const bioResultMock: BioResultType = {
  result_type: "EARLY",
  bio_user_id: "Adwnios",
  bio_result: "TRUE_MEDIUM",
  bio_score: 0.8,
  speech_millis: 5000,
};

const renderWithRouterProgressBar = (props = {}) => {
  const defaultProps = {
    bioResult: bioResultMock,
    ...props,
  };

  return renderWithRouter(<BioInfoBar {...defaultProps} />);
};

describe("<BioInfoBar/>", () => {
  afterEach(cleanup);

  it("render EARLY send event with spinner", () => {
    const { getByTestId, getByText } = renderWithRouterProgressBar();
    expect(getByTestId("spinner-container")).toBeInTheDocument();
    expect(getByTestId("lozenge-button-container")).toBeInTheDocument();
    expect(getByText("TRUE_MEDIUM")).toBeInTheDocument();
    // expect(getByTestId("progress-score")).toBeInTheDocument();
    // expect(getByTestId("progress-score")).toHaveTextContent('80%');
  });
  it("render NORMAL send event with icon", () => {
    const eventData = {
      result_type: "NORMAL",
      bio_user_id: "Adwnios",
      bio_result: "TRUE_MEDIUM",
      bio_score: 0.8,
      llr: -13.29,
      speech_millis: 5000,
    };
    const { getByTestId, getByText } = renderWithRouterProgressBar({
      eData: eventData,
    });
    expect(getByTestId("icon-container")).toBeInTheDocument();
    expect(getByText("TRUE_MEDIUM")).toBeInTheDocument();
    // expect(getByTestId("progress-score")).toBeInTheDocument();
    // expect(getByTestId("progress-score")).toHaveTextContent('80%');
    // expect(getByTestId('lozenge-button-container')).toBeInTheDocument();
  });

  it("render empty not match user", () => {
    const user = { user_id: "Koukos" };
    const { queryByTestId, getByText } = renderWithRouterProgressBar({
      user: user,
    });
    expect(queryByTestId("progress-score")).not.toBeInTheDocument();
    expect(queryByTestId("lozenge-button-container")).not.toBeInTheDocument();
    expect(queryByTestId("status-icon")).not.toBeInTheDocument();
  });
});
