<!-- eslint-disable -->
<!--
 * MediaSFU Chat Component Configuration and Usage Guide
 *
 * The following code and comments will guide you through:
 * 1. Configuring the MediaSFU Chat component with different server and credential setups.
 * 2. Handling API credentials securely depending on whether you use MediaSFU Cloud or your own MediaSFU CE server.
 * 3. Integrating a pre-join page.
 * 4. Using custom "create room" and "join room" functions for secure, flexible integration.
 *
 * Note: All guide instructions are provided as code comments. They will not render to the user directly.
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
// MediaSFU Chat view component
import MediasfuChat from './components/mediasfuComponents/MediasfuChat.vue'

// Pre-Join Page component (if you choose to use it)
import PreJoinPage from './components/miscComponents/PreJoinPage.vue'

// Import custom "create" and "join" room functions
import { createRoomOnMediaSFU } from './utils/mediasfuRooms'
import { joinRoomOnMediaSFU } from './utils/mediasfuRooms'
import type { CreateMediaSFURoomOptions, JoinMediaSFURoomOptions } from 'mediasfu-shared'
import { createCardOverrides } from './examples/overrides/cardOverrides'

/**
 * App Component
 *
 * This component demonstrates how to:
 * - Configure credentials for MediaSFU Cloud and/or Community Edition (CE).
 * - Use MediaSFU with or without a custom server.
 * - Integrate a pre-join page.
 * - Return no UI and manage state through sourceParameters, allowing a fully custom frontend.
 *
 * Basic instructions:
 * 1. Set `localLink` to your CE server if you have one, or leave it blank to use MediaSFU Cloud.
 * 2. Set `connectMediaSFU` to determine whether you're connecting to MediaSFU Cloud services.
 * 3. Provide credentials if using MediaSFU Cloud (dummy credentials are acceptable in certain scenarios).
 * 4. If you prefer a custom UI, set `returnUI` to false and handle all interactions via `sourceParameters` and `updateSourceParameters`.
 * 5. For secure production usage, consider using custom `createMediaSFURoom` and `joinMediaSFURoom` functions to forward requests through your backend.
 */

// =========================================================
//                API CREDENTIALS CONFIGURATION
// =========================================================
//
// Scenario A: Not using MediaSFU Cloud at all.
// - No credentials needed. Just set localLink to your CE server.
// Example:
/*
const credentials = {};
const localLink = 'http://your-ce-server.com'; // http://localhost:3000 for local testing
const connectMediaSFU = localLink.trim() !== '';
*/

// Scenario B: Using MediaSFU CE + MediaSFU Cloud for Egress only.
// - Use dummy credentials (8 chars for userName, 64 chars for apiKey).
// - Your CE backend will forward requests with your real credentials.
/*
const credentials = {
  apiUserName: 'dummyUsr',
  apiKey: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
};
const localLink = 'http://your-ce-server.com'; // http://localhost:3000 for local testing
const connectMediaSFU = localLink.trim() !== '';
*/

// Scenario C: Using MediaSFU Cloud without your own server.
// - For development, use your actual or dummy credentials.
// - In production, securely handle credentials server-side and use custom room functions.
const credentials = {
  apiUserName: 'yourDevUser', // 8 chars recommended for dummy
  apiKey: 'yourDevApiKey1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', // 64 chars
}
const localLink = '' // Leave empty if not using your own server
const connectMediaSFU = true // Set to true if using MediaSFU Cloud since localLink is empty

// =========================================================
//                    UI RENDERING OPTIONS
// =========================================================
//
// If you want a fully custom UI (e.g., a custom layout inspired by WhatsApp):
// 1. Set `returnUI = false` to prevent the default MediaSFU UI from rendering.
// 2. Provide `noUIPreJoinOptions` to simulate what would have been entered on a pre-join page.
// 3. Use `sourceParameters` and `updateSourceParameters` to access and update state/actions.
// 4. No need for any of the above if you're using the default MediaSFU UI.
//
// Example noUIPreJoinOptions:
const noUIPreJoinOptions = ref<CreateMediaSFURoomOptions | JoinMediaSFURoomOptions>({
  action: 'create',
  capacity: 10,
  duration: 15,
  eventType: 'chat',
  userName: 'Prince',
})

// Example for joining a room:
// const noUIPreJoinOptions = ref<CreateMediaSFURoomOptions | JoinMediaSFURoomOptions>({
//   action: 'join',
//   userName: 'Prince',
//   meetingID: 'yourMeetingID'
// });

const sourceParameters = ref<Record<string, any>>({})
const updateSourceParameters = (data: Record<string, any>) => {
  sourceParameters.value = data
}

const returnUI = true // Switch to false to render your own chat-first UI

const cardOverrides = createCardOverrides({
  accent: '#34d399',
  glow: 'rgba(52, 211, 153, 0.35)',
  audioBackground: 'rgba(134, 239, 172, 0.25)',
  miniBackground: 'rgba(16, 185, 129, 0.2)',
  miniTextColor: '#14532d',
})

const uiOverrides = computed(() => (returnUI ? cardOverrides : undefined))

// =========================================================
//                CUSTOM ROOM FUNCTIONS (OPTIONAL)
// =========================================================
//
// To securely forward requests to MediaSFU:
// - Implement custom `createMediaSFURoom` and `joinMediaSFURoom` functions.
// - These functions send requests to your server, which then communicates with MediaSFU Cloud.
//
// Already imported `createRoomOnMediaSFU` and `joinRoomOnMediaSFU` are examples.
//
// If using MediaSFU CE backend, ensure your server endpoints:
// - Validate dummy credentials.
// - Forward requests to mediasfu.com with real credentials.

// =========================================================
//              DEPRECATED FEATURES (SEED DATA)
// =========================================================
//
// Deprecated Feature: useLocalUIMode
// This feature is deprecated due to updates for strong typing.
// It is no longer required and should not be used in new implementations.
//
// Uncomment and configure the following section if you intend to use seed data
// for generating random participants and messages.
//
// Note: This is deprecated and maintained only for legacy purposes.
/*
const useSeed = false;
let seedData = {};

if (useSeed) {
  const memberName = 'Prince';
  const hostName = 'Fred';

  const participants_ = generateRandomParticipants({
    member: memberName,
    coHost: '',
    host: hostName,
    forChatChat: eventType === 'chat' || eventType === 'chat',
  });

  const messages_ = generateRandomMessages({
    participants: participants_,
    member: memberName,
    host: hostName,
    forChatChat: eventType === 'chat' || eventType === 'chat',
  });

  const requests_ = generateRandomRequestList({
    participants: participants_,
    hostName: memberName,
    coHostName: '',
    numberOfRequests: 3,
  });

  const waitingList_ = generateRandomWaitingRoomList();

  seedData = {
    participants: participants_,
    messages: messages_,
    requests: requests_,
    waitingList: waitingList_,
    member: memberName,
    host: hostName,
    eventType: eventType,
  };
}
*/

// =========================================================
//              CHOOSE A USE CASE / COMPONENT
// =========================================================
//
// Multiple components are available depending on your event type:
// MediasfuChat, MediasfuBroadcast, MediasfuWebinar, MediasfuConference
//
// By default, we'll use MediasfuChat with custom settings.

/**
 * **MediasfuChat Component**
 *
 * Uncomment to use the chat event type.
 */
/*
<MediasfuChat
  :credentials="credentials"
  :localLink="localLink"
  :connectMediaSFU="connectMediaSFU"
/>
*/
</script>

<template>
  <!--
    =========================================================
                        RENDER COMPONENT
    =========================================================

    The MediasfuChat component is used by default.
    You can replace it with any other component based on your event type.
    Example: <MediasfuChat ... />

    The PreJoinPage component is displayed if `returnUI` is true.
    If `returnUI` is false, `noUIPreJoinOptions` is used as a substitute.
    You can also use `sourceParameters` to interact with MediaSFU functionalities directly.
    Avoid using `useLocalUIMode` or `useSeed` in new implementations.
    Ensure that real credentials are not exposed in the frontend.
    Use HTTPS and secure backend endpoints for production.
  -->
  <MediasfuChat
    :PrejoinPage="PreJoinPage"
    :credentials="credentials"
    :local-link="localLink"
    :connect-media-s-f-u="connectMediaSFU"
    :return-u-i="returnUI"
    :no-u-i-pre-join-options="!returnUI ? noUIPreJoinOptions : undefined"
    :source-parameters="!returnUI ? sourceParameters : undefined"
    :update-source-parameters="!returnUI ? updateSourceParameters : undefined"
    :create-media-s-f-u-room="createRoomOnMediaSFU"
    :join-media-s-f-u-room="joinRoomOnMediaSFU"
    :ui-overrides="uiOverrides"
  />
</template>

<!--
  =========================================================
                      ADDITIONAL NOTES
  =========================================================

  Handling Core Methods:
  Once `sourceParameters` is populated, you can call core methods like `clickVideo` or `clickAudio` directly:
  Example:
  sourceParameters.value.clickVideo({ ...sourceParameters.value });
  sourceParameters.value.clickAudio({ ...sourceParameters.value });

  This allows your custom UI to directly interact with MediaSFU functionalities.

  Deprecated Features (Seed Data):
  The seed data generation feature is deprecated. Avoid using `useLocalUIMode` or `useSeed` in new implementations.

  Security Considerations:
  - Do not expose real credentials in your frontend code in production.
  - Use HTTPS and secure backend endpoints.
  - Validate inputs and handle errors gracefully.

  Example CE Backend Setup:
  If using MediaSFU CE + MediaSFU Cloud, your backend might look like this:

  app.post("/createRoom", async (req, res) => {
    // Validate incoming dummy credentials
    // Forward request to mediasfu.com with real credentials
  });

  app.post("/joinRoom", async (req, res) => {
    // Validate incoming dummy credentials
    // Forward request to mediasfu.com with real credentials
  });

  By doing so, you keep real credentials secure on your server.

  ========================
  ====== END OF GUIDE ======
  ========================
-->
