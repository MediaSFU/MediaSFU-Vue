# MediaSFU Vue SDK

Build Vue 3 meetings, webinars, broadcasts, chat rooms, classrooms, live-sales
experiences, podcasts, and other app-owned real-time products. MediaSFU manages
signaling, WebRTC transports, room state, and media lifecycle; your application
can keep the supplied UI, replace selected surfaces, or render everything.

`mediasfu-vue` is a Vue 3 WebRTC SDK for video conferencing, video calls,
webinars, interactive live streaming, screen sharing, recording, whiteboards,
polls, breakout rooms, chat, translation-aware rooms, AI-assisted experiences,
prebuilt UI, component overrides, and fully headless custom UI.

<p align="center">
  <a href="https://mediasfu.com/storybook/?path=/story/mediasfu-components-modern-mediasfu-generic--default">
    <img src="https://mediasfu.com/images/demos/showcase_all.webp" width="960" alt="MediaSFU product showcase: calls, classrooms, broadcasts, live commerce, and AI experiences" />
  </a>
</p>

<p align="center"><a href="https://mediasfu.com/storybook/?path=/story/mediasfu-components-modern-mediasfu-generic--default">Open the live ModernMediasfuGeneric preview →</a></p>

```bash
npm install mediasfu-vue
```

Import the package stylesheet once:

```ts
import 'mediasfu-vue/dist/mediasfu-vue.css';
```

## Choose your integration level

| Goal | Start with |
| --- | --- |
| Ship a complete room quickly | `MediasfuGeneric`, `MediasfuConference`, `MediasfuWebinar`, `MediasfuBroadcast`, or `MediasfuChat` |
| Use the premium themed shell | `ModernMediasfuGeneric` |
| Brand selected cards, controls, or modals | `uiOverrides` and custom card props |
| Replace the complete visible workspace | `customComponent` |
| Own rendering, state, and controls | `:return-u-i="false"` with `useMediasfuHeadless()` |

## First working room

```vue
<script setup lang="ts">
import { ModernMediasfuGeneric } from 'mediasfu-vue';
</script>

<template>
  <ModernMediasfuGeneric
    :credentials="{ apiUserName: 'your-api-username', apiKey: 'your-api-key' }"
    :connect-media-s-f-u="true"
  />
</template>
```

Use inline credentials only for fast local or private development. For
MediaSFU Open, pass `local-link` instead.

**MediaSFU Open is your own running media server.** You deploy and operate it,
then point `local-link` at that server's reachable URL. The prop does not start
a local server; `localhost` works only when the browser and MediaSFU Open are on
the same machine.

## Secure create/join proxy for production

For a public app, pass syntactically valid client placeholders and inject both
room callbacks. Each callback posts only `payload` to your authenticated
backend. The backend authorizes the user and replaces the placeholders with
real MediaSFU credentials stored in private environment variables.

```ts
import type { ModernMediasfuGenericProps } from 'mediasfu-vue';

type CreateRoomOnMediaSFUType = NonNullable<
  ModernMediasfuGenericProps['createMediaSFURoom']
>;
type JoinRoomOnMediaSFUType = NonNullable<
  ModernMediasfuGenericProps['joinMediaSFURoom']
>;

export const clientPlaceholderCredentials = {
  apiUserName: 'client00',
  apiKey: '0'.repeat(64),
};

type RoomResult = Awaited<ReturnType<CreateRoomOnMediaSFUType>>;

async function proxyRoom(path: 'create' | 'join', payload: unknown): Promise<RoomResult> {
  const response = await fetch(`/api/rooms/${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    return {
      success: false,
      data: { error: body.error ?? `Room ${path} failed (${response.status}).` },
    };
  }
  return { success: true, data: body.data };
}

export const createMediaSFURoom: CreateRoomOnMediaSFUType = ({ payload }) =>
  proxyRoom('create', payload);
export const joinMediaSFURoom: JoinRoomOnMediaSFUType = ({ payload }) =>
  proxyRoom('join', payload);
```

```vue
<ModernMediasfuGeneric
  :credentials="clientPlaceholderCredentials"
  :create-media-s-f-u-room="createMediaSFURoom"
  :join-media-s-f-u-room="joinMediaSFURoom"
/>
```

The placeholders are routing inputs, not authentication. The server must
authenticate the app user, allowlist the room payload, enforce duration,
capacity, and role policy, rate-limit requests, call MediaSFU with server-only
credentials, and return `{ success, data }`. Inject **both** callbacks so no
path falls back to the default credential-bearing request.

For an embedded room, set `container-width-fraction` and
`container-height-fraction` between `0` and `1`. When either is below `1`, the
room fills its parent rather than claiming the viewport.

## Customize without rebuilding the runtime

```vue
<script setup lang="ts">
import { computed } from 'vue';
import {
  MediasfuConference,
  type MediasfuUICustomOverrides,
} from 'mediasfu-vue';
import BrandedMessages from './BrandedMessages.vue';
import ProductControls from './ProductControls.vue';

const uiOverrides = computed<MediasfuUICustomOverrides>(() => ({
  messagesModal: { component: BrandedMessages },
  controlButtons: { component: ProductControls },
}));
</script>

<template>
  <MediasfuConference
    local-link="https://media.example.test"
    :ui-overrides="uiOverrides"
  />
</template>
```

Use `customComponent` for a completely different visible workspace while the
room component keeps lifecycle ownership. Use the composable below when you
want explicit state and action groups as well.

## Feature-rich headless quick start

This example selects the best incoming stream, renders it, keeps all prepared
remote audio mounted, publishes local controls, and makes failures visible.

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  AudioGrid,
  ModernMediasfuGeneric,
  useMediasfuHeadless,
} from 'mediasfu-vue';

const room = useMediasfuHeadless();
const notice = ref('');

const primary = computed(() => {
  const share = room.screenShare.value;
  if (share.stream) return { stream: share.stream, muted: share.isLocal };
  const remote = room.remoteVideos.value[0]?.stream;
  if (remote) return { stream: remote, muted: false };
  return room.localVideo.value
    ? { stream: room.localVideo.value, muted: true }
    : null;
});

async function run(action: () => Promise<{ ok: boolean; error: string }>) {
  const result = await action();
  notice.value = result.ok ? '' : result.error;
}
</script>

<template>
  <ModernMediasfuGeneric
    local-link="https://media.example.test"
    :connect-media-s-f-u="true"
    :return-u-i="false"
    :source-parameters="room.sourceParameters"
    :update-source-parameters="room.updateSourceParameters"
    @media-changed="room.onMediaChanged"
  />

  <p>{{ room.ready.value ? 'Room ready' : room.readiness.value.reason }}</p>
  <p>{{ room.participants.value.length }} participants</p>
  <video
    v-if="primary"
    :srcObject="primary.stream"
    :muted="primary.muted"
    autoplay
    playsinline
  />

  <button :disabled="!room.ready.value" @click="run(room.controls.toggleMic)">
    {{ room.micOn.value ? 'Mute' : 'Unmute' }}
  </button>
  <button :disabled="!room.ready.value" @click="run(room.controls.toggleCamera)">
    {{ room.cameraOn.value ? 'Camera off' : 'Camera on' }}
  </button>
  <button :disabled="!room.ready.value" @click="run(room.controls.toggleScreenShare)">
    Share screen
  </button>
  <button @click="run(room.controls.leave)">Leave</button>
  <p v-if="notice" role="alert">{{ notice }}</p>

  <!-- Audio is independent of the visible video page; mount every entry. -->
  <div class="remote-audio" aria-hidden="true">
    <AudioGrid :components-to-render="room.audioComponents.value" />
  </div>
</template>

<style scoped>
.remote-audio {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
}
</style>
```

The composable exposes both consumption and production paths:

- consume with `localVideo`, `remoteVideos`, `screenShare`,
  `audioComponents`, and `participants` computed refs;
- publish or switch normal devices with `controls`, including microphone,
  camera, screen share, device selection, camera flip, chat, and leave;
- publish app-created media with `produce.media`, `produce.canvas`,
  `produce.element`, or `produce.display`, then use `replaceTrack` or `stop`;
- build host/co-host tools with `moderation.permissions` and the moderation
  actions;
- build recording, whiteboard, poll, and breakout UI with `session`.

Every action returns `{ ok, error }`. Show `error` to the user. Keep
`sourceParameters` stable, accept every publication, and bind `mediaChanged`;
do not add polling. Never call `getUpdatedAllParams()` from a template,
computed getter, watcher, or timer because it republishes. Pure reads use
`getCurrentParams()`.

## Release checklist

- Test microphone/camera denial, no-device state, autoplay policy, device
  switching, network loss, rejoin, and screen-share ending.
- Mount every prepared audio component, not only the visible video page.
- Gate moderation and session buttons on permissions and current room state.
- Stop app-created tracks and await Leave before unmounting the room.
- Keep reusable Cloud credentials and privileged room operations on your server.

## Documentation

- [Detailed repository guide](README_DETAILED.md)
- [SDK guides and generated API references](https://mediasfu.com/docs/)
- [Complete headless guide](https://mediasfu.com/docs/usage/headless)
- [REST API Sandbox — run GET/POST requests and copy code](https://mediasfu.com/sandbox)
- [Create and manage MediaSFU API keys](https://mediasfu.com/api-keys)
- [Developer Console and room API guide](https://mediasfu.com/documentation)
- [MediaSFU Open — deploy your own media server](https://github.com/MediaSFU/MediaSFUOpen)

## Working examples

- [MediaSFU QuickStart Apps](https://github.com/MediaSFU/MediaSFU-QuickStart-Apps) — runnable Cloud, MediaSFU Open, custom-prejoin, backend-proxy, and custom-UI examples across SDKs.
- [SpacesTek Initial](https://github.com/MediaSFU/SpacesTekInitial) → [Final](https://github.com/MediaSFU/SpacesTekFinal) → [Advanced](https://github.com/MediaSFU/SpacesTekAdvanced) — a staged path from a starter room to a product-owned Spaces-style experience.
- [MediaSFU Agents](https://github.com/MediaSFU/Agents) — multimodal voice/vision agent starters across supported frameworks.
- [MediaSFU VOIP](https://github.com/MediaSFU/VOIP) — telephony, dialer, room-lifecycle, and agent/human handoff reference clients.

## License

### Host leave and rejoin

Hosts now see **Leave room** and **End for everyone**. The first keeps the room active and allows rejoin. Programmatic callers pass `endRoomOnHostExit: false`; existing calls default to `true`.

MIT. See [LICENSE](LICENSE).
