<!--
 * ControlButtonsComponentTouch - Touch-optimized positioned control buttons
 *
 * @fileoverview
 * A touch-friendly control buttons component with absolute positioning support.
 * Designed for mobile/tablet interfaces where buttons need to be positioned in
 * specific screen regions (corners, edges, center). Each button supports per-button
 * render functions and conditional visibility.
 *
 * @component ControlButtonsComponentTouch
 * @module components/displayComponents/ControlButtonsComponentTouch
 *
 * @description
 * This component renders control buttons with absolute positioning capabilities,
 * ideal for overlay interfaces on touch devices. Features:
 * - Absolute positioning (left/right/middle × top/bottom/center)
 * - Horizontal or vertical button arrangement
 * - Per-button visibility and render control
 * - Touch-optimized button sizing and spacing
 * - Active/inactive states with alternate icons
 * - Conditional rendering via showAspect prop
 * - Custom render functions per button
 * - FontAwesome icons or custom Vue components
 *
 * @example
 * // Basic bottom-left corner buttons
 * // <ControlButtonsComponentTouch
 *   // :buttons="[
 *     { 
 *       name: 'Mic',
 *       icon: faMicrophone,
 *       alternateIcon: faMicrophoneSlash,
 *       active: isMicActive,
 *       onPress: toggleMic
 *     },
 *     { 
 *       name: 'Camera',
 *       icon: faVideo,
 *       alternateIcon: faVideoSlash,
 *       active: isCameraActive,
 *       onPress: toggleCamera
 *     }
 *   ]"
 *   // position="left"
 *   // location="bottom"
 *   // direction="horizontal"
 *   // :show-aspect="true"
 * // />
 *
 * @example
 * // Top-right vertical buttons with custom styling
 * // <ControlButtonsComponentTouch
 *   // :buttons="quickActionButtons"
 *   // position="right"
 *   // location="top"
 *   // direction="vertical"
 *   // :show-aspect="controlsVisible"
 *   // :buttonsContainerStyle="{ padding: '10px', backgroundColor: 'rgba(0,0,0,0.5)' }"
 *   // :gap="15"
 * // />
 *
 * @example
 * // Center positioned with conditional visibility
 * // <ControlButtonsComponentTouch
 *   // :buttons="[
 *     { 
 *       name: 'Settings',
 *       icon: faCog,
 *       show: canAccessSettings,
 *       onPress: openSettings
 *     },
 *     { 
 *       name: 'Exit',
 *       icon: faSignOutAlt,
 *       show: canExit,
 *       onPress: handleExit
 *     }
 *   ]"
 *   // position="middle"
 *   // location="center"
 *   // :show-aspect="menuOpen"
 * // />
 *
 * @example
 * // Custom render function per button
 * // <ControlButtonsComponentTouch
 *   // :buttons="[
 *     {
 *       name: 'Record',
 *       icon: faCircle,
 *       active: isRecording,
 *       renderButton: (options) => {
 *         const { button, defaultButton } = options;
 *         return h('div', { 
 *           class: ['record-button', button.active ? 'recording' : ''],
 *           style: { animation: button.active ? 'pulse 1s infinite' : 'none' }
 *         }, [defaultButton]);
 *       },
 *       onPress: toggleRecording
 *     }
 *   ]"
 *   // position="middle"
 *   // location="bottom"
 *   // :show-aspect="true"
 * // />
 *
 * @example
 * // Touch-optimized with custom button content
 * // <ControlButtonsComponentTouch
 *   // :buttons="controlButtons"
 *   // position="left"
 *   // location="bottom"
 *   // direction="horizontal"
 *   // :show-aspect="true"
 *   // :render-button-content="(options) => {
 *     const { defaultIcon, defaultLabel, button } = options;
 *     return h('div', { class: 'touch-button-content' }, [
 *       h('div', { class: 'icon-large' }, [defaultIcon]),
 *       h('span', { class: 'label-touch' }, button.name)
 *     ]);
 *   }"
 * // />
-->
<template>
  <RenderVNode
    v-if="showAspect"
    :node="containerNode"
  />
</template>

<script setup lang="ts">
import {
  computed,
  defineComponent,
  h,
  isVNode,
  type ButtonHTMLAttributes,
  type Component,
  type CSSProperties,
  type HTMLAttributes,
  type PropType,
  type VNodeChild,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

// Helper to join class names
function joinClassNames(...classes: Array<string | undefined | null | false>): string | undefined {
  const filtered = classes.filter(Boolean) as string[];
  return filtered.length > 0 ? filtered.join(' ').trim() : undefined;
}

/**
 * Touch button configuration interface
 * 
 * @interface ButtonTouch
 * @property {string} [name] - Button label text
 * @property {IconDefinition} [icon] - FontAwesome icon for default state
 * @property {IconDefinition} [alternateIcon] - FontAwesome icon for active state
 * @property {() => void} [onPress] - Click/tap handler function
 * @property {{ default?: string; pressed?: string; }} [backgroundColor] - Background colors
 * @property {boolean} [active] - Whether button is in active state
 * @property {Component} [alternateIconComponent] - Custom Vue component for alternate icon
 * @property {Component} [iconComponent] - Custom Vue component for primary icon
 * @property {Component} [customComponent] - Custom Vue component for entire button
 * @property {string} [color] - Icon/text color
 * @property {string} [activeColor] - Icon/text color when active
 * @property {string} [inActiveColor] - Icon/text color when inactive
 * @property {boolean} [show] - Whether button is visible
 * @default true
 * @property {boolean} [disabled] - Whether button is disabled
 * @property {ButtonHTMLAttributes} [buttonProps] - HTML attributes for <button> element
 * @property {CSSProperties} [style] - Custom CSS styles for button
 * @property {string} [className] - CSS class name for button
 * @property {HTMLAttributes} [iconWrapperProps] - HTML attributes for icon wrapper div
 * @property {HTMLAttributes} [textProps] - HTML attributes for text/label span
 * @property {HTMLAttributes} [contentWrapperProps] - HTML attributes for content wrapper div
 * @property {(options: TouchButtonContentRenderOptions) => VNodeChild} [renderContent] - Custom renderer for button content
 * @property {(options: TouchButtonRenderOptions) => VNodeChild} [renderButton] - Custom renderer for entire button
 */
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

/**
 * ControlButtonsComponentTouch props interface
 * 
 * @interface ControlButtonsComponentTouchProps
 * @property {ButtonTouch[]} buttons - Array of button configurations to render
 * @property {'left' | 'right' | 'middle'} [position='left'] - Horizontal position (absolute positioning)
 * @default 'left'
 * @property {'top' | 'bottom' | 'center'} [location='top'] - Vertical position (absolute positioning)
 * @default 'top'
 * @property {'horizontal' | 'vertical'} [direction='horizontal'] - Button layout direction
 * @default 'horizontal'
 * @property {CSSProperties} [buttonsContainerStyle] - Custom styles for container element
 * @property {Component} [alternateIconComponent] - Default alternate icon component for all buttons
 * @property {Component} [iconComponent] - Default icon component for all buttons
 * @property {boolean} [showAspect=false] - Whether to show the component (conditional rendering)
 * @default false
 * @example
 * // Hide buttons when not needed
 * :show-aspect="controlsVisible && !menuOpen"
 * @property {HTMLAttributes} [containerProps] - HTML attributes for container div
 * @property {ButtonHTMLAttributes} [buttonProps] - Default HTML attributes for all <button> elements
 * @property {CSSProperties} [buttonStyle] - Default styles for all button elements
 * @property {string} [buttonClassName] - Default CSS class for all button elements
 * @property {HTMLAttributes} [iconWrapperProps] - Default HTML attributes for all icon wrapper divs
 * @property {HTMLAttributes} [textProps] - Default HTML attributes for all text/label spans
 * @property {HTMLAttributes} [contentWrapperProps] - Default HTML attributes for all content wrapper divs
 * @property {(options: TouchButtonRenderOptions) => VNodeChild} [renderButton] - Custom renderer for entire button element
 * @property {(options: TouchButtonContentRenderOptions) => VNodeChild} [renderButtonContent] - Custom renderer for button content
 * @property {number | string} [gap] - Gap/spacing between buttons (CSS gap value)
 * @example '15px', 15, '1rem'
 */
export interface ControlButtonsComponentTouchProps {
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

const props = withDefaults(defineProps<ControlButtonsComponentTouchProps>(), {
  position: 'left',
  location: 'top',
  direction: 'horizontal',
  showAspect: false,
  alternateIconComponent: undefined,
  iconComponent: undefined,
  containerProps: undefined,
  buttonProps: undefined,
  buttonStyle: undefined,
  buttonClassName: undefined,
  iconWrapperProps: undefined,
  textProps: undefined,
  contentWrapperProps: undefined,
  renderButton: undefined,
  renderButtonContent: undefined,
  gap: undefined,
  buttonsContainerStyle: undefined,
});

// RenderVNode wrapper component
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
    return String(this.node);
  },
});

const isVertical = computed(() => props.direction === 'vertical');

const getAlignmentStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {};

  if (props.position === 'left' || props.position === 'right' || props.position === 'middle') {
    style.justifyContent =
      props.position === 'left' ? 'flex-start' : props.position === 'right' ? 'flex-end' : 'center';
  }

  if (props.location === 'top' || props.location === 'bottom' || props.location === 'center') {
    style.alignItems =
      props.location === 'top' ? 'flex-start' : props.location === 'bottom' ? 'flex-end' : 'center';
  }

  style.flexDirection = isVertical.value ? 'column' : 'row';

  return style;
});

// Styles object
const styles: Record<string, CSSProperties> = {
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    marginTop: '5px',
    marginBottom: '5px',
    zIndex: 9,
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    alignItems: 'center',
    padding: '10px',
    borderRadius: '5px',
    marginRight: '5px',
    marginLeft: '5px',
    marginBottom: '5px',
    marginTop: '5px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
  },
  verticalButton: {
    flexDirection: 'column',
  },
  buttonText: {
    fontSize: '12px',
    color: 'transparent',
  },
};

// Extract shared/container props
const containerAttrs = computed(() => {
  const containerProps = props.containerProps || {};
  const { class: cls, style, ...rest } = containerProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const containerClassNames = computed(() => 
  joinClassNames('mediasfu-touch-buttons', containerAttrs.value.className)
);

const containerStyle = computed<CSSProperties>(() => ({
  ...styles.container,
  ...getAlignmentStyle.value,
  ...(props.gap !== undefined ? { gap: typeof props.gap === 'number' ? `${props.gap}px` : props.gap } : {}),
  ...props.buttonsContainerStyle,
  ...containerAttrs.value.style,
}));

const sharedButtonAttrs = computed(() => {
  const buttonProps = props.buttonProps || {};
  const { class: cls, style, onClick, type, ...rest } = buttonProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    onClick: onClick as ((event: MouseEvent) => void) | undefined,
    type: type as string | undefined,
    rest,
  };
});

const defaultContentWrapperAttrs = computed(() => {
  const contentWrapperProps = props.contentWrapperProps || {};
  const { class: cls, style, ...rest } = contentWrapperProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const defaultIconWrapperAttrs = computed(() => {
  const iconWrapperProps = props.iconWrapperProps || {};
  const { class: cls, style, ...rest } = iconWrapperProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const defaultTextAttrs = computed(() => {
  const textProps = props.textProps || {};
  const { class: cls, style, ...rest } = textProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

// Button nodes computed - similar to ControlButtonsComponent but with touch-specific styling
const buttonNodes = computed(() => {
  return props.buttons.map((button, index) => {
    // Extract per-button props
    const {
      buttonProps: perButtonProps,
      style: perButtonStyle,
      className: perButtonClassName,
      iconWrapperProps: perButtonIconWrapperProps,
      textProps: perButtonTextProps,
      contentWrapperProps: perButtonContentWrapperProps,
    } = button;

    // Extract per-button button props
    const perBtnProps = perButtonProps || {};
    const {
      onClick: perButtonOnClick,
      style: perButtonButtonStyle,
      class: perButtonButtonClassName,
      type: perButtonType,
      ...restPerButtonProps
    } = perBtnProps as Record<string, unknown>;

    // Content wrapper props
    const perContentWrapperProps = perButtonContentWrapperProps || {};
    const {
      style: buttonContentWrapperStyle,
      class: buttonContentWrapperClassName,
      ...restButtonContentWrapper
    } = perContentWrapperProps as Record<string, unknown>;

    const contentWrapperClassName = joinClassNames(
      'mediasfu-touch-button-content',
      defaultContentWrapperAttrs.value.className,
      buttonContentWrapperClassName as string | undefined
    );

    const contentWrapperStyle: CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: isVertical.value ? '6px' : '8px',
      ...(defaultContentWrapperAttrs.value.style && typeof defaultContentWrapperAttrs.value.style === 'object' ? defaultContentWrapperAttrs.value.style : {}),
      ...(buttonContentWrapperStyle && typeof buttonContentWrapperStyle === 'object' ? buttonContentWrapperStyle : {}),
    };

    const resolvedContentWrapperProps: HTMLAttributes = {
      ...defaultContentWrapperAttrs.value.rest,
      ...restButtonContentWrapper,
      class: contentWrapperClassName,
      style: contentWrapperStyle,
    };

    // Icon wrapper props
    const perIconWrapperProps = perButtonIconWrapperProps || {};
    const {
      style: perButtonIconWrapperStyle,
      class: perButtonIconWrapperClassName,
      ...restPerButtonIconWrapper
    } = perIconWrapperProps as Record<string, unknown>;

    const iconWrapperClassName = joinClassNames(
      'mediasfu-touch-button-icon',
      defaultIconWrapperAttrs.value.className,
      perButtonIconWrapperClassName as string | undefined
    );

    const iconWrapperStyle: CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      ...(defaultIconWrapperAttrs.value.style && typeof defaultIconWrapperAttrs.value.style === 'object' ? defaultIconWrapperAttrs.value.style : {}),
      ...(perButtonIconWrapperStyle && typeof perButtonIconWrapperStyle === 'object' ? perButtonIconWrapperStyle : {}),
    };

    const resolvedIconWrapperProps: HTMLAttributes = {
      ...defaultIconWrapperAttrs.value.rest,
      ...restPerButtonIconWrapper,
      class: iconWrapperClassName,
      style: iconWrapperStyle,
    };

    // Text props
    const perTextProps = perButtonTextProps || {};
    const {
      style: perButtonTextStyle,
      class: perButtonTextClassName,
      ...restPerButtonTextProps
    } = perTextProps as Record<string, unknown>;

    const textClassName = joinClassNames(
      'buttonText',
      defaultTextAttrs.value.className,
      perButtonTextClassName as string | undefined
    );

    const textStyle: CSSProperties = {
      ...styles.buttonText,
      color: button.color || 'transparent',
      ...(defaultTextAttrs.value.style && typeof defaultTextAttrs.value.style === 'object' ? defaultTextAttrs.value.style : {}),
      ...(perButtonTextStyle && typeof perButtonTextStyle === 'object' ? perButtonTextStyle : {}),
    };

    const resolvedTextProps: HTMLAttributes = {
      ...defaultTextAttrs.value.rest,
      ...restPerButtonTextProps,
      class: textClassName,
      style: textStyle,
    };

    // Resolve icon colors
    const activeIconColor = button.activeColor || 'transparent';
    const inactiveIconColor = button.inActiveColor || 'transparent';

    // Resolve icon element
    const resolvedIcon = (() => {
      if (button.customComponent) {
        return h(button.customComponent);
      }

      if (button.icon) {
        if (button.active) {
          if (button.alternateIconComponent) {
            return h(button.alternateIconComponent);
          }

          if (button.alternateIcon) {
            return h(FontAwesomeIcon, {
              icon: button.alternateIcon,
              size: 'lg',
              color: activeIconColor,
            });
          }

          if (props.alternateIconComponent) {
            return h(props.alternateIconComponent);
          }
        }

        if (button.iconComponent) {
          return h(button.iconComponent);
        }

        if (props.iconComponent) {
          return h(props.iconComponent);
        }

        return h(FontAwesomeIcon, {
          icon: button.icon,
          size: 'lg',
          color: inactiveIconColor,
        });
      }

      return props.alternateIconComponent ? h(props.alternateIconComponent) : null;
    })();

    const iconElement = resolvedIcon
      ? h('span', resolvedIconWrapperProps, resolvedIcon)
      : null;

    const labelElement = button.name
      ? h('span', resolvedTextProps, button.name)
      : null;

    const defaultContent = h(
      'div',
      resolvedContentWrapperProps,
      [iconElement, labelElement].filter(Boolean)
    );

    // Build content with render hooks
    const renderedContent = (() => {
      if (button.renderContent) {
        return button.renderContent({
          index,
          isActive: !!button.active,
          defaultIcon: iconElement,
          defaultLabel: labelElement,
          defaultContent,
          direction: props.direction,
        });
      }

      if (props.renderButtonContent) {
        return props.renderButtonContent({
          index,
          button,
          defaultIcon: iconElement,
          defaultLabel: labelElement,
          defaultContent,
          direction: props.direction,
        });
      }

      return defaultContent;
    })();

    // Merged button rest props
    const mergedButtonRest: ButtonHTMLAttributes = {
      ...sharedButtonAttrs.value.rest,
      ...restPerButtonProps,
      disabled:
        button.disabled ?? (restPerButtonProps?.disabled as boolean | undefined) ?? (sharedButtonAttrs.value.rest?.disabled as boolean | undefined),
    };

    const isVisible =
      button.show !== false ||
      (button.inActiveColor === 'transparent' && button.activeColor === 'transparent');

    // Background color logic
    const backgroundDefault = (() => {
      const pressedColor =
        button.backgroundColor?.pressed;
      const defaultColor =
        button.backgroundColor?.default;

      if (!isVisible) {
        return 'transparent';
      }

      if (button.active && pressedColor) {
        return pressedColor;
      }

      if (button.show && defaultColor) {
        return defaultColor;
      }

      if (button.show) {
        return 'rgba(255, 255, 255, 0.25)';
      }

      const sharedStyle = sharedButtonAttrs.value.style as CSSProperties || {};
      const btnStyle = props.buttonStyle || {};
      const perBtnBtnStyle = perButtonButtonStyle as CSSProperties || {};
      const perBtnStyle = perButtonStyle as CSSProperties || {};

      return sharedStyle.backgroundColor || btnStyle.backgroundColor || perBtnBtnStyle.backgroundColor || perBtnStyle.backgroundColor || 'transparent';
    })();

    const combinedStyle = {
      ...styles.buttonContainer,
      backgroundColor: backgroundDefault,
      ...(isVertical.value ? styles.verticalButton : {}),
      display: isVisible ? 'flex' : 'none',
      ...(sharedButtonAttrs.value.style && typeof sharedButtonAttrs.value.style === 'object' ? sharedButtonAttrs.value.style : {}),
      ...(props.buttonStyle && typeof props.buttonStyle === 'object' ? props.buttonStyle : {}),
      ...(perButtonButtonStyle && typeof perButtonButtonStyle === 'object' ? perButtonButtonStyle : {}),
      ...(perButtonStyle && typeof perButtonStyle === 'object' ? perButtonStyle : {}),
    } as CSSProperties;

    const combinedClassName = joinClassNames(
      'buttonContainer',
      sharedButtonAttrs.value.className,
      props.buttonClassName,
      perButtonButtonClassName as string | undefined,
      perButtonClassName
    );

    const resolvedType = (perButtonType as string | undefined) || sharedButtonAttrs.value.type || 'button';

    const handleClick = (event: MouseEvent) => {
      const perOnClick = perButtonOnClick as ((event: MouseEvent) => void) | undefined;
      if (perOnClick) perOnClick(event);
      if (sharedButtonAttrs.value.onClick) sharedButtonAttrs.value.onClick(event);

      if (!event.defaultPrevented) {
        button.onPress?.();
      }
    };

    const computedButtonProps: ButtonHTMLAttributes = {
      ...mergedButtonRest,
      class: combinedClassName,
      style: combinedStyle,
      type: resolvedType as 'button' | 'submit' | 'reset' | undefined,
      onClick: handleClick,
    };

    // Render button with render hook support (per-button or global)
    if (button.renderButton) {
      const customButton = button.renderButton({
        index,
        button,
        defaultButton: h('button', computedButtonProps, [renderedContent]),
        defaultProps: computedButtonProps,
        direction: props.direction,
      });

      return isVNode(customButton) ? customButton : h(RenderVNode, { node: customButton });
    }

    if (props.renderButton) {
      const customButton = props.renderButton({
        index,
        button,
        defaultButton: h('button', computedButtonProps, [renderedContent]),
        defaultProps: computedButtonProps,
        direction: props.direction,
      });

      return isVNode(customButton) ? customButton : h(RenderVNode, { node: customButton });
    }

    return h('button', computedButtonProps, [
      isVNode(renderedContent) ? renderedContent : h(RenderVNode, { node: renderedContent }),
    ]);
  });
});

// Container node
const containerNode = computed<VNodeChild>(() => {
  return h(
    'div',
    {
      ...containerAttrs.value.rest,
      class: containerClassNames.value,
      style: containerStyle.value,
    },
    buttonNodes.value
  );
});
</script>
