<template>
  <ClassicLoadingModal v-bind="mergedProps">
    <template
      v-for="(_, slotName) in slots"
      :key="slotName"
      #[slotName]="slotProps"
    >
      <slot
        :name="slotName"
        v-bind="slotProps ?? {}"
      />
    </template>
  </ClassicLoadingModal>
</template>

<script setup lang="ts">
import { computed, useSlots, type HTMLAttributes } from 'vue';
import ClassicLoadingModal from '../../components/displayComponents/LoadingModal.vue';
import type { LoadingModalProps } from '../../components/displayComponents/LoadingModal.vue';
import { mergeAttrObjects } from './styleUtils';

const props = defineProps<LoadingModalProps>();
const slots = useSlots();

const resolvedShowSpinner = computed(() => props.showSpinner ?? true);

const defaultContainerProps: HTMLAttributes = {
  style: {
    background: 'rgba(2, 8, 23, 0.74)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
  },
};

const defaultContentProps = computed<HTMLAttributes>(() => ({
  style: {
    width: 'fit-content',
    minWidth: resolvedShowSpinner.value ? '220px' : '0',
    maxWidth: 'min(320px, calc(100vw - 32px))',
    padding: resolvedShowSpinner.value ? '22px 24px' : '16px 18px',
    borderRadius: '22px',
    border: '1px solid rgba(148, 163, 184, 0.14)',
    background:
      'linear-gradient(180deg, rgba(15, 27, 49, 0.97) 0%, rgba(8, 17, 32, 0.99) 100%)',
    boxShadow: '0 18px 30px rgba(2, 8, 23, 0.26)',
    color: 'var(--ms-modern-text-primary)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    gap: resolvedShowSpinner.value ? '14px' : '0',
  },
}));

const defaultSpinnerWrapperProps = computed<HTMLAttributes>(() => ({
  style: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    margin: '0 auto',
    borderRadius: '9999px',
    border: 'none',
    background: 'var(--ms-modern-brand-primary)',
    boxShadow: '0 10px 20px rgba(15, 23, 42, 0.24)',
  },
}));

const defaultTextProps = computed<HTMLAttributes>(() => ({
  style: {
    color: resolvedDisplayColor.value,
    fontFamily: 'var(--ms-modern-font-family)',
    fontWeight: 700,
    fontSize: '0.96rem',
    lineHeight: 1.3,
    letterSpacing: '0.01em',
    textAlign: 'center',
  },
}));

const resolvedDisplayColor = computed(() => {
  if (!props.displayColor || props.displayColor === 'black') {
    return 'var(--ms-modern-brand-primary)';
  }

  return props.displayColor;
});

const resolvedSpinnerProps = computed<Record<string, unknown>>(() => {
  const spinnerProps = props.spinnerProps ?? {};
  const { style: spinnerStyle, ...restSpinnerProps } = spinnerProps;

  return {
    ...restSpinnerProps,
    style: {
      fontSize: '26px',
      color: '#ffffff',
      ...(typeof spinnerStyle === 'object' ? spinnerStyle as Record<string, unknown> : {}),
    },
  };
});

const mergedProps = computed(() => ({
  ...props,
  backgroundColor: props.backgroundColor ?? 'rgba(15, 27, 49, 0.96)',
  displayColor: resolvedDisplayColor.value,
  loadingText: props.loadingText ?? 'Loading...',
  showSpinner: resolvedShowSpinner.value,
  containerProps: mergeAttrObjects(defaultContainerProps, props.containerProps),
  contentProps: mergeAttrObjects(defaultContentProps.value, props.contentProps),
  spinnerWrapperProps: mergeAttrObjects(defaultSpinnerWrapperProps.value, props.spinnerWrapperProps),
  spinnerProps: resolvedSpinnerProps.value,
  textProps: mergeAttrObjects(defaultTextProps.value, props.textProps),
}));
</script>