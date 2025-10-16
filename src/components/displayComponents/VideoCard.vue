<!--
/**
 * @fileoverview VideoCard Component - Video participant card with controls and waveform
 * @component VideoCard
 * @module components/displayComponents/VideoCard
 * 
 * @description
 * A full-featured video participant card that displays a participant's video stream
 * with optional audio waveform visualization and control buttons (mute/unmute video/audio).
 * Used in the main grid view and spotlight layouts. Supports complete customization via
 * render props and can be fully replaced via `uiOverrides.videoCard`.
 * 
 * Features:
 * - Live video stream display with mirror support
 * - Animated audio waveform visualization
 * - Control buttons for audio/video toggle (for hosts/co-hosts)
 * - Participant name overlay
 * - Custom component injection via slots
 * - Comprehensive styling and positioning control
 * 
 * @example Basic Usage
 * // <VideoCard
 *   // name="John Doe"
 *   // :remoteProducerId="producer.id"
 *   // :videoStream="stream"
 *   // :participant="participant"
 *   // eventType="conference"
 *   // :forceFullDisplay="false"
 *   // :parameters="parameters"
 * // />
 * 
 * @example With Custom Styling
 * // <VideoCard
 *   // name="Jane Smith"
 *   // :remoteProducerId="producer.id"
 *   // :videoStream="stream"
 *   // :participant="participant"
 *   // eventType="webinar"
 *   // :forceFullDisplay="true"
 *   // :parameters="parameters"
 *   // barColor="#22c55e"
 *   // textColor="#fff"
 *   // :customStyle="{ borderRadius: '12px', border: '2px solid #22c55e' }"
 *   // controlsPosition="bottomRight"
 *   // infoPosition="topLeft"
 * // />
 * 
 * @example With Custom Components
 * // <VideoCard
 *   // name="Alex Johnson"
 *   // :remoteProducerId="producer.id"
 *   // :videoStream="stream"
 *   // :participant="participant"
 *   // eventType="broadcast"
 *   // :forceFullDisplay="false"
 *   // :parameters="parameters"
 *   // :videoInfoComponent="CustomInfoOverlay"
 *   // :videoControlsComponent="CustomControlButtons"
 * >
 *   <template #extra-widgets>
 *     <div class="custom-badge">LIVE</div>
 *   </template>
 * // </VideoCard>
 * 
 * @example Complete Replacement via UI Overrides
 * // In your App component (AppUnique.vue pattern)
 * const uiOverrides = computed(() => ({
 *   // videoCard: {
 *     component: {
 *       name: 'CustomVideoCard',
 *       props: ['name', 'participant', 'videoStream', 'remoteProducerId', 'barColor', 'textColor'],
 *       setup(props) {
 *         return () => h(VideoCard, {
 *           ...props,
 *           customStyle: {
 *             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
 *             borderRadius: '16px',
 *             boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
 *           },
 *           barColor: '#a78bfa',
 *           controlsPosition: 'bottomLeft'
 *         });
 *       }
 *     }
 *   }
 * }));
 */
-->
<template>
  <div
    v-bind="containerRestAttrs"
    :class="containerClassNames"
    :style="containerMergedStyle"
  >
    <slot name="extra-widgets" />
    <CardVideoDisplay
      :remote-producer-id="remoteProducerId"
      :event-type="eventType"
      :force-full-display="forceFullDisplay"
      :video-stream="videoStream"
      :background-color="backgroundColor"
      :do-mirror="doMirror"
      v-bind="resolvedVideoDisplayProps"
    />

    <component
      :is="videoInfoComponent"
      v-if="videoInfoComponent"
    />
    <div
      v-else-if="showInfo"
      v-bind="infoOverlayRestAttrs"
      :class="infoOverlayClassNames"
      :style="infoOverlayStyle"
    >
      <div :style="nameColumnStyle">
        <span :style="{ ...nameTextStyle, color: textColor }">
          {{ participant?.name }}
        </span>
      </div>
      <div
        v-if="showWaveformState"
        v-bind="waveformContainerRestAttrs"
        :class="waveformContainerClassNames"
        :style="waveformContainerStyle"
      >
        <div
          v-for="(animation, index) in waveformAnimations"
          :key="index"
          :style="{
            ...waveformBarMergedStyle,
            height: animation === 0 ? '1px' : '16px',
            backgroundColor: barColor,
          }"
          :class="waveformBarClassNames"
        />
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
      :style="controlsOverlayStyle"
    >
      <div :style="overlayControlsStyle">
        <button
          :style="controlButtonStyle"
          @click="toggleAudio"
        >
          <font-awesome-icon
            :icon="participant?.muted ? faMicrophoneSlash : faMicrophone"
            size="sm"
            :color="participant?.muted ? 'red' : 'green'"
          />
        </button>
        <button
          :style="controlButtonStyle"
          @click="toggleVideo"
        >
          <font-awesome-icon
            :icon="participant?.videoOn ? faVideo : faVideoSlash"
            size="sm"
            :color="participant?.videoOn ? 'green' : 'red'"
          />
        </button>
      </div>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  watch,
  onUnmounted,
  type CSSProperties,
  type Component,
  type HTMLAttributes,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
} from '@fortawesome/free-solid-svg-icons';
import { controlMedia } from '@legacy/consumers/controlMedia';
import { getOverlayPosition } from '@legacy/methods/utils/getOverlayPosition';
import CardVideoDisplay, { type CardVideoDisplayProps } from './CardVideoDisplay.vue';
import type {
  AudioDecibels,
  CoHostResponsibility,
  Participant,
  ShowAlert,
  EventType,
} from '../../../../SharedTypes';
import type { Socket } from 'socket.io-client';

/**
 * Parameters object for VideoCard control operations
 * @interface VideoCardParameters
 */
export interface VideoCardParameters {
  /** Socket.io connection for real-time communication */
  socket: Socket;
  /** Name of the current room/session */
  roomName: string;
  /** Array of co-host responsibilities */
  coHostResponsibility: CoHostResponsibility[];
  /** Alert display function */
  showAlert?: ShowAlert;
  /** Co-host identifier */
  coHost: string;
  /** List of all participants in the session */
  participants: Participant[];
  /** Current user's identifier */
  member: string;
  /** User level ('0' = regular, '1' = admin, '2' = host) */
  islevel: string;
  /** Audio level data for all participants */
  audioDecibels: AudioDecibels[];
  /** Function to get the latest parameters */
  getUpdatedAllParams: () => VideoCardParameters;
  /** Additional dynamic parameters */
  [key: string]: unknown;
}

/**
 * Props for the VideoCard component
 * @interface VideoCardProps
 */
export interface VideoCardProps {
  /**
   * Custom CSS styles for the card container
   * @example { borderRadius: '12px', border: '2px solid #22c55e' }
   */
  customStyle?: CSSProperties;
  
  /**
   * Participant's display name
   * @example "John Doe"
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
   * URL of participant's profile image (fallback for video-off)
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
   * Producer ID for the remote video stream
   * @example "producer_12345"
   */
  remoteProducerId: string;
  
  /**
   * Type of MediaSFU event
   * @example "conference" | "webinar" | "broadcast" | "chat"
   */
  eventType: EventType;
  
  /**
   * Whether to force video to fill entire container
   * @default false
   */
  forceFullDisplay: boolean;
  
  /**
   * The MediaStream object containing video track
   */
  videoStream: MediaStream | null;
  
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
  controlsPosition?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  
  /**
   * Position of info overlay (name/waveform)
   * @default "topRight"
   */
  infoPosition?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  
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
   * Audio decibel levels for waveform animation
   */
  audioDecibels?: AudioDecibels[];
  
  /**
   * Whether to mirror the video (for local camera)
   * @default false
   */
  doMirror?: boolean;
  
  /**
   * MediaSFU parameters object for control operations
   */
  parameters: VideoCardParameters;
  
  /**
   * HTML attributes for the outer container
   * @example { 'data-testid': 'video-card', class: 'custom-class' }
   */
  containerProps?: HTMLAttributes;
  
  /**
   * HTML attributes for the info overlay wrapper
   */
  infoOverlayProps?: HTMLAttributes;
  
  /**
   * HTML attributes for the controls overlay wrapper
   */
  controlsOverlayProps?: HTMLAttributes;
  
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
   * CSS class(es) for waveform bars
   * @example "animated-bar" or ["animated-bar", "green-bar"]
   */
  waveformBarClassName?: string | string[];
  
  /**
   * Additional props to pass to the CardVideoDisplay component
   */
  videoDisplayProps?: Partial<CardVideoDisplayProps>;
}

const props = withDefaults(defineProps<VideoCardProps>(), {
  barColor: 'red',
  textColor: 'white',
  showControls: true,
  showInfo: true,
  controlsPosition: 'topLeft',
  infoPosition: 'topRight',
  doMirror: false,
  customStyle: undefined,
  imageSource: undefined,
  imageStyle: undefined,
  videoInfoComponent: undefined,
  videoControlsComponent: undefined,
  backgroundColor: undefined,
  audioDecibels: undefined,
  containerProps: () => ({}),
  infoOverlayProps: () => ({}),
  controlsOverlayProps: () => ({}),
  waveformContainerProps: () => ({}),
  waveformBarStyle: () => ({}),
  waveformBarClassName: undefined,
  videoDisplayProps: () => ({}),
});

const waveformAnimations = ref<number[]>(Array.from({ length: 9 }, () => 0));
const showWaveformState = ref(true);
let checkAudioInterval: ReturnType<typeof setInterval> | null = null;

const getAnimationDuration = (index: number): number => {
  const durations = [474, 433, 407, 458, 400, 427, 441, 419, 487];
  return durations[index] || 0;
};

const animateBar = (index: number) => {
  if (waveformAnimations.value[index] !== undefined) {
    waveformAnimations.value[index] = 1;
  }

  setTimeout(() => {
    if (waveformAnimations.value[index] !== undefined) {
      waveformAnimations.value[index] = 0;
    }
  }, getAnimationDuration(index));
};

const animateWaveform = () => {
  waveformAnimations.value.forEach((_, index) => {
    setInterval(() => animateBar(index), getAnimationDuration(index) * 2);
  });
};

const resetWaveform = () => {
  waveformAnimations.value = Array.from({ length: 9 }, () => 0);
};

// Check audio levels interval
checkAudioInterval = setInterval(() => {
  const { getUpdatedAllParams } = props.parameters;
  const updatedParams = getUpdatedAllParams();
  const { audioDecibels, participants } = updatedParams;

  const existingEntry =
    audioDecibels && audioDecibels.find((entry: AudioDecibels) => entry.name === props.name);
  const participantEntry =
    participants && participants.find((p: Participant) => p.name === props.name);

  if (
    existingEntry &&
    existingEntry.averageLoudness > 127.5 &&
    participantEntry &&
    !participantEntry.muted
  ) {
    animateWaveform();
  } else {
    resetWaveform();
  }
}, 1000);

// Watch participant muted state
watch(
  () => props.participant?.muted,
  (muted) => {
    if (muted) {
      showWaveformState.value = false;
    } else {
      showWaveformState.value = true;
    }
  },
  { immediate: true }
);

const toggleAudio = async () => {
  if (!props.participant?.muted) {
    const { getUpdatedAllParams } = props.parameters;
    const updatedParams = getUpdatedAllParams();
    await controlMedia({
      participantId: props.participant.id || '',
      participantName: props.participant.name,
      type: 'audio',
  socket: updatedParams.socket as unknown as Socket,
      roomName: updatedParams.roomName,
      coHostResponsibility: updatedParams.coHostResponsibility,
      showAlert: updatedParams.showAlert,
      coHost: updatedParams.coHost,
      participants: updatedParams.participants,
      member: updatedParams.member,
      islevel: updatedParams.islevel,
    });
  }
};

const toggleVideo = async () => {
  if (props.participant?.videoOn) {
    const { getUpdatedAllParams } = props.parameters;
    const updatedParams = getUpdatedAllParams();
    await controlMedia({
      participantId: props.participant.id || '',
      participantName: props.participant.name,
      type: 'video',
  socket: updatedParams.socket as unknown as Socket,
      roomName: updatedParams.roomName,
      coHostResponsibility: updatedParams.coHostResponsibility,
      showAlert: updatedParams.showAlert,
      coHost: updatedParams.coHost,
      participants: updatedParams.participants,
      member: updatedParams.member,
      islevel: updatedParams.islevel,
    });
  }
};

onUnmounted(() => {
  if (checkAudioInterval) {
    clearInterval(checkAudioInterval);
  }
});

// Styles
const cardStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  margin: 0,
  padding: 0,
  backgroundColor: '#2c678f',
  position: 'relative',
};

const overlayWebStyle: CSSProperties = {
  position: 'absolute',
  minWidth: '40%',
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
  padding: '2px 4px',
  marginRight: '2px',
  fontSize: 'medium',
  border: 'none',
  cursor: 'pointer',
};

const nameColumnStyle: CSSProperties = {
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  padding: '5px',
  marginRight: '2px',
  fontSize: 'small',
  textAlign: 'center',
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
  padding: 0,
  flexDirection: 'row',
};

const barStyle: CSSProperties = {
  flex: 1,
  opacity: 0.35,
  margin: '0 1px',
  transition: 'height 0.5s ease',
};

const resolvedVideoDisplayProps = computed(() => props.videoDisplayProps ?? {});

const containerClassNames = computed(() => {
  const baseClass = 'mediasfu-video-card';
  const classes = props.containerProps?.class;
  if (!classes) {
    return baseClass;
  }
  return [baseClass, classes];
});

const containerMergedStyle = computed<CSSProperties>(() => ({
  ...cardStyle,
  ...(props.containerProps?.style as CSSProperties | undefined),
  ...(props.customStyle ?? {}),
  backgroundColor: props.backgroundColor,
}));

const containerRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.containerProps ?? {};
  return rest;
});

const infoOverlayClassNames = computed(() => {
  const baseClass = 'mediasfu-video-card__info-overlay';
  const classes = props.infoOverlayProps?.class;
  if (!classes) {
    return baseClass;
  }
  return [baseClass, classes];
});

const infoOverlayStyle = computed<CSSProperties>(() => ({
  ...getOverlayPosition({ position: props.infoPosition }),
  ...(props.showControls ? overlayWebStyle : overlayWebAltStyle),
  ...(props.infoOverlayProps?.style as CSSProperties | undefined),
}));

const infoOverlayRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.infoOverlayProps ?? {};
  return rest;
});

const controlsOverlayClassNames = computed(() => {
  const baseClass = 'mediasfu-video-card__controls-overlay';
  const classes = props.controlsOverlayProps?.class;
  if (!classes) {
    return baseClass;
  }
  return [baseClass, classes];
});

const controlsOverlayStyle = computed<CSSProperties>(() => ({
  ...overlayControlsStyle,
  ...getOverlayPosition({ position: props.controlsPosition }),
  ...(props.controlsOverlayProps?.style as CSSProperties | undefined),
}));

const controlsOverlayRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.controlsOverlayProps ?? {};
  return rest;
});

const waveformContainerClassNames = computed(() => {
  const baseClass = 'mediasfu-video-card__waveform';
  const classes = props.waveformContainerProps?.class;
  if (!classes) {
    return baseClass;
  }
  return [baseClass, classes];
});

const waveformContainerStyle = computed<CSSProperties>(() => ({
  ...waveformWebStyle,
  ...(props.waveformContainerProps?.style as CSSProperties | undefined),
}));

const waveformContainerRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.waveformContainerProps ?? {};
  return rest;
});

const waveformBarMergedStyle = computed<CSSProperties>(() => ({
  ...barStyle,
  ...(props.waveformBarStyle ?? {}),
}));

const waveformBarClassNames = computed(() => {
  const baseClass = 'mediasfu-video-card__waveform-bar';
  const classes = props.waveformBarClassName;
  if (!classes || (Array.isArray(classes) && classes.length === 0)) {
    return baseClass;
  }
  return Array.isArray(classes) ? [baseClass, ...classes] : [baseClass, classes];
});

</script>
