<!--
 * ControlButtonsComponent - Customizable control button row/column layout
 *
 * @fileoverview
 * A flexible control buttons container that renders a row or column of interactive buttons
 * with icons, labels, and active states. Provides extensive customization through props,
 * render functions, and per-button configuration. Designed for media controls, toolbar actions,
 * and interactive command interfaces.
 *
 * @component ControlButtonsComponent
 * @module components/displayComponents/ControlButtonsComponent
 *
 * @description
 * This component displays an array of buttons with icons and optional labels. Each button
 * supports:
 * - Active/inactive states with custom colors
 * - Primary and alternate icons (e.g., mic on/off)
 * - Custom background colors per button
 * - Individual button visibility control
 * - Custom render functions for button content
 * - FontAwesome icons or custom Vue components
 * - Flexible alignment (flex-start, center, flex-end, space-between, etc.)
 * - Horizontal or vertical orientation
 *
 * @example
 * // Basic horizontal button row
 * // <ControlButtonsComponent
 *   // :buttons="[
 *     { 
 *       name: 'Microphone',
 *       icon: faMicrophone,
 *       alternateIcon: faMicrophoneSlash,
 *       active: isMicActive,
 *       onPress: toggleMicrophone
 *     },
 *     { 
 *       name: 'Camera',
 *       icon: faVideo,
 *       alternateIcon: faVideoSlash,
 *       active: isCameraActive,
 *       onPress: toggleCamera
 *     },
 *     { 
 *       name: 'Screen',
 *       icon: faDesktop,
 *       active: isSharingScreen,
 *       onPress: toggleScreenShare
 *     },
 *   ]"
 *   // alignment="flex-start"
 *   // :vertical="false"
 * // />
 *
 * @example
 * // Vertical button column with custom colors
 * // <ControlButtonsComponent
 *   // :buttons="toolbarButtons"
 *   // :vertical="true"
 *   // alignment="center"
 *   // button-color="#ffffff"
 *   // :button-background-color="{ default: '#000000', pressed: '#333333' }"
 *   // :gap="10"
 * // />
 *
 * @example
 * // Custom styled buttons with individual configurations
 * // <ControlButtonsComponent
 *   // :buttons="[
 *     {
 *       name: 'Record',
 *       icon: faCircle,
 *       active: isRecording,
 *       activeColor: '#ff0000',
 *       inActiveColor: '#ffffff',
 *       backgroundColor: { default: '#1a1a1a', pressed: '#ff0000' },
 *       onPress: () => toggleRecording()
 *     },
 *     {
 *       name: 'Settings',
 *       icon: faCog,
 *       disabled: !canAccessSettings,
 *       onPress: openSettingsModal
 *     }
 *   ]"
 *   // :buttonsContainerStyle="{ padding: '10px', borderRadius: '8px' }"
 * // />
 *
 * @example
 * // Custom render function for button content
 * // <ControlButtonsComponent
 *   // :buttons="controlButtons"
 *   // :render-button-content="(options) => {
 *     const { index, button, defaultIcon, defaultLabel, defaultContent, vertical } = options;
 *     return h('div', { class: 'custom-button-wrapper' }, [
 *       h('div', { class: 'icon-badge' }, [
 *         defaultIcon,
 *         button.active ? h('span', { class: 'active-indicator' }) : null
 *       ]),
 *       h('span', { class: 'label-text' }, button.name)
 *     ]);
 *   }"
 * // />
 *
 * @example
 * // Custom button renderer with wrapper
 * // <ControlButtonsComponent
 *   // :buttons="menuButtons"
 *   // :render-button="(options) => {
 *     const { index, button, defaultButton, defaultProps, vertical } = options;
 *     if (button.customComponent) {
 *       return h(button.customComponent, { ...defaultProps, button });
 *     }
 *     return h('div', { class: 'button-wrapper' }, [defaultButton]);
 *   }"
 * // />
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
 * Button configuration interface
 * 
 * @interface Button
 * @property {string} [name] - Button label text (displayed below icon)
 * @property {IconDefinition} [icon] - FontAwesome icon for inactive/default state
 * @property {IconDefinition} [alternateIcon] - FontAwesome icon for active state (e.g., mic on/off)
 * @property {() => void} [onPress] - Click handler function
 * @property {{ default?: string; pressed?: string; }} [backgroundColor] - Background colors
 * @property {boolean} [active] - Whether button is in active state (affects icon/color)
 * @property {Component} [alternateIconComponent] - Custom Vue component for alternate icon
 * @property {Component} [iconComponent] - Custom Vue component for primary icon
 * @property {Component} [customComponent] - Completely custom Vue component for button
 * @property {string} [color] - Icon/text color (fallback for both states)
 * @property {string} [activeColor] - Icon/text color when active
 * @property {string} [inActiveColor] - Icon/text color when inactive
 * @property {boolean} [disabled] - Whether button is disabled (greyed out, no interaction)
 * @property {boolean} [show] - Whether button is visible
 * @default true
 * @property {CSSProperties} [style] - Custom CSS styles for button element
 * @property {string} [className] - CSS class name for button element
 * @property {ButtonHTMLAttributes} [buttonProps] - HTML attributes for <button> element
 * @property {HTMLAttributes} [iconWrapperProps] - HTML attributes for icon wrapper div
 * @property {HTMLAttributes} [textProps] - HTML attributes for text/label span
 * @property {HTMLAttributes} [contentWrapperProps] - HTML attributes for content wrapper div
 * @property {(options: ButtonContentRenderOptions) => VNodeChild} [renderContent] - Custom renderer for button content
 */
export interface Button {
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
  disabled?: boolean;
  show?: boolean;
  style?: CSSProperties;
  className?: string;
  buttonProps?: ButtonHTMLAttributes;
  iconWrapperProps?: HTMLAttributes;
  textProps?: HTMLAttributes;
  contentWrapperProps?: HTMLAttributes;
  renderContent?: (options: {
    index: number;
    isActive: boolean;
    defaultIcon: VNodeChild;
    defaultLabel: VNodeChild;
    defaultContent: VNodeChild;
    vertical: boolean;
  }) => VNodeChild;
}

/**
 * ControlButtonsComponent props interface
 * 
 * @interface ControlButtonsComponentProps
 * @property {Button[]} buttons - Array of button configurations to render
 * @property {string} [buttonColor] - Default icon/text color for all buttons
 * @property {{ default?: string; pressed?: string; }} [buttonBackgroundColor] - Default background colors for all buttons
 * @property {'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'} [alignment='flex-start'] - Flexbox alignment along main axis
 * @default 'flex-start'
 * @property {boolean} [vertical=false] - Whether buttons are arranged vertically (column) or horizontally (row)
 * @default false
 * @property {CSSProperties} [buttonsContainerStyle] - Custom styles for the container element
 * @property {Component} [alternateIconComponent] - Default alternate icon component for all buttons
 * @property {HTMLAttributes} [containerProps] - HTML attributes for container div
 * @property {ButtonHTMLAttributes} [buttonProps] - Default HTML attributes for all <button> elements
 * @property {CSSProperties} [buttonStyle] - Default styles for all button elements
 * @property {string} [buttonClassName] - Default CSS class for all button elements
 * @property {HTMLAttributes} [iconWrapperProps] - Default HTML attributes for all icon wrapper divs
 * @property {HTMLAttributes} [textProps] - Default HTML attributes for all text/label spans
 * @property {HTMLAttributes} [contentWrapperProps] - Default HTML attributes for all content wrapper divs
 * @property {(options: ButtonRenderOptions) => VNodeChild} [renderButton] - Custom renderer for entire button element
 * @example
 * ```typescript
 * renderButton: (options) => {
 *   // const { index, button, defaultButton } = options;
 *   // return h('div', { class: 'button-wrapper' }, [defaultButton]);
 * }
 * ```
 * @property {(options: ButtonContentRenderOptions) => VNodeChild} [renderButtonContent] - Custom renderer for button content (icon + label)
 * @example
 * ```typescript
 * renderButtonContent: (options) => {
 *   // const { defaultIcon, defaultLabel } = options;
 *   // return h('div', { class: 'custom-content' }, [defaultIcon, defaultLabel]);
 * }
 * ```
 * @property {number | string} [gap] - Gap/spacing between buttons (CSS gap value)
 * @example '10px', 10, '1rem'
 */
export interface ControlButtonsComponentProps {
  buttons: Button[];
  buttonColor?: string;
  buttonBackgroundColor?: {
    default?: string;
    pressed?: string;
  };
  alignment?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  vertical?: boolean;
  buttonsContainerStyle?: CSSProperties;
  alternateIconComponent?: Component;
  containerProps?: HTMLAttributes;
  buttonProps?: ButtonHTMLAttributes;
  buttonStyle?: CSSProperties;
  buttonClassName?: string;
  iconWrapperProps?: HTMLAttributes;
  textProps?: HTMLAttributes;
  contentWrapperProps?: HTMLAttributes;
  renderButton?: (options: {
    index: number;
    button: Button;
    defaultButton: VNodeChild;
    defaultProps: ButtonHTMLAttributes;
    vertical: boolean;
  }) => VNodeChild;
  renderButtonContent?: (options: {
    index: number;
    button: Button;
    defaultIcon: VNodeChild;
    defaultLabel: VNodeChild;
    defaultContent: VNodeChild;
    vertical: boolean;
  }) => VNodeChild;
  gap?: number | string;
}

const props = withDefaults(defineProps<ControlButtonsComponentProps>(), {
  alignment: 'flex-start',
  vertical: false,
  buttonColor: undefined,
  buttonBackgroundColor: undefined,
  buttonsContainerStyle: undefined,
  alternateIconComponent: undefined,
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

const getAlignmentStyle = computed<CSSProperties>(() => {
  const alignment = props.alignment;
  if (alignment === 'center') {
    return { justifyContent: 'center' };
  } else if (alignment === 'flex-end') {
    return { justifyContent: 'flex-end' };
  } else if (alignment === 'space-between') {
    return { justifyContent: 'space-between' };
  } else if (alignment === 'space-around') {
    return { justifyContent: 'space-around' };
  } else if (alignment === 'space-evenly') {
    return { justifyContent: 'space-evenly' };
  } else {
    return { justifyContent: 'flex-start' };
  }
});

// Extract shared button props
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

// Extract container props
const containerAttrs = computed(() => {
  const containerProps = props.containerProps || {};
  const { class: cls, style, ...rest } = containerProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

// Container class names
const containerClassNames = computed(() => 
  joinClassNames('mediasfu-container', containerAttrs.value.className)
);

// Container style
const containerStyle = computed<CSSProperties>(() => ({
  ...getAlignmentStyle.value,
  ...(props.vertical ? { flexDirection: 'column' } : {}),
  ...(props.gap !== undefined ? { gap: typeof props.gap === 'number' ? `${props.gap}px` : props.gap } : {}),
  ...props.buttonsContainerStyle,
  ...containerAttrs.value.style,
}));

// Extract default content wrapper props
const defaultContentWrapperAttrs = computed(() => {
  const contentWrapperProps = props.contentWrapperProps || {};
  const { class: cls, style, ...rest } = contentWrapperProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

// Extract default icon wrapper props
const defaultIconWrapperAttrs = computed(() => {
  const iconWrapperProps = props.iconWrapperProps || {};
  const { class: cls, style, ...rest } = iconWrapperProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

// Extract default text props
const defaultTextAttrs = computed(() => {
  const textProps = props.textProps || {};
  const { class: cls, style, ...rest } = textProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

// Button nodes computed
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
      'mediasfu-button-content',
      defaultContentWrapperAttrs.value.className,
      buttonContentWrapperClassName as string | undefined
    );

    const contentWrapperStyle: CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: props.vertical ? '6px' : '8px',
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
      'mediasfu-button-icon',
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
      color: button.color || props.buttonColor || '#ffffff',
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
    const activeIconColor = button.activeColor || props.buttonColor || '#ffffff';
    const inactiveIconColor = button.inActiveColor || props.buttonColor || '#ffffff';

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
          vertical: props.vertical,
        });
      }

      if (props.renderButtonContent) {
        return props.renderButtonContent({
          index,
          button,
          defaultIcon: iconElement,
          defaultLabel: labelElement,
          defaultContent,
          vertical: props.vertical,
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

    const isVisible = button.show !== false;

    // Background color logic
    const backgroundDefault = (() => {
      const pressedColor =
        button.backgroundColor?.pressed || props.buttonBackgroundColor?.pressed;
      const defaultColor =
        button.backgroundColor?.default || props.buttonBackgroundColor?.default;

      if (!isVisible) {
        return 'transparent';
      }

      if (button.active && pressedColor) {
        return pressedColor;
      }

      if (defaultColor) {
        return defaultColor;
      }

      const sharedStyle = sharedButtonAttrs.value.style as CSSProperties || {};
      const btnStyle = props.buttonStyle || {};
      const perBtnBtnStyle = perButtonButtonStyle as CSSProperties || {};
      const perBtnStyle = perButtonStyle as CSSProperties || {};

      return sharedStyle.backgroundColor || btnStyle.backgroundColor || perBtnBtnStyle.backgroundColor || perBtnStyle.backgroundColor || 'transparent';
    })();

    const combinedStyle = {
      backgroundColor: backgroundDefault,
      ...(props.vertical ? { flexDirection: 'column' } : {}),
      display: isVisible ? 'flex' : 'none',
      ...(sharedButtonAttrs.value.style && typeof sharedButtonAttrs.value.style === 'object' ? sharedButtonAttrs.value.style : {}),
      ...(props.buttonStyle && typeof props.buttonStyle === 'object' ? props.buttonStyle : {}),
      ...(perButtonButtonStyle && typeof perButtonButtonStyle === 'object' ? perButtonButtonStyle : {}),
      ...(perButtonStyle && typeof perButtonStyle === 'object' ? perButtonStyle : {}),
    } as CSSProperties;

    if (isVisible && !combinedStyle.display) {
      combinedStyle.display = 'flex';
    }

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

    // Render button with hook if provided
    if (props.renderButton) {
      const customButton = props.renderButton({
        index,
        button,
        defaultButton: h('button', computedButtonProps, [renderedContent]),
        defaultProps: computedButtonProps,
        vertical: props.vertical,
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

<style scoped>
@import './ControlButtonsComponent.css';
</style>
