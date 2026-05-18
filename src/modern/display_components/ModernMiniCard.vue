<template>
  <RenderVNode :node="containerNode" />
</template>

<script setup lang="ts">
import {
  computed,
  defineComponent,
  h,
  isVNode,
  onMounted,
  ref,
  watch,
  type CSSProperties,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type PropType,
  type VNode,
  type VNodeChild,
} from 'vue';
import type { MiniCardProps } from '../../components/displayComponents/MiniCard.vue';
import { mergeAttrObjects, mergeStyleObjects } from './styleUtils';

export interface ModernMiniCardProps extends MiniCardProps {
  backgroundColor?: string;
  isDarkMode?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  showGradientBackground?: boolean;
  showBorder?: boolean;
  size?: number;
}

const props = withDefaults(defineProps<ModernMiniCardProps>(), {
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
  backgroundColor: undefined,
  isDarkMode: true,
  className: undefined,
  style: undefined,
  onClick: undefined,
  showGradientBackground: true,
  showBorder: true,
  size: undefined,
});

const RenderVNode = defineComponent({
  name: 'RenderVNode',
  props: {
    node: {
      type: [Object, String, Number, Boolean, Array, Function] as PropType<VNodeChild>,
      default: null,
    },
  },
  render() {
    if (!this.node) return null;
    if (isVNode(this.node)) return this.node;
    if (typeof this.node === 'function') {
      const result = (this.node as () => VNodeChild)();
      return isVNode(result) ? result : String(result);
    }
    if (typeof this.node === 'string' || typeof this.node === 'number') {
      return String(this.node);
    }
    return null;
  },
});

const isMounted = ref(false);
const imageError = ref(false);
const imageLoaded = ref(false);

onMounted(() => {
  requestAnimationFrame(() => {
    isMounted.value = true;
  });
});

watch(
  () => props.imageSource,
  () => {
    imageError.value = false;
    imageLoaded.value = false;
  },
);

const hasImage = computed(() => Boolean(props.imageSource) && !imageError.value);

const normalizedFontSize = computed(() => {
  if (typeof props.fontSize === 'number') {
    return `${props.fontSize}px`;
  }

  if (typeof props.fontSize === 'string' && props.fontSize.trim().length > 0) {
    return props.fontSize;
  }

  return '14px';
});

const displayName = computed(() => {
  const value = (props.initials ?? '').trim();
  if (!value) {
    return '?';
  }

  return value.length > 10 ? value.slice(0, 10) : value;
});

const innerCircleSize = computed(() => (props.size ? Math.min(props.size, 140) : 140));

const gradientBackground = computed(
  () =>
    props.backgroundColor ??
    'linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 55%, var(--ms-modern-accent) 100%)',
);

const solidBackground = computed(() => {
  if (props.backgroundColor) {
    return props.backgroundColor;
  }

  return props.isDarkMode
    ? 'rgba(79, 70, 229, 0.3)'
    : 'var(--ms-modern-panel-surface-elevated)';
});

const imageSurfaceBackground = computed(() =>
  props.isDarkMode
    ? 'var(--ms-modern-page-background-accent)'
    : 'var(--ms-modern-panel-surface-elevated)',
);

const borderStyle = computed(() => {
  if (!props.showBorder && !props.isDarkMode) {
    return 'none';
  }

  if (props.isDarkMode) {
    return props.showBorder
      ? '1px solid rgba(99, 102, 241, 0.4)'
      : '1px solid rgba(255, 255, 255, 0.1)';
  }

  return props.showBorder ? '1px solid rgba(15, 23, 42, 0.15)' : 'none';
});

const defaultContainerStyle = computed<CSSProperties>(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  fontFamily: "var(--ms-modern-font-family, 'Nunito', sans-serif)",
  color: '#ffffff',
  opacity: isMounted.value ? 1 : 0,
  transform: isMounted.value ? 'scale(1)' : 'scale(0.8)',
  transition: 'transform 180ms ease, opacity 180ms ease',
  cursor: props.onClick ? 'pointer' : 'default',
  ...(props.roundedImage
    ? {}
    : {
        background: hasImage.value
          ? imageSurfaceBackground.value
          : props.showGradientBackground
            ? gradientBackground.value
            : solidBackground.value,
        border: hasImage.value ? 'none' : borderStyle.value,
        borderRadius: '12px',
      }),
}));

const mergedContainerStyle = computed(() =>
  mergeStyleObjects(
    mergeStyleObjects(defaultContainerStyle.value, props.style),
    props.customStyle,
  ),
);

const mergedContainerProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(
    {
      class: ['ms-modern-mini-card', props.className],
      style: mergedContainerStyle.value,
      onClick: props.onClick,
      role: props.onClick ? 'button' : undefined,
      tabindex: props.onClick ? 0 : undefined,
    } as HTMLAttributes,
    props.containerProps,
  ),
);

const innerCircleStyle = computed<CSSProperties>(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: `${innerCircleSize.value}px`,
  height: `${innerCircleSize.value}px`,
  maxWidth: '80%',
  maxHeight: '80%',
  borderRadius: props.roundedImage ? '50%' : '12px',
  overflow: 'hidden',
  flexShrink: 0,
  position: 'relative',
  background: hasImage.value
    ? imageSurfaceBackground.value
    : props.showGradientBackground
      ? gradientBackground.value
      : solidBackground.value,
  border: hasImage.value ? 'none' : borderStyle.value,
  boxShadow: props.isDarkMode
    ? '0 2px 8px rgba(0, 0, 0, 0.2)'
    : '0 2px 8px rgba(0, 0, 0, 0.1)',
}));

const mergedImageContainerProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(
    {
      class: 'ms-modern-mini-card__image-container',
      style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      } satisfies CSSProperties,
    },
    props.imageContainerProps,
  ),
);

const mergedImageStyle = computed(() =>
  mergeStyleObjects(
    {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: props.roundedImage ? '50%' : '12px',
      opacity: imageLoaded.value ? 1 : 0,
      transition: 'opacity 140ms ease',
    } satisfies CSSProperties,
    props.imageStyle,
  ),
);

const mergedImageProps = computed<ImgHTMLAttributes>(() =>
  mergeAttrObjects(
    {
      class: 'ms-modern-mini-card__image',
      alt: props.initials || 'Profile',
      style: mergedImageStyle.value,
    } as ImgHTMLAttributes,
    props.imageProps,
  ),
);

const mergedInitialsContainerProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(
    {
      class: 'ms-modern-mini-card__initials-container',
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        textAlign: 'center',
      } satisfies CSSProperties,
    },
    props.initialsContainerProps,
  ),
);

const mergedInitialsTextProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(
    {
      class: 'ms-modern-mini-card__initials-text',
      style: {
        fontSize: normalizedFontSize.value,
        fontWeight: 700,
        color: '#ffffff',
        letterSpacing: '1px',
        textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
      } satisfies CSSProperties,
    },
    props.initialsTextProps,
  ),
);

const glassOverlayStyle = computed<CSSProperties>(() => ({
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 50%)',
  pointerEvents: 'none',
  borderRadius: props.roundedImage ? '50%' : '12px',
}));

const handleImageError = () => {
  imageError.value = true;
  imageLoaded.value = false;
};

const handleImageLoad = () => {
  imageLoaded.value = true;
};

const defaultImageNode = computed<VNode | null>(() => {
  if (!hasImage.value || !props.imageSource) {
    return null;
  }

  return h('div', mergedImageContainerProps.value, [
    h('img', {
      ...mergedImageProps.value,
      src: props.imageSource,
      onError: handleImageError,
      onLoad: handleImageLoad,
    }),
  ]);
});

const defaultInitialsNode = computed<VNode>(() =>
  h('div', mergedInitialsContainerProps.value, [
    h('span', mergedInitialsTextProps.value, displayName.value),
  ]),
);

const imageNode = computed<VNodeChild>(() => {
  if (!props.renderImage) {
    return defaultImageNode.value;
  }

  return props.renderImage({
    defaultImage: defaultImageNode.value,
    imageSource: props.imageSource,
  });
});

const initialsNode = computed<VNodeChild>(() => {
  if (!props.renderInitials) {
    return defaultInitialsNode.value;
  }

  return props.renderInitials({
    defaultInitials: defaultInitialsNode.value,
    initials: props.initials,
  });
});

const contentNode = computed<VNodeChild>(() =>
  hasImage.value ? imageNode.value ?? defaultImageNode.value : initialsNode.value,
);

const glassOverlayNode = computed<VNode>(() =>
  h('span', {
    class: 'ms-modern-mini-card__glass-overlay',
    style: glassOverlayStyle.value,
    'aria-hidden': 'true',
  }),
);

const defaultContainer = computed<VNode>(() => {
  if (props.roundedImage) {
    return h('div', mergedContainerProps.value, [
      h(
        'div',
        {
          class: 'ms-modern-mini-card__inner-circle',
          style: innerCircleStyle.value,
        },
        [contentNode.value, glassOverlayNode.value],
      ),
    ]);
  }

  return h('div', mergedContainerProps.value, [contentNode.value, glassOverlayNode.value]);
});

const containerNode = computed<VNodeChild>(() => {
  if (!props.renderContainer) {
    return defaultContainer.value;
  }

  return (
    props.renderContainer({
      defaultContainer: defaultContainer.value,
      isImage: hasImage.value,
    }) ?? defaultContainer.value
  );
});
</script>
