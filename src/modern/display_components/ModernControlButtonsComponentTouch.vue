<template>
  <ClassicControlButtonsComponentTouch v-bind="mergedProps" />
</template>

<script setup lang="ts">
import {
  computed,
  h,
  type ButtonHTMLAttributes,
  type Component,
  type CSSProperties,
  type HTMLAttributes,
  type VNodeChild,
} from 'vue';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import ClassicControlButtonsComponentTouch from '../../components/displayComponents/ControlButtonsComponentTouch.vue';
import ModernTooltip from '../primitives/ModernTooltip.vue';
import { mergeAttrObjects, mergeStyleObjects } from './styleUtils';

export interface ButtonTouch {
  name?: string;
  icon?: IconDefinition;
  alternateIcon?: IconDefinition;
  onPress?: () => void;
  backgroundColor?: {
    default?: string;
    pressed?: string;
  };
  active?: boolean;
  alternateIconComponent?: Component;
  iconComponent?: Component;
  customComponent?: Component;
  color?: string;
  activeColor?: string;
  inActiveColor?: string;
  show?: boolean;
  disabled?: boolean;
  buttonProps?: ButtonHTMLAttributes;
  style?: CSSProperties;
  className?: string;
  iconWrapperProps?: HTMLAttributes;
  textProps?: HTMLAttributes;
  contentWrapperProps?: HTMLAttributes;
  renderContent?: (options: {
    index: number;
    isActive: boolean;
    defaultIcon: VNodeChild;
    defaultLabel: VNodeChild;
    defaultContent: VNodeChild;
    direction: 'horizontal' | 'vertical';
  }) => VNodeChild;
  renderButton?: (options: {
    index: number;
    button: ButtonTouch;
    defaultButton: VNodeChild;
    defaultProps: ButtonHTMLAttributes;
    direction: 'horizontal' | 'vertical';
  }) => VNodeChild;
}

export interface ModernControlButtonsComponentTouchProps {
  buttons: ButtonTouch[];
  position?: 'left' | 'right' | 'middle';
  location?: 'top' | 'bottom' | 'center';
  direction?: 'horizontal' | 'vertical';
  buttonsContainerStyle?: CSSProperties;
  alternateIconComponent?: Component;
  iconComponent?: Component;
  showAspect?: boolean;
  containerProps?: HTMLAttributes;
  buttonProps?: ButtonHTMLAttributes;
  buttonStyle?: CSSProperties;
  buttonClassName?: string;
  iconWrapperProps?: HTMLAttributes;
  textProps?: HTMLAttributes;
  contentWrapperProps?: HTMLAttributes;
  renderButton?: (options: {
    index: number;
    button: ButtonTouch;
    defaultButton: VNodeChild;
    defaultProps: ButtonHTMLAttributes;
    direction: 'horizontal' | 'vertical';
  }) => VNodeChild;
  renderButtonContent?: (options: {
    index: number;
    button: ButtonTouch;
    defaultIcon: VNodeChild;
    defaultLabel: VNodeChild;
    defaultContent: VNodeChild;
    direction: 'horizontal' | 'vertical';
  }) => VNodeChild;
  gap?: number | string;
}

const props = withDefaults(defineProps<ModernControlButtonsComponentTouchProps>(), {
  position: 'right',
  location: 'bottom',
  direction: 'vertical',
  buttonsContainerStyle: undefined,
  alternateIconComponent: undefined,
  iconComponent: undefined,
  showAspect: false,
  containerProps: undefined,
  buttonProps: undefined,
  buttonStyle: undefined,
  buttonClassName: undefined,
  iconWrapperProps: undefined,
  textProps: undefined,
  contentWrapperProps: undefined,
  renderButton: undefined,
  renderButtonContent: undefined,
  gap: 6,
});

const resolvedPositionStyles = computed<CSSProperties>(() => {
  const styles: CSSProperties = {
    width: 'fit-content',
  };

  if (props.position === 'right') {
    styles.left = 'auto';
    styles.right = '0';
  } else if (props.position === 'left') {
    styles.left = '0';
    styles.right = 'auto';
  } else {
    styles.left = '50%';
    styles.right = 'auto';
    styles.transform = 'translateX(-50%)';
  }

  return styles;
});

const defaultButtonsContainerStyle = computed<CSSProperties>(() => ({
  ...resolvedPositionStyles.value,
  backgroundColor: 'var(--ms-modern-panel-surface)',
  border: '1px solid var(--ms-modern-panel-border)',
  borderRadius: '12px',
  padding: '8px',
  marginTop: '10px',
  marginRight: '10px',
  marginBottom: '10px',
  marginLeft: '10px',
  boxShadow: 'var(--ms-modern-shadow-soft)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  display: 'flex',
  flexDirection: props.direction === 'vertical' ? 'column' : 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: typeof props.gap === 'number' ? `${props.gap}px` : props.gap ?? '4px',
}));

const defaultButtonStyle = computed<CSSProperties>(() => ({
  width: '48px',
  height: '48px',
  padding: 0,
  margin: 0,
  borderRadius: '12px',
  border: 'none',
  backgroundColor: 'transparent',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: 'none',
}));

const defaultIconWrapperProps: HTMLAttributes = {
  style: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
};

const defaultContentWrapperProps: HTMLAttributes = {
  style: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
};

const defaultTextProps: HTMLAttributes = {
  style: {
    display: 'none',
  },
};

// Determine tooltip placement based on layout direction and container position
const tooltipPosition = computed<'top' | 'bottom' | 'left' | 'right'>(() => {
  if (props.direction === 'vertical') {
    return props.position === 'left' ? 'right' : 'left';
  }
  return props.location === 'top' ? 'bottom' : 'top';
});

const visibleButtons = computed(() => {
  const safeButtons = Array.isArray(props.buttons) ? props.buttons : [];

  return safeButtons.filter(
    (button) =>
      button.show !== false ||
      (button.inActiveColor === 'transparent' && button.activeColor === 'transparent')
  );
});

const composedRenderButton = (options: {
  index: number;
  button: ButtonTouch;
  defaultButton: VNodeChild;
  defaultProps: ButtonHTMLAttributes;
  direction: 'horizontal' | 'vertical';
}) => {
  if (options.button.show === false) {
    return props.renderButton
      ? props.renderButton(options)
      : options.defaultButton;
  }

  const wrappedDefaultButton = h(
    ModernTooltip,
    {
      message: options.button.name ?? '',
      position: tooltipPosition.value,
      isDarkMode: true,
    },
    { default: () => options.defaultButton }
  );

  return props.renderButton
    ? props.renderButton({
        ...options,
        defaultButton: wrappedDefaultButton,
      })
    : wrappedDefaultButton;
};

const mergedProps = computed(() => ({
  ...props,
  buttons: visibleButtons.value,
  buttonsContainerStyle: mergeStyleObjects(defaultButtonsContainerStyle.value, props.buttonsContainerStyle),
  buttonStyle: mergeStyleObjects(defaultButtonStyle.value, props.buttonStyle),
  iconWrapperProps: mergeAttrObjects(defaultIconWrapperProps, props.iconWrapperProps),
  contentWrapperProps: mergeAttrObjects(defaultContentWrapperProps, props.contentWrapperProps),
  textProps: mergeAttrObjects(defaultTextProps, props.textProps),
  renderButton: composedRenderButton,
}));
</script>
