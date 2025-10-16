<!--
/**
 * @fileoverview MenuItemComponent - Simple menu button with icon and text
 * @component MenuItemComponent
 * @module components/menuComponents/MenuItemComponent
 * 
 * @description
 * A simple, reusable menu button component that displays an optional FontAwesome icon
 * and/or text label. Used in MenuModal and other menu contexts to provide consistent
 * menu item styling and behavior. Features a transparent background with white text/icons.
 * 
 * Features:
 * - Optional FontAwesome icon (left-aligned)
 * - Optional text label (right of icon)
 * - Transparent background with white text
 * - Click handler via onPress prop
 * - Consistent spacing and sizing
 * - Fully customizable via icon and name props
 * 
 * @example Menu Item with Icon and Text
 * // <MenuItemComponent
 *   // :icon="faUser"
 *   // name="View Participants"
 *   // :onPress="() => openParticipantsModal()"
 * // />
 * 
 * @example Icon Only
 * // <MenuItemComponent
 *   // :icon="faComment"
 *   // :onPress="() => openChat()"
 * // />
 * 
 * @example Text Only
 * // <MenuItemComponent
 *   // name="End Meeting"
 *   // :onPress="() => confirmEndMeeting()"
 * // />
 * 
 * @example Common Menu Items
 * // <MenuItemComponent
 *   // :icon="faCog"
 *   // name="Settings"
 *   // :onPress="() => openSettings()"
 * // />
 * // <MenuItemComponent
 *   // :icon="faSignOutAlt"
 *   // name="Leave Meeting"
 *   // :onPress="() => handleLeaveMeeting()"
 * // />
 * // <MenuItemComponent
 *   // :icon="faRecordVinyl"
 *   // name="Start Recording"
 *   // :onPress="() => startRecording()"
 * // />
 * 
 * @remarks
 * This is a lightweight, presentational component with no internal state.
 * All styling is predefined for consistency across the menu system.
 * 
 * Workflow:
 * 1. Component renders button with transparent background
 * 2. If icon provided → Renders FontAwesome icon (20px, white, left-aligned)
 * 3. If name provided → Renders text label (16px, white, right of icon)
 * 4. User clicks button → Calls onPress function
 * 
 * @see {@link MenuModal} - Modal container that uses multiple MenuItemComponents
 */
-->
<template>
  <button
    :style="listItemStyle"
    @click="onPress"
  >
    <font-awesome-icon
      v-if="icon"
      :icon="icon"
      :style="listIconStyle"
    />
    <span
      v-if="name"
      :style="listTextStyle"
    >{{ name }}</span>
  </button>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

/**
 * Props for the MenuItemComponent
 * @interface MenuItemComponentProps
 * 
 * @property {IconDefinition} [icon] - Optional FontAwesome icon to display
 * @property {string} [name] - Optional text label to display
 * @property {() => void} onPress - Click handler function
 * 
 * @example
 * ```typescript
 * // <MenuItemComponent
 *   // :icon="faUsers"
 *   // name="Participants"
 *   // :onPress="() => openParticipants()"
 * // />
 * ```
 */
export interface MenuItemComponentProps {
  icon?: IconDefinition;
  name?: string;
  onPress: () => void;
}

defineProps<MenuItemComponentProps>();

const listItemStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'transparent',
  border: 'none',
  fontSize: '16px',
  paddingLeft: 0,
  marginLeft: 0,
  marginBottom: '10px',
  cursor: 'pointer',
};

const listIconStyle: CSSProperties = {
  fontSize: '20px',
  marginRight: '10px',
  color: '#ffffff',
};

const listTextStyle: CSSProperties = {
  color: '#ffffff',
  fontSize: '16px',
};
</script>
