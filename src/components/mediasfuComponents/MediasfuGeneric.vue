<!--
/**
 * @fileoverview MediasfuGeneric - Main orchestrator component for MediaSFU platform
 * @component MediasfuGeneric
 * @module components/mediasfuComponents/MediasfuGeneric
 * 
 * @description
 * The core component that orchestrates the entire MediaSFU experience. This is the main
 * entry point for all MediaSFU functionality, handling room initialization, participant
 * management, media streaming, UI rendering, and real-time communication. It supports
 * multiple event types (webinar, conference, broadcast, chat) and provides comprehensive
 * customization through the UI override system.
 * 
 * Key Features:
 * - Multi-event type support (webinar, conference, broadcast, chat, generic)
 * - Complete UI override system via `uiOverrides` prop
 * - Pre-join page with room creation and joining
 * - Real-time WebRTC media streaming (audio/video)
 * - Screen sharing and recording capabilities
 * - Whiteboard and screenboard collaboration
 * - Breakout rooms functionality
 * - Participant management and controls
 * - Chat and messaging system
 * - Polls and Q&A features
 * - Responsive layout with grid/list views
 * - Local and MediaSFU cloud integration
 * - Seed data support for testing
 * - Custom component injection at any level
 * 
 * Architecture:
 * - Validates and authenticates users via PreJoinPage
 * - Establishes socket connection (local or MediaSFU cloud)
 * - Manages WebRTC peer connections via mediasoup
 * - Renders main UI with grid layouts, controls, and modals
 * - Exposes `allParameters` object with all state and methods
 * - Resolves UI overrides via `useUIOverrides` composable
 * - Exports resolved card components for downstream use
 * 
 * @example Basic Usage - Conference Mode
 * // <MediasfuGeneric
 *   // defaultEventType="conference"
 *   // :credentials="{ apiUserName: 'user123', apiKey: 'key456' }"
 *   // connectMediaSFU
 * // />
 * 
 * @example With UI Overrides - Custom Cards
 * // <script setup>
 * import { computed } from 'vue';
 * import MediasfuGeneric from './components/mediasfuComponents/MediasfuGeneric.vue';
 * import CustomVideoCard from './components/custom/CustomVideoCard.vue';
 * 
 * const uiOverrides = computed(() => ({
 *   // videoCard: { component: CustomVideoCard },
 *   // audioCard: { component: CustomAudioCard },
 *   // miniCard: { component: CustomMiniCard }
 * }));
 * </script>
 * 
 * // <template>
 *   <MediasfuGeneric
 *     defaultEventType="webinar"
 *     :uiOverrides="uiOverrides"
 *     :credentials="credentials"
 *   />
 * </template>
 * 
 * @example Local Development Mode
 * // <MediasfuGeneric
 *   // defaultEventType="conference"
 *   // localLink="http://localhost:3000"
 *   // :connectMediaSFU="false"
 *   // useLocalUIMode
 * // />
 * 
 * @example No-UI Mode with Seed Data (Testing)
 * // <MediasfuGeneric
 *   // defaultEventType="broadcast"
 *   // :returnUI="false"
 *   // useSeed
 *   // :seedData="{
 *     member: 'Host',
 *     host: 'Host',
 *     eventType: 'broadcast',
 *     participants: [...],
 *     messages: [...]
 *   }"
 * // />
 * 
 * @example Complete Custom UI Replacement
 * // <MediasfuGeneric
 *   // defaultEventType="conference"
 *   // :customComponent="MyCompleteUI"
 *   // :credentials="credentials"
 * // />
 * 
 * @example Comprehensive Override System
 * const uiOverrides = computed(() => ({
 *   // Layout components
 *   // mainContainer: { component: CustomMainContainer },
 *   // flexibleVideo: { component: CustomFlexibleVideo },
 *   
 *   // Participant cards
 *   // videoCard: { component: CustomVideoCard },
 *   // audioCard: { component: CustomAudioCard },
 *   // miniCard: { component: CustomMiniCard },
 *   
 *   // Modals
 *   // participantsModal: { component: CustomParticipantsModal },
 *   // messagesModal: { component: CustomMessagesModal },
 *   
 *   // Entry flows
 *   // preJoinPage: { component: CustomPreJoinPage },
 *   // welcomePage: { component: CustomWelcomePage },
 *   
 *   // Functions
 *   // consumerResume: {
 *     wrap: (defaultFn) => async (options) => {
 *       console.log('Consumer resuming:', options);
 *       return await defaultFn(options);
 *     }
 *   }
 * }));
 * 
 * @see {@link MediasfuUICustomOverrides} for all available overrides
 * @see {@link https://mediasfu.com/docs} for comprehensive documentation
 */
-->
<template>
  <div
    ref="mediaContainerRef"
    class="MediaSFU"
    :style="computedContainerStyle"
  >
    <!-- Custom Component (full UI override) -->
    <component
      :is="resolvedCustomComponent"
      v-if="resolvedCustomComponent && validated"
      :parameters="allParameters"
    />

    <!-- Pre-join Page -->
    <component
      :is="prejoinComponent"
      v-else-if="!validated"
      :parameters="prejoinParameters"
      :credentials="credentials"
      :local-link="localLink"
      :connect-media-s-f-u="connectMediaSFU"
      :return-u-i="returnUI"
      :no-u-i-pre-join-options="noUIPreJoinOptions"
      :create-media-s-f-u-room="createMediaSFURoom"
      :join-media-s-f-u-room="joinMediaSFURoom"
    />

    <!-- Main UI -->
    <component
      :is="MainContainer"
      v-else-if="returnUI"
    >
      <!-- Main aspect component contains all but the control buttons -->
      <component
        :is="MainAspect"
        background-color="rgba(217, 227, 234, 0.99)"
        :default-fraction="1 - controlHeight"
        :update-is-wide-screen="updateIsWideScreen"
        :update-is-medium-screen="updateIsMediumScreen"
        :update-is-small-screen="updateIsSmallScreen"
        :show-controls="eventType === 'webinar' || eventType === 'conference'"
      >
        <!-- MainScreenComponent contains the main grid view and the minor grid view -->
        <component
          :is="MainScreen"
          :do-stack="true"
          :main-size="mainHeightWidth"
          :update-component-sizes="updateComponentSizes"
          :default-fraction="1 - controlHeight"
          :component-sizes="componentSizes"
          :show-controls="eventType === 'webinar' || eventType === 'conference'"
        >
          <!-- MainGridComponent shows the main grid view -->
          <component
            :is="MainGrid"
            :height="componentSizes.mainHeight"
            :width="componentSizes.mainWidth"
            background-color="rgba(217, 227, 234, 0.99)"
            :main-size="mainHeightWidth"
            :show-aspect="mainHeightWidth > 0"
            :time-background-color="recordState"
            :meeting-progress-time="meetingProgressTime"
            :stack-direction="isWideScreen ? 'row' : 'column'"
          >
            <component
              :is="FlexibleVideoComponent"
              :custom-width="componentSizes.mainWidth"
              :custom-height="componentSizes.mainHeight"
              :rows="1"
              :columns="1"
              :components-to-render="mainGridStream"
              :show-aspect="mainGridStream.length > 0 && !(whiteboardStarted && !whiteboardEnded)"
              :local-stream-screen="localStreamScreen"
              :annotate-screen-stream="annotateScreenStream"
            >
              <template #Screenboard>
                <component
                  :is="ScreenboardComponent"
                  v-if="shared"
                  :custom-width="componentSizes.mainWidth"
                  :custom-height="componentSizes.mainHeight"
                  :parameters="allParameters"
                  :show-aspect="shared"
                />
              </template>
            </component>

            <component
              :is="WhiteboardComponent"
              :custom-width="componentSizes.mainWidth"
              :custom-height="componentSizes.mainHeight"
              :parameters="whiteboardParameters"
              :show-aspect="whiteboardStarted && !whiteboardEnded"
            />

            <component
              :is="ControlButtonsTouch"
              :buttons="controlBroadcastButtons"
              position="right"
              location="bottom"
              direction="vertical"
              :show-aspect="eventType === 'broadcast'"
            />

            <!-- Button to launch recording modal -->
            <component
              :is="ControlButtonsTouch"
              :buttons="recordButton"
              direction="horizontal"
              :show-aspect="eventType === 'broadcast' && !showRecordButtons && islevel === '2'"
              location="bottom"
              position="middle"
            />

            <!-- Buttons to control recording -->
            <component
              :is="ControlButtonsTouch"
              :buttons="recordButtons"
              direction="horizontal"
              :show-aspect="eventType === 'broadcast' && showRecordButtons && islevel === '2'"
              location="bottom"
              position="middle"
            />
          </component>

          <!-- OthergridComponent shows the minor grid view -->
          <component
            :is="OtherGrid"
            :height="componentSizes.otherHeight"
            :width="componentSizes.otherWidth"
            background-color="rgba(217, 227, 234, 0.99)"
            :show-aspect="mainHeightWidth !== 100"
            :time-background-color="recordState"
            :show-timer="mainHeightWidth === 0"
            :meeting-progress-time="meetingProgressTime"
            :stack-direction="isWideScreen ? 'row' : 'column'"
          >
            <!-- Pagination -->
            <div
              :style="{
                width: paginationDirection === 'horizontal' ? componentSizes.otherWidth + 'px' : paginationHeightWidth + 'px',
                height: paginationDirection === 'horizontal' ? paginationHeightWidth + 'px' : componentSizes.otherHeight + 'px',
                padding: 0,
                margin: 0,
                display: doPaginate ? 'flex' : 'none',
                flexDirection: paginationDirection === 'horizontal' ? 'row' : 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }"
            >
              <component
                :is="PaginationComponent"
                :total-pages="numberPages"
                :current-user-page="currentUserPage"
                :show-aspect="doPaginate"
                :pagination-height="paginationHeightWidth"
                :direction="paginationDirection"
                :parameters="allParameters"
              />
            </div>

            <!-- AudioGrid contains all the audio only streams -->
            <component
              :is="AudioGridComponent"
              :components-to-render="audioOnlyComponents"
            />

            <component
              :is="ControlButtonsTouch"
              :buttons="controlChatButtons"
              position="right"
              location="bottom"
              direction="vertical"
              :show-aspect="eventType === 'chat'"
            />

            <component
              :is="FlexibleGridPrimary"
              :custom-width="gridSizes.gridWidth ?? 0"
              :custom-height="gridSizes.gridHeight ?? 0"
              :rows="gridRows"
              :columns="gridCols"
              :components-to-render="otherGridComponentLists[0]"
              background-color="rgba(217, 227, 234, 0.99)"
            />

            <component
              :is="FlexibleGridAlt"
              :custom-width="gridSizes.altGridWidth ?? 0"
              :custom-height="gridSizes.altGridHeight ?? 0"
              :rows="altGridRows"
              :columns="altGridCols"
              :components-to-render="otherGridComponentLists[1]"
              background-color="rgba(217, 227, 234, 0.99)"
            />
          </component>
        </component>
      </component>

      <!-- SubAspectComponent is used for webinar and conference events only to display fixed control buttons -->
      <component
        :is="SubAspect"
        background-color="rgba(217, 227, 234, 0.99)"
        :show-controls="eventType === 'webinar' || eventType === 'conference'"
        :default-fraction-sub="controlHeight"
      >
        <component
          :is="ControlButtons"
          :buttons="controlButtons"
          button-color="black"
          :button-background-color="{ default: 'transparent', pressed: 'transparent' }"
          alignment="space-between"
          :vertical="false"
          :buttons-container-style="{
            marginTop: 2,
            marginBottom: 2,
            backgroundColor: 'transparent',
          }"
        />
      </component>
    </component>

    <!-- All Modals -->
    <template v-if="returnUI && !resolvedCustomComponent">
      <component
        :is="MenuModalComponent"
        background-color="rgba(181, 233, 229, 0.97)"
        :is-visible="isMenuModalVisible"
        :on-close="() => updateIsMenuModalVisible(false)"
        :custom-buttons="customMenuButtons"
        :room-name="roomName"
        :admin-passcode="adminPasscode"
        :islevel="islevel"
        :event-type="eventType"
        :local-link="localLink"
      />

      <component
        :is="EventSettingsModalComponent"
        background-color="rgba(217, 227, 234, 0.99)"
        :is-event-settings-modal-visible="isSettingsModalVisible"
        :update-is-settings-modal-visible="updateIsSettingsModalVisible"
        :on-event-settings-close="() => updateIsSettingsModalVisible(false)"
        :audio-setting="audioSetting"
        :video-setting="videoSetting"
        :screenshare-setting="screenshareSetting"
        :chat-setting="chatSetting"
        :update-audio-setting="updateAudioSetting"
        :update-video-setting="updateVideoSetting"
        :update-screenshare-setting="updateScreenshareSetting"
        :update-chat-setting="updateChatSetting"
        :room-name="roomName"
        :socket="castedSocket"
      />

      <component
        :is="RequestsModalComponent"
        background-color="rgba(217, 227, 234, 0.99)"
        :is-requests-modal-visible="isRequestsModalVisible"
        :on-request-close="() => updateIsRequestsModalVisible(false)"
        :request-counter="requestCounter"
        :on-request-filter-change="onRequestFilterChange"
        :update-request-list="updateRequestList"
        :request-list="filteredRequestList"
        :room-name="roomName"
        :socket="castedSocket"
        :parameters="{
          updateRequestCounter,
          updateRequestFilter,
          updateRequestList,
          getUpdatedAllParams,
        }"
      />

      <component
        :is="WaitingRoomModalComponent"
        background-color="rgba(217, 227, 234, 0.99)"
        :is-waiting-modal-visible="isWaitingModalVisible"
        :on-waiting-room-close="() => updateIsWaitingModalVisible(false)"
        :waiting-room-counter="waitingRoomCounter"
        :on-waiting-room-filter-change="onWaitingRoomFilterChange"
        :waiting-room-list="filteredWaitingRoomList"
        :update-waiting-list="updateWaitingRoomList"
        :room-name="roomName"
        :socket="castedSocket"
        :parameters="{
          filteredWaitingRoomList,
          getUpdatedAllParams,
        }"
      />

      <component
        :is="CoHostModalComponent"
        background-color="rgba(217, 227, 234, 0.99)"
        :is-co-host-modal-visible="isCoHostModalVisible"
        :update-is-co-host-modal-visible="updateIsCoHostModalVisible"
        :on-co-host-close="() => updateIsCoHostModalVisible(false)"
        :co-host-responsibility="coHostResponsibility"
        :participants="participants"
        :current-cohost="coHost"
        :room-name="roomName"
        :show-alert="showAlert"
        :update-co-host-responsibility="updateCoHostResponsibility"
        :update-co-host="updateCoHost"
        :socket="castedSocket"
      />

      <component
        :is="MediaSettingsModalComponent"
        background-color="rgba(181, 233, 229, 0.97)"
        :is-media-settings-modal-visible="isMediaSettingsModalVisible"
        :on-media-settings-close="() => updateIsMediaSettingsModalVisible(false)"
        :parameters="allParameters"
      />

      <component
        :is="ParticipantsModalComponent"
        background-color="rgba(217, 227, 234, 0.99)"
        :is-participants-modal-visible="isParticipantsModalVisible"
        :on-participants-close="() => updateIsParticipantsModalVisible(false)"
        :participants-counter="participantsCounter"
        :on-participants-filter-change="onParticipantsFilterChange"
        :on-mute-participants="muteParticipants"
        :on-message-participants="messageParticipants"
        :on-remove-participants="removeParticipants"
        :parameters="{
          updateParticipants,
          updateIsParticipantsModalVisible,
          updateDirectMessageDetails,
          updateStartDirectMessage,
          updateIsMessagesModalVisible,
          showAlert,
          filteredParticipants,
          participants: filteredParticipants,
          roomName,
          islevel,
          member,
          coHostResponsibility,
          coHost,
          eventType,
          startDirectMessage,
          directMessageDetails,
          socket: castedSocket,
          getUpdatedAllParams: getAllParams,
        }"
      />

      <component
        :is="DisplaySettingsModalComponent"
        background-color="rgba(217, 227, 234, 0.99)"
        :is-display-settings-modal-visible="isDisplaySettingsModalVisible"
        :on-display-settings-close="() => updateIsDisplaySettingsModalVisible(false)"
        :parameters="allParameters"
      />

      <component
        :is="RecordingModalComponent"
        background-color="rgba(217, 227, 234, 0.99)"
        :is-recording-modal-visible="isRecordingModalVisible"
        :on-close="() => updateIsRecordingModalVisible(false)"
        :start-recording="startRecording"
        :confirm-recording="confirmRecording"
        :parameters="allParameters"
      />

      <component
        :is="MessagesModalComponent"
        :background-color="eventType === 'webinar' || eventType === 'conference' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.25)'"
        :is-messages-modal-visible="isMessagesModalVisible"
        :on-messages-close="() => updateIsMessagesModalVisible(false)"
        :messages="messages"
        :event-type="eventType"
        :member="member"
        :islevel="islevel"
        :co-host-responsibility="coHostResponsibility"
        :co-host="coHost"
        :start-direct-message="startDirectMessage"
        :direct-message-details="directMessageDetails"
        :update-start-direct-message="updateStartDirectMessage"
        :update-direct-message-details="updateDirectMessageDetails"
        :show-alert="showAlert"
        :room-name="roomName"
        :socket="castedSocket"
        :chat-setting="chatSetting"
      />

      <component
        :is="ConfirmExitModalComponent"
        background-color="rgba(181, 233, 229, 0.97)"
        :is-confirm-exit-modal-visible="isConfirmExitModalVisible"
        :on-confirm-exit-close="() => updateIsConfirmExitModalVisible(false)"
        :member="member"
        :room-name="roomName"
        :socket="castedSocket"
        :islevel="islevel"
      />

      <component
        :is="ConfirmHereModalComponent"
        background-color="rgba(181, 233, 229, 0.97)"
        :is-confirm-here-modal-visible="isConfirmHereModalVisible"
        :on-confirm-here-close="() => updateIsConfirmHereModalVisible(false)"
        :member="member"
        :room-name="roomName"
        :socket="castedSocket"
      />

      <component
        :is="ShareEventModalComponent"
        :is-share-event-modal-visible="isShareEventModalVisible"
        :on-share-event-close="() => updateIsShareEventModalVisible(false)"
        :room-name="roomName"
        :islevel="islevel"
        :admin-passcode="adminPasscode"
        :event-type="eventType"
        :local-link="localLink"
      />

      <component
        :is="PollModalComponent"
        :is-poll-modal-visible="isPollModalVisible"
        :on-close="() => updateIsPollModalVisible(false)"
        :member="member"
        :islevel="islevel"
        :polls="polls"
        :poll="poll"
        :socket="castedSocket"
        :room-name="roomName"
        :show-alert="showAlert"
        :update-is-poll-modal-visible="updateIsPollModalVisible"
        :handle-create-poll="handleCreatePoll"
        :handle-end-poll="handleEndPoll"
        :handle-vote-poll="handleVotePoll"
      />

      <component
        :is="BackgroundModalComponent"
        background-color="rgba(217, 227, 234, 0.99)"
        :is-visible="isBackgroundModalVisible"
        :on-close="() => updateIsBackgroundModalVisible(false)"
        :parameters="allParameters"
      />

      <component
        :is="BreakoutRoomsModalComponent"
        background-color="rgba(217, 227, 234, 0.99)"
        :is-visible="isBreakoutRoomsModalVisible"
        :on-breakout-rooms-close="() => updateIsBreakoutRoomsModalVisible(false)"
        :parameters="allParameters"
      />

      <component
        :is="ConfigureWhiteboardModalComponent"
        background-color="rgba(217, 227, 234, 0.99)"
        :is-visible="isConfigureWhiteboardModalVisible"
        :on-configure-whiteboard-close="() => updateIsConfigureWhiteboardModalVisible(false)"
        :parameters="allParameters"
      />

      <!-- @vue-ignore -->
      <component
        :is="ScreenboardModalComponent"
        background-color="rgba(217, 227, 234, 0.99)"
        :is-visible="isScreenboardModalVisible"
        :on-close="() => updateIsScreenboardModalVisible(false)"
        :parameters="allParameters"
      />

      <component
        :is="AlertComponentOverride"
        :visible="alertVisible"
        :message="alertMessage"
        :type="alertType"
        :duration="alertDuration"
        :on-hide="() => (alertVisible = false)"
        text-color="#ffffff"
      />

      <component
        :is="LoadingModalComponent"
        :is-visible="isLoadingModalVisible"
        background-color="rgba(217, 227, 234, 0.99)"
        display-color="black"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, h, markRaw, type Component, type ComputedRef } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faMicrophoneSlash,
  faVideoSlash,
  faDesktop,
  faPhone,
  faUsers,
  faBars,
  faComments,
  faShareAlt,
  faSync,
  faChartBar,
  faRecordVinyl,
  faCog,
  faClock,
  faUserPlus,
  faTools,
  faPlayCircle,
  faPauseCircle,
  faStopCircle,
  faDotCircle,
  faVideo,
  faMicrophone,
  faPoll,
  faUserFriends,
  faChalkboardTeacher,
  faBan,
  } from '@fortawesome/free-solid-svg-icons';

// Initial values
import { initialValuesState } from '@legacy/methods/utils/initialValuesState';

// Import components
import MainAspectComponent from '../displayComponents/MainAspectComponent.vue';
import LoadingModal from '../displayComponents/LoadingModal.vue';
import ControlButtonsComponent from '../displayComponents/ControlButtonsComponent.vue';
import ControlButtonsAltComponent from '../displayComponents/ControlButtonsAltComponent.vue';
import ControlButtonsComponentTouch from '../displayComponents/ControlButtonsComponentTouch.vue';
import OthergridComponent from '../displayComponents/OtherGridComponent.vue';
import MainScreenComponent from '../displayComponents/MainScreenComponent.vue';
import MainGridComponent from '../displayComponents/MainGridComponent.vue';
import SubAspectComponent from '../displayComponents/SubAspectComponent.vue';
import MainContainerComponent from '../displayComponents/MainContainerComponent.vue';
import AlertComponent from '../displayComponents/AlertComponent.vue';
import MenuModal from '../menuComponents/MenuModal.vue';
import RecordingModal from '../recordingComponents/RecordingModal.vue';
import RequestsModal from '../requestsComponents/RequestsModal.vue';
import WaitingRoomModal from '../waitingComponents/WaitingModal.vue';
import DisplaySettingsModal from '../displaySettingsComponents/DisplaySettingsModal.vue';
import EventSettingsModal from '../eventSettingsComponents/EventSettingsModal.vue';
import CoHostModal from '../coHostComponents/CoHostModal.vue';
import ParticipantsModal from '../participantsComponents/ParticipantsModal.vue';
import MessagesModal from '../messageComponents/MessagesModal.vue';
import MediaSettingsModal from '../mediaSettingsComponents/MediaSettingsModal.vue';
import ConfirmExitModal from '../exitComponents/ConfirmExitModal.vue';
import ConfirmHereModal from '../miscComponents/ConfirmHereModal.vue';
import ShareEventModal from '../miscComponents/ShareEventModal.vue';
import WelcomePage from '../miscComponents/WelcomePage.vue';
import PreJoinPage from '../miscComponents/PreJoinPage.vue';
import PollModal from '../pollsComponents/PollModal.vue';
import BackgroundModal from '../backgroundComponents/BackgroundModal.vue';
import BreakoutRoomsModal from '../breakoutComponents/BreakoutRoomsModal.vue';
import ConfigureWhiteboardModal from '../whiteboardComponents/ConfigureWhiteboardModal.vue';
import Whiteboard from '../whiteboardComponents/Whiteboard.vue';
import Screenboard from '../screenboardComponents/Screenboard.vue';
import ScreenboardModal from '../screenboardComponents/ScreenboardModal.vue';
import Pagination from '../displayComponents/Pagination.vue';
import FlexibleGrid from '../displayComponents/FlexibleGrid.vue';
import FlexibleVideo from '../displayComponents/FlexibleVideo.vue';
import AudioGrid from '../displayComponents/AudioGrid.vue';
import VideoCard from '../displayComponents/VideoCard.vue';
import AudioCard from '../displayComponents/AudioCard.vue';
import MiniCard from '../displayComponents/MiniCard.vue';
import MiniCardAudio from '../displayComponents/MiniCardAudio.vue';
import MiniAudio from '../displayComponents/MiniAudio.vue';
import MiniAudioPlayer from '../../methods/utils/MiniAudioPlayer/MiniAudioPlayer.vue';
import { useUIOverrides } from '../../composables/useUIOverrides';
import type { MediasfuUICustomOverrides } from '../../types/ui-overrides';
// Import methods (from shared folder)
import { launchMenuModal } from 'mediasfu-shared';
import { launchRecording } from 'mediasfu-shared';
import { startRecording } from 'mediasfu-shared';
import { confirmRecording } from 'mediasfu-shared';
import { launchWaiting } from 'mediasfu-shared';
import { launchCoHost } from 'mediasfu-shared';
import { launchMediaSettings } from 'mediasfu-shared';
import { launchDisplaySettings } from 'mediasfu-shared';
import { launchSettings } from 'mediasfu-shared';
import { launchRequests } from 'mediasfu-shared';
import { launchParticipants } from 'mediasfu-shared';
import { muteParticipants, messageParticipants, removeParticipants } from 'mediasfu-shared';
import { launchMessages } from 'mediasfu-shared';
import { launchConfirmExit } from 'mediasfu-shared';
import { launchPoll } from 'mediasfu-shared';
import { launchBreakoutRooms } from 'mediasfu-shared';
import { launchConfigureWhiteboard } from 'mediasfu-shared';

// Import the platform-specific WebRTC module
import { mediaDevices } from '@legacy/methods/utils/webrtc/webrtc';

// mediasfu functions
import { connectSocket, connectLocalSocket } from '@legacy/sockets/SocketManager';
import { joinRoomClient } from '@legacy/ProducerClient/producerClientEmits/joinRoomClient';
import { joinLocalRoom } from '@legacy/producers/producerEmits/joinLocalRoom';
import { updateRoomParametersClient } from '@legacy/ProducerClient/producerClientEmits/updateRoomParametersClient';
import { createDeviceClient } from '@legacy/ProducerClient/producerClientEmits/createDeviceClient';
// Stream methods - use shared where available
import { switchVideoAlt } from 'mediasfu-shared';
// These stay in src (not in shared)
import { clickVideo } from '@legacy/methods/streamMethods/clickVideo';
import { clickAudio } from '@legacy/methods/streamMethods/clickAudio';
import { clickScreenShare } from '@legacy/methods/streamMethods/clickScreenShare';

// Consumer functions - use shared where available
import { streamSuccessVideo } from 'mediasfu-shared';
import { streamSuccessAudio } from 'mediasfu-shared';
import { streamSuccessScreen } from 'mediasfu-shared';
import { streamSuccessAudioSwitch } from 'mediasfu-shared';
import { checkPermission } from 'mediasfu-shared';

// More mediasfu functions (from shared)
import { updateMiniCardsGrid } from 'mediasfu-shared';
import { mixStreams } from 'mediasfu-shared';
import { dispStreams } from 'mediasfu-shared';
import { stopShareScreen } from 'mediasfu-shared';
import { checkScreenShare } from 'mediasfu-shared';
import { startShareScreen } from 'mediasfu-shared';
import { requestScreenShare } from 'mediasfu-shared';
import { reorderStreams } from 'mediasfu-shared';
import { getVideos } from 'mediasfu-shared';
import { rePort } from 'mediasfu-shared';
import { trigger } from 'mediasfu-shared';
import { connectSendTransportAudio } from 'mediasfu-shared';
import { connectSendTransportVideo } from 'mediasfu-shared';
import { connectSendTransportScreen } from 'mediasfu-shared';
import { processConsumerTransports } from 'mediasfu-shared';
import { resumePauseStreams } from 'mediasfu-shared';
import { readjust } from 'mediasfu-shared';
import { checkGrid } from 'mediasfu-shared';
import { getEstimate } from 'mediasfu-shared';
import { calculateRowsAndColumns } from 'mediasfu-shared';
import { onScreenChanges } from 'mediasfu-shared';

// Vue-native consumer implementations
import { prepopulateUserMedia } from '../../consumers/prepopulateUserMedia';
import { addVideosGrid } from '../../consumers/addVideosGrid';
// Still use React versions for these (will migrate later)
import { consumerResume } from '../../consumers/consumerResume';
import { sleep } from '@legacy/methods/utils/sleep';
// More consumers from shared
import { changeVids } from 'mediasfu-shared';
import { compareActiveNames } from 'mediasfu-shared';
import { compareScreenStates } from 'mediasfu-shared';
import { createSendTransport } from 'mediasfu-shared';
import { resumeSendTransportAudio } from 'mediasfu-shared';
import { receiveAllPipedTransports } from 'mediasfu-shared';
import { disconnectSendTransportVideo } from 'mediasfu-shared';
import { disconnectSendTransportAudio } from 'mediasfu-shared';
import { disconnectSendTransportScreen } from 'mediasfu-shared';
import { connectSendTransport } from 'mediasfu-shared';
import { getPipedProducersAlt } from 'mediasfu-shared';
import { signalNewConsumerTransport } from 'mediasfu-shared';
import { connectRecvTransport } from 'mediasfu-shared';
import { reUpdateInter } from 'mediasfu-shared';
import { updateParticipantAudioDecibels } from 'mediasfu-shared';
import { closeAndResize } from 'mediasfu-shared';
import { autoAdjust } from 'mediasfu-shared';
import { switchUserVideoAlt } from 'mediasfu-shared';
import { switchUserVideo } from 'mediasfu-shared';
import { switchUserAudio } from 'mediasfu-shared';
import { receiveRoomMessages } from 'mediasfu-shared';
import { formatNumber } from '@legacy/methods/utils/formatNumber';
import { connectIps } from 'mediasfu-shared';
import { connectLocalIps } from 'mediasfu-shared';
import { pollUpdated } from '@legacy/methods/pollsMethods/pollUpdated';
import { handleCreatePoll } from 'mediasfu-shared';
import { handleVotePoll } from 'mediasfu-shared';
import { handleEndPoll } from 'mediasfu-shared';
import { breakoutRoomUpdated } from 'mediasfu-shared';
import { startMeetingProgressTimer } from '@legacy/methods/utils/meetingTimer/startMeetingProgressTimer';
import { updateRecording } from 'mediasfu-shared';
import { stopRecording } from 'mediasfu-shared';

// Socket receive methods
import { userWaiting } from '@legacy/producers/socketReceiveMethods/userWaiting';
import { personJoined } from '@legacy/producers/socketReceiveMethods/personJoined';
import { allWaitingRoomMembers } from '@legacy/producers/socketReceiveMethods/allWaitingRoomMembers';
import { roomRecordParams } from '@legacy/producers/socketReceiveMethods/roomRecordParams';
import { banParticipant } from '@legacy/producers/socketReceiveMethods/banParticipant';
import { updatedCoHost } from '@legacy/producers/socketReceiveMethods/updatedCoHost';
import { participantRequested } from '@legacy/producers/socketReceiveMethods/participantRequested';
import { screenProducerId } from '@legacy/producers/socketReceiveMethods/screenProducerId';
import { updateMediaSettings } from '@legacy/producers/socketReceiveMethods/updateMediaSettings';
import { producerMediaPaused } from '@legacy/producers/socketReceiveMethods/producerMediaPaused';
import { producerMediaResumed } from '@legacy/producers/socketReceiveMethods/producerMediaResumed';
import { producerMediaClosed } from '@legacy/producers/socketReceiveMethods/producerMediaClosed';
import { controlMediaHost } from '@legacy/producers/socketReceiveMethods/controlMediaHost';
import { meetingEnded } from '@legacy/producers/socketReceiveMethods/meetingEnded';
import { disconnectUserSelf } from '@legacy/producers/socketReceiveMethods/disconnectUserSelf';
import { receiveMessage } from '@legacy/producers/socketReceiveMethods/receiveMessage';
import { meetingTimeRemaining } from '@legacy/producers/socketReceiveMethods/meetingTimeRemaining';
import { meetingStillThere } from '@legacy/producers/socketReceiveMethods/meetingStillThere';
import { startRecords } from '@legacy/producers/socketReceiveMethods/startRecords';
import { reInitiateRecording } from '@legacy/producers/socketReceiveMethods/reInitiateRecording';
import { getDomains } from '@legacy/producers/socketReceiveMethods/getDomains';
import { updateConsumingDomains } from '@legacy/producers/socketReceiveMethods/updateConsumingDomains';
import { recordingNotice } from '@legacy/producers/socketReceiveMethods/recordingNotice';
import { timeLeftRecording } from '@legacy/producers/socketReceiveMethods/timeLeftRecording';
import { stoppedRecording } from '@legacy/producers/socketReceiveMethods/stoppedRecording';
import { hostRequestResponse } from '@legacy/producers/socketReceiveMethods/hostRequestResponse';
import { allMembers } from '@legacy/producers/socketReceiveMethods/allMembers';
import { allMembersRest } from '@legacy/producers/socketReceiveMethods/allMembersRest';
import { disconnect } from '@legacy/producers/socketReceiveMethods/disconnect';
import { captureCanvasStream } from '@legacy/methods/whiteboardMethods/captureCanvasStream';
import { resumePauseAudioStreams } from 'mediasfu-shared';
import { processConsumerTransportsAudio } from 'mediasfu-shared';

// Types
import type { MediaSFUSocket } from '../../types/socket';
import type {
  AParamsType,
  AudioDecibels,
  BreakoutParticipant,
  CoHostResponsibility,
  ComponentSizes,
  GridSizes,
  HParamsType,
  MeetingRoomParams,
  Message,
  Participant,
  Poll,
  ResponseJoinRoom,
  ResponseJoinLocalRoom,
  ScreenParamsType,
  ScreenState,
  Stream,
  UserRecordingParams,
  VParamsType,
  VidCons,
  WaitingRoomParticipant,
  WhiteboardUser,
  Shapes as SharedShape,
  ShapePayload,
  Request,
  Transport as TransportType,
  RecordParams,
  EventType,
  ConsumeSocket,
  AllMembersData,
  AllMembersRestData,
  AllWaitingRoomMembersData,
  UpdatedCoHostData,
  Settings,
  UpdateConsumingDomainsData,
  HostRequestResponseData,
  PollUpdatedData,
  BreakoutRoomUpdatedData,
  SeedData,
  CreateMediaSFURoomOptions,
  JoinMediaSFURoomOptions,
  JoinRoomOnMediaSFUType,
  CreateRoomOnMediaSFUType,
} from 'mediasfu-shared';
import type { Button as ControlButton } from '../displayComponents/ControlButtonsComponent.vue';
import type { ButtonTouch as ControlButtonTouch } from '../displayComponents/ControlButtonsComponentTouch.vue';
import type { CustomButton as MenuCustomButton } from '../../types/menu';
import type { RenderableComponent } from '../../types/renderable-component';
import type { Device, types as MediasoupTypes } from 'mediasoup-client';
import type { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import type {
  CustomAudioCardType,
  CustomMiniCardType,
  CustomPreJoinPageType,
  CustomVideoCardType,
  CustomComponentType,
} from '@legacy/@types/types';
import type {
  Shape as WhiteboardShape,
  WhiteboardParameters as WhiteboardComponentParameters,
} from '../whiteboardComponents/Whiteboard.vue';

// Mediasoup types
type Producer = MediasoupTypes.Producer;
type ProducerOptions = MediasoupTypes.ProducerOptions;
type RtpCapabilities = MediasoupTypes.RtpCapabilities;
type Transport = MediasoupTypes.Transport;
import { createResponseJoinRoom } from '@legacy/methods/utils/createResponseJoinRoom';

// Component props interface
/**
 * Props/Options for the MediasfuGeneric component
 * @interface MediasfuGenericOptions
 * 
 * @description
 * Comprehensive configuration options for the MediaSFU platform. Supports both
 * MediaSFU cloud service and local/self-hosted deployments. Provides multiple
 * customization levels from simple prop-based overrides to complete UI replacement.
 */
export interface MediasfuGenericOptions {
  /**
   * Custom PreJoinPage component (legacy prop, prefer uiOverrides.preJoinPage)
   * @deprecated Use uiOverrides.preJoinPage instead
   */
  // eslint-disable-next-line vue/prop-name-casing
  PrejoinPage?: Component;
  
  /**
   * Local server URL for self-hosted MediaSFU deployments
   * @default ""
   * @example "http://localhost:3000"
   * @example "https://your-mediasfu-server.com"
   */
  localLink?: string;
  
  /**
   * Whether to connect to MediaSFU cloud service
   * Set to false for local-only deployments
   * @default true
   */
  connectMediaSFU?: boolean;
  
  /**
   * API credentials for MediaSFU cloud service
   * Required when connectMediaSFU is true
   * @default { apiUserName: '', apiKey: '' }
   * @example { apiUserName: 'user123', apiKey: 'sk_1234567890abcdef' }
   */
  credentials?: { apiUserName: string; apiKey: string };
  
  /**
   * Enable local UI mode for development/testing
   * Bypasses some cloud-specific checks
   * @default false
   */
  useLocalUIMode?: boolean;
  
  /**
   * Seed data for testing/demo purposes
   * Pre-populates room with participants, messages, etc.
   * @default {}
   * @example
   * ```ts
   * {
   *   member: 'Host',
   *   host: 'Host',
   *   eventType: 'conference',
   *   participants: [
   *     { name: 'Alice', muted: false, videoOn: true },
   *     { name: 'Bob', muted: true, videoOn: false }
   *   ],
   *   messages: [
   *     { sender: 'Alice', message: 'Hello!', timestamp: Date.now() }
   *   ]
   * }
   * ```
   */
  seedData?: SeedData;
  
  /**
   * Whether to use the provided seedData
   * When true, bypasses normal room join flow
   * @default false
   */
  useSeed?: boolean;
  
  /**
   * Custom logo image URL for branding
   * Displayed on PreJoinPage and WelcomePage
   * @default "https://mediasfu.com/images/logo192.png"
   * @example "https://your-domain.com/logo.png"
   */
  imgSrc?: string;
  
  /**
   * External parameters object for advanced integration
   * Allows parent components to inject custom state
   * @example { customFeatureFlag: true, themeMode: 'dark' }
   */
  sourceParameters?: Record<string, unknown>;
  
  /**
   * Callback to update sourceParameters from within MediaSFU
   * Enables two-way binding with parent component
   * @param data - Updated parameter object
   * @example
   * ```ts
   * (data) => {
   *   console.log('Parameters updated:', data);
   *   myExternalState.value = { ...myExternalState.value, ...data };
   * }
   * ```
   */
  updateSourceParameters?: (data: Record<string, unknown>) => void;
  
  /**
   * Whether to render the built-in UI
   * When false, component only manages state/logic (headless mode)
   * @default true
   */
  returnUI?: boolean;
  
  /**
   * Configuration for programmatic (no-UI) join/create mode
   * Used when returnUI is false for automated testing/bots
   * @example { action: 'join', userName: 'Bot', meetingID: 'room123' }
   * @example { action: 'create', userName: 'Host', duration: 60, eventType: 'webinar', capacity: 100 }
   */
  noUIPreJoinOptions?: CreateMediaSFURoomOptions | JoinMediaSFURoomOptions;
  
  /**
   * Custom function for joining a MediaSFU room
   * Override default join logic with custom implementation
   * @default joinRoomOnMediaSFU
   */
  joinMediaSFURoom?: JoinRoomOnMediaSFUType;
  
  /**
   * Custom function for creating a MediaSFU room
   * Override default create logic with custom implementation
   * @default createRoomOnMediaSFU
   */
  createMediaSFURoom?: CreateRoomOnMediaSFUType;
  
  /**
   * Custom VideoCard component (legacy prop, prefer uiOverrides.videoCard)
   * @deprecated Use uiOverrides.videoCard instead
   * @example CustomVideoCard
   */
  customVideoCard?: Component;
  
  /**
   * Custom AudioCard component (legacy prop, prefer uiOverrides.audioCard)
   * @deprecated Use uiOverrides.audioCard instead
   * @example CustomAudioCard
   */
  customAudioCard?: Component;
  
  /**
   * Custom MiniCard component (legacy prop, prefer uiOverrides.miniCard)
   * @deprecated Use uiOverrides.miniCard instead
   * @example CustomMiniCard
   */
  customMiniCard?: Component;
  
  /**
   * Custom PreJoinPage component (legacy prop, prefer uiOverrides.preJoinPage)
   * @deprecated Use uiOverrides.preJoinPage instead
   * @example CustomPreJoinPage
   */
  customPreJoinPage?: Component;
  
  /**
   * Custom component to completely replace the entire MediaSFU UI
   * Receives allParameters prop with all state and methods
   * @example MyCompleteCustomUI
   */
  customComponent?: Component;
  
  /**
   * Custom CSS styles for the root MediaSFU container
   * @default {}
   * @example { backgroundColor: '#1a1a1a', maxWidth: '1920px', margin: '0 auto' }
   */
  containerStyle?: Record<string, unknown>;
  
  /**
   * Default event type for the session
   * Determines which UI controls and layouts are shown
   * @default "webinar"
   * @example "conference" | "webinar" | "broadcast" | "chat" | "generic"
   */
  defaultEventType?: EventType;
  
  /**
   * Comprehensive UI override system
   * Replace or wrap any MediaSFU component or function
   * This is the recommended approach for customization
   * 
   * @example
   * ```ts
   * {
   *   videoCard: { component: CustomVideoCard },
   *   audioCard: { component: CustomAudioCard },
   *   participantsModal: { component: CustomParticipantsModal },
   *   consumerResume: {
   *     wrap: (defaultFn) => async (options) => {
   *       await trackAnalytics('consumer_resume');
   *       return await defaultFn(options);
   *     }
   *   }
   * }
   * ```
   * 
   * @see {@link MediasfuUICustomOverrides} for all available overrides
   */
  uiOverrides?: MediasfuUICustomOverrides;
}

// Props with defaults
const props = withDefaults(defineProps<MediasfuGenericOptions>(), {
  PrejoinPage: undefined,
  localLink: '',
  connectMediaSFU: true,
  credentials: () => ({ apiUserName: '', apiKey: '' }),
  useLocalUIMode: false,
  seedData: () => ({}),
  useSeed: false,
  imgSrc: 'https://mediasfu.com/images/logo192.png',
  sourceParameters: undefined,
  updateSourceParameters: undefined,
  returnUI: true,
  noUIPreJoinOptions: undefined,
  joinMediaSFURoom: undefined,
  createMediaSFURoom: undefined,
  customVideoCard: undefined,
  customAudioCard: undefined,
  customMiniCard: undefined,
  customPreJoinPage: undefined,
  customComponent: undefined,
  containerStyle: () => ({}),
  defaultEventType: 'webinar',
  uiOverrides: undefined,
});

const reportedUnsupportedCustomKeys = new Set<string>();

const warnUnsupportedCustom = (key: string) => {
  if (!reportedUnsupportedCustomKeys.has(key)) {
    console.warn(
      `[MediasfuGeneric] Ignoring custom ${key} because non-function components are not yet supported in Vue mode.`
    );
    reportedUnsupportedCustomKeys.add(key);
  }
};

const toCustomRenderer = <TRenderer>(value: unknown, key: string): TRenderer | undefined => {
  if (!value) {
    return undefined;
  }
  const isCallable = typeof value === 'function';
  const isComponentObject =
    typeof value === 'object' && value !== null &&
    (typeof (value as Record<string, unknown>).setup === 'function' ||
      typeof (value as Record<string, unknown>).render === 'function');

  if (isCallable || isComponentObject) {
    return value as TRenderer;
  }

  warnUnsupportedCustom(key);
  return undefined;
};

const customVideoCardRenderer = computed<CustomVideoCardType | undefined>(() =>
  toCustomRenderer<CustomVideoCardType>(props.customVideoCard, 'video card')
);

const customAudioCardRenderer = computed<CustomAudioCardType | undefined>(() =>
  toCustomRenderer<CustomAudioCardType>(props.customAudioCard, 'audio card')
);

const customMiniCardRenderer = computed<CustomMiniCardType | undefined>(() =>
  toCustomRenderer<CustomMiniCardType>(props.customMiniCard, 'mini card')
);

const customPreJoinPageRenderer = computed<CustomPreJoinPageType | undefined>(() =>
  toCustomRenderer<CustomPreJoinPageType>(props.customPreJoinPage, 'pre-join page')
);

const customComponentRenderer = computed<CustomComponentType | undefined>(() =>
  toCustomRenderer<CustomComponentType>(props.customComponent, 'component')
);

const uiOverridesApi = computed(() => useUIOverrides(props.uiOverrides));

const resolveComponent = (
  key: keyof MediasfuUICustomOverrides,
  component: Component
): ComputedRef<Component> =>
  computed(() => uiOverridesApi.value.getOverriddenComponent(key, component));

const resolveFunction = <Fn extends (...args: never[]) => unknown>(
  key: keyof MediasfuUICustomOverrides,
  fn: Fn
): ComputedRef<Fn> =>
  computed(() => uiOverridesApi.value.getOverriddenFunction(key, fn) as Fn);

const MainContainer = resolveComponent('mainContainer', MainContainerComponent);
const MainAspect = resolveComponent('mainAspect', MainAspectComponent);
const MainScreen = resolveComponent('mainScreen', MainScreenComponent);
const MainGrid = resolveComponent('mainGrid', MainGridComponent);
const SubAspect = resolveComponent('subAspect', SubAspectComponent);
const OtherGrid = resolveComponent('otherGrid', OthergridComponent);
const FlexibleGridPrimary = resolveComponent('flexibleGrid', FlexibleGrid);
const FlexibleGridAlt = resolveComponent('flexibleGridAlt', FlexibleGrid);
const FlexibleVideoComponent = resolveComponent('flexibleVideo', FlexibleVideo);
const AudioGridComponent = resolveComponent('audioGrid', AudioGrid);
const PaginationComponent = resolveComponent('pagination', Pagination);
const ControlButtons = resolveComponent('controlButtons', ControlButtonsComponent);
const ControlButtonsAlt = resolveComponent('controlButtonsAlt', ControlButtonsAltComponent);
const ControlButtonsTouch = resolveComponent('controlButtonsTouch', ControlButtonsComponentTouch);
const WhiteboardComponent = resolveComponent('whiteboard', Whiteboard);
const ScreenboardComponent = resolveComponent('screenboard', Screenboard);
const ScreenboardModalComponent = resolveComponent('screenboardModal', ScreenboardModal);
const VideoCardComponentOverride = resolveComponent('videoCard', VideoCard);
const AudioCardComponentOverride = resolveComponent('audioCard', AudioCard);
const MiniCardComponentOverride = resolveComponent('miniCard', MiniCard);
const MiniAudioComponentOverride = resolveComponent('miniAudio', MiniAudio);
const MiniAudioPlayerComponent = resolveComponent('miniAudioPlayer', MiniAudioPlayer);
const LoadingModalComponent = resolveComponent('loadingModal', LoadingModal);
const AlertComponentOverride = resolveComponent('alert', AlertComponent);
const MenuModalComponent = resolveComponent('menuModal', MenuModal);
const EventSettingsModalComponent = resolveComponent('eventSettingsModal', EventSettingsModal);
const RequestsModalComponent = resolveComponent('requestsModal', RequestsModal);
const WaitingRoomModalComponent = resolveComponent('waitingRoomModal', WaitingRoomModal);
const CoHostModalComponent = resolveComponent('coHostModal', CoHostModal);
const MediaSettingsModalComponent = resolveComponent('mediaSettingsModal', MediaSettingsModal);
const ParticipantsModalComponent = resolveComponent('participantsModal', ParticipantsModal);
const MessagesModalComponent = resolveComponent('messagesModal', MessagesModal);
const DisplaySettingsModalComponent = resolveComponent('displaySettingsModal', DisplaySettingsModal);
const ConfirmExitModalComponent = resolveComponent('confirmExitModal', ConfirmExitModal);
const ConfirmHereModalComponent = resolveComponent('confirmHereModal', ConfirmHereModal);
const ShareEventModalComponent = resolveComponent('shareEventModal', ShareEventModal);
const RecordingModalComponent = resolveComponent('recordingModal', RecordingModal);
const PollModalComponent = resolveComponent('pollModal', PollModal);
const BackgroundModalComponent = resolveComponent('backgroundModal', BackgroundModal);
const BreakoutRoomsModalComponent = resolveComponent('breakoutRoomsModal', BreakoutRoomsModal);
const ConfigureWhiteboardModalComponent = resolveComponent('configureWhiteboardModal', ConfigureWhiteboardModal);
const WelcomePageComponent = resolveComponent('welcomePage', WelcomePage);
const CustomMenuButtonsRenderer = resolveComponent('customMenuButtonsRenderer', ControlButtonsAltComponent);
const PreJoinPageComponent = resolveComponent('preJoinPage', PreJoinPage);

const menuButtonsRendererComponent = computed(
  () => CustomMenuButtonsRenderer.value || ControlButtonsAlt.value
);

const consumerResumeOverride = resolveFunction('consumerResume', consumerResume);
const addVideosGridOverride = resolveFunction('addVideosGrid', addVideosGrid);

// Validated state
const validated = ref<boolean>(props.useLocalUIMode);

// Socket references
const socket = ref<MediaSFUSocket>({} as MediaSFUSocket);
const localSocket = ref<MediaSFUSocket | null>(null);
const roomData = ref<ResponseJoinRoom | null>(null);
const device = ref<Device | null>(null);

// Computed properties for casting socket in templates
const castedSocket = computed(() => socket.value as unknown as MediaSFUSocket);

// API credentials
const apiUserName = ref<string>('');
const apiToken = ref<string>('');
const link = ref<string>('');

// Room details
const roomName = ref<string>('');
const member = ref<string>(props.useSeed && props.seedData?.member ? props.seedData?.member : '');
const adminPasscode = ref<string>('');
const islevel = ref<string>(
  props.useSeed && props.seedData?.member
    ? props.seedData.member === props.seedData?.host
      ? '2'
      : '1'
    : '1'
);
const coHost = ref<string>('');
const coHostResponsibility = ref<CoHostResponsibility[]>([
  { name: 'participants', value: false, dedicated: false },
  { name: 'media', value: false, dedicated: false },
  { name: 'waiting', value: false, dedicated: false },
  { name: 'chat', value: false, dedicated: false },
]);
const youAreCoHost = ref<boolean>(coHost.value ? coHost.value === member.value : false);
const youAreHost = ref<boolean>(islevel.value === '2');
const confirmedToRecord = ref<boolean>(false);
const meetingDisplayType = ref<string>('media');
const meetingVideoOptimized = ref<boolean>(false);
const eventType = ref<EventType>(
  props.useSeed && props.seedData?.eventType
    ? props.seedData?.eventType
    : props.defaultEventType ?? 'webinar'
);
const participants = ref<Participant[]>(
  props.useSeed && props.seedData?.participants ? props.seedData?.participants : []
);
const filteredParticipants = ref<Participant[]>(participants.value);
const participantsCounter = ref<number>(0);
const participantsFilter = ref<string>('');

// Media and room details
const consume_sockets = ref<ConsumeSocket[]>([]);
const rtpCapabilities = ref<RtpCapabilities | null>(null);
const roomRecvIPs = ref<string[]>([]);
const meetingRoomParams = ref<MeetingRoomParams | null>(null);
const itemPageLimit = ref<number>(4);
const audioOnlyRoom = ref<boolean>(false);
const addForBasic = ref<boolean>(false);
const screenPageLimit = ref<number>(4);
const shareScreenStarted = ref<boolean>(false);
const shared = ref<boolean>(false);
const targetOrientation = ref<string>('landscape');
const targetResolution = ref<string>('sd');
const targetResolutionHost = ref<string>('sd');
const vidCons = ref<VidCons>({ width: 640, height: 360 });
const frameRate = ref<number>(10);
const hParams = ref<HParamsType>({} as HParamsType);
const vParams = ref<VParamsType>({} as VParamsType);
const screenParams = ref<ScreenParamsType>({} as ScreenParamsType);
const aParams = ref<AParamsType>({} as AParamsType);

// Recording details
const recordingAudioPausesLimit = ref<number>(0);
const recordingAudioPausesCount = ref<number>(0);
const recordingAudioSupport = ref<boolean>(false);
const recordingAudioPeopleLimit = ref<number>(0);
const recordingAudioParticipantsTimeLimit = ref<number>(0);
const recordingVideoPausesCount = ref<number>(0);
const recordingVideoPausesLimit = ref<number>(0);
const recordingVideoSupport = ref<boolean>(false);
const recordingVideoPeopleLimit = ref<number>(0);
const recordingVideoParticipantsTimeLimit = ref<number>(0);
const recordingAllParticipantsSupport = ref<boolean>(false);
const recordingVideoParticipantsSupport = ref<boolean>(false);
const recordingAllParticipantsFullRoomSupport = ref<boolean>(false);
const recordingVideoParticipantsFullRoomSupport = ref<boolean>(false);
const recordingPreferredOrientation = ref<string>('landscape');
const recordingSupportForOtherOrientation = ref<boolean>(false);
const recordingMultiFormatsSupport = ref<boolean>(false);

// User recording parameters
const userRecordingParams = ref<UserRecordingParams>({
  mainSpecs: {
    mediaOptions: 'video',
    audioOptions: 'all',
    videoOptions: 'all',
    videoType: 'fullDisplay',
    videoOptimized: false,
    recordingDisplayType: 'media',
    addHLS: false,
  },
  dispSpecs: {
    nameTags: true,
    backgroundColor: '#000000',
    nameTagsColor: '#ffffff',
    orientationVideo: 'portrait',
  },
});

// Recording state
const canRecord = ref<boolean>(false);
const startReport = ref<boolean>(false);
const endReport = ref<boolean>(false);
const recordTimerInterval = ref<ReturnType<typeof setInterval> | null>(null);
const recordStartTime = ref<number>(0);
const recordElapsedTime = ref<number>(0);
const isTimerRunning = ref<boolean>(false);
const canPauseResume = ref<boolean>(false);
const recordChangeSeconds = ref<number>(15000);
const pauseLimit = ref<number>(0);
const pauseRecordCount = ref<number>(0);
const canLaunchRecord = ref<boolean>(true);
const stopLaunchRecord = ref<boolean>(false);

// Misc variables
const firstAll = ref<boolean>(false);
const updateMainWindow = ref<boolean>(false);
const first_round = ref<boolean>(false);
const landScaped = ref<boolean>(false);
const lock_screen = ref<boolean>(false);
const screenId = ref<string>('');
const allVideoStreams = ref<(Participant | Stream)[]>([]);
const newLimitedStreams = ref<(Participant | Stream)[]>([]);
const newLimitedStreamsIDs = ref<string[]>([]);
const activeSounds = ref<string[]>([]);
const screenShareIDStream = ref<string>('');
const screenShareNameStream = ref<string>('');
const adminIDStream = ref<string>('');
const adminNameStream = ref<string>('');
const youYouStream = ref<(Participant | Stream)[]>([]);
const youYouStreamIDs = ref<string[]>([]);
const localStream = ref<MediaStream | null>(null);
const recordStarted = ref<boolean>(false);
const recordResumed = ref<boolean>(false);
const recordPaused = ref<boolean>(false);
const recordStopped = ref<boolean>(false);
const adminRestrictSetting = ref<boolean>(false);
const videoRequestState = ref<string | null>(null);
const videoRequestTime = ref<number>(0);
const videoAction = ref<boolean>(false);
const localStreamVideo = ref<MediaStream | null>(null);
const userDefaultVideoInputDevice = ref<string>('');
const currentFacingMode = ref<string>('user');
const prevFacingMode = ref<string>('user');
const defVideoID = ref<string>('');
const allowed = ref<boolean>(false);
const dispActiveNames = ref<string[]>([]);
const p_dispActiveNames = ref<string[]>([]);
const activeNames = ref<string[]>([]);
const prevActiveNames = ref<string[]>([]);
const p_activeNames = ref<string[]>([]);
const membersReceived = ref<boolean>(false);
const deferScreenReceived = ref<boolean>(false);
const hostFirstSwitch = ref<boolean>(false);
const micAction = ref<boolean>(false);
const screenAction = ref<boolean>(false);
const chatAction = ref<boolean>(false);
const audioRequestState = ref<string | null>(null);
const screenRequestState = ref<string | null>(null);
const chatRequestState = ref<string | null>(null);
const audioRequestTime = ref<number>(0);
const screenRequestTime = ref<number>(0);
const chatRequestTime = ref<number>(0);
const updateRequestIntervalSeconds = ref<number>(240);
const oldSoundIds = ref<string[]>([]);
const hostLabel = ref<string>('Host');
const mainScreenFilled = ref<boolean>(false);
const localStreamScreen = ref<MediaStream | null>(null);
const screenAlreadyOn = ref<boolean>(false);
const chatAlreadyOn = ref<boolean>(false);
const redirectURL = ref<string>('');
const oldAllStreams = ref<(Participant | Stream)[]>([]);
const adminVidID = ref<string>('');
const streamNames = ref<Stream[]>([]);
const non_alVideoStreams = ref<Participant[]>([]);
const sortAudioLoudness = ref<boolean>(false);
const audioDecibels = ref<AudioDecibels[]>([]);
const mixed_alVideoStreams = ref<(Participant | Stream)[]>([]);
const non_alVideoStreams_muted = ref<Participant[]>([]);
const paginatedStreams = ref<(Participant | Stream)[][]>([]);
const localStreamAudio = ref<MediaStream | null>(null);
const defAudioID = ref<string>('');
const userDefaultAudioInputDevice = ref<string>('');
const userDefaultAudioOutputDevice = ref<string>('');
const prevAudioInputDevice = ref<string>('');
const prevVideoInputDevice = ref<string>('');
const audioPaused = ref<boolean>(false);
const mainScreenPerson = ref<string>('');
const adminOnMainScreen = ref<boolean>(false);
const screenStates = ref<ScreenState[]>([
  {
    mainScreenPerson: '',
    mainScreenProducerId: '',
    mainScreenFilled: false,
    adminOnMainScreen: false,
  },
]);
const prevScreenStates = ref<ScreenState[]>([
  {
    mainScreenPerson: '',
    mainScreenProducerId: '',
    mainScreenFilled: false,
    adminOnMainScreen: false,
  },
]);
const updateDateState = ref<number | null>(null);
const lastUpdate = ref<number | null>(null);
const nForReadjustRecord = ref<number>(0);
const fixedPageLimit = ref<number>(4);
const removeAltGrid = ref<boolean>(false);
const nForReadjust = ref<number>(0);
const reorderInterval = ref<number>(30000);
const fastReorderInterval = ref<number>(10000);
const lastReorderTime = ref<number>(0);
const audStreamNames = ref<Stream[]>([]);
const currentUserPage = ref<number>(0);

const mainHeightWidth = ref<number>(
  eventType.value === 'webinar' ? 67 : eventType.value === 'broadcast' ? 100 : 0
);
const prevMainHeightWidth = ref<number>(mainHeightWidth.value);
const prevDoPaginate = ref<boolean>(false);
const doPaginate = ref<boolean>(false);
const shareEnded = ref<boolean>(false);
const lStreams = ref<(Participant | Stream)[]>([]);
const chatRefStreams = ref<(Participant | Stream)[]>([]);

const controlHeight = ref<number>(0);
const isWideScreen = ref<boolean>(false);
const isMediumScreen = ref<boolean>(false);
const isSmallScreen = ref<boolean>(false);
const addGrid = ref<boolean>(false);
const addAltGrid = ref<boolean>(false);

const gridRows = ref<number>(0);
const gridCols = ref<number>(0);
const altGridRows = ref<number>(0);
const altGridCols = ref<number>(0);
const numberPages = ref<number>(0);
const currentStreams = ref<(Participant | Stream)[]>([]);

const showMiniView = ref<boolean>(false);
const nStream = ref<MediaStream | null>(null);
const defer_receive = ref<boolean>(false);
const allAudioStreams = ref<(Participant | Stream)[]>([]);
const remoteScreenStream = ref<Stream[]>([]);

const screenProducer = ref<Producer | null>(null);
const localScreenProducer = ref<Producer | null>(null);
const gotAllVids = ref<boolean>(false);
const paginationHeightWidth = ref<number>(40);
const paginationDirection = ref<'horizontal' | 'vertical'>('horizontal');

const gridSizes = ref<GridSizes>({
  gridWidth: 0,
  gridHeight: 0,
  altGridWidth: 0,
  altGridHeight: 0,
});

const screenForceFullDisplay = ref<boolean>(false);
const mainGridStreamRaw = ref<Array<RenderableComponent | ReactElementLike | null | undefined>>([]);
const otherGridStreams = ref<RenderableComponent[][]>([[], []]);
const audioOnlyStreams = ref<RenderableComponent[]>([]);

const componentUpdateQueue: Array<() => Promise<void> | void> = [];
let isProcessingComponentUpdates = false;

const mediaContainerRef = ref<HTMLElement | null>(null);

let resizeObserver: ResizeObserver | null = null;
let resizeScheduled = false;
let resizeInProgress = false;
let resizeQueued = false;

const runResize = async (): Promise<void> => {
  if (resizeInProgress) {
    resizeQueued = true;
    return;
  }

  resizeInProgress = true;
  try {
    await handleResize();
  } catch (error) {
    console.log('error handleResize', error);
  } finally {
    resizeInProgress = false;
    if (resizeQueued) {
      resizeQueued = false;
      scheduleResize();
    }
  }
};

const scheduleResize = () => {
  if (resizeScheduled) {
    return;
  }
  resizeScheduled = true;
  requestAnimationFrame(() => {
    resizeScheduled = false;
    void runResize();
  });
};

const processComponentUpdates = async (): Promise<void> => {
  if (isProcessingComponentUpdates) {
    return;
  }

  isProcessingComponentUpdates = true;

  try {
    while (componentUpdateQueue.length > 0) {
      const task = componentUpdateQueue.shift();

      if (!task) {
        continue;
      }

      try {
        await task();
      } catch (error) {
        console.log('error processing component update', error);
      }
    }
  } finally {
    isProcessingComponentUpdates = false;
    if (componentUpdateQueue.length > 0) {
      void processComponentUpdates();
    }
  }
};

const enqueueComponentUpdate = (task: () => Promise<void> | void): void => {
  componentUpdateQueue.push(task);
  if (!isProcessingComponentUpdates) {
    void processComponentUpdates();
  }
};

interface ReactElementLike {
  $$typeof: symbol;
  type: unknown;
  key: string | number | null;
  props: Record<string, unknown>;
}

const REACT_ELEMENT_TYPE = Symbol.for('react.element');
let autoRenderableKey = 0;

const componentRegistry: Record<string, Component> = {
  VideoCard: markRaw(VideoCard),
  AudioCard: markRaw(AudioCard),
  MiniCard: markRaw(MiniCard),
  MiniCardAudio: markRaw(MiniCardAudio),
  MiniAudio: markRaw(MiniAudio),
  MiniAudioPlayer: markRaw(MiniAudioPlayer),
};

watch(
  VideoCardComponentOverride,
  (component) => {
    componentRegistry.VideoCard = markRaw(component);
  },
  { immediate: true }
);

watch(
  AudioCardComponentOverride,
  (component) => {
    componentRegistry.AudioCard = markRaw(component);
  },
  { immediate: true }
);

watch(
  MiniCardComponentOverride,
  (component) => {
    componentRegistry.MiniCard = markRaw(component);
  },
  { immediate: true }
);

watch(
  MiniAudioComponentOverride,
  (component) => {
    componentRegistry.MiniAudio = markRaw(component);
  },
  { immediate: true }
);

watch(
  MiniAudioPlayerComponent,
  (component) => {
    componentRegistry.MiniAudioPlayer = markRaw(component);
  },
  { immediate: true }
);

const missingReactComponentWarnings = new Set<string>();

type ReactComponentCandidate = {
  displayName?: string;
  name?: string;
};

const getDisplayNameFromCandidate = (candidate: ReactComponentCandidate | null | undefined) =>
  candidate?.displayName ?? candidate?.name;

const getReactComponentName = (type: unknown): string | undefined => {
  if (!type) {
    return undefined;
  }

  if (typeof type === 'function') {
    return getDisplayNameFromCandidate(type as ReactComponentCandidate);
  }

  if (typeof type === 'object') {
    return getDisplayNameFromCandidate(type as ReactComponentCandidate);
  }

  return undefined;
};

const resolveVueComponentFromReact = (type: unknown): Component | undefined => {
  const name = getReactComponentName(type);
  if (!name) {
    return undefined;
  }

  const component = componentRegistry[name];
  if (!component && !missingReactComponentWarnings.has(name)) {
    console.warn(`[MediasfuGeneric] No Vue equivalent registered for React component "${name}".`);
    missingReactComponentWarnings.add(name);
  }

  return component;
};

const isReactElementLike = (value: unknown): value is ReactElementLike =>
  typeof value === 'object' &&
  value !== null &&
  (value as Partial<ReactElementLike>).$$typeof === REACT_ELEMENT_TYPE;

const isRenderableComponent = (value: unknown): value is RenderableComponent =>
  (typeof value === 'object' && value !== null && 'component' in value && 'props' in value && 'key' in value);

const normalizeComponentList = (value: unknown): RenderableComponent[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRenderableComponent) as RenderableComponent[];
};

const otherGridComponentLists = computed<[RenderableComponent[], RenderableComponent[]]>(() => {
  const streams = otherGridStreams.value ?? [];

  return [
    normalizeComponentList(streams?.[0]),
    normalizeComponentList(streams?.[1]),
  ];
});

const audioOnlyComponents = computed<RenderableComponent[]>(() => normalizeComponentList(audioOnlyStreams.value));

const parseFontSizeValue = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const formatFontSizeValue = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    return value;
  }

  const parsed = parseFontSizeValue(value);
  return parsed !== undefined ? `${parsed}px` : undefined;
};

const sanitizeRenderableComponent = (component: RenderableComponent): RenderableComponent => {
  if (!component || typeof component !== 'object') {
    return component;
  }

  const originalProps = component.props ?? {};
  if (!originalProps || typeof originalProps !== 'object') {
    return component;
  }

  const props: Record<string, unknown> = { ...originalProps };

  if ('fontSize' in props) {
    const normalizedFontSize = parseFontSizeValue(props.fontSize);
    if (normalizedFontSize !== undefined) {
      props.fontSize = normalizedFontSize;
    }
  }

  if (props.style && typeof props.style === 'object' && props.style !== null) {
    const style = { ...(props.style as Record<string, unknown>) };
    const formattedStyleFontSize = formatFontSizeValue(style.fontSize);
    if (formattedStyleFontSize !== undefined) {
      style.fontSize = formattedStyleFontSize;
    }
    props.style = style;
  }

  return {
    ...component,
    props: props as RenderableComponent['props'],
  };
};

const prepareRenderableComponent = (component: RenderableComponent): RenderableComponent => {
  const sanitized = sanitizeRenderableComponent(component);
  return markRaw({
    ...sanitized,
    component: markRaw(sanitized.component),
  });
};

const convertReactElementToRenderable = (element: ReactElementLike): RenderableComponent | null => {
  const componentName = getReactComponentName(element.type);
  const component = resolveVueComponentFromReact(element.type);
  if (!component) {
    return null;
  }

  const props: Record<string, unknown> = { ...element.props };
  delete (props as Record<string, unknown>).children;

  if (componentName === 'MiniAudioPlayer') {
    const reactMiniAudio = props.MiniAudioComponent;
    const resolvedMiniAudio = reactMiniAudio
      ? resolveVueComponentFromReact(reactMiniAudio)
      : componentRegistry.MiniAudio;
    props.miniAudioComponent = resolvedMiniAudio ?? null;
    delete props.MiniAudioComponent;
  }

  const participant = props.participant as { id?: string | number } | undefined;
  const derivedKey =
    element.key ??
    (props.key as string | number | undefined) ??
    (props.remoteProducerId as string | number | undefined) ??
    participant?.id ??
    (typeof props.name === 'string' ? props.name : undefined);

  return prepareRenderableComponent({
    component,
    props,
    key: derivedKey ?? `react-${autoRenderableKey++}`,
  });
};

const convertToRenderableComponent = (
  value: RenderableComponent | ReactElementLike | null | undefined
): RenderableComponent | null => {
  if (!value) {
    return null;
  }

  if (isRenderableComponent(value)) {
    return prepareRenderableComponent(value);
  }

  if (isReactElementLike(value)) {
    return convertReactElementToRenderable(value);
  }

  return null;
};

type RenderableListSource = Array<RenderableComponent | ReactElementLike | null | undefined>;
type RenderableGridSource = Array<RenderableListSource | null | undefined>;

const prepareRenderableList = (components: RenderableListSource): RenderableComponent[] =>
  markRaw(
    components
      .map((component) => convertToRenderableComponent(component))
      .filter((component): component is RenderableComponent => component !== null)
  );

const emptyRenderableList = (): RenderableComponent[] => markRaw([] as RenderableComponent[]);

const prepareRenderableGrid = (grid: RenderableGridSource): RenderableComponent[][] =>
  markRaw(
    grid.map((row) =>
      Array.isArray(row) ? prepareRenderableList(row) : emptyRenderableList()
    )
  );

const emptyRenderableGrid = (): RenderableComponent[][] =>
  markRaw([emptyRenderableList(), emptyRenderableList()]);

const mainGridStream = computed<RenderableComponent[]>(() => {
  const raw = mainGridStreamRaw.value;
  if (!Array.isArray(raw) || raw.length === 0) {
    return emptyRenderableList();
  }

  return prepareRenderableList(raw as RenderableListSource);
});

const videoInputs = ref<MediaDeviceInfo[]>([]);
const audioInputs = ref<MediaDeviceInfo[]>([]);
const meetingProgressTime = ref<string>('00:00:00');
const meetingElapsedTime = ref<number>(0);

const ref_participants = ref<Participant[]>([]);
const participantsAll = ref<Participant[]>([]);

// Messages
const messages = ref<Message[]>(props.useSeed && props.seedData?.messages ? props.seedData.messages : []);
const startDirectMessage = ref<boolean>(false);
const directMessageDetails = ref<Participant | null>(null);
const showMessagesBadge = ref<boolean>(false);

// Event settings
const audioSetting = ref<string>('allow');
const videoSetting = ref<string>('allow');
const screenshareSetting = ref<string>('allow');
const chatSetting = ref<string>('allow');

// Display settings
const displayOption = ref<string>(meetingDisplayType.value ? meetingDisplayType.value : 'media');
const autoWave = ref<boolean>(true);
const forceFullDisplay = ref<boolean>(
  eventType.value === 'webinar' || eventType.value === 'conference' ? false : true
);
const prevForceFullDisplay = ref<boolean>(false);
const prevMeetingDisplayType = ref<string>('video');

// Waiting room
const waitingRoomFilter = ref<string>('');
const waitingRoomList = ref<WaitingRoomParticipant[]>(
  props.useSeed && props.seedData?.waitingList ? props.seedData.waitingList : []
);
const waitingRoomCounter = ref<number>(0);
const filteredWaitingRoomList = ref<WaitingRoomParticipant[]>(waitingRoomList.value);

// Requests
const requestFilter = ref<string>('');
const requestList = ref<Request[]>(props.useSeed && props.seedData?.requests ? props.seedData.requests : []);
const requestCounter = ref<number>(0);
const filteredRequestList = ref<Request[]>(requestList.value);
const totalReqWait = ref<number>(0);

// Alert modal
const alertVisible = ref<boolean>(false);
const alertMessage = ref<string>('');
const alertType = ref<'success' | 'danger'>('success');
const alertDuration = ref<number>(3000);

// Progress Timer
const progressTimerVisible = ref<boolean>(true);
const progressTimerValue = ref<number>(0);

// Menu modals
const isMenuModalVisible = ref<boolean>(false);
const isRecordingModalVisible = ref<boolean>(false);
const isSettingsModalVisible = ref<boolean>(false);
const isRequestsModalVisible = ref<boolean>(false);
const isWaitingModalVisible = ref<boolean>(false);
const isCoHostModalVisible = ref<boolean>(false);
const isMediaSettingsModalVisible = ref<boolean>(false);
const isDisplaySettingsModalVisible = ref<boolean>(false);

// Other modals
const isParticipantsModalVisible = ref<boolean>(false);
const isMessagesModalVisible = ref<boolean>(false);
const isConfirmExitModalVisible = ref<boolean>(false);
const isConfirmHereModalVisible = ref<boolean>(false);
const isShareEventModalVisible = ref<boolean>(false);
const isLoadingModalVisible = ref<boolean>(false);

// Recording options
const recordingMediaOptions = ref<string>('video');
const recordingAudioOptions = ref<string>('all');
const recordingVideoOptions = ref<string>('all');
const recordingVideoType = ref<string>('fullDisplay');
const recordingVideoOptimized = ref<boolean>(false);
const recordingDisplayType = ref<'media' | 'video' | 'all'>('media');
const recordingAddHLS = ref<boolean>(true);
const recordingNameTags = ref<boolean>(true);

const recordingBackgroundColor = ref<string>('#83c0e9');
const recordingNameTagsColor = ref<string>('#ffffff');

const recordingAddText = ref<boolean>(false);
const recordingCustomText = ref<string>('Add Text');
const recordingCustomTextPosition = ref<string>('top');

const recordingCustomTextColor = ref<string>('#ffffff');

const recordingOrientationVideo = ref<string>('landscape');
const clearedToResume = ref<boolean>(true);
const clearedToRecord = ref<boolean>(true);
const recordState = ref<string>('green');

const showRecordButtons = ref<boolean>(false);
const recordingProgressTime = ref<string>('00:00:00');
const audioSwitching = ref<boolean>(false);
const videoSwitching = ref<boolean>(false);

// Media states
const videoAlreadyOn = ref<boolean>(false);
const audioAlreadyOn = ref<boolean>(false);

const componentSizes = ref<ComponentSizes>({
  mainHeight: 0,
  otherHeight: 0,
  mainWidth: 0,
  otherWidth: 0,
});

// Permissions
const hasCameraPermission = ref<boolean>(false);
const hasAudioPermission = ref<boolean>(false);

// Transports
const transportCreated = ref<boolean>(false);
const localTransportCreated = ref<boolean>(false);
const transportCreatedVideo = ref<boolean>(false);
const transportCreatedAudio = ref<boolean>(false);
const transportCreatedScreen = ref<boolean>(false);
const producerTransport = ref<Transport | null>(null);
const localProducerTransport = ref<Transport | null>(null);
const videoProducer = ref<Producer | null>(null);
const localVideoProducer = ref<Producer | null>(null);
const params = ref<ProducerOptions>({} as ProducerOptions);
const videoParams = ref<ProducerOptions>({} as ProducerOptions);
const audioParams = ref<ProducerOptions>({} as ProducerOptions);
const audioProducer = ref<Producer | null>(null);
const audioLevel = ref<number>(0);
const localAudioProducer = ref<Producer | null>(null);
const consumerTransports = ref<TransportType[]>([]);
const consumingTransports = ref<string[]>([]);

// Polls
const polls = ref<Poll[]>(props.useSeed && props.seedData?.polls ? props.seedData.polls : []);
const poll = ref<Poll | null>(null);
const isPollModalVisible = ref<boolean>(false);

// Background
const customImage = ref<string>('');
const selectedImage = ref<string>('');
const segmentVideo = ref<MediaStream | null>(null);
const selfieSegmentation = ref<SelfieSegmentation | null>(null);
const pauseSegmentation = ref<boolean>(false);
const processedStream = ref<MediaStream | null>(null);
const keepBackground = ref<boolean>(false);
const backgroundHasChanged = ref<boolean>(false);
const virtualStream = ref<MediaStream | null>(null);
const mainCanvas = ref<HTMLCanvasElement | null>(null);
const prevKeepBackground = ref<boolean>(false);
const appliedBackground = ref<boolean>(false);
const isBackgroundModalVisible = ref<boolean>(false);
const autoClickBackground = ref<boolean>(false);

// Breakout rooms
const breakoutRooms = ref<BreakoutParticipant[][]>(
  props.useSeed && props.seedData?.breakoutRooms ? props.seedData.breakoutRooms : []
);
const currentRoomIndex = ref<number>(0);
const canStartBreakout = ref<boolean>(false);
const breakOutRoomStarted = ref<boolean>(false);
const breakOutRoomEnded = ref<boolean>(false);
const hostNewRoom = ref<number>(-1);
const limitedBreakRoom = ref<BreakoutParticipant[]>([]);
const mainRoomsLength = ref<number>(0);
const memberRoom = ref<number>(-1);
const isBreakoutRoomsModalVisible = ref<boolean>(false);

// Whiteboard
const whiteboardUsers = ref<WhiteboardUser[]>(
  props.useSeed && props.seedData?.whiteboardUsers ? props.seedData.whiteboardUsers : []
);
const currentWhiteboardIndex = ref<number | null>(null);
const canStartWhiteboard = ref<boolean>(false);
const whiteboardStarted = ref<boolean>(false);
const whiteboardEnded = ref<boolean>(false);
const whiteboardLimit = ref<number>(itemPageLimit.value);
const isWhiteboardModalVisible = ref<boolean>(false);
const isConfigureWhiteboardModalVisible = ref<boolean>(false);
const shapes = ref<SharedShape[]>([]);
const useImageBackground = ref<boolean>(true);
const redoStack = ref<SharedShape[]>([]);
const undoStack = ref<string[]>([]);
const canvasStream = ref<MediaStream | null>(null);
const canvasWhiteboard = ref<HTMLCanvasElement | null>(null);

// Screenboard
const canvasScreenboard = ref<HTMLCanvasElement | null>(null);
const processedScreenStream = ref<MediaStream | null>(null);
const annotateScreenStream = ref<boolean>(false);
const mainScreenCanvas = ref<HTMLCanvasElement | null>(null);
const isScreenboardModalVisible = ref<boolean>(false);

type SupportedShapeInput = readonly SharedShape[] | readonly WhiteboardShape[];

const isSharedShape = (value: unknown): value is SharedShape =>
  typeof value === 'object' &&
  value !== null &&
  'payload' in (value as Record<string, unknown>);

const toWhiteboardShape = (shape: SharedShape): WhiteboardShape => {
  const payload = shape.payload ?? ({} as ShapePayload);

  return {
    type: payload.type ?? shape.action ?? 'draw',
    x1: payload.x1 ?? payload.x ?? 0,
    y1: payload.y1 ?? payload.y ?? 0,
    x2: payload.x2 ?? payload.x ?? 0,
    y2: payload.y2 ?? payload.y ?? 0,
    color: payload.color ?? '#000000',
    thickness: payload.thickness ?? 1,
    lineType: payload.lineType ?? 'solid',
    text: payload.text as string | undefined,
    font: payload.font as string | undefined,
    fontSize: payload.fontSize as number | undefined,
    points: payload.points as Array<{ x: number; y: number }> | undefined,
    img: payload.img as HTMLImageElement | undefined,
    src: payload.src as string | undefined,
    x: payload.x as number | undefined,
    y: payload.y as number | undefined,
  };
};

const toSharedShape = (shape: WhiteboardShape): SharedShape => {
  const payload: ShapePayload = {
    type: shape.type ?? 'draw',
    x1: shape.x1 ?? shape.x ?? 0,
    y1: shape.y1 ?? shape.y ?? 0,
    x2: shape.x2 ?? shape.x ?? 0,
    y2: shape.y2 ?? shape.y ?? 0,
    color: shape.color ?? '#000000',
    thickness: shape.thickness ?? 1,
    lineType: shape.lineType ?? 'solid',
    text: shape.text,
    font: shape.font,
    fontSize: shape.fontSize,
    points: shape.points,
    img: shape.img,
    src: shape.src,
    x: shape.x,
    y: shape.y,
  };

  return {
    action: shape.type ?? 'draw',
    payload,
  } satisfies SharedShape;
};

const convertSharedShapesToWhiteboard = (value: SharedShape[]): WhiteboardShape[] =>
  value.map((shape) => toWhiteboardShape(shape));

const isSharedShapeArray = (value: SupportedShapeInput): value is SharedShape[] =>
  value.every((item) => isSharedShape(item));

const normalizeToSharedShapes = (value: SupportedShapeInput): SharedShape[] => {
  if (value.length === 0) {
    return [];
  }
  if (isSharedShapeArray(value)) {
    return [...value];
  }
  return value.map((shape) => toSharedShape(shape as WhiteboardShape));
};
const updateShapesValue = (value: SupportedShapeInput): void => {
  shapes.value = normalizeToSharedShapes(value);
};

const updateRedoStackValue = (value: SupportedShapeInput): void => {
  redoStack.value = normalizeToSharedShapes(value);
};

// Control buttons state
const micActive = ref<boolean>(audioAlreadyOn.value);
const videoActive = ref<boolean>(videoAlreadyOn.value);
const screenShareActive = ref<boolean>(false);
const endCallActive = ref<boolean>(false);
const participantsActive = ref<boolean>(false);

// Computed Properties
const computedContainerStyle = computed(() => ({
  height: '100vh',
  width: '100vw',
  maxWidth: '100vw',
  maxHeight: '100vh',
  overflow: 'hidden',
  ...props.containerStyle,
}));

const credentials = computed(() => props.credentials);
const localLink = computed(() => props.localLink ?? '');
const connectMediaSFU = computed(() => props.connectMediaSFU ?? true);
const returnUI = computed(() => props.returnUI ?? true);
const noUIPreJoinOptions = computed(() => props.noUIPreJoinOptions);
const createMediaSFURoom = computed(() => props.createMediaSFURoom);
const joinMediaSFURoom = computed(() => props.joinMediaSFURoom);
const resolvedCustomComponent = computed<Component | undefined>(() =>
  customComponentRenderer.value ? (customComponentRenderer.value as unknown as Component) : undefined
);

const prejoinComponent = computed(() => props.PrejoinPage || PreJoinPageComponent.value);

const prejoinParameters = computed(() => ({
  imgSrc: props.imgSrc,
  showAlert,
  updateIsLoadingModalVisible: (value: boolean) => (isLoadingModalVisible.value = value),
  connectSocket,
  connectLocalSocket,
  updateSocket: (value: MediaSFUSocket) => (socket.value = value),
  updateLocalSocket: (value: MediaSFUSocket | null) => (localSocket.value = value),
  updateValidated: (value: boolean) => (validated.value = value),
  updateApiUserName: (value: string) => (apiUserName.value = value),
  updateApiToken: (value: string) => (apiToken.value = value),
  updateLink: (value: string) => (link.value = value),
  updateRoomName: (value: string) => (roomName.value = value),
  updateMember: (value: string) => (member.value = value),
  welcomePageComponent: WelcomePageComponent.value,
}));

// Update functions
const updateIsWideScreen = (value: boolean) => {
  isWideScreen.value = value;
};

const updateIsMediumScreen = (value: boolean) => {
  isMediumScreen.value = value;
};

const updateIsSmallScreen = (value: boolean) => {
  isSmallScreen.value = value;
};

const updateComponentSizes = (sizes: ComponentSizes) => {
  const current = componentSizes.value;
  if (
    current.mainHeight === sizes.mainHeight &&
    current.otherHeight === sizes.otherHeight &&
    current.mainWidth === sizes.mainWidth &&
    current.otherWidth === sizes.otherWidth
  ) {
    return;
  }
  current.mainHeight = sizes.mainHeight;
  current.otherHeight = sizes.otherHeight;
  current.mainWidth = sizes.mainWidth;
  current.otherWidth = sizes.otherWidth;
};

const updateIsMenuModalVisible = (value: boolean) => {
  isMenuModalVisible.value = value;
};

const updateIsRecordingModalVisible = (value: boolean) => {
  isRecordingModalVisible.value = value;
  if (value) {
    confirmedToRecord.value = false;
  } else {
    if (clearedToRecord.value && clearedToResume.value && recordStarted.value) {
      showRecordButtons.value = true;
    }
  }
};

const updateIsSettingsModalVisible = (value: boolean) => {
  isSettingsModalVisible.value = value;
};

const updateIsRequestsModalVisible = (value: boolean) => {
  isRequestsModalVisible.value = value;
};

const updateIsWaitingModalVisible = (value: boolean) => {
  isWaitingModalVisible.value = value;
};

const updateIsCoHostModalVisible = (value: boolean) => {
  isCoHostModalVisible.value = value;
};

const updateIsMediaSettingsModalVisible = (value: boolean) => {
  isMediaSettingsModalVisible.value = value;
};

const updateIsDisplaySettingsModalVisible = (value: boolean) => {
  isDisplaySettingsModalVisible.value = value;
};

const updateIsParticipantsModalVisible = (value: boolean) => {
  isParticipantsModalVisible.value = value;
};

const updateIsMessagesModalVisible = (value: boolean) => {
  isMessagesModalVisible.value = value;
  if (!value) {
    showMessagesBadge.value = false;
  }
};

const updateIsConfirmExitModalVisible = (value: boolean) => {
  isConfirmExitModalVisible.value = value;
};

const updateIsConfirmHereModalVisible = (value: boolean) => {
  isConfirmHereModalVisible.value = value;
};

const updateIsLoadingModalVisible = (value: boolean) => {
  isLoadingModalVisible.value = value;
};

const updateIsShareEventModalVisible = (value: boolean) => {
  isShareEventModalVisible.value = value;
};

const updateIsPollModalVisible = (value: boolean) => {
  isPollModalVisible.value = value;
};

const updateIsBackgroundModalVisible = (value: boolean) => {
  isBackgroundModalVisible.value = value;
};

const updateIsBreakoutRoomsModalVisible = (value: boolean) => {
  isBreakoutRoomsModalVisible.value = value;
};

const updateIsConfigureWhiteboardModalVisible = (value: boolean) => {
  isConfigureWhiteboardModalVisible.value = value;
};

const updateIsScreenboardModalVisible = (value: boolean) => {
  isScreenboardModalVisible.value = value;
};

const updateIsWhiteboardModalVisible = (value: boolean) => {
  isWhiteboardModalVisible.value = value;
};

const updateParticipants = (value: Participant[]) => {
  participants.value = value;
  filteredParticipants.value = value;
  participantsCounter.value = value.length;
};

const updateRequestList = (value: Request[]) => {
  requestList.value = value;
  filteredRequestList.value = value;
  requestCounter.value = value.length;
};

const updateWaitingRoomList = (value: WaitingRoomParticipant[]) => {
  waitingRoomList.value = value;
  filteredWaitingRoomList.value = value;
  waitingRoomCounter.value = value.length;
};

const updateRequestCounter = (value: number) => {
  requestCounter.value = value;
};

const updateRequestFilter = (value: string) => {
  requestFilter.value = value;
};

const updateCoHost = (value: string) => {
  coHost.value = value;
};

const updateCoHostResponsibility = (value: CoHostResponsibility[]) => {
  coHostResponsibility.value = value;
};

const updateAudioSetting = (value: string) => {
  audioSetting.value = value;
};

const updateVideoSetting = (value: string) => {
  videoSetting.value = value;
};

const updateScreenshareSetting = (value: string) => {
  screenshareSetting.value = value;
};

const updateChatSetting = (value: string) => {
  chatSetting.value = value;
};

const updateStartDirectMessage = (value: boolean) => {
  startDirectMessage.value = value;
};

const updateDirectMessageDetails = (value: Participant | null) => {
  directMessageDetails.value = value;
};

const showAlert = ({
  message,
  type,
  duration = 3000,
}: {
  message: string;
  type: string;
  duration?: number;
}) => {
  const normalizedType: 'success' | 'danger' = type === 'danger' ? 'danger' : 'success';
  alertMessage.value = message;
  alertType.value = normalizedType;
  alertDuration.value = duration;
  alertVisible.value = true;
};

const onRequestFilterChange = (value: string) => {
  if (value && value.length > 0) {
    const filteredRequest = requestList.value.filter((request: Request) =>
      request?.name?.toLowerCase().includes(value.toLowerCase())
    );
    filteredRequestList.value = filteredRequest;
    requestCounter.value = filteredRequest.length;
  } else {
    filteredRequestList.value = requestList.value;
    requestCounter.value = requestList.value.length;
  }
};

const onWaitingRoomFilterChange = (value: string) => {
  if (value && value.length > 0) {
    const filteredWaitingRoom = waitingRoomList.value.filter((waitingRoom) =>
      waitingRoom.name.toLowerCase().includes(value.toLowerCase())
    );
    filteredWaitingRoomList.value = filteredWaitingRoom;
    waitingRoomCounter.value = filteredWaitingRoom.length;
  } else {
    filteredWaitingRoomList.value = waitingRoomList.value;
    waitingRoomCounter.value = waitingRoomList.value.length;
  }
};

const onParticipantsFilterChange = (value: string) => {
  if (value && value.length > 0) {
    const filteredParts = participants.value.filter((participant) =>
      participant.name.toLowerCase().includes(value.toLowerCase())
    );
    filteredParticipants.value = filteredParts;
    participantsCounter.value = filteredParts.length;
  } else {
    filteredParticipants.value = participants.value;
    participantsCounter.value = participants.value.length;
  }
};

const checkOrientation = () => {
  const isPortrait = window.matchMedia('(orientation: portrait)').matches;
  return isPortrait ? 'portrait' : 'landscape';
};

const getUpdatedAllParams = () => {
  // Get all the params for the room as well as the update functions for them and Media SFU functions and return them
  try {
    if (props.sourceParameters !== null && props.sourceParameters !== undefined) {
      const updatedParams = {
        ...getAllParams(),
        ...mediaSFUFunctions(),
      };
      if (props.updateSourceParameters) {
        props.updateSourceParameters(updatedParams);
      }
    }
  } catch {
    // Do nothing
  }

  return {
    ...getAllParams(),
    ...mediaSFUFunctions(),
  };
};

const mediaSFUFunctions = () => {
  // Media SFU functions
  return {
    updateMiniCardsGrid,
    mixStreams,
    dispStreams,
    stopShareScreen,
    checkScreenShare,
    startShareScreen,
    requestScreenShare,
    reorderStreams,
    prepopulateUserMedia,
    getVideos,
    rePort,
    trigger,
  consumerResume: consumerResumeOverride.value,
    connectSendTransport,
    connectSendTransportAudio,
    connectSendTransportVideo,
    connectSendTransportScreen,
    processConsumerTransports,
    resumePauseStreams,
    readjust,
    checkGrid,
    getEstimate,
    calculateRowsAndColumns,
  addVideosGrid: addVideosGridOverride.value,
    onScreenChanges,
    sleep,
    changeVids,
    compareActiveNames,
    compareScreenStates,
    createSendTransport,
    resumeSendTransportAudio,
    receiveAllPipedTransports,
    disconnectSendTransportVideo,
    disconnectSendTransportAudio,
    disconnectSendTransportScreen,
    getPipedProducersAlt,
    signalNewConsumerTransport,
    connectRecvTransport,
    reUpdateInter,
    updateParticipantAudioDecibels,
    closeAndResize,
    autoAdjust,
    switchUserVideoAlt,
    switchUserVideo,
    switchUserAudio,
    getDomains,
    formatNumber,
    connectIps,
    connectLocalIps,
    createDeviceClient,
    handleCreatePoll,
    handleEndPoll,
    handleVotePoll,
    captureCanvasStream,
    resumePauseAudioStreams,
    processConsumerTransportsAudio,
    checkPermission,
    streamSuccessVideo,
    streamSuccessAudio,
    streamSuccessScreen,
    streamSuccessAudioSwitch,
    clickVideo,
    clickAudio,
    clickScreenShare,
    switchVideoAlt,
    requestPermissionCamera,
    requestPermissionAudio,
    getMediaDevicesList,
    getParticipantMedia,
  };
};

const requestPermissionCamera = async () => {
  return 'granted';
};

const requestPermissionAudio = async () => {
  return 'granted';
};

const getAllParams = () => {
  // Get all the params for the room as well as the update functions for them and return them
  return {
    localUIMode: props.useLocalUIMode,
    roomName: roomName.value,
    member: member.value,
    adminPasscode: adminPasscode.value,
    youAreCoHost: youAreCoHost.value,
    youAreHost: youAreHost.value,
    islevel: islevel.value,
    confirmedToRecord: confirmedToRecord.value,
    meetingDisplayType: meetingDisplayType.value,
    meetingVideoOptimized: meetingVideoOptimized.value,
    eventType: eventType.value,
    participants: participants.value,
    filteredParticipants: filteredParticipants.value,
    participantsCounter: participantsCounter.value,
    participantsFilter: participantsFilter.value,
    consume_sockets: consume_sockets.value,
    rtpCapabilities: rtpCapabilities.value,
    roomRecvIPs: roomRecvIPs.value,
    meetingRoomParams: meetingRoomParams.value,
    itemPageLimit: itemPageLimit.value,
    audioOnlyRoom: audioOnlyRoom.value,
    addForBasic: addForBasic.value,
    screenPageLimit: screenPageLimit.value,
    shareScreenStarted: shareScreenStarted.value,
    shared: shared.value,
    targetOrientation: targetOrientation.value,
    targetResolution: targetResolution.value,
    targetResolutionHost: targetResolutionHost.value,
    vidCons: vidCons.value,
    frameRate: frameRate.value,
    hParams: hParams.value,
    vParams: vParams.value,
    screenParams: screenParams.value,
    aParams: aParams.value,
    recordingAudioPausesLimit: recordingAudioPausesLimit.value,
    recordingAudioPausesCount: recordingAudioPausesCount.value,
    recordingAudioSupport: recordingAudioSupport.value,
    recordingAudioPeopleLimit: recordingAudioPeopleLimit.value,
    recordingAudioParticipantsTimeLimit: recordingAudioParticipantsTimeLimit.value,
    recordingVideoPausesCount: recordingVideoPausesCount.value,
    recordingVideoPausesLimit: recordingVideoPausesLimit.value,
    recordingVideoSupport: recordingVideoSupport.value,
    recordingVideoPeopleLimit: recordingVideoPeopleLimit.value,
    recordingVideoParticipantsTimeLimit: recordingVideoParticipantsTimeLimit.value,
    recordingAllParticipantsSupport: recordingAllParticipantsSupport.value,
    recordingVideoParticipantsSupport: recordingVideoParticipantsSupport.value,
    recordingAllParticipantsFullRoomSupport: recordingAllParticipantsFullRoomSupport.value,
    recordingVideoParticipantsFullRoomSupport: recordingVideoParticipantsFullRoomSupport.value,
    recordingPreferredOrientation: recordingPreferredOrientation.value,
    recordingSupportForOtherOrientation: recordingSupportForOtherOrientation.value,
    recordingMultiFormatsSupport: recordingMultiFormatsSupport.value,
    userRecordingParams: userRecordingParams.value,
    canRecord: canRecord.value,
    startReport: startReport.value,
    endReport: endReport.value,
    recordStartTime: recordStartTime.value,
    recordElapsedTime: recordElapsedTime.value,
    isTimerRunning: isTimerRunning.value,
    canPauseResume: canPauseResume.value,
    recordChangeSeconds: recordChangeSeconds.value,
    pauseLimit: pauseLimit.value,
    pauseRecordCount: pauseRecordCount.value,
    canLaunchRecord: canLaunchRecord.value,
    stopLaunchRecord: stopLaunchRecord.value,
    participantsAll: participantsAll.value,
    firstAll: firstAll.value,
    updateMainWindow: updateMainWindow.value,
    first_round: first_round.value,
    landScaped: landScaped.value,
    lock_screen: lock_screen.value,
    screenId: screenId.value,
    allVideoStreams: allVideoStreams.value as unknown as (Participant | Stream)[],
    newLimitedStreams: newLimitedStreams.value,
    newLimitedStreamsIDs: newLimitedStreamsIDs.value,
    activeSounds: activeSounds.value,
    screenShareIDStream: screenShareIDStream.value,
    screenShareNameStream: screenShareNameStream.value,
    adminIDStream: adminIDStream.value,
    adminNameStream: adminNameStream.value,
    youYouStream: youYouStream.value,
    youYouStreamIDs: youYouStreamIDs.value,
    localStream: localStream.value,
    recordStarted: recordStarted.value,
    recordResumed: recordResumed.value,
    recordPaused: recordPaused.value,
    recordStopped: recordStopped.value,
    adminRestrictSetting: adminRestrictSetting.value,
    videoRequestState: videoRequestState.value,
    videoRequestTime: videoRequestTime.value,
    videoAction: videoAction.value,
    localStreamVideo: localStreamVideo.value,
    userDefaultVideoInputDevice: userDefaultVideoInputDevice.value,
    currentFacingMode: currentFacingMode.value,
    prevFacingMode: prevFacingMode.value,
    defVideoID: defVideoID.value,
    allowed: allowed.value,
    dispActiveNames: dispActiveNames.value,
    p_dispActiveNames: p_dispActiveNames.value,
    activeNames: activeNames.value,
    prevActiveNames: prevActiveNames.value,
    p_activeNames: p_activeNames.value,
    membersReceived: membersReceived.value,
    deferScreenReceived: deferScreenReceived.value,
    hostFirstSwitch: hostFirstSwitch.value,
    micAction: micAction.value,
    screenAction: screenAction.value,
    chatAction: chatAction.value,
    audioRequestState: audioRequestState.value,
    screenRequestState: screenRequestState.value,
    chatRequestState: chatRequestState.value,
    audioRequestTime: audioRequestTime.value,
    screenRequestTime: screenRequestTime.value,
    chatRequestTime: chatRequestTime.value,
    updateRequestIntervalSeconds: updateRequestIntervalSeconds.value,
    oldSoundIds: oldSoundIds.value,
    hostLabel: hostLabel.value,
    mainScreenFilled: mainScreenFilled.value,
    localStreamScreen: localStreamScreen.value,
    screenAlreadyOn: screenAlreadyOn.value,
    chatAlreadyOn: chatAlreadyOn.value,
    redirectURL: redirectURL.value,
    oldAllStreams: oldAllStreams.value,
    adminVidID: adminVidID.value,
    streamNames: streamNames.value,
    non_alVideoStreams: non_alVideoStreams.value as unknown as (Participant | Stream)[],
    sortAudioLoudness: sortAudioLoudness.value,
    audioDecibels: audioDecibels.value,
    mixed_alVideoStreams: mixed_alVideoStreams.value as unknown as (Participant | Stream)[],
    non_alVideoStreams_muted: non_alVideoStreams_muted.value as unknown as (Participant | Stream)[],
    paginatedStreams: paginatedStreams.value,
    localStreamAudio: localStreamAudio.value,
    defAudioID: defAudioID.value,
    userDefaultAudioInputDevice: userDefaultAudioInputDevice.value,
    userDefaultAudioOutputDevice: userDefaultAudioOutputDevice.value,
    prevAudioInputDevice: prevAudioInputDevice.value,
    prevVideoInputDevice: prevVideoInputDevice.value,
    audioPaused: audioPaused.value,
    mainScreenPerson: mainScreenPerson.value,
    adminOnMainScreen: adminOnMainScreen.value,
    screenStates: screenStates.value,
    prevScreenStates: prevScreenStates.value,
    updateDateState: updateDateState.value,
    lastUpdate: lastUpdate.value,
    nForReadjustRecord: nForReadjustRecord.value,
    fixedPageLimit: fixedPageLimit.value,
    removeAltGrid: removeAltGrid.value,
    nForReadjust: nForReadjust.value,
    lastReorderTime: lastReorderTime.value,
    reorderInterval: reorderInterval.value,
    fastReorderInterval: fastReorderInterval.value,
    audStreamNames: audStreamNames.value,
    currentUserPage: currentUserPage.value,
    mainHeightWidth: mainHeightWidth.value,
    prevMainHeightWidth: prevMainHeightWidth.value,
    prevDoPaginate: prevDoPaginate.value,
    doPaginate: doPaginate.value,
    shareEnded: shareEnded.value,
    lStreams: lStreams.value,
    chatRefStreams: chatRefStreams.value,
    controlHeight: controlHeight.value,
    isWideScreen: isWideScreen.value,
    isMediumScreen: isMediumScreen.value,
    isSmallScreen: isSmallScreen.value,
    addGrid: addGrid.value,
    addAltGrid: addAltGrid.value,
    gridRows: gridRows.value,
    gridCols: gridCols.value,
    altGridRows: altGridRows.value,
    altGridCols: altGridCols.value,
    numberPages: numberPages.value,
    currentStreams: currentStreams.value,
    showMiniView: showMiniView.value,
    nStream: nStream.value,
    defer_receive: defer_receive.value,
    allAudioStreams: allAudioStreams.value as unknown as (Participant | Stream)[],
    screenProducer: screenProducer.value as unknown as Producer | null,
    remoteScreenStream: remoteScreenStream.value as unknown as (Participant | Stream)[],
    gotAllVids: gotAllVids.value,
    paginationHeightWidth: paginationHeightWidth.value,
    paginationDirection: paginationDirection.value,
    gridSizes: gridSizes.value,
    screenForceFullDisplay: screenForceFullDisplay.value,
    mainGridStream: mainGridStream.value,
    otherGridStreams: otherGridStreams.value,
    audioOnlyStreams: audioOnlyStreams.value,
    videoInputs: videoInputs.value,
    audioInputs: audioInputs.value,
    meetingProgressTime: meetingProgressTime.value,
    meetingElapsedTime: meetingElapsedTime.value,
    ref_participants: ref_participants.value as unknown as (Participant | Stream)[],
    messages: messages.value,
    startDirectMessage: startDirectMessage.value,
    directMessageDetails: directMessageDetails.value,
    coHost: coHost.value,
    coHostResponsibility: coHostResponsibility.value,
    audioSetting: audioSetting.value,
    videoSetting: videoSetting.value,
    screenshareSetting: screenshareSetting.value,
    chatSetting: chatSetting.value,
    autoWave: autoWave.value,
    forceFullDisplay: forceFullDisplay.value,
    prevForceFullDisplay: prevForceFullDisplay.value,
    prevMeetingDisplayType: prevMeetingDisplayType.value,
    waitingRoomFilter: waitingRoomFilter.value,
    waitingRoomList: waitingRoomList.value,
    waitingRoomCounter: waitingRoomCounter.value,
    filteredWaitingRoomList: filteredWaitingRoomList.value,
    requestFilter: requestFilter.value,
    requestList: requestList.value,
    requestCounter: requestCounter.value,
    filteredRequestList: filteredRequestList.value,
    totalReqWait: totalReqWait.value,
    alertVisible: alertVisible.value,
    alertMessage: alertMessage.value,
    alertType: alertType.value,
    alertDuration: alertDuration.value,
    progressTimerVisible: progressTimerVisible.value,
    progressTimerValue: progressTimerValue.value,
    isMenuModalVisible: isMenuModalVisible.value,
    isRecordingModalVisible: isRecordingModalVisible.value,
    isSettingsModalVisible: isSettingsModalVisible.value,
    isRequestsModalVisible: isRequestsModalVisible.value,
    isWaitingModalVisible: isWaitingModalVisible.value,
    isCoHostModalVisible: isCoHostModalVisible.value,
    isMediaSettingsModalVisible: isMediaSettingsModalVisible.value,
    isDisplaySettingsModalVisible: isDisplaySettingsModalVisible.value,
    isParticipantsModalVisible: isParticipantsModalVisible.value,
    isMessagesModalVisible: isMessagesModalVisible.value,
    isConfirmExitModalVisible: isConfirmExitModalVisible.value,
    isConfirmHereModalVisible: isConfirmHereModalVisible.value,
    isLoadingModalVisible: isLoadingModalVisible.value,
    recordingMediaOptions: recordingMediaOptions.value,
    recordingAudioOptions: recordingAudioOptions.value,
    recordingVideoOptions: recordingVideoOptions.value,
    recordingVideoType: recordingVideoType.value,
    recordingVideoOptimized: recordingVideoOptimized.value,
    recordingDisplayType: recordingDisplayType.value,
    recordingAddHLS: recordingAddHLS.value,
    recordingAddText: recordingAddText.value,
    recordingCustomText: recordingCustomText.value,
    recordingCustomTextPosition: recordingCustomTextPosition.value,
    recordingCustomTextColor: recordingCustomTextColor.value,
    recordingNameTags: recordingNameTags.value,
    recordingBackgroundColor: recordingBackgroundColor.value,
    recordingNameTagsColor: recordingNameTagsColor.value,
    recordingOrientationVideo: recordingOrientationVideo.value,
    clearedToResume: clearedToResume.value,
    clearedToRecord: clearedToRecord.value,
    recordState: recordState.value,
    showRecordButtons: showRecordButtons.value,
    recordingProgressTime: recordingProgressTime.value,
    audioSwitching: audioSwitching.value,
    videoSwitching: videoSwitching.value,
    videoAlreadyOn: videoAlreadyOn.value,
    audioAlreadyOn: audioAlreadyOn.value,
    componentSizes: componentSizes.value,
    hasCameraPermission: hasCameraPermission.value,
    hasAudioPermission: hasAudioPermission.value,
    transportCreated: transportCreated.value,
    localTransportCreated: localTransportCreated.value,
    transportCreatedVideo: transportCreatedVideo.value,
    transportCreatedAudio: transportCreatedAudio.value,
    transportCreatedScreen: transportCreatedScreen.value,
    producerTransport: producerTransport.value,
    localProducerTransport: localProducerTransport.value,
    videoProducer: videoProducer.value as unknown as Producer | null,
    localVideoProducer: localVideoProducer.value as unknown as Producer | null,
    params: params.value,
    videoParams: videoParams.value,
    audioParams: audioParams.value,
    audioProducer: audioProducer.value as unknown as Producer | null,
    audioLevel: audioLevel.value,
    localAudioProducer: localAudioProducer.value as unknown as Producer | null,
    consumerTransports: consumerTransports.value as unknown as TransportType[],
    consumingTransports: consumingTransports.value as unknown as string[],
    polls: polls.value,
    poll: poll.value,
    isPollModalVisible: isPollModalVisible.value,
    customImage: customImage.value,
    selectedImage: selectedImage.value,
    segmentVideo: segmentVideo.value,
    selfieSegmentation: selfieSegmentation.value,
    pauseSegmentation: pauseSegmentation.value,
    processedStream: processedStream.value,
    keepBackground: keepBackground.value,
    backgroundHasChanged: backgroundHasChanged.value,
    virtualStream: virtualStream.value,
    mainCanvas: mainCanvas.value,
    prevKeepBackground: prevKeepBackground.value,
    appliedBackground: appliedBackground.value,
    isBackgroundModalVisible: isBackgroundModalVisible.value,
    autoClickBackground: autoClickBackground.value,
    breakoutRooms: breakoutRooms.value,
    currentRoomIndex: currentRoomIndex.value,
    canStartBreakout: canStartBreakout.value,
    breakOutRoomStarted: breakOutRoomStarted.value,
    breakOutRoomEnded: breakOutRoomEnded.value,
    hostNewRoom: hostNewRoom.value,
    limitedBreakRoom: limitedBreakRoom.value,
    mainRoomsLength: mainRoomsLength.value,
    memberRoom: memberRoom.value,
    isBreakoutRoomsModalVisible: isBreakoutRoomsModalVisible.value,
    whiteboardUsers: whiteboardUsers.value,
    currentWhiteboardIndex: currentWhiteboardIndex.value,
    canStartWhiteboard: canStartWhiteboard.value,
    whiteboardStarted: whiteboardStarted.value,
    whiteboardEnded: whiteboardEnded.value,
    whiteboardLimit: whiteboardLimit.value,
    isWhiteboardModalVisible: isWhiteboardModalVisible.value,
    isConfigureWhiteboardModalVisible: isConfigureWhiteboardModalVisible.value,
    shapes: shapes.value,
    useImageBackground: useImageBackground.value,
    redoStack: redoStack.value,
    undoStack: undoStack.value,
    canvasStream: canvasStream.value,
    canvasWhiteboard: canvasWhiteboard.value,
    canvasScreenboard: canvasScreenboard.value,
    processedScreenStream: processedScreenStream.value,
    annotateScreenStream: annotateScreenStream.value,
    mainScreenCanvas: mainScreenCanvas.value,
    isScreenboardModalVisible: isScreenboardModalVisible.value,
    validated: validated.value,
    device: device.value as unknown as Device | null,
    socket: socket.value as unknown as MediaSFUSocket,
    localSocket: (localSocket.value ?? undefined) as unknown as MediaSFUSocket | undefined,
    checkMediaPermission: false,
    onWeb: true,
    mediaDevices: mediaDevices,
    // Update functions (Vue-specific - pass setters)
    updateRoomName: (value: string) => (roomName.value = value),
    updateMember: (value: string) => {
      if (value.length > 0 && value.includes('_')) {
        const parts = value.split('_');
        if (parts[1]) {
          islevel.value = parts[1];
        }
        value = parts[0] || value;
      }
      member.value = value;
    },
    updateAdminPasscode: (value: string) => (adminPasscode.value = value),
    updateYouAreCoHost: (value: boolean) => (youAreCoHost.value = value),
    updateYouAreHost: (value: boolean) => (youAreHost.value = value),
    updateIslevel: (value: string) => (islevel.value = value),
    updateCoHost,
    updateCoHostResponsibility,
    updateConfirmedToRecord: (value: boolean) => (confirmedToRecord.value = value),
    updateMeetingDisplayType: (value: string) => (meetingDisplayType.value = value),
    updateMeetingVideoOptimized: (value: boolean) => (meetingVideoOptimized.value = value),
    updateEventType: (value: EventType) => {
      eventType.value = value;
      if (value !== 'none') {
        try {
          setTimeout(() => {
            onResize();
          }, 1500);
        } catch {
          // Do nothing
        }
      }
    },
    updateParticipants,
    updateParticipantsCounter: (value: number) => (participantsCounter.value = value),
    updateParticipantsFilter: (value: string) => (participantsFilter.value = value),
    updateConsume_sockets: (value: ConsumeSocket[]) => (consume_sockets.value = value),
    updateRtpCapabilities: (value: RtpCapabilities | null) => (rtpCapabilities.value = value),
    updateRoomRecvIPs: (value: string[]) => (roomRecvIPs.value = value),
    updateMeetingRoomParams: (value: MeetingRoomParams | null) => (meetingRoomParams.value = value),
    updateItemPageLimit: (value: number) => (itemPageLimit.value = value),
    updateAudioOnlyRoom: (value: boolean) => (audioOnlyRoom.value = value),
    updateAddForBasic: (value: boolean) => (addForBasic.value = value),
    updateScreenPageLimit: (value: number) => (screenPageLimit.value = value),
    updateShareScreenStarted: (value: boolean) => (shareScreenStarted.value = value),
    updateShared: (value: boolean) => {
      shared.value = value;
      screenShareActive.value = value;
      if (value) {
        setTimeout(async () => {
          window.dispatchEvent(new Event('resize'));
        }, 2000);
      }
    },
    updateTargetOrientation: (value: string) => (targetOrientation.value = value),
    updateTargetResolution: (value: string) => (targetResolution.value = value),
    updateTargetResolutionHost: (value: string) => (targetResolutionHost.value = value),
    updateVidCons: (value: VidCons) => (vidCons.value = value),
    updateFrameRate: (value: number) => (frameRate.value = value),
    updateHParams: (value: HParamsType) => (hParams.value = value),
    updateVParams: (value: VParamsType) => (vParams.value = value),
    updateScreenParams: (value: ScreenParamsType) => (screenParams.value = value),
    updateAParams: (value: AParamsType) => (aParams.value = value),
    updateRecordingAudioPausesLimit: (value: number) => (recordingAudioPausesLimit.value = value),
    updateRecordingAudioPausesCount: (value: number) => (recordingAudioPausesCount.value = value),
    updateRecordingAudioSupport: (value: boolean) => (recordingAudioSupport.value = value),
    updateRecordingAudioPeopleLimit: (value: number) => (recordingAudioPeopleLimit.value = value),
    updateRecordingAudioParticipantsTimeLimit: (value: number) => (recordingAudioParticipantsTimeLimit.value = value),
    updateRecordingVideoPausesCount: (value: number) => (recordingVideoPausesCount.value = value),
    updateRecordingVideoPausesLimit: (value: number) => (recordingVideoPausesLimit.value = value),
    updateRecordingVideoSupport: (value: boolean) => (recordingVideoSupport.value = value),
    updateRecordingVideoPeopleLimit: (value: number) => (recordingVideoPeopleLimit.value = value),
    updateRecordingVideoParticipantsTimeLimit: (value: number) => (recordingVideoParticipantsTimeLimit.value = value),
    updateRecordingAllParticipantsSupport: (value: boolean) => (recordingAllParticipantsSupport.value = value),
    updateRecordingVideoParticipantsSupport: (value: boolean) => (recordingVideoParticipantsSupport.value = value),
    updateRecordingAllParticipantsFullRoomSupport: (value: boolean) => (recordingAllParticipantsFullRoomSupport.value = value),
    updateRecordingVideoParticipantsFullRoomSupport: (value: boolean) => (recordingVideoParticipantsFullRoomSupport.value = value),
    updateRecordingPreferredOrientation: (value: string) => (recordingPreferredOrientation.value = value),
    updateRecordingSupportForOtherOrientation: (value: boolean) => (recordingSupportForOtherOrientation.value = value),
    updateRecordingMultiFormatsSupport: (value: boolean) => (recordingMultiFormatsSupport.value = value),
    updateUserRecordingParams: (value: UserRecordingParams) => (userRecordingParams.value = value),
    updateCanRecord: (value: boolean) => (canRecord.value = value),
    updateStartReport: (value: boolean) => (startReport.value = value),
    updateEndReport: (value: boolean) => (endReport.value = value),
    updateRecordTimerInterval: (value: ReturnType<typeof setInterval> | null) => (recordTimerInterval.value = value),
    updateRecordStartTime: (value: number) => (recordStartTime.value = value),
    updateRecordElapsedTime: (value: number) => (recordElapsedTime.value = value),
    updateIsTimerRunning: (value: boolean) => (isTimerRunning.value = value),
    updateCanPauseResume: (value: boolean) => (canPauseResume.value = value),
    updateRecordChangeSeconds: (value: number) => (recordChangeSeconds.value = value),
    updatePauseLimit: (value: number) => (pauseLimit.value = value),
    updatePauseRecordCount: (value: number) => (pauseRecordCount.value = value),
    updateCanLaunchRecord: (value: boolean) => (canLaunchRecord.value = value),
    updateStopLaunchRecord: (value: boolean) => (stopLaunchRecord.value = value),
    updateParticipantsAll: (value: Participant[]) => (participantsAll.value = value),
    updateFirstAll: (value: boolean) => (firstAll.value = value),
    updateUpdateMainWindow: (value: boolean) => (updateMainWindow.value = value),
    updateFirst_round: (value: boolean) => (first_round.value = value),
    updateLandScaped: (value: boolean) => (landScaped.value = value),
    updateLock_screen: (value: boolean) => (lock_screen.value = value),
    updateScreenId: (value: string) => (screenId.value = value),
    updateAllVideoStreams: (value: (Participant | Stream)[]) => (allVideoStreams.value = value),
    updateNewLimitedStreams: (value: (Participant | Stream)[]) => (newLimitedStreams.value = value),
    updateNewLimitedStreamsIDs: (value: string[]) => (newLimitedStreamsIDs.value = value),
    updateActiveSounds: (value: string[]) => (activeSounds.value = value),
    updateScreenShareIDStream: (value: string) => (screenShareIDStream.value = value),
    updateScreenShareNameStream: (value: string) => (screenShareNameStream.value = value),
    updateAdminIDStream: (value: string) => (adminIDStream.value = value),
    updateAdminNameStream: (value: string) => (adminNameStream.value = value),
    updateYouYouStream: (value: (Participant | Stream)[]) => (youYouStream.value = value),
    updateYouYouStreamIDs: (value: string[]) => (youYouStreamIDs.value = value),
    updateLocalStream: (value: MediaStream | null) => (localStream.value = value),
    updateRecordStarted: (value: boolean) => (recordStarted.value = value),
    updateRecordResumed: (value: boolean) => (recordResumed.value = value),
    updateRecordPaused: (value: boolean) => (recordPaused.value = value),
    updateRecordStopped: (value: boolean) => (recordStopped.value = value),
    updateAdminRestrictSetting: (value: boolean) => (adminRestrictSetting.value = value),
    updateVideoRequestState: (value: string | null) => (videoRequestState.value = value),
    updateVideoRequestTime: (value: number) => (videoRequestTime.value = value),
    updateVideoAction: (value: boolean) => (videoAction.value = value),
    updateLocalStreamVideo: (value: MediaStream | null) => (localStreamVideo.value = value),
    updateUserDefaultVideoInputDevice: (value: string) => (userDefaultVideoInputDevice.value = value),
    updateCurrentFacingMode: (value: string) => (currentFacingMode.value = value),
    updatePrevFacingMode: (value: string) => (prevFacingMode.value = value),
    updateDefVideoID: (value: string) => (defVideoID.value = value),
    updateAllowed: (value: boolean) => (allowed.value = value),
    updateDispActiveNames: (value: string[]) => (dispActiveNames.value = value),
    updateP_dispActiveNames: (value: string[]) => (p_dispActiveNames.value = value),
    updateActiveNames: (value: string[]) => (activeNames.value = value),
    updatePrevActiveNames: (value: string[]) => (prevActiveNames.value = value),
    updateP_activeNames: (value: string[]) => (p_activeNames.value = value),
    updateMembersReceived: (value: boolean) => (membersReceived.value = value),
    updateDeferScreenReceived: (value: boolean) => (deferScreenReceived.value = value),
    updateHostFirstSwitch: (value: boolean) => (hostFirstSwitch.value = value),
    updateMicAction: (value: boolean) => (micAction.value = value),
    updateScreenAction: (value: boolean) => (screenAction.value = value),
    updateChatAction: (value: boolean) => (chatAction.value = value),
    updateAudioRequestState: (value: string | null) => (audioRequestState.value = value),
    updateScreenRequestState: (value: string | null) => (screenRequestState.value = value),
    updateChatRequestState: (value: string | null) => (chatRequestState.value = value),
    updateAudioRequestTime: (value: number) => (audioRequestTime.value = value),
    updateScreenRequestTime: (value: number) => (screenRequestTime.value = value),
    updateChatRequestTime: (value: number) => (chatRequestTime.value = value),
    updateOldSoundIds: (value: string[]) => (oldSoundIds.value = value),
    updatehostLabel: (value: string) => (hostLabel.value = value),
    updateMainScreenFilled: (value: boolean) => (mainScreenFilled.value = value),
    updateLocalStreamScreen: (value: MediaStream | null) => (localStreamScreen.value = value),
    updateScreenAlreadyOn: (value: boolean) => (screenAlreadyOn.value = value),
    updateChatAlreadyOn: (value: boolean) => (chatAlreadyOn.value = value),
    updateRedirectURL: (value: string) => (redirectURL.value = value),
    updateOldAllStreams: (value: (Participant | Stream)[]) => (oldAllStreams.value = value),
    updateAdminVidID: (value: string) => (adminVidID.value = value),
    updateStreamNames: (value: Stream[]) => (streamNames.value = value),
    updateNon_alVideoStreams: (value: Participant[]) => (non_alVideoStreams.value = value),
    updateSortAudioLoudness: (value: boolean) => (sortAudioLoudness.value = value),
    updateAudioDecibels: (value: AudioDecibels[]) => (audioDecibels.value = value),
    updateMixed_alVideoStreams: (value: (Participant | Stream)[]) => (mixed_alVideoStreams.value = value),
    updateNon_alVideoStreams_muted: (value: Participant[]) => (non_alVideoStreams_muted.value = value),
    updatePaginatedStreams: (value: (Participant | Stream)[][]) => (paginatedStreams.value = value),
    updateLocalStreamAudio: (value: MediaStream | null) => (localStreamAudio.value = value),
    updateDefAudioID: (value: string) => (defAudioID.value = value),
    updateUserDefaultAudioInputDevice: (value: string) => (userDefaultAudioInputDevice.value = value),
    updateUserDefaultAudioOutputDevice: (value: string) => (userDefaultAudioOutputDevice.value = value),
    updatePrevAudioInputDevice: (value: string) => (prevAudioInputDevice.value = value),
    updatePrevVideoInputDevice: (value: string) => (prevVideoInputDevice.value = value),
    updateAudioPaused: (value: boolean) => (audioPaused.value = value),
    updateMainScreenPerson: (value: string) => (mainScreenPerson.value = value),
    updateAdminOnMainScreen: (value: boolean) => (adminOnMainScreen.value = value),
    updateScreenStates: (value: ScreenState[]) => (screenStates.value = value),
    updatePrevScreenStates: (value: ScreenState[]) => (prevScreenStates.value = value),
    updateUpdateDateState: (value: number | null) => (updateDateState.value = value),
    updateLastUpdate: (value: number | null) => (lastUpdate.value = value),
    updateNForReadjustRecord: (value: number) => (nForReadjustRecord.value = value),
    updateFixedPageLimit: (value: number) => (fixedPageLimit.value = value),
    updateRemoveAltGrid: (value: boolean) => (removeAltGrid.value = value),
    updateNForReadjust: (value: number) => (nForReadjust.value = value),
    updateLastReorderTime: (value: number) => (lastReorderTime.value = value),
    updateAudStreamNames: (value: Stream[]) => (audStreamNames.value = value),
    updateCurrentUserPage: (value: number) => (currentUserPage.value = value),
    updateMainHeightWidth: (value: number) => (mainHeightWidth.value = value),
    updatePrevMainHeightWidth: (value: number) => (prevMainHeightWidth.value = value),
    updatePrevDoPaginate: (value: boolean) => (prevDoPaginate.value = value),
    updateDoPaginate: (value: boolean) => (doPaginate.value = value),
    updateShareEnded: (value: boolean) => (shareEnded.value = value),
    updateLStreams: (value: (Participant | Stream)[]) => (lStreams.value = value),
    updateChatRefStreams: (value: (Participant | Stream)[]) => (chatRefStreams.value = value),
    updateControlHeight: (value: number) => (controlHeight.value = value),
    updateIsWideScreen,
    updateIsMediumScreen,
    updateIsSmallScreen,
    updateAddGrid: (value: boolean) => (addGrid.value = value),
    updateAddAltGrid: (value: boolean) => (addAltGrid.value = value),
    updateGridRows: (value: number) => (gridRows.value = value),
    updateGridCols: (value: number) => (gridCols.value = value),
    updateAltGridRows: (value: number) => (altGridRows.value = value),
    updateAltGridCols: (value: number) => (altGridCols.value = value),
    updateNumberPages: (value: number) => (numberPages.value = value),
    updateCurrentStreams: (value: (Participant | Stream)[]) => (currentStreams.value = value),
    updateShowMiniView: (value: boolean) => (showMiniView.value = value),
    updateNStream: (value: MediaStream | null) => (nStream.value = value),
    updateDefer_receive: (value: boolean) => (defer_receive.value = value),
    updateAllAudioStreams: (value: (Participant | Stream)[]) => (allAudioStreams.value = value),
    updateRemoteScreenStream: (value: Stream[]) => (remoteScreenStream.value = value),
    updateScreenProducer: (value: Producer | null) => (screenProducer.value = value),
    updateLocalScreenProducer: (value: Producer | null) => (localScreenProducer.value = value),
    updateGotAllVids: (value: boolean) => (gotAllVids.value = value),
    updatePaginationHeightWidth: (value: number) => (paginationHeightWidth.value = value),
    updatePaginationDirection: (value: 'horizontal' | 'vertical') => (paginationDirection.value = value),
    updateGridSizes: (value: GridSizes) => (gridSizes.value = value),
    updateScreenForceFullDisplay: (value: boolean) => (screenForceFullDisplay.value = value),
    updateMainGridStream: (value: RenderableListSource | null | undefined) => {
      mainGridStreamRaw.value = Array.isArray(value)
        ? (value as RenderableListSource)
        : ([] as RenderableListSource);
    },
    updateOtherGridStreams: (value: RenderableGridSource | null | undefined) => {
      otherGridStreams.value = Array.isArray(value)
        ? prepareRenderableGrid(value as RenderableGridSource)
        : emptyRenderableGrid();
    },
    updateAudioOnlyStreams: (value: RenderableListSource | null | undefined) => {
      audioOnlyStreams.value = Array.isArray(value)
        ? prepareRenderableList(value as RenderableListSource)
        : emptyRenderableList();
    },
    updateVideoInputs: (value: MediaDeviceInfo[]) => (videoInputs.value = value),
    updateAudioInputs: (value: MediaDeviceInfo[]) => (audioInputs.value = value),
    updateMeetingProgressTime: (value: string) => (meetingProgressTime.value = value),
    updateMeetingElapsedTime: (value: number) => (meetingElapsedTime.value = value),
    updateRef_participants: (value: Participant[]) => (ref_participants.value = value),
    updateMessages: (value: Message[]) => (messages.value = value),
    updateStartDirectMessage,
    updateDirectMessageDetails,
    updateShowMessagesBadge: (value: boolean) => (showMessagesBadge.value = value),
    updateAudioSetting,
    updateVideoSetting,
    updateScreenshareSetting,
    updateChatSetting,
    updateDisplayOption: (value: string) => (displayOption.value = value),
    updateAutoWave: (value: boolean) => (autoWave.value = value),
    updateForceFullDisplay: (value: boolean) => (forceFullDisplay.value = value),
    updatePrevForceFullDisplay: (value: boolean) => (prevForceFullDisplay.value = value),
    updatePrevMeetingDisplayType: (value: string) => (prevMeetingDisplayType.value = value),
    updateWaitingRoomFilter: (value: string) => (waitingRoomFilter.value = value),
    updateWaitingRoomList,
    updateWaitingRoomCounter: (value: number) => (waitingRoomCounter.value = value),
    updateRequestFilter,
    updateRequestList,
    updateRequestCounter,
    updateTotalReqWait: (value: number) => (totalReqWait.value = value),
    updateIsMenuModalVisible,
    updateIsRecordingModalVisible,
    updateIsSettingsModalVisible,
    updateIsRequestsModalVisible,
    updateIsWaitingModalVisible,
    updateIsCoHostModalVisible,
    updateIsMediaSettingsModalVisible,
    updateIsDisplaySettingsModalVisible,
    updateIsParticipantsModalVisible,
    updateIsMessagesModalVisible,
    updateIsConfirmExitModalVisible,
    updateIsConfirmHereModalVisible,
    updateIsLoadingModalVisible,
    updateRecordingMediaOptions: (value: string) => {
      recordingMediaOptions.value = value;
      clearedToRecord.value = false;
    },
    updateRecordingAudioOptions: (value: string) => {
      recordingAudioOptions.value = value;
      clearedToRecord.value = false;
    },
    updateRecordingVideoOptions: (value: string) => {
      recordingVideoOptions.value = value;
      clearedToRecord.value = false;
    },
    updateRecordingVideoType: (value: string) => {
      recordingVideoType.value = value;
      clearedToRecord.value = false;
    },
    updateRecordingVideoOptimized: (value: boolean) => {
      recordingVideoOptimized.value = value;
      clearedToRecord.value = false;
    },
    updateRecordingDisplayType: (value: 'media' | 'video' | 'all') => {
      recordingDisplayType.value = value;
      clearedToRecord.value = false;
    },
    updateRecordingAddHLS: (value: boolean) => {
      recordingAddHLS.value = value;
      clearedToRecord.value = false;
    },
    updateRecordingAddText: (value: boolean) => {
      recordingAddText.value = value;
      clearedToRecord.value = false;
    },
    updateRecordingCustomText: (value: string) => {
      recordingCustomText.value = value;
      clearedToRecord.value = false;
    },
    updateRecordingCustomTextPosition: (value: string) => {
      recordingCustomTextPosition.value = value;
      clearedToRecord.value = false;
    },
    updateRecordingCustomTextColor: (value: string) => {
      recordingCustomTextColor.value = value;
      clearedToRecord.value = false;
    },
    updateRecordingNameTags: (value: boolean) => {
      recordingNameTags.value = value;
      clearedToRecord.value = false;
    },
    updateRecordingBackgroundColor: (value: string) => {
      recordingBackgroundColor.value = value;
      clearedToRecord.value = false;
    },
    updateRecordingNameTagsColor: (value: string) => {
      recordingNameTagsColor.value = value;
      clearedToRecord.value = false;
    },
    updateRecordingOrientationVideo: (value: string) => {
      recordingOrientationVideo.value = value;
      clearedToRecord.value = false;
    },
    updateClearedToResume: (value: boolean) => (clearedToResume.value = value),
    updateClearedToRecord: (value: boolean) => (clearedToRecord.value = value),
    updateRecordState: (value: string) => (recordState.value = value),
    updateShowRecordButtons: (value: boolean) => (showRecordButtons.value = value),
    updateRecordingProgressTime: (value: string) => (recordingProgressTime.value = value),
    updateAudioSwitching: (value: boolean) => (audioSwitching.value = value),
    updateVideoSwitching: (value: boolean) => (videoSwitching.value = value),
    updateVideoAlreadyOn: (value: boolean) => {
      videoAlreadyOn.value = value;
      videoActive.value = value;
    },
    updateAudioAlreadyOn: (value: boolean) => {
      audioAlreadyOn.value = value;
      micActive.value = value;
    },
    updateComponentSizes,
    updateHasCameraPermission: (value: boolean) => (hasCameraPermission.value = value),
    updateHasAudioPermission: (value: boolean) => (hasAudioPermission.value = value),
    updateTransportCreated: (value: boolean) => (transportCreated.value = value),
    updateLocalTransportCreated: (value: boolean) => (localTransportCreated.value = value),
    updateTransportCreatedVideo: (value: boolean) => (transportCreatedVideo.value = value),
    updateTransportCreatedAudio: (value: boolean) => (transportCreatedAudio.value = value),
    updateTransportCreatedScreen: (value: boolean) => (transportCreatedScreen.value = value),
    updateProducerTransport: (value: Transport | null) => (producerTransport.value = value),
    updateLocalProducerTransport: (value: Transport | null) => (localProducerTransport.value = value),
    updateVideoProducer: (value: Producer | null) => (videoProducer.value = value),
    updateLocalVideoProducer: (value: Producer | null) => (localVideoProducer.value = value),
    updateParams: (value: ProducerOptions) => (params.value = value),
    updateVideoParams: (value: ProducerOptions) => (videoParams.value = value),
    updateAudioParams: (value: ProducerOptions) => (audioParams.value = value),
    updateAudioProducer: (value: Producer | null) => (audioProducer.value = value),
    updateAudioLevel: (value: number) => (audioLevel.value = value),
    updateLocalAudioProducer: (value: Producer | null) => (localAudioProducer.value = value),
    updateConsumerTransports: (value: TransportType[]) => (consumerTransports.value = value),
    updateConsumingTransports: (value: string[]) => (consumingTransports.value = value),
    updatePolls: (value: Poll[]) => (polls.value = value),
    updatePoll: (value: Poll | null) => (poll.value = value),
    updateIsPollModalVisible,
    updateCustomImage: (value: string) => (customImage.value = value),
    updateSelectedImage: (value: string) => (selectedImage.value = value),
    updateSegmentVideo: (value: MediaStream | null) => (segmentVideo.value = value),
    updateSelfieSegmentation: (value: SelfieSegmentation | null) => (selfieSegmentation.value = value),
    updatePauseSegmentation: (value: boolean) => (pauseSegmentation.value = value),
    updateProcessedStream: (value: MediaStream | null) => (processedStream.value = value),
    updateKeepBackground: (value: boolean) => (keepBackground.value = value),
    updateBackgroundHasChanged: (value: boolean) => (backgroundHasChanged.value = value),
    updateVirtualStream: (value: MediaStream | null) => (virtualStream.value = value),
    updateMainCanvas: (value: HTMLCanvasElement | null) => (mainCanvas.value = value),
    updatePrevKeepBackground: (value: boolean) => (prevKeepBackground.value = value),
    updateAppliedBackground: (value: boolean) => (appliedBackground.value = value),
    updateIsBackgroundModalVisible,
    updateAutoClickBackground: (value: boolean) => (autoClickBackground.value = value),
    updateBreakoutRooms: (value: BreakoutParticipant[][]) => (breakoutRooms.value = value),
    updateCurrentRoomIndex: (value: number) => (currentRoomIndex.value = value),
    updateCanStartBreakout: (value: boolean) => (canStartBreakout.value = value),
    updateBreakOutRoomStarted: (value: boolean) => (breakOutRoomStarted.value = value),
    updateBreakOutRoomEnded: (value: boolean) => (breakOutRoomEnded.value = value),
    updateHostNewRoom: (value: number) => (hostNewRoom.value = value),
    updateLimitedBreakRoom: (value: BreakoutParticipant[]) => (limitedBreakRoom.value = value),
    updateMainRoomsLength: (value: number) => (mainRoomsLength.value = value),
    updateMemberRoom: (value: number) => (memberRoom.value = value),
    updateIsBreakoutRoomsModalVisible,
    updateWhiteboardUsers: (value: WhiteboardUser[]) => (whiteboardUsers.value = value),
    updateCurrentWhiteboardIndex: (value: number | null) => (currentWhiteboardIndex.value = value),
    updateCanStartWhiteboard: (value: boolean) => (canStartWhiteboard.value = value),
    updateWhiteboardStarted: (value: boolean) => (whiteboardStarted.value = value),
    updateWhiteboardEnded: (value: boolean) => (whiteboardEnded.value = value),
    updateWhiteboardLimit: (value: number) => (whiteboardLimit.value = value),
    updateIsWhiteboardModalVisible: (value: boolean) => (isWhiteboardModalVisible.value = value),
    updateIsConfigureWhiteboardModalVisible,
    updateShapes: updateShapesValue,
    updateUseImageBackground: (value: boolean) => (useImageBackground.value = value),
    updateRedoStack: updateRedoStackValue,
    updateUndoStack: (value: string[]) => (undoStack.value = value),
    updateCanvasStream: (value: MediaStream | null) => (canvasStream.value = value),
    updateCanvasWhiteboard: (value: HTMLCanvasElement | null) => (canvasWhiteboard.value = value),
    updateCanvasScreenboard: (value: HTMLCanvasElement | null) => (canvasScreenboard.value = value),
    updateProcessedScreenStream: (value: MediaStream | null) => (processedScreenStream.value = value),
    updateAnnotateScreenStream: (value: boolean) => (annotateScreenStream.value = value),
    updateMainScreenCanvas: (value: HTMLCanvasElement | null) => (mainScreenCanvas.value = value),
    updateIsScreenboardModalVisible,
    checkOrientation,
    updateDevice: (value: Device | null) => (device.value = value),
    updateSocket: (value: MediaSFUSocket) => (socket.value = value),
    updateLocalSocket: (value: MediaSFUSocket | null) => (localSocket.value = value),
    updateValidated: (value: boolean) => (validated.value = value),
    showAlert,
    getUpdatedAllParams,
    videoCardComponent: VideoCardComponentOverride.value as typeof VideoCard,
    audioCardComponent: AudioCardComponentOverride.value as typeof AudioCard,
    miniCardComponent: MiniCardComponentOverride.value as typeof MiniCard,
    miniAudioComponent: MiniAudioComponentOverride.value as typeof MiniAudio,
    miniAudioPlayerComponent: MiniAudioPlayerComponent.value as typeof MiniAudioPlayer,
    customVideoCard: customVideoCardRenderer.value,
    customAudioCard: customAudioCardRenderer.value,
    customMiniCard: customMiniCardRenderer.value,
    customPreJoinPage: customPreJoinPageRenderer.value,
    customComponent: customComponentRenderer.value,
  };
};

// Computed property for all parameters
const allParameters = computed(() => ({
  ...getAllParams(),
  ...mediaSFUFunctions(),
}));

// Helper function to cast parameters for external methods  
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getCastedParameters = (): any => allParameters.value;

const whiteboardParameters = computed<WhiteboardComponentParameters>(() => {
  const params = allParameters.value as unknown as WhiteboardComponentParameters;

  return {
    ...params,
    showAlert: ({ message, type }: { message: string; type: string }) => showAlert({ message, type }),
    shapes: convertSharedShapesToWhiteboard(shapes.value),
    redoStack: convertSharedShapesToWhiteboard(redoStack.value),
    updateShapes: (value: WhiteboardShape[]) => updateShapesValue(value),
    updateRedoStack: (value: WhiteboardShape[]) => updateRedoStackValue(value),
  };
});

// Utility functions
const getMediaDevicesList = async (kind: 'videoinput' | 'audioinput') => {
  // Get the list of available media devices
  try {
    const devices = await mediaDevices.enumerateDevices();
    const filtered = devices.filter((device: MediaDeviceInfo) => device.kind === kind);
    return filtered;
  } catch {
    return [];
  }
};

const getParticipantMedia = async (id: string = '', name: string, kind: string = 'video') => {
  // Get the media stream of a participant by id or name
  try {
    let stream = null;

    if (id && id !== '') {
      if (kind === 'video') {
        const videoStreamObj = (allVideoStreams.value as (Participant | Stream)[]).find(
          (obj) => 'producerId' in obj && obj.producerId === id
        );
        if (videoStreamObj && 'stream' in videoStreamObj) {
          stream = videoStreamObj.stream;
        }
      } else if (kind === 'audio') {
        const audioStreamObj = (allAudioStreams.value as (Participant | Stream)[]).find(
          (obj) => 'producerId' in obj && obj.producerId === id
        );
        if (audioStreamObj && 'stream' in audioStreamObj) {
          stream = audioStreamObj.stream;
        }
      }
    } else if (name && name !== '') {
      const participant = participants.value.find((part: Participant) => part.name === name);
      if (participant) {
        const participantId = participant.id;
        if (kind === 'video') {
          const videoStreamObj = (allVideoStreams.value as (Participant | Stream)[]).find(
            (obj) => 'producerId' in obj && obj.producerId === participantId
          );
          if (videoStreamObj && 'stream' in videoStreamObj) {
            stream = videoStreamObj.stream;
          }
        } else if (kind === 'audio') {
          const audioStreamObj = (allAudioStreams.value as (Participant | Stream)[]).find(
            (obj) => 'producerId' in obj && obj.producerId === participantId
          );
          if (audioStreamObj && 'stream' in audioStreamObj) {
            stream = audioStreamObj.stream;
          }
        }
      }
    }

    return stream;
  } catch {
    return null;
  }
};

const computeDimensionsMethod = ({
  containerWidthFraction = 1,
  containerHeightFraction = 1,
  mainSize,
  doStack = true,
  defaultFraction,
}: {
  containerWidthFraction?: number;
  containerHeightFraction?: number;
  mainSize: number;
  doStack?: boolean;
  defaultFraction: number;
}): ComponentSizes => {
  const parentWidth = window.innerWidth * containerWidthFraction;
  const parentHeight = window.innerHeight * containerHeightFraction * defaultFraction;
  let isWideScreen_ = parentWidth >= 768;
  if (!isWideScreen_ && parentWidth > 1.5 * parentHeight) {
    isWideScreen_ = true;
  }

  isWideScreen.value = isWideScreen_;

  const computeDimensions = (): ComponentSizes => {
    if (doStack) {
      return isWideScreen_
        ? {
            mainHeight: parentHeight,
            otherHeight: parentHeight,
            mainWidth: Math.floor((mainSize / 100) * parentWidth),
            otherWidth: Math.floor(((100 - mainSize) / 100) * parentWidth),
          }
        : {
            mainHeight: Math.floor((mainSize / 100) * parentHeight),
            otherHeight: Math.floor(((100 - mainSize) / 100) * parentHeight),
            mainWidth: parentWidth,
            otherWidth: parentWidth,
          };
    } else {
      return {
        mainHeight: parentHeight,
        otherHeight: parentHeight,
        mainWidth: parentWidth,
        otherWidth: parentWidth,
      };
    }
  };

  return computeDimensions();
};

const applyComponentSizes = (defaultFraction: number) => {
  if (eventType.value === 'chat' && mainHeightWidth.value > 0) {
    mainHeightWidth.value = 0;
  }
  if (eventType.value === 'broadcast' && mainHeightWidth.value !== 100) {
    mainHeightWidth.value = 100;
  }

  const { mainHeight, otherHeight, mainWidth, otherWidth } = computeDimensionsMethod({
    containerWidthFraction: 1,
    containerHeightFraction: 1,
    mainSize: eventType.value === 'chat' ? 0 : eventType.value === 'broadcast' ? 100 : mainHeightWidth.value,
    doStack: true,
    defaultFraction,
  });

  componentSizes.value = {
    mainHeight,
    otherHeight,
    mainWidth,
    otherWidth,
  };

  const orientation = checkOrientation();
  if (
    orientation === 'portrait' &&
    !isWideScreen.value &&
    (shareScreenStarted.value || shared.value)
  ) {
    screenForceFullDisplay.value = true;
  }
};

const handleResize = async () => {
  let fraction = 0.0;

  if (eventType.value === 'webinar' || eventType.value === 'conference') {
    const currentHeight = window.innerHeight;
    fraction = Number((40 / currentHeight).toFixed(3));
    if (fraction !== controlHeight.value) {
      controlHeight.value = fraction;
    }
  } else {
    const currentHeight = window.innerHeight;
    fraction = Number((40 / currentHeight).toFixed(3));
    if (fraction !== controlHeight.value) {
      controlHeight.value = fraction;
    }
  }

  const defaultFraction =
    eventType.value === 'webinar' || eventType.value === 'conference' ? 1 - fraction : 1;

  applyComponentSizes(defaultFraction);

  // Updates the main grid view
  await prepopulateUserMedia({
    name: hostLabel.value,
    parameters: getCastedParameters(),
  });

  // Updates the mini grid view
  await onScreenChanges({
    changed: true,
    parameters: getCastedParameters(),
  });
};

const onResize = () => {
  scheduleResize();
};

const updateStatesToInitialValues = async () => {
  const initialValues = initialValuesState as unknown as Record<string, unknown>;
  const allParams = getAllParams() as unknown as Record<string, (value: unknown) => void>;

  for (const key in initialValues) {
    if (Object.prototype.hasOwnProperty.call(initialValues, key)) {
      const updateFunctionName = `update${key.charAt(0).toUpperCase() + key.slice(1)}`;
      const updateFunction = allParams[updateFunctionName];

      if (typeof updateFunction === 'function') {
        try {
          updateFunction(initialValues[key]);
        } catch {
          // Do nothing
        }
      }
    }
  }
};

// Control button configurations (framework-agnostic)
const recordButton = computed<ControlButtonTouch[]>(() => [
  {
    icon: faRecordVinyl,
    text: 'Record',
    onPress: () => {
      launchRecording({
        updateIsRecordingModalVisible,
        isRecordingModalVisible: isRecordingModalVisible.value,
        showAlert,
        stopLaunchRecord: stopLaunchRecord.value,
        canLaunchRecord: canLaunchRecord.value,
        recordingAudioSupport: recordingAudioSupport.value,
        recordingVideoSupport: recordingVideoSupport.value,
        updateCanRecord: (value: boolean) => (canRecord.value = value),
        updateClearedToRecord: (value: boolean) => (clearedToRecord.value = value),
        recordStarted: recordStarted.value,
        recordPaused: recordPaused.value,
        localUIMode: props.useLocalUIMode,
      });
    },
    activeColor: 'black',
    inActiveColor: 'black',
    show: true,
  },
]);

const recordButtons = computed<ControlButtonTouch[]>(() => [
  {
    icon: faPlayCircle,
    active: recordPaused.value === false,
    onPress: () => {
      updateRecording({
  parameters: getCastedParameters(),
      });
    },
    activeColor: 'black',
    inActiveColor: 'black',
    alternateIcon: faPauseCircle,
    show: true,
  },
  {
    icon: faStopCircle,
    active: false,
    onPress: () => {
      stopRecording({
  parameters: getCastedParameters(),
      });
    },
    activeColor: 'green',
    inActiveColor: 'black',
    show: true,
  },
  {
    customComponent: () =>
      h(
        'div',
        {
          style: {
            backgroundColor: 'transparent',
            borderWidth: 0,
            padding: 0,
            margin: 2,
          },
        },
        h(
          'span',
          {
            style: {
              backgroundColor: 'transparent',
              borderWidth: 0,
              padding: 0,
              margin: 0,
            },
          },
          recordingProgressTime.value
        )
      ),
    show: true,
  },
  {
    icon: faDotCircle,
    active: false,
    onPress: () => console.log('Status pressed'),
    activeColor: 'black',
    inActiveColor: recordPaused.value === false ? 'red' : 'yellow',
    show: true,
  },
  {
    icon: faCog,
    active: false,
    onPress: () => {
      launchRecording({
        updateIsRecordingModalVisible,
        isRecordingModalVisible: isRecordingModalVisible.value,
        showAlert,
        stopLaunchRecord: stopLaunchRecord.value,
        canLaunchRecord: canLaunchRecord.value,
        recordingAudioSupport: recordingAudioSupport.value,
        recordingVideoSupport: recordingVideoSupport.value,
        updateCanRecord: (value: boolean) => (canRecord.value = value),
        updateClearedToRecord: (value: boolean) => (clearedToRecord.value = value),
        recordStarted: recordStarted.value,
        recordPaused: recordPaused.value,
        localUIMode: props.useLocalUIMode,
      });
    },
    activeColor: 'green',
    inActiveColor: 'black',
    show: true,
  },
]);

const customMenuButtons = computed<MenuCustomButton[]>(() => [
  {
    icon: faRecordVinyl,
    text: 'Record',
    action: () => {
      launchRecording({
        updateIsRecordingModalVisible,
        isRecordingModalVisible: isRecordingModalVisible.value,
        showAlert,
        stopLaunchRecord: stopLaunchRecord.value,
        canLaunchRecord: canLaunchRecord.value,
        recordingAudioSupport: recordingAudioSupport.value,
        recordingVideoSupport: recordingVideoSupport.value,
        updateCanRecord: (value: boolean) => (canRecord.value = value),
        updateClearedToRecord: (value: boolean) => (clearedToRecord.value = value),
        recordStarted: recordStarted.value,
        recordPaused: recordPaused.value,
        localUIMode: props.useLocalUIMode,
      });
    },
    show: !showRecordButtons.value && islevel.value === '2',
  },
  {
    customComponent: () =>
      h(menuButtonsRendererComponent.value, {
        buttons: recordButtons.value,
        direction: 'horizontal',
        showAspect: true,
      }),
    show: showRecordButtons.value && islevel.value === '2',
    action: () => {
      console.log('record buttons pressed');
    },
  },
  {
    icon: faCog,
    text: 'Event Settings',
    action: () => {
      launchSettings({
        updateIsSettingsModalVisible,
        isSettingsModalVisible: isSettingsModalVisible.value,
      });
    },
    show: islevel.value === '2',
  },
  {
    icon: faUsers,
    text: 'Requests',
    action: () => {
      launchRequests({
        updateIsRequestsModalVisible,
        isRequestsModalVisible: isRequestsModalVisible.value,
      });
    },
    show:
      islevel.value === '2' ||
      (coHostResponsibility.value &&
        coHost.value &&
        coHost.value === member.value &&
        !!coHostResponsibility.value.find((item) => item.name === 'media')!.value === true) ||
      false,
  },
  {
    icon: faClock,
    text: 'Waiting',
    action: () => {
      launchWaiting({
        updateIsWaitingModalVisible,
        isWaitingModalVisible: isWaitingModalVisible.value,
      });
    },
    show:
      islevel.value === '2' ||
      (coHostResponsibility.value &&
        coHost.value &&
        coHost.value === member.value &&
        !!coHostResponsibility.value.find((item) => item.name === 'waiting')!.value === true) ||
      false,
  },
  {
    icon: faUserPlus,
    text: 'Co-host',
    action: () => {
      launchCoHost({
        updateIsCoHostModalVisible,
        isCoHostModalVisible: isCoHostModalVisible.value,
      });
    },
    show: islevel.value === '2',
  },
  {
    icon: faTools,
    text: 'Set Media',
    action: () => {
      launchMediaSettings({
        updateIsMediaSettingsModalVisible,
        isMediaSettingsModalVisible: isMediaSettingsModalVisible.value,
        audioInputs: audioInputs.value,
        videoInputs: videoInputs.value,
        updateAudioInputs: (value: MediaDeviceInfo[]) => (audioInputs.value = value),
        updateVideoInputs: (value: MediaDeviceInfo[]) => (videoInputs.value = value),
        mediaDevices,
      });
    },
    show: true,
  },
  {
    icon: faDesktop,
    text: 'Display',
    action: () => {
      launchDisplaySettings({
        updateIsDisplaySettingsModalVisible,
        isDisplaySettingsModalVisible: isDisplaySettingsModalVisible.value,
      });
    },
    show: true,
  },
  {
    icon: faPoll,
    text: 'Poll',
    action: () => {
      launchPoll({
        updateIsPollModalVisible,
        isPollModalVisible: isPollModalVisible.value,
      });
    },
    show: true,
  },
  {
    icon: faUserFriends,
    text: 'Breakout Rooms',
    action: () => {
      launchBreakoutRooms({
        updateIsBreakoutRoomsModalVisible,
        isBreakoutRoomsModalVisible: isBreakoutRoomsModalVisible.value,
      });
    },
    show: islevel.value === '2',
  },
  {
    icon: faChalkboardTeacher,
    text: 'Whiteboard',
    action: () => {
      launchConfigureWhiteboard({
        updateIsConfigureWhiteboardModalVisible,
        isConfigureWhiteboardModalVisible: isConfigureWhiteboardModalVisible.value,
      });
    },
    show: islevel.value === '2',
  },
]);

const controlBroadcastButtons = computed<ControlButtonTouch[]>(() => [
  {
    icon: faUsers,
    active: true,
    alternateIcon: faUsers,
    onPress: () => {
      launchParticipants({
        updateIsParticipantsModalVisible,
        isParticipantsModalVisible: isParticipantsModalVisible.value,
      });
    },
    activeColor: 'black',
    inActiveColor: 'black',
    show: islevel.value === '2',
  },
  {
    icon: faShareAlt,
    active: true,
    alternateIcon: faShareAlt,
    onPress: () => updateIsShareEventModalVisible(!isShareEventModalVisible.value),
    activeColor: 'black',
    inActiveColor: 'black',
    show: true,
  },
  {
    customComponent: () =>
      h('div', { style: { position: 'relative' } }, [
        h(FontAwesomeIcon, { icon: faComments, size: 'lg', color: 'black' }),
        showMessagesBadge.value &&
          h(
            'div',
            {
              style: {
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            },
            h(
              'div',
              {
                style: {
                  backgroundColor: 'red',
                  borderRadius: '12px',
                  padding: '4px',
                },
              },
              h('span', { style: { color: 'white', fontSize: '12px', fontWeight: 'bold' } })
            )
          ),
      ]),
    onPress: () =>
      launchMessages({
        updateIsMessagesModalVisible,
        isMessagesModalVisible: isMessagesModalVisible.value,
      }),
    show: true,
  },
  {
    icon: faSync,
    active: true,
    alternateIcon: faSync,
    onPress: () =>
      switchVideoAlt({
  parameters: getCastedParameters(),
      }),
    activeColor: 'black',
    inActiveColor: 'black',
    show: islevel.value === '2',
  },
  {
    icon: faVideoSlash,
    alternateIcon: faVideo,
    active: videoActive.value,
    onPress: () =>
      clickVideo({
  parameters: getCastedParameters(),
      }),
    show: islevel.value === '2',
    activeColor: 'green',
    inActiveColor: 'red',
  },
  {
    icon: faMicrophoneSlash,
    alternateIcon: faMicrophone,
    active: micActive.value,
    onPress: () =>
      clickAudio({
  parameters: getCastedParameters(),
      }),
    activeColor: 'green',
    inActiveColor: 'red',
    show: islevel.value === '2',
  },
  {
    customComponent: () =>
      h(
        'div',
        {
          style: {
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0',
            margin: '5px',
          },
        },
        [
          h(FontAwesomeIcon, { icon: faChartBar, size: 'lg', color: 'black' }),
          h(
            'span',
            {
              style: {
                backgroundColor: 'transparent',
                padding: '0',
                margin: '0',
              },
            },
            participantsCounter.value.toString()
          ),
        ]
      ),
    show: true,
  },
  {
    icon: faPhone,
    active: endCallActive.value,
    onPress: () =>
      launchConfirmExit({
        updateIsConfirmExitModalVisible,
        isConfirmExitModalVisible: isConfirmExitModalVisible.value,
      }),
    activeColor: 'green',
    inActiveColor: 'red',
    show: true,
  },
  {
    icon: faPhone,
    active: false,
    onPress: () => undefined,
    activeColor: 'transparent',
    inActiveColor: 'transparent',
    backgroundColor: { default: 'transparent' },
    show: false,
  },
]);

const controlChatButtons = computed<ControlButtonTouch[]>(() => [
  {
    icon: faShareAlt,
    active: true,
    alternateIcon: faShareAlt,
    onPress: () => updateIsShareEventModalVisible(!isShareEventModalVisible.value),
    activeColor: 'black',
    inActiveColor: 'black',
    show: true,
  },
  {
    customComponent: () =>
      h('div', { style: { position: 'relative' } }, [
        h(FontAwesomeIcon, { icon: faComments, size: 'lg', color: 'black' }),
        showMessagesBadge.value &&
          h(
            'div',
            {
              style: {
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            },
            h(
              'div',
              {
                style: {
                  backgroundColor: 'red',
                  borderRadius: '12px',
                  padding: '4px',
                },
              },
              h('span', { style: { color: 'white', fontSize: '12px', fontWeight: 'bold' } })
            )
          ),
      ]),
    onPress: () =>
      launchMessages({
        updateIsMessagesModalVisible,
        isMessagesModalVisible: isMessagesModalVisible.value,
      }),
    show: true,
  },
  {
    icon: faSync,
    active: true,
    alternateIcon: faSync,
    onPress: () =>
      switchVideoAlt({
  parameters: getCastedParameters(),
      }),
    activeColor: 'black',
    inActiveColor: 'black',
    show: true,
  },
  {
    icon: faVideoSlash,
    alternateIcon: faVideo,
    active: videoActive.value,
    onPress: () =>
      clickVideo({
  parameters: getCastedParameters(),
      }),
    activeColor: 'green',
    inActiveColor: 'red',
    show: true,
  },
  {
    icon: faMicrophoneSlash,
    alternateIcon: faMicrophone,
    active: micActive.value,
    onPress: () =>
      clickAudio({
  parameters: getCastedParameters(),
      }),
    activeColor: 'green',
    inActiveColor: 'red',
    show: true,
  },
  {
    icon: faPhone,
    active: endCallActive.value,
    onPress: () =>
      launchConfirmExit({
        updateIsConfirmExitModalVisible,
        isConfirmExitModalVisible: isConfirmExitModalVisible.value,
      }),
    activeColor: 'green',
    inActiveColor: 'red',
    show: true,
  },
]);

const controlButtons = computed<ControlButton[]>(() => [
  {
    icon: faMicrophoneSlash,
    alternateIcon: faMicrophone,
    active: micActive.value,
    onPress: () =>
      clickAudio({
  parameters: getCastedParameters(),
      }),
    activeColor: 'green',
    inActiveColor: 'red',
    disabled: audioSwitching.value,
    show: true,
  },
  {
    icon: faVideoSlash,
    alternateIcon: faVideo,
    active: videoActive.value,
    onPress: () =>
      clickVideo({
  parameters: getCastedParameters(),
      }),
    activeColor: 'green',
    inActiveColor: 'red',
    disabled: videoSwitching.value,
    show: true,
  },
  {
    icon: faDesktop,
    alternateIconComponent: () =>
      h('div', { style: { position: 'relative', display: 'inline-block' } }, [
        h(FontAwesomeIcon, {
          icon: faDesktop,
          size: 'lg',
          style: { color: !screenShareActive.value ? 'black' : 'green' },
        }),
        !screenShareActive.value &&
          h(FontAwesomeIcon, {
            icon: faBan,
            size: 'lg',
            style: {
              color: 'red',
              position: 'absolute',
              top: 0,
              right: 0,
            },
          }),
      ]),
    active: true,
    onPress: () => {
      clickScreenShare({
  parameters: getCastedParameters(),
      });
    },
    activeColor: 'green',
    inActiveColor: 'red',
    disabled: false,
    show: true,
  },
  {
    icon: faPhone,
    active: endCallActive.value,
    onPress: () =>
      launchConfirmExit({
        updateIsConfirmExitModalVisible,
        isConfirmExitModalVisible: isConfirmExitModalVisible.value,
      }),
    activeColor: 'green',
    inActiveColor: 'red',
    disabled: false,
    show: true,
  },
  {
    icon: faUsers,
    active: participantsActive.value,
    onPress: () =>
      launchParticipants({
        updateIsParticipantsModalVisible,
        isParticipantsModalVisible: isParticipantsModalVisible.value,
      }),
    activeColor: 'black',
    inActiveColor: 'black',
    disabled: false,
    show: true,
  },
  {
    customComponent: () =>
      h('div', { style: { position: 'relative' } }, [
        h(FontAwesomeIcon, { icon: faBars, size: 'lg', color: 'black' }),
        h(
          'div',
          {
            style: {
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          },
          h(
            'div',
            {
              style: {
                backgroundColor: 'red',
                borderRadius: '50%',
                padding: '4px',
                minWidth: '8px',
                minHeight: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            },
            h('span', { style: { color: 'white', fontSize: '10px', fontWeight: 'bold' } }, totalReqWait.value.toString())
          )
        ),
      ]),
    onPress: () =>
      launchMenuModal({
        updateIsMenuModalVisible,
        isMenuModalVisible: isMenuModalVisible.value,
      }),
    show: true,
  },
  {
    customComponent: () =>
      h('div', { style: { position: 'relative' } }, [
        h(FontAwesomeIcon, { icon: faComments, size: 'lg', color: 'black' }),
        showMessagesBadge.value &&
          h(
            'div',
            {
              style: {
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            },
            h(
              'div',
              {
                style: {
                  backgroundColor: 'red',
                  borderRadius: '50%',
                  padding: '4px',
                  minWidth: '8px',
                  minHeight: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              },
              h('span', { style: { color: 'white', fontSize: '10px', fontWeight: 'bold', lineHeight: '1' } }, '*')
            )
          ),
      ]),
    onPress: () =>
      launchMessages({
        updateIsMessagesModalVisible,
        isMessagesModalVisible: isMessagesModalVisible.value,
      }),
    show: true,
  },
]);

// Function to join room using socket
async function joinRoom(data: {
  socket: MediaSFUSocket;
  roomName: string;
  islevel: string;
  member: string;
  sec: string;
  apiUserName: string;
}): Promise<ResponseJoinRoom | null> {
  const { socket: sock, roomName: room, islevel: level, member: mem, sec, apiUserName: apiUser } = data;
  try {
    const response = await joinRoomClient({
      socket: sock,
      roomName: room,
      islevel: level,
      member: mem,
      sec,
      apiUserName: apiUser,
    });
    return response;
  } catch (error) {
    console.log('error', error);
    throw new Error(
      'Failed to join the room. Please check your connection and try again.'
    );
  }
}

// Function to join room and get data from server
async function join_Room({
  socket: sock,
  roomName: room,
  islevel: level,
  member: mem,
  sec,
  apiUserName: apiUser,
  isLocal = false,
}: {
  socket: MediaSFUSocket;
  roomName: string;
  islevel: string;
  member: string;
  sec: string;
  apiUserName: string;
  isLocal?: boolean;
}): Promise<void> {
  let data: ResponseJoinRoom | null;

  if (!isLocal) {
    data = await joinRoom({
      socket: sock,
      roomName: room,
      islevel: level,
      member: mem,
      sec,
      apiUserName: apiUser,
    });
  } else {
    const localData: ResponseJoinLocalRoom = await joinLocalRoom({
      socket: sock,
      roomName: room,
      islevel: level,
      member: mem,
      sec,
      apiUserName: apiUser,
      parameters: {
        imgSrc: props.imgSrc,
        showAlert,
        updateIsLoadingModalVisible: (value: boolean) => (isLoadingModalVisible.value = value),
        connectSocket,
        connectLocalSocket,
        updateSocket: (value: MediaSFUSocket) => (socket.value = value),
        updateLocalSocket: (value: MediaSFUSocket | null) => (localSocket.value = value),
        updateValidated: (value: boolean) => (validated.value = value),
        updateApiUserName: (value: string) => (apiUserName.value = value),
        updateApiToken: (value: string) => (apiToken.value = value),
        updateLink: (value: string) => (link.value = value),
        updateRoomName: (value: string) => (roomName.value = value),
        updateMember: (value: string) => (member.value = value),
      },
      checkConnect:
        props.localLink.length > 0 &&
        props.connectMediaSFU === true &&
        !link.value.includes('mediasfu.com'),
      localLink: props.localLink,
      joinMediaSFURoom: props.joinMediaSFURoom,
    });

    data = await createResponseJoinRoom({ localRoom: localData });
  }

  async function updateAndComplete(data: ResponseJoinRoom) {
    try {
      if (!data.roomRecvIPs || (data.roomRecvIPs && data.roomRecvIPs.length === 0)) {
        data.roomRecvIPs = ['none'];
        if (
          link.value !== '' &&
          link.value.includes('mediasfu.com') &&
          !isLocal
        ) {
          await receiveAllPipedTransports({
            community: true,
            nsock: getUpdatedAllParams().socket,
            parameters: getCastedParameters(),
          });
        }
      }

      try {
        updateRoomParametersClient({
          parameters: {
            ...allParameters.value,
            data: data,
          },
        });
      } catch {
        // Handle error
      }

      if (data.isHost) {
        islevel.value = '2';
      } else {
        if (islevel.value !== '2') {
          islevel.value = '1';
        }
      }

      if (data.secureCode && data.secureCode !== '') {
        adminPasscode.value = data.secureCode;
      }

      if (data.rtpCapabilities) {
        try {
          const device_ = await createDeviceClient({
            rtpCapabilities: data.rtpCapabilities as unknown as RtpCapabilities,
          });

          if (device_) {
            device.value = device_;
          }
        } catch (error) {
          console.log('error Device', error);
        }
      }
    } catch (error) {
      console.log('error updateRoomParametersClient', error);
    }
  }

  if (data && data.success) {
    if (
      link.value !== '' &&
      link.value.includes('mediasfu.com') &&
      isLocal
    ) {
      roomData.value = data;
      return;
    } else if (
      link.value !== '' &&
      link.value.includes('mediasfu.com') &&
      !isLocal
    ) {
      if (roomData.value) {
        roomData.value.recordingParams = data.recordingParams;
        roomData.value.meetingRoomParams = data.meetingRoomParams;
      } else {
        roomData.value = data;
      }
    } else {
      roomData.value = data;
      if (!link.value.includes('mediasfu.com')) {
        roomData.value.meetingRoomParams = data.meetingRoomParams;
      }
    }

    await updateAndComplete(data);
  } else {
    if (
      link.value !== '' &&
      link.value.includes('mediasfu.com') &&
      !isLocal
    ) {
      await updateAndComplete(roomData.value!);
      return;
    }

    try {
      if (showAlert) {
        showAlert({ message: data!.reason!, type: 'danger', duration: 3000 });
      }
    } catch {
      // Handle error
    }
  }
}

// Function to disconnect all sockets
async function disconnectAllSockets(consumeSockets: ConsumeSocket[]): Promise<void> {
  for (const socket of consumeSockets) {
    try {
      const ip = Object.keys(socket)[0];
      if (ip && (socket)[ip]) {
        (socket)[ip].disconnect();
      }
    } catch (error) {
      console.log(
        `Error disconnecting socket with IP: ${Object.keys(socket)[0]}`,
        error
      );
    }
  }
}

const stopMediaStreamTracks = (stream: MediaStream | null | undefined) => {
  if (!stream) {
    return;
  }

  try {
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch (error) {
        console.log('error stopping track', error);
      }
    });
  } catch (error) {
    console.log('error stopping media stream', error);
  }
};

const clearCanvasElement = (canvas: HTMLCanvasElement | null | undefined) => {
  if (!canvas) {
    return;
  }

  try {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width ?? 0, canvas.height ?? 0);
    }
  } catch (error) {
    console.log('error clearing canvas', error);
  }
};

const resetRuntimeArtifacts = () => {
  stopMediaStreamTracks(localStream.value);
  stopMediaStreamTracks(localStreamAudio.value);
  stopMediaStreamTracks(localStreamVideo.value);
  stopMediaStreamTracks(localStreamScreen.value);
  stopMediaStreamTracks(segmentVideo.value);
  stopMediaStreamTracks(processedStream.value);
  stopMediaStreamTracks(virtualStream.value);
  stopMediaStreamTracks(processedScreenStream.value);
  stopMediaStreamTracks(canvasStream.value);

  if (recordTimerInterval.value) {
    clearInterval(recordTimerInterval.value);
    recordTimerInterval.value = null;
  }

  clearCanvasElement(mainCanvas.value ?? null);
  clearCanvasElement(canvasWhiteboard.value ?? null);
  clearCanvasElement(canvasScreenboard.value ?? null);
  clearCanvasElement(mainScreenCanvas.value ?? null);

  componentUpdateQueue.length = 0;
  isProcessingComponentUpdates = false;
  resizeScheduled = false;
  resizeQueued = false;
  resizeInProgress = false;

  autoRenderableKey = 0;
  if (typeof missingReactComponentWarnings.clear === 'function') {
    missingReactComponentWarnings.clear();
  }

  micActive.value = false;
  videoActive.value = false;
  screenShareActive.value = false;
};

// Function to close and reset
async function closeAndReset() {
  updateIsMessagesModalVisible(false);
  updateIsParticipantsModalVisible(false);
  updateIsWaitingModalVisible(false);
  updateIsRequestsModalVisible(false);
  updateIsCoHostModalVisible(false);
  updateIsSettingsModalVisible(false);
  updateIsDisplaySettingsModalVisible(false);
  updateIsMediaSettingsModalVisible(false);
  updateIsMenuModalVisible(false);
  updateIsShareEventModalVisible(false);
  updateIsConfirmExitModalVisible(false);
  
  await disconnectAllSockets(consume_sockets.value);
  await updateStatesToInitialValues();
  
  meetingProgressTime.value = '00:00:00';
  meetingElapsedTime.value = 0;
  recordingProgressTime.value = '00:00:00';
  recordElapsedTime.value = 0;
  showRecordButtons.value = false;

  updateIsConfigureWhiteboardModalVisible(false);
  updateIsWhiteboardModalVisible(false);
  updateIsMenuModalVisible(false);
  updateIsRecordingModalVisible(false);
  updateIsPollModalVisible(false);
  updateIsBreakoutRoomsModalVisible(false);
  updateIsBackgroundModalVisible(false);
  updateIsLoadingModalVisible(false);
  updateIsConfirmHereModalVisible(false);

  setTimeout(async function () {
    validated.value = false;
    resetRuntimeArtifacts();
  }, 500);

  try {
    if (props.updateSourceParameters) {
      props.updateSourceParameters(allParameters.value);
    }
  } catch {
    console.log('error updateSourceParameters during reset');
  }
}

// Function to connect socket and attach event listeners
async function connect_Socket(
  apiUser: string,
  token: string,
  skipSockets: boolean = false
): Promise<MediaSFUSocket | null> {
  const socketDefault = socket.value as unknown as MediaSFUSocket;
  const socketAlt = (
    props.connectMediaSFU && localSocket.value && localSocket.value.id
      ? localSocket.value
      : socketDefault
  )! as unknown as MediaSFUSocket;

  if (socketDefault.id) {
    if (!skipSockets) {
      socketDefault.on('disconnect', async () => {
        await disconnect({
          showAlert,
          redirectURL: redirectURL.value,
          onWeb: true,
          updateValidated: (value: boolean) => (validated.value = value),
        });
        
        if (videoAlreadyOn.value) {
          await clickVideo({
            parameters: getCastedParameters(),
          });
        }
        if (audioAlreadyOn.value) {
          await clickAudio({
            parameters: getCastedParameters(),
          });
        }

        await closeAndReset();
      });

      socketDefault.on('allMembers', async (membersData: AllMembersData) => {
        if (membersData) {
          await allMembers({
            apiUserName: apiUser,
            apiKey: '',
            apiToken: token,
            members: membersData.members,
            requestss: membersData.requests ? membersData.requests : requestList.value,
            coHoste: membersData.coHost ? membersData.coHost : coHost.value,
            coHostRes: membersData.coHostResponsibilities
              ? membersData.coHostResponsibilities
              : coHostResponsibility.value,
            parameters: getCastedParameters(),
            consume_sockets: consume_sockets.value,
          });
        }
      });

      socketDefault.on('allMembersRest', async (membersData: AllMembersRestData) => {
        if (membersData) {
          await allMembersRest({
            apiUserName: apiUser,
            apiKey: '',
            members: membersData.members,
            apiToken: token,
            settings: membersData.settings,
            coHoste: membersData.coHost ? membersData.coHost : coHost.value,
            coHostRes: membersData.coHostResponsibilities
              ? membersData.coHostResponsibilities
              : coHostResponsibility.value,
            parameters: getCastedParameters(),
            consume_sockets: consume_sockets.value,
          });
        }
      });

      socketDefault.on('userWaiting', async ({ name }: { name: string }) => {
        await userWaiting({
          name,
          showAlert,
          totalReqWait: totalReqWait.value,
          updateTotalReqWait: (value: number) => (totalReqWait.value = value),
        });
      });

      socketDefault.on('personJoined', async ({ name }: { name: string }) => {
        await personJoined({
          name,
          showAlert,
        });
      });

      socketDefault.on('allWaitingRoomMembers', async (waiting_data: AllWaitingRoomMembersData) => {
        await allWaitingRoomMembers({
          waitingParticipants: waiting_data.waitingParticipants
            ? waiting_data.waitingParticipants
            : waiting_data.waitingParticipantss
            ? waiting_data.waitingParticipantss
            : waitingRoomList.value,
          updateTotalReqWait: (value: number) => (totalReqWait.value = value),
          updateWaitingRoomList,
        });
      });

      socketDefault.on('ban', async ({ name }: { name: string }) => {
        await banParticipant({
          name,
          parameters: getCastedParameters(),
        });
      });

      socketDefault.on('updatedCoHost', async (cohost_data: UpdatedCoHostData) => {
        await updatedCoHost({
          coHost: cohost_data.coHost ? cohost_data.coHost : coHost.value,
          coHostResponsibility: cohost_data.coHostResponsibilities
            ? cohost_data.coHostResponsibilities
            : coHostResponsibility.value,
          youAreCoHost: youAreCoHost.value,
          updateCoHost,
          updateCoHostResponsibility,
          updateYouAreCoHost: (value: boolean) => (youAreCoHost.value = value),
          showAlert,
          eventType: eventType.value,
          islevel: islevel.value,
          member: member.value,
        });
      });

      socketDefault.on('participantRequested', async ({ userRequest }: { userRequest: Request }) => {
        await participantRequested({
          userRequest,
          requestList: requestList.value,
          waitingRoomList: waitingRoomList.value,
          updateTotalReqWait: (value: number) => (totalReqWait.value = value),
          updateRequestList,
        });
      });

      socketDefault.on('screenProducerId', async ({ producerId }: { producerId: string }) => {
        screenProducerId({
          producerId,
          screenId: screenId.value,
          membersReceived: membersReceived.value,
          shareScreenStarted: shareScreenStarted.value,
          deferScreenReceived: deferScreenReceived.value,
          participants: participants.value,
          updateScreenId: (value: string) => (screenId.value = value),
          updateShareScreenStarted: (value: boolean) => (shareScreenStarted.value = value),
          updateDeferScreenReceived: (value: boolean) => (deferScreenReceived.value = value),
        });
      });

      socketDefault.on('updateMediaSettings', async ({ settings }: { settings: Settings }) => {
        updateMediaSettings({
          settings,
          updateAudioSetting,
          updateVideoSetting,
          updateScreenshareSetting,
          updateChatSetting,
        });
      });

      socketDefault.on('producer-media-paused', async ({
        producerId,
        kind,
        name,
      }: {
        producerId: string;
        kind: 'audio';
        name: string;
      }) => {
        await producerMediaPaused({
          producerId,
          kind,
          name,
          parameters: getCastedParameters(),
        });
      });

      socketDefault.on('producer-media-resumed', async ({ kind, name }: { kind: 'audio'; name: string }) => {
        await producerMediaResumed({
          kind,
          name,
          parameters: getCastedParameters(),
        });
      });

      socketDefault.on('producer-media-closed', async ({
        producerId,
        kind,
      }: {
        producerId: string;
        kind: 'video' | 'audio' | 'screenshare' | 'screen';
      }) => {
        if (producerId && kind) {
          await producerMediaClosed({
            producerId,
            kind,
            parameters: getCastedParameters(),
          });
        }
      });

      socketDefault.on('controlMediaHost', async ({
        type,
      }: {
        type: 'video' | 'audio' | 'screenshare' | 'chat' | 'all';
      }) => {
        await controlMediaHost({
          type,
          parameters: getCastedParameters(),
        });
      });

      socketDefault.on('meetingEnded', async function () {
        await meetingEnded({
          showAlert,
          redirectURL: redirectURL.value,
          onWeb: true,
          eventType: eventType.value,
          updateValidated: (value: boolean) => (validated.value = value),
        });

        if (videoAlreadyOn.value) {
          await clickVideo({
            parameters: getCastedParameters(),
          });
        }
        if (audioAlreadyOn.value) {
          await clickAudio({
            parameters: getCastedParameters(),
          });
        }

        await closeAndReset();
      });

      socketDefault.on('disconnectUserSelf', async function () {
        await disconnectUserSelf({
          socket: socketDefault,
          member: member.value,
          roomName: roomName.value,
        });
      });

      socketDefault.on('receiveMessage', async ({ message }: { message: Message }) => {
        await receiveMessage({
          message,
          messages: messages.value,
          participantsAll: participants.value,
          member: member.value,
          eventType: eventType.value,
          islevel: islevel.value,
          coHost: coHost.value,
          updateMessages: (value: Message[]) => (messages.value = value),
          updateShowMessagesBadge: (value: boolean) => (showMessagesBadge.value = value),
        });
      });

      socketDefault.on('meetingTimeRemaining', async ({ timeRemaining }: { timeRemaining: number }) => {
        await meetingTimeRemaining({
          timeRemaining,
          showAlert,
          eventType: eventType.value,
        });
      });

      socketDefault.on('meetingStillThere', async () => {
        await meetingStillThere({
          updateIsConfirmHereModalVisible,
        });
      });

      socketDefault.on('updateConsumingDomains', async ({ domains, alt_domains }: UpdateConsumingDomainsData) => {
        await updateConsumingDomains({
          domains,
          alt_domains,
          apiUserName: apiUser,
          apiKey: '',
          apiToken: token,
          parameters: getCastedParameters(),
        });
      });

      socketDefault.on('hostRequestResponse', ({ requestResponse }: HostRequestResponseData) => {
        hostRequestResponse({
          requestResponse,
          showAlert,
          requestList: requestList.value,
          updateRequestList,
          updateMicAction: (value: boolean) => (micAction.value = value),
          updateVideoAction: (value: boolean) => (videoAction.value = value),
          updateScreenAction: (value: boolean) => (screenAction.value = value),
          updateChatAction: (value: boolean) => (chatAction.value = value),
          updateAudioRequestState: (value: string | null) => (audioRequestState.value = value),
          updateVideoRequestState: (value: string | null) => (videoRequestState.value = value),
          updateScreenRequestState: (value: string | null) => (screenRequestState.value = value),
          updateChatRequestState: (value: string | null) => (chatRequestState.value = value),
          updateAudioRequestTime: (value: number) => (audioRequestTime.value = value),
          updateVideoRequestTime: (value: number) => (videoRequestTime.value = value),
          updateScreenRequestTime: (value: number) => (screenRequestTime.value = value),
          updateChatRequestTime: (value: number) => (chatRequestTime.value = value),
          updateRequestIntervalSeconds: updateRequestIntervalSeconds.value,
        });
      });

      socketDefault.on('pollUpdated', async (data: PollUpdatedData) => {
        try {
          await pollUpdated({
            data,
            polls: polls.value,
            poll: poll.value!,
            member: member.value,
            islevel: islevel.value,
            showAlert,
            updatePolls: (value: Poll[]) => (polls.value = value),
            updatePoll: (value: Poll | null) => (poll.value = value),
            updateIsPollModalVisible,
          });
        } catch {
          // Handle error
        }
      });

      socketDefault.on('breakoutRoomUpdated', async (data: BreakoutRoomUpdatedData) => {
        try {
          await breakoutRoomUpdated({
            data,
            parameters: getCastedParameters(),
          });
        } catch {
          // Handle error
        }
      });
    }

    if (skipSockets) {
      const events = [
        'roomRecordParams',
        'startRecords',
        'reInitiateRecording',
        'RecordingNotice',
        'timeLeftRecording',
        'stoppedRecording',
      ];
      events.forEach((event) => {
        socketDefault.off(event);
        socketAlt.off(event);
      });
    }

    socketAlt.on('roomRecordParams', async ({ recordParams }: { recordParams: RecordParams }) => {
      await roomRecordParams({
        recordParams,
  parameters: getCastedParameters(),
      });
    });

    socketAlt.on('startRecords', async () => {
      await startRecords({
        roomName: roomName.value,
        member: member.value,
        socket: socketAlt,
      });
    });

    socketAlt.on('reInitiateRecording', async () => {
      await reInitiateRecording({
        roomName: roomName.value,
        member: member.value,
        socket: socketAlt,
        adminRestrictSetting: adminRestrictSetting.value,
      });
    });

    socketAlt.on(
      'RecordingNotice',
      async ({
        state,
        userRecordingParam,
        pauseCount,
        timeDone,
      }: {
        state: string;
        userRecordingParam: UserRecordingParams;
        pauseCount: number;
        timeDone: number | string;
      }) => {
      const timeDoneNumber = typeof timeDone === 'number' ? timeDone : Number(timeDone) || 0;
      await recordingNotice({
        state,
        userRecordingParam,
        pauseCount,
        timeDone: timeDoneNumber,
  parameters: getCastedParameters(),
      });
    }
    );

    socketAlt.on('timeLeftRecording', async ({ timeLeft }: { timeLeft: number }) => {
      timeLeftRecording({
        timeLeft,
        showAlert,
      });
    });

    socketAlt.on('stoppedRecording', async ({ state, reason }: { state: string; reason: string }) => {
      await stoppedRecording({
        state,
        reason,
        showAlert,
      });
    });

    if (props.localLink !== '' && socketDefault && !skipSockets) {
      await join_Room({
        socket: socketDefault,
        roomName: roomName.value,
        islevel: islevel.value,
        member: member.value,
        sec: token,
        apiUserName: apiUser,
        isLocal: true,
      });
    }

    let localChanged = false;
    localChanged =
      localSocket.value && localSocket.value.id !== socketAlt.id ? true : false;

    if (!skipSockets && localChanged) {
      await connect_Socket(apiUser, token, true);
      await sleep({ ms: 1000 });
      isLoadingModalVisible.value = false;
      return socketDefault;
    } else {
      if (link.value !== '' && link.value.includes('mediasfu.com')) {
        const token_ = apiToken.value;
        await join_Room({
          socket:
            props.connectMediaSFU && socketAlt && socketAlt.id
              ? socketAlt
              : socketDefault,
          roomName: roomName.value,
          islevel: islevel.value,
          member: member.value,
          sec: token_,
          apiUserName: apiUser,
        });
      }

      await receiveRoomMessages({
        socket: socketDefault,
        roomName: roomName.value,
        updateMessages: (value: Message[]) => (messages.value = value),
      });

      if (!skipSockets) {
        await prepopulateUserMedia({
          name: hostLabel.value,
          parameters: getCastedParameters(),
        });
      }

      return socketDefault;
    }
  } else {
    return null;
  }
}

const connectAndAddSocketMethods = async () => {
  const _socket = await connect_Socket(apiUserName.value, apiToken.value);
  if (_socket) {
    socket.value = _socket;
  }
  return _socket;
};

const runValidatedFlow = async (_origin: 'mount' | 'validation-change') => {

  if (!props.useLocalUIMode) {
    isLoadingModalVisible.value = true;
    try {

      console.log(`[MediasfuGeneric] (${_origin}) Connecting to socket...`);
      await connectAndAddSocketMethods();
    
    } catch (error) {
      console.log('error connectAndAddSocketMethods', error);
    } finally {
      isLoadingModalVisible.value = false;
    }
  } else {
    isLoadingModalVisible.value = false;
  }

  startMeetingProgressTimer({
    startTime: Date.now() / 1000,
    parameters: getCastedParameters(),
  });

  try {
    await runResize();
  } catch (error) {
    console.log('error runResize during validated flow', error);
  }

  try {
    if (props.sourceParameters !== null && props.sourceParameters !== undefined) {
      const updatedParams = allParameters.value;
      props.updateSourceParameters?.(updatedParams);
    }
  } catch {
    console.log('error updateSourceParameters');
  }
};

// Lifecycle hooks
// Update the onMounted hook to include socket connection
onMounted(async () => {
  // Update allVideoStreams
  allVideoStreams.value = [
    { producerId: 'youyou', stream: undefined, id: 'youyou', name: 'youyou' },
  ];

  // Update StreamNames
  streamNames.value = [{ id: 'youyou', name: 'youyou', producerId: '' }];

  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      scheduleResize();
    });

    if (mediaContainerRef.value) {
      resizeObserver.observe(mediaContainerRef.value);
    }
  }

  try {
    await runResize();
  } catch (error) {
    console.log('error runResize', error);
  }

  if (validated.value) {
    try {
      await runValidatedFlow('mount');
    } catch (error) {
      console.log('error runValidatedFlow', error);
    }
  } else {
    console.log('Not validated, skipping socket connection.');
  }
});

watch(
  () => validated.value,
  (newValue, oldValue) => {
    if (newValue && !oldValue) {
      void runValidatedFlow('validation-change');
    }
  }
);

onBeforeUnmount(() => {
  // Remove event listeners
  window.removeEventListener('resize', onResize);
  window.removeEventListener('orientationchange', onResize);
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
});

// Watch for recordState changes
watch([recordStarted, recordPaused, recordStopped], () => {
  if (recordStarted.value && !recordStopped.value) {
    if (!recordPaused.value) {
      recordState.value = 'red';
    } else {
      recordState.value = 'yellow';
    }
  } else {
    recordState.value = 'green';
  }
});

// Watch for mainHeightWidth changes
watch(mainHeightWidth, (newValue, oldValue) => {
  enqueueComponentUpdate(async () => {
    if (newValue !== oldValue) {
      const defaultFraction =
        eventType.value === 'webinar' || eventType.value === 'conference'
          ? 1 - controlHeight.value
          : 1;

      applyComponentSizes(defaultFraction);
    }

    const parameters = getCastedParameters();

    if (!lock_screen.value && !shared.value) {
      await prepopulateUserMedia({
        name: hostLabel.value,
        parameters,
      });
    } else if (!first_round.value) {
      await prepopulateUserMedia({
        name: hostLabel.value,
        parameters,
      });
    }
  });
});
</script>

<style scoped>
.MediaSFU .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.MediaSFU .modal-title {
  font-size: 18px;
  font-weight: bold;
  color: black;
}

.MediaSFU .btn-close {
  padding: 5px;
  cursor: pointer;
}

.MediaSFU .container {
  display: flex;
  width: 100%;
  flex-direction: row;
  margin-top: 0px;
}

.MediaSFU .buttonContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 5px;
  margin-right: 4px;
  font-size: medium;
  border: none;
}

.MediaSFU .buttonContainer:hover {
  cursor: pointer;
}

.MediaSFU .verticalButton {
  flex-direction: column;
}

.MediaSFU .buttonText {
  font-size: 12px;
  margin-top: 5px;
}

.MediaSFU .modal-body {
  flex: 1;
}

.MediaSFU .form-group {
  margin-bottom: 20px;
}

.MediaSFU .label {
  font-size: 14px;
  color: black;
  margin-bottom: 5px;
  font-weight: bold;
  padding-right: 10px;
}

.MediaSFU .hr {
  height: 1px;
  background-color: black;
  margin-top: 5px;
  margin-bottom: 5px;
}

.MediaSFU .sep {
  height: 1px;
  background-color: white;
  margin-top: 0;
  margin-bottom: 0;
}

.MediaSFU .modal-footer {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.MediaSFU .btn-apply-settings {
  padding: 5px;
  border-radius: 5px;
  justify-content: center;
  align-items: center;
  background-color: black;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.MediaSFU .customButtonsContainer {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
}

.MediaSFU .customButton {
  width: 100%;
  margin: 10px 0;
  padding: 10px;
  border-radius: 5px;
  background-color: transparent;
  align-items: flex-start;
  justify-content: flex-start;
  border: none;
}

.MediaSFU .buttonContent {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}

.MediaSFU .customButtonIcon {
  font-size: 20px;
  color: #000000;
  margin-right: 4px;
}

.MediaSFU .customButtonText {
  color: #000000;
}

.MediaSFU #whiteboardCanvas {
  border: 1px solid #000;
  cursor: crosshair;
  background-color: white;
}

.MediaSFU .resize-handle,
.MediaSFU .move-handle {
  width: 8px;
  height: 8px;
  background: red;
  position: absolute;
}

.MediaSFU .move-handle {
  background: blue;
}

.MediaSFU #textInput {
  display: none;
  position: absolute;
  z-index: 10;
  width: 200px;
}

.MediaSFU .shape-icon {
  width: 20px;
  height: 20px;
  color: white;
}

.MediaSFU .toolbar .btn-group button,
.MediaSFU .toolbar .dropdown-menu a {
  font-size: 0.8rem;
  padding: 5px 10px;
  margin: 0 2px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.MediaSFU .toolbar .dropdown-menu a {
  background-color: transparent;
  color: rgb(27, 26, 26);
}

.MediaSFU .toolbar .btn-group button:hover,
.MediaSFU .toolbar .dropdown-menu a:hover {
  background-color: #e3e7eb;
}

.MediaSFU .toolbar .btn-group button.active {
  background-color: #454d55;
}

.MediaSFU .toolbarScreen .btn-group button,
.MediaSFU .toolbarScreen .dropdown-menu a {
  font-size: 0.8rem;
  padding: 5px 10px;
  margin: 1px 2px;
  border-radius: 4px;
  transition: background-color 0.2s;
  background-color: transparent;
  color: black;
}

.MediaSFU .toolbarScreen .btn-group button {
  color: rgb(6, 6, 6);
  border: none;
}

.MediaSFU .toolbarScreen .dropdown-menu a {
  background-color: transparent;
  color: rgb(27, 26, 26);
}

.MediaSFU .toolbarScreen .btn-group button.active {
  background-color: #454d55;
}

.MediaSFU #toolbar,
.MediaSFU #toolbarScreen {
  transition: display 0.3s ease-in-out;
}

.MediaSFU #toolbarToggle,
.MediaSFU #toolbarToggleScreen {
  cursor: pointer;
  border: 2px solid black !important;
  font-size: 0.8rem;
}

.MediaSFU #colorPicker,
.MediaSFU #colorPickerScreen {
  font-size: 0.8rem;
  padding: 2px 2px;
  width: 32px;
  height: 32px;
}

.MediaSFU #lineTypePicker {
  font-size: 0.8rem;
  padding: 2px;
  width: 32px;
  height: 32px;
}

.MediaSFU .btnBoard {
  font-size: 1rem;
  padding: 2px 2px;
  width: 40px;
  height: 40px;
  margin: 2px;
}

.MediaSFU #lineTypePickerScreen {
  font-size: 0.7rem;
  padding: 2px;
  width: 28px;
  height: 28px;
  background-color: rgba(214, 209, 209, 0.4);
  color: #000;
  border-radius: 4px;
}

.MediaSFU .toggle-icon {
  width: 30px;
  height: 30px;
  padding: 0;
  margin: 0;
}

.MediaSFU #toggleBackground.active {
  background-color: #fdfeff;
}

.MediaSFU .annotateScreenBtn {
  background-color: #2d2e2f !important;
  border: 2px solid #000 !important;
  color: green !important;
  font-size: 0.75rem;
}

.MediaSFU .waiting-list {
  display: flex;
  flex-direction: column;
}

.MediaSFU .waiting-item {
  display: flex;
  flex-direction: row;
  margin-top: 5px;
}

.MediaSFU .col7 {
  flex: 5;
  justify-content: center;
}

.MediaSFU .col2 {
  flex: 2;
  align-items: center;
  justify-content: center;
}

.MediaSFU .col1 {
  flex: 1;
}

.MediaSFU {
  position: relative;
  overflow: hidden;
}
</style>

