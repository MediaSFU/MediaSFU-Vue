<!--
/**
 * @fileoverview CardVideoDisplay - Video element wrapper for participant video streams
 * @component CardVideoDisplay
 * @module components/displayComponents/CardVideoDisplay
 * 
 * @description
 * A low-level video element wrapper that displays a participant's remote video stream.
 * Handles video element lifecycle, stream attachment, and responsive sizing based on
 * event type and display mode. Used internally by VideoCard and other video display
 * components to render the actual video element with proper object-fit behavior.
 * 
 * Features:
 * - Automatic MediaStream attachment to video element
 * - Two display modes: forceFullDisplay (cover) or normal (contain)
 * - Event type-aware sizing (conference/webinar vs broadcast)
 * - Optional video mirroring for local streams
 * - Custom background color support
 * - Full HTML attribute passthrough for container and video element
 * - Automatic cleanup on unmount
 * 
 * Display Modes:
 * - **forceFullDisplay: true** - Video fills entire container using object-fit: cover (cropped)
 * - **forceFullDisplay: false** - Video fits within container using object-fit: contain (letterboxed)
 * 
 * Event Type Behavior:
 * - **broadcast**: Forces max-width: 100% for full-width display
 * - **conference/webinar**: Natural video sizing based on aspect ratio
 * 
 * @example Basic Video Display
 * // <CardVideoDisplay
 *   // remoteProducerId="producer-123"
 *   // eventType="conference"
 *   // :forceFullDisplay="false"
 *   // :videoStream="participantStream"
 * // />
 * 
 * @example Full Display Mode (Cover)
 * // <CardVideoDisplay
 *   // remoteProducerId="producer-456"
 *   // eventType="webinar"
 *   // :forceFullDisplay="true"
 *   // :videoStream="stream"
 *   // backgroundColor="rgba(0,0,0,0.9)"
 * // />
 * 
 * @example Mirrored Local Stream
 * // <CardVideoDisplay
 *   // remoteProducerId="local"
 *   // eventType="conference"
 *   // :forceFullDisplay="false"
 *   // :videoStream="localVideoStream"
 *   // :doMirror="true"
 * // />
 * 
 * @example Custom Container Styling
 * // <CardVideoDisplay
 *   // remoteProducerId="producer-789"
 *   // eventType="broadcast"
 *   // :forceFullDisplay="true"
 *   // :videoStream="screenShareStream"
 *   // :containerProps="{ class: 'screen-share-video', style: { border: '2px solid #22c55e' } }"
 *   // :videoProps="{ class: 'broadcast-video' }"
 * // />
 * 
 * @remarks
 * This is a low-level component used primarily by VideoCard. Most applications
 * should use VideoCard or MiniCard instead which provide additional participant
 * information overlays and controls.
 * 
 * Workflow:
 * 1. Component mounts → references video element
 * 2. videoStream provided → calls attachStream() to set video.srcObject
 * 3. Video plays automatically (autoplay, muted, playsinline attributes)
 * 4. Responsive sizing based on forceFullDisplay and eventType
 * 5. Stream changes → detaches old stream, attaches new stream
 * 6. Component unmounts → detaches stream for cleanup
 * 
 * @see {@link VideoCard} - Higher-level video card with overlays and controls
 * @see {@link MiniCard} - Compact video card for gallery view
 */
-->
<template>
  <div
    v-bind="containerRestAttrs"
    :class="containerClassNames"
    :style="containerMergedStyle"
  >
    <video
      ref="videoRef"
      autoplay
      muted
      playsinline
      v-bind="videoRestAttrs"
      :class="videoClassNames"
      :style="videoMergedStyle"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  type CSSProperties,
  type HTMLAttributes,
  type VideoHTMLAttributes,
} from 'vue';
import type { EventType } from '../../../../SharedTypes';

/**
 * Props for the CardVideoDisplay component
 * @interface CardVideoDisplayProps
 * 
 * @property {string} remoteProducerId - Unique identifier for the video producer
 * @property {EventType} eventType - Event type ('conference' | 'webinar' | 'broadcast' | 'chat')
 * @property {boolean} forceFullDisplay - If true, video covers container (object-fit: cover); if false, video fits container (object-fit: contain)
 * @property {MediaStream | null} videoStream - MediaStream to display in the video element
 * @property {string} [backgroundColor='transparent'] - Background color for the container
 * @property {boolean} [doMirror=false] - If true, applies horizontal flip to video (for local streams)
 * @property {HTMLAttributes} [containerProps] - Additional HTML attributes for the container div
 * @property {VideoHTMLAttributes} [videoProps] - Additional HTML attributes for the video element
 * 
 * @default backgroundColor - 'transparent'
 * @default doMirror - false
 * @default containerProps - {}
 * @default videoProps - {}
 * 
 * @example
 * ```typescript
 * // <CardVideoDisplay
 *   // remoteProducerId="producer-abc"
 *   // eventType="conference"
 *   // :forceFullDisplay="true"
 *   // :videoStream="stream"
 *   // backgroundColor="#1a1a1a"
 *   // :doMirror="true"
 *   // :containerProps="{ class: 'video-wrapper' }"
 *   // :videoProps="{ class: 'video-element' }"
 * // />
 * ```
 */
export interface CardVideoDisplayProps {
  remoteProducerId: string;
  eventType: EventType;
  forceFullDisplay: boolean;
  videoStream: MediaStream | null;
  backgroundColor?: string;
  doMirror?: boolean;
  containerProps?: HTMLAttributes;
  videoProps?: VideoHTMLAttributes;
}

const props = withDefaults(defineProps<CardVideoDisplayProps>(), {
  backgroundColor: 'transparent',
  doMirror: false,
  containerProps: () => ({}),
  videoProps: () => ({}),
});

const videoRef = ref<HTMLVideoElement | null>(null);

const setVideoStream = (stream: MediaStream | null | undefined) => {
  const element = videoRef.value;
  if (!(element instanceof HTMLVideoElement)) {
    return;
  }

  if (!stream) {
    element.srcObject = null;
    return;
  }

  if (typeof MediaStream !== 'undefined' && !(stream instanceof MediaStream)) {
    element.srcObject = null;
    return;
  }

  element.srcObject = stream;

  if (stream instanceof MediaStream) {
    const playPromise = element.play?.();
    if (playPromise instanceof Promise) {
      playPromise.catch(() => {
        /* Suppress autoplay rejections */
      });
    }
  }
};

// Watch videoStream changes and update srcObject
watch(
  () => props.videoStream,
  (newStream) => {
    setVideoStream(newStream ?? null);
  },
  { immediate: true, flush: 'post' }
);

onMounted(() => {
  setVideoStream(props.videoStream ?? null);
});

onBeforeUnmount(() => {
  const element = videoRef.value;
  if (element instanceof HTMLVideoElement) {
    element.srcObject = null;
  }
});

const videoBaseStyle = computed<CSSProperties>(() => {
  const baseStyles: CSSProperties = {
    width: props.forceFullDisplay ? '100%' : 'auto',
    height: '100%',
    objectFit: props.forceFullDisplay ? 'cover' : 'contain',
    backgroundColor: props.backgroundColor,
    maxHeight: '100%',
    maxWidth: '100%',
  };

  if (props.doMirror) {
    baseStyles.transform = 'rotateY(180deg)';
  }

  return baseStyles;
});

const videoRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.videoProps ?? {};
  return rest;
});

const videoClassNames = computed(() => [
  props.videoProps?.class,
]);

const videoMergedStyle = computed(() => ({
  ...videoBaseStyle.value,
  ...(props.videoProps?.style as CSSProperties | undefined),
}));

const videoContainerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'black',
  width: '100%',
  height: '100%',
};

const containerRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.containerProps ?? {};
  return rest;
});

const containerClassNames = computed(() => [
  'mediasfu-card-video',
  props.containerProps?.class,
]);

const containerMergedStyle = computed(() => ({
  ...videoContainerStyle,
  ...(props.containerProps?.style as CSSProperties | undefined),
  backgroundColor: props.backgroundColor,
}));

</script>
