<!--
 * MediaSettingsModal - Media device configuration modal
 *
 * @fileoverview
 * A comprehensive media settings modal for selecting and configuring audio/video devices.
 * Provides dropdowns for camera and microphone selection, quick camera switching,
 * and virtual background access. Integrates with MediaSFU device management methods.
 *
 * @component MediaSettingsModal
 * @module components/mediaSettingsComponents/MediaSettingsModal
 *
 * @description
 * This modal provides a complete media device configuration interface with:
 * - Camera device selection dropdown (front/back/external cameras)
 * - Microphone device selection dropdown
 * - Quick switch camera button (for mobile devices)
 * - Virtual background button (opens background modal)
 * - Real-time device enumeration and updates
 * - Automatic device labeling (Camera 1, Camera 2, etc.)
 * - Permission handling and error messaging
 * - Customizable positioning (topRight, topLeft, bottomRight, bottomLeft)
 * - Fully customizable render functions for header and body
 *
 * @example
 * // Basic media settings modal
 * // <MediaSettingsModal
 *   // :is-media-settings-modal-visible="showMediaSettings"
 *   // :on-media-settings-close="() => setShowMediaSettings(false)"
 *   // :parameters="{
 *     userDefaultVideoInputDevice,
 *     videoInputs,
 *     audioInputs,
 *     userDefaultAudioInputDevice,
 *     isBackgroundModalVisible,
 *     updateIsBackgroundModalVisible,
 *     getUpdatedAllParams
 *   }"
 * // />
 *
 * @example
 * // Custom styled with position and color
 * // <MediaSettingsModal
 *   // :is-media-settings-modal-visible="showSettings"
 *   // :on-media-settings-close="closeSettings"
 *   // :parameters="settingsParams"
 *   // position="bottomLeft"
 *   // background-color="#1a1a1a"
 *   // title="Device Settings"
 * // />
 *
 * @example
 * // Custom switch handlers
 * // <MediaSettingsModal
 *   // :is-media-settings-modal-visible="showSettings"
 *   // :on-media-settings-close="closeSettings"
 *   // :parameters="params"
 *   // :switch-camera-on-press="async (options) => {
 *     // Custom camera switching logic
 *     await customSwitchCamera(options);
 *   }"
 *   // :switch-video-on-press="async (options) => {
 *     // Custom video device switching
 *     await customSwitchVideo(options);
 *   }"
 *   // :switch-audio-on-press="async (options) => {
 *     // Custom audio device switching
 *     await customSwitchAudio(options);
 *   }"
 * // />
 *
 * @example
 * // Custom render function
 * // <MediaSettingsModal
 *   // :is-media-settings-modal-visible="showSettings"
 *   // :on-media-settings-close="closeSettings"
 *   // :parameters="params"
 *   // :render-body="(options) => {
 *     const { defaultBody } = options;
 *     return h('div', { class: 'custom-settings-body' }, [
 *       h('div', { class: 'settings-hint' }, 'Select your devices:'),
 *       defaultBody
 *     ]);
 *   }"
 * // />
 *
 * @example
 * // Custom labels and icons
 * // <MediaSettingsModal
 *   // :is-media-settings-modal-visible="showSettings"
 *   // :on-media-settings-close="closeSettings"
 *   // :parameters="params"
 *   // camera-label="Video Source"
 *   // microphone-label="Audio Source"
 *   // switch-camera-button-label="Flip Camera"
 *   // virtual-background-button-label="Backgrounds"
 *   // :camera-icon-component="h(FontAwesomeIcon, { icon: faVideoCustom })"
 *   // :microphone-icon-component="h(FontAwesomeIcon, { icon: faMicrophoneCustom })"
 * // />
-->
<template>
  <RenderVNode :node="overlayNode" />
</template>

<script setup lang="ts">
import { ref, computed, watch, defineComponent, h, isVNode, type PropType, type VNodeChild, type HTMLAttributes, type ButtonHTMLAttributes, type SelectHTMLAttributes, type LabelHTMLAttributes, type StyleValue } from 'vue'
import { faTimes, faCamera, faMicrophone, faSyncAlt, faPhotoFilm } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  switchAudio,
  type SwitchAudioOptions,
  type SwitchAudioParameters,
  switchVideo,
  type SwitchVideoOptions,
  type SwitchVideoParameters,
  switchVideoAlt,
  type SwitchVideoAltOptions,
  type SwitchVideoAltParameters
} from 'mediasfu-shared'

/**
 * Parameters required by MediaSettingsModal for device management
 * 
 * @interface MediaSettingsModalParameters
 * @extends SwitchAudioParameters
 * @extends SwitchVideoParameters
 * @extends SwitchVideoAltParameters
 * @property {string} userDefaultVideoInputDevice - Currently selected video device ID
 * @property {MediaDeviceInfo[]} videoInputs - Array of available video input devices
 * @property {MediaDeviceInfo[]} audioInputs - Array of available audio input devices
 * @property {string} userDefaultAudioInputDevice - Currently selected audio device ID
 * @property {boolean} isBackgroundModalVisible - Whether background modal is open
 * @property {(visible: boolean) => void} updateIsBackgroundModalVisible - Function to toggle background modal
 * @property {() => MediaSettingsModalParameters} getUpdatedAllParams - Function to get fresh parameter state
 */
export interface MediaSettingsModalParameters
  extends SwitchAudioParameters,
    SwitchVideoParameters,
    SwitchVideoAltParameters {
  userDefaultVideoInputDevice: string
  videoInputs: MediaDeviceInfo[]
  audioInputs: MediaDeviceInfo[]
  userDefaultAudioInputDevice: string
  isBackgroundModalVisible: boolean
  updateIsBackgroundModalVisible: (visible: boolean) => void

  // mediasfu functions
  getUpdatedAllParams: () => MediaSettingsModalParameters
}

/**
 * MediaSettingsModal props interface
 * 
 * @interface MediaSettingsModalProps
 * @property {boolean} isMediaSettingsModalVisible - Whether modal is visible
 * @property {() => void} onMediaSettingsClose - Function to close the modal
 * @property {(options: SwitchVideoAltOptions) => Promise<void>} [switchCameraOnPress] - Function for quick camera switch (mobile)
 * @property {(options: SwitchVideoOptions) => Promise<void>} [switchVideoOnPress] - Function to switch video device
 * @property {(options: SwitchAudioOptions) => Promise<void>} [switchAudioOnPress] - Function to switch audio device
 * @property {MediaSettingsModalParameters} parameters - All required parameters for device operations
 * @property {'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft'} [position='topRight'] - Modal position
 * @default 'topRight'
 * @property {string} [backgroundColor='#83c0e9'] - Modal background color
 * @default '#83c0e9'
 * @property {VNodeChild} [title='Media Settings'] - Modal title text or VNode
 * @default 'Media Settings'
 * @property {HTMLAttributes} [overlayProps] - HTML attributes for overlay backdrop
 * @property {HTMLAttributes} [contentProps] - HTML attributes for modal content container
 * @property {HTMLAttributes} [headerProps] - HTML attributes for header section
 * @property {HTMLAttributes} [titleProps] - HTML attributes for title element
 * @property {ButtonHTMLAttributes} [closeButtonProps] - HTML attributes for close button
 * @property {VNodeChild} [closeIconComponent] - Custom close icon component
 * @property {HTMLAttributes} [headerDividerProps] - HTML attributes for header divider
 * @property {HTMLAttributes} [bodyProps] - HTML attributes for modal body
 * @property {HTMLAttributes} [cameraFieldProps] - HTML attributes for camera field wrapper
 * @property {LabelHTMLAttributes} [cameraLabelProps] - HTML attributes for camera label
 * @property {VNodeChild} [cameraLabel] - Custom camera label text or VNode
 * @property {VNodeChild} [cameraIconComponent] - Custom camera icon component
 * @property {SelectHTMLAttributes} [cameraSelectProps] - HTML attributes for camera select dropdown
 * @property {HTMLAttributes} [microphoneFieldProps] - HTML attributes for microphone field wrapper
 * @property {LabelHTMLAttributes} [microphoneLabelProps] - HTML attributes for microphone label
 * @property {VNodeChild} [microphoneLabel] - Custom microphone label text or VNode
 * @property {VNodeChild} [microphoneIconComponent] - Custom microphone icon component
 * @property {SelectHTMLAttributes} [microphoneSelectProps] - HTML attributes for microphone select dropdown
 * @property {ButtonHTMLAttributes} [switchCameraButtonProps] - HTML attributes for switch camera button
 * @property {VNodeChild} [switchCameraButtonLabel='Switch Camera'] - Switch camera button label
 * @default 'Switch Camera'
 * @property {VNodeChild} [switchCameraIconComponent] - Custom switch camera icon component
 * @property {HTMLAttributes} [middleDividerProps] - HTML attributes for middle divider
 * @property {ButtonHTMLAttributes} [virtualBackgroundButtonProps] - HTML attributes for virtual background button
 * @property {VNodeChild} [virtualBackgroundButtonLabel='Virtual Background'] - Virtual background button label
 * @default 'Virtual Background'
 * @property {VNodeChild} [virtualBackgroundIconComponent] - Custom virtual background icon component
 * @property {(options: HeaderRenderOptions) => VNodeChild} [renderHeader] - Custom header renderer
 * @example
 * ```typescript
 * renderHeader: ({ defaultHeader, onClose }) => {
 *   // return h('div', { class: 'custom-header' }, [
 *     h('h3', {}, 'Device Configuration'),
 *     h('button', { onClick: onClose }, '×')
 *   ]);
 * }
 * ```
 * @property {(options: BodyRenderOptions) => VNodeChild} [renderBody] - Custom body renderer
 * @example
 * ```typescript
 * renderBody: ({ defaultBody }) => {
 *   // return h('div', { class: 'custom-body' }, [
 *     h('p', {}, 'Select your devices below:'),
 *     defaultBody
 *   ]);
 * }
 * ```
 * @property {(options: ContentRenderOptions) => VNodeChild} [renderContent] - Custom content renderer
 */
export interface MediaSettingsModalProps {
  isMediaSettingsModalVisible: boolean
  onMediaSettingsClose: () => void
  switchCameraOnPress?: (options: SwitchVideoAltOptions) => Promise<void>
  switchVideoOnPress?: (options: SwitchVideoOptions) => Promise<void>
  switchAudioOnPress?: (options: SwitchAudioOptions) => Promise<void>
  parameters: MediaSettingsModalParameters
  position?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft'
  backgroundColor?: string
  // UI Override Props
  title?: VNodeChild
  overlayProps?: HTMLAttributes
  contentProps?: HTMLAttributes
  headerProps?: HTMLAttributes
  titleProps?: HTMLAttributes
  closeButtonProps?: ButtonHTMLAttributes
  closeIconComponent?: VNodeChild
  headerDividerProps?: HTMLAttributes
  bodyProps?: HTMLAttributes
  cameraFieldProps?: HTMLAttributes
  cameraLabelProps?: LabelHTMLAttributes
  cameraLabel?: VNodeChild
  cameraIconComponent?: VNodeChild
  cameraSelectProps?: SelectHTMLAttributes
  microphoneFieldProps?: HTMLAttributes
  microphoneLabelProps?: LabelHTMLAttributes
  microphoneLabel?: VNodeChild
  microphoneIconComponent?: VNodeChild
  microphoneSelectProps?: SelectHTMLAttributes
  switchCameraButtonProps?: ButtonHTMLAttributes
  switchCameraButtonLabel?: VNodeChild
  switchCameraIconComponent?: VNodeChild
  middleDividerProps?: HTMLAttributes
  virtualBackgroundButtonProps?: ButtonHTMLAttributes
  virtualBackgroundButtonLabel?: VNodeChild
  virtualBackgroundIconComponent?: VNodeChild
  renderHeader?: (options: {
    defaultHeader: VNodeChild
    onClose: () => void
  }) => VNodeChild
  renderBody?: (options: {
    defaultBody: VNodeChild
  }) => VNodeChild
  renderContent?: (options: {
    defaultContent: VNodeChild
  }) => VNodeChild
}

const props = withDefaults(defineProps<MediaSettingsModalProps>(), {
  switchCameraOnPress: undefined,
  switchVideoOnPress: undefined,
  switchAudioOnPress: undefined,
  position: 'topRight',
  backgroundColor: '#83c0e9',
  title: 'Media Settings',
  overlayProps: undefined,
  contentProps: undefined,
  headerProps: undefined,
  titleProps: undefined,
  closeButtonProps: undefined,
  closeIconComponent: undefined,
  headerDividerProps: undefined,
  bodyProps: undefined,
  cameraFieldProps: undefined,
  cameraLabelProps: undefined,
  cameraLabel: undefined,
  cameraIconComponent: undefined,
  cameraSelectProps: undefined,
  microphoneFieldProps: undefined,
  microphoneLabelProps: undefined,
  microphoneLabel: undefined,
  microphoneIconComponent: undefined,
  microphoneSelectProps: undefined,
  switchCameraButtonProps: undefined,
  switchCameraButtonLabel: 'Switch Camera',
  switchCameraIconComponent: undefined,
  middleDividerProps: undefined,
  virtualBackgroundButtonProps: undefined,
  virtualBackgroundButtonLabel: 'Virtual Background',
  virtualBackgroundIconComponent: undefined,
  renderHeader: undefined,
  renderBody: undefined,
  renderContent: undefined,
});

// Manually provide defaults for optional props
const switchCameraOnPress = computed(() => props.switchCameraOnPress ?? switchVideoAlt);
const switchVideoOnPress = computed(() => props.switchVideoOnPress ?? switchVideo);
const switchAudioOnPress = computed(() => props.switchAudioOnPress ?? switchAudio);

const videoInputs = computed(() => props.parameters.videoInputs)
const audioInputs = computed(() => props.parameters.audioInputs)

const resolveSelection = (
  preferred: string,
  inputs: MediaDeviceInfo[]
): string => {
  const match = preferred
    ? inputs.find((input) => input.deviceId === preferred)
    : undefined
  if (match) {
    return match.deviceId
  }
  const [first] = inputs
  return first ? first.deviceId : ''
}

const lastAppliedVideoInput = ref('')
const lastAppliedAudioInput = ref('')

const selectedVideoInput = ref('')
const selectedAudioInput = ref('')

const syncVideoSelection = (candidate: string) => {
  const resolved = resolveSelection(candidate || lastAppliedVideoInput.value, videoInputs.value)
  if (resolved !== selectedVideoInput.value) {
    selectedVideoInput.value = resolved
  }
  lastAppliedVideoInput.value = resolved
}

const syncAudioSelection = (candidate: string) => {
  const resolved = resolveSelection(candidate || lastAppliedAudioInput.value, audioInputs.value)
  if (resolved !== selectedAudioInput.value) {
    selectedAudioInput.value = resolved
  }
  lastAppliedAudioInput.value = resolved
}

watch(
  () => props.parameters.userDefaultVideoInputDevice,
  (preferred) => {
    syncVideoSelection(preferred ?? '')
  },
  { immediate: true }
)

watch(
  videoInputs,
  () => {
    syncVideoSelection(lastAppliedVideoInput.value || selectedVideoInput.value)
  },
  { deep: true }
)

watch(
  () => props.parameters.userDefaultAudioInputDevice,
  (preferred) => {
    syncAudioSelection(preferred ?? '')
  },
  { immediate: true }
)

watch(
  audioInputs,
  () => {
    syncAudioSelection(lastAppliedAudioInput.value || selectedAudioInput.value)
  },
  { deep: true }
)

const handleSwitchCamera = async () => {
  await switchCameraOnPress.value({ parameters: props.parameters })
}

const handleVideoSwitch = async () => {
  const value = selectedVideoInput.value
  if (!value || value === lastAppliedVideoInput.value) {
    return
  }
  await switchVideoOnPress.value({
    videoPreference: value,
    parameters: props.parameters
  })
  lastAppliedVideoInput.value = value
}

const handleAudioSwitch = async () => {
  const value = selectedAudioInput.value
  if (!value || value === lastAppliedAudioInput.value) {
    return
  }
  await switchAudioOnPress.value({
    audioPreference: value,
    parameters: props.parameters
  })
  lastAppliedAudioInput.value = value
}

const showVirtual = () => {
  props.parameters.updateIsBackgroundModalVisible(
    !props.parameters.isBackgroundModalVisible
  )
}

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

// Helper functions
const joinClassNames = (...classes: (string | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ')
}

const safeSpreadStyle = (style: StyleValue | undefined) => {
  return style && typeof style === 'object' ? style : {}
}

// Computed properties for styles
const defaultOverlayWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.8, 350) : 320

const overlayStyle = computed(() => ({
  position: 'fixed' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: props.isMediaSettingsModalVisible ? 'block' : 'none',
  zIndex: 999,
  ...safeSpreadStyle(props.overlayProps?.style)
}))

const overlayClassName = computed(() =>
  joinClassNames('mediasfu-media-settings-modal', props.overlayProps?.class as string)
)

const contentStyle = computed(() => ({
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
  gap: '12px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
  ...safeSpreadStyle(props.contentProps?.style)
}))

const contentClassName = computed(() => 
  joinClassNames('mediasfu-media-settings-modal__content', props.contentProps?.class as string)
)

// Main overlay node
const overlayNode = computed(() => {
  const defaultCloseIcon = props.closeIconComponent ?? h(FontAwesomeIcon, { icon: faTimes, size: 'xl' })
  
  const defaultTitleNode = h('div', {
    class: joinClassNames('modal-title', props.titleProps?.class as string),
    style: {
      margin: 0,
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: 'black',
      ...safeSpreadStyle(props.titleProps?.style)
    },
    ...(props.titleProps ? Object.fromEntries(
      Object.entries(props.titleProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, typeof props.title === 'string' || typeof props.title === 'number' ? [props.title] : (props.title || []))
  
  const defaultHeaderNode = h('div', {
    class: joinClassNames('modal-header', props.headerProps?.class as string),
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '12px',
      ...safeSpreadStyle(props.headerProps?.style)
    },
    ...(props.headerProps ? Object.fromEntries(
      Object.entries(props.headerProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    defaultTitleNode,
    h('button', {
      class: joinClassNames('btn-close-media-settings', props.closeButtonProps?.class as string),
      style: {
        background: 'none',
        border: 'none',
        padding: '4px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'black',
        marginLeft: 'auto',
        marginRight: '10px',
        ...safeSpreadStyle(props.closeButtonProps?.style)
      },
      onClick: (event: MouseEvent) => {
        if (props.closeButtonProps?.onClick) {
          (props.closeButtonProps.onClick as (event: MouseEvent) => void)(event)
        }
        if (!event.defaultPrevented) {
          props.onMediaSettingsClose()
        }
      },
      ...(props.closeButtonProps ? Object.fromEntries(
        Object.entries(props.closeButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
      ) : {})
    }, [defaultCloseIcon])
  ])
  
  const headerNode = props.renderHeader
    ? props.renderHeader({ defaultHeader: defaultHeaderNode, onClose: props.onMediaSettingsClose })
    : defaultHeaderNode
  
  const dividerNode = h('hr', {
    class: 'hr',
    style: {
      height: '1px',
      backgroundColor: 'black',
      marginTop: '5px',
      marginBottom: '5px',
      border: 'none',
      ...safeSpreadStyle(props.headerDividerProps?.style)
    },
    ...(props.headerDividerProps ? Object.fromEntries(
      Object.entries(props.headerDividerProps).filter(([key]) => !['style'].includes(key))
    ) : {})
  })
  
  // Camera field
  const defaultCameraIcon = props.cameraIconComponent ?? h(FontAwesomeIcon, { icon: faCamera })
  const defaultCameraLabel = props.cameraLabel ?? [defaultCameraIcon, ' Select Camera:']
  
  const cameraSelectNode = h('select', {
    class: joinClassNames('form-control', props.cameraSelectProps?.class as string),
    value: selectedVideoInput.value,
    onChange: (event: Event) => {
      const target = event.target as HTMLSelectElement | null
      if (target && target.value) {
        selectedVideoInput.value = target.value
      }
      if (props.cameraSelectProps?.onChange) {
        (props.cameraSelectProps.onChange as (event: Event) => void)(event)
      }
      if (!event.defaultPrevented) {
        handleVideoSwitch()
      }
    },
    ...(props.cameraSelectProps ? Object.fromEntries(
      Object.entries(props.cameraSelectProps).filter(([key]) => !['class', 'value', 'onChange'].includes(key))
    ) : {})
  }, videoInputs.value.map(input =>
    h('option', { value: input.deviceId, key: input.deviceId }, [input.label])
  ))
  
  const cameraFieldNode = h('div', {
    class: joinClassNames('form-group', props.cameraFieldProps?.class as string),
    style: { ...safeSpreadStyle(props.cameraFieldProps?.style) },
    ...(props.cameraFieldProps ? Object.fromEntries(
      Object.entries(props.cameraFieldProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    h('label', {
      ...(props.cameraLabelProps || {})
    }, typeof defaultCameraLabel === 'string' || typeof defaultCameraLabel === 'number' 
      ? [defaultCameraLabel] 
      : (defaultCameraLabel || [])
    ),
    cameraSelectNode
  ])
  
  // Microphone field
  const defaultMicrophoneIcon = props.microphoneIconComponent ?? h(FontAwesomeIcon, { icon: faMicrophone })
  const defaultMicrophoneLabel = props.microphoneLabel ?? [defaultMicrophoneIcon, ' Select Microphone:']
  
  const microphoneSelectNode = h('select', {
    class: joinClassNames('form-control', props.microphoneSelectProps?.class as string),
    value: selectedAudioInput.value,
    onChange: (event: Event) => {
      const target = event.target as HTMLSelectElement | null
      if (target && target.value) {
        selectedAudioInput.value = target.value
      }
      if (props.microphoneSelectProps?.onChange) {
        (props.microphoneSelectProps.onChange as (event: Event) => void)(event)
      }
      if (!event.defaultPrevented) {
        handleAudioSwitch()
      }
    },
    ...(props.microphoneSelectProps ? Object.fromEntries(
      Object.entries(props.microphoneSelectProps).filter(([key]) => !['class', 'value', 'onChange'].includes(key))
    ) : {})
  }, audioInputs.value.map(input =>
    h('option', { value: input.deviceId, key: input.deviceId }, [input.label])
  ))
  
  const microphoneFieldNode = h('div', {
    class: joinClassNames('form-group', props.microphoneFieldProps?.class as string),
    style: {
      marginTop: '10px',
      ...safeSpreadStyle(props.microphoneFieldProps?.style)
    },
    ...(props.microphoneFieldProps ? Object.fromEntries(
      Object.entries(props.microphoneFieldProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    h('label', {
      ...(props.microphoneLabelProps || {})
    }, typeof defaultMicrophoneLabel === 'string' || typeof defaultMicrophoneLabel === 'number' 
      ? [defaultMicrophoneLabel] 
      : (defaultMicrophoneLabel || [])
    ),
    microphoneSelectNode
  ])
  
  // Switch Camera button
  const defaultSwitchCameraIcon = props.switchCameraIconComponent ?? h(FontAwesomeIcon, { icon: faSyncAlt })
  const defaultSwitchCameraLabel = props.switchCameraButtonLabel ?? 'Switch Camera'
  
  const switchCameraButtonNode = h('div', {
    class: 'form-group'
  }, [
    h('button', {
      class: joinClassNames('btn-switch-camera', props.switchCameraButtonProps?.class as string),
      style: {
        backgroundColor: '#83c0e9',
        color: 'black',
        padding: '10px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
        marginTop: '20px',
        ...safeSpreadStyle(props.switchCameraButtonProps?.style)
      },
      onClick: (event: MouseEvent) => {
        if (props.switchCameraButtonProps?.onClick) {
          (props.switchCameraButtonProps.onClick as (event: MouseEvent) => void)(event)
        }
        if (!event.defaultPrevented) {
          void handleSwitchCamera()
        }
      },
      ...(props.switchCameraButtonProps ? Object.fromEntries(
        Object.entries(props.switchCameraButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
      ) : {})
    }, [
      defaultSwitchCameraIcon,
      ' ',
      defaultSwitchCameraLabel
    ])
  ])
  
  // Middle divider
  const middleDividerNode = h('hr', {
    style: {
      height: '1px',
      backgroundColor: 'black',
      marginTop: '10px',
      marginBottom: '10px',
      border: 'none',
      ...safeSpreadStyle(props.middleDividerProps?.style)
    },
    ...(props.middleDividerProps ? Object.fromEntries(
      Object.entries(props.middleDividerProps).filter(([key]) => !['style'].includes(key))
    ) : {})
  })
  
  // Virtual Background button
  const defaultVirtualBackgroundIcon = props.virtualBackgroundIconComponent ?? h(FontAwesomeIcon, { icon: faPhotoFilm })
  const defaultVirtualBackgroundLabel = props.virtualBackgroundButtonLabel ?? 'Virtual Background'
  
  const virtualBackgroundButtonNode = h('div', {
    class: 'form-group'
  }, [
    h('button', {
      class: joinClassNames('btn-virtual-background', props.virtualBackgroundButtonProps?.class as string),
      style: {
        backgroundColor: '#83c0e9',
        color: 'black',
        padding: '10px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
        ...safeSpreadStyle(props.virtualBackgroundButtonProps?.style)
      },
      onClick: (event: MouseEvent) => {
        if (props.virtualBackgroundButtonProps?.onClick) {
          (props.virtualBackgroundButtonProps.onClick as (event: MouseEvent) => void)(event)
        }
        if (!event.defaultPrevented) {
          showVirtual()
        }
      },
      ...(props.virtualBackgroundButtonProps ? Object.fromEntries(
        Object.entries(props.virtualBackgroundButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
      ) : {})
    }, [
      defaultVirtualBackgroundIcon,
      ' ',
      defaultVirtualBackgroundLabel
    ])
  ])
  
  // Body content
  const defaultBodyNode = h('div', {
    class: joinClassNames('modal-body', props.bodyProps?.class as string),
    style: {
      overflowY: 'auto',
      flex: 1,
      ...safeSpreadStyle(props.bodyProps?.style)
    },
    ...(props.bodyProps ? Object.fromEntries(
      Object.entries(props.bodyProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    cameraFieldNode,
    microphoneFieldNode,
    switchCameraButtonNode,
    middleDividerNode,
    virtualBackgroundButtonNode
  ])
  
  const bodyNode = props.renderBody
    ? props.renderBody({ defaultBody: defaultBodyNode })
    : defaultBodyNode
  
  // Content
  const defaultContentNode = h('div', {
    class: contentClassName.value,
    style: contentStyle.value,
    ...(props.contentProps ? Object.fromEntries(
      Object.entries(props.contentProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    headerNode,
    dividerNode,
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

<style scoped>
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  color: black;
}

.hr {
  height: 1px;
  background-color: black;
  margin-top: 5px;
  margin-bottom: 5px;
  border: none;
}

.modal-body {
  padding: 10px 0;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: black;
  margin-bottom: 5px;
}

.form-control {
  width: 100%;
  padding: 8px 10px;
  font-size: 14px;
  border: 1px solid gray;
  border-radius: 4px;
  background-color: white;
  color: black;
}

.btn-close-media-settings {
  cursor: pointer;
}
</style>
