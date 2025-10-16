<!--
/**
 * @fileoverview FlexibleGrid - Dynamic grid layout component for participant cards
 * @component FlexibleGrid
 * @module components/displayComponents/FlexibleGrid
 * 
 * @description
 * A flexible grid layout component that dynamically arranges participant cards
 * in a row/column grid structure. Automatically fills cells with provided components
 * and handles empty cells gracefully. Used extensively for displaying video/audio
 * participants in grid view layouts.
 * 
 * Features:
 * - Dynamic row/column configuration
 * - Automatic cell sizing based on custom dimensions
 * - Empty cell fallback support
 * - Custom render functions for cells, rows, and entire grid
 * - Per-element HTML attribute customization
 * - Responsive to parent container size
 * 
 * @example Basic Grid
 * // <FlexibleGrid
 *   // :customWidth="800"
 *   // :customHeight="600"
 *   // :rows="2"
 *   // :columns="3"
 *   // :componentsToRender="participantComponents"
 * // />
 * 
 * @example With Empty Cell Fallback
 * // <FlexibleGrid
 *   // :customWidth="1200"
 *   // :customHeight="800"
 *   // :rows="3"
 *   // :columns="4"
 *   // :componentsToRender="components"
 *   // :emptyCellFallback="({ row, column }) => 
 *     h('div', { class: 'empty-slot' }, `Empty ${row},${column}`)
 *   "
 * // />
 * 
 * @example With Custom Cell Renderer
 * // <FlexibleGrid
 *   // :customWidth="1000"
 *   // :customHeight="750"
 *   // :rows="2"
 *   // :columns="2"
 *   // :componentsToRender="videoCards"
 *   // :renderCell="({ defaultCell, component, row, column }) =>
 *     h('div', { class: 'custom-cell-wrapper', 'data-pos': `${row}-${column}` }, [defaultCell])
 *   "
 * // />
 */
-->
<template>
  <RenderVNode :node="gridNode" />
</template>

<script setup lang="ts">
import {
  computed,
  defineComponent,
  h,
  isVNode,
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
  /** The default rendered cell with component or fallback */
  defaultCell: VNode;
  /** The component to render in this cell (undefined if empty) */
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
  /** The default rendered row with all cells */
  defaultRow: VNode;
  /** Row index (0-based) */
  rowIndex: number;
  /** Array of cell VNodes in this row */
  cells: VNode[];
}

/**
 * Options passed to renderGrid function
 * @interface RenderGridOptions
 */
interface RenderGridOptions {
  /** The default rendered grid with all rows */
  defaultGrid: VNode;
  /** Array of row VNodes */
  rows: VNode[];
}

/**
 * Context passed to emptyCellFallback function
 * @interface EmptyCellContext
 */
interface EmptyCellContext {
  /** Row index of the empty cell */
  row: number;
  /** Column index of the empty cell */
  column: number;
  /** Flat index that would have been used */
  index: number;
}

/**
 * Props for the FlexibleGrid component
 * @interface FlexibleGridProps
 */
export interface FlexibleGridProps {
  /**
   * Total width of the grid in pixels
   * @example 1200
   */
  customWidth: number;
  
  /**
   * Total height of the grid in pixels
   * @example 800
   */
  customHeight: number;
  
  /**
   * Number of rows in the grid
   * @example 3
   */
  rows: number;
  
  /**
   * Number of columns in the grid
   * @example 4
   */
  columns: number;
  
  /**
   * Array of components to render in grid cells
   * Each component has: { component, props, key }
   * @example
   * ```ts
   * [
   *   { component: VideoCard, props: { name: 'Alice' }, key: 'user-1' },
   *   { component: AudioCard, props: { name: 'Bob' }, key: 'user-2' }
   * ]
   * ```
   */
  componentsToRender: RenderableComponent[];
  
  /**
   * Background color for the grid wrapper
   * @default "transparent"
   */
  backgroundColor?: string;
  
  /**
   * HTML attributes for the grid wrapper element
   */
  gridWrapperProps?: HTMLAttributes;
  
  /**
   * HTML attributes for row elements
   */
  rowProps?: HTMLAttributes;
  
  /**
   * HTML attributes for cell elements
   */
  cellProps?: HTMLAttributes;
  
  /**
   * Content to display in empty cells or function to generate it
   * @example "Empty"
   * @example ({ row, column }) => h('div', `Slot ${row},${column}`)
   */
  emptyCellFallback?: VNodeChild | ((context: EmptyCellContext) => VNodeChild);
  
  /**
   * Custom renderer for individual cells
   * @param options - Cell rendering options
   * @returns Custom VNode for the cell
   */
  renderCell?: (options: RenderCellOptions) => VNodeChild;
  
  /**
   * Custom renderer for rows
   * @param options - Row rendering options
   * @returns Custom VNode for the row
   */
  renderRow?: (options: RenderRowOptions) => VNodeChild;
  
  /**
   * Custom renderer for the entire grid
   * @param options - Grid rendering options
   * @returns Custom VNode for the grid
   */
  renderGrid?: (options: RenderGridOptions) => VNodeChild;
}

const props = withDefaults(defineProps<FlexibleGridProps>(), {
  backgroundColor: 'transparent',
  gridWrapperProps: () => ({}),
  rowProps: () => ({}),
  cellProps: () => ({}),
  emptyCellFallback: undefined,
  renderCell: undefined,
  renderRow: undefined,
  renderGrid: undefined,
});

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

// =========================
// Grid Wrapper Props Merging
// =========================
const gridRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.gridWrapperProps || {};
  return rest;
});

const gridClassNames = computed(() =>
  joinClassNames('mediasfu-flexible-grid', props.gridWrapperProps?.class)
);

const gridStyle = computed(() => {
  const widthPx = `${props.columns * props.customWidth}px`;
  const heightPx = `${props.rows * props.customHeight}px`;

  return {
    padding: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    width: widthPx,
    maxWidth: '100%',
    height: heightPx,
    maxHeight: '100%',
    ...(typeof props.gridWrapperProps?.style === 'object' ? props.gridWrapperProps.style : {}),
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
  joinClassNames('mediasfu-flexible-grid__row', props.rowProps?.class)
);

const rowStyle = computed(() => ({
  display: 'flex',
  flexDirection: 'row' as const,
  width: '100%',
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
  joinClassNames('mediasfu-flexible-grid__cell', props.cellProps?.class)
);

const cellStyle = computed(() => {
  const widthPx = `${props.customWidth}px`;
  const heightPx = `${props.customHeight}px`;

  return {
    flex: 1,
    width: widthPx,
    height: heightPx,
    minWidth: widthPx,
    minHeight: heightPx,
    backgroundColor: props.backgroundColor,
    margin: '1px',
    padding: 0,
    borderRadius: '8px',
    ...(typeof props.cellProps?.style === 'object' ? props.cellProps.style : {}),
  } as CSSProperties;
});

// =========================
// Get Empty Cell Fallback
// =========================
const getEmptyCell = (row: number, column: number, index: number): VNodeChild => {
  if (typeof props.emptyCellFallback === 'function') {
    return props.emptyCellFallback({ row, column, index });
  }
  return props.emptyCellFallback ?? null;
};

// =========================
// Render Grid Rows
// =========================
const gridRows = computed<VNode[]>(() => {
  const rowsNodes: VNode[] = [];

  for (let row = 0; row < props.rows; row++) {
    const cells: VNode[] = [];

    for (let col = 0; col < props.columns; col++) {
      const index = row * props.columns + col;
      const component = props.componentsToRender[index];
      
      // Render component content
      const content = component 
        ? h(component.component, component.props ?? {})
        : getEmptyCell(row, col, index);
      
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
        cells.push(renderedCell);
      } else {
        cells.push(h('div', { key: `${row}-${col}` }, [renderedCell]));
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
      cells
    );

    const renderedRow = props.renderRow
      ? props.renderRow({ defaultRow, rowIndex: row, cells })
      : defaultRow;

    if (isVNode(renderedRow)) {
      rowsNodes.push(renderedRow);
    } else {
      rowsNodes.push(h('div', { key: row }, [renderedRow]));
    }
  }

  return rowsNodes;
});

// =========================
// Final Grid Node
// =========================
const gridNode = computed<VNode>(() => {
  const defaultGrid = h(
    'div',
    {
      class: gridClassNames.value,
      style: gridStyle.value,
      ...gridRestAttrs.value,
    },
    gridRows.value
  );

  if (props.renderGrid) {
    const result = props.renderGrid({
      defaultGrid,
      rows: gridRows.value,
    });
    if (isVNode(result)) return result;
  }
  return defaultGrid;
});

</script>
