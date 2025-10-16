<!--
/**
 * @fileoverview OtherGridComponent - Secondary grid container with timer
 * @component OtherGridComponent
 * @module components/displayComponents/OtherGridComponent
 * 
 * @description
 * A fixed-dimension grid container for secondary content (typically participant grid
 * or side panels) with optional timer overlay. Features column stacking by default
 * and 2px black border. Used for auxiliary video grids, participant lists, or
 * secondary content areas alongside the main grid.
 * 
 * Features:
 * - Fixed width and height dimensions
 * - Optional MeetingProgressTimer overlay
 * - Custom timer component injection
 * - 2px solid black border
 * - Conditional visibility via showAspect
 * - Column stack direction by default
 * - Overflow hidden for clean edges
 * 
 * @example Basic Secondary Grid
 * // <OtherGridComponent
 *   // backgroundColor="#1a1a1a"
 *   // :width="400"
 *   // :height="600"
 *   // :showTimer="true"
 *   // meetingProgressTime="00:15:32"
 * >
 *   <ParticipantGrid />
 * // </OtherGridComponent>
 * 
 * @example Without Timer
 * // <OtherGridComponent
 *   // backgroundColor="#000000"
 *   // :width="300"
 *   // :height="800"
 *   // :showTimer="false"
 *   // meetingProgressTime="00:00:00"
 * >
 *   <SidePanel />
 * // </OtherGridComponent>
 * 
 * @example Hidden Grid
 * // <OtherGridComponent
 *   // backgroundColor="transparent"
 *   // :width="350"
 *   // :height="700"
 *   // :showAspect="false"
 *   // :showTimer="false"
 *   // meetingProgressTime="00:00:00"
 * >
 *   <HiddenContent />
 * // </OtherGridComponent>
 * 
 * @example Custom Timer Component
 * // <OtherGridComponent
 *   // backgroundColor="#1a1a1a"
 *   // :width="400"
 *   // :height="600"
 *   // :showTimer="true"
 *   // meetingProgressTime="01:23:45"
 *   // :timerComponent="CustomTimerComponent"
 *   // timeBackgroundColor="#3b82f6"
 * >
 *   <SecondaryGrid />
 * // </OtherGridComponent>
 * 
 * @remarks
 * This component is typically used alongside MainGridComponent to create split-screen
 * layouts with a main video grid and a secondary participant grid. The 2px black border
 * helps visually separate it from adjacent content. The timer overlay is positioned
 * absolutely and doesn't affect layout.
 * 
 * Workflow:
 * 1. Component renders with fixed dimensions (width × height)
 * 2. 2px black border applied around container
 * 3. If showAspect=false → display: none (hidden but in DOM)
 * 4. If showTimer=true → MeetingProgressTimer rendered as overlay
 * 5. Slot content rendered inside bordered container
 * 
 * @see {@link MainGridComponent} - Primary grid component for main content
 * @see {@link MeetingProgressTimer} - Timer overlay component
 */
-->
<template>
  <div :style="containerStyle">
    <component
      :is="timerComponent"
      v-if="showTimer"
      :meeting-progress-time="meetingProgressTime"
      :initial-background-color="timeBackgroundColor"
      :show-timer="showTimer"
    />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs, type CSSProperties, type Component } from 'vue';
import MeetingProgressTimer from './MeetingProgressTimer.vue';

/**
 * Props for the OtherGridComponent
 * @interface OtherGridComponentProps
 * 
 * @property {string} backgroundColor - Background color for the grid container
 * @property {number} width - Fixed width in pixels
 * @property {number} height - Fixed height in pixels
 * @property {boolean} [showAspect=true] - Whether to display the grid (false = display: none)
 * @property {string} [timeBackgroundColor='transparent'] - Background color for timer overlay
 * @property {boolean} showTimer - Whether to display the meeting timer overlay
 * @property {string} meetingProgressTime - Current meeting time in HH:MM:SS format
 * @property {'row' | 'column'} [stackDirection='column'] - Flex direction (currently not applied)
 * @property {Component} [timerComponent=MeetingProgressTimer] - Custom timer component to use
 * 
 * @default showAspect - true
 * @default timeBackgroundColor - 'transparent'
 * @default stackDirection - 'column'
 * @default timerComponent - MeetingProgressTimer
 * 
 * @example
 * ```typescript
 * // <OtherGridComponent
 *   // backgroundColor="#1a1a1a"
 *   // :width="400"
 *   // :height="600"
 *   // :showTimer="true"
 *   // meetingProgressTime="00:15:32"
 * >
 *   <slot />
 * // </OtherGridComponent>
 * ```
 */
export interface OtherGridComponentProps {
  backgroundColor: string;
  width: number;
  height: number;
  showAspect?: boolean;
  timeBackgroundColor?: string;
  showTimer: boolean;
  meetingProgressTime: string;
  stackDirection?: 'row' | 'column';
  
  // UI override prop
  timerComponent?: Component;
}

const props = withDefaults(defineProps<OtherGridComponentProps>(), {
  showAspect: true,
  timeBackgroundColor: 'transparent',
  stackDirection: 'column',
  timerComponent: () => MeetingProgressTimer,
});

const { showAspect, showTimer, meetingProgressTime, timeBackgroundColor } = toRefs(props);

const BORDER_WIDTH = 2;

const containerStyle = computed<CSSProperties>(() => ({
  backgroundColor: props.backgroundColor,
  width: `${props.width}px`,
  height: `${props.height}px`,
  display: showAspect.value ? 'block' : 'none',
  overflow: 'hidden',
  borderStyle: 'solid',
  borderColor: 'black',
  borderWidth: `${BORDER_WIDTH}px`,
  borderRadius: 0,
  margin: 0,
  padding: 0,
  boxSizing: 'border-box',
}));

</script>
