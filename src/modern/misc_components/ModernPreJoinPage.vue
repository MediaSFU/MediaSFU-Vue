<template>
  <ModernEntryShell
    v-if="effectiveReturnUI"
    :intro-layout="props.entryShellLayout"
  >
    <template #title>
      <div class="ms-modern-prejoin__title-wrap">
        <img
          :src="props.parameters.imgSrc || 'https://mediasfu.com/images/logo192.png'"
          class="ms-modern-prejoin__logo"
          alt="MediaSFU"
        >
        <h1 class="ms-modern-prejoin__title">
          {{ isCreateMode ? 'Create a Room' : 'Join a Room' }}
        </h1>
      </div>
    </template>

    <template #description>
      <p class="ms-modern-prejoin__description">
        {{
          isCreateMode
            ? 'Start a new session with your audience.'
            : 'Enter the event ID to connect.'
        }}
      </p>
    </template>

    <div class="ms-modern-prejoin__form">
      <template v-if="isCreateMode">
        <ModernField
          label="Display Name"
          hint="Used as the host name for the room."
          placeholder="Display Name"
          :value="name"
          @input="handleNameChange"
        />

        <ModernField
          label="Duration"
          hint="Room duration in minutes."
          placeholder="Duration (minutes)"
          :value="duration"
          @input="handleDurationChange"
        />

        <ModernField
          as="select"
          label="Event Type"
          hint="Choose the room mode to create."
          :value="eventType"
          @change="handleEventTypeChange"
        >
          <option value="">
            Select Event Type
          </option>
          <option value="chat">
            Chat
          </option>
          <option value="broadcast">
            Broadcast
          </option>
          <option value="webinar">
            Webinar
          </option>
          <option value="conference">
            Conference
          </option>
        </ModernField>

        <ModernField
          label="Room Capacity"
          hint="Maximum number of participants to allow."
          placeholder="Room Capacity"
          :value="capacity"
          @input="handleCapacityChange"
        />

        <ModernButton
          block
          size="lg"
          :disabled="pending"
          @click="onCreateRoom"
        >
          Create Room
        </ModernButton>
      </template>

      <template v-else>
        <ModernField
          label="Display Name"
          hint="Use the name you want to appear in the room."
          placeholder="Display Name"
          :value="name"
          @input="handleNameChange"
        />

        <ModernField
          label="Event ID"
          hint="Enter the identifier issued for the room."
          placeholder="Event ID"
          :value="eventID"
          @input="handleEventIdChange"
        />

        <ModernButton
          block
          size="lg"
          :disabled="pending"
          @click="onJoinRoom"
        >
          Join Room
        </ModernButton>
      </template>

      <p
        v-if="error"
        class="ms-modern-prejoin__error"
      >
        {{ error }}
      </p>

      <div class="ms-modern-prejoin__divider">
        <span>or</span>
      </div>

      <ModernButton
        block
        variant="ghost"
        :disabled="pending"
        @click="handleToggleMode"
      >
        {{ isCreateMode ? 'Switch to Join Mode' : 'Switch to Create Mode' }}
      </ModernButton>
    </div>
  </ModernEntryShell>
</template>

<script setup lang="ts">
import { computed, markRaw, nextTick, onMounted, ref, watch } from 'vue';
import { createRoomOnMediaSFU, handleCreateRoom, handleJoinRoom, joinRoomOnMediaSFU } from 'mediasfu-shared';
import type { MediaSFUSocket } from '../../types/socket';
import { ModernButton, ModernField } from '../primitives';
import ModernEntryShell from './ModernEntryShell.vue';
import type { ModernEntryShellLayout } from './ModernEntryShell.vue';
import type {
  Credentials,
  CreateMediaSFURoomOptions,
  EventType,
  JoinMediaSFURoomOptions,
  PreJoinPageParameters,
  ResponseLocalConnection,
  ResponseLocalConnectionData,
} from '../../../../SharedTypes';
import type {
  CreateRoomOnMediaSFUType,
  JoinRoomOnMediaSFUType,
} from 'mediasfu-shared';

export interface ModernPreJoinPageProps {
  localLink?: string;
  connectMediaSFU?: boolean;
  parameters: PreJoinPageParameters;
  entryShellLayout?: ModernEntryShellLayout;
  credentials?: Credentials;
  returnUI?: boolean;
  noUIPreJoinOptions?: CreateMediaSFURoomOptions | JoinMediaSFURoomOptions;
  createMediaSFURoom?: CreateRoomOnMediaSFUType;
  joinMediaSFURoom?: JoinRoomOnMediaSFUType;
}

const props = withDefaults(defineProps<ModernPreJoinPageProps>(), {
  localLink: '',
  connectMediaSFU: true,
  entryShellLayout: 'inline',
  credentials: () => ({ apiUserName: 'yourAPIUSERNAME', apiKey: 'yourAPIKEY' }),
  returnUI: true,
  noUIPreJoinOptions: undefined,
  createMediaSFURoom: () => createRoomOnMediaSFU,
  joinMediaSFURoom: () => joinRoomOnMediaSFU,
});

const effectiveReturnUI = computed(() => props.returnUI || !props.noUIPreJoinOptions);

const isCreateMode = ref(false);
const name = ref('');
const duration = ref('');
const eventType = ref<EventType | ''>(props.parameters.eventType ?? '');
const capacity = ref('');
const eventID = ref('');
const error = ref('');
const pending = ref(false);

const localConnected = ref(false);
const localData = ref<ResponseLocalConnectionData | undefined>(undefined);
const initSocket = ref<MediaSFUSocket | undefined>(undefined);

const handleNameChange = (e: Event) => {
  name.value = (e.target as HTMLInputElement).value;
};

const handleDurationChange = (e: Event) => {
  duration.value = (e.target as HTMLInputElement).value;
};

const handleEventTypeChange = (e: Event) => {
  const nextEventType = (e.target as HTMLSelectElement).value as EventType | '';
  eventType.value = nextEventType;

  if (nextEventType) {
    props.parameters.updateEventType?.(nextEventType);
  }
};

const handleCapacityChange = (e: Event) => {
  capacity.value = (e.target as HTMLInputElement).value;
};

const handleEventIdChange = (e: Event) => {
  eventID.value = (e.target as HTMLInputElement).value;
};

const waitForLoadingPaint = async () => {
  await nextTick();
  if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => resolve());
    });
  }
};

const createLoadingTransitionParameters = () => {
  let validatedDuringTransition = false;
  let pendingHideTimer: number | undefined;

  const clearPendingHide = () => {
    if (pendingHideTimer !== undefined && typeof window !== 'undefined') {
      window.clearTimeout(pendingHideTimer);
    }
    pendingHideTimer = undefined;
  };

  const show = () => {
    clearPendingHide();
    props.parameters.updateIsLoadingModalVisible?.(true);
  };

  const hideNow = () => {
    clearPendingHide();
    props.parameters.updateIsLoadingModalVisible?.(false);
  };

  const requestHide = () => {
    if (validatedDuringTransition) {
      return;
    }

    clearPendingHide();
    if (typeof window === 'undefined') {
      props.parameters.updateIsLoadingModalVisible?.(false);
      return;
    }

    pendingHideTimer = window.setTimeout(() => {
      if (!validatedDuringTransition) {
        props.parameters.updateIsLoadingModalVisible?.(false);
      }
      pendingHideTimer = undefined;
    }, 150);
  };

  return {
    parameters: {
      ...props.parameters,
      updateValidated: (value: boolean) => {
        if (value) {
          validatedDuringTransition = true;
          show();
        }
        props.parameters.updateValidated(value);
      },
      updateIsLoadingModalVisible: (value: boolean) => {
        if (value) {
          show();
        } else {
          requestHide();
        }
      },
    } satisfies PreJoinPageParameters,
    show,
    hideNow,
  };
};

const handleToggleMode = () => {
  isCreateMode.value = !isCreateMode.value;

  if (isCreateMode.value && !eventType.value) {
    const nextEventType = props.parameters.eventType ?? 'webinar';
    eventType.value = nextEventType;
    props.parameters.updateEventType?.(nextEventType);
  }

  error.value = '';
};

watch(
  () => props.parameters.eventType,
  (nextEventType) => {
    if (!nextEventType) {
      return;
    }

    if (!isCreateMode.value || !eventType.value) {
      eventType.value = nextEventType;
    }
  },
  { immediate: true },
);

const onCreateRoom = async () => {
  if (pending.value) {
    return;
  }
  pending.value = true;

  let payload = {} as CreateMediaSFURoomOptions;

  if (effectiveReturnUI.value) {
    if (!name.value || !duration.value || !eventType.value || !capacity.value) {
      error.value = 'Please fill all the fields.';
      pending.value = false;
      return;
    }
    payload = {
      action: 'create',
      duration: parseInt(duration.value),
      capacity: parseInt(capacity.value),
      eventType: eventType.value as 'chat' | 'broadcast' | 'webinar' | 'conference',
      userName: name.value,
      recordOnly: false,
    };

    props.parameters.updateEventType?.(payload.eventType);
  } else {
    if (
      props.noUIPreJoinOptions &&
      'action' in props.noUIPreJoinOptions &&
      props.noUIPreJoinOptions.action === 'create'
    ) {
      payload = props.noUIPreJoinOptions as CreateMediaSFURoomOptions;
    } else {
      pending.value = false;
      throw new Error('Invalid options provided for creating a room without UI.');
    }
  }

  const loadingTransition = createLoadingTransitionParameters();
  loadingTransition.show();
  await waitForLoadingPaint();

  try {
    await handleCreateRoom({
      payload,
      localLink: props.localLink,
      connectMediaSFU: props.connectMediaSFU,
      apiUserName: props.credentials?.apiUserName || '',
      apiKey: props.credentials?.apiKey || '',
      parameters: loadingTransition.parameters,
      initSocket: initSocket.value as unknown as MediaSFUSocket | undefined,
      localData: localData.value,
      createMediaSFURoom: props.createMediaSFURoom!,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to create room.';
    error.value = message;
    loadingTransition.hideNow();
  } finally {
    pending.value = false;
  }
};

const onJoinRoom = async () => {
  if (pending.value) {
    return;
  }
  pending.value = true;

  let payload = {} as JoinMediaSFURoomOptions;

  if (effectiveReturnUI.value) {
    if (!name.value || !eventID.value) {
      error.value = 'Please fill all the fields.';
      pending.value = false;
      return;
    }

    payload = {
      action: 'join',
      meetingID: eventID.value,
      userName: name.value,
    };
  } else {
    if (
      props.noUIPreJoinOptions &&
      'action' in props.noUIPreJoinOptions &&
      props.noUIPreJoinOptions.action === 'join'
    ) {
      payload = props.noUIPreJoinOptions as JoinMediaSFURoomOptions;
    } else {
      pending.value = false;
      throw new Error('Invalid options provided for joining a room without UI.');
    }
  }

  const loadingTransition = createLoadingTransitionParameters();
  loadingTransition.show();
  await waitForLoadingPaint();

  try {
    await handleJoinRoom({
      payload,
      localLink: props.localLink,
      apiUserName: props.credentials?.apiUserName || '',
      apiKey: props.credentials?.apiKey || '',
      parameters: loadingTransition.parameters,
      initSocket: initSocket.value as unknown as MediaSFUSocket | undefined,
      localData: localData.value,
      joinMediaSFURoom: props.joinMediaSFURoom!,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to join room.';
    error.value = message;
    loadingTransition.hideNow();
  } finally {
    pending.value = false;
  }
};

const checkProceed = async ({
  returnUI,
  noUIPreJoinOptions,
}: {
  returnUI: boolean;
  noUIPreJoinOptions?: CreateMediaSFURoomOptions | JoinMediaSFURoomOptions;
}) => {
  if (!returnUI && noUIPreJoinOptions) {
    if ('action' in noUIPreJoinOptions && noUIPreJoinOptions.action === 'create') {
      const createOptions = noUIPreJoinOptions as CreateMediaSFURoomOptions;
      if (
        !createOptions.userName ||
        !createOptions.duration ||
        !createOptions.eventType ||
        !createOptions.capacity
      ) {
        throw new Error(
          'Please provide all the required parameters: userName, duration, eventType, capacity'
        );
      }

      await onCreateRoom();
    } else if ('action' in noUIPreJoinOptions && noUIPreJoinOptions.action === 'join') {
      const joinOptions = noUIPreJoinOptions as JoinMediaSFURoomOptions;
      if (!joinOptions.userName || !joinOptions.meetingID) {
        throw new Error('Please provide all the required parameters: userName, meetingID');
      }

      await onJoinRoom();
    } else {
      throw new Error('Invalid options provided for creating/joining a room without UI.');
    }
  }
};

onMounted(() => {
  if (props.localLink.length > 0 && !localConnected.value && !initSocket.value) {
    try {
      props.parameters.connectLocalSocket?.({ link: props.localLink })
        .then((response: ResponseLocalConnection | undefined) => {
          if (!response) {
            return;
          }

          const { data, socket } = response;
          if (data) {
            if (!data.meetingRoomParams_) {
              (data as unknown as Record<string, unknown>).meetingRoomParams_ = {};
            }
            if (!data.recordingParams_) {
              (data as unknown as Record<string, unknown>).recordingParams_ = {};
            }
            if (data.socketId == null) {
              (data as unknown as Record<string, unknown>).socketId = '';
            }
            if (data.mode == null) {
              (data as unknown as Record<string, unknown>).mode = '';
            }
            if (data.allowRecord == null) {
              (data as unknown as Record<string, unknown>).allowRecord = false;
            }
          }

          localData.value = data;
          initSocket.value = socket ? (markRaw(socket) as unknown as MediaSFUSocket) : undefined;
          localConnected.value = true;

          if (!effectiveReturnUI.value && props.noUIPreJoinOptions) {
            checkProceed({ returnUI: effectiveReturnUI.value, noUIPreJoinOptions: props.noUIPreJoinOptions });
          }
        })
        .catch((error: unknown) => {
          props.parameters.showAlert?.({
            message: `Unable to connect to ${props.localLink}. ${error}`,
            type: 'danger',
            duration: 3000,
          });
        });
    } catch {
      props.parameters.showAlert?.({
        message: `Unable to connect to ${props.localLink}. Something went wrong.`,
        type: 'danger',
        duration: 3000,
      });
    }
  } else if (props.localLink.length === 0 && !initSocket.value) {
    if (!effectiveReturnUI.value && props.noUIPreJoinOptions) {
      checkProceed({ returnUI: effectiveReturnUI.value, noUIPreJoinOptions: props.noUIPreJoinOptions });
    }
  }
});
</script>

<style scoped>
.ms-modern-prejoin__title-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.65rem, 2vh, var(--ms-modern-spacing-md));
}

.ms-modern-prejoin__logo {
  width: clamp(60px, 10vw, 80px);
  height: clamp(60px, 10vw, 80px);
  border-radius: 22px;
  box-shadow: 0 18px 40px rgba(2, 8, 23, 0.28);
}

.ms-modern-prejoin__title {
  margin: 0;
  max-width: 10ch;
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: clamp(2.05rem, 5vw, 3.2rem);
  line-height: 1;
  text-align: center;
  text-wrap: balance;
}

.ms-modern-prejoin__description {
  margin: 0;
  max-width: 28ch;
  color: var(--ms-modern-text-secondary);
  font-family: var(--ms-modern-font-family);
  font-size: var(--ms-modern-font-body);
  line-height: 1.6;
  text-align: center;
}

.ms-modern-prejoin__form {
  display: flex;
  flex-direction: column;
  gap: var(--ms-modern-spacing-md);
  min-width: 0;
}

.ms-modern-prejoin__error {
  margin: 0;
  color: #ff9cab;
  font-family: var(--ms-modern-font-family);
  font-size: var(--ms-modern-font-caption);
  line-height: 1.6;
}

.ms-modern-prejoin__divider {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px 0;
  color: var(--ms-modern-text-muted);
  font-family: var(--ms-modern-font-family);
  font-size: var(--ms-modern-font-caption);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.ms-modern-prejoin__divider::before,
.ms-modern-prejoin__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(148, 163, 184, 0.16);
}

.ms-modern-prejoin__divider::before {
  margin-right: 12px;
}

.ms-modern-prejoin__divider::after {
  margin-left: 12px;
}

@media (max-width: 640px), (max-height: 900px) {
  .ms-modern-prejoin__logo {
    width: clamp(52px, 12vw, 68px);
    height: clamp(52px, 12vw, 68px);
    border-radius: 18px;
  }

  .ms-modern-prejoin__title {
    max-width: 9ch;
    font-size: clamp(1.75rem, 6vw, 2.65rem);
  }

  .ms-modern-prejoin__description {
    max-width: 24ch;
    font-size: 0.92rem;
    line-height: 1.45;
  }

  .ms-modern-prejoin__form {
    gap: var(--ms-modern-spacing-sm);
  }
}
</style>