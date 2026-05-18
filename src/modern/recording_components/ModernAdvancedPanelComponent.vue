<template>
  <div class="ms-modern-recording-panel">
    <section class="ms-modern-recording-field">
      <label class="ms-modern-recording-field__label" for="recording-video-type">
        Video Type
      </label>
      <select
        id="recording-video-type"
        v-model="selectedRecordingVideoType"
        class="ms-modern-recording-field__select"
        :title="getOptionTitle(recordingVideoTypeItems, selectedRecordingVideoType)"
        @change="handleVideoTypeChange"
      >
        <option
          v-for="item in recordingVideoTypeItems"
          :key="item.value"
          :value="item.value"
          :title="item.tooltip || item.label"
        >
          {{ item.label }}
        </option>
      </select>
    </section>

    <section v-if="eventType !== 'broadcast'" class="ms-modern-recording-field">
      <label class="ms-modern-recording-field__label" for="recording-display-type">
        Display Type
      </label>
      <select
        id="recording-display-type"
        v-model="selectedRecordingDisplayType"
        class="ms-modern-recording-field__select"
        :title="getOptionTitle(recordingDisplayTypeItems, selectedRecordingDisplayType)"
        @change="handleDisplayTypeChange"
      >
        <option
          v-for="item in recordingDisplayTypeItems"
          :key="item.value"
          :value="item.value"
          :title="item.tooltip || item.label"
        >
          {{ item.label }}
        </option>
      </select>
    </section>

    <section class="ms-modern-recording-field">
      <label class="ms-modern-recording-field__label">
        Background Color
      </label>
      <div class="ms-modern-recording-field__color-preview" :style="{ backgroundColor: recordingBackgroundColor }">
        {{ recordingBackgroundColor }}
      </div>
      <div class="ms-modern-recording-field__color-row">
        <input
          type="color"
          class="ms-modern-recording-field__color-input"
          :value="recordingBackgroundColor"
          @input="handleColorChange('backgroundColor', ($event.target as HTMLInputElement).value)"
        >
      </div>
    </section>

    <section class="ms-modern-recording-field">
      <label class="ms-modern-recording-field__label" for="recording-add-text">
        Add Text
      </label>
      <select
        id="recording-add-text"
        v-model="recordingTextString"
        class="ms-modern-recording-field__select"
        :title="recordingText ? 'Disable custom overlay text' : 'Enable custom overlay text'"
        @change="handleTextChange"
      >
        <option value="true">
          True
        </option>
        <option value="false">
          False
        </option>
      </select>
    </section>

    <template v-if="recordingText">
      <section class="ms-modern-recording-field">
        <label class="ms-modern-recording-field__label" for="recording-custom-text">
          Custom Text
        </label>
        <input
          id="recording-custom-text"
          v-model="customText"
          class="ms-modern-recording-field__input"
          type="text"
          maxlength="40"
          @input="onChangeTextHandler"
        >
        <p class="ms-modern-recording-field__helper">
          Alphanumeric, max 40 chars
        </p>
      </section>

      <section class="ms-modern-recording-field">
        <label class="ms-modern-recording-field__label" for="recording-text-position">
          Text Position
        </label>
        <select
          id="recording-text-position"
          v-model="recordingPosition"
          class="ms-modern-recording-field__select"
          :title="getOptionTitle(recordingTextPositionItems, recordingPosition)"
          @change="handleTextPositionChange"
        >
          <option
            v-for="item in recordingTextPositionItems"
            :key="item.value"
            :value="item.value"
            :title="item.tooltip || item.label"
          >
            {{ item.label }}
          </option>
        </select>
      </section>

      <section class="ms-modern-recording-field">
        <label class="ms-modern-recording-field__label">
          Text Color
        </label>
        <div class="ms-modern-recording-field__color-preview" :style="{ backgroundColor: recordingCustomTextColor }">
          {{ recordingCustomTextColor }}
        </div>
        <div class="ms-modern-recording-field__color-row">
          <input
            type="color"
            class="ms-modern-recording-field__color-input"
            :value="recordingCustomTextColor"
            @input="handleColorChange('customTextColor', ($event.target as HTMLInputElement).value)"
          >
        </div>
      </section>
    </template>

    <section class="ms-modern-recording-field">
      <label class="ms-modern-recording-field__label" for="recording-name-tags">
        Name Tags
      </label>
      <select
        id="recording-name-tags"
        v-model="selectedRecordingNameTagsString"
        class="ms-modern-recording-field__select"
        :title="getOptionTitle(recordingNameTagToggleItems, selectedRecordingNameTagsString)"
        @change="handleNameTagsChange"
      >
        <option
          v-for="item in recordingNameTagToggleItems"
          :key="item.value"
          :value="item.value"
          :title="item.tooltip || item.label"
        >
          {{ item.label }}
        </option>
      </select>
    </section>

    <section class="ms-modern-recording-field">
      <label class="ms-modern-recording-field__label">
        Name Tags Color
      </label>
      <div class="ms-modern-recording-field__color-preview" :style="{ backgroundColor: recordingNameTagsColor }">
        {{ recordingNameTagsColor }}
      </div>
      <div class="ms-modern-recording-field__color-row">
        <input
          type="color"
          class="ms-modern-recording-field__color-input"
          :value="recordingNameTagsColor"
          @input="handleColorChange('nameTagsColor', ($event.target as HTMLInputElement).value)"
        >
      </div>
    </section>

    <section class="ms-modern-recording-field">
      <label class="ms-modern-recording-field__label" for="recording-orientation">
        Orientation
      </label>
      <select
        id="recording-orientation"
        v-model="selectedOrientationVideo"
        class="ms-modern-recording-field__select"
        :title="getOptionTitle(recordingOrientationItems, selectedOrientationVideo)"
        @change="handleOrientationChange"
      >
        <option
          v-for="item in recordingOrientationItems"
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
import type { AdvancedPanelParameters } from '../../components/recordingComponents/AdvancedPanelComponent.vue';

interface AdvancedOptionItem {
  value: string;
  label: string;
  tooltip?: string;
}

const recordingVideoTypeItems: AdvancedOptionItem[] = [
  { value: 'fullDisplay', label: 'Full Display (no background)', tooltip: 'Use the full incoming display' },
  { value: 'bestDisplay', label: 'Full Video', tooltip: 'Optimized full video feed' },
  { value: 'all', label: 'All', tooltip: 'Mix all displays' },
];

const recordingDisplayTypeItems: AdvancedOptionItem[] = [
  { value: 'video', label: 'Only Video Participants', tooltip: 'Include participants with video' },
  { value: 'media', label: 'Participants with media', tooltip: 'Include participants with media' },
  { value: 'all', label: 'All Participants', tooltip: 'Include everyone' },
];

const recordingTextPositionItems: AdvancedOptionItem[] = [
  { value: 'top', label: 'Top', tooltip: 'Place custom text at the top' },
  { value: 'middle', label: 'Middle', tooltip: 'Place custom text in the middle' },
  { value: 'bottom', label: 'Bottom', tooltip: 'Place custom text at the bottom' },
];

const recordingNameTagToggleItems: AdvancedOptionItem[] = [
  { value: 'true', label: 'Show', tooltip: 'Display name tags' },
  { value: 'false', label: 'Hide', tooltip: 'Hide name tags' },
];

const recordingOrientationItems: AdvancedOptionItem[] = [
  { value: 'landscape', label: 'Landscape', tooltip: 'Horizontal orientation' },
  { value: 'portrait', label: 'Portrait', tooltip: 'Vertical orientation' },
  { value: 'all', label: 'All', tooltip: 'Choose orientation automatically' },
];

const props = defineProps<{
  parameters: AdvancedPanelParameters;
}>();

const selectedOrientationVideo = ref(props.parameters.recordingOrientationVideo);
const selectedRecordingNameTags = ref(props.parameters.recordingNameTags);
const selectedRecordingVideoType = ref(props.parameters.recordingVideoType);
const selectedRecordingDisplayType = ref(props.parameters.recordingDisplayType);
const recordingText = ref(props.parameters.recordingAddText);
const customText = ref(props.parameters.recordingCustomText);
const recordingPosition = ref(props.parameters.recordingCustomTextPosition);

const recordingTextString = computed({
  get: () => recordingText.value.toString(),
  set: (value: string) => {
    recordingText.value = value === 'true';
  },
});

const selectedRecordingNameTagsString = computed({
  get: () => selectedRecordingNameTags.value.toString(),
  set: (value: string) => {
    selectedRecordingNameTags.value = value === 'true';
  },
});

const eventType = computed(() => props.parameters.eventType);
const recordingBackgroundColor = computed(() => props.parameters.recordingBackgroundColor);
const recordingNameTagsColor = computed(() => props.parameters.recordingNameTagsColor);
const recordingCustomTextColor = computed(() => props.parameters.recordingCustomTextColor);

watch(
  () => props.parameters.recordingVideoType,
  (value) => {
    selectedRecordingVideoType.value = value;
  },
);

watch(
  () => props.parameters.recordingDisplayType,
  (value) => {
    selectedRecordingDisplayType.value = value;
  },
);

watch(
  () => props.parameters.recordingOrientationVideo,
  (value) => {
    selectedOrientationVideo.value = value;
  },
);

watch(
  () => props.parameters.recordingNameTags,
  (value) => {
    selectedRecordingNameTags.value = value;
  },
);

watch(
  () => props.parameters.recordingAddText,
  (value) => {
    recordingText.value = value;
  },
);

watch(
  () => props.parameters.recordingCustomText,
  (value) => {
    customText.value = value;
  },
);

watch(
  () => props.parameters.recordingCustomTextPosition,
  (value) => {
    recordingPosition.value = value;
  },
);

const validateTextInput = (input: string): boolean => {
  const regex = /^[a-zA-Z0-9\s]{1,40}$/;
  return regex.test(input);
};

const getOptionTitle = (items: AdvancedOptionItem[], value: string) =>
  items.find((item) => item.value === value)?.tooltip ?? items.find((item) => item.value === value)?.label ?? '';

const handleTextChange = () => {
  props.parameters.updateRecordingAddText(recordingText.value);
};

const onChangeTextHandler = () => {
  const text = customText.value;
  if (text.length === 0 || validateTextInput(text)) {
    props.parameters.updateRecordingCustomText(text);
  } else {
    customText.value = props.parameters.recordingCustomText;
  }
};

const handleColorChange = (selectedColor: string, color: string) => {
  switch (selectedColor) {
    case 'backgroundColor':
      props.parameters.updateRecordingBackgroundColor(color);
      break;
    case 'customTextColor':
      props.parameters.updateRecordingCustomTextColor(color);
      break;
    case 'nameTagsColor':
      props.parameters.updateRecordingNameTagsColor(color);
      break;
    default:
      break;
  }
};

const handleVideoTypeChange = () => {
  props.parameters.updateRecordingVideoType(selectedRecordingVideoType.value);
};

const handleDisplayTypeChange = () => {
  props.parameters.updateRecordingDisplayType(selectedRecordingDisplayType.value);
};

const handleTextPositionChange = () => {
  props.parameters.updateRecordingCustomTextPosition(recordingPosition.value);
};

const handleNameTagsChange = () => {
  props.parameters.updateRecordingNameTags(selectedRecordingNameTags.value);
};

const handleOrientationChange = () => {
  props.parameters.updateRecordingOrientationVideo(selectedOrientationVideo.value);
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

.ms-modern-recording-field__select,
.ms-modern-recording-field__input {
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

.ms-modern-recording-field__select:focus,
.ms-modern-recording-field__input:focus {
  border-color: var(--ms-modern-field-border-focus);
  box-shadow: var(--ms-modern-shadow-focus);
}

.ms-modern-recording-field__select option {
  background: var(--ms-modern-panel-surface-elevated);
  color: var(--ms-modern-text-primary);
}

.ms-modern-recording-field__helper {
  margin: 0;
  color: var(--ms-modern-text-tertiary, var(--ms-modern-text-secondary));
  font-family: var(--ms-modern-font-family);
  font-size: 0.72rem;
}

.ms-modern-recording-field__color-preview {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 6px 10px;
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 10px;
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: 0.82rem;
  font-weight: 600;
}

.ms-modern-recording-field__color-row {
  display: flex;
  align-items: center;
}

.ms-modern-recording-field__color-input {
  width: 48px;
  height: 30px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
}
</style>