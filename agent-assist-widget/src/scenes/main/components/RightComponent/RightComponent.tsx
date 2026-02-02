import React from "react";
import {
  SArticleButton,
  SContainer,
  SCrmBody,
  SCrmHeader,
  SDownContainer,
  SUpContainer,
} from "./styled";

const RightComponent = ({ socketIsReady }: { socketIsReady: boolean }) => {
  const articles = [
    { buttonName: "How to enroll user" },
    { buttonName: "All you need to know about live verification." },
    { buttonName: "What is the voiceprint" },
  ];
  console.log("is ready", socketIsReady);

  return (
    <SContainer>
      {socketIsReady && (
        <>
          <SUpContainer>
            {articles.map((a) => (
              <SArticleButton
                onClick={() => console.log("Article button clicked")}
                block
                variant="contained"
                color="primary"
              >
                {a.buttonName}
              </SArticleButton>
            ))}
          </SUpContainer>
          <SDownContainer>
            <SCrmHeader>CRM</SCrmHeader>
            <SCrmBody>~ |</SCrmBody>
          </SDownContainer>
        </>
      )}
    </SContainer>
  );
};

export default RightComponent;
