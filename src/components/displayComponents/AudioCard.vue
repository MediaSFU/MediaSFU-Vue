<!--
/**
 * @fileoverview AudioCard Component - Audio-only participant card with waveform visualization
 * @component AudioCard
 * @module components/displayComponents/AudioCard
 * 
 * @description
 * An audio-only participant card that displays either a profile image or MiniCard fallback
 * with animated audio waveform visualization and control buttons. Used for participants
 * who are audio-only or have their video disabled. Supports complete customization via
 * render props and can be fully replaced via `uiOverrides.audioCard`.
 * 
 * Features:
 * - Profile image display or MiniCard fallback with initials
 * - Animated audio waveform with customizable bar count and styling
 * - Control buttons for audio/video toggle (for hosts/co-hosts)
 * - Participant name overlay with configurable position
 * - Custom component injection via slots
 * - Comprehensive styling and positioning control
 * - Waveform animation synchronized with audio levels
 * 
 * @example Basic Usage
 * // <AudioCard
 *   // name="Jane Smith"
 *   // :participant="participant"
 *   // :parameters="parameters"
 * // />
 * 
 * @example With Profile Image
 * // <AudioCard
 *   // name="John Doe"
 *   // imageSource="https://example.com/avatar.jpg"
 *   // :roundedImage="true"
 *   // :participant="participant"
 *   // :parameters="parameters"
 *   // barColor="#22c55e"
 *   // textColor="#fff"
 * // />
 * 
 * @example Custom Styled with Waveform Configuration
 * // <AudioCard
 *   // name="Alex Johnson"
 *   // :participant="participant"
 *   // :parameters="parameters"
 *   // :customStyle="{ 
 *     background: 'rgba(34,197,94,0.1)', 
 *     borderRadius: '12px' 
 *   }"
 *   // barColor="#22c55e"
 *   // :waveformBarCount="12"
 *   // :waveformHeights="{ silent: 2, active: 16 }"
 *   // controlsPosition="bottomRight"
 *   // infoPosition="topLeft"
 * // />
 * 
 * @example With Custom Waveform Renderer
 * // <AudioCard
 *   // name="Sam Lee"
 *   // :participant="participant"
 *   // :parameters="parameters"
 *   // :renderWaveformBar="({ index, isActive, height, style, props }) => 
 *     h('div', {
 *       key: index,
 *       style: {
 *         ...style,
 *         background: isActive 
 *           ? 'linear-gradient(to top, #22c55e, #16a34a)' 
 *           : '#d1d5db'
 *       },
 *       ...props
 *     })
 *   "
 * // />
 * 
 * @example Complete Replacement via UI Overrides
 * // In your App component (AppUnique.vue pattern)
 * const uiOverrides = computed(() => ({
 *   // audioCard: {
 *     component: {
 *       name: 'CustomAudioCard',
 *       props: ['name', 'participant', 'barColor', 'imageSource'],
 *       setup(props) {
 *         return () => h(AudioCard, {
 *           ...props,
 *           customStyle: {
 *             background: 'rgba(34,197,94,0.1)',
 *             borderRadius: '22px',
 *             border: '2px solid #22c55e'
 *           },
 *           barColor: '#22c55e',
 *           waveformBarCount: 12
 *         });
 *       }
 *     }
 *   }
 * }));
 */
-->
<template>
  <div
    v-bind="cardRestAttrs"
    :class="cardClassNames"
    :style="cardMergedStyle"
  >
    <slot name="extra-widgets" />

    <div
      v-if="imageSource"
      :style="imageContainerStyle"
    >
      <img
        v-bind="imageRestAttrs"
        :src="imageSource"
        alt="Participant"
        :style="imageMergedStyle"
      />
    </div>
    <MiniCard
      v-else
      v-bind="miniCardProps"
    />

    <component
      :is="videoInfoComponent"
      v-if="videoInfoComponent"
    />
    <div
      v-else-if="showInfo"
      v-bind="infoOverlayRestAttrs"
      :class="infoOverlayClassNames"
      :style="infoOverlayMergedStyle"
    >
      <div
        v-bind="nameContainerRestAttrs"
        :class="nameContainerClassNames"
        :style="nameContainerMergedStyle"
      >
        <p
          v-bind="nameTextRestAttrs"
          :class="nameTextClassNames"
          :style="nameTextMergedStyle"
        >
          {{ name }}
        </p>
      </div>
      <div
        v-if="showWaveformState"
        v-bind="waveformContainerRestAttrs"
        :class="waveformContainerClassNames"
        :style="waveformContainerMergedStyle"
      >
        <template
          v-for="descriptor in waveformBarDescriptors"
          :key="descriptor.key"
        >
          <RenderVNode
            v-if="descriptor.customNode !== null && descriptor.customNode !== undefined"
            :node="descriptor.customNode"
          />
          <component
            :is="descriptor.component"
            v-else
            v-bind="descriptor.props"
          />
        </template>
      </div>
    </div>

    <component
      :is="videoControlsComponent"
      v-if="videoControlsComponent"
    />
    <div
      v-else-if="showControls"
      v-bind="controlsOverlayRestAttrs"
      :class="controlsOverlayClassNames"
      :style="controlsOverlayMergedStyle"
    >
      <button
        v-bind="audioButtonRestAttrs"
        :class="audioButtonClassNames"
        :style="audioButtonMergedStyle"
        :type="audioButtonType"
        @click="handleAudioButtonClick"
      >
        <RenderVNode :node="audioIconNode" />
      </button>
      <button
        v-bind="videoButtonRestAttrs"
        :class="videoButtonClassNames"
        :style="videoButtonMergedStyle"
        :type="videoButtonType"
        @click="handleVideoButtonClick"
      >
        <RenderVNode :node="videoIconNode" />
      </button>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  defineComponent,
  h,
  onUnmounted,
  ref,
  watch,
  type CSSProperties,
  type Component,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type PropType,
  type VNodeChild,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faVideo,
  faVideoSlash,
  faMicrophone,
  faMicrophoneSlash,
} from '@fortawesome/free-solid-svg-icons';
import { getOverlayPosition } from '@legacy/methods/utils/getOverlayPosition';
import MiniCard from './MiniCard.vue';
import {
  controlMedia,
  type ControlMediaOptions,
} from '@legacy/consumers/controlMedia';
import type {
  ControlsPosition,
  InfoPosition,
  Participant,
  AudioDecibels,
  CoHostResponsibility,
  ShowAlert,
} from '../../../../SharedTypes';
import type { Socket } from 'socket.io-client';

/**
 * Parameters object for AudioCard control operations
 * @interface AudioCardParameters
 */
export interface AudioCardParameters {
  /** Audio level data for all participants */
  audioDecibels: AudioDecibels[];
  /** List of all participants in the session */
  participants: Participant[];
  /** Socket.io connection for real-time communication */
  socket: Socket;
  /** Array of co-host responsibilities */
  coHostResponsibility: CoHostResponsibility[];
  /** Name of the current room/session */
  roomName: string;
  /** Alert display function */
  showAlert?: ShowAlert;
  /** Co-host identifier */
  coHost: string;
  /** User level ('0' = regular, '1' = admin, '2' = host) */
  islevel: string;
  /** Current user's identifier */
  member: string;
  /** Type of MediaSFU event */
  eventType: string;
  /** Function to get the latest parameters */
  getUpdatedAllParams(): AudioCardParameters;
}

type MiniCardComponentProps = InstanceType<typeof MiniCard>['$props'];

/**
 * Configuration for waveform bar heights
 * @interface WaveformHeightsConfig
 */
interface WaveformHeightsConfig {
  /** Height in pixels when audio is silent @default 1 */
  silent?: number;
  /** Height in pixels when audio is active @default 12 */
  active?: number;
}

/**
 * Options passed to custom waveform bar renderer
 * @interface WaveformBarRenderOptions
 */
interface WaveformBarRenderOptions {
  /** Bar index (0-based) */
  index: number;
  /** Whether this bar is currently animated (active audio) */
  isActive: boolean;
  /** Computed height for this bar (silent or active) */
  height: number;
  /** Default computed CSS styles */
  style: CSSProperties;
  /** Default HTML attributes */
  props: HTMLAttributes;
}

/**
 * Custom renderer function for waveform bars
 * @callback WaveformBarRenderer
 * @param {WaveformBarRenderOptions} options - Rendering options
 * @returns {VNodeChild} Custom VNode for the waveform bar
 */
type WaveformBarRenderer = (options: WaveformBarRenderOptions) => VNodeChild;

type ButtonAttrs = HTMLAttributes & {
  type?: string;
  onClick?: (event: MouseEvent) => void;
};

/**
 * Per-button HTML attribute configuration
 * @interface ControlButtonPropsConfig
 */
interface ControlButtonPropsConfig {
  /** Attributes for the audio toggle button */
  audio?: ButtonAttrs;
  /** Attributes for the video toggle button */
  video?: ButtonAttrs;
}

/**
 * Props for the AudioCard component
 * @interface AudioCardProps
 */
export interface AudioCardProps {
  /**
   * Custom function for controlling participant media (mute/unmute)
   * @default controlMedia
   */
  controlUserMedia?: (options: ControlMediaOptions) => Promise<void>;
  
  /**
   * Custom CSS styles for the card container
   * @example { background: 'rgba(34,197,94,0.1)', borderRadius: '12px' }
   */
  customStyle?: CSSProperties;
  
  /**
   * Participant's display name
   * @example "Jane Smith"
   */
  name: string;
  
  /**
   * Color of the audio waveform bars
   * @default "red"
   * @example "#22c55e"
   */
  barColor?: string;
  
  /**
   * Color of the participant name text
   * @default "white"
   * @example "#fff"
   */
  textColor?: string;
  
  /**
   * URL of participant's profile image
   * @example "https://example.com/avatar.jpg"
   */
  imageSource?: string;
  
  /**
   * Whether to apply rounded styling to the image
   * @default false
   */
  roundedImage?: boolean;
  
  /**
   * Custom styles for the profile image
   * @example { objectFit: 'cover', border: '2px solid #fff' }
   */
  imageStyle?: CSSProperties;
  
  /**
   * Whether to show audio/video control buttons (for hosts/co-hosts)
   * @default true
   */
  showControls?: boolean;
  
  /**
   * Whether to show participant name and waveform overlay
   * @default true
   */
  showInfo?: boolean;
  
  /**
   * Custom component for the info overlay (replaces name/waveform)
   */
  videoInfoComponent?: Component;
  
  /**
   * Custom component for control buttons (replaces mute/video toggles)
   */
  videoControlsComponent?: Component;
  
  /**
   * Position of control buttons overlay
   * @default "topLeft"
   */
  controlsPosition?: ControlsPosition;
  
  /**
   * Position of info overlay (name/waveform)
   * @default "topRight"
   */
  infoPosition?: InfoPosition;
  
  /**
   * Full participant object with name, muted, videoOn, etc.
   */
  participant: Participant;
  
  /**
   * Background color for the card
   * @example "#000000"
   */
  backgroundColor?: string;
  
  /**
   * Audio decibel level data for this participant
   */
  audioDecibels?: AudioDecibels;
  
  /**
   * MediaSFU parameters object for control operations
   */
  parameters: AudioCardParameters;
  
  /**
   * HTML attributes for the outer card container
   * @example { 'data-testid': 'audio-card', class: 'custom-class' }
   */
  cardProps?: HTMLAttributes;
  
  /**
   * HTML attributes for the info overlay wrapper
   */
  infoOverlayProps?: HTMLAttributes;
  
  /**
   * HTML attributes for the name container element
   */
  nameContainerProps?: HTMLAttributes;
  
  /**
   * HTML attributes for the name text element
   */
  nameTextProps?: HTMLAttributes;
  
  /**
   * HTML attributes for the waveform container
   */
  waveformContainerProps?: HTMLAttributes;
  
  /**
   * CSS styles for individual waveform bars
   * @example { borderRadius: '2px', margin: '0 1px' }
   */
  waveformBarStyle?: CSSProperties;
  
  /**
   * HTML attributes for each waveform bar
   */
  waveformBarProps?: HTMLAttributes;
  
  /**
   * Configuration for waveform bar heights
   * @example { silent: 2, active: 16 }
   */
  waveformHeights?: WaveformHeightsConfig;
  
  /**
   * Custom animation durations for each waveform bar (ms)
   * @default [474, 433, 407, 458, 400, 427, 441, 419, 487]
   * @example [400, 450, 500, 550, 600]
   */
  waveformDurations?: number[];
  
  /**
   * Number of waveform bars to display
   * @default 9 (length of waveformDurations array)
   * @example 12
   */
  waveformBarCount?: number;
  
  /**
   * Custom render function for individual waveform bars.
   * Receives bar index, active state, height, and default styling.
   * 
   * @param options - Waveform bar rendering options
   * @param options.index - Bar index (0-based)
   * @param options.isActive - Whether this bar is currently animated
   * @param options.height - Computed height for this bar
   * @param options.style - Default computed CSS styles
   * @param options.props - Default HTML attributes
   * @returns Custom VNode for the waveform bar
   * 
   * @example
   * ```ts
   * ({ index, isActive, height, style, props }) => 
   *   h('div', {
   *     key: index,
   *     style: {
   *       ...style,
   *       background: isActive 
   *         ? 'linear-gradient(to top, #22c55e, #16a34a)' 
   *         : '#d1d5db'
   *     },
   *     ...props
   *   })
   * ```
   */
  renderWaveformBar?: WaveformBarRenderer;
  
  /**
   * HTML attributes for the controls overlay wrapper
   */
  controlsOverlayProps?: HTMLAttributes;
  
  /**
   * Per-button HTML attributes for control buttons
   * @example { audio: { 'data-testid': 'mute-btn' }, video: { 'data-testid': 'video-btn' } }
   */
  controlButtonProps?: ControlButtonPropsConfig;
  
  /**
   * Custom icon for audio enabled state
   * @example h(FontAwesomeIcon, { icon: faMicrophone })
   */
  audioEnabledIcon?: VNodeChild;
  
  /**
   * Custom icon for audio disabled (muted) state
   * @example h(FontAwesomeIcon, { icon: faMicrophoneSlash })
   */
  audioDisabledIcon?: VNodeChild;
  
  /**
   * Custom icon for video enabled state
   * @example h(FontAwesomeIcon, { icon: faVideo })
   */
  videoEnabledIcon?: VNodeChild;
  
  /**
   * Custom icon for video disabled state
   * @example h(FontAwesomeIcon, { icon: faVideoSlash })
   */
  videoDisabledIcon?: VNodeChild;
  
  /**
   * Props to pass to the fallback MiniCard component (when no imageSource)
   * @example { fontSize: 18, customStyle: { background: '#22c55e' } }
   */
  fallbackMiniCardProps?: Partial<MiniCardComponentProps>;
  
  /**
   * HTML attributes for the profile image element
   * @example { alt: 'User Avatar', loading: 'lazy' }
   */
  imageProps?: ImgHTMLAttributes;
  
  /**
   * Whether to show waveform animation even when participant is muted
   * @default false
   */
  showWaveformWhenMuted?: boolean;
}

const props = withDefaults(defineProps<AudioCardProps>(), {
  controlUserMedia: controlMedia,
  barColor: 'red',
  textColor: 'white',
  roundedImage: false,
  showControls: true,
  showInfo: true,
  controlsPosition: 'topLeft',
  infoPosition: 'topRight',
  customStyle: undefined,
  imageSource: undefined,
  imageStyle: undefined,
  videoInfoComponent: undefined,
  videoControlsComponent: undefined,
  backgroundColor: undefined,
  audioDecibels: undefined,
  cardProps: () => ({}),
  infoOverlayProps: () => ({}),
  nameContainerProps: () => ({}),
  nameTextProps: () => ({}),
  waveformContainerProps: () => ({}),
  waveformBarStyle: () => ({}),
  waveformBarProps: () => ({}),
  waveformHeights: () => ({}),
  waveformDurations: () => [],
  waveformBarCount: undefined,
  renderWaveformBar: undefined,
  controlsOverlayProps: () => ({}),
  controlButtonProps: () => ({}),
  audioEnabledIcon: undefined,
  audioDisabledIcon: undefined,
  videoEnabledIcon: undefined,
  videoDisabledIcon: undefined,
  fallbackMiniCardProps: () => ({}),
  imageProps: () => ({}),
  showWaveformWhenMuted: false,
});

const DEFAULT_WAVEFORM_DURATIONS = [474, 433, 407, 458, 400, 427, 441, 419, 487];

const latestParametersSnapshot = ref(props.parameters.getUpdatedAllParams());

const getLatestParameters = () => props.parameters.getUpdatedAllParams();

const durations = computed(() =>
  props.waveformDurations && props.waveformDurations.length > 0
    ? props.waveformDurations
    : DEFAULT_WAVEFORM_DURATIONS
);

const barCount = computed(() => props.waveformBarCount ?? durations.value.length);

const waveformAnimations = ref<number[]>([]);
const showWaveformState = ref(true);

let checkAudioInterval: ReturnType<typeof setInterval> | null = null;
let waveformInterval: ReturnType<typeof setInterval> | null = null;

const silentHeight = computed(() => props.waveformHeights?.silent ?? 1);
const activeHeight = computed(() => props.waveformHeights?.active ?? 12);

const resetWaveform = () => {
  waveformAnimations.value = Array.from({ length: barCount.value }, () => 0);
};

watch(
  barCount,
  () => {
    resetWaveform();
  },
  { immediate: true }
);

const getAnimationDuration = (index: number): number => {
  if (durations.value.length === 0) {
    return 0;
  }
  const fallback = durations.value[durations.value.length - 1] ?? 0;
  return durations.value[index] ?? fallback;
};

const animateBar = (index: number) => {
  if (index >= waveformAnimations.value.length) {
    return;
  }

  waveformAnimations.value[index] = 1;

  const duration = getAnimationDuration(index);
  if (duration <= 0) {
    waveformAnimations.value[index] = 0;
    return;
  }

  setTimeout(() => {
    if (index < waveformAnimations.value.length) {
      waveformAnimations.value[index] = 0;
    }
  }, duration);
};

const animateWaveform = () => {
  for (let index = 0; index < barCount.value; index += 1) {
    animateBar(index);
  }
};

const evaluateAudioLevels = () => {
  const updatedParameters = getLatestParameters();
  latestParametersSnapshot.value = updatedParameters;

  const { audioDecibels, participants } = updatedParameters;
  const existingEntry =
    audioDecibels?.find((entry: AudioDecibels) => entry.name === props.name) ?? null;
  const participantEntry =
    participants?.find((participantItem: Participant) => participantItem.name === props.name) ??
    null;

  if (
    existingEntry &&
    existingEntry.averageLoudness > 127.5 &&
    participantEntry &&
    !participantEntry.muted
  ) {
    if (!showWaveformState.value) {
      showWaveformState.value = true;
    }
  } else if (!props.showWaveformWhenMuted) {
    showWaveformState.value = false;
  }
};

checkAudioInterval = setInterval(evaluateAudioLevels, 1000);
evaluateAudioLevels();

watch(
  () => props.participant?.muted,
  (muted) => {
    if (muted && !props.showWaveformWhenMuted) {
      showWaveformState.value = false;
      resetWaveform();
    } else if (!muted) {
      showWaveformState.value = true;
    }
  },
  { immediate: true }
);

watch(
  showWaveformState,
  (show) => {
    if (waveformInterval) {
      clearInterval(waveformInterval);
      waveformInterval = null;
    }

    if (show) {
      animateWaveform();
      waveformInterval = setInterval(animateWaveform, 1000);
    } else {
      resetWaveform();
    }
  },
  { immediate: true }
);

const toggleAudio = async () => {
  if (!props.participant?.muted) {
    const updatedParameters = getLatestParameters();
    latestParametersSnapshot.value = updatedParameters;

    await props.controlUserMedia!({
      participantId: props.participant.id || '',
      participantName: props.participant.name,
      type: 'audio',
      socket: updatedParameters.socket,
      coHostResponsibility: updatedParameters.coHostResponsibility,
      roomName: updatedParameters.roomName,
      showAlert: updatedParameters.showAlert,
      coHost: updatedParameters.coHost,
      islevel: updatedParameters.islevel,
      member: updatedParameters.member,
      participants: updatedParameters.participants,
    });
  }
};

const toggleVideo = async () => {
  if (props.participant?.videoOn) {
    const updatedParameters = getLatestParameters();
    latestParametersSnapshot.value = updatedParameters;

    await props.controlUserMedia!({
      participantId: props.participant.id || '',
      participantName: props.participant.name,
      type: 'video',
      socket: updatedParameters.socket,
      coHostResponsibility: updatedParameters.coHostResponsibility,
      roomName: updatedParameters.roomName,
      showAlert: updatedParameters.showAlert,
      coHost: updatedParameters.coHost,
      islevel: updatedParameters.islevel,
      member: updatedParameters.member,
      participants: updatedParameters.participants,
    });
  }
};

onUnmounted(() => {
  if (checkAudioInterval) {
    clearInterval(checkAudioInterval);
  }
  if (waveformInterval) {
    clearInterval(waveformInterval);
  }
});

// Styles
const cardStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  margin: 0,
  padding: 0,
  backgroundColor: 'transparent',
  position: 'relative',
};

const imageContainerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '100%',
};

const backgroundImageStyle: CSSProperties = {
  width: '80px',
  height: '80px',
};

const overlayWebStyle: CSSProperties = {
  position: 'absolute',
  minWidth: '50%',
  minHeight: '5%',
  maxHeight: '100%',
  display: 'grid',
  gridTemplateColumns: '4fr 2fr',
  gridGap: '3px',
};

const overlayWebAltStyle: CSSProperties = {
  position: 'absolute',
  minWidth: '50%',
  minHeight: '5%',
  maxHeight: '100%',
  display: 'grid',
  gridTemplateColumns: '4fr',
  gridGap: '0px',
  top: 0,
  right: 0,
};

const overlayControlsStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  padding: 0,
  position: 'absolute',
  top: 0,
  left: 0,
};

const controlButtonStyle: CSSProperties = {
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  padding: '0px 5px',
  marginRight: '2px',
  fontSize: 'medium',
  border: 'none',
  cursor: 'pointer',
};

const nameColumnStyle: CSSProperties = {
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  padding: '0px',
  paddingTop: '5px',
  marginRight: '2px',
  fontSize: 'small',
  textAlign: 'center',
  minHeight: '4%',
  maxHeight: '70%',
};

const nameTextStyle: CSSProperties = {
  fontSize: 'small',
  fontWeight: 'bolder',
};

const waveformWebStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'left',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
  padding: '0px',
  flexDirection: 'row',
  minHeight: '4%',
  maxHeight: '70%',
};

const barStyle: CSSProperties = {
  flex: 1,
  opacity: 0.75,
  margin: '0 1px',
  transition: 'height 0.5s ease',
};

const RenderVNode = defineComponent({
  name: 'AudioCardRenderVNode',
  props: {
    node: {
      type: [String, Number, Boolean, Object, Array, Function] as PropType<VNodeChild>,
      required: true,
    },
  },
  setup(renderProps) {
    return () => renderProps.node as VNodeChild;
  },
});

const cardClassNames = computed(() => {
  const baseClass = 'mediasfu-audio-card';
  const classes = props.cardProps?.class;
  if (!classes) {
    return baseClass;
  }
  return [baseClass, classes];
});

const cardMergedStyle = computed<CSSProperties>(() => ({
  ...cardStyle,
  ...(props.cardProps?.style as CSSProperties | undefined),
  ...(props.customStyle ?? {}),
  ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
}));

const cardRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.cardProps ?? {};
  return rest;
});

const infoOverlayClassNames = computed(() => {
  const baseClass = 'mediasfu-audio-card__info-overlay';
  const classes = props.infoOverlayProps?.class;
  if (!classes) {
    return baseClass;
  }
  return [baseClass, classes];
});

const infoOverlayMergedStyle = computed<CSSProperties>(() => ({
  ...getOverlayPosition({ position: props.infoPosition }),
  ...(props.showControls ? overlayWebStyle : overlayWebAltStyle),
  ...(props.infoOverlayProps?.style as CSSProperties | undefined),
}));

const infoOverlayRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.infoOverlayProps ?? {};
  return rest;
});

const nameContainerClassNames = computed(() => {
  const baseClass = 'mediasfu-audio-card__info-name';
  const classes = props.nameContainerProps?.class;
  if (!classes) {
    return baseClass;
  }
  return [baseClass, classes];
});

const nameContainerMergedStyle = computed<CSSProperties>(() => ({
  ...nameColumnStyle,
  ...(props.nameContainerProps?.style as CSSProperties | undefined),
}));

const nameContainerRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.nameContainerProps ?? {};
  return rest;
});

const nameTextClassNames = computed(() => {
  const baseClass = 'mediasfu-audio-card__info-text';
  const classes = props.nameTextProps?.class;
  if (!classes) {
    return baseClass;
  }
  return [baseClass, classes];
});

const nameTextMergedStyle = computed<CSSProperties>(() => ({
  color: props.textColor,
  ...nameTextStyle,
  ...(props.nameTextProps?.style as CSSProperties | undefined),
}));

const nameTextRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.nameTextProps ?? {};
  return rest;
});

const waveformContainerClassNames = computed(() => {
  const baseClass = 'mediasfu-audio-card__waveform';
  const classes = props.waveformContainerProps?.class;
  if (!classes) {
    return baseClass;
  }
  return [baseClass, classes];
});

const waveformContainerMergedStyle = computed<CSSProperties>(() => ({
  ...waveformWebStyle,
  ...(props.waveformContainerProps?.style as CSSProperties | undefined),
}));

const waveformContainerRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.waveformContainerProps ?? {};
  return rest;
});

const waveformBarRestAttrs = computed<HTMLAttributes>(() => {
  const { class: _class, style: _style, ...rest } = props.waveformBarProps ?? {};
  return rest;
});

const waveformBarClassNames = computed(() => {
  const baseClass = 'mediasfu-audio-card__waveform-bar';
  const classes = props.waveformBarProps?.class;
  if (!classes) {
    return baseClass;
  }
  return [baseClass, classes];
});

const waveformBarMergedStyle = computed<CSSProperties>(() => ({
  ...barStyle,
  ...(props.waveformBarStyle ?? {}),
  ...(props.waveformBarProps?.style as CSSProperties | undefined),
}));

const controlsOverlayClassNames = computed(() => {
  const baseClass = 'mediasfu-audio-card__controls-overlay';
  const classes = props.controlsOverlayProps?.class;
  if (!classes) {
    return baseClass;
  }
  return [baseClass, classes];
});

const controlsOverlayMergedStyle = computed<CSSProperties>(() => ({
  ...overlayControlsStyle,
  ...getOverlayPosition({ position: props.controlsPosition }),
  ...(props.controlsOverlayProps?.style as CSSProperties | undefined),
}));

const controlsOverlayRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.controlsOverlayProps ?? {};
  return rest;
});

const audioButtonRestAttrs = computed(() => {
  const { class: _class, style: _style, onClick: _onClick, type: _type, ...rest } =
    props.controlButtonProps?.audio ?? {};
  return rest;
});

const audioButtonClassNames = computed(() => {
  const baseClass = 'mediasfu-audio-card__control-button';
  const classes = props.controlButtonProps?.audio?.class;
  if (!classes) {
    return baseClass;
  }
  return [baseClass, classes];
});

const audioButtonMergedStyle = computed<CSSProperties>(() => ({
  ...controlButtonStyle,
  ...(props.controlButtonProps?.audio?.style as CSSProperties | undefined),
}));

const normalizeButtonType = (value?: string): 'button' | 'submit' | 'reset' | undefined => {
  if (value === undefined) {
    return undefined;
  }
  const allowed: Array<'button' | 'submit' | 'reset'> = ['button', 'submit', 'reset'];
  return allowed.includes(value as typeof allowed[number])
    ? (value as 'button' | 'submit' | 'reset')
    : 'button';
};

const audioButtonType = computed<'button' | 'submit' | 'reset' | undefined>(() =>
  normalizeButtonType(props.controlButtonProps?.audio?.type)
);

const videoButtonRestAttrs = computed(() => {
  const { class: _class, style: _style, onClick: _onClick, type: _type, ...rest } =
    props.controlButtonProps?.video ?? {};
  return rest;
});

const videoButtonClassNames = computed(() => {
  const baseClass = 'mediasfu-audio-card__control-button';
  const classes = props.controlButtonProps?.video?.class;
  if (!classes) {
    return baseClass;
  }
  return [baseClass, classes];
});

const videoButtonMergedStyle = computed<CSSProperties>(() => ({
  ...controlButtonStyle,
  ...(props.controlButtonProps?.video?.style as CSSProperties | undefined),
}));

const videoButtonType = computed<'button' | 'submit' | 'reset' | undefined>(() =>
  normalizeButtonType(props.controlButtonProps?.video?.type)
);

const imageRestAttrs = computed<ImgHTMLAttributes>(() => {
  const { style: _style, ...rest } = props.imageProps ?? {};
  return rest;
});

const imageMergedStyle = computed<CSSProperties>(() => ({
  ...backgroundImageStyle,
  ...(props.roundedImage ? { borderRadius: '20%' } : {}),
  ...(props.imageStyle ?? {}),
  ...(props.imageProps?.style as CSSProperties | undefined),
}));

const miniCardBaseProps = computed<MiniCardComponentProps>(() => ({
  initials: props.name,
  fontSize: 20,
  customStyle: {
    border:
      (latestParametersSnapshot.value.eventType ?? props.parameters.eventType) !== 'broadcast'
        ? '2px solid black'
        : '0px solid black',
  },
}));

const miniCardProps = computed<MiniCardComponentProps>(() => ({
  ...miniCardBaseProps.value,
  ...(props.fallbackMiniCardProps ?? {}),
  customStyle: {
    ...(miniCardBaseProps.value.customStyle as CSSProperties | undefined),
    ...(props.fallbackMiniCardProps?.customStyle as CSSProperties | undefined),
  },
}));

const waveformBarDescriptors = computed(() =>
  waveformAnimations.value.map((animation, index) => {
    const isActive = animation === 1;
    const height = isActive ? activeHeight.value : silentHeight.value;
    const style: CSSProperties = {
      ...waveformBarMergedStyle.value,
      height,
      backgroundColor: props.barColor,
    };

    const baseProps: Record<string, unknown> = {
      ...waveformBarRestAttrs.value,
      class: waveformBarClassNames.value,
      style,
    };

    const customNode = props.renderWaveformBar
      ? props.renderWaveformBar({
          index,
          isActive,
          height,
          style,
          props: baseProps,
        })
      : null;

    return {
      key: index,
      customNode,
      component: 'div',
      props: baseProps,
    };
  })
);

const audioButtonExternalOnClick = computed(() => props.controlButtonProps?.audio?.onClick);
const videoButtonExternalOnClick = computed(() => props.controlButtonProps?.video?.onClick);

const handleAudioButtonClick = async (event: MouseEvent) => {
  audioButtonExternalOnClick.value?.(event);
  if (event.defaultPrevented) {
    return;
  }
  await toggleAudio();
};

const handleVideoButtonClick = async (event: MouseEvent) => {
  videoButtonExternalOnClick.value?.(event);
  if (event.defaultPrevented) {
    return;
  }
  await toggleVideo();
};

const audioIconNode = computed<VNodeChild>(() =>
  props.participant?.muted
    ? props.audioDisabledIcon ?? h(FontAwesomeIcon, { icon: faMicrophoneSlash, size: 'sm', color: 'red' })
    : props.audioEnabledIcon ?? h(FontAwesomeIcon, { icon: faMicrophone, size: 'sm', color: 'green' })
);

const videoIconNode = computed<VNodeChild>(() =>
  props.participant?.videoOn
    ? props.videoEnabledIcon ?? h(FontAwesomeIcon, { icon: faVideo, size: 'sm', color: 'green' })
    : props.videoDisabledIcon ?? h(FontAwesomeIcon, { icon: faVideoSlash, size: 'sm', color: 'red' })
);

</script>
