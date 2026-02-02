import React from "react";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { theme } from "../../theme";
import { StyledContainer } from "../../theme/styledToast";
import "react-toastify/dist/ReactToastify.css";

const GlobalStyle = createGlobalStyle`
  html {
    font-size: 14px;
  }

  body {
    background: white !important;
    font-family: Montserrat, sans-serif;
    height: 100%;
    margin: 0;
    overflow: auto;
    padding: 0;
  }

  html, #root {
    height: 100%;
  }

  * { box-sizing: border-box; }

  // Data-test dropdown should set to content box in order to be displayed correctly
  [data-test="dropdown"] *{
    box-sizing: content-box;
  }

  [data-test="dropdown"] {
    box-sizing: content-box;
  }

  .dropdown *{
    box-sizing: content-box;
  }

  // Sobrescrever fill dos ícones de sentimento quando têm style.fill definido
  svg[style*="fill"] path {
    fill: inherit !important;
  }
`;

interface ProviderProps {
  children: React.ReactNode;
}

const Provider = ({ children }: ProviderProps) => (
  <ThemeProvider theme={theme}>
    <StyledContainer
      enableMultiContainer
      containerId={"main"}
      position="top-right"
      autoClose={false}
      closeButton={true}
      hideProgressBar={true}
      newestOnTop={true}
      closeOnClick={false}
      rtl={false}
      limit={7}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
    />
    <StyledContainer
      enableMultiContainer
      containerId={"secondary"}
      position="top-left"
      style={{
        width: "250px",
      }}
      autoClose={false}
      closeButton={true}
      hideProgressBar={true}
      newestOnTop={true}
      closeOnClick
      rtl={false}
      limit={2}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
    />
    <>
      <GlobalStyle />
      <>{children}</>
    </>
  </ThemeProvider>
);

export default Provider;
