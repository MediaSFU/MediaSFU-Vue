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
    <label class="label">Event Passcode (Host):</label>
    <input
      class="disabled-input"
      :value="props.meetingPasscode"
      readonly
    />
  </div>
</template>

<script setup lang="ts">
import { defineOptions } from 'vue';

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
</script>

<style scoped>
.form-group {
  margin-top: 10px;
  max-width: 300px;
}

.label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.disabled-input {
  border: 1px solid gray;
  padding: 10px;
  margin-top: 5px;
  background-color: #f0f0f0;
  color: black;
  width: 100%;
  border-radius: 5px;
  box-sizing: border-box;
}
</style>
