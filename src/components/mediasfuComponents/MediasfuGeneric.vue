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
        :background-color="roomSurfaceBackgroundColor"
        :default-fraction="1 - controlHeight"
        :update-is-wide-screen="updateIsWideScreen"
        :update-is-medium-screen="updateIsMediumScreen"
        :update-is-small-screen="updateIsSmallScreen"
        :show-controls="eventType === 'webinar' || eventType === 'conference'"
        :container-props="mainAspectContainerProps"
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
          :container-width-fraction="mainScreenWidthFraction"
        >
          <!-- MainGridComponent shows the main grid view -->
          <component
            :is="MainGrid"
            :height="componentSizes.mainHeight"
            :width="componentSizes.mainWidth"
            :background-color="roomSurfaceBackgroundColor"
            :main-size="mainHeightWidth"
            :show-aspect="mainHeightWidth > 0"
            :time-background-color="recordState"
            :meeting-progress-time="meetingProgressTime"
            :timer-component="MeetingProgressTimerComponent"
            :stack-direction="isWideScreen ? 'row' : 'column'"
            :is-dark-mode="modernMenuDarkMode"
          >
            <component
              :is="FlexibleVideoComponent"
              :custom-width="componentSizes.mainWidth"
              :custom-height="componentSizes.mainHeight"
              :rows="1"
              :columns="1"
              :components-to-render="mainGridStream"
              :show-aspect="mainGridStream.length > 0 && !(whiteboardStarted && !whiteboardEnded)"
              :background-color="roomSurfaceBackgroundColor"
              :is-dark-mode="modernMenuDarkMode"
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
              :show-aspect="eventType === 'broadcast' && !showRecordButtons && canUseBroadcastMediaControls"
              location="bottom"
              position="middle"
            />

            <!-- Buttons to control recording -->
            <component
              :is="ControlButtonsTouch"
              :buttons="recordButtons"
              direction="horizontal"
              :show-aspect="eventType === 'broadcast' && showRecordButtons && canUseBroadcastMediaControls"
              location="bottom"
              position="middle"
            />

            <ModernParticipantsCounterBadge
              :participants-count="participantsCounter"
              position="bottomLeft"
              :show-badge="mainHeightWidth > 0"
              :is-dark-mode="modernMenuDarkMode"
            />
          </component>

          <!-- OthergridComponent shows the minor grid view -->
          <component
            :is="OtherGrid"
            :height="componentSizes.otherHeight"
            :width="componentSizes.otherWidth"
            :background-color="roomSurfaceBackgroundColor"
            :show-aspect="mainHeightWidth !== 100"
            :time-background-color="recordState"
            :show-timer="mainHeightWidth === 0"
            :meeting-progress-time="meetingProgressTime"
            :timer-component="MeetingProgressTimerComponent"
            :stack-direction="isWideScreen ? 'row' : 'column'"
            :is-dark-mode="modernMenuDarkMode"
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
                :is-dark-mode="modernMenuDarkMode"
                :parameters="allParameters"
              />
            </div>

            <!-- AudioGrid contains all the audio only streams -->
            <component
              :is="AudioGridComponent"
              :components-to-render="renderedAudioComponents"
            />

            <div
              v-if="translationAudioComponents.length > 0"
              :style="{
                position: 'absolute',
                width: '0px',
                height: '0px',
                overflow: 'hidden',
                pointerEvents: 'none',
              }"
              aria-hidden="true"
            >
              <component
                :is="descriptor.component"
                v-for="descriptor in translationAudioComponents"
                :key="descriptor.key"
                v-bind="descriptor.props"
              />
            </div>

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
              :background-color="roomSurfaceBackgroundColor"
              :is-dark-mode="modernMenuDarkMode"
            />

            <component
              :is="FlexibleGridAlt"
              :custom-width="gridSizes.altGridWidth ?? 0"
              :custom-height="gridSizes.altGridHeight ?? 0"
              :rows="altGridRows"
              :columns="altGridCols"
              :components-to-render="otherGridComponentLists[1]"
              :background-color="roomSurfaceBackgroundColor"
              :is-dark-mode="modernMenuDarkMode"
            />

            <ModernParticipantsCounterBadge
              :participants-count="participantsCounter"
              position="topRight"
              :show-badge="mainHeightWidth === 0"
              :is-dark-mode="modernMenuDarkMode"
            />
          </component>
        </component>

        <div
          v-if="shouldUseSidebar"
          class="mediasfu-modern-sidebar-shell"
          :style="{
            width: isSidebarVisible ? sidebarWidth + 'px' : '0px',
          }"
        >
          <div
            v-show="isSidebarVisible"
            class="mediasfu-modern-sidebar-panel"
            :style="[{ width: sidebarWidth + 'px' }, sidebarThemeVars]"
          >
            <div
              v-if="sidebarNavigationStack.length > 0"
              class="mediasfu-modern-sidebar-backbar"
            >
              <button
                type="button"
                class="mediasfu-modern-sidebar-back"
                @click="sidebarNavigateBack"
              >
                <span
                  class="mediasfu-modern-sidebar-back-icon"
                  aria-hidden="true"
                >
                  ←
                </span>
                Back to Menu
              </button>
              <button
                type="button"
                class="mediasfu-modern-sidebar-close"
                aria-label="Close sidebar"
                @click="closeSidebar"
              >
                &times;
              </button>
            </div>
            <div class="mediasfu-modern-sidebar-content">
              <SidebarContentRenderer />
            </div>
          </div>
        </div>

        <div
          v-if="validated && !shouldUseSidebar && isSidebarModalVisible"
          class="mediasfu-modern-sidebar-modal-shell"
        >
          <div
            class="mediasfu-modern-sidebar-modal-panel"
            :style="[{ width: mobileSidebarWidth + 'px' }, sidebarThemeVars]"
          >
            <div
              v-if="sidebarNavigationStack.length > 0"
              class="mediasfu-modern-sidebar-backbar"
            >
              <button
                type="button"
                class="mediasfu-modern-sidebar-back"
                @click="sidebarNavigateBack"
              >
                <span
                  class="mediasfu-modern-sidebar-back-icon"
                  aria-hidden="true"
                >
                  ←
                </span>
                Back to Menu
              </button>
              <button
                type="button"
                class="mediasfu-modern-sidebar-close"
                aria-label="Close sidebar"
                @click="closeSidebar"
              >
                &times;
              </button>
            </div>
            <div class="mediasfu-modern-sidebar-content">
              <SidebarContentRenderer />
            </div>
          </div>
        </div>
      </component>

      <!-- SubAspectComponent is used for webinar and conference events only to display fixed control buttons -->
      <component
        :is="SubAspect"
        :background-color="roomSurfaceBackgroundColor"
        :show-controls="eventType === 'webinar' || eventType === 'conference'"
        :container-width-fraction="1"
        :default-fraction-sub="controlHeight"
        :container-props="{
          style: {
            left: '0px',
          },
        }"
      >
        <component
          :is="ControlButtons"
          :buttons="controlButtons"
          :button-color="bottomControlButtonColor"
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
        :is-dark-mode="modernMenuDarkMode"
        :on-toggle-theme="updateModernMenuDarkMode"
        :custom-buttons="customMenuButtons"
        :room-name="roomName"
        :admin-passcode="adminPasscode"
        :islevel="islevel"
        :event-type="eventType"
        :local-link="localLink"
      />

      <component
        :is="EventSettingsModalComponent"
        :background-color="roomSurfaceBackgroundColor"
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
        :background-color="roomSurfaceBackgroundColor"
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
        :background-color="roomSurfaceBackgroundColor"
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
        :background-color="roomSurfaceBackgroundColor"
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
        :background-color="roomSurfaceBackgroundColor"
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
        :is="PanelistsModalComponent"
        :background-color="roomSurfaceBackgroundColor"
        :is-panelists-modal-visible="isPanelistsModalVisible"
        :on-panelists-close="() => updateIsPanelistsModalVisible(false)"
        :parameters="allParameters"
      />

      <component
        :is="PermissionsModalComponent"
        :background-color="roomSurfaceBackgroundColor"
        :is-permissions-modal-visible="isPermissionsModalVisible"
        :on-permissions-close="() => updateIsPermissionsModalVisible(false)"
        :parameters="allParameters"
      />

      <component
        :is="TranslationSettingsModalComponent"
        :background-color="roomSurfaceBackgroundColor"
        :is-translation-settings-modal-visible="isTranslationSettingsModalVisible"
        :on-translation-settings-close="() => updateIsTranslationSettingsModalVisible(false)"
        :parameters="allParameters"
      />

      <component
        :is="DisplaySettingsModalComponent"
        :background-color="roomSurfaceBackgroundColor"
        :is-display-settings-modal-visible="isDisplaySettingsModalVisible"
        :on-display-settings-close="() => updateIsDisplaySettingsModalVisible(false)"
        :parameters="allParameters"
      />

      <component
        :is="RecordingModalComponent"
        :background-color="roomSurfaceBackgroundColor"
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
        :background-color="roomSurfaceBackgroundColor"
        :is-visible="isBreakoutRoomsModalVisible"
        :on-breakout-rooms-close="() => updateIsBreakoutRoomsModalVisible(false)"
        :parameters="allParameters"
      />

      <component
        :is="ConfigureWhiteboardModalComponent"
        :background-color="roomSurfaceBackgroundColor"
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
        loading-text="Loading..."
        :show-spinner="true"
        background-color="rgba(217, 227, 234, 0.99)"
        display-color="black"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, watch, onMounted, onBeforeUnmount, h, defineComponent, markRaw, type Component, type ComputedRef, type CSSProperties, type HTMLAttributes, type VNodeChild } from 'vue';
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
  faCompress,
  faExpand,
  faMoon,
  faSun,
  faSync,
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
  faUserShield,
  faUserTie,
  faGlobe,
  faChalkboardTeacher,
  faBan,
  } from '@fortawesome/free-solid-svg-icons';

// Initial values
import { initialValuesState } from '../../methods/utils/initialValuesState';

// Import components
import MainAspectComponent from '../displayComponents/MainAspectComponent.vue';
import LoadingModal from '../displayComponents/LoadingModal.vue';
import ControlButtonsComponent from '../displayComponents/ControlButtonsComponent.vue';
import ControlButtonsAltComponent from '../displayComponents/ControlButtonsAltComponent.vue';
import ControlButtonsComponentTouch from '../displayComponents/ControlButtonsComponentTouch.vue';
import OthergridComponent from '../displayComponents/OtherGridComponent.vue';
import MainScreenComponent from '../displayComponents/MainScreenComponent.vue';
import MainGridComponent from '../displayComponents/MainGridComponent.vue';
import MeetingProgressTimer from '../displayComponents/MeetingProgressTimer.vue';
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
import PermissionsModal from '../permissionsComponents/PermissionsModal.vue';
import ParticipantsModal from '../participantsComponents/ParticipantsModal.vue';
import PanelistsModal from '../panelistsComponents/PanelistsModal.vue';
import TranslationSettingsModal from '../translationComponents/TranslationSettingsModal.vue';
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
import ModernBreakoutRoomsModal from '../../modern/modal_components/ModernBreakoutRoomsModal.vue';
import ModernCoHostModal from '../../modern/modal_components/ModernCoHostModal.vue';
import ModernConfigureWhiteboardModal from '../../modern/modal_components/ModernConfigureWhiteboardModal.vue';
import ModernDisplaySettingsModal from '../../modern/modal_components/ModernDisplaySettingsModal.vue';
import ModernEventSettingsModal from '../../modern/modal_components/ModernEventSettingsModal.vue';
import ModernMediaSettingsModal from '../../modern/modal_components/ModernMediaSettingsModal.vue';
import ModernMenuModal from '../../modern/modal_components/ModernMenuModal.vue';
import ModernMessagesModal from '../../modern/modal_components/ModernMessagesModal.vue';
import ModernPanelistsModal from '../../modern/modal_components/ModernPanelistsModal.vue';
import ModernParticipantsModal from '../../modern/modal_components/ModernParticipantsModal.vue';
import ModernPermissionsModal from '../../modern/modal_components/ModernPermissionsModal.vue';
import ModernPollModal from '../../modern/modal_components/ModernPollModal.vue';
import ModernRecordingModal from '../../modern/modal_components/ModernRecordingModal.vue';
import ModernRequestsModal from '../../modern/modal_components/ModernRequestsModal.vue';
import ModernParticipantsCounterBadge from '../../modern/display_components/ModernParticipantsCounterBadge.vue';
import ModernShareEventModal from '../../modern/modal_components/ModernShareEventModal.vue';
import ModernTranslationSettingsModal from '../../modern/modal_components/ModernTranslationSettingsModal.vue';
import ModernWaitingModal from '../../modern/modal_components/ModernWaitingModal.vue';
import { useUIOverrides } from '../../composables/useUIOverrides';
import type { MediasfuUICustomOverrides } from '../../types/ui-overrides';
// Import methods (from shared folder)
import { launchMenuModal } from 'mediasfu-shared';
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
import { mediaDevices } from '../../methods/utils/webrtc/webrtc';

// mediasfu functions
import { connectSocket, connectLocalSocket } from 'mediasfu-shared';
import { joinRoomClient } from '../../ProducerClient/producerClientEmits/joinRoomClient';
import { joinLocalRoom } from '../../producers/producerEmits/joinLocalRoom';
import { updateRoomParametersClient } from '../../ProducerClient/producerClientEmits/updateRoomParametersClient';
import { createDeviceClient } from 'mediasfu-shared';
// Stream methods - use shared where available
import { switchVideoAlt } from 'mediasfu-shared';
// These stay in src (not in shared)
import { clickVideo } from 'mediasfu-shared';
import { clickAudio } from 'mediasfu-shared';
import { clickScreenShare } from 'mediasfu-shared';

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
import { sleep } from 'mediasfu-shared';
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
import { formatNumber } from 'mediasfu-shared';
import { connectIps } from 'mediasfu-shared';
import { connectLocalIps } from 'mediasfu-shared';
import { pollUpdated } from 'mediasfu-shared';
import { handleCreatePoll } from 'mediasfu-shared';
import { handleVotePoll } from 'mediasfu-shared';
import { handleEndPoll } from 'mediasfu-shared';
import { breakoutRoomUpdated } from 'mediasfu-shared';
import { startMeetingProgressTimer } from 'mediasfu-shared';
import { updateRecording } from 'mediasfu-shared';
import { stopRecording } from 'mediasfu-shared';
import {
  pauseOriginalProducer as sharedPauseOriginalProducer,
  resumeOriginalProducer as sharedResumeOriginalProducer,
  stopConsumingTranslation as sharedStopConsumingTranslation,
  type TranslationConsumerSwitchParameters,
} from 'mediasfu-shared';

// Socket receive methods
import { userWaiting } from '../../producers/socketReceiveMethods/userWaiting';
import { personJoined } from '../../producers/socketReceiveMethods/personJoined';
import { allWaitingRoomMembers } from '../../producers/socketReceiveMethods/allWaitingRoomMembers';
import { roomRecordParams } from '../../producers/socketReceiveMethods/roomRecordParams';
import { banParticipant } from '../../producers/socketReceiveMethods/banParticipant';
import { updatedCoHost } from '../../producers/socketReceiveMethods/updatedCoHost';
import { participantRequested } from '../../producers/socketReceiveMethods/participantRequested';
import { screenProducerId } from '../../producers/socketReceiveMethods/screenProducerId';
import { updateMediaSettings } from '../../producers/socketReceiveMethods/updateMediaSettings';
import { producerMediaPaused } from '../../producers/socketReceiveMethods/producerMediaPaused';
import { producerMediaResumed } from '../../producers/socketReceiveMethods/producerMediaResumed';
import { producerMediaClosed } from '../../producers/socketReceiveMethods/producerMediaClosed';
import { controlMediaHost } from '../../producers/socketReceiveMethods/controlMediaHost';
import { meetingEnded } from '../../producers/socketReceiveMethods/meetingEnded';
import { disconnectUserSelf } from '../../producers/socketReceiveMethods/disconnectUserSelf';
import { receiveMessage } from '../../producers/socketReceiveMethods/receiveMessage';
import { meetingTimeRemaining } from 'mediasfu-shared';
import { meetingStillThere } from '../../producers/socketReceiveMethods/meetingStillThere';
import { startRecords } from '../../producers/socketReceiveMethods/startRecords';
import { reInitiateRecording } from '../../producers/socketReceiveMethods/reInitiateRecording';
import { getDomains } from '../../producers/socketReceiveMethods/getDomains';
import { updateConsumingDomains } from '../../producers/socketReceiveMethods/updateConsumingDomains';
import { recordingNotice } from '../../producers/socketReceiveMethods/recordingNotice';
import { timeLeftRecording } from 'mediasfu-shared';
import { stoppedRecording } from '../../producers/socketReceiveMethods/stoppedRecording';
import { hostRequestResponse } from 'mediasfu-shared';
import { allMembers } from '../../producers/socketReceiveMethods/allMembers';
import { allMembersRest } from '../../producers/socketReceiveMethods/allMembersRest';
import { disconnect } from '../../producers/socketReceiveMethods/disconnect';
import { captureCanvasStream } from 'mediasfu-shared';
import { resumePauseAudioStreams } from 'mediasfu-shared';
import { processConsumerTransportsAudio } from 'mediasfu-shared';
import {
  translationRoomConfig,
  translationConfigUpdated,
  translationLanguageSet,
  translationSubscribed,
  translationUnsubscribed,
  translationProducerReady,
  translationProducerClosed,
  translationChannelsAvailable,
  translationMemberState,
  translationError,
  translationTranscript,
  translationSpeakerOutputChanged,
  type TranslationRoomConfig,
  type TranslationProducerMap,
  type TranslationMemberStateData,
  type TranslationProducerClosedData,
  type TranslationProducerReadyData,
  type TranslationSubscribedData,
  type TranslationTranscriptData,
  type TranslationUnsubscribedData,
} from '../../services/translationReceiveMethods';
import { createLiveSubtitleService } from '../../services/liveSubtitleService';

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
  PermissionConfig,
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
import type {
  CustomAudioCardType,
  CustomMiniCardType,
  CustomPreJoinPageType,
  CustomVideoCardType,
  CustomComponentType,
} from '../../types/custom-renderers';
import type { RenderableComponent } from '../../types/renderable-component';
import type { Device, types as MediasoupTypes } from 'mediasoup-client';
import type { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import type {
  Shape as WhiteboardShape,
  WhiteboardParameters as WhiteboardComponentParameters,
} from '../whiteboardComponents/Whiteboard.vue';

// Mediasoup types
type Producer = MediasoupTypes.Producer;
type ProducerOptions = MediasoupTypes.ProducerOptions;
type RtpCapabilities = MediasoupTypes.RtpCapabilities;
type Transport = MediasoupTypes.Transport;
import { createResponseJoinRoom } from 'mediasfu-shared';

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
   * Whether the joiner can request personal translation even if the room host did not enable room-wide translation.
   */
  canUsePersonalTranslation?: boolean;

  /**
   * MediaSFU username whose credits should back personal translation for this joiner.
   */
  personalTranslationUsername?: string;
  
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

  /**
   * App-level cloned voices available for translation voice clone mode.
   * These are passed through to the translation settings modal.
   */
  userVoiceClones?: Array<{
    id?: string;
    providerVoiceId?: string;
    voiceId?: string;
    name?: string;
    provider?: string;
    isDefault?: boolean;
  }>;
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
  canUsePersonalTranslation: false,
  personalTranslationUsername: undefined,
  uiOverrides: undefined,
  userVoiceClones: undefined,
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
const MeetingProgressTimerComponent = resolveComponent('meetingProgressTimer', MeetingProgressTimer);
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
const PermissionsModalComponent = resolveComponent('permissionsModal', PermissionsModal);
const ParticipantsModalComponent = resolveComponent('participantsModal', ParticipantsModal);
const PanelistsModalComponent = resolveComponent('panelistsModal', PanelistsModal);
const TranslationSettingsModalComponent = resolveComponent('translationSettingsModal', TranslationSettingsModal);
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

const screenProducer = shallowRef<Producer | null>(null);
const localScreenProducer = shallowRef<Producer | null>(null);
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
const translationStreams = ref<RenderableComponent[]>([]);

const componentUpdateQueue: Array<() => Promise<void> | void> = [];
let isProcessingComponentUpdates = false;

const mediaContainerRef = ref<HTMLElement | null>(null);

type SidebarContentType =
  | 'none'
  | 'menu'
  | 'participants'
  | 'messages'
  | 'requests'
  | 'waiting'
  | 'coHost'
  | 'mediaSettings'
  | 'displaySettings'
  | 'eventSettings'
  | 'recording'
  | 'polls'
  | 'breakoutRooms'
  | 'shareEvent'
  | 'configureWhiteboard'
  | 'background'
  | 'permissions'
  | 'panelists'
  | 'translation';

const windowWidth = ref<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
const windowHeight = ref<number>(typeof window !== 'undefined' ? window.innerHeight : 0);
const activeSidebarContent = ref<SidebarContentType>('none');
const sidebarNavigationStack = ref<SidebarContentType[]>([]);
const modernMenuDarkMode = ref<boolean>(true);

const updateModernMenuDarkMode = (value: boolean) => {
  modernMenuDarkMode.value = value;
};

const sidebarThemeVars = computed<CSSProperties>(() => {
  if (modernMenuDarkMode.value) {
    return {
      '--ms-modern-page-background': '#081120',
      '--ms-modern-page-background-accent': '#0f1b33',
      '--ms-modern-panel-surface': 'rgba(10, 18, 33, 0.82)',
      '--ms-modern-panel-surface-elevated': 'rgba(15, 27, 49, 0.9)',
      '--ms-modern-panel-border': 'rgba(148, 163, 184, 0.18)',
      '--ms-modern-panel-border-strong': 'rgba(96, 165, 250, 0.32)',
      '--ms-modern-text-primary': '#f8fafc',
      '--ms-modern-text-secondary': 'rgba(226, 232, 240, 0.78)',
      '--ms-modern-text-muted': 'rgba(148, 163, 184, 0.82)',
      '--ms-modern-field-background': 'rgba(15, 23, 42, 0.74)',
      '--ms-modern-field-border': 'rgba(148, 163, 184, 0.26)',
      '--ms-modern-field-border-focus': 'rgba(96, 165, 250, 0.72)',
      '--ms-modern-overlay-backdrop': 'rgba(2, 8, 23, 0.62)',
      '--ms-modern-overlay-scrim': 'rgba(2, 6, 23, 0.34)',
      '--ms-modern-shadow-floating': '0 18px 44px rgba(0, 0, 0, 0.38)',
      '--ms-sidebar-panel-top': 'rgba(15, 23, 42, 0.98)',
      '--ms-sidebar-panel-bottom': 'rgba(30, 41, 59, 0.95)',
      '--ms-sidebar-border': 'rgba(255, 255, 255, 0.12)',
      '--ms-sidebar-backbar-bg': 'rgba(15, 23, 42, 0.5)',
      '--ms-sidebar-button-bg': 'rgba(255, 255, 255, 0.1)',
      '--ms-sidebar-button-border': 'rgba(148, 163, 184, 0.14)',
      '--ms-sidebar-button-text': '#f8fafc',
    } as CSSProperties;
  }

  return {
    '--ms-modern-page-background': '#edf3fb',
    '--ms-modern-page-background-accent': '#dbe6f2',
    '--ms-modern-panel-surface': 'rgba(255, 255, 255, 0.82)',
    '--ms-modern-panel-surface-elevated': 'rgba(255, 255, 255, 0.94)',
    '--ms-modern-panel-border': 'rgba(148, 163, 184, 0.24)',
    '--ms-modern-panel-border-strong': 'rgba(59, 130, 246, 0.28)',
    '--ms-modern-text-primary': '#0f172a',
    '--ms-modern-text-secondary': 'rgba(30, 41, 59, 0.76)',
    '--ms-modern-text-muted': 'rgba(71, 85, 105, 0.82)',
    '--ms-modern-field-background': 'rgba(255, 255, 255, 0.92)',
    '--ms-modern-field-border': 'rgba(148, 163, 184, 0.34)',
    '--ms-modern-field-border-focus': 'rgba(59, 130, 246, 0.52)',
    '--ms-modern-overlay-backdrop': 'rgba(15, 23, 42, 0.18)',
    '--ms-modern-overlay-scrim': 'rgba(15, 23, 42, 0.08)',
    '--ms-modern-shadow-floating': '0 18px 44px rgba(15, 23, 42, 0.12)',
    '--ms-sidebar-panel-top': 'rgba(255, 255, 255, 0.98)',
    '--ms-sidebar-panel-bottom': 'rgba(226, 232, 240, 0.96)',
    '--ms-sidebar-border': 'rgba(148, 163, 184, 0.26)',
    '--ms-sidebar-backbar-bg': 'rgba(255, 255, 255, 0.74)',
    '--ms-sidebar-button-bg': 'rgba(255, 255, 255, 0.88)',
    '--ms-sidebar-button-border': 'rgba(148, 163, 184, 0.24)',
    '--ms-sidebar-button-text': '#0f172a',
  } as CSSProperties;
});

const shouldUseSidebar = computed(() => {
  const isLandscape = windowWidth.value > windowHeight.value;
  return validated.value && returnUI.value && isLandscape && windowWidth.value >= 1200;
});

const showButtonLabels = computed(() => windowWidth.value >= 576);

const neutralControlButtonColor = computed(() =>
  modernMenuDarkMode.value ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
);

const activeNeutralControlButtonColor = computed(() =>
  modernMenuDarkMode.value ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'
);

const bottomControlButtonColor = computed(() => (modernMenuDarkMode.value ? 'white' : 'black'));
const roomSurfaceBackgroundColor = 'var(--ms-modern-page-background)';

const getSidebarWidth = (screenWidth: number): number => {
  const calculatedWidth = screenWidth * 0.2;
  if (calculatedWidth < 280) return 280;
  if (calculatedWidth > 420) return 420;
  return Math.floor(calculatedWidth);
};

const sidebarWidth = computed(() =>
  shouldUseSidebar.value && activeSidebarContent.value !== 'none'
    ? getSidebarWidth(windowWidth.value)
    : 0
);

const isSidebarVisible = computed(() => shouldUseSidebar.value && activeSidebarContent.value !== 'none');
const isSidebarModalVisible = computed(() => !shouldUseSidebar.value && activeSidebarContent.value !== 'none');
const shouldRouteToHostedSurface = computed(() =>
  shouldUseSidebar.value || activeSidebarContent.value !== 'none'
);

const mobileSidebarWidth = computed(() => {
  if (windowWidth.value <= 0) {
    return 320;
  }

  const preferredWidth = Math.floor(windowWidth.value * 0.85);
  return Math.min(Math.max(preferredWidth, 280), Math.min(windowWidth.value, 400));
});

const mainScreenWidthFraction = computed(() => {
  if (!shouldUseSidebar.value || windowWidth.value <= 0) {
    return 1;
  }

  return Math.max(0.35, (windowWidth.value - sidebarWidth.value) / windowWidth.value);
});

const mainAspectContainerProps = computed<HTMLAttributes>(() => ({
  style: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
  } satisfies CSSProperties,
}));

const sidebarOverlayProps = computed<HTMLAttributes>(() => ({
  class: 'mediasfu-modern-sidebar-embedded-overlay',
  style: {
    position: 'relative',
    inset: 'auto',
    top: 'auto',
    left: 'auto',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
    background: 'transparent',
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
    zIndex: 'auto',
    pointerEvents: 'auto',
  } satisfies CSSProperties,
}));

const sidebarContentProps = computed<HTMLAttributes>(() => ({
  class: 'mediasfu-modern-sidebar-embedded-content',
  style: {
    position: 'relative',
    top: 'auto',
    right: 'auto',
    bottom: 'auto',
    left: 'auto',
    transform: 'none',
    width: '100%',
    maxWidth: '100%',
    height: '100%',
    maxHeight: '100%',
    minHeight: 0,
    boxSizing: 'border-box',
    border: 'none',
    borderRadius: 0,
    background: 'transparent',
    overflow: 'hidden',
    boxShadow: 'none',
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
  } satisfies CSSProperties,
}));

const sidebarModalBackgroundColor = 'var(--ms-modern-panel-surface-elevated)';

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
const translationAudioComponents = computed<RenderableComponent[]>(() => normalizeComponentList(translationStreams.value));
const renderedAudioComponents = computed<RenderableComponent[]>(() => [
  ...audioOnlyComponents.value,
]);

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
const showSubtitlesOnCards = ref<boolean>(true);
const liveSubtitleState = createLiveSubtitleService();
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
const isPermissionsModalVisible = ref<boolean>(false);
const isPanelistsModalVisible = ref<boolean>(false);
const isTranslationSettingsModalVisible = ref<boolean>(false);
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
const panelists = ref<Participant[]>([]);
const panelistsFocused = ref<boolean>(false);
const muteOthersMic = ref<boolean>(false);
const muteOthersCamera = ref<boolean>(false);
const permissionConfig = ref<PermissionConfig | null>(null);
const translationSupported = ref<boolean>(false);
const translationConfig = ref<TranslationRoomConfig | null>(null);
const isPersonalTranslation = ref<boolean>(false);
type TranslationAwareParticipant = Participant & {
  translationEnabled?: boolean;
  translationDefaultOutputLanguage?: string | null;
  translationOriginalProducerId?: string;
  translationInputLanguage?: string | null;
};

interface SpeakerTranslationState {
  speakerId: string;
  speakerName: string;
  inputLanguage: string;
  outputLanguage: string;
  originalProducerId: string;
  enabled: boolean;
}

interface SpeakerTranslationStateUpdateOptions {
  speakerName?: string;
  inputLanguage?: string;
  enabled?: boolean;
}

interface GridLayoutMeta {
  rows: number;
  cols: number;
  actualRows: number;
}

const getGridLayoutMeta = (
  components: RenderableComponent[],
  rows: number,
  cols: number,
): GridLayoutMeta => {
  if (rows <= 0 || cols <= 0 || components.length === 0) {
    return { rows: 0, cols: 0, actualRows: 0 };
  }

  return {
    rows,
    cols,
    actualRows: Math.min(rows, Math.ceil(components.length / cols)),
  };
};

const syncMiniCardGridSizes = async () => {
  if (!validated.value) {
    return;
  }

  const primaryMeta = getGridLayoutMeta(
    otherGridComponentLists.value[0],
    gridRows.value,
    gridCols.value,
  );

  if (primaryMeta.rows <= 0 || primaryMeta.cols <= 0 || primaryMeta.actualRows <= 0) {
    return;
  }

  const parameters = getCastedParameters();
  parameters.getUpdatedAllParams = getUpdatedAllParams;

  await updateMiniCardsGrid({
    rows: primaryMeta.rows,
    cols: primaryMeta.cols,
    defal: true,
    actualRows: primaryMeta.actualRows,
    parameters,
  });

  const altMeta = getGridLayoutMeta(
    otherGridComponentLists.value[1],
    altGridRows.value,
    altGridCols.value,
  );

  if (altMeta.rows > 0 && altMeta.cols > 0 && altMeta.actualRows > 0) {
    await updateMiniCardsGrid({
      rows: altMeta.rows,
      cols: altMeta.cols,
      defal: false,
      actualRows: altMeta.actualRows,
      parameters,
    });
  }
};

const mySpokenLanguage = ref<string>('en');
const mySpokenLanguageEnabled = ref<boolean>(false);
const myDefaultOutputLanguage = ref<string | null>(null);
const myDefaultListenLanguage = ref<string | null>(null);
const listenPreferences = ref<Map<string, string>>(new Map());
const translationProducerMap = ref<TranslationProducerMap>({});
const activeTranslationProducerIds = ref<Set<string>>(new Set());
const availableTranslationChannels = ref<Map<string, { languages: string[]; originalProducerId: string }>>(new Map());
const participantTranslationStates = ref<Map<string, unknown>>(new Map());
const transcripts = ref<TranslationTranscriptData[]>([]);
const speakerTranslationStates = ref<Map<string, SpeakerTranslationState>>(new Map());
const translationPlaybackRetryTimers = new Map<string, ReturnType<typeof setTimeout>>();
const translationPlaybackRetryLimit = 8;
const translationPlaybackRetryDelayMs = 120;
const originalAudioSilenceRetryTimers = new Map<string, ReturnType<typeof setTimeout>>();
const originalAudioSilenceRetryLimit = 8;
const originalAudioSilenceRetryDelayMs = 120;

const getTranslationAudioElements = () => {
  if (typeof document === 'undefined') {
    return [] as HTMLAudioElement[];
  }

  return Array.from(
    document.querySelectorAll<HTMLAudioElement>('audio[data-translation-audio-player="true"]'),
  );
};

const tryPlayTranslationAudioElements = () => {
  let hasStartedPlayback = false;

  getTranslationAudioElements().forEach((audioElement) => {
    if (!audioElement.srcObject) {
      return;
    }

    if (audioElement.paused) {
      audioElement.play().catch(() => {});
    }

    const hasCurrentData = typeof HTMLMediaElement === 'undefined'
      || audioElement.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;

    if (!audioElement.paused && hasCurrentData) {
      hasStartedPlayback = true;
    }
  });

  return hasStartedPlayback;
};

const scheduleTranslationPlaybackPriming = (speakerId: string) => {
  if (translationPlaybackRetryTimers.has(speakerId)) {
    tryPlayTranslationAudioElements();
    return;
  }

  translationStreams.value = prepareRenderableList([...translationStreams.value]);

  const run = (attempt = 0) => {
    translationPlaybackRetryTimers.delete(speakerId);

    if (tryPlayTranslationAudioElements() || attempt >= translationPlaybackRetryLimit) {
      return;
    }

    const timer = setTimeout(() => run(attempt + 1), translationPlaybackRetryDelayMs);
    translationPlaybackRetryTimers.set(speakerId, timer);
  };

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => run());
  } else {
    run();
  }
};

const clearTranslationPlaybackPriming = () => {
  translationPlaybackRetryTimers.forEach((timer) => clearTimeout(timer));
  translationPlaybackRetryTimers.clear();
};

// Transports
const transportCreated = ref<boolean>(false);
const localTransportCreated = ref<boolean>(false);
const transportCreatedVideo = ref<boolean>(false);
const transportCreatedAudio = ref<boolean>(false);
const transportCreatedScreen = ref<boolean>(false);
const producerTransport = shallowRef<Transport | null>(null);
const localProducerTransport = shallowRef<Transport | null>(null);
const videoProducer = shallowRef<Producer | null>(null);
const localVideoProducer = shallowRef<Producer | null>(null);
const params = ref<ProducerOptions>({} as ProducerOptions);
const videoParams = ref<ProducerOptions>({} as ProducerOptions);
const audioParams = ref<ProducerOptions>({} as ProducerOptions);
const audioProducer = shallowRef<Producer | null>(null);
const audioLevel = ref<number>(0);
const localAudioProducer = shallowRef<Producer | null>(null);
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
  ...sidebarThemeVars.value,
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

const updatePanelists = (value: Participant[]) => {
  panelists.value = value;
};

const updatePanelistsFocused = (value: boolean) => {
  panelistsFocused.value = value;
};

const updateMuteOthersMic = (value: boolean) => {
  muteOthersMic.value = value;
};

const updateMuteOthersCamera = (value: boolean) => {
  muteOthersCamera.value = value;
};

const updatePermissionConfig = (value: PermissionConfig) => {
  permissionConfig.value = value;
};

const updateTranslationSupported = (value: boolean) => {
  translationSupported.value = value;
};

const updateTranslationConfig = (value: TranslationRoomConfig) => {
  translationConfig.value = value;
};

const updateMySpokenLanguage = (value: string) => {
  mySpokenLanguage.value = value;
};

const updateMySpokenLanguageEnabled = (value: boolean) => {
  mySpokenLanguageEnabled.value = value;
};

const updateMyDefaultOutputLanguage = (value: string | null) => {
  myDefaultOutputLanguage.value = value;
};

const updateMyDefaultListenLanguage = (value: string | null) => {
  myDefaultListenLanguage.value = value;
};

const updateListenPreferences = (updater: (prev: Map<string, string>) => Map<string, string>) => {
  listenPreferences.value = updater(listenPreferences.value);
};

const updateTranslationProducerMap = (updater: (prev: TranslationProducerMap) => TranslationProducerMap) => {
  translationProducerMap.value = updater(translationProducerMap.value);
};

const updateAvailableTranslationChannels = (
  speakerId: string,
  languages: string[],
  originalProducerId: string,
) => {
  const next = new Map(availableTranslationChannels.value);
  next.set(speakerId, { languages, originalProducerId });
  availableTranslationChannels.value = next;
};

const updateParticipantTranslationState = (memberId: string, state: unknown) => {
  const next = new Map(participantTranslationStates.value);
  next.set(memberId, state);
  participantTranslationStates.value = next;
};

const updateTranscripts = (
  updater: (prev: TranslationTranscriptData[]) => TranslationTranscriptData[],
) => {
  transcripts.value = updater(transcripts.value);
};

const updateShowSubtitlesOnCardsState = (value: boolean) => {
  showSubtitlesOnCards.value = value;
  liveSubtitleState.setShowSubtitlesOnCards(value);

  if (!value) {
    liveSubtitleState.setLiveSubtitles(new Map());
  }
};

liveSubtitleState.setShowSubtitlesOnCards(showSubtitlesOnCards.value);

const updateLiveSubtitleFromTranscript = (transcript: TranslationTranscriptData) => {
  if (!showSubtitlesOnCards.value || !transcript.speakerId) {
    return;
  }

  const subtitle = liveSubtitleState.updateFromTranscript(transcript);
  const cleanupDelay = Math.max(subtitle.expiresAt - Date.now() + 100, 100);

  setTimeout(() => {
    liveSubtitleState.clearExpiredSubtitles();
  }, cleanupDelay);
};

const updateSpeakerTranslationState = (
  speakerId: string,
  outputLanguage: string | null,
  originalProducerId: string,
  options: SpeakerTranslationStateUpdateOptions = {},
) => {
  const next = new Map(speakerTranslationStates.value);

  if (outputLanguage) {
    next.set(speakerId, {
      speakerId,
      speakerName: options.speakerName ?? speakerId,
      inputLanguage: options.inputLanguage ?? 'en',
      outputLanguage,
      originalProducerId,
      enabled: options.enabled ?? true,
    });
  } else {
    next.delete(speakerId);
  }

  speakerTranslationStates.value = next;
};

const syncSpeakerTranslationStatesFromMembers = (members: Participant[]) => {
  members.forEach((participant) => {
    const translationParticipant = participant as TranslationAwareParticipant;
    const speakerId = translationParticipant.name;

    if (!speakerId || speakerId === member.value) {
      return;
    }

    if (
      translationParticipant.translationEnabled &&
      translationParticipant.translationDefaultOutputLanguage &&
      translationParticipant.translationOriginalProducerId
    ) {
      updateSpeakerTranslationState(
        speakerId,
        translationParticipant.translationDefaultOutputLanguage,
        translationParticipant.translationOriginalProducerId,
        {
          speakerName: speakerId,
          inputLanguage: translationParticipant.translationInputLanguage ?? 'en',
          enabled: true,
        },
      );
    }
  });
};

const resolveOriginalProducerIdForSpeaker = (speakerId: string): string | null => {
  const candidates = getOriginalProducerCandidatesForSpeaker(speakerId);
  return candidates.find(hasOriginalAudioTransport) ?? candidates[0] ?? null;
};

const hasOriginalAudioTransport = (producerId: string) =>
  consumerTransports.value.some(
    (transport) =>
      transport.producerId === producerId &&
      transport.consumer?.kind === 'audio' &&
      !activeTranslationProducerIds.value.has(producerId),
  );

const addProducerCandidate = (candidates: string[], producerId?: string | null) => {
  if (producerId && !candidates.includes(producerId)) {
    candidates.push(producerId);
  }
};

const getOriginalProducerCandidatesForSpeaker = (
  speakerId?: string,
  preferredProducerId?: string,
) => {
  const candidates: string[] = [];
  addProducerCandidate(candidates, preferredProducerId);

  if (!speakerId) {
    return candidates;
  }

  const activeSpeakerState = speakerTranslationStates.value.get(speakerId);
  addProducerCandidate(candidates, activeSpeakerState?.originalProducerId);

  const availableChannel = availableTranslationChannels.value.get(speakerId);
  addProducerCandidate(candidates, availableChannel?.originalProducerId);

  const participant = participants.value.find((entry) => {
    const maybeParticipant = entry as Participant & { id?: string };
    return maybeParticipant.name === speakerId || maybeParticipant.id === speakerId;
  });
  addProducerCandidate(candidates, participant?.audioID);

  const namedAudioStreams = (audStreamNames.value as (Participant | Stream)[]).filter(
    (stream) => stream.name === speakerId,
  );
  namedAudioStreams.forEach((stream) => addProducerCandidate(candidates, stream.producerId));

  const audioStreams = (allAudioStreams.value as (Participant | Stream)[]).filter(
    (stream) => stream.name === speakerId || stream.producerId?.includes?.(speakerId),
  );
  audioStreams.forEach((stream) => addProducerCandidate(candidates, stream.producerId));

  return candidates;
};

const resolveActiveOriginalProducerId = (
  originalProducerId: string,
  speakerId?: string,
) => {
  const candidates = getOriginalProducerCandidatesForSpeaker(speakerId, originalProducerId);
  return candidates.find(hasOriginalAudioTransport) ?? candidates[0] ?? originalProducerId;
};

const applyOriginalAudioPlaybackSilenced = (producerId: string, silenced: boolean) => {
  const transport = consumerTransports.value.find(
    (item) => item.producerId === producerId && item.consumer?.kind === 'audio',
  );
  const track = transport?.consumer?.track;

  if (track) {
    track.enabled = !silenced;
  }

  if (typeof document === 'undefined') {
    return;
  }

  document
    .querySelectorAll<HTMLAudioElement>('audio[data-mini-audio-player="true"]')
    .forEach((audioElement) => {
      if (audioElement.dataset.producerId !== producerId) {
        return;
      }

      if (silenced) {
        audioElement.pause();
        audioElement.muted = true;
        return;
      }

      audioElement.muted = false;
      if (audioElement.srcObject) {
        audioElement.play().catch(() => {});
      }
    });
};

const setOriginalAudioPlaybackSilenced = (producerId: string, silenced: boolean) => {
  const existingTimer = originalAudioSilenceRetryTimers.get(producerId);
  if (existingTimer) {
    clearTimeout(existingTimer);
    originalAudioSilenceRetryTimers.delete(producerId);
  }

  applyOriginalAudioPlaybackSilenced(producerId, silenced);

  if (!silenced) {
    return;
  }

  const retry = (attempt = 0) => {
    originalAudioSilenceRetryTimers.delete(producerId);
    applyOriginalAudioPlaybackSilenced(producerId, true);

    if (attempt >= originalAudioSilenceRetryLimit) {
      return;
    }

    const timer = setTimeout(
      () => retry(attempt + 1),
      originalAudioSilenceRetryDelayMs,
    );
    originalAudioSilenceRetryTimers.set(producerId, timer);
  };

  const timer = setTimeout(() => retry(1), originalAudioSilenceRetryDelayMs);
  originalAudioSilenceRetryTimers.set(producerId, timer);
};

const clearOriginalAudioSilenceRetries = () => {
  originalAudioSilenceRetryTimers.forEach((timer) => clearTimeout(timer));
  originalAudioSilenceRetryTimers.clear();
};

const getTranslationSwitchParameters = (): TranslationConsumerSwitchParameters => ({
  ...getAllParams(),
  ...mediaSFUFunctions(),
  participants: participants.value,
  ref_participants: ref_participants.value,
});

const removeTranslationStream = (producerId: string) => {
  const translationKey = `translation-${producerId}`;
  const legacyAudioKey = `audio-${producerId}`;

  translationStreams.value = prepareRenderableList(
    translationStreams.value.filter((item) => item.key !== translationKey),
  );
  audioOnlyStreams.value = prepareRenderableList(
    audioOnlyStreams.value.filter((item) => item.key !== legacyAudioKey),
  );
  allAudioStreams.value = allAudioStreams.value.filter((stream) => stream.producerId !== producerId);
  audStreamNames.value = audStreamNames.value.filter((stream) => stream.producerId !== producerId);
};

const closeTranslationConsumerByProducerId = async (producerId: string): Promise<boolean> => {
  const transportIndex = consumerTransports.value.findIndex(
    (item) => item.producerId === producerId,
  );

  if (transportIndex === -1) return false;

  const transport = consumerTransports.value[transportIndex]!;

  if (transport.socket_ && transport.serverConsumerTransportId) {
    transport.socket_.emit(
      'consumer-close',
      { serverConsumerId: transport.serverConsumerTransportId },
      () => {},
    );
  }

  transport.consumer?.close();
  consumerTransports.value = consumerTransports.value.filter((_, index) => index !== transportIndex);
  consumingTransports.value = consumingTransports.value.filter((activeProducerId) => activeProducerId !== producerId);
  activeTranslationProducerIds.value.delete(producerId);
  removeTranslationStream(producerId);

  return true;
};

const pauseTranslatedOriginalsForMembers = async (members: Participant[]) => {
  for (const participant of members) {
    const translationParticipant = participant as TranslationAwareParticipant;
    const speakerId = translationParticipant.name;

    if (
      !speakerId ||
      speakerId === member.value ||
      !translationParticipant.translationEnabled ||
      !translationParticipant.translationDefaultOutputLanguage ||
      !translationParticipant.translationOriginalProducerId
    ) {
      continue;
    }

    await pauseOriginalTranslationProducer(
      translationParticipant.translationOriginalProducerId,
      speakerId,
    );
  }
};

const startConsumingTranslation = async (
  producerId: string,
  speakerId: string,
  language: string,
  _originalProducerId?: string,
  nsock?: MediaSFUSocket,
) => {
  const originalProducerId = _originalProducerId;

  if (originalProducerId) {
    const existingTranslations = translationProducerMap.value?.[originalProducerId];
    if (existingTranslations) {
      const languagesToClose: string[] = [];

      for (const [existingLanguage, existingProducerId] of Object.entries(existingTranslations)) {
        if (
          existingProducerId === producerId ||
          existingLanguage.toLowerCase() === language.toLowerCase()
        ) {
          continue;
        }

        const didClose = await closeTranslationConsumerByProducerId(existingProducerId);
        if (didClose) {
          languagesToClose.push(existingLanguage);
        }
      }

      if (languagesToClose.length > 0) {
        updateTranslationProducerMap((prev) => {
          const next = { ...prev };
          const currentMap = { ...(next[originalProducerId] || {}) };

          languagesToClose.forEach((existingLanguage) => {
            delete currentMap[existingLanguage];
          });

          if (Object.keys(currentMap).length === 0) {
            delete next[originalProducerId];
          } else {
            next[originalProducerId] = currentMap;
          }

          return next;
        });
      }
    }
  }

  activeTranslationProducerIds.value.add(producerId);

  const activeSocket = (nsock ?? (socket.value as unknown as MediaSFUSocket));
  if (!activeSocket?.emit) return;

  if (originalProducerId) {
    await pauseOriginalTranslationProducer(originalProducerId, speakerId);
  }

  const signalParameters = getCastedParameters();
  signalParameters.activeTranslationProducerIds = activeTranslationProducerIds.value;

  await signalNewConsumerTransport({
    remoteProducerId: producerId,
    islevel: islevel.value,
    nsock: activeSocket,
    parameters: signalParameters,
  });

  if (originalProducerId) {
    updateTranslationProducerMap((prev) => ({
      ...prev,
      [originalProducerId]: {
        ...(prev[originalProducerId] || {}),
        [language]: producerId,
      },
    }));
  }
};

const pauseOriginalTranslationProducer = async (
  originalProducerId: string,
  speakerId?: string,
) => {
  const candidateProducerIds = getOriginalProducerCandidatesForSpeaker(speakerId, originalProducerId);
  const resolvedOriginalProducerId = resolveActiveOriginalProducerId(originalProducerId, speakerId);

  [...new Set([...candidateProducerIds, resolvedOriginalProducerId])].forEach((producerId) => {
    setOriginalAudioPlaybackSilenced(producerId, true);
  });

  await sharedPauseOriginalProducer({
    originalProducerId: resolvedOriginalProducerId,
    speakerId,
    parameters: getTranslationSwitchParameters(),
  });
};

const resumeOriginalTranslationProducer = async (
  originalProducerId: string,
  speakerId?: string,
) => {
  const candidateProducerIds = getOriginalProducerCandidatesForSpeaker(speakerId, originalProducerId);
  const resolvedOriginalProducerId = resolveActiveOriginalProducerId(originalProducerId, speakerId);
  const producerIdsToResume = [...new Set([...candidateProducerIds, resolvedOriginalProducerId])];
  const hasRemainingTranslations = producerIdsToResume.some((producerId) => {
    const remainingTranslations = translationProducerMap.value?.[producerId];
    return remainingTranslations && Object.keys(remainingTranslations).length > 0;
  });

  if (hasRemainingTranslations) {
    return;
  }

  await sharedResumeOriginalProducer({
    originalProducerId: resolvedOriginalProducerId,
    speakerId,
    parameters: getTranslationSwitchParameters(),
  });

  producerIdsToResume.forEach((producerId) => {
    setOriginalAudioPlaybackSilenced(producerId, false);
  });
};

const stopConsumingTranslationProducer = async (producerId: string) => {
  await closeTranslationConsumerByProducerId(producerId);
};

const stopConsumingTranslationSelection = async (speakerId: string, language: string) => {
  const originalProducerId = resolveOriginalProducerIdForSpeaker(speakerId);
  const producerId = originalProducerId ? translationProducerMap.value?.[originalProducerId]?.[language] : undefined;

  const resumedOriginalProducerId = await sharedStopConsumingTranslation({
    speakerId,
    language,
    translationProducerMap: translationProducerMap.value,
    parameters: getTranslationSwitchParameters(),
  });

  if (resumedOriginalProducerId) {
    updateTranslationProducerMap((prev) => {
      const next = { ...prev };
      if (!next[resumedOriginalProducerId]) {
        return next;
      }

      const remaining = { ...next[resumedOriginalProducerId] };
      delete remaining[language];

      if (Object.keys(remaining).length === 0) {
        delete next[resumedOriginalProducerId];
      } else {
        next[resumedOriginalProducerId] = remaining;
      }

      return next;
    });

    await resumeOriginalTranslationProducer(resumedOriginalProducerId, speakerId);
  }

  if (!producerId) return;

  consumingTransports.value = consumingTransports.value.filter((activeProducerId) => activeProducerId !== producerId);
};

const stopConsumingTranslationForSpeaker = async (speakerId: string) => {
  const originalProducerId = resolveOriginalProducerIdForSpeaker(speakerId);
  if (!originalProducerId) return;

  const languageMap = translationProducerMap.value?.[originalProducerId] || {};
  for (const producerId of Object.values(languageMap)) {
    await stopConsumingTranslationProducer(producerId);
  }

  updateTranslationProducerMap((prev) => {
    const next = { ...prev };
    delete next[originalProducerId];
    return next;
  });
};

const updateIsMenuModalVisible = (value: boolean) => {
  isMenuModalVisible.value = value;
};

const updateIsRecordingModalVisible = (value: boolean) => {
  if (value && shouldRouteToHostedSurface.value) {
    updateActiveSidebarContent('recording');
    return;
  }

  isRecordingModalVisible.value = value;
  if (value) {
    confirmedToRecord.value = false;
  } else {
    if (activeSidebarContent.value === 'recording') {
      closeSidebar();
    }

    if (clearedToRecord.value && clearedToResume.value && recordStarted.value) {
      showRecordButtons.value = true;
    }
  }
};

const updateIsSettingsModalVisible = (value: boolean) => {
  if (value && shouldRouteToHostedSurface.value) {
    isSettingsModalVisible.value = false;
    sidebarNavigationStack.value = [];
    activeSidebarContent.value = 'eventSettings';
    scheduleResize();
    return;
  }

  isSettingsModalVisible.value = value;

  if (!value && activeSidebarContent.value === 'eventSettings') {
    closeSidebar();
  }
};

const updateIsRequestsModalVisible = (value: boolean) => {
  if (value && shouldRouteToHostedSurface.value) {
    isRequestsModalVisible.value = false;
    sidebarNavigationStack.value = [];
    activeSidebarContent.value = 'requests';
    scheduleResize();
    return;
  }

  isRequestsModalVisible.value = value;

  if (!value && activeSidebarContent.value === 'requests') {
    closeSidebar();
  }
};

const updateIsWaitingModalVisible = (value: boolean) => {
  if (value && shouldRouteToHostedSurface.value) {
    isWaitingModalVisible.value = false;
    sidebarNavigationStack.value = [];
    activeSidebarContent.value = 'waiting';
    scheduleResize();
    return;
  }

  isWaitingModalVisible.value = value;

  if (!value && activeSidebarContent.value === 'waiting') {
    closeSidebar();
  }
};

const updateIsCoHostModalVisible = (value: boolean) => {
  if (value && shouldRouteToHostedSurface.value) {
    isCoHostModalVisible.value = false;
    sidebarNavigationStack.value = [];
    activeSidebarContent.value = 'coHost';
    scheduleResize();
    return;
  }

  isCoHostModalVisible.value = value;

  if (!value && activeSidebarContent.value === 'coHost') {
    closeSidebar();
  }
};

const updateIsMediaSettingsModalVisible = (value: boolean) => {
  if (value && shouldRouteToHostedSurface.value) {
    isMediaSettingsModalVisible.value = false;

    sidebarNavigationStack.value = [];
    activeSidebarContent.value = 'mediaSettings';
    scheduleResize();
    return;
  }

  isMediaSettingsModalVisible.value = value;

  if (!value && activeSidebarContent.value === 'mediaSettings') {
    closeSidebar();
  }
};

const updateIsDisplaySettingsModalVisible = (value: boolean) => {
  if (value && shouldRouteToHostedSurface.value) {
    isDisplaySettingsModalVisible.value = false;
    sidebarNavigationStack.value = [];
    activeSidebarContent.value = 'displaySettings';
    scheduleResize();
    return;
  }

  isDisplaySettingsModalVisible.value = value;

  if (!value && activeSidebarContent.value === 'displaySettings') {
    closeSidebar();
  }
};

const updateIsParticipantsModalVisible = (value: boolean) => {
  if (value && shouldRouteToHostedSurface.value) {
    isParticipantsModalVisible.value = false;
    sidebarNavigationStack.value = [];
    activeSidebarContent.value = 'participants';
    scheduleResize();
    return;
  }

  isParticipantsModalVisible.value = value;

  if (!value && activeSidebarContent.value === 'participants') {
    closeSidebar();
  }
};

const updateIsPermissionsModalVisible = (value: boolean) => {
  if (value && shouldRouteToHostedSurface.value) {
    isPermissionsModalVisible.value = false;
    sidebarNavigationStack.value = [];
    activeSidebarContent.value = 'permissions';
    scheduleResize();
    return;
  }

  isPermissionsModalVisible.value = value;

  if (!value && activeSidebarContent.value === 'permissions') {
    closeSidebar();
  }
};

const updateIsPanelistsModalVisible = (value: boolean) => {
  if (value && shouldRouteToHostedSurface.value) {
    isPanelistsModalVisible.value = false;
    sidebarNavigationStack.value = [];
    activeSidebarContent.value = 'panelists';
    scheduleResize();
    return;
  }

  isPanelistsModalVisible.value = value;

  if (!value && activeSidebarContent.value === 'panelists') {
    closeSidebar();
  }
};

const updateIsTranslationSettingsModalVisible = (value: boolean) => {
  if (value && shouldRouteToHostedSurface.value) {
    isTranslationSettingsModalVisible.value = false;
    sidebarNavigationStack.value = [];
    activeSidebarContent.value = 'translation';
    scheduleResize();
    return;
  }

  isTranslationSettingsModalVisible.value = value;

  if (!value && activeSidebarContent.value === 'translation') {
    closeSidebar();
  }
};

const updateIsMessagesModalVisible = (value: boolean) => {
  if (value && shouldRouteToHostedSurface.value) {
    isMessagesModalVisible.value = false;
    sidebarNavigationStack.value = [];
    activeSidebarContent.value = 'messages';
    scheduleResize();
    return;
  }

  isMessagesModalVisible.value = value;
  if (!value) {
    showMessagesBadge.value = false;

    if (activeSidebarContent.value === 'messages') {
      closeSidebar();
    }
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
  if (value && shouldRouteToHostedSurface.value) {
    isShareEventModalVisible.value = false;
    sidebarNavigationStack.value = [];
    activeSidebarContent.value = 'shareEvent';
    scheduleResize();
    return;
  }

  isShareEventModalVisible.value = value;

  if (!value && activeSidebarContent.value === 'shareEvent') {
    closeSidebar();
  }
};

const updateIsPollModalVisible = (value: boolean) => {
  if (value && shouldRouteToHostedSurface.value) {
    isPollModalVisible.value = false;
    sidebarNavigationStack.value = [];
    activeSidebarContent.value = 'polls';
    scheduleResize();
    return;
  }

  isPollModalVisible.value = value;

  if (!value && activeSidebarContent.value === 'polls') {
    closeSidebar();
  }
};

const updateIsBackgroundModalVisible = (value: boolean) => {
  isBackgroundModalVisible.value = value;
};

const updateIsBreakoutRoomsModalVisible = (value: boolean) => {
  if (value && shouldRouteToHostedSurface.value) {
    isBreakoutRoomsModalVisible.value = false;
    sidebarNavigationStack.value = [];
    activeSidebarContent.value = 'breakoutRooms';
    scheduleResize();
    return;
  }

  isBreakoutRoomsModalVisible.value = value;

  if (!value && activeSidebarContent.value === 'breakoutRooms') {
    closeSidebar();
  }
};

const updateIsConfigureWhiteboardModalVisible = (value: boolean) => {
  if (value && shouldRouteToHostedSurface.value) {
    isConfigureWhiteboardModalVisible.value = false;
    sidebarNavigationStack.value = [];
    activeSidebarContent.value = 'configureWhiteboard';
    scheduleResize();
    return;
  }

  isConfigureWhiteboardModalVisible.value = value;

  if (!value && activeSidebarContent.value === 'configureWhiteboard') {
    closeSidebar();
  }
};

const updateIsScreenboardModalVisible = (value: boolean) => {
  isScreenboardModalVisible.value = value;
};

const updateIsWhiteboardModalVisible = (value: boolean) => {
  isWhiteboardModalVisible.value = value;
};

const clearSidebarModalFlags = () => {
  isMenuModalVisible.value = false;
  isParticipantsModalVisible.value = false;
  isMessagesModalVisible.value = false;
  isRequestsModalVisible.value = false;
  isWaitingModalVisible.value = false;
  isCoHostModalVisible.value = false;
  isMediaSettingsModalVisible.value = false;
  isDisplaySettingsModalVisible.value = false;
  isSettingsModalVisible.value = false;
  isRecordingModalVisible.value = false;
  isPollModalVisible.value = false;
  isBreakoutRoomsModalVisible.value = false;
  isShareEventModalVisible.value = false;
  isConfigureWhiteboardModalVisible.value = false;
  isPermissionsModalVisible.value = false;
  isPanelistsModalVisible.value = false;
  isTranslationSettingsModalVisible.value = false;
  confirmedToRecord.value = false;
};

const closeSidebar = () => {
  activeSidebarContent.value = 'none';
  sidebarNavigationStack.value = [];
  scheduleResize();
};

function runSidebarContentPreflight(content: SidebarContentType): boolean {
  if (content === 'recording') {
    return prepareRecordingSidebar();
  }

  if (content === 'background') {
    updateIsBackgroundModalVisible(true);
  }

  if (content === 'mediaSettings') {
    void launchMediaSettingsFlow();
  }

  return true;
}

const updateActiveSidebarContent = (content: SidebarContentType, pushToStack = false) => {
  if (!validated.value || !returnUI.value) {
    activeSidebarContent.value = 'none';
    sidebarNavigationStack.value = [];
    return;
  }

  if (activeSidebarContent.value === content) {
    closeSidebar();
    return;
  }

  if (!runSidebarContentPreflight(content)) {
    return;
  }

  if (pushToStack && activeSidebarContent.value !== 'none') {
    sidebarNavigationStack.value = [...sidebarNavigationStack.value, activeSidebarContent.value];
  } else if (!pushToStack) {
    sidebarNavigationStack.value = [];
  }

  clearSidebarModalFlags();
  activeSidebarContent.value = content;
  scheduleResize();
};

const sidebarNavigateBack = () => {
  const previousStack = [...sidebarNavigationStack.value];
  const previousContent = previousStack.pop();

  if (previousContent) {
    sidebarNavigationStack.value = previousStack;
    activeSidebarContent.value = previousContent;
  } else {
    closeSidebar();
  }
};

watch(shouldUseSidebar, () => {
  if (activeSidebarContent.value !== 'none') {
    scheduleResize();
  }
});

watch(modernMenuDarkMode, () => {
  if (validated.value && returnUI.value) {
    scheduleResize();
  }
});

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

const getTranslationSubscriptions = () => new Map(
  Array.from(listenPreferences.value.entries())
    .filter(([, language]) => typeof language === 'string' && language.length > 0)
    .map(([speakerId, language]) => [
      `${speakerId}_${language.toLowerCase()}`,
      { speakerId, language: language.toLowerCase() },
    ]),
);

const getListenerTranslationPreferences = () => ({
  perSpeaker: new Map(
    Array.from(listenPreferences.value.entries())
      .filter(([, language]) => typeof language === 'string' && language.length > 0)
      .map(([speakerId, language]) => [
        speakerId,
        { speakerId, language, wantOriginal: false },
      ]),
  ),
  globalLanguage: myDefaultListenLanguage.value,
});

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
    isDarkModeValue: modernMenuDarkMode.value,
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
    translationStreams: translationStreams.value,
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
    isPermissionsModalVisible: isPermissionsModalVisible.value,
    isPanelistsModalVisible: isPanelistsModalVisible.value,
    isTranslationSettingsModalVisible: isTranslationSettingsModalVisible.value,
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
    panelists: panelists.value,
    panelistsFocused: panelistsFocused.value,
    muteOthersMic: muteOthersMic.value,
    muteOthersCamera: muteOthersCamera.value,
    permissionConfig: permissionConfig.value,
    translationSupported: translationSupported.value,
    translationConfig: translationConfig.value,
    isPersonalTranslation: isPersonalTranslation.value,
    canUsePersonalTranslation: props.canUsePersonalTranslation,
    personalTranslationUsername: props.personalTranslationUsername,
    userVoiceClones: props.userVoiceClones,
    mySpokenLanguage: mySpokenLanguage.value,
    mySpokenLanguageEnabled: mySpokenLanguageEnabled.value,
    myDefaultOutputLanguage: myDefaultOutputLanguage.value,
    myDefaultListenLanguage: myDefaultListenLanguage.value,
    listenPreferences: listenPreferences.value,
    translationProducerMap: translationProducerMap.value,
    activeTranslationProducerIds: activeTranslationProducerIds.value,
    translationSubscriptions: getTranslationSubscriptions(),
    availableTranslationChannels: availableTranslationChannels.value,
    participantTranslationStates: participantTranslationStates.value,
    transcripts: transcripts.value,
    getLiveSubtitleForSpeaker: liveSubtitleState.getSubtitleForSpeaker,
    showSubtitlesOnCards: showSubtitlesOnCards.value,
    speakerTranslationStates: speakerTranslationStates.value,
    listenerTranslationPreferences: getListenerTranslationPreferences(),
    startConsumingTranslation,
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
          youAreHost.value = parts[1] === '2';
        }
        value = parts[0] || value;
      }
      member.value = value;
    },
    updateAdminPasscode: (value: string) => (adminPasscode.value = value),
    updateYouAreCoHost: (value: boolean) => (youAreCoHost.value = value),
    updateYouAreHost: (value: boolean) => (youAreHost.value = value),
    updateIslevel: (value: string) => {
      islevel.value = value;
      youAreHost.value = value === '2';
    },
    updateCoHost,
    updateCoHostResponsibility,
    updateConfirmedToRecord: (value: boolean) => (confirmedToRecord.value = value),
    updateMeetingDisplayType: (value: string) => (meetingDisplayType.value = value),
    updateMeetingVideoOptimized: (value: boolean) => (meetingVideoOptimized.value = value),
    updateEventType: (value: EventType) => {
      eventType.value = value;
      if (value !== 'none') {
        if (value === 'webinar') {
          mainHeightWidth.value = 67;
          prevMainHeightWidth.value = 67;
          meetingDisplayType.value = 'all';
        } else if (value === 'broadcast') {
          mainHeightWidth.value = 100;
          prevMainHeightWidth.value = 100;
        } else {
          mainHeightWidth.value = 0;
          prevMainHeightWidth.value = 0;
          meetingDisplayType.value = 'all';
        }

        try {
          setTimeout(() => {
            onResize();
          }, 1000);
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
    updateTranslationStreams: (value: RenderableListSource | null | undefined) => {
      translationStreams.value = Array.isArray(value)
        ? prepareRenderableList(value as RenderableListSource)
        : emptyRenderableList();
    },
    addTranslationStream: (
      value: RenderableComponent | ReactElementLike | null | undefined,
    ) => {
      const renderable = convertToRenderableComponent(value);
      if (!renderable) {
        return;
      }

      translationStreams.value = prepareRenderableList([
        ...translationStreams.value.filter((item) => item.key !== renderable.key),
        renderable,
      ]);
    },
    removeTranslationStream,
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
    updateShowSubtitlesOnCards: updateShowSubtitlesOnCardsState,
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
    updateIsPermissionsModalVisible,
    updateIsPanelistsModalVisible,
    updateIsTranslationSettingsModalVisible,
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
    updatePanelists,
    updatePanelistsFocused,
    updateMuteOthersMic,
    updateMuteOthersCamera,
    updatePermissionConfig,
    updateTranslationSupported,
    updateTranslationConfig,
    updateMySpokenLanguage,
    updateMySpokenLanguageEnabled,
    updateMyDefaultOutputLanguage,
    updateMyDefaultListenLanguage,
    updateListenPreferences,
    updateTranslationProducerMap,
    updateAvailableTranslationChannels,
    updateParticipantTranslationState,
    updateTranscripts,
    updateSpeakerTranslationState,
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
  let nextMainHeightWidth = mainHeightWidth.value;

  if (shared.value || shareScreenStarted.value || whiteboardStarted.value) {
    nextMainHeightWidth = 84;
    if (mainHeightWidth.value !== nextMainHeightWidth) {
      mainHeightWidth.value = nextMainHeightWidth;
    }
  } else if (eventType.value === 'conference' && mainHeightWidth.value === 67) {
    nextMainHeightWidth = 0;
    mainHeightWidth.value = nextMainHeightWidth;
  }

  if (eventType.value === 'chat' && mainHeightWidth.value > 0) {
    mainHeightWidth.value = 0;
    nextMainHeightWidth = 0;
  }
  if (eventType.value === 'broadcast' && mainHeightWidth.value !== 100) {
    mainHeightWidth.value = 100;
    nextMainHeightWidth = 100;
  }

  const { mainHeight, otherHeight, mainWidth, otherWidth } = computeDimensionsMethod({
    containerWidthFraction: mainScreenWidthFraction.value,
    containerHeightFraction: 1,
    mainSize: eventType.value === 'chat' ? 0 : eventType.value === 'broadcast' ? 100 : nextMainHeightWidth,
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
  windowWidth.value = window.innerWidth;
  windowHeight.value = window.innerHeight;

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

  await syncMiniCardGridSizes();
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
    name: 'Record',
    onPress: () => {
      openRecordingPanel();
    },
    activeColor: activeNeutralControlButtonColor.value,
    inActiveColor: neutralControlButtonColor.value,
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
    activeColor: activeNeutralControlButtonColor.value,
    inActiveColor: neutralControlButtonColor.value,
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
    activeColor: '#EF4444',
    inActiveColor: '#EF4444',
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
              color: activeNeutralControlButtonColor.value,
              fontWeight: 600,
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
    activeColor: recordPaused.value === false ? '#EF4444' : '#F59E0B',
    inActiveColor: recordPaused.value === false ? 'red' : 'yellow',
    show: true,
  },
  {
    icon: faCog,
    active: false,
    onPress: () => openRecordingPanel(),
    activeColor: activeNeutralControlButtonColor.value,
    inActiveColor: neutralControlButtonColor.value,
    show: true,
  },
]);

const prepareRecordingSidebar = () => {
  if (stopLaunchRecord.value && !props.useLocalUIMode) {
    showAlert?.({
      message: 'Recording has already ended or you are not allowed to record',
      type: 'danger',
      duration: 3000,
    });
    return false;
  }

  if (recordStarted.value && !recordPaused.value) {
    showAlert?.({
      message: 'You can only re-configure recording after pausing it',
      type: 'danger',
      duration: 3000,
    });
    return false;
  }

  if (!recordingAudioSupport.value && !recordingVideoSupport.value && !props.useLocalUIMode) {
    showAlert?.({
      message: 'You are not allowed to record',
      type: 'danger',
      duration: 3000,
    });
    return false;
  }

  if (canLaunchRecord.value && !props.useLocalUIMode) {
    clearedToRecord.value = false;
    canRecord.value = false;
  }

  confirmedToRecord.value = false;
  isRecordingModalVisible.value = false;
  return true;
};

const launchMediaSettingsFlow = () => {
  launchMediaSettings({
    updateIsMediaSettingsModalVisible,
    isMediaSettingsModalVisible: isMediaSettingsModalVisible.value,
    audioInputs: audioInputs.value,
    videoInputs: videoInputs.value,
    updateAudioInputs: (value: MediaDeviceInfo[]) => (audioInputs.value = value),
    updateVideoInputs: (value: MediaDeviceInfo[]) => (videoInputs.value = value),
    mediaDevices,
  });
};

const openSidebarOrRun = (content: SidebarContentType, _modalLauncher: () => void, pushToStack = false) => {
  updateActiveSidebarContent(content, pushToStack);
};

const openMenuPanel = () =>
  openSidebarOrRun('menu', () =>
    launchMenuModal({
      updateIsMenuModalVisible,
      isMenuModalVisible: isMenuModalVisible.value,
    })
  );

const openParticipantsPanel = () =>
  openSidebarOrRun('participants', () =>
    launchParticipants({
      updateIsParticipantsModalVisible,
      isParticipantsModalVisible: isParticipantsModalVisible.value,
    })
  );

const openMessagesPanel = () =>
  openSidebarOrRun('messages', () =>
    launchMessages({
      updateIsMessagesModalVisible,
      isMessagesModalVisible: isMessagesModalVisible.value,
    })
  );

const openShareEventPanel = () =>
  openSidebarOrRun('shareEvent', () => updateIsShareEventModalVisible(!isShareEventModalVisible.value));

const openRecordingPanel = (pushToStack = false) => {
  updateActiveSidebarContent('recording', pushToStack);
};

const openEventSettingsPanel = (pushToStack = false) =>
  openSidebarOrRun('eventSettings', () =>
    launchSettings({
      updateIsSettingsModalVisible,
      isSettingsModalVisible: isSettingsModalVisible.value,
    }),
  pushToStack);

const openRequestsPanel = (pushToStack = false) =>
  openSidebarOrRun('requests', () =>
    launchRequests({
      updateIsRequestsModalVisible,
      isRequestsModalVisible: isRequestsModalVisible.value,
    }),
  pushToStack);

const openWaitingPanel = (pushToStack = false) =>
  openSidebarOrRun('waiting', () =>
    launchWaiting({
      updateIsWaitingModalVisible,
      isWaitingModalVisible: isWaitingModalVisible.value,
    }),
  pushToStack);

const openCoHostPanel = (pushToStack = false) =>
  openSidebarOrRun('coHost', () =>
    launchCoHost({
      updateIsCoHostModalVisible,
      isCoHostModalVisible: isCoHostModalVisible.value,
    }),
  pushToStack);

const openMediaSettingsPanel = (pushToStack = false) => {
  updateActiveSidebarContent('mediaSettings', pushToStack);
};

const openDisplaySettingsPanel = (pushToStack = false) =>
  openSidebarOrRun('displaySettings', () =>
    launchDisplaySettings({
      updateIsDisplaySettingsModalVisible,
      isDisplaySettingsModalVisible: isDisplaySettingsModalVisible.value,
    }),
  pushToStack);

const openPollsPanel = (pushToStack = false) =>
  openSidebarOrRun('polls', () =>
    launchPoll({
      updateIsPollModalVisible,
      isPollModalVisible: isPollModalVisible.value,
    }),
  pushToStack);

const openBreakoutRoomsPanel = (pushToStack = false) =>
  openSidebarOrRun('breakoutRooms', () =>
    launchBreakoutRooms({
      updateIsBreakoutRoomsModalVisible,
      isBreakoutRoomsModalVisible: isBreakoutRoomsModalVisible.value,
    }),
  pushToStack);

const openPermissionsPanel = (pushToStack = false) =>
  openSidebarOrRun('permissions', () => updateIsPermissionsModalVisible(true), pushToStack);

const openPanelistsPanel = (pushToStack = false) =>
  openSidebarOrRun('panelists', () => updateIsPanelistsModalVisible(true), pushToStack);

const openTranslationPanel = (pushToStack = false) =>
  openSidebarOrRun('translation', () => updateIsTranslationSettingsModalVisible(true), pushToStack);

const openConfigureWhiteboardPanel = (pushToStack = false) =>
  openSidebarOrRun('configureWhiteboard', () =>
    launchConfigureWhiteboard({
      updateIsConfigureWhiteboardModalVisible,
      isConfigureWhiteboardModalVisible: isConfigureWhiteboardModalVisible.value,
    }),
  pushToStack);

const customMenuButtons = computed<MenuCustomButton[]>(() => [
  {
    icon: faRecordVinyl,
    text: 'Record',
    action: () => {
      openRecordingPanel(true);
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
      openEventSettingsPanel(true);
    },
    show: islevel.value === '2',
  },
  {
    icon: faUsers,
    text: 'Requests',
    action: () => {
      openRequestsPanel(true);
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
      openWaitingPanel(true);
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
      openCoHostPanel(true);
    },
    show: islevel.value === '2',
  },
  {
    icon: faTools,
    text: 'Set Media',
    action: () => {
      openMediaSettingsPanel(true);
    },
    show: true,
  },
  {
    icon: faDesktop,
    text: 'Display',
    action: () => {
      openDisplaySettingsPanel(true);
    },
    show: true,
  },
  {
    icon: faPoll,
    text: 'Poll',
    action: () => {
      openPollsPanel(true);
    },
    show: true,
  },
  {
    icon: faUserFriends,
    text: 'Breakout Rooms',
    action: () => {
      openBreakoutRoomsPanel(true);
    },
    show: islevel.value === '2',
  },
  {
    icon: faUserShield,
    text: 'Permissions',
    action: () => {
      openPermissionsPanel(true);
    },
    show: islevel.value === '2',
  },
  {
    icon: faUserTie,
    text: 'Panelists',
    action: () => {
      openPanelistsPanel(true);
    },
    show: islevel.value === '2',
  },
  {
    icon: faGlobe,
    text: 'Translation',
    action: () => {
      openTranslationPanel(true);
    },
    show: translationSupported.value || props.canUsePersonalTranslation,
  },
  {
    icon: faChalkboardTeacher,
    text: 'Whiteboard',
    action: () => {
      openConfigureWhiteboardPanel(true);
    },
    show: islevel.value === '2',
  },
]);

const canUseBroadcastMediaControls = computed(() =>
  eventType.value !== 'broadcast' || (islevel.value === '2' && youAreHost.value),
);

const controlBroadcastButtons = computed<ControlButtonTouch[]>(() => [
  {
    name: modernMenuDarkMode.value ? 'Light Mode' : 'Dark Mode',
    icon: modernMenuDarkMode.value ? faSun : faMoon,
    active: true,
    alternateIcon: modernMenuDarkMode.value ? faSun : faMoon,
    onPress: () => updateModernMenuDarkMode(!modernMenuDarkMode.value),
    activeColor: activeNeutralControlButtonColor.value,
    inActiveColor: neutralControlButtonColor.value,
    show: true,
  },
  {
    name: 'People',
    icon: faUsers,
    active: true,
    alternateIcon: faUsers,
    onPress: openParticipantsPanel,
    activeColor: activeNeutralControlButtonColor.value,
    inActiveColor: neutralControlButtonColor.value,
    show: canUseBroadcastMediaControls.value,
  },
  {
    name: 'Share',
    icon: faShareAlt,
    active: true,
    alternateIcon: faShareAlt,
    onPress: openShareEventPanel,
    activeColor: activeNeutralControlButtonColor.value,
    inActiveColor: neutralControlButtonColor.value,
    show: true,
  },
  {
    name: forceFullDisplay.value ? 'Exit Full Display' : 'Full Display',
    icon: forceFullDisplay.value ? faCompress : faExpand,
    active: forceFullDisplay.value,
    alternateIcon: forceFullDisplay.value ? faCompress : faExpand,
    onPress: () => {
      forceFullDisplay.value = !forceFullDisplay.value;
      scheduleResize();
    },
    activeColor: activeNeutralControlButtonColor.value,
    inActiveColor: neutralControlButtonColor.value,
    show: canUseBroadcastMediaControls.value && videoActive.value,
  },
  {
    name: 'Chat',
    customComponent: () =>
      h('div', { style: { position: 'relative' } }, [
        h(FontAwesomeIcon, {
          icon: faComments,
          size: 'lg',
          color: neutralControlButtonColor.value,
        }),
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
    onPress: openMessagesPanel,
    show: true,
  },
  {
    name: 'Switch Camera',
    icon: faSync,
    active: true,
    alternateIcon: faSync,
    onPress: () =>
      switchVideoAlt({
  parameters: getCastedParameters(),
      }),
    activeColor: activeNeutralControlButtonColor.value,
    inActiveColor: neutralControlButtonColor.value,
    show: canUseBroadcastMediaControls.value,
  },
  {
    name: videoActive.value ? 'Video Off' : 'Video On',
    icon: faVideoSlash,
    alternateIcon: faVideo,
    active: videoActive.value,
    onPress: () =>
      clickVideo({
  parameters: getCastedParameters(),
      }),
    show: canUseBroadcastMediaControls.value,
    activeColor: 'green',
    inActiveColor: 'red',
  },
  {
    name: micActive.value ? 'Mute' : 'Unmute',
    icon: faMicrophoneSlash,
    alternateIcon: faMicrophone,
    active: micActive.value,
    onPress: () =>
      clickAudio({
  parameters: getCastedParameters(),
      }),
    activeColor: 'green',
    inActiveColor: 'red',
    show: canUseBroadcastMediaControls.value,
  },
  {
    name: 'End',
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
    name: 'Share',
    icon: faShareAlt,
    active: true,
    alternateIcon: faShareAlt,
    onPress: () => updateIsShareEventModalVisible(!isShareEventModalVisible.value),
    activeColor: '#e2e8f0',
    inActiveColor: '#e2e8f0',
    show: true,
  },
  {
    name: 'Chat',
    customComponent: () =>
      h('div', { style: { position: 'relative' } }, [
        h(FontAwesomeIcon, { icon: faComments, size: 'lg', color: '#e2e8f0' }),
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
    name: 'Switch',
    icon: faSync,
    active: true,
    alternateIcon: faSync,
    onPress: () =>
      switchVideoAlt({
  parameters: getCastedParameters(),
      }),
    activeColor: '#e2e8f0',
    inActiveColor: '#e2e8f0',
    show: true,
  },
  {
    name: videoActive.value ? 'Video Off' : 'Video On',
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
    name: micActive.value ? 'Mute' : 'Unmute',
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
    name: 'Leave',
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
    name: showButtonLabels.value ? (micActive.value ? 'Mute' : 'Unmute') : undefined,
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
    show: canUseBroadcastMediaControls.value,
  },
  {
    name: showButtonLabels.value ? (videoActive.value ? 'Video Off' : 'Video On') : undefined,
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
    show: canUseBroadcastMediaControls.value,
  },
  {
    name: showButtonLabels.value ? (screenShareActive.value ? 'Stop Share' : 'Share Screen') : undefined,
    icon: faDesktop,
    alternateIconComponent: () =>
      h('div', { style: { position: 'relative', display: 'inline-block' } }, [
        h(FontAwesomeIcon, {
          icon: faDesktop,
          size: 'lg',
          style: { color: screenShareActive.value ? '#22C55E' : neutralControlButtonColor.value },
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
    show: canUseBroadcastMediaControls.value,
  },
  {
    name: showButtonLabels.value ? 'End' : undefined,
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
    name: showButtonLabels.value ? 'People' : undefined,
    icon: faUsers,
    active: participantsActive.value,
    onPress: openParticipantsPanel,
    activeColor: activeNeutralControlButtonColor.value,
    inActiveColor: neutralControlButtonColor.value,
    disabled: false,
    show: canUseBroadcastMediaControls.value,
  },
  {
    name: showButtonLabels.value ? 'Menu' : undefined,
    customComponent: () =>
      h('div', { style: { position: 'relative' } }, [
        h(FontAwesomeIcon, { icon: faBars, size: 'lg', color: neutralControlButtonColor.value }),
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
    onPress: openMenuPanel,
    show: true,
  },
  {
    name: showButtonLabels.value ? 'Chat' : undefined,
    customComponent: () =>
      h('div', { style: { position: 'relative' } }, [
        h(FontAwesomeIcon, { icon: faComments, size: 'lg', color: neutralControlButtonColor.value }),
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
    onPress: openMessagesPanel,
    show: true,
  },
  ...(shouldUseSidebar.value
    ? [
        ...(islevel.value === '2' && recordStarted.value && !recordStopped.value
          ? [
              {
                name: showButtonLabels.value ? 'Recording' : undefined,
                customComponent: () =>
                  h(
                    'div',
                    {
                      style: {
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                      },
                    },
                    [
                      h(
                        'span',
                        {
                          style: {
                            color: recordPaused.value ? '#facc15' : '#ef4444',
                            fontSize: '12px',
                            fontWeight: '700',
                            whiteSpace: 'nowrap',
                          },
                        },
                        recordingProgressTime.value,
                      ),
                      h(FontAwesomeIcon, {
                        icon: recordPaused.value ? faPlayCircle : faPauseCircle,
                        size: 'lg',
                        color: neutralControlButtonColor.value,
                        style: { cursor: 'pointer' },
                        onClick: (event: MouseEvent) => {
                          event.stopPropagation();
                          updateRecording({
  parameters: getCastedParameters(),
                          });
                        },
                      }),
                      h(FontAwesomeIcon, {
                        icon: faStopCircle,
                        size: 'lg',
                        color: '#ef4444',
                        style: { cursor: 'pointer' },
                        onClick: (event: MouseEvent) => {
                          event.stopPropagation();
                          stopRecording({
  parameters: getCastedParameters(),
                          });
                        },
                      }),
                    ],
                  ),
                onPress: () => openRecordingPanel(),
                show: true,
              },
            ]
          : []),
        ...(islevel.value === '2' && !(recordStarted.value && !recordStopped.value)
          ? [
              {
                name: showButtonLabels.value ? 'Record' : undefined,
                icon: faRecordVinyl,
                active: false,
                onPress: () => openRecordingPanel(),
                activeColor: '#ef4444',
                inActiveColor: neutralControlButtonColor.value,
                show: true,
              },
            ]
          : []),
        {
          name: showButtonLabels.value ? 'Media' : undefined,
          icon: faCog,
          active: false,
          onPress: () => openMediaSettingsPanel(),
          activeColor: activeNeutralControlButtonColor.value,
          inActiveColor: neutralControlButtonColor.value,
          show: true,
        },
        {
          name: showButtonLabels.value ? 'Display' : undefined,
          icon: faDesktop,
          active: false,
          onPress: () => openDisplaySettingsPanel(),
          activeColor: activeNeutralControlButtonColor.value,
          inActiveColor: neutralControlButtonColor.value,
          show: true,
        },
        ...((islevel.value === '2' || youAreCoHost.value)
          ? [
              {
                name: showButtonLabels.value ? 'Requests' : undefined,
                customComponent: () =>
                  h('div', { style: { position: 'relative', display: 'inline-flex' } }, [
                    h(FontAwesomeIcon, {
                      icon: faUserPlus,
                      size: 'lg',
                      color: neutralControlButtonColor.value,
                    }),
                    requestCounter.value > 0
                      ? h(
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
                                backgroundColor: '#ef4444',
                                borderRadius: '999px',
                                padding: '3px 5px',
                                minWidth: '12px',
                                minHeight: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              },
                            },
                            h(
                              'span',
                              {
                                style: {
                                  color: 'white',
                                  fontSize: '10px',
                                  fontWeight: '700',
                                  lineHeight: '1',
                                },
                              },
                              requestCounter.value.toString(),
                            ),
                          ),
                        )
                      : null,
                  ]),
                onPress: () => openRequestsPanel(),
                show: true,
              },
            ]
          : []),
        ...((islevel.value === '2' || polls.value.length > 0)
          ? [
              {
                name: showButtonLabels.value ? 'Polls' : undefined,
                icon: faPoll,
                active: false,
                onPress: () => openPollsPanel(),
                activeColor: activeNeutralControlButtonColor.value,
                inActiveColor: neutralControlButtonColor.value,
                show: true,
              },
            ]
          : []),
        ...(islevel.value === '2'
          ? [
              {
                name: showButtonLabels.value ? 'Rooms' : undefined,
                icon: faUserFriends,
                active: false,
                onPress: () => openBreakoutRoomsPanel(),
                activeColor: activeNeutralControlButtonColor.value,
                inActiveColor: neutralControlButtonColor.value,
                show: true,
              },
            ]
          : []),
      ]
    : []),
]);

const embeddedSidebarModalProps = computed(() => ({
  backgroundColor: sidebarModalBackgroundColor,
  overlayProps: sidebarOverlayProps.value,
  contentProps: sidebarContentProps.value,
}));

const embeddedStackedSubmenuModalProps = computed(() => ({
  ...embeddedSidebarModalProps.value,
  closeButtonProps: {
    style: {
      display: 'none',
    },
    tabIndex: -1,
  },
}));

const embeddedMenuModalProps = computed(() => ({
  ...embeddedSidebarModalProps.value,
  renderMode: 'sidebar',
}));

const renderSidebarComponent = (component: unknown, props: Record<string, unknown>): VNodeChild =>
  h(component as Component, props);

const sidebarContentNode = computed<VNodeChild>(() => {
  const sharedProps = sidebarNavigationStack.value.length > 0
    ? embeddedStackedSubmenuModalProps.value
    : embeddedSidebarModalProps.value;
  const menuProps = embeddedMenuModalProps.value;

  switch (activeSidebarContent.value) {
    case 'menu':
      return renderSidebarComponent(ModernMenuModal, {
        ...menuProps,
        isDarkMode: modernMenuDarkMode.value,
        onToggleTheme: updateModernMenuDarkMode,
        isVisible: true,
        onClose: closeSidebar,
        customButtons: customMenuButtons.value,
        roomName: roomName.value,
        adminPasscode: adminPasscode.value,
        islevel: islevel.value,
        eventType: eventType.value,
        localLink: localLink.value,
      } as Record<string, unknown>);
    case 'participants':
      return renderSidebarComponent(ModernParticipantsModal, {
        ...sharedProps,
        renderMode: 'sidebar',
        isParticipantsModalVisible: true,
        onParticipantsClose: closeSidebar,
        participantsCounter: participantsCounter.value,
        onParticipantsFilterChange,
        onMuteParticipants: muteParticipants,
        onMessageParticipants: messageParticipants,
        onRemoveParticipants: removeParticipants,
        parameters: {
          updateParticipants,
          updateIsParticipantsModalVisible,
          updateDirectMessageDetails,
          updateStartDirectMessage,
          updateIsMessagesModalVisible,
          showAlert,
          filteredParticipants: filteredParticipants.value,
          participants: filteredParticipants.value,
          roomName: roomName.value,
          islevel: islevel.value,
          member: member.value,
          coHostResponsibility: coHostResponsibility.value,
          coHost: coHost.value,
          eventType: eventType.value,
          startDirectMessage: startDirectMessage.value,
          directMessageDetails: directMessageDetails.value,
          socket: castedSocket.value,
          getUpdatedAllParams: getAllParams,
        },
      } as Record<string, unknown>);
    case 'messages':
      return renderSidebarComponent(ModernMessagesModal, {
        ...sharedProps,
        renderMode: 'sidebar',
        isMessagesModalVisible: true,
        onMessagesClose: closeSidebar,
        messages: messages.value,
        eventType: eventType.value,
        member: member.value,
        islevel: islevel.value,
        coHostResponsibility: coHostResponsibility.value,
        coHost: coHost.value,
        startDirectMessage: startDirectMessage.value,
        directMessageDetails: directMessageDetails.value,
        updateStartDirectMessage,
        updateDirectMessageDetails,
        showAlert,
        roomName: roomName.value,
        socket: castedSocket.value,
        chatSetting: chatSetting.value,
      } as Record<string, unknown>);
    case 'requests':
      return renderSidebarComponent(ModernRequestsModal, {
        ...sharedProps,
        renderMode: 'sidebar',
        isRequestsModalVisible: true,
        onRequestClose: closeSidebar,
        requestCounter: requestCounter.value,
        onRequestFilterChange,
        updateRequestList,
        requestList: filteredRequestList.value,
        roomName: roomName.value,
        socket: castedSocket.value,
        parameters: {
          updateRequestCounter,
          updateRequestFilter,
          updateRequestList,
          getUpdatedAllParams,
        },
      } as Record<string, unknown>);
    case 'waiting':
      return renderSidebarComponent(ModernWaitingModal, {
        ...sharedProps,
        renderMode: 'sidebar',
        isWaitingModalVisible: true,
        onWaitingRoomClose: closeSidebar,
        waitingRoomCounter: waitingRoomCounter.value,
        onWaitingRoomFilterChange,
        waitingRoomList: filteredWaitingRoomList.value,
        updateWaitingList: updateWaitingRoomList,
        roomName: roomName.value,
        socket: castedSocket.value,
        parameters: {
          filteredWaitingRoomList: filteredWaitingRoomList.value,
          getUpdatedAllParams,
        },
      } as Record<string, unknown>);
    case 'coHost':
      return renderSidebarComponent(ModernCoHostModal, {
        ...sharedProps,
        renderMode: 'sidebar',
        isCoHostModalVisible: true,
        updateIsCoHostModalVisible,
        onCoHostClose: closeSidebar,
        coHostResponsibility: coHostResponsibility.value,
        participants: participants.value,
        currentCohost: coHost.value,
        roomName: roomName.value,
        showAlert,
        updateCoHostResponsibility,
        updateCoHost,
        socket: castedSocket.value,
      } as Record<string, unknown>);
    case 'mediaSettings':
      return renderSidebarComponent(ModernMediaSettingsModal, {
        ...sharedProps,
        renderMode: 'sidebar',
        isMediaSettingsModalVisible: true,
        onMediaSettingsClose: closeSidebar,
        parameters: allParameters.value,
      } as Record<string, unknown>);
    case 'displaySettings':
      return renderSidebarComponent(ModernDisplaySettingsModal, {
        ...sharedProps,
        renderMode: 'sidebar',
        isDisplaySettingsModalVisible: true,
        onDisplaySettingsClose: closeSidebar,
        parameters: allParameters.value,
      } as Record<string, unknown>);
    case 'eventSettings':
      return renderSidebarComponent(ModernEventSettingsModal, {
        ...sharedProps,
        renderMode: 'sidebar',
        isEventSettingsModalVisible: true,
        updateIsSettingsModalVisible,
        onEventSettingsClose: closeSidebar,
        audioSetting: audioSetting.value,
        videoSetting: videoSetting.value,
        screenshareSetting: screenshareSetting.value,
        chatSetting: chatSetting.value,
        updateAudioSetting,
        updateVideoSetting,
        updateScreenshareSetting,
        updateChatSetting,
        roomName: roomName.value,
        socket: castedSocket.value,
      } as Record<string, unknown>);
    case 'recording':
      return renderSidebarComponent(ModernRecordingModal, {
        ...sharedProps,
        renderMode: 'sidebar',
        isRecordingModalVisible: true,
        onClose: closeSidebar,
        startRecording,
        confirmRecording,
        parameters: allParameters.value,
      } as Record<string, unknown>);
    case 'polls':
      return renderSidebarComponent(ModernPollModal, {
        ...sharedProps,
        renderMode: 'sidebar',
        isDarkMode: modernMenuDarkMode.value,
        isPollModalVisible: true,
        onClose: closeSidebar,
        member: member.value,
        islevel: islevel.value,
        polls: polls.value,
        poll: poll.value,
        socket: castedSocket.value,
        roomName: roomName.value,
        showAlert,
        updateIsPollModalVisible,
        handleCreatePoll,
        handleEndPoll,
        handleVotePoll,
      } as Record<string, unknown>);
    case 'breakoutRooms':
      return renderSidebarComponent(ModernBreakoutRoomsModal, {
        ...sharedProps,
        isVisible: true,
        renderMode: 'sidebar',
        onBreakoutRoomsClose: closeSidebar,
        parameters: allParameters.value,
      } as Record<string, unknown>);
    case 'shareEvent':
      return renderSidebarComponent(ModernShareEventModal, {
        ...sharedProps,
        renderMode: 'sidebar',
        isShareEventModalVisible: true,
        onShareEventClose: closeSidebar,
        roomName: roomName.value,
        islevel: islevel.value,
        adminPasscode: adminPasscode.value,
        eventType: eventType.value,
        localLink: localLink.value,
      } as Record<string, unknown>);
    case 'configureWhiteboard':
      return renderSidebarComponent(ModernConfigureWhiteboardModal, {
        ...sharedProps,
        renderMode: 'sidebar',
        isVisible: true,
        onConfigureWhiteboardClose: closeSidebar,
        parameters: allParameters.value,
      } as Record<string, unknown>);
    case 'permissions':
      return renderSidebarComponent(ModernPermissionsModal, {
        ...sharedProps,
        renderMode: 'sidebar',
        isPermissionsModalVisible: true,
        onPermissionsClose: closeSidebar,
        parameters: allParameters.value,
      } as Record<string, unknown>);
    case 'panelists':
      return renderSidebarComponent(ModernPanelistsModal, {
        ...sharedProps,
        renderMode: 'sidebar',
        isPanelistsModalVisible: true,
        onPanelistsClose: closeSidebar,
        parameters: allParameters.value,
      } as Record<string, unknown>);
    case 'translation':
      return renderSidebarComponent(ModernTranslationSettingsModal, {
        ...sharedProps,
        renderMode: 'sidebar',
        isTranslationSettingsModalVisible: true,
        onTranslationSettingsClose: closeSidebar,
        parameters: allParameters.value,
      } as Record<string, unknown>);
    default:
      return null;
  }
});

const SidebarContentRenderer = defineComponent({
  name: 'SidebarContentRenderer',
  setup() {
    return () => sidebarContentNode.value;
  },
});

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
        youAreHost.value = true;
        islevel.value = '2';
      } else {
        youAreHost.value = false;
        islevel.value = '1';
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
      if (roomData.value) {
        await updateAndComplete(roomData.value);
        return;
      }
    }

    try {
      if (showAlert) {
        showAlert({
          message: data?.reason ?? 'Unable to join room.',
          type: 'danger',
          duration: 3000,
        });
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
        (socket)[ip].removeAllListeners?.();
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

const closeProducerInstance = (producer: Producer | null | undefined) => {
  if (!producer) {
    return;
  }

  try {
    if (!producer.closed) {
      producer.close();
    }
  } catch (error) {
    console.log('error closing producer', error);
  }
};

const closeTransportInstance = (transport: Transport | null | undefined) => {
  if (!transport) {
    return;
  }

  try {
    if (!transport.closed) {
      transport.close();
    }
  } catch (error) {
    console.log('error closing transport', error);
  }
};

const disconnectSocketInstance = (
  targetSocket: MediaSFUSocket | null | undefined,
  label: string,
) => {
  if (!targetSocket?.connected) {
    return;
  }

  try {
    targetSocket.removeAllListeners?.();
    targetSocket.disconnect();
  } catch (error) {
    console.log(`error disconnecting ${label}`, error);
  }
};

const resetExtendedRoomState = () => {
  permissionConfig.value = null;
  translationSupported.value = false;
  translationConfig.value = null;
  isPersonalTranslation.value = false;
  mySpokenLanguage.value = 'en';
  mySpokenLanguageEnabled.value = false;
  myDefaultOutputLanguage.value = null;
  myDefaultListenLanguage.value = null;
  listenPreferences.value = new Map();
  translationProducerMap.value = {};
  activeTranslationProducerIds.value = new Set();
  availableTranslationChannels.value = new Map();
  participantTranslationStates.value = new Map();
  transcripts.value = [];
  liveSubtitleState.setLiveSubtitles(new Map());
  speakerTranslationStates.value = new Map();
  translationStreams.value = emptyRenderableList();
  clearTranslationPlaybackPriming();
  clearOriginalAudioSilenceRetries();
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
  updateActiveSidebarContent('none');

  updateIsMessagesModalVisible(false);
  updateIsParticipantsModalVisible(false);
  updateIsPermissionsModalVisible(false);
  updateIsPanelistsModalVisible(false);
  updateIsTranslationSettingsModalVisible(false);
  updateIsWaitingModalVisible(false);
  updateIsRequestsModalVisible(false);
  updateIsCoHostModalVisible(false);
  updateIsSettingsModalVisible(false);
  updateIsDisplaySettingsModalVisible(false);
  updateIsMediaSettingsModalVisible(false);
  updateIsMenuModalVisible(false);
  updateIsShareEventModalVisible(false);
  updateIsConfirmExitModalVisible(false);

  closeProducerInstance(videoProducer.value);
  closeProducerInstance(localVideoProducer.value);
  closeProducerInstance(audioProducer.value);
  closeProducerInstance(localAudioProducer.value);
  closeProducerInstance(screenProducer.value);
  closeProducerInstance(localScreenProducer.value);

  for (const transport of consumerTransports.value) {
    try {
      transport.consumer?.close?.();
      closeTransportInstance(transport.consumerTransport as Transport | null | undefined);
    } catch (error) {
      console.log('error closing consumer transport', error);
    }
  }
  consumerTransports.value = [];
  consumingTransports.value = [];

  closeTransportInstance(producerTransport.value);
  closeTransportInstance(localProducerTransport.value);
  transportCreated.value = false;
  localTransportCreated.value = false;
  transportCreatedVideo.value = false;
  transportCreatedAudio.value = false;
  transportCreatedScreen.value = false;
  
  await disconnectAllSockets(consume_sockets.value);
  consume_sockets.value = [];
  disconnectSocketInstance(socket.value, 'main socket');
  disconnectSocketInstance(localSocket.value, 'local socket');
  device.value = null;
  await updateStatesToInitialValues();
  resetExtendedRoomState();
  
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
    if (returnUI.value && typeof window !== 'undefined') {
      window.location.reload();
    }
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
          syncSpeakerTranslationStatesFromMembers(membersData.members);

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

          window.setTimeout(() => {
            void pauseTranslatedOriginalsForMembers(membersData.members);
          }, 2000);
        }
      });

      socketDefault.on('allMembersRest', async (membersData: AllMembersRestData) => {
        if (membersData) {
          syncSpeakerTranslationStatesFromMembers(membersData.members);

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

          window.setTimeout(() => {
            void pauseTranslatedOriginalsForMembers(membersData.members);
          }, 2000);
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

      socketDefault.on('panelistsUpdated', async (data: unknown) => {
        const payload = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
        const incoming = Array.isArray(payload.panelists) ? payload.panelists : [];
        const normalized = incoming.map((p) => {
          const panelist = p && typeof p === 'object' ? (p as Record<string, unknown>) : {};
          return {
            id: (panelist.id as string) ?? (panelist.name as string) ?? '',
            name: (panelist.name as string) ?? '',
          audioID: '',
          videoID: '',
          };
        }) as Participant[];
        updatePanelists(normalized);
      });

      socketDefault.on('panelistFocusChanged', async (data: unknown) => {
        const payload = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
        const focusEnabled = !!payload.focusEnabled;
        const incoming = Array.isArray(payload.panelists) ? payload.panelists : [];
        const normalized = incoming.map((p) => {
          const panelist = p && typeof p === 'object' ? (p as Record<string, unknown>) : {};
          return {
            id: (panelist.id as string) ?? (panelist.name as string) ?? '',
            name: (panelist.name as string) ?? '',
          audioID: '',
          videoID: '',
          };
        }) as Participant[];

        const focusChanged = panelistsFocused.value !== focusEnabled;
        const previousIds = panelists.value.map((p) => p.id).sort().join(',');
        const currentIds = normalized.map((p) => p.id).sort().join(',');
        const panelistsChanged = previousIds !== currentIds;

        updatePanelistsFocused(focusEnabled);
        updateMuteOthersMic(!!payload.muteOthersMic);
        updateMuteOthersCamera(!!payload.muteOthersCamera);
        updatePanelists(normalized);

        if (focusChanged || panelistsChanged) {
          await onScreenChanges({
            parameters: getCastedParameters(),
          });
        }
      });

      socketDefault.on('addedAsPanelist', async (data: unknown) => {
        const payload = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
        showAlert({
          message: (payload.message as string) || 'You have been added as a panelist',
          type: 'success',
        });
      });

      socketDefault.on('removedFromPanelists', async (data: unknown) => {
        const payload = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
        showAlert({
          message: (payload.message as string) || 'You have been removed from panelists',
          type: 'info',
        });
      });

      const handleControlMedia = async (data: unknown) => {
        const payload = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
        const type = payload.type as string | undefined;
        const action = payload.action as string | undefined;
        const reason = payload.reason as string | undefined;

        if (action === 'mute') {
          if (type === 'audio' && audioAlreadyOn.value) {
            await clickAudio({ parameters: getCastedParameters() });
          } else if (type === 'video' && videoAlreadyOn.value) {
            await clickVideo({ parameters: getCastedParameters() });
          }

          if (reason) {
            showAlert({
              message: `Your ${type === 'audio' ? 'microphone' : 'camera'} has been muted. ${reason}`,
              type: 'info',
            });
          }
        }
      };

      socketDefault.on('controlMedia', handleControlMedia);
      socketDefault.on('receiveControlMedia', handleControlMedia);

      socketDefault.on('permissionUpdated', async (data: unknown) => {
        const payload = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
        if (payload.newLevel) {
          islevel.value = payload.newLevel as string;
          youAreHost.value = payload.newLevel === '2';
        }
        if (payload.message) {
          showAlert({
            message: payload.message as string,
            type: payload.newLevel === '1' ? 'success' : 'info',
          });
        }
      });

      socketDefault.on('permissionConfigUpdated', async (data: unknown) => {
        const payload = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
        if (payload.config) {
          updatePermissionConfig(payload.config as PermissionConfig);
        }
      });

      socketDefault.on('translation:roomConfig', async (data: unknown) => {
        const payload = data && typeof data === 'object'
          ? data as { config?: TranslationRoomConfig }
          : {};

        await translationRoomConfig({
          data: data as { config: TranslationRoomConfig },
          updateTranslationConfig,
          updateTranslationSupported,
        });

        if (
          payload.config
          && payload.config.supportTranslation !== true
          && props.canUsePersonalTranslation
          && props.personalTranslationUsername
        ) {
          socketDefault.emit(
            'requestPersonalTranslation',
            {
              roomName: roomName.value,
              username: props.personalTranslationUsername,
            },
            (response: { success?: boolean; error?: string }) => {
              if (response?.success !== true && response?.error) {
                console.log('[PersonalTranslation] Request denied:', response.error);
              }
            }
          );
        }
      });

      socketDefault.on('translation:configUpdated', async (data: unknown) => {
        await translationConfigUpdated({
          data: data as { config: TranslationRoomConfig },
          updateTranslationConfig,
          showAlert,
        });
      });

      socketDefault.on('personalTranslationConfig', async (data: unknown) => {
        const payload = data && typeof data === 'object'
          ? data as {
              supportTranslation?: boolean;
              translationConfig?: TranslationRoomConfig;
              isPersonalTranslation?: boolean;
            }
          : {};

        if (payload.supportTranslation && payload.translationConfig) {
          updateTranslationConfig(payload.translationConfig);
          isPersonalTranslation.value = payload.isPersonalTranslation === true;

          if (payload.isPersonalTranslation === true) {
            showAlert?.({
              message: 'Personal translation activated with your account credits',
              type: 'success',
              duration: 3000,
            });
          }
        }
      });

      socketDefault.on('translation:languageSet', async (data: unknown) => {
        await translationLanguageSet({
          data: data as { success: boolean; language: string; enabled: boolean; error?: string },
          updateMySpokenLanguage,
          updateMySpokenLanguageEnabled,
          showAlert,
        });
      });

      socketDefault.on('translation:subscribed', async (data: unknown) => {
        const rawPayload = data as Partial<TranslationSubscribedData>;
        const payload: TranslationSubscribedData = {
          speakerId: rawPayload.speakerId ?? '',
          speakerName: rawPayload.speakerName,
          language: rawPayload.language ?? '',
          channelCreated: rawPayload.channelCreated ?? false,
          producerId: rawPayload.producerId,
          originalProducerId: rawPayload.originalProducerId,
        };

        await translationSubscribed({
          data: payload,
          updateListenPreferences,
          updateTranslationProducerMap,
          startConsumingTranslation: payload.producerId
            ? async (producerId: string, speakerId: string, language: string) => {
                await startConsumingTranslation(
                  producerId,
                  speakerId,
                  language,
                  payload.originalProducerId,
                );
              }
            : undefined,
          showAlert,
        });
      });

      socketDefault.on('translation:unsubscribed', async (data: unknown) => {
        const rawPayload = data as Partial<TranslationUnsubscribedData>;

        await translationUnsubscribed({
          data: {
            speakerId: rawPayload.speakerId ?? '',
            language: rawPayload.language ?? '',
            channelClosed: rawPayload.channelClosed ?? true,
          },
          updateListenPreferences,
          stopConsumingTranslation: stopConsumingTranslationSelection,
        });
      });

      socketDefault.on('translation:producerReady', async (data: unknown) => {
        const payload = data as Partial<TranslationProducerReadyData>;

        if (!payload.speakerId || !payload.language || !payload.producerId || !payload.originalProducerId) {
          return;
        }

        await translationProducerReady({
          data: {
            speakerId: payload.speakerId,
            speakerName: payload.speakerName,
            language: payload.language,
            producerId: payload.producerId,
            originalProducerId: payload.originalProducerId,
          },
          updateTranslationProducerMap,
          startConsumingTranslation,
          pauseOriginalProducer: async (originalProducerId: string) => {
            await pauseOriginalTranslationProducer(
              originalProducerId,
              payload.speakerId,
            );
          },
        });
      });

      socketDefault.on('translation:producerClosed', async (data: unknown) => {
        const payload = data as Partial<TranslationProducerClosedData>;

        if (!payload.speakerId || !payload.language || !payload.producerId) {
          return;
        }

        await translationProducerClosed({
          data: {
            speakerId: payload.speakerId,
            language: payload.language,
            producerId: payload.producerId,
            reason: payload.reason,
          },
          updateTranslationProducerMap,
          stopConsumingTranslation: stopConsumingTranslationProducer,
          resumeOriginalProducer: async (speakerId: string) => {
            const originalProducerId = resolveOriginalProducerIdForSpeaker(speakerId);
            if (!originalProducerId) return;

            await resumeOriginalTranslationProducer(originalProducerId, speakerId);
          },
          showAlert,
        });
      });

      socketDefault.on('translation:channelsAvailable', async (data: unknown) => {
        await translationChannelsAvailable({
          data: data as { speakerId: string; languages: string[]; originalProducerId: string },
          updateAvailableTranslationChannels,
          myDefaultListenLanguage: myDefaultListenLanguage.value,
          socket: socketDefault,
          roomName: roomName.value,
        });
      });

      socketDefault.on('translation:memberState', async (data: unknown) => {
        const payload = data as Partial<TranslationMemberStateData>;

        if (!payload.memberId || typeof payload.state !== 'object' || payload.state === null) {
          return;
        }

        await translationMemberState({
          data: {
            memberId: payload.memberId,
            memberName: payload.memberName,
            state: payload.state as TranslationMemberStateData['state'],
          },
          updateParticipantTranslationState,
        });
      });

      socketDefault.on('translation:error', async (data: unknown) => {
        await translationError({
          data: data as { error: string; code?: string; availableChannels?: string[]; maxChannels?: number; message?: string },
          showAlert,
        });
      });

      socketDefault.on('translation:transcript', async (data: unknown) => {
        const transcriptData = data as TranslationTranscriptData;

        await translationTranscript({
          data: transcriptData,
          updateTranscripts,
        });

        if (transcriptData.speakerId) {
          scheduleTranslationPlaybackPriming(transcriptData.speakerId);
        }

        updateLiveSubtitleFromTranscript(transcriptData);
      });

      socketDefault.on('translation:speakerOutputChanged', async (data: unknown) => {
        await translationSpeakerOutputChanged({
          data: data as {
            speakerId: string;
            speakerName: string;
            inputLanguage: string;
            outputLanguage: string | null;
            originalProducerId: string;
            enabled: boolean;
          },
          pauseOriginalProducer: pauseOriginalTranslationProducer,
          resumeOriginalProducer: resumeOriginalTranslationProducer,
          stopConsumingTranslationForSpeaker,
          updateSpeakerTranslationState,
          showAlert,
        });
      });

      socketDefault.on('translation:speakerDisabled', async (data: unknown) => {
        const payload = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
        const speakerId = payload.speakerId as string | undefined;
        if (!speakerId) return;

        const originalProducerId = resolveOriginalProducerIdForSpeaker(speakerId);
        if (!originalProducerId) return;

        await stopConsumingTranslationForSpeaker(speakerId);
        await resumeOriginalTranslationProducer(originalProducerId, speakerId);
        updateSpeakerTranslationState(speakerId, null, originalProducerId);
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
.mediasfu-modern-sidebar-shell {
  height: 100%;
  flex-shrink: 0;
  overflow: hidden;
  transition: width 300ms ease-in-out;
  background: transparent;
}

.mediasfu-modern-sidebar-modal-shell {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  pointer-events: none;
}

.mediasfu-modern-sidebar-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, var(--ms-sidebar-panel-top, rgba(15, 23, 42, 0.98)) 0%, var(--ms-sidebar-panel-bottom, rgba(30, 41, 59, 0.95)) 100%);
  border-left: 1px solid var(--ms-sidebar-border, rgba(255, 255, 255, 0.12));
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.34);
  color: var(--ms-modern-text-primary, #f8fafc);
}

.mediasfu-modern-sidebar-modal-panel {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, var(--ms-sidebar-panel-top, rgba(15, 23, 42, 0.98)) 0%, var(--ms-sidebar-panel-bottom, rgba(30, 41, 59, 0.95)) 100%);
  border-left: 1px solid var(--ms-sidebar-border, rgba(255, 255, 255, 0.12));
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.34);
  color: var(--ms-modern-text-primary, #f8fafc);
  animation: mediasfuModernSidebarSlideIn 300ms cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: auto;
}

.mediasfu-modern-sidebar-backbar {
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--ms-sidebar-border, rgba(255, 255, 255, 0.1));
  background: var(--ms-sidebar-backbar-bg, rgba(15, 23, 42, 0.5));
}

.mediasfu-modern-sidebar-back,
.mediasfu-modern-sidebar-close {
  cursor: pointer;
}

.mediasfu-modern-sidebar-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #22c55e;
  font-size: 15px;
  font-weight: 600;
}

.mediasfu-modern-sidebar-back:hover {
  background: var(--ms-sidebar-button-bg, rgba(255, 255, 255, 0.1));
}

.mediasfu-modern-sidebar-back-icon {
  font-size: 16px;
  line-height: 1;
}

.mediasfu-modern-sidebar-close {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: none;
  background: var(--ms-sidebar-button-bg, rgba(255, 255, 255, 0.1));
  color: var(--ms-sidebar-button-text, var(--ms-modern-text-primary, #f8fafc));
  font-size: 18px;
  line-height: 1;
}

.mediasfu-modern-sidebar-close:hover {
  background: rgba(255, 255, 255, 0.15);
}

.mediasfu-modern-sidebar-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  box-sizing: border-box;
}

@keyframes mediasfuModernSidebarSlideIn {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0);
  }
}

:deep(.mediasfu-modern-sidebar-embedded-overlay) {
  position: relative !important;
  inset: auto !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
  box-sizing: border-box !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: stretch !important;
  justify-content: flex-start !important;
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  z-index: auto !important;
}

:deep(.mediasfu-modern-sidebar-embedded-content) {
  position: relative !important;
  top: auto !important;
  right: auto !important;
  bottom: auto !important;
  left: auto !important;
  transform: none !important;
  width: 100% !important;
  height: 100% !important;
  max-width: none !important;
  max-height: 100% !important;
  min-height: 0 !important;
  box-sizing: border-box !important;
  border: none !important;
  border-radius: 0 !important;
  background: transparent !important;
  overflow: hidden !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.mediasfu-modern-sidebar-panel :deep(.modal-header) {
  margin: 0 !important;
  padding: 0 0 16px !important;
  border-bottom: none !important;
  background: transparent !important;
}

.mediasfu-modern-sidebar-panel :deep(.modal-body) {
  padding: 0 !important;
  background: transparent !important;
}

.mediasfu-modern-sidebar-panel :deep([class^='btn-close']) {
  width: 36px !important;
  height: 36px !important;
  border-radius: 12px !important;
  border: 1px solid var(--ms-sidebar-button-border, rgba(148, 163, 184, 0.14)) !important;
  background: var(--ms-sidebar-button-bg, rgba(255, 255, 255, 0.1)) !important;
  color: var(--ms-sidebar-button-text, var(--ms-modern-text-primary, #f8fafc)) !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.mediasfu-modern-sidebar-panel :deep(.ms-modern-display-settings-overlay) {
  position: relative !important;
  inset: auto !important;
  width: 100% !important;
  height: 100% !important;
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.mediasfu-modern-sidebar-panel :deep(.ms-modern-display-settings) {
  position: relative !important;
  width: 100% !important;
  max-height: none !important;
  height: 100% !important;
  border: none !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.mediasfu-modern-sidebar-panel :deep(.ms-modern-display-settings__header) {
  padding: 0 0 16px !important;
  border-bottom: none !important;
  background: transparent !important;
}

.mediasfu-modern-sidebar-panel :deep(.ms-modern-display-settings__content),
.mediasfu-modern-sidebar-panel :deep(.ms-modern-display-settings__footer) {
  padding: 0 !important;
}

.mediasfu-modern-sidebar-panel :deep(.ms-modern-display-settings__option),
.mediasfu-modern-sidebar-panel :deep(.ms-modern-display-settings__toggle-row) {
  border-color: var(--ms-modern-panel-border) !important;
  background: var(--ms-modern-panel-surface) !important;
  box-shadow: none !important;
}

.mediasfu-modern-sidebar-panel :deep(.ms-modern-display-settings__close) {
  width: 36px !important;
  height: 36px !important;
  border-radius: 12px !important;
  border: 1px solid var(--ms-sidebar-button-border, rgba(148, 163, 184, 0.14)) !important;
  background: var(--ms-sidebar-button-bg, rgba(255, 255, 255, 0.1)) !important;
  color: var(--ms-sidebar-button-text, var(--ms-modern-text-primary, #f8fafc)) !important;
  box-shadow: none !important;
}

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

