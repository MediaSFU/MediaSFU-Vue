<!--
 * ParticipantsModal - Participant management modal
 *
 * @fileoverview
 * A comprehensive modal component for viewing and managing event participants.
 * Displays participant lists separated by role (moderators/attendees), provides
 * search/filter capabilities, and enables host/co-host actions (mute, message, remove).
 * Includes real-time participant count badge and role-based permission controls.
 *
 * @component ParticipantsModal
 * @module components/participantsComponents/ParticipantsModal
 *
 * @description
 * This modal provides a complete participant management interface with:
 * - Real-time participant count badge
 * - Search/filter participants by name
 * - Separate lists for moderators and attendees
 * - Role-based controls (mute, direct message, remove)
 * - Co-host permission checks
 * - Customizable positioning (topRight, topLeft, bottomRight, bottomLeft)
 * - Empty state when no participants
 * - Fully customizable render functions for header, search, lists, body
 * - Integration with MediaSFU participant methods
 *
 * @example
 * // Basic participants modal
 * // <ParticipantsModal
 *   // :is-participants-modal-visible="showParticipants"
 *   // :on-participants-close="() => setShowParticipants(false)"
 *   // :on-participants-filter-change="(filter) => handleFilterChange(filter)"
 *   // :participants-counter="participantCount"
 *   // :parameters="{
 *     coHostResponsibility,
 *     coHost,
 *     member,
 *     islevel,
 *     participants,
 *     eventType,
 *     filteredParticipants,
 *     socket,
 *     roomName,
 *     updateIsMessagesModalVisible,
 *     updateDirectMessageDetails,
 *     updateStartDirectMessage,
 *     updateParticipants,
 *     getUpdatedAllParams
 *   }"
 * // />
 *
 * @example
 * // Custom styled with position and color
 * // <ParticipantsModal
 *   // :is-participants-modal-visible="showParticipants"
 *   // :on-participants-close="closeParticipants"
 *   // :on-participants-filter-change="filterParticipants"
 *   // :participants-counter="totalParticipants"
 *   // :parameters="participantsParams"
 *   // position="bottomRight"
 *   // background-color="#1a1a1a"
 *   // title="Event Participants"
 * // />
 *
 * @example
 * // Custom render functions
 * // <ParticipantsModal
 *   // :is-participants-modal-visible="showParticipants"
 *   // :on-participants-close="closeParticipants"
 *   // :on-participants-filter-change="filterParticipants"
 *   // :participants-counter="participantCount"
 *   // :parameters="params"
 *   // :render-header="(options) => {
 *     const { defaultHeader, counter, onClose } = options;
 *     return h('div', { class: 'custom-header' }, [
 *       h('h2', {}, `Participants (${counter})`),
 *       h('button', { onClick: onClose }, 'Close')
 *     ]);
 *   }"
 *   // :render-search="(options) => {
 *     const { defaultSearch, onFilter } = options;
 *     return h('input', {
 *       placeholder: 'Search participants...',
 *       onInput: (e) => onFilter(e.target.value)
 *     });
 *   }"
 * // />
 *
 * @example
 * // Custom participant lists with overrides
 * // <ParticipantsModal
 *   // :is-participants-modal-visible="showParticipants"
 *   // :on-participants-close="closeParticipants"
 *   // :on-participants-filter-change="filterParticipants"
 *   // :participants-counter="participantCount"
 *   // :parameters="params"
 *   // :render-participant-list="CustomModeratorList"
 *   // :render-participant-list-others="CustomAttendeeList"
 *   // :empty-state="(context) => {
 *     return h('div', { class: 'no-participants' }, 
 *       `No participants found (Total: ${context.counter})`
 *     );
 *   }"
 * // />
 *
 * @example
 * // Override participant action methods
 * // <ParticipantsModal
 *   // :is-participants-modal-visible="showParticipants"
 *   // :on-participants-close="closeParticipants"
 *   // :on-participants-filter-change="filterParticipants"
 *   // :participants-counter="participantCount"
 *   // :parameters="params"
 *   // :on-mute-participants="customMuteHandler"
 *   // :on-message-participants="customMessageHandler"
 *   // :on-remove-participants="customRemoveHandler"
 * // />
-->
<template>
  <RenderVNode :node="overlayNode" />
</template>

<script setup lang="ts">
import { h, isVNode, defineComponent, ref, computed, watch, type PropType, type VNodeChild, type HTMLAttributes, type ButtonHTMLAttributes, type InputHTMLAttributes, type CSSProperties, type Component } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import ParticipantList from './ParticipantList.vue';
import ParticipantListOthers from './ParticipantListOthers.vue';
import {
  muteParticipants,
  messageParticipants,
  removeParticipants,
} from 'mediasfu-shared';
import type {
  CoHostResponsibility,
  EventType,
  Participant,
  ShowAlert,
} from '../../../../SharedTypes';
import type { Socket } from 'socket.io-client';

/**
 * Parameters required by ParticipantsModal for participant management
 * 
 * @interface ParticipantsModalParameters
 * @property {string} [position] - Modal position on screen
 * @property {string} [backgroundColor] - Modal background color
 * @property {CoHostResponsibility[]} coHostResponsibility - Array of co-host permissions
 * @property {string} coHost - Co-host identifier
 * @property {string} member - Current user's member ID
 * @property {string} islevel - Current user's permission level ('0'=host, '1'=co-host, '2'=attendee)
 * @property {Participant[]} participants - Full list of event participants
 * @property {EventType} eventType - Type of event (broadcast, conference, webinar, chat)
 * @property {Participant[]} filteredParticipants - Filtered list based on search
 * @property {Socket} socket - Socket.io instance for real-time communication
 * @property {ShowAlert} [showAlert] - Function to show alert messages
 * @property {string} roomName - Event room name/ID
 * @property {(isVisible: boolean) => void} updateIsMessagesModalVisible - Function to toggle messages modal
 * @property {(participant: Participant | null) => void} updateDirectMessageDetails - Function to set direct message target
 * @property {(start: boolean) => void} updateStartDirectMessage - Function to initiate direct messaging
 * @property {(participants: Participant[]) => void} updateParticipants - Function to update participants list
 * @property {() => ParticipantsModalParameters} getUpdatedAllParams - Function to get fresh parameter state
 * @property {unknown} [key] - Additional dynamic parameters
 */
export interface ParticipantsModalParameters {
  position?: string;
  backgroundColor?: string;
  coHostResponsibility: CoHostResponsibility[];
  coHost: string;
  member: string;
  islevel: string;
  participants: Participant[];
  eventType: EventType;
  filteredParticipants: Participant[];
  socket: Socket;
  showAlert?: ShowAlert;
  roomName: string;
  updateIsMessagesModalVisible: (isVisible: boolean) => void;
  updateDirectMessageDetails: (participant: Participant | null) => void;
  updateStartDirectMessage: (start: boolean) => void;
  updateParticipants: (participants: Participant[]) => void;
  getUpdatedAllParams: () => ParticipantsModalParameters;
  [key: string]: unknown;
}

/**
 * ParticipantsModal props interface
 * 
 * @interface ParticipantsModalProps
 * @property {boolean} isParticipantsModalVisible - Whether modal is visible
 * @property {() => void} onParticipantsClose - Function to close the modal
 * @property {(filter: string) => void} onParticipantsFilterChange - Function called when search filter changes
 * @property {number} participantsCounter - Total number of participants (for badge display)
 * @property {typeof muteParticipants} [onMuteParticipants=muteParticipants] - Function to mute a participant
 * @default muteParticipants
 * @property {typeof messageParticipants} [onMessageParticipants=messageParticipants] - Function to send direct message to participant
 * @default messageParticipants
 * @property {typeof removeParticipants} [onRemoveParticipants=removeParticipants] - Function to remove a participant from event
 * @default removeParticipants
 * @property {Component} [renderParticipantList=ParticipantList] - Custom component for moderator list rendering
 * @default ParticipantList
 * @property {Component} [renderParticipantListOthers=ParticipantListOthers] - Custom component for attendee list rendering
 * @default ParticipantListOthers
 * @property {ParticipantsModalParameters} parameters - All required parameters for participant operations
 * @property {string} [backgroundColor='#83c0e9'] - Modal background color
 * @default '#83c0e9'
 * @property {string} [position='topRight'] - Modal position ('topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft')
 * @default 'topRight'
 * @property {VNodeChild | string | number} [title='Participants'] - Modal title text or VNode
 * @default 'Participants'
 * @property {HTMLAttributes} [overlayProps] - HTML attributes for overlay backdrop
 * @property {HTMLAttributes} [contentProps] - HTML attributes for modal content container
 * @property {HTMLAttributes} [headerProps] - HTML attributes for header section
 * @property {HTMLAttributes} [titleProps] - HTML attributes for title element
 * @property {HTMLAttributes} [badgeWrapperProps] - HTML attributes for badge wrapper
 * @property {HTMLAttributes} [badgeProps] - HTML attributes for counter badge element
 * @property {ButtonHTMLAttributes} [closeButtonProps] - HTML attributes for close button
 * @property {VNodeChild} [closeIconComponent] - Custom close icon component
 * @property {HTMLAttributes} [bodyProps] - HTML attributes for modal body
 * @property {HTMLAttributes} [searchWrapperProps] - HTML attributes for search wrapper
 * @property {InputHTMLAttributes} [searchInputProps] - HTML attributes for search input
 * @property {HTMLAttributes} [listsWrapperProps] - HTML attributes for lists container
 * @property {HTMLAttributes} [moderatorListProps] - HTML attributes for moderator list section
 * @property {HTMLAttributes} [attendeeListProps] - HTML attributes for attendee list section
 * @property {VNodeChild | ((context: { counter: number }) => VNodeChild)} [emptyState] - Custom empty state when no participants
 * @property {(options: HeaderRenderOptions) => VNodeChild} [renderHeader] - Custom header renderer
 * @example
 * ```typescript
 * renderHeader: ({ defaultHeader, counter, onClose }) => {
 *   // return h('div', { class: 'custom-header' }, [
 *     h('h3', {}, `Participants: ${counter}`),
 *     h('button', { onClick: onClose }, '×')
 *   ]);
 * }
 * ```
 * @property {(options: SearchRenderOptions) => VNodeChild} [renderSearch] - Custom search renderer
 * @property {(options: ListsRenderOptions) => VNodeChild} [renderLists] - Custom lists renderer
 * @property {(options: BodyRenderOptions) => VNodeChild} [renderBody] - Custom body renderer
 * @property {(options: ContentRenderOptions) => VNodeChild} [renderContent] - Custom content renderer
 */
export interface ParticipantsModalProps {
  isParticipantsModalVisible: boolean;
  onParticipantsClose: () => void;
  onParticipantsFilterChange: (filter: string) => void;
  participantsCounter: number;
  onMuteParticipants?: typeof muteParticipants;
  onMessageParticipants?: typeof messageParticipants;
  onRemoveParticipants?: typeof removeParticipants;
  renderParticipantList?: Component;
  renderParticipantListOthers?: Component;
  parameters: ParticipantsModalParameters;
  backgroundColor?: string;
  position?: string;
  title?: VNodeChild | string | number;
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
  listsWrapperProps?: HTMLAttributes;
  moderatorListProps?: HTMLAttributes;
  attendeeListProps?: HTMLAttributes;
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
  renderLists?: (options: {
    defaultLists: VNodeChild;
    participants: Participant[];
    hasModeratorControls: boolean;
  }) => VNodeChild;
  renderBody?: (options: {
    defaultBody: VNodeChild;
    counter: number;
  }) => VNodeChild;
  renderContent?: (options: {
    defaultContent: VNodeChild;
    counter: number;
  }) => VNodeChild;
}

const props = withDefaults(defineProps<ParticipantsModalProps>(), {
  title: 'Participants',
  backgroundColor: '#83c0e9',
  position: 'topRight',
  onMuteParticipants: () => muteParticipants,
  onMessageParticipants: () => messageParticipants,
  onRemoveParticipants: () => removeParticipants,
  renderParticipantList: () => ParticipantList,
  renderParticipantListOthers: () => ParticipantListOthers,
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
  listsWrapperProps: undefined,
  moderatorListProps: undefined,
  attendeeListProps: undefined,
  emptyState: undefined,
  renderHeader: undefined,
  renderSearch: undefined,
  renderLists: undefined,
  renderBody: undefined,
  renderContent: undefined,
});

const parameters = computed(() => props.parameters);
const coHostResponsibility = computed<CoHostResponsibility[]>(
  () => parameters.value.coHostResponsibility ?? []
);
const coHost = computed(() => parameters.value.coHost ?? '');
const member = computed(() => parameters.value.member ?? '');
const islevel = computed(() => parameters.value.islevel ?? '');
const eventType = computed<EventType | undefined>(() => parameters.value.eventType);
const participants = computed<Participant[]>(() => parameters.value.participants ?? []);
const filteredParticipants = computed<Participant[]>(
  () => parameters.value.filteredParticipants ?? []
);
const socket = computed<Socket | undefined>(() => parameters.value.socket);
const showAlert = computed(() => parameters.value.showAlert);
const roomName = computed(() => parameters.value.roomName ?? '');
const updateIsMessagesModalVisible = computed(
  () => parameters.value.updateIsMessagesModalVisible
);
const updateDirectMessageDetails = computed(
  () => parameters.value.updateDirectMessageDetails
);
const updateStartDirectMessage = computed(
  () => parameters.value.updateStartDirectMessage
);
const updateParticipants = computed(() => parameters.value.updateParticipants);

const participant_s = ref<Participant[]>([]);
const participantsCounter_s = ref(props.participantsCounter);
const reRender = ref(false);

const participantsValue = computed(() =>
  coHostResponsibility.value.some(
    (item) => item.name === 'participants' && item.value
  )
);

const showFullControls = computed(
  () =>
    (participants.value.length > 0 && islevel.value === '2') ||
    (coHost.value === member.value && participantsValue.value)
);

const handleFilterChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  props.onParticipantsFilterChange(target.value);
  reRender.value = !reRender.value;
};

watch(
  [filteredParticipants, participants, () => props.participantsCounter, reRender],
  ([filtered, all, counter]) => {
    const source = filtered.length > 0 ? filtered : all;
    participant_s.value = [...source];

    const fallbackCount =
      counter ?? (filtered.length > 0 ? filtered.length : all.length ?? 0);
    participantsCounter_s.value = filtered.length > 0 ? filtered.length : fallbackCount;
  },
  { immediate: true, deep: true }
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
const defaultOverlayWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.8, 400) : 360

const overlayStyle = computed((): CSSProperties => ({
  position: 'fixed' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: props.isParticipantsModalVisible ? 'block' : 'none',
  zIndex: 999,
  ...(props.overlayProps?.style as CSSProperties || {})
}))

const overlayClassName = computed(() => 
  joinClassNames(['mediasfu-participants-modal', props.overlayProps?.class as string])
)

const contentStyle = computed((): CSSProperties => ({
  position: 'fixed' as const,
  backgroundColor: props.backgroundColor,
  borderRadius: '10px',
  padding: '16px',
  width: `${defaultOverlayWidth}px`,
  maxHeight: '75%',
  overflowY: 'auto' as const,
  top: props.position.includes('top') ? '10px' : 'auto',
  bottom: props.position.includes('bottom') ? '10px' : 'auto',
  left: props.position.includes('Left') ? '10px' : 'auto',
  right: props.position.includes('Right') ? '10px' : 'auto',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '12px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
  ...(props.contentProps?.style as CSSProperties || {})
}))

const contentClassName = computed(() => 
  joinClassNames(['mediasfu-participants-modal__content', props.contentProps?.class as string])
)

// Main overlay node
const overlayNode = computed(() => {
  const defaultCloseIcon = props.closeIconComponent ?? h(FontAwesomeIcon, { icon: faTimes, size: 'xl' })
  
  const defaultTitleNode = h('h2', {
    class: joinClassNames(['modal-title', props.titleProps?.class as string]),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      margin: 0,
      ...(props.titleProps?.style as CSSProperties || {})
    },
    ...(props.titleProps ? Object.fromEntries(
      Object.entries(props.titleProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    typeof props.title === 'string' || typeof props.title === 'number' ? props.title : props.title,
    h('div', {
      class: joinClassNames(['participants-counter', props.badgeWrapperProps?.class as string]),
      style: {
        backgroundColor: '#fff',
        color: '#000',
        borderRadius: '10px',
        padding: '5px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...(props.badgeWrapperProps?.style as CSSProperties || {})
      },
      ...(props.badgeWrapperProps ? Object.fromEntries(
        Object.entries(props.badgeWrapperProps).filter(([key]) => !['class', 'style'].includes(key))
      ) : {})
    }, [
      h('span', {
        class: joinClassNames(['badge', props.badgeProps?.class as string]),
        style: { ...(props.badgeProps?.style as CSSProperties || {}) },
        ...(props.badgeProps ? Object.fromEntries(
          Object.entries(props.badgeProps).filter(([key]) => !['class', 'style'].includes(key))
        ) : {})
      }, String(participantsCounter_s.value))
    ])
  ])
  
  const defaultHeaderNode = h('div', {
    class: joinClassNames(['modal-header', props.headerProps?.class as string]),
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '12px',
      ...(props.headerProps?.style as CSSProperties || {})
    },
    ...(props.headerProps ? Object.fromEntries(
      Object.entries(props.headerProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    defaultTitleNode,
    h('button', {
      class: joinClassNames(['btn-close-participants', props.closeButtonProps?.class as string]),
      style: {
        padding: '5px',
        cursor: 'pointer',
        border: 'none',
        background: 'transparent',
        ...(props.closeButtonProps?.style as CSSProperties || {})
      },
      onClick: (event: MouseEvent) => {
        if (props.closeButtonProps?.onClick) {
          (props.closeButtonProps.onClick as (event: MouseEvent) => void)(event)
        }
        if (!event.defaultPrevented) {
          props.onParticipantsClose()
        }
      },
      ...(props.closeButtonProps ? Object.fromEntries(
        Object.entries(props.closeButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
      ) : {})
    }, [defaultCloseIcon])
  ])
  
  const headerNode = props.renderHeader
    ? props.renderHeader({
        defaultHeader: defaultHeaderNode,
        counter: participantsCounter_s.value,
        onClose: props.onParticipantsClose
      })
    : defaultHeaderNode
  
  const defaultSearchNode = h('div', {
    class: joinClassNames(['search-wrapper', props.searchWrapperProps?.class as string]),
    style: {
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
      marginBottom: '10px',
      ...(props.searchWrapperProps?.style as CSSProperties || {})
    },
    ...(props.searchWrapperProps ? Object.fromEntries(
      Object.entries(props.searchWrapperProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    h('input', {
      type: 'text',
      class: joinClassNames(['form-control', props.searchInputProps?.class as string]),
      style: {
        width: '90%',
        maxWidth: '320px',
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #000',
        fontSize: '16px',
        boxSizing: 'border-box',
        ...(props.searchInputProps?.style as CSSProperties || {})
      },
      placeholder: 'Search ...',
      onInput: (event: Event) => {
        if (props.searchInputProps?.onInput) {
          (props.searchInputProps.onInput as (event: Event) => void)(event)
        }
        if (!event.defaultPrevented) {
          handleFilterChange(event)
        }
      },
      ...(props.searchInputProps ? Object.fromEntries(
        Object.entries(props.searchInputProps).filter(([key]) => !['class', 'style', 'onInput', 'type', 'placeholder'].includes(key))
      ) : {})
    })
  ])
  
  const searchNode = props.renderSearch
    ? props.renderSearch({
        defaultSearch: defaultSearchNode,
        onFilter: (value: string) => {
          const event = new Event('input')
          Object.defineProperty(event, 'target', {
            value: { value },
            writable: false
          })
          handleFilterChange(event)
        }
      })
    : defaultSearchNode
  
  const defaultListsNode = h('div', {
    class: joinClassNames(['lists-wrapper', props.listsWrapperProps?.class as string]),
    style: { ...(props.listsWrapperProps?.style as CSSProperties || {}) },
    ...(props.listsWrapperProps ? Object.fromEntries(
      Object.entries(props.listsWrapperProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    showFullControls.value
      ? h(props.renderParticipantList, {
          class: joinClassNames([props.moderatorListProps?.class as string]),
          style: { ...(props.moderatorListProps?.style as CSSProperties || {}) },
          participants: participant_s.value,
          isBroadcast: eventType.value === 'broadcast',
          onMuteParticipants: props.onMuteParticipants,
          onMessageParticipants: props.onMessageParticipants,
          onRemoveParticipants: props.onRemoveParticipants,
          socket: socket.value,
          coHostResponsibility: coHostResponsibility.value,
          member: member.value,
          islevel: islevel.value,
          showAlert: showAlert.value,
          coHost: coHost.value,
          roomName: roomName.value,
          updateIsMessagesModalVisible: updateIsMessagesModalVisible.value,
          updateDirectMessageDetails: updateDirectMessageDetails.value,
          updateStartDirectMessage: updateStartDirectMessage.value,
          updateParticipants: updateParticipants.value,
          ...(props.moderatorListProps ? Object.fromEntries(
            Object.entries(props.moderatorListProps).filter(([key]) => !['class', 'style'].includes(key))
          ) : {})
        })
      : participant_s.value.length > 0
        ? h(props.renderParticipantListOthers, {
            class: joinClassNames([props.attendeeListProps?.class as string]),
            style: { ...(props.attendeeListProps?.style as CSSProperties || {}) },
            participants: participant_s.value,
            coHost: coHost.value,
            member: member.value,
            ...(props.attendeeListProps ? Object.fromEntries(
              Object.entries(props.attendeeListProps).filter(([key]) => !['class', 'style'].includes(key))
            ) : {})
          })
        : h('div', {
            class: 'empty-state',
            style: { textAlign: 'center', padding: '20px', color: '#666' }
          }, [
            typeof props.emptyState === 'function'
              ? (props.emptyState as (context: { counter: number }) => VNodeChild)({ counter: participantsCounter_s.value })
              : (props.emptyState || 'No participants')
          ])
  ])
  
  const listsNode = props.renderLists
    ? props.renderLists({
        defaultLists: defaultListsNode,
        participants: participant_s.value,
        hasModeratorControls: showFullControls.value
      })
    : defaultListsNode
  
  const defaultBodyNode = h('div', {
    class: joinClassNames(['modal-body', props.bodyProps?.class as string]),
    style: { ...(props.bodyProps?.style as CSSProperties || {}) },
    ...(props.bodyProps ? Object.fromEntries(
      Object.entries(props.bodyProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    headerNode,
    searchNode,
    listsNode
  ])
  
  const bodyNode = props.renderBody
    ? props.renderBody({
        defaultBody: defaultBodyNode,
        counter: participantsCounter_s.value
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
    ? props.renderContent({
        defaultContent: defaultContentNode,
        counter: participantsCounter_s.value
      })
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
