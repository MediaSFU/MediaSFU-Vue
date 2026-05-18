<template>
  <label
    class="ms-modern-field"
    :class="{ 'ms-modern-field--invalid': isInvalid }"
  >
    <span
      v-if="label"
      class="ms-modern-field__label"
    >
      {{ label }}
    </span>

    <component
      :is="as"
      class="ms-modern-field__control"
      v-bind="$attrs"
      :aria-invalid="resolvedAriaInvalid"
    >
      <slot />
    </component>

    <span
      v-if="helpText"
      class="ms-modern-field__hint"
    >
      {{ helpText }}
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';

defineOptions({
  inheritAttrs: false,
});

export interface ModernFieldProps {
  as?: 'input' | 'select' | 'textarea';
  label?: string;
  hint?: string;
  invalid?: boolean;
  error?: string;
}

const props = withDefaults(defineProps<ModernFieldProps>(), {
  as: 'input',
  label: undefined,
  hint: undefined,
  invalid: false,
  error: undefined,
});

const attrs = useAttrs();

const isInvalid = computed(() => props.invalid || Boolean(props.error));
const helpText = computed(() => props.error ?? props.hint);
const resolvedAriaInvalid = computed(() => {
  const explicit = attrs['aria-invalid'];

  if (typeof explicit === 'string') {
    return explicit;
  }

  if (typeof explicit === 'boolean') {
    return explicit ? 'true' : 'false';
  }

  return isInvalid.value ? 'true' : undefined;
});
</script>

<style scoped>
.ms-modern-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.ms-modern-field__label {
  color: var(--ms-modern-text-secondary);
  font-family: var(--ms-modern-font-family);
  font-size: var(--ms-modern-font-label);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.ms-modern-field__control {
  width: 100%;
  box-sizing: border-box;
  min-height: 48px;
  border: 1px solid var(--ms-modern-field-border);
  border-radius: var(--ms-modern-radius-md);
  background: var(--ms-modern-field-background);
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: var(--ms-modern-font-body);
  padding: 0 16px;
  transition:
    border-color var(--ms-modern-motion-base) var(--ms-modern-motion-easing),
    box-shadow var(--ms-modern-motion-base) var(--ms-modern-motion-easing),
    background var(--ms-modern-motion-base) var(--ms-modern-motion-easing);
}

textarea.ms-modern-field__control {
  min-height: 120px;
  padding-top: 14px;
  padding-bottom: 14px;
  resize: vertical;
}

.ms-modern-field__control:focus {
  outline: none;
  border-color: var(--ms-modern-field-border-focus);
  box-shadow: var(--ms-modern-shadow-focus);
}

.ms-modern-field__control::placeholder {
  color: var(--ms-modern-text-muted);
}

.ms-modern-field__hint {
  color: var(--ms-modern-text-muted);
  font-family: var(--ms-modern-font-family);
  font-size: var(--ms-modern-font-caption);
}

.ms-modern-field--invalid .ms-modern-field__label {
  color: var(--ms-modern-danger);
}

.ms-modern-field--invalid .ms-modern-field__control {
  border-color: rgba(244, 63, 94, 0.72);
  background: rgba(127, 29, 29, 0.12);
  box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.18);
}

.ms-modern-field--invalid .ms-modern-field__control:focus {
  border-color: rgba(244, 63, 94, 0.84);
  box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.22);
}

.ms-modern-field--invalid .ms-modern-field__hint {
  color: var(--ms-modern-danger);
  font-weight: 600;
}
</style>