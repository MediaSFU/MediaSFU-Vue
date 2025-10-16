#!/bin/bash
# Post-build script to create type declaration file

cat > dist/index.d.ts << 'EOF'
/**
 * MediaSFU Vue - TypeScript Type Definitions
 * @packageDocumentation
 */

// Main Components
export { default as MediasfuGeneric } from '../src/components/mediasfuComponents/MediasfuGeneric.vue';
export { default as MediasfuBroadcast } from '../src/components/mediasfuComponents/MediasfuBroadcast.vue';
export { default as MediasfuConference } from '../src/components/mediasfuComponents/MediasfuConference.vue';
export { default as MediasfuWebinar } from '../src/components/mediasfuComponents/MediasfuWebinar.vue';
export { default as MediasfuChat } from '../src/components/mediasfuComponents/MediasfuChat.vue';
export * from '../src/components/mediasfuComponents/MediasfuGeneric.vue';

// Composables
export { useMediasfu } from '../src/composables/useMediasfu';
export { useBackgroundModal } from '../src/composables/useBackgroundModal';
export { useMenuModal } from '../src/composables/useMenuModal';

// Types - Export all type definitions and SharedTypes
export * from '../src/types/mediasfu';
export * from '../src/types/ui-overrides';
export * from '../src/types/socket';
export * from '../src/types/renderable-component';

// Re-export SharedTypes directly (bundled with package)
// Using regular export (not type-only) for better compatibility
export * from '../src/SharedTypes';

// Utilities - Room creation and joining helpers
export * from '../src/utils/mediasfuRooms';

// Consumers - Media and streaming functions
export * from '../src/consumers/addVideosGrid';
export * from '../src/consumers/consumerResume';
export * from '../src/consumers/prepopulateUserMedia';

// Re-export all other components and utilities
export * from '../src/index';
EOF

echo "✓ Created dist/index.d.ts"
