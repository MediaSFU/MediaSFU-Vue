<template>
  <div class="test-playground">
    <!-- Control Panel -->
    <div class="control-panel">
      <h2>🎮 MediaSFU Vue Test Playground</h2>
      
      <div class="section">
        <h3>Connection Mode</h3>
        <select
          v-model="connectionMode"
          class="select"
        >
          <option value="cloud">
            ☁️ Cloud
          </option>
          <option value="hybrid">
            🔄 Hybrid
          </option>
          <option value="ce">
            🏠 CE
          </option>
        </select>
      </div>

      <div class="section">
        <h3>Experience Type</h3>
        <select
          v-model="experienceType"
          class="select"
        >
          <option value="generic">
            Generic
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
          <option value="chat">
            Chat
          </option>
        </select>
      </div>

      <div class="section">
        <h3>UI Customization</h3>
        <label class="checkbox-label">
          <input
            v-model="useCustomComponents"
            type="checkbox"
          >
          Custom Components
        </label>
        <label class="checkbox-label">
          <input
            v-model="useCustomFunctions"
            type="checkbox"
          >
          Custom Functions
        </label>
        <label class="checkbox-label">
          <input
            v-model="useFullCustomUI"
            type="checkbox"
          >
          Full Custom UI
        </label>
      </div>

      <div
        v-if="connectionMode === 'cloud'"
        class="section"
      >
        <h3>Credentials</h3>
        <input
          v-model="apiUserName"
          type="text"
          placeholder="API Username"
          class="input"
        >
        <input
          v-model="apiKey"
          type="password"
          placeholder="API Key"
          class="input"
        >
      </div>

      <div class="section">
        <h3>User Info</h3>
        <input
          v-model="userName"
          type="text"
          placeholder="Your Name"
          class="input"
        >
        <input
          v-model="roomName"
          type="text"
          placeholder="Room Name"
          class="input"
        >
      </div>

      <div class="status">
        <strong>Status:</strong>
        <div>Mode: {{ connectionMode }}</div>
        <div>Type: {{ experienceType }}</div>
        <div>Custom UI: {{ useFullCustomUI ? 'Yes' : 'No' }}</div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="main-area">
      <component
        :is="currentComponent"
        v-bind="componentProps"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue';
import type { Component } from 'vue';
import MediasfuGeneric from '../components/mediasfuComponents/MediasfuGeneric.vue';
import MediasfuBroadcast from '../components/mediasfuComponents/MediasfuBroadcast.vue';
import MediasfuWebinar from '../components/mediasfuComponents/MediasfuWebinar.vue';
import MediasfuConference from '../components/mediasfuComponents/MediasfuConference.vue';
import MediasfuChat from '../components/mediasfuComponents/MediasfuChat.vue';
import VideoCard from '../components/displayComponents/VideoCard.vue';
import AudioCard from '../components/displayComponents/AudioCard.vue';
import MiniCard from '../components/displayComponents/MiniCard.vue';
import type { MediasfuUICustomOverrides } from '../types/ui-overrides';

// State
const connectionMode = ref<'cloud' | 'hybrid' | 'ce'>('cloud');
const experienceType = ref<'generic' | 'broadcast' | 'webinar' | 'conference' | 'chat'>('generic');
const useCustomComponents = ref(false);
const useCustomFunctions = ref(false);
const useFullCustomUI = ref(false);
const apiUserName = ref('');
const apiKey = ref('');
const userName = ref('Test User');
const roomName = ref('');

// Custom Components
type StyleRecord = Record<string, unknown>;
type CardComponentProps = StyleRecord & { customStyle?: StyleRecord; barColor?: string };
type MiniCardComponentProps = StyleRecord & { customStyle?: StyleRecord };
type WorkspaceProps = { parameters?: Record<string, unknown> };

const CustomVideoCard: Component = (rawProps: CardComponentProps) => {
  const { customStyle, ...rest } = rawProps;
  return h(VideoCard as Component, {
    ...rest,
    customStyle: {
      ...(customStyle ?? {}),
      borderRadius: '20px',
      border: '3px solid #667eea',
      boxShadow: '0 8px 16px rgba(102, 126, 234, 0.35)',
    },
  } as StyleRecord);
};

const CustomAudioCard: Component = (rawProps: CardComponentProps) => {
  const { customStyle, barColor, ...rest } = rawProps;
  return h(AudioCard as Component, {
    ...rest,
    barColor: barColor ?? '#22c55e',
    customStyle: {
      ...(customStyle ?? {}),
      borderRadius: '16px',
      border: '2px solid #22c55e',
    },
  } as StyleRecord);
};

const CustomMiniCard: Component = (rawProps: MiniCardComponentProps) => {
  const { customStyle, ...rest } = rawProps;
  return h('div', {
    style: {
      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      borderRadius: '12px',
      padding: '4px',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }, [
    h(MiniCard as Component, {
      ...rest,
      customStyle: {
        ...(customStyle ?? {}),
        borderRadius: '10px',
        background: '#fef3c7',
        color: '#7c2d12',
      },
    } as StyleRecord),
  ]);
};

const CustomWorkspace: Component = (props: WorkspaceProps) => {
  const parameters = (props.parameters ?? {}) as Record<string, unknown>;
  const showAlert = parameters.showAlert as ((options: { message: string; type: string }) => void) | undefined;

  return h('div', {
    style: {
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'system-ui, sans-serif',
    },
  }, [
    h('div', {
      style: {
        background: 'white',
        color: '#1e293b',
        padding: '48px',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        maxWidth: '500px',
        textAlign: 'center',
      },
    }, [
      h('h1', { style: { marginBottom: '16px', fontSize: '2rem' } }, '🎨 Custom Workspace'),
      h('p', { style: { color: '#64748b', marginBottom: '24px' } }, 'Full UI replacement with Vue components'),
      h('div', {
        style: {
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '16px',
        },
      }, [
        h('strong', 'Room: '),
        h('span', String(parameters?.roomName || 'Not connected')),
      ]),
      h('button', {
        onClick: () => showAlert?.({ message: 'Hello from custom UI! 🚀', type: 'success' }),
        style: {
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
        },
      }, '🎬 Test Alert'),
    ]),
  ]);
};

// UI Overrides
const uiOverrides = computed<MediasfuUICustomOverrides | undefined>(() => {
  if (!useCustomComponents.value && !useCustomFunctions.value) {
    return undefined;
  }

  const overrides: MediasfuUICustomOverrides = {};

  if (useCustomComponents.value) {
    overrides.videoCard = { component: CustomVideoCard };
    overrides.audioCard = { component: CustomAudioCard };
    overrides.miniCard = { component: CustomMiniCard };
  }

  if (useCustomFunctions.value) {
    overrides.consumerResume = {
      wrap: (defaultImplementation) => async (options) => {
        console.log('🎬 Custom consumerResume', {
          remoteProducerId: options.remoteProducerId,
          eventType: options.parameters.eventType,
        });
        await defaultImplementation(options);
      },
    };
  }

  return Object.keys(overrides).length > 0 ? overrides : undefined;
});

// Component Selection
const currentComponent = computed(() => {
  const components = {
    generic: MediasfuGeneric,
    broadcast: MediasfuBroadcast,
    webinar: MediasfuWebinar,
    conference: MediasfuConference,
    chat: MediasfuChat,
  };
  return components[experienceType.value];
});

// Component Props
const seedData = computed(() => {
  if (connectionMode.value !== 'hybrid') {
    return undefined;
  }

  const baseSeed: Record<string, unknown> = {
    member: userName.value,
    host: userName.value,
  };

  if (experienceType.value !== 'generic') {
    baseSeed.eventType = experienceType.value;
  }

  return baseSeed;
});

const componentProps = computed(() => {
  const baseProps = {
    uiOverrides: uiOverrides.value,
    PrejoinPage: useFullCustomUI.value ? CustomWorkspace : undefined,
    credentials: connectionMode.value === 'cloud' ? {
      apiUserName: apiUserName.value,
      apiKey: apiKey.value,
    } : undefined,
    useLocalUIMode: connectionMode.value === 'ce',
    useSeed: connectionMode.value === 'hybrid',
    seedData: seedData.value,
  };

  return baseProps;
});
</script>

<style scoped>
.test-playground {
  display: flex;
  height: 100vh;
  font-family: system-ui, -apple-system, sans-serif;
}

.control-panel {
  width: 300px;
  background: #1e293b;
  color: white;
  padding: 20px;
  overflow-y: auto;
}

.control-panel h2 {
  font-size: 1.25rem;
  margin: 0 0 24px 0;
  color: #a78bfa;
}

.control-panel h3 {
  font-size: 0.875rem;
  margin: 0 0 8px 0;
  color: #cbd5e1;
  font-weight: 600;
}

.section {
  margin-bottom: 24px;
}

.select,
.input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #475569;
  background: #334155;
  color: white;
  font-size: 0.875rem;
  margin-bottom: 8px;
}

.select:focus,
.input:focus {
  outline: none;
  border-color: #a78bfa;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #334155;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  margin-bottom: 8px;
}

.checkbox-label:hover {
  background: #475569;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.status {
  background: #334155;
  padding: 16px;
  border-radius: 8px;
  font-size: 0.875rem;
}

.status strong {
  color: #a78bfa;
  display: block;
  margin-bottom: 8px;
}

.status div {
  margin-bottom: 4px;
  color: #cbd5e1;
}

.main-area {
  flex: 1;
  overflow: hidden;
  background: #0f172a;
}
</style>
