<template>
  <component
    :is="tag"
    class="ms-modern-surface"
    :class="[
      `ms-modern-surface--${tone}`,
      { 'ms-modern-surface--interactive': interactive },
    ]"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    tag?: string;
    tone?: 'base' | 'elevated';
    interactive?: boolean;
  }>(),
  {
    tag: 'div',
    tone: 'base',
    interactive: false,
  },
);
</script>

<style scoped>
.ms-modern-surface {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0)),
    var(--ms-modern-panel-surface);
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: var(--ms-modern-radius-lg);
  box-shadow: var(--ms-modern-shadow-soft);
  backdrop-filter: blur(18px);
}

.ms-modern-surface--elevated {
  background:
    linear-gradient(180deg, rgba(99, 102, 241, 0.08), rgba(255, 255, 255, 0)),
    var(--ms-modern-panel-surface-elevated);
  border-color: var(--ms-modern-panel-border-strong);
  box-shadow: var(--ms-modern-shadow-elevated);
}

.ms-modern-surface--interactive {
  transition:
    transform var(--ms-modern-motion-base) var(--ms-modern-motion-easing),
    border-color var(--ms-modern-motion-base) var(--ms-modern-motion-easing),
    box-shadow var(--ms-modern-motion-base) var(--ms-modern-motion-easing);
}

.ms-modern-surface--interactive:hover {
  transform: translateY(-2px);
  border-color: rgba(99, 102, 241, 0.42);
}
</style>