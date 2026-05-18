<template>
  <ClassicAlertComponent
    v-bind="mergedProps"
  >
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
  </ClassicAlertComponent>
</template>

<script setup lang="ts">
import { computed, h, useSlots, type HTMLAttributes } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import ClassicAlertComponent from '../../components/displayComponents/AlertComponent.vue';
import type { AlertComponentProps } from '../../components/displayComponents/AlertComponent.vue';
import { mergeAttrObjects } from './styleUtils';

const props = defineProps<AlertComponentProps>();
const slots = useSlots();

const accentColor = computed(() =>
  props.type === 'danger' ? 'var(--ms-modern-danger)' : 'var(--ms-modern-success)',
);

const alertTone = computed(() =>
  props.type === 'danger'
    ? {
        icon: faTimes,
        iconColor: '#ef4444',
        iconSurface: 'rgba(239, 68, 68, 0.14)',
        border: 'rgba(239, 68, 68, 0.22)',
      }
    : {
        icon: faCheck,
        iconColor: '#16a34a',
        iconSurface: 'rgba(34, 197, 94, 0.14)',
        border: 'rgba(34, 197, 94, 0.24)',
      },
);

const defaultOverlayProps = computed<HTMLAttributes>(() => ({
  style: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '24px',
    paddingInline: '16px',
    backgroundColor: 'transparent',
  },
}));

const defaultContainerProps = computed<HTMLAttributes>(() => ({
  style: {
    background:
      'linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-panel-surface) 100%)',
    border: `1px solid ${alertTone.value.border}`,
    borderRadius: '16px',
    padding: '14px 16px',
    width: 'min(100%, 320px)',
    maxWidth: '320px',
    boxShadow: '0 14px 28px rgba(15, 23, 42, 0.18)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    color: 'var(--ms-modern-text-primary)',
    justifyContent: 'stretch',
    alignItems: 'stretch',
    textAlign: 'left',
  },
}));

const defaultMessageProps: HTMLAttributes = {
  style: {
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontWeight: 600,
    fontSize: '0.96rem',
    lineHeight: 1.35,
    letterSpacing: '0.01em',
    flex: 1,
    minWidth: 0,
    width: 'auto',
    textAlign: 'left',
  },
};

const renderModernMessage: NonNullable<AlertComponentProps['renderMessage']> = ({ defaultMessage }) =>
  h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
      },
    },
    [
      h(
        'span',
        {
          'aria-hidden': 'true',
          style: {
            width: '32px',
            height: '32px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '999px',
            background: alertTone.value.iconSurface,
            color: alertTone.value.iconColor,
            flexShrink: 0,
          },
        },
        [h(FontAwesomeIcon, { icon: alertTone.value.icon })],
      ),
      defaultMessage,
      h(
        'button',
        {
          type: 'button',
          'aria-label': 'Close alert',
          onClick: (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
            props.onHide?.();
          },
          style: {
            width: '24px',
            height: '24px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            borderRadius: '999px',
            background: 'transparent',
            color: 'var(--ms-modern-text-secondary)',
            cursor: 'pointer',
            flexShrink: 0,
          },
        },
        [h(FontAwesomeIcon, { icon: faTimes })],
      ),
    ],
  );

const mergedProps = computed(() => ({
  ...props,
  textColor: props.textColor || 'var(--ms-modern-text-primary)',
  overlayProps: mergeAttrObjects(defaultOverlayProps.value, props.overlayProps),
  containerProps: mergeAttrObjects(defaultContainerProps.value, props.containerProps),
  messageProps: mergeAttrObjects(defaultMessageProps, props.messageProps),
  renderMessage: props.renderMessage ?? renderModernMessage,
}));
</script>
