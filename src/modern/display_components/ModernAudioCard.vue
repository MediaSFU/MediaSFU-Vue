<template>
  <div
    v-bind="cardRestAttrs"
    :class="cardClassNames"
    :style="containerStyle"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div :style="avatarContainerStyle">
      <div
        v-if="showWaveformState"
        :style="waveformRingContainerStyle"
      >
        <div
          v-for="(height, index) in waveformLevels"
          :key="index"
          :style="waveformRingBarStyle(index, height)"
        />
      </div>

      <div :style="avatarWrapperStyle">
        <ModernMiniCard
          :initials="name"
          :image-source="imageSource"
          :rounded-image="resolvedMiniCardProps.roundedImage"
          :font-size="resolvedMiniCardProps.fontSize"
          :custom-style="resolvedMiniCardProps.customStyle"
          :container-props="resolvedMiniCardProps.containerProps"
          :image-container-props="resolvedMiniCardProps.imageContainerProps"
          :image-style="resolvedMiniCardProps.imageStyle"
          :initials-container-props="resolvedMiniCardProps.initialsContainerProps"
        />
      </div>
    </div>

    <div :style="glassOverlayStyle" />

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
        <template v-if="renderWaveformBar">
          <RenderVNode
            v-for="(height, index) in waveformLevels"
            :key="`custom-wave-${index}`"
            :node="renderWaveformBar({
              index,
              isActive: showWaveformState,
              height,
              style: waveformBarStyleFor(height),
              props: waveformBarProps ?? {},
            })"
          />
        </template>
        <template v-else>
          <div
            v-for="(height, index) in waveformLevels"
            :key="index"
            :style="waveformBarStyleFor(height)"
            v-bind="waveformBarProps"
          />
        </template>
      </div>
    </div>

    <div
      v-if="resolvedShowSubtitles && resolvedLiveSubtitleText"
      :style="subtitleOverlayStyle"
    >
      <span :style="subtitleTextStyle">
        {{ resolvedLiveSubtitleText }}
      </span>
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
        v-bind="controlButtonProps?.audio"
        type="button"
        :style="controlButtonStyle(!participant?.muted)"
        @click="toggleAudio"
      >
        <RenderVNode :node="audioButtonIcon" />
      </button>
      <button
        v-bind="controlButtonProps?.video"
        type="button"
        :style="controlButtonStyle(Boolean(participant?.videoOn))"
        @click="toggleVideo"
      >
        <RenderVNode :node="videoButtonIcon" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  ref,
  watch,
  type CSSProperties,
  type PropType,
  type VNodeChild,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
} from '@fortawesome/free-solid-svg-icons';
import { controlMedia } from 'mediasfu-shared';
import type { AudioCardProps } from '../../components/displayComponents/AudioCard.vue';
import type { MiniCardProps } from '../../components/displayComponents/MiniCard.vue';
import ModernMiniCard from './ModernMiniCard.vue';

export type ModernAudioCardProps = AudioCardProps;

const RenderVNode = defineComponent({
  name: 'RenderVNode',
  props: {
    node: {
      type: null as unknown as PropType<VNodeChild>,
      required: true,
    },
  },
  setup(renderProps) {
    return () => renderProps.node;
  },
});

const props = withDefaults(defineProps<ModernAudioCardProps>(), {
  controlUserMedia: controlMedia,
  barColor: 'var(--ms-modern-accent)',
  textColor: 'var(--ms-modern-text-primary)',
  roundedImage: true,
  showControls: true,
  showInfo: true,
  controlsPosition: 'topRight',
  infoPosition: 'bottomLeft',
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
  waveformBarCount: 5,
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
  liveSubtitleText: '',
  showSubtitles: true,
});

const isHovered = ref(false);
const isMounted = ref(false);
const showWaveformState = ref(false);
const waveformLevels = ref<number[]>(Array.from({ length: props.waveformBarCount }, () => 3));

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

const silentHeight = computed(() => props.waveformHeights?.silent ?? 3);
const activeHeight = computed(() => props.waveformHeights?.active ?? 24);

const stopWaveform = () => {
  showWaveformState.value = false;
  waveformLevels.value = Array.from({ length: props.waveformBarCount }, () => silentHeight.value);
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
    waveformLevels.value = waveformLevels.value.map(
      () => Math.round(Math.random() * Math.max(activeHeight.value - silentHeight.value, 6)) + silentHeight.value,
    );
  }, 150);
};

const evaluateAudioLevels = () => {
  const updatedParameters = props.parameters?.getUpdatedAllParams?.();
  const participantEntry = updatedParameters?.participants?.find((participant) => participant.name === props.name) ?? props.participant;
  const averageLoudness = updatedParameters?.audioDecibels?.find((entry) => entry.name === props.name)?.averageLoudness ?? props.audioDecibels?.averageLoudness ?? 0;

  const shouldShowWaveform = averageLoudness > 127.5 && (!participantEntry?.muted || props.showWaveformWhenMuted);

  if (shouldShowWaveform) {
    startWaveform();
  } else {
    stopWaveform();
  }
};

watch(
  () => props.waveformBarCount,
  (nextCount) => {
    waveformLevels.value = Array.from({ length: nextCount }, () => silentHeight.value);
  },
  { immediate: true },
);

watch(
  () => props.participant?.muted,
  (muted) => {
    if (muted && !props.showWaveformWhenMuted) {
      stopWaveform();
    } else {
      evaluateAudioLevels();
    }
  },
  { immediate: true },
);

onMounted(() => {
  setTimeout(() => {
    isMounted.value = true;
  }, 50);

  speakingCheckInterval = setInterval(evaluateAudioLevels, 1000);
  evaluateAudioLevels();
});

onUnmounted(() => {
  if (speakingCheckInterval) {
    clearInterval(speakingCheckInterval);
  }
  if (waveformAnimationInterval) {
    clearInterval(waveformAnimationInterval);
  }
});

const toggleAudio = async () => {
  if (!props.participant?.muted && props.controlUserMedia) {
    const updatedParams = props.parameters.getUpdatedAllParams();
    await props.controlUserMedia({
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
  if (props.participant?.videoOn && props.controlUserMedia) {
    const updatedParams = props.parameters.getUpdatedAllParams();
    await props.controlUserMedia({
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

const defaultMiniCardProps = computed<Partial<MiniCardProps>>(() => ({
  roundedImage: true,
  fontSize: 28,
  customStyle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    background: 'transparent',
    border: 'none',
    borderRadius: '0',
    boxShadow: 'none',
    color: 'var(--ms-modern-text-primary)',
  },
  containerProps: {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
    },
  },
  imageContainerProps: {
    style: {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      overflow: 'hidden',
      background: 'var(--ms-modern-page-background-accent)',
      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.18), 0 2px 6px rgba(15, 23, 42, 0.1)',
    },
  },
  imageStyle: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  initialsContainerProps: {
    style: {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 55%, var(--ms-modern-accent) 100%)',
      border: '1px solid rgba(99, 102, 241, 0.4)',
      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.18), 0 2px 6px rgba(15, 23, 42, 0.1)',
      color: 'var(--ms-modern-text-primary)',
    },
  },
}));

const resolvedMiniCardProps = computed<Partial<MiniCardProps>>(() => ({
  ...defaultMiniCardProps.value,
  ...(props.fallbackMiniCardProps ?? {}),
  roundedImage: props.fallbackMiniCardProps?.roundedImage ?? defaultMiniCardProps.value.roundedImage,
  fontSize: props.fallbackMiniCardProps?.fontSize ?? defaultMiniCardProps.value.fontSize,
  customStyle: {
    ...(defaultMiniCardProps.value.customStyle ?? {}),
    ...(props.fallbackMiniCardProps?.customStyle ?? {}),
  },
  containerProps: {
    ...(defaultMiniCardProps.value.containerProps ?? {}),
    ...(props.fallbackMiniCardProps?.containerProps ?? {}),
  },
  imageContainerProps: {
    ...(defaultMiniCardProps.value.imageContainerProps ?? {}),
    ...(props.fallbackMiniCardProps?.imageContainerProps ?? {}),
  },
  imageStyle: {
    ...(defaultMiniCardProps.value.imageStyle ?? {}),
    ...(props.fallbackMiniCardProps?.imageStyle ?? {}),
  },
  initialsContainerProps: {
    ...(defaultMiniCardProps.value.initialsContainerProps ?? {}),
    ...(props.fallbackMiniCardProps?.initialsContainerProps ?? {}),
  },
}));

const resolvedBackgroundColor = computed(
  () => props.backgroundColor ?? 'linear-gradient(135deg, var(--ms-modern-page-background) 0%, var(--ms-modern-page-background-accent) 50%, var(--ms-modern-panel-surface-elevated) 100%)',
);

const containerStyle = computed<CSSProperties>(() => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  borderRadius: '16px',
  background: resolvedBackgroundColor.value,
  boxShadow: showWaveformState.value
    ? '0 0 0 2.5px rgba(34, 197, 94, 0.9), 0 18px 44px rgba(15, 23, 42, 0.28)'
    : '0 18px 44px rgba(15, 23, 42, 0.28), 0 8px 18px rgba(15, 23, 42, 0.16)',
  transform: isMounted.value ? (isHovered.value ? 'scale(1.02)' : 'scale(1)') : 'scale(0.97)',
  opacity: isMounted.value ? 1 : 0,
  transition: 'transform 180ms ease, opacity 180ms ease, box-shadow 180ms ease',
  ...(props.cardProps?.style as CSSProperties | undefined),
  ...(props.customStyle ?? {}),
}));

const cardClassNames = computed(() => ['mediasfu-modern-audio-card', props.cardProps?.class]);

const cardRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.cardProps ?? {};
  return rest;
});

const avatarContainerStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const avatarWrapperStyle = computed<CSSProperties>(() => ({
  width: '150px',
  height: '150px',
  aspectRatio: '1 / 1',
  borderRadius: '50%',
  padding: '3px',
  transform: showWaveformState.value ? 'scale(1.02)' : 'scale(1)',
  transition: 'transform 180ms ease',
}));

const waveformRingContainerStyle: CSSProperties = {
  position: 'absolute',
  width: '190px',
  height: '190px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const waveformRingBarStyle = (index: number, height: number): CSSProperties => ({
  position: 'absolute',
  width: '4px',
  height: `${Math.max(silentHeight.value, Math.min(activeHeight.value + 4, height))}px`,
  backgroundColor: props.barColor,
  borderRadius: '2px',
  transform: `rotate(${index * (360 / props.waveformBarCount)}deg) translateY(-90px)`,
  transformOrigin: 'center',
  transition: 'height 100ms linear',
});

const glassOverlayStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 52%)',
  pointerEvents: 'none',
};

const infoOverlayClassNames = computed(() => ['mediasfu-modern-audio-card__info-overlay', props.infoOverlayProps?.class]);

const infoOverlayStyle = computed<CSSProperties>(() => ({
  ...getPositionStyle(props.infoPosition),
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '2px 6px',
  background: 'transparent',
  zIndex: 2,
  ...(props.infoOverlayProps?.style as CSSProperties | undefined),
}));

const infoOverlayRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.infoOverlayProps ?? {};
  return rest;
});

const speakingPulseStyle: CSSProperties = {
  width: '6px',
  height: '6px',
  borderRadius: '999px',
  backgroundColor: 'rgba(34, 197, 94, 0.95)',
  marginRight: '4px',
  boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
};

const nameStyle = computed<CSSProperties>(() => ({
  color: props.textColor,
  fontSize: '12.5px',
  fontWeight: 600,
  textShadow: '0 1px 4px rgba(0,0,0,0.7)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const waveformContainerClassNames = computed(() => ['mediasfu-modern-audio-card__waveform', props.waveformContainerProps?.class]);

const waveformContainerStyle = computed<CSSProperties>(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '1px',
  height: '14px',
  opacity: showWaveformState.value ? 1 : 0,
  transition: 'opacity 120ms ease',
  ...(props.waveformContainerProps?.style as CSSProperties | undefined),
}));

const waveformContainerRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.waveformContainerProps ?? {};
  return rest;
});

const waveformBarStyleFor = (height: number): CSSProperties => ({
  width: '3px',
  height: showWaveformState.value ? `${Math.max(silentHeight.value, Math.min(activeHeight.value, height))}px` : `${silentHeight.value}px`,
  backgroundColor: props.barColor,
  borderRadius: '2px',
  transition: 'height 120ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  ...(props.waveformBarStyle ?? {}),
});

const controlsOverlayClassNames = computed(() => ['mediasfu-modern-audio-card__controls-overlay', props.controlsOverlayProps?.class]);

const controlsOverlayStyle = computed<CSSProperties>(() => ({
  ...getPositionStyle(props.controlsPosition),
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
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
  border: '1px solid rgba(255,255,255,0.08)',
  cursor: 'pointer',
  background: 'rgba(0, 0, 0, 0.55)',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  color: isActive ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.95)',
  transition: 'transform 120ms ease, background 120ms ease, color 120ms ease',
  fontSize: '12px',
});

const audioButtonIcon = computed<VNodeChild>(() => {
  if (props.participant?.muted) {
    return props.audioDisabledIcon ?? h(FontAwesomeIcon, { icon: faMicrophoneSlash });
  }
  return props.audioEnabledIcon ?? h(FontAwesomeIcon, { icon: faMicrophone });
});

const videoButtonIcon = computed<VNodeChild>(() => {
  if (props.participant?.videoOn) {
    return props.videoEnabledIcon ?? h(FontAwesomeIcon, { icon: faVideo });
  }
  return props.videoDisabledIcon ?? h(FontAwesomeIcon, { icon: faVideoSlash });
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
