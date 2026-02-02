import React, { useEffect } from "react";
import { getColorByStatus, SLongButton } from "../styled";
import styled from "styled-components";
import { colors } from "@omilia/theme";
import { ReactComponent as SpoofIcon } from "../../../icons/SpoofIcon.svg";
import { useTranslation } from "react-i18next";

import { NotificationVerifyIcon } from "@omilia/icon";
import {
  BioResultType,
  BlocklistResultType,
  FraudInfoType,
  SessionInfoType,
  UserInfoType,
  VoiceInfoType,
} from "../../../types";
import IdentificationComponent from "./IdentificationComponent";

interface Props {
  userInfo: UserInfoType | undefined | null;
  bioResults: BioResultType | undefined | null;
  blocklistResult: BlocklistResultType | undefined | null;
  fraudInfo: FraudInfoType | undefined | null;
  voiceInfo: VoiceInfoType | undefined | null;
  sessionInfo: SessionInfoType | undefined | null;
  enrollStatus: string | undefined | null;
  showToast: (
    category: string,
    children: React.ReactNode,
    containerId: string,
    toastId: string
  ) => void;
  updateToast: (
    category: string,
    children: React.ReactNode,
    containerId: string,
    toastId: string
  ) => void;
  sendToSocket: (action: string) => void;
}

const UserInfoButton = ({
  userInfo,
  bioResults,
  blocklistResult,
  fraudInfo,
  voiceInfo,
  sessionInfo,
  enrollStatus,
  showToast,
  updateToast,
  sendToSocket,
}: Props) => {
  const { t } = useTranslation();
  useEffect(() => {
    updateToast(
      t('toasts.identification', 'IDENTIFICAÇÃO'),
      <IdentificationComponent
        sendToSocket={sendToSocket}
        bioResults={bioResults}
        blocklistResult={blocklistResult}
        fraudInfo={fraudInfo}
        userInfo={userInfo}
        voiceInfo={voiceInfo}
        sessionInfo={sessionInfo}
        enrollStatus={enrollStatus}
      />,
      "main",
      "IdentificationToastID"
    );
  }, [userInfo, voiceInfo, enrollStatus]);

  const SLeftSide = styled.div`
    justify-content: center;
    width: 20%;
  `;

  const SCheckBadgeWrapper = styled.div<{ backgroundColor: string }>`
    width: 40px;
    height: 40px;
    display: flex;
    position: relative;
    right: 16px;
    justify-content: center;
    align-items: center;
    background-color: ${({ backgroundColor }) => backgroundColor};
    border-radius: 50%;
  `;

  const SRightSide = styled.div`
    width: 60%;
  `;

  const isSynthetic =
    voiceInfo &&
    voiceInfo.liveness_score &&
    voiceInfo.liveness_score.label == "SYNTHETIC";
  //const isSynthetic = true;
  let backgroundColor = isSynthetic
    ? getColorByStatus("NOT_ENROLLED")
    : getColorByStatus(enrollStatus);

  return (
    <SLongButton
      backgroundColor={
        isSynthetic ? colors.COLOR_RED_700 : "rgba(0, 0, 0, 0.5)"
      }
      onClick={() =>
        showToast(
          t('toasts.identification', 'IDENTIFICAÇÃO'),
          <IdentificationComponent
            sendToSocket={sendToSocket}
            bioResults={bioResults}
            blocklistResult={blocklistResult}
            fraudInfo={fraudInfo}
            voiceInfo={voiceInfo}
            userInfo={userInfo}
            sessionInfo={sessionInfo}
            enrollStatus={enrollStatus}
          />,
          "main",
          "IdentificationToastID"
        )
      }
    >
      <SLeftSide>
        <SCheckBadgeWrapper backgroundColor={backgroundColor}>
          {isSynthetic ? (
            <SpoofIcon color={colors.COLOR_RED_900} width={20} height={20} />
          ) : (
            <NotificationVerifyIcon size="20" color={colors.COLOR_WHITE} />
          )}

          {/*<CheckBadge*/}
          {/*  style={{*/}
          {/*    width: "17px",*/}
          {/*    height: "17px",*/}
          {/*    color: colors.COLOR_WHITE,*/}
          {/*  }}*/}
          {/*/>*/}
        </SCheckBadgeWrapper>
      </SLeftSide>
      <SRightSide>
        {isSynthetic ? (
          <div style={{ fontSize: "10px", paddingLeft: "3px" }}>
            {t('messages.attention', 'ATTENTION!!!')}
          </div>
        ) : userInfo && userInfo.name ? (
          <div style={{ paddingLeft: "3px" }}>
            <div>{userInfo && userInfo.name}</div>
            <div>{userInfo && userInfo.address}</div>
          </div>
        ) : (
          <div style={{ fontSize: "10px", paddingLeft: "3px" }}>
            {t('status.notEnrolled', 'Not Enrolled')}
          </div>
        )}
      </SRightSide>
    </SLongButton>
  );
};

export default UserInfoButton;
