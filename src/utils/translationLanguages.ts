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
