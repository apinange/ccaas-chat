import React from "react";
import {
  AiInfoType,
  BioInfoType,
  CallInfoType,
  SessionInfoType,
  VoiceInfoType,
} from "../../../../types";
import {
  getColorByScore,
  SBigButton,
  SButtonsGroup,
  SCard,
  SCircle,
  SCircleScore,
} from "../../styled";
import { UserFilledIcon } from "@omilia/icon";
import BioInfoBar from "../../../../components/BioInfoBar";
import Lozenge from "@omilia/lozenge";
import { colors } from "@omilia/theme";
import RowWithLozenge from "./components/RowWithLozenge";
import { SRowContainer, STextContainer } from "./styled";
import { isEmptyObject } from "../../../../utils/helpers";

interface Props {
  sendToSocket: any;
  socketIsReady: boolean | null | any;
  bioInfo: BioInfoType | null | any;
  sessionInfo: SessionInfoType | null | any;
  callInfo: CallInfoType | null | any;
  voiceInfo: VoiceInfoType | null | any;
  aiInfo: AiInfoType | null | any;
}

const LeftComponent = ({
  sendToSocket,
  socketIsReady,
  bioInfo,
  sessionInfo,
  callInfo,
  voiceInfo,
  aiInfo,
}: Props) => {
  // console.group("LEFT COMPONENT");
  // console.log("is ready", socketIsReady);
  // console.log("socket bioInfo", bioInfo);
  // console.log("socket sessionInfo", sessionInfo);
  // console.log("socket callInfo", callInfo);
  // console.groupEnd();

  const bioResult = {
    result_type: "NORMAL",
    bio_user_id: "U101",
    bio_result: "TRUE_LOW",
    bio_score: 0.5852433,
    speech_millis: 6800,
  };
  console.log("BIO INFO", bioInfo);
  console.log("AI INFO", aiInfo);
  console.log("AI INFO length", aiInfo != undefined);

  return (
    <>
      {socketIsReady && (
        <>
          <SButtonsGroup>
            <UserFilledIcon size="96" />
            <SCircle>
              <SCircleScore>99%</SCircleScore>
            </SCircle>
          </SButtonsGroup>
          {sessionInfo && (
            <SCard>
              {sessionInfo.call_id && (
                <RowWithLozenge
                  rowName="Informações da Sessão"
                  rowValue={sessionInfo.call_id}
                />
              )}
              {sessionInfo.ani && (
                <RowWithLozenge
                  rowName="Informações da Chamada"
                  rowValue={sessionInfo.ani}
                />
              )}
            </SCard>
          )}

          {callInfo && (
            <SCard>
              {callInfo.status && (
                <RowWithLozenge
                  rowName="Status da Chamada"
                  rowValue={callInfo.status}
                />
              )}
            </SCard>
          )}

          {aiInfo && !isEmptyObject(aiInfo) && (
            <SCard>
              {aiInfo.user_sentiment && (
                <RowWithLozenge
                  rowName="Sentimento do Usuário"
                  rowValue={aiInfo.user_sentiment}
                />
              )}
              {aiInfo.user_emotions && (
                <RowWithLozenge
                  rowName="Emoções do Usuário"
                  rowValue={aiInfo.user_emotions}
                />
              )}
              {aiInfo.user_intents && (
                <RowWithLozenge
                  rowName="Intenções do Usuário"
                  rowValue={aiInfo.user_intents}
                />
              )}
              {"user_anger_detected" in aiInfo && (
                <RowWithLozenge
                  rowName="Raiva do Usuário Detectada"
                  rowValue={`${aiInfo.user_anger_detected}`}
                />
              )}
            </SCard>
          )}

          {bioInfo && (
            <SCard>
              {bioInfo.status && (
                <RowWithLozenge
                  rowName="Status Biométrico"
                  rowValue={bioInfo.status}
                />
              )}
              {bioInfo.bio_result && (
                <RowWithLozenge
                  rowName="ID do Usuário"
                  rowValue={bioInfo.bio_result.bio_user_id}
                />
              )}
              {bioInfo.bio_result && (
                <SRowContainer>
                  <STextContainer>Informações Biométricas</STextContainer>
                  <BioInfoBar bioResult={bioResult} />
                </SRowContainer>
              )}
              <SButtonsGroup>
                <SBigButton
                  variant="outlined"
                  color="success"
                  data-test="opt-out-button"
                  size="large"
                  disabled={false}
                  onClick={() => sendToSocket("OPT-OUT")}
                >
                  Desistir
                </SBigButton>
                <SBigButton
                  variant="contained"
                  color="success"
                  data-test="enroll-button"
                  size="large"
                  disabled={false}
                  onClick={() => sendToSocket("ENROLL")}
                >
                  Cadastrar
                </SBigButton>
              </SButtonsGroup>
            </SCard>
          )}

          {voiceInfo && !isEmptyObject(voiceInfo) && (
            <SCard>
              {voiceInfo.liveness_score && (
                <SRowContainer>
                  <STextContainer>Detecção de Voz ao Vivo</STextContainer>
                  <Lozenge
                    data-test="lozenge-button-test"
                    color={getColorByScore(
                      voiceInfo.liveness_score.global_post.toFixed(2) * 100
                    )}
                    variant="outlined"
                    background={colors.COLOR_WHITE}
                  >
                    {`${voiceInfo.liveness_score.label} / ${
                      voiceInfo.liveness_score.global_post.toFixed(2) * 100
                    } %`}
                  </Lozenge>
                </SRowContainer>
              )}
              {voiceInfo.sat_result && (
                <SRowContainer>
                  <STextContainer>Atributos do Falante</STextContainer>
                  <>
                    <Lozenge
                      data-test="lozenge-button-test"
                      color={colors.COLOR_BLUE_500}
                      variant="outlined"
                      background={colors.COLOR_WHITE}
                    >
                      {voiceInfo.sat_result.age_label}
                    </Lozenge>
                    <Lozenge
                      data-test="lozenge-button-test"
                      color={getColorByScore(
                        voiceInfo.liveness_score.global_post.toFixed(2) * 100
                      )}
                      variant="outlined"
                      background={colors.COLOR_WHITE}
                    >
                      {`${voiceInfo.sat_result.gender_label} / ${
                        voiceInfo.sat_result.gender_prob.toFixed(2) * 100
                      } %`}
                    </Lozenge>
                  </>
                </SRowContainer>
              )}
            </SCard>
          )}
        </>
      )}
    </>
  );
};

export default LeftComponent;
