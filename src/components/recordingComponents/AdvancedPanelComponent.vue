<!--
/**
 * @fileoverview AdvancedPanelComponent - Advanced recording customization panel
 * @component AdvancedPanelComponent
 * @module components/recordingComponents/AdvancedPanelComponent
 * 
 * @description
 * An advanced recording configuration panel providing comprehensive customization options for
 * recording appearance and layout. Features include video type selection, display type filtering,
 * background color customization, custom text overlays with position/color controls, name tags,
 * name tag colors, and video orientation settings. Designed for users who need fine-grained
 * control over recording output aesthetics and layout.
 * 
 * Key Features:
 * - **Video Type**: fullDisplay (no background), bestDisplay (full video), all
 * - **Display Type**: Filter participants by video/media/all (hidden for broadcast)
 * - **Background Color**: Color picker for recording background
 * - **Add Text**: Toggle custom text overlay on recording
 * - **Custom Text**: Input field for overlay text content
 * - **Text Position**: top, middle, bottom
 * - **Text Color**: Color picker for custom text
 * - **Add Name Tags**: Toggle participant name tags on video
 * - **Name Tag Color**: Color picker for name tag background
 * - **Video Orientation**: landscape, portrait, all
 * - Real-time color preview with hex value display
 * - Conditional UI (text options only show when text enabled)
 * - Event type awareness (display type hidden for broadcast)
 * 
 * Configuration Options:
 * - **Video Type**:
 *   - `fullDisplay`: Record full display without background padding
 *   - `bestDisplay`: Record full video with optimal quality
 *   - `all`: Record all available video streams
 * 
 * - **Display Type** (hidden for broadcast):
 *   - `video`: Only participants with video enabled
 *   - `videoOpt`: Only video participants (optimized layout)
 *   - `media`: Participants with any media (audio/video)
 *   - `all`: All participants regardless of media state
 * 
 * - **Text Position**:
 *   - `top`: Overlay text at top of recording
 *   - `middle`: Overlay text in center
 *   - `bottom`: Overlay text at bottom
 * 
 * - **Video Orientation**:
 *   - `landscape`: Horizontal orientation (16:9)
 *   - `portrait`: Vertical orientation (9:16)
 *   - `all`: Any orientation
 * 
 * Workflow:
 * 1. User opens advanced settings in RecordingModal
 * 2. Component displays all customization options with current values
 * 3. User selects video type → updateRecordingVideoType called
 * 4. User selects display type → updateRecordingDisplayType called
 * 5. User picks background color → updateRecordingBackgroundColor called
 * 6. User enables text → text input, position, color options appear
 * 7. User enters custom text → updateRecordingCustomText called
 * 8. User selects text position → updateRecordingCustomTextPosition called
 * 9. User picks text color → updateRecordingCustomTextColor called
 * 10. User enables name tags → updateRecordingNameTags called
 * 11. User picks name tag color → updateRecordingNameTagsColor called
 * 12. User selects orientation → updateRecordingOrientationVideo called
 * 13. All settings applied when recording starts
 * 
 * @example Basic Usage
 * ```typescript
 * // <AdvancedPanelComponent
 *   // :parameters="{
 *     recordingVideoType: 'bestDisplay',
 *     recordingDisplayType: 'video',
 *     recordingBackgroundColor: '#000000',
 *     recordingNameTagsColor: '#ffffff',
 *     recordingOrientationVideo: 'landscape',
 *     recordingNameTags: true,
 *     recordingAddText: false,
 *     recordingCustomText: '',
 *     recordingCustomTextPosition: 'top',
 *     recordingCustomTextColor: '#ffffff',
 *     updateRecordingVideoType: setVideoType,
 *     updateRecordingDisplayType: setDisplayType,
 *     updateRecordingBackgroundColor: setBgColor,
 *     updateRecordingNameTagsColor: setNameTagColor,
 *     updateRecordingOrientationVideo: setOrientation,
 *     updateRecordingNameTags: setNameTags,
 *     updateRecordingAddText: setAddText,
 *     updateRecordingCustomText: setCustomText,
 *     updateRecordingCustomTextPosition: setTextPosition,
 *     updateRecordingCustomTextColor: setTextColor,
 *     eventType: 'webinar'
 *   }"
 * // />
 * ```
 * 
 * @example With Custom Text Overlay
 * ```typescript
 * // <AdvancedPanelComponent
 *   // :parameters="{
 *     recordingVideoType: 'fullDisplay',
 *     recordingDisplayType: 'videoOpt',
 *     recordingBackgroundColor: '#1a1a1a',
 *     recordingNameTagsColor: '#0088ff',
 *     recordingOrientationVideo: 'landscape',
 *     recordingNameTags: true,
 *     recordingAddText: true,
 *     recordingCustomText: 'Company Webinar - Q1 2025',
 *     recordingCustomTextPosition: 'bottom',
 *     recordingCustomTextColor: '#ffcc00',
 *     updateRecordingVideoType: setVideoType,
 *     updateRecordingDisplayType: setDisplayType,
 *     updateRecordingBackgroundColor: setBgColor,
 *     updateRecordingNameTagsColor: setNameTagColor,
 *     updateRecordingOrientationVideo: setOrientation,
 *     updateRecordingNameTags: setNameTags,
 *     updateRecordingAddText: setAddText,
 *     updateRecordingCustomText: setCustomText,
 *     updateRecordingCustomTextPosition: setTextPosition,
 *     updateRecordingCustomTextColor: setTextColor,
 *     eventType: 'webinar'
 *   }"
 * // />
 * ```
 * 
 * @example Broadcast Mode (Display Type Hidden)
 * ```typescript
 * // <AdvancedPanelComponent
 *   // :parameters="{
 *     recordingVideoType: 'all',
 *     recordingDisplayType: 'all',
 *     recordingBackgroundColor: '#000000',
 *     recordingNameTagsColor: '#ffffff',
 *     recordingOrientationVideo: 'landscape',
 *     recordingNameTags: false,
 *     recordingAddText: false,
 *     recordingCustomText: '',
 *     recordingCustomTextPosition: 'top',
 *     recordingCustomTextColor: '#ffffff',
 *     updateRecordingVideoType: setVideoType,
 *     updateRecordingDisplayType: setDisplayType,
 *     updateRecordingBackgroundColor: setBgColor,
 *     updateRecordingNameTagsColor: setNameTagColor,
 *     updateRecordingOrientationVideo: setOrientation,
 *     updateRecordingNameTags: setNameTags,
 *     updateRecordingAddText: setAddText,
 *     updateRecordingCustomText: setCustomText,
 *     updateRecordingCustomTextPosition: setTextPosition,
 *     updateRecordingCustomTextColor: setTextColor,
 *     eventType: 'broadcast'
 *   }"
 * // />
 * ```
 * 
 * @see {@link RecordingModal} for main recording interface
 * @see {@link StandardPanelComponent} for basic recording options
 * @see {@link https://mediasfu.com/docs/recording-advanced} for advanced recording documentation
 */
-->
<template>
  <div>
    <!-- Video Type -->
    <div>
      <label style="margin-right: 10px; font-weight: bold">Video Type:</label>
      <select
        v-model="selectedRecordingVideoType"
        @change="handleVideoTypeChange"
      >
        <option value="fullDisplay">
          Full Display (no background)
        </option>
        <option value="bestDisplay">
          Full Video
        </option>
        <option value="all">
          All
        </option>
      </select>
    </div>
    <hr />

    <!-- Display Type -->
    <div v-if="eventType !== 'broadcast'">
      <label style="margin-right: 10px; font-weight: bold">Display Type:</label>
      <select
        v-model="selectedRecordingDisplayType"
        @change="handleDisplayTypeChange"
      >
        <option value="video">
          Only Video Participants
        </option>
        <option value="videoOpt">
          Only Video Participants (optimized)
        </option>
        <option value="media">
          Participants with media
        </option>
        <option value="all">
          All Participants
        </option>
      </select>
    </div>
    <hr />

    <!-- Background Color -->
    <div>
      <label style="margin-right: 10px; font-weight: bold">Background Color:</label>
      <div
        :style="{
          backgroundColor: recordingBackgroundColor,
          padding: '5px',
          marginBottom: '10px'
        }"
      >
        {{ recordingBackgroundColor }}
      </div>
      <input
        type="color"
        :value="recordingBackgroundColor"
        @input="handleColorChange('backgroundColor', ($event.target as HTMLInputElement).value)"
      />
      <span style="margin-left: 10px; font-weight: bold">Click to select color</span>
    </div>
    <hr />

    <!-- Add Text -->
    <div>
      <label style="margin-right: 10px; font-weight: bold">Add Text:</label>
      <select
        v-model="recordingTextString"
        @change="handleTextChange"
      >
        <option value="true">
          True
        </option>
        <option value="false">
          False
        </option>
      </select>
    </div>
    <hr />

    <!-- Custom Text -->
    <template v-if="recordingText">
      <div>
        <label style="margin-right: 10px; font-weight: bold">Custom Text:</label>
        <input
          v-model="customText"
          type="text"
          @input="onChangeTextHandler"
        />
        <hr />
      </div>
    </template>

    <!-- Custom Text Position -->
    <template v-if="recordingText">
      <div>
        <label style="margin-right: 10px; font-weight: bold">Custom Text Position:</label>
        <select
          v-model="recordingPosition"
          @change="handleTextPositionChange"
        >
          <option value="top">
            Top
          </option>
          <option value="middle">
            Middle
          </option>
          <option value="bottom">
            Bottom
          </option>
        </select>
        <hr />
      </div>
    </template>

    <!-- Custom Text Color -->
    <template v-if="recordingText">
      <div>
        <label style="margin-right: 10px; font-weight: bold">Custom Text Color:</label>
        <div
          :style="{
            backgroundColor: recordingCustomTextColor,
            padding: '5px',
            marginBottom: '10px'
          }"
        >
          {{ recordingCustomTextColor }}
        </div>
        <input
          type="color"
          :value="recordingCustomTextColor"
          @input="handleColorChange('customTextColor', ($event.target as HTMLInputElement).value)"
        />
        <span style="margin-left: 10px; font-weight: bold">Click to select color</span>
        <hr />
      </div>
    </template>

    <!-- Add Name Tags -->
    <div>
      <label style="margin-right: 10px; font-weight: bold">Add Name Tags:</label>
      <select
        v-model="selectedRecordingNameTagsString"
        @change="handleNameTagsChange"
      >
        <option value="true">
          True
        </option>
        <option value="false">
          False
        </option>
      </select>
    </div>
    <hr />

    <!-- Name Tags Color -->
    <div>
      <label style="margin-right: 10px; font-weight: bold">Name Tags Color:</label>
      <div
        :style="{
          backgroundColor: recordingNameTagsColor,
          padding: '5px',
          marginBottom: '10px'
        }"
      >
        {{ recordingNameTagsColor }}
      </div>
      <input
        type="color"
        :value="recordingNameTagsColor"
        @input="handleColorChange('nameTagsColor', ($event.target as HTMLInputElement).value)"
      />
      <span style="margin-left: 10px; font-weight: bold">Click to select color</span>
    </div>
    <hr />

    <!-- Orientation (Video) -->
    <div>
      <label style="margin-right: 10px; font-weight: bold">Orientation (Video):</label>
      <select
        v-model="selectedOrientationVideo"
        @change="handleOrientationChange"
      >
        <option value="landscape">
          Landscape
        </option>
        <option value="portrait">
          Portrait
        </option>
        <option value="all">
          All
        </option>
      </select>
    </div>
    <hr />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineOptions } from 'vue'
import type { EventType } from 'mediasfu-shared'

defineOptions({
  name: 'AdvancedPanelComponent'
});

/**
 * Parameters object for the AdvancedPanelComponent
 * @interface AdvancedPanelParameters
 * 
 * @property {string} recordingVideoType - Video recording type ('fullDisplay' | 'bestDisplay' | 'all')
 * @property {'video' | 'media' | 'all'} recordingDisplayType - Display filtering type
 * @property {string} recordingBackgroundColor - Background color hex value (e.g., '#000000')
 * @property {string} recordingNameTagsColor - Name tag background color hex value
 * @property {string} recordingOrientationVideo - Video orientation ('landscape' | 'portrait' | 'all')
 * @property {boolean} recordingNameTags - Whether to show participant name tags
 * @property {boolean} recordingAddText - Whether to add custom text overlay
 * @property {string} recordingCustomText - Custom text overlay content
 * @property {string} recordingCustomTextPosition - Text overlay position ('top' | 'middle' | 'bottom')
 * @property {string} recordingCustomTextColor - Text overlay color hex value
 * @property {(value: string) => void} updateRecordingVideoType - Function to update video type
 * @property {(value: 'video' | 'media' | 'all') => void} updateRecordingDisplayType - Function to update display type
 * @property {(value: string) => void} updateRecordingBackgroundColor - Function to update background color
 * @property {(value: string) => void} updateRecordingNameTagsColor - Function to update name tag color
 * @property {(value: string) => void} updateRecordingOrientationVideo - Function to update orientation
 * @property {(value: boolean) => void} updateRecordingNameTags - Function to toggle name tags
 * @property {(value: boolean) => void} updateRecordingAddText - Function to toggle text overlay
 * @property {(value: string) => void} updateRecordingCustomText - Function to update custom text
 * @property {(value: string) => void} updateRecordingCustomTextPosition - Function to update text position
 * @property {(value: string) => void} updateRecordingCustomTextColor - Function to update text color
 * @property {EventType} eventType - Event type ('conference' | 'webinar' | 'broadcast' | 'chat')
 * 
 * @example
 * ```ts
 * const advancedPanelParams = {
 *   // recordingVideoType: 'bestDisplay',
 *   // recordingDisplayType: 'video',
 *   // recordingBackgroundColor: '#1a1a1a',
 *   // recordingNameTagsColor: '#0088ff',
 *   // recordingOrientationVideo: 'landscape',
 *   // recordingNameTags: true,
 *   // recordingAddText: true,
 *   // recordingCustomText: 'Company Training Session',
 *   // recordingCustomTextPosition: 'bottom',
 *   // recordingCustomTextColor: '#ffcc00',
 *   // updateRecordingVideoType: (value) => { videoType.value = value; },
 *   // updateRecordingDisplayType: (value) => { displayType.value = value; },
 *   // updateRecordingBackgroundColor: (value) => { bgColor.value = value; },
 *   // updateRecordingNameTagsColor: (value) => { nameTagColor.value = value; },
 *   // updateRecordingOrientationVideo: (value) => { orientation.value = value; },
 *   // updateRecordingNameTags: (value) => { nameTags.value = value; },
 *   // updateRecordingAddText: (value) => { addText.value = value; },
 *   // updateRecordingCustomText: (value) => { customText.value = value; },
 *   // updateRecordingCustomTextPosition: (value) => { textPosition.value = value; },
 *   // updateRecordingCustomTextColor: (value) => { textColor.value = value; },
 *   // eventType: 'webinar'
 * };
 * ```
 */
export interface AdvancedPanelParameters {
  recordingVideoType: string
  recordingDisplayType: 'video' | 'media' | 'all'
  recordingBackgroundColor: string
  recordingNameTagsColor: string
  recordingOrientationVideo: string
  recordingNameTags: boolean
  recordingAddText: boolean
  recordingCustomText: string
  recordingCustomTextPosition: string
  recordingCustomTextColor: string
  updateRecordingVideoType: (value: string) => void
  updateRecordingDisplayType: (value: 'video' | 'media' | 'all') => void
  updateRecordingBackgroundColor: (value: string) => void
  updateRecordingNameTagsColor: (value: string) => void
  updateRecordingOrientationVideo: (value: string) => void
  updateRecordingNameTags: (value: boolean) => void
  updateRecordingAddText: (value: boolean) => void
  updateRecordingCustomText: (value: string) => void
  updateRecordingCustomTextPosition: (value: string) => void
  updateRecordingCustomTextColor: (value: string) => void
  eventType: EventType
}

/**
 * Props for the AdvancedPanelComponent
 * @interface AdvancedPanelProps
 * 
 * @property {AdvancedPanelParameters} parameters - Parameters object with advanced recording settings and update functions
 * 
 * @default parameters - No default (required)
 */
export interface AdvancedPanelProps {
  parameters: AdvancedPanelParameters
}

const props = defineProps<AdvancedPanelProps>()

const selectedOrientationVideo = ref(props.parameters.recordingOrientationVideo)
const selectedRecordingNameTags = ref(props.parameters.recordingNameTags)
const selectedRecordingVideoType = ref(props.parameters.recordingVideoType)
const selectedRecordingDisplayType = ref(props.parameters.recordingDisplayType)
const recordingText = ref(props.parameters.recordingAddText)
const customText = ref(props.parameters.recordingCustomText)
const recordingPosition = ref(props.parameters.recordingCustomTextPosition)

const recordingTextString = computed({
  get: () => recordingText.value.toString(),
  set: (value: string) => {
    recordingText.value = value === 'true'
  }
})

const selectedRecordingNameTagsString = computed({
  get: () => selectedRecordingNameTags.value.toString(),
  set: (value: string) => {
    selectedRecordingNameTags.value = value === 'true'
  }
})

const eventType = computed(() => props.parameters.eventType)
const recordingBackgroundColor = computed(() => props.parameters.recordingBackgroundColor)
const recordingNameTagsColor = computed(() => props.parameters.recordingNameTagsColor)
const recordingCustomTextColor = computed(() => props.parameters.recordingCustomTextColor)

// Watch for external changes to orientation
watch(() => props.parameters.recordingOrientationVideo, (newValue) => {
  selectedOrientationVideo.value = newValue
})

const validateTextInput = (input: string): boolean => {
  const regex = /^[a-zA-Z0-9\s]{1,40}$/
  return regex.test(input)
}

const handleTextChange = () => {
  props.parameters.updateRecordingAddText(recordingText.value)
}

const onChangeTextHandler = () => {
  const text = customText.value
  if (text.length === 0 || validateTextInput(text)) {
    props.parameters.updateRecordingCustomText(text)
  } else {
    // Revert to previous valid value
    customText.value = props.parameters.recordingCustomText
  }
}

const handleColorChange = (selectedColor: string, color: string) => {
  switch (selectedColor) {
    case 'backgroundColor':
      props.parameters.updateRecordingBackgroundColor(color)
      break
    case 'customTextColor':
      props.parameters.updateRecordingCustomTextColor(color)
      break
    case 'nameTagsColor':
      props.parameters.updateRecordingNameTagsColor(color)
      break
    default:
      break
  }
}

const handleVideoTypeChange = () => {
  props.parameters.updateRecordingVideoType(selectedRecordingVideoType.value)
}

const handleDisplayTypeChange = () => {
  props.parameters.updateRecordingDisplayType(selectedRecordingDisplayType.value)
}

const handleTextPositionChange = () => {
  props.parameters.updateRecordingCustomTextPosition(recordingPosition.value)
}

const handleNameTagsChange = () => {
  props.parameters.updateRecordingNameTags(selectedRecordingNameTags.value)
}

const handleOrientationChange = () => {
  props.parameters.updateRecordingOrientationVideo(selectedOrientationVideo.value)
}
</script>
