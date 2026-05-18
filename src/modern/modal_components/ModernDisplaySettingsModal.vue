<template>
  <div
    v-if="isEmbeddedMode || props.isDisplaySettingsModalVisible"
    class="ms-modern-display-settings-overlay"
    :class="{ 'ms-modern-display-settings-overlay--embedded': isEmbeddedMode }"
    @click="handleOverlayClick"
  >
    <div
      class="ms-modern-display-settings"
      :class="{ 'ms-modern-display-settings--embedded': isEmbeddedMode }"
      :style="[modalPositionStyle, { '--ms-local-accent': accentColor }]"
      @click.stop
    >
      <div class="ms-modern-display-settings__header">
        <div class="ms-modern-display-settings__title-row">
          <span class="ms-modern-display-settings__title-icon">
            <FontAwesomeIcon :icon="faDisplay" />
          </span>
          <div>
            <h2 class="ms-modern-display-settings__title">
              Display Settings
            </h2>
            <p class="ms-modern-display-settings__subtitle">
              Tune the layout and participant focus.
            </p>
          </div>
        </div>
        <button
          type="button"
          class="ms-modern-display-settings__close"
          aria-label="Close display settings"
          @click="props.onDisplaySettingsClose"
        >
          &times;
        </button>
      </div>

      <div class="ms-modern-display-settings__content">
        <section class="ms-modern-display-settings__section">
          <label class="ms-modern-display-settings__section-label">Display Type</label>
          <div class="ms-modern-display-settings__option-grid">
            <button
              v-for="option in displayOptions"
              :key="option.value"
              type="button"
              class="ms-modern-display-settings__option"
              :class="{ 'is-active': meetingDisplayTypeState === option.value }"
              :aria-pressed="meetingDisplayTypeState === option.value"
              @click="meetingDisplayTypeState = option.value"
            >
              <span class="ms-modern-display-settings__option-icon">
                <FontAwesomeIcon :icon="option.icon" />
              </span>
              <span class="ms-modern-display-settings__option-title">{{ option.label }}</span>
              <span class="ms-modern-display-settings__option-copy">{{ option.description }}</span>
            </button>
          </div>
        </section>

        <section class="ms-modern-display-settings__section">
          <label class="ms-modern-display-settings__section-label">Display Options</label>

          <button
            type="button"
            class="ms-modern-display-settings__toggle-row"
            @click="autoWaveState = !autoWaveState"
          >
            <span class="ms-modern-display-settings__toggle-main">
              <span class="ms-modern-display-settings__toggle-icon">
                <FontAwesomeIcon :icon="faWaveSquare" />
              </span>
              <span class="ms-modern-display-settings__toggle-text">
                <span class="ms-modern-display-settings__toggle-label">Audio Visualization</span>
                <span class="ms-modern-display-settings__toggle-copy">
                  Show audiograph activity across participant cards.
                </span>
              </span>
            </span>
            <span class="ms-modern-display-settings__switch" :class="{ 'is-on': autoWaveState }">
              <span class="ms-modern-display-settings__switch-knob" />
            </span>
          </button>

          <button
            type="button"
            class="ms-modern-display-settings__toggle-row"
            @click="forceFullDisplayState = !forceFullDisplayState"
          >
            <span class="ms-modern-display-settings__toggle-main">
              <span class="ms-modern-display-settings__toggle-icon">
                <FontAwesomeIcon :icon="faExpand" />
              </span>
              <span class="ms-modern-display-settings__toggle-text">
                <span class="ms-modern-display-settings__toggle-label">Force Full Display</span>
                <span class="ms-modern-display-settings__toggle-copy">
                  Keep all participants visible instead of following the active speaker.
                </span>
              </span>
            </span>
            <span
              class="ms-modern-display-settings__switch"
              :class="{ 'is-on': forceFullDisplayState }"
            >
              <span class="ms-modern-display-settings__switch-knob" />
            </span>
          </button>

          <button
            type="button"
            class="ms-modern-display-settings__toggle-row"
            @click="meetingVideoOptimizedState = !meetingVideoOptimizedState"
          >
            <span class="ms-modern-display-settings__toggle-main">
              <span class="ms-modern-display-settings__toggle-icon">
                <FontAwesomeIcon :icon="faGaugeHigh" />
              </span>
              <span class="ms-modern-display-settings__toggle-text">
                <span class="ms-modern-display-settings__toggle-label">Prioritize Video Participants</span>
                <span class="ms-modern-display-settings__toggle-copy">
                  Bias the layout toward camera-enabled participants.
                </span>
              </span>
            </span>
            <span
              class="ms-modern-display-settings__switch"
              :class="{ 'is-on': meetingVideoOptimizedState }"
            >
              <span class="ms-modern-display-settings__switch-knob" />
            </span>
          </button>

          <button
            type="button"
            class="ms-modern-display-settings__toggle-row"
            @click="showSubtitlesOnCardsState = !showSubtitlesOnCardsState"
          >
            <span class="ms-modern-display-settings__toggle-main">
              <span class="ms-modern-display-settings__toggle-icon">
                <FontAwesomeIcon :icon="faClosedCaptioning" />
              </span>
              <span class="ms-modern-display-settings__toggle-text">
                <span class="ms-modern-display-settings__toggle-label">Show Subtitles on Cards</span>
                <span class="ms-modern-display-settings__toggle-copy">
                  Keep transcript snippets visible on participant cards.
                </span>
              </span>
            </span>
            <span
              class="ms-modern-display-settings__switch"
              :class="{ 'is-on': showSubtitlesOnCardsState }"
            >
              <span class="ms-modern-display-settings__switch-knob" />
            </span>
          </button>
        </section>
      </div>

      <div class="ms-modern-display-settings__footer">
        <button
          type="button"
          class="ms-modern-display-settings__save"
          @click="handleSaveSettings"
        >
          <FontAwesomeIcon :icon="faCheck" />
          Apply Settings
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faCheck,
  faClosedCaptioning,
  faDisplay,
  faExpand,
  faGaugeHigh,
  faVideo,
  faWaveSquare,
} from '@fortawesome/free-solid-svg-icons';
import {
  modifyDisplaySettings,
  type ModifyDisplaySettingsOptions,
  type ModifyDisplaySettingsParameters,
} from 'mediasfu-shared';

export interface ModernDisplaySettingsModalParameters extends ModifyDisplaySettingsParameters {
  meetingDisplayType: string;
  autoWave: boolean;
  forceFullDisplay: boolean;
  meetingVideoOptimized: boolean;
  showSubtitlesOnCards?: boolean;
}

export interface ModernDisplaySettingsModalProps {
  isDisplaySettingsModalVisible: boolean;
  onDisplaySettingsClose: () => void;
  onModifyDisplaySettings?: (options: ModifyDisplaySettingsOptions) => Promise<void>;
  parameters: ModernDisplaySettingsModalParameters;
  renderMode?: 'modal' | 'sidebar' | 'inline';
  position?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';
  backgroundColor?: string;
}

const props = defineProps<ModernDisplaySettingsModalProps>();

const onModifyDisplaySettings = computed(() => props.onModifyDisplaySettings ?? modifyDisplaySettings);
const accentColor = computed(() => props.backgroundColor ?? 'var(--ms-modern-accent)');
const position = computed(() => props.position ?? 'topRight');
const isEmbeddedMode = computed(() => props.renderMode === 'sidebar' || props.renderMode === 'inline');

const meetingDisplayTypeState = ref(props.parameters.meetingDisplayType);
const autoWaveState = ref(props.parameters.autoWave);
const forceFullDisplayState = ref(props.parameters.forceFullDisplay);
const showSubtitlesOnCardsState = ref(props.parameters.showSubtitlesOnCards ?? true);
const meetingVideoOptimizedState = ref(props.parameters.meetingVideoOptimized);

const displayOptions = [
  {
    value: 'video',
    label: 'Video Only',
    description: 'Focus on participants with active camera feeds.',
    icon: faVideo,
  },
  {
    value: 'media',
    label: 'Media',
    description: 'Balance audio and video participants together.',
    icon: faDisplay,
  },
  {
    value: 'all',
    label: 'All Participants',
    description: 'Keep every participant eligible for the layout.',
    icon: faExpand,
  },
];

const modalPositionStyle = computed(() => {
  if (isEmbeddedMode.value) {
    return {};
  }

  return {
    top: position.value.includes('top') ? '16px' : 'auto',
    bottom: position.value.includes('bottom') ? '16px' : 'auto',
    left: position.value.includes('Left') ? '16px' : 'auto',
    right: position.value.includes('Right') ? '16px' : 'auto',
  };
});

const handleOverlayClick = () => {
  if (!isEmbeddedMode.value) {
    props.onDisplaySettingsClose();
  }
};

const handleSaveSettings = async () => {
  await onModifyDisplaySettings.value({
    parameters: {
      ...props.parameters,
      meetingDisplayType: meetingDisplayTypeState.value,
      autoWave: autoWaveState.value,
      forceFullDisplay: forceFullDisplayState.value,
      showSubtitlesOnCards: showSubtitlesOnCardsState.value,
      meetingVideoOptimized: meetingVideoOptimizedState.value,
    },
  });
};
</script>

<style scoped>
.ms-modern-display-settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: var(--ms-modern-overlay-backdrop);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.ms-modern-display-settings-overlay--embedded {
  position: static;
  inset: auto;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.ms-modern-display-settings {
  position: fixed;
  width: min(392px, calc(100vw - 32px));
  max-height: min(560px, calc(100vh - 32px));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 28px;
  border: 1px solid var(--ms-modern-panel-border);
  background: linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-panel-surface) 100%);
  box-shadow: var(--ms-modern-shadow-elevated);
  color: var(--ms-modern-text-primary);
}

.ms-modern-display-settings--embedded {
  position: relative;
  width: 100%;
  max-height: none;
  height: 100%;
}

.ms-modern-display-settings__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px 16px;
  border-bottom: 1px solid var(--ms-modern-panel-border);
  background: linear-gradient(180deg, var(--ms-modern-panel-surface-elevated), transparent);
}

.ms-modern-display-settings__title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ms-modern-display-settings__title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 60%, var(--ms-local-accent, var(--ms-modern-accent)) 100%);
  color: var(--ms-modern-text-primary);
  box-shadow: var(--ms-modern-shadow-soft);
}

.ms-modern-display-settings__title {
  margin: 0;
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: 1.06rem;
  font-weight: 700;
}

.ms-modern-display-settings__subtitle {
  margin: 4px 0 0;
  color: var(--ms-modern-text-secondary);
  font-family: var(--ms-modern-font-family);
  font-size: 0.78rem;
  line-height: 1.4;
}

.ms-modern-display-settings__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 9999px;
  background: var(--ms-modern-field-background);
  color: var(--ms-modern-text-primary);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.ms-modern-display-settings__content {
  display: grid;
  gap: 18px;
  padding: 18px 22px 22px;
  overflow-y: auto;
}

.ms-modern-display-settings__section {
  display: grid;
  gap: 10px;
}

.ms-modern-display-settings__section-label {
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.ms-modern-display-settings__option-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.ms-modern-display-settings__option {
  display: grid;
  justify-items: center;
  gap: 8px;
  min-height: 92px;
  padding: 14px 10px;
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 18px;
  background: var(--ms-modern-panel-surface);
  text-align: center;
  color: var(--ms-modern-text-secondary);
  cursor: pointer;
  transition: border-color 180ms ease, background-color 180ms ease, transform 180ms ease;
}

.ms-modern-display-settings__option.is-active {
  border-color: var(--ms-local-accent, var(--ms-modern-accent));
  background: linear-gradient(135deg, color-mix(in srgb, var(--ms-local-accent, var(--ms-modern-accent)) 18%, var(--ms-modern-panel-surface)) 0%, var(--ms-modern-panel-surface-elevated) 100%);
  color: var(--ms-modern-text-primary);
  transform: translateY(-1px);
}

.ms-modern-display-settings__option-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--ms-local-accent, var(--ms-modern-accent)) 14%, transparent);
  color: var(--ms-modern-text-primary);
  font-size: 0.95rem;
}

.ms-modern-display-settings__option-title {
  font-family: var(--ms-modern-font-family);
  font-size: 0.88rem;
  font-weight: 700;
}

.ms-modern-display-settings__option-copy {
  font-family: var(--ms-modern-font-family);
  font-size: 0.74rem;
  line-height: 1.45;
}

.ms-modern-display-settings__toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 18px;
  background: var(--ms-modern-panel-surface);
  text-align: left;
  color: var(--ms-modern-text-primary);
  cursor: pointer;
}

.ms-modern-display-settings__toggle-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.ms-modern-display-settings__toggle-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  border-radius: 12px;
  background: color-mix(in srgb, var(--ms-local-accent, var(--ms-modern-accent)) 12%, transparent);
  color: var(--ms-modern-text-primary);
}

.ms-modern-display-settings__toggle-text {
  min-width: 0;
}

.ms-modern-display-settings__toggle-label {
  display: block;
  margin-bottom: 4px;
  font-family: var(--ms-modern-font-family);
  font-size: 0.88rem;
  font-weight: 700;
}

.ms-modern-display-settings__toggle-copy {
  display: block;
  color: var(--ms-modern-text-secondary);
  font-family: var(--ms-modern-font-family);
  font-size: 0.74rem;
  line-height: 1.45;
}

.ms-modern-display-settings__switch {
  position: relative;
  flex-shrink: 0;
  width: 48px;
  height: 26px;
  border-radius: 9999px;
  background: var(--ms-modern-panel-border);
  transition: background-color 180ms ease;
}

.ms-modern-display-settings__switch.is-on {
  background: var(--ms-local-accent, var(--ms-modern-accent));
}

.ms-modern-display-settings__switch-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  box-shadow: var(--ms-modern-shadow-floating);
  transition: transform 180ms ease;
}

.ms-modern-display-settings__switch.is-on .ms-modern-display-settings__switch-knob {
  transform: translateX(22px);
}

.ms-modern-display-settings__footer {
  padding: 0 22px 22px;
}

.ms-modern-display-settings__save {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  min-height: 48px;
  border: none;
  border-radius: 9999px;
  background:
    linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 55%, var(--ms-local-accent, var(--ms-modern-accent)) 100%);
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: 0.92rem;
  font-weight: 700;
  box-shadow: var(--ms-modern-shadow-soft);
  cursor: pointer;
}

@media (max-width: 640px) {
  .ms-modern-display-settings {
    width: calc(100vw - 24px);
    max-height: calc(100vh - 24px);
  }

  .ms-modern-display-settings__header {
    padding: 18px 18px 14px;
  }

  .ms-modern-display-settings__content {
    gap: 14px;
    padding: 16px 18px 18px;
  }

  .ms-modern-display-settings__option-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .ms-modern-display-settings__option {
    min-height: 84px;
    padding: 12px 8px;
  }

  .ms-modern-display-settings__option-copy,
  .ms-modern-display-settings__toggle-copy,
  .ms-modern-display-settings__subtitle {
    display: none;
  }

  .ms-modern-display-settings__toggle-row {
    padding: 11px 12px;
    border-radius: 16px;
  }

  .ms-modern-display-settings__toggle-icon {
    width: 30px;
    height: 30px;
    border-radius: 10px;
  }

  .ms-modern-display-settings__toggle-label,
  .ms-modern-display-settings__option-title {
    font-size: 0.82rem;
  }

  .ms-modern-display-settings__footer {
    padding: 0 18px 18px;
  }
}
</style>