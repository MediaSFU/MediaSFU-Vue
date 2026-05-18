<template>
  <ClassicMainContainer v-bind="mergedProps">
    <slot />
  </ClassicMainContainer>
</template>

<script setup lang="ts">
import { computed, type CSSProperties, type HTMLAttributes } from 'vue';
import ClassicMainContainer from '../../components/displayComponents/MainContainerComponent.vue';
import type { MainContainerComponentProps } from '../../components/displayComponents/MainContainerComponent.vue';
import { mergeAttrObjects } from './styleUtils';

export interface ModernMainContainerProps extends MainContainerComponentProps {}

const props = defineProps<ModernMainContainerProps>();

const defaultContainerProps: HTMLAttributes = {
  class: 'ms-modern-main-container',
  style: {
    background: 'var(--ms-modern-page-background)',
    color: 'var(--ms-modern-text-primary)',
  } satisfies CSSProperties,
};

const mergedProps = computed(() => ({
  ...props,
  backgroundColor: 'var(--ms-modern-page-background)',
  containerProps: mergeAttrObjects(defaultContainerProps, props.containerProps),
}));
</script>