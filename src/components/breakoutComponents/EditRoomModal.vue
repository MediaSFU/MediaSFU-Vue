<!--
/**
 * @fileoverview EditRoomModal - Breakout room participant assignment editor
 * @component EditRoomModal
 * @module components/breakoutComponents/EditRoomModal
 * 
 * @description
 * A modal for editing breakout room participant assignments. Allows hosts to add/remove
 * participants from a specific breakout room with dual-list interface showing assigned
 * (in room) and unassigned (not in any room) participants. Features one-click add/remove
 * buttons for easy participant management during breakout room configuration.
 * 
 * Key Features:
 * - Edit specific breakout room assignments
 * - Dual-list UI: Assigned (in this room) vs Unassigned (available)
 * - One-click add/remove participant buttons
 * - Room number display in header
 * - Visual participant count indicators
 * - Scrollable lists for large participant counts
 * - Close button to save changes and exit
 * - Responsive modal design
 * - FontAwesome icons for visual clarity
 * 
 * Workflow:
 * 1. Host clicks "Edit" on a breakout room in BreakoutRoomsModal
 * 2. EditRoomModal opens showing room number and participants
 * 3. Assigned Participants list shows who is currently in this room
 * 4. Unassigned Participants list shows who is available to add
 * 5. Host clicks "Add" on unassigned participant → moves to assigned list
 * 6. Host clicks "Remove" on assigned participant → moves to unassigned list
 * 7. Changes are applied immediately via handleAddParticipant/handleRemoveParticipant
 * 8. Host closes modal → returns to BreakoutRoomsModal with updated assignments
 * 
 * @example Basic Usage
 * ```typescript
 * // <EditRoomModal
 *   // :editRoomModalVisible="isEditRoomModalVisible"
 *   // :setEditRoomModalVisible="setIsEditRoomModalVisible"
 *   // :currentRoom="selectedRoomParticipants"
 *   // :participantsRef="{ value: allParticipants }"
 *   // :handleAddParticipant="addParticipantToRoom"
 *   // :handleRemoveParticipant="removeParticipantFromRoom"
 *   // :currentRoomIndex="selectedRoomIndex"
 * // />
 * ```
 * 
 * @example With Custom Handlers
 * ```typescript
 * // <script setup>
 * const handleAdd = (roomIndex, participant) => {
 *   // console.log(`Adding ${participant.name} to room ${roomIndex + 1}`);
 *   // Update breakout room assignments
 *   // participant.breakRoom = roomIndex;
 *   // rooms[roomIndex].push(participant);
 * };
 * 
 * const handleRemove = (roomIndex, participant) => {
 *   // console.log(`Removing ${participant.name} from room ${roomIndex + 1}`);
 *   // Remove from room assignments
 *   // participant.breakRoom = null;
 *   // const index = rooms[roomIndex].findIndex(p => p.name === participant.name);
 *   // if (index !== -1) rooms[roomIndex].splice(index, 1);
 * };
 * </script>
 * 
 * // <template>
 *   <EditRoomModal
 *     :editRoomModalVisible="true"
 *     :setEditRoomModalVisible="setModalVisible"
 *     :currentRoom="room2Participants"
 *     :participantsRef="{ value: participants }"
 *     :handleAddParticipant="handleAdd"
 *     :handleRemoveParticipant="handleRemove"
 *     :currentRoomIndex="1"
 *   />
 * </template>
 * ```
 * 
 * @example Programmatic Room Editing
 * ```typescript
 * // <script setup>
 * import { ref } from 'vue';
 * 
 * const isEditModalVisible = ref(false);
 * const currentRoomIndex = ref(null);
 * const currentRoomParticipants = ref([]);
 * 
 * const openEditModal = (roomIndex) => {
 *   // currentRoomIndex.value = roomIndex;
 *   // currentRoomParticipants.value = breakoutRooms[roomIndex];
 *   // isEditModalVisible.value = true;
 * };
 * 
 * const addToRoom = (roomIdx, participant) => {
 *   // participant.breakRoom = roomIdx;
 *   // breakoutRooms[roomIdx].push(participant);
 * };
 * 
 * const removeFromRoom = (roomIdx, participant) => {
 *   // participant.breakRoom = null;
 *   // const idx = breakoutRooms[roomIdx].findIndex(p => p.name === participant.name);
 *   // if (idx !== -1) breakoutRooms[roomIdx].splice(idx, 1);
 * };
 * </script>
 * 
 * // <template>
 *   <button @click="openEditModal(0)">Edit Room 1</button>
 *   
 *   <EditRoomModal
 *     :editRoomModalVisible="isEditModalVisible"
 *     :setEditRoomModalVisible="(v) => isEditModalVisible = v"
 *     :currentRoom="currentRoomParticipants"
 *     :participantsRef="{ value: allParticipants }"
 *     :handleAddParticipant="addToRoom"
 *     :handleRemoveParticipant="removeFromRoom"
 *     :currentRoomIndex="currentRoomIndex"
 *   />
 * </template>
 * ```
 * 
 * @see {@link BreakoutRoomsModal} for main breakout rooms management interface
 * @see {@link RoomList} for breakout room list display component
 * @see {@link https://mediasfu.com/docs/breakout-rooms} for breakout rooms documentation
 */
-->
<template>
  <div :style="modalContainerStyle">
    <div :style="modalContentStyle">
      <div class="modal-header">
        <h3 class="modal-title">
          Edit Room {{ (props.currentRoomIndex ?? 0) + 1 }} <font-awesome-icon :icon="faEdit" />
        </h3>
        <button
          class="close-button"
          @click="closeModal"
        >
          <font-awesome-icon
            :icon="faTimes"
            size="xl"
          />
        </button>
      </div>
      <hr class="divider" />
        
      <div class="participants-section">
        <h4 class="section-title">
          Assigned Participants <font-awesome-icon :icon="faUsers" />
        </h4>
        <ul class="participants-list">
          <li
            v-for="(participant, index) in props.currentRoom"
            :key="index"
            class="participant-item"
          >
            <span>{{ participant.name }}</span>
            <button
              class="btn btn-sm btn-danger"
              @click="handleRemove(participant)"
            >
              <font-awesome-icon :icon="faMinus" /> Remove
            </button>
          </li>
        </ul>
      </div>

      <div class="participants-section">
        <h4 class="section-title">
          Unassigned Participants <font-awesome-icon :icon="faUserFriends" />
        </h4>
        <ul class="participants-list">
          <li
            v-for="(participant, index) in unassignedParticipants"
            :key="index"
            class="participant-item"
          >
            <span>{{ participant.name }}</span>
            <button
              class="btn btn-sm btn-success"
              @click="handleAdd(participant)"
            >
              <font-awesome-icon :icon="faPlus" /> Add
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineOptions } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faEdit,
  faTimes,
  faUsers,
  faUserFriends,
  faPlus,
  faMinus,
} from '@fortawesome/free-solid-svg-icons';
import type { Participant, BreakoutParticipant } from 'mediasfu-shared';

defineOptions({
  name: 'EditRoomModal'
});

/**
 * Props for the EditRoomModal component
 * @interface EditRoomModalProps
 * 
 * @property {boolean} editRoomModalVisible - Controls modal visibility
 * @property {(visible: boolean) => void} setEditRoomModalVisible - Function to update modal visibility state
 * @property {BreakoutParticipant[]} currentRoom - Array of participants currently assigned to this room
 * @property {{ value: Participant[] }} participantsRef - Ref object containing all participants in the session
 * @property {(roomIndex: number, participant: Participant | BreakoutParticipant) => void} handleAddParticipant - Function to add participant to room
 * @property {(roomIndex: number, participant: Participant | BreakoutParticipant) => void} handleRemoveParticipant - Function to remove participant from room
 * @property {number | null} currentRoomIndex - Index of the room being edited (0-based, null if none)
 * 
 * @example EditRoomModalProps Usage
 * ```ts
 * const editRoomProps = {
 *   // editRoomModalVisible: true,
 *   // setEditRoomModalVisible: (visible) => {
 *     isEditModalVisible.value = visible;
 *   },
 *   // currentRoom: [
 *     { name: 'Alice', breakRoom: 0 },
 *     { name: 'Bob', breakRoom: 0 }
 *   ],
 *   // participantsRef: {
 *     value: [
 *       { name: 'Alice', breakRoom: 0 },
 *       { name: 'Bob', breakRoom: 0 },
 *       { name: 'Charlie', breakRoom: null },
 *       { name: 'Diana', breakRoom: null }
 *     ]
 *   },
 *   // handleAddParticipant: (roomIdx, participant) => {
 *     participant.breakRoom = roomIdx;
 *     breakoutRooms[roomIdx].push(participant);
 *     console.log(`Added ${participant.name} to Room ${roomIdx + 1}`);
 *   },
 *   // handleRemoveParticipant: (roomIdx, participant) => {
 *     participant.breakRoom = null;
 *     const idx = breakoutRooms[roomIdx].findIndex(p => p.name === participant.name);
 *     if (idx !== -1) breakoutRooms[roomIdx].splice(idx, 1);
 *     console.log(`Removed ${participant.name} from Room ${roomIdx + 1}`);
 *   },
 *   // currentRoomIndex: 0
 * };
 * ```
 * 
 * @default editRoomModalVisible - No default (required)
 * @default setEditRoomModalVisible - No default (required)
 * @default currentRoom - No default (required)
 * @default participantsRef - No default (required)
 * @default handleAddParticipant - No default (required)
 * @default handleRemoveParticipant - No default (required)
 * @default currentRoomIndex - No default (required)
 */
export interface EditRoomModalProps {
  editRoomModalVisible: boolean;
  setEditRoomModalVisible: (visible: boolean) => void;
  currentRoom: BreakoutParticipant[];
  participantsRef: { value: Participant[] };
  handleAddParticipant: (roomIndex: number, participant: Participant | BreakoutParticipant) => void;
  handleRemoveParticipant: (roomIndex: number, participant: Participant | BreakoutParticipant) => void;
  currentRoomIndex: number | null;
}

const props = defineProps<EditRoomModalProps>();

// Modal styles
const modalContainerStyle = computed(() => ({
  position: 'fixed' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 1000,
  display: props.editRoomModalVisible ? 'flex' : 'none',
  justifyContent: 'center',
  alignItems: 'center',
}));

const modalContentStyle = computed(() => ({
  backgroundColor: '#fff',
  borderRadius: '10px',
  padding: '20px',
  width: '80%',
  maxWidth: '500px',
  maxHeight: '80%',
  overflowY: 'auto' as const,
}));

const unassignedParticipants = computed(() => {
  return props.participantsRef.value.filter((participant) => participant.breakRoom == null);
});

const closeModal = () => {
  props.setEditRoomModalVisible(false);
};

const handleAdd = (participant: Participant | BreakoutParticipant) => {
  if (props.currentRoomIndex != null) {
    props.handleAddParticipant(props.currentRoomIndex, participant);
  }
};

const handleRemove = (participant: BreakoutParticipant) => {
  if (props.currentRoomIndex != null) {
    props.handleRemoveParticipant(props.currentRoomIndex, participant);
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-container {
  background-color: #f5f5f5;
  border-radius: 10px;
  padding: 0;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content {
  padding: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: black;
  margin: 0;
}

.close-button {
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  color: black;
  font-size: 20px;
}

.close-button:hover {
  opacity: 0.7;
}

.divider {
  height: 1px;
  background-color: black;
  border: none;
  margin: 15px 0;
}

.participants-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.participants-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.participant-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  margin-bottom: 8px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.participant-item:last-child {
  margin-bottom: 0;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 0.75rem;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #1e7e34;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #a71d2a;
}
</style>
