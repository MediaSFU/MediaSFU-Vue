<template>
  <button
    class="ms-modern-button"
    :class="[
      `ms-modern-button--${variant}`,
      `ms-modern-button--${size}`,
      { 'ms-modern-button--block': block },
    ]"
    :type="type"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
export interface ModernButtonProps {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'lg';
  block?: boolean;
  disabled?: boolean;
}

withDefaults(defineProps<ModernButtonProps>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  block: false,
  disabled: false,
});
</script>

<style scoped>
.ms-modern-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ms-modern-spacing-sm);
  border-radius: var(--ms-modern-radius-pill);
  border: 1px solid transparent;
  font-family: var(--ms-modern-font-family);
  font-size: var(--ms-modern-font-body);
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition:
    transform var(--ms-modern-motion-fast) var(--ms-modern-motion-easing),
    background var(--ms-modern-motion-base) var(--ms-modern-motion-easing),
    border-color var(--ms-modern-motion-base) var(--ms-modern-motion-easing),
    box-shadow var(--ms-modern-motion-base) var(--ms-modern-motion-easing);
}

.ms-modern-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.ms-modern-button:focus-visible {
  outline: none;
  box-shadow: var(--ms-modern-shadow-focus);
}

.ms-modern-button:disabled {
  opacity: 0.62;
  cursor: not-allowed;
}

.ms-modern-button--primary {
  color: var(--ms-modern-text-primary);
  background: linear-gradient(135deg, var(--ms-modern-brand-primary), var(--ms-modern-brand-secondary));
  box-shadow: 0 14px 30px rgba(59, 130, 246, 0.26);
}

.ms-modern-button--secondary {
  color: var(--ms-modern-text-primary);
  background: rgba(59, 130, 246, 0.16);
  border-color: rgba(59, 130, 246, 0.28);
}

.ms-modern-button--ghost {
  color: var(--ms-modern-text-secondary);
  background: rgba(15, 23, 42, 0.28);
  border-color: rgba(148, 163, 184, 0.16);
}

.ms-modern-button--md {
  min-height: 46px;
  padding: 0 20px;
}

.ms-modern-button--lg {
  min-height: 54px;
  padding: 0 24px;
}

.ms-modern-button--block {
  width: 100%;
}
</style>