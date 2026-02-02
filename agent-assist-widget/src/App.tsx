import { Suspense } from "react";
import Provider from "./components/Provider";
import { QueryClientProvider } from "react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Preloader from "@omilia/preloader";
import { queryClient } from "./utils/queryClient";
import Main from "./scenes/main";
import { BASENAME } from "./constant";
import AgentAssistant from "./components/AgentAssistant";
// import TestTest from "./testTest";

function App() {
  return (
    <Provider>
      <QueryClientProvider client={queryClient}>
        <Suspense
          fallback={
            <BrowserRouter>
              <Preloader data-test="preloader" showBackdrop />
            </BrowserRouter>
          }
        >
          <BrowserRouter basename={BASENAME}>
            <Routes>
              <Route path="/" element={<Navigate to="/frame2" replace />} />
              <Route path="frame" element={<Main />} />
              <Route path="frame2" element={<AgentAssistant />} />
              {/* <Route path="test" element={<TestTest />} /> */}
            </Routes>
          </BrowserRouter>
        </Suspense>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
