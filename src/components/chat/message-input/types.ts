export type RecorderState = 'idle' | 'recording' | 'paused' | 'processing';

export interface MessageInputProps {
  chatId?: string;
  isNewChat?: boolean;
  onFocusChange?: (focused: boolean) => void;
}

export interface RecordingState {
  recorderState: RecorderState;
  recordingTime: number;
  audioBlob: Blob | null;
  waveformData: number[];
}

export interface TranscriptionConfig {
  enabled: boolean;
  provider: string;
  model: string;
  openAIKey: string;
}