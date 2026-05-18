import type { CSSProperties } from 'vue';
import type {
  CustomAudioCardOptions as SharedCustomAudioCardOptions,
  CustomMiniCardOptions as SharedCustomMiniCardOptions,
  CustomPreJoinPageOptions as SharedCustomPreJoinPageOptions,
  CustomRenderer,
  CustomVideoCardOptions as SharedCustomVideoCardOptions,
} from '../SharedTypes';

export type CustomVideoCardOptions = SharedCustomVideoCardOptions;

export type CustomAudioCardOptions = SharedCustomAudioCardOptions & {
  imageStyle?: CSSProperties;
};

export type CustomMiniCardOptions = SharedCustomMiniCardOptions & {
  imageStyle?: CSSProperties;
};

export type CustomPreJoinPageOptions = SharedCustomPreJoinPageOptions;

export type CustomVideoCardType = CustomRenderer<unknown, CustomVideoCardOptions>;
export type CustomAudioCardType = CustomRenderer<unknown, CustomAudioCardOptions>;
export type CustomMiniCardType = CustomRenderer<unknown, CustomMiniCardOptions>;
export type CustomPreJoinPageType = CustomRenderer<unknown, CustomPreJoinPageOptions>;
export type CustomComponentType = CustomRenderer<unknown, { parameters: any }>;