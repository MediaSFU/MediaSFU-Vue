<template>
  <div :style="containerStyle">
    <audio
      v-if="streamRef"
      ref="audioRef"
      autoplay
      playsinline
    />
    <component
      :is="resolvedMiniAudioComponent"
      v-if="showMiniAudio && resolvedMiniAudioComponent"
      v-bind="resolvedMiniAudioProps"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, nextTick, type CSSProperties, type Component } from 'vue';
import MiniAudio from '../../../components/displayComponents/MiniAudio.vue';
import type { Consumer } from 'mediasoup-client';
import type { BreakoutParticipant, Participant } from '../../../../../SharedTypes';

interface MiniAudioPlayerParameters {
  breakOutRoomStarted: boolean;
  breakOutRoomEnded: boolean;
  limitedBreakRoom: BreakoutParticipant[];
  reUpdateInter?: (options: Record<string, unknown>) => void | Promise<void>;
  updateParticipantAudioDecibels?: (options: Record<string, unknown>) => void;
  getUpdatedAllParams: () => MiniAudioPlayerParameters & Record<string, unknown>;
  updateActiveSounds?: (sounds: string[]) => void;
  miniAudioComponent?: Component;
  [key: string]: unknown;
}

export interface MiniAudioPlayerProps {
  stream: MediaStream | null;
  remoteProducerId: string;
  consumer: Consumer;
  parameters: MiniAudioPlayerParameters;
  miniAudioComponent?: Component | null;
  miniAudioProps?: Record<string, unknown>;
}

const props = withDefaults(defineProps<MiniAudioPlayerProps>(), {
  stream: null,
  miniAudioComponent: null,
  miniAudioProps: () => ({}),
});

const audioRef = ref<HTMLAudioElement | null>(null);
const showWaveModal = ref(false);
const isMuted = ref(false);
const autoWaveCheck = ref(false);

// Resolve miniAudioComponent from props or parameters
const parameterMiniAudioComponent = computed<Component | undefined>(
  () => props.parameters.miniAudioComponent as Component | undefined
);

const resolvedMiniAudioComponent = computed<Component | null>(
  () => props.miniAudioComponent ?? parameterMiniAudioComponent.value ?? MiniAudio
);

const resolvedMiniAudioProps = computed<Record<string, unknown>>(() => ({
  ...(props.miniAudioProps ?? {}),
  showWaveform: showWaveModal.value,
  visible: showWaveModal.value && !isMuted.value,
}));

const showMiniAudio = computed(() => showWaveModal.value && !isMuted.value && resolvedMiniAudioComponent.value);
const streamRef = computed(() => props.stream);

const containerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9,
};

let intervalId: number | null = null;

const stopMonitoring = () => {
  if (intervalId !== null) {
    window.clearInterval(intervalId);
    intervalId = null;
  }
};

const setAudioSource = (stream: MediaStream | null) => {
  nextTick(() => {
    const element = audioRef.value;
    if (!element) {
      return;
    }
    element.srcObject = stream;
    if (stream) {
      const playPromise = element.play?.();
      if (playPromise instanceof Promise) {
        playPromise.catch(() => {
          /* ignore autoplay rejection */
        });
      }
    }
  });
};

const startMonitoring = () => {
  stopMonitoring();
  if (!props.stream) {
    return;
  }

  const baseParams = props.parameters;
  let consLow = false;

  intervalId = window.setInterval(async () => {
    let averageLoudness = 128;

    try {
      const receiver = props.consumer?.rtpReceiver;
      const stats = await receiver?.getStats?.();
      stats?.forEach((report) => {
        const stat = report as { type?: string; kind?: string; audioLevel?: number };
        if (stat.type === 'inbound-rtp' && stat.kind === 'audio' && typeof stat.audioLevel === 'number') {
          averageLoudness = 127.5 + stat.audioLevel * 127.5;
        }
      });
    } catch {
      /* stats unavailable */
    }

    const updatedParams = baseParams.getUpdatedAllParams?.() ?? baseParams;
    const {
      eventType,
      meetingDisplayType,
      shared,
      shareScreenStarted,
      dispActiveNames = [],
      adminNameStream: initialAdminNameStream,
      participants = [],
      activeSounds: activeSoundsRaw = [],
      autoWave = false,
      updateActiveSounds,
      paginatedStreams = [],
      currentUserPage = 0,
      reUpdateInter: updatedReUpdateInter,
      updateParticipantAudioDecibels: updatedUpdateParticipantAudioDecibels,
      breakOutRoomStarted: updatedBreakoutStarted,
      breakOutRoomEnded: updatedBreakoutEnded,
      limitedBreakRoom: updatedLimitedBreakRoom,
    } = updatedParams as MiniAudioPlayerParameters & Record<string, unknown>;

    const reUpdateInter = updatedReUpdateInter ?? baseParams.reUpdateInter;
    const updateParticipantAudioDecibels = updatedUpdateParticipantAudioDecibels ?? baseParams.updateParticipantAudioDecibels;
    const breakOutRoomStarted = updatedBreakoutStarted ?? baseParams.breakOutRoomStarted ?? false;
    const breakOutRoomEnded = updatedBreakoutEnded ?? baseParams.breakOutRoomEnded ?? false;
    const limitedBreakRoom = updatedLimitedBreakRoom ?? baseParams.limitedBreakRoom ?? [];

    const activeSounds = Array.isArray(activeSoundsRaw) ? [...activeSoundsRaw] : [];
    const autoWaveEnabled = typeof autoWave === 'boolean' ? autoWave : false;
    const paginatedList = Array.isArray(paginatedStreams) ? paginatedStreams : [];
    const pageIndex = typeof currentUserPage === 'number' ? currentUserPage : 0;
    const currentPage = Array.isArray(paginatedList[pageIndex])
      ? (paginatedList[pageIndex] as unknown[])
      : [];
    const displayedNames = Array.isArray(dispActiveNames) ? dispActiveNames : [];
    const participant = (participants as Participant[]).find((obj) => obj.audioID === props.remoteProducerId);

    let audioActiveInRoom = true;
    if (participant && breakOutRoomStarted && !breakOutRoomEnded) {
      const restrictedNames = new Set((limitedBreakRoom as BreakoutParticipant[]).map((obj) => obj.name));
      if (participant.name && !restrictedNames.has(participant.name)) {
        audioActiveInRoom = false;
      }
    }

    if (meetingDisplayType !== 'video') {
      autoWaveCheck.value = true;
    }
    if (shared || shareScreenStarted) {
      autoWaveCheck.value = false;
    }

    if (participant) {
      isMuted.value = participant.muted ?? false;

      if (eventType !== 'chat' && eventType !== 'broadcast') {
        updateParticipantAudioDecibels?.({
          name: participant.name ?? '',
          averageLoudness,
          audioDecibels: updatedParams.audioDecibels,
          updateAudioDecibels: updatedParams.updateAudioDecibels,
        });
      }

      let adminNameStream = initialAdminNameStream as string | undefined;
      const getEntryName = (entry: unknown): string | undefined => {
        if (entry && typeof entry === 'object' && 'name' in entry) {
          const value = (entry as { name?: unknown }).name;
          if (typeof value === 'string') {
            return value;
          }
        }
        return undefined;
      };

      const inPage = (currentPage as unknown[]).findIndex((entry) => getEntryName(entry) === participant.name);

      if (participant.name && !displayedNames.includes(participant.name) && inPage === -1) {
        autoWaveCheck.value = false;
        if (!adminNameStream) {
          const adminParticipant = (participants as Participant[]).find((obj) => obj.islevel === '2');
          adminNameStream = adminParticipant?.name ?? '';
        }
        if (participant.name === adminNameStream) {
          autoWaveCheck.value = true;
        }
      } else {
        autoWaveCheck.value = true;
      }

      if (
        participant.videoID ||
        autoWaveCheck.value ||
        (breakOutRoomStarted && !breakOutRoomEnded && audioActiveInRoom)
      ) {
        showWaveModal.value = false;

        if (averageLoudness > 127.5) {
          consLow = false;
          if (participant.name && !activeSounds.includes(participant.name)) {
            activeSounds.push(participant.name);
            if (!(shareScreenStarted || shared) || participant.videoID) {
              if (eventType !== 'chat' && eventType !== 'broadcast' && participant.name) {
                void reUpdateInter?.({
                  name: participant.name,
                  add: true,
                  average: averageLoudness,
                  parameters: updatedParams,
                });
              }
            }
          }
        } else {
          if (participant.name && activeSounds.includes(participant.name) && consLow) {
            activeSounds.splice(activeSounds.indexOf(participant.name), 1);
            if (!(shareScreenStarted || shared) || participant.videoID) {
              if (eventType !== 'chat' && eventType !== 'broadcast' && participant.name) {
                void reUpdateInter?.({
                  name: participant.name,
                  average: averageLoudness,
                  parameters: updatedParams,
                });
              }
            }
          } else {
            consLow = true;
          }
        }
      } else {
        if (averageLoudness > 127.5) {
          showWaveModal.value = autoWaveEnabled;
          if (participant.name && !activeSounds.includes(participant.name)) {
            activeSounds.push(participant.name);
          }
          if ((shareScreenStarted || shared) && !participant.videoID) {
            /* do nothing */
          } else if (eventType !== 'chat' && eventType !== 'broadcast' && participant.name) {
            void reUpdateInter?.({
              name: participant.name,
              add: true,
              average: averageLoudness,
              parameters: updatedParams,
            });
          }
        } else {
          showWaveModal.value = false;
          if (participant.name && activeSounds.includes(participant.name)) {
            activeSounds.splice(activeSounds.indexOf(participant.name), 1);
          }
          if ((shareScreenStarted || shared) && !participant.videoID) {
            /* do nothing */
          } else if (eventType !== 'chat' && eventType !== 'broadcast' && participant.name) {
            void reUpdateInter?.({
              name: participant.name,
              average: averageLoudness,
              parameters: updatedParams,
            });
          }
        }
      }

      updateActiveSounds?.(activeSounds);
    } else {
      showWaveModal.value = false;
      isMuted.value = true;
    }
  }, 2000);
};

watch(
  () => props.stream,
  (stream) => {
    setAudioSource(stream);
    if (stream) {
      startMonitoring();
    } else {
      showWaveModal.value = false;
      isMuted.value = true;
      stopMonitoring();
    }
  },
  { immediate: true }
);

watch(
  () => props.consumer,
  () => {
    if (props.stream) {
      startMonitoring();
    }
  }
);

onBeforeUnmount(() => {
  stopMonitoring();
});
</script>

<style scoped>
/* No additional styles */
</style>
