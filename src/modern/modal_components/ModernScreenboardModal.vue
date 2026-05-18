<template>
  <ClassicScreenboardModal v-bind="mergedProps">
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
  </ClassicScreenboardModal>
</template>

<script setup lang="ts">
import { computed, useSlots, type HTMLAttributes } from 'vue';
import ClassicScreenboardModal from '../../components/screenboardComponents/ScreenboardModal.vue';
import type { ScreenboardModalProps } from '../../components/screenboardComponents/ScreenboardModal.vue';
import { mergeAttrObjects } from '../display_components/styleUtils';

const props = defineProps<ScreenboardModalProps>();
const slots = useSlots();

const panelGradientBackground =
  'linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-panel-surface) 100%)';

const defaultOverlayProps: HTMLAttributes = {
  style: {
    background: 'var(--ms-modern-overlay-backdrop)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  },
};

const defaultContentProps = computed<HTMLAttributes>(() => ({
  style: {
    background: panelGradientBackground,
    border: '1px solid var(--ms-modern-panel-border)',
    borderRadius: '24px',
    boxShadow: 'var(--ms-modern-shadow-elevated)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    overflow: 'hidden',
    color: 'var(--ms-modern-text-primary)',
  },
}));

const defaultHeaderProps: HTMLAttributes = {
  style: {
    padding: '20px 22px 16px',
    borderBottom: '1px solid var(--ms-modern-panel-border)',
    background: panelGradientBackground,
  },
};

const defaultTitleProps: HTMLAttributes = {
  style: {
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '0.01em',
  },
};

const defaultCloseButtonProps: HTMLAttributes = {
  style: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    borderRadius: '9999px',
    border: '1px solid var(--ms-modern-panel-border)',
    background: 'var(--ms-modern-field-background)',
    color: 'var(--ms-modern-text-primary)',
    cursor: 'pointer',
  },
};

const defaultDividerProps: HTMLAttributes = {
  style: {
    borderColor: 'var(--ms-modern-panel-border)',
  },
};

const defaultVideoContainerProps: HTMLAttributes = {
  style: {
    padding: '18px',
    background: 'var(--ms-modern-panel-surface)',
  },
};

const defaultVideoProps: HTMLAttributes = {
  style: {
    borderRadius: '18px',
    overflow: 'hidden',
    boxShadow: 'var(--ms-modern-shadow-soft)',
  },
};

const defaultCanvasProps: HTMLAttributes = {
  style: {
    borderRadius: '18px',
  },
};

const mergedProps = computed(() => ({
  ...props,
  backgroundColor: props.backgroundColor ?? 'var(--ms-modern-panel-surface-elevated)',
  overlayProps: mergeAttrObjects(defaultOverlayProps, props.overlayProps),
  contentProps: mergeAttrObjects(defaultContentProps.value, props.contentProps),
  headerProps: mergeAttrObjects(defaultHeaderProps, props.headerProps),
  titleProps: mergeAttrObjects(defaultTitleProps, props.titleProps),
  closeButtonProps: mergeAttrObjects(defaultCloseButtonProps, props.closeButtonProps),
  dividerProps: mergeAttrObjects(defaultDividerProps, props.dividerProps),
  videoContainerProps: mergeAttrObjects(defaultVideoContainerProps, props.videoContainerProps),
  videoProps: mergeAttrObjects(defaultVideoProps, props.videoProps),
  canvasProps: mergeAttrObjects(defaultCanvasProps, props.canvasProps),
}));
</script>