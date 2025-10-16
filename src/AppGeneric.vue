<!-- eslint-disable -->
<!--
 * MediaSFU Component Configuration and Usage Guide
 *
 * The following code and comments will guide you through:
 * 1. Configuring the MediaSFU component with different server and credential setups.
 * 2. Handling API credentials securely depending on whether you use MediaSFU Cloud or your own MediaSFU CE server.
 * 3. Rendering custom UIs by disabling the default MediaSFU UI.
 * 4. Using custom "create room" and "join room" functions for secure, flexible integration.
 *
 * Note: All guide instructions are provided as code comments. They will not render to the user directly.
-->

<script setup lang="ts">
import { ref, h, computed } from 'vue'
// MediaSFU view components (if you choose to use them)
import MediasfuGeneric from './components/mediasfuComponents/MediasfuGeneric.vue'
import type { MediasfuUICustomOverrides } from './types/ui-overrides'
// import MediasfuBroadcast from './components/mediasfuComponents/MediasfuBroadcast.vue'
// import MediasfuChat from './components/mediasfuComponents/MediasfuChat.vue'
// import MediasfuWebinar from './components/mediasfuComponents/MediasfuWebinar.vue'
// import MediasfuConference from './components/mediasfuComponents/MediasfuConference.vue'

// Pre-Join Page component (if you choose to use it)
import PreJoinPage from './components/miscComponents/PreJoinPage.vue'

// Import custom "create" and "join" room functions
import { createRoomOnMediaSFU } from './utils/mediasfuRooms'
import { joinRoomOnMediaSFU } from './utils/mediasfuRooms'
import type { CreateMediaSFURoomOptions, JoinMediaSFURoomOptions } from 'mediasfu-shared'

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
const localLink = 'http://your-ce-server.com'; //http://localhost:3000
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
const localLink = 'http://your-ce-server.com'; //http://localhost:3000
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
  eventType: 'broadcast',
  userName: 'Prince',
})

// Example for joining a room:
// const noUIPreJoinOptions = ref<CreateMediaSFURoomOptions | JoinMediaSFURoomOptions>({
//   action: 'join',
//   userName: 'Prince',
//   meetingID: 'yourMeetingID'
// });

const returnUI = true // Set to false for custom UI, true for default MediaSFU UI

const sourceParameters = ref<Record<string, any>>({})
const updateSourceParameters = (data: Record<string, any>) => {
  sourceParameters.value = data
}

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
//              CUSTOM CARD COMPONENTS (OPTIONAL)
// =========================================================
//
// You can customize how individual video cards, audio cards, and mini cards
// are displayed by providing custom components. This is perfect for 
// implementing your own card layouts while keeping MediaSFU's core functionality.

// Custom Video Card Component (Vue 3 render function - matches React SDK pattern)
// @ts-ignore - CustomVideoCardType will be inferred
const CustomVideoCard = (options: any) => {
  const {
    participant,
    stream,
    width,
    height,
    doMirror,
    showControls = true,
    showInfo = true,
    name,
    backgroundColor = '#2a2a2a'
  } = options;

  return h('div', {
    style: {
      backgroundColor,
      borderRadius: '12px',
      border: '2px solid #4CAF50',
      padding: '10px',
      margin: '5px',
      position: 'relative',
      width: `${width || 200}px`,
      height: `${height || 150}px`,
    }
  }, [
    // Video container
    h('div', {
      style: {
        width: '100%',
        height: '80%',
        backgroundColor: '#000',
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative'
      }
    }, [
      stream ? h('video', {
        autoplay: true,
        muted: participant?.muted || false,
        playsinline: true,
        style: {
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: doMirror === 'true' ? 'scaleX(-1)' : 'none'
        },
        onVnodeMounted: (vnode: any) => {
          const video = vnode.el as HTMLVideoElement
          if (video && stream) {
            video.srcObject = stream as MediaStream
            video.play().catch(() => {})
          }
        }
      }) : null,
      // User info overlay
      showInfo && name ? h('div', {
        style: {
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }
      }, name) : null
    ]),
    // Controls
    showControls ? h('div', {
      style: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '8px',
        gap: '8px'
      }
    }, [
      h('button', {
        style: {
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '10px',
          cursor: 'pointer'
        }
      }, 'Custom Action')
    ]) : null
  ])
}

// Custom Audio Card Component (Vue 3 render function - matches React SDK pattern)
// @ts-ignore - CustomAudioCardType will be inferred
const CustomAudioCard = (options: any) => {
  const {
    name,
    barColor,
    textColor,
    imageSource,
    roundedImage,
    imageStyle
  } = options;

  return h('div', {
    style: {
      backgroundColor: '#1e1e1e',
      borderRadius: '25px',
      border: `2px solid ${barColor || '#ccc'}`,
      padding: '15px',
      margin: '5px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      minHeight: '60px',
    }
  }, [
    // Avatar or Image
    h('div', {
      style: {
        width: '40px',
        height: '40px',
        borderRadius: roundedImage ? '50%' : '8px',
        backgroundColor: '#4CAF50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '16px',
        ...(imageStyle || {})
      }
    }, [
      imageSource ? h('img', {
        src: imageSource,
        alt: name,
        style: {
          width: '100%',
          height: '100%',
          borderRadius: roundedImage ? '50%' : '8px',
          objectFit: 'cover'
        }
      }) : (name ? name.charAt(0).toUpperCase() : '')
    ]),
    // Info section
    h('div', { style: { flex: 1 } }, [
      h('div', {
        style: {
          color: textColor,
          fontWeight: 'bold',
          fontSize: '14px',
          marginBottom: '4px'
        }
      }, name),
      // Audio level visualization
      h('div', {
        style: {
          display: 'flex',
          gap: '2px',
          alignItems: 'end',
          height: '20px'
        }
      }, Array.from({ length: 8 }).map((_, i) => 
        h('div', {
          key: i,
          style: {
            width: '3px',
            height: `${Math.random() * 15 + 5}px`,
            backgroundColor: barColor || '#ccc',
            borderRadius: '1px',
            opacity: 0.7
          }
        })
      ))
    ]),
    // Status indicator
    h('div', {
      style: {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        backgroundColor: barColor || '#ccc',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px'
      }
    }, '🎤')
  ])
}

// Custom Mini Card Component (Vue 3 render function - matches React SDK pattern)
// @ts-ignore - CustomMiniCardType will be inferred
const CustomMiniCard = (options: any) => {
  const {
    initials,
    fontSize,
    customStyle,
    name,
    showVideoIcon,
    showAudioIcon,
    imageSource,
    roundedImage,
    imageStyle
  } = options;

  return h('div', {
    style: {
      width: '50px',
      height: '50px',
      borderRadius: roundedImage ? '50%' : '12px',
      background: customStyle ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#4CAF50',
      border: '2px solid #fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: fontSize || '14px',
      margin: '2px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
      ...(imageStyle || {})
    },
    title: name,
    onMouseenter: (e: any) => {
      e.currentTarget.style.transform = 'scale(1.1)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
    },
    onMouseleave: (e: any) => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    }
  }, [
    imageSource ? h('img', {
      src: imageSource,
      alt: name,
      style: {
        width: '100%',
        height: '100%',
        borderRadius: roundedImage ? '50%' : '8px',
        objectFit: 'cover'
      }
    }) : initials,
    // Video/Audio status icons
    h('div', {
      style: {
        position: 'absolute',
        bottom: '-2px',
        right: '-2px',
        display: 'flex',
        gap: '2px'
      }
    }, [
      showVideoIcon ? h('div', {
        style: {
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#4CAF50',
          fontSize: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }, '📹') : null,
      showAudioIcon ? h('div', {
        style: {
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#2196F3',
          fontSize: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }, '🎤') : null
    ])
  ])
}

// =========================================================
//              UI OVERRIDES CONFIGURATION
// =========================================================
//
// Create the uiOverrides object to use the NEW override system
// This replaces the old :custom-video-card, :custom-audio-card, :custom-mini-card props
const uiOverrides = computed<MediasfuUICustomOverrides>(() => ({
  videoCard: { component: CustomVideoCard },
  audioCard: { component: CustomAudioCard },
  miniCard: { component: CustomMiniCard },
}))

// =========================================================
//              CHOOSE A USE CASE / COMPONENT
// =========================================================
//
// Multiple components are available depending on your event type:
// MediasfuBroadcast, MediasfuChat, MediasfuWebinar, MediasfuConference
//
// By default, we'll use MediasfuGeneric with custom settings.
</script>

<template>
  <!--
    =========================================================
                        RENDER COMPONENT
    =========================================================

    The MediasfuGeneric component is used by default.
    You can replace it with any other component based on your event type.
    Example: <MediasfuBroadcast ... />
    Example: <MediasfuChat ... />
    Example: <MediasfuWebinar ... />
    Example: <MediasfuConference ... />

    The PreJoinPage component is displayed if `returnUI` is true.
    If `returnUI` is false, `noUIPreJoinOptions` is used as a substitute.
    You can also use `sourceParameters` to interact with MediaSFU functionalities directly.
    Avoid using `useLocalUIMode` or `useSeed` in new implementations.
    Ensure that real credentials are not exposed in the frontend.
    Use HTTPS and secure backend endpoints for production.
  -->

  <!-- Example of MediaSFU CE with no MediaSFU Cloud -->
  <!-- 
  <MediasfuGeneric
    :PrejoinPage="PreJoinPage"
    :localLink="localLink"
  />
  -->

  <!-- Example of MediaSFU CE + MediaSFU Cloud for Egress only -->
  <!-- 
  <MediasfuGeneric
    :PrejoinPage="PreJoinPage"
    :credentials="credentials"
    :localLink="localLink"
    :connectMediaSFU="connectMediaSFU"
  />
  -->

  <!-- Example of MediaSFU Cloud only -->
  <!-- 
  <MediasfuGeneric
    :PrejoinPage="PreJoinPage"
    :credentials="credentials"
    :connectMediaSFU="connectMediaSFU"
  />
  -->

  <!-- Example of MediaSFU CE + MediaSFU Cloud for Egress only with custom UI -->
  <!-- 
  <MediasfuGeneric
    :PrejoinPage="PreJoinPage"
    :credentials="credentials"
    :localLink="localLink"
    :connectMediaSFU="connectMediaSFU"
    :returnUI="false"
    :noUIPreJoinOptions="noUIPreJoinOptions"
    :sourceParameters="sourceParameters"
    :updateSourceParameters="updateSourceParameters"
    :createMediaSFURoom="createRoomOnMediaSFU"
    :joinMediaSFURoom="joinRoomOnMediaSFU"
  />
  -->

  <!-- Example of MediaSFU Cloud only with custom UI -->
  <!-- 
  <MediasfuGeneric
    :PrejoinPage="PreJoinPage"
    :credentials="credentials"
    :connectMediaSFU="connectMediaSFU"
    :returnUI="false"
    :noUIPreJoinOptions="noUIPreJoinOptions"
    :sourceParameters="sourceParameters"
    :updateSourceParameters="updateSourceParameters"
    :createMediaSFURoom="createRoomOnMediaSFU"
    :joinMediaSFURoom="joinRoomOnMediaSFU"
  />
  -->

  <!-- Example of using MediaSFU CE only with custom UI -->
  <!-- 
  <MediasfuGeneric
    :PrejoinPage="PreJoinPage"
    :localLink="localLink"
    :connectMediaSFU="false"
    :returnUI="false"
    :noUIPreJoinOptions="noUIPreJoinOptions"
    :sourceParameters="sourceParameters"
    :updateSourceParameters="updateSourceParameters"
  />
  -->

  <MediasfuGeneric
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

  End of Guide.

  ========================
  ====== END OF GUIDE ======
  ========================
-->
