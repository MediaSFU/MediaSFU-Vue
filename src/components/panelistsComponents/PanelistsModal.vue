<template>
  <div
    v-if="isPanelistsModalVisible"
    v-bind="mergedOverlayProps"
    @click.self="handleClose"
  >
    <section v-bind="mergedContentProps">
      <header v-bind="mergedHeaderProps">
        <div class="ms-panelists-modal__heading">
          <div class="ms-panelists-modal__title-block">
            <span class="ms-panelists-modal__eyebrow">Featured speakers</span>
            <h2 v-bind="mergedTitleProps">{{ title }}</h2>
          </div>

          <div class="ms-panelists-modal__header-actions">
            <div v-bind="mergedBadgeWrapperProps">
              <span v-bind="mergedBadgeProps">{{ panelistCount }}</span>
            </div>

            <button
              v-bind="mergedCloseButtonProps"
              @click="handleClose"
            >
              <FontAwesomeIcon :icon="faTimes" />
            </button>
          </div>
        </div>
      </header>

      <div v-bind="mergedBodyProps">
        <section v-bind="mergedFocusSectionProps">
          <div class="ms-panelists-modal__focus-copy">
            <span
              class="ms-panelists-modal__focus-status"
              :data-active="isFocused"
            >
              {{ isFocused ? 'Focused view enabled' : 'Standard view active' }}
            </span>
            <p class="ms-panelists-modal__focus-text">
              Keep panelists centered in the main display. Optional mute controls are only applied when focus is enabled.
            </p>
          </div>

          <div class="ms-panelists-modal__focus-options">
            <label class="ms-panelists-modal__checkbox-row">
              <input
                v-model="muteOthersMic"
                type="checkbox"
                :disabled="!isHost || isUpdatingFocus"
              >
              <span>Mute others' microphones</span>
            </label>

            <label class="ms-panelists-modal__checkbox-row">
              <input
                v-model="muteOthersCamera"
                type="checkbox"
                :disabled="!isHost || isUpdatingFocus"
              >
              <span>Mute others' cameras</span>
            </label>
          </div>

          <div class="ms-panelists-modal__focus-actions">
            <button
              v-bind="resolveActionButtonProps(isFocused ? 'secondary' : 'primary', !isHost || isUpdatingFocus)"
              @click="handleToggleFocus"
            >
              {{ focusButtonLabel }}
            </button>

            <p
              v-if="!isHost"
              class="ms-panelists-modal__helper-text"
            >
              Only the host can update panelists or change focus mode.
            </p>
          </div>
        </section>

        <div class="ms-panelists-modal__search-row">
          <input
            v-model="searchFilter"
            v-bind="mergedSearchInputProps"
            type="search"
            placeholder="Search panelists or participants"
          >
        </div>

        <div v-bind="mergedColumnsProps">
          <section class="ms-panelists-modal__panel">
            <div class="ms-panelists-modal__section-header">
              <div>
                <h3>Current panelists</h3>
                <p>Hosts and featured speakers kept in focus.</p>
              </div>
              <span class="ms-panelists-modal__section-count">{{ filteredPanelists.length }}</span>
            </div>

            <div class="ms-panelists-modal__list-body">
              <div
                v-if="filteredPanelists.length === 0"
                class="ms-panelists-modal__empty-state"
              >
                No panelists selected yet.
              </div>

              <div
                v-for="(participant, index) in filteredPanelists"
                :key="participant.id || `${participant.name || 'panelist'}-${index}`"
                class="ms-panelists-modal__person-row"
              >
                <div class="ms-panelists-modal__person-meta">
                  <strong>{{ participant.name || 'Unnamed participant' }}</strong>
                  <span>{{ getParticipantRoleLabel(participant) }}</span>
                </div>

                <button
                  v-bind="resolveActionButtonProps('secondary', !isHost || isPendingParticipant(participant.id, 'remove'))"
                  @click="handleRemovePanelist(participant)"
                >
                  {{ isPendingParticipant(participant.id, 'remove') ? 'Removing...' : 'Remove' }}
                </button>
              </div>
            </div>
          </section>

          <section class="ms-panelists-modal__panel">
            <div class="ms-panelists-modal__section-header">
              <div>
                <h3>Available participants</h3>
                <p>Add attendees or elevated members to the panel.</p>
              </div>
              <span class="ms-panelists-modal__section-count">{{ availableParticipants.length }}</span>
            </div>

            <div class="ms-panelists-modal__list-body">
              <div
                v-if="availableParticipants.length === 0"
                class="ms-panelists-modal__empty-state"
              >
                {{ normalizedSearch ? 'No matching participants found.' : 'No additional participants are available.' }}
              </div>

              <div
                v-for="(participant, index) in availableParticipants"
                :key="participant.id || `${participant.name || 'participant'}-${index}`"
                class="ms-panelists-modal__person-row"
              >
                <div class="ms-panelists-modal__person-meta">
                  <strong>{{ participant.name || 'Unnamed participant' }}</strong>
                  <span>{{ getParticipantRoleLabel(participant) }}</span>
                </div>

                <button
                  v-bind="resolveActionButtonProps('primary', !isHost || isPendingParticipant(participant.id, 'add'))"
                  @click="handleAddPanelist(participant)"
                >
                  {{ isPendingParticipant(participant.id, 'add') ? 'Adding...' : 'Add' }}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  mergeProps,
  ref,
  watch,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import type { Participant } from 'mediasfu-shared';
import type { Socket } from 'socket.io-client';

export interface PanelistsModalParameters {
  participants: Participant[];
  panelists: Participant[];
  member: string;
  islevel: string;
  socket: Socket;
  roomName: string;
  itemPageLimit?: number;
  panelistsFocused?: boolean;
  muteOthersMic?: boolean;
  muteOthersCamera?: boolean;
  showAlert?: (options: { message: string; type: string; duration?: number }) => void;
  updatePanelists?: (panelists: Participant[]) => void;
  updatePanelistsFocused?: (focused: boolean) => void;
  updateMuteOthersMic?: (value: boolean) => void;
  updateMuteOthersCamera?: (value: boolean) => void;
  getUpdatedAllParams?: () => PanelistsModalParameters;
  [key: string]: unknown;
}

export interface PanelistsModalProps {
  isPanelistsModalVisible: boolean;
  onPanelistsClose: () => void;
  parameters: PanelistsModalParameters;
  backgroundColor?: string;
  position?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft' | 'center';
  title?: string;
  overlayProps?: HTMLAttributes;
  contentProps?: HTMLAttributes;
  headerProps?: HTMLAttributes;
  titleProps?: HTMLAttributes;
  badgeWrapperProps?: HTMLAttributes;
  badgeProps?: HTMLAttributes;
  closeButtonProps?: ButtonHTMLAttributes;
  bodyProps?: HTMLAttributes;
  focusSectionProps?: HTMLAttributes;
  searchInputProps?: InputHTMLAttributes;
  columnsProps?: HTMLAttributes;
  actionButtonProps?: ButtonHTMLAttributes;
  secondaryActionButtonProps?: ButtonHTMLAttributes;
}

const props = withDefaults(defineProps<PanelistsModalProps>(), {
  backgroundColor: '#ffffff',
  position: 'topRight',
  title: 'Panelists',
});

const searchFilter = ref('');
const localPanelists = ref<Participant[]>([]);
const localParticipants = ref<Participant[]>([]);
const isFocused = ref(false);
const muteOthersMic = ref(false);
const muteOthersCamera = ref(false);
const activeParticipantId = ref<string | null>(null);
const activeParticipantAction = ref<'add' | 'remove' | null>(null);
const isUpdatingFocus = ref(false);

const currentParams = computed<PanelistsModalParameters>(() =>
  props.parameters.getUpdatedAllParams?.() ?? props.parameters
);

const isHost = computed(() => currentParams.value?.islevel === '2');
const maxPanelists = computed(() => currentParams.value?.itemPageLimit ?? 4);
const normalizedSearch = computed(() => searchFilter.value.trim().toLowerCase());
const panelistCount = computed(() => localPanelists.value.length);
const focusButtonLabel = computed(() => {
  if (isUpdatingFocus.value) {
    return 'Saving...';
  }

  return isFocused.value ? 'Disable Focus' : 'Enable Focus';
});

const matchesFilter = (participant: Participant) => {
  if (!normalizedSearch.value) {
    return true;
  }

  return (participant.name ?? '').toLowerCase().includes(normalizedSearch.value);
};

const filteredPanelists = computed(() => localPanelists.value.filter(matchesFilter));

const availableParticipants = computed(() => {
  const panelistIds = new Set(localPanelists.value.map((participant) => participant.id).filter(Boolean));

  return localParticipants.value
    .filter((participant) => !panelistIds.has(participant.id))
    .filter((participant) => participant.islevel !== '2')
    .filter(matchesFilter);
});

const positionStyle = computed<CSSProperties>(() => {
  const positions: Record<NonNullable<PanelistsModalProps['position']>, CSSProperties> = {
    topRight: { top: '24px', right: '24px' },
    topLeft: { top: '24px', left: '24px' },
    bottomRight: { bottom: '24px', right: '24px' },
    bottomLeft: { bottom: '24px', left: '24px' },
    center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  };

  return positions[props.position];
});

const mergedOverlayProps = computed(() =>
  mergeProps(
    {
      class: 'ms-panelists-modal__overlay',
      style: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.35)',
        zIndex: 1050,
      } satisfies CSSProperties,
    },
    props.overlayProps ?? {}
  )
);

const mergedContentProps = computed(() =>
  mergeProps(
    {
      class: 'ms-panelists-modal__content',
      style: {
        position: 'fixed',
        width: 'min(760px, calc(100vw - 32px))',
        maxHeight: 'calc(100vh - 48px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: props.backgroundColor,
        borderRadius: '24px',
        boxShadow: '0 24px 72px rgba(15, 23, 42, 0.22)',
        ...positionStyle.value,
      } satisfies CSSProperties,
    },
    props.contentProps ?? {}
  )
);

const mergedHeaderProps = computed(() =>
  mergeProps(
    {
      class: 'ms-panelists-modal__header',
    },
    props.headerProps ?? {}
  )
);

const mergedTitleProps = computed(() =>
  mergeProps(
    {
      class: 'ms-panelists-modal__title',
    },
    props.titleProps ?? {}
  )
);

const mergedBadgeWrapperProps = computed(() =>
  mergeProps(
    {
      class: 'ms-panelists-modal__badge-wrapper',
    },
    props.badgeWrapperProps ?? {}
  )
);

const mergedBadgeProps = computed(() =>
  mergeProps(
    {
      class: 'ms-panelists-modal__badge',
    },
    props.badgeProps ?? {}
  )
);

const mergedCloseButtonProps = computed(() =>
  mergeProps(
    {
      class: 'ms-panelists-modal__close-button',
      type: 'button',
    },
    props.closeButtonProps ?? {}
  )
);

const mergedBodyProps = computed(() =>
  mergeProps(
    {
      class: 'ms-panelists-modal__body',
    },
    props.bodyProps ?? {}
  )
);

const mergedFocusSectionProps = computed(() =>
  mergeProps(
    {
      class: 'ms-panelists-modal__focus',
    },
    props.focusSectionProps ?? {}
  )
);

const mergedSearchInputProps = computed(() =>
  mergeProps(
    {
      class: 'ms-panelists-modal__search-input',
    },
    props.searchInputProps ?? {}
  )
);

const mergedColumnsProps = computed(() =>
  mergeProps(
    {
      class: 'ms-panelists-modal__columns',
    },
    props.columnsProps ?? {}
  )
);

const syncFromParams = () => {
  const params = currentParams.value;

  localPanelists.value = Array.isArray(params?.panelists) ? [...params.panelists] : [];
  localParticipants.value = Array.isArray(params?.participants) ? [...params.participants] : [];
  isFocused.value = !!params?.panelistsFocused;
  muteOthersMic.value = !!params?.muteOthersMic;
  muteOthersCamera.value = !!params?.muteOthersCamera;
};

watch(
  () => props.isPanelistsModalVisible,
  (visible) => {
    if (visible) {
      syncFromParams();
      return;
    }

    searchFilter.value = '';
    activeParticipantId.value = null;
    activeParticipantAction.value = null;
    isUpdatingFocus.value = false;
  },
  { immediate: true }
);

watch(
  () => [
    props.parameters.panelists,
    props.parameters.participants,
    props.parameters.panelistsFocused,
    props.parameters.muteOthersMic,
    props.parameters.muteOthersCamera,
  ],
  () => {
    if (props.isPanelistsModalVisible) {
      syncFromParams();
    }
  },
  { deep: true }
);

const handleClose = () => {
  props.onPanelistsClose();
};

const notify = (message: string, type: string = 'danger') => {
  currentParams.value?.showAlert?.({
    message,
    type,
    duration: 3000,
  });
};

const isPendingParticipant = (
  participantId: string | undefined,
  action: 'add' | 'remove'
) => activeParticipantId.value === participantId && activeParticipantAction.value === action;

const getParticipantRoleLabel = (participant: Participant) => {
  switch (participant.islevel) {
    case '2':
      return 'Host';
    case '1':
      return 'Elevated';
    default:
      return 'Participant';
  }
};

const resolveActionButtonProps = (
  variant: 'primary' | 'secondary',
  disabled: boolean
) =>
  mergeProps(
    {
      class: [
        'ms-panelists-modal__action-button',
        variant === 'primary'
          ? 'ms-panelists-modal__action-button--primary'
          : 'ms-panelists-modal__action-button--secondary',
      ],
      type: 'button',
      disabled,
    },
    variant === 'primary'
      ? props.actionButtonProps ?? {}
      : props.secondaryActionButtonProps ?? {}
  );

const handleAddPanelist = async (participant: Participant) => {
  const params = currentParams.value;

  if (!isHost.value) {
    notify('Only the host can add panelists');
    return;
  }

  if (!params?.socket) {
    notify('Panelists are unavailable until the room connection is ready');
    return;
  }

  if (localPanelists.value.some((existing) => existing.id === participant.id)) {
    notify(`${participant.name || 'This participant'} is already a panelist`, 'info');
    return;
  }

  if (localPanelists.value.length >= maxPanelists.value) {
    notify(`Maximum panelist limit (${maxPanelists.value}) reached`);
    return;
  }

  activeParticipantId.value = participant.id;
  activeParticipantAction.value = 'add';

  try {
    const response = await new Promise<{ success: boolean; reason?: string }>((resolve) => {
      params.socket.emit(
        'addPanelist',
        {
          participantId: participant.id,
          participantName: participant.name,
          roomName: params.roomName,
        },
        (result: { success: boolean; reason?: string }) => resolve(result)
      );
    });

    if (!response?.success) {
      notify(response?.reason || 'Failed to add panelist');
      return;
    }

    const nextPanelists = [...localPanelists.value, participant];
    localPanelists.value = nextPanelists;
    params.updatePanelists?.(nextPanelists);
  } finally {
    activeParticipantId.value = null;
    activeParticipantAction.value = null;
  }
};

const handleRemovePanelist = async (participant: Participant) => {
  const params = currentParams.value;

  if (!isHost.value) {
    notify('Only the host can remove panelists');
    return;
  }

  if (!params?.socket) {
    notify('Panelists are unavailable until the room connection is ready');
    return;
  }

  activeParticipantId.value = participant.id;
  activeParticipantAction.value = 'remove';

  try {
    const response = await new Promise<{ success: boolean; reason?: string }>((resolve) => {
      params.socket.emit(
        'removePanelist',
        {
          participantId: participant.id,
          roomName: params.roomName,
        },
        (result: { success: boolean; reason?: string }) => resolve(result)
      );
    });

    if (!response?.success) {
      notify(response?.reason || 'Failed to remove panelist');
      return;
    }

    const nextPanelists = localPanelists.value.filter((existing) => existing.id !== participant.id);
    localPanelists.value = nextPanelists;
    params.updatePanelists?.(nextPanelists);
  } finally {
    activeParticipantId.value = null;
    activeParticipantAction.value = null;
  }
};

const handleToggleFocus = async () => {
  const params = currentParams.value;

  if (!isHost.value) {
    notify('Only the host can focus panelists');
    return;
  }

  if (!params?.socket) {
    notify('Panelists are unavailable until the room connection is ready');
    return;
  }

  const nextFocused = !isFocused.value;
  isUpdatingFocus.value = true;

  try {
    const response = await new Promise<{ success: boolean; reason?: string }>((resolve) => {
      params.socket.emit(
        'focusPanelists',
        {
          roomName: params.roomName,
          focusEnabled: nextFocused,
          muteOthersMic: nextFocused ? muteOthersMic.value : false,
          muteOthersCamera: nextFocused ? muteOthersCamera.value : false,
        },
        (result: { success: boolean; reason?: string }) => resolve(result)
      );
    });

    if (!response?.success) {
      notify(response?.reason || 'Failed to update panelist focus');
      return;
    }

    isFocused.value = nextFocused;
    params.updatePanelistsFocused?.(nextFocused);
    params.updateMuteOthersMic?.(nextFocused ? muteOthersMic.value : false);
    params.updateMuteOthersCamera?.(nextFocused ? muteOthersCamera.value : false);

    notify(nextFocused ? 'Panelist focus enabled' : 'Panelist focus disabled', nextFocused ? 'success' : 'info');
  } finally {
    isUpdatingFocus.value = false;
  }
};
</script>

<style scoped>
.ms-panelists-modal__header {
  padding: 20px 22px 18px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.1);
}

.ms-panelists-modal__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.ms-panelists-modal__title-block {
  display: grid;
  gap: 6px;
}

.ms-panelists-modal__eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(15, 23, 42, 0.52);
}

.ms-panelists-modal__title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
}

.ms-panelists-modal__header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ms-panelists-modal__badge-wrapper {
  padding: 3px;
  border-radius: 999px;
  background: linear-gradient(135deg, #0f766e 0%, #2563eb 100%);
}

.ms-panelists-modal__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
  font-size: 0.85rem;
  font-weight: 700;
}

.ms-panelists-modal__close-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.84);
  color: #0f172a;
  cursor: pointer;
}

.ms-panelists-modal__body {
  display: grid;
  gap: 18px;
  padding: 20px 22px 22px;
  overflow-y: auto;
}

.ms-panelists-modal__focus {
  display: grid;
  gap: 14px;
  padding: 18px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 20px;
  background: rgba(248, 250, 252, 0.92);
}

.ms-panelists-modal__focus-copy {
  display: grid;
  gap: 10px;
}

.ms-panelists-modal__focus-status {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  background: rgba(15, 23, 42, 0.08);
  color: #0f172a;
}

.ms-panelists-modal__focus-status[data-active='true'] {
  background: rgba(13, 148, 136, 0.14);
  color: #115e59;
}

.ms-panelists-modal__focus-text {
  margin: 0;
  color: rgba(15, 23, 42, 0.72);
  line-height: 1.55;
}

.ms-panelists-modal__focus-options {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.ms-panelists-modal__checkbox-row {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #0f172a;
  font-size: 0.92rem;
}

.ms-panelists-modal__checkbox-row input {
  accent-color: #0f766e;
}

.ms-panelists-modal__focus-actions {
  display: grid;
  gap: 10px;
}

.ms-panelists-modal__helper-text {
  margin: 0;
  font-size: 0.82rem;
  color: rgba(15, 23, 42, 0.62);
}

.ms-panelists-modal__search-row {
  display: flex;
}

.ms-panelists-modal__search-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 16px;
  font-size: 0.94rem;
  color: #0f172a;
  background: rgba(255, 255, 255, 0.94);
}

.ms-panelists-modal__search-input:focus {
  outline: 2px solid rgba(37, 99, 235, 0.18);
  border-color: rgba(37, 99, 235, 0.28);
}

.ms-panelists-modal__columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.ms-panelists-modal__panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 14px;
  padding: 18px;
  min-height: 300px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 20px;
  background: rgba(248, 250, 252, 0.92);
}

.ms-panelists-modal__section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.ms-panelists-modal__section-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
}

.ms-panelists-modal__section-header p {
  margin: 4px 0 0;
  color: rgba(15, 23, 42, 0.62);
  font-size: 0.84rem;
  line-height: 1.45;
}

.ms-panelists-modal__section-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.08);
  color: #0f172a;
  font-size: 0.82rem;
  font-weight: 700;
}

.ms-panelists-modal__list-body {
  display: grid;
  align-content: start;
  gap: 12px;
  overflow-y: auto;
}

.ms-panelists-modal__empty-state {
  display: grid;
  place-items: center;
  min-height: 160px;
  padding: 18px;
  border: 1px dashed rgba(15, 23, 42, 0.14);
  border-radius: 16px;
  color: rgba(15, 23, 42, 0.58);
  text-align: center;
}

.ms-panelists-modal__person-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
}

.ms-panelists-modal__person-meta {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.ms-panelists-modal__person-meta strong {
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ms-panelists-modal__person-meta span {
  color: rgba(15, 23, 42, 0.62);
  font-size: 0.82rem;
}

.ms-panelists-modal__action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
}

.ms-panelists-modal__action-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.ms-panelists-modal__action-button--primary {
  background: #0f766e;
  color: #f8fafc;
  box-shadow: 0 14px 28px rgba(15, 118, 110, 0.18);
}

.ms-panelists-modal__action-button--secondary {
  background: rgba(15, 23, 42, 0.08);
  color: #0f172a;
  border-color: rgba(15, 23, 42, 0.12);
}

@media (max-width: 760px) {
  .ms-panelists-modal__content {
    left: 16px !important;
    right: 16px !important;
    width: auto !important;
    max-height: calc(100vh - 32px);
    transform: none !important;
    top: 16px !important;
    bottom: 16px !important;
  }

  .ms-panelists-modal__columns {
    grid-template-columns: 1fr;
  }

  .ms-panelists-modal__person-row {
    flex-direction: column;
    align-items: stretch;
  }

  .ms-panelists-modal__action-button {
    width: 100%;
  }
}
</style>