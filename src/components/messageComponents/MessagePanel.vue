<!--
/**
 * @fileoverview MessagePanel - Chat message display and input panel
 * @component MessagePanel
 * @module components/messageComponents/MessagePanel
 * 
 * @description
 * A comprehensive chat panel that displays message history and provides input controls
 * for sending messages. Supports both group chat and direct messaging modes with reply
 * functionality. Displays messages with sender info, timestamps, and handles message
 * alignment based on sender (right for own messages, left for others).
 * 
 * Features:
 * - Group chat and direct messaging modes
 * - Message display with sender name and timestamp
 * - Reply functionality with reply indicators
 * - Direct message "Reply" button for incoming DMs
 * - Character limit (350 chars)
 * - Auto-focus on input when focusedInput=true
 * - Send button with FontAwesome icon
 * - Chat setting restrictions (allow, disallow)
 * - Permission checks for messaging
 * - Scrollable message history
 * 
 * Message Types:
 * - **Group Messages**: Displayed to all participants, no "Reply" button
 * - **Direct Messages**: One-on-one messages with "Reply" button
 * - **Replies**: Show "Replying to: [username]" indicator above input
 * 
 * Alignment:
 * - **Own messages**: Aligned to right, show "To: [recipients]" for direct messages
 * - **Others' messages**: Aligned to left, show sender name
 * 
 * @example Basic Group Chat
 * // <MessagePanel
 *   // :messages="groupMessages"
 *   // :messagesLength="groupMessages.length"
 *   // type="group"
 *   // username="john_doe"
 *   // :onSendMessagePress="sendMessageHandler"
 *   // :focusedInput="true"
 *   // eventType="conference"
 *   // member="john_doe"
 *   // islevel="0"
 *   // :startDirectMessage="false"
 *   // :updateStartDirectMessage="() => {}"
 *   // :directMessageDetails="null"
 *   // :updateDirectMessageDetails="() => {}"
 *   // :coHostResponsibility="[]"
 *   // coHost=""
 *   // roomName="meeting-123"
 *   // :socket="socket"
 *   // chatSetting="allow"
 * // />
 * 
 * @example Direct Message Mode
 * // <MessagePanel
 *   // :messages="directMessages"
 *   // :messagesLength="directMessages.length"
 *   // type="direct"
 *   // username="john_doe"
 *   // :onSendMessagePress="sendMessageHandler"
 *   // backgroundColor="#e8f5e9"
 *   // :focusedInput="true"
 *   // eventType="webinar"
 *   // member="john_doe"
 *   // islevel="1"
 *   // :startDirectMessage="true"
 *   // :updateStartDirectMessage="setStartDM"
 *   // :directMessageDetails="targetUser"
 *   // :updateDirectMessageDetails="setTargetUser"
 *   // :coHostResponsibility="[]"
 *   // coHost=""
 *   // roomName="webinar-456"
 *   // :socket="socket"
 *   // chatSetting="allow"
 * // />
 * 
 * @example With Chat Disabled
 * // <MessagePanel
 *   // :messages="messages"
 *   // :messagesLength="messages.length"
 *   // type="group"
 *   // username="participant"
 *   // :onSendMessagePress="() => {}"
 *   // :focusedInput="false"
 *   // eventType="broadcast"
 *   // member="participant"
 *   // islevel="0"
 *   // :startDirectMessage="false"
 *   // :updateStartDirectMessage="() => {}"
 *   // :directMessageDetails="null"
 *   // :updateDirectMessageDetails="() => {}"
 *   // :coHostResponsibility="[]"
 *   // coHost=""
 *   // roomName="broadcast-789"
 *   // :socket="socket"
 *   // chatSetting="disallow"
 * // />
 * 
 * @remarks
 * The component handles permission checks internally - if chat is disabled or the user
 * doesn't have permission to send messages, an alert is shown. For direct messages,
 * clicking "Reply" on an incoming message automatically switches to direct message mode
 * and targets the sender.
 * 
 * Workflow:
 * 1. Component mounts → Auto-focuses input if focusedInput=true
 * 2. Messages displayed → Own messages right-aligned, others left-aligned
 * 3. User clicks "Reply" on DM → Sets directMessageDetails to sender, switches to DM mode
 * 4. User types message → Updates messageText state
 * 5. User clicks Send → Checks permissions → Calls onSendMessagePress
 * 6. Message sent successfully → Clears input, resets reply state
 * 7. Permission denied → Shows alert explaining restriction
 * 
 * @see {@link MessagesModal} - Modal container for the message panel
 */
-->
<template>
  <div
    class="ms-message-panel"
    :style="styles.panel"
  >
    <div
      class="ms-message-panel__messages"
      :style="styles.messages"
    >
      <div
        v-if="showRecipientInfo"
        :style="styles.infoBox"
      >
        <div :style="styles.infoBoxHeader">
          <font-awesome-icon :icon="faUserFriends" />
          <span>Select a recipient</span>
        </div>
        <p :style="styles.infoBoxText">
          To send a direct message, reply to an existing message above or use the Participants panel message button.
        </p>
      </div>

      <div
        v-if="showPrivacyNotice"
        :style="styles.privacyInfoBox"
      >
        <div :style="styles.privacyInfoBoxHeader">
          <font-awesome-icon :icon="faLock" />
          <span>Private messages</span>
        </div>
        <p :style="styles.infoBoxText">
          Direct messages you send here go straight to the host and stay private.
        </p>
      </div>

      <div
        v-if="messages.length === 0"
        :style="styles.emptyState"
      >
        <font-awesome-icon
          :icon="emptyStateIcon"
          :style="styles.emptyStateIcon"
        />
        <span :style="styles.emptyStateTitle">
          {{ type === 'direct' ? 'No direct messages yet' : 'No group messages yet' }}
        </span>
        <span :style="styles.emptyStateText">
          {{ emptyStateHint }}
        </span>
      </div>

      <!-- Message rendering -->
    <div
      v-for="(message, index) in messages"
      :key="index"
      :style="styles.messageItem"
    >
      <div
        :style="{
          display: 'flex',
          flexDirection: 'column',
          alignItems: message.sender === username ? 'flex-end' : 'flex-start',
          marginBottom: '10px',
        }"
      >
        <div
          :style="{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: '3px',
          }"
        >
          <span
            v-if="message.sender === username && !message.group"
            :style="{
              fontWeight: 'bold',
              color: 'var(--ms-message-meta-color, var(--ms-modern-text-muted, #64748b))',
              fontSize: '0.7rem',
              marginLeft: '6px',
            }"
          >
            To: {{ message.receivers.join(', ') }}
          </span>
          <span
            :style="{
              fontWeight: 'bold',
              color: 'var(--ms-message-meta-color, var(--ms-modern-text-muted, #64748b))',
              fontSize: '0.7rem',
              marginRight: '10px',
            }"
          >
            {{ message.sender === username ? '' : message.sender }}
          </span>
          <span :style="{ fontSize: '0.7rem', color: 'var(--ms-message-meta-color, var(--ms-modern-text-muted, #64748b))' }">
            {{ message.timestamp }}
          </span>
          <div
            v-if="message.sender !== username && !message.group"
            :style="{
              padding: '1px',
              marginLeft: '5px',
              borderRadius: '2px',
              backgroundColor: 'transparent',
              cursor: 'pointer',
            }"
            @click="openReplyInput(message.sender)"
          >
            <font-awesome-icon
              :icon="faReply"
              size="xs"
              color="var(--ms-message-meta-color, var(--ms-modern-text-muted, #64748b))"
            />
          </div>
        </div>
        <div
          :style="{
            background: message.sender === member
              ? 'var(--ms-message-bubble-own, linear-gradient(135deg, var(--ms-modern-brand-primary, #6366f1) 0%, var(--ms-modern-brand-secondary, #3b82f6) 100%))'
              : 'var(--ms-message-bubble-other, rgba(148, 163, 184, 0.14))',
            padding: '10px',
            borderRadius: '14px',
            border: message.sender === member
              ? '1px solid transparent'
              : '1px solid var(--ms-message-bubble-border, var(--ms-modern-panel-border, rgba(148, 163, 184, 0.24)))',
            boxShadow: message.sender === member
              ? 'var(--ms-modern-shadow-soft, 0 12px 32px rgba(2, 8, 23, 0.22))'
              : 'none',
          }"
        >
          <span
            :style="{
              color: message.sender === member
                ? 'var(--ms-message-bubble-own-text, #ffffff)'
                : 'var(--ms-message-bubble-text, var(--ms-modern-text-primary, #0f172a))',
              lineHeight: 1.5,
            }"
          >{{ message.message }}</span>
        </div>
      </div>
    </div>
    </div>

    <!-- Reply info -->
    <div
      v-if="replyInfo"
      class="ms-message-panel__reply-info"
      :style="{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '4px',
        padding: '8px 10px',
        backgroundColor: 'var(--ms-message-reply-background, rgba(59, 130, 246, 0.08))',
        border: '1px solid var(--ms-message-reply-border, rgba(59, 130, 246, 0.18))',
        borderRadius: '12px',
        marginBottom: '8px',
      }"
    >
      <span
        :style="{
          fontWeight: 'bold',
          marginRight: '2px',
          fontSize: '0.72rem',
          color: 'var(--ms-message-meta-color, var(--ms-modern-text-secondary, #475569))',
        }"
      >
        Replying to:
      </span>
      <span
        :style="{
          color: 'var(--ms-modern-brand-secondary, #2563eb)',
          fontSize: '0.72rem',
          fontWeight: 700,
        }"
      >
        {{ replyInfo.username }}
      </span>
    </div>

    <!-- Input area -->
    <div :style="styles.inputContainer">
      <div :style="styles.inputRow">
        <input
          ref="inputRef"
          type="text"
          :style="styles.input"
          :placeholder="placeholderText"
          maxlength="350"
          :value="messageText"
          @input="handleTextInputChange"
          @keydown.enter.prevent="handleSendButton"
        />
        <button
          :style="sendButtonStyle"
          :disabled="!canSend"
          @click="handleSendButton"
        >
          <font-awesome-icon
            :icon="faPaperPlane"
            size="sm"
            color="white"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faLock, faPaperPlane, faReply, faUser, faUserFriends, faUsers } from '@fortawesome/free-solid-svg-icons';
import type { SendMessageOptions } from 'mediasfu-shared';
import type {
  CoHostResponsibility,
  EventType,
  Message,
  Participant,
  ShowAlert,
} from '../../../../SharedTypes';
import type { Socket } from 'socket.io-client';

export interface MessagePanelProps {
  messages: Message[];
  messagesLength: number;
  type: 'direct' | 'group';
  username: string;
  onSendMessagePress: (options: SendMessageOptions) => Promise<void>;
  backgroundColor?: string;
  focusedInput: boolean;
  showAlert?: ShowAlert;
  eventType: EventType;
  member: string;
  islevel: string;
  startDirectMessage: boolean;
  updateStartDirectMessage: (start: boolean) => void;
  directMessageDetails: Participant | null;
  updateDirectMessageDetails: (participant: Participant | null) => void;
  coHostResponsibility: CoHostResponsibility[];
  coHost: string;
  roomName: string;
  socket: Socket;
  chatSetting: string;
}

const props = withDefaults(defineProps<MessagePanelProps>(), {
  backgroundColor: '#f5f5f5',
});

const inputRef = ref<HTMLInputElement | null>(null);
const replyInfo = ref<{ text: string; username: string } | null>(null);
const senderId = ref<string | null>(null);
const directMessageText = ref('');
const groupMessageText = ref('');

const messageText = computed(() => {
  return props.type === 'direct' ? directMessageText.value : groupMessageText.value;
});

const placeholderText = computed(() => {
  if (props.type === 'direct') {
    if (senderId.value) {
      return `Send a direct message to ${senderId.value}`;
    }
    if (props.directMessageDetails) {
      return `Send a direct message to ${props.directMessageDetails.name}`;
    }
    return props.islevel === '2' ? 'Select a message to reply to' : 'Send a direct message to the host';
  }
  return props.eventType === 'chat' ? 'Send a message' : 'Send a message to everyone';
});

const showRecipientInfo = computed(() =>
  props.type === 'direct' && props.islevel === '2' && !senderId.value,
);

const showPrivacyNotice = computed(() =>
  props.type === 'direct' && props.islevel !== '2',
);

const emptyStateHint = computed(() => {
  if (props.type === 'direct') {
    return props.islevel === '2'
      ? 'Start a conversation from the Participants panel.'
      : 'Send a private message to the host from here.';
  }

  return 'Send a message to everyone in the room.';
});

const emptyStateIcon = computed(() => (props.type === 'direct' ? faUser : faUsers));

const canSend = computed(() => messageText.value.trim().length > 0);

const styles = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
    height: '100%',
    maxHeight: '100%',
    background: props.backgroundColor ?? 'transparent',
    color: 'var(--ms-message-text-primary, var(--ms-modern-text-primary, #0f172a))',
  },
  messages: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    overflowY: 'auto' as const,
    padding: '4px 0 16px',
  },
  infoBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    padding: '10px 12px',
    borderRadius: '14px',
    background: 'color-mix(in srgb, var(--ms-modern-brand-secondary, #3b82f6) 12%, transparent)',
    border: '1px solid color-mix(in srgb, var(--ms-modern-brand-secondary, #3b82f6) 24%, transparent)',
    marginBottom: '10px',
  },
  privacyInfoBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    padding: '10px 12px',
    borderRadius: '14px',
    background: 'color-mix(in srgb, var(--ms-modern-warning, #f59e0b) 12%, transparent)',
    border: '1px solid color-mix(in srgb, var(--ms-modern-warning, #f59e0b) 24%, transparent)',
    marginBottom: '10px',
  },
  infoBoxHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--ms-modern-brand-secondary, #2563eb)',
  },
  privacyInfoBoxHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--ms-modern-warning, #b45309)',
  },
  infoBoxText: {
    margin: 0,
    fontSize: '0.74rem',
    lineHeight: 1.45,
    color: 'var(--ms-message-meta-color, var(--ms-modern-text-secondary, #475569))',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    gap: '6px',
    flex: 1,
    minHeight: '200px',
    padding: '28px 16px',
    color: 'var(--ms-message-meta-color, var(--ms-modern-text-secondary, #475569))',
  },
  emptyStateIcon: {
    fontSize: '1.4rem',
    color: 'var(--ms-message-meta-color, var(--ms-modern-text-muted, #64748b))',
    opacity: 0.72,
  },
  emptyStateTitle: {
    fontSize: '0.92rem',
    fontWeight: 700,
    color: 'var(--ms-message-bubble-text, var(--ms-modern-text-primary, #0f172a))',
  },
  emptyStateText: {
    fontSize: '0.78rem',
    lineHeight: 1.45,
  },
  messageItem: {
    marginBottom: 0,
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    marginTop: 'auto',
    padding: '12px 0 0',
    borderTop: '1px solid var(--ms-message-composer-border, var(--ms-modern-panel-border, rgba(148, 163, 184, 0.24)))',
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  input: {
    flex: 1,
    minHeight: '40px',
    maxHeight: '80px',
    resize: 'vertical' as const,
    border: '1px solid var(--ms-message-input-border, var(--ms-modern-field-border, rgba(148, 163, 184, 0.34)))',
    borderRadius: '14px',
    padding: '10px 12px',
    overflowY: 'auto' as const,
    background: 'var(--ms-message-input-background, var(--ms-modern-field-background, rgba(255, 255, 255, 0.92)))',
    color: 'var(--ms-message-input-text, var(--ms-modern-text-primary, #0f172a))',
    outline: 'none',
  },
};

const sendButtonStyle = computed(() => ({
  minWidth: '44px',
  height: '44px',
  background:
    'linear-gradient(135deg, var(--ms-modern-brand-primary, #6366f1) 0%, var(--ms-modern-brand-secondary, #3b82f6) 55%, var(--ms-modern-accent, #06b6d4) 100%)',
  padding: '10px',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  cursor: canSend.value ? 'pointer' : 'not-allowed',
  opacity: canSend.value ? 1 : 0.55,
  boxShadow: 'var(--ms-modern-shadow-soft, 0 12px 32px rgba(2, 8, 23, 0.22))',
}));

const handleTextInputChange = (event: Event) => {
  const text = (event.target as HTMLInputElement).value;
  if (props.type === 'direct') {
    directMessageText.value = text;
  } else {
    groupMessageText.value = text;
  }
};

const openReplyInput = (sender: string) => {
  replyInfo.value = {
    text: 'Replying to: ',
    username: sender,
  };
  senderId.value = sender;
};

const handleSendButton = async () => {
  const message = props.type === 'direct' ? directMessageText.value : groupMessageText.value;

  if (!message) {
    props.showAlert?.({
      message: 'Please enter a message',
      type: 'danger',
      duration: 3000,
    });
    return;
  }

  if (message.length > 350) {
    props.showAlert?.({
      message: 'Message is too long',
      type: 'danger',
      duration: 3000,
    });
    return;
  }

  if (message.trim() === '') {
    props.showAlert?.({
      message: 'Message is not valid.',
      type: 'danger',
      duration: 3000,
    });
    return;
  }

  if (props.type === 'direct' && !senderId.value && props.islevel === '2') {
    props.showAlert?.({
      message: 'Please select a message to reply to',
      type: 'danger',
      duration: 3000,
    });
    return;
  }

  await props.onSendMessagePress({
    message,
    receivers: props.type === 'direct' && senderId.value ? [senderId.value] : [],
    group: props.type === 'group',
    messagesLength: props.messagesLength,
    member: props.member,
    sender: props.username,
    islevel: props.islevel,
    showAlert: props.showAlert,
    coHostResponsibility: props.coHostResponsibility,
    coHost: props.coHost,
    roomName: props.roomName,
    socket: props.socket as any,
    chatSetting: props.chatSetting,
  });

  if (props.type === 'direct') {
    directMessageText.value = '';
  } else {
    groupMessageText.value = '';
  }

  if (inputRef.value) {
    inputRef.value.value = '';
  }

  if (replyInfo.value) {
    replyInfo.value = null;
    senderId.value = null;
  }

  if (props.focusedInput) {
    props.updateDirectMessageDetails(null);
    props.updateStartDirectMessage(false);
  }
};

watch(
  () => [props.startDirectMessage, props.directMessageDetails, props.focusedInput],
  async () => {
    if (props.startDirectMessage && props.directMessageDetails && props.focusedInput) {
      await nextTick();
      inputRef.value?.focus();
      replyInfo.value = {
        text: 'Replying to: ',
        username: props.directMessageDetails.name,
      };
      senderId.value = props.directMessageDetails.name;
    } else {
      replyInfo.value = null;
      if (inputRef.value) {
        inputRef.value.value = '';
      }
    }
  },
  { immediate: true }
);

</script>
