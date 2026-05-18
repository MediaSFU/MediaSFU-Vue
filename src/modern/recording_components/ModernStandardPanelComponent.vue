<template>
  <div class="ms-modern-recording-panel">
    <section class="ms-modern-recording-field">
      <label class="ms-modern-recording-field__label" for="recording-media-options">
        Media Options
      </label>
      <select
        id="recording-media-options"
        v-model="selectedRecordingMediaOptions"
        class="ms-modern-recording-field__select"
        :title="getOptionTitle(recordingMediaOptionItems, selectedRecordingMediaOptions)"
        @change="handleMediaOptionsChange"
      >
        <option
          v-for="item in recordingMediaOptionItems"
          :key="item.value"
          :value="item.value"
          :title="item.tooltip || item.label"
        >
          {{ item.label }}
        </option>
      </select>
    </section>

    <template v-if="eventType !== 'broadcast'">
      <section class="ms-modern-recording-field">
        <label class="ms-modern-recording-field__label" for="recording-audio-options">
          Specific Audios
        </label>
        <select
          id="recording-audio-options"
          v-model="selectedRecordingAudioOptions"
          class="ms-modern-recording-field__select"
          :title="getOptionTitle(recordingAudioOptionItems, selectedRecordingAudioOptions)"
          @change="handleAudioOptionsChange"
        >
          <option
            v-for="item in recordingAudioOptionItems"
            :key="item.value"
            :value="item.value"
            :title="item.tooltip || item.label"
          >
            {{ item.label }}
          </option>
        </select>
      </section>

      <section class="ms-modern-recording-field">
        <label class="ms-modern-recording-field__label" for="recording-video-options">
          Specific Videos
        </label>
        <select
          id="recording-video-options"
          v-model="selectedRecordingVideoOptions"
          class="ms-modern-recording-field__select"
          :title="getOptionTitle(recordingVideoOptionItems, selectedRecordingVideoOptions)"
          @change="handleVideoOptionsChange"
        >
          <option
            v-for="item in recordingVideoOptionItems"
            :key="item.value"
            :value="item.value"
            :title="item.tooltip || item.label"
          >
            {{ item.label }}
          </option>
        </select>
      </section>
    </template>

    <section class="ms-modern-recording-field">
      <label class="ms-modern-recording-field__label" for="recording-hls-option">
        Add HLS
      </label>
      <select
        id="recording-hls-option"
        v-model="selectedRecordingAddHLSString"
        class="ms-modern-recording-field__select"
        :title="getOptionTitle(recordingHlsOptionItems, selectedRecordingAddHLSString)"
        @change="handleAddHLSChange"
      >
        <option
          v-for="item in recordingHlsOptionItems"
          :key="item.value"
          :value="item.value"
          :title="item.tooltip || item.label"
        >
          {{ item.label }}
        </option>
      </select>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { StandardPanelParameters } from '../../components/recordingComponents/StandardPanelComponent.vue';

interface RecordingOptionItem {
  value: string;
  label: string;
  tooltip?: string;
}

const recordingMediaOptionItems: RecordingOptionItem[] = [
  { value: 'video', label: 'Record Video', tooltip: 'Capture audio and video' },
  { value: 'audio', label: 'Record Audio Only', tooltip: 'Capture audio only' },
];

const recordingAudioOptionItems: RecordingOptionItem[] = [
  { value: 'all', label: 'Add All', tooltip: 'Include all participant audio' },
  { value: 'onScreen', label: 'Add All On Screen', tooltip: 'Include only visible participant audio' },
  { value: 'host', label: 'Add Host Only', tooltip: 'Include only host audio' },
];

const recordingVideoOptionItems: RecordingOptionItem[] = [
  { value: 'all', label: 'Add All', tooltip: 'Include all participant video' },
  {
    value: 'mainScreen',
    label: 'Big Screen Only (includes screenshare)',
    tooltip: 'Record the main stage and screenshare content',
  },
];

const recordingHlsOptionItems: RecordingOptionItem[] = [
  { value: 'true', label: 'True', tooltip: 'Generate an HLS output' },
  { value: 'false', label: 'False', tooltip: 'Skip HLS output' },
];

const props = defineProps<{
  parameters: StandardPanelParameters;
}>();

const normalizeRecordingMediaOption = (value: string) => (value === 'all' ? 'video' : value);

const selectedRecordingMediaOptions = ref(normalizeRecordingMediaOption(props.parameters.recordingMediaOptions));
const selectedRecordingAudioOptions = ref(props.parameters.recordingAudioOptions);
const selectedRecordingVideoOptions = ref(props.parameters.recordingVideoOptions);
const selectedRecordingAddHLS = ref(props.parameters.recordingAddHLS);

const selectedRecordingAddHLSString = computed({
  get: () => selectedRecordingAddHLS.value.toString(),
  set: (value: string) => {
    selectedRecordingAddHLS.value = value === 'true';
  },
});

const eventType = computed(() => props.parameters.eventType);

watch(
  () => props.parameters.recordingMediaOptions,
  (value) => {
    selectedRecordingMediaOptions.value = normalizeRecordingMediaOption(value);
  },
);

watch(
  () => props.parameters.recordingAudioOptions,
  (value) => {
    selectedRecordingAudioOptions.value = value;
  },
);

watch(
  () => props.parameters.recordingVideoOptions,
  (value) => {
    selectedRecordingVideoOptions.value = value;
  },
);

watch(
  () => props.parameters.recordingAddHLS,
  (value) => {
    selectedRecordingAddHLS.value = value;
  },
);

const getOptionTitle = (items: RecordingOptionItem[], value: string) =>
  items.find((item) => item.value === value)?.tooltip ?? items.find((item) => item.value === value)?.label ?? '';

const handleMediaOptionsChange = () => {
  props.parameters.updateRecordingMediaOptions(selectedRecordingMediaOptions.value);
};

const handleAudioOptionsChange = () => {
  props.parameters.updateRecordingAudioOptions(selectedRecordingAudioOptions.value);
};

const handleVideoOptionsChange = () => {
  props.parameters.updateRecordingVideoOptions(selectedRecordingVideoOptions.value);
};

const handleAddHLSChange = () => {
  props.parameters.updateRecordingAddHLS(selectedRecordingAddHLS.value);
};
</script>

<style scoped>
.ms-modern-recording-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ms-modern-recording-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--ms-modern-field-background) 84%, transparent);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.ms-modern-recording-field__label {
  margin: 0;
  color: var(--ms-modern-text-secondary);
  font-family: var(--ms-modern-font-family);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.ms-modern-recording-field__select {
  width: 100%;
  min-height: 40px;
  padding: 10px 12px;
  border: 1px solid var(--ms-modern-field-border);
  border-radius: 12px;
  background: var(--ms-modern-field-background);
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: 0.9rem;
  outline: none;
  appearance: none;
  box-sizing: border-box;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.08);
}

.ms-modern-recording-field__select:focus {
  border-color: var(--ms-modern-field-border-focus);
  box-shadow: var(--ms-modern-shadow-focus);
}

.ms-modern-recording-field__select option {
  background: var(--ms-modern-panel-surface-elevated);
  color: var(--ms-modern-text-primary);
}
</style>