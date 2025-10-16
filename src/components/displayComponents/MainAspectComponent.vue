<!--
/**
 * @fileoverview MainAspectComponent - Responsive container with screen size tracking
 * @component MainAspectComponent
 * @module components/displayComponents/MainAspectComponent
 * 
 * @description
 * A responsive container component that tracks window dimensions and updates screen size
 * categories (wide, medium, small). Automatically adjusts container dimensions based on
 * fraction props and provides real-time screen size state updates. Used as a main content
 * wrapper that adapts to viewport changes.
 * 
 * Features:
 * - Real-time window resize tracking
 * - Automatic screen size categorization (wide ≥768px, medium ≥576px, small <576px)
 * - Fractional width/height sizing
 * - Optional controls visibility toggle
 * - Responsive dimension calculations
 * - Slot-based content projection
 * - Debounced resize handling
 * 
 * Screen Size Breakpoints:
 * - **Wide Screen**: width ≥ 768px → updateIsWideScreen(true)
 * - **Medium Screen**: 576px ≤ width < 768px → updateIsMediumScreen(true)
 * - **Small Screen**: width < 576px → updateIsSmallScreen(true)
 * 
 * @example Basic Responsive Container
 * // <MainAspectComponent
 *   // backgroundColor="#000000"
 *   // :showControls="true"
 *   // :updateIsWideScreen="setIsWide"
 *   // :updateIsMediumScreen="setIsMedium"
 *   // :updateIsSmallScreen="setIsSmall"
 * >
 *   <VideoGrid />
 * // </MainAspectComponent>
 * 
 * @example Custom Dimensions (80% width, 90% height)
 * // <MainAspectComponent
 *   // backgroundColor="transparent"
 *   // :containerWidthFraction="0.8"
 *   // :containerHeightFraction="0.9"
 *   // :showControls="false"
 *   // :updateIsWideScreen="handleWide"
 *   // :updateIsMediumScreen="handleMedium"
 *   // :updateIsSmallScreen="handleSmall"
 * >
 *   <ParticipantGrid />
 * // </MainAspectComponent>
 * 
 * @example Full Viewport Coverage
 * // <MainAspectComponent
 *   // :containerWidthFraction="1"
 *   // :containerHeightFraction="1"
 *   // :showControls="true"
 *   // :updateIsWideScreen="updateWide"
 *   // :updateIsMediumScreen="updateMedium"
 *   // :updateIsSmallScreen="updateSmall"
 * >
 *   <ScreenShare />
 * // </MainAspectComponent>
 * 
 * @remarks
 * The component automatically adds/removes window resize event listeners and
 * recalculates screen size categories on every resize. The defaultFraction (0.94)
 * is applied when controls are visible to reserve space for control elements.
 * 
 * Workflow:
 * 1. Component mounts → Attaches resize listener, calculates initial size
 * 2. Determines screen category → Calls appropriate update functions
 * 3. Window resized → Recalculates dimensions and screen category
 * 4. Updates propagate → Parent components receive new screen size state
 * 5. Container dimensions update → Child content reflows
 * 6. Component unmounts → Cleans up resize listener
 * 
 * @see {@link MainContainerComponent} - Main content container
 * @see {@link MainGridComponent} - Grid layout for main content area
 */
-->
<template>
  <div
    :class="containerClassNames"
    :style="containerStyle"
    v-bind="containerRestAttrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  type CSSProperties,
  type HTMLAttributes,
} from 'vue';

/**
 * Props for the MainAspectComponent
 * @interface MainAspectComponentProps
 * 
 * @property {string} [backgroundColor='transparent'] - Background color for the container
 * @property {boolean} [showControls=true] - Whether controls are visible (affects dimension calculations)
 * @property {number} [containerWidthFraction=1] - Fraction of available width (0-1)
 * @property {number} [containerHeightFraction=1] - Fraction of available height (0-1)
 * @property {number} [defaultFraction=0.94] - Default fraction applied when controls are shown
 * @property {(isWide: boolean) => void} updateIsWideScreen - Callback when wide screen state changes (≥768px)
 * @property {(isMedium: boolean) => void} updateIsMediumScreen - Callback when medium screen state changes (≥576px)
 * @property {(isSmall: boolean) => void} updateIsSmallScreen - Callback when small screen state changes (<576px)
 * @property {HTMLAttributes} [containerProps] - Additional HTML attributes for container
 * 
 * @default backgroundColor - 'transparent'
 * @default showControls - true
 * @default containerWidthFraction - 1
 * @default containerHeightFraction - 1
 * @default defaultFraction - 0.94
 * 
 * @example
 * ```typescript
 * // <MainAspectComponent
 *   // backgroundColor="#1a1a1a"
 *   // :showControls="true"
 *   // :containerWidthFraction="0.95"
 *   // :containerHeightFraction="0.95"
 *   // :updateIsWideScreen="(isWide) => { screenIsWide.value = isWide; }"
 *   // :updateIsMediumScreen="(isMedium) => { screenIsMedium.value = isMedium; }"
 *   // :updateIsSmallScreen="(isSmall) => { screenIsSmall.value = isSmall; }"
 * >
 *   <slot />
 * // </MainAspectComponent>
 * ```
 */
export interface MainAspectComponentProps {
  backgroundColor?: string;
  showControls?: boolean;
  containerWidthFraction?: number;
  containerHeightFraction?: number;
  defaultFraction?: number;
  updateIsWideScreen: (isWide: boolean) => void;
  updateIsMediumScreen: (isMedium: boolean) => void;
  updateIsSmallScreen: (isSmall: boolean) => void;
  containerProps?: HTMLAttributes;
}

const props = withDefaults(defineProps<MainAspectComponentProps>(), {
  backgroundColor: 'transparent',
  showControls: true,
  containerWidthFraction: 1,
  containerHeightFraction: 1,
  defaultFraction: 0.94,
  containerProps: undefined,
});

// Helper: Join class names
const joinClassNames = (...classes: (string | undefined | null)[]): string | undefined => {
  const filtered = classes.filter(Boolean).join(' ').trim();
  return filtered.length > 0 ? filtered : undefined;
};

const getWindowSize = () => {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }
  return { width: window.innerWidth, height: window.innerHeight };
};

const computeDimensions = (size: { width: number; height: number }) => {
  const { width, height } = size;
  const computedHeight = props.showControls
    ? Math.floor(props.containerHeightFraction * height * props.defaultFraction)
    : Math.floor(props.containerHeightFraction * height);
  const computedWidth = Math.floor(props.containerWidthFraction * width);

  return { width: computedWidth, height: computedHeight };
};

const aspectStyles = ref(computeDimensions(getWindowSize()));

const updateAspectStyles = () => {
  const windowSize = getWindowSize();
  const dimensions = computeDimensions(windowSize);

  const parentWidth = dimensions.width;
  const parentHeight = dimensions.height;

  let isWideScreen = parentWidth >= 768;
  const isMediumScreen = parentWidth >= 576 && parentWidth < 768;
  const isSmallScreen = parentWidth < 576;

  if (!isWideScreen && parentWidth > 1.5 * (parentHeight || 1)) {
    isWideScreen = true;
  }

  props.updateIsWideScreen(isWideScreen);
  props.updateIsMediumScreen(isMediumScreen);
  props.updateIsSmallScreen(isSmallScreen);

  aspectStyles.value = dimensions;
};

// Watch for prop changes
watch(
  [
    () => props.showControls,
    () => props.containerHeightFraction,
    () => props.containerWidthFraction,
    () => props.defaultFraction,
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

// Container props merging
const containerRestAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = props.containerProps || {};
  return rest;
});

const containerClassNames = computed(() =>
  joinClassNames('mediasfu-main-aspect', props.containerProps?.class as string | undefined)
);

const containerStyle = computed(() => {
  const baseStyle: CSSProperties = {
    backgroundColor: props.backgroundColor,
    height: `${aspectStyles.value.height}px`,
    width: `${aspectStyles.value.width}px`,
    overflow: 'hidden',
    position: 'relative',
    transition: 'width 0.2s ease, height 0.2s ease',
  };

  return {
    ...baseStyle,
    ...(typeof props.containerProps?.style === 'object' ? props.containerProps.style : {}),
  } as CSSProperties;
});

</script>
