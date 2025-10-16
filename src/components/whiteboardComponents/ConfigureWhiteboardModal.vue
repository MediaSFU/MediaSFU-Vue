<!--
/**
 * @fileoverview ConfigureWhiteboardModal - Whiteboard participant permissions management
 * @component ConfigureWhiteboardModal
 * @module components/whiteboardComponents/ConfigureWhiteboardModal
 * 
 * @description
 * A modal for configuring whiteboard permissions and managing participant access. Allows
 * hosts to assign/revoke whiteboard privileges, start/stop whiteboard sessions, and control
 * which participants can draw on the shared whiteboard. Features dual-list interface with
 * assigned (can draw) and pending (cannot draw) participants, one-click permission toggles,
 * and real-time synchronization via Socket.io. Integrates with canvas streaming for recording
 * and screen sharing workflows.
 * 
 * Key Features:
 * - Dual-list UI: Assigned participants (can draw) vs Pending (cannot draw)
 * - One-click add/remove permissions with visual feedback
 * - Start/Update/Stop whiteboard session controls
 * - Real-time permission sync via Socket.io 'whiteboardUpdated' event
 * - Automatic canvas stream capture on whiteboard start/update
 * - Integration with recording and screenshare workflows
 * - Empty state messages for both lists
 * - Save button to persist permission changes
 * - Host-only access control
 * - Responsive modal with configurable positioning
 * 
 * User Roles:
 * - **Host (islevel='2')**: Full control - start/stop whiteboard, assign/revoke permissions
 * - **Participants**: Cannot open this modal - permissions managed by host
 * 
 * Workflow:
 * 1. Host opens ConfigureWhiteboardModal from menu or whiteboard controls
 * 2. Modal displays two lists: Assigned (users with drawing rights) and Pending (users without)
 * 3. Host clicks "+" on pending user → moves to assigned list (can now draw)
 * 4. Host clicks "−" on assigned user → moves to pending list (loses drawing rights)
 * 5. Host clicks "Save" → Socket.io emits 'updateWhiteboard' with new permissions
 * 6. All clients receive 'whiteboardUpdated' event → UI updates in real-time
 * 7. Host clicks "Start" → whiteboard activates, canvas stream captured for recording/sharing
 * 8. Host clicks "Update" → re-captures canvas stream with current state
 * 9. Host clicks "Stop" → whiteboard deactivates, canvas stream stopped
 * 
 * @example Basic Usage - Start Whiteboard Session
 * ```typescript
 * // <ConfigureWhiteboardModal
 *   // :isVisible="isWhiteboardConfigModalVisible"
 *   // :onConfigureWhiteboardClose="() => setIsWhiteboardConfigModalVisible(false)"
 *   // :parameters="{
 *     participants: allParticipants,
 *     showAlert: alertFunction,
 *     socket: socketConnection,
 *     roomName: 'room123',
 *     islevel: '2',
 *     eventType: 'conference',
 *     whiteboardStarted: false,
 *     whiteboardEnded: false,
 *     canStartWhiteboard: true,
 *     updateWhiteboardStarted: setWhiteboardStarted,
 *     updateWhiteboardEnded: setWhiteboardEnded,
 *     updateWhiteboardUsers: setWhiteboardUsers,
 *     onScreenChanges: handleScreenChanges,
 *     captureCanvasStream: captureCanvas,
 *     getUpdatedAllParams: getAllParams
 *   }"
 * // />
 * ```
 * 
 * @example With Custom Position and Background
 * ```typescript
 * // <ConfigureWhiteboardModal
 *   // :isVisible="true"
 *   // :onConfigureWhiteboardClose="closeModal"
 *   // position="topLeft"
 *   // backgroundColor="#ffffff"
 *   // :parameters="whiteboardParams"
 * // />
 * ```
 * 
 * @example Custom Empty States
 * ```typescript
 * // <ConfigureWhiteboardModal
 *   // :isVisible="true"
 *   // :onConfigureWhiteboardClose="closeModal"
 *   // emptyAssignedState="No participants have whiteboard access yet"
 *   // emptyPendingState="All participants have whiteboard access"
 *   // :parameters="whiteboardParams"
 * // />
 * ```
 * 
 * @example Custom List Renderers
 * ```typescript
 * // <script setup>
 * const customAssignedListRenderer = ({ defaultAssignedList, participants, removeParticipant }) => {
 *   // return h('div', { class: 'custom-assigned-list' }, [
 *     h('h4', `${participants.length} users can draw`),
 *     h('ul', participants.map(p => 
 *       h('li', { key: p.name, class: 'assigned-item' }, [
 *         h('span', p.name),
 *         h('button', {
 *           class: 'remove-btn',
 *           onClick: () => removeParticipant(p)
 *         }, '✕ Remove')
 *       ])
 *     ))
 *   ]);
 * };
 * 
 * const customPendingListRenderer = ({ defaultPendingList, participants, addParticipant }) => {
 *   // return h('div', { class: 'custom-pending-list' }, [
 *     h('h4', `${participants.length} users waiting for access`),
 *     h('ul', participants.map(p => 
 *       h('li', { key: p.name, class: 'pending-item' }, [
 *         h('span', p.name),
 *         h('button', {
 *           class: 'add-btn',
 *           onClick: () => addParticipant(p)
 *         }, '+ Add')
 *       ])
 *     ))
 *   ]);
 * };
 * </script>
 * 
 * // <template>
 *   <ConfigureWhiteboardModal
 *     :isVisible="true"
 *     :onConfigureWhiteboardClose="closeModal"
 *     :renderAssignedList="customAssignedListRenderer"
 *     :renderPendingList="customPendingListRenderer"
 *     :parameters="whiteboardParams"
 *   />
 * </template>
 * ```
 * 
 * @example Programmatic Whiteboard Control
 * ```typescript
 * // <script setup>
 * const startWhiteboardSession = async () => {
 *   // await handleStartWhiteboard({
 *     updateWhiteboardStarted: setWhiteboardStarted,
 *     updateWhiteboardEnded: setWhiteboardEnded,
 *     updateWhiteboardUsers: setWhiteboardUsers,
 *     updateCanStartWhiteboard: setCanStartWhiteboard,
 *     parameters: {
 *       ...whiteboardParams,
 *       canStartWhiteboard: true
 *     }
 *   });
 * };
 * 
 * const stopWhiteboardSession = async () => {
 *   // await handleStopWhiteboard({
 *     whiteboardUsers: assignedUsers,
 *     socket: socket,
 *     roomName: 'room123',
 *     updateWhiteboardStarted: setWhiteboardStarted,
 *     updateWhiteboardEnded: setWhiteboardEnded,
 *     updateCanStartWhiteboard: setCanStartWhiteboard
 *   });
 * };
 * </script>
 * 
 * // <template>
 *   <ConfigureWhiteboardModal
 *     :isVisible="true"
 *     :onConfigureWhiteboardClose="closeModal"
 *     :parameters="whiteboardParams"
 *   />
 *   <button @click="startWhiteboardSession">Start Whiteboard</button>
 *   <button @click="stopWhiteboardSession">Stop Whiteboard</button>
 * </template>
 * ```
 * 
 * @see {@link Whiteboard} for the main whiteboard canvas component
 * @see {@link handleStartWhiteboard} for whiteboard session start logic
 * @see {@link handleStopWhiteboard} for whiteboard session stop logic
 * @see {@link https://mediasfu.com/docs/whiteboard-config} for configuration documentation
 */
-->
<template>
  <RenderVNode :node="overlayNode" />
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, h, isVNode, defineComponent, type PropType, type VNodeChild, type HTMLAttributes, type ButtonHTMLAttributes, type LiHTMLAttributes, type CSSProperties } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes, faCheck, faSyncAlt, faPlay, faSave } from '@fortawesome/free-solid-svg-icons';
import { handleStartWhiteboard } from 'mediasfu-shared';
import { handleStopWhiteboard } from 'mediasfu-shared';
import type { Socket } from 'socket.io-client';

export interface Participant {
  name: string;
  islevel?: string;
  useBoard?: boolean;
  isBanned?: boolean;
  [key: string]: unknown;
}

export interface WhiteboardUser {
  name: string;
  useBoard: boolean;
}

export interface WhiteboardUpdatedData {
  members?: Participant[];
  whiteboardUsers: WhiteboardUser[];
  status: string;
}

export type ShowAlert = (alert: { message: string; type: 'success' | 'danger'; duration?: number }) => void;

export interface OnScreenChangesOptions {
  changed: boolean;
  parameters: unknown;
}

export interface CaptureCanvasStreamOptions {
  parameters: unknown;
}

export interface PrepopulateUserMediaOptions {
  name: string;
  parameters: unknown;
}

export interface RePortOptions {
  restart: boolean;
  parameters: unknown;
}

export type PrepopulateUserMediaResult = void | unknown[];

/**
 * Parameters object for the ConfigureWhiteboardModal component
 * @interface ConfigureWhiteboardModalParameters
 * 
 * @property {Participant[]} participants - Array of all participants in the room
 * @property {ShowAlert} [showAlert] - Alert function for user feedback messages
 * @property {Socket} socket - Socket.io connection for whiteboard permission updates
 * @property {number} itemPageLimit - Maximum items per page (pagination limit)
 * @property {string} islevel - User's permission level ('2' = host, '1' = participant)
 * @property {string} roomName - Room identifier for socket emissions
 * @property {string} eventType - Event type ('conference' | 'webinar' | 'broadcast' | 'chat')
 * @property {boolean} shareScreenStarted - Whether screen sharing is active
 * @property {boolean} shared - Whether any content is currently being shared
 * @property {boolean} breakOutRoomStarted - Whether breakout rooms are active
 * @property {boolean} breakOutRoomEnded - Whether breakout rooms have ended
 * @property {boolean} recordStarted - Whether recording has started
 * @property {boolean} recordResumed - Whether recording has resumed
 * @property {boolean} recordPaused - Whether recording is paused
 * @property {boolean} recordStopped - Whether recording has stopped
 * @property {string} recordingMediaOptions - Recording media type ('video' | 'audio' | 'all')
 * @property {boolean} canStartWhiteboard - Whether whiteboard can be started (permission check)
 * @property {boolean} whiteboardStarted - Whether whiteboard session has started
 * @property {boolean} whiteboardEnded - Whether whiteboard session has ended
 * @property {string} hostLabel - Label for the host user (default: 'Host')
 * 
 * @property {(started: boolean) => void} updateWhiteboardStarted - Function to update whiteboard started state
 * @property {(ended: boolean) => void} updateWhiteboardEnded - Function to update whiteboard ended state
 * @property {(users: WhiteboardUser[]) => void} updateWhiteboardUsers - Function to update whiteboard users array
 * @property {(canStart: boolean) => void} updateCanStartWhiteboard - Function to update whiteboard start permission
 * @property {(isVisible: boolean) => void} updateIsConfigureWhiteboardModalVisible - Function to control modal visibility
 * 
 * @property {Function} onScreenChanges - Function to handle screen orientation/size changes
 * @property {Function} captureCanvasStream - Function to capture whiteboard canvas as MediaStream
 * @property {Function} prepopulateUserMedia - Function to prepare user media for streaming
 * @property {Function} rePort - Function to restart media producers after changes
 * @property {() => ConfigureWhiteboardModalParameters} getUpdatedAllParams - Function to retrieve updated parameters
 * 
 * @example
 * ```ts
 * const configureWhiteboardParams = {
 *   // participants: allParticipants,
 *   // showAlert: (alert) => console.log(alert.message),
 *   // socket: socketConnection,
 *   // itemPageLimit: 10,
 *   // islevel: '2',
 *   // roomName: 'room123',
 *   // eventType: 'conference',
 *   // shareScreenStarted: false,
 *   // shared: false,
 *   // breakOutRoomStarted: false,
 *   // breakOutRoomEnded: false,
 *   // recordStarted: true,
 *   // recordResumed: false,
 *   // recordPaused: false,
 *   // recordStopped: false,
 *   // recordingMediaOptions: 'video',
 *   // canStartWhiteboard: true,
 *   // whiteboardStarted: false,
 *   // whiteboardEnded: false,
 *   // hostLabel: 'Host',
 *   // updateWhiteboardStarted: (started) => { whiteboardStarted.value = started; },
 *   // updateWhiteboardEnded: (ended) => { whiteboardEnded.value = ended; },
 *   // updateWhiteboardUsers: (users) => { whiteboardUsers.value = users; },
 *   // updateCanStartWhiteboard: (canStart) => { canStartWb.value = canStart; },
 *   // updateIsConfigureWhiteboardModalVisible: (visible) => { modalVisible.value = visible; },
 *   // onScreenChanges: async ({ changed, parameters }) => {
 *     if (changed) await adjustForOrientation(parameters);
 *   },
 *   // captureCanvasStream: async ({ parameters }) => {
 *     await streamWhiteboardCanvas(parameters);
 *   },
 *   // prepopulateUserMedia: async ({ name, parameters }) => {
 *     return await setupUserMedia(name, parameters);
 *   },
 *   // rePort: async ({ restart, parameters }) => {
 *     if (restart) await restartProducers(parameters);
 *   },
 *   // getUpdatedAllParams: () => ({ ...configureWhiteboardParams })
 * };
 * ```
 */
export interface ConfigureWhiteboardModalParameters {
  participants: Participant[];
  showAlert?: ShowAlert;
  socket: Socket;
  itemPageLimit: number;
  islevel: string;
  roomName: string;
  eventType: string;
  shareScreenStarted: boolean;
  shared: boolean;
  breakOutRoomStarted: boolean;
  breakOutRoomEnded: boolean;
  recordStarted: boolean;
  recordResumed: boolean;
  recordPaused: boolean;
  recordStopped: boolean;
  recordingMediaOptions: string;
  canStartWhiteboard: boolean;
  whiteboardStarted: boolean;
  whiteboardEnded: boolean;
  hostLabel: string;
  updateWhiteboardStarted: (started: boolean) => void;
  updateWhiteboardEnded: (ended: boolean) => void;
  updateWhiteboardUsers: (users: WhiteboardUser[]) => void;
  updateCanStartWhiteboard: (canStart: boolean) => void;
  updateIsConfigureWhiteboardModalVisible: (isVisible: boolean) => void;
  onScreenChanges: (options: OnScreenChangesOptions) => Promise<void>;
  captureCanvasStream: (options: CaptureCanvasStreamOptions) => Promise<void>;
  prepopulateUserMedia: (options: PrepopulateUserMediaOptions) => Promise<PrepopulateUserMediaResult>;
  rePort: (options: RePortOptions) => Promise<void>;
  getUpdatedAllParams: () => ConfigureWhiteboardModalParameters;
  [key: string]: unknown;
}

export interface ConfigureWhiteboardModalProps {
  isVisible: boolean;
  onConfigureWhiteboardClose: () => void;
  parameters: ConfigureWhiteboardModalParameters;
  backgroundColor?: string;
  position?: string;
  
  // UI override props
  title?: VNodeChild
  overlayProps?: HTMLAttributes
  contentProps?: HTMLAttributes
  headerProps?: HTMLAttributes
  titleProps?: HTMLAttributes
  closeButtonProps?: ButtonHTMLAttributes
  closeIconComponent?: VNodeChild
  headerDividerProps?: HTMLAttributes
  bodyProps?: HTMLAttributes
  listsWrapperProps?: HTMLAttributes
  assignedSectionProps?: HTMLAttributes
  pendingSectionProps?: HTMLAttributes
  assignedTitleProps?: HTMLAttributes
  pendingTitleProps?: HTMLAttributes
  assignedListProps?: HTMLAttributes
  pendingListProps?: HTMLAttributes
  assignedItemProps?: LiHTMLAttributes
  pendingItemProps?: LiHTMLAttributes
  assignedActionButtonProps?: ButtonHTMLAttributes
  pendingActionButtonProps?: ButtonHTMLAttributes
  footerProps?: HTMLAttributes
  saveButtonProps?: ButtonHTMLAttributes
  actionsWrapperProps?: HTMLAttributes
  startButtonProps?: ButtonHTMLAttributes
  updateButtonProps?: ButtonHTMLAttributes
  stopButtonProps?: ButtonHTMLAttributes
  sectionDividerProps?: HTMLAttributes
  assignedTitle?: VNodeChild
  pendingTitle?: VNodeChild
  saveButtonLabel?: VNodeChild
  startButtonLabel?: VNodeChild
  updateButtonLabel?: VNodeChild
  stopButtonLabel?: VNodeChild
  addIcon?: VNodeChild
  removeIcon?: VNodeChild
  saveIcon?: VNodeChild
  startIcon?: VNodeChild
  updateIcon?: VNodeChild
  stopIcon?: VNodeChild
  emptyAssignedState?: VNodeChild | ((context: { participants: Participant[] }) => VNodeChild)
  emptyPendingState?: VNodeChild | ((context: { participants: Participant[] }) => VNodeChild)
  renderTitle?: (options: { defaultTitle: VNodeChild }) => VNodeChild
  renderHeader?: (options: { defaultHeader: VNodeChild }) => VNodeChild
  renderLists?: (options: {
    defaultLists: VNodeChild
    assignedParticipants: Participant[]
    pendingParticipants: Participant[]
  }) => VNodeChild
  renderAssignedList?: (options: {
    defaultAssignedList: VNodeChild
    participants: Participant[]
    removeParticipant: (participant: Participant) => void
  }) => VNodeChild
  renderPendingList?: (options: {
    defaultPendingList: VNodeChild
    participants: Participant[]
    addParticipant: (participant: Participant) => void
  }) => VNodeChild
  renderAssignedItem?: (options: {
    defaultItem: VNodeChild
    participant: Participant
    remove: () => void
    index: number
  }) => VNodeChild
  renderPendingItem?: (options: {
    defaultItem: VNodeChild
    participant: Participant
    add: () => void
    index: number
  }) => VNodeChild
  renderFooter?: (options: {
    defaultFooter: VNodeChild
    isEditing: boolean
    canStartWhiteboard: boolean
  }) => VNodeChild
  renderActions?: (options: {
    defaultActions: VNodeChild
    isEditing: boolean
    canStartWhiteboard: boolean
    whiteboardStarted: boolean
    whiteboardEnded: boolean
  }) => VNodeChild
  renderBody?: (options: {
    defaultBody: VNodeChild
    isEditing: boolean
    assignedParticipants: Participant[]
    pendingParticipants: Participant[]
  }) => VNodeChild
  renderContent?: (options: { defaultContent: VNodeChild }) => VNodeChild
}

const props = withDefaults(defineProps<ConfigureWhiteboardModalProps>(), {
  backgroundColor: '#83c0e9',
  position: 'topRight',
  title: () => 'Configure Whiteboard',
  overlayProps: undefined,
  contentProps: undefined,
  headerProps: undefined,
  titleProps: undefined,
  closeButtonProps: undefined,
  closeIconComponent: undefined,
  headerDividerProps: undefined,
  bodyProps: undefined,
  listsWrapperProps: undefined,
  assignedSectionProps: undefined,
  pendingSectionProps: undefined,
  assignedTitleProps: undefined,
  pendingTitleProps: undefined,
  assignedListProps: undefined,
  pendingListProps: undefined,
  assignedItemProps: undefined,
  pendingItemProps: undefined,
  assignedActionButtonProps: undefined,
  pendingActionButtonProps: undefined,
  footerProps: undefined,
  saveButtonProps: undefined,
  actionsWrapperProps: undefined,
  startButtonProps: undefined,
  updateButtonProps: undefined,
  stopButtonProps: undefined,
  sectionDividerProps: undefined,
  assignedTitle: () => 'Assigned',
  pendingTitle: () => 'Pending',
  saveButtonLabel: undefined,
  startButtonLabel: undefined,
  updateButtonLabel: undefined,
  stopButtonLabel: undefined,
  addIcon: undefined,
  removeIcon: undefined,
  saveIcon: undefined,
  startIcon: undefined,
  updateIcon: undefined,
  stopIcon: undefined,
  emptyAssignedState: undefined,
  emptyPendingState: undefined,
  renderTitle: undefined,
  renderHeader: undefined,
  renderLists: undefined,
  renderAssignedList: undefined,
  renderPendingList: undefined,
  renderAssignedItem: undefined,
  renderPendingItem: undefined,
  renderFooter: undefined,
  renderActions: undefined,
  renderBody: undefined,
  renderContent: undefined
});

// Reactive computed access to parameters (read-only)
const participants = computed(() => props.parameters.participants);
const showAlert = computed(() => props.parameters.showAlert);
const itemPageLimit = computed(() => props.parameters.itemPageLimit);
const islevel = computed(() => props.parameters.islevel);
const roomName = computed(() => props.parameters.roomName);
const shareScreenStarted = computed(() => props.parameters.shareScreenStarted);
const shared = computed(() => props.parameters.shared);
const breakOutRoomStarted = computed(() => props.parameters.breakOutRoomStarted);
const breakOutRoomEnded = computed(() => props.parameters.breakOutRoomEnded);
const recordStarted = computed(() => props.parameters.recordStarted);
const recordResumed = computed(() => props.parameters.recordResumed);
const recordPaused = computed(() => props.parameters.recordPaused);
const recordStopped = computed(() => props.parameters.recordStopped);
const recordingMediaOptions = computed(() => props.parameters.recordingMediaOptions);
const hostLabel = computed(() => props.parameters.hostLabel);
const updateWhiteboardStarted = computed(() => props.parameters.updateWhiteboardStarted);
const updateWhiteboardEnded = computed(() => props.parameters.updateWhiteboardEnded);
const updateWhiteboardUsers = computed(() => props.parameters.updateWhiteboardUsers);
const updateCanStartWhiteboard = computed(() => props.parameters.updateCanStartWhiteboard);
const updateIsConfigureWhiteboardModalVisible = computed(() => props.parameters.updateIsConfigureWhiteboardModalVisible);
const onScreenChanges = computed(() => props.parameters.onScreenChanges);
const captureCanvasStream = computed(() => props.parameters.captureCanvasStream);
const prepopulateUserMedia = computed(() => props.parameters.prepopulateUserMedia);
const rePort = computed(() => props.parameters.rePort);
const getUpdatedAllParams = computed(() => props.parameters.getUpdatedAllParams);

// Socket reference (special handling)
const initialSocket = computed(() => props.parameters.socket);

// State (mutable refs initialized from parameters)
const participantsCopy = ref<Participant[]>([]);
const whiteboardLimit = ref(itemPageLimit.value);
const isEditing = ref(false);
const canStartWhiteboard = ref(props.parameters.canStartWhiteboard);
const whiteboardStarted = ref(props.parameters.whiteboardStarted);
const whiteboardEnded = ref(props.parameters.whiteboardEnded);

const socketRef = computed(() => props.parameters.socket as Socket | undefined);

const isSocketLike = (candidate: unknown): candidate is Socket => {
  if (!candidate) {
    return false;
  }

  const socketCandidate = candidate as {
    on?: unknown;
    off?: unknown;
    emit?: unknown;
  };

  return (
    typeof socketCandidate.on === 'function' &&
    typeof socketCandidate.off === 'function' &&
    typeof socketCandidate.emit === 'function'
  );
};

const getActiveSocket = (): Socket | undefined => {
  const latestSocket = socketRef.value;
  if (isSocketLike(latestSocket)) {
    return latestSocket;
  }

  if (isSocketLike(initialSocket)) {
    return initialSocket as Socket;
  }

  return undefined;
};

const attachWhiteboardListener = (socketInstance?: Socket) => {
  if (isSocketLike(socketInstance)) {
    socketInstance.on('whiteboardUpdated', handleWhiteboardUpdated);
  }
};

const detachWhiteboardListener = (socketInstance?: Socket) => {
  if (isSocketLike(socketInstance)) {
    socketInstance.off('whiteboardUpdated', handleWhiteboardUpdated);
  }
};

watch(
  socketRef,
  (newSocket, oldSocket) => {
    detachWhiteboardListener(oldSocket);
    attachWhiteboardListener(newSocket);
  },
  { immediate: true }
);

// Refs
// Computed participants lists
const assignedParticipants = computed(() => {
  return participantsCopy.value.filter((participant) => participant.useBoard);
});

// Validate whiteboard
const validateWhiteboard = (): boolean => {
  const selectedParticipants = participantsCopy.value.filter((participant) => participant.useBoard);

  if (selectedParticipants.length > whiteboardLimit.value) {
    showAlert.value?.({ message: 'Participant limit exceeded', type: 'danger' });
    return false;
  }

  return true;
};

// Check if can start whiteboard
const checkCanStartWhiteboard = () => {
  const isValid = validateWhiteboard();
  canStartWhiteboard.value = isValid;
  updateCanStartWhiteboard.value(isValid);
};

// Toggle participant
const toggleParticipant = (participant: Participant, add: boolean) => {
  isEditing.value = true;
  const selectedParticipants = participantsCopy.value.filter((p) => p.useBoard);
  
  if (add && selectedParticipants.length >= whiteboardLimit.value - 1) {
    showAlert.value?.({
      message: `Participant limit exceeded - you can only add ${whiteboardLimit.value - 1} other participants`,
      type: 'danger',
    });
    return;
  }

  const updatedParticipants = participantsCopy.value.map((p) =>
    p.name === participant.name ? { ...p, useBoard: add } : p
  );

  participantsCopy.value = updatedParticipants;
};

// Handle save whiteboard
const handleSaveWhiteboard = () => {
  if (validateWhiteboard()) {
    isEditing.value = false;
    canStartWhiteboard.value = true;
    updateCanStartWhiteboard.value(true);
    checkCanStartWhiteboard();
    showAlert.value?.({ message: 'Whiteboard saved successfully', type: 'success' });
  } else {
    showAlert.value?.({ message: 'Whiteboard validation failed', type: 'danger' });
  }
};

// Handle start whiteboard
const handleStartWhiteboardClick = async () => {
  if ((shareScreenStarted.value || shared.value) && !whiteboardStarted.value) {
    showAlert.value?.({
      message: 'You cannot start whiteboard while screen sharing is active',
      type: 'danger',
    });
    return;
  }

  if (breakOutRoomStarted.value && !breakOutRoomEnded.value) {
    showAlert.value?.({
      message: 'You cannot start whiteboard while breakout rooms are active',
      type: 'danger',
    });
    return;
  }

  if (canStartWhiteboard.value) {
    const filteredWhiteboardUsers = participantsCopy.value
      .filter((participant) => participant.useBoard)
      .map(({ name, useBoard }) => ({ name, useBoard: useBoard || false }));

    const activeSocket = getActiveSocket();
    if (!activeSocket) {
      console.warn('[ConfigureWhiteboardModal] Socket is not ready to start the whiteboard.');
      showAlert.value?.({ message: 'Connection not ready. Please try again in a moment.', type: 'danger' });
      return;
    }

    const startSucceeded = await handleStartWhiteboard({
      socket: activeSocket,
      whiteboardUsers: filteredWhiteboardUsers,
      roomName: roomName.value,
      whiteboardStarted: whiteboardStarted.value,
      whiteboardEnded: whiteboardEnded.value,
      showAlert: showAlert.value,
      updateWhiteboardStarted: updateWhiteboardStarted.value,
      updateWhiteboardEnded: updateWhiteboardEnded.value,
      updateIsConfigureWhiteboardModalVisible: updateIsConfigureWhiteboardModalVisible.value,
    });

    if (!startSucceeded) {
      return;
    }

    whiteboardStarted.value = true;
    whiteboardEnded.value = false;

    // Additional logic for screen changes
    if (islevel.value !== '2') {
      const updatedParams = getUpdatedAllParams.value();
      await onScreenChanges.value({ changed: true, parameters: updatedParams });
    }

    // Handle recording capture
    if (islevel.value === '2' && (recordStarted.value || recordResumed.value)) {
      if (!(recordPaused.value || recordStopped.value) && recordingMediaOptions.value === 'video') {
        const updatedParams = getUpdatedAllParams.value();
        await captureCanvasStream.value({ parameters: updatedParams });
      }
    }
  }
};

// Handle stop whiteboard
const handleStopWhiteboardClick = async () => {
  const activeSocket = getActiveSocket();
  if (!activeSocket) {
    console.warn('[ConfigureWhiteboardModal] Socket is not ready to stop the whiteboard.');
    showAlert.value?.({ message: 'Connection not ready. Please try again in a moment.', type: 'danger' });
    return;
  }

  const stopSucceeded = await handleStopWhiteboard({
    socket: activeSocket,
    roomName: roomName.value,
    showAlert: showAlert.value,
    updateWhiteboardStarted: updateWhiteboardStarted.value,
    updateWhiteboardEnded: updateWhiteboardEnded.value,
    updateIsConfigureWhiteboardModalVisible: updateIsConfigureWhiteboardModalVisible.value,
  });

  if (!stopSucceeded) {
    return;
  }

  whiteboardEnded.value = true;
  whiteboardStarted.value = false;

  // Additional cleanup logic
  const updatedParams = getUpdatedAllParams.value();
  await onScreenChanges.value({ changed: true, parameters: updatedParams });
  await prepopulateUserMedia.value({ name: hostLabel.value, parameters: updatedParams });
  await rePort.value({ restart: true, parameters: updatedParams });
};

// Socket event handler for whiteboard updates
const handleWhiteboardUpdated = async (data: WhiteboardUpdatedData) => {
  if (islevel.value === '2' && data.members) {
    const filteredParticipants = data.members.filter((participant) => !participant.isBanned);
    participantsCopy.value = filteredParticipants;
  }

  updateWhiteboardUsers.value(data.whiteboardUsers);

  if (data.status === 'started') {
    whiteboardStarted.value = true;
    whiteboardEnded.value = false;
    updateWhiteboardStarted.value(true);
    updateWhiteboardEnded.value(false);

    if (islevel.value !== '2') {
      const updatedParams = getUpdatedAllParams.value();
      await onScreenChanges.value({ changed: true, parameters: updatedParams });
    }
  } else if (data.status === 'ended') {
    whiteboardEnded.value = true;
    whiteboardStarted.value = false;
    updateWhiteboardStarted.value(false);
    updateWhiteboardEnded.value(true);

    const updatedParams = getUpdatedAllParams.value();
    await onScreenChanges.value({ changed: true, parameters: updatedParams });
    await prepopulateUserMedia.value({ name: hostLabel.value, parameters: updatedParams });
    await rePort.value({ restart: true, parameters: updatedParams });
  }
};

// Initialize participants on mount and visibility change
watch(
  () => props.isVisible,
  (isVisible) => {
    if (isVisible) {
      const filteredParticipants = participants.value.filter((participant) => participant.islevel !== '2');
      participantsCopy.value = filteredParticipants;
      checkCanStartWhiteboard();
    }
  },
  { immediate: true }
);

// Cleanup socket listener on component unmount
onUnmounted(() => {
  const activeSocket = getActiveSocket();
  detachWhiteboardListener(activeSocket);
});

// Watch for parameter changes
watch(
  () => props.parameters.canStartWhiteboard,
  (newVal) => {
    canStartWhiteboard.value = newVal;
  }
);

watch(
  () => props.parameters.whiteboardStarted,
  (newVal) => {
    whiteboardStarted.value = newVal;
  }
);

watch(
  () => props.parameters.whiteboardEnded,
  (newVal) => {
    whiteboardEnded.value = newVal;
  }
);

// Inline RenderVNode component
const RenderVNode = defineComponent({
  name: 'RenderVNode',
  props: {
    node: {
      type: [Object, String, Number, Function] as PropType<VNodeChild>,
      default: null
    }
  },
  setup(props) {
    return () => {
      const node = props.node
      if (isVNode(node)) {
        return node
      } else if (typeof node === 'function') {
        return (node as () => VNodeChild)()
      } else {
        return node
      }
    }
  }
})

// Helper function
const joinClassNames = (classes: (string | undefined)[]): string | undefined => {
  const filtered = classes.filter(Boolean)
  return filtered.length > 0 ? filtered.join(' ').trim() : undefined
}

// Computed properties for styles
const defaultOverlayWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.85, 500) : 400

const overlayStyle = computed((): CSSProperties => ({
  position: 'fixed' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: props.isVisible ? 'block' : 'none',
  zIndex: 999,
  ...(props.overlayProps?.style as CSSProperties || {})
}))

const overlayClassName = computed(() => 
  joinClassNames(['mediasfu-configure-whiteboard-modal', props.overlayProps?.class as string])
)

const contentStyle = computed((): CSSProperties => ({
  position: 'fixed' as const,
  backgroundColor: props.backgroundColor,
  borderRadius: '10px',
  padding: '10px',
  width: `${defaultOverlayWidth}px`,
  maxHeight: '85%',
  overflowY: 'auto' as const,
  top: props.position.includes('top') ? '10px' : 'auto',
  bottom: props.position.includes('bottom') ? '10px' : 'auto',
  left: props.position.includes('Left') ? '10px' : 'auto',
  right: props.position.includes('Right') ? '10px' : 'auto',
  ...(props.contentProps?.style as CSSProperties || {})
}))

const contentClassName = computed(() => 
  joinClassNames(['mediasfu-configure-whiteboard-modal__content', props.contentProps?.class as string])
)

// Main overlay node
const overlayNode = computed(() => {
  const defaultCloseIcon = props.closeIconComponent ?? h(FontAwesomeIcon, { icon: faTimes, size: 'xl' })
  const defaultAddIcon = props.addIcon ?? h(FontAwesomeIcon, { icon: faCheck })
  const defaultRemoveIcon = props.removeIcon ?? h(FontAwesomeIcon, { icon: faTimes })
  const defaultSaveIcon = props.saveIcon ?? h(FontAwesomeIcon, { icon: faSave })
  const defaultStartIcon = props.startIcon ?? h(FontAwesomeIcon, { icon: faPlay })
  const defaultUpdateIcon = props.updateIcon ?? h(FontAwesomeIcon, { icon: faSyncAlt })
  const defaultStopIcon = props.stopIcon ?? h(FontAwesomeIcon, { icon: faTimes })
  
  const defaultTitleNode = h('h2', {
    class: joinClassNames(['modal-title', props.titleProps?.class as string]),
    style: { ...(props.titleProps?.style as CSSProperties || {}) },
    ...(props.titleProps ? Object.fromEntries(
      Object.entries(props.titleProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, typeof props.title === 'string' || typeof props.title === 'number' ? [props.title] : (props.title || []))
  
  const titleNode = props.renderTitle
    ? props.renderTitle({ defaultTitle: defaultTitleNode })
    : defaultTitleNode
  
  const defaultHeaderNode = h('div', {
    class: joinClassNames(['modal-header', props.headerProps?.class as string]),
    style: { ...(props.headerProps?.style as CSSProperties || {}) },
    ...(props.headerProps ? Object.fromEntries(
      Object.entries(props.headerProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    titleNode,
    h('button', {
      class: joinClassNames(['close-button', props.closeButtonProps?.class as string]),
      style: { ...(props.closeButtonProps?.style as CSSProperties || {}) },
      onClick: (event: MouseEvent) => {
        if (props.closeButtonProps?.onClick) {
          (props.closeButtonProps.onClick as (event: MouseEvent) => void)(event)
        }
        if (!event.defaultPrevented) {
          props.onConfigureWhiteboardClose()
        }
      },
      ...(props.closeButtonProps ? Object.fromEntries(
        Object.entries(props.closeButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
      ) : {})
    }, [defaultCloseIcon])
  ])
  
  const headerNode = props.renderHeader
    ? props.renderHeader({ defaultHeader: defaultHeaderNode })
    : defaultHeaderNode
  
  // Assigned List
  const assignedItems = assignedParticipants.value.length > 0
    ? assignedParticipants.value.map((participant, index) => {
        const defaultItem = h('li', {
          key: participant.name,
          class: joinClassNames(['participant-item', props.assignedItemProps?.class as string]),
          style: { ...(props.assignedItemProps?.style as CSSProperties || {}) },
          ...(props.assignedItemProps ? Object.fromEntries(
            Object.entries(props.assignedItemProps).filter(([key]) => !['class', 'style', 'key'].includes(key))
          ) : {})
        }, [
          h('span', participant.name),
          h('button', {
            class: joinClassNames(['btn btn-danger btn-sm', props.assignedActionButtonProps?.class as string]),
            style: { ...(props.assignedActionButtonProps?.style as CSSProperties || {}) },
            onClick: (event: MouseEvent) => {
              if (props.assignedActionButtonProps?.onClick) {
                (props.assignedActionButtonProps.onClick as (event: MouseEvent) => void)(event)
              }
              if (!event.defaultPrevented) {
                toggleParticipant(participant, false)
              }
            },
            ...(props.assignedActionButtonProps ? Object.fromEntries(
              Object.entries(props.assignedActionButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
            ) : {})
          }, [defaultRemoveIcon])
        ])
        
        return props.renderAssignedItem
          ? props.renderAssignedItem({
              defaultItem,
              participant,
              remove: () => toggleParticipant(participant, false),
              index
            })
          : defaultItem
      })
    : [h('li', { class: 'participant-item' }, [
        typeof props.emptyAssignedState === 'function'
          ? (props.emptyAssignedState as (context: { participants: Participant[] }) => VNodeChild)({ participants: participants.value })
          : (props.emptyAssignedState || 'None')
      ])]
  
  const defaultAssignedListNode = h('div', {
    class: joinClassNames(['list-section', props.assignedSectionProps?.class as string]),
    style: { ...(props.assignedSectionProps?.style as CSSProperties || {}) },
    ...(props.assignedSectionProps ? Object.fromEntries(
      Object.entries(props.assignedSectionProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    h('h6', {
      class: joinClassNames(['list-title', props.assignedTitleProps?.class as string]),
      style: { ...(props.assignedTitleProps?.style as CSSProperties || {}) },
      ...(props.assignedTitleProps ? Object.fromEntries(
        Object.entries(props.assignedTitleProps).filter(([key]) => !['class', 'style'].includes(key))
      ) : {})
    }, typeof props.assignedTitle === 'string' || typeof props.assignedTitle === 'number' ? [props.assignedTitle] : (props.assignedTitle || [])),
    h('ul', {
      class: joinClassNames(['participant-list', props.assignedListProps?.class as string]),
      style: { ...(props.assignedListProps?.style as CSSProperties || {}) },
      ...(props.assignedListProps ? Object.fromEntries(
        Object.entries(props.assignedListProps).filter(([key]) => !['class', 'style'].includes(key))
      ) : {})
    }, assignedItems)
  ])
  
  const assignedListNode = props.renderAssignedList
    ? props.renderAssignedList({
        defaultAssignedList: defaultAssignedListNode,
        participants: assignedParticipants.value,
        removeParticipant: (p) => toggleParticipant(p, false)
      })
    : defaultAssignedListNode
  
  // Pending List
  const unassignedParticipants = computed(() => {
    return participantsCopy.value.filter((participant) => !participant.useBoard);
  })
  
  const pendingItems = unassignedParticipants.value.length > 0
    ? unassignedParticipants.value.map((participant, index) => {
        const defaultItem = h('li', {
          key: participant.name,
          class: joinClassNames(['participant-item', props.pendingItemProps?.class as string]),
          style: { ...(props.pendingItemProps?.style as CSSProperties || {}) },
          ...(props.pendingItemProps ? Object.fromEntries(
            Object.entries(props.pendingItemProps).filter(([key]) => !['class', 'style', 'key'].includes(key))
          ) : {})
        }, [
          h('span', participant.name),
          h('button', {
            class: joinClassNames(['btn btn-primary btn-sm', props.pendingActionButtonProps?.class as string]),
            style: { ...(props.pendingActionButtonProps?.style as CSSProperties || {}) },
            onClick: (event: MouseEvent) => {
              if (props.pendingActionButtonProps?.onClick) {
                (props.pendingActionButtonProps.onClick as (event: MouseEvent) => void)(event)
              }
              if (!event.defaultPrevented) {
                toggleParticipant(participant, true)
              }
            },
            ...(props.pendingActionButtonProps ? Object.fromEntries(
              Object.entries(props.pendingActionButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
            ) : {})
          }, [defaultAddIcon])
        ])
        
        return props.renderPendingItem
          ? props.renderPendingItem({
              defaultItem,
              participant,
              add: () => toggleParticipant(participant, true),
              index
            })
          : defaultItem
      })
    : [h('li', { class: 'participant-item' }, [
        typeof props.emptyPendingState === 'function'
          ? (props.emptyPendingState as (context: { participants: Participant[] }) => VNodeChild)({ participants: participants.value })
          : (props.emptyPendingState || 'None')
      ])]
  
  const defaultPendingListNode = h('div', {
    class: joinClassNames(['list-section', props.pendingSectionProps?.class as string]),
    style: { ...(props.pendingSectionProps?.style as CSSProperties || {}) },
    ...(props.pendingSectionProps ? Object.fromEntries(
      Object.entries(props.pendingSectionProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    h('h6', {
      class: joinClassNames(['list-title', props.pendingTitleProps?.class as string]),
      style: { ...(props.pendingTitleProps?.style as CSSProperties || {}) },
      ...(props.pendingTitleProps ? Object.fromEntries(
        Object.entries(props.pendingTitleProps).filter(([key]) => !['class', 'style'].includes(key))
      ) : {})
    }, typeof props.pendingTitle === 'string' || typeof props.pendingTitle === 'number' ? [props.pendingTitle] : (props.pendingTitle || [])),
    h('ul', {
      class: joinClassNames(['participant-list', props.pendingListProps?.class as string]),
      style: { ...(props.pendingListProps?.style as CSSProperties || {}) },
      ...(props.pendingListProps ? Object.fromEntries(
        Object.entries(props.pendingListProps).filter(([key]) => !['class', 'style'].includes(key))
      ) : {})
    }, pendingItems)
  ])
  
  const pendingListNode = props.renderPendingList
    ? props.renderPendingList({
        defaultPendingList: defaultPendingListNode,
        participants: unassignedParticipants.value,
        addParticipant: (p) => toggleParticipant(p, true)
      })
    : defaultPendingListNode
  
  const defaultListsNode = h('div', {
    class: joinClassNames(['modal-body', 'lists-container', props.listsWrapperProps?.class as string]),
    style: { ...(props.listsWrapperProps?.style as CSSProperties || {}) },
    ...(props.listsWrapperProps ? Object.fromEntries(
      Object.entries(props.listsWrapperProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    assignedListNode,
    pendingListNode
  ])
  
  const listsNode = props.renderLists
    ? props.renderLists({
        defaultLists: defaultListsNode,
        assignedParticipants: assignedParticipants.value,
        pendingParticipants: unassignedParticipants.value
      })
    : defaultListsNode
  
  const defaultFooterNode = h('div', {
    class: joinClassNames(['modal-footer', props.footerProps?.class as string]),
    style: { ...(props.footerProps?.style as CSSProperties || {}) },
    ...(props.footerProps ? Object.fromEntries(
      Object.entries(props.footerProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    h('button', {
      class: joinClassNames(['btn btn-info', props.saveButtonProps?.class as string]),
      style: { ...(props.saveButtonProps?.style as CSSProperties || {}) },
      onClick: (event: MouseEvent) => {
        if (props.saveButtonProps?.onClick) {
          (props.saveButtonProps.onClick as (event: MouseEvent) => void)(event)
        }
        if (!event.defaultPrevented) {
          handleSaveWhiteboard()
        }
      },
      ...(props.saveButtonProps ? Object.fromEntries(
        Object.entries(props.saveButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
      ) : {})
    }, [
      props.saveButtonLabel || 'Save ',
      defaultSaveIcon
    ])
  ])
  
  const footerNode = props.renderFooter
    ? props.renderFooter({
        defaultFooter: defaultFooterNode,
        isEditing: isEditing.value,
        canStartWhiteboard: canStartWhiteboard.value
      })
    : defaultFooterNode
  
  const sectionDividerNode = h('hr', {
    class: 'divider',
    style: { ...(props.sectionDividerProps?.style as CSSProperties || {}) },
    ...(props.sectionDividerProps ? Object.fromEntries(
      Object.entries(props.sectionDividerProps).filter(([key]) => key !== 'style')
    ) : {})
  })
  
  const isUpdating = whiteboardStarted.value && !whiteboardEnded.value
  
  const defaultActionsNode = !isEditing.value ? h('div', {
    class: joinClassNames(['action-buttons', props.actionsWrapperProps?.class as string]),
    style: { ...(props.actionsWrapperProps?.style as CSSProperties || {}) },
    ...(props.actionsWrapperProps ? Object.fromEntries(
      Object.entries(props.actionsWrapperProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    canStartWhiteboard.value ? h('button', {
      class: joinClassNames([
        'btn',
        isUpdating ? 'btn-warning' : 'btn-success',
        isUpdating ? (props.updateButtonProps?.class as string) : (props.startButtonProps?.class as string)
      ]),
      style: { ...(isUpdating ? (props.updateButtonProps?.style as CSSProperties || {}) : (props.startButtonProps?.style as CSSProperties || {})) },
      onClick: (event: MouseEvent) => {
        const buttonProps = isUpdating ? props.updateButtonProps : props.startButtonProps
        if (buttonProps?.onClick) {
          (buttonProps.onClick as (event: MouseEvent) => void)(event)
        }
        if (!event.defaultPrevented) {
          handleStartWhiteboardClick()
        }
      },
      ...(isUpdating ? (props.updateButtonProps ? Object.fromEntries(
        Object.entries(props.updateButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
      ) : {}) : (props.startButtonProps ? Object.fromEntries(
        Object.entries(props.startButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
      ) : {}))
    }, [
      isUpdating
        ? (props.updateButtonLabel || 'Update ')
        : (props.startButtonLabel || 'Start '),
      isUpdating ? defaultUpdateIcon : defaultStartIcon
    ]) : null,
    whiteboardStarted.value && !whiteboardEnded.value ? h('button', {
      class: joinClassNames(['btn btn-danger mt-2', props.stopButtonProps?.class as string]),
      style: { ...(props.stopButtonProps?.style as CSSProperties || {}) },
      onClick: (event: MouseEvent) => {
        if (props.stopButtonProps?.onClick) {
          (props.stopButtonProps.onClick as (event: MouseEvent) => void)(event)
        }
        if (!event.defaultPrevented) {
          handleStopWhiteboardClick()
        }
      },
      ...(props.stopButtonProps ? Object.fromEntries(
        Object.entries(props.stopButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
      ) : {})
    }, [
      props.stopButtonLabel || 'Stop ',
      defaultStopIcon
    ]) : null
  ].filter(Boolean)) : null
  
  const actionsNode = props.renderActions
    ? props.renderActions({
        defaultActions: defaultActionsNode,
        isEditing: isEditing.value,
        canStartWhiteboard: canStartWhiteboard.value,
        whiteboardStarted: whiteboardStarted.value,
        whiteboardEnded: whiteboardEnded.value
      })
    : defaultActionsNode
  
  const defaultBodyNode = h('div', {
    class: joinClassNames(['modal-content-wrapper', props.bodyProps?.class as string]),
    style: { ...(props.bodyProps?.style as CSSProperties || {}) },
    ...(props.bodyProps ? Object.fromEntries(
      Object.entries(props.bodyProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    headerNode,
    listsNode,
    footerNode,
    sectionDividerNode,
    actionsNode
  ].filter(Boolean))
  
  const bodyNode = props.renderBody
    ? props.renderBody({
        defaultBody: defaultBodyNode,
        isEditing: isEditing.value,
        assignedParticipants: assignedParticipants.value,
        pendingParticipants: unassignedParticipants.value
      })
    : defaultBodyNode
  
  const defaultContentNode = h('div', {
    class: contentClassName.value,
    style: contentStyle.value,
    ...(props.contentProps ? Object.fromEntries(
      Object.entries(props.contentProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [bodyNode])
  
  const contentNode = props.renderContent
    ? props.renderContent({ defaultContent: defaultContentNode })
    : defaultContentNode
  
  return h('div', {
    class: overlayClassName.value,
    style: overlayStyle.value,
    ...(props.overlayProps ? Object.fromEntries(
      Object.entries(props.overlayProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [contentNode])
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-container {
  display: flex;
  flex-direction: column;
}

.modal-content-wrapper {
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: black;
  margin: 0;
}

.close-button {
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  color: black;
  font-size: 20px;
}

.close-button:hover {
  opacity: 0.7;
}

.modal-body {
  flex: 1;
}

.lists-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.list-section {
  display: flex;
  flex-direction: column;
}

.list-title {
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 1rem;
}

.participant-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.participant-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  margin: 8px;
  background-color: white;
  color: #333;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.divider {
  height: 1px;
  background-color: #ccc;
  border: none;
  margin: 10px 0;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 0.75rem;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #a71d2a;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover {
  background-color: #117a8b;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #1e7e34;
}

.btn-warning {
  background-color: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background-color: #e0a800;
}

.mt-2 {
  margin-top: 8px;
}

@media (max-width: 576px) {
  .lists-container {
    grid-template-columns: 1fr;
  }
}
</style>
