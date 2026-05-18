<template>
  <ClassicRequestsModal v-bind="mergedProps">
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
  </ClassicRequestsModal>
</template>

<script setup lang="ts">
import {
  computed,
  h,
  useSlots,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faBan,
  faCheck,
  faDesktop,
  faHandPaper,
  faMicrophone,
  faSearch,
  faTimes,
  faVideo,
} from '@fortawesome/free-solid-svg-icons';
import ClassicRequestsModal from '../../components/requestsComponents/RequestsModal.vue';
import type { RequestsModalProps } from '../../components/requestsComponents/RequestsModal.vue';
import { mergeAttrObjects } from '../display_components/styleUtils';

type ModernRequestsRenderMode = 'modal' | 'sidebar' | 'inline';

export interface ModernRequestsModalProps extends RequestsModalProps {
  renderMode?: ModernRequestsRenderMode;
}

const props = defineProps<ModernRequestsModalProps>();
const slots = useSlots();
const isEmbedded = computed(() => props.renderMode === 'sidebar' || props.renderMode === 'inline');

const panelGradientBackground =
  'linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-panel-surface) 100%)';

const defaultContentProps = computed<HTMLAttributes>(() => ({
  style: {
    background: panelGradientBackground,
    border: '1px solid var(--ms-modern-panel-border)',
    borderRadius: '28px',
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

const defaultSearchWrapperProps: HTMLAttributes = {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    borderRadius: '18px',
    border: '1px solid var(--ms-modern-field-border)',
    background: 'var(--ms-modern-field-background)',
    marginBottom: '16px',
  },
};

const defaultSearchInputProps: InputHTMLAttributes = {
  style: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontSize: '0.95rem',
  },
};

const defaultRequestsWrapperProps: HTMLAttributes = {
  style: {
    display: 'grid',
    gap: '12px',
  },
};

const defaultRequestItemWrapperProps: HTMLAttributes = {
  style: {
    padding: '12px 14px',
    borderRadius: '18px',
    border: '1px solid var(--ms-modern-panel-border)',
    background: 'var(--ms-modern-panel-surface)',
  },
};

const resolveRequestMeta = (iconName?: string) => {
  switch (iconName) {
    case 'fa-microphone':
      return { icon: faMicrophone, label: 'microphone', toneClass: 'is-audio' };
    case 'fa-video':
      return { icon: faVideo, label: 'video', toneClass: 'is-video' };
    default:
      return { icon: faDesktop, label: 'desktop', toneClass: 'is-desktop' };
  }
};

const renderModernHeader: NonNullable<RequestsModalProps['renderHeader']> = ({ counter, onClose }) =>
  h('div', { class: 'ms-modern-requests__header' }, [
    h('div', { class: 'ms-modern-requests__title-wrap' }, [
      h(FontAwesomeIcon, { icon: faHandPaper, class: 'ms-modern-requests__title-icon' }),
      h('h2', { class: 'ms-modern-requests__title' }, 'Requests'),
      counter > 0 ? h('span', { class: 'ms-modern-requests__badge' }, String(counter)) : null,
    ].filter(Boolean)),
    h(
      'button',
      {
        type: 'button',
        class: 'ms-modern-requests__close',
        'aria-label': 'Close requests modal',
        onClick: onClose,
      },
      [h(FontAwesomeIcon, { icon: faTimes })],
    ),
  ]);

const renderModernSearch: NonNullable<RequestsModalProps['renderSearch']> = ({ onFilter }) =>
  h('div', { class: 'ms-modern-requests__search' }, [
    h(FontAwesomeIcon, { icon: faSearch, class: 'ms-modern-requests__search-icon' }),
    h('input', {
      type: 'text',
      class: 'ms-modern-requests__search-input',
      placeholder: 'Search requests...',
      onInput: (event: Event) => onFilter((event.target as HTMLInputElement).value),
    }),
  ]);

const renderModernRequest: NonNullable<RequestsModalProps['renderRequest']> = ({ request, handleRespond }) => {
  const meta = resolveRequestMeta(request.icon);

  return h('div', { class: 'ms-modern-requests__item' }, [
    h('div', { class: 'ms-modern-requests__identity' }, [
      h('span', { class: ['ms-modern-requests__icon-tile', meta.toneClass] }, [
        h(FontAwesomeIcon, { icon: meta.icon }),
      ]),
      h('div', { class: 'ms-modern-requests__copy' }, [
        h('p', { class: 'ms-modern-requests__name' }, request.name),
        h('p', { class: 'ms-modern-requests__meta' }, meta.label),
      ]),
    ]),
    h('div', { class: 'ms-modern-requests__actions' }, [
      h(
        'button',
        {
          type: 'button',
          class: 'ms-modern-requests__action ms-modern-requests__action--accept',
          'aria-label': `Accept ${request.name}`,
          onClick: () => handleRespond('accepted'),
        },
        [h(FontAwesomeIcon, { icon: faCheck })],
      ),
      h(
        'button',
        {
          type: 'button',
          class: 'ms-modern-requests__action ms-modern-requests__action--reject',
          'aria-label': `Reject ${request.name}`,
          onClick: () => handleRespond('rejected'),
        },
        [h(FontAwesomeIcon, { icon: faBan })],
      ),
    ]),
  ]);
};

const mergedProps = computed(() => ({
  ...props,
  isRequestsModalVisible: isEmbedded.value ? true : props.isRequestsModalVisible,
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
  searchWrapperProps: mergeAttrObjects(defaultSearchWrapperProps, props.searchWrapperProps),
  searchInputProps: mergeAttrObjects(defaultSearchInputProps, props.searchInputProps),
  requestsWrapperProps: mergeAttrObjects(defaultRequestsWrapperProps, props.requestsWrapperProps),
  requestItemWrapperProps: mergeAttrObjects(defaultRequestItemWrapperProps, props.requestItemWrapperProps),
  renderHeader: props.renderHeader ?? renderModernHeader,
  renderSearch: props.renderSearch ?? renderModernSearch,
  renderRequest: props.renderRequest ?? renderModernRequest,
}));
</script>

<style scoped>
:deep(.ms-modern-requests__header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

:deep(.ms-modern-requests__title-wrap) {
  display: flex;
  align-items: center;
  gap: 10px;
}

:deep(.ms-modern-requests__title-icon) {
  color: var(--ms-modern-text-primary);
}

:deep(.ms-modern-requests__title) {
  margin: 0;
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: 1rem;
  font-weight: 700;
}

:deep(.ms-modern-requests__badge) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 9999px;
  background: #3b82f6;
  color: #fff;
  font-family: var(--ms-modern-font-family);
  font-size: 0.72rem;
  font-weight: 700;
}

:deep(.ms-modern-requests__close) {
  width: 38px;
  height: 38px;
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 9999px;
  background: var(--ms-modern-field-background);
  color: var(--ms-modern-text-primary);
  cursor: pointer;
}

:deep(.ms-modern-requests__search) {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  margin-bottom: 16px;
  border: 1px solid var(--ms-modern-field-border);
  border-radius: 16px;
  background: var(--ms-modern-field-background);
}

:deep(.ms-modern-requests__search-icon) {
  color: var(--ms-modern-text-muted);
}

:deep(.ms-modern-requests__search-input) {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: 0.92rem;
}

:deep(.ms-modern-requests__search-input::placeholder) {
  color: var(--ms-modern-text-muted);
  opacity: 1;
}

:deep(.ms-modern-requests__item) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 18px;
  background: var(--ms-modern-panel-surface);
  box-shadow: var(--ms-modern-shadow-soft);
}

:deep(.ms-modern-requests__identity) {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

:deep(.ms-modern-requests__icon-tile) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
}

:deep(.ms-modern-requests__icon-tile.is-audio) {
  background: rgba(99, 102, 241, 0.14);
  color: #6366f1;
}

:deep(.ms-modern-requests__icon-tile.is-video) {
  background: rgba(129, 140, 248, 0.14);
  color: #6366f1;
}

:deep(.ms-modern-requests__icon-tile.is-desktop) {
  background: rgba(96, 165, 250, 0.14);
  color: #4f46e5;
}

:deep(.ms-modern-requests__copy) {
  min-width: 0;
}

:deep(.ms-modern-requests__name) {
  margin: 0;
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: 0.98rem;
  font-weight: 700;
}

:deep(.ms-modern-requests__meta) {
  margin: 4px 0 0;
  color: var(--ms-modern-text-secondary);
  font-family: var(--ms-modern-font-family);
  font-size: 0.8rem;
  text-transform: lowercase;
}

:deep(.ms-modern-requests__actions) {
  display: flex;
  gap: 10px;
}

:deep(.ms-modern-requests__action) {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
}

:deep(.ms-modern-requests__action--accept) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

:deep(.ms-modern-requests__action--reject) {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

@media (max-width: 520px) {
  :deep(.ms-modern-requests__item) {
    padding: 10px 12px;
  }

  :deep(.ms-modern-requests__icon-tile) {
    width: 38px;
    height: 38px;
    border-radius: 12px;
  }
}
</style>