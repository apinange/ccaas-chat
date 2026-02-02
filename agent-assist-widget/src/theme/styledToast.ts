import styled from "styled-components";
import { ToastContainer } from "react-toastify";
import { colors } from "@omilia/theme";

export const StyledContainer = styled(ToastContainer)`
  // https://styled-components.com/docs/faqs#how-can-i-override-styles-with-higher-specificity
  /** Used to define container behavior: width, position: fixed etc... **/

  &&&.Toastify__toast-container {
    z-index: 997;
    //transform: translate3d(0, 0, 9999px);
    //-webkit-transform: translate3d(0, 0, 9999px);
    //position: fixed;
    //padding: 4px;
    margin-top: 60px;
    padding-bottom: 30px;
    height: 90vh;
    width: 375px;
    overflow: auto;
    //box-sizing: border-box;
    //color: #fff;
    background-color: rgba(0, 0, 0, 0);
  }

  /** Used to define the position of the ToastContainer **/
  .Toastify__toast-container--top-left {
    top: 0;
    left: 0;
  }
  .Toastify__toast-container--top-center {
  }
  .Toastify__toast-container--top-right {
    top: 1em;
    right: -1.3em;
  }
  .Toastify__toast-container--bottom-left {
  }
  .Toastify__toast-container--bottom-center {
  }
  .Toastify__toast-container--bottom-right {
  }

  /** Classes for the displayed toast **/
  .Toastify__toast {
    box-shadow: 0 0 0 0;
    background-color: rgba(0, 0, 0, 0);
    color: white;
    margin-bottom: 0;
    padding: 0;
  }
  .Toastify__toast--rtl {
  }
  .Toastify__toast-body {
    color: black;
  }

  /** Used to position the icon **/
  .Toastify__toast-icon {
  }

  /** handle the notification color and the text color based on the theme **/
  .Toastify__toast-theme--dark {
    background-color: rgba(0, 0, 0, 0);
    color: black;
  }
  .Toastify__toast-theme--light {
  }
  .Toastify__toast-theme--colored.Toastify__toast--default {
    background-color: rgba(0, 0, 0, 0.5);
    color: black;
  }
  .Toastify__toast-theme--colored.Toastify__toast--info {
  }
  .Toastify__toast-theme--colored.Toastify__toast--success {
  }
  .Toastify__toast-theme--colored.Toastify__toast--warning {
  }
  .Toastify__toast-theme--colored.Toastify__toast--error {
  }

  .Toastify__progress-bar {
  }
  .Toastify__progress-bar--rtl {
  }
  .Toastify__progress-bar-theme--light {
  }
  .Toastify__progress-bar-theme--dark {
  }
  .Toastify__progress-bar--info {
  }
  .Toastify__progress-bar--success {
  }
  .Toastify__progress-bar--warning {
  }
  .Toastify__progress-bar--error {
  }
  /** colored notifications share the same progress bar color **/
  .Toastify__progress-bar-theme--colored.Toastify__progress-bar--info,
  .Toastify__progress-bar-theme--colored.Toastify__progress-bar--success,
  .Toastify__progress-bar-theme--colored.Toastify__progress-bar--warning,
  .Toastify__progress-bar-theme--colored.Toastify__progress-bar--error {
  }

  /** Classes for the close button. Better use your own closeButton **/
  .Toastify__close-button {
    color: black;
    position: relative;
    top: 10px;
    right: 25px;
  }
  .Toastify__close-button--default {
  }
  .Toastify__close-button > svg {
  }
  .Toastify__close-button:hover,
  .Toastify__close-button:focus {
  }
`;
