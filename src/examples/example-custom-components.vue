<!--
  Example Custom Components for MediaSFU Vue SDK
  
  This file demonstrates various customization patterns:
  - Custom control buttons with flexible props
  - Custom modal components
  - Custom participant cards
  - Custom layout containers
-->

<script setup lang="ts">
// Uncomment sections as needed for your implementation

// // Custom Control Buttons Example (showcasing flexible props)
// import { h } from 'vue';
// import ControlButtonsComponent from '@/components/displayComponents/ControlButtonsComponent.vue';
// import { faMicrophone, faVideo, faShareFromSquare } from '@fortawesome/free-solid-svg-icons';
//
// const MyControlButtons = {
//   name: 'MyControlButtons',
//   props: ['parameters'],
//   setup(props) {
//     const buttons = [
//       {
//         name: 'Mic',
//         icon: faMicrophone,
//         active: !props.parameters.local?.muted,
//         onPress: props.parameters.toggleLocalAudio,
//         buttonProps: { 'aria-label': 'Toggle microphone' },
//         textProps: { style: { minWidth: '40px', textAlign: 'center' } },
//       },
//       {
//         name: 'Camera',
//         icon: faVideo,
//         active: props.parameters.local?.videoOn,
//         onPress: props.parameters.toggleLocalVideo,
//         backgroundColor: { default: '#0ea5e9', pressed: '#0369a1' },
//       },
//       {
//         name: 'Share',
//         icon: faShareFromSquare,
//         onPress: props.parameters.startScreenShare,
//         show: props.parameters.canShare,
//         style: { minWidth: '96px' },
//       },
//     ];
//
//     return () => h(ControlButtonsComponent, {
//       buttons,
//       containerProps: {
//         role: 'toolbar',
//         'aria-label': 'media controls',
//         style: { gap: '0.75rem' },
//       },
//       buttonProps: { type: 'button', class: 'media-control' },
//     });
//   }
// };

// // Alternate Control Buttons Example (side aligned layout)
// import ControlButtonsAltComponent from '@/components/displayComponents/ControlButtonsAltComponent.vue';
// import { faMessage, faGear } from '@fortawesome/free-solid-svg-icons';
//
// const MyAltControlButtons = {
//   name: 'MyAltControlButtons',
//   props: ['parameters'],
//   setup(props) {
//     const buttons = [
//       {
//         name: 'Chat',
//         icon: faMessage,
//         onPress: props.parameters.openChat,
//         buttonProps: { 'aria-label': 'Open chat panel' },
//       },
//       {
//         name: 'Settings',
//         icon: faGear,
//         onPress: props.parameters.openSettings,
//       },
//     ];
//
//     return () => h(ControlButtonsAltComponent, {
//       showAspect: true,
//       position: 'middle',
//       location: 'center',
//       direction: 'vertical',
//       containerProps: {
//         'aria-label': 'side controls',
//         class: 'alt-controls',
//       },
//       buttons,
//     });
//   }
// };

// // Touch-friendly Control Buttons Example
// import ControlButtonsComponentTouch from '@/components/displayComponents/ControlButtonsComponentTouch.vue';
// import { faMicrophoneLines, faVideoSlash } from '@fortawesome/free-solid-svg-icons';
//
// const MyTouchControls = {
//   name: 'MyTouchControls',
//   props: ['parameters'],
//   setup(props) {
//     const buttons = [
//       {
//         name: 'Mute',
//         icon: faMicrophoneLines,
//         active: !props.parameters.local?.muted,
//         onPress: props.parameters.toggleLocalAudio,
//         buttonProps: { 'aria-pressed': !props.parameters.local?.muted },
//       },
//       {
//         name: 'Video',
//         icon: faVideoSlash,
//         onPress: props.parameters.toggleLocalVideo,
//       },
//     ];
//
//     return () => h(ControlButtonsComponentTouch, {
//       showAspect: true,
//       position: 'middle',
//       location: 'bottom',
//       direction: 'horizontal',
//       containerProps: {
//         role: 'toolbar',
//         class: 'touch-controls',
//       },
//       gap: 16,
//       buttons,
//     });
//   }
// };

// // Custom Loading Modal Example
// import LoadingModal from '@/components/displayComponents/LoadingModal.vue';
//
// const MyLoadingModal = {
//   name: 'MyLoadingModal',
//   props: ['isBusy'],
//   setup(props) {
//     return () => h(LoadingModal, {
//       isVisible: props.isBusy,
//       backgroundColor: 'rgba(15, 23, 42, 0.75)',
//       displayColor: '#f8fafc',
//       loadingText: h('strong', 'Setting things up…'),
//       containerProps: { class: 'app-loading-overlay' },
//       spinnerProps: { pulse: true },
//     });
//   }
// };

// // Custom Confirm Exit Modal Example
// import ConfirmExitModal from '@/components/exitComponents/ConfirmExitModal.vue';
// import { io } from 'socket.io-client';
//
// const socket = io('http://localhost:3000');
//
// const MyConfirmExitModal = {
//   name: 'MyConfirmExitModal',
//   props: ['open', 'close'],
//   setup(props) {
//     return () => h(ConfirmExitModal, {
//       isConfirmExitModalVisible: props.open,
//       onConfirmExitClose: props.close,
//       member: 'Jane Doe',
//       roomName: 'Studio A',
//       socket,
//       islevel: '2',
//       title: h('span', 'Leave the studio?'),
//       confirmLabel: 'Yes, end session',
//       cancelLabel: 'Stay',
//     });
//   }
// };

// // Custom Video Card Example
// import VideoCard from '@/components/displayComponents/VideoCard.vue';
//
// const CustomVideoCard = {
//   name: 'CustomVideoCard',
//   props: [
//     'participant',
//     'stream',
//     'width',
//     'height',
//     'name',
//     'backgroundColor',
//     'showControls',
//     'showInfo',
//   ],
//   setup(props) {
//     const customStyle = {
//       borderRadius: '20px',
//       border: '3px solid #4c1d95',
//       boxShadow: '0 28px 65px rgba(76,29,149,0.35)',
//       background: 'linear-gradient(140deg, rgba(15,23,42,0.78), rgba(30,64,175,0.45))',
//     };
//
//     return () => h(VideoCard, {
//       ...props,
//       customStyle: { ...customStyle, ...(props.customStyle || {}) },
//     });
//   }
// };

// // Custom Audio Card Example
// import AudioCard from '@/components/displayComponents/AudioCard.vue';
//
// const CustomAudioCard = {
//   name: 'CustomAudioCard',
//   props: ['name', 'barColor', 'textColor', 'imageSource', 'roundedImage', 'imageStyle'],
//   setup(props) {
//     return () => h(AudioCard, {
//       ...props,
//       barColor: '#22c55e',
//       customStyle: { borderRadius: '22px', background: 'rgba(34,197,94,0.1)' },
//     });
//   }
// };

// // Custom Mini Card Example
// import MiniCard from '@/components/displayComponents/MiniCard.vue';
//
// const CustomMiniCard = {
//   name: 'CustomMiniCard',
//   props: [
//     'initials',
//     'fontSize',
//     'name',
//     'showVideoIcon',
//     'showAudioIcon',
//     'imageSource',
//     'roundedImage',
//     'imageStyle',
//   ],
//   setup(props) {
//     return () => h('div', {
//       style: {
//         display: 'grid',
//         placeItems: 'center',
//         height: '100%',
//       }
//     }, [h(MiniCard, props)]);
//   }
// };

// // Custom Main Container with themed wrapper
// import MainContainerComponent from '@/components/displayComponents/MainContainerComponent.vue';
//
// const CustomMainContainer = {
//   name: 'CustomMainContainer',
//   props: Object.keys(MainContainerComponent.props || {}),
//   setup(props, { slots }) {
//     return () => h('div', {
//       style: {
//         border: '4px dashed rgba(139,92,246,0.8)',
//         borderRadius: '28px',
//         padding: '16px',
//       }
//     }, [h(MainContainerComponent, props, slots)]);
//   }
// };

// // Custom Workspace Component (full UI replacement)
// const CustomWorkspace = {
//   name: 'CustomWorkspace',
//   props: ['parameters'],
//   setup(props) {
//     return () => h('div', {
//       style: {
//         height: '100vh',
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: '#f0f0f0',
//         fontFamily: 'Arial, sans-serif',
//       }
//     }, [
//       h('h1', { 
//         style: { color: '#333', marginBottom: '20px' } 
//       }, 'My Custom MediaSFU Interface'),
//       h('div', {
//         style: {
//           backgroundColor: 'white',
//           padding: '20px',
//           borderRadius: '8px',
//           boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
//         }
//       }, [
//         h('p', [h('strong', 'Room: '), props.parameters.roomName]),
//         h('p', [h('strong', 'Your Level: '), props.parameters.islevel]),
//         h('p', [h('strong', 'Participants: '), props.parameters.participants?.length || 0]),
//         h('button', {
//           onClick: () => props.parameters.showAlert?.({ 
//             message: 'Hello from custom UI!', 
//             type: 'success' 
//           }),
//           style: {
//             padding: '10px 20px',
//             backgroundColor: '#007bff',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer',
//             marginTop: '10px',
//           }
//         }, 'Show Alert'),
//       ]),
//       h('p', {
//         style: { marginTop: '20px', color: '#666' }
//       }, 'This is a completely custom UI that replaces the entire MediaSFU interface.'),
//     ]);
//   }
// };

// // Usage Example with all customizations
// import MediasfuGeneric from '@/components/mediasfuComponents/MediasfuGeneric.vue';
// import type { MediasfuUICustomOverrides } from '@/types/ui-overrides';
//
// const uiOverrides: MediasfuUICustomOverrides = {
//   mainContainer: {
//     component: CustomMainContainer,
//   },
//   controlButtons: {
//     component: MyControlButtons,
//   },
//   videoCard: {
//     component: CustomVideoCard,
//   },
//   loadingModal: {
//     component: MyLoadingModal,
//   },
//   consumerResume: {
//     wrap: (original) => async (params) => {
//       console.log('Consumer resume starting...');
//       const result = await original(params);
//       console.log('Consumer resume completed');
//       return result;
//     },
//   },
// };
</script>

<template>
  <div>
    <!-- Uncomment and use the components above in your MediaSFU implementation -->
    <!-- 
    <MediasfuGeneric
      :credentials="credentials"
      :ui-overrides="uiOverrides"
      :custom-video-card="CustomVideoCard"
      :custom-audio-card="CustomAudioCard"
      :custom-mini-card="CustomMiniCard"
    />
    -->
  </div>
</template>

<style scoped>
.media-control {
  transition: all 0.2s ease;
}

.media-control:hover {
  transform: scale(1.05);
}

.media-control__icon {
  font-size: 1.25rem;
}

.media-control__indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
}

.alt-controls {
  background: rgba(0, 0, 0, 0.5);
  padding: 12px;
  border-radius: 12px;
}

.touch-controls {
  padding: 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.app-loading-overlay {
  backdrop-filter: blur(8px);
}
</style>
]]>