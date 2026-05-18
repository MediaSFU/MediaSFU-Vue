<template>
  <div
    v-if="message"
    ref="containerRef"
    class="ms-modern-tooltip-host"
    :style="hostStyle"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @focusin="onEnter"
    @focusout="onLeave"
  >
    <slot />
    <Teleport to="body" v-if="usePortal">
      <div
        v-show="visible"
        class="ms-modern-tooltip"
        :class="[`ms-modern-tooltip--${position}`, isDarkMode ? 'ms-modern-tooltip--dark' : 'ms-modern-tooltip--light']"
        :style="portalTooltipStyle"
        aria-hidden="true"
        role="tooltip"
      >
        {{ message }}
        <span class="ms-modern-tooltip__arrow" :class="`ms-modern-tooltip__arrow--${position}`" />
      </div>
    </Teleport>
    <div
      v-if="!usePortal"
      v-show="visible"
      class="ms-modern-tooltip"
      :class="[`ms-modern-tooltip--${position}`, isDarkMode ? 'ms-modern-tooltip--dark' : 'ms-modern-tooltip--light']"
      aria-hidden="true"
      role="tooltip"
    >
      {{ message }}
      <span class="ms-modern-tooltip__arrow" :class="`ms-modern-tooltip__arrow--${position}`" />
    </div>
  </div>
  <template v-else>
    <slot />
  </template>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted, type CSSProperties } from 'vue';

export interface ModernTooltipProps {
  /** Tooltip label text */
  message: string;
  /** Dark mode */
  isDarkMode?: boolean;
  /** Placement of the tooltip bubble relative to the trigger */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay in ms before the tooltip shows */
  delay?: number;
  /** Extra styles for the outermost host wrapper */
  style?: CSSProperties;
  /** Render tooltip in a portal attached to document.body (prevents overflow-clip) */
  usePortal?: boolean;
}

const props = withDefaults(defineProps<ModernTooltipProps>(), {
  isDarkMode: true,
  position: 'top',
  delay: 300,
  style: undefined,
  usePortal: false,
});

const containerRef = ref<HTMLElement | null>(null);
const visible = ref(false);
const portalTop = ref(0);
const portalLeft = ref(0);
let timer: ReturnType<typeof setTimeout> | null = null;

const hostStyle = computed<CSSProperties>(() => ({
  position: 'relative',
  display: 'inline-block',
  ...(props.style ?? {}),
}));

const updatePortalPosition = () => {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  switch (props.position) {
    case 'top':
      portalTop.value = rect.top - 8;
      portalLeft.value = rect.left + rect.width / 2;
      break;
    case 'bottom':
      portalTop.value = rect.bottom + 8;
      portalLeft.value = rect.left + rect.width / 2;
      break;
    case 'left':
      portalTop.value = rect.top + rect.height / 2;
      portalLeft.value = rect.left - 8;
      break;
    case 'right':
      portalTop.value = rect.top + rect.height / 2;
      portalLeft.value = rect.right + 8;
      break;
  }
};

const portalTooltipStyle = computed<CSSProperties>(() => {
  const base: CSSProperties = { position: 'fixed', zIndex: 99999, pointerEvents: 'none' };
  switch (props.position) {
    case 'top':
      return { ...base, top: `${portalTop.value}px`, left: `${portalLeft.value}px`, transform: 'translate(-50%, -100%)' };
    case 'bottom':
      return { ...base, top: `${portalTop.value}px`, left: `${portalLeft.value}px`, transform: 'translate(-50%, 0)' };
    case 'left':
      return { ...base, top: `${portalTop.value}px`, left: `${portalLeft.value}px`, transform: 'translate(-100%, -50%)' };
    case 'right':
      return { ...base, top: `${portalTop.value}px`, left: `${portalLeft.value}px`, transform: 'translate(0, -50%)' };
  }
});

const onEnter = () => {
  if (props.usePortal) updatePortalPosition();
  timer = setTimeout(() => {
    visible.value = true;
  }, props.delay);
};

const onLeave = () => {
  if (timer) { clearTimeout(timer); timer = null; }
  visible.value = false;
};

onUnmounted(() => {
  if (timer) clearTimeout(timer);
});
</script>

<style scoped>
.ms-modern-tooltip-host {
  position: relative;
  display: inline-block;
}

/* ── Bubble ─────────────────────────────────────────────────────────────── */
.ms-modern-tooltip {
  position: absolute;
  z-index: 99999;
  pointer-events: none;
  max-width: 280px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid rgba(79, 70, 229, 0.3);
  font-family: var(--ms-modern-font-family, 'Segoe UI', sans-serif);
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.4;
  text-align: center;
  white-space: normal;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 8px rgba(79, 70, 229, 0.1);
  transition: opacity 200ms ease-in-out;
}

/* ── Dark / Light skins ──────────────────────────────────────────────────── */
.ms-modern-tooltip--dark {
  background: rgba(30, 41, 59, 0.95);
  color: #e2e8f0;
}

.ms-modern-tooltip--light {
  background: rgba(248, 250, 252, 0.95);
  color: #1e293b;
}

/* ── Placement ───────────────────────────────────────────────────────────── */
.ms-modern-tooltip--top {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
}

.ms-modern-tooltip--bottom {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
}

.ms-modern-tooltip--left {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: 8px;
}

.ms-modern-tooltip--right {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 8px;
}

/* ── Arrow ───────────────────────────────────────────────────────────────── */
.ms-modern-tooltip__arrow {
  position: absolute;
  width: 0;
  height: 0;
}

.ms-modern-tooltip__arrow--top {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
}

.ms-modern-tooltip--dark .ms-modern-tooltip__arrow--top {
  border-top: 6px solid rgba(30, 41, 59, 0.95);
}

.ms-modern-tooltip--light .ms-modern-tooltip__arrow--top {
  border-top: 6px solid rgba(248, 250, 252, 0.95);
}

.ms-modern-tooltip__arrow--bottom {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
}

.ms-modern-tooltip--dark .ms-modern-tooltip__arrow--bottom {
  border-bottom: 6px solid rgba(30, 41, 59, 0.95);
}

.ms-modern-tooltip--light .ms-modern-tooltip__arrow--bottom {
  border-bottom: 6px solid rgba(248, 250, 252, 0.95);
}

.ms-modern-tooltip__arrow--left {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}

.ms-modern-tooltip--dark .ms-modern-tooltip__arrow--left {
  border-left: 6px solid rgba(30, 41, 59, 0.95);
}

.ms-modern-tooltip--light .ms-modern-tooltip__arrow--left {
  border-left: 6px solid rgba(248, 250, 252, 0.95);
}

.ms-modern-tooltip__arrow--right {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}

.ms-modern-tooltip--dark .ms-modern-tooltip__arrow--right {
  border-right: 6px solid rgba(30, 41, 59, 0.95);
}

.ms-modern-tooltip--light .ms-modern-tooltip__arrow--right {
  border-right: 6px solid rgba(248, 250, 252, 0.95);
}
</style>
