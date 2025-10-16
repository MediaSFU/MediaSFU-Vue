<!--
/**
 * @fileoverview MainGridComponent - Main content grid with optional timer overlay
 * @component MainGridComponent
 * @module components/displayComponents/MainGridComponent
 * 
 * @description
 * A flex-based grid container for main content with optional meeting timer overlay.
 * Supports horizontal (row) or vertical (column) stacking and provides size/dimension
 * props for child components. Used as the primary layout container for video grids
 * and main content areas.
 * 
 * Features:
 * - Flex layout with configurable stack direction (row/column)
 * - Optional MeetingProgressTimer overlay
 * - Custom timer component injection
 * - Fixed dimensions (width/height)
 * - Main size prop for child components
 * - Background color customization
 * - Slot-based content projection
 * 
 * Stack Directions:
 * - **row** (default): Horizontal layout, children side-by-side
 * - **column**: Vertical layout, children stacked top-to-bottom
 * 
 * @example Basic Horizontal Grid
 * // <MainGridComponent
 *   // backgroundColor="#000000"
 *   // :mainSize="1200"
 *   // :height="800"
 *   // :width="1200"
 *   // :showTimer="true"
 *   // meetingProgressTime="00:15:32"
 * >
 *   <VideoGrid />
 * // </MainGridComponent>
 * 
 * @example Vertical Stack Layout
 * // <MainGridComponent
 *   // backgroundColor="transparent"
 *   // :mainSize="800"
 *   // :height="1000"
 *   // :width="800"
 *   // stackDirection="column"
 *   // :showTimer="false"
 *   // meetingProgressTime="00:00:00"
 * >
 *   <TopSection />
 *   <BottomSection />
 * // </MainGridComponent>
 * 
 * @example Without Timer
 * // <MainGridComponent
 *   // backgroundColor="#1a1a1a"
 *   // :mainSize="1920"
 *   // :height="1080"
 *   // :width="1920"
 *   // :showTimer="false"
 *   // :showAspect="true"
 *   // meetingProgressTime="00:00:00"
 * >
 *   <ScreenShare />
 * // </MainGridComponent>
 * 
 * @example Custom Timer Component
 * // <MainGridComponent
 *   // backgroundColor="#000000"
 *   // :mainSize="1000"
 *   // :height="750"
 *   // :width="1000"
 *   // :showTimer="true"
 *   // meetingProgressTime="01:23:45"
 *   // :timerComponent="CustomTimerComponent"
 *   // timeBackgroundColor="#3b82f6"
 * >
 *   <MainContent />
 * // </MainGridComponent>
 * 
 * @remarks
 * The timer overlay (MeetingProgressTimer) is positioned absolutely over the content
 * and doesn't affect layout. The mainSize prop is typically used by child components
 * to determine their own sizing. Width and height define the fixed container dimensions.
 * 
 * Workflow:
 * 1. Component renders flex container with specified dimensions
 * 2. Stack direction determines flexDirection (row/column)
 * 3. Slot content rendered inside flex container
 * 4. If showTimer=true → MeetingProgressTimer rendered as overlay
 * 5. Timer receives meetingProgressTime and updates display
 * 
 * @see {@link MeetingProgressTimer} - Default timer overlay component
 * @see {@link MainContainerComponent} - Main content container wrapper
 * @see {@link MainAspectComponent} - Responsive aspect ratio container
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
  useSlots,
  type Component,
  type CSSProperties,
  type PropType,
  type VNodeChild,
} from 'vue';
import MeetingProgressTimer from './MeetingProgressTimer.vue';

/**
 * Props for the MainGridComponent
 * @interface MainGridComponentProps
 * 
 * @property {string} backgroundColor - Background color for the grid container
 * @property {number} mainSize - Main size value passed to context (typically for child sizing)
 * @property {number} height - Fixed height in pixels
 * @property {number} width - Fixed width in pixels
 * @property {boolean} [showAspect=true] - Whether to show aspect ratio content
 * @property {string} [timeBackgroundColor='transparent'] - Background color for timer
 * @property {boolean} [showTimer=true] - Whether to display the meeting timer overlay
 * @property {string} meetingProgressTime - Current meeting time in HH:MM:SS format
 * @property {'row' | 'column'} [stackDirection='row'] - Flex direction for content stacking
 * @property {Component} [timerComponent=MeetingProgressTimer] - Custom timer component to use
 * 
 * @default showAspect - true
 * @default timeBackgroundColor - 'transparent'
 * @default showTimer - true
 * @default stackDirection - 'row'
 * @default timerComponent - MeetingProgressTimer
 * 
 * @example
 * ```typescript
 * // <MainGridComponent
 *   // backgroundColor="#000000"
 *   // :mainSize="1200"
 *   // :height="800"
 *   // :width="1200"
 *   // :showTimer="true"
 *   // meetingProgressTime="00:15:32"
 *   // stackDirection="row"
 * >
 *   <slot />
 * // </MainGridComponent>
 * ```
 */
export interface MainGridComponentProps {
  backgroundColor: string;
  mainSize: number;
  height: number;
  width: number;
  showAspect?: boolean;
  timeBackgroundColor?: string;
  showTimer?: boolean;
  meetingProgressTime: string;
  stackDirection?: 'row' | 'column';
  timerComponent?: Component;
}

const props = withDefaults(defineProps<MainGridComponentProps>(), {
  showAspect: true,
  timeBackgroundColor: 'transparent',
  showTimer: true,
  stackDirection: 'row',
  timerComponent: () => MeetingProgressTimer,
});

const slots = useSlots();

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

const BORDER_WIDTH = 4;

const maingridContainerStyle = computed<CSSProperties>(() => {
  const { width, height, backgroundColor, stackDirection, showAspect } = props;

  return {
    display: showAspect ? 'flex' : 'none',
    flexDirection: stackDirection === 'column' ? 'column' : 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: `${height}px`,
    width: `${width}px`,
    backgroundColor,
    borderStyle: 'solid',
    borderColor: '#000',
    borderWidth: `${BORDER_WIDTH}px`,
    boxSizing: 'border-box',
    overflow: 'hidden',
  } as CSSProperties;
});

// Timer component to render
const TimerComponent = computed(() => props.timerComponent || MeetingProgressTimer);

// Timer props
const timerProps = computed(() => ({
  meetingProgressTime: props.meetingProgressTime,
  initialBackgroundColor: props.timeBackgroundColor,
  showTimer: props.showTimer,
}));

// Render timer node
const timerNode = computed(() => {
  return h(TimerComponent.value, timerProps.value);
});

// Get children from slots
const children = computed(() => {
  return slots.default?.() || [];
});

// Container node with timer and children
const containerNode = computed<VNodeChild>(() => {
  return h(
    'div',
    { style: maingridContainerStyle.value },
    [timerNode.value, ...children.value]
  );
});
</script>


