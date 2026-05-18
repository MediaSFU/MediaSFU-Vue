<template>
  <RenderVNode :node="overlayNode" />
</template>

<script setup lang="ts">
import {
  computed,
  defineComponent,
  h,
  isVNode,
  onUnmounted,
  ref,
  watch,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type PropType,
  type VNodeChild,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import type { FontAwesomeIconProps } from '@fortawesome/vue-fontawesome';
import type { ConfirmHereModalProps } from '../../components/miscComponents/ConfirmHereModal.vue';
import { mergeAttrObjects } from '../display_components/styleUtils';

export type ModernConfirmHereModalProps = ConfirmHereModalProps;

const props = defineProps<ModernConfirmHereModalProps>();

const RenderVNode = defineComponent({
  name: 'RenderVNode',
  props: {
    node: {
      type: [Object, String, Number, Boolean, Array, Function] as PropType<VNodeChild>,
      default: null,
    },
  },
  render() {
    if (!this.node) return null;
    if (isVNode(this.node)) return this.node;
    if (typeof this.node === 'function') {
      const result = (this.node as () => VNodeChild)();
      return isVNode(result) ? result : String(result);
    }
    return String(this.node);
  },
});

const counter = ref<number>(Math.max(0, props.countdownDuration ?? 120));
const isMounted = ref(false);
let countdownInterval: ReturnType<typeof setInterval> | null = null;

const initialDuration = computed(() => Math.max(0, props.countdownDuration ?? 120));
const progress = computed(() => {
  if (initialDuration.value <= 0) {
    return 0;
  }
  return counter.value / initialDuration.value;
});
const circumference = 2 * Math.PI * 45;

const scheduleMountTransition = () => {
  if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(() => {
      isMounted.value = true;
    });
    return;
  }

  setTimeout(() => {
    isMounted.value = true;
  }, 0);
};

const clearCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
};

const emitDisconnect = () => {
  props.socket.emit('disconnectUser', {
    member: props.member,
    roomName: props.roomName,
    ban: false,
  });

  if (props.localSocket && props.localSocket.id) {
    try {
      props.localSocket.emit('disconnectUser', {
        member: props.member,
        roomName: props.roomName,
        ban: false,
      });
    } catch {
      // Ignore local socket errors silently.
    }
  }
};

const confirmAndClose = () => {
  clearCountdown();
  props.onConfirmHereClose();
};

const handleTimeout = () => {
  emitDisconnect();
  props.onTimeout?.();
  confirmAndClose();
};

const startCountdown = () => {
  clearCountdown();

  let timeRemaining = initialDuration.value;
  counter.value = initialDuration.value;

  countdownInterval = setInterval(() => {
    timeRemaining -= 1;
    counter.value = Math.max(timeRemaining, 0);

    if (timeRemaining <= 0) {
      clearCountdown();
      handleTimeout();
    }
  }, 1000);
};

watch(
  () => [props.isConfirmHereModalVisible, initialDuration.value] as const,
  ([isVisible, duration]) => {
    counter.value = duration;

    if (isVisible) {
      isMounted.value = false;
      startCountdown();
      scheduleMountTransition();
    } else {
      isMounted.value = false;
      clearCountdown();
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  clearCountdown();
});

const panelGradientBackground =
  'linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-panel-surface) 100%)';

const progressStrokeColor = computed(() => {
  if (counter.value <= 30) {
    return 'var(--ms-modern-danger, #ef4444)';
  }

  if (counter.value <= 60) {
    return 'var(--ms-modern-warning, #f59e0b)';
  }

  return 'var(--ms-modern-brand-primary, #6366f1)';
});

const counterTone = computed(() => {
  if (counter.value <= 30) {
    return 'var(--ms-modern-danger, #ef4444)';
  }

  if (counter.value <= 60) {
    return 'var(--ms-modern-warning, #f59e0b)';
  }

  return 'var(--ms-modern-text-primary)';
});

const warningMessage = computed(() =>
  counter.value <= 30
    ? 'You will be disconnected soon.'
    : 'Time remaining before automatic disconnect.',
);

const resolvedTitle = computed(() => {
  const title = props.title as unknown;
  return title === false || title == null ? 'Are you still there?' : props.title;
});

const resolvedMessage = computed(() => {
  if (typeof props.message === 'function') {
    return props.message({ counter: counter.value, countdownDuration: initialDuration.value });
  }

  return props.message ?? 'Please confirm if you are still present.';
});

const resolvedCountdownLabel = computed(() => {
  const label = props.countdownLabel as unknown;
  return label === false || label == null ? 'Time remaining:' : props.countdownLabel;
});

const resolvedConfirmButtonLabel = computed(() => {
  const label = props.confirmButtonLabel as unknown;
  return label === false || label == null ? 'Yes' : props.confirmButtonLabel;
});

const defaultOverlayProps: HTMLAttributes = {
  class: 'ms-modern-confirm-here__overlay',
  style: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    zIndex: 999,
    background: 'var(--ms-modern-overlay-backdrop)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    opacity: isMounted.value ? 1 : 0,
    transition: 'opacity 220ms ease',
  },
};

const overlayProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(defaultOverlayProps, props.overlayProps),
);

const modalWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.9, 380) : 360;

const defaultContentProps = computed<HTMLAttributes>(() => ({
  class: 'ms-modern-confirm-here__content',
  style: {
    width: '100%',
    maxWidth: `${modalWidth}px`,
    display: 'grid',
    gap: '20px',
    padding: '28px 24px 24px',
    borderRadius: '24px',
    border: '1px solid var(--ms-modern-panel-border)',
    background: props.backgroundColor ?? panelGradientBackground,
    boxShadow: 'var(--ms-modern-shadow-elevated)',
    color: 'var(--ms-modern-text-primary)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    overflow: 'hidden',
    transform: isMounted.value ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(18px)',
    transition: 'transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
}));

const contentProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(defaultContentProps.value, props.contentProps),
);

const defaultContainerProps: HTMLAttributes = {
  class: 'ms-modern-confirm-here__body',
  style: {
    display: 'grid',
    justifyItems: 'center',
    gap: '14px',
    textAlign: 'center',
  },
};

const containerProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(defaultContainerProps, props.containerProps),
);

const defaultSpinnerWrapperProps: HTMLAttributes = {
  class: 'ms-modern-confirm-here__spinner',
  style: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--ms-modern-text-secondary)',
  },
};

const spinnerWrapperProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(defaultSpinnerWrapperProps, props.spinnerWrapperProps),
);

const defaultTitleProps: HTMLAttributes = {
  class: 'ms-modern-confirm-here__title',
  style: {
    margin: 0,
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontSize: '1.18rem',
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
};

const titleProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(defaultTitleProps, props.titleProps),
);

const defaultMessageProps: HTMLAttributes = {
  class: 'ms-modern-confirm-here__message',
  style: {
    margin: 0,
    color: 'var(--ms-modern-text-secondary)',
    fontFamily: 'var(--ms-modern-font-family)',
    lineHeight: 1.6,
    maxWidth: '28ch',
  },
};

const messageProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(defaultMessageProps, props.messageProps),
);

const defaultCountdownWrapperProps: HTMLAttributes = {
  class: 'ms-modern-confirm-here__countdown',
  style: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '9999px',
    border: '1px solid var(--ms-modern-panel-border)',
    background: 'color-mix(in srgb, var(--ms-modern-brand-primary, #6366f1) 10%, var(--ms-modern-panel-surface) 90%)',
    color: 'var(--ms-modern-text-secondary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontSize: '0.88rem',
    justifySelf: 'center',
  },
};

const countdownWrapperProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(defaultCountdownWrapperProps, props.countdownWrapperProps),
);

const defaultCountdownValueProps: HTMLAttributes = {
  class: 'ms-modern-confirm-here__countdown-value',
  style: {
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontWeight: 700,
  },
};

const countdownValueProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(defaultCountdownValueProps, props.countdownValueProps),
);

const defaultConfirmButtonProps: ButtonHTMLAttributes = {
  class: 'ms-modern-confirm-here__confirm-button',
  style: {
    minHeight: '48px',
    minWidth: '180px',
    borderRadius: '14px',
    border: 'none',
    paddingInline: '20px',
    background:
      'linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 55%, var(--ms-modern-accent) 100%)',
    color: '#ffffff',
    fontFamily: 'var(--ms-modern-font-family)',
    fontWeight: 700,
    fontSize: '0.98rem',
    boxShadow: 'var(--ms-modern-shadow-soft)',
    cursor: 'pointer',
    transition: 'transform 160ms ease, box-shadow 160ms ease',
  },
};

const mergedConfirmButtonProps = computed<ButtonHTMLAttributes>(() =>
  mergeAttrObjects(defaultConfirmButtonProps, props.confirmButtonProps),
);

const confirmButtonAttrs = computed(() => {
  const { onClick, ...rest } = mergedConfirmButtonProps.value as ButtonHTMLAttributes & {
    onClick?: (event: MouseEvent) => void;
  };

  return {
    onClick,
    rest,
  };
});

const progressShellStyle = computed<CSSProperties>(() => ({
  position: 'relative',
  width: '108px',
  height: '108px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '9999px',
  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.02))',
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
}));

const counterTextStyle = computed<CSSProperties>(() => ({
  position: 'absolute',
  fontFamily: 'var(--ms-modern-font-family)',
  fontSize: '1.75rem',
  fontWeight: 700,
  lineHeight: 1,
  color: counterTone.value,
}));

const warningTextStyle = computed<CSSProperties>(() => ({
  margin: 0,
  fontFamily: 'var(--ms-modern-font-family)',
  fontSize: '0.8rem',
  lineHeight: 1.4,
  color:
    counter.value <= 30
      ? 'var(--ms-modern-danger, #ef4444)'
      : 'var(--ms-modern-text-muted, rgba(148, 163, 184, 0.95))',
}));

const spinnerIconStyle = computed<CSSProperties>(() => ({
  fontSize: '1.2rem',
  color: 'inherit',
  ...(((props.spinnerIconProps as Partial<FontAwesomeIconProps> | undefined)?.style as CSSProperties) ?? {}),
}));

const showSpinner = computed(
  () =>
    Boolean(
      props.renderSpinner ||
        props.spinnerIcon !== undefined ||
        props.spinnerWrapperProps !== undefined ||
        props.spinnerIconProps !== undefined,
    ),
);

const defaultSpinner = computed<VNodeChild>(() => {
  if (!showSpinner.value) {
    return null;
  }

  return h('div', spinnerWrapperProps.value, [
    props.spinnerIcon ??
      h(FontAwesomeIcon, {
        icon: faSpinner,
        spin: true,
        style: spinnerIconStyle.value,
        ...((props.spinnerIconProps as Partial<FontAwesomeIconProps> | undefined) ?? {}),
      }),
  ]);
});

const spinnerNode = computed<VNodeChild>(() => {
  if (props.renderSpinner) {
    return props.renderSpinner({ defaultSpinner: defaultSpinner.value });
  }

  return defaultSpinner.value;
});

const progressNode = computed(() =>
  h(
    'div',
    {
      class: 'ms-modern-confirm-here__progress-shell',
      style: progressShellStyle.value,
    },
    [
      h(
        'svg',
        {
          width: '108',
          height: '108',
          viewBox: '0 0 100 100',
          style: { transform: 'rotate(-90deg)' },
          'aria-hidden': 'true',
        },
        [
          h('circle', {
            cx: '50',
            cy: '50',
            r: '45',
            fill: 'none',
            stroke: 'rgba(148, 163, 184, 0.24)',
            strokeWidth: '6',
          }),
          h('circle', {
            cx: '50',
            cy: '50',
            r: '45',
            fill: 'none',
            stroke: progressStrokeColor.value,
            strokeWidth: '6',
            strokeLinecap: 'round',
            strokeDasharray: `${circumference}`,
            strokeDashoffset: `${circumference * (1 - progress.value)}`,
            style: {
              transition: 'stroke-dashoffset 1s linear, stroke 180ms ease',
              filter: `drop-shadow(0 0 6px ${progressStrokeColor.value})`,
            },
          }),
        ],
      ),
      h(
        'span',
        {
          class: 'ms-modern-confirm-here__progress-value',
          style: counterTextStyle.value,
        },
        String(counter.value),
      ),
    ],
  ),
);

const defaultTitleNode = computed(() =>
  h(
    'h2',
    titleProps.value,
    isVNode(resolvedTitle.value) ? resolvedTitle.value : String(resolvedTitle.value),
  ),
);

const titleNode = computed<VNodeChild>(() => {
  if (props.renderTitle) {
    return props.renderTitle({ defaultTitle: defaultTitleNode.value });
  }

  return defaultTitleNode.value;
});

const defaultMessageNode = computed(() =>
  h(
    'p',
    messageProps.value,
    isVNode(resolvedMessage.value) ? resolvedMessage.value : String(resolvedMessage.value),
  ),
);

const messageNode = computed<VNodeChild>(() => {
  if (props.renderMessage) {
    return props.renderMessage({
      defaultMessage: defaultMessageNode.value,
      counter: counter.value,
      countdownDuration: initialDuration.value,
    });
  }

  return defaultMessageNode.value;
});

const defaultCountdownNode = computed(() =>
  h('div', countdownWrapperProps.value, [
    isVNode(resolvedCountdownLabel.value)
      ? resolvedCountdownLabel.value
      : String(resolvedCountdownLabel.value),
    ' ',
    h(
      'span',
      countdownValueProps.value,
      String(counter.value),
    ),
  ]),
);

const countdownNode = computed<VNodeChild>(() => {
  if (props.renderCountdown) {
    return props.renderCountdown({
      defaultCountdown: defaultCountdownNode.value,
      counter: counter.value,
      countdownLabel: resolvedCountdownLabel.value,
    });
  }

  return defaultCountdownNode.value;
});

const handleConfirmHereClick = (event: MouseEvent) => {
  confirmButtonAttrs.value.onClick?.(event);

  if (!event.defaultPrevented) {
    confirmAndClose();
  }
};

const defaultConfirmButtonNode = computed(() =>
  h(
    'button',
    {
      ...confirmButtonAttrs.value.rest,
      type: 'button',
      onClick: handleConfirmHereClick,
    },
    isVNode(resolvedConfirmButtonLabel.value)
      ? resolvedConfirmButtonLabel.value
      : String(resolvedConfirmButtonLabel.value),
  ),
);

const confirmButtonNode = computed<VNodeChild>(() => {
  if (props.renderConfirmButton) {
    return props.renderConfirmButton({ defaultButton: defaultConfirmButtonNode.value });
  }

  return defaultConfirmButtonNode.value;
});

const defaultBodyNode = computed(() =>
  h('div', containerProps.value, [
    spinnerNode.value,
    progressNode.value,
    titleNode.value,
    messageNode.value,
    countdownNode.value,
    confirmButtonNode.value,
    h(
      'p',
      {
        class: 'ms-modern-confirm-here__warning',
        style: warningTextStyle.value,
      },
      warningMessage.value,
    ),
  ]),
);

const bodyNode = computed<VNodeChild>(() => {
  if (props.renderBody) {
    return props.renderBody({
      defaultBody: defaultBodyNode.value,
      spinner: spinnerNode.value,
      title: titleNode.value,
      message: messageNode.value,
      countdown: countdownNode.value,
      confirmButton: confirmButtonNode.value,
    });
  }

  return defaultBodyNode.value;
});

const defaultContentNode = computed(() =>
  h(
    'div',
    {
      ...contentProps.value,
      role: 'dialog',
      'aria-modal': 'true',
      'aria-live': 'polite',
    },
    [bodyNode.value],
  ),
);

const contentNode = computed<VNodeChild>(() => {
  if (props.renderContent) {
    return props.renderContent({ defaultContent: defaultContentNode.value });
  }

  return defaultContentNode.value;
});

const overlayNode = computed<VNodeChild>(() => {
  if (!props.isConfirmHereModalVisible) {
    return null;
  }

  return h('div', overlayProps.value, [contentNode.value]);
});
</script>