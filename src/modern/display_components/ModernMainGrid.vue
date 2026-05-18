<template>
  <div :style="containerStyle">
    <component
      :is="TimerComponent"
      :meeting-progress-time="meetingProgressTime"
      :initial-background-color="timeBackgroundColor"
      :show-timer="showTimer"
      :is-dark-mode="isDarkMode"
    />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';
import MeetingProgressTimer from '../../components/displayComponents/MeetingProgressTimer.vue';
import type { MainGridComponentProps } from '../../components/displayComponents/MainGridComponent.vue';

export interface ModernMainGridProps extends MainGridComponentProps {
  isDarkMode?: boolean;
}

const props = withDefaults(defineProps<ModernMainGridProps>(), {
  showAspect: true,
  timeBackgroundColor: 'transparent',
  showTimer: true,
  stackDirection: 'row',
  timerComponent: () => MeetingProgressTimer,
  isDarkMode: true,
});

const TimerComponent = computed(() => props.timerComponent || MeetingProgressTimer);

const containerStyle = computed<CSSProperties>(() => ({
  display: props.showAspect ? 'flex' : 'none',
  flexDirection: props.stackDirection === 'column' ? 'column' : 'row',
  justifyContent: 'center',
  alignItems: 'center',
  height: `${props.height}px`,
  width: `${props.width}px`,
  background: props.backgroundColor ?? 'var(--ms-modern-page-background)',
  border: '1px solid var(--ms-modern-panel-border)',
  boxSizing: 'border-box',
  overflow: 'hidden',
  position: 'relative',
}));
</script>