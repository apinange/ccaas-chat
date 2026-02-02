export type SocketValueType = {
  session_info?: SessionInfoType | undefined;
  blocklist_result: BlocklistResultType | undefined;
  call_info: CallInfoType | undefined;
  crm_data: NoteType[] | undefined;
  bio_info: BioInfoType | undefined;
  dialog_info: DialogInfoType | undefined;
  voice_info: VoiceInfoType | undefined;
  features: FeaturesType | undefined;
  fraud_info: FraudInfoType | undefined;
  ai_info: AiInfoType | undefined;
  call_summary: CallSummaryType | undefined;
  user_info: UserInfoType | undefined;
  bio_enroll_update_message: string | undefined;
  notes: NoteType[] | undefined;
  user_sound: number | undefined;
  suggestion: SuggestionType | undefined;
  error?: string;
};

export type SuggestionType = {
  suggestion: string;
  reasoning?: string;
  htmlString?: string;
};

export type FeaturesType = {
  voiceBiometrics: boolean;
  blacklisting: boolean;
  transcription: boolean;
  suggestions: boolean;
  summary: boolean;
  notes: boolean;
};

export type FraudInfoType = {
  description: string;
  label: string;
};

export type NoteType = {
  key: string;
  value: string;
};

export type SessionInfoType = {
  call_id: string;
  ani?: string;
};
export type CallInfoType = {
  status: string;
  user_cnt: number;
  bio_result: BioResultType;
};

export type BioResultType = {
  result_type: string;
  bio_user_id: string;
  bio_result: string;
  bio_score: number;
  speech_millis: number;
};

export type LivenessScoreType = {
  label: string;
  global_post: number;
};

export type SatResultType = {
  label: string;
  valid: boolean;
  gender_label: string;
  gender_prob: number;
  age_estimate: number;
  age_label: string;
};

export type BlocklistResultType = {
  result_type: string;
  bio_user_id: string;
  bio_result: string;
  bio_score: number;
  speech_millis: 4080;
};
export type BioInfoType = {
  status: string;
  bio_result: BioResultType;
  user_cnt: number;
};

export type UserInfoType = {
  address: string;
  age: UserInfoResultAgeGender;
  gender: UserInfoResultAgeGender;
  name: string;
  user_id: string;
  trustLevel: number;
  validAni: boolean;
};

export type UserInfoResultAgeGender = {
  value: string;
  status: string;
  description: string;
};
export type DialogInfoType = {
  utt_list: [];
  real_time_agent: TranscriptionType;
  real_time_user: TranscriptionType;
};
export type VoiceInfoType = {
  liveness_score: LivenessScoreType;
  sat_result: SatResultType;
};

export type CallSummaryType = {
  duration: number;
  summary: string;
  timestamp: number;
  topic: string;
  type: string;
};

export type AiInfoType = {
  user_sentiment: SentimentTypes;
  user_emotions: string;
  user_anger_detected: boolean;
  user_intents: string;
  agent_sentiment: SentimentTypes;
  agent_tasks: string;
  agent_next_task: string;
  agent_suggested_prompt: string;
};

export type TranscriptionType = {
  leg: string;
  utt: string;
  is_final: boolean;
  words?: [];
  confidence?: number;
  audio_url?: string;
  audio_file?: string;
  transcription?: string;
};

export const FALSE_HIGH = "FALSE_HIGH";
export const FALSE_MEDIUM = "FALSE_MEDIUM";
export const FALSE_LOW = "FALSE_LOW";
export const TRUE_LOW = "TRUE_LOW";
export const TRUE_MEDIUM = "TRUE_MEDIUM";
export const TRUE_HIGH = "TRUE_HIGH";

export const NO_DATA = "NO_DATA";

export type SoundVolumeTypes = "quiet" | "normal" | "loud";

export type ToastCategoryTypes =
  | "Transcription"
  | "Prompt"
  | "Identification"
  | "Sentiment"
  | "Summary"
  | "Task"
  | "Live Transcription"
  | "Notes";

export type SentimentTypes = "negative" | "neutral" | "positive";
export type AgeGenderMatchStatusType =
  | "UNKNOWN"
  | "NOT_VERIFIED"
  | "BIO_ESTIMATION"
  | "MATCH_HIGH"
  | "MATCH_MEDIUM"
  | "MATCH_LOW";
export type BioResult =
  | typeof FALSE_HIGH
  | typeof FALSE_MEDIUM
  | typeof FALSE_LOW
  | typeof TRUE_LOW
  | typeof TRUE_MEDIUM
  | typeof TRUE_HIGH;
