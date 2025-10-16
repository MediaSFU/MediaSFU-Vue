/*
 * Shared helpers for building demo UI override configurations.
 *
 * Each entry point (AppBroadcast, AppConference, etc.) can import this
 * utility to quickly wire the new `uiOverrides` prop with themed card
 * components that build on top of MediaSFU's default cards.
 */

import { h, type Component } from 'vue';
import VideoCard from '../../components/displayComponents/VideoCard.vue';
import AudioCard from '../../components/displayComponents/AudioCard.vue';
import MiniCard from '../../components/displayComponents/MiniCard.vue';
import type { MediasfuUICustomOverrides } from '../../types/ui-overrides';

/**
 * Simple palette to theme the shared card overrides across demo apps.
 */
export interface CardOverrideTheme {
  accent: string;
  glow?: string;
  audioBackground?: string;
  miniBackground?: string;
  miniTextColor?: string;
}

type StyleRecord = Record<string, unknown>;
type CardProps = StyleRecord & { customStyle?: StyleRecord };
type AudioCardProps = CardProps & { barColor?: string };

/**
 * Build a `uiOverrides` object with themed card components.
 */
export const createCardOverrides = ({
  accent,
  glow = 'rgba(14, 165, 233, 0.28)',
  audioBackground = 'rgba(14, 165, 233, 0.18)',
  miniBackground = 'rgba(14, 165, 233, 0.12)',
  miniTextColor = '#0f172a',
}: CardOverrideTheme): MediasfuUICustomOverrides => {
  const VideoCardOverride = ((props: CardProps) => {
    const { customStyle, ...rest } = props;
    return h(VideoCard as Component, {
      ...rest,
      customStyle: {
        ...(customStyle ?? {}),
        borderRadius: '16px',
        border: `2px solid ${accent}`,
        boxShadow: `0 12px 28px ${glow}`,
      },
    } as StyleRecord);
  }) as unknown as Component;

  const AudioCardOverride = ((props: AudioCardProps) => {
    const { customStyle, barColor, ...rest } = props;
    return h(AudioCard as Component, {
      ...rest,
      barColor: barColor ?? accent,
      customStyle: {
        ...(customStyle ?? {}),
        borderRadius: '14px',
        border: `2px solid ${accent}`,
        background: audioBackground,
      },
    } as StyleRecord);
  }) as unknown as Component;

  const MiniCardOverride = ((props: CardProps) => {
    const { customStyle, ...rest } = props;
    return h(MiniCard as Component, {
      ...rest,
      customStyle: {
        ...(customStyle ?? {}),
        borderRadius: '12px',
        border: `2px solid ${accent}`,
        background: miniBackground,
        color: miniTextColor,
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      },
    } as StyleRecord);
  }) as unknown as Component;

  return {
    videoCard: { component: VideoCardOverride },
    audioCard: { component: AudioCardOverride },
    miniCard: { component: MiniCardOverride },
  } satisfies MediasfuUICustomOverrides;
};
