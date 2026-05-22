<template>
  <div
    v-if="isTranslationSettingsModalVisible"
    v-bind="mergedOverlayProps"
    @click.self="handleClose"
  >
    <section v-bind="mergedContentProps">
      <header v-bind="mergedHeaderProps">
        <div class="ms-translation-modal__heading">
          <div class="ms-translation-modal__title-block">
            <span class="ms-translation-modal__eyebrow">Live interpretation</span>
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
        <section
          v-if="!translationAvailable"
          class="ms-translation-modal__empty-state"
        >
          Translation is not enabled for this room yet.
        </section>

        <section
          v-else-if="!roomSupportsTranslation"
          class="ms-translation-modal__empty-state"
        >
          <div class="ms-translation-modal__pending-state">
            <strong>Personal translation is being prepared.</strong>
            <span v-if="currentParams.personalTranslationUsername">
              MediaSFU will try to activate translation using {{ currentParams.personalTranslationUsername }} credits for this joiner.
            </span>
            <span v-else>
              MediaSFU will try to activate translation using your personal translation eligibility for this joiner.
            </span>
          </div>
        </section>

        <template v-else>
          <section class="ms-translation-modal__card">
            <div class="ms-translation-modal__section-heading">
              <div>
                <h3>Speaking</h3>
                <p>Tell the room what language you speak and whether your audio should be translated for listeners.</p>
              </div>
              <label class="ms-translation-modal__toggle-row">
                <input
                  v-model="localSpokenEnabled"
                  type="checkbox"
                  :disabled="!canChangeSpokenLanguage || isSaving"
                >
                <span>Enable spoken translation</span>
              </label>
            </div>

            <div
              v-if="isPersonalTranslation"
              class="ms-translation-modal__personal-banner"
            >
              Translation for this room is billed against your personal credits.
            </div>

            <div class="ms-translation-modal__form-grid">
              <label class="ms-translation-modal__field">
                <span>Spoken language</span>
                <select
                  class="ms-translation-modal__select"
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

              <label class="ms-translation-modal__field">
                <span>Default translated output</span>
                <select
                  class="ms-translation-modal__select"
                  :value="localDefaultOutputLanguage ?? ''"
                  :disabled="!canChangeSpokenLanguage || isSaving"
                  @change="handleDefaultOutputLanguageChange"
                >
                  <option value="">Same as spoken language</option>
                  <option
                    v-for="language in listenLanguageOptions"
                    :key="`output-${language.code}`"
                    :value="language.code"
                  >
                    {{ language.name }}
                  </option>
                </select>
              </label>
            </div>

            <div class="ms-translation-modal__voice-section">
              <div class="ms-translation-modal__voice-heading">
                <div>
                  <h4>Voice output</h4>
                  <p>Pick a general translated voice style or pin a specific provider voice for your translated speech.</p>
                </div>
              </div>

              <div class="ms-translation-modal__mode-toggle">
                <button
                  v-bind="resolveModeButtonProps(voiceSelectionMode === 'basic')"
                  @click="handleVoiceModeChange('basic')"
                >
                  Basic voice
                </button>
                <button
                  v-bind="resolveModeButtonProps(voiceSelectionMode === 'advanced')"
                  @click="handleVoiceModeChange('advanced')"
                >
                  Specific voice
                </button>
                <button
                  v-bind="resolveModeButtonProps(voiceSelectionMode === 'clone')"
                  @click="handleVoiceModeChange('clone')"
                >
                  Voice clone
                </button>
              </div>

              <div
                v-if="voiceSelectionMode === 'basic'"
                class="ms-translation-modal__voice-choice-grid"
              >
                <button
                  v-for="option in voiceGenderOptions"
                  :key="option.value"
                  class="ms-translation-modal__voice-choice"
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
                class="ms-translation-modal__voice-advanced"
              >
                <div class="ms-translation-modal__form-grid">
                  <label class="ms-translation-modal__field">
                    <span>TTS provider</span>
                    <select
                      class="ms-translation-modal__select"
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

                  <label class="ms-translation-modal__field">
                    <span>Specific voice</span>
                    <select
                      class="ms-translation-modal__select"
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

                <p class="ms-translation-modal__voice-hint">
                  {{ voiceAdvancedHint }}
                </p>
              </div>

              <div
                v-else
                class="ms-translation-modal__voice-advanced"
              >
                <div class="ms-translation-modal__clone-banner">
                  Pick one of your saved cloned voices for translated speech. If you do not see one here yet, create it on the MediaSFU web clone page first.
                </div>

                <div
                  v-if="resolvedVoiceClones.length"
                  class="ms-translation-modal__clone-list"
                >
                  <button
                    v-for="clone in resolvedVoiceClones"
                    :key="clone.key"
                    class="ms-translation-modal__clone-choice"
                    :data-active="selectedVoiceClone?.voiceId === clone.voiceId"
                    :disabled="isSaving"
                    @click="handleVoiceCloneSelect(clone)"
                  >
                    <div class="ms-translation-modal__clone-labels">
                      <strong>{{ clone.name }}</strong>
                      <span>{{ clone.provider }}</span>
                    </div>
                    <span
                      v-if="clone.isDefault"
                      class="ms-translation-modal__clone-badge"
                    >
                      Default
                    </span>
                  </button>
                </div>

                <div
                  v-else
                  class="ms-translation-modal__clone-empty"
                >
                  <p>No cloned voices are available on this room instance yet.</p>
                  <a
                    class="ms-translation-modal__clone-link"
                    href="https://mediasfu.com/lite/voice-clone"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open voice clone page
                  </a>
                </div>

                <p class="ms-translation-modal__voice-hint">
                  {{ voiceCloneHint }}
                </p>
              </div>
            </div>
          </section>

          <section class="ms-translation-modal__card">
            <div class="ms-translation-modal__section-heading">
              <div>
                <h3>Listening</h3>
                <p>Pick one default translation language for the room or override speakers individually when channels are available.</p>
              </div>
            </div>

            <div class="ms-translation-modal__mode-toggle">
              <button
                v-bind="resolveModeButtonProps(!perSpeakerMode)"
                @click="perSpeakerMode = false"
              >
                Default language
              </button>
              <button
                v-bind="resolveModeButtonProps(perSpeakerMode)"
                @click="perSpeakerMode = true"
              >
                Per speaker
              </button>
            </div>

            <div
              v-if="!perSpeakerMode"
              class="ms-translation-modal__default-listen"
            >
              <label class="ms-translation-modal__field">
                <span>Default listening language</span>
                <select
                  class="ms-translation-modal__select"
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

            <div v-else>
              <div class="ms-translation-modal__speaker-toolbar">
                <input
                  v-model="speakerSearch"
                  v-bind="mergedSearchInputProps"
                  type="search"
                  placeholder="Search speakers"
                >
              </div>

              <div class="ms-translation-modal__speaker-list">
                <div
                  v-if="filteredOtherParticipants.length === 0"
                  class="ms-translation-modal__empty-state"
                >
                  {{ normalizedSpeakerSearch ? 'No speakers match that search.' : 'No other participants are available yet.' }}
                </div>

                <div
                  v-for="(participant, index) in filteredOtherParticipants"
                  :key="participant.id || `${participant.name || 'speaker'}-${index}`"
                  class="ms-translation-modal__speaker-row"
                >
                  <div class="ms-translation-modal__speaker-meta">
                    <strong>{{ participant.name || 'Unnamed participant' }}</strong>
                    <span>{{ getSpeakerRowHint(participant.id) }}</span>
                  </div>

                  <select
                    class="ms-translation-modal__select"
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

          <section class="ms-translation-modal__card">
            <div class="ms-translation-modal__section-heading">
              <div>
                <h3>Subtitles</h3>
                <p>Control whether translated captions appear directly on participant cards.</p>
              </div>
              <label class="ms-translation-modal__toggle-row">
                <input
                  :checked="showSubtitlesOnCards"
                  type="checkbox"
                  :disabled="isSaving || !canToggleSubtitles"
                  @change="handleSubtitleToggle"
                >
                <span>{{ showSubtitlesOnCards ? 'Shown on cards' : 'Hidden on cards' }}</span>
              </label>
            </div>
          </section>

          <div class="ms-translation-modal__actions">
            <button
              v-bind="resolveActionButtonProps('secondary', isSaving)"
              @click="handleClose"
            >
              Close
            </button>
            <button
              v-bind="resolveActionButtonProps('primary', isSaving || !roomSupportsTranslation)"
              @click="handleApply"
            >
              {{ isSaving ? 'Saving...' : 'Apply translation settings' }}
            </button>
          </div>
        </template>
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
import type { Participant, TranslationVoiceConfig } from 'mediasfu-shared';
import type { Socket } from 'socket.io-client';
import type { TranslationRoomConfig } from '../../services/translationReceiveMethods';
import {
  COMMON_LANGUAGE_CODES,
  TTS_PROVIDERS,
  fetchVoicesViaSocket,
  getLanguageName,
  type TTSProvider,
  type VoiceGender,
  type VoiceOption,
} from '../../utils/translationLanguages';

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

export interface TranslationSettingsModalParameters {
  translationConfig: TranslationRoomConfig | null;
  isPersonalTranslation?: boolean;
  canUsePersonalTranslation?: boolean;
  personalTranslationUsername?: string;
  userVoiceClones?: Array<{
    id?: string;
    providerVoiceId?: string;
    voiceId?: string;
    name?: string;
    provider?: string;
    isDefault?: boolean;
  }>;
  member: string;
  islevel: string;
  audioProducer?: { id?: string } | null;
  participants: Participant[];
  mySpokenLanguage: string;
  mySpokenLanguageEnabled: boolean;
  myDefaultOutputLanguage?: string | null;
  myDefaultListenLanguage?: string | null;
  listenPreferences: Map<string, string>;
  availableTranslationChannels: Map<string, TranslationChannelAvailability>;
  showSubtitlesOnCards?: boolean;
  updateMySpokenLanguage?: (lang: string) => void;
  updateMySpokenLanguageEnabled?: (enabled: boolean) => void;
  updateMyDefaultOutputLanguage?: (lang: string | null) => void;
  updateMyDefaultListenLanguage?: (lang: string | null) => void;
  updateListenPreferences?: (updater: (prev: Map<string, string>) => Map<string, string>) => void;
  updateShowSubtitlesOnCards?: (value: boolean) => void;
  socket: Socket;
  roomName: string;
  showAlert?: (options: { message: string; type: string; duration?: number }) => void;
  getUpdatedAllParams?: () => TranslationSettingsModalParameters;
  [key: string]: unknown;
}

export interface TranslationSettingsModalProps {
  isTranslationSettingsModalVisible: boolean;
  onTranslationSettingsClose: () => void;
  parameters: TranslationSettingsModalParameters;
  backgroundColor?: string;
  position?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft' | 'center';
  title?: string;
  overlayProps?: HTMLAttributes;
  contentProps?: HTMLAttributes;
  headerProps?: HTMLAttributes;
  titleProps?: HTMLAttributes;
  closeButtonProps?: ButtonHTMLAttributes;
  bodyProps?: HTMLAttributes;
  searchInputProps?: InputHTMLAttributes;
  actionButtonProps?: ButtonHTMLAttributes;
  secondaryActionButtonProps?: ButtonHTMLAttributes;
}

const props = withDefaults(defineProps<TranslationSettingsModalProps>(), {
  backgroundColor: '#ffffff',
  position: 'topRight',
  title: 'Translation Settings',
});

const allLanguages: LanguageOption[] = COMMON_LANGUAGE_CODES.map((code) => ({
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
    return 'Choose a translated output language above before selecting a specific provider voice.';
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

  let codes = [...COMMON_LANGUAGE_CODES];

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

const positionStyle = computed<CSSProperties>(() => {
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
      class: 'ms-translation-modal__overlay',
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
      class: 'ms-translation-modal__content',
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
  mergeProps({ class: 'ms-translation-modal__header' }, props.headerProps ?? {})
);

const mergedTitleProps = computed(() =>
  mergeProps({ class: 'ms-translation-modal__title' }, props.titleProps ?? {})
);

const mergedCloseButtonProps = computed(() =>
  mergeProps(
    {
      class: 'ms-translation-modal__close-button',
      type: 'button',
    },
    props.closeButtonProps ?? {}
  )
);

const mergedBodyProps = computed(() =>
  mergeProps({ class: 'ms-translation-modal__body' }, props.bodyProps ?? {})
);

const mergedSearchInputProps = computed(() =>
  mergeProps({ class: 'ms-translation-modal__search-input' }, props.searchInputProps ?? {})
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
    if (visible) {
      syncFromParams();
      return;
    }

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
    props.parameters.translationConfig,
    props.parameters.mySpokenLanguage,
    props.parameters.mySpokenLanguageEnabled,
    props.parameters.myDefaultOutputLanguage,
    props.parameters.myDefaultListenLanguage,
    props.parameters.listenPreferences,
  ],
  () => {
    if (props.isTranslationSettingsModalVisible) {
      syncFromParams();
    }
  },
  { deep: true }
);

watch(
  () => [
    props.isTranslationSettingsModalVisible,
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

const notify = (message: string, type: string = 'danger') => {
  currentParams.value.showAlert?.({
    message,
    type,
    duration: 3000,
  });
};

const resolveModeButtonProps = (active: boolean) =>
  mergeProps(
    {
      class: 'ms-translation-modal__mode-button',
      'data-active': active,
      type: 'button',
      disabled: !canChangeListenLanguage.value || isSaving.value,
    },
    props.secondaryActionButtonProps ?? {}
  );

const resolveActionButtonProps = (
  variant: 'primary' | 'secondary',
  disabled: boolean
) =>
  mergeProps(
    {
      class: [
        'ms-translation-modal__action-button',
        variant === 'primary'
          ? 'ms-translation-modal__action-button--primary'
          : 'ms-translation-modal__action-button--secondary',
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
  const availableCodes = currentParams.value.availableTranslationChannels.get(speakerId)?.languages ?? [];
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
  currentParams.value.updateShowSubtitlesOnCards?.(!showSubtitlesOnCards.value);
};

const handleVoiceModeChange = (mode: VoiceSelectionMode) => {
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
.ms-translation-modal__header {
  padding: 20px 22px 18px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.1);
}

.ms-translation-modal__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.ms-translation-modal__title-block {
  display: grid;
  gap: 6px;
}

.ms-translation-modal__eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(15, 23, 42, 0.52);
}

.ms-translation-modal__title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
}

.ms-translation-modal__close-button {
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

.ms-translation-modal__body {
  display: grid;
  gap: 18px;
  padding: 20px 22px 22px;
  overflow-y: auto;
}

.ms-translation-modal__card {
  display: grid;
  gap: 16px;
  padding: 18px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 20px;
  background: rgba(248, 250, 252, 0.92);
}

.ms-translation-modal__personal-banner {
  padding: 12px 14px;
  border: 1px solid rgba(234, 179, 8, 0.24);
  border-radius: 14px;
  background: rgba(234, 179, 8, 0.08);
  color: #92400e;
  font-size: 0.86rem;
  font-weight: 600;
}

.ms-translation-modal__section-heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: flex-start;
  gap: 16px;
}

.ms-translation-modal__section-heading h3 {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
}

.ms-translation-modal__section-heading p {
  margin: 6px 0 0;
  color: rgba(15, 23, 42, 0.62);
  font-size: 0.84rem;
  line-height: 1.45;
}

.ms-translation-modal__toggle-row {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #0f172a;
  justify-self: flex-start;
}

.ms-translation-modal__toggle-row input {
  accent-color: #0f766e;
}

.ms-translation-modal__form-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
}

.ms-translation-modal__voice-section {
  display: grid;
  gap: 14px;
  padding-top: 4px;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.ms-translation-modal__voice-heading {
  display: grid;
  gap: 6px;
}

.ms-translation-modal__voice-heading h4 {
  margin: 0;
  font-size: 0.95rem;
  color: #0f172a;
}

.ms-translation-modal__voice-heading p,
.ms-translation-modal__voice-hint {
  margin: 0;
  color: rgba(15, 23, 42, 0.58);
  font-size: 0.82rem;
  line-height: 1.45;
}

.ms-translation-modal__voice-choice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.ms-translation-modal__voice-choice {
  display: grid;
  gap: 6px;
  padding: 14px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
  text-align: left;
  cursor: pointer;
}

.ms-translation-modal__voice-choice[data-active='true'] {
  background: #0f172a;
  border-color: #0f172a;
  color: #f8fafc;
}

.ms-translation-modal__voice-choice span {
  font-size: 0.8rem;
  color: inherit;
  opacity: 0.78;
}

.ms-translation-modal__voice-choice:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ms-translation-modal__voice-advanced {
  display: grid;
  gap: 12px;
}

.ms-translation-modal__clone-banner,
.ms-translation-modal__clone-empty {
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.9);
  color: rgba(15, 23, 42, 0.72);
  font-size: 0.82rem;
  line-height: 1.45;
}

.ms-translation-modal__clone-list {
  display: grid;
  gap: 10px;
}

.ms-translation-modal__clone-choice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.94);
  color: #0f172a;
  cursor: pointer;
  text-align: left;
}

.ms-translation-modal__clone-choice[data-active='true'] {
  border-color: #0f172a;
  background: #0f172a;
  color: #f8fafc;
}

.ms-translation-modal__clone-choice:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ms-translation-modal__clone-labels {
  display: grid;
  gap: 3px;
}

.ms-translation-modal__clone-labels span {
  font-size: 0.76rem;
  opacity: 0.72;
}

.ms-translation-modal__clone-badge {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(14, 165, 233, 0.14);
  font-size: 0.74rem;
  font-weight: 700;
}

.ms-translation-modal__clone-empty {
  display: grid;
  gap: 10px;
}

.ms-translation-modal__clone-empty p {
  margin: 0;
}

.ms-translation-modal__clone-link {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  border-radius: 999px;
  background: #0f172a;
  color: #f8fafc;
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 700;
}

.ms-translation-modal__field {
  display: grid;
  gap: 8px;
}

.ms-translation-modal__field span {
  font-size: 0.86rem;
  font-weight: 700;
  color: #0f172a;
}

.ms-translation-modal__select,
.ms-translation-modal__search-input {
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.94);
  color: #0f172a;
}

.ms-translation-modal__select {
  padding: 11px 12px;
}

.ms-translation-modal__search-input {
  width: 100%;
  padding: 12px 14px;
}

.ms-translation-modal__mode-toggle {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ms-translation-modal__mode-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  padding: 10px 14px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: rgba(15, 23, 42, 0.68);
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
}

.ms-translation-modal__mode-button[data-active='true'] {
  background: #0f172a;
  color: #f8fafc;
}

.ms-translation-modal__speaker-toolbar {
  display: flex;
  width: 100%;
}

.ms-translation-modal__speaker-list {
  display: grid;
  gap: 12px;
}

.ms-translation-modal__speaker-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: flex-start;
  gap: 14px;
  padding: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
}

.ms-translation-modal__speaker-row .ms-translation-modal__select {
  width: 100%;
}

.ms-translation-modal__speaker-meta {
  display: grid;
  gap: 4px;
}

.ms-translation-modal__speaker-meta strong {
  color: #0f172a;
}

.ms-translation-modal__speaker-meta span {
  color: rgba(15, 23, 42, 0.58);
  font-size: 0.82rem;
}

.ms-translation-modal__empty-state {
  display: grid;
  place-items: center;
  min-height: 160px;
  padding: 18px;
  border: 1px dashed rgba(15, 23, 42, 0.14);
  border-radius: 16px;
  color: rgba(15, 23, 42, 0.58);
  text-align: center;
}

.ms-translation-modal__pending-state {
  display: grid;
  gap: 10px;
}

.ms-translation-modal__pending-state strong {
  color: #0f172a;
}

.ms-translation-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.ms-translation-modal__action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 160px;
  padding: 11px 16px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

.ms-translation-modal__action-button:disabled,
.ms-translation-modal__mode-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.ms-translation-modal__action-button--primary {
  background: #0f766e;
  color: #f8fafc;
  box-shadow: 0 14px 28px rgba(15, 118, 110, 0.18);
}

.ms-translation-modal__action-button--secondary {
  background: rgba(15, 23, 42, 0.08);
  color: #0f172a;
  border-color: rgba(15, 23, 42, 0.12);
}

@media (max-width: 840px) {
  .ms-translation-modal__content {
    left: 16px !important;
    right: 16px !important;
    width: auto !important;
    max-height: calc(100vh - 32px);
    transform: none !important;
    top: 16px !important;
    bottom: 16px !important;
  }

  .ms-translation-modal__form-grid {
    grid-template-columns: 1fr;
  }

  .ms-translation-modal__section-heading,
  .ms-translation-modal__speaker-row,
  .ms-translation-modal__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .ms-translation-modal__action-button,
  .ms-translation-modal__mode-button {
    width: 100%;
  }
}
</style>