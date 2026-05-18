<template>
  <ClassicSubAspect v-bind="mergedProps">
    <slot />
  </ClassicSubAspect>
</template>

<script setup lang="ts">
import { computed, type CSSProperties, type HTMLAttributes } from 'vue';
import ClassicSubAspect from '../../components/displayComponents/SubAspectComponent.vue';
import type { SubAspectComponentProps } from '../../components/displayComponents/SubAspectComponent.vue';
import { mergeAttrObjects } from './styleUtils';

export interface ModernSubAspectProps extends SubAspectComponentProps {}

const props = defineProps<ModernSubAspectProps>();

const defaultContainerProps: HTMLAttributes = {
  class: 'ms-modern-sub-aspect',
  style: {
    background: 'var(--ms-modern-panel-surface-elevated)',
    borderTop: '1px solid var(--ms-modern-panel-border)',
  } satisfies CSSProperties,
};

const mergedProps = computed(() => ({
  ...props,
  backgroundColor: props.backgroundColor ?? 'var(--ms-modern-panel-surface-elevated)',
  containerProps: mergeAttrObjects(defaultContainerProps, props.containerProps),
}));
</script>