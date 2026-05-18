<template>
  <ClassicConfirmExitModal v-bind="mergedProps">
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
  </ClassicConfirmExitModal>
</template>

<script setup lang="ts">
import { computed, h, isVNode, useSlots, type ButtonHTMLAttributes, type HTMLAttributes, type VNodeChild } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faExclamationTriangle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import ClassicConfirmExitModal from '../../components/exitComponents/ConfirmExitModal.vue';
import type { ConfirmExitModalProps } from '../../components/exitComponents/ConfirmExitModal.vue';
import { mergeAttrObjects } from '../display_components/styleUtils';

export type ModernConfirmExitModalProps = ConfirmExitModalProps;

const props = defineProps<ModernConfirmExitModalProps>();
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
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
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
    color: '#ef4444',
    fontFamily: 'var(--ms-modern-font-family)',
    fontSize: '1.05rem',
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

const defaultDividerProps: HTMLAttributes = {
  style: {
    borderColor: 'var(--ms-modern-panel-border)',
  },
};

const defaultBodyProps: HTMLAttributes = {
  style: {
    padding: '6px 22px 0',
    color: 'var(--ms-modern-text-secondary)',
    textAlign: 'center',
  },
};

const defaultMessageProps: HTMLAttributes = {
  style: {
    color: 'var(--ms-modern-text-secondary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontSize: '0.95rem',
    lineHeight: 1.6,
  },
};

const defaultFooterProps: HTMLAttributes = {
  style: {
    display: 'flex',
    gap: '12px',
    padding: '18px 22px 22px',
  },
};

const defaultCancelButtonProps: ButtonHTMLAttributes = {
  style: {
    flex: 1,
    minHeight: '46px',
    borderRadius: '9999px',
    border: '1px solid rgba(99, 102, 241, 0.6)',
    background: 'rgba(99, 102, 241, 0.06)',
    color: '#6366f1',
    fontFamily: 'var(--ms-modern-font-family)',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

const defaultConfirmButtonProps: ButtonHTMLAttributes = {
  style: {
    flex: 1,
    minHeight: '46px',
    borderRadius: '9999px',
    border: 'none',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontWeight: 700,
    boxShadow: 'var(--ms-modern-shadow-soft)',
    cursor: 'pointer',
  },
};

const renderModernHeader = (options: {
  defaultHeader: VNodeChild;
  title: VNodeChild;
  onClose: () => void;
}) => {
  const resolvedTitle = props.title === false || props.title == null
    ? (props.islevel === '2' ? 'End Meeting' : 'Leave Meeting')
    : props.title;
  const defaultHeader = h('div', { class: 'ms-modern-confirm-exit__header' }, [
    h('h2', { class: 'ms-modern-confirm-exit__title' }, [
      h(FontAwesomeIcon, { icon: faSignOutAlt }),
      isVNode(resolvedTitle) ? resolvedTitle : String(resolvedTitle),
    ]),
    h(
      'button',
      {
        type: 'button',
        class: 'ms-modern-confirm-exit__close',
        'aria-label': 'Close confirm exit modal',
        onClick: options.onClose,
      },
      '×',
    ),
  ]);

  return props.renderHeader ? props.renderHeader({ ...options, defaultHeader }) : defaultHeader;
};

const renderModernBody = (options: { defaultBody: VNodeChild; message: VNodeChild }) => {
  const defaultBody = h('div', { class: 'ms-modern-confirm-exit__body' }, [
    h('div', { class: 'ms-modern-confirm-exit__warning' }, [
      h(FontAwesomeIcon, { icon: faExclamationTriangle }),
    ]),
    h('p', { class: 'ms-modern-confirm-exit__message' }, [options.message]),
  ]);

  return props.renderBody ? props.renderBody({ ...options, defaultBody }) : defaultBody;
};

const mergedProps = computed(() => ({
  ...props,
  backgroundColor: props.backgroundColor ?? 'var(--ms-modern-panel-surface-elevated)',
  overlayProps: mergeAttrObjects(defaultOverlayProps, props.overlayProps),
  contentProps: mergeAttrObjects(defaultContentProps.value, props.contentProps),
  headerProps: mergeAttrObjects(defaultHeaderProps, props.headerProps),
  titleProps: mergeAttrObjects(defaultTitleProps, props.titleProps),
  closeButtonProps: mergeAttrObjects(defaultCloseButtonProps, props.closeButtonProps),
  headerDividerProps: mergeAttrObjects(defaultDividerProps, props.headerDividerProps),
  bodyProps: mergeAttrObjects(defaultBodyProps, props.bodyProps),
  messageProps: mergeAttrObjects(defaultMessageProps, props.messageProps),
  footerProps: mergeAttrObjects(defaultFooterProps, props.footerProps),
  cancelButtonProps: mergeAttrObjects(defaultCancelButtonProps, props.cancelButtonProps),
  confirmButtonProps: mergeAttrObjects(defaultConfirmButtonProps, props.confirmButtonProps),
  bodyDividerProps: mergeAttrObjects(defaultDividerProps, props.bodyDividerProps),
  renderHeader: renderModernHeader,
  renderBody: renderModernBody,
}));
</script>

<style scoped>
:deep(.ms-modern-confirm-exit__header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

:deep(.ms-modern-confirm-exit__title) {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: #ef4444;
  font-family: var(--ms-modern-font-family);
  font-size: 1.05rem;
  font-weight: 700;
}

:deep(.ms-modern-confirm-exit__close) {
  width: 38px;
  height: 38px;
  border-radius: 9999px;
  border: 1px solid var(--ms-modern-panel-border);
  background: var(--ms-modern-field-background);
  color: var(--ms-modern-text-primary);
  cursor: pointer;
  font-size: 1.4rem;
  line-height: 1;
}

:deep(.ms-modern-confirm-exit__body) {
  display: grid;
  justify-items: center;
  gap: 18px;
  padding: 18px 0 6px;
}

:deep(.ms-modern-confirm-exit__warning) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 9999px;
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  font-size: 1.8rem;
}

:deep(.ms-modern-confirm-exit__message) {
  margin: 0;
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: 1rem;
  line-height: 1.5;
}
</style>