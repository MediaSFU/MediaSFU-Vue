<!--
/**
 * @fileoverview MiniCard Component - Compact participant avatar/initials card
 * @component MiniCard
 * @module components/displayComponents/MiniCard
 * 
 * @description
 * A compact participant card that displays either an avatar image or initials.
 * Used in participant lists, grid views, and as a fallback for audio-only participants.
 * Highly customizable through props and render functions, and can be completely replaced
 * via the MediaSFU `uiOverrides.miniCard` system.
 * 
 * @example Basic Usage
 * <MiniCard initials="JD" :fontSize="16" />
 * 
 * @example With Profile Image
 * <MiniCard 
 *   // imageSource="https://example.com/avatar.jpg"
 *   // :roundedImage="true"
 * // />
 * 
 * @example Custom Styled
 * // <MiniCard
 *   // initials="AB"
 *   // :fontSize="20"
 *   // :customStyle="{ backgroundColor: '#22c55e', color: '#fff' }"
 * // />
 * 
 * @example With Render Override
 * // <MiniCard
 *   // initials="XY"
 *   // :renderContainer="({ defaultContainer }) => 
 *     h('div', { class: 'frosted-glass' }, [defaultContainer])
 *   "
 * // />
 * 
 * @example Complete Replacement via UI Overrides
 * // In your App component (AppUnique.vue pattern)
 * const uiOverrides = computed(() => ({
 *   // miniCard: {
 *     component: {
 *       name: 'CustomMiniCard',
 *       props: ['initials', 'fontSize', 'imageSource'],
 *       setup(props) {
 *         return () => h('div', {
 *           style: {
 *             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
 *             borderRadius: '50%',
 *             display: 'flex',
 *             alignItems: 'center',
 *             justifyContent: 'center',
 *             color: '#fff',
 *             fontWeight: 'bold'
 *           }
 *         }, props.initials || '?');
 *       }
 *     }
 *   }
 * }));
 */
-->
<template>
  <RenderVNode :node="containerNode" />
</template>

<script setup lang="ts">
import {
  computed,
  defineComponent,
  h,
  isVNode,
  type CSSProperties,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type PropType,
  type VNode,
  type VNodeChild,
} from 'vue';

/**
 * Options passed to `renderContainer` function
 * @interface RenderContainerOptions
 */
interface RenderContainerOptions {
  /** The default rendered container with all styling applied */
  defaultContainer: VNode;
  /** Whether the card is displaying an image (true) or initials (false) */
  isImage: boolean;
}

/**
 * Options passed to `renderImage` function
 * @interface RenderImageOptions
 */
interface RenderImageOptions {
  /** The default rendered image element (null if no imageSource) */
  defaultImage: VNode | null;
  /** The source URL of the image (optional) */
  imageSource?: string;
}

/**
 * Options passed to `renderInitials` function
 * @interface RenderInitialsOptions
 */
interface RenderInitialsOptions {
  /** The default rendered initials text element */
  defaultInitials: VNode;
  /** The initials string (optional) */
  initials?: string;
}

/**
 * Props for the MiniCard component
 * @interface MiniCardProps
 */
export interface MiniCardProps {
  /**
   * Initials to display when no imageSource is provided
   * @default undefined
   * @example "JD", "AB", "XY"
   */
  initials?: string;
  
  /**
   * Font size for initials in pixels
   * @default 14
   */
  fontSize?: number;
  
  /**
   * Custom CSS styles for the outer container
   * @example { backgroundColor: '#22c55e', color: '#fff' }
   */
  customStyle?: CSSProperties;
  
  /**
   * URL of the profile image (displays instead of initials when provided)
   * @example "https://example.com/avatar.jpg"
   */
  imageSource?: string;
  
  /**
   * Whether to apply border-radius: 50% to the image
   * @default true
   */
  roundedImage?: boolean;
  
  /**
   * Custom CSS styles for the image element
   * @example { objectFit: 'cover', border: '2px solid #fff' }
   */
  imageStyle?: CSSProperties;
  
  /**
   * HTML attributes for the outer container element
   * @example { 'data-testid': 'mini-card', class: 'custom-class' }
   */
  containerProps?: HTMLAttributes;
  
  /**
   * HTML attributes for the image container wrapper
   */
  imageContainerProps?: HTMLAttributes;
  
  /**
   * HTML attributes for the <img> element
   * @example { alt: 'User Avatar', loading: 'lazy' }
   */
  imageProps?: ImgHTMLAttributes;
  
  /**
   * HTML attributes for the initials container element
   */
  initialsContainerProps?: HTMLAttributes;
  
  /**
   * HTML attributes for the initials text element
   */
  initialsTextProps?: HTMLAttributes;
  
  /**
   * Custom render function for the entire container.
   * Receives the default container and can wrap or replace it.
   * 
   * @param options - Rendering options
   * @param options.defaultContainer - The fully-styled default container VNode
   * @param options.isImage - Whether displaying image (true) or initials (false)
   * @returns Custom VNode to render
   * 
   * @example
   * ```ts
   * ({ defaultContainer, isImage }) => {
   *   return h('div', { class: 'frosted-glass' }, [defaultContainer]);
   * }
   * ```
   */
  renderContainer?: (options: RenderContainerOptions) => VNodeChild;
  
  /**
   * Custom render function for the image element.
   * 
   * @param options - Rendering options
   * @param options.defaultImage - The default image VNode (null if no source)
   * @param options.imageSource - The image URL
   * @returns Custom VNode or null
   * 
   * @example
   * ```ts
   * ({ defaultImage, imageSource }) => {
   *   if (!imageSource) return null;
   *   return h('img', { src: imageSource, class: 'custom-avatar' });
   * }
   * ```
   */
  renderImage?: (options: RenderImageOptions) => VNodeChild;
  
  /**
   * Custom render function for the initials text.
   * 
   * @param options - Rendering options
   * @param options.defaultInitials - The default initials text VNode
   * @param options.initials - The initials string
   * @returns Custom VNode
   * 
   * @example
   * ```ts
   * ({ defaultInitials, initials }) => {
   *   return h('strong', { class: 'bold-initials' }, initials || '?');
   * }
   * ```
   */
  renderInitials?: (options: RenderInitialsOptions) => VNodeChild;
}

const props = withDefaults(defineProps<MiniCardProps>(), {
  fontSize: 14,
  roundedImage: true,
  initials: undefined,
  customStyle: undefined,
  imageSource: undefined,
  imageStyle: undefined,
  containerProps: () => ({}),
  imageContainerProps: () => ({}),
  imageProps: () => ({}),
  initialsContainerProps: () => ({}),
  initialsTextProps: () => ({}),
  renderContainer: undefined,
  renderImage: undefined,
  renderInitials: undefined,
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

// Helper to merge classes
function joinClassNames(...classes: (string | string[] | undefined)[]): string[] {
  const result: string[] = [];
  classes.forEach(cls => {
    if (!cls) return;
    if (Array.isArray(cls)) {
      result.push(...cls);
    } else {
      result.push(cls);
    }
  });
  return result;
}

const styles: Record<string, CSSProperties> = {
  miniCard: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    borderRadius: '0px',
    color: '#000000',
    fontFamily: 'Nunito',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '60%',
    height: '60%',
    objectFit: 'cover',
  },
  roundedImage: {
    borderRadius: '50%',
  },
  initials: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
};

// =========================
// Container Props Merging
// =========================
const containerRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.containerProps || {};
  return rest;
});

const containerClassNames = computed(() =>
  joinClassNames('mediasfu-mini-card', props.containerProps?.class)
);

const containerStyle = computed(() => ({
  ...styles.miniCard,
  fontSize: `${props.fontSize || 14}px`,
  ...props.customStyle,
  ...(typeof props.containerProps?.style === 'object' ? props.containerProps.style : {}),
} as CSSProperties));

// =========================
// ImageContainer Props Merging
// =========================
const imageContainerRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.imageContainerProps || {};
  return rest;
});

const imageContainerClassNames = computed(() =>
  joinClassNames('mediasfu-mini-card__image-container', props.imageContainerProps?.class)
);

const imageContainerStyle = computed(() => ({
  ...styles.imageContainer,
  ...(typeof props.imageContainerProps?.style === 'object' ? props.imageContainerProps.style : {}),
} as CSSProperties));

// =========================
// Image Props Merging
// =========================
const imageRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.imageProps || {};
  return rest;
});

const imageClassNames = computed(() =>
  joinClassNames('mediasfu-mini-card__image', props.imageProps?.class)
);

const imageCombinedStyle = computed(() => ({
  ...styles.backgroundImage,
  ...(props.roundedImage ? styles.roundedImage : {}),
  ...props.imageStyle,
  ...(typeof props.imageProps?.style === 'object' ? props.imageProps.style : {}),
} as CSSProperties));

// =========================
// InitialsContainer Props Merging
// =========================
const initialsContainerRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.initialsContainerProps || {};
  return rest;
});

const initialsContainerClassNames = computed(() =>
  joinClassNames('mediasfu-mini-card__initials-container', props.initialsContainerProps?.class)
);

const initialsContainerStyle = computed(() => ({
  ...styles.initials,
  fontSize: `${props.fontSize}px`,
  ...(typeof props.initialsContainerProps?.style === 'object'
    ? props.initialsContainerProps.style
    : {}),
} as CSSProperties));

// =========================
// InitialsText Props Merging
// =========================
const initialsTextRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.initialsTextProps || {};
  return rest;
});

const initialsTextClassNames = computed(() =>
  joinClassNames('mediasfu-mini-card__initials-text', props.initialsTextProps?.class)
);

const initialsTextStyle = computed(() => ({
  ...(typeof props.initialsTextProps?.style === 'object' ? props.initialsTextProps.style : {}),
} as CSSProperties));

// =========================
// Render Logic
// =========================
const defaultImage = computed(() => {
  if (!props.imageSource) return null;
  return h('img', {
    src: props.imageSource,
    alt: 'Profile',
    class: imageClassNames.value,
    style: imageCombinedStyle.value,
    ...imageRestAttrs.value,
  });
});

const imageNode = computed<VNode | null>(() => {
  if (props.renderImage) {
    const result = props.renderImage({
      defaultImage: defaultImage.value,
      imageSource: props.imageSource,
    });
    return isVNode(result) ? result : null;
  }
  return defaultImage.value;
});

const defaultInitials = computed(() => {
  return h(
    'span',
    {
      class: initialsTextClassNames.value,
      style: initialsTextStyle.value,
      ...initialsTextRestAttrs.value,
    },
    props.initials || ''
  );
});

const initialsNode = computed<VNode>(() => {
  if (props.renderInitials) {
    const result = props.renderInitials({
      defaultInitials: defaultInitials.value,
      initials: props.initials,
    });
    if (isVNode(result)) return result;
  }
  return defaultInitials.value;
});

const defaultContainer = computed(() => {
  const isImage = !!props.imageSource;
  if (isImage && imageNode.value) {
    return h(
      'div',
      {
        class: imageContainerClassNames.value,
        style: imageContainerStyle.value,
        ...imageContainerRestAttrs.value,
      },
      [imageNode.value]
    );
  }
  return h(
    'div',
    {
      class: initialsContainerClassNames.value,
      style: initialsContainerStyle.value,
      ...initialsContainerRestAttrs.value,
    },
    [initialsNode.value]
  );
});

const containerNode = computed<VNode>(() => {
  const isImage = !!props.imageSource;
  const wrappedContent = h(
    'div',
    {
      class: containerClassNames.value,
      style: containerStyle.value,
      ...containerRestAttrs.value,
    },
    [defaultContainer.value]
  );

  if (props.renderContainer) {
    const result = props.renderContainer({
      defaultContainer: wrappedContent,
      isImage,
    });
    if (isVNode(result)) return result;
  }
  return wrappedContent;
});
</script>

<style scoped>
/* Component-specific styles */
</style>
