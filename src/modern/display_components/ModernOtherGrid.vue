<template>
  <div :style="containerStyle">
    <component
      :is="TimerComponent"
      v-if="showTimer"
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
import type { OtherGridComponentProps } from '../../components/displayComponents/OtherGridComponent.vue';

export interface ModernOtherGridProps extends OtherGridComponentProps {
  isDarkMode?: boolean;
}

const props = withDefaults(defineProps<ModernOtherGridProps>(), {
  showAspect: true,
  timeBackgroundColor: 'transparent',
  stackDirection: 'column',
  timerComponent: () => MeetingProgressTimer,
  isDarkMode: true,
});

const TimerComponent = computed(() => props.timerComponent || MeetingProgressTimer);

const containerStyle = computed<CSSProperties>(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`,
  display: props.showAspect ? 'block' : 'none',
  overflow: 'hidden',
  background: props.backgroundColor ?? 'var(--ms-modern-page-background)',
  border: '1px solid var(--ms-modern-panel-border)',
  borderRadius: 0,
  margin: 0,
  padding: 0,
  boxSizing: 'border-box',
  position: 'relative',
}));
</script>