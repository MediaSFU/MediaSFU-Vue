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

## Reuse SDK panels in your own layout

Headless mode can combine your application layout with exported SDK controls.
Keep the room engine mounted with `:return-ui="false"`, receive its parameter
publications, and pass the latest room parameters to the panel you import.

Keep modal visibility connected to the room:

1. Open the panel through the room's matching updater, such as
   `updateIsRecordingModalVisible(true)`.
2. Bind the component's `isRecordingModalVisible` prop (template: `:is-recording-modal-visible`) to the current room
   value, and make its `onClose` callback call
   `updateIsRecordingModalVisible(false)`.
3. Pass the current room parameters and the component's required callbacks,
   including recording confirmation and start actions.
4. Customize supported styles, wrappers, or overrides without replacing the
   underlying room callbacks.

Visibility props differ between components; use the exported component's
contract, not a generic `isVisible` prop for every panel. Do not maintain a
second independent visibility flag. With headless mode, built-in sidebar
navigation is not your application's navigation.

Opening a panel does not start recording or grant media permission. Keep
confirmation, permission checks, and teardown under the room engine's control.

### Render the complete standard UI from the headless engine

Use `ModernMediasfuGenericHead` when your page needs the complete MediaSFU room
UI at a different point in its layout without mounting a second room engine.
The head target must appear before the engine in the template so Vue can move
the engine's exact compiled UI tree into it on the first render.

```vue
<script setup lang="ts">
import {
  ModernMediasfuGeneric,
  ModernMediasfuGenericHead,
  useMediasfuHeadless,
} from 'mediasfu-vue';

const room = useMediasfuHeadless();
</script>

<template>
  <ModernMediasfuGenericHead :parameters="room.parameters.value" />

  <ModernMediasfuGeneric
    :return-u-i="false"
    render-u-i-externally
    :source-parameters="room.sourceParameters"
    :update-source-parameters="room.updateSourceParameters"
    @media-changed="room.onMediaChanged"
  />
</template>
```

The room engine still owns sockets, tracks, modal visibility, and sidebar
navigation. For more than one room on a page, give each engine a unique
`external-ui-target` such as `#support-room`, and pass the matching `target-id`
(`support-room`) to its head.

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

## Virtual backgrounds and breakout rooms in a custom Vue UI

Keep `ModernBackgroundModal` wired to the newest room publication and use the
room's visibility flag and updater rather than a second Vue ref. Render local
camera media from `useMediasfuHeadless().localVideo`; it resolves the active
processed/virtual stream before the raw camera, so self-view matches the stream
published to everyone else.

The classic and modern background modals include **Blur** alongside image
backgrounds. Fully custom web UIs can use the same room lifecycle directly:

```ts
import { applyBackgroundBlur, clearVirtualBackground } from 'mediasfu-shared';

await applyBackgroundBlur({ parameters: latestRoomParameters, blurPixels: 16 });
await clearVirtualBackground({ parameters: latestRoomParameters });
```

Turn the camera on before applying an effect. Keep the parameter publication
current and render the SDK-resolved local stream; do not build a second canvas
pipeline or select the raw camera stream yourself.

Reuse `ModernBreakoutRoomsModal` with the same live room bag when you want the
built-in planner. Save assignments before Start and show action errors in your
page. Filtering tiles is not a breakout transition: the SDK must update room
membership and pause/resume consumers for the participant's active room.

## Host leave and rejoin

Hosts can choose **Leave room** or **End for everyone**. **Leave room** keeps the room running so the host can rejoin later; **End for everyone** closes it for all participants. Programmatic callers pass `endRoomOnHostExit: false` to leave without ending the room; the default is `true`.

## Release checklist

- Test microphone/camera denial, no-device state, autoplay policy, device
  switching, network loss, rejoin, and screen-share ending.
- Mount every prepared audio component, not only the visible video page.
- Gate moderation and session buttons on permissions and current room state.
- Stop app-created tracks and await Leave before unmounting the room.
- Keep reusable Cloud credentials and privileged room operations on your server.

## Troubleshooting

| What you see | Likely cause | What to do |
|---|---|---|
| "Unable to connect. Check your credentials and try again." | The room service rejected the credentials, or your create/join backend returned an error. | Check the API username and key on your server, and make sure your create/join adapters pass the room service's response through. For MediaSFU Open, confirm that `local-link` points to a server the browser can reach. |
| The camera or microphone never starts | The page is not a secure context, or the browser permission was denied. | Serve the app over HTTPS (or `localhost` during development) and allow camera and microphone access for the site. |
| "You must turn on your video before you can start recording" | The recording is set to capture video while your camera is off. | Turn the camera on first, or switch the recording to audio only. The same applies to audio recordings and the microphone. |
| "You can only re-configure recording after pausing it" | Recording settings are locked while a recording is running. | Pause the recording, change the settings, then resume. |
| "You cannot turn off your camera while recording video…" | Turning the camera off would interrupt the recording. | Pause or stop the recording first. |
| A message ending in "Access denied by host." | The host has restricted that action for participants. | Ask the host to change the participant's permissions. |
| "Screen share is not allowed when whiteboard is active" | Screen sharing and the whiteboard cannot run at the same time. | Close the whiteboard, then start screen sharing. |

## Documentation

- [Detailed repository guide](README_DETAILED.md)
- [Changelog](CHANGELOG.md)
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

MIT. See [LICENSE](LICENSE).
