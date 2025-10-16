<!--
 * RecordingModal - Event recording configuration and control modal
 *
 * @fileoverview
 * A comprehensive modal for configuring and controlling event recording. Provides
 * two-panel interface (Standard/Advanced) with extensive recording options including
 * video quality, display type, branding, HLS streaming, and more. Handles both
 * recording initiation and ongoing recording management.
 *
 * @component RecordingModal
 * @module components/recordingComponents/RecordingModal
 *
 * @description
 * This modal provides complete recording configuration with:
 * - Two-panel interface: Standard (basic options) and Advanced (detailed settings)
 * - Video quality settings (SD, HD, FHD)
 * - Display type (video-only, media, all participants)
 * - Recording orientation (landscape, portrait, all)
 * - Background color customization
 * - Name tags toggle and color
 * - Custom text overlay with positioning and color
 * - Media/audio/video participant options
 * - HLS streaming support
 * - Confirm configuration before starting
 * - Start/Stop recording controls
 * - Pause/Resume capability indicator
 * - Event-type-specific options
 *
 * @example
 * // Basic recording modal
 * // <RecordingModal
 *   // :is-recording-modal-visible="showRecordingModal"
 *   // :on-close="() => setShowRecordingModal(false)"
 *   // :start-recording="startRecording"
 *   // :confirm-recording="confirmRecording"
 *   // :parameters="{
 *     recordPaused,
 *     recordingVideoType,
 *     recordingDisplayType,
 *     recordingBackgroundColor,
 *     recordingNameTagsColor,
 *     recordingOrientationVideo,
 *     recordingNameTags,
 *     recordingAddText,
 *     recordingCustomText,
 *     recordingCustomTextPosition,
 *     recordingCustomTextColor,
 *     recordingMediaOptions,
 *     recordingAudioOptions,
 *     recordingVideoOptions,
 *     recordingAddHLS,
 *     eventType,
 *     updateRecordingVideoType,
 *     updateRecordingDisplayType,
 *     // ... other update functions
 *     getUpdatedAllParams
 *   }"
 * // />
 *
 * @example
 * // Custom positioning and styling
 * // <RecordingModal
 *   // :is-recording-modal-visible="showRecording"
 *   // :on-close="closeRecording"
 *   // :start-recording="startRecording"
 *   // :confirm-recording="confirmRecording"
 *   // :parameters="recordingParams"
 *   // position="topRight"
 *   // background-color="#1a1a1a"
 *   // title="Recording Configuration"
 * // />
 *
 * @example
 * // Custom button labels
 * // <RecordingModal
 *   // :is-recording-modal-visible="showRecording"
 *   // :on-close="closeRecording"
 *   // :start-recording="startRecording"
 *   // :confirm-recording="confirmRecording"
 *   // :parameters="params"
 *   // confirm-button-label="Save Settings"
 *   // :start-button-label="h('span', ['Begin Recording ', h('i', { class: 'fa fa-circle' })])"
 * // />
 *
 * @example
 * // Custom render functions for actions
 * // <RecordingModal
 *   // :is-recording-modal-visible="showRecording"
 *   // :on-close="closeRecording"
 *   // :start-recording="startRecording"
 *   // :confirm-recording="confirmRecording"
 *   // :parameters="params"
 *   // :render-actions="(options) => {
 *     const { recordPaused, handleConfirm, handleStart } = options;
 *     return h('div', { class: 'custom-actions' }, [
 *       h('button', { onClick: handleConfirm, class: 'btn-primary' }, 'Apply'),
 *       h('button', { 
 *         onClick: handleStart, 
 *         class: recordPaused ? 'btn-resume' : 'btn-start',
 *         disabled: !canStartRecording
 *       }, recordPaused ? 'Resume' : 'Start')
 *     ]);
 *   }"
 * // />
 *
 * @example
 * // Custom panels renderer
 * // <RecordingModal
 *   // :is-recording-modal-visible="showRecording"
 *   // :on-close="closeRecording"
 *   // :start-recording="startRecording"
 *   // :confirm-recording="confirmRecording"
 *   // :parameters="params"
 *   // :render-panels="(options) => {
 *     const { parameters } = options;
 *     return h('div', { class: 'custom-panels' }, [
 *       h(CustomStandardPanel, { parameters }),
 *       h(CustomAdvancedPanel, { parameters })
 *     ]);
 *   }"
 * // />
-->
<template>
  <RenderVNode :node="overlayNode" />
</template>

<script setup lang="ts">
import { computed, h, isVNode, defineComponent, type CSSProperties, type PropType, type VNodeChild, type HTMLAttributes, type ButtonHTMLAttributes } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import StandardPanelComponent from './StandardPanelComponent.vue'
import AdvancedPanelComponent from './AdvancedPanelComponent.vue'
import type { EventType } from '../../../../SharedTypes'
import type {
  ConfirmRecordingType,
  ConfirmRecordingParameters
} from 'mediasfu-shared'
import type {
  StartRecordingType,
  StartRecordingParameters
} from 'mediasfu-shared'

/**
 * Parameters required by RecordingModal for recording configuration
 * 
 * @interface RecordingModalParameters
 * @extends ConfirmRecordingParameters
 * @extends StartRecordingParameters
 * @property {boolean} recordPaused - Whether recording is currently paused
 * @property {string} recordingVideoType - Video quality ('SD', 'HD', 'FHD')
 * @property {'video' | 'media' | 'all'} recordingDisplayType - Which participants to record
 * @property {string} recordingBackgroundColor - Background color for recording canvas
 * @property {string} recordingNameTagsColor - Color for participant name tags
 * @property {string} recordingOrientationVideo - Video orientation ('landscape', 'portrait', 'all')
 * @property {boolean} recordingNameTags - Whether to show participant name tags
 * @property {boolean} recordingAddText - Whether to add custom text overlay
 * @property {string} recordingCustomText - Custom text content for overlay
 * @property {string} recordingCustomTextPosition - Position of custom text ('top', 'middle', 'bottom')
 * @property {string} recordingCustomTextColor - Color of custom text
 * @property {string} recordingMediaOptions - Media participants recording option
 * @property {string} recordingAudioOptions - Audio-only participants recording option
 * @property {string} recordingVideoOptions - Video participants recording option
 * @property {boolean} recordingAddHLS - Whether to enable HLS streaming
 * @property {EventType} eventType - Type of event being recorded
 * @property {(value: string) => void} updateRecordingVideoType - Function to update video quality
 * @property {(value: 'video' | 'media' | 'all') => void} updateRecordingDisplayType - Function to update display type
 * @property {(value: string) => void} updateRecordingBackgroundColor - Function to update background color
 * @property {(value: string) => void} updateRecordingNameTagsColor - Function to update name tag color
 * @property {(value: string) => void} updateRecordingOrientationVideo - Function to update orientation
 * @property {(value: boolean) => void} updateRecordingNameTags - Function to toggle name tags
 * @property {(value: boolean) => void} updateRecordingAddText - Function to toggle custom text
 * @property {(value: string) => void} updateRecordingCustomText - Function to update custom text content
 * @property {(value: string) => void} updateRecordingCustomTextPosition - Function to update text position
 * @property {(value: string) => void} updateRecordingCustomTextColor - Function to update text color
 * @property {(value: string) => void} updateRecordingMediaOptions - Function to update media options
 * @property {(value: string) => void} updateRecordingAudioOptions - Function to update audio options
 * @property {(value: string) => void} updateRecordingVideoOptions - Function to update video options
 * @property {(value: boolean) => void} updateRecordingAddHLS - Function to toggle HLS streaming
 * @property {() => RecordingModalParameters} getUpdatedAllParams - Function to get fresh parameter state
 * @property {unknown} [key] - Additional dynamic parameters
 */
export interface RecordingModalParameters
  extends ConfirmRecordingParameters,
    StartRecordingParameters {
  recordPaused: boolean
  recordingVideoType: string
  recordingDisplayType: 'video' | 'media' | 'all'
  recordingBackgroundColor: string
  recordingNameTagsColor: string
  recordingOrientationVideo: string
  recordingNameTags: boolean
  recordingAddText: boolean
  recordingCustomText: string
  recordingCustomTextPosition: string
  recordingCustomTextColor: string
  recordingMediaOptions: string
  recordingAudioOptions: string
  recordingVideoOptions: string
  recordingAddHLS: boolean
  eventType: EventType
  updateRecordingVideoType: (value: string) => void
  updateRecordingDisplayType: (value: 'video' | 'media' | 'all') => void
  updateRecordingBackgroundColor: (value: string) => void
  updateRecordingNameTagsColor: (value: string) => void
  updateRecordingOrientationVideo: (value: string) => void
  updateRecordingNameTags: (value: boolean) => void
  updateRecordingAddText: (value: boolean) => void
  updateRecordingCustomText: (value: string) => void
  updateRecordingCustomTextPosition: (value: string) => void
  updateRecordingCustomTextColor: (value: string) => void
  updateRecordingMediaOptions: (value: string) => void
  updateRecordingAudioOptions: (value: string) => void
  updateRecordingVideoOptions: (value: string) => void
  updateRecordingAddHLS: (value: boolean) => void

  // mediasfu functions
  getUpdatedAllParams: () => RecordingModalParameters
  [key: string]: unknown
}

/**
 * RecordingModal props interface
 * 
 * @interface RecordingModalProps
 * @property {boolean} isRecordingModalVisible - Whether modal is visible
 * @property {() => void} onClose - Function to close the modal
 * @property {string} [backgroundColor='#83c0e9'] - Modal background color
 * @default '#83c0e9'
 * @property {string} [position='bottomRight'] - Modal position ('topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft')
 * @default 'bottomRight'
 * @property {ConfirmRecordingType} confirmRecording - Function to confirm recording settings
 * @property {StartRecordingType} startRecording - Function to start/resume recording
 * @property {RecordingModalParameters} parameters - All required parameters for recording configuration
 * @property {VNodeChild} [title='Recording Settings'] - Modal title text or VNode
 * @default 'Recording Settings'
 * @property {HTMLAttributes} [overlayProps] - HTML attributes for overlay backdrop
 * @property {HTMLAttributes} [contentProps] - HTML attributes for modal content container
 * @property {HTMLAttributes} [headerProps] - HTML attributes for header section
 * @property {HTMLAttributes} [titleProps] - HTML attributes for title element
 * @property {ButtonHTMLAttributes} [closeButtonProps] - HTML attributes for close button
 * @property {VNodeChild} [closeIconComponent] - Custom close icon component
 * @property {HTMLAttributes} [headerDividerProps] - HTML attributes for header divider
 * @property {HTMLAttributes} [bodyProps] - HTML attributes for modal body
 * @property {HTMLAttributes} [panelsWrapperProps] - HTML attributes for panels wrapper
 * @property {HTMLAttributes} [panelsScrollProps] - HTML attributes for scrollable panels container
 * @property {HTMLAttributes} [panelsContainerProps] - HTML attributes for panels inner container
 * @property {HTMLAttributes} [panelsActionsDividerProps] - HTML attributes for divider between panels and actions
 * @property {HTMLAttributes} [actionsWrapperProps] - HTML attributes for actions section wrapper
 * @property {ButtonHTMLAttributes} [confirmButtonProps] - HTML attributes for confirm button
 * @property {ButtonHTMLAttributes} [startButtonProps] - HTML attributes for start/resume button
 * @property {VNodeChild} [confirmButtonLabel='Confirm'] - Confirm button label
 * @default 'Confirm'
 * @property {VNodeChild} [startButtonLabel] - Start/Resume button label (includes play icon)
 * @property {(options: HeaderRenderOptions) => VNodeChild} [renderHeader] - Custom header renderer
 * @property {(options: PanelsRenderOptions) => VNodeChild} [renderPanels] - Custom panels renderer
 * @example
 * ```typescript
 * renderPanels: ({ parameters }) => {
 *   // return h('div', {}, [
 *     h(CustomStandardPanel, { parameters }),
 *     h(CustomAdvancedPanel, { parameters })
 *   ]);
 * }
 * ```
 * @property {(options: ActionsRenderOptions) => VNodeChild} [renderActions] - Custom actions renderer
 * @example
 * ```typescript
 * renderActions: ({ recordPaused, handleConfirm, handleStart }) => {
 *   // return h('div', { class: 'actions' }, [
 *     h('button', { onClick: handleConfirm }, 'Save'),
 *     h('button', { onClick: handleStart }, recordPaused ? 'Resume' : 'Start')
 *   ]);
 * }
 * ```
 * @property {(options: BodyRenderOptions) => VNodeChild} [renderBody] - Custom body renderer
 * @property {(options: ContentRenderOptions) => VNodeChild} [renderContent] - Custom content renderer
 */
export interface RecordingModalProps {
  isRecordingModalVisible: boolean
  onClose: () => void
  backgroundColor?: string
  position?: string
  confirmRecording: ConfirmRecordingType
  startRecording: StartRecordingType
  parameters: RecordingModalParameters
  
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
  panelsWrapperProps?: HTMLAttributes
  panelsScrollProps?: HTMLAttributes
  panelsContainerProps?: HTMLAttributes
  panelsActionsDividerProps?: HTMLAttributes
  actionsWrapperProps?: HTMLAttributes
  confirmButtonProps?: ButtonHTMLAttributes
  startButtonProps?: ButtonHTMLAttributes
  confirmButtonLabel?: VNodeChild
  startButtonLabel?: VNodeChild
  renderHeader?: (options: {
    defaultHeader: VNodeChild
    onClose: () => void
  }) => VNodeChild
  renderPanels?: (options: {
    defaultPanels: VNodeChild
    parameters: RecordingModalParameters
  }) => VNodeChild
  renderActions?: (options: {
    defaultActions: VNodeChild
    recordPaused: boolean
    handleConfirm: () => void
    handleStart: () => void
  }) => VNodeChild
  renderBody?: (options: { defaultBody: VNodeChild }) => VNodeChild
  renderContent?: (options: { defaultContent: VNodeChild }) => VNodeChild
}

const props = withDefaults(defineProps<RecordingModalProps>(), {
  backgroundColor: '#83c0e9',
  position: 'bottomRight',
  title: () => 'Recording Settings',
  confirmButtonLabel: () => 'Confirm',
  startButtonLabel: () => h('span', [
    'Start ',
    h('i', { class: 'fas fa-play' })
  ]),
  overlayProps: undefined,
  contentProps: undefined,
  headerProps: undefined,
  titleProps: undefined,
  closeButtonProps: undefined,
  closeIconComponent: undefined,
  headerDividerProps: undefined,
  bodyProps: undefined,
  panelsWrapperProps: undefined,
  panelsScrollProps: undefined,
  panelsContainerProps: undefined,
  panelsActionsDividerProps: undefined,
  actionsWrapperProps: undefined,
  confirmButtonProps: undefined,
  startButtonProps: undefined,
  renderHeader: undefined,
  renderPanels: undefined,
  renderActions: undefined,
  renderBody: undefined,
  renderContent: undefined
})

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

// Computed properties
const recordPaused = computed(() => props.parameters.recordPaused)

const defaultOverlayWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.8, 350) : 320

// Overlay styles
const overlayStyle = computed((): CSSProperties => ({
  position: 'fixed' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: props.isRecordingModalVisible ? 'block' : 'none',
  zIndex: 999,
  ...(props.overlayProps?.style as CSSProperties || {})
}))

const overlayClassName = computed(() => 
  joinClassNames(['mediasfu-recording-modal', props.overlayProps?.class as string])
)

// Content styles
const contentStyle = computed((): CSSProperties => ({
  position: 'fixed' as const,
  backgroundColor: props.backgroundColor,
  borderRadius: '10px',
  padding: '16px',
  width: `${defaultOverlayWidth}px`,
  maxHeight: '85%',
  overflow: 'hidden' as const,
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
  joinClassNames(['mediasfu-recording-modal__content', props.contentProps?.class as string])
)

// Header styles
const headerStyle = computed((): CSSProperties => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  ...(props.headerProps?.style as CSSProperties || {})
}))

const headerClassName = computed(() => 
  joinClassNames(['modal-header', props.headerProps?.class as string])
)

// Title styles
const titleStyle = computed((): CSSProperties => ({
  margin: 0,
  fontSize: '1.25rem',
  fontWeight: 700,
  color: 'black',
  ...(props.titleProps?.style as CSSProperties || {})
}))

const titleClassName = computed(() => 
  joinClassNames(['modal-title', props.titleProps?.class as string])
)

// Close button styles
const closeButtonStyle = computed((): CSSProperties => ({
  background: 'none',
  border: 'none',
  padding: '4px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'black',
  ...(props.closeButtonProps?.style as CSSProperties || {})
}))

const closeButtonClassName = computed(() => 
  joinClassNames(['btn-close-recording', props.closeButtonProps?.class as string])
)

// Header divider styles
const headerDividerStyle = computed((): CSSProperties => ({
  height: '1px',
  backgroundColor: 'black',
  marginTop: '5px',
  marginBottom: '5px',
  border: 'none',
  ...(props.headerDividerProps?.style as CSSProperties || {})
}))

// Body styles
const bodyStyle = computed((): CSSProperties => ({
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '16px',
  flex: 1,
  minHeight: 0,
  ...(props.bodyProps?.style as CSSProperties || {})
}))

const bodyClassName = computed(() => 
  joinClassNames(['modal-body', props.bodyProps?.class as string])
)

// Panels wrapper styles
const panelsWrapperStyle = computed((): CSSProperties => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column' as const,
  minHeight: 0,
  ...(props.panelsWrapperProps?.style as CSSProperties || {})
}))

const panelsWrapperClassName = computed(() => 
  joinClassNames(['recording-modal__panels-wrapper', props.panelsWrapperProps?.class as string])
)

// Panels scroll styles
const panelsScrollStyle = computed((): CSSProperties => ({
  overflowY: 'auto' as const,
  maxHeight: 'calc(100% - 120px)',
  padding: 0,
  ...(props.panelsScrollProps?.style as CSSProperties || {})
}))

const panelsScrollClassName = computed(() => 
  joinClassNames(['recording-modal__panels-scroll', props.panelsScrollProps?.class as string])
)

// Panels container styles
const panelsContainerStyle = computed((): CSSProperties => ({
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '12px',
  ...(props.panelsContainerProps?.style as CSSProperties || {})
}))

const panelsContainerClassName = computed(() => 
  joinClassNames(['recording-modal__panels', props.panelsContainerProps?.class as string])
)

// Panels/Actions divider styles
const panelsActionsDividerStyle = computed((): CSSProperties => ({
  height: '1px',
  backgroundColor: 'white',
  marginTop: 0,
  marginBottom: 0,
  ...(props.panelsActionsDividerProps?.style as CSSProperties || {})
}))

const panelsActionsDividerClassName = computed(() => 
  joinClassNames(['recording-modal__divider', props.panelsActionsDividerProps?.class as string])
)

// Actions wrapper styles
const actionsWrapperStyle = computed((): CSSProperties => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '20px',
  gap: '16px',
  flexWrap: 'wrap' as const,
  ...(props.actionsWrapperProps?.style as CSSProperties || {})
}))

const actionsWrapperClassName = computed(() => 
  joinClassNames(['recording-modal__actions', props.actionsWrapperProps?.class as string])
)

// Confirm button styles
const confirmButtonStyle = computed((): CSSProperties => ({
  flex: 1,
  padding: '8px',
  borderRadius: '5px',
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 10px',
  background: '#4CAF50',
  cursor: 'pointer',
  border: 'none',
  color: 'black',
  fontSize: '14px',
  ...(props.confirmButtonProps?.style as CSSProperties || {})
}))

const confirmButtonClassName = computed(() => 
  joinClassNames(['recording-modal__confirm', props.confirmButtonProps?.class as string])
)

// Start button styles
const startButtonStyle = computed((): CSSProperties => ({
  flex: 1,
  padding: '8px',
  borderRadius: '5px',
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 10px',
  background: '#f44336',
  cursor: 'pointer',
  border: 'none',
  color: 'black',
  fontSize: '14px',
  ...(props.startButtonProps?.style as CSSProperties || {})
}))

const startButtonClassName = computed(() => 
  joinClassNames(['recording-modal__start', props.startButtonProps?.class as string])
)

// Event handlers
const handleConfirm = () => {
  props.confirmRecording({ parameters: { ...props.parameters } })
}

const handleStart = () => {
  props.startRecording({ parameters: { ...props.parameters } })
}

const handleCloseClick = (event: MouseEvent) => {
  if (props.closeButtonProps?.onClick) {
    (props.closeButtonProps.onClick as (event: MouseEvent) => void)(event)
  }
  if (!event.defaultPrevented) {
    props.onClose()
  }
}

const handleConfirmClick = (event: MouseEvent) => {
  if (props.confirmButtonProps?.onClick) {
    (props.confirmButtonProps.onClick as (event: MouseEvent) => void)(event)
  }
  if (!event.defaultPrevented) {
    handleConfirm()
  }
}

const handleStartClick = (event: MouseEvent) => {
  if (props.startButtonProps?.onClick) {
    (props.startButtonProps.onClick as (event: MouseEvent) => void)(event)
  }
  if (!event.defaultPrevented) {
    handleStart()
  }
}

// Main overlay node
const overlayNode = computed(() => {
  const defaultCloseIcon = props.closeIconComponent ?? h(FontAwesomeIcon, { icon: faTimes, class: 'icon' })
  
  const defaultHeaderNode = h('div', {
    class: headerClassName.value,
    style: headerStyle.value,
    ...(props.headerProps ? Object.fromEntries(
      Object.entries(props.headerProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    h('h2', {
      class: titleClassName.value,
      style: titleStyle.value,
      ...(props.titleProps ? Object.fromEntries(
        Object.entries(props.titleProps).filter(([key]) => !['class', 'style'].includes(key))
      ) : {})
    }, typeof props.title === 'string' || typeof props.title === 'number' ? [props.title] : (props.title || [])),
    h('button', {
      class: closeButtonClassName.value,
      style: closeButtonStyle.value,
      onClick: handleCloseClick,
      ...(props.closeButtonProps ? Object.fromEntries(
        Object.entries(props.closeButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
      ) : {})
    }, [defaultCloseIcon])
  ])
  
  const headerNode = props.renderHeader
    ? props.renderHeader({ defaultHeader: defaultHeaderNode, onClose: props.onClose })
    : defaultHeaderNode
  
  const headerDividerNode = h('hr', {
    style: headerDividerStyle.value,
    ...(props.headerDividerProps ? Object.fromEntries(
      Object.entries(props.headerDividerProps).filter(([key]) => key !== 'style')
    ) : {})
  })
  
  const defaultPanelsNode = h('div', {
    class: panelsWrapperClassName.value,
    style: panelsWrapperStyle.value,
    ...(props.panelsWrapperProps ? Object.fromEntries(
      Object.entries(props.panelsWrapperProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    h('div', {
      class: panelsScrollClassName.value,
      style: panelsScrollStyle.value,
      ...(props.panelsScrollProps ? Object.fromEntries(
        Object.entries(props.panelsScrollProps).filter(([key]) => !['class', 'style'].includes(key))
      ) : {})
    }, [
      h('div', {
        class: panelsContainerClassName.value,
        style: panelsContainerStyle.value,
        ...(props.panelsContainerProps ? Object.fromEntries(
          Object.entries(props.panelsContainerProps).filter(([key]) => !['class', 'style'].includes(key))
        ) : {})
      }, [
        h(StandardPanelComponent, { parameters: props.parameters }),
        h(AdvancedPanelComponent, { parameters: props.parameters })
      ])
    ])
  ])
  
  const panelsNode = props.renderPanels
    ? props.renderPanels({ defaultPanels: defaultPanelsNode, parameters: props.parameters })
    : defaultPanelsNode
  
  const panelsActionsDividerNode = h('div', {
    class: panelsActionsDividerClassName.value,
    style: panelsActionsDividerStyle.value,
    ...(props.panelsActionsDividerProps ? Object.fromEntries(
      Object.entries(props.panelsActionsDividerProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  })
  
  const defaultActionsNode = h('div', {
    class: actionsWrapperClassName.value,
    style: actionsWrapperStyle.value,
    ...(props.actionsWrapperProps ? Object.fromEntries(
      Object.entries(props.actionsWrapperProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    h('button', {
      class: confirmButtonClassName.value,
      style: confirmButtonStyle.value,
      onClick: handleConfirmClick,
      ...(props.confirmButtonProps ? Object.fromEntries(
        Object.entries(props.confirmButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
      ) : {})
    }, typeof props.confirmButtonLabel === 'string' || typeof props.confirmButtonLabel === 'number' ? [props.confirmButtonLabel] : (props.confirmButtonLabel || [])),
    !recordPaused.value ? h('button', {
      class: startButtonClassName.value,
      style: startButtonStyle.value,
      onClick: handleStartClick,
      ...(props.startButtonProps ? Object.fromEntries(
        Object.entries(props.startButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
      ) : {})
    }, typeof props.startButtonLabel === 'string' || typeof props.startButtonLabel === 'number' ? [props.startButtonLabel] : (props.startButtonLabel || [])) : null
  ].filter(Boolean))
  
  const actionsNode = props.renderActions
    ? props.renderActions({
        defaultActions: defaultActionsNode,
        recordPaused: recordPaused.value,
        handleConfirm,
        handleStart
      })
    : defaultActionsNode
  
  const defaultBodyNode = h('div', {
    class: bodyClassName.value,
    style: bodyStyle.value,
    ...(props.bodyProps ? Object.fromEntries(
      Object.entries(props.bodyProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    panelsNode,
    panelsActionsDividerNode,
    actionsNode
  ])
  
  const bodyNode = props.renderBody
    ? props.renderBody({ defaultBody: defaultBodyNode })
    : defaultBodyNode
  
  const defaultContentNode = h('div', {
    class: contentClassName.value,
    style: contentStyle.value,
    ...(props.contentProps ? Object.fromEntries(
      Object.entries(props.contentProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    headerNode,
    headerDividerNode,
    bodyNode
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