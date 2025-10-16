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
  <div :style="{ maxHeight: '100%', backgroundColor, overflowY: 'auto' }">
    <!-- Message rendering -->
    <div
      v-for="(message, index) in messages"
      :key="index"
      :style="{ marginBottom: '10px' }"
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
              color: 'black',
              fontSize: '8px',
              marginLeft: '6px',
            }"
          >
            To: {{ message.receivers.join(', ') }}
          </span>
          <span
            :style="{
              fontWeight: 'bold',
              color: 'black',
              fontSize: '8px',
              marginRight: '10px',
            }"
          >
            {{ message.sender === username ? '' : message.sender }}
          </span>
          <span :style="{ fontSize: '8px', color: '#999999' }">
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
              color="black"
            />
          </div>
        </div>
        <div
          :style="{
            backgroundColor: message.sender === member ? '#DCF8C6' : '#1ce5c7',
            padding: '10px',
            borderRadius: '10px',
          }"
        >
          <span :style="{ color: 'black' }">{{ message.message }}</span>
        </div>
      </div>
    </div>

    <!-- Reply info -->
    <div
      v-if="replyInfo"
      :style="{
        flexDirection: 'row',
        alignItems: 'center',
        padding: '2px',
        backgroundColor: '#e6e6e6',
        borderRadius: '5px',
        marginBottom: '1px',
      }"
    >
      <span :style="{ fontWeight: 'bold', marginRight: '2px', fontSize: '8px' }">
        Replying to:
      </span>
      <span :style="{ color: 'red', fontSize: '8px' }">
        {{ replyInfo.username }}
      </span>
    </div>

    <!-- Input area -->
    <div :style="styles.inputContainer">
      <input
        ref="inputRef"
        type="text"
        :style="styles.input"
        :placeholder="placeholderText"
        maxlength="350"
        :value="messageText"
        @input="handleTextInputChange"
      />
      <button
        :style="styles.sendButton"
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
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPaperPlane, faReply } from '@fortawesome/free-solid-svg-icons';
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
    if (props.focusedInput && props.startDirectMessage && props.directMessageDetails) {
      return `Send a direct message to ${props.directMessageDetails.name}`;
    }
    return 'Select a message to reply to';
  }
  return props.eventType === 'chat' ? 'Send a message' : 'Send a message to everyone';
});

const styles = {
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
    marginTop: 'auto',
  },
  input: {
    flex: 1,
    minHeight: '40px',
    maxHeight: '80px',
    resize: 'vertical' as const,
    border: '1px solid gray',
    borderRadius: '5px',
    padding: '10px',
    overflowY: 'auto' as const,
  },
  sendButton: {
    backgroundColor: '#83c0e9',
    padding: '10px',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    border: 'none',
    cursor: 'pointer',
  },
};

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
    receivers: props.type === 'direct' ? [senderId.value!] : [],
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
