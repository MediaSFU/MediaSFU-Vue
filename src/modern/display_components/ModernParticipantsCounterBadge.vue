<template>
  <div
    v-if="showBadge"
    class="ms-modern-participants-counter-badge"
    :style="containerStyle"
  >
    <div
      class="ms-modern-participants-counter-badge__pill"
      :style="badgeStyle"
    >
      <FontAwesomeIcon
        :icon="faUsers"
        :style="iconStyle"
      />
      <span :style="countStyle">{{ participantsCount }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

type BadgePosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export interface ModernParticipantsCounterBadgeProps {
  participantsCount: number;
  position?: BadgePosition;
  showBadge?: boolean;
  backgroundColor?: string;
  textColor?: string;
  isDarkMode?: boolean;
  customStyle?: CSSProperties;
}

const props = withDefaults(defineProps<ModernParticipantsCounterBadgeProps>(), {
  position: 'bottomLeft',
  showBadge: true,
  backgroundColor: undefined,
  textColor: undefined,
  isDarkMode: true,
  customStyle: undefined,
});

const offset = '16px';

const positionStyle = computed<CSSProperties>(() => {
  switch (props.position) {
    case 'topLeft':
      return { top: offset, left: offset };
    case 'topRight':
      return { top: offset, right: offset };
    case 'bottomRight':
      return { bottom: offset, right: offset };
    case 'bottomLeft':
    default:
      return { bottom: offset, left: offset };
  }
});

const resolvedBackgroundColor = computed(() =>
  props.backgroundColor
  ?? (props.isDarkMode ? 'rgba(45, 52, 54, 0.85)' : 'rgba(255, 255, 255, 0.9)')
);

const resolvedTextColor = computed(() =>
  props.textColor ?? (props.isDarkMode ? '#FFFFFF' : '#1F2937')
);

const containerStyle = computed<CSSProperties>(() => ({
  position: 'absolute',
  zIndex: 100,
  pointerEvents: 'none',
  ...positionStyle.value,
  ...(props.customStyle ?? {}),
}));

const badgeStyle = computed<CSSProperties>(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 14px',
  backgroundColor: resolvedBackgroundColor.value,
  borderRadius: '20px',
  boxShadow: props.isDarkMode
    ? '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    : '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: props.isDarkMode
    ? '1px solid rgba(255, 255, 255, 0.15)'
    : '1px solid rgba(0, 0, 0, 0.1)',
}));

const iconStyle = computed<CSSProperties>(() => ({
  color: resolvedTextColor.value,
  fontSize: '14px',
  opacity: 0.9,
}));

const countStyle = computed<CSSProperties>(() => ({
  color: resolvedTextColor.value,
  fontSize: '14px',
  fontWeight: 600,
  letterSpacing: '0.5px',
}));
</script>