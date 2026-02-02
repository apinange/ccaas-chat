import React from "react";
import { DialogInfoType } from "../../../../types";
import ChatComponent from "../../../../components/ChatComponent";
import {
  SGreenMessageBox,
  SMessageBoxContainer,
  SMessageBoxIconContainer,
  SPurpleMessageBox,
} from "../../../../components/styled";
import { BotCircleIcon } from "@omilia/icon";
import { colors } from "@omilia/theme";
import { SCard } from "../../styled";

interface Props {
  socketIsReady: boolean | null | any;
  dialogInfo: DialogInfoType | null | any;
  agentSuggestedPrompt: string | null | any;
  agentTasks: string | null | undefined;
  agentNextTask: string | null | undefined;
}
const CentralComponent = ({
  socketIsReady,
  dialogInfo,
  agentSuggestedPrompt,
  agentTasks,
  agentNextTask,
}: Props) => {
  // console.log("RENDER CENTRAL COMPONENT");
  // console.group("CENTRAL COMPONENT");
  // console.log("socket values is center dialog info", dialogInfo);
  // console.groupEnd();
  console.log("agent suggest ===>", agentSuggestedPrompt);
  console.log("agent task ===>", agentTasks);
  return (
    <>
      {socketIsReady && (
        <ChatComponent
          utt_list={dialogInfo && dialogInfo.utt_list}
          real_time_agent={dialogInfo && dialogInfo.real_time_agent}
          real_time_user={dialogInfo && dialogInfo.real_time_user}
        />
      )}

      {agentSuggestedPrompt && (
        <SMessageBoxContainer isUser={false}>
          <SMessageBoxIconContainer>
            <BotCircleIcon color={colors.COLOR_PURPLE_900} size="48" />
          </SMessageBoxIconContainer>
          <SPurpleMessageBox>{agentSuggestedPrompt}</SPurpleMessageBox>
        </SMessageBoxContainer>
      )}

      {agentTasks && agentTasks.length > 0 && (
        <SCard>
          {agentNextTask && (
            <>
              <h3>Próxima Tarefa</h3>
              <SGreenMessageBox>{agentNextTask}</SGreenMessageBox>
            </>
          )}
          <h3>Tarefas</h3>
          {agentTasks.split(",").map((task) => (
            <SGreenMessageBox>{task}</SGreenMessageBox>
          ))}
        </SCard>
      )}
    </>
  );
};

export default CentralComponent;
