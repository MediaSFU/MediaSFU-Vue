<!--
/**
 * @fileoverview MainScreenComponent - Responsive main screen container with dynamic sizing
 * @component MainScreenComponent
 * @module components/displayComponents/MainScreenComponent
 * 
 * @description
 * The primary container for the main screen area of the MediaSFU application. Manages
 * responsive layout switching between wide-screen (side-by-side) and stacked (vertical)
 * modes. Calculates and broadcasts component sizes (mainHeight/Width, otherHeight/Width)
 * to child components. Supports custom render functions for complete UI override.
 * 
 * Features:
 * - Automatic wide-screen detection (≥768px or width > 1.5 × height)
 * - Side-by-side layout for wide screens (horizontal split by mainSize%)
 * - Stacked layout for narrow screens (vertical split by mainSize%)
 * - Real-time viewport tracking with resize/orientation handlers
 * - Component size broadcasting to parent via updateComponentSizes
 * - Control bar height accommodation (defaultFraction = 0.94)
 * - Complete customization via renderChild/renderChildren/renderContainer
 * - Optimized resize handling with requestAnimationFrame
 * 
 * Layout Modes:
 * - **Wide Screen (horizontal)**: Main area left (mainSize%), Other area right (100-mainSize%)
 * - **Narrow Screen (vertical)**: Main area top (mainSize%), Other area bottom (100-mainSize%)
 * - **No Stack Mode**: Full width/height for all children (for single participant view)
 * 
 * @example Basic Two-Panel Layout
 * // <MainScreenComponent
 *   // :mainSize="70"
 *   // :doStack="true"
 *   // :showControls="true"
 *   // :componentSizes="componentSizes"
 *   // :updateComponentSizes="(sizes) => setComponentSizes(sizes)"
 * >
 *   <template #default="{ mainWidth, mainHeight, otherWidth, otherHeight }">
 *     <div :style="{ width: `${mainWidth}px`, height: `${mainHeight}px` }">
 *       Main Content (70%)
 *     </div>
 *     <div :style="{ width: `${otherWidth}px`, height: `${otherHeight}px` }">
 *       Secondary Content (30%)
 *     </div>
 *   </template>
 * // </MainScreenComponent>
 * 
 * @example Single Panel (No Stack)
 * // <MainScreenComponent
 *   // :mainSize="100"
 *   // :doStack="false"
 *   // :showControls="true"
 *   // :componentSizes="componentSizes"
 *   // :updateComponentSizes="(sizes) => setComponentSizes(sizes)"
 * >
 *   <template #default="{ mainWidth, mainHeight }">
 *     <VideoCard :style="{ width: `${mainWidth}px`, height: `${mainHeight}px` }" />
 *   </template>
 * // </MainScreenComponent>
 * 
 * @example Custom Control Bar Height
 * // <MainScreenComponent
 *   // :mainSize="60"
 *   // :doStack="true"
 *   // :showControls="true"
 *   // :defaultFraction="0.9"
 *   // :containerHeightFraction="0.95"
 *   // :componentSizes="componentSizes"
 *   // :updateComponentSizes="(sizes) => setComponentSizes(sizes)"
 * >
 *   // Content placeholder (90% of 95% viewport = 85.5% total height)
 * // </MainScreenComponent>
 * 
 * @example With Custom Container Renderer
 * // <MainScreenComponent
 *   // :mainSize="50"
 *   // :doStack="true"
 *   // :showControls="true"
 *   // :componentSizes="componentSizes"
 *   // :updateComponentSizes="(sizes) => setComponentSizes(sizes)"
 *   // :renderContainer="({ defaultContainer, isWideScreen, dimensions }) => {
 *     return h('div', {
 *       class: 'my-custom-container',
 *       style: { border: '2px solid blue', ...dimensions }
 *     }, [defaultContainer])
 *   }"
 * >
 *   // Content placeholder
 * // </MainScreenComponent>
 * 
 * @remarks
 * This component is the core layout manager for the main screen. It handles all viewport
 * calculations and broadcasts dimensions to children via scoped slots. The componentSizes
 * object is updated reactively whenever viewport or mainSize changes. Use doStack=true
 * for split-screen layouts and doStack=false for full-screen single views.
 * 
 * Workflow:
 * 1. Component mounts and tracks window.innerWidth/innerHeight
 * 2. Calculates isWideScreen (≥768px or width > 1.5 × height)
 * 3. Computes parentWidth/Height using containerWidth/HeightFraction
 * 4. If showControls=true, applies defaultFraction to height (default 94%)
 * 5. Computes main/other dimensions based on doStack and mainSize
 * 6. Emits componentSizes to parent via updateComponentSizes
 * 7. Renders container with flex layout (row/column based on isWideScreen)
 * 8. Passes dimensions to children via scoped slots
 * 9. Re-calculates on window resize/orientation change
 * 
 * Wide Screen Detection:
 * - Primary: width ≥ 768px
 * - Secondary: width > 1.5 × height (landscape tablets)
 * 
 * @see {@link ComponentSizes} - Size data structure passed to parent
 * @see {@link MainAspectComponent} - Parent container with aspect ratio management
 */
-->
<template>
  <component :is="containerNode" />
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted, ref, h, useSlots, type VNodeChild, type HTMLAttributes } from 'vue';
import type { ComponentSizes } from '../../../../SharedTypes';

const joinClassNames = (...classes: (string | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ')
}

const slots = useSlots();

/**
 * Props for the MainScreenComponent
 * @interface MainScreenComponentProps
 * 
 * @property {number} mainSize - Main area size percentage (0-100, e.g., 70 = 70%)
 * @property {boolean} doStack - Enable split-screen layout (true) or full-screen (false)
 * @property {number} [containerWidthFraction=1] - Viewport width multiplier (0-1)
 * @property {number} [containerHeightFraction=1] - Viewport height multiplier (0-1)
 * @property {function} updateComponentSizes - Callback to receive computed sizes
 * @property {number} [defaultFraction=0.94] - Height fraction when showControls=true (accounts for control bar)
 * @property {boolean} showControls - Whether control bar is visible (affects height calculation)
 * @property {ComponentSizes} componentSizes - Current component dimensions
 * @property {HTMLAttributes} [containerProps] - Additional props for container element
 * @property {function} [renderChild] - Custom renderer for individual child elements
 * @property {function} [renderChildren] - Custom renderer for all children
 * @property {function} [renderContainer] - Custom renderer for main container
 * 
 * @example
 * ```typescript
 * // <MainScreenComponent
 *   // :mainSize="70"
 *   // :doStack="true"
 *   // :showControls="true"
 *   // :defaultFraction="0.94"
 *   // :componentSizes="{ mainHeight: 500, otherHeight: 500, mainWidth: 700, otherWidth: 300 }"
 *   // :updateComponentSizes="(sizes) => console.log('New sizes:', sizes)"
 * // />
 * ```
 */
export interface MainScreenComponentProps {
  mainSize: number;
  doStack: boolean;
  containerWidthFraction?: number;
  containerHeightFraction?: number;
  updateComponentSizes: (sizes: ComponentSizes) => void;
  defaultFraction?: number;
  showControls: boolean;
  componentSizes: ComponentSizes;
  
  // UI override props
  containerProps?: HTMLAttributes;
  renderChild?: (options: {
    child: VNodeChild;
    index: number;
    mainSize: number;
    isWideScreen: boolean;
    doStack: boolean;
    computedStyle: Record<string, unknown>;
    componentSizes: ComponentSizes;
  }) => VNodeChild;
  renderChildren?: (options: {
    defaultChildren: VNodeChild;
    isWideScreen: boolean;
    doStack: boolean;
    componentSizes: ComponentSizes;
  }) => VNodeChild;
  renderContainer?: (options: {
    defaultContainer: VNodeChild;
    isWideScreen: boolean;
    dimensions: { width: number; height: number };
  }) => VNodeChild;
}

const props = withDefaults(defineProps<MainScreenComponentProps>(), {
  containerWidthFraction: 1,
  containerHeightFraction: 1,
  defaultFraction: 0.94,
  containerProps: undefined,
  renderChild: undefined,
  renderChildren: undefined,
  renderContainer: undefined,
});

const viewportWidth = ref<number>(window.innerWidth);
const viewportHeight = ref<number>(window.innerHeight);

let resizeFrameId: number | null = null;

const updateViewportDimensions = () => {
  if (resizeFrameId !== null) {
    cancelAnimationFrame(resizeFrameId);
  }
  resizeFrameId = requestAnimationFrame(() => {
    resizeFrameId = null;
    viewportWidth.value = window.innerWidth;
    viewportHeight.value = window.innerHeight;
  });
};

const parentWidth = computed(
  () => viewportWidth.value * props.containerWidthFraction!
);

const parentHeight = computed(() =>
  props.showControls
    ? viewportHeight.value * props.containerHeightFraction! * props.defaultFraction!
    : viewportHeight.value * props.containerHeightFraction!
);

const isWideScreen = computed(() => {
  const width = parentWidth.value;
  const height = parentHeight.value;
  let wide = width >= 768;

  if (!wide && width > 1.5 * height) {
    wide = true;
  }

  return wide;
});

const computeDimensions = () => {
  if (props.doStack) {
    return isWideScreen.value
      ? {
          mainHeight: parentHeight.value,
          otherHeight: parentHeight.value,
          mainWidth: Math.floor((props.mainSize / 100) * parentWidth.value),
          otherWidth: Math.floor(((100 - props.mainSize) / 100) * parentWidth.value),
        }
      : {
          mainHeight: Math.floor((props.mainSize / 100) * parentHeight.value),
          otherHeight: Math.floor(((100 - props.mainSize) / 100) * parentHeight.value),
          mainWidth: parentWidth.value,
          otherWidth: parentWidth.value,
        };
  } else {
    return {
      mainHeight: parentHeight.value,
      otherHeight: parentHeight.value,
      mainWidth: parentWidth.value,
      otherWidth: parentWidth.value,
    };
  }
};

const lastEmittedSizes = ref<ComponentSizes | null>(null);

const emitComponentSizes = (sizes: ComponentSizes) => {
  const last = lastEmittedSizes.value;
  if (
    !last ||
    last.mainHeight !== sizes.mainHeight ||
    last.otherHeight !== sizes.otherHeight ||
    last.mainWidth !== sizes.mainWidth ||
    last.otherWidth !== sizes.otherWidth
  ) {
    lastEmittedSizes.value = { ...sizes };
    props.updateComponentSizes({ ...sizes });
  }
};

watch(
  [() => parentWidth.value, () => parentHeight.value, () => props.mainSize, () => props.doStack],
  () => {
    const dimensions = computeDimensions();
    emitComponentSizes(dimensions);
  },
  { immediate: true }
);

onMounted(() => {
  window.addEventListener('resize', updateViewportDimensions, { passive: true });
  window.addEventListener('orientationchange', updateViewportDimensions);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateViewportDimensions);
  window.removeEventListener('orientationchange', updateViewportDimensions);
  if (resizeFrameId !== null) {
    cancelAnimationFrame(resizeFrameId);
  }
});

// Container node with UI overrides
const containerNode = computed(() => {
  const {
    class: containerClassName,
    style: containerStyleOverrides,
    ...restContainerProps
  } = props.containerProps ?? {};

  const containerClassNames = joinClassNames(
    'mediasfu-main-screen',
    containerClassName as string
  );

  const containerStyle = {
    display: 'flex',
    flex: 1,
    flexDirection: isWideScreen.value ? 'row' : 'column',
    width: `${parentWidth.value}px`,
    height: `${parentHeight.value}px`,
    padding: 0,
    margin: 0,
    position: 'relative',
    ...(containerStyleOverrides && typeof containerStyleOverrides === 'object' ? containerStyleOverrides : {})
  };

  const dimensions = {
    width: parentWidth.value,
    height: parentHeight.value
  };

  // ✅ Get actual slot content with scoped props
  const slotProps = {
    mainSize: props.mainSize,
    isWideScreen: isWideScreen.value,
    mainHeight: props.componentSizes.mainHeight,
    otherHeight: props.componentSizes.otherHeight,
    mainWidth: props.componentSizes.mainWidth,
    otherWidth: props.componentSizes.otherWidth,
  };

  const slotContent = slots.default ? slots.default(slotProps) : [];

  const childrenNode = props.renderChildren
    ? props.renderChildren({
        defaultChildren: slotContent,
        isWideScreen: isWideScreen.value,
        doStack: props.doStack,
        componentSizes: props.componentSizes
      })
    : slotContent;

  const defaultContainer = h('div', {
    class: containerClassNames,
    style: containerStyle,
    ...restContainerProps
  }, Array.isArray(childrenNode) ? childrenNode : [childrenNode]);

  return props.renderContainer
    ? props.renderContainer({
        defaultContainer,
        isWideScreen: isWideScreen.value,
        dimensions
      })
    : defaultContainer;
});

</script>
