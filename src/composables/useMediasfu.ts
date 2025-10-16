import { computed, onMounted, ref, watch } from 'vue';
import type {
  CreateMediaSFURoomOptions,
  JoinMediaSFURoomOptions,
  Participant,
  ShowAlert,
} from 'mediasfu-shared';
import type { MediasfuGenericProps, MediaAlert, MediaSessionApi, MediaSessionState } from '../types/mediasfu';
import type { BackgroundModalParameters } from '../types/background';
import type { MenuModalParameters } from '../types/menu';
import type { ComputedRef, Ref } from 'vue';
import { useBackgroundModal } from './useBackgroundModal';
import { useMenuModal } from './useMenuModal';

const DEFAULT_NAMES = [
  'Alice',
  'Bob',
  'Charlie',
  'Daisy',
  'Ethan',
  'Fiona',
  'Grace',
  'Henry',
  'Isla',
  'Jack',
];

interface UseMediasfuResult {
  state: Ref<MediaSessionState>;
  alerts: Ref<MediaAlert[]>;
  showAlert: ShowAlert;
  startSession: MediaSessionApi['startSession'];
  endSession: MediaSessionApi['endSession'];
  customParameters: ComputedRef<Record<string, unknown>>;
  isBackgroundModalVisible: Ref<boolean>;
  backgroundModalParameters: ComputedRef<Partial<BackgroundModalParameters>>;
  toggleBackgroundModal: (next?: Partial<BackgroundModalParameters>) => void;
  closeBackgroundModal: () => void;
  isMenuModalVisible: Ref<boolean>;
  toggleMenuModal: () => void;
  closeMenuModal: () => void;
  menuModalParameters: ComputedRef<MenuModalParameters>;
}

function buildParticipants(host: string, seed?: Participant[]): Participant[] {
  if (seed && seed.length > 0) {
    return seed.map((participant, index) => ({
      ...participant,
      audioID: participant.audioID ?? `audio-${index}`,
      videoID: participant.videoID ?? `video-${index}`,
      id: participant.id ?? `${index}`,
    }));
  }

  const shuffled: string[] = [...DEFAULT_NAMES];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = current;
  }

  const participants: Participant[] = [];
  const uniqueNames = new Set<string>();
  let hasHostLevel = false;

  for (let i = 0; i < shuffled.length; i++) {
    const name = (i === 0 ? host : shuffled[i]) ?? host;
    if (uniqueNames.has(name)) {
      continue;
    }
    uniqueNames.add(name);

    const isHost = !hasHostLevel;
    if (isHost) {
      hasHostLevel = true;
    }

    participants.push({
      id: `${i}`,
      name,
      audioID: `audio-${i}`,
      videoID: `video-${i}`,
      muted: Math.random() < 0.3,
      islevel: isHost ? '2' : '1',
      isHost,
    });
  }

  return participants;
}

export function useMediasfu(props: MediasfuGenericProps): UseMediasfuResult {
  const state = ref<MediaSessionState>({
    isSessionActive: false,
    isLoading: false,
    participants: [],
    roomName: 'MediaSFU Room',
    hostName: '',
  });

  const alerts = ref<MediaAlert[]>([]);
  let alertId = 0;

  const showAlert: ShowAlert = ({ message, type, duration = 4 }) => {
    alertId += 1;
    const id = alertId;
    alerts.value.push({ id, message, type });

    setTimeout(() => {
      alerts.value = alerts.value.filter((alert) => alert.id !== id);
    }, duration * 1000);
  };

  const updateExternalState = () => {
    if (!props.updateSourceParameters) {
      return;
    }

    props.updateSourceParameters({
      ...props.sourceParameters,
      participants: state.value.participants,
      roomName: state.value.roomName,
      hostName: state.value.hostName,
      islevel: state.value.participants.find((p) => p.isHost)?.islevel ?? '1',
      showAlert,
    });
  };

  const {
    isBackgroundModalVisible,
    backgroundModalParameters,
    toggleBackgroundModal,
    closeBackgroundModal,
  } = useBackgroundModal({
    showAlert,
  });

  const {
    isMenuModalVisible,
    toggleMenuModal,
    closeMenuModal,
  } = useMenuModal();

  const menuModalParameters = computed<MenuModalParameters>(() => ({
    roomName: state.value.roomName,
    adminPasscode: props.credentials?.apiKey ?? '0000',
    islevel: state.value.participants.find((participant) => participant.isHost)?.islevel ?? '1',
    eventType: props.noUIPreJoinOptions && 'eventType' in props.noUIPreJoinOptions
      ? props.noUIPreJoinOptions.eventType ?? 'conference'
      : 'conference',
    localLink: props.localLink ?? (typeof window !== 'undefined' ? window.location.href : ''),
    position: 'bottomRight',
    shareButtons: true,
    customButtons: [],
    backgroundColor: '#83c0e9',
  }));

  const startSession = async (options: CreateMediaSFURoomOptions | JoinMediaSFURoomOptions) => {
    state.value.isLoading = true;
    try {
      const hostName = options.userName;
      state.value.hostName = hostName;
      state.value.roomName = options.action === 'create'
        ? `${hostName}'s Room`
        : (options as JoinMediaSFURoomOptions).meetingID ?? 'MediaSFU Room';
      state.value.participants = buildParticipants(hostName, props.seedData);
      state.value.isSessionActive = true;
      showAlert({ message: `Connected to ${state.value.roomName}`, type: 'success' });
      updateExternalState();
    } finally {
      state.value.isLoading = false;
    }
  };

  const endSession = () => {
    state.value.isSessionActive = false;
    state.value.participants = [];
    showAlert({ message: 'Disconnected from session.', type: 'danger' });
    updateExternalState();
  };

  const customParameters = computed(() => ({
    participants: state.value.participants,
    roomName: state.value.roomName,
    islevel: state.value.participants.find((participant) => participant.isHost)?.islevel ?? '1',
    showAlert,
    alerts: alerts.value,
    mediaSFUFunctions: {
      endSession,
      showAlert,
      launchBackground: toggleBackgroundModal,
      closeBackground: closeBackgroundModal,
      launchMenu: toggleMenuModal,
      closeMenu: closeMenuModal,
    },
    menuModalDefaults: menuModalParameters.value,
  }));

  watch(
    () => props.sourceParameters,
    (next) => {
      if (!next || state.value.isSessionActive) {
        return;
      }
      // Type assertion for sourceParameters since it's Record<string, unknown>
      if ('participants' in next && Array.isArray(next.participants)) {
        state.value.participants = next.participants as Participant[];
      }
      if ('roomName' in next && typeof next.roomName === 'string') {
        state.value.roomName = next.roomName;
      }
    },
    { deep: true }
  );

  onMounted(() => {
    if (!props.returnUI && props.noUIPreJoinOptions) {
      void startSession(props.noUIPreJoinOptions);
    }
  });

  return {
    state,
    alerts,
    showAlert,
    startSession,
    endSession,
    customParameters,
    isBackgroundModalVisible,
    backgroundModalParameters: backgroundModalParameters as ComputedRef<Partial<BackgroundModalParameters>>,
    toggleBackgroundModal,
    closeBackgroundModal,
    isMenuModalVisible,
    toggleMenuModal,
    closeMenuModal,
    menuModalParameters,
  };
}
