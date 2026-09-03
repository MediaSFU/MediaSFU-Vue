<template>
  <div :id="resolvedTargetId" class="mediasfu-modern-generic-head" />
</template>

<script setup lang="ts">
import { computed } from 'vue';

export type ModernMediasfuGenericHeadParameters = Record<string, unknown> & {
  getCurrentParams?: () => ModernMediasfuGenericHeadParameters;
  renderModernMediasfuUITarget?: string;
};

const props = defineProps<{
  /** Latest bag published by the one existing room engine. */
  parameters: ModernMediasfuGenericHeadParameters;
  /** Optional explicit id for multiple independently hosted rooms. */
  targetId?: string;
}>();

const current = computed<ModernMediasfuGenericHeadParameters>(() =>
  props.parameters?.getCurrentParams?.() ?? props.parameters ?? {},
);

const resolvedTargetId = computed(() => {
  if (props.targetId) return props.targetId.replace(/^#/, '');
  const target = current.value.renderModernMediasfuUITarget;
  return typeof target === 'string' && /^#[A-Za-z][\w:.-]*$/.test(target)
    ? target.slice(1)
    : 'mediasfu-modern-head';
});
</script>
