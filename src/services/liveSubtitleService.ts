import { computed, ref, type Ref } from 'vue';
import {
  createLiveSubtitle as createSharedLiveSubtitle,
  getSubtitleForSpeaker as getSharedSubtitleForSpeaker,
  isSubtitleExpired,
  pruneExpiredSubtitles,
  updateLiveSubtitlesFromTranscript,
} from 'mediasfu-shared';
import type { LiveSubtitle, TranslationTranscriptData } from 'mediasfu-shared';

export interface LiveSubtitleService {
  liveSubtitles: Ref<Map<string, LiveSubtitle>>;
  showSubtitlesOnCards: Ref<boolean>;
  activeSubtitles: Readonly<Ref<Map<string, LiveSubtitle>>>;
  setLiveSubtitles: (subtitles: Map<string, LiveSubtitle>) => void;
  setShowSubtitlesOnCards: (show: boolean) => void;
  updateFromTranscript: (transcript: TranslationTranscriptData) => LiveSubtitle;
  clearExpiredSubtitles: (now?: number) => void;
  getSubtitleForSpeaker: (speakerId: string, speakerName?: string) => LiveSubtitle | null;
}

export const createLiveSubtitle = (params: {
  text: string;
  language: string;
  speakerId: string;
  speakerName?: string;
}): LiveSubtitle => {
  return createSharedLiveSubtitle(params);
};

export const createLiveSubtitleService = (): LiveSubtitleService => {
  const liveSubtitles = ref<Map<string, LiveSubtitle>>(new Map());
  const showSubtitlesOnCards = ref(true);

  const clearExpiredSubtitles = (now = Date.now()) => {
    liveSubtitles.value = pruneExpiredSubtitles(liveSubtitles.value, now);
  };

  const setLiveSubtitles = (subtitles: Map<string, LiveSubtitle>) => {
    liveSubtitles.value = new Map(subtitles);
    clearExpiredSubtitles();
  };

  const setShowSubtitlesOnCards = (show: boolean) => {
    showSubtitlesOnCards.value = show;
  };

  const updateFromTranscript = (transcript: TranslationTranscriptData): LiveSubtitle => {
    liveSubtitles.value = updateLiveSubtitlesFromTranscript({
      currentSubtitles: liveSubtitles.value,
      transcript,
    });

    const subtitle = getSharedSubtitleForSpeaker(
      liveSubtitles.value,
      transcript.speakerId,
      transcript.speakerName,
      transcript.timestamp,
    );

    if (!subtitle) {
      throw new Error('Expected live subtitle to be available after transcript update.');
    }

    return subtitle;
  };

  const getSubtitleForSpeaker = (speakerId: string, speakerName?: string): LiveSubtitle | null => {
    const activeSubtitles = pruneExpiredSubtitles(liveSubtitles.value);
    return getSharedSubtitleForSpeaker(activeSubtitles, speakerId, speakerName);
  };

  const activeSubtitles = computed(() => {
    return new Map(pruneExpiredSubtitles(liveSubtitles.value));
  });

  return {
    liveSubtitles,
    showSubtitlesOnCards,
    activeSubtitles,
    setLiveSubtitles,
    setShowSubtitlesOnCards,
    updateFromTranscript,
    clearExpiredSubtitles,
    getSubtitleForSpeaker,
  };
};

export const liveSubtitleService = createLiveSubtitleService();

export type { LiveSubtitle, TranslationTranscriptData } from 'mediasfu-shared';
export {
  isSubtitleExpired,
  pruneExpiredSubtitles,
  updateLiveSubtitlesFromTranscript,
} from 'mediasfu-shared';
