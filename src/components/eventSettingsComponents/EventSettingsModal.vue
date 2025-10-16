<!--
/**
 * @fileoverview EventSettingsModal - Event-wide media permissions and settings modal
 * @component EventSettingsModal
 * @module components/eventSettingsComponents/EventSettingsModal
 * 
 * @description
 * A host/admin-only modal for configuring event-wide media permissions. Controls whether
 * participants can use audio, video, screen sharing, and chat features. Each setting has
 * three modes: disallow (completely blocked), allow (freely enabled), and approval required
 * (participants must request permission). These settings apply globally to all participants
 * and are enforced by the server.
 * 
 * Key Features:
 * - Four permission categories: Audio, Video, Screenshare, Chat
 * - Three permission levels: Disallow, Allow, Approval Required
 * - Real-time updates via Socket.io
 * - Host-only access (islevel check on server)
 * - Dropdown selects for each setting
 * - Save button to apply changes
 * - Role-based permission enforcement
 * - Socket emission to update server state
 * - Alert feedback on save
 * - Flexible positioning (top/bottom, left/right)
 * 
 * Permission Modes:
 * - **Disallow**: Participants cannot use the feature at all
 * - **Allow**: Participants can use the feature freely
 * - **Approval Required**: Participants must request permission from host
 * 
 * Settings:
 * 1. **Audio Setting** - Controls microphone usage
 * 2. **Video Setting** - Controls camera usage
 * 3. **Screenshare Setting** - Controls screen sharing
 * 4. **Chat Setting** - Controls text chat (Disallow or Allow only)
 * 
 * @example Basic Usage
 * // <EventSettingsModal
 *   // :isEventSettingsModalVisible="isSettingsModalVisible"
 *   // :onEventSettingsClose="() => updateIsSettingsModalVisible(false)"
 *   // audioSetting="allow"
 *   // videoSetting="approval"
 *   // screenshareSetting="disallow"
 *   // chatSetting="allow"
 *   // :updateAudioSetting="updateAudioSetting"
 *   // :updateVideoSetting="updateVideoSetting"
 *   // :updateScreenshareSetting="updateScreenshareSetting"
 *   // :updateChatSetting="updateChatSetting"
 *   // :updateIsSettingsModalVisible="updateIsSettingsModalVisible"
 *   // roomName="my-room"
 *   // :socket="socket"
 *   // :showAlert="showAlert"
 * // />
 * 
 * @example Conference with Flexible Permissions
 * // <script setup>
 * const eventSettings = reactive({
 *   // audio: 'allow',
 *   // video: 'allow',
 *   // screenshare: 'approval',
 *   // chat: 'allow'
 * });
 * 
 * const openSettings = () => {
 *   // updateIsSettingsModalVisible(true);
 * };
 * </script>
 * 
 * // <template>
 *   <EventSettingsModal
 *     :isEventSettingsModalVisible="isSettingsOpen"
 *     :onEventSettingsClose="closeSettings"
 *     :audioSetting="eventSettings.audio"
 *     :videoSetting="eventSettings.video"
 *     :screenshareSetting="eventSettings.screenshare"
 *     :chatSetting="eventSettings.chat"
 *     :updateAudioSetting="(val) => eventSettings.audio = val"
 *     :updateVideoSetting="(val) => eventSettings.video = val"
 *     :updateScreenshareSetting="(val) => eventSettings.screenshare = val"
 *     :updateChatSetting="(val) => eventSettings.chat = val"
 *     :updateIsSettingsModalVisible="updateModalVisibility"
 *     roomName="conference-123"
 *     :socket="socketConnection"
 *   />
 * </template>
 * 
 * @example Webinar Mode (Restrictive Defaults)
 * // <EventSettingsModal
 *   // :isEventSettingsModalVisible="settingsVisible"
 *   // :onEventSettingsClose="hideSettings"
 *   // audioSetting="approval"
 *   // videoSetting="approval"
 *   // screenshareSetting="disallow"
 *   // chatSetting="allow"
 *   // :updateAudioSetting="updateAudio"
 *   // :updateVideoSetting="updateVideo"
 *   // :updateScreenshareSetting="updateScreenshare"
 *   // :updateChatSetting="updateChat"
 *   // :updateIsSettingsModalVisible="updateVisibility"
 *   // roomName="webinar-room"
 *   // :socket="socket"
 *   // position="topLeft"
 *   // backgroundColor="#2c3e50"
 * // />
 * 
 * @example Custom Labels and Options
 * // <script setup>
 * const customAudioOptions = [
 *   { value: 'disallow', label: '🔇 Mute All' },
 *   { value: 'allow', label: '🎤 Unmute All' },
 *   { value: 'approval', label: '✋ Request to Speak' }
 * ];
 * 
 * const customChatOptions = [
 *   { value: 'disallow', label: '🚫 Chat Off' },
 *   { value: 'allow', label: '💬 Chat On' }
 * ];
 * </script>
 * 
 * // <template>
 *   <EventSettingsModal
 *     :isEventSettingsModalVisible="modalOpen"
 *     :onEventSettingsClose="closeModal"
 *     audioSetting="allow"
 *     videoSetting="allow"
 *     screenshareSetting="approval"
 *     chatSetting="allow"
 *     :updateAudioSetting="setAudio"
 *     :updateVideoSetting="setVideo"
 *     :updateScreenshareSetting="setScreenshare"
 *     :updateChatSetting="setChat"
 *     :updateIsSettingsModalVisible="setVisibility"
 *     roomName="custom-room"
 *     :socket="socket"
 *     :audioOptions="customAudioOptions"
 *     :chatOptions="customChatOptions"
 *     audioLabel="Participant Audio:"
 *     chatLabel="Text Chat:"
 *     saveButtonLabel="Apply Settings"
 *   />
 * </template>
 * 
 * @example Custom Render Functions
 * // <script setup>
 * const renderCustomHeader = ({ defaultHeader }) => {
 *   // return h('div', { style: { background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', padding: '15px' } }, [
 *     h('h2', { style: { color: 'white', margin: 0 } }, 'Event Permissions'),
 *     h('p', { style: { color: '#e0e0e0', fontSize: '12px', margin: '5px 0 0 0' } }, 'Control participant access')
 *   ]);
 * };
 * 
 * const renderCustomFooter = ({ defaultFooter }) => {
 *   // return h('div', { style: { display: 'flex', gap: '10px', justifyContent: 'flex-end' } }, [
 *     h('button', { onClick: closeModal, class: 'btn btn-secondary' }, 'Cancel'),
 *     h('button', { onClick: saveSettings, class: 'btn btn-primary' }, 'Save & Close')
 *   ]);
 * };
 * </script>
 * 
 * // <template>
 *   <EventSettingsModal
 *     :isEventSettingsModalVisible="visible"
 *     :onEventSettingsClose="close"
 *     audioSetting="allow"
 *     videoSetting="allow"
 *     screenshareSetting="approval"
 *     chatSetting="allow"
 *     :updateAudioSetting="updateAudio"
 *     :updateVideoSetting="updateVideo"
 *     :updateScreenshareSetting="updateScreenshare"
 *     :updateChatSetting="updateChat"
 *     :updateIsSettingsModalVisible="updateVisibility"
 *     roomName="room"
 *     :socket="socket"
 *     :renderHeader="renderCustomHeader"
 *     :renderFooter="renderCustomFooter"
 *   />
 * </template>
 * 
 * @see {@link modifySettings} for server update logic
 * @see {@link EventSettingOption} for option configuration
 * @see {@link Socket} for Socket.io integration
 */
-->
<template>
  <RenderVNode :node="overlayNode" />
</template>

<script setup lang="ts">
import { h, isVNode, defineComponent, ref, computed, watch, type PropType, type VNodeChild, type HTMLAttributes, type ButtonHTMLAttributes, type SelectHTMLAttributes, type LabelHTMLAttributes, type CSSProperties } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { modifySettings } from 'mediasfu-shared';
import type { ModifySettingsOptions } from 'mediasfu-shared';
import type { Socket } from 'socket.io-client';
import type { ShowAlert } from '../../../../SharedTypes';

export interface EventSettingOption {
  value: string;
  label: VNodeChild;
}

export interface EventSettingSectionRenderInfo {
  key: 'audio' | 'video' | 'screenshare' | 'chat' | string;
  label: VNodeChild;
  value: string;
  options: EventSettingOption[];
}

export interface RenderSettingSectionParams {
  defaultSection: VNodeChild;
  defaultSelect: VNodeChild;
  section: EventSettingSectionRenderInfo;
  index: number;
  onChange: (value: string) => void;
}

/**
 * Props for the EventSettingsModal component
 * @interface EventSettingsModalProps
 * 
 * @property {boolean} isEventSettingsModalVisible - Controls modal visibility (true = visible, false = hidden)
 * @property {Function} onEventSettingsClose - Callback when modal closes
 * @property {Function} [onModifyEventSettings=modifySettings] - Custom function to modify event settings on server
 *   // @default modifySettings from @react-shared/methods/settings/modifySettings
 * @property {string} [position='topRight'] - Modal position on screen
 *   - Options: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
 * @property {string} [backgroundColor='#83c0e9'] - Background color of the modal content
 * 
 * @property {string} audioSetting - Current audio permission setting
 *   - Values: 'disallow' | 'allow' | 'approval'
 * @property {string} videoSetting - Current video permission setting
 *   - Values: 'disallow' | 'allow' | 'approval'
 * @property {string} screenshareSetting - Current screenshare permission setting
 *   - Values: 'disallow' | 'allow' | 'approval'
 * @property {string} chatSetting - Current chat permission setting
 *   - Values: 'disallow' | 'allow'
 * 
 * @property {Function} updateAudioSetting - Updates audio setting state
 *   // @param {string} setting - New audio setting value
 * @property {Function} updateVideoSetting - Updates video setting state
 *   // @param {string} setting - New video setting value
 * @property {Function} updateScreenshareSetting - Updates screenshare setting state
 *   // @param {string} setting - New screenshare setting value
 * @property {Function} updateChatSetting - Updates chat setting state
 *   // @param {string} setting - New chat setting value
 * @property {Function} updateIsSettingsModalVisible - Updates modal visibility state
 *   // @param {boolean} isVisible - New visibility value
 * 
 * @property {string} roomName - Room/meeting identifier for server updates
 * @property {Socket} socket - Socket.io connection for emitting setting changes
 * @property {ShowAlert} [showAlert] - Alert function for displaying save confirmation/errors
 * 
 * @property {VNodeChild} [title='Event Settings'] - Modal title content
 * @property {VNodeChild} [saveButtonLabel='Save'] - Save button label
 * @property {VNodeChild} [audioLabel='User audio:'] - Audio setting label
 * @property {VNodeChild} [videoLabel='User video:'] - Video setting label
 * @property {VNodeChild} [screenshareLabel='User screenshare:'] - Screenshare setting label
 * @property {VNodeChild} [chatLabel='User chat:'] - Chat setting label
 * @property {VNodeChild} [disallowOptionLabel='Disallow'] - Disallow option label
 * @property {VNodeChild} [allowOptionLabel='Allow'] - Allow option label
 * @property {VNodeChild} [approvalOptionLabel='Upon approval'] - Approval option label
 * @property {VNodeChild} [chatDisallowOptionLabel='Disallow'] - Chat disallow label
 * @property {VNodeChild} [chatAllowOptionLabel='Allow'] - Chat allow label
 * 
 * @property {EventSettingOption[]} [audioOptions] - Custom audio setting options
 *   // @example [{ value: 'disallow', label: 'Mute All' }, { value: 'allow', label: 'Unmute All' }, { value: 'approval', label: 'Request' }]
 * @property {EventSettingOption[]} [videoOptions] - Custom video setting options
 * @property {EventSettingOption[]} [screenshareOptions] - Custom screenshare setting options
 * @property {EventSettingOption[]} [chatOptions] - Custom chat setting options
 * 
 * @property {HTMLAttributes} [overlayProps] - Props for the overlay wrapper (backdrop)
 * @property {HTMLAttributes} [contentProps] - Props for the modal content container
 * @property {HTMLAttributes} [headerProps] - Props for the header section
 * @property {HTMLAttributes} [titleProps] - Props for the title element
 * @property {ButtonHTMLAttributes} [closeButtonProps] - Props for the close button
 * @property {VNodeChild} [closeIconComponent] - Custom close icon (default: faTimes FontAwesome)
 * @property {HTMLAttributes} [headerDividerProps] - Props for divider after header
 * @property {HTMLAttributes} [bodyProps] - Props for the body section container
 * @property {HTMLAttributes} [settingFieldProps] - Props for setting field wrappers
 * @property {HTMLAttributes} [audioFieldProps] - Props for audio field wrapper
 * @property {HTMLAttributes} [videoFieldProps] - Props for video field wrapper
 * @property {HTMLAttributes} [screenshareFieldProps] - Props for screenshare field wrapper
 * @property {HTMLAttributes} [chatFieldProps] - Props for chat field wrapper
 * @property {LabelHTMLAttributes} [settingLabelProps] - Props for setting labels
 * @property {LabelHTMLAttributes} [audioLabelProps] - Props for audio label
 * @property {LabelHTMLAttributes} [videoLabelProps] - Props for video label
 * @property {LabelHTMLAttributes} [screenshareLabelProps] - Props for screenshare label
 * @property {LabelHTMLAttributes} [chatLabelProps] - Props for chat label
 * @property {SelectHTMLAttributes} [settingSelectProps] - Props for setting select elements
 * @property {SelectHTMLAttributes} [audioSelectProps] - Props for audio select
 * @property {SelectHTMLAttributes} [videoSelectProps] - Props for video select
 * @property {SelectHTMLAttributes} [screenshareSelectProps] - Props for screenshare select
 * @property {SelectHTMLAttributes} [chatSelectProps] - Props for chat select
 * @property {HTMLAttributes} [separatorProps] - Props for separator dividers between settings
 * @property {HTMLAttributes} [footerProps] - Props for the footer section
 * @property {ButtonHTMLAttributes} [saveButtonProps] - Props for the save button
 * 
 * @property {Function} [renderHeader] - Custom render function for entire header section
 *   // @param {Object} params
 *   // @param {VNodeChild} params.defaultHeader - Default header VNode
 *   // @returns {VNodeChild} Custom header VNode
 * 
 * @property {Function} [renderBody] - Custom render function for entire body section
 *   // @param {Object} params
 *   // @param {VNodeChild} params.defaultBody - Default body VNode
 *   // @returns {VNodeChild} Custom body VNode
 * 
 * @property {Function} [renderSettings] - Custom render function for all settings sections
 *   // @param {Object} params
 *   // @param {VNodeChild} params.defaultSettings - Default settings VNode
 *   // @param {EventSettingSectionRenderInfo[]} params.sections - Array of setting section data
 *   // @returns {VNodeChild} Custom settings VNode
 * 
 * @property {Function} [renderSettingSection] - Custom render function for individual setting section
 *   // @param {RenderSettingSectionParams} params - Section render parameters
 *   // @returns {VNodeChild} Custom section VNode
 *   // @example
 *   ```ts
 *   ({ defaultSection, section, onChange }) => {
 *     return h('div', { style: { marginBottom: '15px' } }, [
 *       h('label', { style: { fontWeight: 'bold' } }, section.label),
 *       h('select', {
 *         value: section.value,
 *         onChange: (e) => onChange(e.target.value)
 *       }, section.options.map(opt => h('option', { value: opt.value }, opt.label)))
 *     ]);
 *   }
 *   ```
 * 
 * @property {Function} [renderSeparator] - Custom render function for separator between settings
 *   // @param {Object} params
 *   // @param {VNodeChild} params.defaultSeparator - Default separator VNode
 *   // @param {number} params.index - Section index
 *   // @returns {VNodeChild} Custom separator VNode
 * 
 * @property {Function} [renderFooter] - Custom render function for entire footer section
 *   // @param {Object} params
 *   // @param {VNodeChild} params.defaultFooter - Default footer VNode
 *   // @returns {VNodeChild} Custom footer VNode
 * 
 * @property {Function} [renderContent] - Custom render function for entire modal content
 *   // @param {Object} params
 *   // @param {VNodeChild} params.defaultContent - Default content VNode
 *   // @returns {VNodeChild} Custom content VNode
 */
export interface EventSettingsModalProps {
  isEventSettingsModalVisible: boolean;
  onEventSettingsClose: () => void;
  onModifyEventSettings?: (options: ModifySettingsOptions) => Promise<void>;
  position?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  backgroundColor?: string;
  audioSetting: string;
  videoSetting: string;
  screenshareSetting: string;
  chatSetting: string;
  updateAudioSetting: (setting: string) => void;
  updateVideoSetting: (setting: string) => void;
  updateScreenshareSetting: (setting: string) => void;
  updateChatSetting: (setting: string) => void;
  updateIsSettingsModalVisible: (isVisible: boolean) => void;
  roomName: string;
  socket: Socket;
  showAlert?: ShowAlert;
  title?: VNodeChild | string | number;
  overlayProps?: HTMLAttributes;
  contentProps?: HTMLAttributes;
  headerProps?: HTMLAttributes;
  titleProps?: HTMLAttributes;
  closeButtonProps?: ButtonHTMLAttributes;
  closeIconComponent?: VNodeChild;
  headerDividerProps?: HTMLAttributes;
  bodyProps?: HTMLAttributes;
  settingFieldProps?: HTMLAttributes;
  audioFieldProps?: HTMLAttributes;
  videoFieldProps?: HTMLAttributes;
  screenshareFieldProps?: HTMLAttributes;
  chatFieldProps?: HTMLAttributes;
  settingLabelProps?: LabelHTMLAttributes;
  audioLabelProps?: LabelHTMLAttributes;
  videoLabelProps?: LabelHTMLAttributes;
  screenshareLabelProps?: LabelHTMLAttributes;
  chatLabelProps?: LabelHTMLAttributes;
  settingSelectProps?: SelectHTMLAttributes;
  audioSelectProps?: SelectHTMLAttributes;
  videoSelectProps?: SelectHTMLAttributes;
  screenshareSelectProps?: SelectHTMLAttributes;
  chatSelectProps?: SelectHTMLAttributes;
  separatorProps?: HTMLAttributes;
  footerProps?: HTMLAttributes;
  saveButtonProps?: ButtonHTMLAttributes;
  saveButtonLabel?: VNodeChild | string | number;
  audioLabel?: VNodeChild | string | number;
  videoLabel?: VNodeChild | string | number;
  screenshareLabel?: VNodeChild | string | number;
  chatLabel?: VNodeChild | string | number;
  disallowOptionLabel?: VNodeChild | string | number;
  allowOptionLabel?: VNodeChild | string | number;
  approvalOptionLabel?: VNodeChild | string | number;
  chatDisallowOptionLabel?: VNodeChild | string | number;
  chatAllowOptionLabel?: VNodeChild | string | number;
  audioOptions?: EventSettingOption[];
  videoOptions?: EventSettingOption[];
  screenshareOptions?: EventSettingOption[];
  chatOptions?: EventSettingOption[];
  renderHeader?: (params: { defaultHeader: VNodeChild }) => VNodeChild;
  renderBody?: (params: { defaultBody: VNodeChild }) => VNodeChild;
  renderSettings?: (params: {
    defaultSettings: VNodeChild;
    sections: EventSettingSectionRenderInfo[];
  }) => VNodeChild;
  renderSettingSection?: (params: RenderSettingSectionParams) => VNodeChild;
  renderSeparator?: (params: {
    defaultSeparator: VNodeChild;
    index: number;
  }) => VNodeChild;
  renderFooter?: (params: { defaultFooter: VNodeChild }) => VNodeChild;
  renderContent?: (params: { defaultContent: VNodeChild }) => VNodeChild;
}

const props = withDefaults(defineProps<EventSettingsModalProps>(), {
  onModifyEventSettings: modifySettings,
  position: 'topRight',
  backgroundColor: '#83c0e9',
  title: 'Event Settings',
  saveButtonLabel: 'Save',
  audioLabel: 'User audio:',
  videoLabel: 'User video:',
  screenshareLabel: 'User screenshare:',
  chatLabel: 'User chat:',
  disallowOptionLabel: 'Disallow',
  allowOptionLabel: 'Allow',
  approvalOptionLabel: 'Upon approval',
  chatDisallowOptionLabel: 'Disallow',
  chatAllowOptionLabel: 'Allow',
  overlayProps: undefined,
  contentProps: undefined,
  headerProps: undefined,
  titleProps: undefined,
  closeButtonProps: undefined,
  closeIconComponent: undefined,
  headerDividerProps: undefined,
  bodyProps: undefined,
  settingFieldProps: undefined,
  audioFieldProps: undefined,
  videoFieldProps: undefined,
  screenshareFieldProps: undefined,
  chatFieldProps: undefined,
  settingLabelProps: undefined,
  audioLabelProps: undefined,
  videoLabelProps: undefined,
  screenshareLabelProps: undefined,
  chatLabelProps: undefined,
  settingSelectProps: undefined,
  audioSelectProps: undefined,
  videoSelectProps: undefined,
  screenshareSelectProps: undefined,
  chatSelectProps: undefined,
  separatorProps: undefined,
  footerProps: undefined,
  saveButtonProps: undefined,
  audioOptions: undefined,
  videoOptions: undefined,
  screenshareOptions: undefined,
  chatOptions: undefined,
  renderHeader: undefined,
  renderBody: undefined,
  renderSettings: undefined,
  renderSettingSection: undefined,
  renderSeparator: undefined,
  renderFooter: undefined,
  renderContent: undefined,
  showAlert: undefined,
});

const audioState = ref(props.audioSetting);
const videoState = ref(props.videoSetting);
const screenshareState = ref(props.screenshareSetting);
const chatState = ref(props.chatSetting);

watch(
  () => props.isEventSettingsModalVisible,
  (newValue) => {
    if (newValue) {
      audioState.value = props.audioSetting;
      videoState.value = props.videoSetting;
      screenshareState.value = props.screenshareSetting;
      chatState.value = props.chatSetting;
    }
  }
);

const closeModal = () => {
  props.onEventSettingsClose();
};

const handleSaveSettings = async () => {
  await props.onModifyEventSettings({
    audioSet: audioState.value,
    videoSet: videoState.value,
    screenshareSet: screenshareState.value,
    chatSet: chatState.value,
    updateAudioSetting: props.updateAudioSetting,
    updateVideoSetting: props.updateVideoSetting,
    updateScreenshareSetting: props.updateScreenshareSetting,
    updateChatSetting: props.updateChatSetting,
    updateIsSettingsModalVisible: props.updateIsSettingsModalVisible,
    roomName: props.roomName,
    socket: props.socket as Socket,
    showAlert: props.showAlert,
  });
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
const defaultOverlayWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.8, 350) : 320

const overlayStyle = computed((): CSSProperties => ({
  position: 'fixed' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: props.isEventSettingsModalVisible ? 'block' : 'none',
  zIndex: 999,
  ...(props.overlayProps?.style as CSSProperties || {})
}))

const overlayClassName = computed(() => 
  joinClassNames(['mediasfu-event-modal', props.overlayProps?.class as string])
)

const contentStyle = computed((): CSSProperties => ({
  position: 'fixed' as const,
  backgroundColor: props.backgroundColor,
  borderRadius: '10px',
  padding: '16px',
  width: `${defaultOverlayWidth}px`,
  maxHeight: '65%',
  overflow: 'hidden' as const,
  top: props.position.includes('top') ? '10px' : 'auto',
  bottom: props.position.includes('bottom') ? '10px' : 'auto',
  left: props.position.includes('Left') ? '10px' : 'auto',
  right: props.position.includes('Right') ? '10px' : 'auto',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '16px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
  ...(props.contentProps?.style as CSSProperties || {})
}))

const contentClassName = computed(() => 
  joinClassNames(['mediasfu-event-modal__content', props.contentProps?.class as string])
)

// Main overlay node
const overlayNode = computed(() => {
  const defaultCloseIcon = props.closeIconComponent ?? h(FontAwesomeIcon, { icon: faTimes, size: 'xl' })
  
  const defaultTitleNode = h('div', {
    class: joinClassNames(['modal-title', props.titleProps?.class as string]),
    style: {
      margin: 0,
      fontSize: '1.25rem',
      fontWeight: 'bold',
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
      gap: '12px',
      ...(props.headerProps?.style as CSSProperties || {})
    },
    ...(props.headerProps ? Object.fromEntries(
      Object.entries(props.headerProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    defaultTitleNode,
    h('button', {
      class: joinClassNames(['btn-close-settings', props.closeButtonProps?.class as string]),
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
          closeModal()
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
    class: joinClassNames(['hr', props.headerDividerProps?.class as string]),
    style: {
      height: '1px',
      backgroundColor: 'black',
      border: 'none',
      ...(props.headerDividerProps?.style as CSSProperties || {})
    },
    ...(props.headerDividerProps ? Object.fromEntries(
      Object.entries(props.headerDividerProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  })
  
  // Build default options
  const defaultAudioOptions: EventSettingOption[] = props.audioOptions ?? [
    { value: 'disallow', label: props.disallowOptionLabel || 'Disallow' },
    { value: 'allow', label: props.allowOptionLabel || 'Allow' },
    { value: 'approval', label: props.approvalOptionLabel || 'Upon approval' }
  ]
  
  const defaultVideoOptions: EventSettingOption[] = props.videoOptions ?? [
    { value: 'disallow', label: props.disallowOptionLabel || 'Disallow' },
    { value: 'allow', label: props.allowOptionLabel || 'Allow' },
    { value: 'approval', label: props.approvalOptionLabel || 'Upon approval' }
  ]
  
  const defaultScreenshareOptions: EventSettingOption[] = props.screenshareOptions ?? [
    { value: 'disallow', label: props.disallowOptionLabel || 'Disallow' },
    { value: 'allow', label: props.allowOptionLabel || 'Allow' },
    { value: 'approval', label: props.approvalOptionLabel || 'Upon approval' }
  ]
  
  const defaultChatOptions: EventSettingOption[] = props.chatOptions ?? [
    { value: 'disallow', label: props.chatDisallowOptionLabel || 'Disallow' },
    { value: 'allow', label: props.chatAllowOptionLabel || 'Allow' }
  ]
  
  const sections: EventSettingSectionRenderInfo[] = [
    {
      key: 'audio',
      label: props.audioLabel || 'User audio:',
      value: audioState.value,
      options: defaultAudioOptions
    },
    {
      key: 'video',
      label: props.videoLabel || 'User video:',
      value: videoState.value,
      options: defaultVideoOptions
    },
    {
      key: 'screenshare',
      label: props.screenshareLabel || 'User screenshare:',
      value: screenshareState.value,
      options: defaultScreenshareOptions
    },
    {
      key: 'chat',
      label: props.chatLabel || 'User chat:',
      value: chatState.value,
      options: defaultChatOptions
    }
  ]
  
  const createSettingSection = (section: EventSettingSectionRenderInfo, index: number) => {
    const onChange = (value: string) => {
      if (section.key === 'audio') audioState.value = value
      else if (section.key === 'video') videoState.value = value
      else if (section.key === 'screenshare') screenshareState.value = value
      else if (section.key === 'chat') chatState.value = value
    }
    
    const fieldPropsMap: Record<string, HTMLAttributes | undefined> = {
      audio: props.audioFieldProps,
      video: props.videoFieldProps,
      screenshare: props.screenshareFieldProps,
      chat: props.chatFieldProps
    }
    
    const labelPropsMap: Record<string, LabelHTMLAttributes | undefined> = {
      audio: props.audioLabelProps,
      video: props.videoLabelProps,
      screenshare: props.screenshareLabelProps,
      chat: props.chatLabelProps
    }
    
    const selectPropsMap: Record<string, SelectHTMLAttributes | undefined> = {
      audio: props.audioSelectProps,
      video: props.videoSelectProps,
      screenshare: props.screenshareSelectProps,
      chat: props.chatSelectProps
    }
    
    const fieldProps = fieldPropsMap[section.key] || props.settingFieldProps
    const labelProps = labelPropsMap[section.key] || props.settingLabelProps
    const selectProps = selectPropsMap[section.key] || props.settingSelectProps
    
    const defaultSelect = h('select', {
      class: joinClassNames(['picker-select', selectProps?.class as string]),
      style: { ...(selectProps?.style as CSSProperties || {}) },
      value: section.value,
      onChange: (event: Event) => {
        if (selectProps?.onChange) {
          (selectProps.onChange as (event: Event) => void)(event)
        }
        if (!event.defaultPrevented) {
          onChange((event.target as HTMLSelectElement).value)
        }
      },
      ...(selectProps ? Object.fromEntries(
        Object.entries(selectProps).filter(([key]) => !['class', 'style', 'value', 'onChange'].includes(key))
      ) : {})
    }, section.options.map(opt => 
      h('option', { value: opt.value }, 
        typeof opt.label === 'string' || typeof opt.label === 'number' ? [opt.label] : (opt.label || [])
      )
    ))
    
    const defaultSection = h('div', {
      class: joinClassNames(['form-group', fieldProps?.class as string]),
      style: { ...(fieldProps?.style as CSSProperties || {}) },
      ...(fieldProps ? Object.fromEntries(
        Object.entries(fieldProps).filter(([key]) => !['class', 'style'].includes(key))
      ) : {})
    }, [
      h('label', {
        class: joinClassNames(['label', labelProps?.class as string]),
        style: { ...(labelProps?.style as CSSProperties || {}) },
        ...(labelProps ? Object.fromEntries(
          Object.entries(labelProps).filter(([key]) => !['class', 'style'].includes(key))
        ) : {})
      }, typeof section.label === 'string' || typeof section.label === 'number' ? [section.label] : (section.label || [])),
      defaultSelect
    ])
    
    return props.renderSettingSection
      ? props.renderSettingSection({ defaultSection, defaultSelect, section, index, onChange })
      : defaultSection
  }
  
  const settingSections = sections.map((section, index) => {
    const sectionNode = createSettingSection(section, index)
    
    if (index < sections.length - 1) {
      const defaultSeparator = h('div', {
        class: joinClassNames(['sep', props.separatorProps?.class as string]),
        style: { ...(props.separatorProps?.style as CSSProperties || {}) },
        ...(props.separatorProps ? Object.fromEntries(
          Object.entries(props.separatorProps).filter(([key]) => !['class', 'style'].includes(key))
        ) : {})
      })
      
      const separator = props.renderSeparator
        ? props.renderSeparator({ defaultSeparator, index })
        : defaultSeparator
      
      return [sectionNode, separator]
    }
    
    return sectionNode
  }).flat()
  
  const defaultSettingsNode = h('div', {
    class: 'settings-wrapper'
  }, settingSections)
  
  const settingsNode = props.renderSettings
    ? props.renderSettings({ defaultSettings: defaultSettingsNode, sections })
    : defaultSettingsNode
  
  const defaultBodyNode = h('div', {
    class: joinClassNames(['modal-body', props.bodyProps?.class as string]),
    style: {
      overflowY: 'auto' as const,
      flex: 1,
      ...(props.bodyProps?.style as CSSProperties || {})
    },
    ...(props.bodyProps ? Object.fromEntries(
      Object.entries(props.bodyProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [settingsNode])
  
  const bodyNode = props.renderBody
    ? props.renderBody({ defaultBody: defaultBodyNode })
    : defaultBodyNode
  
  const defaultFooterNode = h('div', {
    class: joinClassNames(['modal-footer', props.footerProps?.class as string]),
    style: { ...(props.footerProps?.style as CSSProperties || {}) },
    ...(props.footerProps ? Object.fromEntries(
      Object.entries(props.footerProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    h('button', {
      class: joinClassNames(['btn-apply-settings', props.saveButtonProps?.class as string]),
      style: { ...(props.saveButtonProps?.style as CSSProperties || {}) },
      onClick: (event: MouseEvent) => {
        if (props.saveButtonProps?.onClick) {
          (props.saveButtonProps.onClick as (event: MouseEvent) => void)(event)
        }
        if (!event.defaultPrevented) {
          handleSaveSettings()
        }
      },
      ...(props.saveButtonProps ? Object.fromEntries(
        Object.entries(props.saveButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
      ) : {})
    }, typeof props.saveButtonLabel === 'string' || typeof props.saveButtonLabel === 'number' 
      ? [props.saveButtonLabel] 
      : (props.saveButtonLabel || []))
  ])
  
  const footerNode = props.renderFooter
    ? props.renderFooter({ defaultFooter: defaultFooterNode })
    : defaultFooterNode
  
  const defaultContentNode = h('div', {
    class: contentClassName.value,
    style: contentStyle.value,
    ...(props.contentProps ? Object.fromEntries(
      Object.entries(props.contentProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    headerNode,
    dividerNode,
    bodyNode,
    footerNode
  ])
  
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
@import '@legacy/components/eventSettingsComponents/EventSettingsModal.css';
</style>
