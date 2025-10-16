<!--
/**
 * @fileoverview FlexibleVideo - Grid layout with screenboard overlay support
 * @component FlexibleVideo
 * @module components/displayComponents/FlexibleVideo
 * 
 * @description
 * Advanced grid layout component that extends FlexibleGrid with screenboard/whiteboard
 * overlay support. Handles screen sharing annotations and dynamically positions the
 * screenboard over the main grid view. Used in main grid areas for primary video display.
 * 
 * Features:
 * - Dynamic grid layout for participant cards
 * - Screenboard overlay slot for annotations and whiteboards
 * - Automatic positioning for screen share streams
 * - Responsive to video track dimensions
 * - Custom render functions for cells, rows, grid, and screenboard
 * - Visibility toggle support
 * 
 * @example Basic Video Grid
 * // <FlexibleVideo
 *   // :customWidth="1200"
 *   // :customHeight="800"
 *   // :rows="2"
 *   // :columns="2"
 *   // :componentsToRender="videoComponents"
 *   // :showAspect="true"
 * // />
 * 
 * @example With Screen Share Annotation
 * // <FlexibleVideo
 *   // :customWidth="1920"
 *   // :customHeight="1080"
 *   // :rows="1"
 *   // :columns="1"
 *   // :componentsToRender="mainVideoStream"
 *   // :showAspect="true"
 *   // :annotateScreenStream="true"
 *   // :localStreamScreen="screenShareStream"
 * >
 *   <template #Screenboard>
 *     <Screenboard
 *       :customWidth="screenWidth"
 *       :customHeight="screenHeight"
 *       :parameters="parameters"
 *       :showAspect="isScreenSharing"
 *     />
 *   </template>
 * // </FlexibleVideo>
 * 
 * @example With Custom Cell Renderer
 * // <FlexibleVideo
 *   // :customWidth="1600"
 *   // :customHeight="900"
 *   // :rows="3"
 *   // :columns="3"
 *   // :componentsToRender="participants"
 *   // :showAspect="true"
 *   // :renderCell="({ defaultCell, component, row, column }) =>
 *     h('div', { 
 *       class: 'spotlight-cell',
 *       'data-speaker': component?.props?.isSpeaking 
 *     }, [defaultCell])
 *   "
 * // />
 */
-->
<template>
  <RenderVNode :node="gridNode" />
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  defineComponent,
  h,
  isVNode,
  useSlots,
  type CSSProperties,
  type HTMLAttributes,
  type PropType,
  type VNode,
  type VNodeChild,
} from 'vue';
import type { RenderableComponent } from '../../types/renderable-component';

/**
 * Options passed to renderCell function
 * @interface RenderCellOptions
 */
interface RenderCellOptions {
  /** The default rendered cell */
  defaultCell: VNode;
  /** The component to render (undefined if empty) */
  component: RenderableComponent | undefined;
  /** Row index (0-based) */
  row: number;
  /** Column index (0-based) */
  column: number;
  /** Flat index in componentsToRender array */
  index: number;
}

/**
 * Options passed to renderRow function
 * @interface RenderRowOptions
 */
interface RenderRowOptions {
  /** The default rendered row */
  defaultRow: VNode;
  /** Row index (0-based) */
  rowIndex: number;
  /** Array of cell VNodes */
  cells: VNode[];
}

/**
 * Options passed to renderGrid function
 * @interface RenderGridOptions
 */
interface RenderGridOptions {
  /** The default rendered grid */
  defaultGrid: VNode;
  /** Array of row VNodes */
  rows: VNode[];
}

/**
 * Options passed to renderScreenboard function
 * @interface RenderScreenboardOptions
 */
interface RenderScreenboardOptions {
  /** The default screenboard slot content (null if no slot) */
  defaultScreenboard: VNode | null;
}

/**
 * Props for the FlexibleVideo component
 * @interface FlexibleVideoProps
 */
export interface FlexibleVideoProps {
  /**
   * Total width in pixels
   * @example 1920
   */
  customWidth: number;
  
  /**
   * Total height in pixels
   * @example 1080
   */
  customHeight: number;
  
  /**
   * Number of grid rows
   * @example 2
   */
  rows: number;
  
  /**
   * Number of grid columns
   * @example 2
   */
  columns: number;
  
  /**
   * Array of components to render in grid
   * @example [{ component: VideoCard, props: { name: 'Alice' }, key: '1' }]
   */
  componentsToRender: RenderableComponent[];
  
  /**
   * Whether to show the component (visibility control)
   * @default false
   */
  showAspect: boolean;
  
  /**
   * Background color for the grid
   * @default "transparent"
   */
  backgroundColor?: string;
  
  /**
   * Whether screen share stream should be annotated
   * Adjusts positioning for screenboard overlay
   * @default false
   */
  annotateScreenStream?: boolean;
  
  /**
   * The local screen share MediaStream for annotation
   * @default null
   */
  localStreamScreen?: MediaStream | null;
  
  /**
   * HTML attributes for the outer container
   */
  containerProps?: HTMLAttributes;
  
  /**
   * HTML attributes for row elements
   */
  rowProps?: HTMLAttributes;
  
  /**
   * HTML attributes for cell elements
   */
  cellProps?: HTMLAttributes;
  
  /**
   * HTML attributes for the screenboard container
   */
  screenboardContainerProps?: HTMLAttributes;
  
  /**
   * Custom renderer for individual cells
   */
  renderCell?: (options: RenderCellOptions) => VNodeChild;
  
  /**
   * Custom renderer for rows
   */
  renderRow?: (options: RenderRowOptions) => VNodeChild;
  
  /**
   * Custom renderer for the entire grid
   */
  renderGrid?: (options: RenderGridOptions) => VNodeChild;
  
  /**
   * Custom renderer for screenboard overlay
   * @param options - Screenboard rendering options
   * @returns Custom VNode for screenboard area
   */
  renderScreenboard?: (options: RenderScreenboardOptions) => VNodeChild;
}

const props = withDefaults(defineProps<FlexibleVideoProps>(), {
  backgroundColor: 'transparent',
  showAspect: false,
  annotateScreenStream: false,
  localStreamScreen: null,
  containerProps: () => ({}),
  rowProps: () => ({}),
  cellProps: () => ({}),
  screenboardContainerProps: () => ({}),
  renderCell: undefined,
  renderRow: undefined,
  renderGrid: undefined,
  renderScreenboard: undefined,
});

const cardWidth = ref(0);
const cardHeight = ref(0);
const cardLeft = ref(0);
const canvasLeft = ref(0);

const slots = useSlots();

// Wrapper component for flexible VNodeChild rendering
const RenderVNode = defineComponent({
  name: 'RenderVNode',
  props: {
    node: {
      type: [Object, String, Number, Boolean, Array] as PropType<VNodeChild>,
      default: undefined,
    },
  },
  render() {
    if (isVNode(this.node)) {
      return this.node;
    }
    if (typeof this.node === 'string' || typeof this.node === 'number') {
      return String(this.node);
    }
    return null;
  },
});

// Helper to join class names
function joinClassNames(...classes: (string | string[] | undefined)[]): string | undefined {
  const result: string[] = [];
  classes.forEach((cls) => {
    if (!cls) return;
    if (Array.isArray(cls)) {
      result.push(...cls);
    } else {
      result.push(cls);
    }
  });
  const filtered = result.join(' ').trim();
  return filtered.length > 0 ? filtered : undefined;
}

// Watch for dimension and stream changes
watch(
  [
    () => props.customWidth,
    () => props.customHeight,
    () => props.localStreamScreen,
    () => props.annotateScreenStream,
  ],
  () => {
    if (props.annotateScreenStream && props.localStreamScreen) {
      const localStream = props.localStreamScreen;
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        const videoHeight = settings.height || 0;
        const videoWidth = settings.width || 0;
        cardWidth.value = videoWidth;
        cardHeight.value = videoHeight;
        const computedLeft = Math.floor((props.customWidth - videoWidth) / 2);
        cardLeft.value = computedLeft;
        canvasLeft.value = computedLeft < 0 ? computedLeft : 0;
      }
    } else {
      cardWidth.value = props.customWidth;
      cardHeight.value = props.customHeight;
      cardLeft.value = 0;
      canvasLeft.value = 0;
    }
  },
  { immediate: true }
);

// =========================
// Container Props Merging
// =========================
const containerRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.containerProps || {};
  return rest;
});

const containerClassNames = computed(() =>
  joinClassNames('mediasfu-flexible-video', props.containerProps?.class)
);

const containerStyle = computed(() => {
  const widthPx = `${props.customWidth}px`;
  const heightPx = `${props.customHeight}px`;

  return {
    padding: 0,
    flex: 1,
    margin: 0,
    position: 'relative' as const,
    display: props.showAspect ? 'flex' : 'none',
    width: widthPx,
    minWidth: widthPx,
    maxWidth: widthPx,
    height: heightPx,
    minHeight: heightPx,
    maxHeight: heightPx,
    justifyContent: 'center',
    alignItems: 'center',
    overflowX: 'hidden' as const,
    overflowY: 'hidden' as const,
    boxSizing: 'border-box',
    left: cardLeft.value > 0 ? `${cardLeft.value}px` : 0,
    ...(typeof props.containerProps?.style === 'object' ? props.containerProps.style : {}),
  } as CSSProperties;
});

// =========================
// Row Props Merging
// =========================
const rowRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.rowProps || {};
  return rest;
});

const rowClassNames = computed(() =>
  joinClassNames('mediasfu-flexible-video__row', props.rowProps?.class)
);

const rowStyle = computed(() => ({
  display: 'flex',
  flexDirection: 'row' as const,
  width: '100%',
  height: '100%',
  justifyContent: props.columns > 1 ? 'space-between' : 'center',
  alignItems: 'center',
  ...(typeof props.rowProps?.style === 'object' ? props.rowProps.style : {}),
} as CSSProperties));

// =========================
// Cell Props Merging
// =========================
const cellRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.cellProps || {};
  return rest;
});

const cellClassNames = computed(() =>
  joinClassNames('mediasfu-flexible-video__cell', props.cellProps?.class)
);

const cellStyle = computed(() => {
  const widthPx = `${cardWidth.value}px`;
  const heightPx = `${cardHeight.value}px`;

  return {
    flex: 1,
    width: widthPx,
    height: heightPx,
    maxWidth: widthPx,
    maxHeight: heightPx,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: props.backgroundColor,
    margin: '1px',
    padding: 0,
    borderRadius: '0px',
    boxSizing: 'border-box',
    ...(typeof props.cellProps?.style === 'object' ? props.cellProps.style : {}),
  } as CSSProperties;
});

// =========================
// Render Grid Rows
// =========================
const rowsContent = computed<VNode[]>(() => {
  const rows: VNode[] = [];

  for (let row = 0; row < props.rows; row++) {
    const rowCells: VNode[] = [];

    for (let col = 0; col < props.columns; col++) {
      const index = row * props.columns + col;
      const component = props.componentsToRender[index];
      
      // Render component content
      const content = component ? h(component.component, component.props ?? {}) : null;
      const componentKey = component?.key ?? `${row}-${col}`;
      const cellKey = componentKey;

      const defaultCell = h(
        'div',
        {
          key: cellKey,
          class: cellClassNames.value,
          style: cellStyle.value,
          ...cellRestAttrs.value,
        },
        [content]
      );

      const renderedCell = props.renderCell
        ? props.renderCell({
            defaultCell,
            component,
            row,
            column: col,
            index,
          })
        : defaultCell;

      if (isVNode(renderedCell)) {
        rowCells.push(renderedCell);
      } else {
        rowCells.push(h('div', { key: `${row}-${col}` }, [renderedCell]));
      }
    }

    const defaultRow = h(
      'div',
      {
        key: row,
        class: rowClassNames.value,
        style: rowStyle.value,
        ...rowRestAttrs.value,
      },
      rowCells
    );

    const renderedRow = props.renderRow
      ? props.renderRow({ defaultRow, rowIndex: row, cells: rowCells })
      : defaultRow;

    if (isVNode(renderedRow)) {
      rows.push(renderedRow);
    } else {
      rows.push(h('div', { key: row }, [renderedRow]));
    }
  }

  return rows;
});

// =========================
// Screenboard Props Merging
// =========================
const screenboardRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.screenboardContainerProps || {};
  return rest;
});

const screenboardClassNames = computed(() =>
  joinClassNames('mediasfu-flexible-video__screenboard', props.screenboardContainerProps?.class)
);

const screenboardStyle = computed(() => {
  const widthPx = `${cardWidth.value}px`;
  const heightPx = `${cardHeight.value}px`;

  return {
    position: 'absolute' as const,
    top: 0,
    left: `${canvasLeft.value}px`,
    width: widthPx,
    minWidth: widthPx,
    maxWidth: widthPx,
    height: heightPx,
    minHeight: heightPx,
    maxHeight: heightPx,
    backgroundColor: 'rgba(0, 0, 0, 0.005)',
    zIndex: 2,
    pointerEvents: 'auto' as const,
    ...(typeof props.screenboardContainerProps?.style === 'object'
      ? props.screenboardContainerProps.style
      : {}),
  } as CSSProperties;
});

// =========================
// Screenboard Node
// =========================
const screenboardNode = computed<VNode | null>(() => {
  if (!slots.Screenboard) {
    return null;
  }

  const defaultScreenboard = h(
    'div',
    {
      class: screenboardClassNames.value,
      style: screenboardStyle.value,
      ...screenboardRestAttrs.value,
    },
    slots.Screenboard()
  );

  if (props.renderScreenboard) {
    const result = props.renderScreenboard({ defaultScreenboard });
    if (isVNode(result)) return result;
  }
  return defaultScreenboard;
});

// =========================
// Final Grid Node
// =========================
const gridNode = computed<VNode>(() => {
  const defaultGrid = h(
    'div',
    {
      class: containerClassNames.value,
      style: containerStyle.value,
      ...containerRestAttrs.value,
    },
    [...rowsContent.value, screenboardNode.value]
  );

  if (props.renderGrid) {
    const result = props.renderGrid({
      defaultGrid,
      rows: rowsContent.value,
    });
    if (isVNode(result)) return result;
  }
  return defaultGrid;
});

</script>
