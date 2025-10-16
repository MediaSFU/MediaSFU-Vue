<!--
/**
 * @fileoverview MediasfuChat - Chat event variant component
 * @component MediasfuChat
 * @module components/mediasfuComponents/MediasfuChat
 * 
 * @description
 * Pre-configured MediaSFU component optimized for chat-focused events.
 * A chat event emphasizes text messaging with optional audio/video capabilities.
 * Ideal for text-based discussions, support channels, and casual hangouts.
 * 
 * Features:
 * - Prominent messaging interface
 * - Optional audio/video participants
 * - Direct messaging support
 * - Message history and search
 * - File sharing capabilities
 * - Emojis and reactions
 * - Participant list with online status
 * - Moderation tools (mute, kick, ban)
 * - Minimal video grid (text-first experience)
 * 
 * @example Basic Chat Room
 * // <MediasfuChat
 *   // :credentials="{ apiUserName: 'user123', apiKey: 'key456' }"
 * // />
 * 
 * @example With Custom Message UI
 * // <MediasfuChat
 *   // :credentials="credentials"
 *   // :uiOverrides="{
 *     messagesModal: { component: CustomChatPanel },
 *     participantsModal: { component: CustomUserList }
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
 * Props for MediasfuChat component
 * Inherits all MediasfuGenericOptions except defaultEventType is fixed to 'chat'
 * @interface ChatProps
 */
type ChatProps = Omit<MediasfuGenericOptions, 'defaultEventType'> & {
  /**
   * Event type (fixed to 'chat', but can be overridden)
   * @default "chat"
   */
  defaultEventType?: EventType
}

const props = withDefaults(defineProps<ChatProps>(), {
  defaultEventType: 'chat' as EventType,
})
</script>
