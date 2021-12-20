import React from "react";
import styled, { createGlobalStyle } from "styled-components/macro";

import { CssBaseline } from "@material-ui/core";

const GlobalStyle = createGlobalStyle`
  html,
  body,
  #root {
    // height: calc(100vh - calc(100vh - 100%))

    // height: 100vh;
    // max-height: -webkit-fill-available;

    position: fixed;
    height: 100%;

    overflow-x: hidden;
  }

  body {
    background: ${(props) => props.theme.palette.background.default};
  }

  *::-webkit-scrollbar {
    width: 16px;
    height: 16px;
    border-radius: 0px;
    background-color: ${(props) => props.theme.scrollbar.track};
  }

  *::-webkit-scrollbar-corner {
    background-color: ${(props) => props.theme.scrollbar.track};
  }
  *::-webkit-scrollbar-thumb {
    border-radius: 0px;
    border: none;
    background-color: ${(props) => props.theme.scrollbar.thumb};
  }
`;

const Root = styled.div`
  display: flex;
  min-height: 100vh;
`;

const AppContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Presentation = ({ children }) => {
  return (
    <Root>
      <CssBaseline />
      <GlobalStyle />
      <AppContent>{children}</AppContent>
    </Root>
  );
};

export default Presentation;
