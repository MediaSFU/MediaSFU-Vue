<!--
/**
 * @fileoverview AlertComponent - Auto-dismissing toast notification overlay
 * @component AlertComponent
 * @module components/displayComponents/AlertComponent
 * 
 * @description
 * A flexible toast notification component that displays temporary messages with auto-dismiss
 * functionality. Supports success/danger types with customizable colors, duration, and
 * completely custom render functions for message and container. Positioned as a fixed
 * overlay at the top of the viewport.
 * 
 * Features:
 * - Two alert types: success (green) and danger (red)
 * - Auto-dismiss with configurable duration (default 4000ms)
 * - Manual dismiss on user click
 * - Custom render functions for complete UI control
 * - Full HTML attribute passthrough for styling
 * - Automatic timer cleanup on unmount
 * - Smooth visibility transitions
 * 
 * Alert Types:
 * - **success**: Green background (#4BB543) - for confirmations, completions
 * - **danger**: Red background (#FF0000) - for errors, warnings
 * 
 * @example Basic Success Alert
 * // <AlertComponent
 *   // :visible="showAlert"
 *   // message="Action completed successfully!"
 *   // type="success"
 *   // :duration="3000"
 *   // :onHide="() => { showAlert = false; }"
 * // />
 * 
 * @example Danger Alert with Custom Text Color
 * // <AlertComponent
 *   // :visible="errorVisible"
 *   // message="An error occurred. Please try again."
 *   // type="danger"
 *   // :duration="5000"
 *   // textColor="#ffffff"
 *   // :onHide="handleHideError"
 * // />
 * 
 * @example Custom Styled Alert
 * // <AlertComponent
 *   // :visible="notificationVisible"
 *   // message="New message received"
 *   // type="success"
 *   // :duration="4000"
 *   // :containerProps="{
 *     class: 'custom-alert-container',
 *     style: { borderRadius: '12px', padding: '20px' }
 *   }"
 *   // :messageProps="{ class: 'custom-message', style: { fontSize: '16px' } }"
 *   // :onHide="() => { notificationVisible = false; }"
 * // />
 * 
 * @example Custom Message Renderer
 * // <AlertComponent
 *   // :visible="visible"
 *   // message="Custom alert"
 *   // type="success"
 *   // :renderMessage="({ defaultMessage }) =>
 *     h('div', { class: 'custom-alert-message' }, [
 *       h('i', { class: 'fa fa-check-circle' }),
 *       h('span', defaultMessage)
 *     ])
 *   "
 *   // :onHide="handleHide"
 * // />
 * 
 * @example Custom Content Renderer (Full Control)
 * // <AlertComponent
 *   // :visible="visible"
 *   // message="Full custom alert"
 *   // :renderContent="({ defaultContent }) =>
 *     h('div', {
 *       class: 'fully-custom-alert',
 *       style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
 *       onClick: handleCustomDismiss
 *     }, [
 *       h('div', { class: 'alert-icon' }, '🎉'),
 *       h('div', { class: 'alert-text' }, 'Custom Alert Content!'),
 *       h('button', { class: 'close-btn' }, '×')
 *     ])
 *   "
 *   // :onHide="handleHide"
 * // />
 * 
 * @remarks
 * The alert automatically dismisses after the specified duration. Users can also
 * manually dismiss by clicking anywhere on the alert. The onHide callback is
 * triggered in both auto-dismiss and manual dismiss scenarios.
 * 
 * Workflow:
 * 1. visible=true → Alert appears at top of viewport
 * 2. Auto-dismiss timer starts (if duration > 0)
 * 3. Timer expires OR user clicks → onHide() called
 * 4. Parent sets visible=false → Alert disappears
 * 5. Component unmounts → Timer automatically cleared
 * 
 * @see {@link LoadingModal} - For blocking loading indicators
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
  onMounted,
  onUnmounted,
  defineComponent,
  h,
  isVNode,
  type CSSProperties,
  type HTMLAttributes,
  type PropType,
  type VNode,
  type VNodeChild,
} from 'vue';

/**
 * Options passed to renderMessage function
 * @interface RenderMessageOptions
 * @property {VNode} defaultMessage - The default message VNode with text content
 */
interface RenderMessageOptions {
  defaultMessage: VNode;
}

/**
 * Options passed to renderContent function
 * @interface RenderContentOptions
 * @property {VNode} defaultContent - The default alert container VNode with message
 */
interface RenderContentOptions {
  defaultContent: VNode;
}

/**
 * Props for the AlertComponent
 * @interface AlertComponentProps
 * 
 * @property {boolean} visible - Whether the alert is currently visible
 * @property {string} message - Message text to display in the alert
 * @property {'success' | 'danger'} [type='success'] - Alert type (success=green, danger=red)
 * @property {number} [duration=4000] - Auto-dismiss duration in milliseconds (0 = no auto-dismiss)
 * @property {() => void} [onHide] - Callback when alert is dismissed (auto or manual)
 * @property {string} [textColor='black'] - Text color for the message
 * @property {HTMLAttributes} [overlayProps] - Additional HTML attributes for the overlay wrapper
 * @property {HTMLAttributes} [containerProps] - Additional HTML attributes for the alert container
 * @property {HTMLAttributes} [messageProps] - Additional HTML attributes for the message element
 * @property {(options: RenderMessageOptions) => VNodeChild} [renderMessage] - Custom render function for message content
 * @property {(options: RenderContentOptions) => VNodeChild} [renderContent] - Custom render function for entire alert (full control)
 * 
 * @default type - 'success'
 * @default duration - 4000
 * @default textColor - 'black'
 * 
 * @example
 * ```typescript
 * // <AlertComponent
 *   // :visible="isVisible"
 *   // message="Operation successful"
 *   // type="success"
 *   // :duration="3000"
 *   // textColor="#ffffff"
 *   // :onHide="() => { isVisible = false; }"
 *   // :containerProps="{ style: { borderRadius: '8px' } }"
 * // />
 * ```
 */
export interface AlertComponentProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'danger';
  duration?: number;
  onHide?: () => void;
  textColor?: string;
  overlayProps?: HTMLAttributes;
  containerProps?: HTMLAttributes;
  messageProps?: HTMLAttributes;
  renderMessage?: (options: RenderMessageOptions) => VNodeChild;
  renderContent?: (options: RenderContentOptions) => VNodeChild;
}

const props = withDefaults(defineProps<AlertComponentProps>(), {
  type: 'success',
  duration: 4000,
  textColor: 'black',
  onHide: undefined,
  overlayProps: undefined,
  containerProps: undefined,
  messageProps: undefined,
  renderMessage: undefined,
  renderContent: undefined,
});

const alertType = ref<'success' | 'danger'>(props.type);
let timer: ReturnType<typeof setTimeout> | null = null;

// Helper: Join class names
function joinClassNames(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

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

watch(
  () => props.type,
  (newType) => {
    if (newType) {
      alertType.value = newType;
    }
  }
);

watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible && props.duration > 0) {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        props.onHide?.();
      }, props.duration);
    }
  }
);

onMounted(() => {
  if (props.visible && props.duration > 0) {
    timer = setTimeout(() => {
      props.onHide?.();
    }, props.duration);
  }
});

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer);
  }
});

// Overlay props merging
const overlayRestAttrs = computed(() => {
  const { class: _c, style: _s, onClick: _o, ...rest } = props.overlayProps || {};
  return rest;
});

const overlayClassNames = computed(() =>
  joinClassNames('mediasfu-alert__overlay', props.overlayProps?.class as string | undefined)
);

const overlayStyle = computed(() => {
  const baseStyle: CSSProperties = {
    display: props.visible ? 'flex' : 'none',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    padding: '16px',
  };

  return {
    ...baseStyle,
    ...(typeof props.overlayProps?.style === 'object' ? props.overlayProps.style : {}),
  } as CSSProperties;
});

// Container props merging
const containerRestAttrs = computed(() => {
  const { class: _c, style: _s, onClick: _o, ...rest } = props.containerProps || {};
  return rest;
});

const containerClassNames = computed(() =>
  joinClassNames(
    'mediasfu-alert__container',
    'modalView',
    props.containerProps?.class as string | undefined
  )
);

const containerStyle = computed(() => {
  const baseStyle: CSSProperties = {
    backgroundColor: alertType.value === 'success' ? '#16a34a' : '#dc2626',
    borderRadius: '12px',
    padding: '20px 24px',
    maxWidth: '420px',
    width: '100%',
    boxShadow: '0 20px 45px rgba(0,0,0,0.25)',
    transition: 'transform 0.2s ease, opacity 0.2s ease',
    color: props.textColor,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  };

  return {
    ...baseStyle,
    ...(typeof props.containerProps?.style === 'object' ? props.containerProps.style : {}),
  } as CSSProperties;
});

// Message props merging
const messageRestAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = props.messageProps || {};
  return rest;
});

const messageClassNames = computed(() =>
  joinClassNames(
    'mediasfu-alert__message',
    'modalText',
    props.messageProps?.class as string | undefined
  )
);

const messageStyle = computed(() => {
  const baseStyle: CSSProperties = {
    margin: 0,
    color: props.textColor,
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.4,
  };

  return {
    ...baseStyle,
    ...(typeof props.messageProps?.style === 'object' ? props.messageProps.style : {}),
  } as CSSProperties;
});

// Default message
const defaultMessage = computed(() =>
  h(
    'p',
    {
      class: messageClassNames.value,
      style: messageStyle.value,
      ...messageRestAttrs.value,
    },
    props.message
  )
);

// Message node (with renderMessage hook)
const messageNode = computed(() => {
  if (props.renderMessage) {
    const customMessage = props.renderMessage({ defaultMessage: defaultMessage.value });
    if (customMessage) {
      if (isVNode(customMessage)) return customMessage;
      return h(RenderVNode, { node: customMessage });
    }
  }
  return defaultMessage.value;
});

// Container dismiss handler
const handleDismiss = (event: MouseEvent) => {
  const containerOnClick = props.containerProps?.onClick as ((e: MouseEvent) => void) | undefined;
  containerOnClick?.(event);
  if (!event.defaultPrevented) {
    props.onHide?.();
  }
};

// Default content
const defaultContent = computed(() =>
  h(
    'div',
    {
      role: 'alert',
      'aria-live': alertType.value === 'danger' ? 'assertive' : 'polite',
      class: containerClassNames.value,
      style: containerStyle.value,
      onClick: handleDismiss,
      ...containerRestAttrs.value,
    },
    [messageNode.value]
  )
);

// Final content (with renderContent hook)
const contentNode = computed(() => {
  if (props.renderContent) {
    const customContent = props.renderContent({ defaultContent: defaultContent.value });
    if (customContent) {
      if (isVNode(customContent)) return customContent;
      return h(RenderVNode, { node: customContent });
    }
  }
  return defaultContent.value;
});

// Overlay click handler
const handleOverlayClick = (event: MouseEvent) => {
  const overlayOnClick = props.overlayProps?.onClick as ((e: MouseEvent) => void) | undefined;
  overlayOnClick?.(event);
  if (!event.defaultPrevented && event.target === event.currentTarget) {
    props.onHide?.();
  }
};

// Overlay node
const overlayNode = computed(() =>
  h(
    'div',
    {
      class: overlayClassNames.value,
      style: overlayStyle.value,
      onClick: handleOverlayClick,
      ...overlayRestAttrs.value,
    },
    [contentNode.value]
  )
);

</script>

<style scoped>
/* Component-specific styles */
</style>
