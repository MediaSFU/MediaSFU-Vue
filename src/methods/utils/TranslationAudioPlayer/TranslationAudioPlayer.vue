<template>
  <audio
    ref="audioRef"
    autoplay
    playsinline
    data-translation-audio-player="true"
    :data-producer-id="producerId ?? ''"
    style="display: none"
    @loadedmetadata="schedulePlaybackRetry"
    @canplay="schedulePlaybackRetry"
    @playing="clearRetryTimer"
    @stalled="schedulePlaybackRetry"
  />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

export interface TranslationAudioPlayerProps {
  stream: MediaStream | null;
  producerId?: string;
}

const props = defineProps<TranslationAudioPlayerProps>();

const audioRef = ref<HTMLAudioElement | null>(null);
const maxPlaybackRetries = 10;
const playbackRetryDelayMs = 120;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let removeTrackListeners: (() => void) | null = null;

const clearRetryTimer = () => {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
};

const playAudio = async () => {
  const element = audioRef.value;
  if (!element || !props.stream) {
    return;
  }

  if (element.srcObject !== props.stream) {
    element.srcObject = props.stream;
  }

  try {
    await element.play();
  } catch {
    // Ignore autoplay rejections and rely on later retries.
  }

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => {
      if (element.paused && element.srcObject) {
        element.play().catch(() => {});
      }
    });
  }
};

const hasStartedPlayback = () => {
  const element = audioRef.value;
  if (!element || !element.srcObject || element.paused) {
    return false;
  }

  return typeof HTMLMediaElement === 'undefined'
    || element.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
};

const schedulePlaybackRetry = () => {
  let attempts = 0;

  clearRetryTimer();

  const run = () => {
    retryTimer = null;
    void playAudio();

    if (hasStartedPlayback() || attempts >= maxPlaybackRetries) {
      return;
    }

    attempts += 1;
    retryTimer = setTimeout(run, playbackRetryDelayMs);
  };

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(run);
  } else {
    run();
  }
};

const attachTrackListeners = (stream: MediaStream | null) => {
  removeTrackListeners?.();
  removeTrackListeners = null;

  if (!stream) {
    return;
  }

  const cleanupCallbacks = stream.getAudioTracks().map((track) => {
    const retry = () => schedulePlaybackRetry();
    track.addEventListener('unmute', retry);
    return () => track.removeEventListener('unmute', retry);
  });

  removeTrackListeners = () => {
    cleanupCallbacks.forEach((cleanup) => cleanup());
  };
};

watch(
  () => props.stream,
  (stream) => {
    attachTrackListeners(stream);
    schedulePlaybackRetry();
  },
  { immediate: true },
);

onMounted(() => {
  schedulePlaybackRetry();
});

onBeforeUnmount(() => {
  clearRetryTimer();
  removeTrackListeners?.();
  removeTrackListeners = null;

  const element = audioRef.value;
  if (!element) {
    return;
  }

  element.pause();
  element.srcObject = null;
});
</script>