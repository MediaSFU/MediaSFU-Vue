<!--
/**
 * @fileoverview WaitingModal - Waiting room participant management modal
 * @component WaitingModal
 * @module components/waitingComponents/WaitingModal
 * 
 * @description
 * A host-only modal for managing participants in the waiting room. Displays a list of
 * participants waiting to join the event and provides accept/reject actions. Includes
 * search/filter functionality, real-time counter badge, and Socket.io integration for
 * immediate admission or rejection. Only visible to hosts (islevel === '2').
 * 
 * Key Features:
 * - Waiting room participant list display
 * - Accept/reject actions for each participant
 * - Search/filter functionality
 * - Real-time counter badge
 * - Socket.io integration for admit/reject
 * - Host-only access control
 * - Responsive positioning (top/bottom, left/right)
 * - Empty state handling
 * - Customizable participant rows
 * - Render function support for all sections
 * 
 * Workflow:
 * 1. Participant requests to join event
 * 2. Host opens waiting room modal
 * 3. Host sees list of waiting participants
 * 4. Host can search/filter participants
 * 5. Host clicks accept (admit) or reject button
 * 6. Socket emits response to server
 * 7. Participant is admitted or rejected
 * 8. List updates in real-time
 * 
 * Actions:
 * - **Accept**: Admits participant to the event (emits 'updateWaiting' with action: 'accept')
 * - **Reject**: Denies participant entry (emits 'updateWaiting' with action: 'reject')
 * 
 * @example Basic Usage
 * // <WaitingModal
 *   // :isWaitingModalVisible="isWaitingModalVisible"
 *   // :onWaitingRoomClose="() => updateIsWaitingModalVisible(false)"
 *   // :waitingRoomCounter="waitingRoomCounter"
 *   // :onWaitingRoomFilterChange="onWaitingRoomFilterChange"
 *   // :waitingRoomList="filteredWaitingRoomList"
 *   // :updateWaitingList="updateWaitingRoomList"
 *   // roomName="my-room"
 *   // :socket="socket"
 *   // :parameters="{ filteredWaitingRoomList, getUpdatedAllParams }"
 * // />
 * 
 * @example With Search and Custom Background
 * // <WaitingModal
 *   // :isWaitingModalVisible="showWaitingRoom"
 *   // :onWaitingRoomClose="closeWaitingRoom"
 *   // :waitingRoomCounter="waitingCount"
 *   // :onWaitingRoomFilterChange="filterWaitingParticipants"
 *   // :waitingRoomList="waitingList"
 *   // :updateWaitingList="setWaitingList"
 *   // roomName="conference-123"
 *   // :socket="socketConnection"
 *   // :parameters="waitingParameters"
 *   // position="topLeft"
 *   // backgroundColor="#2c3e50"
 * // />
 * 
 * @example Custom Empty State
 * // <script setup>
 * const customEmptyState = ({ counter }) => {
 *   // return h('div', {
 *     style: {
 *       textAlign: 'center',
 *       padding: '40px 20px',
 *       color: '#666'
 *     }
 *   }, [
 *     h('p', { style: { fontSize: '18px', marginBottom: '10px' } }, 'No one waiting'),
 *     h('p', { style: { fontSize: '14px' } }, 'Participants will appear here when they request to join')
 *   ]);
 * };
 * </script>
 * 
 * // <template>
 *   <WaitingModal
 *     :isWaitingModalVisible="modalVisible"
 *     :onWaitingRoomClose="closeModal"
 *     :waitingRoomCounter="counter"
 *     :onWaitingRoomFilterChange="handleFilter"
 *     :waitingRoomList="participants"
 *     :updateWaitingList="updateParticipants"
 *     roomName="room"
 *     :socket="socket"
 *     :parameters="params"
 *     :emptyState="customEmptyState"
 *   />
 * </template>
 * 
 * @example Custom Participant Render
 * // <script setup>
 * const renderCustomParticipant = ({ participant, handleAccept, handleReject }) => {
 *   // return h('div', {
 *     style: {
 *       display: 'flex',
 *       justifyContent: 'space-between',
 *       alignItems: 'center',
 *       padding: '12px',
 *       backgroundColor: '#f8f9fa',
 *       borderRadius: '8px',
 *       marginBottom: '8px'
 *     }
 *   }, [
 *     h('div', [
 *       h('strong', { style: { fontSize: '16px' } }, participant.name),
 *       h('div', { style: { fontSize: '12px', color: '#666' } }, `Waiting since ${new Date(participant.timestamp).toLocaleTimeString()}`)
 *     ]),
 *     h('div', { style: { display: 'flex', gap: '8px' } }, [
 *       h('button', {
 *         onClick: handleAccept,
 *         class: 'btn btn-success btn-sm',
 *         style: { minWidth: '80px' }
 *       }, 'Admit'),
 *       h('button', {
 *         onClick: handleReject,
 *         class: 'btn btn-danger btn-sm',
 *         style: { minWidth: '80px' }
 *       }, 'Deny')
 *     ])
 *   ]);
 * };
 * </script>
 * 
 * // <template>
 *   <WaitingModal
 *     :isWaitingModalVisible="visible"
 *     :onWaitingRoomClose="close"
 *     :waitingRoomCounter="count"
 *     :onWaitingRoomFilterChange="filter"
 *     :waitingRoomList="list"
 *     :updateWaitingList="update"
 *     roomName="room"
 *     :socket="socket"
 *     :parameters="params"
 *     :renderParticipant="renderCustomParticipant"
 *   />
 * </template>
 * 
 * @example Custom Header with Badge
 * // <script setup>
 * const renderCustomHeader = ({ defaultHeader, counter, onClose }) => {
 *   // return h('div', {
 *     style: {
 *       display: 'flex',
 *       justifyContent: 'space-between',
 *       alignItems: 'center',
 *       padding: '15px',
 *       background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
 *       borderRadius: '10px 10px 0 0',
 *       marginBottom: '10px'
 *     }
 *   }, [
 *     h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, [
 *       h('h3', { style: { color: 'white', margin: 0 } }, 'Waiting Room'),
 *       h('span', {
 *         style: {
 *           backgroundColor: 'white',
 *           color: '#667eea',
 *           padding: '4px 12px',
 *           borderRadius: '12px',
 *           fontSize: '14px',
 *           fontWeight: 'bold'
 *         }
 *       }, counter)
 *     ]),
 *     h('button', {
 *       onClick: onClose,
 *       style: { background: 'none', border: 'none', color: 'white', cursor: 'pointer' }
 *     }, '✕')
 *   ]);
 * };
 * </script>
 * 
 * // <template>
 *   <WaitingModal
 *     :isWaitingModalVisible="open"
 *     :onWaitingRoomClose="close"
 *     :waitingRoomCounter="count"
 *     :onWaitingRoomFilterChange="filter"
 *     :waitingRoomList="list"
 *     :updateWaitingList="update"
 *     roomName="room"
 *     :socket="socket"
 *     :parameters="params"
 *     :renderHeader="renderCustomHeader"
 *   />
 * </template>
 * 
 * @see {@link respondToWaiting} for accept/reject logic
 * @see {@link WaitingRoomParticipant} for participant data structure
 * @see {@link Socket} for Socket.io integration
 */
-->
<template>
  <RenderVNode :node="overlayNode" />
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  defineComponent,
  h,
  isVNode,
  type PropType,
  type VNodeChild,
  type CSSProperties,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { respondToWaiting } from 'mediasfu-shared';
import type { WaitingRoomParticipant } from '../../../../SharedTypes';
import type { Socket } from 'socket.io-client';

// Helper function to join class names
function joinClassNames(...classes: Array<string | undefined | null | false>): string | undefined {
  const filtered = classes.filter(Boolean) as string[];
  return filtered.length > 0 ? filtered.join(' ') : undefined;
}

export interface WaitingRoomModalParameters {
  filteredWaitingRoomList: WaitingRoomParticipant[];
  getUpdatedAllParams: () => WaitingRoomModalParameters;
  [key: string]: unknown;
}

/**
 * Props for the WaitingModal component
 * @interface WaitingRoomModalProps
 * 
 * @property {boolean} isWaitingModalVisible - Controls modal visibility (true = visible, false = hidden)
 * @property {Function} onWaitingRoomClose - Callback when modal closes
 * @property {number} waitingRoomCounter - Number of participants in waiting room (displayed in badge)
 * @property {Function} onWaitingRoomFilterChange - Callback when search filter changes
 *   // @param {string} filter - Filter text entered by user
 * @property {WaitingRoomParticipant[]} waitingRoomList - Array of participants in waiting room
 * @property {Function} updateWaitingList - Updates waiting room list state
 *   // @param {WaitingRoomParticipant[]} updatedList - New waiting room list
 * @property {string} roomName - Room/meeting identifier for server updates
 * @property {Socket} socket - Socket.io connection for emitting accept/reject actions
 * @property {string} [position='topRight'] - Modal position on screen
 *   - Options: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
 * @property {string} [backgroundColor='#83c0e9'] - Background color of the modal content
 * @property {WaitingRoomModalParameters} parameters - Waiting room state and update functions
 * @property {Function} [onWaitingRoomItemPress=respondToWaiting] - Custom function to handle accept/reject actions
 *   // @default respondToWaiting from @react-shared/methods/waiting
 * 
 * @property {VNodeChild} [title='Waiting'] - Modal title content
 * @property {HTMLAttributes} [overlayProps] - Props for the overlay wrapper (backdrop)
 * @property {HTMLAttributes} [contentProps] - Props for the modal content container
 * @property {HTMLAttributes} [headerProps] - Props for the header section
 * @property {HTMLAttributes} [titleProps] - Props for the title element
 * @property {HTMLAttributes} [badgeWrapperProps] - Props for the counter badge wrapper
 * @property {HTMLAttributes} [badgeProps] - Props for the counter badge element
 * @property {ButtonHTMLAttributes} [closeButtonProps] - Props for the close button
 * @property {VNodeChild} [closeIconComponent] - Custom close icon (default: faTimes FontAwesome)
 * @property {HTMLAttributes} [bodyProps] - Props for the body section container
 * @property {HTMLAttributes} [searchWrapperProps] - Props for search input wrapper
 * @property {InputHTMLAttributes} [searchInputProps] - Props for search input element
 * @property {HTMLAttributes} [waitingListProps] - Props for waiting list container
 * @property {HTMLAttributes} [participantRowProps] - Props for individual participant row
 * @property {ButtonHTMLAttributes} [acceptButtonProps] - Props for accept button
 * @property {ButtonHTMLAttributes} [rejectButtonProps] - Props for reject button
 * @property {VNodeChild} [acceptIconComponent] - Custom accept icon (default: faCheck FontAwesome)
 * @property {VNodeChild} [rejectIconComponent] - Custom reject icon (default: faTimes FontAwesome)
 * @property {VNodeChild | Function} [emptyState] - Custom empty state content or render function
 *   // @example
 *   ```ts
 *   ({ counter }) => h('p', 'No participants waiting')
 *   ```
 * 
 * @property {Function} [renderHeader] - Custom render function for entire header section
 *   // @param {Object} options
 *   // @param {VNodeChild} options.defaultHeader - Default header VNode
 *   // @param {number} options.counter - Waiting room counter
 *   // @param {Function} options.onClose - Close handler function
 *   // @returns {VNodeChild} Custom header VNode
 *   // @example
 *   ```ts
 *   ({ counter, onClose }) => {
 *     return h('div', { class: 'custom-header' }, [
 *       h('h2', `Waiting Room (${counter})`),
 *       h('button', { onClick: onClose }, 'Close')
 *     ]);
 *   }
 *   ```
 * 
 * @property {Function} [renderSearch] - Custom render function for search input section
 *   // @param {Object} options
 *   // @param {VNodeChild} options.defaultSearch - Default search input VNode
 *   // @param {Function} options.onFilter - Filter handler function
 *   // @returns {VNodeChild} Custom search VNode
 * 
 * @property {Function} [renderParticipant] - Custom render function for individual participant row
 *   // @param {Object} options
 *   // @param {WaitingRoomParticipant} options.participant - Participant data
 *   // @param {number} options.index - Row index
 *   // @param {VNodeChild} options.defaultParticipant - Default participant row VNode
 *   // @param {Function} options.handleAccept - Accept handler function
 *   // @param {Function} options.handleReject - Reject handler function
 *   // @returns {VNodeChild} Custom participant row VNode
 *   // @example
 *   ```ts
 *   ({ participant, handleAccept, handleReject }) => {
 *     return h('div', { style: { display: 'flex', justifyContent: 'space-between' } }, [
 *       h('span', participant.name),
 *       h('div', [
 *         h('button', { onClick: handleAccept }, 'Admit'),
 *         h('button', { onClick: handleReject }, 'Deny')
 *       ])
 *     ]);
 *   }
 *   ```
 * 
 * @property {Function} [renderBody] - Custom render function for entire body section
 *   // @param {Object} options
 *   // @param {VNodeChild} options.defaultBody - Default body VNode
 *   // @param {number} options.counter - Waiting room counter
 *   // @returns {VNodeChild} Custom body VNode
 */
export interface WaitingRoomModalProps {
  isWaitingModalVisible: boolean;
  onWaitingRoomClose: () => void;
  waitingRoomCounter: number;
  onWaitingRoomFilterChange: (filter: string) => void;
  waitingRoomList: WaitingRoomParticipant[];
  updateWaitingList: (updatedList: WaitingRoomParticipant[]) => void;
  roomName: string;
  socket: Socket;
  position?: string;
  backgroundColor?: string;
  parameters: WaitingRoomModalParameters;
  onWaitingRoomItemPress?: typeof respondToWaiting;
  title?: VNodeChild;
  overlayProps?: HTMLAttributes;
  contentProps?: HTMLAttributes;
  headerProps?: HTMLAttributes;
  titleProps?: HTMLAttributes;
  badgeWrapperProps?: HTMLAttributes;
  badgeProps?: HTMLAttributes;
  closeButtonProps?: ButtonHTMLAttributes;
  closeIconComponent?: VNodeChild;
  bodyProps?: HTMLAttributes;
  searchWrapperProps?: HTMLAttributes;
  searchInputProps?: InputHTMLAttributes;
  waitingListProps?: HTMLAttributes;
  participantRowProps?: HTMLAttributes;
  acceptButtonProps?: ButtonHTMLAttributes;
  rejectButtonProps?: ButtonHTMLAttributes;
  acceptIconComponent?: VNodeChild;
  rejectIconComponent?: VNodeChild;
  emptyState?: VNodeChild | ((context: { counter: number }) => VNodeChild);
  renderHeader?: (options: {
    defaultHeader: VNodeChild;
    counter: number;
    onClose: () => void;
  }) => VNodeChild;
  renderSearch?: (options: {
    defaultSearch: VNodeChild;
    onFilter: (value: string) => void;
  }) => VNodeChild;
  renderParticipant?: (options: {
    participant: WaitingRoomParticipant;
    index: number;
    defaultParticipant: VNodeChild;
    handleAccept: () => void;
    handleReject: () => void;
  }) => VNodeChild;
  renderBody?: (options: {
    defaultBody: VNodeChild;
    counter: number;
  }) => VNodeChild;
}

const props = withDefaults(defineProps<WaitingRoomModalProps>(), {
  position: 'topRight',
  backgroundColor: '#83c0e9',
  onWaitingRoomItemPress: undefined,
  title: () => 'Waiting Room',
  overlayProps: undefined,
  contentProps: undefined,
  headerProps: undefined,
  titleProps: undefined,
  badgeWrapperProps: undefined,
  badgeProps: undefined,
  closeButtonProps: undefined,
  closeIconComponent: undefined,
  bodyProps: undefined,
  searchWrapperProps: undefined,
  searchInputProps: undefined,
  waitingListProps: undefined,
  participantRowProps: undefined,
  acceptButtonProps: undefined,
  rejectButtonProps: undefined,
  acceptIconComponent: undefined,
  rejectIconComponent: undefined,
  emptyState: undefined,
  renderHeader: undefined,
  renderSearch: undefined,
  renderParticipant: undefined,
  renderBody: undefined,
});

// RenderVNode wrapper component
const RenderVNode = defineComponent({
  name: 'RenderVNode',
  props: {
    node: {
      type: [Object, String, Number, Boolean, Array, Function] as PropType<VNodeChild>,
      default: null,
    },
  },
  render() {
    if (!this.node) return null;
    if (isVNode(this.node)) return this.node;
    if (typeof this.node === 'function') {
      const result = (this.node as () => VNodeChild)();
      return isVNode(result) ? result : String(result);
    }
    return String(this.node);
  },
});

const initialList = computed(() => 
  props.parameters?.filteredWaitingRoomList ?? props.waitingRoomList
);

const waitingRoomListState = ref<WaitingRoomParticipant[]>(initialList.value);
const waitingRoomCounterState = ref<number>(props.parameters?.filteredWaitingRoomList?.length ?? props.waitingRoomCounter);
const rerenderToggle = ref(false);

watch(
  () => [props.parameters, props.waitingRoomList, rerenderToggle.value],
  () => {
    if (props.parameters?.getUpdatedAllParams) {
      const latestParams = props.parameters.getUpdatedAllParams();
      waitingRoomListState.value = latestParams.filteredWaitingRoomList;
      waitingRoomCounterState.value = latestParams.filteredWaitingRoomList.length;
    } else if (props.parameters?.filteredWaitingRoomList) {
      waitingRoomListState.value = props.parameters.filteredWaitingRoomList;
      waitingRoomCounterState.value = props.parameters.filteredWaitingRoomList.length;
    } else {
      waitingRoomListState.value = props.waitingRoomList;
      waitingRoomCounterState.value = props.waitingRoomList.length;
    }
  },
  { immediate: true }
);

const defaultOverlayWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.8, 350) : 320;

// Overlay props
const overlayAttrs = computed(() => {
  const overlayProps = props.overlayProps || {};
  const { class: cls, style, ...rest } = overlayProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const overlayClassNames = computed(() => 
  joinClassNames('mediasfu-waiting-modal', overlayAttrs.value.className)
);

const overlayStyle = computed<CSSProperties>(() => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: props.isWaitingModalVisible ? 'block' : 'none',
  zIndex: 999,
  ...overlayAttrs.value.style,
}));

// Content props
const contentAttrs = computed(() => {
  const contentProps = props.contentProps || {};
  const { class: cls, style, ...rest } = contentProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const contentClassNames = computed(() => 
  joinClassNames('waiting-modal-content', contentAttrs.value.className)
);

const contentPositionStyle = computed<CSSProperties>(() => ({
  top: props.position.includes('top') ? '10px' : 'auto',
  bottom: props.position.includes('bottom') ? '10px' : 'auto',
  left: props.position.includes('Left') ? '10px' : 'auto',
  right: props.position.includes('Right') ? '10px' : 'auto',
}));

const contentStyle = computed<CSSProperties>(() => ({
  position: 'fixed',
  backgroundColor: props.backgroundColor,
  borderRadius: '10px',
  padding: '10px',
  width: `${defaultOverlayWidth}px`,
  maxHeight: '65%',
  overflowY: 'auto',
  boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  ...contentPositionStyle.value,
  ...contentAttrs.value.style,
}));

const resolvedTitle = computed<VNodeChild>(() => {
  const title = props.title as unknown;
  return title === false || title == null ? 'Waiting Room' : props.title;
});

const handleFilterChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const inputProps = props.searchInputProps as Record<string, unknown> | undefined;
  const inputOnInput = inputProps?.onInput as ((event: Event) => void) | undefined;
  const inputOnChange = inputProps?.onChange as ((event: Event) => void) | undefined;

  if (inputOnInput) {
    inputOnInput(event);
  }
  
  if (inputOnChange) {
    inputOnChange(event);
  }
  
  if (!(event as Event & { defaultPrevented?: boolean }).defaultPrevented) {
    props.onWaitingRoomFilterChange(target.value);
    rerenderToggle.value = !rerenderToggle.value;
  }
};

const handleCloseClick = (event: Event) => {
  const buttonProps = props.closeButtonProps as Record<string, unknown> | undefined;
  const onClick = buttonProps?.onClick as ((event: Event) => void) | undefined;

  if (onClick) {
    onClick(event);
  }

  if (!(event as Event & { defaultPrevented?: boolean }).defaultPrevented) {
    props.onWaitingRoomClose();
  }
};

const onWaitingRoomItemPressHandler = props.onWaitingRoomItemPress ?? respondToWaiting;

// Simplified node building - createOverlayNode that contains everything
const overlayNode = computed<VNodeChild>(() => {
  if (!props.isWaitingModalVisible) return null;

  const { class: headerClassName, style: headerStyleOverrides, ...restHeaderProps } = props.headerProps ?? {};
  const { class: titleClassName, style: titleStyleOverrides, ...restTitleProps } = props.titleProps ?? {};
  const { class: badgeWrapperClassName, style: badgeWrapperStyleOverrides, ...restBadgeWrapperProps } = props.badgeWrapperProps ?? {};
  const { class: badgeClassName, style: badgeStyleOverrides, ...restBadgeProps } = props.badgeProps ?? {};
  const {
    class: closeButtonClassName,
    style: closeButtonStyleOverrides,
    onClick: _closeButtonOnClick,
    ...restCloseButtonProps
  } = props.closeButtonProps ?? {};
  const { class: bodyClassName, style: bodyStyleOverrides, ...restBodyProps } = props.bodyProps ?? {};
  const { class: searchWrapperClassName, style: searchWrapperStyleOverrides, ...restSearchWrapperProps } = props.searchWrapperProps ?? {};
  const {
    class: searchInputClassName,
    style: searchInputStyleOverrides,
    onInput: _searchInputOnInput,
    onChange: _searchInputOnChange,
    ...restSearchInputProps
  } = props.searchInputProps ?? {};
  const { class: waitingListClassName, style: waitingListStyleOverrides, ...restWaitingListProps } = props.waitingListProps ?? {};
  const { class: participantRowClassName, style: participantRowStyleOverrides, ...restParticipantRowProps } = props.participantRowProps ?? {};
  const {
    class: acceptButtonClassName,
    style: acceptButtonStyleOverrides,
    ...restAcceptButtonProps
  } = props.acceptButtonProps ?? {};
  const {
    class: rejectButtonClassName,
    style: rejectButtonStyleOverrides,
    ...restRejectButtonProps
  } = props.rejectButtonProps ?? {};

  const closeIconComponent = props.closeIconComponent as unknown;
  const defaultCloseIcon = closeIconComponent === false || closeIconComponent == null
    ? h(FontAwesomeIcon, { icon: faTimes, style: { fontSize: '20px' } })
    : props.closeIconComponent;

  const handleFilterValue = (value: string) => {
    props.onWaitingRoomFilterChange(value);
    rerenderToggle.value = !rerenderToggle.value;
  };

  const defaultHeaderNode = h('div', {
    class: joinClassNames('modal-header', headerClassName as string | undefined),
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
      ...(headerStyleOverrides as CSSProperties ?? {}),
    },
    ...restHeaderProps,
  }, [
    h('div', {
      class: joinClassNames('modal-title', titleClassName as string | undefined),
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: 'black',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        ...(titleStyleOverrides as CSSProperties ?? {}),
      },
      ...restTitleProps,
    }, [
      isVNode(resolvedTitle.value) ? resolvedTitle.value : String(resolvedTitle.value),
      h('span', {
        class: joinClassNames('waiting-counter', badgeWrapperClassName as string | undefined),
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3px',
          borderRadius: '9999px',
          ...(badgeWrapperStyleOverrides as CSSProperties ?? {}),
        },
        ...restBadgeWrapperProps,
      }, [
        h('span', {
          style: {
            backgroundColor: '#fff',
            color: '#000',
            borderRadius: '10px',
            padding: '5px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...(badgeStyleOverrides as CSSProperties ?? {}),
          },
          class: joinClassNames('badge', badgeClassName as string | undefined),
          ...restBadgeProps,
        }, String(waitingRoomCounterState.value)),
      ]),
    ]),
    h('button', {
      type: 'button',
      onClick: handleCloseClick,
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        color: 'black',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...(closeButtonStyleOverrides as CSSProperties ?? {}),
      },
      class: joinClassNames('btn-close-waitings', closeButtonClassName as string | undefined),
      ...restCloseButtonProps,
    }, [
      defaultCloseIcon,
    ]),
  ]);

  const headerNode = props.renderHeader
    ? props.renderHeader({
        defaultHeader: defaultHeaderNode,
        counter: waitingRoomCounterState.value,
        onClose: props.onWaitingRoomClose,
      })
    : defaultHeaderNode;

  const defaultSearchNode = h('div', {
    class: joinClassNames('form-group', searchWrapperClassName as string | undefined),
    style: searchWrapperStyleOverrides as CSSProperties | undefined,
    ...restSearchWrapperProps,
  }, [
    h('input', {
      type: 'text',
      placeholder: 'Search ...',
      onInput: handleFilterChange,
      class: searchInputClassName as string | undefined,
      style: {
        width: '90%',
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #000',
        fontSize: '16px',
        marginBottom: '10px',
        ...(searchInputStyleOverrides as CSSProperties ?? {}),
      },
      ...restSearchInputProps,
    }),
  ]);

  const searchNode = props.renderSearch
    ? props.renderSearch({
        defaultSearch: defaultSearchNode,
        onFilter: handleFilterValue,
      })
    : defaultSearchNode;

  const renderParticipantRow = (participant: WaitingRoomParticipant, index: number) => {
    const handleAccept = () => {
      onWaitingRoomItemPressHandler({
        participantId: participant.id,
        participantName: participant.name,
        updateWaitingList: props.updateWaitingList,
        waitingList: waitingRoomListState.value,
        roomName: props.roomName,
        type: true,
        socket: props.socket,
      });
    };

    const handleReject = () => {
      onWaitingRoomItemPressHandler({
        participantId: participant.id,
        participantName: participant.name,
        updateWaitingList: props.updateWaitingList,
        waitingList: waitingRoomListState.value,
        roomName: props.roomName,
        type: false,
        socket: props.socket,
      });
    };

    const defaultParticipantNode = h('div', {
      key: participant.id || index,
      class: joinClassNames('waiting-item', participantRowClassName as string | undefined),
      style: {
        marginTop: '5px',
        flexDirection: 'row',
        flex: 1,
        display: 'flex',
        ...(participantRowStyleOverrides as CSSProperties ?? {}),
      },
      ...restParticipantRowProps,
    }, [
      h('div', { class: 'col7', style: { flex: 5, justifyContent: 'center' } }, participant.name),
      h('div', { class: 'col2', style: { flex: 2, alignItems: 'center', justifyContent: 'center' } }, [
        h('button', {
          type: 'button',
          class: acceptButtonClassName as string | undefined,
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            ...(acceptButtonStyleOverrides as CSSProperties ?? {}),
          },
          ...restAcceptButtonProps,
          onClick: handleAccept,
        }, [
          ((props.acceptIconComponent as unknown) === false || (props.acceptIconComponent as unknown) == null)
            ? h(FontAwesomeIcon, { icon: faCheck, size: 'lg', color: 'green' })
            : props.acceptIconComponent,
        ]),
      ]),
      h('div', { class: 'col2', style: { flex: 2, alignItems: 'center', justifyContent: 'center' } }, [
        h('button', {
          type: 'button',
          class: rejectButtonClassName as string | undefined,
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            ...(rejectButtonStyleOverrides as CSSProperties ?? {}),
          },
          ...restRejectButtonProps,
          onClick: handleReject,
        }, [
          ((props.rejectIconComponent as unknown) === false || (props.rejectIconComponent as unknown) == null)
            ? h(FontAwesomeIcon, { icon: faTimes, size: 'lg', color: 'red' })
            : props.rejectIconComponent,
        ]),
      ]),
      h('div', { class: 'col1', style: { flex: 1 } }),
    ]);

    return props.renderParticipant
      ? props.renderParticipant({
          participant,
          index,
          defaultParticipant: defaultParticipantNode,
          handleAccept,
          handleReject,
        })
      : defaultParticipantNode;
  };

  const waitingListNode = h('div', {
    class: joinClassNames('waiting-list', waitingListClassName as string | undefined),
    style: {
      display: 'flex',
      flexDirection: 'column',
      ...(waitingListStyleOverrides as CSSProperties ?? {}),
    },
    ...restWaitingListProps,
  }, waitingRoomListState.value.length === 0
    ? [
        typeof props.emptyState === 'function'
          ? props.emptyState({ counter: waitingRoomCounterState.value })
          : props.emptyState ?? h('p', { style: { textAlign: 'center', color: 'black' } }, 'No participants waiting'),
      ]
    : waitingRoomListState.value.map((participant, index) => renderParticipantRow(participant, index)));

  const defaultBodyNode = h('div', {
    class: joinClassNames('modal-body', bodyClassName as string | undefined),
    style: bodyStyleOverrides as CSSProperties | undefined,
    ...restBodyProps,
  }, [searchNode, waitingListNode]);

  const bodyNode = props.renderBody
    ? props.renderBody({ defaultBody: defaultBodyNode, counter: waitingRoomCounterState.value })
    : defaultBodyNode;

  return h(
    'div',
    {
      class: overlayClassNames.value,
      style: overlayStyle.value,
      ...overlayAttrs.value.rest,
    },
    [
      h(
        'div',
        {
          class: contentClassNames.value,
          style: contentStyle.value,
          ...contentAttrs.value.rest,
        },
        [
          headerNode,
          
          // Divider
          h('hr', { style: { height: '1px', backgroundColor: 'black', margin: '5px 0', border: 'none' } }),
          
          bodyNode,
        ]
      ),
    ]
  );
});
</script>
