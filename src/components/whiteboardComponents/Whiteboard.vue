<!--
/**
 * @fileoverview Whiteboard - Collaborative real-time whiteboard with drawing tools
 * @component Whiteboard
 * @module components/whiteboardComponents/Whiteboard
 * 
 * @description
 * A feature-rich collaborative whiteboard component with comprehensive drawing tools, real-time
 * synchronization via Socket.io, and Fabric.js canvas rendering. Supports freehand drawing,
 * shapes (rectangle, circle, line, triangle, hexagon, pentagon, polygon, square, octagon),
 * text insertion, image uploads, undo/redo history, and multi-user collaboration with cursor
 * tracking. Includes configurable grid backgrounds, line styles, and extensive customization
 * options for colors, thickness, fonts, and more.
 * 
 * Key Features:
 * - **Drawing Tools**: Freehand brush, line tool with thickness controls (1-50px)
 * - **Shape Library**: 10+ shapes with fill/stroke customization
 * - **Text Tool**: Multiple fonts, sizes (10-100px), colors, and alignment
 * - **Image Upload**: Drag-and-drop or file picker for image insertion
 * - **Undo/Redo**: Full history management with action stack
 * - **Pan Mode**: Navigate large canvases with pan tool
 * - **Erase Mode**: Remove specific objects or clear entire canvas
 * - **Grid Background**: Toggle grid overlay for alignment
 * - **Line Styles**: Solid, dashed, dotted line types
 * - **Multi-user Collaboration**: Real-time shape sync via Socket.io
 * - **Save/Export**: Download canvas as image file
 * - **Zoom Controls**: Zoom in/out with percentage display
 * - **Object Selection**: Select, move, resize, rotate objects
 * - **Color Picker**: Full RGB color selection for shapes and text
 * 
 * Drawing Modes:
 * - **draw**: Line drawing with adjustable thickness
 * - **freehand**: Free-form brush drawing
 * - **shape**: Shape insertion (rectangle, circle, triangle, etc.)
 * - **text**: Text insertion with font customization
 * - **erase**: Object deletion mode
 * - **pan**: Canvas navigation mode
 * - **select**: Object selection and manipulation
 * 
 * Real-time Collaboration:
 * - Socket.io events: 'sendShape', 'receiveShape' for shape synchronization
 * - Participant cursor tracking with name labels
 * - Automatic shape ID generation for conflict-free updates
 * - Host-only whiteboard lock/unlock controls
 * - Participant permission management (can draw, can see shapes)
 * 
 * Workflow:
 * 1. User selects drawing tool from toolbar (pencil, brush, shapes, text, etc.)
 * 2. User draws/types on canvas → shape created with Fabric.js
 * 3. Shape data serialized → Socket.io emits 'sendShape' to room
 * 4. Other participants receive 'receiveShape' → shape rendered on their canvas
 * 5. User can select/modify shapes → updates broadcast via Socket.io
 * 6. Undo/redo operations update local history and broadcast changes
 * 7. Canvas can be saved as image or cleared (with confirmation)
 * 
 * @example Basic Usage - Standalone Whiteboard
 * ```vue
 * <Whiteboard
 *   customWidth="1200"
 *   customHeight="800"
 *   :parameters="{
 *     socket: socketConnection,
 *     roomName: 'room123',
 *     showAlert: alertFunction,
 *     member: 'HostUser',
 *     islevel: '2',
 *     whiteboardStarted: true,
 *     whiteboardEnded: false,
 *     participants: allParticipants,
 *     useImageBackground: false
 *   }"
 *   :showAspect="true"
 * />
 * ```
 * 
 * @example In Main Grid - Conditionally Show Whiteboard
 * ```vue
 * <component
 *   :is="WhiteboardComponent"
 *   :customWidth="componentSizes.mainWidth"
 *   :customHeight="componentSizes.mainHeight"
 *   :parameters="whiteboardParameters"
 *   :showAspect="whiteboardStarted && !whiteboardEnded"
 * />
 * ```
 * 
 * @example With Image Background
 * ```vue
 * <Whiteboard
 *   customWidth="1920"
 *   customHeight="1080"
 *   :parameters="{
 *     socket: socket,
 *     roomName: roomName,
 *     showAlert: showAlert,
 *     member: member,
 *     islevel: islevel,
 *     whiteboardStarted: true,
 *     whiteboardEnded: false,
 *     participants: participants,
 *     useImageBackground: true,
 *     customImage: 'https://example.com/slide.jpg'
 *   }"
 *   :showAspect="true"
 * />
 * ```
 * 
 * @example Host-Only Controls with Whiteboard Lock
 * ```vue
 * <Whiteboard
 *   customWidth="1200"
 *   customHeight="800"
 *   :parameters="{
 *     socket: socket,
 *     roomName: roomName,
 *     showAlert: showAlert,
 *     member: 'HostUser',
 *     islevel: '2',
 *     whiteboardStarted: true,
 *     whiteboardEnded: false,
 *     participants: participants,
 *     useImageBackground: false,
 *     whiteboardUsers: [{
 *       name: 'HostUser',
 *       useBoard: true
 *     }]
 *   }"
 *   :showAspect="true"
 * />
 * // Host can lock/unlock whiteboard to control participant drawing permissions
 * ```
 * 
 * @example Programmatic Shape Addition
 * ```vue
 * <script setup>
 * import { ref } from 'vue';
 * 
 * const whiteboardRef = ref(null);
 * 
 * const addCustomShape = () => {
 *   const shapeData = {
 *     type: 'rect',
 *     left: 100,
 *     top: 100,
 *     width: 200,
 *     height: 150,
 *     fill: '#FF5733',
 *     stroke: '#000000',
 *     strokeWidth: 2
 *   };
 *   
 *   // Emit via Socket.io for real-time sync
 *   socket.emit('sendShape', {
 *     shape: shapeData,
 *     roomName: 'room123'
 *   });
 * };
 * // </script>
 * 
 * // <template>
 * //   <Whiteboard
 * //     ref="whiteboardRef"
 * //     customWidth="1200"
 * //     customHeight="800"
 * //     :parameters="whiteboardParams"
 * //     :showAspect="true"
 * //   />
 * //   <button @click="addCustomShape">Add Rectangle</button>
 * // </template>
 * ```
 * 
 * @see {@link ConfigureWhiteboardModal} for whiteboard configuration UI
 * @see {@link captureCanvasStream} for canvas streaming functionality
 * @see {@link https://mediasfu.com/docs/whiteboard} for comprehensive whiteboard documentation
 * @see {@link http://fabricjs.com/} for Fabric.js canvas library documentation
 */
-->
<template>
  <div
    id="whiteboard-interface"
    :style="{
      position: 'relative',
      display: showAspect ? 'block' : 'none',
      justifyContent: 'center',
      alignItems: 'center',
      border: '2px solid #000',
      backgroundColor: '#f0f0f0',
      width: `${customWidth}px`,
      height: `${customHeight}px`,
    }"
  >
    <div
      id="whiteboardContent"
      :style="{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
        overflow: 'auto',
      }"
    >
      <button
        id="toolbarToggle"
        class="btn btnBoard btn-primary"
        :style="{
          position: 'absolute',
          top: '5px',
          left: '65px',
          zIndex: 1000,
        }"
        @click="toggleToolbar"
      >
        <font-awesome-icon :icon="toolbarVisible ? faChevronLeft : faChevronRight" />
      </button>

      <div
        v-if="toolbarVisible"
        id="toolbar"
        class="toolbar mb-3"
        :style="{
          position: 'absolute',
          top: '5px',
          left: '110px',
          zIndex: 1000,
          backgroundColor: 'transparent',
        }"
      >
        <div
          class="btn-group"
          role="group"
        >
          <button
            id="drawMode"
            class="btn btnBoard btn-secondary dropdown-toggle"
            @click="handleDropdownClick('drawMode')"
          >
            <font-awesome-icon :icon="faPencilAlt" />
          </button>
          <div
            v-if="dropdownOpen === 'drawMode'"
            class="dropdown-menu show"
          >
            <button
              v-for="(item, index) in lineThicknessOptions"
              :key="index"
              class="dropdown-item"
              style="padding: 5px"
              @click="handleItemClick(updateLineThickness, 'draw', item.value)"
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
            id="freehandMode"
            class="btn btnBoard btn-secondary dropdown-toggle"
            @click="handleDropdownClick('freehandMode')"
          >
            <font-awesome-icon :icon="faPaintBrush" />
          </button>
          <div
            v-if="dropdownOpen === 'freehandMode'"
            class="dropdown-menu show"
          >
            <button
              v-for="(item, index) in brushThicknessOptions"
              :key="index"
              class="dropdown-item"
              style="padding: 5px"
              @click="handleItemClick(updateBrushThickness, 'freehand', item.value)"
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
            id="shapeMode"
            class="btn btnBoard btn-secondary dropdown-toggle"
            @click="handleDropdownClick('shapeMode')"
          >
            <font-awesome-icon :icon="faShapes" />
          </button>
          <div
            v-if="dropdownOpen === 'shapeMode'"
            class="dropdown-menu show"
          >
            <button
              v-for="(item, index) in shapeOptions"
              :key="index"
              class="dropdown-item"
              style="padding: 5px"
              @click="handleItemClick(updateShape, 'shape', item.value)"
            >
              <img
                v-if="item.icon"
                :src="item.icon"
                alt="Shape"
                class="shape-icon"
              />
            </button>
          </div>
        </div>

        <button
          id="selectMode"
          class="btn btnBoard btn-secondary"
          @click="changeMode('select')"
        >
          <font-awesome-icon :icon="faMousePointer" />
        </button>

        <div
          class="btn-group"
          role="group"
        >
          <button
            id="eraseMode"
            class="btn btnBoard btn-danger dropdown-toggle"
            @click="handleDropdownClick('eraseMode')"
          >
            <font-awesome-icon :icon="faEraser" />
          </button>
          <div
            v-if="dropdownOpen === 'eraseMode'"
            class="dropdown-menu show"
          >
            <button
              v-for="(item, index) in eraserThicknessOptions"
              :key="index"
              class="dropdown-item"
              style="padding: 5px"
              @click="handleItemClick(updateEraserThickness, 'erase', item.value)"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <button
          id="panMode"
          class="btn btnBoard btn-info"
          @click="changeMode('pan')"
        >
          <font-awesome-icon :icon="faHandPaper" />
        </button>

        <button
          id="zoomIn"
          class="btn btnBoard btn-success"
          @click="(e) => zoomCanvas(1.2, e)"
        >
          <font-awesome-icon :icon="faSearchPlus" />
        </button>

        <button
          id="zoomReset"
          class="btn btnBoard btn-success"
          @click="(e) => zoomCanvas(10, e)"
        >
          <font-awesome-icon :icon="faSearch" />
        </button>

        <button
          id="zoomOut"
          class="btn btnBoard btn-success"
          @click="(e) => zoomCanvas(0.8, e)"
        >
          <font-awesome-icon :icon="faSearchMinus" />
        </button>

        <div
          class="btn-group"
          role="group"
        >
          <button
            id="addText"
            class="btn btnBoard btn-secondary dropdown-toggle"
            @click="handleDropdownClick('addText')"
          >
            <font-awesome-icon :icon="faFont" />
          </button>
          <div
            v-if="dropdownOpen === 'addText'"
            class="dropdown-menu show"
          >
            <button
              v-for="(item, index) in fontOptions"
              :key="index"
              class="dropdown-item"
              style="padding: 5px"
              @click="handleItemClick(updateFont, 'text', item.value)"
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
            id="fontSize"
            class="btn btnBoard btn-secondary dropdown-toggle"
            @click="handleDropdownClick('fontSize')"
          >
            <font-awesome-icon :icon="faTextHeight" />
          </button>
          <div
            v-if="dropdownOpen === 'fontSize'"
            class="dropdown-menu show"
          >
            <button
              v-for="(item, index) in fontSizeOptions"
              :key="index"
              class="dropdown-item"
              style="padding: 5px"
              @click="handleItemClick(updateFontSize, '', item.value)"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <button
          id="undo"
          class="btn btnBoard btn-secondary"
          @click="undo"
        >
          <font-awesome-icon :icon="faUndo" />
        </button>

        <button
          id="redo"
          class="btn btnBoard btn-secondary"
          @click="redo"
        >
          <font-awesome-icon :icon="faRedo" />
        </button>

        <button
          id="save"
          class="btn btnBoard btn-secondary"
          @click="saveCanvas"
        >
          <font-awesome-icon :icon="faSave" />
        </button>

        <button
          id="delete"
          class="btn btnBoard btn-danger"
          @click="deleteShape()"
        >
          <font-awesome-icon :icon="faTrash" />
        </button>

        <button
          id="clearCanvas"
          class="btn btnBoard btn-secondary"
          @click="clearCanvas()"
        >
          <font-awesome-icon :icon="faTimes" />
        </button>

        <button
          id="toggleBackground"
          ref="toggleBackgroundRef"
          class="btn btnBoard btn-secondary"
          @click="toggleBackground()"
        >
          <img
            id="backgroundIcon"
            src="https://mediasfu.com/images/svg/graph.jpg"
            alt="Background"
            class="toggle-icon"
          />
        </button>

        <input
          id="uploadBoardImage"
          type="file"
          accept="image/*"
          style="display: none"
          @change="uploadImage"
        />
        <label
          for="uploadBoardImage"
          class="btn btnBoard btn-primary"
        >
          <font-awesome-icon :icon="faUpload" />
        </label>

        <input
          id="colorPicker"
          v-model="color"
          type="color"
          class="btn color-picker"
        />

        <select
          id="lineTypePicker"
          v-model="lineType"
          class="custom-select"
          style="width: auto"
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
        id="whiteboardCanvas"
        ref="canvasRef"
        width="1280"
        height="720"
        style="border: 2px solid red"
      ></canvas>

      <textarea
        id="textInput"
        ref="textInputRef"
        class="form-control"
        style="display: none; position: absolute"
      ></textarea>

      <a
        ref="downloadLinkRef"
        href="#"
        style="display: none"
      >Download</a>
      <canvas
        ref="tempCanvasRef"
        style="display: none"
      ></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faTimes,
  faUndo,
  faRedo,
  faEraser,
  faShapes,
  faMousePointer,
  faHandPaper,
  faTextHeight,
  faFont,
  faPencilAlt,
  faPaintBrush,
  faTrash,
  faSave,
  faSearch,
  faSearchMinus,
  faSearchPlus,
  faChevronLeft,
  faUpload,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import type { Socket } from 'socket.io-client';

export interface Shape {
  type: string;
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  text?: string;
  color?: string;
  font?: string;
  fontSize?: number;
  thickness?: number;
  lineType?: string;
  points?: Array<{ x: number; y: number }>;
  img?: HTMLImageElement;
  src?: string;
}

export interface WhiteboardUser {
  name: string;
  useBoard: boolean;
}

export interface Participant {
  id: string;
  name: string;
  islevel: string;
  isBanned?: boolean;
}

/**
 * Parameters object for the Whiteboard component
 * @interface WhiteboardParameters
 * 
 * @property {Socket} socket - Socket.io connection for real-time shape synchronization
 * @property {Function} [showAlert] - Alert function for user feedback messages
 * @property {string} islevel - User's permission level ('2' = host, '1' = participant, '0' = guest)
 * @property {string} roomName - Room identifier for socket emissions
 * @property {Shape[]} shapes - Array of all shapes currently on the whiteboard canvas
 * @property {boolean} useImageBackground - Whether to use image background (grid) or plain background
 * @property {Shape[]} redoStack - Stack of shapes for redo operations
 * @property {string[]} undoStack - Stack of action IDs for undo operations
 * @property {boolean} whiteboardStarted - Whether whiteboard session has started
 * @property {boolean} whiteboardEnded - Whether whiteboard session has ended
 * @property {WhiteboardUser[]} whiteboardUsers - Array of users with whiteboard permissions
 * @property {Participant[]} participants - Current active participants in the room
 * @property {Participant[]} participantsAll - All participants including disconnected
 * @property {string} screenId - Current screen share producer ID
 * @property {boolean} recordStarted - Whether recording has started
 * @property {boolean} recordStopped - Whether recording has stopped
 * @property {boolean} recordPaused - Whether recording is paused
 * @property {boolean} recordResumed - Whether recording has resumed
 * @property {string} recordingMediaOptions - Recording media type ('video' | 'audio' | 'all')
 * @property {string} member - Current user's name/identifier
 * @property {boolean} shareScreenStarted - Whether screen sharing is active
 * @property {HTMLCanvasElement | null} [canvasWhiteboard] - Reference to the whiteboard canvas element
 * @property {string} [targetResolution] - Target resolution for participant canvas streaming ('sd' | 'hd' | 'fhd')
 * @property {string} [targetResolutionHost] - Target resolution for host canvas streaming
 * 
 * @property {(shapes: Shape[]) => void} updateShapes - Function to update shapes array
 * @property {(useImageBackground: boolean) => void} updateUseImageBackground - Function to toggle background image
 * @property {(redoStack: Shape[]) => void} updateRedoStack - Function to update redo stack
 * @property {(undoStack: string[]) => void} updateUndoStack - Function to update undo stack
 * @property {(whiteboardStarted: boolean) => void} updateWhiteboardStarted - Function to update whiteboard started state
 * @property {(whiteboardEnded: boolean) => void} updateWhiteboardEnded - Function to update whiteboard ended state
 * @property {(whiteboardUsers: WhiteboardUser[]) => void} updateWhiteboardUsers - Function to update whiteboard users
 * @property {(participants: Participant[]) => void} updateParticipants - Function to update participants array
 * @property {(screenId: string) => void} updateScreenId - Function to update screen share ID
 * @property {(shareScreenStarted: boolean) => void} updateShareScreenStarted - Function to update screen share state
 * @property {(canvasWhiteboard: HTMLCanvasElement | null) => void} updateCanvasWhiteboard - Function to update canvas reference
 * 
 * @property {Function} onScreenChanges - Function to handle screen orientation/size changes
 * @property {Function} captureCanvasStream - Function to capture canvas as MediaStream for streaming
 * @property {() => WhiteboardParameters} getUpdatedAllParams - Function to retrieve updated parameters object
 * 
 * @example Basic WhiteboardParameters Object
 * ```ts
 * const whiteboardParams = {
 *   socket: socketConnection,
 *   showAlert: (alert) => console.log(alert.message),
 *   islevel: '2',
 *   roomName: 'room123',
 *   shapes: [],
 *   useImageBackground: true,
 *   redoStack: [],
 *   undoStack: [],
 *   whiteboardStarted: true,
 *   whiteboardEnded: false,
 *   whiteboardUsers: [{ name: 'HostUser', useBoard: true }],
 *   participants: allParticipants,
 *   participantsAll: allParticipants,
 *   screenId: '',
 *   recordStarted: false,
 *   recordStopped: false,
 *   recordPaused: false,
 *   recordResumed: false,
 *   recordingMediaOptions: 'video',
 *   member: 'HostUser',
 *   shareScreenStarted: false,
 *   updateShapes: (shapes) => { whiteboardShapes.value = shapes; },
 *   updateUseImageBackground: (use) => { useImageBg.value = use; },
 *   // ... other update functions
 *   onScreenChanges: async ({ changed, parameters }) => {
 *     if (changed) await adjustCanvasForOrientation(parameters);
 *   },
 *   captureCanvasStream: async ({ parameters, start }) => {
 *     if (start) await streamCanvas(parameters);
 *   },
 *   getUpdatedAllParams: () => ({ ...whiteboardParams })
 * };
 * ```
 */
export interface WhiteboardParameters {
  socket: Socket;
  showAlert?: (alert: { message: string; type: string }) => void;
  islevel: string;
  roomName: string;
  shapes: Shape[];
  useImageBackground: boolean;
  redoStack: Shape[];
  undoStack: string[];
  whiteboardStarted: boolean;
  whiteboardEnded: boolean;
  whiteboardUsers: WhiteboardUser[];
  participants: Participant[];
  participantsAll: Participant[];
  screenId: string;
  recordStarted: boolean;
  recordStopped: boolean;
  recordPaused: boolean;
  recordResumed: boolean;
  recordingMediaOptions: string;
  member: string;
  shareScreenStarted: boolean;
  canvasWhiteboard?: HTMLCanvasElement | null;
  targetResolution?: string;
  targetResolutionHost?: string;

  updateShapes: (shapes: Shape[]) => void;
  updateUseImageBackground: (useImageBackground: boolean) => void;
  updateRedoStack: (redoStack: Shape[]) => void;
  updateUndoStack: (undoStack: string[]) => void;
  updateWhiteboardStarted: (whiteboardStarted: boolean) => void;
  updateWhiteboardEnded: (whiteboardEnded: boolean) => void;
  updateWhiteboardUsers: (whiteboardUsers: WhiteboardUser[]) => void;
  updateParticipants: (participants: Participant[]) => void;
  updateScreenId: (screenId: string) => void;
  updateShareScreenStarted: (shareScreenStarted: boolean) => void;
  updateCanvasWhiteboard: (canvasWhiteboard: HTMLCanvasElement | null) => void;

  onScreenChanges: (options: { changed: boolean; parameters: WhiteboardParameters }) => Promise<void>;
  captureCanvasStream: (options: {
    parameters: WhiteboardParameters;
    start: boolean;
  }) => Promise<void>;

  getUpdatedAllParams: () => WhiteboardParameters;
  [key: string]: any;
}

/**
 * Props for the Whiteboard component
 * @interface WhiteboardProps
 * 
 * @property {number} customWidth - Width of the whiteboard canvas in pixels
 * @property {number} customHeight - Height of the whiteboard canvas in pixels
 * @property {WhiteboardParameters} parameters - Parameters object with socket, state, and callback functions
 * @property {boolean} showAspect - Whether to display the whiteboard (used for conditional rendering)
 * 
 * @example WhiteboardProps Usage
 * ```ts
 * const whiteboardProps = {
 *   customWidth: 1200,
 *   customHeight: 800,
 *   parameters: {
 *     socket: socketConnection,
 *     roomName: 'room123',
 *     islevel: '2',
 *     member: 'HostUser',
 *     shapes: [],
 *     useImageBackground: true,
 *     whiteboardStarted: true,
 *     whiteboardEnded: false,
 *     participants: participants,
 *     // ... other required parameters
 *   },
 *   showAspect: true
 * };
 * ```
 * 
 * @default customWidth - No default (required)
 * @default customHeight - No default (required)
 * @default parameters - No default (required)
 * @default showAspect - No default (required)
 */
export interface WhiteboardProps {
  customWidth: number;
  customHeight: number;
  parameters: WhiteboardParameters;
  showAspect: boolean;
}

const props = defineProps<WhiteboardProps>();

// Refs for canvas and elements
const canvasRef = ref<HTMLCanvasElement | null>(null);
const textInputRef = ref<HTMLTextAreaElement | null>(null);
const toggleBackgroundRef = ref<HTMLButtonElement | null>(null);
const downloadLinkRef = ref<HTMLAnchorElement | null>(null);
const tempCanvasRef = ref<HTMLCanvasElement | null>(null);

// Drawing state
const mode = ref<string>('pan');
const isDrawing = ref<boolean>(false);
const isPanning = ref<boolean>(false);
const isDragging = ref<boolean>(false);
const startX = ref<number>(0);
const startY = ref<number>(0);
const currentX = ref<number>(0);
const currentY = ref<number>(0);
const freehandDrawing = ref<Array<{ x: number; y: number }>>([]);
const selectedShape = ref<Shape | null>(null);
const selectedHandle = ref<{ x: number; y: number; isCenter?: boolean } | null>(null);
const movingShape = ref<boolean>(false);
const panX = ref<number>(0);
const panY = ref<number>(0);
const scale = ref<number>(1);
const minScale = ref<number>(0.25);
const maxScale = ref<number>(1.75);

// Tool settings
const eraserThickness = ref<number>(10);
const brushThickness = ref<number>(6);
const lineThickness = ref<number>(6);
const lineType = ref<string>('solid');
const color = ref<string>('#000000');
const font = ref<string>('Arial');
const fontSize = ref<number>(20);
const shape = ref<string | null>(null);

// UI state
const toolbarVisible = ref<boolean>(true);
const dropdownOpen = ref<string | null>(null);
const isValidShape = ref<boolean>(true);

// Background and dimensions
const backgroundImage = ref<HTMLImageElement>(new Image());
const imageBackgroundUrl = 'https://mediasfu.com/images/svg/graph_paper.jpg';
const maxWidth = ref<number>(1280);
const maxHeight = ref<number>(720);
const dimensionsFixed = ref<boolean>(false);

// Canvas context
let ctx: CanvasRenderingContext2D | null = null;

// Dropdown options
const lineThicknessOptions = [
  { label: 'XX-Small (3px)', value: 3 },
  { label: 'X-Small (6px)', value: 6 },
  { label: 'Small (12px)', value: 12 },
  { label: 'Medium (18px)', value: 18 },
  { label: 'Large (24px)', value: 24 },
  { label: 'X-Large (36px)', value: 36 },
];

const brushThicknessOptions = [
  { label: 'X-Small (5px)', value: 5 },
  { label: 'Small (10px)', value: 10 },
  { label: 'Medium (20px)', value: 20 },
  { label: 'Large (40px)', value: 40 },
  { label: 'X-Large (60px)', value: 60 },
];

const eraserThicknessOptions = [
  { label: 'X-Small (5px)', value: 5 },
  { label: 'Small (10px)', value: 10 },
  { label: 'Medium (20px)', value: 20 },
  { label: 'Large (30px)', value: 30 },
  { label: 'X-Large (60px)', value: 60 },
];

const fontOptions = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Verdana', value: 'Verdana' },
];

const fontSizeOptions = [
  { label: 'X-Small (5px)', value: 5 },
  { label: 'Small (10px)', value: 10 },
  { label: 'Medium (20px)', value: 20 },
  { label: 'Large (40px)', value: 40 },
  { label: 'X-Large (60px)', value: 60 },
];

const shapeOptions = [
  { icon: 'https://mediasfu.com/images/svg/square.svg', value: 'square' },
  { icon: 'https://mediasfu.com/images/svg/rectangle.svg', value: 'rectangle' },
  { icon: 'https://mediasfu.com/images/svg/circle.svg', value: 'circle' },
  { icon: 'https://mediasfu.com/images/svg/triangle.svg', value: 'triangle' },
  { icon: 'https://mediasfu.com/images/svg/hexagon.svg', value: 'hexagon' },
  { icon: 'https://mediasfu.com/images/svg/pentagon.svg', value: 'pentagon' },
  { icon: 'https://mediasfu.com/images/svg/rhombus.svg', value: 'rhombus' },
  { icon: 'https://mediasfu.com/images/svg/octagon.svg', value: 'octagon' },
  { icon: 'https://mediasfu.com/images/svg/parallelogram.svg', value: 'parallelogram' },
  { icon: 'https://mediasfu.com/images/svg/oval.svg', value: 'oval' },
];

// Update functions
const updateFont = (newFont: string) => {
  font.value = newFont;
};

const updateFontSize = (newFontSize: number) => {
  fontSize.value = newFontSize;
};

const updateShape = (newShape: string) => {
  shape.value = newShape;
};

const updateLineThickness = (newThickness: number) => {
  lineThickness.value = newThickness;
};

const updateBrushThickness = (newThickness: number) => {
  brushThickness.value = newThickness;
};

const updateEraserThickness = (newThickness: number) => {
  eraserThickness.value = newThickness;
};

// Helper functions
const checkBoardAccess = (): boolean => {
  const { whiteboardStarted, whiteboardEnded, whiteboardUsers, member, islevel, showAlert } =
    props.parameters;
  if (whiteboardStarted && !whiteboardEnded) {
    const user = whiteboardUsers.find((user) => user.name === member);
    if ((!user || !user.useBoard) && islevel !== '2') {
      showAlert?.({
        message: 'You are not allowed to use the whiteboard. Please ask the host to assign you.',
        type: 'danger',
      });
      return false;
    }
    return true;
  }
  return true;
};

const changeMode = (newMode: string) => {
  if (newMode !== 'pan' && !checkBoardAccess()) return;
  mode.value = newMode;

  const canvas = canvasRef.value;
  if (!canvas) return;

  if (newMode === 'pan') {
    canvas.style.cursor = 'grab';
  } else if (newMode === 'select') {
    canvas.style.cursor = 'pointer';
  } else if (newMode === 'erase') {
    canvas.style.cursor = 'crosshair';
  } else {
    canvas.style.cursor = 'crosshair';
  }

  if (newMode !== 'freehand' && freehandDrawing.value.length > 0) {
    props.parameters.updateShapes([
      ...props.parameters.shapes,
      {
        type: 'freehand',
        points: freehandDrawing.value,
        color: color.value,
        thickness: brushThickness.value,
      }
    ]);
    freehandDrawing.value = [];
    saveState();
  }
};

const handleServerResponse = (response: { success: boolean; reason: string }) => {
  if (!response.success) {
    props.parameters.showAlert?.({
      message: `Whiteboard action failed: ${response.reason}`,
      type: 'danger',
    });
  }
};

const drawLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  thickness: number,
  lineType: string
) => {
  if (!ctx) return;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  if (lineType === 'dashed') {
    ctx.setLineDash([10, 10]);
  } else if (lineType === 'dotted') {
    ctx.setLineDash([2, 10]);
  } else if (lineType === 'dashDot') {
    ctx.setLineDash([10, 5, 2, 5]);
  } else {
    ctx.setLineDash([]);
  }
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
};

const drawFreehand = (points: Array<{ x: number; y: number }>, color: string, thickness: number) => {
  if (points.length < 2 || !ctx) return;
  const context = ctx;
  context.strokeStyle = color;
  context.lineWidth = thickness;
  context.beginPath();
  context.moveTo(points[0]!.x, points[0]!.y);
  for (let i = 1; i < points.length; i++) {
    context.lineTo(points[i]!.x, points[i]!.y);
  }
  context.stroke(); 
};

const drawPolygon = (
  ctxParam: CanvasRenderingContext2D,
  sides: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  const centerX = (x1 + x2) / 2;
  const centerY = (y1 + y2) / 2;
  const radius = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2;
  const angle = (2 * Math.PI) / sides;
  ctxParam.beginPath();
  for (let i = 0; i < sides; i++) {
    const x = centerX + radius * Math.cos(i * angle - Math.PI / 2);
    const y = centerY + radius * Math.sin(i * angle - Math.PI / 2);
    if (i === 0) {
      ctxParam.moveTo(x, y);
    } else {
      ctxParam.lineTo(x, y);
    }
  }
  ctxParam.closePath();
  ctxParam.stroke();
};

const drawShape = (
  type: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  thickness: number,
  lineType: string,
  img: HTMLImageElement | null = null,
  ctxx: CanvasRenderingContext2D | null = null
) => {
  const drawCtx = ctxx || ctx;
  if (!drawCtx) return;

  drawCtx.beginPath();
  drawCtx.strokeStyle = color;
  drawCtx.lineWidth = thickness;
  if (lineType === 'dashed') {
    drawCtx.setLineDash([10, 10]);
  } else if (lineType === 'dotted') {
    drawCtx.setLineDash([2, 10]);
  } else if (lineType === 'dashDot') {
    drawCtx.setLineDash([10, 5, 2, 5]);
  } else {
    drawCtx.setLineDash([]);
  }

  if (type === 'rectangle') {
    drawCtx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  } else if (type === 'circle') {
    const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    drawCtx.arc(x1, y1, radius, 0, 2 * Math.PI);
    drawCtx.stroke();
  } else if (type === 'rhombus') {
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    drawCtx.moveTo(centerX, y1);
    drawCtx.lineTo(x2, centerY);
    drawCtx.lineTo(centerX, y2);
    drawCtx.lineTo(x1, centerY);
    drawCtx.closePath();
    drawCtx.stroke();
  } else if (type === 'pentagon') {
    drawPolygon(drawCtx, 5, x1, y1, x2, y2);
  } else if (type === 'hexagon') {
    drawPolygon(drawCtx, 6, x1, y1, x2, y2);
  } else if (type === 'triangle') {
    const centerXTriangle = (x1 + x2) / 2;
    drawCtx.moveTo(centerXTriangle, y1);
    drawCtx.lineTo(x2, y2);
    drawCtx.lineTo(x1, y2);
    drawCtx.closePath();
    drawCtx.stroke();
  } else if (type === 'square') {
    drawCtx.strokeRect(x1, y1, x2 - x1, x2 - x1);
  } else if (type === 'octagon') {
    drawPolygon(drawCtx, 8, x1, y1, x2, y2);
  } else if (type === 'oval') {
    const radiusX = Math.abs(x2 - x1) / 2;
    const radiusY = Math.abs(y2 - y1) / 2;
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    drawCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    drawCtx.stroke();
  } else if (type === 'parallelogram') {
    const centerX = (x1 + x2) / 2;
    drawCtx.moveTo(centerX, y1);
    drawCtx.lineTo(x2, y2);
    drawCtx.lineTo(centerX, y2);
    drawCtx.lineTo(x1, y1);
    drawCtx.closePath();
    drawCtx.stroke();
  } else if (type === 'image' && img) {
    drawCtx.drawImage(img, x1, y1, x2 - x1, y2 - y1);
  }
};

const drawEdgeMarkers = () => {
  if (!ctx) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 5;
  ctx.setLineDash([]);

  const markerLength = 20;
  const topLeftX = panX.value;
  const topLeftY = panY.value;
  const bottomRightX = panX.value + maxWidth.value * scale.value;
  const bottomRightY = panY.value + maxHeight.value * scale.value;

  ctx.beginPath();
  ctx.moveTo(topLeftX, topLeftY + markerLength);
  ctx.lineTo(topLeftX, topLeftY);
  ctx.lineTo(topLeftX + markerLength, topLeftY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(bottomRightX - markerLength, topLeftY);
  ctx.lineTo(bottomRightX, topLeftY);
  ctx.lineTo(bottomRightX, topLeftY + markerLength);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(bottomRightX, bottomRightY - markerLength);
  ctx.lineTo(bottomRightX, bottomRightY);
  ctx.lineTo(bottomRightX - markerLength, bottomRightY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(topLeftX + markerLength, bottomRightY);
  ctx.lineTo(topLeftX, bottomRightY);
  ctx.lineTo(topLeftX, bottomRightY - markerLength);
  ctx.stroke();

  ctx.restore();
};

const drawShapes = () => {
  const canvas = canvasRef.value;
  if (!ctx || !canvas) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.setTransform(scale.value, 0, 0, scale.value, panX.value, panY.value);

  if (props.parameters.useImageBackground) {
    ctx.drawImage(
      backgroundImage.value,
      -panX.value / scale.value,
      -panY.value / scale.value,
      canvas.width / scale.value,
      canvas.height / scale.value
    );
  } else {
    ctx.fillStyle = '#fff';
    ctx.fillRect(
      -panX.value / scale.value,
      -panY.value / scale.value,
      canvas.width / scale.value,
      canvas.height / scale.value
    );
  }

  props.parameters.shapes.forEach((shapeItem) => {
    if (!ctx) return;
    if (shapeItem.type === 'line') {
      drawLine(
        shapeItem.x1!,
        shapeItem.y1!,
        shapeItem.x2!,
        shapeItem.y2!,
        shapeItem.color!,
        shapeItem.thickness!,
        shapeItem.lineType!
      );
    } else if (shapeItem.type === 'freehand') {
      drawFreehand(shapeItem.points!, shapeItem.color!, shapeItem.thickness!);
    } else if (shapeItem.type === 'text') {
      ctx.font = `${shapeItem.fontSize}px ${shapeItem.font}`;
      ctx.fillStyle = shapeItem.color!;
      ctx.fillText(shapeItem.text!, shapeItem.x!, shapeItem.y!);
    } else if (shapeItem.type === 'image') {
      ctx.drawImage(
        shapeItem.img!,
        shapeItem.x1!,
        shapeItem.y1!,
        shapeItem.x2! - shapeItem.x1!,
        shapeItem.y2! - shapeItem.y1!
      );
    } else {
      drawShape(
        shapeItem.type,
        shapeItem.x1!,
        shapeItem.y1!,
        shapeItem.x2!,
        shapeItem.y2!,
        shapeItem.color!,
        shapeItem.thickness!,
        shapeItem.lineType!
      );
    }
  });

  ctx.restore();
  drawEdgeMarkers();
};

const erase = (x: number, y: number) => {
  if (!ctx) return;
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(x, y, eraserThickness.value / 2, 0, Math.PI * 2, false);
  ctx.fill();
  ctx.restore();

  let changeOccurred = false;
  let shapes = props.parameters.shapes
    .map((shapeItem) => {
      if (shapeItem.type === 'freehand') {
        return {
          ...shapeItem,
          points: shapeItem.points!.filter((point) => {
            const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
            if (distance <= eraserThickness.value / 2) {
              changeOccurred = true;
              return false;
            }
            return distance > eraserThickness.value / 2;
          }),
        };
      } else if (shapeItem.type === 'line') {
        if (
          isPointNearLine(
            x,
            y,
            shapeItem.x1!,
            shapeItem.y1!,
            shapeItem.x2!,
            shapeItem.y2!,
            eraserThickness.value / 2
          )
        ) {
          changeOccurred = true;
          return null;
        }
      } else if (shapeItem.type === 'text') {
        const textWidth = ctx!.measureText(shapeItem.text!).width;
        if (
          x > shapeItem.x! &&
          x < shapeItem.x! + textWidth &&
          y > shapeItem.y! - shapeItem.fontSize! &&
          y < shapeItem.y!
        ) {
          changeOccurred = true;
          return null;
        }
      } else if (shapeItem.type === 'image') {
        if (x > shapeItem.x1! && x < shapeItem.x2! && y > shapeItem.y1! && y < shapeItem.y2!) {
          changeOccurred = true;
          return null;
        }
      } else {
        if (x > shapeItem.x1! && x < shapeItem.x2! && y > shapeItem.y1! && y < shapeItem.y2!) {
          changeOccurred = true;
          return null;
        }
      }
      return shapeItem;
    })
    .filter(
      (shapeItem) => shapeItem && (shapeItem.type !== 'freehand' || shapeItem.points!.length > 0)
    ) as Shape[];

  props.parameters.updateShapes(shapes);
  drawShapes();

  if (changeOccurred) {
    props.parameters.socket.emit(
      'updateBoardAction',
      { action: 'shapes', payload: { shapes } },
      handleServerResponse
    );
  }
};

const isPointNearLine = (
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  threshold: number
): boolean => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const dot = ((px - x1) * dx + (py - y1) * dy) / (length * length);
  const closestX = x1 + dot * dx;
  const closestY = y1 + dot * dy;
  const distance = Math.sqrt(Math.pow(px - closestX, 2) + Math.pow(py - closestY, 2));
  return distance <= threshold;
};

const findShape = (x: number, y: number): Shape | undefined => {
  return props.parameters.shapes.find((shapeItem) => {
    if (shapeItem.type === 'freehand') {
      return shapeItem.points!.some((point) => {
        const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
        return distance < shapeItem.thickness!;
      });
    } else if (shapeItem.type === 'text') {
      if (!ctx) return false;
      ctx.font = `${shapeItem.fontSize}px ${shapeItem.font}`;
      const textMetrics = ctx.measureText(shapeItem.text!);
      return (
        x > shapeItem.x! &&
        x < shapeItem.x! + textMetrics.width &&
        y > shapeItem.y! - shapeItem.fontSize! &&
        y < shapeItem.y!
      );
    } else if (shapeItem.type === 'image') {
      return x > shapeItem.x1! && x < shapeItem.x2! && y > shapeItem.y1! && y < shapeItem.y2!;
    } else {
      return x > shapeItem.x1! && x < shapeItem.x2! && y > shapeItem.y1! && y < shapeItem.y2!;
    }
  });
};

const getResizeHandles = (shapeItem: Shape) => {
  const handles: any[] = [];
  if (shapeItem.type === 'line') {
    handles.push({ x: shapeItem.x1!, y: shapeItem.y1! });
    handles.push({ x: shapeItem.x2!, y: shapeItem.y2! });
  } else if (shapeItem.type === 'circle') {
    const radius = Math.sqrt(
      Math.pow(shapeItem.x2! - shapeItem.x1!, 2) + Math.pow(shapeItem.y2! - shapeItem.y1!, 2)
    );
    handles.push({ x: shapeItem.x1! + radius, y: shapeItem.y1! });
    handles.push({ x: shapeItem.x1! - radius, y: shapeItem.y1! });
    handles.push({ x: shapeItem.x1!, y: shapeItem.y1! + radius });
    handles.push({ x: shapeItem.x1!, y: shapeItem.y1! - radius });
    handles.push({ x: shapeItem.x1!, y: shapeItem.y1!, isCenter: true });
  } else if (shapeItem.type === 'text') {
    if (!ctx) return handles;
    const textMetrics = ctx.measureText(shapeItem.text!);
    handles.push({ x: shapeItem.x!, y: shapeItem.y! - shapeItem.fontSize!, isCenter: true });
    handles.push({ x: shapeItem.x! + textMetrics.width, y: shapeItem.y!, isCenter: false });
  } else if (shapeItem.type === 'image') {
    handles.push({ x: shapeItem.x1!, y: shapeItem.y1! });
    handles.push({ x: shapeItem.x2!, y: shapeItem.y1! });
    handles.push({ x: shapeItem.x2!, y: shapeItem.y2! });
    handles.push({ x: shapeItem.x1!, y: shapeItem.y2! });
    handles.push({
      x: (shapeItem.x1! + shapeItem.x2!) / 2,
      y: (shapeItem.y1! + shapeItem.y2!) / 2,
      isCenter: true,
    });
  } else {
    handles.push({ x: shapeItem.x1!, y: shapeItem.y1! });
    handles.push({ x: shapeItem.x2!, y: shapeItem.y1! });
    handles.push({ x: shapeItem.x2!, y: shapeItem.y2! });
    handles.push({ x: shapeItem.x1!, y: shapeItem.y2! });
    handles.push({
      x: (shapeItem.x1! + shapeItem.x2!) / 2,
      y: (shapeItem.y1! + shapeItem.y2!) / 2,
      isCenter: true,
    });
  }
  return handles.map((handle) => ({
    ...handle,
    isCenter: handle.isCenter || false,
  }));
};

const drawSelection = (shapeItem: Shape | null) => {
  if (!shapeItem || !ctx) return;

  const handles = getResizeHandles(shapeItem);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 3]);

  if (shapeItem.type === 'line') {
    ctx.beginPath();
    ctx.moveTo(shapeItem.x1!, shapeItem.y1!);
    ctx.lineTo(shapeItem.x2!, shapeItem.y2!);
    ctx.stroke();
  } else if (shapeItem.type === 'circle') {
    const radius = Math.sqrt(
      Math.pow(shapeItem.x2! - shapeItem.x1!, 2) + Math.pow(shapeItem.y2! - shapeItem.y1!, 2)
    );
    ctx.beginPath();
    ctx.arc(shapeItem.x1!, shapeItem.y1!, radius, 0, 2 * Math.PI);
    ctx.stroke();
  } else {
    ctx.strokeRect(shapeItem.x1!, shapeItem.y1!, shapeItem.x2! - shapeItem.x1!, shapeItem.y2! - shapeItem.y1!);
  }

  ctx.setLineDash([]);

  handles.forEach((handle) => {
    ctx!.fillStyle = handle.isCenter ? 'blue' : 'red';
    ctx!.fillRect(handle.x - 6, handle.y - 6, 12, 12);
  });
};

const getHandleAtPosition = (
  x: number,
  y: number
): { x: number; y: number; isCenter?: boolean } | undefined => {
  if (!selectedShape.value) return undefined;
  return getResizeHandles(selectedShape.value).find((handle) => {
    return Math.abs(handle.x - x) < 6 && Math.abs(handle.y - y) < 6;
  });
};

const moveShape = (shapeItem: Shape, dx: number, dy: number) => {
  if (shapeItem.type === 'line' || shapeItem.type === 'circle') {
    shapeItem.x1! += dx;
    shapeItem.y1! += dy;
    shapeItem.x2! += dx;
    shapeItem.y2! += dy;
  } else if (shapeItem.type === 'freehand') {
    shapeItem.points!.forEach((point) => {
      point.x += dx;
      point.y += dy;
    });
  } else if (shapeItem.type === 'text') {
    shapeItem.x! += dx;
    shapeItem.y! += dy;
  } else if (shapeItem.type === 'image') {
    shapeItem.x1! += dx;
    shapeItem.y1! += dy;
    shapeItem.x2! += dx;
    shapeItem.y2! += dy;
  } else {
    shapeItem.x1! += dx;
    shapeItem.y1! += dy;
    shapeItem.x2! += dx;
    shapeItem.y2! += dy;
  }
};

const resizeShape = (
  shapeItem: Shape,
  handle: { x: number; y: number; isCenter?: boolean },
  x: number,
  y: number
) => {
  if (shapeItem.type === 'line') {
    if (handle.x === shapeItem.x1 && handle.y === shapeItem.y1) {
      shapeItem.x1 = x;
      shapeItem.y1 = y;
    } else {
      shapeItem.x2 = x;
      shapeItem.y2 = y;
    }
  } else if (shapeItem.type === 'circle') {
    const dx = x - shapeItem.x1!;
    const dy = y - shapeItem.y1!;
    const radius = Math.sqrt(dx * dx + dy * dy);
    shapeItem.x2 = shapeItem.x1! + radius;
    shapeItem.y2 = shapeItem.y1!;
  } else if (shapeItem.type === 'text') {
    if (handle.isCenter) {
      shapeItem.x = x;
      shapeItem.y = y;
    } else {
      if (!ctx) return;
      const textMetrics = ctx.measureText(shapeItem.text!);
      shapeItem.x = x - textMetrics.width;
      shapeItem.y = y;
    }
  } else if (shapeItem.type === 'image') {
    if (handle.isCenter) {
      const dx = x - (shapeItem.x1! + shapeItem.x2!) / 2;
      const dy = y - (shapeItem.y1! + shapeItem.y2!) / 2;
      moveShape(shapeItem, dx, dy);
    } else {
      if (handle.x === shapeItem.x1! && handle.y === shapeItem.y1!) {
        shapeItem.x1 = x;
        shapeItem.y1 = y;
      } else if (handle.x === shapeItem.x2! && handle.y === shapeItem.y1!) {
        shapeItem.x2 = x;
        shapeItem.y1 = y;
      } else if (handle.x === shapeItem.x2! && handle.y === shapeItem.y2!) {
        shapeItem.x2 = x;
        shapeItem.y2 = y;
      } else {
        shapeItem.x1 = x;
        shapeItem.y2 = y;
      }
    }
  } else {
    if (handle.isCenter) {
      const dx = x - (shapeItem.x1! + shapeItem.x2!) / 2;
      const dy = y - (shapeItem.y1! + shapeItem.y2!) / 2;
      moveShape(shapeItem, dx, dy);
    } else {
      if (handle.x === shapeItem.x1! && handle.y === shapeItem.y1!) {
        shapeItem.x1 = x;
        shapeItem.y1 = y;
      } else if (handle.x === shapeItem.x2! && handle.y === shapeItem.y1!) {
        shapeItem.x2 = x;
        shapeItem.y1 = y;
      } else if (handle.x === shapeItem.x2! && handle.y === shapeItem.y2!) {
        shapeItem.x2 = x;
        shapeItem.y2 = y;
      } else {
        shapeItem.x1 = x;
        shapeItem.y2 = y;
      }
    }
  }
  drawShapes();
};

const startDrawing = (e: MouseEvent) => {
  try {
    isDrawing.value = true;
    startX.value = (e.offsetX - panX.value) / scale.value;
    startY.value = (e.offsetY - panY.value) / scale.value;

    if (mode.value === 'erase') {
      erase(startX.value, startY.value);
    } else if (mode.value === 'draw' || mode.value === 'freehand') {
      ctx?.beginPath();
      ctx?.moveTo(startX.value, startY.value);
      if (mode.value === 'freehand') {
        freehandDrawing.value = [{ x: startX.value, y: startY.value }];
      }
    } else if (mode.value === 'pan') {
      isPanning.value = true;
      isDragging.value = false;
    } else if (mode.value === 'select') {
      selectedHandle.value = getHandleAtPosition(startX.value, startY.value) ?? null;
      if (selectedHandle.value) {
        isDragging.value = true;
        movingShape.value = selectedHandle.value.isCenter || false;
      } else {
        selectedShape.value = findShape(startX.value, startY.value) ?? null;
        if (selectedShape.value) {
          drawShapes();
          drawSelection(selectedShape.value);
        }
      }
    }
  } catch (error) {
    console.error('Error in startDrawing:', error);
  }
};

const draw = (e: MouseEvent) => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  if (!dimensionsFixed.value) {
    try {
      if (
        props.parameters.targetResolution === 'qhd' ||
        props.parameters.targetResolutionHost === 'qhd'
      ) {
        maxWidth.value = 1920;
        maxHeight.value = 1080;
      } else if (
        props.parameters.targetResolution === 'fhd' ||
        props.parameters.targetResolutionHost === 'fhd'
      ) {
        maxWidth.value = 1920;
        maxHeight.value = 1080;
      }
      canvas.width = maxWidth.value;
      canvas.height = maxHeight.value;
      dimensionsFixed.value = true;
      props.parameters.updateCanvasWhiteboard(canvas);
    } catch {
      // handle error
    }
  }

  if (!isDrawing.value) return;

  currentX.value = (e.offsetX - panX.value) / scale.value;
  currentY.value = (e.offsetY - panY.value) / scale.value;

  if (mode.value === 'draw' || mode.value === 'freehand' || mode.value === 'shape') {
    if (currentX.value > maxWidth.value || currentY.value > maxHeight.value) {
      isValidShape.value = false;
      return;
    } else {
      isValidShape.value = true;
    }
  }

  if (mode.value === 'erase') {
    erase(currentX.value, currentY.value);
  } else if (mode.value === 'draw') {
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    drawShapes();
    drawLine(
      startX.value,
      startY.value,
      currentX.value,
      currentY.value,
      color.value,
      lineThickness.value,
      lineType.value
    );
  } else if (mode.value === 'freehand') {
    ctx!.lineTo(currentX.value, currentY.value);
    ctx!.strokeStyle = color.value;
    ctx!.lineWidth = brushThickness.value;
    ctx!.stroke();
    freehandDrawing.value.push({ x: currentX.value, y: currentY.value });
  } else if (mode.value === 'shape') {
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    drawShapes();
    drawShape(
      shape.value!,
      startX.value,
      startY.value,
      currentX.value,
      currentY.value,
      color.value,
      lineThickness.value,
      lineType.value
    );
  } else if (mode.value === 'pan' && isPanning.value) {
    isDragging.value = true;
    const dx = e.clientX - startX.value;
    const dy = e.clientY - startY.value;
    panX.value += dx;
    panY.value += dy;
    startX.value = e.clientX;
    startY.value = e.clientY;

    ctx!.setTransform(scale.value, 0, 0, scale.value, panX.value, panY.value);
    drawShapes();
  } else if (mode.value === 'select' && selectedShape.value) {
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    if (movingShape.value) {
      const dx = currentX.value - startX.value;
      const dy = currentY.value - startY.value;
      moveShape(selectedShape.value, dx, dy);
      startX.value = currentX.value;
      startY.value = currentY.value;
    } else if (isDragging.value) {
      resizeShape(selectedShape.value, selectedHandle.value!, currentX.value, currentY.value);
    }
    drawShapes();
    drawSelection(selectedShape.value);
  }
};

const stopDrawing = () => {
  isDrawing.value = false;
  isPanning.value = false;
  isDragging.value = false;
  ctx?.closePath();

  if (mode.value === 'draw' && isValidShape.value) {
    props.parameters.updateShapes([
      ...props.parameters.shapes,
      {
        type: 'line',
        x1: startX.value,
        y1: startY.value,
        x2: currentX.value,
        y2: currentY.value,
        color: color.value,
        thickness: lineThickness.value,
        lineType: lineType.value,
      }
    ]);
    saveState();
    props.parameters.socket.emit(
      'updateBoardAction',
      {
        action: 'draw',
        payload: {
          type: 'line',
          x1: startX.value,
          y1: startY.value,
          x2: currentX.value,
          y2: currentY.value,
          color: color.value,
          thickness: lineThickness.value,
          lineType: lineType.value,
        },
      },
      handleServerResponse
    );
  } else if (mode.value === 'freehand' && isValidShape.value) {
    props.parameters.updateShapes([
      ...props.parameters.shapes,
      {
        type: 'freehand',
        points: freehandDrawing.value,
        color: color.value,
        thickness: brushThickness.value,
      }
    ]);
    props.parameters.socket.emit(
      'updateBoardAction',
      {
        action: 'draw',
        payload: {
          type: 'freehand',
          points: freehandDrawing.value,
          color: color.value,
          thickness: brushThickness.value,
        },
      },
      handleServerResponse
    );
    freehandDrawing.value = [];
    saveState();
  } else if (mode.value === 'shape' && isValidShape.value) {
    props.parameters.updateShapes([
      ...props.parameters.shapes,
      {
        type: shape.value!,
        x1: startX.value,
        y1: startY.value,
        x2: currentX.value,
        y2: currentY.value,
        color: color.value,
        thickness: lineThickness.value,
        lineType: lineType.value,
      }
    ]);
    saveState();
    props.parameters.socket.emit(
      'updateBoardAction',
      {
        action: 'shape',
        payload: {
          type: shape.value!,
          x1: startX.value,
          y1: startY.value,
          x2: currentX.value,
          y2: currentY.value,
          color: color.value,
          thickness: lineThickness.value,
          lineType: lineType.value,
        },
      },
      handleServerResponse
    );
  } else if (mode.value === 'select') {
    if (selectedShape.value && !movingShape.value && !isDragging.value) {
      const shapeFound = findShape(currentX.value, currentY.value);
      if (shapeFound) {
        selectedShape.value = shapeFound;
        drawShapes();
        drawSelection(shapeFound);
      }
    }
    if (selectedShape.value) {
      props.parameters.socket.emit(
        'updateBoardAction',
        { action: 'shapes', payload: { shapes: props.parameters.shapes } },
        handleServerResponse
      );
    }
    saveState();
  }
};

const handleCanvasClick = (e: MouseEvent) => {
  if (mode.value === 'text') {
    const textInput = textInputRef.value!;
    textInput.style.left = e.clientX + 'px';
    textInput.style.top = e.clientY + 'px';
    textInput.style.display = 'block';
    textInput.focus();

    const onEnter = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        const text = textInput.value;
        textInput.style.display = 'none';
        textInput.value = '';
        props.parameters.updateShapes([
          ...props.parameters.shapes,
          {
            type: 'text',
            text,
            x: (e.offsetX - panX.value) / scale.value,
            y: (e.offsetY - panY.value) / scale.value,
            color: color.value,
            font: font.value,
            fontSize: fontSize.value,
          }
        ]);
        drawShapes();
        textInput.removeEventListener('keypress', onEnter);
        props.parameters.socket.emit(
          'updateBoardAction',
          {
            action: 'text',
            payload: {
              type: 'text',
              text,
              x: (e.offsetX - panX.value) / scale.value,
              y: (e.offsetY - panY.value) / scale.value,
              color: color.value,
              font: font.value,
              fontSize: fontSize.value,
            },
          },
          handleServerResponse
        );
      }
    };

    textInput.addEventListener('keypress', onEnter);
  }
};

const handleTouchStart = (e: TouchEvent) => {
  e.preventDefault();
  const touch = e.touches[0];
  if (!touch) return;
  const mouseEvent = new MouseEvent('mousedown', {
    clientX: touch.clientX,
    clientY: touch.clientY,
  });
  canvasRef.value?.dispatchEvent(mouseEvent);
};

const handleTouchMove = (e: TouchEvent) => {
  e.preventDefault();
  const touch = e.touches[0];
  if (!touch) return;
  const mouseEvent = new MouseEvent('mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY,
  });
  canvasRef.value?.dispatchEvent(mouseEvent);
};

const handleTouchEnd = (e: TouchEvent) => {
  e.preventDefault();
  const mouseEvent = new MouseEvent('mouseup', {});
  canvasRef.value?.dispatchEvent(mouseEvent);
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownOpen.value && !(event.target as HTMLElement).closest('.btn-group')) {
    dropdownOpen.value = null;
  }
};

const handleZoom = (e: WheelEvent) => {
  e.preventDefault();
  if (e.deltaY < 0) {
    zoomCanvas(1.2, e);
  } else {
    zoomCanvas(0.8, e);
  }
};

const zoomCanvas = (
  scaleFactor: number,
  event: MouseEvent | { clientX: number; clientY: number } = {
    clientX: maxWidth.value / 2,
    clientY: maxHeight.value / 2,
  }
) => {
  const canvas = canvasRef.value;
  if (!canvas || !ctx) return;

  if (scaleFactor === 10) {
    scale.value = 1;
    panX.value = 0;
    panY.value = 0;
  } else {
    let newScale = scale.value * scaleFactor;
    if (newScale < minScale.value) {
      newScale = minScale.value;
    } else if (newScale > maxScale.value) {
      newScale = maxScale.value;
    }

    const rect = canvas.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width;
    const offsetY = (event.clientY - rect.top) / rect.height;

    const dx = offsetX * canvas.width * (1 - scaleFactor);
    const dy = offsetY * canvas.height * (1 - scaleFactor);

    scale.value = newScale;
    panX.value = panX.value * scaleFactor + dx;
    panY.value = panY.value * scaleFactor + dy;

    const maxPanX = (canvas.width * (scale.value - 1)) / scale.value;
    const maxPanY = (canvas.height * (scale.value - 1)) / scale.value;
    panX.value = Math.min(Math.max(panX.value, -maxPanX), 0);
    panY.value = Math.min(Math.max(panY.value, -maxPanY), 0);
  }

  ctx.setTransform(scale.value, 0, 0, scale.value, panX.value, panY.value);
  drawShapes();
};

const handleDropdownClick = (id: string) => {
  dropdownOpen.value = dropdownOpen.value === id ? null : id;
};

const handleItemClick = (callback: (value: any) => void, name: string, value: any) => {
  callback(value);
  dropdownOpen.value = null;
  if (['draw', 'freehand', 'shape', 'text', 'erase'].includes(name)) {
    changeMode(name);
  }
};

const toggleToolbar = () => {
  toolbarVisible.value = !toolbarVisible.value;
};

const saveState = () => {
  props.parameters.updateUndoStack([
    ...props.parameters.undoStack,
    JSON.stringify(props.parameters.shapes)
  ]);
};

const undo = () => {
  if (!checkBoardAccess()) return;

  if (props.parameters.shapes.length > 0) {
    const lastShape = props.parameters.shapes[props.parameters.shapes.length - 1]!;
    props.parameters.updateRedoStack([...props.parameters.redoStack, lastShape]);
    props.parameters.updateShapes(props.parameters.shapes.slice(0, -1));
    drawShapes();
    props.parameters.socket.emit('updateBoardAction', { action: 'undo' }, handleServerResponse);
  }
};

const redo = () => {
  if (!checkBoardAccess()) return;

  if (props.parameters.redoStack.length > 0) {
    const lastRedo = props.parameters.redoStack[props.parameters.redoStack.length - 1]!;
    props.parameters.updateShapes([...props.parameters.shapes, lastRedo]);
    props.parameters.updateRedoStack(props.parameters.redoStack.slice(0, -1));
    drawShapes();
    props.parameters.socket.emit('updateBoardAction', { action: 'redo' }, handleServerResponse);
  }
};

const deleteShape = (doEmits = true) => {
  if (!checkBoardAccess()) return;

  if (!selectedShape.value) return;
  if (selectedShape.value) {
    const shapes = props.parameters.shapes.filter((shapeItem) => shapeItem !== selectedShape.value);
    props.parameters.updateShapes(shapes);
    selectedShape.value = null;
    if (doEmits) {
      props.parameters.socket.emit(
        'updateBoardAction',
        { action: 'shapes', payload: { shapes } },
        handleServerResponse
      );
    }
    drawShapes();
  }
};

const toggleBackground = (doEmits = true) => {
  if (doEmits && !checkBoardAccess()) return;
  
  const newUseImageBackground = !props.parameters.useImageBackground;
  props.parameters.updateUseImageBackground(newUseImageBackground);
  
  const toggleButton = toggleBackgroundRef.value!;
  const canvas = canvasRef.value!;
  
  if (newUseImageBackground) {
    canvas.style.backgroundImage = `url('${imageBackgroundUrl}')`;
    toggleButton.classList.remove('active');
  } else {
    canvas.style.backgroundImage = 'none';
    canvas.style.backgroundColor = 'white';
    toggleButton.classList.add('active');
  }
  
  drawShapes();
  
  if (doEmits) {
    props.parameters.socket.emit(
      'updateBoardAction',
      { action: 'toggleBackground', payload: newUseImageBackground },
      handleServerResponse
    );
  }
};

const clearCanvas = (doEmits = true) => {
  if (props.parameters.islevel !== '2' && doEmits) {
    props.parameters.showAlert?.({
      message: 'You do not have permission to clear the board',
      type: 'danger',
    });
    return;
  }
  if (props.parameters.shapes.length === 0) return;
  
  props.parameters.updateShapes([]);
  drawShapes();
  
  if (doEmits) {
    props.parameters.socket.emit('updateBoardAction', { action: 'clear' }, handleServerResponse);
  }
};

const drawShapeOnCanvas = (shapeItem: Shape, ctxx: CanvasRenderingContext2D) => {
  ctxx.beginPath();
  ctxx.strokeStyle = shapeItem.color!;
  ctxx.lineWidth = shapeItem.thickness || 2;
  ctxx.fillStyle = shapeItem.color!;
  ctxx.font = `${shapeItem.fontSize}px ${shapeItem.font}`;

  const lineTypeVal = shapeItem.lineType ? shapeItem.lineType : 'solid';

  if (lineTypeVal === 'dashed') {
    ctxx.setLineDash([10, 10]);
  } else if (lineTypeVal === 'dotted') {
    ctxx.setLineDash([2, 10]);
  } else if (lineTypeVal === 'dashDot') {
    ctxx.setLineDash([10, 5, 2, 5]);
  } else {
    ctxx.setLineDash([]);
  }

  switch (shapeItem.type) {
    case 'line':
      ctxx.moveTo(shapeItem.x1!, shapeItem.y1!);
      ctxx.lineTo(shapeItem.x2!, shapeItem.y2!);
      break;
    case 'freehand':
      try {
        if (shapeItem.points && shapeItem.points.length > 0) {
          ctxx.moveTo(shapeItem.points[0]!.x, shapeItem.points[0]!.y);
          shapeItem.points.forEach((point) => ctxx.lineTo(point.x, point.y));
        }
      } catch (e) {
        console.error(e);
      }
      break;
    case 'text':
      ctxx.fillText(shapeItem.text!, shapeItem.x!, shapeItem.y!);
      break;
    case 'image':
      ctxx.drawImage(
        shapeItem.img!,
        shapeItem.x1!,
        shapeItem.y1!,
        shapeItem.x2! - shapeItem.x1!,
        shapeItem.y2! - shapeItem.y1!
      );
      break;
    default:
      break;
  }
  ctxx.stroke();
};

const downloadCanvas = (tempCanvas: HTMLCanvasElement) => {
  const link = downloadLinkRef.value!;
  link.href = tempCanvas.toDataURL();
  link.download = 'whiteboard.png';
  link.click();
};

const saveCanvas = () => {
  const tempCanvas = tempCanvasRef.value!;
  const tempCtx = tempCanvas.getContext('2d')!;
  const canvas = canvasRef.value!;
  
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  
  const notShapes = ['freehand', 'text', 'image', 'line'];

  if (props.parameters.useImageBackground) {
    const bgImage = new Image();
    bgImage.crossOrigin = 'anonymous';
    bgImage.onload = () => {
      tempCtx.drawImage(bgImage, 0, 0, tempCanvas.width, tempCanvas.height);
      props.parameters.shapes.forEach((shapeItem) => {
        if (!notShapes.includes(shapeItem.type)) {
          drawShape(
            shapeItem.type,
            shapeItem.x1!,
            shapeItem.y1!,
            shapeItem.x2!,
            shapeItem.y2!,
            shapeItem.color!,
            shapeItem.thickness!,
            shapeItem.lineType!,
            null,
            tempCtx
          );
        } else {
          drawShapeOnCanvas(shapeItem, tempCtx);
        }
      });
      downloadCanvas(tempCanvas);
    };
    bgImage.src = imageBackgroundUrl;
  } else {
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    props.parameters.shapes.forEach((shapeItem) => {
      if (!notShapes.includes(shapeItem.type)) {
        drawShape(
          shapeItem.type,
          shapeItem.x1!,
          shapeItem.y1!,
          shapeItem.x2!,
          shapeItem.y2!,
          shapeItem.color!,
          shapeItem.thickness!,
          shapeItem.lineType!,
          null,
          tempCtx
        );
      } else {
        drawShapeOnCanvas(shapeItem, tempCtx);
      }
    });
    downloadCanvas(tempCanvas);
  }
};

const uploadImage = (e: Event, doEmits = true) => {
  try {
    if (!checkBoardAccess()) return;
    
    const target = e.target as HTMLInputElement;
    const file = target.files![0];
    
    if (file!.size > 1024 * 1024) {
      props.parameters.showAlert?.({
        message: 'File size must be less than 1MB',
        type: 'danger',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () {
        if (img.height > 600 && img.height > img.width && !file!.type.includes('jpeg')) {
          props.parameters.showAlert?.({
            message: 'For better performance, please upload the image in JPG format.',
            type: 'danger',
          });
          return;
        }

        let imageWidth = 350;
        const aspectRatio = img.height / img.width;
        let imageHeight = imageWidth * aspectRatio;
        const maxHeight = 600;
        
        if (imageHeight > maxHeight) {
          imageHeight = maxHeight;
          imageWidth = imageHeight / aspectRatio;
          if (imageWidth > 600) {
            imageWidth = 600;
          }
        }
        
        const imageShape = {
          type: 'image',
          img: img,
          src: event!.target!.result as string,
          x1: 50,
          y1: 50,
          x2: 50 + imageWidth,
          y2: 50 + imageHeight,
        };
        
        props.parameters.updateShapes([...props.parameters.shapes, imageShape]);
        drawShapes();
        
        if (doEmits) {
          props.parameters.socket.emit(
            'updateBoardAction',
            { action: 'uploadImage', payload: imageShape },
            handleServerResponse
          );
        }
      };
      img.onerror = function () {
        props.parameters.showAlert?.({ message: 'Error loading image', type: 'danger' });
      };
      img.src = event!.target!.result as string;
    };
    reader.onerror = function () {
      props.parameters.showAlert?.({ message: 'Error reading file', type: 'danger' });
    };
    reader.readAsDataURL(file!);
  } catch (error) {
    console.error('Error in uploadImage:', error);
  }
};

// Socket event handlers
const setupSocketListeners = () => {
  const socket = props.parameters.socket;

  socket.on('whiteboardAction', (data: { action: string; payload: any }) => {
    const { action, payload } = data;

    if (!ctx && canvasRef.value) {
      ctx = canvasRef.value.getContext('2d');
      props.parameters.updateCanvasWhiteboard(canvasRef.value);
    }

    if (!ctx) return;

    switch (action) {
      case 'draw':
        if (payload.type === 'freehand') {
          drawFreehand(payload.points, payload.color, payload.thickness);
          props.parameters.updateShapes([
            ...props.parameters.shapes,
            {
              type: 'freehand',
              points: payload.points,
              color: payload.color,
              thickness: payload.thickness,
            }
          ]);
        } else {
          drawLine(
            payload.x1,
            payload.y1,
            payload.x2,
            payload.y2,
            payload.color,
            payload.thickness,
            payload.lineType
          );
          props.parameters.updateShapes([
            ...props.parameters.shapes,
            {
              type: 'line',
              x1: payload.x1,
              y1: payload.y1,
              x2: payload.x2,
              y2: payload.y2,
              color: payload.color,
              thickness: payload.thickness,
              lineType: payload.lineType,
            }
          ]);
        }
        break;
      case 'shape':
        drawShape(
          payload.type,
          payload.x1,
          payload.y1,
          payload.x2,
          payload.y2,
          payload.color,
          payload.thickness,
          payload.lineType
        );
        props.parameters.updateShapes([
          ...props.parameters.shapes,
          {
            type: payload.type,
            x1: payload.x1,
            y1: payload.y1,
            x2: payload.x2,
            y2: payload.y2,
            color: payload.color,
            thickness: payload.thickness,
            lineType: payload.lineType,
          }
        ]);
        break;
      case 'erase':
        erase(payload.x, payload.y);
        break;
      case 'clear':
        clearCanvas(false);
        break;
      case 'uploadImage': {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () {
          const imageShape = {
            type: 'image',
            img,
            src: payload.src,
            x1: payload.x1,
            y1: payload.y1,
            x2: payload.x2,
            y2: payload.y2,
          };
          props.parameters.updateShapes([...props.parameters.shapes, imageShape]);
          drawShapes();
        };
        img.src = payload.src;
        break;
      }
      case 'toggleBackground':
        toggleBackground(false);
        drawShapes();
        break;
      case 'undo':
        if (props.parameters.shapes.length > 0) {
          const lastShape = props.parameters.shapes[props.parameters.shapes.length - 1]!;
          props.parameters.updateRedoStack([...props.parameters.redoStack, lastShape]);
          props.parameters.updateShapes(props.parameters.shapes.slice(0, -1));
          drawShapes();
        }
        break;
      case 'redo':
        if (props.parameters.redoStack.length > 0) {
          const lastRedo = props.parameters.redoStack[props.parameters.redoStack.length - 1]!;
          props.parameters.updateShapes([...props.parameters.shapes, lastRedo]);
          props.parameters.updateRedoStack(props.parameters.redoStack.slice(0, -1));
          drawShapes();
        }
        break;
      case 'text':
        props.parameters.updateShapes([
          ...props.parameters.shapes,
          {
            type: 'text',
            text: payload.text,
            x: payload.x,
            y: payload.y,
            color: payload.color,
            font: payload.font,
            fontSize: payload.fontSize,
          }
        ]);
        drawShapes();
        break;
      case 'deleteShape':
        {
          const shapes = props.parameters.shapes.filter((shapeItem) => shapeItem !== payload);
          props.parameters.updateShapes(shapes);
          drawShapes();
        }
        break;
      case 'shapes': {
        const oldShapes = props.parameters.shapes.filter((shapeItem) => shapeItem.type === 'image');
        const shapes = payload.shapes.map((shapeItem: Shape) => {
          if (shapeItem.type === 'image') {
            const oldShape = oldShapes.find((old) => old.src === shapeItem.src);
            if (oldShape) {
              return { ...shapeItem, img: oldShape.img };
            } else {
              const img = new Image();
              img.src = shapeItem.src!;
              img.crossOrigin = 'anonymous';
              return { ...shapeItem, img };
            }
          } else {
            return shapeItem;
          }
        });
        props.parameters.updateShapes(shapes);
        drawShapes();
        break;
      }
      default:
        break;
    }
  });

  socket.on('whiteboardUpdated', async (data: any) => {
    try {
      if (props.parameters.islevel === '2' && data.members) {
        const participants = await data.members.filter(
          (participant: any) => participant.isBanned === false
        );
        props.parameters.updateParticipants(participants);
      }

      props.parameters.updateWhiteboardUsers(data.whiteboardUsers);

      const useBoard = data.whiteboardUsers.find(
        (user: WhiteboardUser) => user.name === props.parameters.member && user.useBoard
      )
        ? true
        : false;
        
      if (
        props.parameters.islevel !== '2' &&
        !useBoard &&
        !props.parameters.whiteboardEnded
      ) {
        changeMode('pan');
      }

      if (data.whiteboardData && Object.keys(data.whiteboardData).length > 0) {
        if (data.whiteboardData.shapes) {
          const oldShapes = props.parameters.shapes.filter(
            (shapeItem) => shapeItem.type === 'image'
          );
          const shapes = data.whiteboardData.shapes.map((shapeItem: Shape) => {
            if (shapeItem.type === 'image') {
              const oldShape = oldShapes.find((old) => old.src === shapeItem.src);
              if (oldShape) {
                return { ...shapeItem, img: oldShape.img };
              } else {
                const img = new Image();
                img.src = shapeItem.src!;
                img.crossOrigin = 'anonymous';
                return { ...shapeItem, img };
              }
            } else {
              return shapeItem;
            }
          });
          props.parameters.updateShapes(shapes);
        }
        
        if (data.whiteboardData.useImageBackground != null) {
          props.parameters.updateUseImageBackground(data.whiteboardData.useImageBackground);
        } else {
          props.parameters.updateUseImageBackground(true);
        }
        
        if (data.whiteboardData.redoStack) {
          props.parameters.updateRedoStack(data.whiteboardData.redoStack);
        }
        
        if (data.whiteboardData.undoStack) {
          props.parameters.updateUndoStack(data.whiteboardData.undoStack);
        }
      }

      if (data.status === 'started' && !props.parameters.whiteboardStarted) {
        props.parameters.updateWhiteboardStarted(true);
        props.parameters.updateWhiteboardEnded(false);
        props.parameters.updateScreenId(`whiteboard-${props.parameters.roomName}`);

        if (props.parameters.islevel !== '2') {
          props.parameters.updateShareScreenStarted(true);
          await props.parameters.onScreenChanges({
            changed: true,
            parameters: props.parameters,
          });
        }
      } else if (data.status === 'ended') {
        const prevWhiteboardEnded = props.parameters.whiteboardEnded;
        const prevWhiteboardStarted = props.parameters.whiteboardStarted;
        
        props.parameters.updateWhiteboardStarted(false);
        props.parameters.updateWhiteboardEnded(true);
        
        if (props.parameters.islevel === '2' && prevWhiteboardEnded) {
          // do nothing
        } else {
          props.parameters.updateShareScreenStarted(false);
          props.parameters.updateScreenId('');
          await props.parameters.onScreenChanges({
            changed: true,
            parameters: props.parameters,
          });
        }

        try {
          if (
            prevWhiteboardStarted &&
            props.parameters.islevel === '2' &&
            (props.parameters.recordStarted || props.parameters.recordResumed)
          ) {
            if (
              !(props.parameters.recordPaused || props.parameters.recordStopped)
            ) {
              if (props.parameters.recordingMediaOptions === 'video') {
                await props.parameters.captureCanvasStream({
                  parameters: props.parameters,
                  start: false,
                });
              }
            }
          }
        } catch (error) {
          console.error(error);
        }
      } else if (data.status === 'started' && props.parameters.whiteboardStarted) {
        props.parameters.updateWhiteboardStarted(true);
        props.parameters.updateWhiteboardEnded(false);
        props.parameters.updateShareScreenStarted(true);
        props.parameters.updateScreenId(`whiteboard-${props.parameters.roomName}`);
        await props.parameters.onScreenChanges({
          changed: true,
          parameters: props.parameters,
        });
      }
    } catch (error) {
      console.error('Error in whiteboardUpdated:', error);
    }
  });
};

// Lifecycle hooks
onMounted(() => {
  const img = new Image();
  img.src = imageBackgroundUrl;
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    backgroundImage.value = img;
    drawShapes();
  };

  if (canvasRef.value) {
    const canvas = canvasRef.value;

    try {
      if (
        props.parameters.targetResolution === 'qhd' ||
        props.parameters.targetResolutionHost === 'qhd'
      ) {
        maxWidth.value = 1920;
        maxHeight.value = 1080;
      } else if (
        props.parameters.targetResolution === 'fhd' ||
        props.parameters.targetResolutionHost === 'fhd'
      ) {
        maxWidth.value = 1920;
        maxHeight.value = 1080;
      }
      canvas.width = maxWidth.value;
      canvas.height = maxHeight.value;
      dimensionsFixed.value = true;
    } catch {
      // handle error
    }

    ctx = canvas.getContext('2d');
    props.parameters.updateCanvasWhiteboard(canvas);
  }

  const canvas = canvasRef.value;
  canvas?.addEventListener('mousedown', startDrawing);
  canvas?.addEventListener('mousemove', draw);
  canvas?.addEventListener('mouseup', stopDrawing);
  canvas?.addEventListener('wheel', handleZoom);
  canvas?.addEventListener('click', handleCanvasClick);
  canvas?.addEventListener('touchstart', handleTouchStart);
  canvas?.addEventListener('touchmove', handleTouchMove);
  canvas?.addEventListener('touchend', handleTouchEnd);

  document.addEventListener('mousedown', handleClickOutside);

  setupSocketListeners();
});

onUnmounted(() => {
  const canvas = canvasRef.value;
  canvas?.removeEventListener('mousedown', startDrawing);
  canvas?.removeEventListener('mousemove', draw);
  canvas?.removeEventListener('mouseup', stopDrawing);
  canvas?.removeEventListener('wheel', handleZoom);
  canvas?.removeEventListener('click', handleCanvasClick);
  canvas?.removeEventListener('touchstart', handleTouchStart);
  canvas?.removeEventListener('touchmove', handleTouchMove);
  canvas?.removeEventListener('touchend', handleTouchEnd);

  document.removeEventListener('mousedown', handleClickOutside);

  props.parameters.socket.off('whiteboardAction');
  props.parameters.socket.off('whiteboardUpdated');
});

// Watch for shape changes
watch(
  () => [props.parameters.shapes, panX.value, panY.value, scale.value],
  () => {
    drawShapes();
  },
  { deep: true }
);
</script>

<style scoped>
#whiteboard-interface #whiteboardContent #whiteboardCanvas {
  border: 1px solid #000;
  cursor: crosshair;
  background-color: white;
}

#whiteboard-interface #whiteboardContent .resize-handle,
#whiteboard-interface #whiteboardContent .move-handle {
  width: 8px;
  height: 8px;
  background: red;
  position: absolute;
}

#whiteboard-interface #whiteboardContent .move-handle {
  background: blue;
}

#whiteboard-interface #whiteboardContent #textInput {
  display: none;
  position: absolute;
  z-index: 10;
  width: 200px;
}

#whiteboard-interface #whiteboardContent .shape-icon {
  width: 20px;
  height: 20px;
  color: white;
}

#whiteboard-interface #whiteboardContent .toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

#whiteboard-interface #whiteboardContent .toolbar .btn-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

#whiteboard-interface #whiteboardContent .toolbar .btn-group button,
#whiteboard-interface #whiteboardContent .toolbar .dropdown-menu button {
  font-size: 0.8rem;
  padding: 5px 10px;
  margin: 0 2px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

#whiteboard-interface #whiteboardContent .toolbar .dropdown-menu button {
  background-color: transparent;
  color: rgb(27, 26, 26);
  border: none;
  width: 100%;
  text-align: left;
}

#whiteboard-interface #whiteboardContent .toolbar .btn-group button:hover,
#whiteboard-interface #whiteboardContent .toolbar .dropdown-menu button:hover {
  background-color: #e3e7eb;
}

#whiteboard-interface #whiteboardContent .toolbar .btn-group button.active {
  background-color: #454d55;
}

#whiteboard-interface #whiteboardContent #colorPicker {
  font-size: 0.8rem;
  padding: 2px;
  width: 32px;
  height: 32px;
  border: 1px solid #e4e3e3;
  border-radius: 4px;
}

#whiteboard-interface #whiteboardContent #lineTypePicker {
  font-size: 0.8rem;
  padding: 2px 4px;
  width: 32px;
  height: 32px;
}

#whiteboard-interface #whiteboardContent .custom-select {
  font-size: 0.8rem;
  padding: 2px 4px;
  min-width: 32px;
  height: 32px;
  width: max-content;
}

#whiteboard-interface #whiteboardContent .btnBoard {
  font-size: 1rem;
  padding: 6px 8px;
  min-width: 36px;
  height: 36px;
  margin: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

#whiteboard-interface #whiteboardContent .toggle-icon {
  width: 34px;
  height: 34px;
  padding: 0;
  margin: 0;
}

#whiteboard-interface #whiteboardContent #toggleBackground.active {
  background-color: #fdfeff;
}

.dropdown-menu {
  position: absolute;
  top: 7%;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 0;
  width: max-content;
  padding: 8px 0px;
}

.dropdown-menu.show .dropdown-item {
  padding: 4px 8px !important;
  width: auto;
  min-width: unset;
  display: inline-flex;
  align-items: center;
}

.dropdown-menu.show {
  display: block;
  max-width: 200px !important;
}
</style>