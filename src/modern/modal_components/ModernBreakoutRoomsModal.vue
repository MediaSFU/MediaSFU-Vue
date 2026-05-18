<template>
  <div
    v-if="isEmbedded"
    class="ms-modern-breakout-sidebar"
  >
    <div class="ms-modern-breakout-sidebar__header">
      <h2 class="ms-modern-breakout-sidebar__title">
        <FontAwesomeIcon :icon="faUsers" />
        <span>{{ embeddedTitle }}</span>
      </h2>
      <button
        type="button"
        class="ms-modern-breakout-sidebar__icon-button"
        @click="props.onBreakoutRoomsClose"
      >
        <FontAwesomeIcon :icon="faTimes" />
      </button>
    </div>

    <div class="ms-modern-breakout-sidebar__controls">
      <div class="ms-modern-breakout-sidebar__control-grid">
        <label class="ms-modern-breakout-sidebar__field">
          <span class="ms-modern-breakout-sidebar__field-label">Number of rooms</span>
          <input
            v-model="numRoomsInput"
            type="number"
            min="1"
            max="20"
            class="ms-modern-breakout-sidebar__number-input"
            :disabled="isStarted"
            @blur="normalizeRoomInput"
          >
        </label>

        <label class="ms-modern-breakout-sidebar__field">
          <span class="ms-modern-breakout-sidebar__field-label">New participant action</span>
          <select
            v-model="newParticipantAction"
            class="ms-modern-breakout-sidebar__select"
            :disabled="isStarted"
          >
            <option value="autoAssignNewRoom">Add to new room</option>
            <option value="autoAssignAvailableRoom">Add to open room</option>
            <option value="manualAssign">No action</option>
          </select>
        </label>
      </div>

      <div class="ms-modern-breakout-sidebar__button-row">
        <button
          type="button"
          class="ms-modern-breakout-sidebar__pill-button ms-modern-breakout-sidebar__pill-button--secondary"
          :disabled="isStarted"
          @click="handleRandomAssign"
        >
          <FontAwesomeIcon :icon="faRandom" />
          <span>Random</span>
        </button>

        <button
          type="button"
          class="ms-modern-breakout-sidebar__pill-button ms-modern-breakout-sidebar__pill-button--secondary"
          :disabled="isStarted"
          @click="handleManualAssign"
        >
          <FontAwesomeIcon :icon="faHandPointer" />
          <span>Create</span>
        </button>

        <button
          type="button"
          class="ms-modern-breakout-sidebar__pill-button ms-modern-breakout-sidebar__pill-button--secondary"
          :disabled="isStarted"
          @click="handleAddRoom"
        >
          <FontAwesomeIcon :icon="faPlus" />
          <span>Add room</span>
        </button>
      </div>
    </div>

    <div class="ms-modern-breakout-sidebar__content">
      <div
        v-if="localRooms.length === 0"
        class="ms-modern-breakout-sidebar__empty"
      >
        No breakout rooms configured. Use Random, Create, or Add room to start.
      </div>

      <template v-else>
        <div
          v-for="(room, roomIndex) in localRooms"
          :key="`room-${roomIndex}`"
          class="ms-modern-breakout-sidebar__room-wrap"
        >
          <section class="ms-modern-breakout-sidebar__room-card">
            <div class="ms-modern-breakout-sidebar__room-header">
              <div class="ms-modern-breakout-sidebar__room-title">
                <FontAwesomeIcon :icon="faUsers" />
                <span>Room {{ roomIndex + 1 }}</span>
                <span class="ms-modern-breakout-sidebar__room-count">
                  ({{ room.length }} participants)
                </span>
              </div>

              <div class="ms-modern-breakout-sidebar__room-actions">
                <button
                  type="button"
                  class="ms-modern-breakout-sidebar__mini-icon-button"
                  :class="{
                    'ms-modern-breakout-sidebar__mini-icon-button--active': editingRoomIndex === roomIndex,
                  }"
                  @click="handleEditRoom(roomIndex)"
                >
                  <FontAwesomeIcon :icon="editingRoomIndex === roomIndex ? faTimes : faPen" />
                </button>

                <button
                  type="button"
                  class="ms-modern-breakout-sidebar__mini-icon-button ms-modern-breakout-sidebar__mini-icon-button--danger"
                  @click="handleDeleteRoom(roomIndex)"
                >
                  <FontAwesomeIcon :icon="faTrash" />
                </button>
              </div>
            </div>

            <div class="ms-modern-breakout-sidebar__room-body">
              <div
                v-if="room.length === 0"
                class="ms-modern-breakout-sidebar__room-empty"
              >
                No participants
              </div>

              <div
                v-for="participant in room"
                :key="`room-${roomIndex}-${participant.name}`"
                class="ms-modern-breakout-sidebar__participant"
              >
                <span>{{ participant.name }}</span>
              </div>
            </div>
          </section>

          <section
            v-if="editingRoomIndex === roomIndex"
            class="ms-modern-breakout-sidebar__editor"
          >
            <div class="ms-modern-breakout-sidebar__editor-column">
              <div class="ms-modern-breakout-sidebar__editor-heading">
                Assigned
              </div>
              <div class="ms-modern-breakout-sidebar__editor-list">
                <div
                  v-if="room.length === 0"
                  class="ms-modern-breakout-sidebar__editor-empty"
                >
                  No participants
                </div>

                <div
                  v-for="participant in room"
                  :key="`assigned-${roomIndex}-${participant.name}`"
                  class="ms-modern-breakout-sidebar__editor-row"
                >
                  <span class="ms-modern-breakout-sidebar__editor-name">{{ participant.name }}</span>
                  <button
                    type="button"
                    class="ms-modern-breakout-sidebar__editor-action ms-modern-breakout-sidebar__editor-action--danger"
                    @click="handleRemoveParticipant(roomIndex, participant.name)"
                  >
                    <FontAwesomeIcon :icon="faUserMinus" />
                  </button>
                </div>
              </div>
            </div>

            <div class="ms-modern-breakout-sidebar__editor-column">
              <div class="ms-modern-breakout-sidebar__editor-heading">
                Unassigned
              </div>
              <div class="ms-modern-breakout-sidebar__editor-list">
                <div
                  v-if="unassignedParticipants.length === 0"
                  class="ms-modern-breakout-sidebar__editor-empty"
                >
                  None available
                </div>

                <div
                  v-for="participant in unassignedParticipants"
                  :key="`unassigned-${roomIndex}-${participant.name}`"
                  class="ms-modern-breakout-sidebar__editor-row"
                >
                  <span class="ms-modern-breakout-sidebar__editor-name">{{ participant.name }}</span>
                  <button
                    type="button"
                    class="ms-modern-breakout-sidebar__editor-action ms-modern-breakout-sidebar__editor-action--success"
                    @click="handleAddParticipant(roomIndex, participant)"
                  >
                    <FontAwesomeIcon :icon="faUserPlus" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </template>
    </div>

    <div class="ms-modern-breakout-sidebar__footer">
      <button
        type="button"
        class="ms-modern-breakout-sidebar__pill-button ms-modern-breakout-sidebar__pill-button--secondary ms-modern-breakout-sidebar__pill-button--grow"
        @click="handleSave"
      >
        <FontAwesomeIcon :icon="faSave" />
        <span>Save</span>
      </button>

      <button
        v-if="!isStarted"
        type="button"
        class="ms-modern-breakout-sidebar__pill-button ms-modern-breakout-sidebar__pill-button--primary ms-modern-breakout-sidebar__pill-button--grow"
        :disabled="!canStartFromLocalRooms"
        @click="handleStart"
      >
        <FontAwesomeIcon :icon="faPlay" />
        <span>Start</span>
      </button>

      <template v-else>
        <button
          type="button"
          class="ms-modern-breakout-sidebar__pill-button ms-modern-breakout-sidebar__pill-button--primary ms-modern-breakout-sidebar__pill-button--grow"
          @click="handleStart"
        >
          <FontAwesomeIcon :icon="faSyncAlt" />
          <span>Update</span>
        </button>

        <button
          type="button"
          class="ms-modern-breakout-sidebar__pill-button ms-modern-breakout-sidebar__pill-button--danger ms-modern-breakout-sidebar__pill-button--grow"
          @click="handleEnd"
        >
          <FontAwesomeIcon :icon="faStop" />
          <span>End</span>
        </button>
      </template>
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="showModal"
      v-bind="modalOverlayProps"
    >
      <div v-bind="modalContentProps">
        <div class="ms-modern-breakout-sidebar ms-modern-breakout-sidebar--modal">
          <div
            class="ms-modern-breakout-sidebar__header"
            v-bind="mergedProps.headerProps"
          >
            <h2
              class="ms-modern-breakout-sidebar__title"
              v-bind="mergedProps.titleProps"
            >
              <FontAwesomeIcon :icon="faUsers" />
              <span><RenderVNode :node="resolvedTitleNode" /></span>
            </h2>
            <button
              type="button"
              class="ms-modern-breakout-sidebar__icon-button"
              v-bind="buttonAttrs(mergedProps.closeButtonProps)"
              @click="invokeButtonHandler(mergedProps.closeButtonProps?.onClick, $event, props.onBreakoutRoomsClose)"
            >
              <FontAwesomeIcon :icon="faTimes" />
            </button>
          </div>

          <div
            class="ms-modern-breakout-sidebar__controls"
            v-bind="mergedProps.controlsWrapperProps"
          >
            <div class="ms-modern-breakout-sidebar__control-grid">
              <label
                class="ms-modern-breakout-sidebar__field"
                v-bind="mergedProps.numRoomsFieldProps"
              >
                <span
                  class="ms-modern-breakout-sidebar__field-label"
                  v-bind="mergedProps.numRoomsLabelProps"
                >
                  <RenderVNode :node="resolvedNumRoomsLabelNode" />
                </span>
                <input
                  v-model="numRoomsInput"
                  type="number"
                  min="1"
                  max="20"
                  class="ms-modern-breakout-sidebar__number-input"
                  :disabled="isStarted"
                  v-bind="mergedProps.numRoomsInputProps"
                  @blur="normalizeRoomInput"
                >
              </label>

              <label
                class="ms-modern-breakout-sidebar__field"
                v-bind="mergedProps.newParticipantFieldProps"
              >
                <span
                  class="ms-modern-breakout-sidebar__field-label"
                  v-bind="mergedProps.newParticipantLabelProps"
                >
                  <RenderVNode :node="resolvedNewParticipantActionLabelNode" />
                </span>
                <select
                  v-model="newParticipantAction"
                  class="ms-modern-breakout-sidebar__select"
                  :disabled="isStarted"
                  v-bind="mergedProps.newParticipantSelectProps"
                >
                  <option value="autoAssignNewRoom">Add to new room</option>
                  <option value="autoAssignAvailableRoom">Add to open room</option>
                  <option value="manualAssign">No action</option>
                </select>
              </label>
            </div>

            <div
              class="ms-modern-breakout-sidebar__button-row"
              v-bind="mergedProps.actionsWrapperProps"
            >
              <button
                type="button"
                class="ms-modern-breakout-sidebar__pill-button ms-modern-breakout-sidebar__pill-button--secondary"
                :disabled="isStarted"
                v-bind="buttonAttrs(mergedProps.randomAssignButtonProps)"
                @click="invokeButtonHandler(mergedProps.randomAssignButtonProps?.onClick, $event, handleRandomAssign)"
              >
                <FontAwesomeIcon :icon="faRandom" />
                <RenderVNode :node="resolvedRandomAssignButtonLabelNode" />
              </button>

              <button
                type="button"
                class="ms-modern-breakout-sidebar__pill-button ms-modern-breakout-sidebar__pill-button--secondary"
                :disabled="isStarted"
                v-bind="buttonAttrs(mergedProps.manualAssignButtonProps)"
                @click="invokeButtonHandler(mergedProps.manualAssignButtonProps?.onClick, $event, handleManualAssign)"
              >
                <FontAwesomeIcon :icon="faHandPointer" />
                <RenderVNode :node="resolvedManualAssignButtonLabelNode" />
              </button>

              <button
                type="button"
                class="ms-modern-breakout-sidebar__pill-button ms-modern-breakout-sidebar__pill-button--secondary"
                :disabled="isStarted"
                v-bind="buttonAttrs(mergedProps.addRoomButtonProps)"
                @click="invokeButtonHandler(mergedProps.addRoomButtonProps?.onClick, $event, handleAddRoom)"
              >
                <FontAwesomeIcon :icon="faPlus" />
                <RenderVNode :node="resolvedAddRoomButtonLabelNode" />
              </button>
            </div>
          </div>

          <div
            class="ms-modern-breakout-sidebar__content"
            v-bind="mergedProps.bodyProps"
          >
            <div v-bind="mergedProps.roomsContainerProps">
              <div
                v-if="localRooms.length === 0"
                class="ms-modern-breakout-sidebar__empty"
              >
                No breakout rooms configured. Use Random, Create, or Add room to start.
              </div>

              <template v-else>
                <div
                  v-for="(room, roomIndex) in localRooms"
                  :key="`modal-room-${roomIndex}`"
                  class="ms-modern-breakout-sidebar__room-wrap"
                >
                  <section class="ms-modern-breakout-sidebar__room-card">
                    <div class="ms-modern-breakout-sidebar__room-header">
                      <div class="ms-modern-breakout-sidebar__room-title">
                        <FontAwesomeIcon :icon="faUsers" />
                        <span>Room {{ roomIndex + 1 }}</span>
                        <span class="ms-modern-breakout-sidebar__room-count">
                          ({{ room.length }} participants)
                        </span>
                      </div>

                      <div class="ms-modern-breakout-sidebar__room-actions">
                        <button
                          type="button"
                          class="ms-modern-breakout-sidebar__mini-icon-button"
                          :class="{
                            'ms-modern-breakout-sidebar__mini-icon-button--active': editingRoomIndex === roomIndex,
                          }"
                          @click="handleEditRoom(roomIndex)"
                        >
                          <FontAwesomeIcon :icon="editingRoomIndex === roomIndex ? faTimes : faPen" />
                        </button>

                        <button
                          type="button"
                          class="ms-modern-breakout-sidebar__mini-icon-button ms-modern-breakout-sidebar__mini-icon-button--danger"
                          @click="handleDeleteRoom(roomIndex)"
                        >
                          <FontAwesomeIcon :icon="faTrash" />
                        </button>
                      </div>
                    </div>

                    <div class="ms-modern-breakout-sidebar__room-body">
                      <div
                        v-if="room.length === 0"
                        class="ms-modern-breakout-sidebar__room-empty"
                      >
                        No participants
                      </div>

                      <div
                        v-for="participant in room"
                        :key="`modal-room-${roomIndex}-${participant.name}`"
                        class="ms-modern-breakout-sidebar__participant"
                      >
                        <span>{{ participant.name }}</span>
                      </div>
                    </div>
                  </section>

                  <section
                    v-if="editingRoomIndex === roomIndex"
                    class="ms-modern-breakout-sidebar__editor"
                  >
                    <div class="ms-modern-breakout-sidebar__editor-column">
                      <div class="ms-modern-breakout-sidebar__editor-heading">
                        Assigned
                      </div>
                      <div class="ms-modern-breakout-sidebar__editor-list">
                        <div
                          v-if="room.length === 0"
                          class="ms-modern-breakout-sidebar__editor-empty"
                        >
                          No participants
                        </div>

                        <div
                          v-for="participant in room"
                          :key="`modal-assigned-${roomIndex}-${participant.name}`"
                          class="ms-modern-breakout-sidebar__editor-row"
                        >
                          <span class="ms-modern-breakout-sidebar__editor-name">{{ participant.name }}</span>
                          <button
                            type="button"
                            class="ms-modern-breakout-sidebar__editor-action ms-modern-breakout-sidebar__editor-action--danger"
                            @click="handleRemoveParticipant(roomIndex, participant.name)"
                          >
                            <FontAwesomeIcon :icon="faUserMinus" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div class="ms-modern-breakout-sidebar__editor-column">
                      <div class="ms-modern-breakout-sidebar__editor-heading">
                        Unassigned
                      </div>
                      <div class="ms-modern-breakout-sidebar__editor-list">
                        <div
                          v-if="unassignedParticipants.length === 0"
                          class="ms-modern-breakout-sidebar__editor-empty"
                        >
                          None available
                        </div>

                        <div
                          v-for="participant in unassignedParticipants"
                          :key="`modal-unassigned-${roomIndex}-${participant.name}`"
                          class="ms-modern-breakout-sidebar__editor-row"
                        >
                          <span class="ms-modern-breakout-sidebar__editor-name">{{ participant.name }}</span>
                          <button
                            type="button"
                            class="ms-modern-breakout-sidebar__editor-action ms-modern-breakout-sidebar__editor-action--success"
                            @click="handleAddParticipant(roomIndex, participant)"
                          >
                            <FontAwesomeIcon :icon="faUserPlus" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </template>
            </div>
          </div>

          <div class="ms-modern-breakout-sidebar__footer">
            <button
              type="button"
              class="ms-modern-breakout-sidebar__pill-button ms-modern-breakout-sidebar__pill-button--secondary ms-modern-breakout-sidebar__pill-button--grow"
              v-bind="buttonAttrs(mergedProps.saveRoomsButtonProps)"
              @click="invokeButtonHandler(mergedProps.saveRoomsButtonProps?.onClick, $event, handleSave)"
            >
              <FontAwesomeIcon :icon="faSave" />
              <RenderVNode :node="resolvedSaveRoomsButtonLabelNode" />
            </button>

            <button
              v-if="!isStarted"
              type="button"
              class="ms-modern-breakout-sidebar__pill-button ms-modern-breakout-sidebar__pill-button--primary ms-modern-breakout-sidebar__pill-button--grow"
              :disabled="!canStartFromLocalRooms"
              v-bind="buttonAttrs(mergedProps.startButtonProps)"
              @click="invokeButtonHandler(mergedProps.startButtonProps?.onClick, $event, handleStart)"
            >
              <FontAwesomeIcon :icon="faPlay" />
              <RenderVNode :node="resolvedStartBreakoutButtonLabelNode" />
            </button>

            <template v-else>
              <button
                type="button"
                class="ms-modern-breakout-sidebar__pill-button ms-modern-breakout-sidebar__pill-button--primary ms-modern-breakout-sidebar__pill-button--grow"
                v-bind="buttonAttrs(mergedProps.startButtonProps)"
                @click="invokeButtonHandler(mergedProps.startButtonProps?.onClick, $event, handleStart)"
              >
                <FontAwesomeIcon :icon="faSyncAlt" />
                <RenderVNode :node="resolvedUpdateBreakoutButtonLabelNode" />
              </button>

              <button
                type="button"
                class="ms-modern-breakout-sidebar__pill-button ms-modern-breakout-sidebar__pill-button--danger ms-modern-breakout-sidebar__pill-button--grow"
                v-bind="buttonAttrs(mergedProps.stopButtonProps)"
                @click="invokeButtonHandler(mergedProps.stopButtonProps?.onClick, $event, handleEnd)"
              >
                <FontAwesomeIcon :icon="faStop" />
                <RenderVNode :node="resolvedStopBreakoutButtonLabelNode" />
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faHandPointer,
  faPen,
  faPlay,
  faPlus,
  faRandom,
  faSave,
  faStop,
  faSyncAlt,
  faTimes,
  faTrash,
  faUserMinus,
  faUserPlus,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import {
  computed,
  defineComponent,
  isVNode,
  onMounted,
  ref,
  watch,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type PropType,
  type SelectHTMLAttributes,
  type VNodeChild,
} from 'vue';
import type { Socket } from 'socket.io-client';
import { handleStartBreakout, handleStopBreakout, type BreakoutParticipant, type Participant } from 'mediasfu-shared';
import type { BreakoutRoomsModalOptions } from '../../components/breakoutComponents/BreakoutRoomsModal.vue';
import { mergeAttrObjects } from '../display_components/styleUtils';

type ModernBreakoutRenderMode = 'modal' | 'sidebar' | 'inline';
type ModernBreakoutRoomsModalProps = BreakoutRoomsModalOptions & {
  renderMode?: ModernBreakoutRenderMode;
};

const props = defineProps<ModernBreakoutRoomsModalProps>();

const RenderVNode = defineComponent({
  name: 'RenderVNode',
  props: {
    node: {
      type: [Object, String, Number, Boolean, Array, Function] as PropType<VNodeChild>,
      default: null,
    },
  },
  render() {
    if (!this.node) return null;
    if (isVNode(this.node)) return this.node;
    if (typeof this.node === 'function') {
      const result = (this.node as () => VNodeChild)();
      return isVNode(result) ? result : String(result);
    }
    return this.node as VNodeChild;
  },
});

const isEmbedded = computed(() => props.renderMode === 'sidebar' || props.renderMode === 'inline');
const showModal = computed(() => !isEmbedded.value && props.isVisible);
const isStarted = computed(() => props.parameters.breakOutRoomStarted && !props.parameters.breakOutRoomEnded);
const embeddedTitle = computed(() => typeof props.title === 'string' ? props.title : 'Breakout Rooms');
const canStartFromLocalRooms = computed(() => localRooms.value.some((room) => room.length > 0));
const unassignedParticipants = computed(() =>
  participantsList.value.filter((participant) => participant.breakRoom == null)
);

const numRoomsInput = ref('2');
const newParticipantAction = ref('autoAssignNewRoom');
const participantsList = ref<Participant[]>([]);
const localRooms = ref<BreakoutParticipant[][]>([]);
const editingRoomIndex = ref<number | null>(null);

const normalizeBreakoutAssignment = <T extends { breakRoom?: number | null }>(
  participant: T,
  fallback: number | null,
): T => (
  participant.breakRoom === undefined
    ? ({ ...participant, breakRoom: fallback } as T)
    : participant
);

const sanitizeParticipants = (people: Participant[]): Participant[] =>
  people.map((participant) => normalizeBreakoutAssignment({ ...participant }, null));

const sanitizeRooms = (rooms: BreakoutParticipant[][]): BreakoutParticipant[][] =>
  rooms.map((room, index) =>
    room.map((participant) => normalizeBreakoutAssignment({ ...participant }, index))
  );

const emitAlert = (message: string, type: 'success' | 'danger') => {
  props.parameters.showAlert?.({ message, type });
};

const sharedBreakoutAlert = props.parameters.showAlert as unknown as
  | ((options: { message: string; type: 'success' | 'danger' | 'info'; duration?: number }) => void)
  | undefined;

const resolvedTitleNode = computed<VNodeChild>(() => {
  const title = props.title as unknown;
  return title === false || title == null ? 'Breakout Rooms' : props.title;
});

const resolvedNumRoomsLabelNode = computed<VNodeChild>(() => props.numRoomsLabel ?? 'Number of rooms');
const resolvedNewParticipantActionLabelNode = computed<VNodeChild>(() => props.newParticipantActionLabel ?? 'New participant action');
const resolvedRandomAssignButtonLabelNode = computed<VNodeChild>(() => props.randomAssignButtonLabel ?? 'Random');
const resolvedManualAssignButtonLabelNode = computed<VNodeChild>(() => props.manualAssignButtonLabel ?? 'Create');
const resolvedAddRoomButtonLabelNode = computed<VNodeChild>(() => props.addRoomButtonLabel ?? 'Add room');
const resolvedSaveRoomsButtonLabelNode = computed<VNodeChild>(() => props.saveRoomsButtonLabel ?? 'Save');
const resolvedStartBreakoutButtonLabelNode = computed<VNodeChild>(() => props.startBreakoutButtonLabel ?? 'Start');
const resolvedUpdateBreakoutButtonLabelNode = computed<VNodeChild>(() => props.updateBreakoutButtonLabel ?? 'Update');
const resolvedStopBreakoutButtonLabelNode = computed<VNodeChild>(() => props.stopBreakoutButtonLabel ?? 'End');

const buttonAttrs = <T extends ButtonHTMLAttributes | undefined>(attrs: T) => {
  if (!attrs) {
    return undefined;
  }

  const { onClick: _onClick, ...rest } = attrs as T & { onClick?: unknown };
  return rest as T;
};

const invokeButtonHandler = (
  handler: unknown,
  event: MouseEvent,
  fallback: () => void,
) => {
  if (typeof handler === 'function') {
    (handler as (event: MouseEvent) => void)(event);
  }

  if (!event.defaultPrevented) {
    fallback();
  }
};

const clampRoomCount = (value: number) => {
  if (Number.isNaN(value) || value < 1) {
    return 2;
  }

  return Math.min(20, value);
};

const parsedRoomCount = () => clampRoomCount(Number.parseInt(numRoomsInput.value, 10));

const markUnsaved = () => {
  props.parameters.updateCanStartBreakout(false);
};

const syncFromParameters = () => {
  const filteredParticipants = sanitizeParticipants(
    props.parameters.participants.filter((participant) => participant.islevel !== '2')
  );
  const rooms = props.parameters.breakoutRooms?.length > 0
    ? sanitizeRooms(props.parameters.breakoutRooms)
    : [];

  const nameToRoom = new Map<string, number>();
  rooms.forEach((room, roomIndex) => {
    room.forEach((participant) => nameToRoom.set(participant.name, roomIndex));
  });

  participantsList.value = filteredParticipants.map((participant) => ({
    ...participant,
    breakRoom: nameToRoom.has(participant.name) ? nameToRoom.get(participant.name)! : null,
  }));
  localRooms.value = rooms;
  numRoomsInput.value = String(Math.max(rooms.length, 2));

  if (editingRoomIndex.value != null && editingRoomIndex.value >= rooms.length) {
    editingRoomIndex.value = null;
  }
};

const normalizeRoomInput = () => {
  numRoomsInput.value = String(parsedRoomCount());
};

const handleRandomAssign = () => {
  const roomCount = parsedRoomCount();
  const roomLimit = props.parameters.itemPageLimit;
  const shuffledParticipants: Participant[] = [...participantsList.value]
    .map((participant): Participant => ({ ...participant, breakRoom: null }))
    .sort(() => Math.random() - 0.5);
  const nextRooms: BreakoutParticipant[][] = Array.from({ length: roomCount }, () => []);

  shuffledParticipants.forEach((participant, index) => {
    const preferredRoomIndex = index % roomCount;
    const preferredRoom = nextRooms[preferredRoomIndex];

    if (preferredRoom && preferredRoom.length < roomLimit) {
      preferredRoom.push({ name: participant.name, breakRoom: preferredRoomIndex });
      participant.breakRoom = preferredRoomIndex;
      return;
    }

    const fallbackRoomIndex = nextRooms.findIndex((room) => room.length < roomLimit);
    if (fallbackRoomIndex >= 0) {
      nextRooms[fallbackRoomIndex]?.push({ name: participant.name, breakRoom: fallbackRoomIndex });
      participant.breakRoom = fallbackRoomIndex;
    }
  });

  participantsList.value = shuffledParticipants;
  localRooms.value = nextRooms;
  editingRoomIndex.value = null;
  markUnsaved();
};

const handleManualAssign = () => {
  const roomCount = parsedRoomCount();
  localRooms.value = Array.from({ length: roomCount }, () => []);
  participantsList.value = participantsList.value.map((participant) => ({
    ...participant,
    breakRoom: null,
  }));
  editingRoomIndex.value = roomCount > 0 ? 0 : null;
  markUnsaved();
};

const handleAddRoom = () => {
  localRooms.value = [...localRooms.value, []];
  numRoomsInput.value = String(localRooms.value.length);
  markUnsaved();
};

const handleDeleteRoom = (roomIndex: number) => {
  const nextRooms = localRooms.value
    .filter((_, index) => index !== roomIndex)
    .map((room, index) => room.map((participant) => ({ ...participant, breakRoom: index })));
  const nameToRoom = new Map<string, number>();

  nextRooms.forEach((room, index) => {
    room.forEach((participant) => nameToRoom.set(participant.name, index));
  });

  localRooms.value = nextRooms;
  participantsList.value = participantsList.value.map((participant) => ({
    ...participant,
    breakRoom: nameToRoom.has(participant.name) ? nameToRoom.get(participant.name)! : null,
  }));
  numRoomsInput.value = String(Math.max(nextRooms.length, 2));

  if (editingRoomIndex.value === roomIndex) {
    editingRoomIndex.value = null;
  } else if (editingRoomIndex.value != null && editingRoomIndex.value > roomIndex) {
    editingRoomIndex.value -= 1;
  }

  markUnsaved();
};

const handleEditRoom = (roomIndex: number) => {
  editingRoomIndex.value = editingRoomIndex.value === roomIndex ? null : roomIndex;
};

const handleAddParticipant = (roomIndex: number, participant: Participant) => {
  const roomLimit = props.parameters.itemPageLimit;
  const nextRooms = localRooms.value.map((room) => [...room]);
  const room = nextRooms[roomIndex];

  if (!room) {
    return;
  }

  if (room.length >= roomLimit) {
    emitAlert('Room is full', 'danger');
    return;
  }

  nextRooms.forEach((currentRoom, currentRoomIndex) => {
    if (currentRoomIndex !== roomIndex) {
      nextRooms[currentRoomIndex] = currentRoom.filter((entry) => entry.name !== participant.name);
    }
  });

  room.push({ name: participant.name, breakRoom: roomIndex });
  localRooms.value = nextRooms;
  participantsList.value = participantsList.value.map((currentParticipant) => ({
    ...currentParticipant,
    breakRoom: currentParticipant.name === participant.name ? roomIndex : currentParticipant.breakRoom,
  }));
  markUnsaved();
};

const handleRemoveParticipant = (roomIndex: number, participantName: string) => {
  localRooms.value = localRooms.value.map((room, currentRoomIndex) =>
    currentRoomIndex === roomIndex
      ? room.filter((participant) => participant.name !== participantName)
      : room
  );
  participantsList.value = participantsList.value.map((participant) => ({
    ...participant,
    breakRoom: participant.name === participantName ? null : participant.breakRoom,
  }));
  markUnsaved();
};

const validateRooms = () => {
  if (localRooms.value.length === 0) {
    emitAlert('There must be at least one room', 'danger');
    return false;
  }

  for (const room of localRooms.value) {
    if (room.length === 0) {
      emitAlert('Rooms must not be empty', 'danger');
      return false;
    }

    const participantNames = room.map((participant) => participant.name);
    if (participantNames.length !== new Set(participantNames).size) {
      emitAlert('Duplicate participant names in a room', 'danger');
      return false;
    }

    if (room.length > props.parameters.itemPageLimit) {
      emitAlert('A room exceeds the participant limit', 'danger');
      return false;
    }
  }

  return true;
};

const handleSave = () => {
  if (!validateRooms()) {
    return;
  }

  props.parameters.updateBreakoutRooms(localRooms.value);
  props.parameters.updateCanStartBreakout(true);
  emitAlert('Rooms saved successfully', 'success');
};

const handleStart = () => {
  if (props.parameters.shareScreenStarted || props.parameters.shared) {
    emitAlert('You cannot start breakout rooms while screen sharing is active', 'danger');
    return;
  }

  if (!props.parameters.canStartBreakout) {
    emitAlert('Please save rooms first', 'danger');
    return;
  }

  handleStartBreakout({
    socket: props.parameters.socket,
    localSocket: props.parameters.localSocket as Socket | undefined,
    breakoutRooms: localRooms.value,
    newParticipantAction: newParticipantAction.value,
    roomName: props.parameters.roomName,
    breakOutRoomStarted: props.parameters.breakOutRoomStarted,
    breakOutRoomEnded: props.parameters.breakOutRoomEnded,
    showAlert: sharedBreakoutAlert,
    updateBreakOutRoomStarted: props.parameters.updateBreakOutRoomStarted,
    updateBreakOutRoomEnded: props.parameters.updateBreakOutRoomEnded,
    onBreakoutRoomsClose: props.onBreakoutRoomsClose,
    meetingDisplayType: props.parameters.meetingDisplayType,
    updateMeetingDisplayType: props.parameters.updateMeetingDisplayType,
  });
};

const handleEnd = () => {
  handleStopBreakout({
    socket: props.parameters.socket,
    localSocket: props.parameters.localSocket as Socket | undefined,
    roomName: props.parameters.roomName,
    showAlert: sharedBreakoutAlert,
    updateBreakOutRoomStarted: props.parameters.updateBreakOutRoomStarted,
    updateBreakOutRoomEnded: props.parameters.updateBreakOutRoomEnded,
    onBreakoutRoomsClose: props.onBreakoutRoomsClose,
    meetingDisplayType: props.parameters.meetingDisplayType,
    prevMeetingDisplayType: props.parameters.prevMeetingDisplayType,
    updateMeetingDisplayType: props.parameters.updateMeetingDisplayType,
  });
};

onMounted(() => {
  if (props.isVisible || isEmbedded.value) {
    syncFromParameters();
  }
});

watch(
  () => props.isVisible,
  (visible) => {
    if (visible || isEmbedded.value) {
      syncFromParameters();
      return;
    }

    editingRoomIndex.value = null;
  }
);

watch(
  () => props.parameters.participants,
  () => {
    if (props.isVisible || isEmbedded.value) {
      syncFromParameters();
    }
  },
  { deep: true }
);

watch(
  () => props.parameters.breakoutRooms,
  () => {
    if (props.isVisible || isEmbedded.value) {
      syncFromParameters();
    }
  },
  { deep: true }
);

const panelGradientBackground =
  'linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-panel-surface) 100%)';

const modalOverlayProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(
    {
      class: 'ms-modern-breakout-dialog__overlay',
      style: {
        position: 'fixed',
        inset: 0,
        display: 'block',
        background: 'var(--ms-modern-overlay-backdrop)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 999,
      },
    },
    props.overlayProps,
  ),
);

const modalPositionStyles = computed(() => {
  const position = props.position ?? 'topRight';
  return {
    top: position.includes('top') ? '16px' : 'auto',
    bottom: position.includes('bottom') ? '16px' : 'auto',
    left: position.includes('Left') ? '16px' : 'auto',
    right: position.includes('Right') ? '16px' : 'auto',
  };
});

const modalContentProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(
    {
      class: 'ms-modern-breakout-dialog__panel',
      style: {
        position: 'fixed',
        width: 'min(540px, calc(100vw - 32px))',
        maxHeight: 'calc(100vh - 32px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '28px',
        border: '1px solid var(--ms-modern-panel-border)',
        background: panelGradientBackground,
        boxShadow: 'var(--ms-modern-shadow-elevated)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        color: 'var(--ms-modern-text-primary)',
        ...modalPositionStyles.value,
      },
    },
    mergedProps.value.contentProps,
  ),
);

const defaultContentProps = computed<HTMLAttributes>(() => ({
  style: {
    background: panelGradientBackground,
    border: '1px solid var(--ms-modern-panel-border)',
    borderRadius: '28px',
    boxShadow: 'var(--ms-modern-shadow-elevated)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    overflow: 'hidden',
    color: 'var(--ms-modern-text-primary)',
  },
}));

const embeddedOverlayProps = computed<HTMLAttributes>(() => ({
  style: {
    position: 'static',
    top: 'auto',
    right: 'auto',
    bottom: 'auto',
    left: 'auto',
    width: '100%',
    height: '100%',
    minHeight: 0,
    backgroundColor: 'transparent',
    display: 'block',
    zIndex: 'auto',
  },
}));

const embeddedContentProps = computed<HTMLAttributes>(() => ({
  style: {
    position: 'relative',
    top: 'auto',
    right: 'auto',
    bottom: 'auto',
    left: 'auto',
    width: '100%',
    maxWidth: 'none',
    maxHeight: 'none',
    height: '100%',
    margin: 0,
    padding: 0,
    background: panelGradientBackground,
    border: '1px solid var(--ms-modern-panel-border)',
    borderRadius: '24px',
    boxShadow: 'var(--ms-modern-shadow-elevated)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    overflow: 'hidden',
    color: 'var(--ms-modern-text-primary)',
    boxSizing: 'border-box',
  },
}));

const defaultHeaderProps: HTMLAttributes = {
  style: {
    padding: '20px 22px 16px',
    borderBottom: '1px solid var(--ms-modern-panel-border)',
    background: panelGradientBackground,
  },
};

const defaultTitleProps: HTMLAttributes = {
  style: {
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '0.01em',
  },
};

const defaultCloseButtonProps: ButtonHTMLAttributes = {
  style: {
    width: '38px',
    height: '38px',
    borderRadius: '9999px',
    border: '1px solid var(--ms-modern-panel-border)',
    background: 'var(--ms-modern-field-background)',
    color: 'var(--ms-modern-text-primary)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    cursor: 'pointer',
  },
};

const defaultDividerProps: HTMLAttributes = {
  style: {
    borderColor: 'var(--ms-modern-panel-border)',
  },
};

const defaultBodyProps: HTMLAttributes = {
  style: {
    padding: '0 22px 22px',
    display: 'grid',
    gap: '16px',
  },
};

const defaultFieldProps: HTMLAttributes = {
  style: {
    display: 'grid',
    gap: '8px',
  },
};

const defaultLabelProps: LabelHTMLAttributes = {
  style: {
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontSize: '0.86rem',
    fontWeight: 700,
  },
};

const defaultInputProps: InputHTMLAttributes = {
  style: {
    width: '100%',
    minHeight: '44px',
    padding: '0 14px',
    borderRadius: '14px',
    border: '1px solid var(--ms-modern-field-border)',
    background: 'var(--ms-modern-field-background)',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
  },
};

const defaultSelectProps: SelectHTMLAttributes = {
  style: {
    width: '100%',
    minHeight: '44px',
    padding: '0 14px',
    borderRadius: '14px',
    border: '1px solid var(--ms-modern-field-border)',
    background: 'var(--ms-modern-field-background)',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
  },
};

const defaultActionsWrapperProps: HTMLAttributes = {
  style: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
};

const defaultRoomsContainerProps: HTMLAttributes = {
  style: {
    padding: '14px',
    borderRadius: '20px',
    border: '1px solid var(--ms-modern-panel-border)',
    background: 'var(--ms-modern-panel-surface)',
  },
};

const defaultPrimaryButtonProps: ButtonHTMLAttributes = {
  style: {
    minHeight: '44px',
    borderRadius: '9999px',
    border: 'none',
    paddingInline: '16px',
    background:
      'linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 55%, var(--ms-modern-accent) 100%)',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontWeight: 700,
    boxShadow: 'var(--ms-modern-shadow-soft)',
    cursor: 'pointer',
  },
};

const defaultSecondaryButtonProps: ButtonHTMLAttributes = {
  style: {
    minHeight: '44px',
    borderRadius: '9999px',
    border: '1px solid var(--ms-modern-panel-border)',
    paddingInline: '16px',
    background: 'var(--ms-modern-field-background)',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

const mergedProps = computed(() => ({
  ...props,
  isVisible: isEmbedded.value ? true : props.isVisible,
  backgroundColor: props.backgroundColor ?? 'var(--ms-modern-panel-surface-elevated)',
  overlayProps: mergeAttrObjects(
    isEmbedded.value ? embeddedOverlayProps.value : { style: { backgroundColor: 'transparent' } },
    props.overlayProps
  ),
  contentProps: mergeAttrObjects(
    isEmbedded.value ? embeddedContentProps.value : defaultContentProps.value,
    props.contentProps
  ),
  headerProps: mergeAttrObjects(defaultHeaderProps, props.headerProps),
  titleProps: mergeAttrObjects(defaultTitleProps, props.titleProps),
  closeButtonProps: mergeAttrObjects(defaultCloseButtonProps, props.closeButtonProps),
  headerDividerProps: mergeAttrObjects(defaultDividerProps, props.headerDividerProps),
  bodyProps: mergeAttrObjects(
    isEmbedded.value
      ? {
          style: {
            padding: '0 22px 22px',
            display: 'grid',
            gap: '16px',
            minHeight: 0,
          },
        }
      : defaultBodyProps,
    props.bodyProps
  ),
  controlsWrapperProps: mergeAttrObjects({ style: { display: 'grid', gap: '14px' } }, props.controlsWrapperProps),
  numRoomsFieldProps: mergeAttrObjects(defaultFieldProps, props.numRoomsFieldProps),
  numRoomsLabelProps: mergeAttrObjects(defaultLabelProps, props.numRoomsLabelProps),
  numRoomsInputProps: mergeAttrObjects(defaultInputProps, props.numRoomsInputProps),
  actionsWrapperProps: mergeAttrObjects(defaultActionsWrapperProps, props.actionsWrapperProps),
  randomAssignButtonProps: mergeAttrObjects(defaultSecondaryButtonProps, props.randomAssignButtonProps),
  manualAssignButtonProps: mergeAttrObjects(defaultSecondaryButtonProps, props.manualAssignButtonProps),
  addRoomButtonProps: mergeAttrObjects(defaultPrimaryButtonProps, props.addRoomButtonProps),
  saveRoomsButtonProps: mergeAttrObjects(defaultPrimaryButtonProps, props.saveRoomsButtonProps),
  newParticipantFieldProps: mergeAttrObjects(defaultFieldProps, props.newParticipantFieldProps),
  newParticipantLabelProps: mergeAttrObjects(defaultLabelProps, props.newParticipantLabelProps),
  newParticipantSelectProps: mergeAttrObjects(defaultSelectProps, props.newParticipantSelectProps),
  roomsContainerProps: mergeAttrObjects(
    isEmbedded.value
      ? {
          style: {
            padding: '14px',
            borderRadius: '20px',
            border: '1px solid var(--ms-modern-panel-border)',
            background: 'var(--ms-modern-panel-surface)',
            maxHeight: 'none',
          },
        }
      : defaultRoomsContainerProps,
    props.roomsContainerProps
  ),
  startButtonProps: mergeAttrObjects(defaultPrimaryButtonProps, props.startButtonProps),
  stopButtonProps: mergeAttrObjects(defaultSecondaryButtonProps, props.stopButtonProps),
}));
</script>

<style scoped>
.ms-modern-breakout-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-panel-surface) 100%);
  color: var(--ms-modern-text-primary);
}

.ms-modern-breakout-sidebar--modal {
  min-height: min(620px, calc(100vh - 32px));
}

.ms-modern-breakout-dialog__panel :deep(*) {
  box-sizing: border-box;
}

.ms-modern-breakout-sidebar__header,
.ms-modern-breakout-sidebar__controls,
.ms-modern-breakout-sidebar__footer {
  flex-shrink: 0;
}

.ms-modern-breakout-sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--ms-modern-panel-border);
}

.ms-modern-breakout-sidebar__title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-family: var(--ms-modern-font-family);
  font-size: 1.02rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.ms-modern-breakout-sidebar__icon-button,
.ms-modern-breakout-sidebar__mini-icon-button,
.ms-modern-breakout-sidebar__editor-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--ms-modern-panel-border);
  background: var(--ms-modern-field-background);
  color: var(--ms-modern-text-primary);
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, opacity 0.2s ease;
}

.ms-modern-breakout-sidebar__icon-button:hover,
.ms-modern-breakout-sidebar__mini-icon-button:hover,
.ms-modern-breakout-sidebar__editor-action:hover {
  background: var(--ms-modern-panel-surface-elevated);
}

.ms-modern-breakout-sidebar__icon-button {
  width: 38px;
  height: 38px;
  border-radius: 9999px;
}

.ms-modern-breakout-sidebar__controls {
  display: grid;
  gap: 14px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--ms-modern-panel-border);
}

.ms-modern-breakout-sidebar__control-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 140px) minmax(0, 1fr);
}

.ms-modern-breakout-sidebar__field {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.ms-modern-breakout-sidebar__field-label {
  font-family: var(--ms-modern-font-family);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--ms-modern-text-secondary);
}

.ms-modern-breakout-sidebar__number-input,
.ms-modern-breakout-sidebar__select {
  width: 100%;
  min-height: 42px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid var(--ms-modern-field-border);
  background: var(--ms-modern-field-background);
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  box-sizing: border-box;
}

.ms-modern-breakout-sidebar__number-input {
  text-align: center;
}

.ms-modern-breakout-sidebar__button-row,
.ms-modern-breakout-sidebar__footer {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.ms-modern-breakout-sidebar__pill-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 9999px;
  font-family: var(--ms-modern-font-family);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.ms-modern-breakout-sidebar__pill-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.ms-modern-breakout-sidebar__pill-button:disabled,
.ms-modern-breakout-sidebar__icon-button:disabled,
.ms-modern-breakout-sidebar__mini-icon-button:disabled,
.ms-modern-breakout-sidebar__editor-action:disabled,
.ms-modern-breakout-sidebar__number-input:disabled,
.ms-modern-breakout-sidebar__select:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.ms-modern-breakout-sidebar__pill-button--primary {
  border: none;
  background: linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 55%, var(--ms-modern-accent) 100%);
  color: var(--ms-modern-text-primary);
  box-shadow: var(--ms-modern-shadow-soft);
}

.ms-modern-breakout-sidebar__pill-button--secondary {
  border: 1px solid var(--ms-modern-panel-border);
  background: var(--ms-modern-field-background);
  color: var(--ms-modern-text-primary);
}

.ms-modern-breakout-sidebar__pill-button--danger {
  border: none;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.96) 0%, rgba(220, 38, 38, 0.96) 100%);
  color: #fff;
  box-shadow: var(--ms-modern-shadow-soft);
}

.ms-modern-breakout-sidebar__pill-button--grow {
  flex: 1 1 160px;
}

.ms-modern-breakout-sidebar__content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 18px 20px;
  display: grid;
  gap: 14px;
}

.ms-modern-breakout-sidebar__empty,
.ms-modern-breakout-sidebar__editor-empty,
.ms-modern-breakout-sidebar__room-empty {
  color: var(--ms-modern-text-muted);
  font-style: italic;
}

.ms-modern-breakout-sidebar__empty {
  min-height: 220px;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 24px;
  border-radius: 20px;
  border: 1px dashed var(--ms-modern-panel-border-strong);
  background: rgba(255, 255, 255, 0.03);
}

.ms-modern-breakout-sidebar__room-wrap {
  display: grid;
  gap: 10px;
}

.ms-modern-breakout-sidebar__room-card,
.ms-modern-breakout-sidebar__editor {
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.04);
  overflow: hidden;
}

.ms-modern-breakout-sidebar__room-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--ms-modern-panel-border);
  background: rgba(0, 0, 0, 0.08);
}

.ms-modern-breakout-sidebar__room-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 0.94rem;
  font-weight: 700;
}

.ms-modern-breakout-sidebar__room-count {
  color: var(--ms-modern-text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
}

.ms-modern-breakout-sidebar__room-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ms-modern-breakout-sidebar__mini-icon-button {
  width: 30px;
  height: 30px;
  border-radius: 10px;
}

.ms-modern-breakout-sidebar__mini-icon-button--active {
  background: rgba(255, 255, 255, 0.14);
}

.ms-modern-breakout-sidebar__mini-icon-button--danger,
.ms-modern-breakout-sidebar__editor-action--danger {
  color: #f87171;
}

.ms-modern-breakout-sidebar__editor-action--success {
  color: #34d399;
}

.ms-modern-breakout-sidebar__room-body {
  display: grid;
  gap: 8px;
  padding: 12px 16px 16px;
}

.ms-modern-breakout-sidebar__participant,
.ms-modern-breakout-sidebar__editor-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--ms-modern-text-primary);
}

.ms-modern-breakout-sidebar__editor {
  padding: 14px;
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.ms-modern-breakout-sidebar__editor-column {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.ms-modern-breakout-sidebar__editor-heading {
  color: var(--ms-modern-text-secondary);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.ms-modern-breakout-sidebar__editor-list {
  display: grid;
  gap: 8px;
  max-height: 180px;
  overflow-y: auto;
}

.ms-modern-breakout-sidebar__editor-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ms-modern-breakout-sidebar__editor-action {
  width: 28px;
  height: 28px;
  border-radius: 9px;
  flex-shrink: 0;
}

.ms-modern-breakout-sidebar__footer {
  padding: 18px 20px 20px;
  border-top: 1px solid var(--ms-modern-panel-border);
}

@media (max-width: 640px) {
  .ms-modern-breakout-sidebar__control-grid,
  .ms-modern-breakout-sidebar__editor {
    grid-template-columns: 1fr;
  }

  .ms-modern-breakout-sidebar__button-row,
  .ms-modern-breakout-sidebar__footer {
    flex-direction: column;
  }

  .ms-modern-breakout-sidebar__pill-button--grow {
    flex-basis: auto;
  }
}
</style>