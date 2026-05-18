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
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type PropType,
  type VNodeChild,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { Button, ControlButtonsComponentProps } from '../../components/displayComponents/ControlButtonsComponent.vue';
import { mergeAttrObjects, mergeStyleObjects } from './styleUtils';

type Alignment = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
type ModernButton = Button & { tooltip?: string };

export interface ModernControlButtonsComponentProps extends ControlButtonsComponentProps {
  isDarkMode?: boolean;
  iconSize?: number;
  animateOnMount?: boolean;
}

const props = withDefaults(defineProps<ModernControlButtonsComponentProps>(), {
  alignment: 'center',
  vertical: false,
  isDarkMode: true,
  iconSize: 22,
  animateOnMount: true,
  buttonsContainerStyle: undefined,
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

const isMounted = ref(!props.animateOnMount);
const hoveredIndex = ref<number | null>(null);
const pressedIndex = ref<number | null>(null);

onMounted(() => {
  if (!props.animateOnMount) {
    return;
  }

  requestAnimationFrame(() => {
    isMounted.value = true;
  });
});

const visibleButtons = computed<ModernButton[]>(() =>
  props.buttons.filter((button): button is ModernButton => button.show !== false)
);

const alignmentMap: Record<Alignment, CSSProperties['justifyContent']> = {
  'flex-start': 'flex-start',
  center: 'center',
  'flex-end': 'flex-end',
  'space-between': 'space-between',
  'space-around': 'space-around',
  'space-evenly': 'space-evenly',
};

const wrapperStyle = computed<CSSProperties>(() => ({
  opacity: isMounted.value ? 1 : 0,
  transform: isMounted.value ? 'scale(1)' : 'scale(0.92)',
  transition: 'transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  boxShadow: props.isDarkMode ? '0 8px 20px rgba(2, 8, 23, 0.2)' : '0 6px 14px rgba(15, 23, 42, 0.12)',
  borderRadius: '999px',
}));

const glassContainerStyle = computed<CSSProperties>(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 14px',
  borderRadius: '999px',
  background: props.isDarkMode ? 'rgba(15, 23, 42, 0.74)' : 'rgba(255, 255, 255, 0.84)',
  border: `1px solid ${props.isDarkMode ? 'rgba(148, 163, 184, 0.18)' : 'rgba(148, 163, 184, 0.24)'}`,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
}));

const contentStyle = computed<CSSProperties>(() => ({
  display: 'flex',
  flexDirection: props.vertical ? 'column' : 'row',
  alignItems: 'center',
  justifyContent: alignmentMap[props.alignment as Alignment] ?? 'center',
  gap: typeof props.gap === 'number' ? `${props.gap}px` : props.gap ?? (props.vertical ? '10px' : '12px'),
  ...(props.buttonsContainerStyle ?? {}),
}));

const tooltipStyle = computed<CSSProperties>(() => ({
  position: 'absolute',
  bottom: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  marginBottom: '8px',
  padding: '4px 8px',
  background: props.isDarkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.96)',
  color: props.isDarkMode ? '#ffffff' : '#1f2937',
  fontSize: '12px',
  fontWeight: 600,
  lineHeight: 1.2,
  borderRadius: '6px',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  boxShadow: props.isDarkMode ? '0 10px 24px rgba(2, 8, 23, 0.28)' : '0 10px 24px rgba(15, 23, 42, 0.14)',
  zIndex: 10,
}));

const isButtonActive = (button: ModernButton) => button.active === true;

const isButtonDisabled = (button: ModernButton) =>
  button.disabled === true || button.buttonProps?.disabled === true || props.buttonProps?.disabled === true;

const getActiveColor = (button: ModernButton) => button.activeColor || '#6366f1';

const getInactiveColor = (button: ModernButton) =>
  button.inActiveColor || button.color || props.buttonColor || (props.isDarkMode ? 'rgba(255, 255, 255, 0.82)' : 'rgba(15, 23, 42, 0.72)');

const getTooltipLabel = (button: ModernButton) => button.tooltip || button.name || '';

const invokeHandler = (handler: unknown, event?: Event) => {
  if (Array.isArray(handler)) {
    handler.forEach((item) => invokeHandler(item, event));
    return;
  }

  if (typeof handler === 'function') {
    (handler as (event?: Event) => void)(event);
  }
};

const renderIconNode = (button: ModernButton, active: boolean, color: string): VNodeChild => {
  const componentIcon = active
    ? button.alternateIconComponent || props.alternateIconComponent
    : button.iconComponent;

  if (componentIcon) {
    return h(componentIcon);
  }

  const icon = active ? button.alternateIcon || button.icon : button.icon;
  if (!icon) {
    return null;
  }

  return h(FontAwesomeIcon, { icon, style: { color, fontSize: `${props.iconSize}px` } });
};

const getButtonStyle = (button: ModernButton, index: number): CSSProperties => {
  const active = isButtonActive(button);
  const disabled = isButtonDisabled(button);
  const hovered = hoveredIndex.value === index;
  const pressed = pressedIndex.value === index;
  const activeColor = getActiveColor(button);
  const defaultBackground = active
    ? activeColor
    : props.isDarkMode
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(15, 23, 42, 0.06)';
  const background = pressed
    ? button.backgroundColor?.pressed || props.buttonBackgroundColor?.pressed || button.backgroundColor?.default || props.buttonBackgroundColor?.default || defaultBackground
    : button.backgroundColor?.default || props.buttonBackgroundColor?.default || defaultBackground;

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `${props.iconSize + 18}px`,
    height: `${props.iconSize + 18}px`,
    borderRadius: '999px',
    background,
    border: 'none',
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transform: pressed ? 'scale(0.92)' : hovered ? 'scale(1.05)' : 'scale(1)',
    transition: 'transform 160ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 160ms cubic-bezier(0.2, 0.8, 0.2, 1), background 160ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    boxShadow: active
      ? '0 4px 16px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.1)'
      : hovered
        ? props.isDarkMode
          ? '0 8px 18px rgba(2, 8, 23, 0.18)'
          : '0 6px 14px rgba(15, 23, 42, 0.12)'
        : 'none',
    padding: 0,
    position: 'relative',
  };
};

const renderButtonContent = (button: ModernButton, index: number): VNodeChild => {
  const active = isButtonActive(button);
  const activeColor = getActiveColor(button);
  const inactiveColor = getInactiveColor(button);
  const iconColor = active ? '#ffffff' : inactiveColor;

  const defaultIcon = h(
    'span',
    mergeAttrObjects(
      {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: active ? activeColor : iconColor,
        },
      },
      mergeAttrObjects(props.iconWrapperProps, button.iconWrapperProps),
    ),
    [renderIconNode(button, active, iconColor)],
  );

  const defaultLabel = button.name
    ? h(
        'span',
        mergeAttrObjects(
          {
            style: {
              display: 'none',
            },
          },
          mergeAttrObjects(props.textProps, button.textProps),
        ),
        button.name,
      )
    : null;

  const defaultContent = h(
    'span',
    mergeAttrObjects(
      {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      },
      mergeAttrObjects(props.contentWrapperProps, button.contentWrapperProps),
    ),
    [defaultIcon],
  );

  if (button.renderContent) {
    return button.renderContent({
      index,
      isActive: active,
      defaultIcon,
      defaultLabel,
      defaultContent,
      vertical: props.vertical,
    });
  }

  if (props.renderButtonContent) {
    return props.renderButtonContent({
      index,
      button,
      defaultIcon,
      defaultLabel,
      defaultContent,
      vertical: props.vertical,
    });
  }

  return defaultContent;
};

const renderButton = (button: ModernButton, index: number): VNodeChild => {
  if (button.customComponent) {
    return h(button.customComponent);
  }

  const disabled = isButtonDisabled(button);
  const active = isButtonActive(button);
  const tooltipLabel = getTooltipLabel(button);
  const mergedButtonAttrs = mergeAttrObjects(props.buttonProps, button.buttonProps);
  const composedButtonStyle = mergeStyleObjects(
    mergeStyleObjects(getButtonStyle(button, index), props.buttonStyle),
    button.style,
  );
  const computedButtonProps: ButtonHTMLAttributes = {
    ...(mergedButtonAttrs as ButtonHTMLAttributes),
    type: 'button',
    disabled,
    class: mergeAttrObjects(
      { class: props.buttonClassName },
      { class: [button.className, mergedButtonAttrs.class] },
    ).class,
    style: mergeStyleObjects(
      composedButtonStyle,
      typeof mergedButtonAttrs.style === 'object' ? (mergedButtonAttrs.style as CSSProperties) : undefined,
    ),
    'aria-label': tooltipLabel,
    'aria-pressed': active,
    onClick: (event?: Event) => {
      if (disabled) {
        return;
      }
      button.onPress?.();
      invokeHandler(mergedButtonAttrs.onClick, event);
    },
    onMousedown: (event?: Event) => {
      if (!disabled) {
        pressedIndex.value = index;
      }
      invokeHandler(mergedButtonAttrs.onMousedown, event);
    },
    onMouseup: (event?: Event) => {
      if (pressedIndex.value === index) {
        pressedIndex.value = null;
      }
      invokeHandler(mergedButtonAttrs.onMouseup, event);
    },
    onMouseenter: (event?: Event) => {
      if (!disabled) {
        hoveredIndex.value = index;
      }
      invokeHandler(mergedButtonAttrs.onMouseenter, event);
    },
    onMouseleave: (event?: Event) => {
      if (hoveredIndex.value === index) {
        hoveredIndex.value = null;
      }
      if (pressedIndex.value === index) {
        pressedIndex.value = null;
      }
      invokeHandler(mergedButtonAttrs.onMouseleave, event);
    },
  };

  const defaultButton = h('button', computedButtonProps, [
    renderButtonContent(button, index),
    hoveredIndex.value === index && tooltipLabel
      ? h('span', { style: tooltipStyle.value }, tooltipLabel)
      : null,
  ]);

  if (props.renderButton) {
    return props.renderButton({
      index,
      button,
      defaultButton,
      defaultProps: computedButtonProps,
      vertical: props.vertical,
    });
  }

  return defaultButton;
};

const containerNode = computed<VNodeChild>(() => {
  if (visibleButtons.value.length === 0) {
    return null;
  }

  const containerAttrs = mergeAttrObjects(
    {
      class: 'ms-modern-control-buttons-wrap',
      style: wrapperStyle.value,
    },
    props.containerProps,
  );

  return h(
    'div',
    containerAttrs,
    [
      h(
        'div',
        {
          class: 'ms-modern-control-buttons',
          style: glassContainerStyle.value,
        },
        [
          h(
            'div',
            {
              class: 'ms-modern-control-buttons__content',
              style: contentStyle.value,
            },
            visibleButtons.value.map((button, index) => renderButton(button, index)),
          ),
        ],
      ),
    ],
  );
});
</script>
