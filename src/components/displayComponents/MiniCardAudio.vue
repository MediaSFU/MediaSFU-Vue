<!--
/**
 * @fileoverview MiniCardAudio - Static audio card with waveform for grid layouts
 * @component MiniCardAudio
 * @module components/displayComponents/MiniCardAudio
 * 
 * @description
 * A static (non-draggable) audio card that displays participant name, optional profile
 * image, and animated waveform visualization. Designed for use in grid layouts and
 * participant lists where dragging is not needed. Lighter-weight alternative to MiniAudio
 * with same visual appearance but without drag functionality.
 * 
 * Features:
 * - Animated waveform visualization (9 bars with independent timing)
 * - Optional profile image or background
 * - Participant name overlay with configurable position
 * - Automatic waveform animation lifecycle management
 * - Custom styling support for card, image, and overlay
 * - Rounded image option
 * - No dragging overhead (better for grids with many participants)
 * 
 * Waveform Animation:
 * - 9 bars with independent animation timings (400-487ms cycles)
 * - Bars animate between 1px (inactive) and 16px (active) heights
 * - Continuous animation when showWaveform=true
 * - Automatic cleanup on unmount or showWaveform=false
 * 
 * Use Cases:
 * - Audio-only participant in grid view
 * - Sidebar participant list with audio indicators
 * - Waiting room participant display
 * - Any layout where static cards are preferred
 * 
 * @example Basic Static Audio Card
 * // <MiniCardAudio
 *   // name="Jane Doe"
 *   // :showWaveform="true"
 * // />
 * 
 * @example With Profile Image
 * // <MiniCardAudio
 *   // name="John Smith"
 *   // :showWaveform="true"
 *   // imageSource="https://example.com/avatar.jpg"
 *   // :roundedImage="true"
 * // />
 * 
 * @example Custom Colors and Styling
 * // <MiniCardAudio
 *   // name="Alex Johnson"
 *   // :showWaveform="true"
 *   // imageSource="https://example.com/avatar2.jpg"
 *   // barColor="#22c55e"
 *   // textColor="#ffffff"
 *   // :customStyle="{ 
 *     backgroundColor: 'rgba(0,0,0,0.85)', 
 *     borderRadius: '12px',
 *     border: '2px solid #22c55e'
 *   }"
 * // />
 * 
 * @example With Overlay Positioning
 * // <MiniCardAudio
 *   // name="Sarah Williams"
 *   // :showWaveform="isSpeaking"
 *   // overlayPosition="bottomRight"
 *   // barColor="#3b82f6"
 * // />
 * 
 * @example Custom Image Styling
 * // <MiniCardAudio
 *   // name="Mike Brown"
 *   // :showWaveform="true"
 *   // imageSource="https://example.com/avatar3.jpg"
 *   // :imageStyle="{ 
 *     opacity: 0.8, 
 *     filter: 'blur(1px)' 
 *   }"
 *   // textColor="#fff"
 * // />
 * 
 * @remarks
 * This is a lightweight alternative to MiniAudio designed for grid layouts where dragging
 * is not needed. If you need a draggable audio card, use MiniAudio instead. For video
 * participants, use MiniCard or VideoCard.
 * 
 * Workflow:
 * 1. Component mounts → Initializes waveform state (all bars at 0)
 * 2. showWaveform=true → Starts 9 independent waveform bar animations
 * 3. Each bar cycles between 0 (1px height) and 1 (16px height) at its own timing
 * 4. showWaveform=false → Stops all animations, resets bars to 0
 * 5. Component unmounts → Cleans up all animation timers
 * 
 * @see {@link MiniAudio} - Draggable version with same appearance
 * @see {@link MiniCard} - Static card for video participants
 * @see {@link AudioCard} - Full-featured audio card with controls
 */
-->
<template>
  <div :style="{ ...styles.card, ...customStyle }">
    <img
      v-if="imageSource"
      :src="imageSource"
      :style="{
        ...styles.backgroundImage,
        ...(roundedImage ? styles.roundedImage : {}),
        ...imageStyle,
      }"
      alt="Background"
    />
    <div
      :style="{
        ...overlayPositionStyle,
        ...styles.overlayWeb,
      }"
    >
      <div :style="styles.nameColumn">
        <span :style="{ ...styles.nameText, color: textColor }">{{ name }}</span>
      </div>
      <div :style="styles.waveformWeb">
        <div
          v-for="(animation, index) in waveformAnimations"
          :key="index"
          :style="{
            ...styles.bar,
            height: animation === 0 ? '1px' : '16px',
            backgroundColor: barColor,
          }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, type CSSProperties } from 'vue';
import { getOverlayPosition } from '@legacy/methods/utils/getOverlayPosition';

/**
 * Props for the MiniCardAudio component
 * @interface MiniCardAudioProps
 * 
 * @property {CSSProperties} [customStyle] - Custom CSS styles for the card container
 * @property {string} name - Participant name to display
 * @property {boolean} showWaveform - Whether to show animated waveform (true=animate, false=static)
 * @property {string} [overlayPosition] - Position for name overlay (e.g., 'topLeft', 'bottomRight')
 * @property {string} [barColor='red'] - Color for waveform bars
 * @property {string} [textColor='white'] - Color for participant name text
 * @property {string} [imageSource] - Optional URL for profile image or background
 * @property {boolean} [roundedImage=false] - Whether to apply rounded corners to image
 * @property {CSSProperties} [imageStyle] - Custom CSS styles for image element
 * 
 * @default barColor - 'red'
 * @default textColor - 'white'
 * @default roundedImage - false
 * 
 * @example
 * ```typescript
 * // <MiniCardAudio
 *   // name="Jane Smith"
 *   // :showWaveform="true"
 *   // imageSource="https://example.com/avatar.jpg"
 *   // :roundedImage="true"
 *   // barColor="#22c55e"
 *   // textColor="#ffffff"
 *   // overlayPosition="bottomLeft"
 *   // :customStyle="{ backgroundColor: '#1a1a1a', borderRadius: '8px' }"
 * // />
 * ```
 */
export interface MiniCardAudioProps {
  customStyle?: CSSProperties;
  name: string;
  showWaveform: boolean;
  overlayPosition?: string;
  barColor?: string;
  textColor?: string;
  imageSource?: string;
  roundedImage?: boolean;
  imageStyle?: CSSProperties;
}

const props = withDefaults(defineProps<MiniCardAudioProps>(), {
  barColor: 'white',
  textColor: 'white',
  roundedImage: false,
});

const waveformAnimations = ref<number[]>(Array.from({ length: 9 }, () => 0));
const intervals = ref<number[]>([]);

const getAnimationDuration = (index: number): number => {
  const durations = [474, 433, 407, 458, 400, 427, 441, 419, 487];
  return durations[index] || 0;
};

const animateWaveform = () => {
  intervals.value.forEach(clearInterval);
  intervals.value = [];

  waveformAnimations.value.forEach((_, index) => {
    const interval = window.setInterval(() => {
      if (waveformAnimations.value[index] !== undefined) {
        waveformAnimations.value[index] = (waveformAnimations.value[index]! + 1) % 2;
      }
    }, getAnimationDuration(index));
    intervals.value.push(interval);
  });
};

const resetWaveform = () => {
  intervals.value.forEach(clearInterval);
  intervals.value = [];
  waveformAnimations.value = Array.from({ length: 9 }, () => 0);
};

watch(
  () => props.showWaveform,
  (newValue) => {
    if (newValue) {
      animateWaveform();
    } else {
      resetWaveform();
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  resetWaveform();
});

const overlayPositionStyle = computed(() => getOverlayPosition({ position: props.overlayPosition! }));

const styles: Record<string, CSSProperties> = {
  card: {
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    backgroundColor: '#2c678f',
    position: 'relative',
  },
  overlayWeb: {
    position: 'absolute',
    minWidth: '50%',
    minHeight: '5%',
    maxHeight: '100%',
    display: 'grid',
    gridTemplateColumns: '4fr 2fr',
    gridGap: '3px',
  },
  nameColumn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: '5px',
    paddingBottom: '5px',
    paddingLeft: '10px',
    paddingRight: '10px',
    marginRight: '2px',
    fontSize: '14px',
    display: 'flex',
  },
  nameText: {
    fontSize: '14px',
    color: 'white',
  },
  waveformWeb: {
    display: 'flex',
    justifyContent: 'left',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 0,
    flexDirection: 'row',
  },
  bar: {
    flex: 1,
    opacity: 0.35,
    marginLeft: '1px',
    marginRight: '1px',
  },
  backgroundImage: {
    position: 'absolute',
    width: '80px',
    height: '80px',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    top: '50%',
    left: '50%',
    transform: 'translate(-40px, -40px)',
  },
  roundedImage: {
    borderRadius: '20px',
  },
};
</script>

<style scoped>
/* Component-specific styles */
</style>
