import React from "react";
import { cleanup, render } from "@testing-library/react";

import CircleGauge, { getText } from "./CircleGauge";

afterEach(cleanup);

describe("<CircleGauge />", () => {
  let score: number = 0.79;
  let thresholdsArray: string[] = ["0.23", "0.38", "0.51", "0.66", "0.81"];
  let result: string = "TRUE_HIGH";

  it("will render the score percentage", () => {
    // const thresholdsArray: string[] = ['0.23', '0.38', '0.51', '0.66', '0.81'];
    const { getByTestId } = render(
      <CircleGauge
        score={score}
        thresholdsArray={thresholdsArray}
        result={result}
      />
    );

    expect(getByTestId("result")).toBeInTheDocument();
    expect(getByTestId("result")).toHaveTextContent("79");
  });

  // TODO test for undefined score senario
});

describe("getText()", () => {
  const score: number = 0.79;
  const thresholdsArray: string[] = ["0.23", "0.38", "0.51", "0.66", "0.81"];

  it("will return the given text capitalized when it is included in the defined states", () => {
    expect(getText(score, thresholdsArray)).toEqual("True medium");
  });

  it('will return "False high" when the given text is not in any range in the defined states', () => {
    expect(getText(333, thresholdsArray)).toEqual("False high");
  });
});
