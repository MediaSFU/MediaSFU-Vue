<template>
  <div
    v-if="isPermissionsModalVisible"
    v-bind="mergedOverlayProps"
    @click.self="handleClose"
  >
    <section v-bind="mergedContentProps">
      <header v-bind="mergedHeaderProps">
        <div class="ms-permissions-modal__heading">
          <div class="ms-permissions-modal__title-block">
            <span class="ms-permissions-modal__eyebrow">Room access control</span>
            <h2 v-bind="mergedTitleProps">{{ title }}</h2>
          </div>

          <button
            v-bind="mergedCloseButtonProps"
            @click="handleClose"
          >
            <FontAwesomeIcon :icon="faTimes" />
          </button>
        </div>
      </header>

      <div v-bind="mergedBodyProps">
        <div v-bind="mergedTabListProps">
          <button
            v-bind="resolveTabButtonProps('config')"
            @click="activeTab = 'config'"
          >
            Capability rules
          </button>
          <button
            v-bind="resolveTabButtonProps('users')"
            @click="activeTab = 'users'"
          >
            Participant levels
          </button>
        </div>

        <section
          v-if="activeTab === 'config'"
          v-bind="mergedConfigSectionProps"
        >
          <div class="ms-permissions-modal__section-copy">
            <p>
              Configure what each participant level can do when they join the room. These settings stay aligned with the existing `permissionConfig` socket flow.
            </p>
            <p
              v-if="!isHost"
              class="ms-permissions-modal__helper-text"
            >
              Only the host can update permission rules.
            </p>
          </div>

          <div class="ms-permissions-modal__config-grid">
            <section
              v-for="level in levelSections"
              :key="level.key"
              class="ms-permissions-modal__config-card"
            >
              <div class="ms-permissions-modal__card-header">
                <h3>{{ level.label }}</h3>
                <p>{{ level.description }}</p>
              </div>

              <div class="ms-permissions-modal__capability-list">
                <label
                  v-for="capability in capabilityDefinitions"
                  :key="capability.key"
                  class="ms-permissions-modal__capability-row"
                >
                  <span class="ms-permissions-modal__capability-meta">
                    <strong>{{ capability.label }}</strong>
                    <small>{{ capability.description }}</small>
                  </span>

                  <select
                    class="ms-permissions-modal__select"
                    :value="localConfig[level.key][capability.key]"
                    :disabled="!isHost || isSavingConfig"
                    @change="handleCapabilitySelection(level.key, capability.key, $event)"
                  >
                    <option
                      v-for="option in getCapabilityOptions(capability.key)"
                      :key="option"
                      :value="option"
                    >
                      {{ formatCapabilityOption(option) }}
                    </option>
                  </select>
                </label>
              </div>
            </section>
          </div>

          <div class="ms-permissions-modal__actions-row">
            <button
              v-bind="resolveActionButtonProps('primary', !isHost || isSavingConfig)"
              @click="handleSaveConfig"
            >
              {{ isSavingConfig ? 'Saving...' : 'Save permission rules' }}
            </button>
          </div>
        </section>

        <section
          v-else
          v-bind="mergedUsersSectionProps"
        >
          <div class="ms-permissions-modal__section-copy">
            <p>
              Promote participants to the elevated level or return them to the basic level. Host accounts stay locked.
            </p>
          </div>

          <div class="ms-permissions-modal__users-toolbar">
            <input
              v-model="searchFilter"
              v-bind="mergedSearchInputProps"
              type="search"
              placeholder="Search participants"
            >

            <div class="ms-permissions-modal__bulk-actions">
              <button
                v-bind="resolveActionButtonProps('secondary', !isHost || pendingBulkLevel === '0')"
                @click="handleBulkUpdate('0')"
              >
                {{ pendingBulkLevel === '0' ? 'Applying...' : 'Set filtered to Basic' }}
              </button>
              <button
                v-bind="resolveActionButtonProps('primary', !isHost || pendingBulkLevel === '1')"
                @click="handleBulkUpdate('1')"
              >
                {{ pendingBulkLevel === '1' ? 'Applying...' : 'Set filtered to Elevated' }}
              </button>
            </div>
          </div>

          <div class="ms-permissions-modal__participants-summary">
            <span>{{ filteredParticipants.length }} manageable participants</span>
            <span>{{ elevatedCount }} elevated</span>
          </div>

          <div class="ms-permissions-modal__participants-list">
            <div
              v-if="filteredParticipants.length === 0"
              class="ms-permissions-modal__empty-state"
            >
              {{ normalizedSearch ? 'No matching participants found.' : 'No participants are available for permission updates.' }}
            </div>

            <div
              v-for="(participant, index) in filteredParticipants"
              :key="participant.id || `${participant.name || 'participant'}-${index}`"
              class="ms-permissions-modal__participant-row"
            >
              <div class="ms-permissions-modal__participant-meta">
                <strong>{{ participant.name || 'Unnamed participant' }}</strong>
                <span>{{ getParticipantLevelLabel(participant.islevel) }}</span>
              </div>

              <div class="ms-permissions-modal__participant-actions">
                <button
                  v-bind="resolveLevelButtonProps(participant, '0')"
                  @click="handleParticipantLevelUpdate(participant, '0')"
                >
                  {{ isPendingParticipant(participant.id, '0') ? 'Saving...' : 'Basic' }}
                </button>
                <button
                  v-bind="resolveLevelButtonProps(participant, '1')"
                  @click="handleParticipantLevelUpdate(participant, '1')"
                >
                  {{ isPendingParticipant(participant.id, '1') ? 'Saving...' : 'Elevated' }}
                </button>
              </div>
            </div>
          </div>
        </section>
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
import type { Participant, PermissionConfig } from 'mediasfu-shared';
import type { Socket } from 'socket.io-client';

type PermissionLevel = '0' | '1';
type ConfigLevel = keyof PermissionConfig;
type CapabilityKey = keyof PermissionConfig['level0'];
type CapabilityValue = PermissionConfig['level0'][CapabilityKey];

export interface PermissionsModalParameters {
  participants: Participant[];
  member: string;
  islevel: string;
  socket: Socket;
  roomName: string;
  permissionConfig?: PermissionConfig | null;
  audioSetting?: string;
  videoSetting?: string;
  screenshareSetting?: string;
  chatSetting?: string;
  showAlert?: (options: { message: string; type: string; duration?: number }) => void;
  updatePermissionConfig?: (config: PermissionConfig) => void;
  updateParticipants?: (participants: Participant[]) => void;
  getUpdatedAllParams?: () => PermissionsModalParameters;
  [key: string]: unknown;
}

export interface PermissionsModalProps {
  isPermissionsModalVisible: boolean;
  onPermissionsClose: () => void;
  parameters: PermissionsModalParameters;
  backgroundColor?: string;
  position?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft' | 'center';
  title?: string;
  overlayProps?: HTMLAttributes;
  contentProps?: HTMLAttributes;
  headerProps?: HTMLAttributes;
  titleProps?: HTMLAttributes;
  closeButtonProps?: ButtonHTMLAttributes;
  bodyProps?: HTMLAttributes;
  tabListProps?: HTMLAttributes;
  tabButtonProps?: ButtonHTMLAttributes;
  configSectionProps?: HTMLAttributes;
  usersSectionProps?: HTMLAttributes;
  searchInputProps?: InputHTMLAttributes;
  actionButtonProps?: ButtonHTMLAttributes;
  secondaryActionButtonProps?: ButtonHTMLAttributes;
}

const props = withDefaults(defineProps<PermissionsModalProps>(), {
  backgroundColor: '#ffffff',
  position: 'topRight',
  title: 'Permissions',
});

const activeTab = ref<'config' | 'users'>('users');
const searchFilter = ref('');
const localParticipants = ref<Participant[]>([]);
const localConfig = ref<PermissionConfig>({
  level0: {
    useMic: 'approval',
    useCamera: 'approval',
    useScreen: 'disallow',
    useChat: 'allow',
  },
  level1: {
    useMic: 'approval',
    useCamera: 'approval',
    useScreen: 'disallow',
    useChat: 'allow',
  },
});
const pendingParticipantId = ref<string | null>(null);
const pendingParticipantLevel = ref<PermissionLevel | null>(null);
const pendingBulkLevel = ref<PermissionLevel | null>(null);
const isSavingConfig = ref(false);

const levelSections = [
  {
    key: 'level0',
    label: 'Basic participants',
    description: 'Default permissions for standard attendees.',
  },
  {
    key: 'level1',
    label: 'Elevated participants',
    description: 'Additional permissions for promoted participants and co-host style members.',
  },
] as const satisfies Array<{ key: ConfigLevel; label: string; description: string }>;

const capabilityDefinitions = [
  {
    key: 'useMic',
    label: 'Microphone',
    description: 'Control if participants can unmute without approval.',
  },
  {
    key: 'useCamera',
    label: 'Camera',
    description: 'Control if participants can turn on video immediately.',
  },
  {
    key: 'useScreen',
    label: 'Screen share',
    description: 'Control if participants can share screens directly.',
  },
  {
    key: 'useChat',
    label: 'Chat',
    description: 'Control whether participants can send chat messages.',
  },
] as const satisfies Array<{ key: CapabilityKey; label: string; description: string }>;

const currentParams = computed<PermissionsModalParameters>(() =>
  props.parameters.getUpdatedAllParams?.() ?? props.parameters
);

const isHost = computed(() => currentParams.value?.islevel === '2');
const normalizedSearch = computed(() => searchFilter.value.trim().toLowerCase());
const elevatedCount = computed(
  () => localParticipants.value.filter((participant) => participant.islevel === '1').length
);

const filteredParticipants = computed(() =>
  localParticipants.value
    .filter((participant) => participant.islevel !== '2')
    .filter((participant) => {
      if (!normalizedSearch.value) {
        return true;
      }

      return (participant.name ?? '').toLowerCase().includes(normalizedSearch.value);
    })
);

const positionStyle = computed<CSSProperties>(() => {
  const positions: Record<NonNullable<PermissionsModalProps['position']>, CSSProperties> = {
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
      class: 'ms-permissions-modal__overlay',
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
      class: 'ms-permissions-modal__content',
      style: {
        position: 'fixed',
        width: 'min(860px, calc(100vw - 32px))',
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
    { class: 'ms-permissions-modal__header' },
    props.headerProps ?? {}
  )
);

const mergedTitleProps = computed(() =>
  mergeProps(
    { class: 'ms-permissions-modal__title' },
    props.titleProps ?? {}
  )
);

const mergedCloseButtonProps = computed(() =>
  mergeProps(
    {
      class: 'ms-permissions-modal__close-button',
      type: 'button',
    },
    props.closeButtonProps ?? {}
  )
);

const mergedBodyProps = computed(() =>
  mergeProps(
    { class: 'ms-permissions-modal__body' },
    props.bodyProps ?? {}
  )
);

const mergedTabListProps = computed(() =>
  mergeProps(
    { class: 'ms-permissions-modal__tab-list' },
    props.tabListProps ?? {}
  )
);

const mergedConfigSectionProps = computed(() =>
  mergeProps(
    { class: 'ms-permissions-modal__config-section' },
    props.configSectionProps ?? {}
  )
);

const mergedUsersSectionProps = computed(() =>
  mergeProps(
    { class: 'ms-permissions-modal__users-section' },
    props.usersSectionProps ?? {}
  )
);

const mergedSearchInputProps = computed(() =>
  mergeProps(
    { class: 'ms-permissions-modal__search-input' },
    props.searchInputProps ?? {}
  )
);

const createFallbackConfig = (params: PermissionsModalParameters): PermissionConfig => {
  const normalizeMediaSetting = (value: string | undefined): 'allow' | 'approval' | 'disallow' => {
    if (value === 'allow' || value === 'approval' || value === 'disallow') {
      return value;
    }

    return 'approval';
  };

  const normalizeChatSetting = (value: string | undefined): 'allow' | 'disallow' =>
    value === 'allow' ? 'allow' : 'disallow';

  const capabilities = {
    useMic: normalizeMediaSetting(params.audioSetting),
    useCamera: normalizeMediaSetting(params.videoSetting),
    useScreen: normalizeMediaSetting(params.screenshareSetting),
    useChat: normalizeChatSetting(params.chatSetting),
  };

  return {
    level0: { ...capabilities },
    level1: { ...capabilities },
  };
};

const cloneConfig = (config: PermissionConfig): PermissionConfig => ({
  level0: { ...config.level0 },
  level1: { ...config.level1 },
});

const syncFromParams = () => {
  const params = currentParams.value;
  const nextConfig = params.permissionConfig ?? createFallbackConfig(params);

  localConfig.value = cloneConfig(nextConfig);
  localParticipants.value = Array.isArray(params.participants) ? [...params.participants] : [];
};

watch(
  () => props.isPermissionsModalVisible,
  (visible) => {
    if (visible) {
      syncFromParams();
      return;
    }

    activeTab.value = 'users';
    searchFilter.value = '';
    pendingParticipantId.value = null;
    pendingParticipantLevel.value = null;
    pendingBulkLevel.value = null;
    isSavingConfig.value = false;
  },
  { immediate: true }
);

watch(
  () => [
    props.parameters.permissionConfig,
    props.parameters.participants,
    props.parameters.audioSetting,
    props.parameters.videoSetting,
    props.parameters.screenshareSetting,
    props.parameters.chatSetting,
  ],
  () => {
    if (props.isPermissionsModalVisible) {
      syncFromParams();
    }
  },
  { deep: true }
);

const handleClose = () => {
  props.onPermissionsClose();
};

const notify = (message: string, type: string = 'danger') => {
  currentParams.value?.showAlert?.({
    message,
    type,
    duration: 3000,
  });
};

const getCapabilityOptions = (capability: CapabilityKey): CapabilityValue[] => {
  if (capability === 'useChat') {
    return ['allow', 'disallow'];
  }

  return ['allow', 'approval', 'disallow'];
};

const formatCapabilityOption = (option: CapabilityValue) => {
  switch (option) {
    case 'allow':
      return 'Allow';
    case 'approval':
      return 'Require approval';
    default:
      return 'Disallow';
  }
};

const getParticipantLevelLabel = (level: string | undefined) => {
  switch (level) {
    case '2':
      return 'Host';
    case '1':
      return 'Elevated';
    default:
      return 'Basic';
  }
};

const resolveTabButtonProps = (tab: 'config' | 'users') =>
  mergeProps(
    {
      class: 'ms-permissions-modal__tab-button',
      'data-active': activeTab.value === tab,
      type: 'button',
    },
    props.tabButtonProps ?? {}
  );

const resolveActionButtonProps = (
  variant: 'primary' | 'secondary',
  disabled: boolean
) =>
  mergeProps(
    {
      class: [
        'ms-permissions-modal__action-button',
        variant === 'primary'
          ? 'ms-permissions-modal__action-button--primary'
          : 'ms-permissions-modal__action-button--secondary',
      ],
      type: 'button',
      disabled,
    },
    variant === 'primary'
      ? props.actionButtonProps ?? {}
      : props.secondaryActionButtonProps ?? {}
  );

const resolveLevelButtonProps = (participant: Participant, level: PermissionLevel) => {
  const isCurrentLevel = participant.islevel === level;
  const isPending = isPendingParticipant(participant.id, level);

  return resolveActionButtonProps(level === '1' ? 'primary' : 'secondary', !isHost.value || isCurrentLevel || isPending);
};

const handleCapabilitySelection = (
  level: ConfigLevel,
  capability: CapabilityKey,
  event: Event
) => {
  const target = event.target as HTMLSelectElement | null;

  if (!target) {
    return;
  }

  localConfig.value = {
    ...localConfig.value,
    [level]: {
      ...localConfig.value[level],
      [capability]: target.value as CapabilityValue,
    },
  };
};

const isPendingParticipant = (
  participantId: string | undefined,
  level: PermissionLevel
) => pendingParticipantId.value === participantId && pendingParticipantLevel.value === level;

const applyParticipantLevels = (participantIds: Set<string>, level: PermissionLevel) => {
  const nextParticipants = localParticipants.value.map((participant) => {
    if (!participant.id || !participantIds.has(participant.id)) {
      return participant;
    }

    return {
      ...participant,
      islevel: level,
    };
  });

  localParticipants.value = nextParticipants;
  currentParams.value?.updateParticipants?.(nextParticipants);
};

const handleSaveConfig = async () => {
  const params = currentParams.value;

  if (!isHost.value) {
    notify('Only the host can update permission rules');
    return;
  }

  if (!params?.socket) {
    notify('Permissions are unavailable until the room connection is ready');
    return;
  }

  isSavingConfig.value = true;

  try {
    const nextConfig = cloneConfig(localConfig.value);
    const response = await new Promise<{ success: boolean; reason?: string }>((resolve) => {
      params.socket.emit(
        'updatePermissionConfig',
        {
          config: nextConfig,
          roomName: params.roomName,
        },
        (result: { success: boolean; reason?: string }) => resolve(result)
      );
    });

    if (!response?.success) {
      notify(response?.reason || 'Failed to update permission rules');
      return;
    }

    params.updatePermissionConfig?.(nextConfig);
    notify('Permission configuration updated', 'success');
  } finally {
    isSavingConfig.value = false;
  }
};

const handleParticipantLevelUpdate = async (participant: Participant, level: PermissionLevel) => {
  const params = currentParams.value;

  if (!isHost.value) {
    notify('Only the host can update participant permissions');
    return;
  }

  if (!params?.socket) {
    notify('Permissions are unavailable until the room connection is ready');
    return;
  }

  if (!participant.id) {
    notify('Participant identifier is missing');
    return;
  }

  if (participant.islevel === level) {
    return;
  }

  pendingParticipantId.value = participant.id;
  pendingParticipantLevel.value = level;

  try {
    const response = await new Promise<{ success: boolean; reason?: string }>((resolve) => {
      params.socket.emit(
        'updateParticipantPermission',
        {
          participantId: participant.id,
          participantName: participant.name,
          newLevel: level,
          roomName: params.roomName,
        },
        (result: { success: boolean; reason?: string }) => resolve(result)
      );
    });

    if (!response?.success) {
      notify(response?.reason || 'Failed to update participant permission');
      return;
    }

    applyParticipantLevels(new Set([participant.id]), level);
  } finally {
    pendingParticipantId.value = null;
    pendingParticipantLevel.value = null;
  }
};

const handleBulkUpdate = async (level: PermissionLevel) => {
  const params = currentParams.value;

  if (!isHost.value) {
    notify('Only the host can update participant permissions');
    return;
  }

  if (!params?.socket) {
    notify('Permissions are unavailable until the room connection is ready');
    return;
  }

  const eligibleParticipants = filteredParticipants.value.filter(
    (participant) => participant.id && participant.islevel !== level
  );

  if (eligibleParticipants.length === 0) {
    notify('No participants need that permission level', 'success');
    return;
  }

  pendingBulkLevel.value = level;

  try {
    const response = await new Promise<{ success: boolean; reason?: string }>((resolve) => {
      params.socket.emit(
        'bulkUpdateParticipantPermissions',
        {
          updates: eligibleParticipants.map((participant) => ({
            participantId: participant.id,
            participantName: participant.name,
            newLevel: level,
          })),
          roomName: params.roomName,
        },
        (result: { success: boolean; reason?: string }) => resolve(result)
      );
    });

    if (!response?.success) {
      notify(response?.reason || 'Failed to update participant permissions');
      return;
    }

    applyParticipantLevels(
      new Set(eligibleParticipants.map((participant) => participant.id as string)),
      level
    );
    notify(`Updated ${eligibleParticipants.length} participants`, 'success');
  } finally {
    pendingBulkLevel.value = null;
  }
};
</script>

<style scoped>
.ms-permissions-modal__header {
  padding: 20px 22px 18px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.1);
}

.ms-permissions-modal__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.ms-permissions-modal__title-block {
  display: grid;
  gap: 6px;
}

.ms-permissions-modal__eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(15, 23, 42, 0.52);
}

.ms-permissions-modal__title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
}

.ms-permissions-modal__close-button {
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

.ms-permissions-modal__body {
  display: grid;
  gap: 18px;
  padding: 20px 22px 22px;
  overflow-y: auto;
}

.ms-permissions-modal__tab-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 4px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  background: rgba(248, 250, 252, 0.9);
}

.ms-permissions-modal__tab-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 14px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: rgba(15, 23, 42, 0.68);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

.ms-permissions-modal__tab-button[data-active='true'] {
  background: #0f172a;
  color: #f8fafc;
}

.ms-permissions-modal__config-section,
.ms-permissions-modal__users-section {
  display: grid;
  gap: 18px;
}

.ms-permissions-modal__section-copy p {
  margin: 0;
  color: rgba(15, 23, 42, 0.72);
  line-height: 1.55;
}

.ms-permissions-modal__helper-text {
  margin-top: 10px;
  font-size: 0.84rem;
  color: rgba(15, 23, 42, 0.58);
}

.ms-permissions-modal__config-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.ms-permissions-modal__config-card {
  display: grid;
  gap: 16px;
  padding: 18px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 20px;
  background: rgba(248, 250, 252, 0.92);
}

.ms-permissions-modal__card-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
}

.ms-permissions-modal__card-header p {
  margin: 6px 0 0;
  color: rgba(15, 23, 42, 0.62);
  font-size: 0.84rem;
  line-height: 1.45;
}

.ms-permissions-modal__capability-list {
  display: grid;
  gap: 12px;
}

.ms-permissions-modal__capability-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
}

.ms-permissions-modal__capability-meta {
  display: grid;
  gap: 4px;
}

.ms-permissions-modal__capability-meta strong {
  color: #0f172a;
}

.ms-permissions-modal__capability-meta small {
  color: rgba(15, 23, 42, 0.58);
  line-height: 1.45;
}

.ms-permissions-modal__select,
.ms-permissions-modal__search-input {
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.94);
  color: #0f172a;
}

.ms-permissions-modal__select {
  min-width: 170px;
  padding: 10px 12px;
}

.ms-permissions-modal__search-input {
  width: 100%;
  padding: 12px 14px;
}

.ms-permissions-modal__actions-row {
  display: flex;
  justify-content: flex-end;
}

.ms-permissions-modal__users-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
}

.ms-permissions-modal__bulk-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ms-permissions-modal__participants-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  color: rgba(15, 23, 42, 0.62);
  font-size: 0.85rem;
  font-weight: 600;
}

.ms-permissions-modal__participants-list {
  display: grid;
  gap: 12px;
}

.ms-permissions-modal__empty-state {
  display: grid;
  place-items: center;
  min-height: 180px;
  padding: 18px;
  border: 1px dashed rgba(15, 23, 42, 0.14);
  border-radius: 16px;
  color: rgba(15, 23, 42, 0.58);
  text-align: center;
}

.ms-permissions-modal__participant-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.92);
}

.ms-permissions-modal__participant-meta {
  display: grid;
  gap: 4px;
}

.ms-permissions-modal__participant-meta strong {
  color: #0f172a;
}

.ms-permissions-modal__participant-meta span {
  color: rgba(15, 23, 42, 0.58);
  font-size: 0.82rem;
}

.ms-permissions-modal__participant-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ms-permissions-modal__action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 118px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
}

.ms-permissions-modal__action-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.ms-permissions-modal__action-button--primary {
  background: #0f766e;
  color: #f8fafc;
  box-shadow: 0 14px 28px rgba(15, 118, 110, 0.18);
}

.ms-permissions-modal__action-button--secondary {
  background: rgba(15, 23, 42, 0.08);
  color: #0f172a;
  border-color: rgba(15, 23, 42, 0.12);
}

@media (max-width: 840px) {
  .ms-permissions-modal__content {
    left: 16px !important;
    right: 16px !important;
    width: auto !important;
    max-height: calc(100vh - 32px);
    transform: none !important;
    top: 16px !important;
    bottom: 16px !important;
  }

  .ms-permissions-modal__config-grid,
  .ms-permissions-modal__users-toolbar {
    grid-template-columns: 1fr;
  }

  .ms-permissions-modal__capability-row,
  .ms-permissions-modal__participant-row {
    flex-direction: column;
    align-items: stretch;
  }

  .ms-permissions-modal__participant-actions,
  .ms-permissions-modal__bulk-actions,
  .ms-permissions-modal__actions-row {
    width: 100%;
  }

  .ms-permissions-modal__action-button {
    width: 100%;
  }
}
</style>