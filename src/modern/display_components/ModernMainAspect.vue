<template>
  <ClassicMainAspect v-bind="mergedProps">
    <slot />
  </ClassicMainAspect>
</template>

<script setup lang="ts">
import { computed, type CSSProperties, type HTMLAttributes } from 'vue';
import ClassicMainAspect from '../../components/displayComponents/MainAspectComponent.vue';
import type { MainAspectComponentProps } from '../../components/displayComponents/MainAspectComponent.vue';
import { mergeAttrObjects } from './styleUtils';

export interface ModernMainAspectProps extends MainAspectComponentProps {}

const props = defineProps<ModernMainAspectProps>();

const defaultContainerProps: HTMLAttributes = {
  class: 'ms-modern-main-aspect',
  style: {
    background: 'var(--ms-modern-page-background)',
  } satisfies CSSProperties,
};

const mergedProps = computed(() => ({
  ...props,
  backgroundColor: props.backgroundColor ?? 'var(--ms-modern-page-background)',
  containerProps: mergeAttrObjects(defaultContainerProps, props.containerProps),
}));
</script>