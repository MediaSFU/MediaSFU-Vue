<template>
  <MediasfuGeneric
    v-bind="forwardedProps"
    :ui-overrides="mergedUiOverrides"
  />
</template>

<script setup lang="ts">
import { computed, h } from 'vue';
import MediasfuGeneric from '../../components/mediasfuComponents/MediasfuGeneric.vue';
import type { MediasfuGenericOptions } from '../../components/mediasfuComponents/MediasfuGeneric.vue';
import {
  ModernAlertComponent,
  ModernAudioCard,
  ModernControlButtonsComponentTouch,
  ModernFlexibleGrid,
  ModernFlexibleVideo,
  ModernLoadingModal,
  ModernMainAspect,
  ModernMainContainer,
  ModernMainGrid,
  ModernMeetingProgressTimer,
  ModernMiniCard,
  ModernOtherGrid,
  ModernPagination,
  ModernSubAspect,
  ModernVideoCard,
} from '../display_components';
import ModernConfirmExitModal from '../modal_components/ModernConfirmExitModal.vue';
import ModernCoHostModal from '../modal_components/ModernCoHostModal.vue';
import ModernBackgroundModal from '../modal_components/ModernBackgroundModal.vue';
import ModernBreakoutRoomsModal from '../modal_components/ModernBreakoutRoomsModal.vue';
import ModernConfirmHereModal from '../modal_components/ModernConfirmHereModal.vue';
import ModernConfigureWhiteboardModal from '../modal_components/ModernConfigureWhiteboardModal.vue';
import ModernDisplaySettingsModal from '../modal_components/ModernDisplaySettingsModal.vue';
import ModernEventSettingsModal from '../modal_components/ModernEventSettingsModal.vue';
import ModernMediaSettingsModal from '../modal_components/ModernMediaSettingsModal.vue';
import ModernMenuModal from '../modal_components/ModernMenuModal.vue';
import ModernMessagesModal from '../modal_components/ModernMessagesModal.vue';
import ModernPermissionsModal from '../modal_components/ModernPermissionsModal.vue';
import ModernPanelistsModal from '../modal_components/ModernPanelistsModal.vue';
import ModernParticipantsModal from '../modal_components/ModernParticipantsModal.vue';
import ModernPollModal from '../modal_components/ModernPollModal.vue';
import ModernRecordingModal from '../modal_components/ModernRecordingModal.vue';
import ModernRequestsModal from '../modal_components/ModernRequestsModal.vue';
import ModernScreenboardModal from '../modal_components/ModernScreenboardModal.vue';
import ModernShareEventModal from '../modal_components/ModernShareEventModal.vue';
import ModernTranslationSettingsModal from '../modal_components/ModernTranslationSettingsModal.vue';
import ModernWaitingModal from '../modal_components/ModernWaitingModal.vue';
import ModernWhiteboard from '../whiteboard_components/ModernWhiteboard.vue';
import { ModernPreJoinPage, ModernWelcomePage } from '../misc_components';
import type { MediasfuUICustomOverrides } from '../../types/ui-overrides';
import type {
  ModernEntryShellLayout,
  ModernWelcomePageProps,
} from '../misc_components';

export interface ModernMediasfuGenericProps extends MediasfuGenericOptions {
  modernEntryShellLayout?: ModernEntryShellLayout;
}

const props = withDefaults(defineProps<ModernMediasfuGenericProps>(), {
  connectMediaSFU: true,
  modernEntryShellLayout: 'inline',
  returnUI: true,
});

const mergedUiOverrides = computed<MediasfuUICustomOverrides>(() => {
  const modernDefaults: MediasfuUICustomOverrides = {
    mainContainer: {
      component: ModernMainContainer,
    },
    mainAspect: {
      component: ModernMainAspect,
    },
    mainGrid: {
      component: ModernMainGrid,
    },
    otherGrid: {
      component: ModernOtherGrid,
    },
    subAspect: {
      component: ModernSubAspect,
    },
    pagination: {
      component: ModernPagination,
    },
    alert: {
      component: ModernAlertComponent,
    },
    loadingModal: {
      component: ModernLoadingModal,
    },
    menuModal: {
      component: ModernMenuModal,
    },
    videoCard: {
      component: ModernVideoCard,
    },
    audioCard: {
      component: ModernAudioCard,
    },
    miniCard: {
      component: ModernMiniCard,
    },
    flexibleGrid: {
      component: ModernFlexibleGrid,
    },
    flexibleGridAlt: {
      component: ModernFlexibleGrid,
    },
    flexibleVideo: {
      component: ModernFlexibleVideo,
    },
    participantsModal: {
      component: ModernParticipantsModal,
    },
    panelistsModal: {
      component: ModernPanelistsModal,
    },
    translationSettingsModal: {
      component: ModernTranslationSettingsModal,
    },
    messagesModal: {
      component: ModernMessagesModal,
    },
    confirmExitModal: {
      component: ModernConfirmExitModal,
    },
    requestsModal: {
      component: ModernRequestsModal,
    },
    eventSettingsModal: {
      component: ModernEventSettingsModal,
    },
    waitingRoomModal: {
      component: ModernWaitingModal,
    },
    coHostModal: {
      component: ModernCoHostModal,
    },
    mediaSettingsModal: {
      component: ModernMediaSettingsModal,
    },
    permissionsModal: {
      component: ModernPermissionsModal,
    },
    displaySettingsModal: {
      component: ModernDisplaySettingsModal,
    },
    confirmHereModal: {
      component: ModernConfirmHereModal,
    },
    shareEventModal: {
      component: ModernShareEventModal,
    },
    recordingModal: {
      component: ModernRecordingModal,
    },
    pollModal: {
      component: ModernPollModal,
    },
    backgroundModal: {
      component: ModernBackgroundModal,
    },
    breakoutRoomsModal: {
      component: ModernBreakoutRoomsModal,
    },
    configureWhiteboardModal: {
      component: ModernConfigureWhiteboardModal,
    },
    whiteboard: {
      component: ModernWhiteboard,
    },
    screenboardModal: {
      component: ModernScreenboardModal,
    },
    meetingProgressTimer: {
      component: ModernMeetingProgressTimer,
    },
    controlButtonsTouch: {
      component: ModernControlButtonsComponentTouch,
    },
    welcomePage: {
      render: (overrideProps) =>
        h(ModernWelcomePage, {
          ...(overrideProps as ModernWelcomePageProps),
          entryShellLayout: props.modernEntryShellLayout,
        }),
    },
  };

  const incomingOverrides = props.uiOverrides ?? {};

  return {
    ...modernDefaults,
    ...incomingOverrides,
  };
});

const forwardedProps = computed(() => {
  const {
    uiOverrides: _uiOverrides,
    modernEntryShellLayout: _modernEntryShellLayout,
    PrejoinPage,
    ...rest
  } = props;

  return {
    ...rest,
    PrejoinPage: PrejoinPage ?? ModernPreJoinPage,
  };
});
</script>