<!--
/**
 * @fileoverview ParticipantListItem - Individual participant row with controls
 * @component ParticipantListItem
 * @module components/participantsComponents/ParticipantListItem
 * 
 * @description
 * A single participant row displaying name, mute status, and action buttons (mute, message, remove).
 * Handles permission checks for hosts/co-hosts and provides interactive controls for participant
 * management. Shows "(host)" label for hosts and displays appropriate icons based on mute state.
 * 
 * Features:
 * - Participant name display with host indicator
 * - Mute status indicator (red=muted, green=unmuted)
 * - Mute/unmute button (permission-based)
 * - Direct message button
 * - Remove participant button (permission-based)
 * - Co-host permission checks
 * - Broadcast mode support (hides controls)
 * - Permission validation with alerts
 * 
 * Control Buttons:
 * - **Mute Button** (blue): Toggle participant's audio (faMicrophone/faMicrophoneSlash icon)
 * - **Message Button** (blue): Start direct message with participant (faComment icon)
 * - **Remove Button** (red): Remove participant from meeting (faTrash icon)
 * 
 * Permission Levels:
 * - **islevel='2'** (Host): Full control over all participants
 * - **islevel='1'** (Co-host): Control based on coHostResponsibility array
 * - **islevel='0'** (Participant): No control buttons (except in some contexts)
 * 
 * @example Basic Participant Item (Host View)
 * // <ParticipantListItem
 *   // :participant="participant"
 *   // :isBroadcast="false"
 *   // :socket="socket"
 *   // member="host_user"
 *   // islevel="2"
 *   // coHost=""
 *   // roomName="meeting-123"
 *   // :coHostResponsibility="[]"
 *   // :onMuteParticipants="muteHandler"
 *   // :onMessageParticipants="messageHandler"
 *   // :onRemoveParticipants="removeHandler"
 *   // :showAlert="alertFunction"
 *   // :updateIsMessagesModalVisible="setModalVisible"
 *   // :updateDirectMessageDetails="setMessageDetails"
 *   // :updateStartDirectMessage="setStartMessage"
 *   // :participants="allParticipants"
 *   // :updateParticipants="setParticipants"
 * // />
 * 
 * @example Co-host with Limited Permissions
 * // <ParticipantListItem
 *   // :participant="participant"
 *   // :isBroadcast="false"
 *   // :socket="socket"
 *   // member="cohost_user"
 *   // islevel="1"
 *   // coHost="cohost_user"
 *   // roomName="meeting-456"
 *   // :coHostResponsibility="[{ name: 'participants', value: true, dedicated: true }]"
 *   // :onMuteParticipants="muteHandler"
 *   // :onMessageParticipants="messageHandler"
 *   // :onRemoveParticipants="removeHandler"
 *   // :showAlert="alertFunction"
 *   // :updateIsMessagesModalVisible="setModalVisible"
 *   // :updateDirectMessageDetails="setMessageDetails"
 *   // :updateStartDirectMessage="setStartMessage"
 *   // :participants="allParticipants"
 *   // :updateParticipants="setParticipants"
 * // />
 * 
 * @example Broadcast Mode (No Controls)
 * // <ParticipantListItem
 *   // :participant="viewer"
 *   // :isBroadcast="true"
 *   // :socket="socket"
 *   // member="broadcaster"
 *   // islevel="2"
 *   // coHost=""
 *   // roomName="broadcast-789"
 *   // :coHostResponsibility="[]"
 *   // :onMuteParticipants="() => {}"
 *   // :onMessageParticipants="() => {}"
 *   // :onRemoveParticipants="() => {}"
 *   // :showAlert="alertFunction"
 *   // :updateIsMessagesModalVisible="() => {}"
 *   // :updateDirectMessageDetails="() => {}"
 *   // :updateStartDirectMessage="() => {}"
 *   // :participants="[]"
 *   // :updateParticipants="() => {}"
 * // />
 * 
 * @remarks
 * Permission checks are performed before each action. If the current user doesn't have
 * permission, an alert is shown explaining why. Co-hosts must have the "participants"
 * responsibility with `value: true` and `dedicated: true` to control other participants.
 * 
 * Workflow:
 * 1. Renders participant name (appends "(host)" if islevel='2')
 * 2. If not broadcast mode → Shows mute indicator (faDotCircle: red/green)
 * 3. User clicks Mute button → Checks permission → Calls onMuteParticipants
 * 4. User clicks Message button → Opens direct message UI
 * 5. User clicks Remove button → Checks permission → Calls onRemoveParticipants
 * 6. Permission denied → Shows alert with explanation
 * 
 * @see {@link ParticipantList} - Container that renders multiple ParticipantListItems
 * @see {@link ParticipantsModal} - Modal containing the full participant list
 */
-->
<template>
  <div
    class="container"
    :style="{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: '0px',
      marginTop: '0px',
      gap: '8px',
    }"
  >
    <div
      class="nameContainer"
      :style="{ flex: '4' }"
    >
      <p
        class="nameText"
        :style="{ fontSize: '16px', margin: '0' }"
      >
        {{
          participant.islevel === '2'
            ? `${participant.name} (host)`
            : participant.name
        }}
      </p>
    </div>
    <template v-if="!isBroadcast">
      <div
        class="iconContainer"
        :style="{ flex: '1', alignItems: 'center' }"
      >
        <font-awesome-icon
          :icon="faDotCircle"
          :style="{
            fontSize: '20px',
            color: participant.muted ? 'red' : 'green',
          }"
        />
      </div>
      <div
        class="buttonContainer"
        :style="{ flex: '2', alignItems: 'flex-end' }"
      >
        <button
          :style="{
            padding: '5px',
            borderRadius: '5px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }"
          @click="handleMute"
        >
          <font-awesome-icon
            :icon="muteIcon"
            :style="{ fontSize: '20px' }"
          />
        </button>
      </div>
      <div
        class="buttonContainer"
        :style="{ flex: '2', alignItems: 'flex-end' }"
      >
        <button
          :style="{
            padding: '5px',
            borderRadius: '5px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }"
          @click="handleMessage"
        >
          <font-awesome-icon
            :icon="faComment"
            :style="{ fontSize: '20px', color: 'white' }"
          />
        </button>
      </div>
    </template>
    <div
      class="buttonContainer"
      :style="{ flex: '2', alignItems: 'flex-end' }"
    >
      <button
        :style="{
          padding: '5px',
          borderRadius: '5px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }"
        @click="handleRemove"
      >
        <font-awesome-icon
          :icon="faTrash"
          :style="{ fontSize: '20px', color: 'white' }"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faMicrophone,
  faMicrophoneSlash,
  faComment,
  faTrash,
  faDotCircle,
} from '@fortawesome/free-solid-svg-icons';
import type {
  Participant,
  MuteParticipantsType,
  MessageParticipantsType,
  RemoveParticipantsType,
  ShowAlert,
  CoHostResponsibility,
} from '../../../../SharedTypes';
import type { Socket } from 'socket.io-client';

/**
 * Props for the ParticipantListItem component
 * @interface ParticipantListItemProps
 * 
 * @property {Participant} participant - Participant object with name, islevel, muted status
 * @property {boolean} isBroadcast - Whether in broadcast mode (hides mute/message buttons)
 * @property {MuteParticipantsType} onMuteParticipants - Function to mute/unmute participants
 * @property {MessageParticipantsType} onMessageParticipants - Function to send direct messages
 * @property {RemoveParticipantsType} onRemoveParticipants - Function to remove participants
 * @property {Socket} socket - Socket.io client instance
 * @property {CoHostResponsibility[]} coHostResponsibility - Co-host permissions array
 * @property {string} member - Current user's username
 * @property {string} islevel - Current user's level ('0'=participant, '1'=co-host, '2'=host)
 * @property {ShowAlert} [showAlert] - Function to display alert messages
 * @property {string} coHost - Username of the co-host
 * @property {string} roomName - Current room name
 * @property {(isVisible: boolean) => void} updateIsMessagesModalVisible - Function to toggle messages modal
 * @property {(details: any) => void} updateDirectMessageDetails - Function to set direct message details
 * @property {(value: boolean) => void} updateStartDirectMessage - Function to start direct messaging
 * @property {Participant[]} participants - Full participants array
 * @property {(participants: Participant[]) => void} updateParticipants - Function to update participants list
 * 
 * @example
 * ```typescript
 * // <ParticipantListItem
 *   // :participant="{ name: 'John', islevel: '0', muted: false }"
 *   // :isBroadcast="false"
 *   // :socket="socket"
 *   // member="host_user"
 *   // islevel="2"
 *   // coHost=""
 *   // roomName="meeting-123"
 *   // :coHostResponsibility="[]"
 *   // :onMuteParticipants="muteHandler"
 *   // :onMessageParticipants="messageHandler"
 *   // :onRemoveParticipants="removeHandler"
 *   // :showAlert="alertFunction"
 *   // :updateIsMessagesModalVisible="setModalVisible"
 *   // :updateDirectMessageDetails="setDetails"
 *   // :updateStartDirectMessage="setStartMessage"
 *   // :participants="allParticipants"
 *   // :updateParticipants="setParticipants"
 * // />
 * ```
 */
export interface ParticipantListItemProps {
  participant: Participant;
  isBroadcast: boolean;
  onMuteParticipants: MuteParticipantsType;
  onMessageParticipants: MessageParticipantsType;
  onRemoveParticipants: RemoveParticipantsType;
  socket: Socket;
  coHostResponsibility: CoHostResponsibility[];
  member: string;
  islevel: string;
  showAlert?: ShowAlert;
  coHost: string;
  roomName: string;
  updateIsMessagesModalVisible: (isVisible: boolean) => void;
  updateDirectMessageDetails: (participant: Participant | null) => void;
  updateStartDirectMessage: (start: boolean) => void;
  participants: Participant[];
  updateParticipants: (participants: Participant[]) => void;
}

const props = defineProps<ParticipantListItemProps>();


const muteIcon = computed(() =>
  props.participant.muted ? faMicrophoneSlash : faMicrophone
);

const handleMute = () => {
  props.onMuteParticipants({
    socket: props.socket,
    coHostResponsibility: props.coHostResponsibility,
    participant: props.participant,
    member: props.member,
    islevel: props.islevel,
    showAlert: props.showAlert,
    coHost: props.coHost,
    roomName: props.roomName,
  });
};

const handleMessage = () => {
  props.onMessageParticipants({
    coHostResponsibility: props.coHostResponsibility,
    participant: props.participant,
    member: props.member,
    islevel: props.islevel,
    showAlert: props.showAlert,
    coHost: props.coHost,
    updateIsMessagesModalVisible: props.updateIsMessagesModalVisible,
    updateDirectMessageDetails: props.updateDirectMessageDetails,
    updateStartDirectMessage: props.updateStartDirectMessage,
  });
};

const handleRemove = () => {
  props.onRemoveParticipants({
    coHostResponsibility: props.coHostResponsibility,
    participant: props.participant,
    member: props.member,
    islevel: props.islevel,
    showAlert: props.showAlert,
    coHost: props.coHost,
    participants: props.participants,
  socket: props.socket,
    roomName: props.roomName,
    updateParticipants: props.updateParticipants,
  });
};
</script>
