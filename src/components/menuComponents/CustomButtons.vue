<!--
/**
 * @fileoverview CustomButtons - Flexible custom button container
 * @component CustomButtons
 * @module components/menuComponents/CustomButtons
 * 
 * @description
 * A simple, flexible container for rendering custom action buttons. Each button can
 * display an icon, text label, or fully custom Vue component. Supports conditional
 * visibility, disabled states, and custom styling per button. Used for injecting
 * custom actions into menus, toolbars, and control panels.
 * 
 * Features:
 * - FontAwesome icon support with custom sizing/styling
 * - Optional text labels alongside icons
 * - Custom Vue component injection per button
 * - Conditional visibility via show prop
 * - Disabled state support
 * - Custom background colors per button
 * - Fallback spinner for loading states
 * - Flexible layout via CSS (horizontal/vertical)
 * 
 * @example Basic Icon Buttons
 * // <CustomButtons
 *   // :buttons="[
 *     {
 *       icon: faGear,
 *       text: 'Settings',
 *       show: true,
 *       disabled: false,
 *       backgroundColor: '#007bff',
 *       action: () => openSettings()
 *     },
 *     {
 *       icon: faSignOutAlt,
 *       text: 'Leave',
 *       show: true,
 *       disabled: false,
 *       backgroundColor: '#dc3545',
 *       action: () => leaveRoom()
 *     }
 *   ]"
 * // />
 * 
 * @example With Custom Component
 * // <CustomButtons
 *   // :buttons="[
 *     {
 *       customComponent: MyCustomButton,
 *       show: true,
 *       action: () => handleCustomAction()
 *     }
 *   ]"
 * // />
 * 
 * @example Loading State (No Icon)
 * // <CustomButtons
 *   // :buttons="[
 *     {
 *       text: 'Loading...',
 *       show: true,
 *       disabled: true,
 *       action: () => {}
 *     }
 *   ]"
 * // />
 * 
 * @remarks
 * This component is intentionally simple - it's a pure renderer for button data.
 * All logic (click handlers, visibility, styling) is defined in the buttons array.
 * When no icon or customComponent is provided, a spinner is shown as a fallback.
 * 
 * Workflow:
 * 1. Receives buttons array via props
 * 2. Renders each button with conditional display based on show prop
 * 3. Applies custom backgroundColor when visible, transparent when hidden
 * 4. Shows icon + text, customComponent, or fallback spinner
 * 5. Calls button.action on click
 * 6. Respects disabled state
 * 
 * @see {@link MenuModal} - Uses CustomButtons for custom menu actions
 * @see {@link ControlButtonsComponent} - Alternative for standard control buttons
 */
-->
<template>
  <div class="mediasfu-customButtonsContainer">
    <button
      v-for="(button, index) in buttons"
      :key="index"
      class="customButton"
      :style="{
        backgroundColor: button.show ? button.backgroundColor : 'transparent',
        display: button.show ? 'flex' : 'none',
      }"
      :disabled="button.disabled"
      @click="button.action"
    >
      <div class="buttonContent">
        <template v-if="button.icon">
          <font-awesome-icon
            :icon="button.icon"
            :style="{ ...customButtonIconStyle, ...button.iconStyle }"
          />
          <span
            v-if="button.text"
            class="customButtonText"
            :style="button.textStyle"
          >
            {{ button.text }}
          </span>
        </template>
        <component
          :is="button.customComponent"
          v-else-if="button.customComponent"
        />
        <font-awesome-icon
          v-else
          :icon="faSpinner"
          spin
        />
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Component, CSSProperties } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSpinner, type IconDefinition } from '@fortawesome/free-solid-svg-icons';

/**
 * Custom button definition
 * @interface CustomButton
 * 
 * @property {function} action - Click handler function
 * @property {boolean} show - Whether button is visible
 * @property {string} [backgroundColor] - Custom background color (e.g., '#007bff')
 * @property {boolean} [disabled] - Whether button is disabled
 * @property {IconDefinition} [icon] - FontAwesome icon definition
 * @property {CSSProperties} [iconStyle] - Custom icon styles
 * @property {string} [text] - Text label to display alongside icon
 * @property {CSSProperties} [textStyle] - Custom text styles
 * @property {Component} [customComponent] - Custom Vue component to render instead of icon
 * 
 * @example
 * ```typescript
 * const button: CustomButton = {
 *   // icon: faGear,
 *   // text: 'Settings',
 *   // show: true,
 *   // disabled: false,
 *   // backgroundColor: '#007bff',
 *   // action: () => openSettings()
 * }
 * ```
 */
export interface CustomButton {
  action: () => void;
  show: boolean;
  backgroundColor?: string;
  disabled?: boolean;
  icon?: IconDefinition;
  iconStyle?: CSSProperties;
  text?: string;
  textStyle?: CSSProperties;
  customComponent?: Component;
}

export interface CustomButtonsProps {
  buttons: CustomButton[];
}

defineProps<CustomButtonsProps>();

const customButtonIconStyle: CSSProperties = {
  fontSize: '20px',
  marginRight: '5px',
};
</script>

<style scoped>
@import './CustomButtons.css';
</style>
