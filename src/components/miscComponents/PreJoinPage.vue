<!--
/**
 * @fileoverview PreJoinPage Component - Room creation and join interface
 * @component PreJoinPage
 * @module components/miscComponents/PreJoinPage
 * 
 * @description
 * The pre-join page allows users to either create a new MediaSFU room or join an existing one.
 * It provides a form-based interface with toggle between create and join modes, handles
 * socket connection setup, and manages the initial connection flow.
 * 
 * Features:
 * - Create new rooms with configurable event type, duration, and capacity
 * - Join existing rooms with display name and event ID
 * - Toggle between create and join modes
 * - Automatic MediaSFU API integration with credentials
 * - Local server connection support for development
 * - Error handling and validation
 * - Fully customizable via `uiOverrides.preJoinPage`
 * 
 * @example Basic Usage (Join Mode)
 * // <PreJoinPage
 *   // :parameters="parameters"
 *   // :credentials="{ apiUserName: 'user123', apiKey: 'key456' }"
 *   // connectMediaSFU
 * // />
 * 
 * @example Create Mode with Local Server
 * // <PreJoinPage
 *   // :parameters="parameters"
 *   // localLink="http://localhost:3000"
 *   // :connectMediaSFU="false"
 * // />
 * 
 * @example No-UI Mode (Programmatic Join)
 * // <PreJoinPage
 *   // :parameters="parameters"
 *   // :returnUI="false"
 *   // :noUIPreJoinOptions="{
 *     action: 'join',
 *     userName: 'John Doe',
 *     meetingID: 'room123'
 *   }"
 *   // :credentials="credentials"
 * // />
 * 
 * @example Complete Replacement via UI Overrides
 * const uiOverrides = computed(() => ({
 *   // preJoinPage: {
 *     component: CustomPreJoinPage
 *   }
 * }));
 */
-->
<template>
  <div :style="styles.container">
    <div :style="styles.logoContainer">
      <img
        :src="parameters.imgSrc || 'https://mediasfu.com/images/logo192.png'"
        :style="styles.logoImage"
        alt="Logo"
      />
    </div>
    <div :style="styles.inputContainer">
      <template v-if="isCreateMode">
        <input
          v-model="name"
          type="text"
          placeholder="Display Name"
          :style="styles.inputField"
        />
        <input
          v-model="duration"
          type="text"
          placeholder="Duration (minutes)"
          :style="styles.inputField"
        />
        <select
          v-model="eventType"
          :style="styles.selectField"
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
        </select>
        <input
          v-model="capacity"
          type="text"
          placeholder="Room Capacity"
          :style="styles.inputField"
        />
        <button
          :style="styles.actionButton"
          @click="onCreateRoom"
        >
          Create Room
        </button>
      </template>
      <template v-else>
        <input
          v-model="name"
          type="text"
          placeholder="Display Name"
          :style="styles.inputField"
        />
        <input
          v-model="eventID"
          type="text"
          placeholder="Event ID"
          :style="styles.inputField"
        />
        <button
          :style="styles.actionButton"
          @click="onJoinRoom"
        >
          Join Room
        </button>
      </template>
      <p
        v-if="error"
        :style="styles.error"
      >
        {{ error }}
      </p>
    </div>
    <div :style="styles.orContainer">
      <span :style="styles.orText">OR</span>
    </div>
    <div :style="styles.toggleContainer">
      <button
        :style="styles.toggleButton"
        @click="handleToggleMode"
      >
        {{ isCreateMode ? 'Switch to Join Mode' : 'Switch to Create Mode' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, markRaw, type CSSProperties } from 'vue';
import type { MediaSFUSocket } from '../../types/socket';
import { handleCreateRoom } from 'mediasfu-shared';
import { handleJoinRoom } from 'mediasfu-shared';
import { createRoomOnMediaSFU } from '@legacy/methods/utils/createRoomOnMediaSFU';
import {
  joinRoomOnMediaSFU,
  type CreateRoomOnMediaSFUType,
  type JoinRoomOnMediaSFUType,
} from '@legacy/methods/utils/joinRoomOnMediaSFU';
import type {
  ResponseLocalConnection,
  ResponseLocalConnectionData,
  CreateMediaSFURoomOptions,
  JoinMediaSFURoomOptions,
  PreJoinPageParameters,
  Credentials,
} from '../../../../SharedTypes';

/**
 * Props for the PreJoinPage component
 * @interface PreJoinPageProps
 */
export interface PreJoinPageProps {
  /**
   * Local server URL for development/self-hosted deployments
   * @default ""
   * @example "http://localhost:3000"
   */
  localLink?: string;
  
  /**
   * Whether to connect to MediaSFU cloud service
   * Set to false for local-only deployments
   * @default true
   */
  connectMediaSFU?: boolean;
  
  /**
   * MediaSFU parameters object containing room state and callbacks
   */
  parameters: PreJoinPageParameters;
  
  /**
   * API credentials for MediaSFU cloud service
   * Required when connectMediaSFU is true
   * @default { apiUserName: 'yourAPIUSERNAME', apiKey: 'yourAPIKEY' }
   * @example { apiUserName: 'user123', apiKey: 'sk_1234567890abcdef' }
   */
  credentials?: Credentials;
  
  /**
   * Whether to render the UI or use programmatic mode
   * When false, uses noUIPreJoinOptions for automatic join/create
   * @default false
   */
  returnUI?: boolean;
  
  /**
   * Configuration for programmatic (no-UI) join/create mode
   * Used when returnUI is false
   * @example { action: 'join', userName: 'John Doe', meetingID: 'room123' }
   * @example { action: 'create', userName: 'Host', duration: 30, eventType: 'conference', capacity: 100 }
   */
  noUIPreJoinOptions?: CreateMediaSFURoomOptions | JoinMediaSFURoomOptions;
  
  /**
   * Custom function for creating a room on MediaSFU
   * @default createRoomOnMediaSFU
   */
  createMediaSFURoom?: CreateRoomOnMediaSFUType;
  
  /**
   * Custom function for joining a room on MediaSFU
   * @default joinRoomOnMediaSFU
   */
  joinMediaSFURoom?: JoinRoomOnMediaSFUType;
}

const props = withDefaults(defineProps<PreJoinPageProps>(), {
  localLink: '',
  connectMediaSFU: true,
  credentials: () => ({ apiUserName: 'yourAPIUSERNAME', apiKey: 'yourAPIKEY' }),
  returnUI: false,
  noUIPreJoinOptions: undefined,
  createMediaSFURoom: () => createRoomOnMediaSFU,
  joinMediaSFURoom: () => joinRoomOnMediaSFU,
});

const isCreateMode = ref(false);
const name = ref('');
const duration = ref('');
const eventType = ref('');
const capacity = ref('');
const eventID = ref('');
const error = ref('');
const pending = ref(false);

const localConnected = ref(false);
const localData = ref<ResponseLocalConnectionData | undefined>(undefined);
const initSocket = ref<MediaSFUSocket | undefined>(undefined);

const handleToggleMode = () => {
  isCreateMode.value = !isCreateMode.value;
  error.value = '';
};

const onCreateRoom = async () => {
  if (pending.value) {
    return;
  }
  pending.value = true;

  let payload = {} as CreateMediaSFURoomOptions;

  if (props.returnUI) {
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

  try {
    await handleCreateRoom({
      payload,
      localLink: props.localLink,
      connectMediaSFU: props.connectMediaSFU,
      apiUserName: props.credentials?.apiUserName || '',
      apiKey: props.credentials?.apiKey || '',
      parameters: props.parameters,
      initSocket: initSocket.value as unknown as MediaSFUSocket | undefined,
      localData: localData.value,
      createMediaSFURoom: props.createMediaSFURoom!,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to create room.';
    error.value = message;
  } finally {
    pending.value = false;
    props.parameters.updateIsLoadingModalVisible?.(false);
  }
};

const onJoinRoom = async () => {
  if (pending.value) {
    return;
  }
  pending.value = true;

  let payload = {} as JoinMediaSFURoomOptions;

  if (props.returnUI) {
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

  try {
    await handleJoinRoom({
      payload,
      localLink: props.localLink,
      apiUserName: props.credentials?.apiUserName || '',
      apiKey: props.credentials?.apiKey || '',
      parameters: props.parameters,
      initSocket: initSocket.value as unknown as MediaSFUSocket | undefined,
      localData: localData.value,
      joinMediaSFURoom: props.joinMediaSFURoom!,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to join room.';
    error.value = message;
  } finally {
    pending.value = false;
    props.parameters.updateIsLoadingModalVisible?.(false);
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
      const createOptions: CreateMediaSFURoomOptions = noUIPreJoinOptions as CreateMediaSFURoomOptions;
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
      const joinOptions: JoinMediaSFURoomOptions = noUIPreJoinOptions as JoinMediaSFURoomOptions;
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

          if (!props.returnUI && props.noUIPreJoinOptions) {
            checkProceed({ returnUI: props.returnUI, noUIPreJoinOptions: props.noUIPreJoinOptions });
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
    if (!props.returnUI && props.noUIPreJoinOptions) {
      checkProceed({ returnUI: props.returnUI, noUIPreJoinOptions: props.noUIPreJoinOptions });
    }
  }
});

const styles = computed<{ [key: string]: CSSProperties }>(() => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#53C6E0',
    overflow: 'auto',
    boxSizing: 'border-box',
  },
  inputContainer: {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputField: {
    height: '30px',
    borderColor: 'gray',
    borderWidth: '1px',
    marginBottom: '10px',
    padding: '0 5px',
    borderRadius: '5px',
  },
  selectField: {
    height: '30px',
    borderColor: 'gray',
    borderWidth: '1px',
    marginBottom: '10px',
    padding: '0 5px',
    borderRadius: '5px',
  },
  actionButton: {
    backgroundColor: 'black',
    color: 'white',
    padding: '5px 20px',
    borderRadius: '5px',
    marginBottom: '10px',
    marginTop: '10px',
  },
  toggleContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButton: {
    backgroundColor: 'black',
    color: 'white',
    padding: '5px 20px',
    borderRadius: '5px',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
  },
  logoContainer: {
    marginTop: '30px',
    paddingTop: '10px',
    marginBottom: '10px',
  },
  logoImage: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
  },
  orContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '10px 0',
  },
  orText: {
    color: 'black',
    fontSize: 'medium',
    fontWeight: 'bold',
  },
}));
</script>

<script lang="ts">
export default {
  name: 'PreJoinPage'
}
</script>

<style scoped>
/* Component-specific styles */
</style>
