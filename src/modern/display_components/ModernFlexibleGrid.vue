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

interface EmptyCellContext {
  row: number;
  column: number;
  index: number;
}

interface RenderCellOptions {
  defaultCell: VNode;
  component: RenderableComponent | undefined;
  row: number;
  column: number;
  index: number;
}

interface RenderRowOptions {
  defaultRow: VNode;
  rowIndex: number;
  cells: VNode[];
}

interface RenderGridOptions {
  defaultGrid: VNode;
  rows: VNode[];
}

export interface ModernFlexibleGridProps {
  customWidth: number;
  customHeight: number;
  rows: number;
  columns: number;
  componentsToRender: RenderableComponent[];
  backgroundColor?: string;
  gridWrapperProps?: HTMLAttributes;
  rowProps?: HTMLAttributes;
  cellProps?: HTMLAttributes;
  emptyCellFallback?: VNodeChild | ((context: EmptyCellContext) => VNodeChild);
  renderCell?: (options: RenderCellOptions) => VNodeChild;
  renderRow?: (options: RenderRowOptions) => VNodeChild;
  renderGrid?: (options: RenderGridOptions) => VNodeChild;
  isDarkMode?: boolean;
  enableGlassmorphism?: boolean;
  cellBorderRadius?: number;
}

const RenderVNode = defineComponent({
  name: 'RenderVNode',
  props: {
    node: {
      type: null as unknown as PropType<VNodeChild>,
      required: true,
    },
  },
  setup(renderProps) {
    return () => renderProps.node;
  },
});

const props = withDefaults(defineProps<ModernFlexibleGridProps>(), {
  backgroundColor: 'transparent',
  isDarkMode: true,
  enableGlassmorphism: true,
  cellBorderRadius: 8,
});

const emptyCellBackgroundColor = computed(() => {
  if (props.enableGlassmorphism) {
    return props.isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
  }

  return props.backgroundColor;
});

const emptyCellBorderColor = computed(() => {
  if (!props.enableGlassmorphism) {
    return undefined;
  }

  return props.isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
});

const gridBaseStyle = computed<CSSProperties>(() => ({
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  width: `${props.columns * props.customWidth}px`,
  maxWidth: '100%',
  height: `${props.rows * props.customHeight}px`,
  maxHeight: '100%',
}));

const rowBaseStyle = computed<CSSProperties>(() => ({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
}));

const filledCellContentStyle = computed<CSSProperties>(() => ({
  width: '100%',
  height: '100%',
  borderRadius: `${props.cellBorderRadius}px`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const gridRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.gridWrapperProps ?? {};
  return rest;
});

const rowRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.rowProps ?? {};
  return rest;
});

const cellRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.cellProps ?? {};
  return rest;
});

const normalizeChildren = (node: VNodeChild): VNodeChild[] => {
  if (Array.isArray(node)) {
    return node;
  }

  if (node === null || node === undefined || node === false) {
    return [];
  }

  return [node];
};

const renderComponentNode = (component: RenderableComponent): VNode =>
  h(component.component, {
    ...(component.props ?? {}),
    key: component.key,
  });

const getCellStyle = (hasContent: boolean): CSSProperties => ({
  flex: 1,
  width: `${props.customWidth}px`,
  height: `${props.customHeight}px`,
  minWidth: `${props.customWidth}px`,
  minHeight: `${props.customHeight}px`,
  backgroundColor: hasContent ? props.backgroundColor : emptyCellBackgroundColor.value,
  margin: '1px',
  padding: 0,
  borderRadius: `${props.cellBorderRadius}px`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...(!hasContent && props.enableGlassmorphism && emptyCellBorderColor.value
    ? { border: `1px solid ${emptyCellBorderColor.value}` }
    : {}),
});

const buildDefaultEmptyCell = ({ row, column, index }: EmptyCellContext) =>
  h(
    'div',
    {
      class: 'ms-modern-flexible-grid__empty',
      'data-row': row,
      'data-column': column,
      'data-index': index,
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '18px',
      } satisfies CSSProperties,
    },
    [
      h(
        'div',
        {
          style: {
            width: '40px',
            height: '40px',
            borderRadius: '999px',
            background: props.isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          } satisfies CSSProperties,
        },
        [
          h(
            'svg',
            {
              width: '20',
              height: '20',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: props.isDarkMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.15)',
              'stroke-width': '2',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
            },
            [
              h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
              h('circle', { cx: '12', cy: '7', r: '4' }),
            ]
          ),
        ]
      ),
    ]
  );

const getEmptyCell = (row: number, column: number, index: number): VNodeChild => {
  if (typeof props.emptyCellFallback === 'function') {
    return props.emptyCellFallback({ row, column, index });
  }

  if (
    props.emptyCellFallback !== undefined
    && props.emptyCellFallback !== null
    && props.emptyCellFallback !== false
  ) {
    return props.emptyCellFallback;
  }

  return buildDefaultEmptyCell({ row, column, index });
};

const gridRows = computed<VNode[]>(() => {
  const rowsNodes: VNode[] = [];

  for (let row = 0; row < props.rows; row += 1) {
    const cells: VNode[] = [];

    for (let column = 0; column < props.columns; column += 1) {
      const index = row * props.columns + column;
      const component = props.componentsToRender[index];
      const hasContent = component !== undefined && component !== null;
      const content = hasContent
        ? renderComponentNode(component)
        : getEmptyCell(row, column, index);
      const cellKey = component?.key ?? `${row}-${column}`;

      const defaultCell = h(
        'div',
        {
          key: cellKey,
          class: ['modern-flexible-grid__cell', props.cellProps?.class],
          style: [getCellStyle(hasContent), props.cellProps?.style],
          ...cellRestAttrs.value,
        },
        hasContent
          ? [
              h(
                'div',
                {
                  style: filledCellContentStyle.value,
                },
                [content],
              ),
            ]
          : [content],
      );

      const renderedCell = props.renderCell
        ? props.renderCell({
            defaultCell,
            component,
            row,
            column,
            index,
          })
        : defaultCell;

      if (isVNode(renderedCell)) {
        cells.push(renderedCell);
      } else {
        cells.push(h('div', { key: cellKey }, normalizeChildren(renderedCell)));
      }
    }

    const defaultRow = h(
      'div',
      {
        key: row,
        class: ['modern-flexible-grid__row', props.rowProps?.class],
        style: [rowBaseStyle.value, props.rowProps?.style],
        ...rowRestAttrs.value,
      },
      cells,
    );

    const renderedRow = props.renderRow
      ? props.renderRow({
          defaultRow,
          rowIndex: row,
          cells,
        })
      : defaultRow;

    if (isVNode(renderedRow)) {
      rowsNodes.push(renderedRow);
    } else {
      rowsNodes.push(h('div', { key: row }, normalizeChildren(renderedRow)));
    }
  }

  return rowsNodes;
});

const defaultGrid = computed<VNode>(() =>
  h(
    'div',
    {
      class: ['modern-flexible-grid', props.gridWrapperProps?.class],
      style: [gridBaseStyle.value, props.gridWrapperProps?.style],
      ...gridRestAttrs.value,
    },
    gridRows.value,
  ),
);

const gridNode = computed<VNodeChild>(() => {
  if (props.rows <= 0 || props.columns <= 0) {
    return null;
  }

  return props.renderGrid
    ? props.renderGrid({
        defaultGrid: defaultGrid.value,
        rows: gridRows.value,
      })
    : defaultGrid.value;
});
</script>
