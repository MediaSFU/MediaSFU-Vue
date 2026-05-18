<template>
  <ClassicPanelistsModal v-bind="mergedProps" />
</template>

<script setup lang="ts">
import {
  computed,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
} from 'vue';
import ClassicPanelistsModal from '../../components/panelistsComponents/PanelistsModal.vue';
import type { PanelistsModalProps } from '../../components/panelistsComponents/PanelistsModal.vue';
import { mergeAttrObjects } from '../display_components/styleUtils';

type ModernPanelistsRenderMode = 'modal' | 'sidebar' | 'inline';

export interface ModernPanelistsModalProps extends PanelistsModalProps {
  renderMode?: ModernPanelistsRenderMode;
}

const props = defineProps<ModernPanelistsModalProps>();
const isEmbedded = computed(() => props.renderMode === 'sidebar' || props.renderMode === 'inline');

const panelGradientBackground =
  'linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-panel-surface) 100%)';

const defaultContentProps = computed<HTMLAttributes>(() => ({
  class: 'ms-modern-panelists-modal__content',
  style: {
    background: panelGradientBackground,
    border: '1px solid var(--ms-modern-panel-border)',
    borderRadius: '28px',
    boxShadow: 'var(--ms-modern-shadow-elevated)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    color: 'var(--ms-modern-text-primary)',
  },
}));

const embeddedOverlayProps = computed<HTMLAttributes>(() => ({
  style: {
    position: 'static',
    top: 'auto',
    right: 'auto',
    bottom: 'auto',
    left: 'auto',
    width: '100%',
    height: '100%',
    minHeight: 0,
    backgroundColor: 'transparent',
    display: 'block',
    zIndex: 'auto',
  },
}));

const embeddedContentProps = computed<HTMLAttributes>(() => ({
  class: 'ms-modern-panelists-modal__content ms-modern-panelists-modal__content--embedded',
  style: {
    position: 'relative',
    top: 'auto',
    right: 'auto',
    bottom: 'auto',
    left: 'auto',
    width: '100%',
    maxWidth: 'none',
    maxHeight: 'none',
    height: '100%',
    minWidth: 0,
    margin: 0,
    padding: 0,
    background: panelGradientBackground,
    border: '1px solid var(--ms-modern-panel-border)',
    borderRadius: '24px',
    boxShadow: 'var(--ms-modern-shadow-elevated)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    overflow: 'hidden',
    color: 'var(--ms-modern-text-primary)',
    boxSizing: 'border-box',
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

const defaultBadgeWrapperProps: HTMLAttributes = {
  style: {
    padding: '3px',
    borderRadius: '9999px',
    background:
      'linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 55%, var(--ms-modern-accent) 100%)',
    boxShadow: 'var(--ms-modern-shadow-soft)',
  },
};

const defaultBadgeProps: HTMLAttributes = {
  style: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '36px',
    minHeight: '32px',
    paddingInline: '12px',
    borderRadius: '9999px',
    border: '1px solid var(--ms-modern-panel-border)',
    background: 'var(--ms-modern-field-background)',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontSize: '0.8rem',
    fontWeight: 700,
  },
};

const defaultCloseButtonProps: ButtonHTMLAttributes = {
  style: {
    width: '38px',
    height: '38px',
    borderRadius: '9999px',
    border: '1px solid var(--ms-modern-panel-border)',
    background: 'var(--ms-modern-field-background)',
    color: 'var(--ms-modern-text-primary)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    cursor: 'pointer',
  },
};

const defaultBodyProps: HTMLAttributes = {
  style: {
    padding: '0 22px 22px',
    color: 'var(--ms-modern-text-secondary)',
  },
};

const defaultFocusSectionProps: HTMLAttributes = {
  style: {
    border: '1px solid var(--ms-modern-panel-border)',
    background: 'var(--ms-modern-panel-surface)',
  },
};

const defaultSearchInputProps: InputHTMLAttributes = {
  style: {
    background: 'var(--ms-modern-field-background)',
    border: '1px solid var(--ms-modern-field-border)',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
  },
};

const mergedProps = computed(() => ({
  ...props,
  isPanelistsModalVisible: isEmbedded.value ? true : props.isPanelistsModalVisible,
  backgroundColor: props.backgroundColor ?? 'var(--ms-modern-panel-surface-elevated)',
  overlayProps: mergeAttrObjects(
    isEmbedded.value ? embeddedOverlayProps.value : { style: { backgroundColor: 'transparent' } },
    props.overlayProps,
  ),
  contentProps: mergeAttrObjects(
    isEmbedded.value ? embeddedContentProps.value : defaultContentProps.value,
    props.contentProps,
  ),
  headerProps: mergeAttrObjects(defaultHeaderProps, props.headerProps),
  titleProps: mergeAttrObjects(defaultTitleProps, props.titleProps),
  badgeWrapperProps: mergeAttrObjects(defaultBadgeWrapperProps, props.badgeWrapperProps),
  badgeProps: mergeAttrObjects(defaultBadgeProps, props.badgeProps),
  closeButtonProps: mergeAttrObjects(defaultCloseButtonProps, props.closeButtonProps),
  bodyProps: mergeAttrObjects(defaultBodyProps, props.bodyProps),
  focusSectionProps: mergeAttrObjects(defaultFocusSectionProps, props.focusSectionProps),
  searchInputProps: mergeAttrObjects(defaultSearchInputProps, props.searchInputProps),
}));
</script>

<style scoped>
:deep(.ms-panelists-modal__eyebrow) {
  color: rgba(191, 219, 254, 0.72);
}

:deep(.ms-panelists-modal__focus-status) {
  background: rgba(148, 163, 184, 0.14);
  color: var(--ms-modern-text-primary);
}

:deep(.ms-panelists-modal__focus-status[data-active='true']) {
  background: rgba(45, 212, 191, 0.18);
  color: #99f6e4;
}

:deep(.ms-panelists-modal__focus-text),
:deep(.ms-panelists-modal__helper-text),
:deep(.ms-panelists-modal__section-header p),
:deep(.ms-panelists-modal__person-meta span),
:deep(.ms-panelists-modal__empty-state) {
  color: var(--ms-modern-text-secondary);
}

:deep(.ms-panelists-modal__panel),
:deep(.ms-panelists-modal__person-row) {
  border-color: var(--ms-modern-panel-border);
  background: var(--ms-modern-panel-surface);
}

:deep(.ms-panelists-modal__section-count) {
  background: rgba(148, 163, 184, 0.14);
  color: var(--ms-modern-text-primary);
}

:deep(.ms-panelists-modal__person-meta strong),
:deep(.ms-panelists-modal__section-header h3) {
  color: var(--ms-modern-text-primary);
}

:deep(.ms-panelists-modal__action-button--primary) {
  background: linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 100%);
  color: #fff;
  box-shadow: var(--ms-modern-shadow-soft);
}

:deep(.ms-panelists-modal__action-button--secondary) {
  background: var(--ms-modern-field-background);
  color: var(--ms-modern-text-primary);
  border-color: var(--ms-modern-panel-border);
}

:deep(.ms-panelists-modal__checkbox-row) {
  color: var(--ms-modern-text-primary);
}

:deep(.ms-panelists-modal__checkbox-row input) {
  accent-color: var(--ms-modern-accent);
}

:deep(.ms-modern-panelists-modal__content--embedded .ms-panelists-modal__body) {
  min-height: 0;
  padding: 16px !important;
  gap: 14px;
  overflow-y: auto;
}

:deep(.ms-modern-panelists-modal__content--embedded .ms-panelists-modal__focus) {
  padding: 16px;
}

:deep(.ms-modern-panelists-modal__content--embedded .ms-panelists-modal__focus-options) {
  flex-direction: column;
  gap: 10px;
}

:deep(.ms-modern-panelists-modal__content--embedded .ms-panelists-modal__columns) {
  grid-template-columns: 1fr;
  gap: 14px;
}

:deep(.ms-modern-panelists-modal__content--embedded .ms-panelists-modal__panel) {
  min-height: 220px;
  padding: 16px;
}

:deep(.ms-modern-panelists-modal__content--embedded .ms-panelists-modal__person-row) {
  flex-direction: column;
  align-items: stretch;
}

:deep(.ms-modern-panelists-modal__content--embedded .ms-panelists-modal__action-button) {
  width: 100%;
}
</style>