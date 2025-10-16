import type { Component } from 'vue';
import type {
  CustomAudioCardOptions,
  CustomMiniCardOptions,
  CustomPreJoinPageOptions,
  CustomRenderer,
  CustomVideoCardOptions,
  CreateMediaSFURoomOptions,
  JoinMediaSFURoomOptions,
  Participant,
  ShowAlert,
  StyleDictionary,
} from '../SharedTypes';
import type { MediasfuUICustomOverrides } from './ui-overrides';

// Re-export all types from SharedTypes (bundled with package)
// Using regular export (not type-only) for better compatibility
export * from '../SharedTypes';

export interface Credentials {
  apiUserName: string;
  apiKey: string;
}

export type CustomComponent = Component<{ parameters: Record<string, unknown> }>;
export type CustomVideoCardComponent = Component<CustomVideoCardOptions>;
export type CustomAudioCardComponent = Component<CustomAudioCardOptions>;
export type CustomMiniCardComponent = Component<CustomMiniCardOptions>;
export type CustomPreJoinPageComponent = Component<CustomPreJoinPageOptions>;

export interface MediasfuGenericProps {
  prejoinPage?: CustomPreJoinPageComponent;
  credentials?: Credentials;
  localLink?: string;
  connectMediaSFU?: boolean;
  returnUI?: boolean;
  noUIPreJoinOptions?: CreateMediaSFURoomOptions | JoinMediaSFURoomOptions;
  sourceParameters?: Record<string, unknown>;
  updateSourceParameters?: (params: Record<string, unknown>) => void;
  createMediaSFURoom?: CustomRenderer<Promise<unknown>, CreateMediaSFURoomOptions>;
  joinMediaSFURoom?: CustomRenderer<Promise<unknown>, JoinMediaSFURoomOptions>;
  customComponent?: CustomComponent | null;
  customVideoCard?: CustomVideoCardComponent | null;
  customAudioCard?: CustomAudioCardComponent | null;
  customMiniCard?: CustomMiniCardComponent | null;
  containerStyle?: StyleDictionary;
  seedData?: Participant[];
  uiOverrides?: MediasfuUICustomOverrides;
  useSeed?: boolean;
  imgSrc?: string;
}

export interface MediaAlert {
  id: number;
  message: string;
  type: 'success' | 'danger';
}

export interface MediaSessionState {
  isSessionActive: boolean;
  isLoading: boolean;
  participants: Participant[];
  roomName: string;
  hostName: string;
}

export interface MediaSessionApi {
  startSession: (options: CreateMediaSFURoomOptions | JoinMediaSFURoomOptions) => Promise<void>;
  endSession: () => void;
  showAlert: ShowAlert;
}
