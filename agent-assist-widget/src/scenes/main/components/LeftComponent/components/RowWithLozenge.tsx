import React from "react";
import Lozenge from "@omilia/lozenge";
import { colors } from "@omilia/theme";
import styled from "styled-components";
import { SRowContainer, STextContainer } from "../styled";

const RowWithLozenge = ({
  rowName,
  rowValue,
}: {
  rowName: string;
  rowValue: string;
}) => {
  function getColor(value: string) {
    if (value === "ACTIVE" || value === "true") {
      return colors.COLOR_GREEN_700;
    } else if (value === "CLOSED" || value === "false") {
      return colors.COLOR_RED_700;
    } else {
      return colors.COLOR_BLUE_700;
    }
  }
  return (
    <SRowContainer>
      <STextContainer>{rowName}:</STextContainer>
      <Lozenge
        data-test="lozenge-button-test"
        color={getColor(rowValue)}
        variant="outlined"
        background={colors.COLOR_WHITE}
      >
        {rowValue}
      </Lozenge>
    </SRowContainer>
  );
};

export default RowWithLozenge;
