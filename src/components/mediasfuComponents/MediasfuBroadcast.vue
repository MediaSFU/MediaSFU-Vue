<!--
/**
 * @fileoverview MediasfuBroadcast - Broadcast event variant component
 * @component MediasfuBroadcast
 * @module components/mediasfuComponents/MediasfuBroadcast
 * 
 * @description
 * Pre-configured MediaSFU component optimized for broadcast events.
 * A broadcast event is a one-to-many streaming scenario where a host streams
 * to viewers. Includes HLS egress support, recording tools, and viewer controls.
 * 
 * Features:
 * - Host-controlled broadcasting with start/stop/pause
 * - HLS egress for external streaming (YouTube, Twitch, etc.)
 * - Recording with multiple quality options
 * - Viewer limit controls
 * - Minimal viewer UI (watch-only by default)
 * - Host control panel with broadcast buttons
 * - Chat and Q&A for viewer interaction
 * 
 * @example Basic Broadcast
 * // <MediasfuBroadcast
 *   // :credentials="{ apiUserName: 'host123', apiKey: 'key456' }"
 * // />
 * 
 * @example With Custom UI
 * // <MediasfuBroadcast
 *   // :credentials="credentials"
 *   // :uiOverrides="{
 *     videoCard: { component: CustomBroadcastCard }
 *   }"
 * // />
 */
-->
<template>
  <MediasfuGeneric v-bind="props" />
</template>

<script setup lang="ts">
import MediasfuGeneric, { type MediasfuGenericOptions } from './MediasfuGeneric.vue'
import type { EventType } from 'mediasfu-shared'

/**
 * Props for MediasfuBroadcast component
 * Inherits all MediasfuGenericOptions except defaultEventType is fixed to 'broadcast'
 * @interface BroadcastProps
 */
type BroadcastProps = Omit<MediasfuGenericOptions, 'defaultEventType'> & {
  /**
   * Event type (fixed to 'broadcast', but can be overridden)
   * @default "broadcast"
   */
  defaultEventType?: EventType
}

const props = withDefaults(defineProps<BroadcastProps>(), {
  defaultEventType: 'broadcast' as EventType,
})
</script>
