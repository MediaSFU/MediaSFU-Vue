<!--
/**
 * @fileoverview MediasfuConference - Conference event variant component
 * @component MediasfuConference
 * @module components/mediasfuComponents/MediasfuConference
 * 
 * @description
 * Pre-configured MediaSFU component optimized for conference/meeting events.
 * A conference is a peer-to-peer collaborative meeting where all participants
 * can share audio, video, and screens. Ideal for team meetings, workshops,
 * and collaborative sessions.
 * 
 * Features:
 * - Equal participant privileges (everyone can share)
 * - Grid and speaker view layouts
 * - Screen sharing for all participants
 * - Breakout rooms support
 * - Whiteboard collaboration
 * - Recording capabilities
 * - Participant management (mute, remove, etc.)
 * - Chat and file sharing
 * - Polls and Q&A
 * 
 * @example Basic Conference
 * // <MediasfuConference
 *   // :credentials="{ apiUserName: 'user123', apiKey: 'key456' }"
 * // />
 * 
 * @example With Custom Layout
 * // <MediasfuConference
 *   // :credentials="credentials"
 *   // :uiOverrides="{
 *     mainGrid: { component: CustomGridLayout },
 *     participantsModal: { component: CustomParticipantsList }
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
 * Props for MediasfuConference component
 * Inherits all MediasfuGenericOptions except defaultEventType is fixed to 'conference'
 * @interface ConferenceProps
 */
type ConferenceProps = Omit<MediasfuGenericOptions, 'defaultEventType'> & {
  /**
   * Event type (fixed to 'conference', but can be overridden)
   * @default "conference"
   */
  defaultEventType?: EventType
}

const props = withDefaults(defineProps<ConferenceProps>(), {
  defaultEventType: 'conference' as EventType,
})
</script>
