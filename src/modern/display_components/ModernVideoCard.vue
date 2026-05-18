<template>
  <div
    v-bind="containerRestAttrs"
    :class="containerClassNames"
    :style="containerMergedStyle"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <slot name="extra-widgets" />

    <CardVideoDisplay
      :remote-producer-id="remoteProducerId"
      :event-type="eventType"
      :force-full-display="forceFullDisplay"
      :video-stream="videoStream"
      :background-color="resolvedBackgroundColor"
      :do-mirror="doMirror"
      v-bind="resolvedVideoDisplayProps"
    />

    <div :style="gradientOverlayStyle" />

    <div :style="statusIndicatorStyle" />

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
      <span
        v-if="showWaveformState"
        :style="speakingPulseStyle"
      />
      <span :style="nameStyle">
        {{ name }}
      </span>
      <div
        v-bind="waveformContainerRestAttrs"
        :class="waveformContainerClassNames"
        :style="waveformContainerStyle"
      >
        <div
          v-for="(height, index) in waveformHeights"
          :key="index"
          :class="waveformBarClassNames"
          :style="waveformBarStyleFor(height)"
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
      <button
        type="button"
        :style="controlButtonStyle(!participant?.muted)"
        :disabled="participant?.muted"
        @click="toggleAudio"
      >
        <font-awesome-icon
          :icon="participant?.muted ? faMicrophoneSlash : faMicrophone"
          size="sm"
        />
      </button>
      <button
        type="button"
        :style="controlButtonStyle(Boolean(participant?.videoOn))"
        :disabled="!participant?.videoOn"
        @click="toggleVideo"
      >
        <font-awesome-icon
          :icon="participant?.videoOn ? faVideo : faVideoSlash"
          size="sm"
        />
      </button>
    </div>

    <div
      v-if="resolvedShowSubtitles && resolvedLiveSubtitleText"
      :style="subtitleOverlayStyle"
    >
      <span :style="subtitleTextStyle">
        {{ resolvedLiveSubtitleText }}
      </span>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  watch,
  type CSSProperties,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
} from '@fortawesome/free-solid-svg-icons';
import { controlMedia } from 'mediasfu-shared';
import CardVideoDisplay from '../../components/displayComponents/CardVideoDisplay.vue';
import type { VideoCardProps } from '../../components/displayComponents/VideoCard.vue';

export type ModernVideoCardProps = VideoCardProps;

const props = withDefaults(defineProps<ModernVideoCardProps>(), {
  barColor: 'var(--ms-modern-accent)',
  textColor: 'var(--ms-modern-text-primary)',
  showControls: true,
  showInfo: true,
  controlsPosition: 'topLeft',
  infoPosition: 'bottomLeft',
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
  liveSubtitleText: '',
  showSubtitles: true,
});

const isHovered = ref(false);
const isMounted = ref(false);
const showWaveformState = ref(false);
const waveformHeights = ref<number[]>(Array.from({ length: 5 }, () => 4));

let speakingCheckInterval: ReturnType<typeof setInterval> | null = null;
let waveformAnimationInterval: ReturnType<typeof setInterval> | null = null;

const latestSubtitleParams = computed(() =>
  props.parameters?.getUpdatedAllParams?.() as {
    showSubtitlesOnCards?: boolean;
    getLiveSubtitleForSpeaker?: (speakerId: string, speakerName?: string) => { text?: string } | null;
  } | undefined
);

const resolvedShowSubtitles = computed(
  () => latestSubtitleParams.value?.showSubtitlesOnCards ?? props.showSubtitles,
);

const resolvedLiveSubtitleText = computed(() => {
  const participantId = props.participant?.id || '';
  const participantName = props.participant?.name || props.name;
  const liveSubtitle = latestSubtitleParams.value?.getLiveSubtitleForSpeaker?.(
    participantId,
    participantName,
  );

  return liveSubtitle?.text ?? props.liveSubtitleText ?? '';
});

const resolvedBackgroundColor = computed(
  () => props.backgroundColor ?? 'var(--ms-modern-page-background)',
);

const resolvedVideoDisplayProps = computed(() => props.videoDisplayProps ?? {});

const getPositionStyle = (position: string): CSSProperties => {
  const style: CSSProperties = { position: 'absolute' };
  if (position.includes('top')) {
    style.top = '10px';
  }
  if (position.includes('bottom')) {
    style.bottom = '10px';
  }
  if (position.includes('Left')) {
    style.left = '10px';
  }
  if (position.includes('Right')) {
    style.right = '10px';
  }
  return style;
};

const stopWaveform = () => {
  showWaveformState.value = false;
  waveformHeights.value = Array.from({ length: 5 }, () => 4);
  if (waveformAnimationInterval) {
    clearInterval(waveformAnimationInterval);
    waveformAnimationInterval = null;
  }
};

const startWaveform = () => {
  if (waveformAnimationInterval) {
    return;
  }

  showWaveformState.value = true;
  waveformAnimationInterval = setInterval(() => {
    waveformHeights.value = waveformHeights.value.map(() => Math.round(Math.random() * 12) + 4);
  }, 150);
};

const updateSpeakingState = () => {
  const latestParams = props.parameters?.getUpdatedAllParams?.();
  const latestAudioDecibels = latestParams?.audioDecibels;
  const latestParticipants = latestParams?.participants;

  const existingEntry = latestAudioDecibels?.find((entry) => entry.name === props.name);
  const participantEntry = latestParticipants?.find((participant) => participant.name === props.name);
  const fallbackAverageLoudness = props.audioDecibels?.averageLoudness ?? 0;
  const shouldShowWaveform = Boolean(
    participantEntry
      ? existingEntry && existingEntry.averageLoudness > 127.5 && !participantEntry.muted
      : fallbackAverageLoudness > 127.5 && !props.participant?.muted,
  );

  if (shouldShowWaveform) {
    startWaveform();
  } else {
    stopWaveform();
  }
};

const toggleAudio = async () => {
  if (!props.participant?.muted) {
    const updatedParams = props.parameters.getUpdatedAllParams();
    await controlMedia({
      participantId: props.participant.id || '',
      participantName: props.participant.name,
      type: 'audio',
      socket: updatedParams.socket,
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
    const updatedParams = props.parameters.getUpdatedAllParams();
    await controlMedia({
      participantId: props.participant.id || '',
      participantName: props.participant.name,
      type: 'video',
      socket: updatedParams.socket,
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

watch(
  () => props.participant?.muted,
  (muted) => {
    if (muted) {
      stopWaveform();
    } else {
      updateSpeakingState();
    }
  },
  { immediate: true },
);

onMounted(() => {
  setTimeout(() => {
    isMounted.value = true;
  }, 50);

  speakingCheckInterval = setInterval(updateSpeakingState, 1000);
  updateSpeakingState();
});

onUnmounted(() => {
  if (speakingCheckInterval) {
    clearInterval(speakingCheckInterval);
  }
  if (waveformAnimationInterval) {
    clearInterval(waveformAnimationInterval);
  }
});

const containerClassNames = computed(() => ['mediasfu-modern-video-card', props.containerProps?.class]);

const containerMergedStyle = computed<CSSProperties>(() => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  borderRadius: '16px',
  backgroundColor: resolvedBackgroundColor.value,
  boxShadow: showWaveformState.value
    ? '0 0 0 2.5px rgba(34, 197, 94, 0.9), 0 18px 44px rgba(15, 23, 42, 0.28)'
    : '0 18px 44px rgba(15, 23, 42, 0.28), 0 8px 18px rgba(15, 23, 42, 0.16)',
  transform: isMounted.value ? (isHovered.value ? 'scale(1.01)' : 'scale(1)') : 'scale(0.98)',
  opacity: isMounted.value ? 1 : 0,
  transition: 'transform 180ms ease, opacity 180ms ease, box-shadow 180ms ease',
  ...(props.containerProps?.style as CSSProperties | undefined),
  ...(props.customStyle ?? {}),
}));

const containerRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.containerProps ?? {};
  return rest;
});

const gradientOverlayStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.52) 100%)',
  pointerEvents: 'none',
  zIndex: 1,
};

const statusIndicatorStyle = computed<CSSProperties>(() => ({
  position: 'absolute',
  top: '10px',
  right: '10px',
  width: '10px',
  height: '10px',
  borderRadius: '999px',
  backgroundColor: props.participant?.videoOn ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.95)',
  boxShadow: '0 0 0 2px rgba(15, 23, 42, 0.45)',
  zIndex: 2,
}));

const infoOverlayClassNames = computed(() => ['mediasfu-modern-video-card__info-overlay', props.infoOverlayProps?.class]);

const infoOverlayStyle = computed<CSSProperties>(() => ({
  ...getPositionStyle(props.infoPosition),
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  background: 'transparent',
  zIndex: 2,
  ...(props.infoOverlayProps?.style as CSSProperties | undefined),
}));

const infoOverlayRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.infoOverlayProps ?? {};
  return rest;
});

const speakingPulseStyle: CSSProperties = {
  width: '8px',
  height: '8px',
  borderRadius: '999px',
  backgroundColor: 'rgba(34, 197, 94, 0.95)',
  marginRight: '2px',
  boxShadow: '0 0 12px rgba(34, 197, 94, 0.55)',
};

const nameStyle = computed<CSSProperties>(() => ({
  color: props.textColor,
  fontSize: '12.5px',
  fontWeight: 600,
  letterSpacing: '0.03em',
  textShadow: '0 1px 4px rgba(0, 0, 0, 0.7)',
}));

const waveformContainerClassNames = computed(() => ['mediasfu-modern-video-card__waveform', props.waveformContainerProps?.class]);

const waveformContainerStyle = computed<CSSProperties>(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  height: '16px',
  opacity: showWaveformState.value ? 1 : 0,
  transition: 'opacity 120ms ease',
  ...(props.waveformContainerProps?.style as CSSProperties | undefined),
}));

const waveformContainerRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.waveformContainerProps ?? {};
  return rest;
});

const waveformBarClassNames = computed(() => ['mediasfu-modern-video-card__waveform-bar', props.waveformBarClassName]);

const waveformBarStyleFor = (height: number): CSSProperties => ({
  width: '3px',
  height: `${Math.max(4, height)}px`,
  backgroundColor: props.barColor,
  borderRadius: '999px',
  transition: 'height 60ms linear',
  ...(props.waveformBarStyle ?? {}),
});

const controlsOverlayClassNames = computed(() => ['mediasfu-modern-video-card__controls-overlay', props.controlsOverlayProps?.class]);

const controlsOverlayStyle = computed<CSSProperties>(() => ({
  ...getPositionStyle(props.controlsPosition),
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px',
  background: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '8px',
  opacity: isHovered.value ? 1 : 0,
  transition: 'opacity 120ms ease',
  zIndex: 2,
  ...(props.controlsOverlayProps?.style as CSSProperties | undefined),
}));

const controlsOverlayRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.controlsOverlayProps ?? {};
  return rest;
});

const controlButtonStyle = (isActive: boolean): CSSProperties => ({
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '6px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  background: 'rgba(0, 0, 0, 0.55)',
  color: isActive ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.95)',
  cursor: 'pointer',
  transition: 'transform 120ms ease, background 120ms ease, color 120ms ease',
});

const subtitleOverlayStyle: CSSProperties = {
  position: 'absolute',
  left: '8px',
  right: '8px',
  bottom: 0,
  padding: '6px 10px',
  borderRadius: '8px 8px 0 0',
  backgroundColor: 'rgba(0, 0, 0, 0.62)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  zIndex: 3,
};

const subtitleTextStyle: CSSProperties = {
  display: 'block',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 600,
  textAlign: 'center',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};
</script>
