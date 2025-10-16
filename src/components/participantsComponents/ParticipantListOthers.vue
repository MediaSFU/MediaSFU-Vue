<!--
/**
 * @fileoverview ParticipantListOthers - Read-only participant list without controls
 * @component ParticipantListOthers
 * @module components/participantsComponents/ParticipantListOthers
 * 
 * @description
 * A simplified participant list container that displays participants without any action buttons.
 * Used for displaying "Other Participants" in contexts where users only need to view the list
 * without mute/message/remove controls. Renders ParticipantListOthersItem components with
 * separators between each item.
 * 
 * Features:
 * - Simple read-only participant display
 * - No action buttons (mute, message, remove)
 * - Horizontal rule separators between items
 * - Minimal props (participants, coHost, member)
 * - Lightweight alternative to ParticipantList
 * 
 * Use Cases:
 * - Viewing participants without management controls
 * - "Other Participants" section in ParticipantsModal
 * - Participant lists for non-privileged users
 * - Display-only participant rosters
 * 
 * @example Basic Read-Only List
 * // <ParticipantListOthers
 *   // :participants="otherParticipants"
 *   // coHost="jane_admin"
 *   // member="john_doe"
 * // />
 * 
 * @example Empty List
 * // <ParticipantListOthers
 *   // :participants="[]"
 *   // coHost=""
 *   // member="current_user"
 * // />
 * 
 * @example With Multiple Participants
 * // <ParticipantListOthers
 *   // :participants="[
 *     { name: 'Alice', islevel: '0', muted: false },
 *     { name: 'Bob', islevel: '0', muted: true },
 *     { name: 'Charlie', islevel: '0', muted: false }
 *   ]"
 *   // coHost="admin"
 *   // member="current_user"
 * // />
 * 
 * @remarks
 * This component is intentionally minimal - it only displays participant names and basic
 * information without any interactive controls. For lists with mute/message/remove buttons,
 * use ParticipantList instead.
 * 
 * Workflow:
 * 1. Receives array of participants
 * 2. Iterates through participants
 * 3. Renders ParticipantListOthersItem for each (name + visual indicator only)
 * 4. Adds <hr> separator between items (except after last item)
 * 5. No user interactions beyond viewing
 * 
 * @see {@link ParticipantListOthersItem} - Individual read-only participant item
 * @see {@link ParticipantList} - Full participant list with controls
 * @see {@link ParticipantsModal} - Modal containing both participant lists
 */
-->
<template>
  <div>
    <div
      v-for="(participant, index) in participants"
      :key="participant.name"
    >
      <ParticipantListOthersItem
        :participant="participant"
        :co-host="coHost"
        :member="member"
      />
      <hr
        v-if="index < participants.length - 1"
        class="separator"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ParticipantListOthersItem from './ParticipantListOthersItem.vue';
import type { Participant } from '../../../../SharedTypes';

/**
 * Props for the ParticipantListOthers component
 * @interface ParticipantListOthersProps
 * 
 * @property {Participant[]} participants - Array of participants to display (read-only)
 * @property {string} coHost - Username of the co-host
 * @property {string} member - Current user's username
 * 
 * @example
 * ```typescript
 * // <ParticipantListOthers
 *   // :participants="otherParticipants"
 *   // coHost="admin_user"
 *   // member="current_user"
 * // />
 * ```
 */
export interface ParticipantListOthersProps {
  participants: Participant[];
  coHost: string;
  member: string;
}

defineProps<ParticipantListOthersProps>();

</script>
