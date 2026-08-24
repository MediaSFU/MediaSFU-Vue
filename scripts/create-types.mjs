import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputFile = path.join(projectRoot, 'dist', 'index.d.ts')

const declaration = `/**
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

// Types and framework-specific interfaces
export * from '../src/types/mediasfu';
export * from '../src/types/ui-overrides';
export * from '../src/types/socket';
export * from '../src/types/renderable-component';
export * from '../src/SharedTypes';

// Utilities - Room creation and joining helpers
export * from '../src/utils/mediasfuRooms';

// Consumers - Media and streaming functions
export * from '../src/consumers/addVideosGrid';
export * from '../src/consumers/consumerResume';
export * from '../src/consumers/prepopulateUserMedia';

// Remaining public components, composables, services, and utilities
export * from '../src/index';
`

await mkdir(path.dirname(outputFile), { recursive: true })
await writeFile(outputFile, declaration, 'utf8')
console.log('Created dist/index.d.ts')
