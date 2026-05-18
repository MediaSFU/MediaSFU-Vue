<template>
  <RenderVNode :node="containerNode" />
</template>

<script setup lang="ts">
import {
  computed,
  defineComponent,
  h,
  isVNode,
  onMounted,
  ref,
  type CSSProperties,
  type HTMLAttributes,
  type PropType,
  type VNode,
  type VNodeChild,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { mergeAttrObjects, mergeStyleObjects } from './styleUtils';

interface RenderBadgeOptions {
  defaultBadge: VNode;
  showTimer: boolean;
}

interface RenderContainerOptions {
  defaultContainer: VNode;
}

export interface ModernMeetingProgressTimerProps {
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
  isDarkMode?: boolean;
  enableGlassmorphism?: boolean;
  enableGlow?: boolean;
  isRecording?: boolean;
  variant?: 'badge' | 'pill' | 'minimal';
  showIcon?: boolean;
}

const props = withDefaults(defineProps<ModernMeetingProgressTimerProps>(), {
  initialBackgroundColor: undefined,
  position: 'topLeft',
  textStyle: undefined,
  showTimer: true,
  containerProps: undefined,
  badgeProps: undefined,
  textProps: undefined,
  renderBadge: undefined,
  renderContainer: undefined,
  isDarkMode: true,
  enableGlassmorphism: true,
  enableGlow: false,
  isRecording: false,
  variant: 'badge',
  showIcon: true,
});

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

const isMounted = ref(false);

onMounted(() => {
  requestAnimationFrame(() => {
    isMounted.value = true;
  });
});

const timeValue = computed(() => {
  const parts = props.meetingProgressTime.split(':').map((part) => Number(part) || 0);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
});

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) {
    return hex;
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const statusColor = computed(() => {
  if (props.isRecording) {
    return '#ef4444';
  }
  if (timeValue.value > 55 * 60) {
    return '#ef4444';
  }
  if (timeValue.value > 45 * 60) {
    return '#f59e0b';
  }
  return props.initialBackgroundColor ?? '#22c55e';
});

const positionStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {
    position: 'absolute',
    zIndex: 10,
  };

  if (props.position === 'topLeft') {
    style.top = '16px';
    style.left = '16px';
  }
  if (props.position === 'topRight') {
    style.top = '16px';
    style.right = '16px';
  }
  if (props.position === 'bottomLeft') {
    style.bottom = '16px';
    style.left = '16px';
  }
  if (props.position === 'bottomRight') {
    style.bottom = '16px';
    style.right = '16px';
  }

  return style;
});

const defaultContainerProps = computed<HTMLAttributes>(() => ({
  style: positionStyle.value,
}));

const variantStyle = computed<CSSProperties>(() => {
  if (props.variant === 'pill') {
    return {
      padding: '8px 16px',
      borderRadius: '999px',
      gap: '8px',
    };
  }

  if (props.variant === 'minimal') {
    return {
      padding: '4px 8px',
      borderRadius: '8px',
      gap: '6px',
    };
  }

  return {
    padding: '6px 10px',
    borderRadius: '8px',
    gap: '6px',
  };
});

const defaultBadgeProps = computed<HTMLAttributes>(() => ({
  style: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: props.variant === 'minimal'
      ? 'transparent'
      : props.enableGlassmorphism
        ? props.isDarkMode
          ? 'rgba(15, 23, 42, 0.72)'
          : 'rgba(255, 255, 255, 0.94)'
        : props.isDarkMode
          ? '#0f172a'
          : '#ffffff',
    border: props.variant === 'minimal'
      ? 'none'
      : props.enableGlassmorphism
        ? `1px solid ${props.isDarkMode ? 'rgba(148, 163, 184, 0.18)' : 'rgba(15, 23, 42, 0.08)'}`
        : undefined,
    backdropFilter: props.variant === 'minimal' || !props.enableGlassmorphism ? undefined : 'blur(12px)',
    WebkitBackdropFilter: props.variant === 'minimal' || !props.enableGlassmorphism ? undefined : 'blur(12px)',
    boxShadow: props.variant === 'minimal'
      ? 'none'
      : props.isDarkMode
        ? '0 6px 18px rgba(2, 8, 23, 0.24)'
        : '0 2px 8px rgba(15, 23, 42, 0.12)',
    opacity: isMounted.value ? 1 : 0,
    transform: isMounted.value ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.88)',
    transition: 'transform 180ms ease, opacity 180ms ease',
    ...variantStyle.value,
  } satisfies CSSProperties,
}));

const defaultTextProps = computed<HTMLAttributes>(() => ({
  style: mergeStyleObjects(
    {
      color: props.isDarkMode ? '#f8fafc' : '#0f172a',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      fontSize: '16px',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    props.textStyle,
  ),
}));

const mergedContainerProps = computed(() =>
  mergeAttrObjects(defaultContainerProps.value, props.containerProps)
);

const mergedBadgeProps = computed(() =>
  mergeAttrObjects(defaultBadgeProps.value, props.badgeProps)
);

const mergedTextProps = computed(() =>
  mergeAttrObjects(defaultTextProps.value, props.textProps)
);

const recordingDotStyle = computed<CSSProperties>(() => ({
  width: '10px',
  height: '10px',
  borderRadius: '999px',
  background: '#ef4444',
  animation: 'ms-modern-meeting-progress-pulse 1.1s ease-in-out infinite',
}));

const iconShellStyle = computed<CSSProperties>(() => ({
  width: '24px',
  height: '24px',
  borderRadius: '999px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: hexToRgba(statusColor.value, props.isDarkMode ? 0.24 : 0.18),
  color: statusColor.value,
  boxShadow: 'none',
}));

const containerNode = computed<VNodeChild>(() => {
  if (!props.showTimer) {
    return null;
  }

  const badgeChildren: VNodeChild[] = [];

  if (props.showIcon) {
    badgeChildren.push(
      h(
        'span',
        { style: iconShellStyle.value },
        props.isRecording
          ? h('span', { style: recordingDotStyle.value })
          : h(FontAwesomeIcon, { icon: faClock, style: { fontSize: '11px' } })
      )
    );
  }

  badgeChildren.push(h('span', mergedTextProps.value, props.meetingProgressTime));

  if (props.isRecording) {
    badgeChildren.push(
      h(
        'span',
        {
          style: {
            color: '#ef4444',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.08em',
          } satisfies CSSProperties,
        },
        'REC'
      )
    );
  }

  const defaultBadge = h('div', mergedBadgeProps.value, badgeChildren);
  const renderedBadge = props.renderBadge
    ? props.renderBadge({
        defaultBadge,
        showTimer: props.showTimer,
      })
    : defaultBadge;

  const normalizedBadge = isVNode(renderedBadge)
    ? renderedBadge
    : h(RenderVNode, { node: renderedBadge });

  const defaultContainer = h('div', mergedContainerProps.value, [normalizedBadge]);

  if (props.renderContainer) {
    return props.renderContainer({ defaultContainer });
  }

  return defaultContainer;
});
</script>

<style scoped>
@keyframes ms-modern-meeting-progress-pulse {
  0%,
  100% {
    opacity: 0.45;
    transform: scale(0.92);
  }

  50% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
