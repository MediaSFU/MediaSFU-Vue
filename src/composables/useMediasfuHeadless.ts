import { computed, ref, shallowRef } from 'vue';
import {
  createRoomPoll,
  disableParticipantVideo,
  endRoomPoll,
  getAudioGridComponents,
  getBreakoutState,
  getLocalAudioStream,
  getLocalVideoStream,
  getModerationPermissions,
  getPollState,
  getRecordingState,
  getRemoteVideoStreams,
  getRoomReadiness,
  getScreenShareStream,
  getWhiteboardState,
  leaveRoom,
  listParticipantMediaStates,
  muteEveryone,
  muteParticipant,
  pauseRoomRecording,
  produceCanvas,
  produceDisplay,
  produceElement,
  produceMedia,
  removeParticipant,
  replaceProducerTrack,
  respondToParticipantRequest,
  respondToWaitingParticipant,
  resumeRoomRecording,
  runMediaControl,
  sendChatMessage,
  setCoHost,
  setParticipantMedia,
  startRoomRecording,
  startWhiteboard,
  stopParticipantScreenShare,
  stopProducing,
  stopRoomRecording,
  stopWhiteboard,
  switchCamera,
  switchMicrophone,
  flipCamera,
  voteInRoomPoll,
  type HeadlessParameters,
  type ProducerKind,
} from 'mediasfu-shared';

/**
 * The Vue equivalent of the React SDK's `useMediasfuHeadless`.
 *
 * Field names deliberately mirror the hook one-for-one, so every recipe in
 * HEADLESS_GUIDE.md reads the same here — only the reactivity idiom changes
 * (`ref`/`computed` instead of `useState`/`useMemo`).
 *
 * Two rules are baked in, and they are where most headless integrations go
 * wrong:
 *
 *  - **Take every publication.** Each field on the bag is a snapshot of an
 *    internal ref the SDK reassigns, so a bag you hold is stale the moment a
 *    producer changes. De-duplicating or deep-comparing publications freezes
 *    your UI on whatever it rendered first.
 *  - **Keep `sourceParameters` stable.** The object handed to the component is a
 *    seed it writes through; a fresh object each render makes the SDK re-render
 *    and can loop. This composable keeps one seed and tracks state itself.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useMediasfuHeadless } from 'mediasfu-vue';
 * const room = useMediasfuHeadless();
 * </script>
 *
 * <template>
 *   <MediasfuGeneric
 *     :source-parameters="room.sourceParameters"
 *     :update-source-parameters="room.updateSourceParameters"
 *     :return-u-i="false"
 *     @media-changed="room.onMediaChanged"
 *   />
 *   <video v-if="room.localVideo.value" :srcObject="room.localVideo.value" autoplay muted playsinline />
 *   <button @click="room.controls.toggleMic()">Mic</button>
 * </template>
 * ```
 */
export function useMediasfuHeadless() {
  // One seed object for the whole lifetime — see the stability rule above.
  const seed: HeadlessParameters = {};
  // shallowRef: the bag is a large object graph containing MediaStreams and
  // producers. Deep reactivity would walk all of it on every publication and
  // can choke on non-plain objects.
  const parameters = shallowRef<HeadlessParameters>(seed);
  const sourceChanged = ref(0);

  const updateSourceParameters = (next: HeadlessParameters) => {
    // Assigning a new object identity every time is intentional: this is the
    // signal that something changed, and comparing contents would suppress it.
    parameters.value = next || {};
    sourceChanged.value += 1;
  };

  const onMediaChanged = (info: { reasons: string[]; parameters: HeadlessParameters }) => {
    if (info?.parameters) updateSourceParameters(info.parameters);
    else sourceChanged.value += 1;
  };

  /** Read the newest bag at call time so actions never close over a stale one. */
  const live = () => parameters.value;

  const readiness = computed(() => getRoomReadiness({ parameters: parameters.value }));

  const controls = {
    toggleMic: () => runMediaControl({ parameters: live(), control: 'clickAudio' }),
    toggleCamera: () => runMediaControl({ parameters: live(), control: 'clickVideo' }),
    toggleScreenShare: () => runMediaControl({ parameters: live(), control: 'clickScreenShare' }),
    // Not runMediaControl: switchAudio/switchVideo are never published on the
    // parameter bag, so routing through it always failed.
    selectMic: (deviceId: string) => switchMicrophone({ parameters: live(), deviceId }),
    selectCamera: (deviceId: string) => switchCamera({ parameters: live(), deviceId }),
    flipCamera: () => flipCamera({ parameters: live() }),
    sendChat: (message: string, options: { receivers?: string[]; group?: boolean } = {}) =>
      sendChatMessage({
        parameters: live(),
        message,
        receivers: options.receivers,
        group: options.group,
      }),
    leave: (ban = false, endRoomOnHostExit = true) =>
      leaveRoom({ parameters: live(), ban, endRoomOnHostExit }),
  };

  const moderation = {
    permissions: computed(() => getModerationPermissions({ parameters: parameters.value })),
    muteParticipant: (name: string) => muteParticipant({ parameters: live(), name }),
    disableParticipantVideo: (name: string) =>
      disableParticipantVideo({ parameters: live(), name }),
    stopParticipantScreenShare: (name: string) =>
      stopParticipantScreenShare({ parameters: live(), name }),
    setParticipantMedia: (name: string, kind: 'audio' | 'video' | 'screenshare' | 'all') =>
      setParticipantMedia({ parameters: live(), name, kind }),
    muteEveryone: (kind: 'audio' | 'video' | 'screenshare' | 'all' = 'audio') =>
      muteEveryone({ parameters: live(), kind }),
    removeParticipant: (name: string) => removeParticipant({ parameters: live(), name }),
    admitWaiting: (nameOrId: string) =>
      respondToWaitingParticipant({ parameters: live(), id: nameOrId, name: nameOrId, admit: true }),
    denyWaiting: (nameOrId: string) =>
      respondToWaitingParticipant({ parameters: live(), id: nameOrId, name: nameOrId, admit: false }),
    approveRequest: (requestId: string) =>
      respondToParticipantRequest({ parameters: live(), requestId, approve: true }),
    rejectRequest: (requestId: string) =>
      respondToParticipantRequest({ parameters: live(), requestId, approve: false }),
    setCoHost: (name: string, areas?: any[]) =>
      setCoHost({ parameters: live(), name, areas }),
  };

  const session = {
    recording: computed(() => getRecordingState({ parameters: parameters.value })),
    whiteboard: computed(() => getWhiteboardState({ parameters: parameters.value })),
    polls: computed(() => getPollState({ parameters: parameters.value })),
    breakout: computed(() => getBreakoutState({ parameters: parameters.value })),
    startRecording: () => startRoomRecording({ parameters: live() }),
    pauseRecording: () => pauseRoomRecording({ parameters: live() }),
    resumeRecording: () => resumeRoomRecording({ parameters: live() }),
    stopRecording: () => stopRoomRecording({ parameters: live() }),
    startWhiteboard: (users?: any[]) => startWhiteboard({ parameters: live(), users }),
    stopWhiteboard: () => stopWhiteboard({ parameters: live() }),
    createPoll: (question: string, options: string[]) =>
      createRoomPoll({ parameters: live(), question, options }),
    votePoll: (pollId: string, optionIndex: number) =>
      voteInRoomPoll({ parameters: live(), pollId, optionIndex }),
    endPoll: (pollId: string) => endRoomPoll({ parameters: live(), pollId }),
  };

  const produce = {
    media: (stream: MediaStream, kind: ProducerKind) =>
      produceMedia({ parameters: live(), stream, kind }),
    canvas: (canvas: HTMLCanvasElement, frameRate?: number) =>
      produceCanvas({ parameters: live(), canvas, frameRate }),
    element: (element: HTMLMediaElement) => produceElement({ parameters: live(), element }),
    display: (withAudio = false) => produceDisplay({ parameters: live(), withAudio }),
    replaceTrack: (track: MediaStreamTrack) =>
      replaceProducerTrack({ parameters: live(), track }),
    stop: (kind: ProducerKind) => stopProducing({ parameters: live(), kind }),
  };

  return {
    /** Bind to the component's `:source-parameters`. Stable for the lifetime. */
    sourceParameters: seed,
    /** Bind to the component's `:update-source-parameters`. */
    updateSourceParameters,
    /** Bind to the component's `@media-changed`. Removes any need to poll. */
    onMediaChanged,
    /** Increments on every publication; use as a watch source. */
    sourceChanged,
    /** The latest bag. Read it; do not hold it across publications. */
    parameters,

    readiness,
    ready: computed(() => readiness.value.ready),

    localVideo: computed(() => getLocalVideoStream({ parameters: parameters.value })),
    localAudio: computed(() => getLocalAudioStream({ parameters: parameters.value })),
    remoteVideos: computed(() => getRemoteVideoStreams({ parameters: parameters.value })),
    screenShare: computed(() => getScreenShareStream({ parameters: parameters.value })),
    /** Render all of these (hidden is fine) or participants will be inaudible. */
    audioComponents: computed(() => getAudioGridComponents({ parameters: parameters.value })),
    participants: computed(() => listParticipantMediaStates({ parameters: parameters.value })),

    micOn: computed(() => Boolean(parameters.value.audioAlreadyOn)),
    cameraOn: computed(() => Boolean(parameters.value.videoAlreadyOn)),

    controls,
    moderation,
    session,
    produce,
  };
}

export type MediasfuHeadless = ReturnType<typeof useMediasfuHeadless>;
export default useMediasfuHeadless;
