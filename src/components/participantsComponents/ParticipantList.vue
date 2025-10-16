<!--
/**
 * @fileoverview ParticipantList - Container for rendering all participant list items
 * @component ParticipantList
 * @module components/participantsComponents/ParticipantList
 * 
 * @description
 * A container component that renders a list of all participants with separators between
 * each item. Passes all necessary props to individual ParticipantListItem components
 * for rendering participant controls (mute, message, remove). Used in ParticipantsModal
 * to display the full participant roster with host/co-host controls.
 * 
 * Features:
 * - Renders array of participants with ParticipantListItem
 * - Horizontal rule separators between items
 * - Passes socket and control functions to children
 * - Supports broadcast mode (disables certain controls)
 * - Co-host responsibility checks for permissions
 * - Direct messaging integration
 * 
 * @example Basic Participant List
 * // <ParticipantList
 *   // :participants="allParticipants"
 *   // :isBroadcast="false"
 *   // :socket="socketInstance"
 *   // :member="currentUsername"
 *   // :islevel="'1'"
 *   // :coHost="coHostName"
 *   // roomName="meeting-room-123"
 *   // :coHostResponsibility="coHostPermissions"
 *   // :onMuteParticipants="handleMute"
 *   // :onMessageParticipants="handleMessage"
 *   // :onRemoveParticipants="handleRemove"
 *   // :showAlert="showAlertFunction"
 *   // :updateIsMessagesModalVisible="setMessagesModalVisible"
 *   // :updateDirectMessageDetails="setDirectMessageDetails"
 *   // :updateStartDirectMessage="setStartDirectMessage"
 *   // :updateParticipants="setParticipants"
 * // />
 * 
 * @example Broadcast Mode (No Controls)
 * // <ParticipantList
 *   // :participants="viewers"
 *   // :isBroadcast="true"
 *   // :socket="socket"
 *   // member="host"
 *   // islevel="2"
 *   // coHost=""
 *   // roomName="broadcast-123"
 *   // :coHostResponsibility="[]"
 *   // :onMuteParticipants="() => {}"
 *   // :onMessageParticipants="() => {}"
 *   // :onRemoveParticipants="() => {}"
 *   // :showAlert="showAlert"
 *   // :updateIsMessagesModalVisible="() => {}"
 *   // :updateDirectMessageDetails="() => {}"
 *   // :updateStartDirectMessage="() => {}"
 *   // :updateParticipants="() => {}"
 * // />
 * 
 * @remarks
 * This is a simple container component that handles the layout and iteration.
 * All participant-specific logic (mute button, message button, etc.) is handled
 * by the ParticipantListItem child component.
 * 
 * Workflow:
 * 1. Receives array of participants from ParticipantsModal
 * 2. Iterates through participants array
 * 3. Renders ParticipantListItem for each participant
 * 4. Adds <hr> separator between items (except after last item)
 * 5. ParticipantListItem handles all user interactions
 * 
 * @see {@link ParticipantListItem} - Individual participant item with controls
 * @see {@link ParticipantsModal} - Modal container for participant lists
 */
-->
<template>
  <div>
    <template
      v-for="(participant, index) in participants"
      :key="participant.name"
    >
      <ParticipantListItem
        :participant="participant"
        :is-broadcast="isBroadcast"
        :on-mute-participants="onMuteParticipants"
        :on-message-participants="onMessageParticipants"
        :on-remove-participants="onRemoveParticipants"
        :socket="socket"
        :co-host-responsibility="coHostResponsibility"
        :member="member"
        :islevel="islevel"
        :show-alert="showAlert"
        :co-host="coHost"
        :room-name="roomName"
        :update-is-messages-modal-visible="updateIsMessagesModalVisible"
        :update-direct-message-details="updateDirectMessageDetails"
        :update-start-direct-message="updateStartDirectMessage"
        :participants="participants"
        :update-participants="updateParticipants"
      />
      <hr
        v-if="index < participants.length - 1"
        :key="`separator-${index}`"
        class="separator"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import ParticipantListItem from './ParticipantListItem.vue';
import type {
  Participant,
  MuteParticipantsType,
  MessageParticipantsType,
  RemoveParticipantsType,
  CoHostResponsibility,
  ShowAlert,
} from '../../../../SharedTypes';
import type { Socket } from 'socket.io-client';

/**
 * Props for the ParticipantList component
 * @interface ParticipantListProps
 * 
 * @property {Participant[]} participants - Array of all participants to display
 * @property {boolean} isBroadcast - Whether in broadcast mode (hides controls)
 * @property {MuteParticipantsType} onMuteParticipants - Function to mute/unmute participants
 * @property {MessageParticipantsType} onMessageParticipants - Function to send direct messages
 * @property {RemoveParticipantsType} onRemoveParticipants - Function to remove participants
 * @property {Socket} socket - Socket.io client instance for real-time communication
 * @property {CoHostResponsibility[]} coHostResponsibility - Array of permissions for co-hosts
 * @property {string} member - Current user's username
 * @property {string} islevel - Current user's level ('0'=participant, '1'=co-host, '2'=host)
 * @property {ShowAlert} showAlert - Function to display alert messages
 * @property {string} coHost - Username of the co-host
 * @property {string} roomName - Current room/meeting name
 * @property {(value: boolean) => void} updateIsMessagesModalVisible - Function to toggle messages modal
 * @property {(details: any) => void} updateDirectMessageDetails - Function to set direct message details
 * @property {(value: boolean) => void} updateStartDirectMessage - Function to start direct messaging
 * @property {Participant[]} participants - Participants array (for updates)
 * @property {(participants: Participant[]) => void} updateParticipants - Function to update participants list
 * 
 * @example
 * ```typescript
 * // <ParticipantList
 *   // :participants="participants"
 *   // :isBroadcast="false"
 *   // :socket="socket"
 *   // member="john_doe"
 *   // islevel="1"
 *   // coHost="jane_admin"
 *   // roomName="meeting-123"
 *   // :coHostResponsibility="['participants']"
 *   // :onMuteParticipants="muteHandler"
 *   // :onMessageParticipants="messageHandler"
 *   // :onRemoveParticipants="removeHandler"
 *   // :showAlert="alertFunction"
 *   // :updateIsMessagesModalVisible="setModalVisible"
 *   // :updateDirectMessageDetails="setMessageDetails"
 *   // :updateStartDirectMessage="setStartMessage"
 *   // :updateParticipants="setParticipants"
 * // />
 * ```
 */
export interface ParticipantListProps {
  participants: Participant[];
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
  updateParticipants: (participants: Participant[]) => void;
}

defineProps<ParticipantListProps>();

</script>
