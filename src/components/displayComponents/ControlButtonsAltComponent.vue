<!--
 * ControlButtonsAltComponent - Alternative positioned control buttons layout
 *
 * @fileoverview
 * An alternative control buttons component with absolute positioning and optional visibility.
 * Similar to ControlButtonsComponentTouch but with simplified button configurations and
 * different default styling. Designed for alternative UI layouts where standard control
 * patterns don't fit.
 *
 * @component ControlButtonsAltComponent
 * @module components/displayComponents/ControlButtonsAltComponent
 *
 * @description
 * This component provides an alternative approach to control button layouts with:
 * - Absolute positioning (left/right/middle × top/bottom/center)
 * - Horizontal or vertical button arrangement
 * - Simplified button background (default only, no pressed state)
 * - Conditional rendering via showAspect prop
 * - Per-button custom render functions
 * - Active/inactive states with color control
 * - FontAwesome icons or custom Vue components
 * - Individual button visibility control
 *
 * @example
 * // Basic alternative layout - bottom right
 * // <ControlButtonsAltComponent
 *   // :buttons="[
 *     { 
 *       name: 'Chat',
 *       icon: faComments,
 *       active: chatOpen,
 *       onPress: () => toggleChat()
 *     },
 *     { 
 *       name: 'Participants',
 *       icon: faUsers,
 *       active: participantsOpen,
 *       onPress: () => toggleParticipants()
 *     }
 *   ]"
 *   // position="right"
 *   // location="bottom"
 *   // :show-aspect="true"
 * // />
 *
 * @example
 * // Vertical sidebar controls
 * // <ControlButtonsAltComponent
 *   // :buttons="sidebarButtons"
 *   // position="left"
 *   // location="center"
 *   // direction="vertical"
 *   // :show-aspect="sidebarVisible"
 *   // :buttonsContainerStyle="{ backgroundColor: '#1a1a1a', padding: '8px' }"
 *   // :gap="12"
 * // />
 *
 * @example
 * // Custom styled with per-button visibility
 * // <ControlButtonsAltComponent
 *   // :buttons="[
 *     { 
 *       name: 'Record',
 *       icon: faCircle,
 *       show: canRecord,
 *       active: isRecording,
 *       activeColor: '#ff0000',
 *       inActiveColor: '#ffffff',
 *       backgroundColor: { default: '#333' },
 *       onPress: toggleRecording
 *     },
 *     { 
 *       name: 'Share',
 *       icon: faShareSquare,
 *       show: canShare,
 *       disabled: !hasContentToShare,
 *       onPress: startScreenShare
 *     }
 *   ]"
 *   // position="middle"
 *   // location="bottom"
 *   // :show-aspect="controlsEnabled"
 * // />
 *
 * @example
 * // Custom button renderer
 * // <ControlButtonsAltComponent
 *   // :buttons="actionButtons"
 *   // position="right"
 *   // location="top"
 *   // :show-aspect="true"
 *   // :render-button="(options) => {
 *     const { button, defaultButton } = options;
 *     if (button.customComponent) {
 *       return h(button.customComponent, { active: button.active });
 *     }
 *     return h('div', { class: 'alt-button-wrapper' }, [defaultButton]);
 *   }"
 * // />
 *
 * @example
 * // Custom content renderer with badges
 * // <ControlButtonsAltComponent
 *   // :buttons="notificationButtons"
 *   // position="right"
 *   // location="top"
 *   // :show-aspect="true"
 *   // :render-button-content="(options) => {
 *     const { button, defaultIcon, defaultLabel } = options;
 *     return h('div', { class: 'button-with-badge' }, [
 *       defaultIcon,
 *       button.active ? h('span', { class: 'badge' }, '!') : null,
 *       defaultLabel
 *     ]);
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
  type Component,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type PropType,
  type VNode,
  type VNodeChild,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

/**
 * Render options for button content
 * 
 * @interface RenderContentOptions
 * @property {number} index - Button index in the array
 * @property {boolean} isActive - Whether button is in active state
 * @property {VNode | null} defaultIcon - Default rendered icon VNode
 * @property {VNode | null} defaultLabel - Default rendered label VNode
 * @property {VNode} defaultContent - Default complete content VNode
 * @property {'horizontal' | 'vertical'} direction - Layout direction
 */
interface RenderContentOptions {
  index: number;
  isActive: boolean;
  defaultIcon: VNode | null;
  defaultLabel: VNode | null;
  defaultContent: VNode;
  direction: 'horizontal' | 'vertical';
}

/**
 * Render options for entire button
 * 
 * @interface RenderButtonOptions
 * @property {number} index - Button index in the array
 * @property {AltButton} button - Button configuration
 * @property {VNode} defaultButton - Default rendered button VNode
 * @property {ButtonHTMLAttributes} defaultProps - Default button HTML attributes
 * @property {'horizontal' | 'vertical'} direction - Layout direction
 */
interface RenderButtonOptions {
  index: number;
  button: AltButton;
  defaultButton: VNode;
  defaultProps: ButtonHTMLAttributes;
  direction: 'horizontal' | 'vertical';
}

/**
 * Alternative button configuration interface
 * 
 * @interface AltButton
 * @property {string} [name] - Button label text
 * @property {IconDefinition} [icon] - FontAwesome icon for default state
 * @property {IconDefinition} [alternateIcon] - FontAwesome icon for active state
 * @property {() => void} [onPress] - Click handler function
 * @property {{ default?: string; }} [backgroundColor] - Background color (default state only)
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
 * @property {(options: RenderContentOptions) => VNodeChild} [renderContent] - Custom renderer for button content
 * @property {(options: RenderButtonOptions) => VNodeChild} [renderButton] - Custom renderer for entire button
 */
export interface AltButton {
  name?: string;
  icon?: IconDefinition;
  alternateIcon?: IconDefinition;
  onPress?: () => void;
  backgroundColor?: {
    default?: string;
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
  renderContent?: (options: RenderContentOptions) => VNodeChild;
  renderButton?: (options: RenderButtonOptions) => VNodeChild;
}

/**
 * ControlButtonsAltComponent props interface
 * 
 * @interface ControlButtonsAltComponentProps
 * @property {AltButton[]} buttons - Array of button configurations to render
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
 * @property {HTMLAttributes} [containerProps] - HTML attributes for container div
 * @property {ButtonHTMLAttributes} [buttonProps] - Default HTML attributes for all <button> elements
 * @property {CSSProperties} [buttonStyle] - Default styles for all button elements
 * @property {string} [buttonClassName] - Default CSS class for all button elements
 * @property {HTMLAttributes} [iconWrapperProps] - Default HTML attributes for all icon wrapper divs
 * @property {HTMLAttributes} [textProps] - Default HTML attributes for all text/label spans
 * @property {HTMLAttributes} [contentWrapperProps] - Default HTML attributes for all content wrapper divs
 * @property {(options: RenderButtonOptions) => VNodeChild} [renderButton] - Custom renderer for entire button element
 * @property {(options: Omit<RenderContentOptions, 'isActive'> & { button: AltButton }) => VNodeChild} [renderButtonContent] - Custom renderer for button content
 * @property {number | string} [gap] - Gap/spacing between buttons (CSS gap value)
 * @example '12px', 12, '0.75rem'
 */
export interface ControlButtonsAltComponentProps {
  buttons: AltButton[];
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
  renderButton?: (options: RenderButtonOptions) => VNodeChild;
  renderButtonContent?: (options: Omit<RenderContentOptions, 'isActive'> & { button: AltButton }) => VNodeChild;
  gap?: number | string;
}

const props = withDefaults(defineProps<ControlButtonsAltComponentProps>(), {
  position: 'left',
  location: 'top',
  direction: 'horizontal',
  showAspect: false,
  buttonsContainerStyle: undefined,
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
});

// Helper: Join class names
function joinClassNames(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

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

const styles = {
  container: {
    marginTop: '5px',
    marginBottom: '5px',
    zIndex: 9,
  } as CSSProperties,
  buttonContainer: {
    alignItems: 'center',
    padding: '10px',
    borderRadius: '5px',
    marginLeft: '5px',
    marginRight: '5px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
  } as CSSProperties,
  verticalButton: {
    flexDirection: 'column',
  } as CSSProperties,
  buttonText: {
    fontSize: '12px',
    marginTop: '5px',
  } as CSSProperties,
};

// Alignment style
const alignmentStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {};

  if (props.position === 'left' || props.position === 'right' || props.position === 'middle') {
    style.justifyContent =
      props.position === 'left' ? 'flex-start' : props.position === 'right' ? 'flex-end' : 'center';
  }

  if (props.location === 'top' || props.location === 'bottom' || props.location === 'center') {
    style.alignItems =
      props.location === 'top' ? 'flex-start' : props.location === 'bottom' ? 'flex-end' : 'center';
  }

  if (props.direction === 'vertical') {
    style.flexDirection = 'column';
  } else {
    style.flexDirection = 'row';
  }

  if (props.gap !== undefined) {
    style.gap = typeof props.gap === 'number' ? `${props.gap}px` : props.gap;
  }

  return style;
});

// Container props merging
const containerRestAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = props.containerProps || {};
  return rest;
});

const containerClassNames = computed(() =>
  joinClassNames('mediasfu-alt-buttons-container', props.containerProps?.class as string | undefined)
);

const containerStyle = computed(() => {
  const baseStyle: CSSProperties = {
    ...styles.container,
    ...alignmentStyle.value,
    display: props.showAspect ? 'flex' : 'none',
  };

  return {
    ...baseStyle,
    ...(props.buttonsContainerStyle || {}),
    ...(typeof props.containerProps?.style === 'object' ? props.containerProps.style : {}),
  } as CSSProperties;
});

// Shared button props from component level
const sharedButtonRest = computed(() => {
  const { onClick: _o, style: _s, class: _c, type: _t, ...rest } = props.buttonProps || {};
  return rest;
});

const sharedButtonStyle = computed(() => {
  const style = props.buttonProps?.style;
  return typeof style === 'object' && !Array.isArray(style) ? (style as CSSProperties) : {};
});

const sharedButtonClassName = computed(() => props.buttonClassName);
const sharedButtonType = computed(() => props.buttonProps?.type);
const sharedButtonOnClick = computed(() => props.buttonProps?.onClick);

// Render buttons
const buttonNodes = computed(() => {
  return props.buttons.map((button, index) => {
    const perButtonProps = button.buttonProps || {};
    const perButtonStyle = button.style || {};
    const perButtonClassName = button.className;
    const perIconWrapperProps = button.iconWrapperProps || {};
    const perTextProps = button.textProps || {};
    const perContentWrapperProps = button.contentWrapperProps || {};

    const { onClick: perButtonOnClick, style: perButtonButtonStyle, class: perButtonButtonClass, type: perButtonType, ...restPerButtonProps } = perButtonProps;

    const isVisible = button.show !== false;

    const mergedButtonRest: ButtonHTMLAttributes = {
      ...sharedButtonRest.value,
      ...restPerButtonProps,
      disabled: button.disabled ?? restPerButtonProps.disabled ?? sharedButtonRest.value.disabled,
    };

    const perButtonButtonStyleObj = typeof perButtonButtonStyle === 'object' && !Array.isArray(perButtonButtonStyle) ? (perButtonButtonStyle as CSSProperties) : {};

    const backgroundColor = isVisible
      ? perButtonButtonStyleObj.backgroundColor ??
        perButtonStyle?.backgroundColor ??
        props.buttonStyle?.backgroundColor ??
        sharedButtonStyle.value.backgroundColor ??
        button.backgroundColor?.default ??
        'transparent'
      : 'transparent';

    const combinedStyle = {
      ...styles.buttonContainer,
      ...(isVisible ? {} : { display: 'none' }),
      ...(isVertical.value ? styles.verticalButton : {}),
      backgroundColor,
      ...sharedButtonStyle.value,
      ...(props.buttonStyle || {}),
      ...perButtonButtonStyleObj,
      ...(perButtonStyle || {}),
    } as CSSProperties;

    if (isVisible && !combinedStyle.display) {
      combinedStyle.display = 'flex';
    }

    const combinedClassName = joinClassNames(
      'mediasfu-alt-button',
      sharedButtonClassName.value,
      props.buttonClassName,
      perButtonButtonClass as string | undefined,
      perButtonClassName
    );

    const resolvedType = perButtonType || sharedButtonType.value || 'button';

    const handleClick = (event: MouseEvent) => {
      if (perButtonOnClick) {
        (perButtonOnClick as (e: MouseEvent) => void)(event);
      }
      if (sharedButtonOnClick.value) {
        (sharedButtonOnClick.value as (e: MouseEvent) => void)(event);
      }

      if (!event.defaultPrevented) {
        button.onPress?.();
      }
    };

    // Content wrapper props
    const { style: perContentWrapperStyle, class: perContentWrapperClass, ...restPerContentWrapper } = perContentWrapperProps;
    const { style: defaultContentWrapperStyle, class: defaultContentWrapperClass, ...restDefaultContentWrapper } = props.contentWrapperProps || {};

    const perContentWrapperStyleObj = typeof perContentWrapperStyle === 'object' && !Array.isArray(perContentWrapperStyle) ? (perContentWrapperStyle as CSSProperties) : {};
    const defaultContentWrapperStyleObj = typeof defaultContentWrapperStyle === 'object' && !Array.isArray(defaultContentWrapperStyle) ? (defaultContentWrapperStyle as CSSProperties) : {};

    const contentWrapperClassName = joinClassNames(
      'mediasfu-alt-button-content',
      defaultContentWrapperClass as string | undefined,
      perContentWrapperClass as string | undefined
    );

    const contentWrapperStyle: CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: isVertical.value ? '6px' : '8px',
      ...defaultContentWrapperStyleObj,
      ...perContentWrapperStyleObj,
    };

    // Icon wrapper props
    const { style: perIconWrapperStyle, class: perIconWrapperClass, ...restPerIconWrapper } = perIconWrapperProps;
    const { style: defaultIconWrapperStyle, class: defaultIconWrapperClass, ...restDefaultIconWrapper } = props.iconWrapperProps || {};

    const perIconWrapperStyleObj = typeof perIconWrapperStyle === 'object' && !Array.isArray(perIconWrapperStyle) ? (perIconWrapperStyle as CSSProperties) : {};
    const defaultIconWrapperStyleObj = typeof defaultIconWrapperStyle === 'object' && !Array.isArray(defaultIconWrapperStyle) ? (defaultIconWrapperStyle as CSSProperties) : {};

    const iconWrapperClassName = joinClassNames(
      'mediasfu-alt-button-icon',
      defaultIconWrapperClass as string | undefined,
      perIconWrapperClass as string | undefined
    );

    const iconWrapperStyle: CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...defaultIconWrapperStyleObj,
      ...perIconWrapperStyleObj,
    };

    // Text props
    const { style: perTextStyle, class: perTextClass, ...restPerText } = perTextProps;
    const { style: defaultTextStyle, class: defaultTextClass, ...restDefaultText } = props.textProps || {};

    const perTextStyleObj = typeof perTextStyle === 'object' && !Array.isArray(perTextStyle) ? (perTextStyle as CSSProperties) : {};
    const defaultTextStyleObj = typeof defaultTextStyle === 'object' && !Array.isArray(defaultTextStyle) ? (defaultTextStyle as CSSProperties) : {};

    const textClassName = joinClassNames(
      'mediasfu-alt-button-text',
      defaultTextClass as string | undefined,
      perTextClass as string | undefined
    );

    const textStyle: CSSProperties = {
      ...styles.buttonText,
      color: button.color || '#ffffff',
      ...defaultTextStyleObj,
      ...perTextStyleObj,
    };

    // Default icon
    const defaultIcon = computed(() => {
      if (button.icon) {
        const iconColor = button.active
          ? button.activeColor || button.inActiveColor || 'transparent'
          : button.inActiveColor || 'transparent';

        const iconToUse = button.active && button.alternateIcon ? button.alternateIcon : button.icon;
        const componentToUse = button.active && button.alternateIconComponent
          ? button.alternateIconComponent
          : button.iconComponent;

        if (componentToUse) {
          return h(
            'span',
            {
              class: iconWrapperClassName,
              style: iconWrapperStyle,
              ...restDefaultIconWrapper,
              ...restPerIconWrapper,
            },
            [h(componentToUse)]
          );
        }

        return h(
          'span',
          {
            class: iconWrapperClassName,
            style: iconWrapperStyle,
            ...restDefaultIconWrapper,
            ...restPerIconWrapper,
          },
          [
            h(FontAwesomeIcon, {
              icon: iconToUse,
              size: 'lg',
              color: iconColor,
            }),
          ]
        );
      } else if (button.customComponent) {
        return h(button.customComponent);
      }
      return null;
    });

    // Default label
    const defaultLabel = computed(() => {
      if (button.name) {
        return h(
          'span',
          {
            class: textClassName,
            style: textStyle,
            ...restDefaultText,
            ...restPerText,
          },
          button.name
        );
      }
      return null;
    });

    // Default content
    const defaultContent = computed(() => {
      return h(
        'div',
        {
          class: contentWrapperClassName,
          style: contentWrapperStyle,
          ...restDefaultContentWrapper,
          ...restPerContentWrapper,
        },
        [defaultIcon.value, defaultLabel.value].filter(Boolean)
      );
    });

    // Content node (with renderContent hooks)
    const contentNode = computed(() => {
      if (button.renderContent) {
        const custom = button.renderContent({
          index,
          isActive: button.active || false,
          defaultIcon: defaultIcon.value,
          defaultLabel: defaultLabel.value,
          defaultContent: defaultContent.value,
          direction: props.direction,
        });
        if (custom) {
          if (isVNode(custom)) return custom;
          return h(RenderVNode, { node: custom });
        }
      }

      if (props.renderButtonContent) {
        const custom = props.renderButtonContent({
          index,
          button,
          defaultIcon: defaultIcon.value,
          defaultLabel: defaultLabel.value,
          defaultContent: defaultContent.value,
          direction: props.direction,
        });
        if (custom) {
          if (isVNode(custom)) return custom;
          return h(RenderVNode, { node: custom });
        }
      }

      return defaultContent.value;
    });

    // Default button
    const defaultButton = computed(() =>
      h(
        'button',
        {
          class: combinedClassName,
          style: combinedStyle,
          type: resolvedType,
          onClick: handleClick,
          ...mergedButtonRest,
        },
        [contentNode.value]
      )
    );

    // Button node (with renderButton hooks)
    if (button.renderButton) {
      const custom = button.renderButton({
        index,
        button,
        defaultButton: defaultButton.value,
        defaultProps: {
          class: combinedClassName,
          style: combinedStyle,
          type: resolvedType,
          onClick: handleClick,
          ...mergedButtonRest,
        },
        direction: props.direction,
      });
      if (custom) {
        if (isVNode(custom)) return custom;
        return h(RenderVNode, { node: custom });
      }
    }

    if (props.renderButton) {
      const custom = props.renderButton({
        index,
        button,
        defaultButton: defaultButton.value,
        defaultProps: {
          class: combinedClassName,
          style: combinedStyle,
          type: resolvedType,
          onClick: handleClick,
          ...mergedButtonRest,
        },
        direction: props.direction,
      });
      if (custom) {
        if (isVNode(custom)) return custom;
        return h(RenderVNode, { node: custom });
      }
    }

    return defaultButton.value;
  });
});

// Container node
const containerNode = computed(() =>
  h(
    'div',
    {
      class: containerClassNames.value,
      style: containerStyle.value,
      ...containerRestAttrs.value,
    },
    buttonNodes.value
  )
);

</script>
