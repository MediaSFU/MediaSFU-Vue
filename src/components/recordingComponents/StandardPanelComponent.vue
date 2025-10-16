<!--
/**
 * @fileoverview StandardPanelComponent - Basic recording configuration panel
 * @component StandardPanelComponent
 * @module components/recordingComponents/StandardPanelComponent
 * 
 * @description
 * A basic recording configuration panel providing essential recording options for standard
 * use cases. Features dropdown selectors for media type (video/audio), specific audio sources
 * (all/onScreen/host), specific video sources (all/mainScreen), and HLS output option. Designed
 * for simple recording workflows without advanced customization needs.
 * 
 * Key Features:
 * - **Media Options**: Record video or audio only
 * - **Specific Audios**: Select which audio sources to include (all/on-screen/host-only)
 * - **Specific Videos**: Select which video sources to include (all/main-screen)
 * - **Add HLS**: Enable/disable HLS (HTTP Live Streaming) output format
 * - Event type awareness (broadcast mode hides audio/video specific options)
 * - Dropdown selectors for easy configuration
 * - Immediate state updates on selection change
 * - Horizontal rule separators for visual organization
 * 
 * Recording Options:
 * - **Media Options**:
 *   - `video`: Record both audio and video
 *   - `audio`: Record audio only (no video)
 * 
 * - **Specific Audios** (hidden for broadcast events):
 *   - `all`: Include audio from all participants
 *   - `onScreen`: Include audio only from visible participants
 *   - `host`: Include only host audio
 * 
 * - **Specific Videos** (hidden for broadcast events):
 *   - `all`: Include all participant videos
 *   - `mainScreen`: Include only main screen content (includes screenshare)
 * 
 * - **Add HLS**:
 *   - `true`: Generate HLS output for streaming compatibility
 *   - `false`: Standard recording output only
 * 
 * Workflow:
 * 1. Component displays dropdown selectors with current recording settings
 * 2. User selects media option (video/audio) → updateRecordingMediaOptions called
 * 3. User selects audio option (all/onScreen/host) → updateRecordingAudioOptions called
 * 4. User selects video option (all/mainScreen) → updateRecordingVideoOptions called
 * 5. User selects HLS option (true/false) → updateRecordingAddHLS called
 * 6. Parent component (RecordingModal) receives updated settings
 * 7. Settings applied when recording starts
 * 
 * @example Basic Usage
 * ```typescript
 * // <StandardPanelComponent
 *   // :parameters="{
 *     recordingMediaOptions: 'video',
 *     recordingAudioOptions: 'all',
 *     recordingVideoOptions: 'all',
 *     recordingAddHLS: false,
 *     updateRecordingMediaOptions: setMediaOptions,
 *     updateRecordingAudioOptions: setAudioOptions,
 *     updateRecordingVideoOptions: setVideoOptions,
 *     updateRecordingAddHLS: setAddHLS,
 *     eventType: 'conference'
 *   }"
 * // />
 * ```
 * 
 * @example Broadcast Event (Audio/Video Options Hidden)
 * ```typescript
 * // <StandardPanelComponent
 *   // :parameters="{
 *     recordingMediaOptions: 'video',
 *     recordingAudioOptions: 'all',
 *     recordingVideoOptions: 'all',
 *     recordingAddHLS: true,
 *     updateRecordingMediaOptions: setMediaOptions,
 *     updateRecordingAudioOptions: setAudioOptions,
 *     updateRecordingVideoOptions: setVideoOptions,
 *     updateRecordingAddHLS: setAddHLS,
 *     eventType: 'broadcast'
 *   }"
 * // />
 * ```
 * 
 * @example With State Management
 * ```typescript
 * // <script setup>
 * import { ref } from 'vue';
 * 
 * const recordingSettings = ref({
 *   // mediaOptions: 'video',
 *   // audioOptions: 'onScreen',
 *   // videoOptions: 'mainScreen',
 *   // addHLS: false
 * });
 * 
 * const updateMediaOptions = (value) => {
 *   // recordingSettings.value.mediaOptions = value;
 *   // console.log('Media options:', value);
 * };
 * 
 * const updateAudioOptions = (value) => {
 *   // recordingSettings.value.audioOptions = value;
 *   // console.log('Audio options:', value);
 * };
 * 
 * const updateVideoOptions = (value) => {
 *   // recordingSettings.value.videoOptions = value;
 *   // console.log('Video options:', value);
 * };
 * 
 * const updateAddHLS = (value) => {
 *   // recordingSettings.value.addHLS = value;
 *   // console.log('Add HLS:', value);
 * };
 * </script>
 * 
 * // <template>
 *   <StandardPanelComponent
 *     :parameters="{
 *       recordingMediaOptions: recordingSettings.mediaOptions,
 *       recordingAudioOptions: recordingSettings.audioOptions,
 *       recordingVideoOptions: recordingSettings.videoOptions,
 *       recordingAddHLS: recordingSettings.addHLS,
 *       updateRecordingMediaOptions: updateMediaOptions,
 *       updateRecordingAudioOptions: updateAudioOptions,
 *       updateRecordingVideoOptions: updateVideoOptions,
 *       updateRecordingAddHLS: updateAddHLS,
 *       eventType: 'webinar'
 *     }"
 *   />
 * </template>
 * ```
 * 
 * @see {@link RecordingModal} for main recording interface
 * @see {@link AdvancedPanelComponent} for advanced recording options
 * @see {@link https://mediasfu.com/docs/recording} for recording documentation
 */
-->
<template>
  <div>
    <!-- Media Options -->
    <div>
      <label style="margin-right: 10px; font-weight: bold">Media Options:</label>
      <select
        v-model="selectedRecordingMediaOptions"
        @change="handleMediaOptionsChange"
      >
        <option value="video">
          Record Video
        </option>
        <option value="audio">
          Record Audio Only
        </option>
      </select>
    </div>
    <hr />

    <!-- Specific Audios -->
    <template v-if="eventType !== 'broadcast'">
      <div>
        <label style="margin-right: 10px; font-weight: bold">Specific Audios:</label>
        <select
          v-model="selectedRecordingAudioOptions"
          @change="handleAudioOptionsChange"
        >
          <option value="all">
            Add All
          </option>
          <option value="onScreen">
            Add All On Screen
          </option>
          <option value="host">
            Add Host Only
          </option>
        </select>
      </div>
      <hr />

      <!-- Specific Videos -->
      <div id="conditionalConference">
        <label style="margin-right: 10px; font-weight: bold">Specific Videos:</label>
        <select
          v-model="selectedRecordingVideoOptions"
          @change="handleVideoOptionsChange"
        >
          <option value="all">
            Add All
          </option>
          <option value="mainScreen">
            Big Screen Only (includes screenshare)
          </option>
        </select>
      </div>
      <hr />
    </template>

    <!-- Add HLS -->
    <div id="addHLSPart">
      <label style="margin-right: 10px; font-weight: bold">Add HLS:</label>
      <select
        v-model="selectedRecordingAddHLSString"
        @change="handleAddHLSChange"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineOptions } from 'vue'
import type { EventType } from 'mediasfu-shared'

defineOptions({
  name: 'StandardPanelComponent'
});

/**
 * Parameters object for the StandardPanelComponent
 * @interface StandardPanelParameters
 * 
 * @property {string} recordingMediaOptions - Current media recording option ('video' | 'audio')
 * @property {string} recordingAudioOptions - Current audio source option ('all' | 'onScreen' | 'host')
 * @property {string} recordingVideoOptions - Current video source option ('all' | 'mainScreen')
 * @property {boolean} recordingAddHLS - Whether to add HLS output format
 * @property {(value: string) => void} updateRecordingMediaOptions - Function to update media options
 * @property {(value: string) => void} updateRecordingAudioOptions - Function to update audio options
 * @property {(value: string) => void} updateRecordingVideoOptions - Function to update video options
 * @property {(value: boolean) => void} updateRecordingAddHLS - Function to update HLS option
 * @property {EventType} eventType - Event type ('conference' | 'webinar' | 'broadcast' | 'chat')
 * 
 * @example
 * ```ts
 * const standardPanelParams = {
 *   // recordingMediaOptions: 'video',
 *   // recordingAudioOptions: 'onScreen',
 *   // recordingVideoOptions: 'mainScreen',
 *   // recordingAddHLS: false,
 *   // updateRecordingMediaOptions: (value) => {
 *     recordingMediaOptions.value = value;
 *   },
 *   // updateRecordingAudioOptions: (value) => {
 *     recordingAudioOptions.value = value;
 *   },
 *   // updateRecordingVideoOptions: (value) => {
 *     recordingVideoOptions.value = value;
 *   },
 *   // updateRecordingAddHLS: (value) => {
 *     recordingAddHLS.value = value;
 *   },
 *   // eventType: 'conference'
 * };
 * ```
 */
export interface StandardPanelParameters {
  recordingMediaOptions: string
  recordingAudioOptions: string
  recordingVideoOptions: string
  recordingAddHLS: boolean
  updateRecordingMediaOptions: (value: string) => void
  updateRecordingAudioOptions: (value: string) => void
  updateRecordingVideoOptions: (value: string) => void
  updateRecordingAddHLS: (value: boolean) => void
  eventType: EventType
}

/**
 * Props for the StandardPanelComponent
 * @interface StandardPanelProps
 * 
 * @property {StandardPanelParameters} parameters - Parameters object with recording settings and update functions
 * 
 * @default parameters - No default (required)
 */
export interface StandardPanelProps {
  parameters: StandardPanelParameters
}

const props = defineProps<StandardPanelProps>()

const selectedRecordingMediaOptions = ref(props.parameters.recordingMediaOptions)
const selectedRecordingAudioOptions = ref(props.parameters.recordingAudioOptions)
const selectedRecordingVideoOptions = ref(props.parameters.recordingVideoOptions)
const selectedRecordingAddHLS = ref(props.parameters.recordingAddHLS)

const selectedRecordingAddHLSString = computed({
  get: () => selectedRecordingAddHLS.value.toString(),
  set: (value: string) => {
    selectedRecordingAddHLS.value = value === 'true'
  }
})

const eventType = computed(() => props.parameters.eventType)

const handleMediaOptionsChange = () => {
  props.parameters.updateRecordingMediaOptions(selectedRecordingMediaOptions.value)
}

const handleAudioOptionsChange = () => {
  props.parameters.updateRecordingAudioOptions(selectedRecordingAudioOptions.value)
}

const handleVideoOptionsChange = () => {
  props.parameters.updateRecordingVideoOptions(selectedRecordingVideoOptions.value)
}

const handleAddHLSChange = () => {
  props.parameters.updateRecordingAddHLS(selectedRecordingAddHLS.value)
}
</script>
