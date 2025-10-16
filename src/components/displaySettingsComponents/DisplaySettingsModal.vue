<!--
 * DisplaySettingsModal - Participant display configuration modal
 *
 * @fileoverview
 * A modal component for configuring how participants are displayed in the event.
 * Provides options for filtering visible participants (video-only, media-only, all),
 * toggling audio waveforms, and forcing full display mode for all participants.
 *
 * @component DisplaySettingsModal
 * @module components/displaySettingsComponents/DisplaySettingsModal
 *
 * @description
 * This modal provides display configuration options with:
 * - Display type filter (video participants only, media participants only, all participants)
 * - Audio waveform toggle (show/hide audiographs)
 * - Force full display toggle (show all participants regardless of active speaker)
 * - Real-time updates to grid layout
 * - Automatic re-rendering of participant grids
 * - Event-type-specific settings
 * - Positioned modal with backdrop
 *
 * @example
 * // Basic display settings modal
 * // <DisplaySettingsModal
 *   // :is-display-settings-modal-visible="showDisplaySettings"
 *   // :on-display-settings-close="() => setShowDisplaySettings(false)"
 *   // :parameters="{
 *     meetingDisplayType,
 *     autoWave,
 *     forceFullDisplay,
 *     meetingVideoOptimized,
 *     islevel,
 *     participants,
 *     updateMeetingDisplayType,
 *     updateAutoWave,
 *     updateForceFullDisplay,
 *     updateUpdateMainWindow,
 *     updateUpdateActiveMinicardsGrid,
 *     getUpdatedAllParams
 *   }"
 * // />
 *
 * @example
 * // Custom background color
 * // <DisplaySettingsModal
 *   // :is-display-settings-modal-visible="showSettings"
 *   // :on-display-settings-close="closeSettings"
 *   // :parameters="params"
 *   // background-color="#1a1a1a"
 * // />
 *
 * @example
 * // Different positioning
 * // <DisplaySettingsModal
 *   // :is-display-settings-modal-visible="showSettings"
 *   // :on-display-settings-close="closeSettings"
 *   // :parameters="params"
 *   // position="bottomLeft"
 * // />
 *
 * @example
 * // Programmatic control
 * // <DisplaySettingsModal
 *   // :is-display-settings-modal-visible="showSettings"
 *   // :on-display-settings-close="() => {
 *     // Custom close logic
 *     saveDisplayPreferences();
 *     setShowSettings(false);
 *   }"
 *   // :parameters="params"
 * // />
-->
<template>
  <div :style="modalContainerStyle">
    <div :style="modalContentStyle">
      <div
        style="
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        "
      >
        <h2 style="font-size: 18px; font-weight: bold; color: black">
          Display Settings
        </h2>
        <button 
          class="btn-close-media-settings" 
          style="
            background: none;
            border: none;
            cursor: pointer;
            font-size: 24px;
            color: black;
            padding: 4px 8px;
            line-height: 1;
          "
          @click="onDisplaySettingsClose"
        >
          <span style="display: block">&times;</span>
        </button>
      </div>
      <hr style="height: 1px; background-color: black; margin-top: 5px; margin-bottom: 5px" />
      <div style="flex: 1">
        <div style="margin-bottom: 10px">
          <label
            style="
              font-size: medium;
              color: black;
              margin-bottom: 5px;
              font-weight: bold;
            "
          >
            Display Option:
          </label>
          <select
            v-model="meetingDisplayTypeState"
            style="
              font-size: medium;
              padding: 12px 10px;
              border: 1px solid gray;
              border-radius: 4px;
              color: black;
              padding-right: 30px;
              background-color: white;
            "
          >
            <option value="video">
              Video Participants Only
            </option>
            <option value="media">
              Media Participants Only
            </option>
            <option value="all">
              Show All Participants
            </option>
          </select>
        </div>
        <div style="height: 1px; background-color: #ffffff; margin-top: 2px; margin-bottom: 2px" />
        <div style="margin-bottom: 10px">
          <div
            style="
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            "
          >
            <label style="font-size: medium; color: black; font-weight: bold">
              Display Audiographs
            </label>
            <button @click="autoWaveState = !autoWaveState">
              <span
                :style="{
                  fontSize: 'large',
                  color: autoWaveState ? 'green' : 'red',
                  fontWeight: 'bolder'
                }"
              >
                &#10003;
              </span>
            </button>
          </div>
          <div
            style="height: 1px; background-color: #ffffff; margin-top: 2px; margin-bottom: 2px"
          />
          <div
            style="
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            "
          >
            <label style="font-size: medium; color: black; font-weight: bold">
              Force Full Display
            </label>
            <button @click="forceFullDisplayState = !forceFullDisplayState">
              <span
                :style="{
                  fontSize: 'large',
                  color: forceFullDisplayState ? 'green' : 'red',
                  fontWeight: 'bolder'
                }"
              >
                &#10003;
              </span>
            </button>
          </div>
          <div
            style="height: 1px; background-color: #ffffff; margin-top: 2px; margin-bottom: 2px"
          />
          <div
            style="
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            "
          >
            <label style="font-size: medium; color: black; font-weight: bold">
              Force Video Participants
            </label>
            <button @click="meetingVideoOptimizedState = !meetingVideoOptimizedState">
              <span
                :style="{
                  fontSize: 'large',
                  color: meetingVideoOptimizedState ? 'green' : 'red',
                  fontWeight: 'bolder'
                }"
              >
                &#10003;
              </span>
            </button>
          </div>
          <div
            style="height: 1px; background-color: #ffffff; margin-top: 2px; margin-bottom: 2px"
          />
        </div>
      </div>
      <div style="margin-top: 10px; flex-direction: row; justify-content: flex-end">
        <button
          style="
            flex: 1;
            padding: 5px;
            border-radius: 5px;
            justify-content: center;
            align-items: center;
            background-color: black;
            border: none;
            cursor: pointer;
          "
          @click="handleSaveSettings"
        >
          <span style="color: white; font-size: medium">Save</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type CSSProperties } from 'vue'
import {
  modifyDisplaySettings,
  type ModifyDisplaySettingsOptions,
  type ModifyDisplaySettingsParameters
} from 'mediasfu-shared'

export interface DisplaySettingsModalParameters extends ModifyDisplaySettingsParameters {
  meetingDisplayType: string
  autoWave: boolean
  forceFullDisplay: boolean
  meetingVideoOptimized: boolean
}

export interface DisplaySettingsModalProps {
  isDisplaySettingsModalVisible: boolean
  onDisplaySettingsClose: () => void
  onModifyDisplaySettings?: (options: ModifyDisplaySettingsOptions) => Promise<void>
  parameters: DisplaySettingsModalParameters
  position?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft'
  backgroundColor?: string
}

const props = defineProps<DisplaySettingsModalProps>();

// Manually provide defaults for optional props
const onModifyDisplaySettings = computed(() => props.onModifyDisplaySettings ?? modifyDisplaySettings);
const position = computed(() => props.position ?? 'topRight');
const backgroundColor = computed(() => props.backgroundColor ?? '#83c0e9');

const screenWidth = window.innerWidth
let modalWidth = 0.8 * screenWidth
if (modalWidth > 350) {
  modalWidth = 350
}

const meetingDisplayTypeState = ref(props.parameters.meetingDisplayType)
const autoWaveState = ref(props.parameters.autoWave)
const forceFullDisplayState = ref(props.parameters.forceFullDisplay)
const meetingVideoOptimizedState = ref(props.parameters.meetingVideoOptimized)

const modalContainerStyle = computed((): CSSProperties => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: props.isDisplaySettingsModalVisible ? 'block' : 'none',
  zIndex: 999
}))

const modalContentStyle = computed((): CSSProperties => ({
  position: 'fixed',
  backgroundColor: backgroundColor.value,
  borderRadius: '10px',
  padding: '10px',
  width: `${modalWidth}px`,
  maxHeight: '65%',
  overflowY: 'auto',
  top: position.value.includes('top') ? '10px' : 'auto',
  bottom: position.value.includes('bottom') ? '10px' : 'auto',
  left: position.value.includes('Left') ? '10px' : 'auto',
  right: position.value.includes('Right') ? '10px' : 'auto'
}))

const handleSaveSettings = async () => {
  await onModifyDisplaySettings.value({
    parameters: {
      ...props.parameters,
      meetingDisplayType: meetingDisplayTypeState.value,
      autoWave: autoWaveState.value,
      forceFullDisplay: forceFullDisplayState.value,
      meetingVideoOptimized: meetingVideoOptimizedState.value
    }
  })
}
</script>

<script lang="ts">
export default {
  name: 'DisplaySettingsModal'
}
</script>

<style scoped>
.btn-close-media-settings {
  cursor: pointer;
}
</style>
