// ============================================================================
// MediaSFU Vue - Main Package Exports
// ============================================================================

// Types - Export all type definitions
export * from './types/mediasfu';
export * from './types/ui-overrides';
export * from './types/socket';
export * from './types/renderable-component';

// Utilities - Room creation and joining helpers
export * from './utils/mediasfuRooms';

// Consumers - Media and streaming functions
export * from './consumers/addVideosGrid';
export * from './consumers/consumerResume';
export * from './consumers/prepopulateUserMedia';

// ============================================================================
// Components - Export all components from their index files
// ============================================================================
export * from './components/mediasfuComponents';
export * from './components/displayComponents';
export * from './components/menuComponents';
export * from './components/recordingComponents';
export * from './components/requestsComponents';
export * from './components/waitingComponents';
export * from './components/displaySettingsComponents';
export * from './components/eventSettingsComponents';
export * from './components/coHostComponents';
export * from './components/participantsComponents';
export * from './components/messageComponents';
export * from './components/mediaSettingsComponents';
export * from './components/exitComponents';
export * from './components/miscComponents';
export * from './components/pollsComponents';
export * from './components/breakoutComponents';
export * from './components/whiteboardComponents';
export * from './components/screenboardComponents';

// BackgroundModal (no index.ts in folder)
export { default as BackgroundModal } from './components/backgroundComponents/BackgroundModal.vue';

// ============================================================================
// Vue Composables (Hooks)
// ============================================================================
export * from './composables/breakoutRoomsComposables';
export * from './composables/coHostComposables';
export * from './composables/displaySettingsComposables';
export * from './composables/exitComposables';
export * from './composables/mediaSettingsComposables';
export * from './composables/messageComposables';
export * from './composables/participantsComposables';
export * from './composables/pollsComposables';
export * from './composables/recordingComposables';
export * from './composables/requestsComposables';
export * from './composables/settingsComposables';
export * from './composables/waitingComposables';
export * from './composables/whiteboardComposables';

// Main composables
export { useBackgroundModal } from './composables/useBackgroundModal';
export { useMediasfu } from './composables/useMediasfu';
export { useMediasfuDemo } from './composables/useMediasfuDemo';
export { useMenuModal } from './composables/useMenuModal';
export { useUIOverrides } from './composables/useUIOverrides';
