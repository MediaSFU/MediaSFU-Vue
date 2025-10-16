<!--
/**
 * @fileoverview RoomList - Breakout room display and management component
 * @component RoomList
 * @module components/breakoutComponents/RoomList
 * 
 * @description
 * A display component for breakout rooms showing room cards with participant lists and
 * management actions. Each room card displays the room number, assigned participants,
 * and action buttons (Edit, Delete, Remove participant). Designed to be used within
 * BreakoutRoomsModal for comprehensive breakout room management.
 * 
 * Key Features:
 * - Room card display with room number and participant list
 * - Edit button to open EditRoomModal for participant assignment
 * - Delete button to remove entire room
 * - Remove participant button (× icon) for each participant
 * - Visual room numbering (Room 1, Room 2, etc.)
 * - Scrollable participant lists for rooms with many participants
 * - Styled card layout with headers and bodies
 * - FontAwesome icons for actions (door, edit, trash, times)
 * - Responsive design for various screen sizes
 * 
 * Actions:
 * - **Edit Room**: Opens EditRoomModal to add/remove participants
 * - **Delete Room**: Removes entire room and unassigns all participants
 * - **Remove Participant**: Removes specific participant from room (× button)
 * 
 * Workflow:
 * 1. Component receives array of rooms (each room is array of participants)
 * 2. Renders room card for each room with room number
 * 3. Lists all participants in each room with remove buttons
 * 4. Host clicks "Edit" → triggers handleEditRoom callback
 * 5. Host clicks "Delete" → triggers handleDeleteRoom callback
 * 6. Host clicks "×" on participant → triggers handleRemoveParticipant callback
 * 7. Parent component (BreakoutRoomsModal) handles all state updates
 * 
 * @example Basic Usage
 * ```vue
 * <RoomList
 *   :rooms="breakoutRooms"
 *   :handleEditRoom="openEditModal"
 *   :handleDeleteRoom="deleteRoom"
 *   :handleRemoveParticipant="removeParticipantFromRoom"
 * />
 * ```
 * 
 * @example With Breakout Rooms Data
 * ```vue
 * <script setup>
 * const breakoutRooms = ref([
 *   [
 *     { name: 'Alice', breakRoom: 0 },
 *     { name: 'Bob', breakRoom: 0 }
 *   ],
 *   [
 *     { name: 'Charlie', breakRoom: 1 },
 *     { name: 'Diana', breakRoom: 1 },
 *     { name: 'Eve', breakRoom: 1 }
 *   ]
 * ]);
 * 
 * const editRoom = (roomIndex) => {
 *   console.log(`Editing Room ${roomIndex + 1}`);
 *   currentRoomIndex.value = roomIndex;
 *   isEditModalVisible.value = true;
 * };
 * 
 * const deleteRoom = (roomIndex) => {
 *   console.log(`Deleting Room ${roomIndex + 1}`);
 *   const room = breakoutRooms.value[roomIndex];
 *   room.forEach(p => p.breakRoom = null);
 *   breakoutRooms.value.splice(roomIndex, 1);
 * };
 * 
 * const removeParticipant = (roomIndex, participant) => {
 *   console.log(`Removing ${participant.name} from Room ${roomIndex + 1}`);
 *   participant.breakRoom = null;
 *   const idx = breakoutRooms.value[roomIndex].findIndex(p => p.name === participant.name);
 *   if (idx !== -1) breakoutRooms.value[roomIndex].splice(idx, 1);
 * };
 * </script>
 * 
 * <template>
 *   <RoomList
 *     :rooms="breakoutRooms"
 *     :handleEditRoom="editRoom"
 *     :handleDeleteRoom="deleteRoom"
 *     :handleRemoveParticipant="removeParticipant"
 *   />
 * </template>
 * ```
 * 
 * @example Empty Room Display
 * ```vue
 * <RoomList
 *   :rooms="[
 *     [],
 *     [{ name: 'Alice', breakRoom: 1 }],
 *     []
 *   ]"
 *   :handleEditRoom="editRoom"
 *   :handleDeleteRoom="deleteRoom"
 *   :handleRemoveParticipant="removeParticipant"
 * />
 * Room 1: empty, Room 2: 1 participant, Room 3: empty
 * ```
 * 
 * @see {@link BreakoutRoomsModal} for main breakout rooms management interface
 * @see {@link EditRoomModal} for participant assignment editor
 * @see {@link https://mediasfu.com/docs/breakout-rooms} for breakout rooms documentation
 */
-->
<template>
  <div
    v-for="(room, roomIndex) in rooms"
    :key="roomIndex"
    class="room-card"
  >
    <div class="card-header">
      <h5 class="room-title">
        Room {{ roomIndex + 1 }} <font-awesome-icon :icon="faDoorOpen" />
      </h5>
      <div class="room-actions">
        <button
          class="btn btn-sm btn-primary mr-2"
          @click="props.handleEditRoom(roomIndex)"
        >
          <font-awesome-icon :icon="faEdit" /> Edit
        </button>
        <button
          class="btn btn-sm btn-danger"
          @click="props.handleDeleteRoom(roomIndex)"
        >
          <font-awesome-icon :icon="faTrash" /> Delete
        </button>
      </div>
    </div>
    <div class="card-body">
      <ul class="participant-list">
        <li
          v-for="(participant, participantIndex) in room"
          :key="participantIndex"
          class="participant-item"
        >
          <span>{{ participant.name }}</span>
          <button
            class="btn btn-sm btn-danger ml-2"
            @click="props.handleRemoveParticipant(roomIndex, participant)"
          >
            <font-awesome-icon :icon="faTimes" />
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineOptions } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faDoorOpen, faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import type { BreakoutParticipant } from 'mediasfu-shared';

defineOptions({
  name: 'RoomList'
});

/**
 * Props for the RoomList component
 * @interface RoomListProps
 * 
 * @property {BreakoutParticipant[][]} rooms - Array of rooms, where each room is an array of participants
 * @property {(roomIndex: number) => void} handleEditRoom - Callback when Edit button is clicked
 * @property {(roomIndex: number) => void} handleDeleteRoom - Callback when Delete button is clicked
 * @property {(roomIndex: number, participant: BreakoutParticipant) => void} handleRemoveParticipant - Callback when participant × button is clicked
 * 
 * @example RoomListProps Usage
 * ```ts
 * const roomListProps = {
 *   rooms: [
 *     [
 *       { name: 'Alice', breakRoom: 0 },
 *       { name: 'Bob', breakRoom: 0 }
 *     ],
 *     [
 *       { name: 'Charlie', breakRoom: 1 }
 *     ]
 *   ],
 *   handleEditRoom: (roomIndex) => {
 *     console.log(`Opening edit modal for Room ${roomIndex + 1}`);
 *     currentRoomIndex.value = roomIndex;
 *     isEditModalVisible.value = true;
 *   },
 *   handleDeleteRoom: (roomIndex) => {
 *     console.log(`Deleting Room ${roomIndex + 1}`);
 *     // Unassign all participants from this room
 *     rooms[roomIndex].forEach(p => p.breakRoom = null);
 *     // Remove room from array
 *     rooms.splice(roomIndex, 1);
 *   },
 *   handleRemoveParticipant: (roomIndex, participant) => {
 *     console.log(`Removing ${participant.name} from Room ${roomIndex + 1}`);
 *     // Unassign participant
 *     participant.breakRoom = null;
 *     // Remove from room array
 *     const idx = rooms[roomIndex].findIndex(p => p.name === participant.name);
 *     if (idx !== -1) rooms[roomIndex].splice(idx, 1);
 *   }
 * };
 * ```
 * 
 * @default rooms - No default (required)
 * @default handleEditRoom - No default (required)
 * @default handleDeleteRoom - No default (required)
 * @default handleRemoveParticipant - No default (required)
 */
export interface RoomListProps {
  rooms: BreakoutParticipant[][];
  handleEditRoom: (roomIndex: number) => void;
  handleDeleteRoom: (roomIndex: number) => void;
  handleRemoveParticipant: (roomIndex: number, participant: BreakoutParticipant) => void;
}

const props = defineProps<RoomListProps>();
</script>

<style scoped>
.room-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
  background-color: #f9f9f9;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #e9ecef;
  border-bottom: 1px solid #ddd;
}

.room-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
}

.room-actions {
  display: flex;
  gap: 8px;
}

.card-body {
  padding: 15px;
}

.participant-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.participant-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
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

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #a71d2a;
}

.mr-2 {
  margin-right: 8px;
}

.ml-2 {
  margin-left: 8px;
}
</style>
