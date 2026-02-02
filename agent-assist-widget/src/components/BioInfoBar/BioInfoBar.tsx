import React from "react";
import {
  getIconColor,
  getIconImage,
  SLozengeContainer,
  SProgressBarContainer,
  SProgressIcon,
  SScoreText,
  SSpinnerContainer,
} from "./styled";
import Spinner from "@omilia/spinner";
import { colors } from "@omilia/theme";
import Lozenge from "@omilia/lozenge";
import Tooltip from "@omilia/tooltip";
import { BioResultType } from "../../types";

interface Props {
  bioResult: BioResultType;
}

const BioInfoBar = ({ bioResult }: Props) => {
  const resultTypeByName = {
    STARTING: "STARTING",
    EARLY: "INTERIM",
    NORMAL: "FINAL",
  };

  const ProgressIcon = getIconImage(bioResult.bio_result);
  let fixedScore = bioResult.bio_score.toFixed(2);
  // @ts-ignore
  let bioResultScore = bioResult && bioResult.bio_score ? fixedScore * 100 : 0;
  return (
    <SProgressBarContainer data-test="progress-bar-container">
      <>
        {bioResult.result_type === "STARTING" ||
        bioResult.result_type === "EARLY" ? (
          <SSpinnerContainer data-test="spinner-container">
            <Spinner color="primary" />
          </SSpinnerContainer>
        ) : (
          <Tooltip content={bioResult.bio_result}>
            <SProgressIcon data-test="icon-container">
              <ProgressIcon
                data-test="status-icon"
                color={getIconColor(bioResult.bio_result)}
              />
            </SProgressIcon>
          </Tooltip>
        )}

        {bioResult.bio_result && (
          <SLozengeContainer data-test="lozenge-button-container">
            <Lozenge
              data-test="lozenge-button-test"
              color={getIconColor(bioResult.bio_result)}
              variant="outlined"
              background={colors.COLOR_WHITE}
            >
              {`${bioResultScore} %`}
            </Lozenge>
          </SLozengeContainer>
        )}

        {bioResult.bio_result && (
          <SLozengeContainer data-test="lozenge-button-container">
            <Lozenge
              data-test="lozenge-button-test"
              color={getIconColor(bioResult.bio_result)}
              variant="outlined"
              background={colors.COLOR_WHITE}
            >
              {bioResult.bio_result}
            </Lozenge>
          </SLozengeContainer>
        )}
        {/*{`${(Math.round((bioResult.bio_score + Number.EPSILON) * 100) / 100) * 100}%`}*/}

        {bioResult.result_type === "STARTING" && (
          <SLozengeContainer data-test="lozenge-button-starting-container">
            <Lozenge
              data-test="lozenge-button-test-starting"
              color={colors.COLOR_BLUE_500}
              background={colors.COLOR_BLUE_200}
            >
              {resultTypeByName[bioResult.result_type]}
            </Lozenge>
          </SLozengeContainer>
        )}
      </>
    </SProgressBarContainer>
  );
};

export default BioInfoBar;
