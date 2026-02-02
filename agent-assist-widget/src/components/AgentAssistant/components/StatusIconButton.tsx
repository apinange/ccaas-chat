import React from "react";
import check from "../../../icons/check.svg";
import up from "../../../icons/up.svg";
import down from "../../../icons/down.svg";
import clock from "../../../icons/clock.svg";
import { SStatusIconButtonContainer } from "./styled";
import { Svg } from "../../../theme";
import { colors } from "@omilia/theme";

const StatusIconButton = () => {
  return (
    <SStatusIconButtonContainer>
      <Svg size={18} color={colors.COLOR_WHITE} src={up} alt="SVG" />
    </SStatusIconButtonContainer>
  );
};

export default StatusIconButton;
