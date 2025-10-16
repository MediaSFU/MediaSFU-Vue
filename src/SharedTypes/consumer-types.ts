// Consumer Types - Framework-agnostic consumer logic types
// These are used by shared methods and should be available across frameworks

export interface TriggerParameters {
  getUpdatedAllParams: () => TriggerParameters;
  [key: string]: any;
}

export interface TriggerOptions {
  ref_ActiveNames?: string[];
  parameters: TriggerParameters;
}

export type TriggerType = (options: TriggerOptions) => Promise<void>;

export interface ChangeVidsParameters {
  [key: string]: any;
}

export interface ChangeVidsOptions {
  screenChanged?: boolean;
  parameters: ChangeVidsParameters;
}

export type ChangeVidsType = (options: ChangeVidsOptions) => Promise<void>;

export interface ReorderStreamsParameters extends ChangeVidsParameters {
  getUpdatedAllParams: () => ReorderStreamsParameters;
  [key: string]: any;
}

export interface ReorderStreamsOptions {
  add?: boolean;
  screenChanged?: boolean;
  parameters: ReorderStreamsParameters;
}

export type ReorderStreamsType = (options: ReorderStreamsOptions) => Promise<void>;

export interface CompareScreenStatesParameters extends TriggerParameters {
  recordingDisplayType: 'video' | 'media' | 'all';
  recordingVideoOptimized: boolean;
  screenStates: any[];
  prevScreenStates: any[];
  activeNames: string[];
  trigger: TriggerType;
  getUpdatedAllParams: () => CompareScreenStatesParameters;
  [key: string]: any;
}

export interface CompareScreenStatesOptions {
  restart?: boolean;
  parameters: CompareScreenStatesParameters;
}

export type CompareScreenStatesType = (options: CompareScreenStatesOptions) => Promise<void>;

export interface CompareActiveNamesParameters extends TriggerParameters {
  activeNames: string[];
  prevActiveNames: string[];
  updateActiveNames: (activeNames: string[]) => void;
  updatePrevActiveNames: (prevActiveNames: string[]) => void;
  trigger: TriggerType;
  getUpdatedAllParams: () => CompareActiveNamesParameters;
  [key: string]: any;
}

export interface CompareActiveNamesOptions {
  restart?: boolean;
  parameters: CompareActiveNamesParameters;
}

export type CompareActiveNamesType = (options: CompareActiveNamesOptions) => Promise<void>;

export interface RePortParameters extends CompareScreenStatesParameters, CompareActiveNamesParameters {
  islevel: string;
  mainScreenPerson: string;
  adminOnMainScreen: boolean;
  mainScreenFilled: boolean;
  recordStarted: boolean;
  recordStopped: boolean;
  recordPaused: boolean;
  recordResumed: boolean;
  screenStates: any[];
  prevScreenStates: any[];
  updateScreenStates: (states: any[]) => void;
  updatePrevScreenStates: (states: any[]) => void;
  compareActiveNames: CompareActiveNamesType;
  compareScreenStates: CompareScreenStatesType;
  getUpdatedAllParams: () => RePortParameters;
  [key: string]: any;
}

export interface RePortOptions {
  restart?: boolean;
  parameters: RePortParameters;
}

export type RePortType = (options: RePortOptions) => Promise<void>;

export interface OnScreenChangesParameters extends ReorderStreamsParameters {
  eventType: string;
  shareScreenStarted: boolean;
  shared: boolean;
  addForBasic: boolean;
  updateAddForBasic: (value: boolean) => void;
  itemPageLimit: number;
  updateItemPageLimit: (value: number) => void;
  updateMainHeightWidth: (value: number) => void;
  reorderStreams: ReorderStreamsType;
  [key: string]: any;
}

export interface OnScreenChangesOptions {
  changed?: boolean;
  parameters: OnScreenChangesParameters;
}

export type OnScreenChangesType = (options: OnScreenChangesOptions) => Promise<void>;





