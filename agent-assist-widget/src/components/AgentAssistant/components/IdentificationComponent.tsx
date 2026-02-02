import React, { FC } from "react";
import {
  getColorForAgeAndGenderByStatus,
  getIconColor,
  getTTSColor,
  getTTSIcon,
  getVerifyBackgroundColor,
  getVerifyColor,
  getVerifyImage,
  SFlexDiv,
  SLozengeContainer,
  SToastBoxText,
  SUserBioDataContainer,
  SUserInfoBoxContainer,
  SUserInfoHeader,
  SUserInfoRow,
  SUserInfoValueContainer,
} from "./styled";
import { colors } from "@omilia/theme";
import { useTranslation } from "react-i18next";
import { ReactComponent as PhoneICon } from "../../../icons/PhoneIcon.svg";
import { ReactComponent as LocationIcon } from "../../../icons/LocationIcon.svg";
import { ReactComponent as GenderIcon } from "../../../icons/GenderIcon.svg";
import { ReactComponent as AgeIcon } from "../../../icons/AgeIcon.svg";
import { SBigButton } from "../../../scenes/main/styled";
import {
  BioResultType,
  BlocklistResultType,
  FraudInfoType,
  SessionInfoType,
  UserInfoType,
  VoiceInfoType,
} from "../../../types";
import styled from "styled-components";
import Lozenge from "@omilia/lozenge";
import {
  IconProps,
  NoAvailableIcon,
  NotificationVerifyIcon,
} from "@omilia/icon";
import Tooltip from "@omilia/tooltip";

interface Props {
  userInfo: UserInfoType | undefined | null;
  bioResults: BioResultType | undefined | null;
  blocklistResult: BlocklistResultType | undefined | null;
  fraudInfo: FraudInfoType | undefined | null;
  voiceInfo: VoiceInfoType | undefined | null;
  sessionInfo: SessionInfoType | undefined | null;
  sendToSocket: (action: string) => void;
  enrollStatus: string | undefined | null;
}
export const SVerifyIconContainer = styled.div<{ backgroundColor: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  right: 20px;
  width: 17px;
  height: 17px;
  background-color: ${({ backgroundColor }) => backgroundColor};
  border-radius: 50%;
`;
export const getColorByTrustLevelScore = (levelScore: number) => {
  if (levelScore > 0 && levelScore <= 100) {
    return colors.COLOR_RED_700;
  } else if (levelScore > 100 && levelScore <= 200) {
    return colors.COLOR_YELLOW_700;
  } else if (levelScore > 200 && levelScore <= 400) {
    return colors.COLOR_GREEN_700;
  } else {
    return colors.COLOR_GREY_700;
  }
};

export const SColoredDiv = styled.div<{ textColor: string }>`
  color: ${({ textColor }) => textColor};
  font-size: 17px;
`;
export const STrustLevelContainer = styled.div`
  display: flex;
  position: absolute;
  width: 150px;
  justify-content: space-between;
  right: 40px;
  top: 30px;
`;
const IdentificationComponent = ({
  userInfo,
  bioResults,
  blocklistResult,
  fraudInfo,
  voiceInfo,
  sessionInfo,
  sendToSocket,
  enrollStatus,
}: Props) => {
  const { t } = useTranslation();
  // console.group("IDENTIFICATION PANEL");
  // console.log("USER INFO", userInfo);
  // console.log("Session INFO", sessionInfo);
  // console.log("Voice INFO", voiceInfo);
  // console.log("FRaud INFO", fraudInfo);
  // console.log("ENROLL STATUS", enrollStatus);
  // console.log("BLOCKLIST RESULTS", blocklistResult);
  // console.groupEnd();

  // const TTSIcon = getTTSIcon(TTS_MOCK_STRING)
  const TTSIcon = getTTSIcon(
    voiceInfo && voiceInfo!.liveness_score && voiceInfo!.liveness_score.label
      ? voiceInfo!.liveness_score.label
      : ""
  );
  const isBlocklisted = !!(blocklistResult && blocklistResult.bio_result);
  // const VerifyIcon = getVerifyImage(true);

  return (
    <>
      {userInfo && userInfo.trustLevel && (
        <STrustLevelContainer>
          <SColoredDiv
            textColor={getColorByTrustLevelScore(userInfo.trustLevel) as string}
          >
            ANI Trust Level:
          </SColoredDiv>
          <SColoredDiv
            textColor={getColorByTrustLevelScore(userInfo.trustLevel) as string}
          >
            {userInfo && userInfo.trustLevel}
          </SColoredDiv>
        </STrustLevelContainer>
      )}
      <SUserBioDataContainer isBlocklisted={isBlocklisted}>
        <SUserInfoHeader>
          <SToastBoxText level={1}>CALL ID:</SToastBoxText>
          <SToastBoxText level={2}>
            {sessionInfo && sessionInfo.call_id
              ? sessionInfo.call_id
              : "--------------"}
          </SToastBoxText>
        </SUserInfoHeader>
        {isBlocklisted && (
          <SLozengeContainer>
            <Lozenge
              data-test="lozenge-blocklist-detection-test"
              glyph={NoAvailableIcon}
              glyphColor={colors.COLOR_RED_700}
              color={colors.COLOR_RED_700}
              variant="outlined"
              background={colors.COLOR_WHITE}
            >
              BLOCKLISTED
            </Lozenge>
          </SLozengeContainer>
        )}
        {!isBlocklisted && (
          <SLozengeContainer>
            {enrollStatus && enrollStatus != "UNKNOWN" && (
              <Lozenge
                color={getVerifyColor(enrollStatus != "NOT_ENROLLED")}
                background={getVerifyBackgroundColor(
                  enrollStatus != "NOT_ENROLLED"
                )}
                glyph={getVerifyImage(enrollStatus != "NOT_ENROLLED")}
                glyphColor={getVerifyColor(enrollStatus != "NOT_ENROLLED")}
              >
                {enrollStatus}
              </Lozenge>
            )}

            {voiceInfo &&
              voiceInfo.liveness_score &&
              voiceInfo.liveness_score.label && (
                <Lozenge
                  glyph={TTSIcon as FC<IconProps>}
                  data-test="lozenge-tts-button-test"
                  color={getTTSColor(voiceInfo.liveness_score.label)}
                  background={colors.COLOR_WHITE}
                  variant="outlined"
                >
                  {voiceInfo.liveness_score.label}
                </Lozenge>
              )}

            {/*<Lozenge*/}
            {/*    glyph={TTSIcon}*/}
            {/*    data-test="lozenge-tts-button-test"*/}
            {/*    color={getTTSColor(TTS_MOCK_STRING)}*/}
            {/*    variant="outlined"*/}
            {/*    background={getTTSBackgroundColor(TTS_MOCK_STRING)}*/}
            {/*>*/}
            {/*  {TTS_MOCK_STRING}*/}
            {/*</Lozenge>*/}

            {bioResults && (
              <Lozenge
                data-test="lozenge-biometric-score-test"
                color={getIconColor(bioResults.bio_result)}
                variant="outlined"
                background={colors.COLOR_WHITE}
              >
                {bioResults.bio_result}
              </Lozenge>
            )}
          </SLozengeContainer>
        )}

        <SUserInfoRow>
          <SUserInfoBoxContainer>
            <SUserInfoValueContainer>
              <SFlexDiv>
                <PhoneICon width={15} height={15} />
                <SToastBoxText level={2}>
                  {sessionInfo && sessionInfo.ani
                    ? sessionInfo.ani
                    : "--------------"}
                </SToastBoxText>
              </SFlexDiv>
              <NotificationVerifyIcon
                size="18"
                primaryColor={
                  userInfo && userInfo.validAni
                    ? colors.COLOR_GREEN_700
                    : colors.COLOR_RED_700
                }
              />
            </SUserInfoValueContainer>
          </SUserInfoBoxContainer>

          <SUserInfoBoxContainer>
            <SUserInfoValueContainer>
              <SFlexDiv>
                <LocationIcon width={15} height={15} />
                <SToastBoxText level={2}>
                  {userInfo && userInfo.address
                    ? userInfo.address
                    : "--------------"}
                </SToastBoxText>
              </SFlexDiv>
              <NotificationVerifyIcon
                size="18"
                primaryColor={colors.COLOR_GREY_700}
              />
            </SUserInfoValueContainer>
          </SUserInfoBoxContainer>
        </SUserInfoRow>

        <SUserInfoRow>
          <SUserInfoBoxContainer>
            <SUserInfoValueContainer>
              <SFlexDiv>
                <AgeIcon width={15} height={15} />
                <SToastBoxText level={2}>
                  {userInfo && userInfo.age
                    ? userInfo.age.value
                    : "--------------"}
                </SToastBoxText>
              </SFlexDiv>
              <Tooltip
                content={
                  userInfo && userInfo.age
                    ? userInfo.age.description
                    : t('status.notEstimated', 'Not estimated')
                }
              >
                <NotificationVerifyIcon
                  size="18"
                  primaryColor={getColorForAgeAndGenderByStatus(
                    userInfo && userInfo.age ? userInfo.age.status : "UNKNOWN"
                  )}
                />
              </Tooltip>
            </SUserInfoValueContainer>
          </SUserInfoBoxContainer>

          <SUserInfoBoxContainer>
            <SUserInfoValueContainer>
              <SFlexDiv>
                <GenderIcon width={15} height={15} />
                <SToastBoxText level={2}>
                  {userInfo && userInfo.gender
                    ? userInfo.gender.value
                    : "--------------"}
                </SToastBoxText>
              </SFlexDiv>
              <Tooltip
                content={
                  userInfo && userInfo.gender
                    ? userInfo.gender.description
                    : t('status.notEstimated', 'Not estimated')
                }
              >
                <NotificationVerifyIcon
                  size="18"
                  primaryColor={getColorForAgeAndGenderByStatus(
                    userInfo && userInfo.gender
                      ? userInfo.gender.status
                      : "UNKNOWN"
                  )}
                />
              </Tooltip>
            </SUserInfoValueContainer>
          </SUserInfoBoxContainer>
        </SUserInfoRow>

        {/*{userInfo && userInfo.gender && userInfo.gender.value != "-" && (*/}
        {/*  <SIconTextContainer>*/}
        {/*    <Heart*/}
        {/*      style={{*/}
        {/*        width: "17px",*/}
        {/*        height: "17px",*/}
        {/*        color: colors.COLOR_WHITE,*/}
        {/*      }}*/}
        {/*    />*/}

        {/*    <Tooltip content={userInfo.gender.description}>*/}
        {/*      <STextWithColorByStatus level={2} status={userInfo.gender.status}>*/}
        {/*        {userInfo.gender.value}*/}
        {/*      </STextWithColorByStatus>*/}
        {/*    </Tooltip>*/}
        {/*  </SIconTextContainer>*/}
        {/*)}*/}

        {/*{userInfo && userInfo.age && userInfo.age.value != "-" && (*/}
        {/*  <SIconTextContainer>*/}
        {/*    <Clock*/}
        {/*      style={{*/}
        {/*        width: "15px",*/}
        {/*        height: "15px",*/}
        {/*        color: colors.COLOR_WHITE,*/}
        {/*      }}*/}
        {/*    />*/}

        {/*    <Tooltip content={userInfo.age.description}>*/}
        {/*      <STextWithColorByStatus level={2} status={userInfo.age.status}>*/}
        {/*        {userInfo && userInfo.age.value}*/}
        {/*      </STextWithColorByStatus>*/}
        {/*    </Tooltip>*/}
        {/*  </SIconTextContainer>*/}
        {/*)}*/}

        {/*{enrollStatus != "ACTIVE" ? (*/}
        {/*  <SButtonsGroup>*/}
        {/*    <SBigButton*/}
        {/*      variant="outlined"*/}
        {/*      color="success"*/}
        {/*      data-test="opt-out-button"*/}
        {/*      size="large"*/}
        {/*      disabled={false}*/}
        {/*      onClick={() => sendToSocket("OPT-OUT")}*/}
        {/*    >*/}
        {/*      Opt out*/}
        {/*    </SBigButton>*/}

        {/*    <SBigButton*/}
        {/*      variant="contained"*/}
        {/*      color="success"*/}
        {/*      data-test="enroll-button"*/}
        {/*      size="large"*/}
        {/*      disabled={false}*/}
        {/*      onClick={() => sendToSocket("ENROLL")}*/}
        {/*    >*/}
        {/*      Enroll*/}
        {/*    </SBigButton>*/}
        {/*  </SButtonsGroup>*/}
        {/*) : (*/}
        <div
          style={{
            //  display: "flex",
            paddingTop: "10px",
            justifyContent: "center",
          }}
        >
          <SBigButton
            variant="contained"
            color="success"
            data-test="enroll-button"
            size="large"
            disabled={false}
            onClick={() => sendToSocket("ENROLL")}
          >
            {enrollStatus != "ACTIVE" ? t('buttons.enroll', 'Enroll') : t('buttons.reEnroll', 'Re-Enroll')}
          </SBigButton>
          <SBigButton
            variant="contained"
            color="success"
            data-test="opt-out-button"
            size="large"
            disabled={false}
            onClick={() => sendToSocket("OPT_OUT")}
          >
            {t('buttons.optOut', 'Opt Out')}
          </SBigButton>

          {/*<SBigButton*/}
          {/*  variant="outlined"*/}
          {/*  color="success"*/}
          {/*  data-test="opt-out-button"*/}
          {/*  size="large"*/}
          {/*  disabled={false}*/}
          {/*  onClick={() => sendToSocket("OPT-OUT")}*/}
          {/*>*/}
          {/*  Opt out*/}
          {/*</SBigButton>*/}
        </div>
        {/*)}*/}
      </SUserBioDataContainer>
      {/*<Tooltip content={enrollStatus ? enrollStatus : ""}>*/}
      {/*  <SCheckBadgeWrapper backgroundColor={getColorByStatus(enrollStatus)}>*/}
      {/*    <CheckBadge*/}
      {/*      style={{*/}
      {/*        width: "17px",*/}
      {/*        height: "17px",*/}
      {/*        color: colors.COLOR_WHITE,*/}
      {/*      }}*/}
      {/*    />*/}
      {/*  </SCheckBadgeWrapper>*/}
      {/*</Tooltip>*/}
    </>
  );
};

export default IdentificationComponent;
