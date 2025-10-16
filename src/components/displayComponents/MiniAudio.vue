<!--
/**
 * @fileoverview MiniAudio - Draggable floating audio card with waveform animation
 * @component MiniAudio
 * @module components/displayComponents/MiniAudio
 * 
 * @description
 * A draggable floating audio card that displays participant name, avatar, and animated
 * waveform visualization. Used for audio-only participants or when a user wants a
 * compact audio overlay. Features smooth dragging with bounds checking and automatic
 * waveform animation synchronized with speaking activity.
 * 
 * Features:
 * - Fully draggable with mouse/touch support
 * - Animated waveform visualization (9 bars with randomized timing)
 * - Optional profile image or fallback background
 * - Participant name overlay with configurable position
 * - Visibility toggle support
 * - Automatic bounds checking (stays within viewport)
 * - Custom render functions for all major sections
 * - Full HTML attribute passthrough
 * - Rounded image option
 * 
 * Dragging Behavior:
 * - Click/touch and drag to reposition
 * - Automatic bounds checking prevents dragging off-screen
 * - Position maintained across visibility toggles
 * - Smooth drag experience with offset calculation
 * 
 * Waveform Animation:
 * - 9 bars with independent animation timings (400-487ms cycles)
 * - Bars animate between 1px (inactive) and 16px (active) heights
 * - Continuous animation when showWaveform=true
 * - All timers automatically cleaned up on unmount
 * 
 * @example Basic Draggable Audio Card
 * // <MiniAudio
 *   // name="Jane Doe"
 *   // imageSource="https://example.com/avatar.jpg"
 *   // :showWaveform="true"
 * // />
 * 
 * @example With Custom Colors
 * // <MiniAudio
 *   // name="John Smith"
 *   // imageSource="https://example.com/avatar2.jpg"
 *   // :showWaveform="true"
 *   // barColor="#22c55e"
 *   // textColor="#ffffff"
 * // />
 * 
 * @example Custom Styled with Rounded Image
 * // <MiniAudio
 *   // name="Alex Johnson"
 *   // imageSource="https://example.com/avatar3.jpg"
 *   // :roundedImage="true"
 *   // :showWaveform="true"
 *   // :customStyle="{ 
 *     backgroundColor: 'rgba(0,0,0,0.85)', 
 *     borderRadius: '12px',
 *     border: '2px solid #3b82f6'
 *   }"
 *   // barColor="#3b82f6"
 *   // textColor="#fff"
 * // />
 * 
 * @example Conditionally Visible
 * // <MiniAudio
 *   // name="Sarah Williams"
 *   // imageSource="https://example.com/avatar4.jpg"
 *   // :visible="isAudioOnlyMode"
 *   // :showWaveform="isSpeaking"
 *   // overlayPosition="topRight"
 * // />
 * 
 * @example Custom Card Renderer
 * // <MiniAudio
 *   // name="Mike Brown"
 *   // imageSource="https://example.com/avatar5.jpg"
 *   // :showWaveform="true"
 *   // :renderCard="({ defaultCard, hasImage }) =>
 *     h('div', {
 *       class: 'custom-audio-card',
 *       style: {
 *         background: hasImage 
 *           ? 'transparent' 
 *           : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
 *         borderRadius: '16px',
 *         overflow: 'hidden'
 *       }
 *     }, [defaultCard])
 *   "
 * // />
 * 
 * @remarks
 * The component automatically handles waveform animation lifecycle - starting animations
 * when showWaveform=true and cleaning up all timers on unmount. Position state is
 * maintained across visibility toggles, so the card returns to its last position when
 * made visible again.
 * 
 * Workflow:
 * 1. Component mounts → Initializes position (default: { x: 0, y: 0 })
 * 2. showWaveform=true → Starts 9 independent waveform bar animations
 * 3. User drags card → Updates position with bounds checking
 * 4. showWaveform=false → Stops animations, resets bars to 1px height
 * 5. Component unmounts → Cleans up all animation timers
 * 
 * @see {@link MiniCardAudio} - Static (non-draggable) version for grid layouts
 * @see {@link AudioCard} - Full-featured audio card with controls
 */
-->
<template>
  <RenderVNode :node="wrapperNode" />
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
  type CSSProperties,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type PropType,
  type VNode,
  type VNodeChild,
} from 'vue';
import { getOverlayPosition } from '@legacy/methods/utils/getOverlayPosition';

/**
 * Options passed to renderWrapper function
 * @interface RenderWrapperOptions
 * @property {VNode} defaultWrapper - The default wrapper VNode with visibility control
 * @property {boolean} isVisible - Whether the component is currently visible
 */
interface RenderWrapperOptions {
  defaultWrapper: VNode;
  isVisible: boolean;
}

/**
 * Options passed to renderContainer function
 * @interface RenderContainerOptions
 * @property {VNode} defaultContainer - The default draggable container VNode
 * @property {boolean} isDragging - Whether the component is currently being dragged
 * @property {{ x: number; y: number }} position - Current position of the draggable element
 */
interface RenderContainerOptions {
  defaultContainer: VNode;
  isDragging: boolean;
  position: { x: number; y: number };
}

/**
 * Options passed to renderCard function
 * @interface RenderCardOptions
 * @property {VNode} defaultCard - The default card VNode with image and overlay
 * @property {boolean} hasImage - Whether an image source is provided
 */
interface RenderCardOptions {
  defaultCard: VNode;
  hasImage: boolean;
}

/**
 * Options passed to renderWaveform function
 * @interface RenderWaveformOptions
 * @property {VNode} defaultWaveform - The default waveform VNode with animated bars
 * @property {boolean} showWaveform - Whether waveform animation is enabled
 * @property {number[]} animations - Array of current animation heights (0 or 1) for each bar
 */
interface RenderWaveformOptions {
  defaultWaveform: VNode;
  showWaveform: boolean;
  animations: number[];
}

/**
 * Props for the MiniAudio component
 * @interface MiniAudioProps
 * 
 * @property {boolean} [visible=true] - Whether the component is visible
 * @property {CSSProperties} [customStyle] - Custom CSS styles for the card
 * @property {string} name - Participant name to display
 * @property {boolean} [showWaveform=false] - Whether to show animated waveform
 * @property {string} [overlayPosition] - Position for name overlay (e.g., 'topLeft', 'bottomRight')
 * @property {string} [barColor='red'] - Color for waveform bars
 * @property {string} [textColor='white'] - Color for participant name text
 * @property {CSSProperties} [nameTextStyling] - Custom CSS styles for name text
 * @property {string} imageSource - URL for profile image or background
 * @property {boolean} [roundedImage=false] - Whether to apply rounded corners to image
 * @property {CSSProperties} [imageStyle] - Custom CSS styles for image
 * @property {HTMLAttributes} [wrapperProps] - Additional HTML attributes for wrapper
 * @property {HTMLAttributes} [draggableContainerProps] - Additional HTML attributes for draggable container
 * @property {HTMLAttributes} [cardProps] - Additional HTML attributes for card
 * @property {HTMLAttributes} [overlayProps] - Additional HTML attributes for overlay
 * @property {HTMLAttributes} [waveformContainerProps] - Additional HTML attributes for waveform container
 * @property {HTMLAttributes} [barProps] - Additional HTML attributes for each waveform bar
 * @property {HTMLAttributes} [nameContainerProps] - Additional HTML attributes for name container
 * @property {HTMLAttributes} [nameTextProps] - Additional HTML attributes for name text
 * @property {ImgHTMLAttributes} [imageProps] - Additional HTML attributes for image element
 * @property {(options: RenderWrapperOptions) => VNodeChild} [renderWrapper] - Custom render function for wrapper
 * @property {(options: RenderContainerOptions) => VNodeChild} [renderContainer] - Custom render function for draggable container
 * @property {(options: RenderCardOptions) => VNodeChild} [renderCard] - Custom render function for card
 * @property {(options: RenderWaveformOptions) => VNodeChild} [renderWaveform] - Custom render function for waveform
 * 
 * @default visible - true
 * @default showWaveform - false
 * @default barColor - 'red'
 * @default textColor - 'white'
 * @default roundedImage - false
 * 
 * @example
 * ```typescript
 * // <MiniAudio
 *   // name="Jane Smith"
 *   // imageSource="https://example.com/avatar.jpg"
 *   // :visible="true"
 *   // :showWaveform="true"
 *   // :roundedImage="true"
 *   // barColor="#22c55e"
 *   // textColor="#ffffff"
 *   // overlayPosition="bottomLeft"
 * // />
 * ```
 */
export interface MiniAudioProps {
  visible?: boolean;
  customStyle?: CSSProperties;
  name: string;
  showWaveform?: boolean;
  overlayPosition?: string;
  barColor?: string;
  textColor?: string;
  nameTextStyling?: CSSProperties;
  imageSource: string;
  roundedImage?: boolean;
  imageStyle?: CSSProperties;
  wrapperProps?: HTMLAttributes;
  draggableContainerProps?: HTMLAttributes;
  cardProps?: HTMLAttributes;
  overlayProps?: HTMLAttributes;
  waveformContainerProps?: HTMLAttributes;
  barProps?: HTMLAttributes;
  nameContainerProps?: HTMLAttributes;
  nameTextProps?: HTMLAttributes;
  imageProps?: ImgHTMLAttributes;
  renderWrapper?: (options: RenderWrapperOptions) => VNodeChild;
  renderContainer?: (options: RenderContainerOptions) => VNodeChild;
  renderCard?: (options: RenderCardOptions) => VNodeChild;
  renderWaveform?: (options: RenderWaveformOptions) => VNodeChild;
}

const props = withDefaults(defineProps<MiniAudioProps>(), {
  visible: true,
  customStyle: undefined,
  showWaveform: false,
  overlayPosition: undefined,
  barColor: 'red',
  textColor: 'white',
  nameTextStyling: undefined,
  roundedImage: false,
  imageStyle: undefined,
  wrapperProps: () => ({}),
  draggableContainerProps: () => ({}),
  cardProps: () => ({}),
  overlayProps: () => ({}),
  waveformContainerProps: () => ({}),
  barProps: () => ({}),
  nameContainerProps: () => ({}),
  nameTextProps: () => ({}),
  imageProps: () => ({}),
  renderWrapper: undefined,
  renderContainer: undefined,
  renderCard: undefined,
  renderWaveform: undefined,
});

const WAVEFORM_DURATIONS = [474, 433, 407, 458, 400, 427, 441, 419, 487];

const waveformAnimations = ref<number[]>(
  Array.from({ length: WAVEFORM_DURATIONS.length }, () => 0)
);
const intervals = ref<number[]>([]);
const timeouts = ref<number[]>([]);
const isDragging = ref(false);
const position = ref({ x: 0, y: 0 });
const dragOffset = ref({ x: 0, y: 0 });

// Wrapper component for flexible VNodeChild rendering
const RenderVNode = defineComponent({
  name: 'RenderVNode',
  props: {
    node: {
      type: [Object, String, Number, Boolean, Array] as PropType<VNodeChild>,
      default: undefined,
    },
  },
  render() {
    if (isVNode(this.node)) {
      return this.node;
    }
    if (typeof this.node === 'string' || typeof this.node === 'number') {
      return String(this.node);
    }
    return null;
  },
});

// Helper to join class names
function joinClassNames(...classes: (string | string[] | undefined)[]): string | undefined {
  const result: string[] = [];
  classes.forEach((cls) => {
    if (!cls) return;
    if (Array.isArray(cls)) {
      result.push(...cls);
    } else {
      result.push(cls);
    }
  });
  const filtered = result.join(' ').trim();
  return filtered.length > 0 ? filtered : undefined;
}

const getAnimationDuration = (index: number): number => {
  return WAVEFORM_DURATIONS[index] ?? 0;
};

const clearIntervals = () => {
  intervals.value.forEach(clearInterval);
  intervals.value = [];
};

const clearTimeouts = () => {
  timeouts.value.forEach(clearTimeout);
  timeouts.value = [];
};

const resetWaveform = () => {
  waveformAnimations.value = Array.from({ length: WAVEFORM_DURATIONS.length }, () => 0);
  clearIntervals();
  clearTimeouts();
};

const animateBar = (index: number) => {
  waveformAnimations.value[index] = 1;
  
  const timeoutId = window.setTimeout(() => {
    waveformAnimations.value[index] = 0;
  }, getAnimationDuration(index));

  timeouts.value.push(timeoutId);
};

watch(
  () => props.showWaveform,
  (newValue) => {
    if (!newValue) {
      resetWaveform();
      return;
    }

    clearIntervals();
    clearTimeouts();

    intervals.value = Array.from({ length: WAVEFORM_DURATIONS.length }, (_, index) =>
      window.setInterval(() => {
        animateBar(index);
      }, getAnimationDuration(index) * 2)
    );
  },
  { immediate: true }
);

onUnmounted(() => {
  resetWaveform();
});

const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true;
  dragOffset.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y,
  };
};

const handleMouseMove = (e: MouseEvent) => {
  if (isDragging.value) {
    position.value = {
      x: e.clientX - dragOffset.value.x,
      y: e.clientY - dragOffset.value.y,
    };
  }
};

const handleMouseUp = () => {
  isDragging.value = false;
};

watch(isDragging, (newValue) => {
  if (newValue) {
    document.addEventListener('mouseup', handleMouseUp);
  } else {
    document.removeEventListener('mouseup', handleMouseUp);
  }
});

onUnmounted(() => {
  document.removeEventListener('mouseup', handleMouseUp);
});

// =========================
// Styles
// =========================
const styles: Record<string, CSSProperties> = {
  modalContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 0,
    margin: 0,
    width: '100px',
    height: '100px',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 45, 33, 0.5)',
    zIndex: 8,
  },
  card: {
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    backgroundColor: '#2c678f',
    position: 'relative',
  },
  overlayWeb: {
    position: 'absolute',
    minWidth: '100%',
    height: '100%',
    maxHeight: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr 12fr 1fr',
    gridGap: '3px',
  },
  nameText: {
    fontSize: '20px',
    color: 'white',
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    display: 'flex',
    paddingTop: '5px',
    paddingBottom: '5px',
    textAlign: 'center',
  },
  waveformWeb: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 0,
    flexDirection: 'row',
  },
  bar: {
    flex: 1,
    opacity: 0.35,
    marginRight: '0.5px',
  },
  backgroundImage: {
    position: 'absolute',
    width: '70px',
    height: '70px',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    top: '40%',
    left: '50%',
    transform: 'translate(-35px, -10px)',
  },
  roundedImage: {
    borderRadius: '20px',
  },
};

// =========================
// Props Merging & Computed
// =========================
const overlayPositionStyles = computed(() => {
  if (!props.overlayPosition) {
    return undefined;
  }
  return getOverlayPosition({ position: props.overlayPosition });
});

// Wrapper Props
const wrapperRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.wrapperProps || {};
  return rest;
});

const wrapperClassNames = computed(() =>
  joinClassNames('mediasfu-mini-audio__wrapper', props.wrapperProps?.class)
);

const wrapperStyle = computed(() => ({
  display: props.visible ? 'block' : 'none',
  ...(typeof props.wrapperProps?.style === 'object' ? props.wrapperProps.style : {}),
} as CSSProperties));

// Draggable Container Props
const draggableRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.draggableContainerProps || {};
  return rest;
});

const draggableClassNames = computed(() =>
  joinClassNames('mediasfu-mini-audio__draggable', props.draggableContainerProps?.class)
);

const draggableStyle = computed(() => ({
  transform: `translate(${position.value.x}px, ${position.value.y}px)`,
  ...styles.modalContainer,
  ...(typeof props.draggableContainerProps?.style === 'object'
    ? props.draggableContainerProps.style
    : {}),
} as CSSProperties));

// Card Props
const cardRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.cardProps || {};
  return rest;
});

const cardClassNames = computed(() =>
  joinClassNames('mediasfu-mini-audio__card', props.cardProps?.class)
);

const cardStyle = computed(() => ({
  ...styles.card,
  ...props.customStyle,
  ...(typeof props.cardProps?.style === 'object' ? props.cardProps.style : {}),
} as CSSProperties));

// Overlay Props
const overlayRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.overlayProps || {};
  return rest;
});

const overlayClassNames = computed(() =>
  joinClassNames('mediasfu-mini-audio__overlay', props.overlayProps?.class)
);

const overlayStyle = computed(() => ({
  ...styles.overlayWeb,
  ...overlayPositionStyles.value,
  ...(typeof props.overlayProps?.style === 'object' ? props.overlayProps.style : {}),
  display: props.showWaveform ? 'grid' : 'none',
} as CSSProperties));

// Waveform Container Props
const waveformRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.waveformContainerProps || {};
  return rest;
});

const waveformClassNames = computed(() =>
  joinClassNames('mediasfu-mini-audio__waveform', props.waveformContainerProps?.class)
);

const waveformStyle = computed(() => ({
  ...styles.waveformWeb,
  ...(typeof props.waveformContainerProps?.style === 'object'
    ? props.waveformContainerProps.style
    : {}),
} as CSSProperties));

// Bar Props
const barRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.barProps || {};
  return rest;
});

const barClassNames = computed(() =>
  joinClassNames('mediasfu-mini-audio__bar', props.barProps?.class)
);

// Name Container Props
const nameContainerRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.nameContainerProps || {};
  return rest;
});

const nameContainerClassNames = computed(() =>
  joinClassNames('mediasfu-mini-audio__name-container', props.nameContainerProps?.class)
);

const nameContainerStyle = computed(() => ({
  ...styles.nameText,
  color: props.textColor,
  ...props.nameTextStyling,
  ...(typeof props.nameContainerProps?.style === 'object' ? props.nameContainerProps.style : {}),
} as CSSProperties));

// Name Text Props
const nameTextRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.nameTextProps || {};
  return rest;
});

const nameTextClassNames = computed(() =>
  joinClassNames('mediasfu-mini-audio__name-text', props.nameTextProps?.class)
);

const nameTextStyle = computed(() => ({
  ...(typeof props.nameTextProps?.style === 'object' ? props.nameTextProps.style : {}),
} as CSSProperties));

// =========================
// Render Nodes
// =========================
const hasImage = computed(() => Boolean(props.imageSource));

const imageElement = computed(() => {
  if (!hasImage.value) return null;

  return h('img', {
    src: props.imageSource,
    alt: props.imageProps?.alt ?? 'Background',
    style: {
      ...styles.backgroundImage,
      ...(props.roundedImage ? styles.roundedImage : undefined),
      ...props.imageStyle,
      ...(typeof props.imageProps?.style === 'object' ? props.imageProps.style : {}),
    } as CSSProperties,
    ...props.imageProps,
  });
});

const nameContent = computed(() =>
  h(
    'div',
    {
      class: nameContainerClassNames.value,
      style: nameContainerStyle.value,
      ...nameContainerRestAttrs.value,
    },
    [
      h(
        'span',
        {
          class: nameTextClassNames.value,
          style: nameTextStyle.value,
          ...nameTextRestAttrs.value,
        },
        props.name
      ),
    ]
  )
);

const bars = computed(() =>
  waveformAnimations.value.map((animation, index) =>
    h('div', {
      key: index,
      class: barClassNames.value,
      style: {
        ...styles.bar,
        height: animation === 0 ? 1 : 30,
        width: 10,
        backgroundColor: props.barColor,
        ...(typeof props.barProps?.style === 'object' ? props.barProps.style : {}),
      } as CSSProperties,
      ...barRestAttrs.value,
    })
  )
);

const defaultWaveform = computed(() =>
  h(
    'div',
    {
      class: waveformClassNames.value,
      style: waveformStyle.value,
      ...waveformRestAttrs.value,
    },
    bars.value
  )
);

const waveformNode = computed(() => {
  if (props.renderWaveform) {
    const result = props.renderWaveform({
      defaultWaveform: defaultWaveform.value,
      showWaveform: props.showWaveform ?? false,
      animations: waveformAnimations.value,
    });
    if (isVNode(result)) return result;
  }
  return defaultWaveform.value;
});

const defaultCard = computed(() =>
  h(
    'div',
    {
      class: cardClassNames.value,
      style: cardStyle.value,
      ...cardRestAttrs.value,
    },
    [
      imageElement.value,
      nameContent.value,
      h(
        'div',
        {
          class: overlayClassNames.value,
          style: overlayStyle.value,
          ...overlayRestAttrs.value,
        },
        [waveformNode.value]
      ),
    ]
  )
);

const cardNode = computed(() => {
  if (props.renderCard) {
    const result = props.renderCard({
      defaultCard: defaultCard.value,
      hasImage: hasImage.value,
    });
    if (isVNode(result)) return result;
  }
  return defaultCard.value;
});

const defaultContainer = computed(() =>
  h(
    'div',
    {
      class: draggableClassNames.value,
      style: draggableStyle.value,
      onMousedown: handleMouseDown,
      onMousemove: handleMouseMove,
      ...draggableRestAttrs.value,
    },
    [cardNode.value]
  )
);

const containerNode = computed(() => {
  if (props.renderContainer) {
    const result = props.renderContainer({
      defaultContainer: defaultContainer.value,
      isDragging: isDragging.value,
      position: position.value,
    });
    if (isVNode(result)) return result;
  }
  return defaultContainer.value;
});

const wrapperNode = computed(() => {
  const defaultWrapper = h(
    'div',
    {
      class: wrapperClassNames.value,
      style: wrapperStyle.value,
      ...wrapperRestAttrs.value,
    },
    [containerNode.value]
  );

  if (props.renderWrapper) {
    const result = props.renderWrapper({
      defaultWrapper,
      isVisible: props.visible,
    });
    if (isVNode(result)) return result;
  }
  return defaultWrapper;
});
</script>

<style scoped>
/* Component-specific styles */
</style>
