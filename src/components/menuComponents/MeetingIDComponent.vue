<!--
/**
 * @fileoverview MeetingIDComponent - Meeting/Event ID display with copy button
 * @component MeetingIDComponent
 * @module components/menuComponents/MeetingIDComponent
 * 
 * @description
 * A read-only input field displaying the meeting/event ID with a one-click copy-to-clipboard
 * button. Features visual feedback when copied (icon turns green for 2 seconds). Used in
 * MenuModal and other contexts where users need to share the meeting ID.
 * 
 * Features:
 * - Read-only input field with meeting ID
 * - One-click copy-to-clipboard button
 * - Visual feedback on copy (icon turns green)
 * - Auto-resets after 2 seconds
 * - Accessible with aria-labels
 * - Uses system clipboard API
 * 
 * Copy States:
 * - **Default**: Black copy icon (#0F0F10FF)
 * - **Copied**: Green copy icon (#4CAF50) for 2 seconds
 * 
 * @example Basic Meeting ID Display
 * // <MeetingIDComponent
 *   // meetingID="abc-123-xyz"
 * // />
 * 
 * @example Empty Meeting ID
 * // <MeetingIDComponent
 *   // meetingID=""
 * // />
 * 
 * @example Long Meeting ID
 * // <MeetingIDComponent
 *   // meetingID="meeting-room-2024-01-15-afternoon-session"
 * // />
 * 
 * @remarks
 * The component uses the modern navigator.clipboard.writeText() API which requires
 * HTTPS in production or localhost for development. The copy button provides immediate
 * visual feedback by changing color, then automatically resets after 2 seconds.
 * 
 * Workflow:
 * 1. Component renders read-only input with meeting ID
 * 2. User clicks copy button
 * 3. Meeting ID copied to system clipboard via navigator.clipboard
 * 4. Icon color changes to green (#4CAF50)
 * 5. After 2 seconds → Icon color resets to black (#0F0F10FF)
 * 6. User can paste meeting ID anywhere
 * 
 * @see {@link MeetingPasscodeComponent} - Companion component for displaying passcode
 * @see {@link MenuModal} - Modal that typically contains this component
 */
-->
<template>
  <div class="form-group">
    <label class="label">Event ID:</label>
    <div class="input-container">
      <input
        class="disabled-input"
        :value="props.meetingID"
        readonly
        aria-label="Event ID"
      />
      <button
        class="copy-button"
        aria-label="Copy Event ID"
        @click="handleCopy"
      >
        <font-awesome-icon
          :icon="faCopy"
          :style="{ fontSize: '20px', color: isCopied ? '#4CAF50' : '#0F0F10FF' }"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineOptions } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

defineOptions({
  name: 'MeetingIDComponent'
});

/**
 * Props for the MeetingIDComponent
 * @interface MeetingIdComponentProps
 * 
 * @property {string} [meetingID=''] - Meeting/Event ID to display and copy
 * 
 * @default meetingID - ''
 * 
 * @example
 * ```typescript
 * // <MeetingIDComponent
 *   // meetingID="meeting-abc-123"
 * // />
 * ```
 */
export interface MeetingIdComponentProps {
  meetingID?: string;
}

const props = withDefaults(defineProps<MeetingIdComponentProps>(), {
  meetingID: '',
});

const isCopied = ref(false);

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.meetingID || '');
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
  font-size: 16px;
  color: #000000;
  margin-bottom: 5px;
  display: block;
}

.input-container {
  display: flex;
  align-items: center;
}

.disabled-input {
  flex: 1;
  border: 1px solid gray;
  padding: 10px;
  background-color: #f0f0f0;
  color: black;
  border-radius: 5px;
  font-size: 16px;
  margin-right: 5px;
}

.copy-button {
  padding: 10px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.copy-button:hover {
  opacity: 0.8;
}
</style>
