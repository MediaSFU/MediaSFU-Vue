<!--
/**
 * @fileoverview LoadingModal - Full-screen loading overlay with spinner
 * @component LoadingModal
 * @module components/displayComponents/LoadingModal
 * 
 * @description
 * A full-screen blocking loading overlay that displays a spinner and optional loading text.
 * Centers content vertically and horizontally, prevents user interaction with underlying UI,
 * and supports complete customization via render functions. Used during async operations
 * like room joining, recording start, or data fetching.
 * 
 * Features:
 * - Full viewport coverage with fixed positioning
 * - Animated FontAwesome spinner (faSpinner by default)
 * - Customizable background and text colors
 * - Optional loading text message
 * - Toggle spinner visibility independently
 * - Custom spinner icon support
 * - Complete render function control for spinner and content
 * - Full HTML attribute passthrough
 * 
 * @example Basic Loading Modal
 * // <LoadingModal
 *   // :isVisible="isLoading"
 *   // loadingText="Joining room..."
 * // />
 * 
 * @example Custom Colors
 * // <LoadingModal
 *   // :isVisible="processing"
 *   // loadingText="Processing request..."
 *   // backgroundColor="rgba(0,0,0,0.85)"
 *   // displayColor="#ffffff"
 * // />
 * 
 * @example Without Spinner (Text Only)
 * // <LoadingModal
 *   // :isVisible="saving"
 *   // loadingText="Saving changes..."
 *   // :showSpinner="false"
 *   // backgroundColor="#1a1a1a"
 *   // displayColor="#22c55e"
 * // />
 * 
 * @example Custom Spinner Icon
 * // <LoadingModal
 *   // :isVisible="uploading"
 *   // loadingText="Uploading file..."
 *   // :spinnerIcon="faCloudUploadAlt"
 *   // displayColor="#3b82f6"
 * // />
 * 
 * @example Custom Content Renderer
 * // <LoadingModal
 *   // :isVisible="connecting"
 *   // loadingText="Connecting to server..."
 *   // :renderContent="({ defaultContent, isVisible, displayColor, loadingText }) =>
 *     h('div', { class: 'custom-loading', style: { color: displayColor } }, [
 *       h('div', { class: 'loader-animation' }),
 *       h('h2', loadingText),
 *       h('p', 'Please wait...')
 *     ])
 *   "
 * // />
 * 
 * @example Custom Spinner Renderer
 * // <LoadingModal
 *   // :isVisible="loading"
 *   // loadingText="Loading..."
 *   // :renderSpinner="({ defaultSpinner, isVisible, displayColor }) =>
 *     h('div', { class: 'custom-spinner-wrapper' }, [
 *       h('div', {
 *         class: 'pulse-circle',
 *         style: { borderColor: displayColor }
 *       })
 *     ])
 *   "
 * // />
 * 
 * @remarks
 * This is a blocking modal - it prevents all user interaction with the underlying UI.
 * Use sparingly and only for operations that truly require the user to wait. For
 * non-blocking loading indicators, consider using inline spinners or progress bars.
 * 
 * Workflow:
 * 1. isVisible=true → Modal appears, covers entire viewport
 * 2. Spinner rotates (if showSpinner=true), text displays
 * 3. Async operation completes → Parent sets isVisible=false
 * 4. Modal disappears, user can interact with UI again
 * 
 * @see {@link AlertComponent} - For non-blocking notifications
 */
-->
<template>
  <RenderVNode :node="containerNode" />
</template>

<script setup lang="ts">
import {
  computed,
  defineComponent,
  h,
  isVNode,
  type CSSProperties,
  type HTMLAttributes,
  type PropType,
  type VNode,
  type VNodeChild,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSpinner, type IconDefinition } from '@fortawesome/free-solid-svg-icons';

/**
 * Options passed to renderSpinner function
 * @interface RenderSpinnerOptions
 * @property {VNode | null} defaultSpinner - The default FontAwesome spinner VNode
 * @property {boolean} isVisible - Whether the loading modal is visible
 * @property {string} displayColor - Color for the spinner
 */
interface RenderSpinnerOptions {
  defaultSpinner: VNode | null;
  isVisible: boolean;
  displayColor: string;
}

/**
 * Options passed to renderContent function
 * @interface RenderContentOptions
 * @property {VNode} defaultContent - The default loading content VNode (spinner + text)
 * @property {boolean} isVisible - Whether the loading modal is visible
 * @property {string} displayColor - Color for text and spinner
 * @property {VNodeChild} loadingText - The loading text message
 */
interface RenderContentOptions {
  defaultContent: VNode;
  isVisible: boolean;
  displayColor: string;
  loadingText: VNodeChild;
}

/**
 * Props for the LoadingModal component
 * @interface LoadingModalProps
 * 
 * @property {boolean} isVisible - Whether the loading modal is currently visible
 * @property {string} [backgroundColor='#83c0e9'] - Background color for the full-screen overlay
 * @property {string} [displayColor='black'] - Color for spinner and text
 * @property {VNodeChild} [loadingText=''] - Loading message text to display
 * @property {boolean} [showSpinner=true] - Whether to show the spinner animation
 * @property {IconDefinition} [spinnerIcon=faSpinner] - FontAwesome icon for the spinner
 * @property {HTMLAttributes} [containerProps] - Additional HTML attributes for the container
 * @property {HTMLAttributes} [contentProps] - Additional HTML attributes for the content wrapper
 * @property {HTMLAttributes} [spinnerWrapperProps] - Additional HTML attributes for the spinner wrapper
 * @property {Record<string, unknown>} [spinnerProps] - Additional props for the FontAwesomeIcon component
 * @property {HTMLAttributes} [textProps] - Additional HTML attributes for the text element
 * @property {(options: RenderSpinnerOptions) => VNodeChild} [renderSpinner] - Custom render function for spinner
 * @property {(options: RenderContentOptions) => VNodeChild} [renderContent] - Custom render function for entire content
 * 
 * @default backgroundColor - '#83c0e9'
 * @default displayColor - 'black'
 * @default loadingText - ''
 * @default showSpinner - true
 * @default spinnerIcon - faSpinner
 * 
 * @example
 * ```typescript
 * // <LoadingModal
 *   // :isVisible="isLoading"
 *   // loadingText="Please wait..."
 *   // backgroundColor="rgba(0,0,0,0.9)"
 *   // displayColor="#ffffff"
 *   // :showSpinner="true"
 * // />
 * ```
 */
export interface LoadingModalProps {
  isVisible: boolean;
  backgroundColor?: string;
  displayColor?: string;
  loadingText?: VNodeChild;
  showSpinner?: boolean;
  spinnerIcon?: IconDefinition;
  containerProps?: HTMLAttributes;
  contentProps?: HTMLAttributes;
  spinnerWrapperProps?: HTMLAttributes;
  spinnerProps?: Record<string, unknown>;
  textProps?: HTMLAttributes;
  renderSpinner?: (options: RenderSpinnerOptions) => VNodeChild;
  renderContent?: (options: RenderContentOptions) => VNodeChild;
}

const props = withDefaults(defineProps<LoadingModalProps>(), {
  backgroundColor: '#83c0e9',
  displayColor: 'black',
  loadingText: 'Loading...',
  showSpinner: true,
  spinnerIcon: () => faSpinner,
  containerProps: undefined,
  contentProps: undefined,
  spinnerWrapperProps: undefined,
  spinnerProps: undefined,
  textProps: undefined,
  renderSpinner: undefined,
  renderContent: undefined,
});

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

// Container props merging
const containerRestAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = props.containerProps || {};
  return rest;
});

const containerClassNames = computed(() =>
  joinClassNames('mediasfu-loading-modal', props.containerProps?.class as string | undefined)
);

const containerStyle = computed(() => {
  const baseStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: props.backgroundColor,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  };

  return {
    ...baseStyle,
    ...(typeof props.containerProps?.style === 'object' ? props.containerProps.style : {}),
  } as CSSProperties;
});

// Content props merging
const contentRestAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = props.contentProps || {};
  return rest;
});

const contentClassNames = computed(() =>
  joinClassNames(
    'mediasfu-loading-modal__content',
    props.contentProps?.class as string | undefined
  )
);

const contentStyle = computed(() => {
  const baseStyle: CSSProperties = {
    backgroundColor: props.backgroundColor,
    borderRadius: '10px',
    padding: '16px',
    maxWidth: '240px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'center',
  };

  return {
    ...baseStyle,
    ...(typeof props.contentProps?.style === 'object' ? props.contentProps.style : {}),
  } as CSSProperties;
});

// Spinner wrapper props merging
const spinnerWrapperRestAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = props.spinnerWrapperProps || {};
  return rest;
});

const spinnerWrapperClassNames = computed(() =>
  joinClassNames(
    'mediasfu-loading-modal__spinner-wrapper',
    props.spinnerWrapperProps?.class as string | undefined
  )
);

const spinnerWrapperStyle = computed(() => {
  const baseStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
  };

  return {
    ...baseStyle,
    ...(typeof props.spinnerWrapperProps?.style === 'object'
      ? props.spinnerWrapperProps.style
      : {}),
  } as CSSProperties;
});

// Spinner element
const spinnerElement = computed(() => {
  if (!props.showSpinner) return null;

  const spinnerStyle: CSSProperties = {
    fontSize: '48px',
    color: props.displayColor,
  };

  return h(
    FontAwesomeIcon,
    {
      icon: props.spinnerIcon,
      spin: true,
      style: spinnerStyle,
      ...props.spinnerProps,
    },
    {}
  );
});

// Rendered spinner (with wrapper)
const renderedSpinner = computed(() => {
  if (!props.showSpinner) return null;

  return h(
    'div',
    {
      class: spinnerWrapperClassNames.value,
      style: spinnerWrapperStyle.value,
      ...spinnerWrapperRestAttrs.value,
    },
    [spinnerElement.value]
  );
});

// Text props merging
const textRestAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = props.textProps || {};
  return rest;
});

const textClassNames = computed(() =>
  joinClassNames('mediasfu-loading-modal__text', props.textProps?.class as string | undefined)
);

const textStyle = computed(() => {
  const baseStyle: CSSProperties = {
    color: props.displayColor,
    textAlign: 'center',
  };

  return {
    ...baseStyle,
    ...(typeof props.textProps?.style === 'object' ? props.textProps.style : {}),
  } as CSSProperties;
});

// Default content node
const defaultContentNode = computed(() => {
  const children: VNode[] = [];

  // Spinner
  if (props.renderSpinner) {
    const customSpinner = props.renderSpinner({
      defaultSpinner: renderedSpinner.value,
      isVisible: props.isVisible,
      displayColor: props.displayColor,
    });
    if (customSpinner) {
      if (isVNode(customSpinner)) {
        children.push(customSpinner);
      } else {
        children.push(h(RenderVNode, { node: customSpinner }));
      }
    }
  } else if (renderedSpinner.value) {
    children.push(renderedSpinner.value);
  }

  // Text
  const textContent =
    typeof props.loadingText === 'function'
      ? (props.loadingText as () => VNodeChild)()
      : props.loadingText;

  children.push(
    h(
      'div',
      {
        class: textClassNames.value,
        style: textStyle.value,
        ...textRestAttrs.value,
      },
      isVNode(textContent) ? [textContent] : [h(RenderVNode, { node: textContent })]
    )
  );

  return h(
    'div',
    {
      class: contentClassNames.value,
      style: contentStyle.value,
      ...contentRestAttrs.value,
    },
    children
  );
});

// Final content (with renderContent hook)
const finalContent = computed(() => {
  if (props.renderContent) {
    const customContent = props.renderContent({
      defaultContent: defaultContentNode.value,
      isVisible: props.isVisible,
      displayColor: props.displayColor,
      loadingText: props.loadingText || 'Loading...',
    });
    if (customContent) {
      if (isVNode(customContent)) return customContent;
      return h(RenderVNode, { node: customContent });
    }
  }
  return defaultContentNode.value;
});

// Container node
const containerNode = computed(() => {
  if (!props.isVisible) return null;

  return h(
    'div',
    {
      class: containerClassNames.value,
      style: containerStyle.value,
      ...containerRestAttrs.value,
    },
    [finalContent.value]
  );
});

</script>

<style scoped>
/* Component-specific styles */
</style>
