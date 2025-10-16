<!--
/**
 * @fileoverview ParticipantListOthersItem - Read-only participant display item
 * @component ParticipantListOthersItem
 * @module components/participantsComponents/ParticipantListOthersItem
 * 
 * @description
 * A simple, read-only participant item that displays name and mute status indicator.
 * Shows special labels for hosts, co-hosts, and current user. No action buttons -
 * purely for display purposes. Used in ParticipantListOthers for viewing participants
 * without management controls.
 * 
 * Features:
 * - Participant name with role indicators
 * - Mute status indicator (red=muted, green=unmuted)
 * - Special labels: "(host)", "(co-host)", "(you)"
 * - No interactive controls
 * - Simple flex layout
 * 
 * Display Labels:
 * - **Host**: "Name (host)" or "Name (you)" if current user
 * - **Co-host**: "Name (co-host)" or "Name (you)" if current user
 * - **Current User**: "Name (you)"
 * - **Others**: Just the name
 * 
 * @example Basic Participant Display
 * // <ParticipantListOthersItem
 *   // :participant="{ name: 'John Doe', islevel: '0', muted: false }"
 *   // member="current_user"
 *   // coHost="jane_admin"
 * // />
 * 
 * @example Host Display
 * // <ParticipantListOthersItem
 *   // :participant="{ name: 'Jane Admin', islevel: '2', muted: false }"
 *   // member="current_user"
 *   // coHost=""
 * // />
 * 
 * @example Current User (Co-host)
 * // <ParticipantListOthersItem
 *   // :participant="{ name: 'current_user', islevel: '1', muted: true }"
 *   // member="current_user"
 *   // coHost="current_user"
 * // />
 * 
 * @example Muted Participant
 * // <ParticipantListOthersItem
 *   // :participant="{ name: 'Bob Smith', islevel: '0', muted: true }"
 *   // member="alice"
 *   // coHost="admin"
 * // />
 * 
 * @remarks
 * This component is intentionally simple with no interactive elements. For participant
 * management with mute/message/remove buttons, use ParticipantListItem instead.
 * The mute indicator uses a solid circle icon (faCircle) colored red or green.
 * 
 * Workflow:
 * 1. Component receives participant data
 * 2. Computes display name based on islevel and member/coHost props
 * 3. Renders name with appropriate label
 * 4. Shows mute indicator (red if muted, green if unmuted)
 * 5. No user interactions - display only
 * 
 * @see {@link ParticipantListOthers} - Container that renders multiple of these items
 * @see {@link ParticipantListItem} - Interactive version with controls
 */
-->
<template>
  <div
    class="container"
    :style="styles.container"
  >
    <div
      class="name-container"
      :style="styles.nameContainer"
    >
      <span
        class="name-text"
        :style="styles.nameText"
      >
        {{ displayName }}
      </span>
    </div>
    <div
      class="icon-container"
      :style="styles.iconContainer"
    >
      <font-awesome-icon
        :icon="faCircle"
        :style="{ color: participant.muted ? 'red' : 'green' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import type { Participant } from '../../../../SharedTypes';

/**
 * Props for the ParticipantListOthersItem component
 * @interface ParticipantListOthersItemProps
 * 
 * @property {Participant} participant - Participant object with name, islevel, muted status
 * @property {string} member - Current user's username (for "you" label)
 * @property {string} coHost - Username of the co-host (for "co-host" label)
 * 
 * @example
 * ```typescript
 * // <ParticipantListOthersItem
 *   // :participant="{ name: 'John', islevel: '0', muted: false }"
 *   // member="current_user"
 *   // coHost="admin"
 * // />
 * ```
 */
export interface ParticipantListOthersItemProps {
  participant: Participant;
  member: string;
  coHost: string;
}

const props = defineProps<ParticipantListOthersItemProps>();


const displayName = computed(() => {
  if (props.participant.islevel === '2') {
    return props.participant.name === props.member
      ? `${props.participant.name} (you)`
      : `${props.participant.name} (host)`;
  } else {
    if (props.participant.name === props.member) {
      return `${props.participant.name} (you)`;
    }
    return props.coHost === props.participant.name
      ? `${props.participant.name} (co-host)`
      : props.participant.name;
  }
});

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    marginBottom: '10px',
  },
  nameContainer: {
    flex: 8,
  },
  nameText: {
    fontSize: '16px',
  },
  iconContainer: {
    flex: 4,
    alignItems: 'center',
  },
};
</script>
