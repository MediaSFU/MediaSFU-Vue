<template>
  <ClassicPermissionsModal v-bind="mergedProps" />
</template>

<script setup lang="ts">
import {
  computed,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
} from 'vue';
import ClassicPermissionsModal from '../../components/permissionsComponents/PermissionsModal.vue';
import type { PermissionsModalProps } from '../../components/permissionsComponents/PermissionsModal.vue';
import { mergeAttrObjects } from '../display_components/styleUtils';

type ModernPermissionsRenderMode = 'modal' | 'sidebar' | 'inline';

export interface ModernPermissionsModalProps extends PermissionsModalProps {
  renderMode?: ModernPermissionsRenderMode;
}

const props = defineProps<ModernPermissionsModalProps>();
const isEmbedded = computed(() => props.renderMode === 'sidebar' || props.renderMode === 'inline');

const panelGradientBackground =
  'linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-panel-surface) 100%)';

const defaultContentProps = computed<HTMLAttributes>(() => ({
  class: 'ms-modern-permissions-modal__content',
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
  class: 'ms-modern-permissions-modal__content ms-modern-permissions-modal__content--embedded',
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

const defaultTabListProps: HTMLAttributes = {
  style: {
    border: '1px solid var(--ms-modern-panel-border)',
    background: 'var(--ms-modern-field-background)',
  },
};

const defaultTabButtonProps: ButtonHTMLAttributes = {
  style: {
    color: 'var(--ms-modern-text-secondary)',
    fontFamily: 'var(--ms-modern-font-family)',
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
  isPermissionsModalVisible: isEmbedded.value ? true : props.isPermissionsModalVisible,
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
  closeButtonProps: mergeAttrObjects(defaultCloseButtonProps, props.closeButtonProps),
  bodyProps: mergeAttrObjects(defaultBodyProps, props.bodyProps),
  tabListProps: mergeAttrObjects(defaultTabListProps, props.tabListProps),
  tabButtonProps: mergeAttrObjects(defaultTabButtonProps, props.tabButtonProps),
  searchInputProps: mergeAttrObjects(defaultSearchInputProps, props.searchInputProps),
}));
</script>

<style scoped>
:deep(.ms-permissions-modal__eyebrow) {
  color: rgba(191, 219, 254, 0.72);
}

:deep(.ms-permissions-modal__section-copy p),
:deep(.ms-permissions-modal__helper-text),
:deep(.ms-permissions-modal__card-header p),
:deep(.ms-permissions-modal__capability-meta small),
:deep(.ms-permissions-modal__participants-summary),
:deep(.ms-permissions-modal__participant-meta span),
:deep(.ms-permissions-modal__empty-state) {
  color: var(--ms-modern-text-secondary);
}

:deep(.ms-permissions-modal__tab-button[data-active='true']) {
  background: linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 100%);
  color: #fff;
}

:deep(.ms-permissions-modal__config-card),
:deep(.ms-permissions-modal__participant-row),
:deep(.ms-permissions-modal__capability-row) {
  border-color: var(--ms-modern-panel-border);
  background: var(--ms-modern-panel-surface);
}

:deep(.ms-permissions-modal__card-header h3),
:deep(.ms-permissions-modal__capability-meta strong),
:deep(.ms-permissions-modal__participant-meta strong) {
  color: var(--ms-modern-text-primary);
}

:deep(.ms-permissions-modal__select) {
  background: var(--ms-modern-field-background);
  border-color: var(--ms-modern-field-border);
  color: var(--ms-modern-text-primary);
}

:deep(.ms-permissions-modal__action-button--primary) {
  background: linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 100%);
  color: #fff;
  box-shadow: var(--ms-modern-shadow-soft);
}

:deep(.ms-permissions-modal__action-button--secondary) {
  background: var(--ms-modern-field-background);
  color: var(--ms-modern-text-primary);
  border-color: var(--ms-modern-panel-border);
}

:deep(.ms-modern-permissions-modal__content--embedded .ms-permissions-modal__body) {
  min-height: 0;
  padding: 16px !important;
  gap: 16px;
  overflow-y: auto;
}

:deep(.ms-modern-permissions-modal__content--embedded .ms-permissions-modal__config-grid) {
  grid-template-columns: 1fr;
  gap: 14px;
}

:deep(.ms-modern-permissions-modal__content--embedded .ms-permissions-modal__capability-row) {
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
}

:deep(.ms-modern-permissions-modal__content--embedded .ms-permissions-modal__select) {
  width: 100%;
  min-width: 0;
}

:deep(.ms-modern-permissions-modal__content--embedded .ms-permissions-modal__users-toolbar) {
  grid-template-columns: 1fr;
}

:deep(.ms-modern-permissions-modal__content--embedded .ms-permissions-modal__bulk-actions),
:deep(.ms-modern-permissions-modal__content--embedded .ms-permissions-modal__actions-row) {
  justify-content: stretch;
}

:deep(.ms-modern-permissions-modal__content--embedded .ms-permissions-modal__action-button) {
  width: 100%;
}
</style>