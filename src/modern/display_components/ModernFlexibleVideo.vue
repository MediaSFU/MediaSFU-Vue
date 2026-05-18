<template>
  <RenderVNode :node="gridNode" />
</template>

<script setup lang="ts">
import {
  computed,
  defineComponent,
  h,
  isVNode,
  useSlots,
  watch,
  ref,
  type CSSProperties,
  type HTMLAttributes,
  type PropType,
  type VNode,
  type VNodeChild,
} from 'vue';
import type { RenderableComponent } from '../../types/renderable-component';
import { mergeAttrObjects } from './styleUtils';

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

interface RenderScreenboardOptions {
  defaultScreenboard: VNode | null;
}

export interface ModernFlexibleVideoProps {
  customWidth: number;
  customHeight: number;
  rows: number;
  columns: number;
  componentsToRender: RenderableComponent[];
  showAspect: boolean;
  backgroundColor?: string;
  annotateScreenStream?: boolean;
  localStreamScreen?: MediaStream | null;
  containerProps?: HTMLAttributes;
  rowProps?: HTMLAttributes;
  cellProps?: HTMLAttributes;
  screenboardContainerProps?: HTMLAttributes;
  renderCell?: (options: RenderCellOptions) => VNodeChild;
  renderRow?: (options: RenderRowOptions) => VNodeChild;
  renderGrid?: (options: RenderGridOptions) => VNodeChild;
  renderScreenboard?: (options: RenderScreenboardOptions) => VNodeChild;
  isDarkMode?: boolean;
  enableGlassmorphism?: boolean;
  cellBorderRadius?: number;
  enableGlow?: boolean;
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

const props = withDefaults(defineProps<ModernFlexibleVideoProps>(), {
  backgroundColor: 'transparent',
  annotateScreenStream: false,
  localStreamScreen: null,
  containerProps: undefined,
  rowProps: undefined,
  cellProps: undefined,
  screenboardContainerProps: undefined,
  renderCell: undefined,
  renderRow: undefined,
  renderGrid: undefined,
  renderScreenboard: undefined,
  isDarkMode: true,
  enableGlassmorphism: true,
  cellBorderRadius: 0,
  enableGlow: false,
});

const slots = useSlots();

const cardWidth = ref(0);
const cardHeight = ref(0);
const cardLeft = ref(0);
const canvasLeft = ref(0);

watch(
  [
    () => props.customWidth,
    () => props.customHeight,
    () => props.localStreamScreen,
    () => props.annotateScreenStream,
  ],
  () => {
    if (props.annotateScreenStream && props.localStreamScreen) {
      const videoTrack = props.localStreamScreen.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        const videoHeight = settings.height || 0;
        const videoWidth = settings.width || 0;
        cardWidth.value = videoWidth;
        cardHeight.value = videoHeight;
        const computedLeft = Math.floor((props.customWidth - videoWidth) / 2);
        cardLeft.value = computedLeft;
        canvasLeft.value = computedLeft < 0 ? computedLeft : 0;
        return;
      }
    }

    cardWidth.value = props.customWidth;
    cardHeight.value = props.customHeight;
    cardLeft.value = 0;
    canvasLeft.value = 0;
  },
  { immediate: true },
);

const panelBorder = computed(() =>
  props.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
);

const panelBackground = computed(() =>
  props.enableGlassmorphism
    ? props.isDarkMode
      ? 'rgba(30, 30, 40, 0.6)'
      : 'rgba(255, 255, 255, 0.6)'
    : resolvedBackgroundColor.value
);

const resolvedBackgroundColor = computed(() => {
  const color = props.backgroundColor ?? 'transparent';
  if (color.includes('217, 227, 234') || color.includes('181, 233, 229')) {
    return props.isDarkMode
      ? 'var(--ms-modern-page-background)'
      : 'var(--ms-modern-page-background-accent)';
  }

  return color;
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

const defaultContainerProps = computed<HTMLAttributes>(() => ({
  class: 'modern-flexible-video',
  style: {
    padding: 0,
    flex: 1,
    margin: 0,
    position: 'relative',
    display: props.showAspect ? 'flex' : 'none',
    flexDirection: 'column',
    width: `${props.customWidth}px`,
    minWidth: `${props.customWidth}px`,
    maxWidth: `${props.customWidth}px`,
    height: `${props.customHeight}px`,
    minHeight: `${props.customHeight}px`,
    maxHeight: `${props.customHeight}px`,
    justifyContent: 'center',
    alignItems: 'center',
    overflowX: 'hidden',
    overflowY: 'hidden',
    boxSizing: 'border-box',
    left: cardLeft.value > 0 ? `${cardLeft.value}px` : 0,
    borderRadius: props.cellBorderRadius > 0 ? `${props.cellBorderRadius}px` : '0px',
  } satisfies CSSProperties,
}));

const defaultRowProps = computed<HTMLAttributes>(() => ({
  class: 'modern-flexible-video__row',
  style: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    justifyContent: props.columns > 1 ? 'space-between' : 'center',
    alignItems: 'center',
  } satisfies CSSProperties,
}));

const defaultScreenboardContainerProps = computed<HTMLAttributes>(() => ({
  class: 'modern-flexible-video__screenboard',
  style: {
    position: 'absolute',
    top: 0,
    left: `${canvasLeft.value}px`,
    width: `${cardWidth.value}px`,
    height: `${cardHeight.value}px`,
    backgroundColor: 'rgba(0, 0, 0, 0.005)',
    zIndex: 2,
    pointerEvents: 'none',
    borderRadius: props.cellBorderRadius > 0 ? `${props.cellBorderRadius}px` : '0px',
    overflow: 'hidden',
  } satisfies CSSProperties,
}));

const mergedContainerProps = computed(() =>
  mergeAttrObjects(defaultContainerProps.value, props.containerProps)
);

const mergedRowProps = computed(() =>
  mergeAttrObjects(defaultRowProps.value, props.rowProps)
);

const mergedScreenboardContainerProps = computed(() =>
  mergeAttrObjects(defaultScreenboardContainerProps.value, props.screenboardContainerProps)
);

const getCellBgColor = (hasContent: boolean): string => {
  if (hasContent) {
    return resolvedBackgroundColor.value;
  }

  if (props.enableGlassmorphism) {
    return props.isDarkMode ? 'rgba(30, 30, 40, 0.6)' : 'rgba(255, 255, 255, 0.6)';
  }

  return resolvedBackgroundColor.value;
};

const getCellStyle = (hasContent: boolean): CSSProperties => ({
  flex: 1,
  width: `${cardWidth.value}px`,
  height: `${cardHeight.value}px`,
  minWidth: `${cardWidth.value}px`,
  minHeight: `${cardHeight.value}px`,
  maxWidth: `${cardWidth.value}px`,
  maxHeight: `${cardHeight.value}px`,
  backgroundColor: getCellBgColor(hasContent),
  margin: '1px',
  padding: 0,
  borderRadius: props.cellBorderRadius > 0 ? `${props.cellBorderRadius}px` : '0px',
  left: `${cardLeft.value}px`,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
  ...(!hasContent && props.enableGlassmorphism
    ? {
        border: `1px solid ${panelBorder.value}`,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }
    : {}),
  ...(props.enableGlow
    ? {
        boxShadow: '0 4px 16px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.10)',
      }
    : {}),
});

const buildDefaultEmptyCell = () =>
  h(
    'div',
    {
      class: 'ms-modern-flexible-video__empty',
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      } satisfies CSSProperties,
    },
    [
      h(
        'div',
        {
          style: {
            width: '48px',
            height: '48px',
            borderRadius: '999px',
            background: props.isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'none',
          } satisfies CSSProperties,
        },
        [
          h(
            'svg',
            {
              width: '28',
              height: '28',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: props.isDarkMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)',
              'stroke-width': '2',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
            },
            [
              h('path', { d: 'M10.66 6H14a2 2 0 0 1 2 2v2.34l1 1L22 8v8' }),
              h('path', { d: 'M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2' }),
              h('line', { x1: '2', y1: '2', x2: '22', y2: '22' }),
            ]
          ),
        ]
      ),
    ]
  );

const rowsContent = computed<VNode[]>(() => {
  const rows: VNode[] = [];

  for (let row = 0; row < props.rows; row += 1) {
    const rowCells: VNode[] = [];

    for (let column = 0; column < props.columns; column += 1) {
      const index = row * props.columns + column;
      const component = props.componentsToRender[index];
      const hasContent = component !== undefined && component !== null;
      const cellKey = component?.key ?? `${row}-${column}`;
      const mergedCellProps = mergeAttrObjects(
        {
          class: 'modern-flexible-video__cell',
          style: getCellStyle(hasContent),
        } satisfies HTMLAttributes,
        props.cellProps,
      );

      const defaultCell = h(
        'div',
        {
          ...mergedCellProps,
          key: cellKey,
        },
        hasContent
          ? [
              h(
                'div',
                {
                  style: {
                    width: '100%',
                    height: '100%',
                    borderRadius: props.cellBorderRadius > 0 ? `${props.cellBorderRadius}px` : '0px',
                    overflow: 'hidden',
                  } satisfies CSSProperties,
                },
                [renderComponentNode(component)]
              ),
            ]
          : [buildDefaultEmptyCell()]
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
        rowCells.push(renderedCell);
      } else {
        rowCells.push(h('div', { key: `${row}-${column}` }, normalizeChildren(renderedCell)));
      }
    }

    const defaultRow = h(
      'div',
      {
        ...mergedRowProps.value,
        key: row,
      },
      rowCells
    );

    const renderedRow = props.renderRow
      ? props.renderRow({
          defaultRow,
          rowIndex: row,
          cells: rowCells,
        })
      : defaultRow;

    if (isVNode(renderedRow)) {
      rows.push(renderedRow);
    } else {
      rows.push(h('div', { key: row }, normalizeChildren(renderedRow)));
    }
  }

  return rows;
});

const screenboardNode = computed<VNodeChild | null>(() => {
  if (!slots.Screenboard) {
    return null;
  }

  const defaultScreenboard = h(
    'div',
    mergedScreenboardContainerProps.value,
    slots.Screenboard()
  );

  return props.renderScreenboard
    ? props.renderScreenboard({ defaultScreenboard })
    : defaultScreenboard;
});

const gridNode = computed<VNodeChild>(() => {
  const defaultGrid = h(
    'div',
    mergedContainerProps.value,
    screenboardNode.value
      ? [...rowsContent.value, ...normalizeChildren(screenboardNode.value)]
      : rowsContent.value
  );

  return props.renderGrid
    ? props.renderGrid({
        defaultGrid,
        rows: rowsContent.value,
      })
    : defaultGrid;
});
</script>
