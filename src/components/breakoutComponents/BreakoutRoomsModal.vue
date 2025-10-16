<!--
/**
 * @fileoverview BreakoutRoomsModal - Comprehensive breakout rooms management interface
 * @component BreakoutRoomsModal
 * @module components/breakoutComponents/BreakoutRoomsModal
 * 
 * @description
 * A full-featured modal for creating, managing, and controlling breakout rooms. Allows
 * hosts to divide participants into multiple rooms, assign participants manually or randomly,
 * start/stop breakout sessions, and monitor active rooms. Integrates with Socket.io for
 * real-time synchronization and includes EditRoomModal for detailed room management.
 * 
 * Key Features:
 * - **Room Creation**: Set number of rooms (1-N) and create them instantly
 * - **Manual Assignment**: Drag participants into rooms via dropdown selects
 * - **Random Assignment**: Auto-distribute participants evenly across rooms
 * - **Edit Rooms**: Click "Edit" to manage individual room participants (EditRoomModal)
 * - **Add/Delete Rooms**: Add new rooms or delete existing ones dynamically
 * - **Save Rooms**: Persist room assignments before starting session
 * - **Start/Stop Session**: Launch breakout rooms or end active sessions
 * - **Real-time Sync**: Socket.io integration for instant updates
 * - **Host Controls**: Host-only access for all management functions
 * - **Empty State Handling**: Guides for creating first room
 * - **Responsive Modal**: Configurable positioning and styling
 * 
 * User Roles:
 * - **Host (islevel='2')**: Full control - create/edit/start/stop breakout rooms
 * - **Participants**: Cannot open this modal - auto-assigned to rooms by host
 * 
 * Workflow:
 * 1. Host opens BreakoutRoomsModal from menu or whiteboard controls
 * 2. Host enters number of rooms (e.g., 3) in "Number of Rooms" input
 * 3. Host clicks "Random Assign" → participants auto-distributed evenly OR
 *    Host clicks "Manual Assign" → participant dropdowns appear for each room
 * 4. Host assigns participants manually via "Select Participant" dropdowns
 * 5. Host clicks "Edit" on a room → EditRoomModal opens for detailed management
 * 6. Host clicks "+" to add more rooms or trash icon to delete rooms
 * 7. Host clicks "Save" → room assignments persisted to state
 * 8. Host clicks "Start" → Socket.io emits 'startBreakoutRooms' → sessions begin
 * 9. Participants auto-navigated to their assigned rooms
 * 10. Host clicks "Stop" → Socket.io emits 'stopBreakoutRooms' → sessions end
 * 11. All participants return to main room
 * 
 * Socket Events:
 * - **startBreakoutRooms**: Launches breakout session for all rooms
 * - **stopBreakoutRooms**: Ends breakout session and returns participants to main room
 * - **breakoutRoomUpdated**: Real-time updates when assignments change
 * 
 * Assignment Modes:
 * - **Random**: Evenly distributes participants across rooms (auto-balance)
 * - **Manual**: Host selects participants via dropdowns for each room
 * 
 * @example Basic Usage - Random Assignment
 * ```typescript
 * // <BreakoutRoomsModal
 *   // :isVisible="isBreakoutRoomsModalVisible"
 *   // :parameters="{
 *     participants: allParticipants,
 *     showAlert: alertFunction,
 *     socket: socketConnection,
 *     roomName: 'main-room',
 *     breakoutRooms: currentBreakoutRooms,
 *     breakOutRoomStarted: isBreakoutActive,
 *     canStartBreakout: hostCanStart,
 *     updateBreakoutRooms: setBreakoutRooms,
 *     updateBreakOutRoomStarted: setBreakoutStarted,
 *     updateCanStartBreakout: setCanStart,
 *     updateCurrentRoomIndex: setCurrentRoomIndex,
 *     getUpdatedAllParams: getAllParams
 *   }"
 *   // :onBreakoutRoomsClose="() => setIsBreakoutRoomsModalVisible(false)"
 *   // position="topRight"
 *   // backgroundColor="#f8f9fa"
 * // />
 * ```
 * 
 * @remarks
 * This component requires Socket.io for real-time synchronization. Host must save room
 * assignments before starting sessions. Participants cannot create or manage rooms - only
 * hosts have access to this modal. EditRoomModal opens as a child modal for detailed
 * per-room management. Screen sharing and certain display modes may be disabled during
 * active breakout sessions.
 * 
 * @see {@link EditRoomModal} - Child modal for detailed room participant management
 * @see {@link RoomList} - Sub-component that renders room cards
 */
-->
<template>
  <div>
    <RenderVNode :node="overlayNode" />
    <!-- Edit Room Modal -->
    <EditRoomModal
      :edit-room-modal-visible="editRoomModalVisible"
      :set-edit-room-modal-visible="setEditRoomModalVisible"
      :current-room="currentRoom"
      :participants-ref="{ value: participantsRef }"
      :handle-add-participant="handleAddParticipant"
      :handle-remove-participant="handleRemoveParticipant"
      :current-room-index="currentRoomIndex"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, withDefaults, h, isVNode, defineComponent, type PropType, type VNodeChild, type HTMLAttributes, type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes, type LabelHTMLAttributes, type CSSProperties } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faDoorOpen,
  faTimes,
  faUsers,
  faRandom,
  faHandPointer,
  faPlus,
  faSave,
  faSyncAlt,
  faPlay,
  faStop,
} from '@fortawesome/free-solid-svg-icons';
import RoomList from './RoomList.vue';
import EditRoomModal from './EditRoomModal.vue';
import { Socket } from 'socket.io-client';
import { handleStartBreakout } from 'mediasfu-shared';
import { handleStopBreakout } from 'mediasfu-shared';
import type { Participant, BreakoutParticipant } from 'mediasfu-shared';

export type ShowAlert = (alert: { message: string; type: 'success' | 'danger'; duration?: number }) => void;

/**
 * Parameters interface for BreakoutRoomsModal
 * @interface BreakoutRoomsModalParameters
 * 
 * @property {Participant[]} participants - All event participants
 * @property {ShowAlert} [showAlert] - Alert function for user feedback
 * @property {Socket} socket - Socket.io instance for real-time updates
 * @property {Socket} [localSocket] - Optional local socket instance
 * @property {number} itemPageLimit - Max items per page
 * @property {string} meetingDisplayType - Current display mode
 * @property {string} prevMeetingDisplayType - Previous display mode
 * @property {string} roomName - Main room name
 * @property {boolean} shareScreenStarted - Whether screen sharing is active
 * @property {boolean} shared - Whether content is shared
 * @property {boolean} breakOutRoomStarted - Whether breakout session is active
 * @property {boolean} breakOutRoomEnded - Whether breakout session ended
 * @property {boolean} isBreakoutRoomsModalVisible - Modal visibility state
 * @property {number|null} currentRoomIndex - Currently selected room index
 * @property {boolean} canStartBreakout - Whether host can start breakout session
 * @property {BreakoutParticipant[][]} breakoutRooms - Array of room participant arrays
 * @property {function} updateBreakOutRoomStarted - Update breakout started state
 * @property {function} updateBreakOutRoomEnded - Update breakout ended state
 * @property {function} updateCurrentRoomIndex - Update selected room index
 * @property {function} updateCanStartBreakout - Update start permission
 * @property {function} updateBreakoutRooms - Update all room assignments
 * @property {function} updateMeetingDisplayType - Update display mode
 * @property {function} getUpdatedAllParams - Get latest parameters
 */
export interface BreakoutRoomsModalParameters {
  participants: Participant[];
  showAlert?: ShowAlert;
  socket: Socket;
  localSocket?: Socket;
  itemPageLimit: number;
  meetingDisplayType: string;
  prevMeetingDisplayType: string;
  roomName: string;
  shareScreenStarted: boolean;
  shared: boolean;
  breakOutRoomStarted: boolean;
  breakOutRoomEnded: boolean;
  isBreakoutRoomsModalVisible: boolean;
  currentRoomIndex: number | null;
  canStartBreakout: boolean;
  breakoutRooms: BreakoutParticipant[][];
  updateBreakOutRoomStarted: (started: boolean) => void;
  updateBreakOutRoomEnded: (ended: boolean) => void;
  updateCurrentRoomIndex: (roomIndex: number) => void;
  updateCanStartBreakout: (canStart: boolean) => void;
  updateBreakoutRooms: (rooms: BreakoutParticipant[][]) => void;
  updateMeetingDisplayType: (displayType: string) => void;
  getUpdatedAllParams: () => BreakoutRoomsModalParameters;
  [key: string]: unknown;
}

export interface BreakoutRoomsModalOptions {
  isVisible: boolean;
  parameters: BreakoutRoomsModalParameters;
  onBreakoutRoomsClose: () => void;
  position?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';
  backgroundColor?: string;
  
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
  controlsWrapperProps?: HTMLAttributes
  numRoomsFieldProps?: HTMLAttributes
  numRoomsLabelProps?: LabelHTMLAttributes
  numRoomsInputProps?: InputHTMLAttributes
  actionsWrapperProps?: HTMLAttributes
  randomAssignButtonProps?: ButtonHTMLAttributes
  manualAssignButtonProps?: ButtonHTMLAttributes
  addRoomButtonProps?: ButtonHTMLAttributes
  saveRoomsButtonProps?: ButtonHTMLAttributes
  newParticipantFieldProps?: HTMLAttributes
  newParticipantLabelProps?: LabelHTMLAttributes
  newParticipantSelectProps?: SelectHTMLAttributes
  roomsContainerProps?: HTMLAttributes
  startButtonProps?: ButtonHTMLAttributes
  stopButtonProps?: ButtonHTMLAttributes
  numRoomsLabel?: VNodeChild
  newParticipantActionLabel?: VNodeChild
  randomAssignButtonLabel?: VNodeChild
  manualAssignButtonLabel?: VNodeChild
  addRoomButtonLabel?: VNodeChild
  saveRoomsButtonLabel?: VNodeChild
  startBreakoutButtonLabel?: VNodeChild
  updateBreakoutButtonLabel?: VNodeChild
  stopBreakoutButtonLabel?: VNodeChild
  renderHeader?: (options: { defaultHeader: VNodeChild }) => VNodeChild
  renderControls?: (options: { defaultControls: VNodeChild }) => VNodeChild
  renderRoomList?: (options: {
    defaultRoomList: VNodeChild
    rooms: BreakoutParticipant[][]
  }) => VNodeChild
  renderStartButton?: (options: {
    defaultStartButton: VNodeChild
    isUpdating: boolean
  }) => VNodeChild
  renderStopButton?: (options: { defaultStopButton: VNodeChild }) => VNodeChild
  renderBody?: (options: { defaultBody: VNodeChild }) => VNodeChild
  renderContent?: (options: { defaultContent: VNodeChild }) => VNodeChild
}

const props = withDefaults(defineProps<BreakoutRoomsModalOptions>(), {
  backgroundColor: '#83c0e9',
  position: 'topRight',
  title: () => h('span', [
    'Breakout Rooms ',
    h(FontAwesomeIcon, { icon: faDoorOpen })
  ]),
  overlayProps: undefined,
  contentProps: undefined,
  headerProps: undefined,
  titleProps: undefined,
  closeButtonProps: undefined,
  closeIconComponent: undefined,
  headerDividerProps: undefined,
  bodyProps: undefined,
  controlsWrapperProps: undefined,
  numRoomsFieldProps: undefined,
  numRoomsLabelProps: undefined,
  numRoomsInputProps: undefined,
  actionsWrapperProps: undefined,
  randomAssignButtonProps: undefined,
  manualAssignButtonProps: undefined,
  addRoomButtonProps: undefined,
  saveRoomsButtonProps: undefined,
  newParticipantFieldProps: undefined,
  newParticipantLabelProps: undefined,
  newParticipantSelectProps: undefined,
  roomsContainerProps: undefined,
  startButtonProps: undefined,
  stopButtonProps: undefined,
  numRoomsLabel: undefined,
  newParticipantActionLabel: undefined,
  randomAssignButtonLabel: undefined,
  manualAssignButtonLabel: undefined,
  addRoomButtonLabel: undefined,
  saveRoomsButtonLabel: undefined,
  startBreakoutButtonLabel: undefined,
  updateBreakoutButtonLabel: undefined,
  stopBreakoutButtonLabel: undefined,
  renderHeader: undefined,
  renderControls: undefined,
  renderRoomList: undefined,
  renderStartButton: undefined,
  renderStopButton: undefined,
  renderBody: undefined,
  renderContent: undefined
});

// State
const numRooms = ref<string>('');
const newParticipantAction = ref<string>('autoAssignNewRoom');
const currentRoom = ref<BreakoutParticipant[]>([]);
const currentRoomIndex = ref<number | null>(null);
const editRoomModalVisible = ref<boolean>(false);
const startBreakoutButtonVisible = ref<boolean>(false);
const stopBreakoutButtonVisible = ref<boolean>(false);

// Refs
const participantsRef = ref<Participant[]>([]);
const breakoutRoomsRef = ref<BreakoutParticipant[][]>([]);

// Reactive computed access to parameters
const participants = computed(() => props.parameters.participants);
const showAlert = computed(() => props.parameters.showAlert);
const socket = computed(() => props.parameters.socket);
const itemPageLimit = computed(() => props.parameters.itemPageLimit);
const meetingDisplayType = computed(() => props.parameters.meetingDisplayType);
const prevMeetingDisplayType = computed(() => props.parameters.prevMeetingDisplayType);
const roomName = computed(() => props.parameters.roomName);
const shareScreenStarted = computed(() => props.parameters.shareScreenStarted);
const shared = computed(() => props.parameters.shared);
const breakOutRoomStarted = computed(() => props.parameters.breakOutRoomStarted);
const breakOutRoomEnded = computed(() => props.parameters.breakOutRoomEnded);
const breakoutRooms = computed(() => props.parameters.breakoutRooms);
const canStartBreakout = computed(() => props.parameters.canStartBreakout);
const localSocket = computed(() => props.parameters.localSocket);
const updateBreakOutRoomStarted = computed(() => props.parameters.updateBreakOutRoomStarted);
const updateBreakOutRoomEnded = computed(() => props.parameters.updateBreakOutRoomEnded);
const updateBreakoutRooms = computed(() => props.parameters.updateBreakoutRooms);
const updateMeetingDisplayType = computed(() => props.parameters.updateMeetingDisplayType);

const normalizeBreakoutAssignment = <T extends { breakRoom?: number | null }>(
  participant: T,
  fallback: number | null
): T => (
  participant.breakRoom === undefined
    ? ({ ...participant, breakRoom: fallback } as T)
    : participant
);

const sanitizeParticipants = (people: Participant[]): Participant[] =>
  people
    .filter((p) => p.name !== 'screenShare' && p.name !== 'screen')
    .map((participant) => normalizeBreakoutAssignment(participant, null));

const sanitizeRooms = (rooms: BreakoutParticipant[][]): BreakoutParticipant[][] =>
  rooms.map((room, index) =>
    room.map((participant) => normalizeBreakoutAssignment(participant, index))
  );

// Initialize refs
onMounted(() => {
  if (props.isVisible) {
    // Filter out host (islevel = '2') and screen participants
    const filteredParticipants = participants.value.filter((participant: Participant) => participant.islevel != '2');
    participantsRef.value = sanitizeParticipants(filteredParticipants);
    breakoutRoomsRef.value = breakoutRooms.value && breakoutRooms.value.length > 0 ? sanitizeRooms(breakoutRooms.value) : [];
    checkCanStartBreakout();
  }
});

// Watch for visibility changes
watch(
  () => props.isVisible,
  (newVisible) => {
    if (newVisible) {
      const filteredParticipants = participants.value.filter((participant: Participant) => participant.islevel != '2');
      participantsRef.value = sanitizeParticipants(filteredParticipants);
      breakoutRoomsRef.value = breakoutRooms.value && breakoutRooms.value.length > 0 ? sanitizeRooms(breakoutRooms.value) : [];
      checkCanStartBreakout();
    }
  }
);

// Watch for changes
watch(
  () => props.parameters.participants,
  (newParticipants) => {
    if (props.isVisible) {
      const filteredParticipants = newParticipants.filter((participant: Participant) => participant.islevel != '2');
      participantsRef.value = sanitizeParticipants(filteredParticipants);
    }
  }
);

watch(
  () => props.parameters.breakoutRooms,
  (newRooms) => {
    if (props.isVisible) {
      breakoutRoomsRef.value = newRooms && newRooms.length > 0 ? sanitizeRooms(newRooms) : [];
    }
  }
);

watch(
  () => props.parameters.canStartBreakout,
  () => {
    checkCanStartBreakout();
  }
);

// Check if can start breakout
const checkCanStartBreakout = () => {
  if (canStartBreakout.value) {
    startBreakoutButtonVisible.value = true;
    stopBreakoutButtonVisible.value = breakOutRoomStarted.value && !breakOutRoomEnded.value;
  } else {
    startBreakoutButtonVisible.value = false;
    stopBreakoutButtonVisible.value = false;
  }
};

// Validate rooms
const validateRooms = (): boolean => {
  if (breakoutRoomsRef.value.length === 0) {
    showAlert.value?.({ message: 'There must be at least one room', type: 'danger' });
    return false;
  }

  for (let room of breakoutRoomsRef.value) {
    if (room.length === 0) {
      showAlert.value?.({ message: 'Rooms must not be empty', type: 'danger' });
      return false;
    }

    const participantNames = room.map((p) => p.name);
    const uniqueNames = new Set(participantNames);
    if (participantNames.length !== uniqueNames.size) {
      showAlert.value?.({ message: 'Duplicate participant names in a room', type: 'danger' });
      return false;
    }

    if (room.length > itemPageLimit.value) {
      showAlert.value?.({ message: 'A room exceeds the participant limit', type: 'danger' });
      return false;
    }
  }

  return true;
};

// Random assign
const handleRandomAssign = () => {
  const numRoomsInt = parseInt(numRooms.value);
  if (isNaN(numRoomsInt) || numRoomsInt <= 0) {
    showAlert.value?.({ message: 'Please enter a valid number of rooms', type: 'danger' });
    return;
  }

  const newBreakoutRooms: BreakoutParticipant[][] = Array.from({ length: numRoomsInt }, () => []);
  const shuffledParticipants = [...participantsRef.value].sort(() => 0.5 - Math.random());

  shuffledParticipants.forEach((participant, index) => {
    const roomIndex = index % numRoomsInt;
    const targetRoom = newBreakoutRooms[roomIndex];
    if (targetRoom && targetRoom.length < itemPageLimit.value) {
      const participant_: BreakoutParticipant = { name: participant.name, breakRoom: roomIndex };
      targetRoom.push(participant_);
      participant.breakRoom = roomIndex;
    } else {
      for (let i = 0; i < numRoomsInt; i++) {
        const room = newBreakoutRooms[i];
        if (room && room.length < itemPageLimit.value) {
          room.push(participant);
          participant.breakRoom = i;
          break;
        }
      }
    }
  });

  breakoutRoomsRef.value = newBreakoutRooms;
  checkCanStartBreakout();
};

// Manual assign
const handleManualAssign = () => {
  const numRoomsInt = parseInt(numRooms.value);
  if (isNaN(numRoomsInt) || numRoomsInt <= 0) {
    showAlert.value?.({ message: 'Please enter a valid number of rooms', type: 'danger' });
    return;
  }

  breakoutRoomsRef.value = Array.from({ length: numRoomsInt }, () => []);
  props.parameters.updateCanStartBreakout(false);
  checkCanStartBreakout();
};

// Add room
const handleAddRoom = () => {
  breakoutRoomsRef.value = [...breakoutRoomsRef.value, []];
  props.parameters.updateCanStartBreakout(false);
  checkCanStartBreakout();
};

// Save rooms
const handleSaveRooms = () => {
  if (validateRooms()) {
    updateBreakoutRooms.value(breakoutRoomsRef.value);
    props.parameters.updateCanStartBreakout(true);
    checkCanStartBreakout();
    showAlert.value?.({ message: 'Rooms saved successfully', type: 'success' });
  } else {
    showAlert.value?.({ message: 'Rooms validation failed', type: 'danger' });
  }
};

// Edit room
const handleEditRoom = (roomIndex: number) => {
  currentRoomIndex.value = roomIndex;
  const room = breakoutRoomsRef.value[roomIndex];
  if (room) {
    currentRoom.value = room;
  }
  editRoomModalVisible.value = true;
  props.parameters.updateCanStartBreakout(false);
  checkCanStartBreakout();
};

// Delete room
const handleDeleteRoom = (roomIndex: number) => {
  const room = breakoutRoomsRef.value[roomIndex];
  if (room) {
    room.forEach((participant) => (participant.breakRoom = null));
  }
  const newBreakoutRooms = [...breakoutRoomsRef.value];
  newBreakoutRooms.splice(roomIndex, 1);

  newBreakoutRooms.forEach((room, index) => {
    room.forEach((participant) => (participant.breakRoom = index));
  });

  breakoutRoomsRef.value = newBreakoutRooms;
  checkCanStartBreakout();
};

// Add participant to room
const handleAddParticipant = (roomIndex: number, participant: Participant | BreakoutParticipant) => {
  const room = breakoutRoomsRef.value[roomIndex];
  if (room && room.length < itemPageLimit.value) {
    const newBreakoutRooms = [...breakoutRoomsRef.value];
    const participant_: BreakoutParticipant = { name: participant.name, breakRoom: roomIndex };
    newBreakoutRooms[roomIndex]?.push(participant_);
    breakoutRoomsRef.value = newBreakoutRooms;
    participant.breakRoom = roomIndex;
    if (currentRoomIndex.value != null) {
      handleEditRoom(currentRoomIndex.value);
    }
  } else {
    showAlert.value?.({ message: 'Room is full', type: 'danger' });
  }
};

// Remove participant from room
const handleRemoveParticipant = (roomIndex: number, participant: Participant | BreakoutParticipant) => {
  const newBreakoutRooms = [...breakoutRoomsRef.value];
  const room = newBreakoutRooms[roomIndex];
  if (room) {
    newBreakoutRooms[roomIndex] = room.filter((p) => p !== participant);
  }
  breakoutRoomsRef.value = newBreakoutRooms;
  participant.breakRoom = null;
  if (currentRoomIndex.value != null) {
    handleEditRoom(currentRoomIndex.value);
  }
};

// Start breakout
const handleStartBreakoutClick = () => {
  if (shareScreenStarted.value || shared.value) {
    showAlert.value?.({ message: 'You cannot start breakout rooms while screen sharing is active', type: 'danger' });
    return;
  }

  if (canStartBreakout.value) {
    handleStartBreakout({
      socket: socket.value as Socket,
      localSocket: localSocket.value as Socket | undefined,
      breakoutRooms: breakoutRoomsRef.value,
      newParticipantAction: newParticipantAction.value,
      roomName: roomName.value,
      breakOutRoomStarted: breakOutRoomStarted.value,
      breakOutRoomEnded: breakOutRoomEnded.value,
      showAlert: showAlert.value,
      updateBreakOutRoomStarted: updateBreakOutRoomStarted.value,
      updateBreakOutRoomEnded: updateBreakOutRoomEnded.value,
      onBreakoutRoomsClose: props.onBreakoutRoomsClose,
      meetingDisplayType: meetingDisplayType.value,
      updateMeetingDisplayType: updateMeetingDisplayType.value,
    });
  }
};

// Stop breakout
const handleStopBreakoutClick = () => {
  handleStopBreakout({
    socket: socket.value as Socket,
    localSocket: localSocket.value as Socket | undefined,
    roomName: roomName.value,
    showAlert: showAlert.value,
    updateBreakOutRoomStarted: updateBreakOutRoomStarted.value,
    updateBreakOutRoomEnded: updateBreakOutRoomEnded.value,
    onBreakoutRoomsClose: props.onBreakoutRoomsClose,
    meetingDisplayType: meetingDisplayType.value,
    prevMeetingDisplayType: prevMeetingDisplayType.value,
    updateMeetingDisplayType: updateMeetingDisplayType.value,
  });
};

// Set edit room modal visibility
const setEditRoomModalVisible = (visible: boolean) => {
  editRoomModalVisible.value = visible;
};

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
const defaultOverlayWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.9, 600) : 360

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
  joinClassNames(['mediasfu-breakout-modal', props.overlayProps?.class as string])
)

const contentStyle = computed((): CSSProperties => ({
  position: 'fixed' as const,
  backgroundColor: props.backgroundColor,
  borderRadius: '10px',
  padding: '10px',
  width: `${defaultOverlayWidth}px`,
  maxHeight: '65%',
  overflowY: 'auto' as const,
  top: props.position.includes('top') ? '10px' : 'auto',
  bottom: props.position.includes('bottom') ? '10px' : 'auto',
  left: props.position.includes('Left') ? '10px' : 'auto',
  right: props.position.includes('Right') ? '10px' : 'auto',
  ...(props.contentProps?.style as CSSProperties || {})
}))

const contentClassName = computed(() => 
  joinClassNames(['mediasfu-breakout-modal__content', props.contentProps?.class as string])
)

// Main overlay node
const overlayNode = computed(() => {
  const defaultCloseIcon = props.closeIconComponent ?? h(FontAwesomeIcon, { icon: faTimes, size: 'xl' })
  
  const defaultHeaderNode = h('div', {
    class: joinClassNames(['modal-header', props.headerProps?.class as string]),
    style: { ...(props.headerProps?.style as CSSProperties || {}) },
    ...(props.headerProps ? Object.fromEntries(
      Object.entries(props.headerProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    h('h2', {
      class: joinClassNames(['modal-title', props.titleProps?.class as string]),
      style: { ...(props.titleProps?.style as CSSProperties || {}) },
      ...(props.titleProps ? Object.fromEntries(
        Object.entries(props.titleProps).filter(([key]) => !['class', 'style'].includes(key))
      ) : {})
    }, typeof props.title === 'string' || typeof props.title === 'number' ? [props.title] : (props.title || [])),
    h('button', {
      class: joinClassNames(['close-button', props.closeButtonProps?.class as string]),
      style: { ...(props.closeButtonProps?.style as CSSProperties || {}) },
      onClick: (event: MouseEvent) => {
        if (props.closeButtonProps?.onClick) {
          (props.closeButtonProps.onClick as (event: MouseEvent) => void)(event)
        }
        if (!event.defaultPrevented) {
          props.onBreakoutRoomsClose()
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
  
  const dividerNode = h('hr', {
    class: 'divider',
    style: { ...(props.headerDividerProps?.style as CSSProperties || {}) },
    ...(props.headerDividerProps ? Object.fromEntries(
      Object.entries(props.headerDividerProps).filter(([key]) => key !== 'style')
    ) : {})
  })
  
  // Controls section
  const defaultControlsNode = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } }, [
    // Number of Rooms Input
    h('div', {
      class: joinClassNames(['form-group', props.numRoomsFieldProps?.class as string]),
      style: { ...(props.numRoomsFieldProps?.style as CSSProperties || {}) },
      ...(props.numRoomsFieldProps ? Object.fromEntries(
        Object.entries(props.numRoomsFieldProps).filter(([key]) => !['class', 'style'].includes(key))
      ) : {})
    }, [
      h('label', {
        for: 'numRooms',
        class: props.numRoomsLabelProps?.class,
        style: { ...(props.numRoomsLabelProps?.style as CSSProperties || {}) },
        ...(props.numRoomsLabelProps ? Object.fromEntries(
          Object.entries(props.numRoomsLabelProps).filter(([key]) => !['class', 'style', 'for'].includes(key))
        ) : {})
      }, [
        props.numRoomsLabel || 'Number of Rooms ',
        h(FontAwesomeIcon, { icon: faUsers })
      ]),
      h('input', {
        id: 'numRooms',
        type: 'number',
        class: joinClassNames(['form-control', props.numRoomsInputProps?.class as string]),
        style: { ...(props.numRoomsInputProps?.style as CSSProperties || {}) },
        value: numRooms.value,
        onInput: (event: Event) => {
          numRooms.value = (event.target as HTMLInputElement).value
          if (props.numRoomsInputProps?.onInput) {
            (props.numRoomsInputProps.onInput as (event: Event) => void)(event)
          }
        },
        ...(props.numRoomsInputProps ? Object.fromEntries(
          Object.entries(props.numRoomsInputProps).filter(([key]) => !['class', 'style', 'value', 'onInput'].includes(key))
        ) : {})
      })
    ]),
    
    // Action Buttons
    h('div', {
      class: joinClassNames(['action-buttons', props.actionsWrapperProps?.class as string]),
      style: { ...(props.actionsWrapperProps?.style as CSSProperties || {}) },
      ...(props.actionsWrapperProps ? Object.fromEntries(
        Object.entries(props.actionsWrapperProps).filter(([key]) => !['class', 'style'].includes(key))
      ) : {})
    }, [
      h('button', {
        class: joinClassNames(['btn btn-primary', props.randomAssignButtonProps?.class as string]),
        style: { ...(props.randomAssignButtonProps?.style as CSSProperties || {}) },
        onClick: (event: MouseEvent) => {
          if (props.randomAssignButtonProps?.onClick) {
            (props.randomAssignButtonProps.onClick as (event: MouseEvent) => void)(event)
          }
          if (!event.defaultPrevented) {
            handleRandomAssign()
          }
        },
        ...(props.randomAssignButtonProps ? Object.fromEntries(
          Object.entries(props.randomAssignButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
        ) : {})
      }, [
        props.randomAssignButtonLabel || 'Random Assign ',
        h(FontAwesomeIcon, { icon: faRandom })
      ]),
      h('button', {
        class: joinClassNames(['btn btn-secondary', props.manualAssignButtonProps?.class as string]),
        style: { ...(props.manualAssignButtonProps?.style as CSSProperties || {}) },
        onClick: (event: MouseEvent) => {
          if (props.manualAssignButtonProps?.onClick) {
            (props.manualAssignButtonProps.onClick as (event: MouseEvent) => void)(event)
          }
          if (!event.defaultPrevented) {
            handleManualAssign()
          }
        },
        ...(props.manualAssignButtonProps ? Object.fromEntries(
          Object.entries(props.manualAssignButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
        ) : {})
      }, [
        props.manualAssignButtonLabel || 'Manual Assign ',
        h(FontAwesomeIcon, { icon: faHandPointer })
      ]),
      h('button', {
        class: joinClassNames(['btn btn-success', props.addRoomButtonProps?.class as string]),
        style: { ...(props.addRoomButtonProps?.style as CSSProperties || {}) },
        onClick: (event: MouseEvent) => {
          if (props.addRoomButtonProps?.onClick) {
            (props.addRoomButtonProps.onClick as (event: MouseEvent) => void)(event)
          }
          if (!event.defaultPrevented) {
            handleAddRoom()
          }
        },
        ...(props.addRoomButtonProps ? Object.fromEntries(
          Object.entries(props.addRoomButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
        ) : {})
      }, [
        props.addRoomButtonLabel || 'Add Room ',
        h(FontAwesomeIcon, { icon: faPlus })
      ]),
      h('button', {
        class: joinClassNames(['btn btn-info', props.saveRoomsButtonProps?.class as string]),
        style: { ...(props.saveRoomsButtonProps?.style as CSSProperties || {}) },
        onClick: (event: MouseEvent) => {
          if (props.saveRoomsButtonProps?.onClick) {
            (props.saveRoomsButtonProps.onClick as (event: MouseEvent) => void)(event)
          }
          if (!event.defaultPrevented) {
            handleSaveRooms()
          }
        },
        ...(props.saveRoomsButtonProps ? Object.fromEntries(
          Object.entries(props.saveRoomsButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
        ) : {})
      }, [
        props.saveRoomsButtonLabel || 'Save Rooms ',
        h(FontAwesomeIcon, { icon: faSave })
      ])
    ]),
    
    // New Participant Action
    h('div', {
      class: joinClassNames(['form-group', props.newParticipantFieldProps?.class as string]),
      style: { ...(props.newParticipantFieldProps?.style as CSSProperties || {}) },
      ...(props.newParticipantFieldProps ? Object.fromEntries(
        Object.entries(props.newParticipantFieldProps).filter(([key]) => !['class', 'style'].includes(key))
      ) : {})
    }, [
      h('label', {
        for: 'newParticipantAction',
        class: props.newParticipantLabelProps?.class,
        style: { ...(props.newParticipantLabelProps?.style as CSSProperties || {}) },
        ...(props.newParticipantLabelProps ? Object.fromEntries(
          Object.entries(props.newParticipantLabelProps).filter(([key]) => !['class', 'style', 'for'].includes(key))
        ) : {})
      }, [
        props.newParticipantActionLabel || 'New Participant Action ',
        h(FontAwesomeIcon, { icon: faUsers })
      ]),
      h('select', {
        id: 'newParticipantAction',
        class: joinClassNames(['form-control', props.newParticipantSelectProps?.class as string]),
        style: { ...(props.newParticipantSelectProps?.style as CSSProperties || {}) },
        value: newParticipantAction.value,
        onChange: (event: Event) => {
          newParticipantAction.value = (event.target as HTMLSelectElement).value
          if (props.newParticipantSelectProps?.onChange) {
            (props.newParticipantSelectProps.onChange as (event: Event) => void)(event)
          }
        },
        ...(props.newParticipantSelectProps ? Object.fromEntries(
          Object.entries(props.newParticipantSelectProps).filter(([key]) => !['class', 'style', 'value', 'onChange'].includes(key))
        ) : {})
      }, [
        h('option', { value: 'autoAssignNewRoom' }, 'Add to new room'),
        h('option', { value: 'autoAssignAvailableRoom' }, 'Add to open room'),
        h('option', { value: 'manualAssign' }, 'No action')
      ])
    ])
  ])
  
  const controlsNode = props.renderControls
    ? props.renderControls({ defaultControls: defaultControlsNode })
    : defaultControlsNode
  
  // Room List
  const defaultRoomListNode = h('div', {
    class: props.roomsContainerProps?.class,
    style: { ...(props.roomsContainerProps?.style as CSSProperties || {}) },
    ...(props.roomsContainerProps ? Object.fromEntries(
      Object.entries(props.roomsContainerProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    h(RoomList, {
      rooms: breakoutRoomsRef.value,
      handleEditRoom: handleEditRoom,
      handleDeleteRoom: handleDeleteRoom,
      handleRemoveParticipant: handleRemoveParticipant
    })
  ])
  
  const roomListNode = props.renderRoomList
    ? props.renderRoomList({
        defaultRoomList: defaultRoomListNode,
        rooms: breakoutRoomsRef.value
      })
    : defaultRoomListNode
  
  const isUpdating = breakOutRoomStarted.value && !breakOutRoomEnded.value
  
  // Start/Update Button
  const defaultStartButtonNode = startBreakoutButtonVisible.value ? h('button', {
    class: joinClassNames(['btn btn-primary mr-2 mb-2', props.startButtonProps?.class as string]),
    style: { ...(props.startButtonProps?.style as CSSProperties || {}) },
    onClick: (event: MouseEvent) => {
      if (props.startButtonProps?.onClick) {
        (props.startButtonProps.onClick as (event: MouseEvent) => void)(event)
      }
      if (!event.defaultPrevented) {
        handleStartBreakoutClick()
      }
    },
    ...(props.startButtonProps ? Object.fromEntries(
      Object.entries(props.startButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
    ) : {})
  }, [
    isUpdating
      ? (props.updateBreakoutButtonLabel || 'Update Breakout ')
      : (props.startBreakoutButtonLabel || 'Start Breakout '),
    h(FontAwesomeIcon, { icon: isUpdating ? faSyncAlt : faPlay })
  ]) : null
  
  const startButtonNode = props.renderStartButton
    ? props.renderStartButton({
        defaultStartButton: defaultStartButtonNode,
        isUpdating
      })
    : defaultStartButtonNode
  
  // Stop Button
  const defaultStopButtonNode = stopBreakoutButtonVisible.value ? h('button', {
    class: joinClassNames(['btn btn-danger mr-2 mb-2', props.stopButtonProps?.class as string]),
    style: { ...(props.stopButtonProps?.style as CSSProperties || {}) },
    onClick: (event: MouseEvent) => {
      if (props.stopButtonProps?.onClick) {
        (props.stopButtonProps.onClick as (event: MouseEvent) => void)(event)
      }
      if (!event.defaultPrevented) {
        handleStopBreakoutClick()
      }
    },
    ...(props.stopButtonProps ? Object.fromEntries(
      Object.entries(props.stopButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
    ) : {})
  }, [
    props.stopBreakoutButtonLabel || 'Stop Breakout ',
    h(FontAwesomeIcon, { icon: faStop })
  ]) : null
  
  const stopButtonNode = props.renderStopButton
    ? props.renderStopButton({ defaultStopButton: defaultStopButtonNode })
    : defaultStopButtonNode
  
  const defaultBodyNode = h('div', {
    class: joinClassNames(['modal-content', props.bodyProps?.class as string]),
    style: { ...(props.bodyProps?.style as CSSProperties || {}) },
    ...(props.bodyProps ? Object.fromEntries(
      Object.entries(props.bodyProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    headerNode,
    dividerNode,
    controlsNode,
    roomListNode,
    startButtonNode,
    stopButtonNode
  ].filter(Boolean))
  
  const bodyNode = props.renderBody
    ? props.renderBody({ defaultBody: defaultBodyNode })
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
  background-color: #f5f5f5;
  border-radius: 10px;
  padding: 0;
  max-width: 700px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content {
  padding: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.modal-title {
  font-size: 1.75rem;
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

.divider {
  height: 1px;
  background-color: black;
  border: none;
  margin: 5px 0 15px 0;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
  flex: 1;
  min-width: 120px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #1e7e34;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover {
  background-color: #117a8b;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #a71d2a;
}

.mr-2 {
  margin-right: 8px;
}

.mb-2 {
  margin-bottom: 8px;
}
</style>
