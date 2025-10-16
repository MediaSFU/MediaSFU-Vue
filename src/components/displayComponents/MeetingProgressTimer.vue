<!--
/**
 * @fileoverview MeetingProgressTimer - Meeting duration display badge
 * @component MeetingProgressTimer
 * @module components/displayComponents/MeetingProgressTimer
 * 
 * @description
 * A positioned badge that displays the current meeting duration in HH:MM:SS format.
 * Automatically positions in one of four corners and updates in real-time as the
 * meeting progresses. Typically used to show elapsed meeting time to all participants.
 * 
 * Features:
 * - Four corner positioning options (topLeft, topRight, bottomLeft, bottomRight)
 * - Real-time duration display (HH:MM:SS format)
 * - Customizable background color (default: green)
 * - Optional visibility toggle
 * - Custom text styling support
 * - Custom render functions for badge and container
 * - Full HTML attribute passthrough
 * - Fixed positioning for persistent display
 * 
 * Position Options:
 * - **topLeft**: Top-left corner (10px from top, 10px from left)
 * - **topRight**: Top-right corner (10px from top, 10px from right)
 * - **bottomLeft**: Bottom-left corner (10px from bottom, 10px from left)
 * - **bottomRight**: Bottom-right corner (10px from bottom, 10px from right)
 * 
 * @example Basic Timer (Top Left)
 * // <MeetingProgressTimer
 *   // meetingProgressTime="00:15:32"
 * // />
 * 
 * @example Top Right with Custom Color
 * // <MeetingProgressTimer
 *   // meetingProgressTime="01:23:45"
 *   // position="topRight"
 *   // initialBackgroundColor="#3b82f6"
 * // />
 * 
 * @example Bottom Right with Custom Text Style
 * // <MeetingProgressTimer
 *   // meetingProgressTime="00:05:12"
 *   // position="bottomRight"
 *   // initialBackgroundColor="#22c55e"
 *   // :textStyle="{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff' }"
 * // />
 * 
 * @example Conditionally Hidden
 * // <MeetingProgressTimer
 *   // meetingProgressTime="02:30:00"
 *   // position="topLeft"
 *   // :showTimer="isTimerVisible"
 *   // initialBackgroundColor="#8b5cf6"
 * // />
 * 
 * @example Custom Badge Renderer
 * // <MeetingProgressTimer
 *   // meetingProgressTime="00:45:30"
 *   // position="topRight"
 *   // :renderBadge="({ defaultBadge, showTimer }) =>
 *     h('div', {
 *       class: 'custom-timer-badge',
 *       style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
 *     }, [
 *       h('i', { class: 'fa fa-clock' }),
 *       h('span', meetingProgressTime)
 *     ])
 *   "
 * // />
 * 
 * @example Custom Container Renderer
 * // <MeetingProgressTimer
 *   // meetingProgressTime="01:00:00"
 *   // :renderContainer="({ defaultContainer }) =>
 *     h('div', {
 *       class: 'custom-timer-wrapper',
 *       style: { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
 *     }, [defaultContainer])
 *   "
 * // />
 * 
 * @remarks
 * The meetingProgressTime should be updated by the parent component at regular intervals
 * (typically every second) to reflect the current meeting duration. The component itself
 * does not handle time calculation or updates.
 * 
 * Workflow:
 * 1. Meeting starts → Parent begins tracking elapsed time
 * 2. Parent updates meetingProgressTime every second (e.g., "00:00:01", "00:00:02"...)
 * 3. Component displays formatted time in positioned badge
 * 4. showTimer=false → Badge hidden (but parent continues tracking time)
 * 5. Meeting ends → Badge removed from display
 * 
 * @see {@link MainContainerComponent} - Main meeting container where timer is typically placed
 */
-->
<template>
  <RenderVNode :node="containerNode" />
</template>

<script setup lang="ts">
import {
  computed,
  defineOptions,
  defineComponent,
  h,
  isVNode,
  type CSSProperties,
  type HTMLAttributes,
  type PropType,
  type VNode,
  type VNodeChild,
} from 'vue';

defineOptions({
  name: 'MeetingProgressTimer'
});

/**
 * Options passed to renderBadge function
 * @interface RenderBadgeOptions
 * @property {VNode} defaultBadge - The default timer badge VNode with time display
 * @property {boolean} showTimer - Whether the timer is currently visible
 */
interface RenderBadgeOptions {
  defaultBadge: VNode;
  showTimer: boolean;
}

/**
 * Options passed to renderContainer function
 * @interface RenderContainerOptions
 * @property {VNode} defaultContainer - The default positioned container VNode with badge
 */
interface RenderContainerOptions {
  defaultContainer: VNode;
}

/**
 * Props for the MeetingProgressTimer component
 * @interface MeetingProgressTimerProps
 * 
 * @property {string} meetingProgressTime - Current meeting duration in HH:MM:SS format (e.g., "01:23:45")
 * @property {string} [initialBackgroundColor='green'] - Background color for the timer badge
 * @property {'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'} [position='topLeft'] - Corner position for the timer badge
 * @property {CSSProperties} [textStyle={}] - Custom CSS styles for the timer text
 * @property {boolean} [showTimer=true] - Whether to display the timer badge
 * @property {HTMLAttributes} [containerProps] - Additional HTML attributes for the container
 * @property {HTMLAttributes} [badgeProps] - Additional HTML attributes for the badge element
 * @property {HTMLAttributes} [textProps] - Additional HTML attributes for the text element
 * @property {(options: RenderBadgeOptions) => VNodeChild} [renderBadge] - Custom render function for the timer badge
 * @property {(options: RenderContainerOptions) => VNodeChild} [renderContainer] - Custom render function for the container
 * 
 * @default initialBackgroundColor - 'green'
 * @default position - 'topLeft'
 * @default textStyle - {}
 * @default showTimer - true
 * 
 * @example
 * ```typescript
 * // <MeetingProgressTimer
 *   // meetingProgressTime="00:15:32"
 *   // position="topRight"
 *   // initialBackgroundColor="#3b82f6"
 *   // :textStyle="{ fontSize: '14px', fontWeight: '600' }"
 *   // :showTimer="true"
 * // />
 * ```
 */
export interface MeetingProgressTimerProps {
  meetingProgressTime: string;
  initialBackgroundColor?: string;
  position?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  textStyle?: CSSProperties;
  showTimer?: boolean;
  containerProps?: HTMLAttributes;
  badgeProps?: HTMLAttributes;
  textProps?: HTMLAttributes;
  renderBadge?: (options: RenderBadgeOptions) => VNodeChild;
  renderContainer?: (options: RenderContainerOptions) => VNodeChild;
}

const props = withDefaults(defineProps<MeetingProgressTimerProps>(), {
  initialBackgroundColor: 'green',
  position: 'topLeft',
  textStyle: () => ({}),
  showTimer: true,
  containerProps: undefined,
  badgeProps: undefined,
  textProps: undefined,
  renderBadge: undefined,
  renderContainer: undefined,
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

const positions: Record<'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight', CSSProperties> = {
  topLeft: { position: 'absolute', top: 0, left: 0 },
  topRight: { position: 'absolute', top: 0, right: 0 },
  bottomLeft: { position: 'absolute', bottom: 0, left: 0 },
  bottomRight: { position: 'absolute', bottom: 0, right: 0 },
};

const styles: Record<string, CSSProperties> = {
  badgeContainer: {
    padding: '5px',
    position: 'relative',
    zIndex: 1000,
  },
  progressTimer: {
    backgroundColor: 'green',
    padding: '5px',
    borderRadius: '5px',
    color: 'white',
  },
  progressTimerText: {
    color: 'black',
  },
};

// Container props merging
const containerRestAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = props.containerProps || {};
  return rest;
});

const containerClassNames = computed(() =>
  joinClassNames(
    'mediasfu-meeting-progress__container',
    props.containerProps?.class as string | undefined
  )
);

const resolvedPosition = computed(() => positions[props.position] ?? positions.topLeft);

const containerStyle = computed(() => {
  const baseStyle: CSSProperties = {
    ...styles.badgeContainer,
    ...resolvedPosition.value,
  };

  return {
    ...baseStyle,
    ...(typeof props.containerProps?.style === 'object' ? props.containerProps.style : {}),
  } as CSSProperties;
});

// Badge props merging
const badgeRestAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = props.badgeProps || {};
  return rest;
});

const badgeClassNames = computed(() =>
  joinClassNames(
    'mediasfu-meeting-progress__badge',
    props.badgeProps?.class as string | undefined
  )
);

const badgeStyle = computed(() => {
  const baseStyle: CSSProperties = {
    ...styles.progressTimer,
    backgroundColor: props.initialBackgroundColor,
    display: props.showTimer ? 'block' : 'none',
  };

  return {
    ...baseStyle,
    ...(typeof props.badgeProps?.style === 'object' ? props.badgeProps.style : {}),
  } as CSSProperties;
});

// Text props merging
const textRestAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = props.textProps || {};
  return rest;
});

const textClassNames = computed(() =>
  joinClassNames(
    'mediasfu-meeting-progress__text',
    props.textProps?.class as string | undefined
  )
);

const textStyleCombined = computed(() => {
  const baseStyle: CSSProperties = {
    ...styles.progressTimerText,
    ...props.textStyle,
  };

  return {
    ...baseStyle,
    ...(typeof props.textProps?.style === 'object' ? props.textProps.style : {}),
  } as CSSProperties;
});

// Default badge
const defaultBadge = computed(() =>
  h(
    'div',
    {
      class: badgeClassNames.value,
      style: badgeStyle.value,
      ...badgeRestAttrs.value,
    },
    [
      h(
        'span',
        {
          class: textClassNames.value,
          style: textStyleCombined.value,
          ...textRestAttrs.value,
        },
        props.meetingProgressTime
      ),
    ]
  )
);

// Badge node (with renderBadge hook)
const badgeNode = computed(() => {
  if (props.renderBadge) {
    const customBadge = props.renderBadge({
      defaultBadge: defaultBadge.value,
      showTimer: props.showTimer,
    });
    if (customBadge) {
      if (isVNode(customBadge)) return customBadge;
      return h(RenderVNode, { node: customBadge });
    }
  }
  return defaultBadge.value;
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
    [badgeNode.value]
  )
);

// Container node (with renderContainer hook)
const containerNode = computed(() => {
  if (props.renderContainer) {
    const customContainer = props.renderContainer({
      defaultContainer: defaultContainer.value,
    });
    if (customContainer) {
      if (isVNode(customContainer)) return customContainer;
      return h(RenderVNode, { node: customContainer });
    }
  }
  return defaultContainer.value;
});
</script>

<style scoped>
/* Component-specific styles */
</style>
