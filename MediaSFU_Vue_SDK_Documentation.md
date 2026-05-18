# MediaSFU Vue SDK Implementation Guide

> This document consolidates the authoritative usage patterns contained in `src/App.vue`, `src/AppUnique.vue`, and the project `README.md`. It is intended to mirror the documentation maintained for the other MediaSFU SDKs while reflecting the realities of the Vue 3 SDK codebase. Every section below points back to working code in the repository so that examples can be copied directly into production projects.

---

## 1. Overview

The MediaSFU Vue SDK delivers a pre-built, real-time communications interface on top of MediaSFU Cloud or Community Edition (CE). It provides:

- Five ready-to-use experiences (`MediasfuGeneric`, `MediasfuBroadcast`, `MediasfuWebinar`, `MediasfuConference`, `MediasfuChat`).
- A modern themed entry component (`ModernMediasfuGeneric`) for the same room runtime with upgraded visual treatment.
- A pre-join flow (`PreJoinPage.vue`) that can be swapped or bypassed.
- A comprehensive override layer (`MediasfuUICustomOverrides`) for replacing components or functions.
- Hooks for headless usage (`returnUI = false`) while still leveraging MediaSFU helper utilities.
- Helper utilities for creating/joining rooms via MediaSFU servers (`createRoomOnMediaSFU`, `joinRoomOnMediaSFU`).

All source shown here is found under `src/` in this repository.

---

## 2. Prerequisites

| Requirement | Notes |
|-------------|-------|
| Node 18+ | Matches the tooling in `package.json` and Vite configuration. |
| Vue 3.4 or 3.5 | The SDK targets the Composition API; ensure your app uses Vue 3. |
| mediasfu-shared@^1.0.3 | Delivered as a dependency in `package.json`; provides shared helpers and TypeScript types. |
| TypeScript 5.9.x | Required for template type inference as configured in `tsconfig*.json`. |

---

## 3. Installation & Styling

```bash
npm install mediasfu-vue mediasfu-shared
```

Import the bundle stylesheet once (typically in `main.ts` or the root layout component):

```ts
import 'mediasfu-vue/dist/mediasfu-vue.css';
```

> **Why:** Every MediaSFU component expects these base styles. This mirrors the warning block at the top of the repository `README.md`.

---

## 4. Quick Start (Classic Experience)

The following snippet is derived from `src/App.vue`. It demonstrates the minimum wiring for MediaSFU Cloud while still leaving the UI enabled.

```vue
<template>
  <MediasfuGeneric
    :credentials="credentials"
    :local-link="localLink"
    :connect-media-s-f-u="connectMediaSFU"
    :PrejoinPage="PreJoinPage"
    :ui-overrides="uiOverrides"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MediasfuGeneric from 'mediasfu-vue';
import PreJoinPage from 'mediasfu-vue/dist/components/miscComponents/PreJoinPage.vue';
import type { MediasfuUICustomOverrides } from 'mediasfu-vue';

const credentials = {
  apiUserName: import.meta.env.VITE_MEDIASFU_API_USERNAME ?? '',
  apiKey: import.meta.env.VITE_MEDIASFU_API_KEY ?? '',
};

const localLink = import.meta.env.VITE_MEDIASFU_LOCAL_LINK ?? '';
const connectMediaSFU = localLink.trim() !== '' || Boolean(credentials.apiUserName && credentials.apiKey);

const uiOverrides = computed<MediasfuUICustomOverrides>(() => ({
  // Populate with overrides when needed
}));
</script>
```

This mirrors the active configuration block in `src/App.vue` (see the "Scenario C" credentials section). Keep real production credentials on your server and pass custom `createMediaSFURoom` / `joinMediaSFURoom` functions when building public apps.

### Modern entry

Use `ModernMediasfuGeneric` when you want the newer themed shell without changing the core room contract.

```vue
<template>
  <ModernMediasfuGeneric
    :credentials="credentials"
    :local-link="localLink"
    :connect-media-s-f-u="connectMediaSFU"
    :container-style="{ minHeight: '100vh' }"
  />
</template>

<script setup lang="ts">
import { ModernMediasfuGeneric } from 'mediasfu-vue';

const credentials = {
  apiUserName: import.meta.env.VITE_MEDIASFU_API_USERNAME ?? '',
  apiKey: import.meta.env.VITE_MEDIASFU_API_KEY ?? '',
};

const localLink = import.meta.env.VITE_MEDIASFU_LOCAL_LINK ?? '';
const connectMediaSFU = localLink.trim() !== '' || Boolean(credentials.apiUserName && credentials.apiKey);
</script>
```

Choose `MediasfuGeneric` when you want the stock classic entry experience or closer parity with older examples. Choose `ModernMediasfuGeneric` when your Vue app should open with the themed glassmorphism shell immediately.

---

## 5. Selecting Experiences (`AppUnique.vue`)

`src/AppUnique.vue` contains a scenario switcher that can be embedded directly in a documentation or playground environment. It demonstrates:

| Symbol | Purpose |
|--------|---------|
| `connectionScenario` | Toggles between `cloud`, `hybrid`, and `ce` presets. |
| `selectedExperience` | Switches between `generic`, `broadcast`, `webinar`, `conference`, and `chat`. |
| `preJoinRenderer` | Supplies a custom `PreJoinPage` via the `PrejoinPage` prop. |
| `uiOverrides` | Demonstrates layered overrides (card builders, modal replacements, container styling). |

Example excerpt:

```ts
const connectionScenario: ConnectionScenario = 'cloud';
const selectedExperience: ExperienceKey = 'generic';

const connectionPresets = {
  cloud: {
    credentials: { apiUserName: 'your_api_username', apiKey: 'your_api_key' },
    localLink: '',
    connectMediaSFU: true,
  },
  hybrid: {
    credentials: { apiUserName: 'your_api_username', apiKey: 'your_api_key' },
    localLink: 'http://localhost:3000',
    connectMediaSFU: true,
  },
  ce: {
    credentials: undefined,
    localLink: 'http://localhost:3000',
    connectMediaSFU: false,
  },
};
```

Use this structure as the template for cross-SDK documentation so that each experience is described with accurate prop expectations.

---

## 6. Credentials & Deployment Scenarios

These scenarios are pulled directly from the documentation comments inside `src/App.vue`:

| Scenario | `localLink` | `connectMediaSFU` | Credentials Guidance |
|----------|-------------|-------------------|----------------------|
| **A. CE Only** | `http://<ce-server>` | `true` if `localLink` is set | No MediaSFU Cloud credentials required. |
| **B. CE + Cloud Egress** | `http://<ce-server>` | `true` | Use dummy 8/64-character credentials on the client; forward real credentials server-side. |
| **C. Cloud Only** | `''` | `true` | Provide actual credentials in development. In production, proxy `create/join` calls via secure server endpoints. |

When using scenarios B or C in production:

- Implement backend endpoints that wrap `createRoomOnMediaSFU` and `joinRoomOnMediaSFU`.
- Store real `apiUserName` and `apiKey` on the server, never inside shipped bundles.

---

## 7. Headless / Custom UI Mode

To run MediaSFU logic without rendering the bundled UI (mirrors the `returnUI` block in `src/App.vue`):

```ts
const returnUI = false;
const noUIPreJoinOptions = ref<CreateMediaSFURoomOptions | JoinMediaSFURoomOptions>({
  action: 'create',
  capacity: 10,
  duration: 15,
  eventType: 'broadcast',
  userName: 'Prince',
});

const sourceParameters = ref<Record<string, unknown>>({});
const updateSourceParameters = (payload: Record<string, unknown>) => {
  sourceParameters.value = payload;
};
```

Props to supply on the component:

| Prop | Value |
|------|-------|
| `returnUI` | `false` |
| `noUIPreJoinOptions` | The object above (create/join options) |
| `sourceParameters` | `sourceParameters.value` |
| `updateSourceParameters` | `updateSourceParameters` |

`sourceParameters` surfaces helpers such as `toggleMenuModal`, `showAlert`, and participant metadata so that a bespoke UI can call back into MediaSFU functionality.

---

## 8. Pre-Join Customisation

`AppUnique.vue` exposes the `PrejoinPage` prop so that you can render a branded pre-join experience:

```ts
const preJoinRenderer = (props: Record<string, unknown>) =>
  h(PreJoinPage as Component, {
    ...props,
    title: 'Create Your Branded Entry Flow',
  });
```

To replace the default pre-join entirely, pass a factory component through the `PrejoinPage` prop when rendering any MediaSFU experience (`MediasfuGeneric`, `MediasfuBroadcast`, etc.).

---

## 9. UI Overrides (`MediasfuUICustomOverrides`)

Every component exposes a single `uiOverrides` prop. Each key aligns with the interface in `src/types/ui-overrides.ts` and accepts a `CustomComponentOverride` or `CustomFunctionOverride` object.

Common keys:

| Category | Keys |
|----------|------|
| Layout & Controls | `mainContainer`, `mainGrid`, `flexibleVideo`, `controlButtons`, `pagination`, ... |
| Participant Cards | `videoCard`, `audioCard`, `miniCard`, `miniAudio`, `meetingProgressTimer`, ... |
| Modals & Dialogs | `menuModal`, `eventSettingsModal`, `requestsModal`, `mediaSettingsModal`, `participantsModal`, `messagesModal`, `pollModal`, `backgroundModal`, ... |
| Collaboration | `whiteboard`, `screenboard`, `screenboardModal`, `configureWhiteboardModal` |
| Entry Flows | `welcomePage`, `preJoinPage` |
| Function Hooks | `consumerResume`, `addVideosGrid` |

Override example (App.vue):

```ts
const uiOverrides = computed<MediasfuUICustomOverrides>(() => ({
  videoCard: { component: CustomVideoCard },
  audioCard: { component: CustomAudioCard },
  miniCard: { component: CustomMiniCard },
}));
```

Function override example (from README & AppUnique):

```ts
const uiOverrides = {
  consumerResume: {
    wrap: (original) => async (params) => {
      const startedAt = performance.now();
      const result = await original(params);
      analytics.track('consumer_resume', {
        durationMs: performance.now() - startedAt,
        consumerId: params?.consumer?.id,
      });
      return result;
    },
  },
};
```

Use these keys to target every visual or behavioural surface in the SDK.

---

## 10. Custom Cards (Showcase Builders)

`AppUnique.vue` contains fully styled showcase cards that demonstrate how to wrap the bundled cards while forwarding props. Highlights:

- `ShowcaseVideoCard` augments `VideoCard` with custom gradients, badges, and container props.
- `ShowcaseAudioCard` restyles `AudioCard`, including waveform container overrides.
- `ShowcaseMiniCard` decorates `MiniCard` and showcases how to inject slots via `renderContainer`.

To use them, add the overrides:

```ts
const enableCardBuilders = true;

const uiOverrides = computed<MediasfuUICustomOverrides>(() => ({
  videoCard: enableCardBuilders ? { component: ShowcaseVideoCard } : undefined,
  audioCard: enableCardBuilders ? { component: ShowcaseAudioCard } : undefined,
  miniCard: enableCardBuilders ? { component: ShowcaseMiniCard } : undefined,
}));
```

This produces visually distinct cards without touching the core MediaSFU logic.

---

## 11. Modal Overrides & Container Styling

`enableModalOverrides` inside `AppUnique.vue` showcases how to replace high-impact modals:

```ts
const uiOverrides = computed<MediasfuUICustomOverrides>(() => ({
  menuModal: enableModalOverrides ? { component: MenuModal } : undefined,
  participantsModal: enableModalOverrides ? { component: ParticipantsModal } : undefined,
  confirmExitModal: enableModalOverrides ? { component: ConfirmExitModal } : undefined,
  screenboardModal: enableModalOverrides ? { component: ScreenboardModal } : undefined,
}));
```

Container styling (commented blocks in `AppUnique.vue`) demonstrates how to wrap the entire experience in branded chrome:

```ts
const containerStyle = enableContainerStyling
  ? {
      background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
      padding: '32px',
    }
  : undefined;
```

Pass `containerStyle` directly to any MediaSFU experience component via the `containerStyle` prop.

---

## 12. Room Helpers (`utils/mediasfuRooms.ts`)

Imported in both `App.vue` and `AppUnique.vue`:

```ts
import { createRoomOnMediaSFU, joinRoomOnMediaSFU } from './utils/mediasfuRooms';
```

These helpers encapsulate the default REST calls to MediaSFU. For production use:

1. Expose secure server endpoints that call these helpers with real credentials.
2. Replace the `createMediaSFURoom` and `joinMediaSFURoom` props with functions that forward requests to your server.

Example prop usage (AppUnique template):

```vue
:create-media-s-f-u-room="createRoomOnMediaSFU"
:join-media-s-f-u-room="joinRoomOnMediaSFU"
```

---

## 13. Feature Comparison Summary

| Experience | Highlights |
|------------|------------|
| `MediasfuGeneric` | Full control surface, ideal for demonstrations (default in `App.vue`). |
| `MediasfuBroadcast` | Host + viewers, integrates HLS egress/recording (see README call-outs). |
| `MediasfuWebinar` | Stage management for presenters vs attendees. |
| `MediasfuConference` | Collaboration with breakout/co-host management (requires `uiOverrides` map). |
| `MediasfuChat` | Messaging-first experience with optional AV surfaces. |

Each experience accepts the same prop surface listed at the top of the README (“Shared component props”).

---

## 14. Testing & Linting

| Script | Command |
|--------|---------|
| Run dev server | `npm run dev` |
| Build library bundle + types | `npm run build:lib` |
| Build documentation (`docs/`) | `npm run build-docs` |
| Lint source | `npm run lint` |

Before publishing (`npm publish` or `pnpm publish`), run `npm run prepublishOnly` which chains the library build and TypeDoc generation.

---

## 15. Useful References

- `src/types/ui-overrides.ts` — authoritative list of override keys and props typed per component.
- `src/docs.ts` — consolidated TypeDoc entry point referencing all exports.
- `src/components/**` — actual Vue component implementations for each UI surface.
- `typedoc.json` — configuration used to generate the public API documentation.

For cross-SDK parity, reproduce the same structure from this document for React, Angular, React Native, Flutter, etc., substituting the framework-specific entry points while keeping the scenario tables and customization walkthrough consistent.

---

*Document revision:* Generated from repository state on 2025-10-16. Validate code references against the current branch before copying into production guides.
