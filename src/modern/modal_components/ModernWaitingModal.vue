<template>
  <ClassicWaitingModal v-bind="mergedProps">
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
  </ClassicWaitingModal>
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
import { faBan, faCheck, faClock, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import ClassicWaitingModal from '../../components/waitingComponents/WaitingModal.vue';
import type { WaitingRoomModalProps } from '../../components/waitingComponents/WaitingModal.vue';
import { mergeAttrObjects } from '../display_components/styleUtils';

type ModernWaitingRenderMode = 'modal' | 'sidebar' | 'inline';

export interface ModernWaitingModalProps extends WaitingRoomModalProps {
  renderMode?: ModernWaitingRenderMode;
}

const props = defineProps<ModernWaitingModalProps>();
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

const defaultWaitingListProps: HTMLAttributes = {
  style: {
    display: 'grid',
    gap: '12px',
  },
};

const defaultParticipantRowProps: HTMLAttributes = {
  style: {
    padding: '12px 14px',
    borderRadius: '18px',
    border: '1px solid var(--ms-modern-panel-border)',
    background: 'var(--ms-modern-panel-surface)',
  },
};

const defaultAcceptButtonProps: ButtonHTMLAttributes = {
  style: {
    minHeight: '40px',
    borderRadius: '9999px',
    border: 'none',
    paddingInline: '14px',
    background:
      'linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 55%, var(--ms-modern-accent) 100%)',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontWeight: 700,
    boxShadow: 'var(--ms-modern-shadow-soft)',
    cursor: 'pointer',
  },
};

const defaultRejectButtonProps: ButtonHTMLAttributes = {
  style: {
    minHeight: '40px',
    borderRadius: '9999px',
    border: '1px solid var(--ms-modern-panel-border)',
    paddingInline: '14px',
    background: 'var(--ms-modern-field-background)',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

const renderModernHeader: NonNullable<WaitingRoomModalProps['renderHeader']> = ({ counter, onClose }) =>
  h('div', { class: 'ms-modern-waiting__header' }, [
    h('div', { class: 'ms-modern-waiting__title-wrap' }, [
      h(FontAwesomeIcon, { icon: faClock, class: 'ms-modern-waiting__title-icon' }),
      h('h2', { class: 'ms-modern-waiting__title' }, 'Waiting Room'),
      counter > 0 ? h('span', { class: 'ms-modern-waiting__badge' }, String(counter)) : null,
    ].filter(Boolean)),
    h(
      'button',
      {
        type: 'button',
        class: 'ms-modern-waiting__close',
        'aria-label': 'Close waiting room modal',
        onClick: onClose,
      },
      [h(FontAwesomeIcon, { icon: faTimes })],
    ),
  ]);

const renderModernSearch: NonNullable<WaitingRoomModalProps['renderSearch']> = ({ onFilter }) =>
  h('div', { class: 'ms-modern-waiting__search' }, [
    h(FontAwesomeIcon, { icon: faSearch, class: 'ms-modern-waiting__search-icon' }),
    h('input', {
      type: 'text',
      class: 'ms-modern-waiting__search-input',
      placeholder: 'Search waiting list...',
      onInput: (event: Event) => onFilter((event.target as HTMLInputElement).value),
    }),
  ]);

const renderModernParticipant: NonNullable<WaitingRoomModalProps['renderParticipant']> = ({
  participant,
  handleAccept,
  handleReject,
}) =>
  h('div', { class: 'ms-modern-waiting__item' }, [
    h('p', { class: 'ms-modern-waiting__name' }, participant.name),
    h('div', { class: 'ms-modern-waiting__actions' }, [
      h(
        'button',
        {
          type: 'button',
          class: 'ms-modern-waiting__action ms-modern-waiting__action--accept',
          'aria-label': `Admit ${participant.name}`,
          onClick: handleAccept,
        },
        [h(FontAwesomeIcon, { icon: faCheck })],
      ),
      h(
        'button',
        {
          type: 'button',
          class: 'ms-modern-waiting__action ms-modern-waiting__action--reject',
          'aria-label': `Reject ${participant.name}`,
          onClick: handleReject,
        },
        [h(FontAwesomeIcon, { icon: faBan })],
      ),
    ]),
  ]);

const mergedProps = computed(() => ({
  ...props,
  isWaitingModalVisible: isEmbedded.value ? true : props.isWaitingModalVisible,
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
  waitingListProps: mergeAttrObjects(defaultWaitingListProps, props.waitingListProps),
  participantRowProps: mergeAttrObjects(defaultParticipantRowProps, props.participantRowProps),
  acceptButtonProps: mergeAttrObjects(defaultAcceptButtonProps, props.acceptButtonProps),
  rejectButtonProps: mergeAttrObjects(defaultRejectButtonProps, props.rejectButtonProps),
  renderHeader: props.renderHeader ?? renderModernHeader,
  renderSearch: props.renderSearch ?? renderModernSearch,
  renderParticipant: props.renderParticipant ?? renderModernParticipant,
}));
</script>

<style scoped>
:deep(.ms-modern-waiting__header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

:deep(.ms-modern-waiting__title-wrap) {
  display: flex;
  align-items: center;
  gap: 10px;
}

:deep(.ms-modern-waiting__title-icon) {
  color: var(--ms-modern-text-primary);
}

:deep(.ms-modern-waiting__title) {
  margin: 0;
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: 1rem;
  font-weight: 700;
}

:deep(.ms-modern-waiting__badge) {
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

:deep(.ms-modern-waiting__close) {
  width: 38px;
  height: 38px;
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 9999px;
  background: var(--ms-modern-field-background);
  color: var(--ms-modern-text-primary);
  cursor: pointer;
}

:deep(.ms-modern-waiting__search) {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  margin-bottom: 16px;
  border: 1px solid var(--ms-modern-field-border);
  border-radius: 16px;
  background: var(--ms-modern-field-background);
}

:deep(.ms-modern-waiting__search-icon) {
  color: var(--ms-modern-text-muted);
}

:deep(.ms-modern-waiting__search-input) {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: 0.92rem;
}

:deep(.ms-modern-waiting__search-input::placeholder) {
  color: var(--ms-modern-text-muted);
  opacity: 1;
}

:deep(.ms-modern-waiting__item) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 16px;
  background: var(--ms-modern-panel-surface);
}

:deep(.ms-modern-waiting__name) {
  margin: 0;
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: 0.98rem;
  font-weight: 600;
}

:deep(.ms-modern-waiting__actions) {
  display: flex;
  gap: 10px;
}

:deep(.ms-modern-waiting__action) {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
}

:deep(.ms-modern-waiting__action--accept) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

:deep(.ms-modern-waiting__action--reject) {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}
</style>