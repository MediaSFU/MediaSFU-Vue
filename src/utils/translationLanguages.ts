export type {
  LanguageMetadata,
  LanguageOption,
  LanguageRegion,
  SocketVoiceResponse,
  TTSProvider,
  TranslationLanguageEntry,
  TranslationVoiceConfig,
  TTSSupport,
  VoiceGender,
  VoiceOption,
  VoiceSelectionPreference,
} from 'mediasfu-shared';

export {
  fetchLanguagesViaSocket,
  fetchVoicesViaSocket,
  getAvailableVoices,
  getLanguageMetadata,
  getLanguageName,
  getLanguageNativeName,
  getSupportedLanguages,
  isLanguageSupported,
  normalizeLanguageCode,
  SUPPORTED_LANGUAGE_CODES,
  TTS_PROVIDERS,
} from 'mediasfu-shared';

// Curated list mirrored from mediasfu-shared COMMON_LANGUAGE_CODES.
// Vue uses the npm mediasfu-shared package, so we define this locally to avoid
// requiring a package update for the UI language picker fix.
export const COMMON_LANGUAGE_CODES: string[] = [
  'en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'ru', 'zh', 'ja', 'ko', 'ar',
  'hi', 'bn', 'tr', 'pl', 'vi', 'th', 'id', 'ms',
  'sw', 'yo', 'ha', 'ig', 'zu', 'am', 'tw',
  'he', 'fa', 'uk', 'el', 'cs', 'ro', 'hu', 'sv', 'da', 'no', 'fi',
];
