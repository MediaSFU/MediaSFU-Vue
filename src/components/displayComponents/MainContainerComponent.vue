<!--
/**
 * @fileoverview MainContainerComponent - Main content area container with dynamic sizing
 * @component MainContainerComponent
 * @module components/displayComponents/MainContainerComponent
 * 
 * @description
 * A main content container that dynamically calculates dimensions based on viewport size
 * and fractional props. Provides margin and padding controls, tracks window resizing,
 * and supports custom render functions for complete layout control. Used as the primary
 * content wrapper in meeting layouts.
 * 
 * Features:
 * - Dynamic width/height based on viewport and fractions
 * - Configurable margins (left, right, top, bottom)
 * - Configurable padding
 * - Real-time window resize tracking
 * - Custom render functions for content and container
 * - Slot-based content projection
 * - Automatic dimension recalculation
 * 
 * Dimension Calculation:
 * - **Width**: (window.innerWidth * containerWidthFraction) - marginLeft - marginRight
 * - **Height**: (window.innerHeight * containerHeightFraction) - marginTop - marginBottom - padding
 * 
 * @example Basic Main Container
 * // <MainContainerComponent
 *   // backgroundColor="#000000"
 * >
 *   <VideoGrid />
 *   <ControlButtons />
 * // </MainContainerComponent>
 * 
 * @example With Custom Margins
 * // <MainContainerComponent
 *   // backgroundColor="transparent"
 *   // :containerWidthFraction="0.95"
 *   // :containerHeightFraction="0.95"
 *   // :marginLeft="20"
 *   // :marginRight="20"
 *   // :marginTop="10"
 *   // :marginBottom="10"
 *   // :padding="15"
 * >
 *   <MainContent />
 * // </MainContainerComponent>
 * 
 * @example Full Viewport
 * // <MainContainerComponent
 *   // :containerWidthFraction="1"
 *   // :containerHeightFraction="1"
 *   // :marginLeft="0"
 *   // :marginRight="0"
 *   // :marginTop="0"
 *   // :marginBottom="0"
 *   // :padding="0"
 * >
 *   <ScreenShare />
 * // </MainContainerComponent>
 * 
 * @example Custom Content Renderer
 * // <MainContainerComponent
 *   // backgroundColor="#1a1a1a"
 *   // :renderContent="({ defaultContent, dimensions }) =>
 *     h('div', {
 *       class: 'custom-content',
 *       style: {
 *         width: `${dimensions.width}px`,
 *         height: `${dimensions.height}px`,
 *         display: 'grid',
 *         gridTemplateColumns: '1fr 1fr'
 *       }
 *     }, defaultContent)
 *   "
 * >
 *   <LeftPanel />
 *   <RightPanel />
 * // </MainContainerComponent>
 * 
 * @remarks
 * The component automatically recalculates dimensions on window resize and cleans up
 * event listeners on unmount. Dimensions are available to render functions for
 * advanced layout control. Padding is subtracted from height calculations only.
 * 
 * Workflow:
 * 1. Component mounts → Attaches resize listener, calculates initial dimensions
 * 2. Dimensions calculated → width and height computed from viewport and fractions
 * 3. Window resized → Recalculates dimensions automatically
 * 4. Render functions receive dimension context
 * 5. Component unmounts → Cleans up resize listener
 * 
 * @see {@link MainAspectComponent} - Responsive container with screen size tracking
 * @see {@link MainGridComponent} - Grid layout for main content
 */
-->
<template>
  <RenderVNode :node="containerNode" />
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  defineComponent,
  h,
  isVNode,
  useSlots,
  type CSSProperties,
  type HTMLAttributes,
  type PropType,
  type VNode,
  type VNodeChild,
} from 'vue';

/**
 * Options passed to renderContent function
 * @interface RenderContentOptions
 * @property {VNode[]} defaultContent - Array of default slot content VNodes
 * @property {{ width: number; height: number }} dimensions - Current container dimensions
 */
interface RenderContentOptions {
  defaultContent: VNode[];
  dimensions: { width: number; height: number };
}

/**
 * Options passed to renderContainer function
 * @interface RenderContainerOptions
 * @property {VNode} defaultContainer - The default container VNode with content
 * @property {{ width: number; height: number }} dimensions - Current container dimensions
 */
interface RenderContainerOptions {
  defaultContainer: VNode;
  dimensions: { width: number; height: number };
}

/**
 * Props for the MainContainerComponent
 * @interface MainContainerComponentProps
 * 
 * @property {string} [backgroundColor='transparent'] - Background color for the container
 * @property {number} [containerWidthFraction=1] - Fraction of viewport width (0-1)
 * @property {number} [containerHeightFraction=1] - Fraction of viewport height (0-1)
 * @property {number} [marginLeft=0] - Left margin in pixels
 * @property {number} [marginRight=0] - Right margin in pixels
 * @property {number} [marginTop=0] - Top margin in pixels
 * @property {number} [marginBottom=0] - Bottom margin in pixels
 * @property {number} [padding=0] - Internal padding in pixels (affects height only)
 * @property {HTMLAttributes} [containerProps] - Additional HTML attributes for container
 * @property {(options: RenderContentOptions) => VNodeChild} [renderContent] - Custom render function for content
 * @property {(options: RenderContainerOptions) => VNodeChild} [renderContainer] - Custom render function for container
 * 
 * @default backgroundColor - 'transparent'
 * @default containerWidthFraction - 1
 * @default containerHeightFraction - 1
 * @default marginLeft - 0
 * @default marginRight - 0
 * @default marginTop - 0
 * @default marginBottom - 0
 * @default padding - 0
 * 
 * @example
 * ```typescript
 * // <MainContainerComponent
 *   // backgroundColor="#000000"
 *   // :containerWidthFraction="0.9"
 *   // :containerHeightFraction="0.9"
 *   // :marginLeft="10"
 *   // :marginRight="10"
 *   // :marginTop="5"
 *   // :marginBottom="5"
 *   // :padding="10"
 * >
 *   <slot />
 * // </MainContainerComponent>
 * ```
 */
export interface MainContainerComponentProps {
  backgroundColor?: string;
  containerWidthFraction?: number;
  containerHeightFraction?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  padding?: number;
  containerProps?: HTMLAttributes;
  renderContent?: (options: RenderContentOptions) => VNodeChild;
  renderContainer?: (options: RenderContainerOptions) => VNodeChild;
}

const props = withDefaults(defineProps<MainContainerComponentProps>(), {
  backgroundColor: 'transparent',
  containerWidthFraction: 1,
  containerHeightFraction: 1,
  marginLeft: 0,
  marginRight: 0,
  marginTop: 0,
  marginBottom: 0,
  padding: 0,
  containerProps: undefined,
  renderContent: undefined,
  renderContainer: undefined,
});

const slots = useSlots();

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

const getWindowSize = () => {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }
  return { width: window.innerWidth, height: window.innerHeight };
};

const computeDimensions = (size: { width: number; height: number }) => {
  const { width, height } = size;
  const computedHeight = Math.floor(props.containerHeightFraction * height);
  const computedWidth = Math.floor(props.containerWidthFraction * width);

  return {
    height: computedHeight,
    width: computedWidth,
    maxHeight: computedHeight,
    maxWidth: computedWidth,
  };
};

const dimensions = ref(computeDimensions(getWindowSize()));

const updateDimensions = () => {
  dimensions.value = computeDimensions(getWindowSize());
};

onMounted(() => {
  updateDimensions();
  window.addEventListener('resize', updateDimensions);
  window.addEventListener('orientationchange', updateDimensions);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateDimensions);
  window.removeEventListener('orientationchange', updateDimensions);
});

// Container props merging
const containerRestAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = props.containerProps || {};
  return rest;
});

const containerClassNames = computed(() =>
  joinClassNames('mediasfu-main-container', props.containerProps?.class as string | undefined)
);

const containerStyle = computed(() => {
  const baseStyle: CSSProperties = {
    backgroundColor: props.backgroundColor,
    marginLeft: `${props.marginLeft}px`,
    marginRight: `${props.marginRight}px`,
    marginTop: `${props.marginTop}px`,
    marginBottom: `${props.marginBottom}px`,
    padding: `${props.padding}px`,
    overflow: 'hidden',
    height: `${dimensions.value.height}px`,
    width: `${dimensions.value.width}px`,
    maxHeight: `${dimensions.value.maxHeight}px`,
    maxWidth: `${dimensions.value.maxWidth}px`,
  };

  return {
    ...baseStyle,
    ...(typeof props.containerProps?.style === 'object' ? props.containerProps.style : {}),
  } as CSSProperties;
});

// Default content (slot)
const defaultContent = computed(() => (slots.default ? slots.default() : []));

// Content node (with renderContent hook)
const contentNode = computed(() => {
  if (props.renderContent) {
    const custom = props.renderContent({
      defaultContent: defaultContent.value,
      dimensions: dimensions.value,
    });
    if (custom) {
      if (isVNode(custom)) return [custom];
      if (Array.isArray(custom)) return custom;
      return [h(RenderVNode, { node: custom })];
    }
  }
  return defaultContent.value;
});

// Default container
const defaultContainer = computed(() =>
  h(
    'div',
    {
      class: containerClassNames.value,
      style: containerStyle.value,
      ...containerRestAttrs.value,
    },
    contentNode.value
  )
);

// Container node (with renderContainer hook)
const containerNode = computed(() => {
  if (props.renderContainer) {
    const custom = props.renderContainer({
      defaultContainer: defaultContainer.value,
      dimensions: dimensions.value,
    });
    if (custom) {
      if (isVNode(custom)) return custom;
      return h(RenderVNode, { node: custom });
    }
  }
  return defaultContainer.value;
});

</script>
