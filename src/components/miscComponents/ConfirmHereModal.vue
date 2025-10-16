<!--
/**
 * @fileoverview ConfirmHereModal - Presence confirmation modal with countdown
 * @component ConfirmHereModal
 * @module components/miscComponents/ConfirmHereModal
 * 
 * @description
 * A modal dialog that prompts the user to confirm their presence with a countdown timer.
 * If the user doesn't confirm within the countdown duration, they may be removed from
 * the meeting or face other consequences. Features real-time countdown, Socket.io
 * communication, and customizable messaging. Used to prevent inactive participants
 * from occupying meeting slots.
 * 
 * Features:
 * - Countdown timer with real-time updates (default 120 seconds)
 * - "Yes, I'm here" confirmation button
 * - Socket.io event emission on confirmation
 * - Auto-timeout handler if countdown reaches zero
 * - Customizable title, message, and labels
 * - Dynamic message function with counter context
 * - Loading spinner during confirmation
 * - Complete render function customization
 * - Responsive positioning
 * 
 * @example Basic Confirmation Modal
 * // <ConfirmHereModal
 *   // :isConfirmHereModalVisible="showConfirmModal"
 *   // :onConfirmHereClose="() => { showConfirmModal = false; }"
 *   // :socket="socketInstance"
 *   // roomName="meeting-123"
 *   // member="john_doe"
 * // />
 * 
 * @example Custom Countdown Duration
 * // <ConfirmHereModal
 *   // :isConfirmHereModalVisible="true"
 *   // :onConfirmHereClose="handleClose"
 *   // :socket="socket"
 *   // roomName="meeting-456"
 *   // member="jane_smith"
 *   // :countdownDuration="60"
 *   // title="Are you still there?"
 *   // :onTimeout="() => handleTimeout()"
 * // />
 * 
 * @example Dynamic Message with Counter
 * // <ConfirmHereModal
 *   // :isConfirmHereModalVisible="visible"
 *   // :onConfirmHereClose="close"
 *   // :socket="socket"
 *   // roomName="webinar-789"
 *   // member="participant_1"
 *   // :countdownDuration="90"
 *   // :message="({ counter, countdownDuration }) =>
 *     `You will be removed in ${counter} seconds if you don't confirm. (${countdownDuration}s total)`
 *   "
 * // />
 * 
 * @example Custom Styling
 * // <ConfirmHereModal
 *   // :isConfirmHereModalVisible="true"
 *   // :onConfirmHereClose="handleClose"
 *   // :socket="socket"
 *   // roomName="meeting-abc"
 *   // member="user_123"
 *   // backgroundColor="rgba(255,59,48,0.95)"
 *   // title="Inactivity Detected"
 *   // confirmButtonLabel="I'm Active!"
 *   // :onTimeout="handleInactiveTimeout"
 * // />
 * 
 * @remarks
 * The modal emits a Socket.io event 'confirmHere' when the user clicks the confirm button.
 * The countdown timer automatically starts when the modal becomes visible and cleans up
 * when hidden or unmounted. If the countdown reaches zero, the onTimeout callback is
 * triggered (if provided).
 * 
 * Workflow:
 * 1. Modal becomes visible → Countdown starts from countdownDuration (default 120s)
 * 2. Counter decrements every second
 * 3. User clicks "Yes, I'm here" → Emits 'confirmHere' event via Socket.io
 * 4. Confirmation accepted → onConfirmHereClose() called, modal closes
 * 5. Alternative: Counter reaches 0 → onTimeout() called, user may be removed
 * 6. Modal hidden → Countdown timer cleaned up
 * 
 * @see {@link WelcomePage} - May trigger this modal for inactive users
 * @see {@link PreJoinPage} - Pre-join page before entering meeting
 */
-->
<template>
  <RenderVNode :node="overlayNode" />
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onUnmounted,
  defineComponent,
  h,
  isVNode,
  type PropType,
  type VNodeChild,
  type CSSProperties,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import type { Socket } from 'socket.io-client';
import type { FontAwesomeIconProps } from '@fortawesome/vue-fontawesome';

// Helper function to join class names
function joinClassNames(...classes: Array<string | undefined | null | false>): string | undefined {
  const filtered = classes.filter(Boolean) as string[];
  return filtered.length > 0 ? filtered.join(' ') : undefined;
}

/**
 * Props for the ConfirmHereModal component
 * @interface ConfirmHereModalProps
 * 
 * @property {boolean} isConfirmHereModalVisible - Whether the modal is currently visible
 * @property {() => void} onConfirmHereClose - Callback when modal should close (after confirmation)
 * @property {string} [backgroundColor='rgba(0, 0, 0, 0.5)'] - Background overlay color
 * @property {number} [countdownDuration=120] - Countdown duration in seconds
 * @property {Socket} socket - Socket.io client instance for emitting confirmation
 * @property {Socket} [localSocket] - Optional local socket instance
 * @property {string} roomName - Room name to include in Socket.io event
 * @property {string} member - Username/member name to include in Socket.io event
 * @property {VNodeChild} [title='Confirm Your Presence'] - Modal title
 * @property {VNodeChild | ((context: { counter: number; countdownDuration: number }) => VNodeChild)} [message] - Message text or function
 * @property {VNodeChild} [countdownLabel] - Label for countdown display
 * @property {VNodeChild} [confirmButtonLabel='Yes, I am here'] - Confirmation button text
 * @property {() => void} [onTimeout] - Callback when countdown reaches zero
 * @property {HTMLAttributes} [overlayProps] - Additional HTML attributes for overlay
 * @property {HTMLAttributes} [contentProps] - Additional HTML attributes for content container
 * @property {HTMLAttributes} [containerProps] - Additional HTML attributes for inner container
 * @property {HTMLAttributes} [spinnerWrapperProps] - Additional HTML attributes for spinner wrapper
 * @property {VNodeChild} [spinnerIcon] - Custom spinner icon/component
 * @property {Partial<FontAwesomeIconProps>} [spinnerIconProps] - Props for spinner icon
 * 
 * @default backgroundColor - 'rgba(0, 0, 0, 0.5)'
 * @default countdownDuration - 120
 * @default title - 'Confirm Your Presence'
 * @default confirmButtonLabel - 'Yes, I am here'
 * 
 * @example
 * ```typescript
 * // <ConfirmHereModal
 *   // :isConfirmHereModalVisible="showModal"
 *   // :onConfirmHereClose="handleClose"
 *   // :socket="socket"
 *   // roomName="meeting-123"
 *   // member="john_doe"
 *   // :countdownDuration="90"
 *   // title="Are you still active?"
 *   // :message="({ counter }) => `Confirming in ${counter}s...`"
 *   // :onTimeout="handleTimeout"
 * // />
 * ```
 */
export interface ConfirmHereModalProps {
  isConfirmHereModalVisible: boolean;
  onConfirmHereClose: () => void;
  backgroundColor?: string;
  countdownDuration?: number;
  socket: Socket;
  localSocket?: Socket;
  roomName: string;
  member: string;
  title?: VNodeChild;
  message?: VNodeChild | ((context: { counter: number; countdownDuration: number }) => VNodeChild);
  countdownLabel?: VNodeChild;
  confirmButtonLabel?: VNodeChild;
  onTimeout?: () => void;
  overlayProps?: HTMLAttributes;
  contentProps?: HTMLAttributes;
  containerProps?: HTMLAttributes;
  spinnerWrapperProps?: HTMLAttributes;
  spinnerIcon?: VNodeChild;
  spinnerIconProps?: Partial<FontAwesomeIconProps>;
  titleProps?: HTMLAttributes;
  messageProps?: HTMLAttributes;
  countdownWrapperProps?: HTMLAttributes;
  countdownValueProps?: HTMLAttributes;
  confirmButtonProps?: ButtonHTMLAttributes;
  renderSpinner?: (options: { defaultSpinner: VNodeChild }) => VNodeChild;
  renderTitle?: (options: { defaultTitle: VNodeChild }) => VNodeChild;
  renderMessage?: (options: { 
    defaultMessage: VNodeChild; 
    counter: number; 
    countdownDuration: number;
  }) => VNodeChild;
  renderCountdown?: (options: { 
    defaultCountdown: VNodeChild; 
    counter: number; 
    countdownLabel: VNodeChild;
  }) => VNodeChild;
  renderConfirmButton?: (options: { defaultButton: VNodeChild }) => VNodeChild;
  renderBody?: (options: {
    defaultBody: VNodeChild;
    spinner: VNodeChild;
    title: VNodeChild;
    message: VNodeChild;
    countdown: VNodeChild;
    confirmButton: VNodeChild;
  }) => VNodeChild;
  renderContent?: (options: { defaultContent: VNodeChild }) => VNodeChild;
}

const props = withDefaults(defineProps<ConfirmHereModalProps>(), {
  backgroundColor: '#83c0e9',
  countdownDuration: 120,
  localSocket: undefined,
  title: () => 'Are you still there?',
  message: () => 'Please confirm if you are still present.',
  countdownLabel: () => 'Time remaining:',
  confirmButtonLabel: () => 'Yes',
  onTimeout: undefined,
  overlayProps: undefined,
  contentProps: undefined,
  containerProps: undefined,
  spinnerWrapperProps: undefined,
  spinnerIcon: undefined,
  spinnerIconProps: undefined,
  titleProps: undefined,
  messageProps: undefined,
  countdownWrapperProps: undefined,
  countdownValueProps: undefined,
  confirmButtonProps: undefined,
  renderSpinner: undefined,
  renderTitle: undefined,
  renderMessage: undefined,
  renderCountdown: undefined,
  renderConfirmButton: undefined,
  renderBody: undefined,
  renderContent: undefined,
});

// RenderVNode wrapper component
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

const counter = ref<number>(props.countdownDuration);
let countdownInterval: ReturnType<typeof setInterval> | null = null;

const initialDuration = computed(() => Math.max(0, props.countdownDuration ?? 120));

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
      // Ignore local socket errors silently
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
    timeRemaining--;
    counter.value = Math.max(timeRemaining, 0);

    if (timeRemaining <= 0) {
      clearCountdown();
      handleTimeout();
    }
  }, 1000);
};

// Watch for modal visibility and duration changes
watch(
  () => [props.isConfirmHereModalVisible, initialDuration.value] as const,
  ([isVisible, duration]) => {
    counter.value = duration;
    
    if (isVisible) {
      startCountdown();
    } else {
      clearCountdown();
    }
  },
  { immediate: true }
);

// Cleanup on unmount
onUnmounted(() => {
  clearCountdown();
});

// Resolved message
const resolvedMessage = computed(() => {
  if (typeof props.message === 'function') {
    return props.message({ counter: counter.value, countdownDuration: initialDuration.value });
  }
  return props.message ?? 'Please confirm if you are still present.';
});

// Overlay props and styles
const overlayAttrs = computed(() => {
  const overlayProps = props.overlayProps || {};
  const { class: cls, style, ...rest } = overlayProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const overlayClassNames = computed(() => 
  joinClassNames('mediasfu-confirm-here__overlay', overlayAttrs.value.className)
);

const overlayStyle = computed<CSSProperties>(() => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: props.backgroundColor ?? 'rgba(0, 0, 0, 0.5)',
  display: props.isConfirmHereModalVisible ? 'flex' : 'none',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
  zIndex: 999,
  ...overlayAttrs.value.style,
}));

// Content props and styles
const contentAttrs = computed(() => {
  const contentProps = props.contentProps || {};
  const { class: cls, style, ...rest } = contentProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const overlayWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.9, 400) : 320;

const contentClassNames = computed(() => 
  joinClassNames('mediasfu-confirm-here__content', contentAttrs.value.className)
);

const contentStyle = computed<CSSProperties>(() => ({
  backgroundColor: props.backgroundColor,
  borderRadius: '12px',
  padding: '24px',
  width: '100%',
  maxWidth: `${overlayWidth}px`,
  boxShadow: '0 15px 45px rgba(0,0,0,0.25)',
  display: 'flex',
  flexDirection: 'column',
  ...contentAttrs.value.style,
}));

// Container props and styles
const containerAttrs = computed(() => {
  const containerProps = props.containerProps || {};
  const { class: cls, style, ...rest } = containerProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const containerClassNames = computed(() => 
  joinClassNames('mediasfu-confirm-here__inner', containerAttrs.value.className)
);

const containerStyle = computed<CSSProperties>(() => ({
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  ...containerAttrs.value.style,
}));

// Spinner wrapper props and styles
const spinnerWrapperAttrs = computed(() => {
  const spinnerWrapperProps = props.spinnerWrapperProps || {};
  const { class: cls, style, ...rest} = spinnerWrapperProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const spinnerWrapperClassNames = computed(() => 
  joinClassNames('mediasfu-confirm-here__spinner', spinnerWrapperAttrs.value.className)
);

const spinnerWrapperStyle = computed<CSSProperties>(() => ({
  fontSize: '3rem',
  color: 'black',
  ...spinnerWrapperAttrs.value.style,
}));

// Spinner icon props and styles
const spinnerIconAttrs = computed(() => {
  const spinnerIconProps = props.spinnerIconProps || {};
  const { style, ...rest } = spinnerIconProps as Record<string, unknown>;
  return {
    style: style as CSSProperties | undefined,
    rest,
  };
});

const spinnerIconStyle = computed<CSSProperties>(() => ({
  fontSize: 'inherit',
  color: 'inherit',
  ...spinnerIconAttrs.value.style,
}));

// Title props and styles
const titleAttrs = computed(() => {
  const titleProps = props.titleProps || {};
  const { class: cls, style, ...rest } = titleProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const titleClassNames = computed(() => 
  joinClassNames('mediasfu-confirm-here__title', titleAttrs.value.className)
);

const titleStyle = computed<CSSProperties>(() => ({
  fontSize: '1.5rem',
  fontWeight: 700,
  margin: 0,
  color: 'black',
  ...titleAttrs.value.style,
}));

// Message props and styles
const messageAttrs = computed(() => {
  const messageProps = props.messageProps || {};
  const { class: cls, style, ...rest } = messageProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const messageClassNames = computed(() => 
  joinClassNames('mediasfu-confirm-here__message', messageAttrs.value.className)
);

const messageStyle = computed<CSSProperties>(() => ({
  fontSize: '1rem',
  color: 'black',
  margin: 0,
  ...messageAttrs.value.style,
}));

// Countdown wrapper props and styles
const countdownWrapperAttrs = computed(() => {
  const countdownWrapperProps = props.countdownWrapperProps || {};
  const { class: cls, style, ...rest } = countdownWrapperProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const countdownWrapperClassNames = computed(() => 
  joinClassNames('mediasfu-confirm-here__countdown', countdownWrapperAttrs.value.className)
);

const countdownWrapperStyle = computed<CSSProperties>(() => ({
  fontSize: '0.95rem',
  color: 'black',
  margin: 0,
  ...countdownWrapperAttrs.value.style,
}));

// Countdown value props and styles
const countdownValueAttrs = computed(() => {
  const countdownValueProps = props.countdownValueProps || {};
  const { class: cls, style, ...rest } = countdownValueProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const countdownValueClassNames = computed(() => 
  joinClassNames('mediasfu-confirm-here__countdown-value', countdownValueAttrs.value.className)
);

const countdownValueStyle = computed<CSSProperties>(() => ({
  fontWeight: 700,
  ...countdownValueAttrs.value.style,
}));

// Confirm button props and styles
const confirmButtonAttrs = computed(() => {
  const confirmButtonProps = props.confirmButtonProps || {};
  const { class: cls, style, onClick, ...rest } = confirmButtonProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    onClick: onClick as ((event: MouseEvent) => void) | undefined,
    rest,
  };
});

const confirmButtonClassNames = computed(() => 
  joinClassNames('mediasfu-confirm-here__confirm', confirmButtonAttrs.value.className)
);

const confirmButtonStyle = computed<CSSProperties>(() => ({
  backgroundColor: '#dc3545',
  color: 'white',
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '1rem',
  minWidth: '120px',
  ...confirmButtonAttrs.value.style,
}));

const handleConfirmHereClick = (event: MouseEvent) => {
  if (confirmButtonAttrs.value.onClick) {
    confirmButtonAttrs.value.onClick(event);
  }
  if (!event.defaultPrevented) {
    confirmAndClose();
  }
};

// Build VNodes
const defaultSpinner = computed(() => 
  h(
    'div',
    {
      class: spinnerWrapperClassNames.value,
      style: spinnerWrapperStyle.value,
      ...spinnerWrapperAttrs.value.rest,
    },
    [
      props.spinnerIcon ?? h(FontAwesomeIcon, {
        icon: faSpinner,
        spin: true,
        style: spinnerIconStyle.value,
        ...spinnerIconAttrs.value.rest,
      })
    ]
  )
);

const spinnerNode = computed(() => {
  if (props.renderSpinner) {
    return props.renderSpinner({ defaultSpinner: defaultSpinner.value });
  }
  return defaultSpinner.value;
});

const defaultTitle = computed(() => 
  h(
    'h2',
    {
      class: titleClassNames.value,
      style: titleStyle.value,
      ...titleAttrs.value.rest,
    },
    isVNode(props.title) ? props.title : String(props.title)
  )
);

const titleNode = computed(() => {
  if (props.renderTitle) {
    return props.renderTitle({ defaultTitle: defaultTitle.value });
  }
  return defaultTitle.value;
});

const defaultMessageNode = computed(() => 
  h(
    'p',
    {
      class: messageClassNames.value,
      style: messageStyle.value,
      ...messageAttrs.value.rest,
    },
    isVNode(resolvedMessage.value) ? resolvedMessage.value : String(resolvedMessage.value)
  )
);

const messageNode = computed(() => {
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
  h(
    'p',
    {
      class: countdownWrapperClassNames.value,
      style: countdownWrapperStyle.value,
      ...countdownWrapperAttrs.value.rest,
    },
    [
      isVNode(props.countdownLabel) ? props.countdownLabel : String(props.countdownLabel),
      ' ',
      h(
        'span',
        {
          class: countdownValueClassNames.value,
          style: countdownValueStyle.value,
          ...countdownValueAttrs.value.rest,
        },
        String(counter.value)
      ),
    ]
  )
);

const countdownNode = computed(() => {
  if (props.renderCountdown) {
    return props.renderCountdown({
      defaultCountdown: defaultCountdownNode.value,
      counter: counter.value,
      countdownLabel: props.countdownLabel ?? 'Time remaining:',
    });
  }
  return defaultCountdownNode.value;
});

const defaultConfirmButton = computed(() => 
  h(
    'button',
    {
      type: 'button',
      class: confirmButtonClassNames.value,
      style: confirmButtonStyle.value,
      onClick: handleConfirmHereClick,
      ...confirmButtonAttrs.value.rest,
    },
    isVNode(props.confirmButtonLabel) ? props.confirmButtonLabel : String(props.confirmButtonLabel)
  )
);

const confirmButtonNode = computed(() => {
  if (props.renderConfirmButton) {
    return props.renderConfirmButton({ defaultButton: defaultConfirmButton.value });
  }
  return defaultConfirmButton.value;
});

const defaultBody = computed(() => 
  h(
    'div',
    {
      class: containerClassNames.value,
      style: containerStyle.value,
      ...containerAttrs.value.rest,
    },
    [
      spinnerNode.value,
      titleNode.value,
      messageNode.value,
      countdownNode.value,
      confirmButtonNode.value,
    ]
  )
);

const bodyNode = computed(() => {
  if (props.renderBody) {
    return props.renderBody({
      defaultBody: defaultBody.value,
      spinner: spinnerNode.value,
      title: titleNode.value,
      message: messageNode.value,
      countdown: countdownNode.value,
      confirmButton: confirmButtonNode.value,
    });
  }
  return defaultBody.value;
});

const defaultContent = computed(() => 
  h(
    'div',
    {
      class: contentClassNames.value,
      style: contentStyle.value,
      ...contentAttrs.value.rest,
    },
    [bodyNode.value]
  )
);

const contentNode = computed(() => {
  if (props.renderContent) {
    return props.renderContent({ defaultContent: defaultContent.value });
  }
  return defaultContent.value;
});

const overlayNode = computed<VNodeChild>(() => {
  return h(
    'div',
    {
      class: overlayClassNames.value,
      style: overlayStyle.value,
      ...overlayAttrs.value.rest,
    },
    [contentNode.value]
  );
});
</script>
