<!--
/**
 * @fileoverview Screenboard - Real-time canvas annotation overlay for screen sharing
 * @component Screenboard
 * @module components/screenboardComponents/Screenboard
 * 
 * @description
 * A lightweight canvas annotation tool that overlays on top of shared screen streams, allowing
 * users to draw, annotate, and highlight content during screen sharing sessions. Designed for
 * webinars, presentations, and collaborative sessions where visual annotations enhance communication.
 * Features include freehand drawing, shapes, text, and color selection with a compact toolbar that
 * doesn't obstruct the shared content.
 * 
 * Key Features:
 * - **Annotation Toggle**: Enable/disable annotation mode during screen sharing
 * - **Drawing Tools**: Freehand brush, line drawing with adjustable thickness
 * - **Shape Library**: Rectangle, circle, line for quick annotations
 * - **Text Tool**: Add text annotations with font and size options
 * - **Color Picker**: Full RGB color selection for annotations
 * - **Erase Mode**: Remove specific annotations or clear entire canvas
 * - **Compact Toolbar**: Minimal UI that doesn't block shared content
 * - **Toolbar Toggle**: Show/hide toolbar to maximize viewing area
 * - **Line Styles**: Solid, dashed, dotted line types
 * - **Undo/Redo**: Full history management for annotation actions
 * - **Canvas Overlay**: Transparent background preserves screen share visibility
 * - **Responsive Size**: Automatically fits screen share dimensions
 * 
 * Drawing Modes:
 * - **draw**: Straight line drawing with adjustable thickness (1-50px)
 * - **freehand**: Free-form brush drawing with adjustable thickness (1-50px)
 * - **shape**: Shape insertion (rectangle, circle, line)
 * - **text**: Text annotation with font and size customization
 * - **erase**: Remove specific annotations
 * - **pan**: Navigate large canvases
 * 
 * Use Cases:
 * - **Presentations**: Highlight key points on slides during webinars
 * - **Training**: Circle and annotate specific UI elements during demos
 * - **Collaboration**: Draw diagrams and notes on shared documents
 * - **Instruction**: Point out details in shared code or designs
 * - **Q&A Sessions**: Emphasize answers on shared content
 * 
 * Workflow:
 * 1. User starts screen sharing → Screenboard component activates
 * 2. User clicks annotation button (pencil icon) → annotation mode enabled
 * 3. Toolbar appears with drawing tools → user selects tool (brush, shape, text, etc.)
 * 4. User draws on canvas overlay → annotations appear over shared screen
 * 5. Annotations are visible to all participants viewing the screen share
 * 6. User can toggle toolbar visibility to maximize viewing area
 * 7. User can undo/redo annotations or clear entire canvas
 * 8. User clicks annotation button again → annotation mode disabled
 * 
 * @example Basic Usage - Screen Share with Annotation
 * ```typescript
 * // <Screenboard
 *   // :customWidth="1920"
 *   // :customHeight="1080"
 *   // :parameters="{
 *     updateCanvasScreenboard: setCanvasRef,
 *     annotateScreenStream: true,
 *     updateIsScreenboardModalVisible: setModalVisible,
 *     showAlert: alertFunction,
 *     sleep: sleepFunction,
 *     updateAnnotateScreenStream: setAnnotateState
 *   }"
 *   // :showAspect="shared && annotateScreenStream"
 * // />
 * ```
 * 
 * @example Conditional Display - Show Only During Screen Share
 * ```typescript
 * // <component
 *   // :is="ScreenboardComponent"
 *   // v-if="shared"
 *   // :customWidth="componentSizes.mainWidth"
 *   // :customHeight="componentSizes.mainHeight"
 *   // :parameters="screenboardParameters"
 *   // :showAspect="shared"
 * // />
 * ```
 * 
 * @example With Custom Dimensions
 * ```typescript
 * // <Screenboard
 *   // :customWidth="1280"
 *   // :customHeight="720"
 *   // :parameters="{
 *     updateCanvasScreenboard: (canvas) => { canvasRef.value = canvas; },
 *     annotateScreenStream: annotationEnabled,
 *     updateIsScreenboardModalVisible: (visible) => { modalVisible.value = visible; },
 *     showAlert: (alert) => console.log(alert.message),
 *     sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
 *     updateAnnotateScreenStream: (state) => { annotateState.value = state; }
 *   }"
 *   // :showAspect="true"
 * // />
 * ```
 * 
 * @example Programmatic Annotation Control
 * ```typescript
 * // <script setup>
 * import { ref } from 'vue';
 * 
 * const annotateScreenStream = ref(false);
 * const canvasScreenboard = ref(null);
 * 
 * const enableAnnotation = () => {
 *   // annotateScreenStream.value = true;
 *   // console.log('Annotation mode enabled');
 * };
 * 
 * const disableAnnotation = () => {
 *   // annotateScreenStream.value = false;
 *   // console.log('Annotation mode disabled');
 * };
 * 
 * const clearAnnotations = () => {
 *   // if (canvasScreenboard.value) {
 *     const ctx = canvasScreenboard.value.getContext('2d');
 *     ctx.clearRect(0, 0, canvasScreenboard.value.width, canvasScreenboard.value.height);
 *   }
 * };
 * </script>
 * 
 * // <template>
 *   <div>
 *     <button @click="enableAnnotation">Enable Annotations</button>
 *     <button @click="disableAnnotation">Disable Annotations</button>
 *     <button @click="clearAnnotations">Clear Canvas</button>
 *     
 *     <Screenboard
 *       :customWidth="1920"
 *       :customHeight="1080"
 *       :parameters="{
 *         updateCanvasScreenboard: (canvas) => { canvasScreenboard = canvas; },
 *         annotateScreenStream: annotateScreenStream,
 *         updateIsScreenboardModalVisible: setModalVisible,
 *         showAlert: showAlert,
 *         sleep: sleep,
 *         updateAnnotateScreenStream: (state) => { annotateScreenStream.value = state; }
 *       }"
 *       :showAspect="true"
 *     />
 *   </div>
 * </template>
 * ```
 * 
 * @see {@link ScreenboardModal} for screenboard configuration UI
 * @see {@link Whiteboard} for full collaborative whiteboard features
 * @see {@link https://mediasfu.com/docs/screenboard} for screenboard documentation
 */
-->
<template>
  <div
    id="screenboard-interface"
    ref="screenboardRef"
    :style="{
      position: 'relative',
      display: showAspect ? 'flex' : 'none',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
      zIndex: 1000,
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      maxHeight: '100%',
      overflow: 'auto',
    }"
  >
    <div
      id="screenboardContent"
      ref="screenboardContentRef"
      :style="{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
        top: 0,
        left: 0,
      }"
    >
      <button
        id="annotateScreen"
        class="btn btn-primary btnBoardScreen annotateScreenBtn"
        :style="{
          position: 'absolute',
          top: '5px',
          right: '10px',
          zIndex: 1000,
        }"
        @click="toggleAnnotate"
      >
        <font-awesome-icon
          :icon="faPencilAlt"
          :color="annotateScreenStream ? 'red' : 'green'"
        />
      </button>

      <button
        v-if="annotateScreenStream"
        id="toolbarToggleScreen"
        class="btn btnBoardScreen btn-primary"
        :style="{
          position: 'absolute',
          top: '5px',
          right: '55px',
          zIndex: 1000,
        }"
        @click="toggleToolbar"
      >
        <font-awesome-icon :icon="toolbarVisible ? faChevronRight : faChevronLeft" />
      </button>

      <div
        id="toolbarScreen"
        class="toolbarScreen mb-3"
        :style="{
          position: 'absolute',
          top: '5px',
          right: '105px',
          zIndex: 1000,
          backgroundColor: 'transparent',
          display: toolbarVisible ? 'flex' : 'none',
        }"
      >
        <div
          class="btn-group"
          role="group"
        >
          <button
            id="drawModeScreen"
            class="btn btnBoardScreen btn-secondary dropdown-toggle"
            @click="handleDropdownClick('drawModeScreen')"
          >
            <font-awesome-icon :icon="faPencilAlt" />
          </button>
          <div
            v-if="dropdownOpen === 'drawModeScreen'"
            :class="['dropdown-menu', dropdownOpen ? 'show' : '']"
          >
            <button
              v-for="(item, index) in drawItems"
              :key="index"
              class="dropdown-item"
              :style="{ padding: '5px' }"
              @click="handleItemClick(() => setLineThickness(item.value), 'draw')"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <div
          class="btn-group"
          role="group"
        >
          <button
            id="freehandModeScreen"
            class="btn btnBoardScreen btn-dark dropdown-toggle"
            @click="handleDropdownClick('freehandModeScreen')"
          >
            <font-awesome-icon :icon="faPaintBrush" />
          </button>
          <div
            v-if="dropdownOpen === 'freehandModeScreen'"
            :class="['dropdown-menu', dropdownOpen ? 'show' : '']"
          >
            <button
              v-for="(item, index) in brushItems"
              :key="index"
              class="dropdown-item"
              :style="{ padding: '5px' }"
              @click="handleItemClick(() => setBrushThickness(item.value), 'freehand')"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <div
          class="btn-group"
          role="group"
        >
          <button
            id="shapeModeScreen"
            class="btn btnBoardScreen btn-dark dropdown-toggle"
            @click="handleDropdownClick('shapeModeScreen')"
          >
            <font-awesome-icon :icon="faShapes" />
          </button>
          <div
            v-if="dropdownOpen === 'shapeModeScreen'"
            :class="['dropdown-menu', dropdownOpen ? 'show' : '']"
          >
            <button
              v-for="(item, index) in shapeItems"
              :key="index"
              class="dropdown-item"
              :style="{ padding: '5px' }"
              @click="handleItemClick(() => setShape(item.value), 'shape')"
            >
              <img
                v-if="item.src"
                :src="item.src"
                :alt="item.alt"
                class="shape-icon"
              />
            </button>
          </div>
        </div>

        <div
          class="btn-group"
          role="group"
        >
          <button
            id="eraseModeScreen"
            class="btn btnBoardScreen btn-danger dropdown-toggle"
            @click="handleDropdownClick('eraseModeScreen')"
          >
            <font-awesome-icon :icon="faEraser" />
          </button>
          <div
            v-if="dropdownOpen === 'eraseModeScreen'"
            :class="['dropdown-menu', dropdownOpen ? 'show' : '']"
          >
            <button
              v-for="(item, index) in eraserItems"
              :key="index"
              class="dropdown-item"
              :style="{ padding: '5px' }"
              @click="handleItemClick(() => setEraserThickness(item.value), 'erase')"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <button
          id="zoomResetScreen"
          class="btn btnBoard btn-success"
          :style="{ display: 'none' }"
        >
          <font-awesome-icon :icon="faSearch" />
        </button>

        <label for="colorPickerScreen"></label>
        <input
          id="colorPickerScreen"
          v-model="color"
          type="color"
          class="btn"
        />

        <label for="lineTypePickerScreen"></label>
        <select
          id="lineTypePickerScreen"
          v-model="lineType"
          class="custom-select"
          :style="{ width: 'auto' }"
        >
          <option value="solid">
            Solid
          </option>
          <option value="dashed">
            Dashed
          </option>
          <option value="dotted">
            Dotted
          </option>
          <option value="dashDot">
            Dash-Dot
          </option>
        </select>
      </div>

      <canvas
        id="screenboardCanvas"
        ref="canvasRef"
        width="1280"
        height="720"
        :style="{
          padding: 0,
          margin: 0,
          display: annotateScreenStream ? 'block' : 'none',
        }"
      ></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faChevronRight,
  faChevronLeft,
  faPencilAlt,
  faPaintBrush,
  faShapes,
  faEraser,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import './Screenboard.css';
import type { ShowAlert, SleepType } from '../../../../SharedTypes';

/**
 * Parameters object for the Screenboard component
 * @interface ScreenboardParameters
 * 
 * @property {(canvas: HTMLCanvasElement | null) => void} updateCanvasScreenboard - Function to update canvas reference
 * @property {boolean} annotateScreenStream - Whether annotation mode is currently active
 * @property {(visible: boolean) => void} updateIsScreenboardModalVisible - Function to control screenboard modal visibility
 * @property {ShowAlert} [showAlert] - Alert function for user feedback messages
 * @property {SleepType} sleep - Sleep/delay function for async operations
 * @property {(annotate: boolean) => void} updateAnnotateScreenStream - Function to update annotation state
 * 
 * @example
 * ```ts
 * const screenboardParams = {
 *   // updateCanvasScreenboard: (canvas) => {
 *     canvasScreenboard.value = canvas;
 *     if (canvas) console.log('Canvas ready:', canvas.width, canvas.height);
 *   },
 *   // annotateScreenStream: true,
 *   // updateIsScreenboardModalVisible: (visible) => {
 *     isScreenboardModalVisible.value = visible;
 *   },
 *   // showAlert: (alert) => {
 *     console.log(`[${alert.type}] ${alert.message}`);
 *   },
 *   // sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
 *   // updateAnnotateScreenStream: (annotate) => {
 *     annotateScreenStream.value = annotate;
 *     if (annotate) console.log('Annotation enabled');
 *     else console.log('Annotation disabled');
 *   }
 * };
 * ```
 */
export interface ScreenboardParameters {
  updateCanvasScreenboard: (canvas: HTMLCanvasElement | null) => void;
  annotateScreenStream: boolean;
  updateIsScreenboardModalVisible: (visible: boolean) => void;
  showAlert?: ShowAlert;
  sleep: SleepType;
  updateAnnotateScreenStream: (annotate: boolean) => void;
  [key: string]: unknown;
}

/**
 * Props for the Screenboard component
 * @interface ScreenboardProps
 * 
 * @property {number} customWidth - Width of the screenboard canvas in pixels (should match screen share width)
 * @property {number} customHeight - Height of the screenboard canvas in pixels (should match screen share height)
 * @property {ScreenboardParameters} parameters - Parameters object with state and callback functions
 * @property {boolean} showAspect - Whether to display the screenboard (typically true during screen sharing)
 * 
 * @example
 * ```ts
 * const screenboardProps = {
 *   // customWidth: 1920,
 *   // customHeight: 1080,
 *   // parameters: {
 *     updateCanvasScreenboard: setCanvasRef,
 *     annotateScreenStream: true,
 *     updateIsScreenboardModalVisible: setModalVisible,
 *     showAlert: alertFunction,
 *     sleep: sleepFunction,
 *     updateAnnotateScreenStream: setAnnotateState
 *   },
 *   // showAspect: shared && annotateScreenStream
 * };
 * ```
 * 
 * @default customWidth - No default (required)
 * @default customHeight - No default (required)
 * @default parameters - No default (required)
 * @default showAspect - No default (required)
 */
export interface ScreenboardProps {
  customWidth: number;
  customHeight: number;
  parameters: ScreenboardParameters;
  showAspect: boolean;
}

const props = defineProps<ScreenboardProps>();

const {
  updateCanvasScreenboard,
  updateIsScreenboardModalVisible,
  showAlert,
  sleep,
  updateAnnotateScreenStream,
} = props.parameters;

const annotateScreenStream = computed(() => props.parameters.annotateScreenStream);

type Mode = 'draw' | 'freehand' | 'shape' | 'erase';
type LinePattern = 'solid' | 'dashed' | 'dotted' | 'dashDot';
type ShapeName =
  | 'square'
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'hexagon'
  | 'pentagon'
  | 'rhombus'
  | 'octagon'
  | 'parallelogram'
  | 'oval';

interface FreehandPoint {
  x: number;
  y: number;
  color: string;
  thickness: number;
}

interface LineShape {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  thickness: number;
  lineType: LinePattern;
}

interface FreehandShape {
  type: 'freehand';
  points: FreehandPoint[];
  color: string;
  thickness: number;
}

interface TextShape {
  type: 'text';
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

interface PolygonShape {
  type: ShapeName;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  thickness: number;
  lineType: LinePattern;
}

type ShapeItem = LineShape | FreehandShape | TextShape | PolygonShape;

const mode = ref<Mode>('draw');
const isDrawing = ref(false);
const startX = ref(0);
const startY = ref(0);
const currentX = ref(0);
const currentY = ref(0);
const freehandDrawing = ref<FreehandPoint[]>([]);
const shapes = ref<ShapeItem[]>([]);
const eraserThickness = ref(10);
const brushThickness = ref(6);
const lineThickness = ref(6);
const lineType = ref<LinePattern>('solid');
const color = ref('#000000');
const shape = ref<ShapeName | null>(null);
const toolbarVisible = ref(false);
const dropdownOpen = ref<string | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const screenboardRef = ref<HTMLDivElement | null>(null);
const screenboardContentRef = ref<HTMLDivElement | null>(null);

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

const drawItems: Array<{ label: string; value: number }> = [
  { label: 'XX-Small (3px)', value: 3 },
  { label: 'X-Small (6px)', value: 6 },
  { label: 'Small (12px)', value: 12 },
  { label: 'Medium (18px)', value: 18 },
  { label: 'Large (24px)', value: 24 },
  { label: 'X-Large (36px)', value: 36 },
];

const brushItems: Array<{ label: string; value: number }> = [
  { label: 'X-Small (5px)', value: 5 },
  { label: 'Small (10px)', value: 10 },
  { label: 'Medium (20px)', value: 20 },
  { label: 'Large (40px)', value: 40 },
  { label: 'X-Large (60px)', value: 60 },
];

const shapeItems: Array<{ src: string; alt: string; value: ShapeName }> = [
  { src: 'https://mediasfu.com/images/svg/square.svg', alt: 'Square', value: 'square' },
  {
    src: 'https://mediasfu.com/images/svg/rectangle.svg',
    alt: 'Rectangle',
    value: 'rectangle',
  },
  { src: 'https://mediasfu.com/images/svg/circle.svg', alt: 'Circle', value: 'circle' },
  {
    src: 'https://mediasfu.com/images/svg/triangle.svg',
    alt: 'Triangle',
    value: 'triangle',
  },
  { src: 'https://mediasfu.com/images/svg/hexagon.svg', alt: 'Hexagon', value: 'hexagon' },
  {
    src: 'https://mediasfu.com/images/svg/pentagon.svg',
    alt: 'Pentagon',
    value: 'pentagon',
  },
  { src: 'https://mediasfu.com/images/svg/rhombus.svg', alt: 'Rhombus', value: 'rhombus' },
  { src: 'https://mediasfu.com/images/svg/octagon.svg', alt: 'Octagon', value: 'octagon' },
  {
    src: 'https://mediasfu.com/images/svg/parallelogram.svg',
    alt: 'Parallelogram',
    value: 'parallelogram',
  },
  { src: 'https://mediasfu.com/images/svg/oval.svg', alt: 'Oval', value: 'oval' },
];

const eraserItems: Array<{ label: string; value: number }> = [
  { label: 'X-Small (5px)', value: 5 },
  { label: 'Small (10px)', value: 10 },
  { label: 'Medium (20px)', value: 20 },
  { label: 'Large (30px)', value: 30 },
  { label: 'X-Large (60px)', value: 60 },
];

const handleDropdownClick = (id: string) => {
  dropdownOpen.value = dropdownOpen.value === id ? null : id;
};

const setLineThickness = (value: number) => {
  lineThickness.value = value;
};

const setBrushThickness = (value: number) => {
  brushThickness.value = value;
};

const setShape = (value: ShapeName | string) => {
  shape.value = value as ShapeName;
};

const setEraserThickness = (value: number) => {
  eraserThickness.value = value;
};

const handleItemClick = (callback: () => void, name?: Mode) => {
  callback();
  dropdownOpen.value = null;
  if (name) {
    mode.value = name;
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownOpen.value && !(event.target as HTMLElement).closest('.btn-group')) {
    dropdownOpen.value = null;
  }
};

const startDrawing = (e: MouseEvent) => {
  if (!ctx) return;
  isDrawing.value = true;
  startX.value = e.offsetX;
  startY.value = e.offsetY;

  if (mode.value === 'erase') {
    erase(e.offsetX, e.offsetY);
  } else if (mode.value === 'draw' || mode.value === 'freehand') {
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
    if (mode.value === 'freehand') {
      freehandDrawing.value = [
        {
          x: e.offsetX,
          y: e.offsetY,
          color: color.value,
          thickness: brushThickness.value,
        },
      ];
    }
  }
};

const draw = (e: MouseEvent) => {
  if (!ctx || !isDrawing.value) return;

  currentX.value = e.offsetX;
  currentY.value = e.offsetY;

  if (mode.value === 'erase') {
    erase(e.offsetX, e.offsetY);
  } else if (mode.value === 'draw') {
    ctx.clearRect(0, 0, canvas?.width ?? 0, canvas?.height ?? 0);
    drawShapes();
    drawLine(
      startX.value,
      startY.value,
      e.offsetX,
      e.offsetY,
      color.value,
      lineThickness.value,
      lineType.value
    );
  } else if (mode.value === 'freehand') {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = color.value;
    ctx.lineWidth = brushThickness.value;
    ctx.stroke();
    freehandDrawing.value.push({
      x: e.offsetX,
      y: e.offsetY,
      color: color.value,
      thickness: brushThickness.value,
    });
  } else if (mode.value === 'shape') {
    ctx.clearRect(0, 0, canvas?.width ?? 0, canvas?.height ?? 0);
    drawShapes();
    if (shape.value) {
      drawShape(
        shape.value,
        startX.value,
        startY.value,
        e.offsetX,
        e.offsetY,
        color.value,
        lineThickness.value,
        lineType.value
      );
    }
  }
};

const stopDrawing = () => {
  if (!ctx) return;

  isDrawing.value = false;

  if (mode.value === 'draw') {
    shapes.value.push({
      type: 'line',
      x1: startX.value,
      y1: startY.value,
      x2: currentX.value,
      y2: currentY.value,
      color: color.value,
      thickness: lineThickness.value,
      lineType: lineType.value,
    });
  } else if (mode.value === 'freehand') {
    shapes.value.push({
      type: 'freehand',
      points: freehandDrawing.value,
      color: color.value,
      thickness: brushThickness.value,
    });
    freehandDrawing.value = [];
  } else if (mode.value === 'shape' && shape.value) {
    shapes.value.push({
      type: shape.value,
      x1: startX.value,
      y1: startY.value,
      x2: currentX.value,
      y2: currentY.value,
      color: color.value,
      thickness: lineThickness.value,
      lineType: lineType.value,
    });
  }

  setTimeout(() => removeShape(), 15000);
};

const isPointNearLine = (
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  threshold: number
) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const dot = ((px - x1) * dx + (py - y1) * dy) / (length * length);
  const closestX = x1 + dot * dx;
  const closestY = y1 + dot * dy;
  const distance = Math.sqrt(Math.pow(px - closestX, 2) + Math.pow(py - closestY, 2));
  return distance <= threshold;
};

const removeShape = () => {
  try {
    shapes.value.shift();
    drawShapes();
  } catch {
    // Do nothing
  }
};

const erase = (x: number, y: number) => {
  if (!ctx) return;

  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(x, y, eraserThickness.value / 2, 0, Math.PI * 2, false);
  ctx.fill();
  ctx.restore();

  shapes.value = shapes.value
    .map<ShapeItem | null>((shapeItem) => {
      if (shapeItem.type === 'freehand') {
        return {
          ...shapeItem,
          points: shapeItem.points.filter((point: FreehandPoint) => {
            const distance = Math.sqrt(
              Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
            );
            return distance > eraserThickness.value / 2;
          }),
        };
      } else if (shapeItem.type === 'line') {
        if (
          isPointNearLine(
            x,
            y,
            shapeItem.x1,
            shapeItem.y1,
            shapeItem.x2,
            shapeItem.y2,
            eraserThickness.value / 2
          )
        ) {
          return null;
        }
      } else if (shapeItem.type === 'text') {
        const textWidth = ctx!.measureText(shapeItem.text).width;
        if (
          x > shapeItem.x &&
          x < shapeItem.x + textWidth &&
          y > shapeItem.y - shapeItem.fontSize &&
          y < shapeItem.y
        ) {
          return null;
        }
      } else {
        if (
          x > shapeItem.x1 &&
          x < shapeItem.x2 &&
          y > shapeItem.y1 &&
          y < shapeItem.y2
        ) {
          return null;
        }
      }
      return shapeItem;
    })
    .filter((shapeItem): shapeItem is ShapeItem => {
      if (!shapeItem) {
        return false;
      }
      if (shapeItem.type === 'freehand') {
        return shapeItem.points.length > 0;
      }
      return true;
    });
};

const drawShapes = () => {
  const context = ctx;
  if (!context) return;
  context.clearRect(0, 0, canvas?.width ?? 0, canvas?.height ?? 0);
  shapes.value.forEach((shapeItem) => {
    if (shapeItem.type === 'line') {
      drawLine(
        shapeItem.x1,
        shapeItem.y1,
        shapeItem.x2,
        shapeItem.y2,
        shapeItem.color,
        shapeItem.thickness,
        shapeItem.lineType
      );
    } else if (shapeItem.type === 'freehand') {
      drawFreehand(shapeItem.points, shapeItem.color, shapeItem.thickness);
    } else if (shapeItem.type === 'text') {
      context.font = `${shapeItem.fontSize}px Arial`;
      context.fillStyle = shapeItem.color;
      context.fillText(shapeItem.text, shapeItem.x, shapeItem.y);
    } else {
      drawShape(
        shapeItem.type,
        shapeItem.x1,
        shapeItem.y1,
        shapeItem.x2,
        shapeItem.y2,
        shapeItem.color,
        shapeItem.thickness,
        shapeItem.lineType
      );
    }
  });
};

const drawLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  drawColor: string,
  thickness: number,
  type: LinePattern
) => {
  if (!ctx) return;
  ctx.beginPath();
  ctx.strokeStyle = drawColor;
  ctx.lineWidth = thickness;
  if (type === 'dashed') {
    ctx.setLineDash([10, 10]);
  } else if (type === 'dotted') {
    ctx.setLineDash([2, 10]);
  } else if (type === 'dashDot') {
    ctx.setLineDash([10, 5, 2, 5]);
  } else {
    ctx.setLineDash([]);
  }
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
};

const drawFreehand = (
  points: FreehandPoint[],
  drawColor: string,
  thickness: number
) => {
  if (!ctx || points.length < 2 || !points[0]) return;
  ctx.strokeStyle = drawColor;
  ctx.lineWidth = thickness;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    if (point && point.x !== undefined && point.y !== undefined) {
      ctx.lineTo(point.x, point.y);
    }
  }
  ctx.stroke();
};

const drawShape = (
  type: ShapeName,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  drawColor: string,
  thickness: number,
  lineTypeValue: LinePattern
) => {
  if (!ctx) return;
  ctx.beginPath();
  ctx.strokeStyle = drawColor;
  ctx.lineWidth = thickness;
  if (lineTypeValue === 'dashed') {
    ctx.setLineDash([10, 10]);
  } else if (lineTypeValue === 'dotted') {
    ctx.setLineDash([2, 10]);
  } else if (lineTypeValue === 'dashDot') {
    ctx.setLineDash([10, 5, 2, 5]);
  } else {
    ctx.setLineDash([]);
  }

  if (type === 'rectangle') {
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  } else if (type === 'circle') {
    const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
    ctx.stroke();
  } else if (type === 'rhombus') {
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    ctx.moveTo(centerX, y1);
    ctx.lineTo(x2, centerY);
    ctx.lineTo(centerX, y2);
    ctx.lineTo(x1, centerY);
    ctx.closePath();
    ctx.stroke();
  } else if (type === 'pentagon') {
    drawPolygon(5, x1, y1, x2, y2);
  } else if (type === 'hexagon') {
    drawPolygon(6, x1, y1, x2, y2);
  } else if (type === 'triangle') {
    const centerXTriangle = (x1 + x2) / 2;
    ctx.moveTo(centerXTriangle, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x1, y2);
    ctx.closePath();
    ctx.stroke();
  } else if (type === 'square') {
    ctx.strokeRect(x1, y1, x2 - x1, x2 - x1);
  } else if (type === 'octagon') {
    drawPolygon(8, x1, y1, x2, y2);
  } else if (type === 'oval') {
    const radiusX = Math.abs(x2 - x1) / 2;
    const radiusY = Math.abs(y2 - y1) / 2;
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.stroke();
  } else if (type === 'parallelogram') {
    const centerX = (x1 + x2) / 2;
    ctx.moveTo(centerX, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(centerX, y2);
    ctx.lineTo(x1, y1);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.setLineDash([]);
};

const drawPolygon = (sides: number, x1: number, y1: number, x2: number, y2: number) => {
  if (!ctx) return;
  const centerX = (x1 + x2) / 2;
  const centerY = (y1 + y2) / 2;
  const radius = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2;
  const angle = (2 * Math.PI) / sides;
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const x = centerX + radius * Math.cos(i * angle - Math.PI / 2);
    const y = centerY + radius * Math.sin(i * angle - Math.PI / 2);
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();
};

const toggleToolbar = () => {
  toolbarVisible.value = !toolbarVisible.value;
};

const toggleAnnotate = async () => {
  const newAnnotateState = !annotateScreenStream.value;
  updateAnnotateScreenStream(newAnnotateState);
  if (newAnnotateState) {
    toolbarVisible.value = true;
    showAlert?.({
      message: `You can now annotate the screen. If you cannot see your annotation controls (on top), try minimizing your screen by using 'Cmd' + '-' (on Mac) or 'Ctrl' + '-' (on Windows).`,
      type: 'success',
      duration: 9000,
    });
  } else {
    toolbarVisible.value = false;
    dropdownOpen.value = null;
  }

  updateIsScreenboardModalVisible(true);
  await sleep({ ms: 500 });
  updateIsScreenboardModalVisible(false);
};

watch(annotateScreenStream, (newVal) => {
  if (!newVal) {
    toolbarVisible.value = false;
    dropdownOpen.value = null;
  }
});

const handleTouchStart = (e: TouchEvent) => {
  e.preventDefault();
  const touch = e.touches[0];
  if (!touch) return;
  const mouseEvent = new MouseEvent('mousedown', {
    clientX: touch.clientX,
    clientY: touch.clientY,
  });
  canvas?.dispatchEvent(mouseEvent);
};

const handleTouchMove = (e: TouchEvent) => {
  e.preventDefault();
  const touch = e.touches[0];
  if (!touch) return;
  const mouseEvent = new MouseEvent('mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY,
  });
  canvas?.dispatchEvent(mouseEvent);
};

const handleTouchEnd = (e: TouchEvent) => {
  e.preventDefault();
  const mouseEvent = new MouseEvent('mouseup', {});
  canvas?.dispatchEvent(mouseEvent);
};

onMounted(() => {
  if (canvasRef.value) {
    canvas = canvasRef.value;
    ctx = canvas.getContext('2d');
    updateCanvasScreenboard(canvas);
  }

  if (canvas) {
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
  }

  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  if (canvas) {
    canvas.removeEventListener('mousedown', startDrawing);
    canvas.removeEventListener('mousemove', draw);
    canvas.removeEventListener('mouseup', stopDrawing);
    canvas.removeEventListener('mouseout', stopDrawing);

    // Touch events
    canvas.removeEventListener('touchstart', handleTouchStart);
    canvas.removeEventListener('touchmove', handleTouchMove);
    canvas.removeEventListener('touchend', handleTouchEnd);
  }

  document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<script lang="ts">
export default {
  name: 'Screenboard'
}
</script>
