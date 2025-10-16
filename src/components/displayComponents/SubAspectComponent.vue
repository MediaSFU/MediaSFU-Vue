<!--
/**
 * @fileoverview SubAspectComponent - Secondary control area container
 * @component SubAspectComponent
 * @module components/displayComponents/SubAspectComponent
 * 
 * @description
 * A container component for secondary control areas (typically bottom control bars).
 * Automatically adjusts height based on showControls prop and provides responsive
 * width calculations. Used for control buttons, toolbars, and other secondary UI
 * elements that appear/disappear based on user interaction.
 * 
 * Features:
 * - Conditional visibility based on showControls
 * - Default height of 40px when visible, 0px when hidden
 * - Responsive width based on viewport fraction
 * - Custom render functions for complete control
 * - Slot-based content projection
 * - Real-time window resize handling
 * 
 * Typical Use Case:
 * - Bottom control bar in video conferencing
 * - Collapsible toolbar with mute/video/share buttons
 * - Secondary navigation or settings panel
 * 
 * @example Basic Control Bar
 * // <SubAspectComponent
 *   // backgroundColor="#1a1a1a"
 *   // :showControls="controlsVisible"
 * >
 *   <ControlButtons />
 * // </SubAspectComponent>
 * 
 * @example Custom Height (via defaultFractionSub)
 * // <SubAspectComponent
 *   // backgroundColor="transparent"
 *   // :showControls="true"
 *   // :defaultFractionSub="0.08"
 * >
 *   <Toolbar />
 * // </SubAspectComponent>
 * 
 * @example With Custom Width Fraction
 * // <SubAspectComponent
 *   // backgroundColor="#000000"
 *   // :showControls="showToolbar"
 *   // :containerWidthFraction="0.95"
 *   // :containerHeightFraction="1"
 * >
 *   <BottomPanel />
 * // </SubAspectComponent>
 * 
 * @example Hidden Controls
 * // <SubAspectComponent
 *   // backgroundColor="#000000"
 *   // :showControls="false"
 * >
 *   <ControlButtons />
 * // </SubAspectComponent>
 * 
 * @example Custom Container Renderer
 * // <SubAspectComponent
 *   // backgroundColor="#1a1a1a"
 *   // :showControls="true"
 *   // :renderContainer="({ defaultContainer, styles, showControls }) =>
 *     h('div', {
 *       class: 'custom-control-bar',
 *       style: {
 *         ...styles,
 *         borderTop: showControls ? '1px solid #333' : 'none'
 *       }
 *     }, [defaultContainer])
 *   "
 * >
 *   <Controls />
 * // </SubAspectComponent>
 * 
 * @remarks
 * The component automatically sets height to 0px when showControls=false, effectively
 * hiding the control area while maintaining the component in the DOM. The defaultFractionSub
 * prop controls the height fraction when visible (default 0.0 = 40px fixed height).
 * 
 * Workflow:
 * 1. Component mounts → Calculates initial dimensions
 * 2. showControls=true → Height set to 40px (or calculated from fraction)
 * 3. User hides controls → showControls=false → Height becomes 0px
 * 4. Window resized → Recalculates width based on containerWidthFraction
 * 5. Component unmounts → Cleans up resize listeners
 * 
 * @see {@link MainAspectComponent} - Main content area container
 * @see {@link ControlButtonsComponent} - Control buttons often used in this component
 */
-->
<template>
  <component :is="containerNode" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed, h, useSlots, type CSSProperties, type VNodeChild, type HTMLAttributes } from 'vue';

const joinClassNames = (...classes: (string | undefined | null)[]): string | undefined => {
  const filtered = classes.filter(Boolean).join(' ').trim();
  return filtered.length > 0 ? filtered : undefined;
};

/**
 * Props for the SubAspectComponent
 * @interface SubAspectComponentProps
 * 
 * @property {string} backgroundColor - Background color for the container
 * @property {boolean} [showControls=true] - Whether controls are visible (affects height)
 * @property {number} [containerWidthFraction] - Fraction of viewport width (0-1)
 * @property {number} [containerHeightFraction] - Fraction of viewport height (0-1)
 * @property {number} [defaultFractionSub=0.0] - Height fraction when controls visible (0 = 40px fixed)
 * @property {HTMLAttributes} [containerProps] - Additional HTML attributes for container
 * @property {(options: { defaultContainer: VNodeChild; styles: CSSProperties; showControls: boolean }) => VNodeChild} [renderContainer] - Custom render function for container
 * @property {(options: { defaultContent: VNodeChild; showControls: boolean }) => VNodeChild} [renderContent] - Custom render function for content
 * 
 * @default showControls - true
 * @default defaultFractionSub - 0.0
 * 
 * @example
 * ```typescript
 * // <SubAspectComponent
 *   // backgroundColor="#1a1a1a"
 *   // :showControls="true"
 *   // :containerWidthFraction="1"
 *   // :defaultFractionSub="0.05"
 * >
 *   <slot />
 * // </SubAspectComponent>
 * ```
 */
export interface SubAspectComponentProps {
  backgroundColor: string;
  showControls?: boolean;
  containerWidthFraction?: number;
  containerHeightFraction?: number;
  defaultFractionSub?: number;
  
  // UI override props
  containerProps?: HTMLAttributes;
  renderContainer?: (options: {
    defaultContainer: VNodeChild;
    styles: CSSProperties;
    showControls: boolean;
  }) => VNodeChild;
  renderContent?: (options: {
    defaultContent: VNodeChild;
    showControls: boolean;
  }) => VNodeChild;
}

const props = withDefaults(defineProps<SubAspectComponentProps>(), {
  showControls: true,
  defaultFractionSub: 0.0,
  containerWidthFraction: undefined,
  containerHeightFraction: undefined,
  containerProps: undefined,
  renderContainer: undefined,
  renderContent: undefined,
});

const slots = useSlots();

const subAspectFraction = !props.showControls ? 0 : props.defaultFractionSub;

const aspectStyles = ref<CSSProperties>({
  height: props.showControls ? '40px' : '0px',
  width: props.containerWidthFraction
    ? `${props.containerWidthFraction * window.innerWidth}px`
    : `${window.innerWidth}px`,
});

const updateAspectStyles = () => {
  const windowWidth = window.innerWidth;

  aspectStyles.value = {
    height: props.showControls ? '40px' : '0px',
    width: props.containerWidthFraction
      ? `${props.containerWidthFraction * windowWidth}px`
      : `${windowWidth}px`,
  };
};

// Watch for prop changes
watch(
  [
    () => props.showControls,
    () => props.containerHeightFraction,
    () => props.containerWidthFraction,
    () => subAspectFraction,
  ],
  () => {
    updateAspectStyles();
  }
);

onMounted(() => {
  updateAspectStyles();
  window.addEventListener('resize', updateAspectStyles);
  window.addEventListener('orientationchange', updateAspectStyles);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateAspectStyles);
  window.removeEventListener('orientationchange', updateAspectStyles);
});

// Container node with UI overrides
const containerNode = computed(() => {
  const {
    class: containerClassName,
    style: containerStyleOverrides,
    ...restContainerProps
  } = props.containerProps ?? {};

  const containerClassNames = joinClassNames(
    'mediasfu-sub-aspect',
    props.showControls ? 'mediasfu-sub-aspect--visible' : 'mediasfu-sub-aspect--hidden',
    containerClassName as string
  );

  const combinedStyles: CSSProperties = {
    position: 'absolute',
    bottom: 0,
    margin: 0,
    backgroundColor: props.backgroundColor,
    display: props.showControls ? 'flex' : 'none',
    ...(aspectStyles.value as CSSProperties),
    ...(containerStyleOverrides && typeof containerStyleOverrides === 'object' ? containerStyleOverrides : {})
  } as CSSProperties;

  // ✅ Get actual slot content
  const slotContent = slots.default ? slots.default() : [];

  const contentNode = props.renderContent
    ? props.renderContent({
        defaultContent: slotContent,
        showControls: props.showControls
      })
    : slotContent;

  const defaultContainer = h('div', {
    class: containerClassNames,
    style: combinedStyles,
    ...restContainerProps
  }, Array.isArray(contentNode) ? contentNode : [contentNode]);

  return props.renderContainer
    ? props.renderContainer({
        defaultContainer,
        styles: combinedStyles,
        showControls: props.showControls
      })
    : defaultContainer;
});

</script>
