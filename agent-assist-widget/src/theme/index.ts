import { curry, get } from "lodash-es";
import rem from "polished/lib/helpers/rem";
import styled, { css } from "styled-components";
import { colors } from "@omilia/theme";

export const theme = {
  layout: {
    width: "1280px",
  },
  breadcrumbs: {
    height: "46px",
  },
  header: {
    height: "48px",
    padding: rem("16px", "14px"),
  },
  sidebar: {
    width: "240px",
  },
  routeTabs: {
    height: "48px",
  },
  pagePadding: {},
};

export const getThemeProp = curry((key: string, props: any): string =>
  get(props, `theme.${key}`, get(theme, key))
);

export const SSVGWrapper = styled.div`
  width: 20px;
  height: 20px;
`;

export const Svg = styled.img<{ size: number; color: string }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  color: ${({ color }) => color};
`;

export const SVGWrapper = styled.span<{ size: number; color: string }>`
  display: inline-flex;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  color: ${({ color }) => color};

  // > svg {
  //   width: ${({ size }) => size}px;
  //   height: ${({ size }) => size}px;
  //   max-height: 100%;
  //   max-width: 100%;
  //   overflow: hidden;
  //   pointer-events: none;
  // }
`;
