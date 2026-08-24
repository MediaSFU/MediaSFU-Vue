# Headless MediaSFU Vue Guide

Use this guide when Vue owns the visible workspace while `mediasfu-vue` owns room signaling, transports, producers, consumers, and state. The current contract is `returnUI=false` plus `sourceParameters` and `updateSourceParameters`; it is not a separate controller export.

## Architecture

```text
Vue route and components
        | user intents
        v
ModernMediasfuGeneric with returnUI=false
        | publishes current room state and helpers
        v
updateSourceParameters -> shallowRef(latest publication)
        | participants, video sources and every remote audio source
        v
Your Vue room shell
```

## 1. Store the latest helper bag

```ts
import { computed, shallowRef } from 'vue';

const sourceParameters = shallowRef<Record<string, any>>({});
const updateSourceParameters = (next: Record<string, any>) => {
  sourceParameters.value = next;
};

const participants = computed(() => sourceParameters.value.participants ?? []);
```

Replace the stored reference on every callback. Do not close over a publication from initial mount and expect it to stay current.

## 2. Mount the runtime

`ModernMediasfuGeneric` is preferred for new Vue applications; it accepts the generic runtime props. You may use `MediasfuGeneric` if your app depends on the classic entry behavior.

```vue
<template>
  <ModernMediasfuGeneric
    :returnUI="false"
    :noUIPreJoinOptions="headlessJoin"
    :sourceParameters="sourceParameters"
    :updateSourceParameters="updateSourceParameters"
    :createMediaSFURoom="createMediaSFURoom"
    :joinMediaSFURoom="joinMediaSFURoom"
  />
</template>
```

Use an `action: 'create'` payload with `duration`, `capacity`, and `userName`, or an `action: 'join'` payload with `meetingID` and `userName`.

## 3. Secure the room boundary

The client should submit only user intent to an authenticated application endpoint. Your server adds MediaSFU credentials from environment variables and forwards the payload to MediaSFU Cloud or the configured MediaSFU Open rooms endpoint. Normalize the client function response to `{ data, success }`.

Short-lived credentials are acceptable only for local development when loaded from ignored configuration. Remove them before public builds. Follow the [secure backend proxy guide](https://mediasfu.com/docs/usage/secure-backend-proxy/).

## 4. Produce microphone, camera, and screen media

```ts
async function toggleMicrophone() {
  const p = sourceParameters.value;
  await p.clickAudio?.({ parameters: p });
}

async function toggleCamera() {
  const p = sourceParameters.value;
  await p.clickVideo?.({ parameters: p });
}

async function toggleScreenShare() {
  const p = sourceParameters.value;
  await p.clickScreenShare?.({ parameters: p });
}
```

Read the ref inside every action so the helper receives current state.

## 5. Consume and resolve media

```ts
async function resolveParticipantVideo(participant: any) {
  const p = sourceParameters.value;
  return p.getParticipantMedia?.(
    participant.videoID ?? '',
    participant.name,
    'video',
  );
}
```

Use stable producer IDs before names. Keep a deterministic visual priority:

1. active screen share
2. selected remote camera
3. local preview
4. avatar or audio-only fallback

Re-resolve on participant, stream, producer ID, and screen-share changes. A stream object may still exist after its tracks end; inspect tracks and producer-close state as well.

## 6. Render all audio independently of the grid

Create a dedicated hidden audio layer driven by the latest `allAudioStreams` collection.

- Key each audio element by producer or stream ID.
- Attach one live source per element.
- Keep off-page and non-selected participants audible.
- Remove elements when their producer closes.
- Handle browser autoplay rejection with a visible user-gesture retry.

The visible grid can paginate or promote speakers without changing which remote audio sources are consumed.

## 7. UI override or headless?

Use `uiOverrides`, card replacements, or `customComponent` when MediaSFU's main workflow is still useful. Use `returnUI=false` when Vue must own the entire visible shell, routing, navigation, and product-specific layout.

## 8. Cleanup

Before unmount:

- invoke the current leave/disconnect helper from the latest publication
- remove app-owned listeners and timers
- clear audio retry and playback queues
- detach media elements
- stop only tracks created directly by your app
- discard the stored parameter bag

## 9. Real-room acceptance

- Install the published SDK version from npm and confirm a clean dependency resolution before performing release acceptance.
- Create and join through the backend proxy without exposing credentials.
- Join with two participants and verify audio/video in both directions.
- Toggle microphone, camera, and screen share.
- Verify off-page participants remain audible.
- Verify screen-share, remote-camera, and local-preview transitions.
- Test reconnect, producer close, participant leave, and room leave.
- Run the Vue production build and scan it for keys.

## References

- [Package quick start](README.md)
- [Detailed Vue manual](README_DETAILED.md)
- [Vue SDK guide](https://mediasfu.com/docs/sdks/vue/)
- [Generated API references](https://mediasfu.com/docs/api-reference/)
- [MediaSFU Open](https://github.com/MediaSFU/MediaSFUOpen)
- [MediaSFU Sandbox](https://mediasfu.com/sandbox)
