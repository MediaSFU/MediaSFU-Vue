<!--
/**
 * @fileoverview MediasfuWebinar - Webinar event variant component
 * @component MediasfuWebinar
 * @module components/mediasfuComponents/MediasfuWebinar
 * 
 * @description
 * Pre-configured MediaSFU component optimized for webinar events.
 * A webinar features a stage with presenters/panelists and an audience of attendees.
 * Includes stage management, Q&A, polls, and attendee engagement tools.
 * 
 * Features:
 * - Stage management with presenter queue
 * - Request-to-speak system for attendees
 * - Panelist/presenter roles with elevated privileges
 * - Audience view with limited controls
 * - Q&A and polling for engagement
 * - Raise hand functionality
 * - Breakout rooms for networking
 * - Recording with speaker spotlighting
 * - Attendee list with moderation tools
 * 
 * @example Basic Webinar
 * // <MediasfuWebinar
 *   // :credentials="{ apiUserName: 'host123', apiKey: 'key456' }"
 * // />
 * 
 * @example With Custom Stage Controls
 * // <MediasfuWebinar
 *   // :credentials="credentials"
 *   // :uiOverrides="{
 *     requestsModal: { component: CustomRequestsPanel },
 *     participantsModal: { component: CustomAttendeeList }
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
 * Props for MediasfuWebinar component
 * Inherits all MediasfuGenericOptions except defaultEventType is fixed to 'webinar'
 * @interface WebinarProps
 */
type WebinarProps = Omit<MediasfuGenericOptions, 'defaultEventType'> & {
  /**
   * Event type (fixed to 'webinar', but can be overridden)
   * @default "webinar"
   */
  defaultEventType?: EventType
}

const props = withDefaults(defineProps<WebinarProps>(), {
  defaultEventType: 'webinar' as EventType,
})
</script>
