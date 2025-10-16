/**
 * MediaSFU Vue UI Override Types
 * 
 * Provides comprehensive TypeScript types for overriding any MediaSFU UI component
 * or helper function, enabling full customization while preserving type safety.
 */

import type { Component, VNode } from 'vue';
import type { ConsumerResumeType } from '../consumers/consumerResume';
import type { AddVideosGridType } from '../consumers/addVideosGrid';
import type { MainContainerComponentProps } from '../components/displayComponents/MainContainerComponent.vue';
import type { MainAspectComponentProps } from '../components/displayComponents/MainAspectComponent.vue';
import type { MainScreenComponentProps } from '../components/displayComponents/MainScreenComponent.vue';
import type { MainGridComponentProps } from '../components/displayComponents/MainGridComponent.vue';
import type { SubAspectComponentProps } from '../components/displayComponents/SubAspectComponent.vue';
import type { OtherGridComponentProps } from '../components/displayComponents/OtherGridComponent.vue';
import type { FlexibleGridProps } from '../components/displayComponents/FlexibleGrid.vue';
import type { FlexibleVideoProps } from '../components/displayComponents/FlexibleVideo.vue';
import type { AudioGridProps } from '../components/displayComponents/AudioGrid.vue';
import type { PaginationProps } from '../components/displayComponents/Pagination.vue';
import type { ControlButtonsComponentProps } from '../components/displayComponents/ControlButtonsComponent.vue';
import type { ControlButtonsAltComponentProps } from '../components/displayComponents/ControlButtonsAltComponent.vue';
import type { ControlButtonsComponentTouchProps } from '../components/displayComponents/ControlButtonsComponentTouch.vue';
import type { VideoCardProps } from '../components/displayComponents/VideoCard.vue';
import type { AudioCardProps } from '../components/displayComponents/AudioCard.vue';
import type { MiniCardProps } from '../components/displayComponents/MiniCard.vue';
import type { MiniAudioProps } from '../components/displayComponents/MiniAudio.vue';
import type { MeetingProgressTimerProps } from '../components/displayComponents/MeetingProgressTimer.vue';
import type { MiniAudioPlayerProps } from '../methods/utils/MiniAudioPlayer/MiniAudioPlayer.vue';
import type { LoadingModalProps } from '../components/displayComponents/LoadingModal.vue';
import type { AlertComponentProps } from '../components/displayComponents/AlertComponent.vue';
import type { MenuModalProps } from '../components/menuComponents/MenuModal.vue';
import type { EventSettingsModalProps } from '../components/eventSettingsComponents/EventSettingsModal.vue';
import type { RequestsModalProps } from '../components/requestsComponents/RequestsModal.vue';
import type { WaitingRoomModalProps } from '../components/waitingComponents/WaitingModal.vue';
import type { CoHostModalProps } from '../components/coHostComponents/CoHostModal.vue';
import type { MediaSettingsModalProps } from '../components/mediaSettingsComponents/MediaSettingsModal.vue';
import type { ParticipantsModalProps } from '../components/participantsComponents/ParticipantsModal.vue';
import type { MessagesModalProps } from '../components/messageComponents/MessagesModal.vue';
import type { DisplaySettingsModalProps } from '../components/displaySettingsComponents/DisplaySettingsModal.vue';
import type { ConfirmExitModalProps } from '../components/exitComponents/ConfirmExitModal.vue';
import type { ConfirmHereModalProps } from '../components/miscComponents/ConfirmHereModal.vue';
import type { ShareEventModalProps } from '../components/miscComponents/ShareEventModal.vue';
import type { RecordingModalProps } from '../components/recordingComponents/RecordingModal.vue';
import type { PollModalProps } from '../components/pollsComponents/PollModal.vue';
import type { BackgroundModalProps } from '../types/background';
import type { BreakoutRoomsModalOptions } from '../components/breakoutComponents/BreakoutRoomsModal.vue';
import type { ConfigureWhiteboardModalProps } from '../components/whiteboardComponents/ConfigureWhiteboardModal.vue';
import type { WhiteboardProps } from '../components/whiteboardComponents/Whiteboard.vue';
import type { ScreenboardProps } from '../components/screenboardComponents/Screenboard.vue';
import type { ScreenboardModalProps } from '../components/screenboardComponents/ScreenboardModal.vue';
import type { WelcomePageProps } from '../components/miscComponents/WelcomePage.vue';
import type { PreJoinPageProps } from '../components/miscComponents/PreJoinPage.vue';

/**
 * Custom component override interface
 * Allows replacing or wrapping any Vue component with custom implementation
 * 
 * @template Props - The props interface of the component being overridden
 */
export interface CustomComponentOverride<Props = Record<string, unknown>> {
  /**
   * Full replacement component - receives original props
   */
  component?: Component<Props>;
  
  /**
   * Render function for more granular control
   * Can wrap or modify the default component
   */
  render?: (props: Props, defaultRender?: () => VNode) => VNode;
}

/**
 * Custom function override interface
 * Allows replacing or wrapping helper functions with middleware-style patterns
 * 
 * @template Fn - The function signature being overridden
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CustomFunctionOverride<Fn extends (...args: any[]) => any> {
  /**
   * Full replacement implementation
   */
  implementation?: Fn;
  
  /**
   * Wrapper function - receives original implementation
   * Perfect for analytics, error handling, or rate limiting
   */
  wrap?: (defaultImplementation: Fn) => Fn;
}

/**
 * Main UI Overrides Map
 * 
 * Comprehensive interface covering all customizable MediaSFU surfaces:
 * - Layout components (containers, grids, screens)
 * - Control surfaces (buttons, timers, pagination)
 * - Participant cards (video, audio, mini)
 * - Modals (settings, messages, recording, etc.)
 * - Entry flows (welcome, pre-join)
 * - Helper functions (consumer resume, grid layout)
 */
export interface MediasfuUICustomOverrides {
  // Layout & Control Surfaces
  mainContainer?: CustomComponentOverride<MainContainerComponentProps>;
  mainAspect?: CustomComponentOverride<MainAspectComponentProps>;
  mainScreen?: CustomComponentOverride<MainScreenComponentProps>;
  mainGrid?: CustomComponentOverride<MainGridComponentProps>;
  subAspect?: CustomComponentOverride<SubAspectComponentProps>;
  otherGrid?: CustomComponentOverride<OtherGridComponentProps>;
  flexibleGrid?: CustomComponentOverride<FlexibleGridProps>;
  flexibleGridAlt?: CustomComponentOverride<FlexibleGridProps>;
  flexibleVideo?: CustomComponentOverride<FlexibleVideoProps>;
  audioGrid?: CustomComponentOverride<AudioGridProps>;
  pagination?: CustomComponentOverride<PaginationProps>;
  controlButtons?: CustomComponentOverride<ControlButtonsComponentProps>;
  controlButtonsAlt?: CustomComponentOverride<ControlButtonsAltComponentProps>;
  controlButtonsTouch?: CustomComponentOverride<ControlButtonsComponentTouchProps>;
  
  // Participant Cards & Widgets
  videoCard?: CustomComponentOverride<VideoCardProps>;
  audioCard?: CustomComponentOverride<AudioCardProps>;
  miniCard?: CustomComponentOverride<MiniCardProps>;
  miniAudio?: CustomComponentOverride<MiniAudioProps>;
  meetingProgressTimer?: CustomComponentOverride<MeetingProgressTimerProps>;
  miniAudioPlayer?: CustomComponentOverride<MiniAudioPlayerProps>;
  
  // Modals, Dialogs, and Collaboration Surfaces
  loadingModal?: CustomComponentOverride<LoadingModalProps>;
  alert?: CustomComponentOverride<AlertComponentProps>;
  menuModal?: CustomComponentOverride<MenuModalProps>;
  eventSettingsModal?: CustomComponentOverride<EventSettingsModalProps>;
  requestsModal?: CustomComponentOverride<RequestsModalProps>;
  waitingRoomModal?: CustomComponentOverride<WaitingRoomModalProps>;
  coHostModal?: CustomComponentOverride<CoHostModalProps>;
  mediaSettingsModal?: CustomComponentOverride<MediaSettingsModalProps>;
  participantsModal?: CustomComponentOverride<ParticipantsModalProps>;
  messagesModal?: CustomComponentOverride<MessagesModalProps>;
  displaySettingsModal?: CustomComponentOverride<DisplaySettingsModalProps>;
  confirmExitModal?: CustomComponentOverride<ConfirmExitModalProps>;
  confirmHereModal?: CustomComponentOverride<ConfirmHereModalProps>;
  shareEventModal?: CustomComponentOverride<ShareEventModalProps>;
  recordingModal?: CustomComponentOverride<RecordingModalProps>;
  pollModal?: CustomComponentOverride<PollModalProps>;
  backgroundModal?: CustomComponentOverride<BackgroundModalProps>;
  breakoutRoomsModal?: CustomComponentOverride<BreakoutRoomsModalOptions>;
  configureWhiteboardModal?: CustomComponentOverride<ConfigureWhiteboardModalProps>;
  whiteboard?: CustomComponentOverride<WhiteboardProps>;
  screenboard?: CustomComponentOverride<ScreenboardProps>;
  screenboardModal?: CustomComponentOverride<ScreenboardModalProps>;
  
  // Entry Flows & Custom Renderers
  welcomePage?: CustomComponentOverride<WelcomePageProps>;
  preJoinPage?: CustomComponentOverride<PreJoinPageProps>;
  customMenuButtonsRenderer?: CustomComponentOverride<ControlButtonsAltComponentProps>;
  
  // Function Overrides
  consumerResume?: CustomFunctionOverride<ConsumerResumeType>;
  addVideosGrid?: CustomFunctionOverride<AddVideosGridType>;
}

/**
 * Helper type to extract component props from override key
 */
export type OverrideComponentProps<K extends keyof MediasfuUICustomOverrides> = 
  MediasfuUICustomOverrides[K] extends CustomComponentOverride<infer P> ? P : never;

/**
 * Helper type to ensure type safety when creating overrides
 */
export type TypedOverride<K extends keyof MediasfuUICustomOverrides> = 
  MediasfuUICustomOverrides[K];
