<template>
  <div
    v-if="shouldRender"
    v-bind="mergedOverlayProps"
    @click.self="handleOverlayClick"
  >
    <section v-bind="mergedContentProps">
      <header v-bind="mergedHeaderProps">
        <div class="ms-modern-translation__title-block">
          <h2 v-bind="mergedTitleProps">{{ title }}</h2>
        </div>

        <button
          v-bind="mergedCloseButtonProps"
          @click="handleClose"
        >
          <FontAwesomeIcon :icon="faTimes" />
        </button>
      </header>

      <div
        v-if="translationAvailable && roomSupportsTranslation"
        class="ms-modern-translation__tabs"
      >
        <button
          v-bind="resolveTabButtonProps(activeTab === 'speaking')"
          @click="activeTab = 'speaking'"
        >
          <FontAwesomeIcon :icon="faMicrophone" />
          <span>My Voice Output</span>
        </button>
        <button
          v-bind="resolveTabButtonProps(activeTab === 'listening')"
          @click="activeTab = 'listening'"
        >
          <FontAwesomeIcon :icon="faHeadphones" />
          <span>Listen To</span>
        </button>
      </div>

      <div v-bind="mergedBodyProps">
        <div class="ms-modern-translation__scroll">
          <section
            v-if="!translationAvailable"
            class="ms-modern-translation__state-card"
          >
            <strong>Translation is not enabled for this room yet.</strong>
            <span>
              The room has not exposed translation controls or personal translation access for this joiner.
            </span>
          </section>

          <section
            v-else-if="!roomSupportsTranslation"
            class="ms-modern-translation__state-card"
          >
            <strong>Personal translation is being prepared.</strong>
            <span>{{ pendingTranslationMessage }}</span>
          </section>

          <template v-else-if="activeTab === 'speaking'">
            <section class="ms-modern-translation__intro-card">
              Optionally specify your spoken language (helps auto-detection). Then choose an output language to have your voice translated for everyone.
            </section>

            <section class="ms-modern-translation__panel">
              <div class="ms-modern-translation__toggle-row">
                <button
                  type="button"
                  class="ms-modern-translation__toggle-button"
                  :data-active="localSpokenEnabled"
                  :disabled="!canChangeSpokenLanguage || isSaving"
                  @click="toggleSpokenTranslation"
                >
                  <span
                    class="ms-modern-translation__toggle-track"
                    :data-active="localSpokenEnabled"
                  >
                    <span class="ms-modern-translation__toggle-thumb" />
                  </span>
                  <span>Speak in a different language (translate my voice)</span>
                </button>
              </div>

              <div
                v-if="isPersonalTranslation"
                class="ms-modern-translation__banner"
              >
                Translation is billed from your personal credits.
              </div>

              <div class="ms-modern-translation__field-grid">
                <label class="ms-modern-translation__field">
                  <span>Spoken Language</span>
                  <select
                    class="ms-modern-translation__select"
                    :value="localSpokenLanguage"
                    :disabled="!canChangeSpokenLanguage || isSaving"
                    @change="handleSpokenLanguageChange"
                  >
                    <option
                      v-for="language in spokenLanguageOptions"
                      :key="language.code"
                      :value="language.code"
                    >
                      {{ language.name }}
                    </option>
                  </select>
                </label>

                <label class="ms-modern-translation__field">
                  <span>Output Language (Everyone Hears)</span>
                  <select
                    class="ms-modern-translation__select"
                    :value="localDefaultOutputLanguage ?? ''"
                    :disabled="!localSpokenEnabled || !canChangeSpokenLanguage || isSaving"
                    @change="handleDefaultOutputLanguageChange"
                  >
                    <option value="">No translation (speak in my original language)</option>
                    <option
                      v-for="language in outputLanguageOptions"
                      :key="`output-${language.code}`"
                      :value="language.code"
                    >
                      {{ language.name }}
                    </option>
                  </select>
                </label>
              </div>

              <p
                class="ms-modern-translation__status"
                :data-variant="spokenStatusVariant"
              >
                {{ spokenStatusMessage }}
              </p>
            </section>

            <section
              v-if="localSpokenEnabled && localDefaultOutputLanguage"
              class="ms-modern-translation__panel"
            >
              <div class="ms-modern-translation__section-heading">
                <div>
                  <h3>
                    <FontAwesomeIcon :icon="faWandMagicSparkles" />
                    Voice Settings
                  </h3>
                  <p>Pick a general translated voice style or pin a specific provider voice for your translated output.</p>
                </div>
              </div>

              <div class="ms-modern-translation__pill-row">
                <button
                  v-bind="resolvePillButtonProps(voiceSelectionMode === 'basic')"
                  @click="handleVoiceModeChange('basic')"
                >
                  Basic
                </button>
                <button
                  v-bind="resolvePillButtonProps(voiceSelectionMode === 'advanced')"
                  @click="handleVoiceModeChange('advanced')"
                >
                  Advanced
                </button>
                <button
                  v-bind="resolvePillButtonProps(voiceSelectionMode === 'clone')"
                  @click="handleVoiceModeChange('clone')"
                >
                  Clone
                </button>
              </div>

              <div
                v-if="voiceSelectionMode === 'basic'"
                class="ms-modern-translation__voice-choice-grid"
              >
                <button
                  v-for="option in voiceGenderOptions"
                  :key="option.value"
                  class="ms-modern-translation__voice-choice"
                  :data-active="selectedVoiceGender === option.value"
                  :disabled="isSaving"
                  @click="handleVoiceGenderSelect(option.value)"
                >
                  <strong>{{ option.label }}</strong>
                  <span>{{ option.caption }}</span>
                </button>
              </div>

              <div
                v-else-if="voiceSelectionMode === 'advanced'"
                class="ms-modern-translation__stack"
              >
                <div class="ms-modern-translation__field-grid">
                  <label class="ms-modern-translation__field">
                    <span>TTS provider</span>
                    <select
                      class="ms-modern-translation__select"
                      :value="selectedTTSProvider"
                      :disabled="isSaving"
                      @change="handleVoiceProviderChange"
                    >
                      <option
                        v-for="(providerMeta, providerKey) in TTS_PROVIDERS"
                        :key="providerKey"
                        :value="providerKey"
                      >
                        {{ providerMeta.name }}
                      </option>
                    </select>
                  </label>

                  <label class="ms-modern-translation__field">
                    <span>Specific voice</span>
                    <select
                      class="ms-modern-translation__select"
                      :value="selectedVoiceId ?? ''"
                      :disabled="isSaving || !localDefaultOutputLanguage || voicesLoading"
                      @change="handleVoiceIdChange"
                    >
                      <option value="">
                        {{ voicesLoading ? 'Loading voices...' : 'Use provider default voice' }}
                      </option>
                      <optgroup
                        v-if="availableVoices?.female?.length"
                        label="Female voices"
                      >
                        <option
                          v-for="voice in availableVoices?.female ?? []"
                          :key="voice.id"
                          :value="voice.id"
                        >
                          {{ voice.name }}
                        </option>
                      </optgroup>
                      <optgroup
                        v-if="availableVoices?.male?.length"
                        label="Male voices"
                      >
                        <option
                          v-for="voice in availableVoices?.male ?? []"
                          :key="voice.id"
                          :value="voice.id"
                        >
                          {{ voice.name }}
                        </option>
                      </optgroup>
                    </select>
                  </label>
                </div>

                <p class="ms-modern-translation__subtle-copy">
                  {{ voiceAdvancedHint }}
                </p>
              </div>

              <div
                v-else
                class="ms-modern-translation__stack"
              >
                <div class="ms-modern-translation__note-card">
                  Pick one of your saved cloned voices for translated speech. If you do not see one here yet, create it on the MediaSFU voice-clone page first.
                </div>

                <div
                  v-if="resolvedVoiceClones.length"
                  class="ms-modern-translation__clone-list"
                >
                  <button
                    v-for="clone in resolvedVoiceClones"
                    :key="clone.key"
                    class="ms-modern-translation__clone-choice"
                    :data-active="selectedVoiceClone?.voiceId === clone.voiceId"
                    :disabled="isSaving"
                    @click="handleVoiceCloneSelect(clone)"
                  >
                    <div class="ms-modern-translation__clone-labels">
                      <strong>{{ clone.name }}</strong>
                      <span>{{ clone.provider }}</span>
                    </div>
                    <span
                      v-if="clone.isDefault"
                      class="ms-modern-translation__clone-badge"
                    >
                      Default
                    </span>
                  </button>
                </div>

                <div
                  v-else
                  class="ms-modern-translation__note-card"
                >
                  <p>No cloned voices are available on this room instance yet.</p>
                  <a
                    class="ms-modern-translation__clone-link"
                    href="https://mediasfu.com/lite/voice-clone"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open voice clone page
                  </a>
                </div>

                <p class="ms-modern-translation__subtle-copy">
                  {{ voiceCloneHint }}
                </p>
              </div>
            </section>

            <section
              v-if="canToggleSubtitles"
              class="ms-modern-translation__panel"
            >
              <div class="ms-modern-translation__section-heading ms-modern-translation__section-heading--split">
                <div>
                  <h3>
                    <FontAwesomeIcon :icon="faClosedCaptioning" />
                    Live Subtitles
                  </h3>
                  <p>Display translated speech as subtitles on participant cards.</p>
                </div>

                <button
                  type="button"
                  class="ms-modern-translation__toggle-button"
                  :data-active="showSubtitlesOnCards"
                  :disabled="isSaving || !canToggleSubtitles"
                  @click="handleSubtitleToggle"
                >
                  <span
                    class="ms-modern-translation__toggle-track"
                    :data-active="showSubtitlesOnCards"
                  >
                    <span class="ms-modern-translation__toggle-thumb" />
                  </span>
                  <span>{{ showSubtitlesOnCards ? 'Shown on cards' : 'Hidden on cards' }}</span>
                </button>
              </div>
            </section>
          </template>

          <template v-else>
            <section class="ms-modern-translation__intro-card">
              Pick one default translation language for the room or override speakers individually whenever live channels are available.
            </section>

            <section class="ms-modern-translation__panel">
              <div class="ms-modern-translation__section-heading">
                <div>
                  <h3>
                    <FontAwesomeIcon :icon="faHeadphones" />
                    Listening Preferences
                  </h3>
                  <p>Use one language for the room or switch to per-speaker control when individual channels are available.</p>
                </div>
              </div>

              <div class="ms-modern-translation__pill-row">
                <button
                  v-bind="resolvePillButtonProps(!perSpeakerMode)"
                  @click="perSpeakerMode = false"
                >
                  Default language
                </button>
                <button
                  v-bind="resolvePillButtonProps(perSpeakerMode)"
                  @click="perSpeakerMode = true"
                >
                  Per speaker
                </button>
              </div>

              <div v-if="!perSpeakerMode" class="ms-modern-translation__field-grid ms-modern-translation__field-grid--single">
                <label class="ms-modern-translation__field">
                  <span>Default listening language</span>
                  <select
                    class="ms-modern-translation__select"
                    :value="localDefaultListenLanguage ?? ''"
                    :disabled="!canChangeListenLanguage || isSaving"
                    @change="handleDefaultListenLanguageChange"
                  >
                    <option value="">Original audio only</option>
                    <option
                      v-for="language in listenLanguageOptions"
                      :key="`listen-${language.code}`"
                      :value="language.code"
                    >
                      {{ language.name }}
                    </option>
                  </select>
                </label>
              </div>

              <div v-else class="ms-modern-translation__stack">
                <div class="ms-modern-translation__speaker-toolbar">
                  <input
                    v-model="speakerSearch"
                    v-bind="mergedSearchInputProps"
                    type="search"
                    placeholder="Search speakers"
                  >
                </div>

                <div class="ms-modern-translation__speaker-list">
                  <div
                    v-if="filteredOtherParticipants.length === 0"
                    class="ms-modern-translation__state-inline"
                  >
                    {{ normalizedSpeakerSearch ? 'No speakers match that search.' : 'No other participants are available yet.' }}
                  </div>

                  <div
                    v-for="(participant, index) in filteredOtherParticipants"
                    :key="participant.id || `${participant.name || 'speaker'}-${index}`"
                    class="ms-modern-translation__speaker-row"
                  >
                    <div class="ms-modern-translation__speaker-meta">
                      <strong>{{ participant.name || 'Unnamed participant' }}</strong>
                      <span>{{ getSpeakerRowHint(participant.id) }}</span>
                    </div>

                    <select
                      class="ms-modern-translation__select"
                      :value="getSpeakerPreferenceValue(participant.id)"
                      :disabled="!canChangeListenLanguage || isSaving || !speakerHasChannels(participant.id)"
                      @change="handleSpeakerPreferenceChange(participant.id, $event)"
                    >
                      <option value="original">Original audio</option>
                      <option
                        v-for="language in getSpeakerLanguageOptions(participant.id)"
                        :key="`${participant.id}-${language.code}`"
                        :value="language.code"
                      >
                        {{ language.name }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            <section
              v-if="canToggleSubtitles"
              class="ms-modern-translation__panel"
            >
              <div class="ms-modern-translation__section-heading ms-modern-translation__section-heading--split">
                <div>
                  <h3>
                    <FontAwesomeIcon :icon="faClosedCaptioning" />
                    Live Subtitles
                  </h3>
                  <p>Translated captions follow the listening settings you save here.</p>
                </div>

                <button
                  type="button"
                  class="ms-modern-translation__toggle-button"
                  :data-active="showSubtitlesOnCards"
                  :disabled="isSaving || !canToggleSubtitles"
                  @click="handleSubtitleToggle"
                >
                  <span
                    class="ms-modern-translation__toggle-track"
                    :data-active="showSubtitlesOnCards"
                  >
                    <span class="ms-modern-translation__toggle-thumb" />
                  </span>
                  <span>{{ showSubtitlesOnCards ? 'Shown on cards' : 'Hidden on cards' }}</span>
                </button>
              </div>
            </section>
          </template>
        </div>

        <footer class="ms-modern-translation__footer">
          <button
            v-bind="resolveActionButtonProps('secondary', isSaving)"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            v-bind="resolveActionButtonProps('primary', isSaving || !roomSupportsTranslation)"
            @click="handleApply"
          >
            {{ isSaving ? 'Saving...' : 'Apply Changes' }}
          </button>
        </footer>
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
import {
  faClosedCaptioning,
  faHeadphones,
  faMicrophone,
  faTimes,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons';
import type { TranslationVoiceConfig } from 'mediasfu-shared';
import type {
  TranslationSettingsModalParameters,
  TranslationSettingsModalProps,
} from '../../components/translationComponents/TranslationSettingsModal.vue';
import type { TranslationRoomConfig } from '../../services/translationReceiveMethods';
import {
  SUPPORTED_LANGUAGE_CODES,
  TTS_PROVIDERS,
  fetchVoicesViaSocket,
  getLanguageName,
  type TTSProvider,
  type VoiceGender,
  type VoiceOption,
} from '../../utils/translationLanguages';

type ModernTranslationSettingsRenderMode = 'modal' | 'sidebar' | 'inline';
type TranslationTab = 'speaking' | 'listening';

interface TranslationChannelAvailability {
  languages: string[];
  originalProducerId: string;
}

interface LanguageOption {
  code: string;
  name: string;
}

type VoiceSelectionMode = 'basic' | 'advanced' | 'clone';

interface VoiceCloneOption {
  key: string;
  voiceId: string;
  provider: 'elevenlabs' | 'playht' | 'coqui' | 'cartesia';
  name: string;
  isDefault: boolean;
}

export interface ModernTranslationSettingsModalProps extends TranslationSettingsModalProps {
  renderMode?: ModernTranslationSettingsRenderMode;
}

const props = withDefaults(defineProps<ModernTranslationSettingsModalProps>(), {
  backgroundColor: undefined,
  position: 'center',
  title: 'Translation Settings',
  renderMode: 'modal',
});

const panelGradientBackground =
  'linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-panel-surface) 100%)';

const renderMode = computed<ModernTranslationSettingsRenderMode>(() => props.renderMode ?? 'modal');
const isEmbedded = computed(() => renderMode.value === 'sidebar' || renderMode.value === 'inline');
const shouldRender = computed(() => isEmbedded.value || props.isTranslationSettingsModalVisible);
const panelBackground = computed(() => props.backgroundColor ?? panelGradientBackground);
const activeTab = ref<TranslationTab>('speaking');

const allLanguages: LanguageOption[] = SUPPORTED_LANGUAGE_CODES.map((code) => ({
  code,
  name: getLanguageName(code),
}));

const localSpokenLanguage = ref('en');
const localSpokenEnabled = ref(false);
const localDefaultOutputLanguage = ref<string | null>(null);
const localDefaultListenLanguage = ref<string | null>(null);
const localListenPreferences = ref<Map<string, string>>(new Map());
const perSpeakerMode = ref(false);
const speakerSearch = ref('');
const isSaving = ref(false);
const voiceSelectionMode = ref<VoiceSelectionMode>('basic');
const selectedVoiceGender = ref<VoiceGender>('female');
const selectedVoiceId = ref<string | null>(null);
const selectedTTSProvider = ref<TTSProvider>('deepgram');
const availableVoices = ref<{ male: VoiceOption[]; female: VoiceOption[] } | null>(null);
const voicesLoading = ref(false);
const voicesFetchedForKey = ref<string | null>(null);
const selectedVoiceClone = ref<TranslationVoiceConfig['voiceClone'] | null>(null);

const voiceGenderOptions: Array<{ value: VoiceGender; label: string; caption: string }> = [
  { value: 'female', label: 'Female', caption: 'Softer default tone' },
  { value: 'male', label: 'Male', caption: 'Lower translated tone' },
  { value: 'neutral', label: 'Neutral', caption: 'Let the provider decide' },
];

const currentParams = computed<TranslationSettingsModalParameters>(() =>
  props.parameters.getUpdatedAllParams?.() ?? props.parameters
);

const roomSupportsTranslation = computed(
  () => currentParams.value.translationConfig?.supportTranslation === true
);

const translationAvailable = computed(
  () => roomSupportsTranslation.value || currentParams.value.canUsePersonalTranslation === true
);

const isPersonalTranslation = computed(() => currentParams.value.isPersonalTranslation === true);

const canChangeSpokenLanguage = computed(
  () => currentParams.value.translationConfig?.allowSpokenLanguageChange !== false || currentParams.value.islevel === '2'
);

const canChangeListenLanguage = computed(
  () => currentParams.value.translationConfig?.allowListenLanguageChange !== false || currentParams.value.islevel === '2'
);

const canToggleSubtitles = computed(() => typeof currentParams.value.updateShowSubtitlesOnCards === 'function');
const showSubtitlesOnCards = computed(() => currentParams.value.showSubtitlesOnCards ?? true);
const normalizedSpeakerSearch = computed(() => speakerSearch.value.trim().toLowerCase());

const voiceAdvancedHint = computed(() => {
  if (!localDefaultOutputLanguage.value) {
    return 'Choose an output language above before selecting a specific provider voice.';
  }

  if (voicesLoading.value) {
    return `Loading voices for ${getLanguageName(localDefaultOutputLanguage.value)}.`;
  }

  const voiceCount = (availableVoices.value?.female.length ?? 0) + (availableVoices.value?.male.length ?? 0);
  if (voiceCount === 0) {
    return 'No explicit voices were returned for this language yet. The provider default voice will be used.';
  }

  return `${voiceCount} voice option${voiceCount === 1 ? '' : 's'} available for ${getLanguageName(localDefaultOutputLanguage.value)}.`;
});

const resolvedVoiceClones = computed<VoiceCloneOption[]>(() => {
  return (currentParams.value.userVoiceClones ?? [])
    .map((clone, index) => {
      const voiceId = clone.providerVoiceId || clone.voiceId || clone.id || '';
      if (!voiceId) {
        return null;
      }

      const provider = clone.provider === 'playht'
        || clone.provider === 'coqui'
        || clone.provider === 'cartesia'
        ? clone.provider
        : 'elevenlabs';

      return {
        key: `${provider}:${voiceId}:${index}`,
        voiceId,
        provider,
        name: clone.name || 'Voice clone',
        isDefault: clone.isDefault === true,
      } satisfies VoiceCloneOption;
    })
    .filter((clone): clone is VoiceCloneOption => clone !== null);
});

const voiceCloneHint = computed(() => {
  if (selectedVoiceClone.value) {
    return `Clone active: ${selectedVoiceClone.value.provider} / ${selectedVoiceClone.value.voiceId}`;
  }

  if (resolvedVoiceClones.value.length === 0) {
    return 'No app-level cloned voices were provided for this room yet.';
  }

  return `${resolvedVoiceClones.value.length} cloned voice option${resolvedVoiceClones.value.length === 1 ? '' : 's'} available.`;
});

const pendingTranslationMessage = computed(() =>
  currentParams.value.personalTranslationUsername
    ? `MediaSFU will try to activate translation using ${currentParams.value.personalTranslationUsername} credits for this joiner.`
    : 'MediaSFU will try to activate translation using your personal translation eligibility for this joiner.'
);

const spokenStatusVariant = computed<'info' | 'success' | 'muted'>(() => {
  if (!localSpokenEnabled.value) {
    return 'muted';
  }

  return localDefaultOutputLanguage.value ? 'info' : 'success';
});

const spokenStatusMessage = computed(() => {
  if (!localSpokenEnabled.value) {
    return 'Enable voice translation to replace your original audio with translated speech for other listeners.';
  }

  if (!localDefaultOutputLanguage.value) {
    return 'Select an output language above to have your voice translated for everyone else in the room.';
  }

  return `You speak ${getLanguageName(localSpokenLanguage.value)}, and other participants will hear ${getLanguageName(localDefaultOutputLanguage.value)}.`;
});

const normalizeTTSProvider = (provider: string | null | undefined): TTSProvider => {
  const normalized = provider?.toLowerCase();
  if (normalized && normalized in TTS_PROVIDERS) {
    return normalized as TTSProvider;
  }

  return 'deepgram';
};

const buildFilteredLanguages = (
  mode: TranslationRoomConfig['spokenLanguageMode'] | undefined,
  allowedEntries: Array<{ code: string }> | undefined,
  blockedEntries: string[] | undefined
) => {
  const allowed = new Set((allowedEntries ?? []).map((entry) => entry.code));
  const blocked = new Set(blockedEntries ?? []);

  let codes = [...SUPPORTED_LANGUAGE_CODES];

  if (mode === 'allowlist' && allowed.size > 0) {
    codes = codes.filter((code) => allowed.has(code));
  }

  if (mode === 'blocklist' && blocked.size > 0) {
    codes = codes.filter((code) => !blocked.has(code));
  }

  return allLanguages.filter((language) => codes.includes(language.code));
};

const spokenLanguageOptions = computed(() =>
  buildFilteredLanguages(
    currentParams.value.translationConfig?.spokenLanguageMode,
    currentParams.value.translationConfig?.allowedSpokenLanguages,
    currentParams.value.translationConfig?.blockedSpokenLanguages,
  )
);

const listenLanguageOptions = computed(() =>
  buildFilteredLanguages(
    currentParams.value.translationConfig?.listenLanguageMode,
    currentParams.value.translationConfig?.allowedListenLanguages,
    currentParams.value.translationConfig?.blockedListenLanguages,
  )
);

const outputLanguageOptions = computed(() => {
  const options = listenLanguageOptions.value.filter((language) => language.code !== localSpokenLanguage.value);
  if (
    localDefaultOutputLanguage.value
    && !options.some((language) => language.code === localDefaultOutputLanguage.value)
  ) {
    return [
      {
        code: localDefaultOutputLanguage.value,
        name: getLanguageName(localDefaultOutputLanguage.value),
      },
      ...options,
    ];
  }

  return options;
});

const otherParticipants = computed(() =>
  currentParams.value.participants.filter((participant) => participant.name !== currentParams.value.member)
);

const filteredOtherParticipants = computed(() =>
  otherParticipants.value.filter((participant) => {
    if (!normalizedSpeakerSearch.value) {
      return true;
    }

    return (participant.name ?? '').toLowerCase().includes(normalizedSpeakerSearch.value);
  })
);

const modalPositionStyle = computed<CSSProperties>(() => {
  const positions: Record<NonNullable<TranslationSettingsModalProps['position']>, CSSProperties> = {
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
      class: 'ms-modern-translation__overlay',
      style: isEmbedded.value
        ? {
            position: 'static',
            width: '100%',
            height: '100%',
            minHeight: 0,
            backgroundColor: 'transparent',
            display: 'block',
            zIndex: 'auto',
          } satisfies CSSProperties
        : {
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(2, 8, 23, 0.46)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 1200,
          } satisfies CSSProperties,
    },
    props.overlayProps ?? {}
  )
);

const mergedContentProps = computed(() =>
  mergeProps(
    {
      class: 'ms-modern-translation__content',
      'data-embedded': isEmbedded.value ? 'true' : 'false',
      style: isEmbedded.value
        ? {
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            background: panelBackground.value,
            border: '1px solid var(--ms-modern-panel-border)',
            borderRadius: renderMode.value === 'inline' ? '28px' : '0',
            boxShadow: 'var(--ms-modern-shadow-elevated)',
            overflow: 'hidden',
            color: 'var(--ms-modern-text-primary)',
          } satisfies CSSProperties
        : {
            position: 'fixed',
          width: 'min(500px, calc(100vw - 32px))',
            maxHeight: 'calc(100vh - 48px)',
            display: 'flex',
            flexDirection: 'column',
            background: panelBackground.value,
            border: '1px solid var(--ms-modern-panel-border)',
            borderRadius: '28px',
            boxShadow: 'var(--ms-modern-shadow-elevated)',
            overflow: 'hidden',
            color: 'var(--ms-modern-text-primary)',
            zIndex: 1201,
            ...modalPositionStyle.value,
          } satisfies CSSProperties,
    },
    props.contentProps ?? {}
  )
);

const mergedHeaderProps = computed(() =>
  mergeProps(
    {
      class: 'ms-modern-translation__header',
      style: {
        padding: '16px 18px 12px',
        borderBottom: '1px solid var(--ms-modern-panel-border)',
      } satisfies CSSProperties,
    },
    props.headerProps ?? {}
  )
);

const mergedTitleProps = computed(() =>
  mergeProps(
    {
      class: 'ms-modern-translation__title',
      style: {
        margin: 0,
        color: 'var(--ms-modern-text-primary)',
        fontFamily: 'var(--ms-modern-font-family)',
        fontSize: '1rem',
        fontWeight: 700,
        letterSpacing: '0.01em',
      } satisfies CSSProperties,
    },
    props.titleProps ?? {}
  )
);

const mergedCloseButtonProps = computed(() =>
  mergeProps(
    {
      class: 'ms-modern-translation__close-button',
      type: 'button',
      style: {
        width: '34px',
        height: '34px',
        borderRadius: '9999px',
        border: '1px solid var(--ms-modern-panel-border)',
        background: 'var(--ms-modern-field-background)',
        color: 'var(--ms-modern-text-primary)',
        cursor: 'pointer',
      } satisfies CSSProperties,
    },
    props.closeButtonProps ?? {}
  )
);

const mergedBodyProps = computed(() =>
  mergeProps(
    {
      class: 'ms-modern-translation__body',
      style: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
      } satisfies CSSProperties,
    },
    props.bodyProps ?? {}
  )
);

const mergedSearchInputProps = computed(() =>
  mergeProps(
    {
      class: 'ms-modern-translation__search-input',
      style: {
        background: 'var(--ms-modern-field-background)',
        border: '1px solid var(--ms-modern-field-border)',
        color: 'var(--ms-modern-text-primary)',
        fontFamily: 'var(--ms-modern-font-family)',
      } satisfies CSSProperties,
    },
    props.searchInputProps ?? {}
  )
);

const syncFromParams = () => {
  const params = currentParams.value;
  const defaultVoiceConfig = params.translationConfig?.translationVoiceConfig;
  localSpokenLanguage.value = params.mySpokenLanguage || 'en';
  localSpokenEnabled.value = params.mySpokenLanguageEnabled;
  localDefaultOutputLanguage.value = params.myDefaultOutputLanguage ?? null;
  localDefaultListenLanguage.value = params.myDefaultListenLanguage ?? null;
  localListenPreferences.value = new Map(params.listenPreferences ?? new Map());
  perSpeakerMode.value = (params.myDefaultListenLanguage ?? null) === null && (params.listenPreferences?.size ?? 0) > 0;
  selectedTTSProvider.value = normalizeTTSProvider(defaultVoiceConfig?.ttsProvider ?? defaultVoiceConfig?.ttsNickName);
  selectedVoiceGender.value = defaultVoiceConfig?.voiceGender ?? 'female';
  selectedVoiceId.value = defaultVoiceConfig?.voiceId ?? null;
  selectedVoiceClone.value = defaultVoiceConfig?.voiceClone ?? null;
  voiceSelectionMode.value = defaultVoiceConfig?.voiceClone
    ? 'clone'
    : defaultVoiceConfig?.voiceId
      ? 'advanced'
      : 'basic';
  availableVoices.value = null;
  voicesFetchedForKey.value = null;
  voicesLoading.value = false;
};

watch(
  () => props.isTranslationSettingsModalVisible,
  (visible) => {
    if (visible || isEmbedded.value) {
      syncFromParams();
      return;
    }

    activeTab.value = 'speaking';
    speakerSearch.value = '';
    perSpeakerMode.value = false;
    isSaving.value = false;
    availableVoices.value = null;
    voicesFetchedForKey.value = null;
    voicesLoading.value = false;
  },
  { immediate: true }
);

watch(
  () => [
    currentParams.value.translationConfig,
    currentParams.value.mySpokenLanguage,
    currentParams.value.mySpokenLanguageEnabled,
    currentParams.value.myDefaultOutputLanguage,
    currentParams.value.myDefaultListenLanguage,
    currentParams.value.listenPreferences,
  ],
  () => {
    if (shouldRender.value && !hasUnsavedDraftChanges.value) {
      syncFromParams();
    }
  },
  { deep: true }
);

watch(
  () => [
    shouldRender.value,
    voiceSelectionMode.value,
    localDefaultOutputLanguage.value,
    selectedTTSProvider.value,
    currentParams.value.socket,
  ] as const,
  async ([visible, mode, outputLanguage, provider, socket]) => {
    if (!visible || mode !== 'advanced') {
      if (mode !== 'advanced') {
        availableVoices.value = null;
        voicesFetchedForKey.value = null;
      }
      return;
    }

    if (!outputLanguage) {
      availableVoices.value = null;
      voicesFetchedForKey.value = null;
      return;
    }

    if (!socket || voicesLoading.value) {
      return;
    }

    const requestKey = `${provider}:${outputLanguage}`;
    if (voicesFetchedForKey.value === requestKey && availableVoices.value) {
      return;
    }

    voicesLoading.value = true;
    voicesFetchedForKey.value = requestKey;

    try {
      const response = await fetchVoicesViaSocket(socket, provider, outputLanguage);
      if (voicesFetchedForKey.value !== requestKey) {
        return;
      }

      availableVoices.value = response.voices;
    } finally {
      if (voicesFetchedForKey.value === requestKey) {
        voicesLoading.value = false;
      }
    }
  },
  { immediate: true }
);

const handleClose = () => {
  props.onTranslationSettingsClose();
};

const handleOverlayClick = () => {
  if (!isEmbedded.value) {
    handleClose();
  }
};

const notify = (message: string, type: string = 'danger') => {
  currentParams.value.showAlert?.({
    message,
    type,
    duration: 3000,
  });
};

const resolveTabButtonProps = (active: boolean) =>
  mergeProps(
    {
      class: 'ms-modern-translation__tab-button',
      'data-active': active,
      type: 'button',
    },
    props.secondaryActionButtonProps ?? {}
  );

const resolvePillButtonProps = (active: boolean) =>
  mergeProps(
    {
      class: 'ms-modern-translation__pill-button',
      'data-active': active,
      type: 'button',
      disabled: isSaving.value,
    },
    props.secondaryActionButtonProps ?? {}
  );

const resolveActionButtonProps = (
  variant: 'primary' | 'secondary',
  disabled: boolean,
) =>
  mergeProps(
    {
      class: [
        'ms-modern-translation__action-button',
        variant === 'primary'
          ? 'ms-modern-translation__action-button--primary'
          : 'ms-modern-translation__action-button--secondary',
      ],
      type: 'button',
      disabled,
    },
    variant === 'primary'
      ? props.actionButtonProps ?? {}
      : props.secondaryActionButtonProps ?? {}
  );

const getSpeakerLanguageOptions = (speakerId: string | undefined): LanguageOption[] => {
  if (!speakerId) {
    return [];
  }

  const currentSelection = localListenPreferences.value.get(speakerId);
  const allowedCodes = new Set(listenLanguageOptions.value.map((language) => language.code));
  const availableCodes = (currentParams.value.availableTranslationChannels as Map<string, TranslationChannelAvailability>)
    .get(speakerId)?.languages ?? [];
  const mergedCodes = [...new Set([...(currentSelection ? [currentSelection] : []), ...availableCodes])]
    .filter((code) => allowedCodes.has(code));

  return listenLanguageOptions.value.filter((language) => mergedCodes.includes(language.code));
};

const speakerHasChannels = (speakerId: string | undefined) => getSpeakerLanguageOptions(speakerId).length > 0;

const getSpeakerPreferenceValue = (speakerId: string | undefined) => {
  if (!speakerId) {
    return 'original';
  }

  return localListenPreferences.value.get(speakerId) ?? 'original';
};

const getSpeakerRowHint = (speakerId: string | undefined) => {
  if (!speakerId) {
    return 'Speaker identifier unavailable';
  }

  const channelCount = getSpeakerLanguageOptions(speakerId).length;
  if (channelCount === 0) {
    return 'No live translation channels available yet';
  }

  return `${channelCount} live translation channel${channelCount === 1 ? '' : 's'} available`;
};

const toggleSpokenTranslation = () => {
  if (!canChangeSpokenLanguage.value || isSaving.value) {
    return;
  }

  localSpokenEnabled.value = !localSpokenEnabled.value;
};

const handleSpokenLanguageChange = (event: Event) => {
  const target = event.target as HTMLSelectElement | null;
  if (!target) {
    return;
  }

  localSpokenLanguage.value = target.value;
};

const handleDefaultOutputLanguageChange = (event: Event) => {
  const target = event.target as HTMLSelectElement | null;
  if (!target) {
    return;
  }

  localDefaultOutputLanguage.value = target.value || null;
  selectedVoiceId.value = null;
  availableVoices.value = null;
  voicesFetchedForKey.value = null;
};

const handleDefaultListenLanguageChange = (event: Event) => {
  const target = event.target as HTMLSelectElement | null;
  if (!target) {
    return;
  }

  localDefaultListenLanguage.value = target.value || null;
};

const handleSpeakerPreferenceChange = (speakerId: string | undefined, event: Event) => {
  if (!speakerId) {
    return;
  }

  const target = event.target as HTMLSelectElement | null;
  if (!target) {
    return;
  }

  const value = target.value;
  localListenPreferences.value = new Map(localListenPreferences.value);
  if (value === 'original') {
    localListenPreferences.value.delete(speakerId);
    return;
  }

  localListenPreferences.value.set(speakerId, value);
};

const handleSubtitleToggle = () => {
  if (isSaving.value || !canToggleSubtitles.value) {
    return;
  }

  currentParams.value.updateShowSubtitlesOnCards?.(!showSubtitlesOnCards.value);
};

const handleVoiceModeChange = (mode: VoiceSelectionMode) => {
  if (isSaving.value) {
    return;
  }

  voiceSelectionMode.value = mode;
  if (mode === 'basic') {
    selectedVoiceId.value = null;
    selectedVoiceClone.value = null;
  }

  if (mode === 'advanced') {
    selectedVoiceClone.value = null;
  }
};

const handleVoiceGenderSelect = (gender: VoiceGender) => {
  if (isSaving.value) {
    return;
  }

  selectedVoiceGender.value = gender;
  selectedVoiceId.value = null;
  selectedVoiceClone.value = null;
};

const handleVoiceProviderChange = (event: Event) => {
  const target = event.target as HTMLSelectElement | null;
  if (!target) {
    return;
  }

  selectedTTSProvider.value = normalizeTTSProvider(target.value);
  selectedVoiceId.value = null;
  selectedVoiceClone.value = null;
  availableVoices.value = null;
  voicesFetchedForKey.value = null;
};

const handleVoiceIdChange = (event: Event) => {
  const target = event.target as HTMLSelectElement | null;
  if (!target) {
    return;
  }

  selectedVoiceId.value = target.value || null;
  if (selectedVoiceId.value) {
    selectedVoiceClone.value = null;
  }
};

const handleVoiceCloneSelect = (clone: VoiceCloneOption) => {
  if (isSaving.value) {
    return;
  }

  selectedVoiceClone.value = {
    provider: clone.provider,
    voiceId: clone.voiceId,
  };
  selectedVoiceId.value = null;
};

const areMapsEqual = (left: Map<string, string>, right: Map<string, string>) => {
  if (left.size !== right.size) {
    return false;
  }

  for (const [key, value] of left) {
    if (right.get(key) !== value) {
      return false;
    }
  }

  return true;
};

const hasUnsavedDraftChanges = computed(() => {
  const params = currentParams.value;
  const previousListenPreferences = params.listenPreferences ?? new Map<string, string>();
  const defaultListenLanguage = params.myDefaultListenLanguage ?? null;
  const paramsPerSpeakerMode = defaultListenLanguage === null && previousListenPreferences.size > 0;

  const spokenChanged =
    localSpokenLanguage.value !== (params.mySpokenLanguage || 'en')
    || localSpokenEnabled.value !== params.mySpokenLanguageEnabled
    || localDefaultOutputLanguage.value !== (params.myDefaultOutputLanguage ?? null);

  const listenChanged = perSpeakerMode.value !== paramsPerSpeakerMode
    || (!perSpeakerMode.value
      ? localDefaultListenLanguage.value !== defaultListenLanguage || previousListenPreferences.size > 0
      : !areMapsEqual(localListenPreferences.value, previousListenPreferences) || defaultListenLanguage !== null);

  return spokenChanged || listenChanged;
});

const handleApply = async () => {
  const params = currentParams.value;
  const socket = params.socket;

  if (!socket) {
    notify('Translation is unavailable until the room connection is ready');
    return;
  }

  isSaving.value = true;

  try {
    const spokenChanged =
      localSpokenLanguage.value !== params.mySpokenLanguage
      || localSpokenEnabled.value !== params.mySpokenLanguageEnabled
      || localDefaultOutputLanguage.value !== (params.myDefaultOutputLanguage ?? null);

    const voiceConfig = localSpokenEnabled.value
      ? voiceSelectionMode.value === 'clone' && selectedVoiceClone.value
        ? {
            voiceClone: selectedVoiceClone.value,
          }
        : voiceSelectionMode.value === 'advanced' && selectedVoiceId.value
          ? {
              voiceId: selectedVoiceId.value,
              ttsNickName: selectedTTSProvider.value,
              ttsProvider: selectedTTSProvider.value,
            }
          : {
              voiceGender: selectedVoiceGender.value,
            }
      : undefined;

    const previousListenPreferences = params.listenPreferences ?? new Map<string, string>();
    const listenChanged = !perSpeakerMode.value
      ? localDefaultListenLanguage.value !== (params.myDefaultListenLanguage ?? null) || previousListenPreferences.size > 0
      : !areMapsEqual(localListenPreferences.value, previousListenPreferences) || (params.myDefaultListenLanguage ?? null) !== null;

    if (spokenChanged) {
      socket.emit('translation:setMyLanguage', {
        roomName: params.roomName,
        language: localSpokenLanguage.value,
        defaultOutputLanguage: localDefaultOutputLanguage.value,
        enabled: localSpokenEnabled.value,
        producerId: params.audioProducer?.id ?? null,
        voiceConfig,
      });

      params.updateMySpokenLanguage?.(localSpokenLanguage.value);
      params.updateMyDefaultOutputLanguage?.(localDefaultOutputLanguage.value);
      params.updateMySpokenLanguageEnabled?.(localSpokenEnabled.value);
    }

    if (!perSpeakerMode.value) {
      for (const [speakerId, language] of previousListenPreferences) {
        socket.emit('translation:unsubscribe', {
          roomName: params.roomName,
          speakerId,
          language,
        });
      }

      if (listenChanged) {
        socket.emit('translation:setDefaultListenLanguage', {
          roomName: params.roomName,
          language: localDefaultListenLanguage.value,
        });
      }

      params.updateMyDefaultListenLanguage?.(localDefaultListenLanguage.value);
      params.updateListenPreferences?.(() => new Map());
    } else {
      if ((params.myDefaultListenLanguage ?? null) !== null) {
        socket.emit('translation:setDefaultListenLanguage', {
          roomName: params.roomName,
          language: null,
        });
      }

      for (const [speakerId, language] of localListenPreferences.value) {
        const previousLanguage = previousListenPreferences.get(speakerId);
        if (previousLanguage === language) {
          continue;
        }

        if (previousLanguage) {
          socket.emit('translation:unsubscribe', {
            roomName: params.roomName,
            speakerId,
            language: previousLanguage,
          });
        }

        socket.emit('translation:subscribe', {
          roomName: params.roomName,
          speakerId,
          language,
        });
      }

      for (const [speakerId, language] of previousListenPreferences) {
        if (localListenPreferences.value.has(speakerId)) {
          continue;
        }

        socket.emit('translation:unsubscribe', {
          roomName: params.roomName,
          speakerId,
          language,
        });
      }

      params.updateMyDefaultListenLanguage?.(null);
      params.updateListenPreferences?.(() => new Map(localListenPreferences.value));
    }

    if (spokenChanged || listenChanged) {
      notify('Translation settings saved', 'success');
    }

    handleClose();
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.ms-modern-translation__title-block {
  display: grid;
  gap: 0;
}

.ms-modern-translation__content {
  box-sizing: border-box;
  container-type: inline-size;
}

.ms-modern-translation__tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  padding: 0 18px;
  border-bottom: 1px solid var(--ms-modern-panel-border);
}

.ms-modern-translation__tab-button,
.ms-modern-translation__pill-button,
.ms-modern-translation__action-button,
.ms-modern-translation__toggle-button,
.ms-modern-translation__voice-choice,
.ms-modern-translation__clone-choice,
.ms-modern-translation__clone-link,
.ms-modern-translation__close-button {
  font-family: var(--ms-modern-font-family);
}

.ms-modern-translation__tab-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 12px;
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  background: transparent;
  color: var(--ms-modern-text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
}

.ms-modern-translation__tab-button[data-active='true'] {
  background: rgba(59, 130, 246, 0.08);
  border-bottom-color: var(--ms-modern-brand-primary);
  color: var(--ms-modern-brand-primary);
}

.ms-modern-translation__scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: grid;
  gap: 14px;
  padding: 16px 18px 0;
}

.ms-modern-translation__scroll > * {
  min-width: 0;
}

.ms-modern-translation__intro-card,
.ms-modern-translation__state-card,
.ms-modern-translation__panel,
.ms-modern-translation__note-card,
.ms-modern-translation__state-inline {
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 20px;
  background: var(--ms-modern-panel-surface);
}

.ms-modern-translation__intro-card {
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--ms-modern-text-secondary);
  font-size: 0.86rem;
  line-height: 1.5;
}

.ms-modern-translation__state-card,
.ms-modern-translation__state-inline {
  display: grid;
  gap: 8px;
  place-items: center;
  min-height: 180px;
  padding: 22px;
  text-align: center;
  color: var(--ms-modern-text-secondary);
}

.ms-modern-translation__state-card strong,
.ms-modern-translation__state-inline strong {
  color: var(--ms-modern-text-primary);
}

.ms-modern-translation__panel {
  display: grid;
  gap: 14px;
  padding: 16px;
  border-radius: 16px;
  min-width: 0;
  box-sizing: border-box;
}

.ms-modern-translation__section-heading {
  display: grid;
  gap: 10px;
}

.ms-modern-translation__section-heading--split {
  grid-template-columns: minmax(0, 1fr);
}

.ms-modern-translation__section-heading h3 {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: var(--ms-modern-text-primary);
  font-size: 1rem;
}

.ms-modern-translation__section-heading p,
.ms-modern-translation__subtle-copy,
.ms-modern-translation__speaker-meta span,
.ms-modern-translation__clone-labels span {
  margin: 0;
  color: var(--ms-modern-text-secondary);
  font-size: 0.84rem;
  line-height: 1.45;
}

.ms-modern-translation__banner,
.ms-modern-translation__status,
.ms-modern-translation__note-card {
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 0.84rem;
  line-height: 1.45;
}

.ms-modern-translation__banner {
  border: 1px solid rgba(234, 179, 8, 0.24);
  background: rgba(234, 179, 8, 0.08);
  color: #f59e0b;
  font-weight: 600;
}

.ms-modern-translation__status {
  border: 1px solid rgba(59, 130, 246, 0.18);
  background: rgba(59, 130, 246, 0.08);
  color: var(--ms-modern-text-primary);
}

.ms-modern-translation__status[data-variant='success'] {
  border-color: rgba(34, 197, 94, 0.18);
  background: rgba(34, 197, 94, 0.08);
}

.ms-modern-translation__status[data-variant='muted'] {
  border-color: rgba(148, 163, 184, 0.18);
  background: rgba(148, 163, 184, 0.08);
  color: var(--ms-modern-text-secondary);
}

.ms-modern-translation__field-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
}

.ms-modern-translation__field-grid--single {
  grid-template-columns: minmax(0, 1fr);
}

.ms-modern-translation__field {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.ms-modern-translation__toggle-row {
  display: flex;
}

.ms-modern-translation__field span {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--ms-modern-text-primary);
}

.ms-modern-translation__select,
.ms-modern-translation__search-input {
  border: 1px solid var(--ms-modern-field-border);
  border-radius: 12px;
  background: var(--ms-modern-field-background);
  color: var(--ms-modern-text-primary);
  box-sizing: border-box;
  max-width: 100%;
}

.ms-modern-translation__select {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  min-width: 0;
}

.ms-modern-translation__search-input {
  width: 100%;
  min-height: 42px;
  padding: 10px 12px;
  min-width: 0;
}

.ms-modern-translation__pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ms-modern-translation__pill-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 12px;
  background: var(--ms-modern-field-background);
  color: var(--ms-modern-text-secondary);
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
}

.ms-modern-translation__pill-button[data-active='true'] {
  background: var(--ms-modern-brand-primary);
  border-color: var(--ms-modern-brand-primary);
  color: #fff;
  box-shadow: none;
}

.ms-modern-translation__voice-choice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.ms-modern-translation__voice-choice {
  display: grid;
  gap: 6px;
  padding: 12px;
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 14px;
  background: var(--ms-modern-field-background);
  color: var(--ms-modern-text-primary);
  text-align: left;
  cursor: pointer;
}

.ms-modern-translation__voice-choice[data-active='true'],
.ms-modern-translation__clone-choice[data-active='true'] {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(14, 165, 233, 0.12) 100%);
  border-color: rgba(59, 130, 246, 0.42);
}

.ms-modern-translation__voice-choice span {
  opacity: 0.8;
}

.ms-modern-translation__stack {
  display: grid;
  gap: 12px;
}

.ms-modern-translation__clone-list,
.ms-modern-translation__speaker-list {
  display: grid;
  gap: 10px;
}

.ms-modern-translation__clone-choice,
.ms-modern-translation__speaker-row {
  display: grid;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 14px;
  background: var(--ms-modern-field-background);
}

.ms-modern-translation__clone-choice {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  color: var(--ms-modern-text-primary);
  text-align: left;
  cursor: pointer;
}

.ms-modern-translation__clone-badge {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(14, 165, 233, 0.14);
  color: var(--ms-modern-text-primary);
  font-size: 0.74rem;
  font-weight: 700;
}

.ms-modern-translation__clone-link {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 100%);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
}

.ms-modern-translation__speaker-row {
  grid-template-columns: minmax(0, 1fr);
}

.ms-modern-translation__speaker-meta {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.ms-modern-translation__speaker-meta strong {
  color: var(--ms-modern-text-primary);
}

.ms-modern-translation__speaker-toolbar {
  display: flex;
}

.ms-modern-translation__toggle-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--ms-modern-text-primary);
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
}

.ms-modern-translation__toggle-track {
  position: relative;
  width: 46px;
  height: 26px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.3);
  transition: background-color 0.2s ease;
}

.ms-modern-translation__toggle-track[data-active='true'] {
  background: linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 100%);
}

.ms-modern-translation__toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.25);
  transition: transform 0.2s ease;
}

.ms-modern-translation__toggle-track[data-active='true'] .ms-modern-translation__toggle-thumb {
  transform: translateX(20px);
}

.ms-modern-translation__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 18px 18px;
  border-top: none;
  background: transparent;
}

.ms-modern-translation__action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 160px;
  min-height: 40px;
  padding: 0 15px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
}

.ms-modern-translation__action-button--primary {
  background: var(--ms-modern-brand-primary);
  color: #fff;
  box-shadow: none;
}

.ms-modern-translation__action-button--secondary {
  background: var(--ms-modern-field-background);
  border-color: var(--ms-modern-panel-border);
  color: var(--ms-modern-text-primary);
}

.ms-modern-translation__tab-button:disabled,
.ms-modern-translation__pill-button:disabled,
.ms-modern-translation__action-button:disabled,
.ms-modern-translation__toggle-button:disabled,
.ms-modern-translation__voice-choice:disabled,
.ms-modern-translation__clone-choice:disabled,
.ms-modern-translation__close-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@container (min-width: 720px) {
  .ms-modern-translation__content[data-embedded='true'] .ms-modern-translation__section-heading--split {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }

  .ms-modern-translation__content[data-embedded='true'] .ms-modern-translation__field-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ms-modern-translation__content[data-embedded='true'] .ms-modern-translation__speaker-row {
    grid-template-columns: minmax(0, 1fr) 220px;
    align-items: center;
  }
}

@media (max-width: 640px) {
  .ms-modern-translation__tabs {
    padding: 0 12px;
  }

  .ms-modern-translation__scroll {
    padding: 14px 16px 0;
  }

  .ms-modern-translation__footer {
    flex-direction: column-reverse;
    padding: 12px 16px 16px;
  }

  .ms-modern-translation__action-button {
    width: 100%;
    min-width: 0;
  }
}
</style>