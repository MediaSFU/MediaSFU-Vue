<!--
/**
 * @fileoverview PollModal - Interactive polling system for real-time audience engagement
 * @component PollModal
 * @module components/pollsComponents/PollModal
 * 
 * @description
 * A comprehensive polling modal that enables hosts to create polls (Yes/No, True/False, or
 * custom options) and allows participants to vote in real-time. Displays active polls with
 * live vote counts, percentage breakdowns, and visual progress bars. Includes poll history
 * viewer showing all previous polls and their results. Host-only controls for poll creation
 * and termination with automatic cleanup of inactive polls.
 * 
 * Key Features:
 * - Poll creation with 3 types: True/False, Yes/No, Custom (up to N options)
 * - Real-time voting with Socket.io integration
 * - Live vote counting and percentage calculation
 * - Visual progress bars for each poll option
 * - Poll history viewer with previous results
 * - Host-only poll creation and termination controls
 * - Participant vote validation (one vote per poll)
 * - Automatic poll status updates (active/inactive)
 * - Responsive modal with configurable positioning
 * - Custom render functions for complete UI control
 * - Empty state messages for no polls/no active poll
 * 
 * Poll Types:
 * - **True/False**: Binary choice poll with "True" and "False" options
 * - **Yes/No**: Binary choice poll with "Yes" and "No" options
 * - **Custom**: Multi-option poll with user-defined options (host enters option text)
 * 
 * User Roles:
 * - **Host (islevel='2')**: Can create polls, end polls, view all results
 * - **Participants**: Can vote on active polls, view results, see poll history
 * 
 * Workflow:
 * 1. Host opens poll modal and creates new poll (question + type)
 * 2. For custom polls, host adds option text for each choice
 * 3. Host submits poll → Socket.io emits "createPoll" → poll becomes active
 * 4. Participants see active poll → select option → Socket.io emits "votePoll"
 * 5. All users see live vote counts and percentages update in real-time
 * 6. Host ends poll → Socket.io emits "endPoll" → poll moves to history
 * 7. Poll history shows all previous polls with final results and percentages
 * 
 * @example Basic Usage - Host Creates Poll
 * ```typescript
 * // <PollModal
 *   // :isPollModalVisible="showPollModal"
 *   // :onClose="() => showPollModal = false"
 *   // member="HostUser"
 *   // islevel="2"
 *   // :polls="allPolls"
 *   // :poll="currentActivePoll"
 *   // :socket="socketConnection"
 *   // roomName="room123"
 *   // :showAlert="alertFunction"
 *   // :updateIsPollModalVisible="setShowPollModal"
 *   // :handleCreatePoll="createPollHandler"
 *   // :handleEndPoll="endPollHandler"
 *   // :handleVotePoll="votePollHandler"
 * // />
 * ```
 * 
 * @example Participant View - Vote on Active Poll
 * ```typescript
 * // Participant sees active poll with vote buttons
 * // <PollModal
 * //   :isPollModalVisible="true"
 * //   :onClose="closePollModal"
 * //   member="ParticipantUser"
 * //   islevel="1"
 * //   :polls="polls"
 * //   :poll="activePoll"
 * //   :socket="socket"
 * //   roomName="room456"
 * //   :handleVotePoll="handleVote"
 * // />
 * ```
 * 
 * @example Custom Position and Styling
 * ```typescript
 * // <PollModal
 *   // :isPollModalVisible="true"
 *   // :onClose="closeModal"
 *   // position="topLeft"
 *   // backgroundColor="#ffffff"
 *   // member="Host"
 *   // islevel="2"
 *   // :polls="polls"
 *   // :poll="activePoll"
 *   // :socket="socket"
 *   // roomName="room789"
 * // />
 * ```
 * 
 * @example Custom Empty States
 * ```typescript
 * // <PollModal
 *   // :isPollModalVisible="true"
 *   // :onClose="closeModal"
 *   // emptyPreviousPolls="No polls have been created yet"
 *   // emptyActivePoll="Waiting for host to start a poll..."
 *   // member="User"
 *   // islevel="1"
 *   // :polls="[]"
 *   // :poll="null"
 *   // :socket="socket"
 *   // roomName="room"
 * // />
 * ```
 * 
 * @example Custom Poll Creation Form Renderer
 * ```typescript
 * // <script setup>
 * const customCreatePollRenderer = ({ defaultCreatePoll, newPoll, setNewPoll }) => {
 *   // return h('div', { class: 'custom-poll-form' }, [
 *     h('h3', 'Create Your Poll'),
 *     h('input', {
 *       placeholder: 'Enter question...',
 *       value: newPoll.question,
 *       onInput: (e) => setNewPoll({ ...newPoll, question: e.target.value })
 *     }),
 *     h('select', {
 *       value: newPoll.type,
 *       onChange: (e) => {
 *         const type = e.target.value;
 *         const options = type === 'yesNo' ? ['Yes', 'No'] : 
 *                        type === 'trueFalse' ? ['True', 'False'] : [];
 *         setNewPoll({ ...newPoll, type, options });
 *       }
 *     }, [
 *       h('option', { value: '' }, 'Select type'),
 *       h('option', { value: 'yesNo' }, 'Yes/No'),
 *       h('option', { value: 'trueFalse' }, 'True/False'),
 *       h('option', { value: 'custom' }, 'Custom Options')
 *     ]),
 *     // Custom options input if type is 'custom'
 *     newPoll.type === 'custom' && h('div', [
 *       newPoll.options.map((opt, idx) => 
 *         h('input', {
 *           placeholder: `Option ${idx + 1}`,
 *           value: opt,
 *           onInput: (e) => {
 *             const newOptions = [...newPoll.options];
 *             newOptions[idx] = e.target.value;
 *             setNewPoll({ ...newPoll, options: newOptions });
 *           }
 *         })
 *       )
 *     ])
 *   ]);
 * };
 * </script>
 * 
 * // <template>
 *   <PollModal
 *     :renderCreatePoll="customCreatePollRenderer"
 *     member="Host"
 *     islevel="2"
 *     :polls="polls"
 *     :poll="activePoll"
 *     :socket="socket"
 *     roomName="room"
 *   />
 * </template>
 * ```
 * 
 * @example Custom Active Poll Renderer with Progress Bars
 * ```typescript
 * // <script setup>
 * const customActivePollRenderer = ({ defaultActivePoll, activePoll }) => {
 *   // if (!activePoll) return h('div', 'No active poll');
 *   
 *   // const totalVotes = activePoll.votes.reduce((a, b) => a + b, 0);
 *   
 *   // return h('div', { class: 'custom-active-poll' }, [
 *     h('h3', activePoll.question),
 *     h('div', { class: 'options' }, 
 *       activePoll.options.map((option, idx) => {
 *         const votes = activePoll.votes[idx] || 0;
 *         const percentage = totalVotes > 0 ? (votes / totalVotes * 100).toFixed(1) : '0';
 *         
 *         return h('div', { class: 'option-card', key: idx }, [
 *           h('button', {
 *             class: 'vote-btn',
 *             onClick: () => handleVote(idx),
 *             disabled: hasVoted
 *           }, option),
 *           h('div', { class: 'progress-bar' }, [
 *             h('div', {
 *               class: 'progress-fill',
 *               style: { width: `${percentage}%`, backgroundColor: '#4CAF50' }
 *             })
 *           ]),
 *           h('span', { class: 'vote-stats' }, `${votes} votes (${percentage}%)`)
 *         ]);
 *       })
 *     )
 *   ]);
 * };
 * </script>
 * 
 * // <template>
 *   <PollModal
 *     :renderActivePoll="customActivePollRenderer"
 *     member="User"
 *     islevel="1"
 *     :polls="polls"
 *     :poll="activePoll"
 *     :socket="socket"
 *     roomName="room"
 *   />
 * </template>
 * ```
 * 
 * @see {@link handleCreatePoll} for poll creation logic
 * @see {@link handleVotePoll} for voting mechanism
 * @see {@link handleEndPoll} for poll termination
 * @see {@link Poll} for poll data structure
 * @see {@link https://mediasfu.com/docs/polls} for comprehensive polling documentation
 */
-->
<template>
  <RenderVNode :node="overlayNode" />
</template>

<script setup lang="ts">
import { ref, computed, watch, h, isVNode, defineComponent } from 'vue';
import type { PropType, VNodeChild, HTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, FormHTMLAttributes, CSSProperties } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import {
  handleCreatePoll as handleCreatePollUtil,
  handleEndPoll as handleEndPollUtil,
  handleVotePoll as handleVotePollUtil,
} from 'mediasfu-shared';
import type { Poll, ShowAlert } from '../../../SharedTypes';
import type { Socket } from 'socket.io-client';

// Helper function
function joinClassNames(...classes: Array<string | undefined | null | false>): string | undefined {
  const result = classes.filter(Boolean).join(' ').trim();
  return result || undefined;
}

/**
 * Internal state interface for the new poll creation form
 * @interface NewPollFormState
 * @property {string} question - The poll question text entered by the host
 * @property {'' | 'trueFalse' | 'yesNo' | 'custom'} type - The poll type selection
 * @property {string[]} options - Array of option text (auto-populated for trueFalse/yesNo, manual for custom)
 */
interface NewPollFormState {
  question: string;
  type: '' | 'trueFalse' | 'yesNo' | 'custom';
  options: string[];
}

/**
 * Props for the PollModal component
 * @interface PollModalProps
 * 
 * @property {boolean} isPollModalVisible - Controls modal visibility
 * @property {() => void} onClose - Callback when modal close is requested
 * @property {string} [position='topRight'] - Modal position on screen ('topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight')
 * @property {string} [backgroundColor='#f5f5f5'] - Background color of the modal content area
 * @property {string} member - Current user's name/identifier
 * @property {string} islevel - User's permission level ('2' = host, '1' = participant, '0' = guest)
 * @property {Poll[]} polls - Array of all polls (active and previous)
 * @property {Poll | null} poll - The currently active poll (null if none active)
 * @property {Socket} socket - Socket.io connection for real-time poll updates
 * @property {string} roomName - Room identifier for socket emissions
 * @property {ShowAlert} [showAlert] - Alert function for user feedback messages
 * @property {(isVisible: boolean) => void} updateIsPollModalVisible - Function to update modal visibility state
 * @property {typeof handleCreatePollUtil} handleCreatePoll - Function to handle poll creation
 * @property {typeof handleEndPollUtil} handleEndPoll - Function to handle poll termination
 * @property {typeof handleVotePollUtil} handleVotePoll - Function to handle vote submission
 * 
 * @property {VNodeChild} [title='Polls'] - Modal title text or VNode
 * 
 * @property {HTMLAttributes} [overlayProps] - Props for the overlay backdrop element
 * @property {HTMLAttributes} [contentProps] - Props for the modal content container
 * @property {HTMLAttributes} [headerProps] - Props for the header section wrapper
 * @property {HTMLAttributes} [titleProps] - Props for the title text element
 * @property {ButtonHTMLAttributes} [closeButtonProps] - Props for the close button
 * @property {VNodeChild} [closeIconComponent] - Custom close icon (default: FontAwesome faTimes)
 * @property {HTMLAttributes} [bodyProps] - Props for the body content wrapper
 * 
 * @property {HTMLAttributes} [sectionsWrapperProps] - Props for the sections container (previous polls + create + active)
 * @property {HTMLAttributes} [previousPollsWrapperProps] - Props for the previous polls section wrapper
 * @property {HTMLAttributes} [previousPollsHeaderProps] - Props for the "Previous Polls" header element
 * @property {HTMLAttributes} [createPollWrapperProps] - Props for the poll creation form wrapper
 * @property {FormHTMLAttributes} [createPollFormProps] - Props for the poll creation form element
 * @property {HTMLAttributes} [activePollWrapperProps] - Props for the active poll section wrapper
 * 
 * @property {InputHTMLAttributes} [pollQuestionInputProps] - Props for the poll question input field
 * @property {SelectHTMLAttributes} [pollTypeSelectProps] - Props for the poll type dropdown select
 * @property {InputHTMLAttributes} [pollOptionInputProps] - Props for custom poll option input fields
 * @property {ButtonHTMLAttributes} [voteButtonProps] - Props for vote buttons in active poll
 * @property {ButtonHTMLAttributes} [endPollButtonProps] - Props for the "End Poll" button (host only)
 * @property {ButtonHTMLAttributes} [submitPollButtonProps] - Props for the "Create Poll" submit button (host only)
 * 
 * @property {VNodeChild} [emptyPreviousPolls='No polls available'] - Message/VNode shown when no previous polls exist
 * @property {VNodeChild} [emptyActivePoll='No active poll'] - Message/VNode shown when no active poll exists
 * 
 * @property {(options: { defaultHeader: VNodeChild }) => VNodeChild} [renderHeader] - Custom renderer for modal header
 * @property {(options: { defaultPreviousPolls: VNodeChild; previousPolls: Poll[] }) => VNodeChild} [renderPreviousPolls] - Custom renderer for previous polls section
 * @property {(options: { defaultCreatePoll: VNodeChild; newPoll: NewPollFormState; setNewPoll: (poll: NewPollFormState) => void }) => VNodeChild} [renderCreatePoll] - Custom renderer for poll creation form (host only)
 * @property {(options: { defaultActivePoll: VNodeChild; activePoll: Poll | null }) => VNodeChild} [renderActivePoll] - Custom renderer for active poll section
 * @property {(options: { defaultBody: VNodeChild }) => VNodeChild} [renderBody] - Custom renderer for entire body content
 * @property {(options: { defaultContent: VNodeChild }) => VNodeChild} [renderContent] - Custom renderer for entire modal content
 * 
 * @example Poll Data Structure
 * ```ts
 * interface Poll {
 *   // id: string;                    // Unique poll identifier
 *   // question: string;              // Poll question text
 *   // type: 'trueFalse' | 'yesNo' | 'custom';  // Poll type
 *   // options: string[];             // Array of option text
 *   // votes: number[];               // Array of vote counts per option
 *   // status: 'active' | 'inactive'; // Poll status
 *   // voters?: string[];             // Array of member names who voted
 * }
 * ```
 * 
 * @example handleCreatePoll Function Signature
 * ```ts
 * handleCreatePoll({
 *   // poll: { question: string, type: string, options: string[] },
 *   // socket: Socket,
 *   // roomName: string,
 *   // showAlert?: ShowAlert,
 *   // updateIsPollModalVisible: (visible: boolean) => void
 * }): void
 * ```
 * 
 * @example handleVotePoll Function Signature
 * ```ts
 * handleVotePoll({
 *   // pollId: string,
 *   // optionIndex: number,
 *   // socket: Socket,
 *   // showAlert?: ShowAlert,
 *   // member: string,
 *   // roomName: string,
 *   // updateIsPollModalVisible: (visible: boolean) => void
 * }): void
 * ```
 * 
 * @example handleEndPoll Function Signature
 * ```ts
 * handleEndPoll({
 *   // pollId: string,
 *   // socket: Socket,
 *   // showAlert?: ShowAlert,
 *   // roomName: string,
 *   // updateIsPollModalVisible: (visible: boolean) => void
 * }): void
 * ```
 */
export interface PollModalProps {
  isPollModalVisible: boolean;
  onClose: () => void;
  position?: string;
  backgroundColor?: string;
  member: string;
  islevel: string;
  polls: Poll[];
  poll: Poll | null;
  socket: Socket;
  roomName: string;
  showAlert?: ShowAlert;
  updateIsPollModalVisible: (isVisible: boolean) => void;
  handleCreatePoll: typeof handleCreatePollUtil;
  handleEndPoll: typeof handleEndPollUtil;
  handleVotePoll: typeof handleVotePollUtil;
  title?: VNodeChild;
  overlayProps?: HTMLAttributes;
  contentProps?: HTMLAttributes;
  headerProps?: HTMLAttributes;
  titleProps?: HTMLAttributes;
  closeButtonProps?: ButtonHTMLAttributes;
  closeIconComponent?: VNodeChild;
  bodyProps?: HTMLAttributes;
  sectionsWrapperProps?: HTMLAttributes;
  previousPollsWrapperProps?: HTMLAttributes;
  previousPollsHeaderProps?: HTMLAttributes;
  createPollWrapperProps?: HTMLAttributes;
  createPollFormProps?: FormHTMLAttributes;
  activePollWrapperProps?: HTMLAttributes;
  pollQuestionInputProps?: InputHTMLAttributes;
  pollTypeSelectProps?: SelectHTMLAttributes;
  pollOptionInputProps?: InputHTMLAttributes;
  voteButtonProps?: ButtonHTMLAttributes;
  endPollButtonProps?: ButtonHTMLAttributes;
  submitPollButtonProps?: ButtonHTMLAttributes;
  emptyPreviousPolls?: VNodeChild;
  emptyActivePoll?: VNodeChild;
  renderHeader?: (options: { defaultHeader: VNodeChild }) => VNodeChild;
  renderPreviousPolls?: (options: {
    defaultPreviousPolls: VNodeChild;
    previousPolls: Poll[];
  }) => VNodeChild;
  renderCreatePoll?: (options: {
    defaultCreatePoll: VNodeChild;
    newPoll: NewPollFormState;
    setNewPoll: (poll: NewPollFormState) => void;
  }) => VNodeChild;
  renderActivePoll?: (options: {
    defaultActivePoll: VNodeChild;
    activePoll: Poll | null;
  }) => VNodeChild;
  renderBody?: (options: { defaultBody: VNodeChild }) => VNodeChild;
  renderContent?: (options: { defaultContent: VNodeChild }) => VNodeChild;
}

const props = withDefaults(defineProps<PollModalProps>(), {
  position: 'topRight',
  backgroundColor: '#f5f5f5',
  showAlert: undefined,
  handleCreatePoll: () => handleCreatePollUtil,
  handleEndPoll: () => handleEndPollUtil,
  handleVotePoll: () => handleVotePollUtil,
  title: 'Polls',
  overlayProps: undefined,
  contentProps: undefined,
  headerProps: undefined,
  titleProps: undefined,
  closeButtonProps: undefined,
  closeIconComponent: undefined,
  bodyProps: undefined,
  sectionsWrapperProps: undefined,
  previousPollsWrapperProps: undefined,
  previousPollsHeaderProps: undefined,
  createPollWrapperProps: undefined,
  createPollFormProps: undefined,
  activePollWrapperProps: undefined,
  pollQuestionInputProps: undefined,
  pollTypeSelectProps: undefined,
  pollOptionInputProps: undefined,
  voteButtonProps: undefined,
  endPollButtonProps: undefined,
  submitPollButtonProps: undefined,
  emptyPreviousPolls: 'No polls available',
  emptyActivePoll: 'No active poll',
  renderHeader: undefined,
  renderPreviousPolls: undefined,
  renderCreatePoll: undefined,
  renderActivePoll: undefined,
  renderBody: undefined,
  renderContent: undefined,
});

// RenderVNode component
const RenderVNode = defineComponent({
  name: 'RenderVNode',
  props: {
    node: {
      type: [Object, String, Number, Function] as PropType<VNodeChild>,
      required: true,
    },
  },
  setup(props) {
    return () => {
      const node = props.node;
      if (typeof node === 'function') {
        return (node as () => VNodeChild)();
      }
      if (isVNode(node)) {
        return node;
      }
      return node;
    };
  },
});

// State
const newPoll = ref<NewPollFormState>({
  question: '',
  type: '',
  options: [],
});

const activePoll = computed(() => props.poll ?? null);

const previousPolls = computed(() => {
  return props.polls.filter((polled) => {
    if (!props.poll) return true;
    return props.poll.status !== 'active' || polled.id !== props.poll.id;
  });
});

// Styles
const defaultOverlayWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.7, 350) : 320;

const overlayStyle = computed<CSSProperties>(() => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: props.isPollModalVisible ? 'block' : 'none',
  zIndex: 999,
  ...(props.overlayProps?.style as CSSProperties ?? {}),
}));

const contentStyle = computed<CSSProperties>(() => ({
  position: 'fixed',
  backgroundColor: props.backgroundColor,
  borderRadius: '10px',
  padding: '16px',
  width: `${defaultOverlayWidth}px`,
  maxWidth: `${defaultOverlayWidth}px`,
  maxHeight: '75%',
  overflow: 'hidden',
  top: props.position.includes('top') ? '10px' : 'auto',
  bottom: props.position.includes('bottom') ? '10px' : 'auto',
  left: props.position.includes('Left') ? '10px' : 'auto',
  right: props.position.includes('Right') ? '10px' : 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
  ...(props.contentProps?.style as CSSProperties ?? {}),
}));

// Helper functions
const calculatePercentage = (votes: number[], optionIndex: number) => {
  const totalVotes = votes.reduce((a, b) => a + b, 0);
  const voteCount = votes?.[optionIndex] ?? 0;
  return totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(2) : '0';
};

const handlePollTypeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const type = target.value as NewPollFormState['type'];
  let options: string[] = [];

  switch (type) {
    case 'trueFalse':
      options = ['True', 'False'];
      break;
    case 'yesNo':
      options = ['Yes', 'No'];
      break;
    case 'custom':
      options = [];
      break;
    default:
      options = [];
      break;
  }

  newPoll.value = { ...newPoll.value, type, options };
};

const handleCustomOptionChange = (index: number, value: string) => {
  const newOptions = [...newPoll.value.options];
  if (index < newOptions.length) {
    newOptions[index] = value;
  } else {
    newOptions.push(value);
  }
  newPoll.value = { ...newPoll.value, options: newOptions };
};

const handleCreatePollSubmit = (event: Event) => {
  event.preventDefault();
  props.handleCreatePoll({
    poll: newPoll.value,
    socket: props.socket,
    roomName: props.roomName,
    showAlert: props.showAlert,
    updateIsPollModalVisible: props.updateIsPollModalVisible,
  });
};

const handleEndPollForPrevious = (pollId: string) => {
  props.handleEndPoll({
    pollId,
    socket: props.socket,
    showAlert: props.showAlert,
    roomName: props.roomName,
    updateIsPollModalVisible: props.updateIsPollModalVisible,
  });
};

const handleVotePollForCurrent = (optionIndex: number) => {
  props.handleVotePoll({
    pollId: props.poll!.id,
    optionIndex,
    socket: props.socket,
    showAlert: props.showAlert,
    member: props.member,
    roomName: props.roomName,
    updateIsPollModalVisible: props.updateIsPollModalVisible,
  });
};

const handleEndPollForCurrent = () => {
  props.handleEndPoll({
    pollId: props.poll!.id,
    socket: props.socket,
    showAlert: props.showAlert,
    roomName: props.roomName,
    updateIsPollModalVisible: props.updateIsPollModalVisible,
  });
};

// Watchers
const renderPolls = () => {
  let activePollCount = 0;

  props.polls.forEach((polled) => {
    if (polled.status === 'active' && props.poll && polled.id === props.poll.id) {
      activePollCount++;
    }
  });

  if (props.islevel == '2' && activePollCount === 0) {
    if (props.poll && props.poll.status === 'active') {
      handleEndPollForCurrent();
    }
  }
};

watch(
  () => [props.isPollModalVisible, props.polls, props.poll],
  () => {
    if (props.isPollModalVisible) {
      renderPolls();
    }
  },
  { immediate: true }
);

// Event handlers
const handleCloseClick = (event: Event) => {
  const clickHandler = props.closeButtonProps?.onClick;
  if (clickHandler) {
    clickHandler(event as unknown as PointerEvent);
  }
  if (!(event as Event & { defaultPrevented?: boolean }).defaultPrevented) {
    props.onClose();
  }
};

// Build overlayNode
const overlayNode = computed(() => {
  const { class: overlayClassName, ...restOverlayProps } = props.overlayProps ?? {};
  const { class: contentClassName, ...restContentProps } = props.contentProps ?? {};
  const { class: headerClassName, style: headerStyleOverrides, ...restHeaderProps } = props.headerProps ?? {};
  const { class: titleClassName, style: titleStyleOverrides, ...restTitleProps } = props.titleProps ?? {};
  const { class: closeButtonClassName, style: closeButtonStyleOverrides, onClick: _closeButtonOnClick, ...restCloseButtonProps } = props.closeButtonProps ?? {};
  const { class: bodyClassName, style: bodyStyleOverrides, ...restBodyProps } = props.bodyProps ?? {};
  const {
    class: endPollButtonClassName,
    style: endPollButtonStyleOverrides,
    onClick: endPollButtonOnClick,
    type: endPollButtonType,
    ...restEndPollButtonProps
  } = props.endPollButtonProps ?? {};

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    ...(headerStyleOverrides as CSSProperties ?? {}),
  };

  const titleStyle: CSSProperties = {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'black',
    ...(titleStyleOverrides as CSSProperties ?? {}),
  };

  const closeButtonStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'black',
    ...(closeButtonStyleOverrides as CSSProperties ?? {}),
  };

  const bodyStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    ...(bodyStyleOverrides as CSSProperties ?? {}),
  };

  const endPollButtonStyle: CSSProperties = {
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontWeight: 600,
    ...(endPollButtonStyleOverrides as CSSProperties ?? {}),
  };

  const createEndPollButton = (action: () => void) =>
    h(
      'button',
      {
        type: endPollButtonType ?? 'button',
        class: joinClassNames('btn btn-danger btn-block', endPollButtonClassName as string | undefined),
        style: endPollButtonStyle,
        onClick: (event: Event) => {
          if (endPollButtonOnClick) {
            endPollButtonOnClick(event as unknown as PointerEvent);
          }
          if (!(event as Event & { defaultPrevented?: boolean }).defaultPrevented) {
            action();
          }
        },
        ...restEndPollButtonProps,
      },
      'End Poll'
    );

  const defaultCloseIcon = props.closeIconComponent ?? h(FontAwesomeIcon, { icon: faTimes, class: 'icon' });

  const defaultHeader = h(
    'div',
    {
      class: joinClassNames('modal-header', headerClassName as string | undefined),
      style: headerStyle,
      ...restHeaderProps,
    },
    [
      h(
        'h2',
        {
          class: joinClassNames('modal-title', titleClassName as string | undefined),
          style: titleStyle,
          ...restTitleProps,
        },
        [props.title]
      ),
      h(
        'button',
        {
          type: 'button',
          class: joinClassNames('btn-close-poll', closeButtonClassName as string | undefined),
          style: closeButtonStyle,
          onClick: handleCloseClick,
          ...restCloseButtonProps,
        },
        [defaultCloseIcon]
      ),
    ]
  );

  const headerNode = props.renderHeader ? props.renderHeader({ defaultHeader }) : defaultHeader;

  // Build sections
  const { class: sectionsWrapperClassName, style: sectionsWrapperStyleOverrides, ...restSectionsWrapperProps } = props.sectionsWrapperProps ?? {};

  const sectionsWrapperStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto',
    ...(sectionsWrapperStyleOverrides as CSSProperties ?? {}),
  };

  // Previous Polls Section (only for host)
  const previousPollsSection = props.islevel === '2' ? (() => {
    const defaultPreviousPolls = h(
      'div',
      { style: { overflowY: 'auto', maxHeight: '20%' } },
      [
        h('h5', {}, 'Previous Polls'),
        previousPolls.value.length === 0
          ? h('div', {}, [props.emptyPreviousPolls, h('hr')])
          : previousPolls.value.map((polled, index) =>
              h('div', { key: index, class: 'poll' }, [
                h('h6', {}, 'Question:'),
                h('textarea', { class: 'form-control', rows: 3, disabled: true, value: polled.question }),
                h('br'),
                h('h6', {}, 'Options:'),
                ...polled.options.map((option, i) =>
                  h('div', { key: i }, `${option}: ${polled.votes[i]} votes (${calculatePercentage(polled.votes, i)}%)`)
                ),
                polled.status === 'active'
                  ? createEndPollButton(() => handleEndPollForPrevious(polled.id))
                  : null,
              ])
            ),
      ]
    );

    return props.renderPreviousPolls
      ? props.renderPreviousPolls({ defaultPreviousPolls, previousPolls: previousPolls.value })
      : defaultPreviousPolls;
  })() : null;

  // Create Poll Section (only for host)
  const createPollSection = props.islevel === '2' ? (() => {
    const renderPollOptions = () => {
      switch (newPoll.value.type) {
        case 'trueFalse':
        case 'yesNo':
          return newPoll.value.options.map((option, index) =>
            h('div', { key: index, class: 'form-check poll-choice-item' }, [
              h('input', {
                class: 'form-check-input poll-choice-input',
                type: 'radio',
                name: 'pollOption',
                value: option.toLowerCase(),
                id: `option${option}`,
              }),
              h('label', { class: 'form-check-label poll-choice-label', for: `option${option}` }, option),
            ])
          );
        case 'custom': {
          const existingOptions = newPoll.value.options.map((option, index) =>
            h('div', { key: index, class: 'poll-custom-option' }, [
              h('input', {
                type: 'text',
                class: 'form-control poll-custom-option__input',
                placeholder: `Option ${index + 1}`,
                maxlength: 50,
                value: option || '',
                onInput: (e: Event) => handleCustomOptionChange(index, (e.target as HTMLInputElement).value),
              }),
            ])
          );

          const emptyOptions = Array.from({ length: 5 - newPoll.value.options.length }, (_, index) =>
            h('div', { key: newPoll.value.options.length + index, class: 'poll-custom-option' }, [
              h('input', {
                type: 'text',
                class: 'form-control poll-custom-option__input',
                placeholder: `Option ${newPoll.value.options.length + index + 1}`,
                maxlength: 50,
                value: '',
                onInput: (e: Event) => {
                  const value = (e.target as HTMLInputElement).value;
                  if (value) {
                    handleCustomOptionChange(newPoll.value.options.length + index, value);
                  }
                },
              }),
            ])
          );

          return [...existingOptions, ...emptyOptions];
        }
        default:
          return null;
      }
    };

    const defaultCreatePoll = h(
      'div',
      { style: { overflowY: 'auto', maxHeight: '20%' } },
      [
        h('h5', {}, 'Create a New Poll'),
        h(
          'form',
          { onSubmit: handleCreatePollSubmit },
          [
            h('div', { class: 'form-group', style: { maxWidth: '80%', overflowX: 'auto' } }, [
              h('label', { for: 'pollQuestion' }, 'Poll Question'),
              h('textarea', {
                id: 'pollQuestion',
                class: 'form-control',
                rows: 3,
                maxlength: 300,
                required: true,
                value: newPoll.value.question,
                onInput: (e: Event) => {
                  newPoll.value = { ...newPoll.value, question: (e.target as HTMLTextAreaElement).value };
                },
              }),
            ]),
            h('div', { class: 'form-group', style: { maxWidth: '80%', overflowX: 'auto' } }, [
              h('label', { for: 'pollType' }, 'Select Poll Answer Type'),
              h(
                'select',
                {
                  id: 'pollType',
                  class: 'form-control',
                  required: true,
                  value: newPoll.value.type,
                  onChange: handlePollTypeChange,
                },
                [
                  h('option', { value: '' }, 'Choose...'),
                  h('option', { value: 'trueFalse' }, 'True/False'),
                  h('option', { value: 'yesNo' }, 'Yes/No'),
                  h('option', { value: 'custom' }, 'Custom'),
                ]
              ),
            ]),
            h('div', { class: 'poll-custom-options' }, renderPollOptions() || []),
            h(
              'button',
              {
                type: 'submit',
                style: {
                  flex: 1,
                  padding: '5px',
                  borderRadius: '5px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'black',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                },
              },
              [h('span', { style: { color: 'white', fontSize: 'medium' } }, 'Create Poll')]
            ),
          ]
        ),
        h('hr'),
      ]
    );

    return props.renderCreatePoll
      ? props.renderCreatePoll({
          defaultCreatePoll,
          newPoll: newPoll.value,
          setNewPoll: (poll: NewPollFormState) => {
            newPoll.value = poll;
          },
        })
      : defaultCreatePoll;
  })() : null;

  // Active Poll Section
  const activePollSection = (() => {
    const defaultActivePoll = h(
      'div',
      { style: { overflowY: 'auto', maxHeight: '20%' } },
      [
        h('h5', {}, 'Current Poll'),
        activePoll.value && activePoll.value.status === 'active'
          ? h('div', { style: { maxWidth: '80%', overflowX: 'auto' } }, [
              h('h6', {}, 'Question:'),
              h('textarea', { class: 'form-control', rows: 3, disabled: true, value: activePoll.value.question }),
              h('br'),
              h('h6', {}, 'Options:'),
              ...activePoll.value.options.map((option, i) =>
                h('div', { key: i, class: 'form-check' }, [
                  h('input', {
                    id: `pollOption${i}`,
                    class: 'form-check-input poll-option',
                    type: 'radio',
                    name: 'pollOption',
                    value: i,
                    checked: activePoll.value!.voters && activePoll.value!.voters[props.member] === i,
                    onChange: () => handleVotePollForCurrent(i),
                  }),
                  h('label', { class: 'form-check-label', for: `pollOption${i}` }, option),
                ])
              ),
              activePoll.value.status === 'active' && props.islevel === '2'
                ? createEndPollButton(handleEndPollForCurrent)
                : null,
            ])
          : h('div', {}, [h('hr'), props.emptyActivePoll]),
      ]
    );

    return props.renderActivePoll
      ? props.renderActivePoll({ defaultActivePoll, activePoll: activePoll.value })
      : defaultActivePoll;
  })();

  const sectionsContent = [
    previousPollsSection,
    previousPollsSection ? h('hr') : null,
    createPollSection,
    activePollSection,
  ].filter(Boolean);

  const defaultBody = h(
    'div',
    {
      class: joinClassNames('modal-body', bodyClassName as string | undefined),
      style: bodyStyle,
      ...restBodyProps,
    },
    [
      h(
        'div',
        {
          class: joinClassNames('poll-modal-sections', sectionsWrapperClassName as string | undefined),
          style: sectionsWrapperStyle,
          ...restSectionsWrapperProps,
        },
        sectionsContent
      ),
    ]
  );

  const bodyNode = props.renderBody ? props.renderBody({ defaultBody }) : defaultBody;

  const defaultContent = h(
    'div',
    {
      class: joinClassNames('mediasfu-poll-modal__content', contentClassName as string | undefined),
      style: contentStyle.value,
      ...restContentProps,
    },
    [headerNode, h('hr', { style: { height: '1px', backgroundColor: 'black', marginTop: '5px', marginBottom: '5px' } }), bodyNode]
  );

  const contentNode = props.renderContent ? props.renderContent({ defaultContent }) : defaultContent;

  return h(
    'div',
    {
      class: joinClassNames('mediasfu-poll-modal', overlayClassName as string | undefined),
      style: overlayStyle.value,
      ...restOverlayProps,
    },
    [contentNode]
  );
});
</script>

<style scoped>
.poll-custom-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 12px 0 16px;
}

.poll-custom-option {
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #d1d9e6;
  border-radius: 8px;
  padding: 8px 10px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
}

.poll-custom-option__input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  color: #1f2937;
  padding: 0;
}

.poll-custom-option__input:focus {
  outline: none;
  box-shadow: none;
}

.poll-custom-option__input::placeholder {
  color: #94a3b8;
}

.poll-choice-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.75);
  border: 1px solid transparent;
  transition: border-color 0.2s ease, background-color 0.2s ease;
  margin-bottom: 6px;
}

.poll-choice-item:last-of-type {
  margin-bottom: 0;
}

.poll-choice-item:hover {
  border-color: #4c6ef5;
  background-color: rgba(76, 110, 245, 0.08);
}

.poll-choice-input {
  width: 18px;
  height: 18px;
}

.poll-choice-label {
  font-weight: 500;
  color: #1f2937;
}
</style>
