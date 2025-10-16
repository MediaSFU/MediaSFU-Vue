<!--
/**
 * @fileoverview ShareButtonsComponent - Social sharing buttons for meeting links
 * @component ShareButtonsComponent
 * @module components/menuComponents/ShareButtonsComponent
 * 
 * @description
 * A horizontal row of social sharing buttons for distributing meeting links via various
 * platforms. Provides default buttons (Copy, Email, Facebook, WhatsApp, Telegram) and
 * supports custom buttons. Automatically generates appropriate URLs based on event type
 * and local/cloud hosting. Used in MenuModal and other sharing contexts.
 * 
 * Features:
 * - 5 default share methods: Copy, Email, Facebook, WhatsApp, Telegram
 * - Automatic URL generation based on eventType (chat, broadcast, meeting)
 * - Support for custom localLink or mediasfu.com URLs
 * - Custom button injection via shareButtons prop
 * - Filterable buttons (show/hide individual buttons)
 * - Customizable button colors and icon colors
 * - Responsive horizontal layout with spacing
 * 
 * Default Share Buttons:
 * - **Copy** (faCopy): Copies meeting URL to clipboard
 * - **Email** (faEnvelope): Opens default email client with pre-filled meeting link
 * - **Facebook** (faFacebook): Opens Facebook share dialog
 * - **WhatsApp** (faWhatsapp): Opens WhatsApp share dialog
 * - **Telegram** (faTelegram): Opens Telegram share dialog
 * 
 * Event Type URL Mapping:
 * - **chat**: https://chat.mediasfu.com/chat/{meetingID}
 * - **broadcast**: https://broadcast.mediasfu.com/broadcast/{meetingID}
 * - **conference/webinar**: https://meeting.mediasfu.com/meeting/{meetingID}
 * - **localLink provided**: {localLink}/meeting/{meetingID}
 * 
 * @example Basic Share Buttons (Default)
 * // <ShareButtonsComponent
 *   // meetingID="abc-123-xyz"
 *   // eventType="conference"
 * // />
 * 
 * @example With Local Link (Self-Hosted)
 * // <ShareButtonsComponent
 *   // meetingID="meeting-456"
 *   // eventType="webinar"
 *   // localLink="https://my-company.com"
 * // />
 * 
 * @example Chat Event Type
 * // <ShareButtonsComponent
 *   // meetingID="chat-789"
 *   // eventType="chat"
 * // />
 * 
 * @example Custom Share Buttons
 * // <ShareButtonsComponent
 *   // meetingID="broadcast-123"
 *   // eventType="broadcast"
 *   // :shareButtons="[
 *     {
 *       icon: faTwitter,
 *       action: () => shareToTwitter(),
 *       show: true,
 *       color: '#1DA1F2',
 *       iconColor: '#ffffff'
 *     },
 *     {
 *       icon: faLinkedin,
 *       action: () => shareToLinkedIn(),
 *       show: true,
 *       color: '#0077B5'
 *     }
 *   ]"
 * // />
 * 
 * @example Hiding Specific Default Buttons
 * // <ShareButtonsComponent
 *   // meetingID="meeting-abc"
 *   // eventType="conference"
 *   // :shareButtons="[
 *     { icon: faCopy, action: copyHandler, show: true },
 *     { icon: faEnvelope, action: emailHandler, show: true },
 *     { icon: faFacebook, action: facebookHandler, show: false },
 *     { icon: faWhatsapp, action: whatsappHandler, show: true },
 *     { icon: faTelegram, action: telegramHandler, show: false }
 *   ]"
 * // />
 * 
 * @remarks
 * The component automatically handles URL encoding and opens social sharing dialogs
 * in new browser tabs. The Copy button uses the clipboard API which requires HTTPS
 * in production. Custom buttons can be added to the default set or replace them entirely.
 * 
 * Workflow:
 * 1. Component generates meeting URL based on eventType and localLink
 * 2. Renders all share buttons with show=true
 * 3. User clicks button:
 *    - **Copy**: Copies URL to clipboard
 *    - **Email**: Opens mailto: link with pre-filled subject and body
 *    - **Facebook**: Opens Facebook share dialog in new tab
 *    - **WhatsApp**: Opens WhatsApp share with pre-filled text
 *    - **Telegram**: Opens Telegram share with pre-filled text
 * 4. Social platform opens → User completes share action
 * 
 * @see {@link MenuModal} - Modal that typically contains this component
 * @see {@link MeetingIDComponent} - Companion component for displaying meeting ID
 */
-->
<template>
  <div class="share-buttons-container">
    <div
      v-for="(button, index) in filteredShareButtons"
      :key="index"
      class="share-button"
      :style="{
        backgroundColor: button.color || 'black',
        marginRight: index !== filteredShareButtons.length - 1 ? '10px' : '0',
      }"
      @click="button.action"
    >
      <FontAwesomeIcon
        :icon="button.icon"
        :style="{ color: button.iconColor || '#ffffff', fontSize: '24px' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineOptions } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCopy, faEnvelope, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
  faFacebook,
  faWhatsapp,
  faTelegram,
} from '@fortawesome/free-brands-svg-icons';
import type { EventType } from 'mediasfu-shared';

defineOptions({
  name: 'ShareButtonsComponent'
});

/**
 * Interface for custom share button configuration
 * @interface ShareButton
 * 
 * @property {IconDefinition} icon - FontAwesome icon to display
 * @property {() => void} action - Function to execute when button is clicked
 * @property {boolean} show - Whether to display this button
 * @property {string} [color] - Background color for button (default: 'black')
 * @property {string} [iconColor] - Icon color (default: '#ffffff')
 * 
 * @example
 * ```ts
 * const customButton: ShareButton = {
 *   // icon: faTwitter,
 *   // action: () => shareToTwitter(),
 *   // show: true,
 *   // color: '#1DA1F2',
 *   // iconColor: '#ffffff'
 * };
 * ```
 */
export interface ShareButton {
  icon: IconDefinition;
  action: () => void;
  show: boolean;
  color?: string;
  iconColor?: string;
}

/**
 * Props for the ShareButtonsComponent
 * @interface ShareButtonsComponentProps
 * 
 * @property {string} meetingID - Meeting/Event ID to include in share URLs
 * @property {ShareButton[]} [shareButtons=[]] - Custom share buttons to display (replaces defaults if provided)
 * @property {EventType} eventType - Event type ('chat' | 'broadcast' | 'conference' | 'webinar')
 * @property {string} [localLink=''] - Custom domain for self-hosted instances (e.g., 'https://my-company.com')
 * 
 * @default shareButtons - []
 * @default localLink - ''
 * 
 * @example
 * ```typescript
 * // <ShareButtonsComponent
 *   // meetingID="meeting-abc-123"
 *   // eventType="conference"
 *   // localLink="https://my-company.com"
 *   // :shareButtons="customButtons"
 * // />
 * ```
 */
export interface ShareButtonsComponentProps {
  meetingID: string;
  shareButtons?: ShareButton[];
  eventType: EventType;
  localLink?: string;
}

const props = withDefaults(defineProps<ShareButtonsComponentProps>(), {
  shareButtons: () => [],
  localLink: '',
});

const shareName = computed(() => {
  return props.eventType === 'chat'
    ? 'chat'
    : props.eventType === 'broadcast'
    ? 'broadcast'
    : 'meeting';
});

const getShareUrl = (): string => {
  if (props.localLink && !props.localLink.includes('mediasfu.com')) {
    return `${props.localLink}/meeting/${props.meetingID}`;
  }
  return `https://${shareName.value}.mediasfu.com/${shareName.value}/${props.meetingID}`;
};

const defaultShareButtons = computed<ShareButton[]>(() => [
  {
    icon: faCopy,
    action: async () => {
      try {
        await navigator.clipboard.writeText(getShareUrl());
      } catch (error) {
        console.error('Failed to copy to clipboard', error);
      }
    },
    show: true,
  },
  {
    icon: faEnvelope,
    action: () => {
      const emailUrl = `mailto:?subject=Join my meeting&body=Here's the link to the meeting: ${getShareUrl()}`;
      window.open(emailUrl, '_blank');
    },
    show: true,
  },
  {
    icon: faFacebook,
    action: () => {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        getShareUrl()
      )}`;
      window.open(facebookUrl, '_blank');
    },
    show: true,
  },
  {
    icon: faWhatsapp,
    action: () => {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(getShareUrl())}`;
      window.open(whatsappUrl, '_blank');
    },
    show: true,
  },
  {
    icon: faTelegram,
    action: () => {
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}`;
      window.open(telegramUrl, '_blank');
    },
    show: true,
  },
]);

const filteredShareButtons = computed(() => {
  return props.shareButtons.length > 0
    ? props.shareButtons.filter((button) => button.show)
    : defaultShareButtons.value.filter((button) => button.show);
});
</script>

<style scoped>
.share-buttons-container {
  display: flex;
  flex-direction: row;
  margin: 10px 0;
}

.share-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 5px;
  margin: 0 5px;
  cursor: pointer;
}
</style>
