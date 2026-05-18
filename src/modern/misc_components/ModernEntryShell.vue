<template>
  <div class="ms-modern-entry-shell">
    <div class="ms-modern-entry-shell__background" />

    <div
      class="ms-modern-entry-shell__content"
      :class="{ 'ms-modern-entry-shell__content--split': showSplitIntro }"
    >
      <div
        v-if="showSplitIntro"
        class="ms-modern-entry-shell__intro"
      >
        <slot name="eyebrow" />
        <slot name="title" />
        <slot name="description" />
      </div>

      <ModernSurface
        class="ms-modern-entry-shell__panel"
        tone="elevated"
      >
        <div
          v-if="showInlineHeader"
          class="ms-modern-entry-shell__header"
        >
          <slot name="eyebrow" />
          <slot name="title" />
          <slot name="description" />
        </div>

        <slot />
      </ModernSurface>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { ModernSurface } from '../primitives';

export type ModernEntryShellLayout = 'inline' | 'split';

export interface ModernEntryShellProps {
  introLayout?: ModernEntryShellLayout;
}

const props = withDefaults(defineProps<ModernEntryShellProps>(), {
  introLayout: 'inline',
});

const slots = useSlots();
const hasHeaderSlots = computed(() => Boolean(slots.eyebrow || slots.title || slots.description));
const showSplitIntro = computed(() => props.introLayout === 'split' && hasHeaderSlots.value);
const showInlineHeader = computed(() => hasHeaderSlots.value && !showSplitIntro.value);
</script>

<style scoped>
.ms-modern-entry-shell {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  min-height: 0;
  max-height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  background:
    radial-gradient(circle at top left, rgba(99, 102, 241, 0.22), transparent 32%),
    radial-gradient(circle at bottom right, rgba(6, 182, 212, 0.16), transparent 30%),
    linear-gradient(180deg, var(--ms-modern-page-background), var(--ms-modern-page-background-accent));
}

.ms-modern-entry-shell__background {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.05) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.8), transparent 85%);
}

.ms-modern-entry-shell__content {
  position: relative;
  z-index: 1;
  width: min(calc(100% - 48px), var(--ms-modern-onboarding-card-max-width));
  min-height: 100%;
  margin: 0 auto;
  padding: clamp(24px, 5vh, 48px) 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  box-sizing: border-box;
}

@supports (align-items: safe center) {
  .ms-modern-entry-shell__content {
    align-items: safe center;
  }
}

.ms-modern-entry-shell__content--split {
  width: min(calc(100% - 48px), var(--ms-modern-content-max-width));
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, var(--ms-modern-onboarding-card-max-width));
  gap: var(--ms-modern-spacing-xxl);
}

.ms-modern-entry-shell__intro {
  display: flex;
  flex-direction: column;
  gap: var(--ms-modern-spacing-md);
  justify-content: center;
  color: var(--ms-modern-text-primary);
}

.ms-modern-entry-shell__header {
  display: flex;
  flex-direction: column;
  gap: var(--ms-modern-spacing-md);
  align-items: center;
  text-align: center;
  color: var(--ms-modern-text-primary);
}

.ms-modern-entry-shell__panel {
  width: min(100%, var(--ms-modern-onboarding-card-max-width));
  padding: var(--ms-modern-spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--ms-modern-spacing-xl);
}

@media (max-width: 640px) {
  .ms-modern-entry-shell__content {
    width: min(calc(100% - 32px), var(--ms-modern-onboarding-card-max-width));
    min-height: 100%;
    align-items: center;
    padding: 18px 0 28px;
  }

  @supports (align-items: safe center) {
    .ms-modern-entry-shell__content {
      align-items: safe center;
    }
  }

  .ms-modern-entry-shell__content--split {
    width: min(calc(100% - 32px), var(--ms-modern-onboarding-card-max-width));
    display: flex;
    gap: 0;
  }

  .ms-modern-entry-shell__intro {
    display: none;
  }

  .ms-modern-entry-shell__panel {
    padding: var(--ms-modern-spacing-lg);
    gap: var(--ms-modern-spacing-lg);
  }
}

@media (max-height: 900px) {
  .ms-modern-entry-shell__content {
    align-items: center;
    padding: 18px 0 28px;
  }

  @supports (align-items: safe center) {
    .ms-modern-entry-shell__content {
      align-items: safe center;
    }
  }

  .ms-modern-entry-shell__panel {
    padding: var(--ms-modern-spacing-lg);
    gap: var(--ms-modern-spacing-lg);
  }
}
</style>