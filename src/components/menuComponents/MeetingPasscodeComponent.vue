<!--
/**
 * @fileoverview MeetingPasscodeComponent - Admin passcode display field
 * @component MeetingPasscodeComponent
 * @module components/menuComponents/MeetingPasscodeComponent
 * 
 * @description
 * A simple, read-only input field that displays the meeting's admin passcode.
 * Intended for hosts/admins to view their event passcode for sharing with
 * authorized participants. The field is styled with a disabled appearance to
 * indicate it's not editable.
 * 
 * Features:
 * - Read-only passcode display
 * - Styled as disabled/readonly input
 * - "Event Passcode (Host)" label
 * - Gray background for visual distinction
 * - Fixed width (max 300px) for consistent layout
 * 
 * @example Basic Usage
 * // <MeetingPasscodeComponent
 *   // meetingPasscode="admin123456"
 * // />
 * 
 * @example In Menu Modal
 * // <div v-if="islevel === '2'">
 *   <MeetingPasscodeComponent
 *     :meetingPasscode="adminPasscode"
 *   />
 * </div>
 * 
 * @example Conditional Display (Host Only)
 * // <MeetingPasscodeComponent
 *   // v-if="isHost"
 *   // :meetingPasscode="roomPasscode"
 * // />
 * 
 * @remarks
 * This component is intentionally simple with no interactivity. For copy-to-clipboard
 * functionality, use MeetingIDComponent which includes a copy button. This component
 * is typically shown only to hosts (islevel='2') in the MenuModal.
 * 
 * Workflow:
 * 1. Component receives meetingPasscode prop
 * 2. Displays as read-only input with "Event Passcode (Host)" label
 * 3. Gray background indicates non-editable field
 * 4. No user interactions (display only)
 * 
 * @see {@link MeetingIDComponent} - Similar component with copy button
 * @see {@link MenuModal} - Parent container that conditionally shows this component
 */
-->
<template>
  <div class="form-group">
    <label class="label">Host Passcode:</label>
    <div class="input-container">
      <input
        class="disabled-input"
        :value="displayValue"
        readonly
        aria-label="Host passcode"
      />
      <button
        class="copy-button"
        aria-label="Toggle host passcode visibility"
        @click="toggleVisibility"
      >
        <font-awesome-icon
          :icon="isVisible ? faEyeSlash : faEye"
          :style="{ fontSize: '18px', color: 'var(--ms-modern-text-primary, #0F0F10FF)' }"
        />
      </button>
      <button
        class="copy-button"
        aria-label="Copy host passcode"
        @click="handleCopy"
      >
        <font-awesome-icon
          :icon="isCopied ? faCheck : faCopy"
          :style="{ fontSize: '18px', color: isCopied ? '#4CAF50' : 'var(--ms-modern-text-primary, #0F0F10FF)' }"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineOptions, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCheck, faCopy, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

defineOptions({
  name: 'MeetingPasscodeComponent'
});

/**
 * Props for the MeetingPasscodeComponent
 * @interface MeetingPasscodeComponentProps
 * 
 * @property {string} [meetingPasscode=''] - The admin/host passcode to display
 * 
 * @example
 * ```typescript
 * <MeetingPasscodeComponent meetingPasscode="admin123" />
 * ```
 */
export interface MeetingPasscodeComponentProps {
  meetingPasscode?: string;
}

const props = withDefaults(defineProps<MeetingPasscodeComponentProps>(), {
  meetingPasscode: '',
});

const isCopied = ref(false);
const isVisible = ref(false);

const displayValue = computed(() => {
  if (isVisible.value) {
    return props.meetingPasscode;
  }

  return props.meetingPasscode ? '\u2022'.repeat(props.meetingPasscode.length) : '';
});

const toggleVisibility = () => {
  isVisible.value = !isVisible.value;
};

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.meetingPasscode || '');
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch {
    // do nothing
  }
};
</script>

<style scoped>
.form-group {
  margin-top: 10px;
  max-width: 300px;
  width: 100%;
  margin-bottom: 10px;
}

.label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
  color: var(--ms-modern-text-primary, #000000);
}

.input-container {
  display: flex;
  align-items: center;
}

.disabled-input {
  flex: 1;
  border: 1px solid var(--ms-modern-field-border, gray);
  padding: 10px;
  background-color: var(--ms-modern-field-background, #f0f0f0);
  color: var(--ms-modern-text-primary, black);
  border-radius: 5px;
  box-sizing: border-box;
  margin-right: 5px;
}

.copy-button {
  padding: 10px;
  border: none;
  background-color: transparent;
  color: var(--ms-modern-text-primary, #0F0F10FF);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.copy-button:hover {
  opacity: 0.8;
  background-color: var(--ms-modern-field-background, rgba(15, 23, 42, 0.08));
}
</style>
