<template>
  <ClassicShareEventModal v-bind="mergedProps">
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
  </ClassicShareEventModal>
</template>

<script setup lang="ts">
import { computed, h, useSlots, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type VNodeChild } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faShareAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import ClassicShareEventModal from '../../components/miscComponents/ShareEventModal.vue';
import type { ShareEventModalProps } from '../../components/miscComponents/ShareEventModal.vue';
import { mergeAttrObjects } from '../display_components/styleUtils';

type ModernShareEventRenderMode = 'modal' | 'sidebar' | 'inline';

export interface ModernShareEventModalProps extends ShareEventModalProps {
  renderMode?: ModernShareEventRenderMode;
}

const props = defineProps<ModernShareEventModalProps>();
const slots = useSlots();
const isEmbedded = computed(() => props.renderMode === 'sidebar' || props.renderMode === 'inline');

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

const defaultCloseButtonProps: ButtonHTMLAttributes = {
  style: {
    width: '38px',
    height: '38px',
    borderRadius: '9999px',
    border: '1px solid var(--ms-modern-panel-border-strong)',
    background: 'linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-field-background) 100%)',
    color: 'var(--ms-modern-text-primary)',
    boxShadow: 'var(--ms-modern-shadow-soft)',
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
    padding: '0 22px 22px',
    display: 'grid',
    gap: '14px',
  },
};

const defaultCardProps: HTMLAttributes = {
  style: {
    padding: '14px',
    borderRadius: '18px',
    border: '1px solid var(--ms-modern-panel-border)',
    background: 'var(--ms-modern-panel-surface)',
  },
};

const resolvedCloseIcon = computed<VNodeChild>(() => {
  const closeIcon = props.closeIcon as unknown;
  return closeIcon === false || closeIcon == null
    ? h(FontAwesomeIcon, {
        icon: faTimes,
        style: {
          color: 'var(--ms-modern-text-primary)',
          fontSize: '1rem',
        } satisfies CSSProperties,
      })
    : props.closeIcon;
});

const renderModernHeader = (options: { defaultHeader: VNodeChild; closeButton: VNodeChild }) => {
  const defaultHeader = h(
    'div',
    { class: 'ms-modern-share-event__header-row' },
    [
      h('div', { class: 'ms-modern-share-event__title-wrap' }, [
        h('span', { class: 'ms-modern-share-event__title-icon' }, [
          h(FontAwesomeIcon, { icon: faShareAlt }),
        ]),
        h('h2', { class: 'ms-modern-share-event__title' }, 'Share Event'),
      ]),
      options.closeButton,
    ],
  );

  return props.renderHeader
    ? props.renderHeader({ ...options, defaultHeader })
    : defaultHeader;
};

const renderModernBody = (options: {
  defaultBody: VNodeChild;
  meetingPasscode: VNodeChild | null;
  meetingId: VNodeChild;
  shareButtons: VNodeChild | null;
}) => {
  const defaultBody = h('div', { class: 'ms-modern-share-event__body' }, [
    h('section', { class: 'ms-modern-share-event__section' }, [
      h('p', { class: 'ms-modern-share-event__section-label' }, 'Meeting ID'),
      options.meetingId,
    ]),
    options.meetingPasscode
      ? h('section', { class: 'ms-modern-share-event__section' }, [
          h('p', { class: 'ms-modern-share-event__section-label' }, 'Admin Passcode'),
          options.meetingPasscode,
        ])
      : null,
    options.shareButtons
      ? h('section', { class: 'ms-modern-share-event__section' }, [
          h('p', { class: 'ms-modern-share-event__section-label' }, 'Share'),
          options.shareButtons,
        ])
      : null,
  ].filter(Boolean));

  return props.renderBody
    ? props.renderBody({ ...options, defaultBody })
    : defaultBody;
};

const mergedProps = computed(() => ({
  ...props,
  isShareEventModalVisible: isEmbedded.value ? true : props.isShareEventModalVisible,
  backgroundColor: props.backgroundColor ?? 'var(--ms-modern-panel-surface-elevated)',
  overlayProps: mergeAttrObjects(
    isEmbedded.value ? embeddedOverlayProps.value : defaultOverlayProps,
    props.overlayProps,
  ),
  contentProps: mergeAttrObjects(
    isEmbedded.value ? embeddedContentProps.value : defaultContentProps.value,
    props.contentProps,
  ),
  headerProps: mergeAttrObjects(defaultHeaderProps, props.headerProps),
  closeButtonProps: mergeAttrObjects(defaultCloseButtonProps, props.closeButtonProps),
  closeIcon: resolvedCloseIcon.value,
  dividerProps: mergeAttrObjects(defaultDividerProps, props.dividerProps),
  bodyProps: mergeAttrObjects(defaultBodyProps, props.bodyProps),
  meetingPasscodeWrapperProps: mergeAttrObjects(defaultCardProps, props.meetingPasscodeWrapperProps),
  meetingIdWrapperProps: mergeAttrObjects(defaultCardProps, props.meetingIdWrapperProps),
  shareButtonsWrapperProps: mergeAttrObjects(defaultCardProps, props.shareButtonsWrapperProps),
  renderHeader: renderModernHeader,
  renderBody: renderModernBody,
}));
</script>

<style scoped>
:deep(.ms-modern-share-event__header-row) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

:deep(.ms-modern-share-event__title-wrap) {
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.ms-modern-share-event__title-icon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 55%, var(--ms-modern-accent) 100%);
  color: var(--ms-modern-text-primary);
  box-shadow: var(--ms-modern-shadow-soft);
}

:deep(.ms-modern-share-event__title) {
  margin: 0;
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

:deep(.ms-modern-share-event__body) {
  display: grid;
  gap: 14px;
}

:deep(.ms-modern-share-event__section) {
  display: grid;
  gap: 10px;
}

:deep(.ms-modern-share-event__section-label) {
  margin: 0;
  color: var(--ms-modern-text-secondary);
  font-family: var(--ms-modern-font-family);
  font-size: 0.82rem;
  font-weight: 700;
}

:deep(.mediasfu-share-event__close) {
  border: 1px solid var(--ms-modern-panel-border-strong) !important;
  background: linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-field-background) 100%) !important;
  box-shadow: var(--ms-modern-shadow-soft);
}

:deep(.mediasfu-share-event__close svg) {
  color: var(--ms-modern-text-primary) !important;
}
</style>