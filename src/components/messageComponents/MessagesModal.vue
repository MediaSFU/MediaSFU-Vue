<!--
 * MessagesModal - Messaging modal with direct and group chat
 *
 * @fileoverview
 * A dual-tab messaging modal for handling both direct (1-on-1) and group chat messages.
 * Provides tabbed interface to switch between direct messages and group chat, with
 * message history display, send capabilities, and event-type-specific features.
 *
 * @component MessagesModal
 * @module components/messageComponents/MessagesModal
 *
 * @description
 * This modal provides a complete messaging interface with:
 * - Tabbed interface (Direct Messages / Group Chat)
 * - Direct messaging for webinars and conferences
 * - Group chat for all event types
 * - Message history display via MessagePanel component
 * - Real-time message sending via Socket.io
 * - Chat setting enforcement (public/private messaging rules)
 * - Role-based messaging permissions
 * - Automatic tab visibility based on event type
 * - Custom positioning (topRight, topLeft, bottomRight, bottomLeft)
 * - Fully customizable render functions for all UI sections
 *
 * @example
 * // Basic messages modal
 * // <MessagesModal
 *   // :is-messages-modal-visible="showMessages"
 *   // :on-messages-close="() => setShowMessages(false)"
 *   // :messages="messageHistory"
 *   // :event-type="eventType"
 *   // :member="currentUser"
 *   // :islevel="userLevel"
 *   // :co-host-responsibility="coHostPerms"
 *   // :co-host="coHostId"
 *   // :start-direct-message="directMessageActive"
 *   // :direct-message-details="directMessageTarget"
 *   // :update-start-direct-message="setDirectMessageActive"
 *   // :update-direct-message-details="setDirectMessageTarget"
 *   // :room-name="roomName"
 *   // :socket="socket"
 *   // :chat-setting="chatSetting"
 * // />
 *
 * @example
 * // Custom styled with position and colors
 * // <MessagesModal
 *   // :is-messages-modal-visible="showMessages"
 *   // :on-messages-close="closeMessages"
 *   // :messages="messages"
 *   // event-type="conference"
 *   // :member="member"
 *   // :islevel="islevel"
 *   // :co-host-responsibility="coHostResponsibility"
 *   // :co-host="coHost"
 *   // :start-direct-message="startDirectMessage"
 *   // :direct-message-details="directMessageDetails"
 *   // :update-start-direct-message="updateStartDirectMessage"
 *   // :update-direct-message-details="updateDirectMessageDetails"
 *   // :room-name="roomName"
 *   // :socket="socket"
 *   // chat-setting="allow"
 *   // position="bottomLeft"
 *   // background-color="#2a2a2a"
 *   // active-tab-background-color="#00a8ff"
 *   // title="Event Chat"
 * // />
 *
 * @example
 * // Custom render functions
 * // <MessagesModal
 *   // :is-messages-modal-visible="showMessages"
 *   // :on-messages-close="closeMessages"
 *   // :messages="messages"
 *   // event-type="webinar"
 *   // :member="member"
 *   // :islevel="islevel"
 *   // :co-host-responsibility="coHostResponsibility"
 *   // :co-host="coHost"
 *   // :start-direct-message="startDirectMessage"
 *   // :direct-message-details="directMessageDetails"
 *   // :update-start-direct-message="updateStartDirectMessage"
 *   // :update-direct-message-details="updateDirectMessageDetails"
 *   // :room-name="roomName"
 *   // :socket="socket"
 *   // chat-setting="allow"
 *   // :render-tabs="(options) => {
 *     const { activeTab, switchToDirect, switchToGroup } = options;
 *     return h('div', { class: 'custom-tabs' }, [
 *       h('button', { 
 *         class: activeTab === 'direct' ? 'active' : '',
 *         onClick: switchToDirect 
 *       }, 'Direct'),
 *       h('button', { 
 *         class: activeTab === 'group' ? 'active' : '',
 *         onClick: switchToGroup 
 *       }, 'Group')
 *     ]);
 *   }"
 * // />
 *
 * @example
 * // Custom send message handler
 * // <MessagesModal
 *   // :is-messages-modal-visible="showMessages"
 *   // :on-messages-close="closeMessages"
 *   // :messages="messages"
 *   // event-type="broadcast"
 *   // :member="member"
 *   // :islevel="islevel"
 *   // :co-host-responsibility="coHostResponsibility"
 *   // :co-host="coHost"
 *   // :start-direct-message="false"
 *   // :direct-message-details="null"
 *   // :update-start-direct-message="() => {}"
 *   // :update-direct-message-details="() => {}"
 *   // :room-name="roomName"
 *   // :socket="socket"
 *   // chat-setting="allow"
 *   // :on-send-message-press="async (options) => {
 *     // Custom message validation/processing
 *     await customSendMessage(options);
 *   }"
 * // />
 *
 * @example
 * // Custom empty state per tab
 * // <MessagesModal
 *   // :is-messages-modal-visible="showMessages"
 *   // :on-messages-close="closeMessages"
 *   // :messages="messages"
 *   // event-type="conference"
 *   // :member="member"
 *   // :islevel="islevel"
 *   // :co-host-responsibility="coHostResponsibility"
 *   // :co-host="coHost"
 *   // :start-direct-message="startDirectMessage"
 *   // :direct-message-details="directMessageDetails"
 *   // :update-start-direct-message="updateStartDirectMessage"
 *   // :update-direct-message-details="updateDirectMessageDetails"
 *   // :room-name="roomName"
 *   // :socket="socket"
 *   // chat-setting="allow"
 *   // :empty-state="(context) => {
 *     const message = context.type === 'direct' 
 *       ? 'No direct messages yet' 
 *       : 'No group messages yet';
 *     return h('div', { class: 'empty-chat' }, message);
 *   }"
 * // />
-->
<template>
  <RenderVNode :node="overlayNode" />
</template>

<script setup lang="ts">
import { h, isVNode, defineComponent, ref, computed, watch, type PropType, type VNodeChild, type HTMLAttributes, type ButtonHTMLAttributes, type CSSProperties } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import MessagePanel from './MessagePanel.vue';
import { sendMessage, type SendMessageOptions } from 'mediasfu-shared';
import type {
  CoHostResponsibility,
  EventType,
  Message,
  Participant,
  ShowAlert,
} from '../../../../SharedTypes';
import type { Socket } from 'socket.io-client';

/**
 * MessagesModal props interface
 * 
 * @interface MessagesModalProps
 * @property {boolean} isMessagesModalVisible - Whether modal is visible
 * @property {() => void} onMessagesClose - Function to close the modal
 * @property {(options: SendMessageOptions) => Promise<void>} [onSendMessagePress=sendMessage] - Function to send a message
 * @default sendMessage
 * @property {Message[]} messages - Array of all messages (direct and group)
 * @property {EventType} eventType - Type of event (determines direct message availability)
 * @property {string} member - Current user's member ID
 * @property {string} islevel - Current user's permission level ('0'=host, '1'=co-host, '2'=attendee)
 * @property {CoHostResponsibility[]} coHostResponsibility - Array of co-host permissions
 * @property {string} coHost - Co-host identifier
 * @property {boolean} startDirectMessage - Whether direct messaging is active/initiated
 * @property {Participant | null} directMessageDetails - Target participant for direct message
 * @property {(start: boolean) => void} updateStartDirectMessage - Function to set direct message mode
 * @property {(participant: Participant | null) => void} updateDirectMessageDetails - Function to set direct message target
 * @property {ShowAlert} [showAlert] - Function to show alert messages
 * @property {string} roomName - Event room name/ID
 * @property {Socket} socket - Socket.io instance for real-time messaging
 * @property {string} chatSetting - Chat permission setting ('allow', 'disallow', 'approval')
 * @property {string} [position='topRight'] - Modal position ('topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft')
 * @default 'topRight'
 * @property {string} [backgroundColor='#f5f5f5'] - Modal background color
 * @default '#f5f5f5'
 * @property {string} [activeTabBackgroundColor='#2b7ce5'] - Active tab background color
 * @default '#2b7ce5'
 * @property {VNodeChild | string | number} [title='Messages'] - Modal title text or VNode
 * @default 'Messages'
 * @property {HTMLAttributes} [overlayProps] - HTML attributes for overlay backdrop
 * @property {HTMLAttributes} [contentProps] - HTML attributes for modal content container
 * @property {HTMLAttributes} [headerProps] - HTML attributes for header section
 * @property {HTMLAttributes} [titleProps] - HTML attributes for title element
 * @property {HTMLAttributes} [tabListProps] - HTML attributes for tab list container
 * @property {ButtonHTMLAttributes} [tabButtonProps] - HTML attributes for tab buttons
 * @property {ButtonHTMLAttributes} [closeButtonProps] - HTML attributes for close button
 * @property {VNodeChild} [closeIconComponent] - Custom close icon component
 * @property {HTMLAttributes} [bodyProps] - HTML attributes for modal body
 * @property {HTMLAttributes} [directPanelWrapperProps] - HTML attributes for direct messages panel wrapper
 * @property {HTMLAttributes} [groupPanelWrapperProps] - HTML attributes for group messages panel wrapper
 * @property {VNodeChild | ((context: { type: 'direct' | 'group' }) => VNodeChild)} [emptyState] - Custom empty state when no messages
 * @property {(options: HeaderRenderOptions) => VNodeChild} [renderHeader] - Custom header renderer
 * @example
 * ```typescript
 * renderHeader: ({ defaultHeader, activeTab, onClose }) => {
 *   // return h('div', { class: 'custom-header' }, [
 *     h('h3', {}, activeTab === 'direct' ? 'Direct Messages' : 'Group Chat'),
 *     h('button', { onClick: onClose }, '×')
 *   ]);
 * }
 * ```
 * @property {(options: TabsRenderOptions) => VNodeChild} [renderTabs] - Custom tabs renderer
 * @example
 * ```typescript
 * renderTabs: ({ activeTab, switchToDirect, switchToGroup }) => {
 *   // return h('div', { class: 'tabs' }, [
 *     h('button', { onClick: switchToDirect, class: activeTab === 'direct' ? 'active' : '' }, 'Direct'),
 *     h('button', { onClick: switchToGroup, class: activeTab === 'group' ? 'active' : '' }, 'Group')
 *   ]);
 * }
 * ```
 * @property {(options: TabButtonRenderOptions) => VNodeChild} [renderTabButton] - Custom tab button renderer
 * @property {(options: PanelsRenderOptions) => VNodeChild} [renderPanels] - Custom panels renderer
 * @property {(options: BodyRenderOptions) => VNodeChild} [renderBody] - Custom body renderer
 * @property {(options: ContentRenderOptions) => VNodeChild} [renderContent] - Custom content renderer
 */
export interface MessagesModalProps {
  isMessagesModalVisible: boolean;
  onMessagesClose: () => void;
  onSendMessagePress?: (options: SendMessageOptions) => Promise<void>;
  messages: Message[];
  eventType: EventType;
  member: string;
  islevel: string;
  coHostResponsibility: CoHostResponsibility[];
  coHost: string;
  startDirectMessage: boolean;
  directMessageDetails: Participant | null;
  updateStartDirectMessage: (start: boolean) => void;
  updateDirectMessageDetails: (participant: Participant | null) => void;
  showAlert?: ShowAlert;
  roomName: string;
  socket: Socket;
  chatSetting: string;
  position?: string;
  backgroundColor?: string;
  activeTabBackgroundColor?: string;
  title?: VNodeChild | string | number;
  overlayProps?: HTMLAttributes;
  contentProps?: HTMLAttributes;
  headerProps?: HTMLAttributes;
  titleProps?: HTMLAttributes;
  tabListProps?: HTMLAttributes;
  tabButtonProps?: ButtonHTMLAttributes;
  closeButtonProps?: ButtonHTMLAttributes;
  closeIconComponent?: VNodeChild;
  bodyProps?: HTMLAttributes;
  directPanelWrapperProps?: HTMLAttributes;
  groupPanelWrapperProps?: HTMLAttributes;
  emptyState?: VNodeChild | ((context: { type: 'direct' | 'group' }) => VNodeChild);
  renderHeader?: (options: {
    defaultHeader: VNodeChild;
    activeTab: 'direct' | 'group';
    onClose: () => void;
  }) => VNodeChild;
  renderTabs?: (options: {
    defaultTabs: VNodeChild;
    activeTab: 'direct' | 'group';
    switchToDirect: () => void;
    switchToGroup: () => void;
  }) => VNodeChild;
  renderTabButton?: (options: {
    type: 'direct' | 'group';
    isActive: boolean;
    defaultButton: VNodeChild;
    switchTo: () => void;
  }) => VNodeChild;
  renderPanels?: (options: {
    defaultPanels: VNodeChild;
    activeTab: 'direct' | 'group';
  }) => VNodeChild;
  renderBody?: (options: {
    defaultBody: VNodeChild;
    activeTab: 'direct' | 'group';
  }) => VNodeChild;
  renderContent?: (options: {
    defaultContent: VNodeChild;
    activeTab: 'direct' | 'group';
  }) => VNodeChild;
}

const props = withDefaults(defineProps<MessagesModalProps>(), {
  position: 'topRight',
  backgroundColor: '#f5f5f5',
  activeTabBackgroundColor: '#2b7ce5',
  title: 'Messages',
  showAlert: undefined,
  onSendMessagePress: sendMessage,
  overlayProps: undefined,
  contentProps: undefined,
  headerProps: undefined,
  titleProps: undefined,
  tabListProps: undefined,
  tabButtonProps: undefined,
  closeButtonProps: undefined,
  closeIconComponent: undefined,
  bodyProps: undefined,
  directPanelWrapperProps: undefined,
  groupPanelWrapperProps: undefined,
  emptyState: undefined,
  renderHeader: undefined,
  renderTabs: undefined,
  renderTabButton: undefined,
  renderPanels: undefined,
  renderBody: undefined,
  renderContent: undefined,
});

const screenWidth = window.innerWidth;
let modalWidth = 0.8 * screenWidth;
if (modalWidth > 400) {
  modalWidth = 400;
}

const enableDirectTab = computed(() => props.eventType === 'webinar' || props.eventType === 'conference');

const activeTab = ref<'direct' | 'group'>(enableDirectTab.value ? 'direct' : 'group');
const focusedInput = ref(false);

const hasChatModerationPrivilege = computed(() =>
  (props.coHostResponsibility ?? []).some((item) => item.name === 'chat' && item.value === true)
);

const directMessages = computed(() => {
  const isHost = props.islevel === '2';
  const memberName = props.member;
  const receiversIncludeMember = (receivers: Message['receivers']) =>
    Array.isArray(receivers) && receivers.includes(memberName);
  const isChatModerator = props.coHost === memberName && hasChatModerationPrivilege.value;

  return props.messages.filter((message: Message) => {
    if (message.group) {
      return false;
    }

    const participantInvolved =
      message.sender === memberName || receiversIncludeMember(message.receivers);

    return participantInvolved || isHost || isChatModerator;
  });
});

const groupMessages = computed(() => {
  return props.messages.filter((message: Message) => message.group);
});

const onClose = () => {
  props.onMessagesClose();
};

watch(enableDirectTab, (canShowDirect) => {
  if (!canShowDirect && activeTab.value !== 'group') {
    activeTab.value = 'group';
    focusedInput.value = false;
  }
});

watch(
  () => props.startDirectMessage,
  (newValue) => {
    if (newValue && props.directMessageDetails && enableDirectTab.value) {
      activeTab.value = 'direct';
      focusedInput.value = true;
    } else {
      focusedInput.value = false;
    }
  }
);

watch(
  () => props.directMessageDetails,
  (newValue) => {
    if (!newValue) {
      focusedInput.value = false;
    }
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
const defaultOverlayWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.8, 400) : 360

const overlayStyle = computed((): CSSProperties => ({
  position: 'fixed' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: props.isMessagesModalVisible ? 'block' : 'none',
  zIndex: 999,
  ...(props.overlayProps?.style as CSSProperties || {})
}))

const overlayClassName = computed(() => 
  joinClassNames(['mediasfu-messages-modal', props.overlayProps?.class as string])
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
  ...(props.contentProps?.style as CSSProperties || {})
}))

const contentClassName = computed(() => 
  joinClassNames(['mediasfu-messages-modal__content', props.contentProps?.class as string])
)

// Main overlay node
const overlayNode = computed(() => {
  const defaultCloseIcon = props.closeIconComponent ?? h(FontAwesomeIcon, { icon: faTimes, size: 'xl' })
  
  const defaultTitleNode = h('div', {
    class: joinClassNames(['modal-title', props.titleProps?.class as string]),
    style: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: 'black',
      ...(props.titleProps?.style as CSSProperties || {})
    },
    ...(props.titleProps ? Object.fromEntries(
      Object.entries(props.titleProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, typeof props.title === 'string' || typeof props.title === 'number' ? [props.title] : (props.title || []))
  
  const defaultHeaderNode = h('div', {
    class: joinClassNames(['modal-header', props.headerProps?.class as string]),
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
      ...(props.headerProps?.style as CSSProperties || {})
    },
    ...(props.headerProps ? Object.fromEntries(
      Object.entries(props.headerProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    defaultTitleNode,
    h('button', {
      class: joinClassNames(['btn-close-messages', props.closeButtonProps?.class as string]),
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
          onClose()
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
        activeTab: activeTab.value,
        onClose
      })
    : defaultHeaderNode
  
  const dividerNode = h('hr', {
    style: {
      height: '1px',
      backgroundColor: 'black',
      marginTop: '5px',
      marginBottom: '5px',
      border: 'none'
    }
  })
  
  const switchToDirect = () => { activeTab.value = 'direct' }
  const switchToGroup = () => { activeTab.value = 'group' }
  
  const defaultDirectTabButton = h('button', {
    class: joinClassNames(['tab-button', 'tab-button-direct', props.tabButtonProps?.class as string]),
    style: {
      flex: 1,
      padding: '10px',
      backgroundColor: activeTab.value === 'direct' ? props.activeTabBackgroundColor : 'transparent',
      color: activeTab.value === 'direct' ? 'white' : 'black',
      border: 'none',
      cursor: 'pointer',
      fontWeight: activeTab.value === 'direct' ? 'bold' : 'normal',
      ...(props.tabButtonProps?.style as CSSProperties || {})
    },
    onClick: (event: MouseEvent) => {
      if (props.tabButtonProps?.onClick) {
        (props.tabButtonProps.onClick as (event: MouseEvent) => void)(event)
      }
      if (!event.defaultPrevented) {
        switchToDirect()
      }
    },
    ...(props.tabButtonProps ? Object.fromEntries(
      Object.entries(props.tabButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
    ) : {})
  }, ['Direct'])
  
  const directTabButtonNode = props.renderTabButton
    ? props.renderTabButton({
        type: 'direct',
        isActive: activeTab.value === 'direct',
        defaultButton: defaultDirectTabButton,
        switchTo: switchToDirect
      })
    : defaultDirectTabButton
  
  const defaultGroupTabButton = h('button', {
    class: joinClassNames(['tab-button', 'tab-button-group', props.tabButtonProps?.class as string]),
    style: {
      flex: 1,
      padding: '10px',
      backgroundColor: activeTab.value === 'group' ? props.activeTabBackgroundColor : 'transparent',
      color: activeTab.value === 'group' ? 'white' : 'black',
      border: 'none',
      cursor: 'pointer',
      fontWeight: activeTab.value === 'group' ? 'bold' : 'normal',
      ...(props.tabButtonProps?.style as CSSProperties || {})
    },
    onClick: (event: MouseEvent) => {
      if (props.tabButtonProps?.onClick) {
        (props.tabButtonProps.onClick as (event: MouseEvent) => void)(event)
      }
      if (!event.defaultPrevented) {
        switchToGroup()
      }
    },
    ...(props.tabButtonProps ? Object.fromEntries(
      Object.entries(props.tabButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
    ) : {})
  }, ['Group'])
  
  const groupTabButtonNode = props.renderTabButton
    ? props.renderTabButton({
        type: 'group',
        isActive: activeTab.value === 'group',
        defaultButton: defaultGroupTabButton,
        switchTo: switchToGroup
      })
    : defaultGroupTabButton
  
  const defaultTabsNode = enableDirectTab.value ? h('div', {
    class: joinClassNames(['tab-list', props.tabListProps?.class as string]),
    style: {
      display: 'flex',
      flexDirection: 'row',
      marginBottom: '10px',
      ...(props.tabListProps?.style as CSSProperties || {})
    },
    ...(props.tabListProps ? Object.fromEntries(
      Object.entries(props.tabListProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    directTabButtonNode,
    groupTabButtonNode
  ]) : null
  
  const tabsNode = props.renderTabs
    ? props.renderTabs({
        defaultTabs: defaultTabsNode,
        activeTab: activeTab.value,
        switchToDirect,
        switchToGroup
      })
    : defaultTabsNode
  
  const defaultPanelsNode = h('div', {
    class: 'panels-wrapper'
  }, [
    enableDirectTab.value && activeTab.value === 'direct'
      ? h('div', {
          class: joinClassNames(['direct-panel-wrapper', props.directPanelWrapperProps?.class as string]),
          style: { ...(props.directPanelWrapperProps?.style as CSSProperties || {}) },
          ...(props.directPanelWrapperProps ? Object.fromEntries(
            Object.entries(props.directPanelWrapperProps).filter(([key]) => !['class', 'style'].includes(key))
          ) : {})
        }, [
          h(MessagePanel, {
            messages: directMessages.value,
            messagesLength: props.messages.length,
            type: 'direct',
            username: props.member,
            onSendMessagePress: props.onSendMessagePress,
            backgroundColor: props.backgroundColor,
            focusedInput: focusedInput.value,
            showAlert: props.showAlert,
            eventType: props.eventType,
            member: props.member,
            islevel: props.islevel,
            startDirectMessage: props.startDirectMessage,
            updateStartDirectMessage: props.updateStartDirectMessage,
            directMessageDetails: props.directMessageDetails,
            updateDirectMessageDetails: props.updateDirectMessageDetails,
            coHostResponsibility: props.coHostResponsibility,
            coHost: props.coHost,
            roomName: props.roomName,
            socket: props.socket,
            chatSetting: props.chatSetting
          })
        ])
      : null,
    activeTab.value === 'group'
      ? h('div', {
          class: joinClassNames(['group-panel-wrapper', props.groupPanelWrapperProps?.class as string]),
          style: { ...(props.groupPanelWrapperProps?.style as CSSProperties || {}) },
          ...(props.groupPanelWrapperProps ? Object.fromEntries(
            Object.entries(props.groupPanelWrapperProps).filter(([key]) => !['class', 'style'].includes(key))
          ) : {})
        }, [
          h(MessagePanel, {
            messages: groupMessages.value,
            messagesLength: props.messages.length,
            type: 'group',
            username: props.member,
            onSendMessagePress: props.onSendMessagePress,
            backgroundColor: props.backgroundColor,
            focusedInput: false,
            showAlert: props.showAlert,
            eventType: props.eventType,
            member: props.member,
            islevel: props.islevel,
            startDirectMessage: props.startDirectMessage,
            updateStartDirectMessage: props.updateStartDirectMessage,
            directMessageDetails: props.directMessageDetails,
            updateDirectMessageDetails: props.updateDirectMessageDetails,
            coHostResponsibility: props.coHostResponsibility,
            coHost: props.coHost,
            roomName: props.roomName,
            socket: props.socket,
            chatSetting: props.chatSetting
          })
        ])
      : null
  ].filter(Boolean))
  
  const panelsNode = props.renderPanels
    ? props.renderPanels({
        defaultPanels: defaultPanelsNode,
        activeTab: activeTab.value
      })
    : defaultPanelsNode
  
  const defaultBodyNode = h('div', {
    class: joinClassNames(['modal-body', props.bodyProps?.class as string]),
    style: { ...(props.bodyProps?.style as CSSProperties || {}) },
    ...(props.bodyProps ? Object.fromEntries(
      Object.entries(props.bodyProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    headerNode,
    dividerNode,
    tabsNode,
    panelsNode
  ].filter(Boolean))
  
  const bodyNode = props.renderBody
    ? props.renderBody({
        defaultBody: defaultBodyNode,
        activeTab: activeTab.value
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
        activeTab: activeTab.value
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
