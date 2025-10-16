<!--
/**
 * @fileoverview AudioGrid - Grid layout for audio-only participant cards
 * @component AudioGrid
 * @module components/displayComponents/AudioGrid
 * 
 * @description
 * Specialized grid component for displaying audio-only participant cards.
 * Uses CSS Grid with automatic column sizing for responsive layout.
 * Optimized for showing multiple audio participants without video streams.
 * 
 * Features:
 * - CSS Grid-based layout with automatic column sizing
 * - Responsive gap spacing (12px)
 * - High z-index for overlay positioning
 * - Custom render functions for items and container
 * - Minimal styling for maximum flexibility
 * 
 * @example Basic Audio Grid
 * // <AudioGrid
 *   // :componentsToRender="audioParticipants"
 * // />
 * 
 * @example With Custom Item Wrapper
 * // <AudioGrid
 *   // :componentsToRender="audioCards"
 *   // :renderItem="({ component, index, defaultItem }) =>
 *     h('div', { class: `audio-${index}`, 'data-speaker': isSpeaking(index) }, [component])
 *   "
 * // />
 * 
 * @example With Custom Container
 * // <AudioGrid
 *   // :componentsToRender="participants"
 *   // :renderContainer="({ defaultContainer, items }) =>
 *     h('div', { class: 'custom-audio-grid', style: { gap: '20px' } }, items)
 *   "
 * // />
 */
-->
<template>
  <RenderVNode :node="containerNode" />
</template>

<script setup lang="ts">
import {
  cloneVNode,
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
 * Options passed to renderItem function
 * @interface RenderItemOptions
 */
interface RenderItemOptions {
  /** The rendered component VNode */
  component: VNode;
  /** Index in the componentsToRender array */
  index: number;
  /** The default wrapped item */
  defaultItem: VNode;
}

/**
 * Options passed to renderContainer function
 * @interface RenderContainerOptions
 */
interface RenderContainerOptions {
  /** The default container with all items */
  defaultContainer: VNode;
  /** Array of rendered item VNodes */
  items: VNode[];
}

/**
 * Props for the AudioGrid component
 * @interface AudioGridProps
 */
export interface AudioGridProps {
  /**
   * Array of audio card components to render
   * @example
   * ```ts
   * [
   *   { component: AudioCard, props: { name: 'Alice' }, key: 'user-1' },
   *   { component: AudioCard, props: { name: 'Bob' }, key: 'user-2' }
   * ]
   * ```
   */
  componentsToRender: RenderableComponent[];
  
  /**
   * HTML attributes for the grid container
   * @example { 'data-testid': 'audio-grid' }
   */
  containerProps?: HTMLAttributes;
  
  /**
   * HTML attributes for item wrapper elements
   */
  itemWrapperProps?: HTMLAttributes;
  
  /**
   * Custom renderer for individual items
   * @param options - Item rendering options
   * @returns Custom VNode for the item wrapper
   * @example
   * ```ts
   * ({ component, index, defaultItem }) =>
   *   h('div', { class: `audio-${index}` }, [component])
   * ```
   */
  renderItem?: (options: RenderItemOptions) => VNodeChild;
  
  /**
   * Custom renderer for the grid container
   * @param options - Container rendering options
   * @returns Custom VNode for the container
   * @example
   * ```ts
   * ({ defaultContainer, items }) =>
   *   h('div', { class: 'custom-grid', style: { gap: '20px' } }, items)
   * ```
   */
  renderContainer?: (options: RenderContainerOptions) => VNodeChild;
}

const props = withDefaults(defineProps<AudioGridProps>(), {
  containerProps: () => ({}),
  itemWrapperProps: () => ({}),
  renderItem: undefined,
  renderContainer: undefined,
});

const containerBaseStyle: CSSProperties = {
  display: 'grid',
  gap: '12px',
  zIndex: 9,
};

const itemBaseStyle: CSSProperties = {
  zIndex: 9,
  display: 'contents',
};

const containerRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.containerProps ?? {};
  return rest;
});

const containerClassNames = computed(() => [
  'mediasfu-audio-grid',
  props.containerProps?.class,
]);

const containerMergedStyle = computed(() => [
  containerBaseStyle,
  props.containerProps?.style,
]);

const itemRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.itemWrapperProps ?? {};
  return rest;
});

const itemClassNames = computed(() => [
  'mediasfu-audio-grid__item',
  props.itemWrapperProps?.class,
]);

const itemMergedStyle = computed(() => [
  itemBaseStyle,
  props.itemWrapperProps?.style,
]);

const RenderVNode = defineComponent({
  name: 'AudioGridRenderVNode',
  props: {
    node: {
      type: [String, Number, Boolean, Object, Array, Function] as PropType<VNodeChild>,
      required: true,
    },
  },
  setup(renderProps) {
    return () => renderProps.node as VNodeChild;
  },
});

const renderedItemNodes = computed(() =>
  props.componentsToRender.map((renderable, index) => {
    const key = (renderable.key ?? index) as string | number;
    const componentNode = h(renderable.component, renderable.props ?? {});
    const defaultItem = h(
      'div',
      {
        key,
        ...itemRestAttrs.value,
        class: itemClassNames.value,
        style: itemMergedStyle.value,
      },
      componentNode
    );

    if (!props.renderItem) {
      return defaultItem;
    }

    const rendered = props.renderItem({
      component: componentNode,
      index,
      defaultItem,
    });

    if (isVNode(rendered)) {
      return rendered.key == null
        ? cloneVNode(rendered, { key })
        : rendered;
    }

    return h(RenderVNode, { key, node: rendered });
  })
);

const defaultContainer = computed(() =>
  h(
    'div',
    {
      ...containerRestAttrs.value,
      class: containerClassNames.value,
      style: containerMergedStyle.value,
    },
    renderedItemNodes.value
  )
);

const containerNode = computed(() => {
  if (!props.renderContainer) {
    return defaultContainer.value;
  }

  const rendered = props.renderContainer({
    defaultContainer: defaultContainer.value,
    items: renderedItemNodes.value,
  });

  if (isVNode(rendered)) {
    return rendered;
  }

  return h(RenderVNode, { node: rendered });
});
</script>
