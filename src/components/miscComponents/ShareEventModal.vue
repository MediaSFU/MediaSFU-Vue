<!--
/**
 * @fileoverview ShareEventModal - Meeting details sharing modal
 * @component ShareEventModal
 * @module components/miscComponents/ShareEventModal
 * 
 * @description
 * A modal dialog that displays meeting details (ID, passcode) and provides social sharing
 * buttons. Positioned in one of four corners and features copy-to-clipboard functionality
 * for meeting credentials. Used to help hosts/co-hosts share meeting information with
 * participants via various communication channels.
 * 
 * Features:
 * - Meeting ID display with copy button (via MeetingIdComponent)
 * - Admin passcode display with copy button (via MeetingPasscodeComponent)
 * - Social sharing buttons (via ShareButtonsComponent)
 * - Four corner positioning options (topRight, topLeft, bottomRight, bottomLeft)
 * - Optional shareButtons visibility toggle
 * - Close button with FontAwesome icon
 * - Responsive design
 * - Complete render function customization
 * 
 * Position Options:
 * - **topRight**: Top-right corner (15px from top, 15px from right)
 * - **topLeft**: Top-left corner (15px from top, 15px from left)
 * - **bottomRight**: Bottom-right corner (15px from bottom, 15px from right)
 * - **bottomLeft**: Bottom-left corner (15px from bottom, 15px from left)
 * 
 * @example Basic Share Modal (Host)
 * // <ShareEventModal
 *   // :isShareEventModalVisible="showShareModal"
 *   // :onShareEventClose="() => { showShareModal = false; }"
 *   // roomName="meeting-123"
 *   // adminPasscode="admin456"
 *   // islevel="2"
 *   // eventType="conference"
 * // />
 * 
 * @example Without Share Buttons
 * // <ShareEventModal
 *   // :isShareEventModalVisible="true"
 *   // :onShareEventClose="handleClose"
 *   // roomName="webinar-789"
 *   // adminPasscode="secure123"
 *   // islevel="2"
 *   // eventType="webinar"
 *   // :shareButtons="false"
 * // />
 * 
 * @example Custom Position (Bottom Left)
 * // <ShareEventModal
 *   // :isShareEventModalVisible="visible"
 *   // :onShareEventClose="close"
 *   // roomName="broadcast-456"
 *   // eventType="broadcast"
 *   // position="bottomLeft"
 * // />
 * 
 * @example With Local Link (Self-Hosted)
 * // <ShareEventModal
 *   // :isShareEventModalVisible="true"
 *   // :onShareEventClose="handleClose"
 *   // roomName="meeting-abc"
 *   // adminPasscode="admin789"
 *   // islevel="2"
 *   // eventType="conference"
 *   // localLink="https://my-company.com"
 * // />
 * 
 * @example Custom Styling
 * // <ShareEventModal
 *   // :isShareEventModalVisible="true"
 *   // :onShareEventClose="handleClose"
 *   // roomName="meeting-xyz"
 *   // eventType="webinar"
 *   // backgroundColor="rgba(30,30,30,0.95)"
 *   // position="topLeft"
 * // />
 * 
 * @remarks
 * The admin passcode is only displayed if the current user is a host (islevel='2').
 * The modal composes three child components: MeetingIdComponent, MeetingPasscodeComponent,
 * and ShareButtonsComponent, each handling their specific functionality. Social share
 * buttons can be hidden by setting shareButtons=false.
 * 
 * Workflow:
 * 1. Host opens share modal → Meeting ID and admin passcode displayed
 * 2. User clicks copy buttons → Credentials copied to clipboard
 * 3. User clicks social share button → Opens share dialog in new tab
 * 4. User clicks close button → onShareEventClose() called, modal hides
 * 5. Modal repositions based on position prop
 * 
 * @see {@link MeetingIdComponent} - Meeting ID display with copy button
 * @see {@link MeetingPasscodeComponent} - Passcode display with copy button
 * @see {@link ShareButtonsComponent} - Social sharing buttons
 * @see {@link MenuModal} - Alternative menu for sharing
 */
-->
<template>
  <RenderVNode :node="overlayNode" />
</template>

<script setup lang="ts">
import {
  computed,
  defineComponent,
  h,
  isVNode,
  type PropType,
  type VNodeChild,
  type CSSProperties,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import type { FontAwesomeIconProps } from '@fortawesome/vue-fontawesome';
import MeetingIdComponent from '../menuComponents/MeetingIDComponent.vue';
import MeetingPasscodeComponent from '../menuComponents/MeetingPasscodeComponent.vue';
import ShareButtonsComponent from '../menuComponents/ShareButtonsComponent.vue';
import type { EventType } from '../../../../SharedTypes';
import type { MeetingIdComponentProps } from '../menuComponents/MeetingIDComponent.vue';
import type { MeetingPasscodeComponentProps } from '../menuComponents/MeetingPasscodeComponent.vue';
import type { ShareButtonsComponentProps } from '../menuComponents/ShareButtonsComponent.vue';

// Helper function to join class names
function joinClassNames(...classes: Array<string | undefined | null | false>): string | undefined {
  const filtered = classes.filter(Boolean) as string[];
  return filtered.length > 0 ? filtered.join(' ') : undefined;
}

/**
 * Props for the ShareEventModal component
 * @interface ShareEventModalProps
 * 
 * @property {string} [backgroundColor='rgba(255, 255, 255, 0.25)'] - Background color for modal
 * @property {boolean} isShareEventModalVisible - Whether the modal is currently visible
 * @property {() => void} onShareEventClose - Callback when modal is closed
 * @property {boolean} [shareButtons=true] - Whether to show social sharing buttons
 * @property {'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft'} [position='topRight'] - Corner position for modal
 * @property {string} roomName - Meeting/Event ID to display and share
 * @property {string} [adminPasscode] - Admin passcode to display (only for hosts)
 * @property {string} [islevel='0'] - User level ('0'=participant, '1'=co-host, '2'=host)
 * @property {EventType} eventType - Event type ('conference' | 'webinar' | 'broadcast' | 'chat')
 * @property {string} [localLink] - Custom domain for self-hosted instances
 * @property {HTMLAttributes} [overlayProps] - Additional HTML attributes for overlay
 * @property {HTMLAttributes} [contentProps] - Additional HTML attributes for content container
 * @property {HTMLAttributes} [headerProps] - Additional HTML attributes for header
 * @property {ButtonHTMLAttributes} [closeButtonProps] - Additional HTML attributes for close button
 * @property {VNodeChild} [closeIcon] - Custom close icon/component
 * @property {Partial<FontAwesomeIconProps>} [closeIconProps] - Props for close icon
 * 
 * @default backgroundColor - 'rgba(255, 255, 255, 0.25)'
 * @default shareButtons - true
 * @default position - 'topRight'
 * @default islevel - '0'
 * 
 * @example
 * ```typescript
 * // <ShareEventModal
 *   // :isShareEventModalVisible="showModal"
 *   // :onShareEventClose="handleClose"
 *   // roomName="meeting-123"
 *   // adminPasscode="admin456"
 *   // islevel="2"
 *   // eventType="conference"
 *   // position="topRight"
 *   // :shareButtons="true"
 *   // localLink="https://my-company.com"
 * // />
 * ```
 */
export interface ShareEventModalProps {
  backgroundColor?: string;
  isShareEventModalVisible: boolean;
  onShareEventClose: () => void;
  shareButtons?: boolean;
  position?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';
  roomName: string;
  adminPasscode?: string;
  islevel?: string;
  eventType: EventType;
  localLink?: string;
  overlayProps?: HTMLAttributes;
  contentProps?: HTMLAttributes;
  headerProps?: HTMLAttributes;
  closeButtonProps?: ButtonHTMLAttributes;
  closeIcon?: VNodeChild;
  closeIconProps?: Partial<FontAwesomeIconProps>;
  dividerProps?: HTMLAttributes;
  bodyProps?: HTMLAttributes;
  meetingPasscodeWrapperProps?: HTMLAttributes;
  meetingPasscodeComponentProps?: Partial<MeetingPasscodeComponentProps>;
  meetingIdWrapperProps?: HTMLAttributes;
  meetingIdComponentProps?: Partial<MeetingIdComponentProps>;
  shareButtonsWrapperProps?: HTMLAttributes;
  shareButtonsComponentProps?: Partial<ShareButtonsComponentProps>;
  renderHeader?: (options: {
    defaultHeader: VNodeChild;
    closeButton: VNodeChild;
  }) => VNodeChild;
  renderCloseButton?: (options: {
    defaultCloseButton: VNodeChild;
    onClose: () => void;
  }) => VNodeChild;
  renderDivider?: (options: { defaultDivider: VNodeChild }) => VNodeChild;
  renderMeetingPasscode?: (options: {
    defaultMeetingPasscode: VNodeChild;
    adminPasscode?: string;
    isHost: boolean;
  }) => VNodeChild;
  renderMeetingId?: (options: {
    defaultMeetingId: VNodeChild;
    roomName: string;
  }) => VNodeChild;
  renderShareButtons?: (options: {
    defaultShareButtons: VNodeChild;
    hasShareButtons: boolean;
  }) => VNodeChild;
  renderBody?: (options: {
    defaultBody: VNodeChild;
    meetingPasscode: VNodeChild | null;
    meetingId: VNodeChild;
    shareButtons: VNodeChild | null;
  }) => VNodeChild;
  renderContent?: (options: { defaultContent: VNodeChild }) => VNodeChild;
}

const props = withDefaults(defineProps<ShareEventModalProps>(), {
  backgroundColor: 'rgba(255, 255, 255, 0.25)',
  shareButtons: true,
  position: 'topRight',
  adminPasscode: undefined,
  islevel: undefined,
  localLink: undefined,
  overlayProps: undefined,
  contentProps: undefined,
  headerProps: undefined,
  closeButtonProps: undefined,
  closeIcon: undefined,
  closeIconProps: undefined,
  dividerProps: undefined,
  bodyProps: undefined,
  meetingPasscodeWrapperProps: undefined,
  meetingPasscodeComponentProps: undefined,
  meetingIdWrapperProps: undefined,
  meetingIdComponentProps: undefined,
  shareButtonsWrapperProps: undefined,
  shareButtonsComponentProps: undefined,
  renderHeader: undefined,
  renderCloseButton: undefined,
  renderDivider: undefined,
  renderMeetingPasscode: undefined,
  renderMeetingId: undefined,
  renderShareButtons: undefined,
  renderBody: undefined,
  renderContent: undefined,
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

const handleClose = () => {
  props.onShareEventClose();
};

const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 420;
const modalWidth = Math.min(screenWidth * 0.8, 350);

// Overlay props and styles
const overlayAttrs = computed(() => {
  const overlayProps = props.overlayProps || {};
  const { class: cls, style, ...rest } = overlayProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const overlayClassNames = computed(() => 
  joinClassNames('mediasfu-share-event__overlay', overlayAttrs.value.className)
);

const overlayStyle = computed<CSSProperties>(() => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: props.isShareEventModalVisible ? 'block' : 'none',
  zIndex: 999,
  ...overlayAttrs.value.style,
}));

// Content props and styles
const contentAttrs = computed(() => {
  const contentProps = props.contentProps || {};
  const { class: cls, style, ...rest } = contentProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const contentClassNames = computed(() => 
  joinClassNames('mediasfu-share-event__content', contentAttrs.value.className)
);

const contentPositionStyle = computed<CSSProperties>(() => ({
  top: props.position.includes('top') ? '10px' : 'auto',
  bottom: props.position.includes('bottom') ? '10px' : 'auto',
  left: props.position.includes('Left') ? '10px' : 'auto',
  right: props.position.includes('Right') ? '10px' : 'auto',
}));

const contentStyle = computed<CSSProperties>(() => ({
  position: 'fixed',
  backgroundColor: props.backgroundColor,
  borderRadius: '10px',
  padding: '16px',
  width: `${modalWidth}px`,
  maxHeight: '65%',
  overflowY: 'auto',
  boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  ...contentPositionStyle.value,
  ...contentAttrs.value.style,
}));

// Header props and styles
const headerAttrs = computed(() => {
  const headerProps = props.headerProps || {};
  const { class: cls, style, ...rest } = headerProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const headerClassNames = computed(() => 
  joinClassNames('mediasfu-share-event__header', headerAttrs.value.className)
);

const headerStyle = computed<CSSProperties>(() => ({
  display: 'flex',
  flexDirection: 'row-reverse',
  alignItems: 'center',
  marginBottom: '4px',
  ...headerAttrs.value.style,
}));

// Close button props and styles
const closeButtonAttrs = computed(() => {
  const closeButtonProps = props.closeButtonProps || {};
  const { class: cls, style, onClick, ...rest } = closeButtonProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    onClick: onClick as ((event: MouseEvent) => void) | undefined,
    rest,
  };
});

const closeButtonClassNames = computed(() => 
  joinClassNames('mediasfu-share-event__close', closeButtonAttrs.value.className)
);

const closeButtonStyle = computed<CSSProperties>(() => ({
  background: 'none',
  border: 'none',
  padding: '6px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'black',
  ...closeButtonAttrs.value.style,
}));

// Close icon
const closeIconAttrs = computed(() => {
  const closeIconProps = props.closeIconProps || {};
  const { style, ...rest } = closeIconProps as Record<string, unknown>;
  return {
    style: style as CSSProperties | undefined,
    rest,
  };
});

const resolvedCloseIcon = computed(() => 
  props.closeIcon ?? h(FontAwesomeIcon, {
    icon: faTimes,
    size: 'lg',
    style: { fontSize: '20px', color: 'black', ...closeIconAttrs.value.style },
    ...closeIconAttrs.value.rest,
  })
);

const handleCloseClick = (event: MouseEvent) => {
  if (closeButtonAttrs.value.onClick) {
    closeButtonAttrs.value.onClick(event);
  }
  if (!event.defaultPrevented) {
    handleClose();
  }
};

// Build close button node
const defaultCloseButton = computed(() => 
  h(
    'button',
    {
      type: 'button',
      class: closeButtonClassNames.value,
      style: closeButtonStyle.value,
      onClick: handleCloseClick,
      'aria-label': 'Close share event modal',
      ...closeButtonAttrs.value.rest,
    },
    [resolvedCloseIcon.value]
  )
);

const closeButtonNode = computed(() => {
  if (props.renderCloseButton) {
    return props.renderCloseButton({
      defaultCloseButton: defaultCloseButton.value,
      onClose: handleClose,
    });
  }
  return defaultCloseButton.value;
});

// Build header node
const defaultHeader = computed(() => 
  h(
    'div',
    {
      class: headerClassNames.value,
      style: headerStyle.value,
      ...headerAttrs.value.rest,
    },
    [closeButtonNode.value]
  )
);

const headerNode = computed(() => {
  if (props.renderHeader) {
    return props.renderHeader({
      defaultHeader: defaultHeader.value,
      closeButton: closeButtonNode.value,
    });
  }
  return defaultHeader.value;
});

// Divider props and styles
const dividerAttrs = computed(() => {
  const dividerProps = props.dividerProps || {};
  const { class: cls, style, ...rest } = dividerProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const dividerClassNames = computed(() => 
  joinClassNames('mediasfu-share-event__divider', dividerAttrs.value.className)
);

const dividerStyle = computed<CSSProperties>(() => ({
  border: 'none',
  height: '1px',
  backgroundColor: 'rgba(0,0,0,0.2)',
  margin: '4px 0',
  ...dividerAttrs.value.style,
}));

const defaultDivider = computed(() => 
  h('hr', {
    class: dividerClassNames.value,
    style: dividerStyle.value,
    ...dividerAttrs.value.rest,
  })
);

const dividerNode = computed(() => {
  if (props.renderDivider) {
    return props.renderDivider({ defaultDivider: defaultDivider.value });
  }
  return defaultDivider.value;
});

// Body props and styles
const bodyAttrs = computed(() => {
  const bodyProps = props.bodyProps || {};
  const { class: cls, style, ...rest } = bodyProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const bodyClassNames = computed(() => 
  joinClassNames('mediasfu-share-event__body', bodyAttrs.value.className)
);

const bodyStyle = computed<CSSProperties>(() => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  ...bodyAttrs.value.style,
}));

// Meeting Passcode component
const meetingPasscodeWrapperAttrs = computed(() => {
  const wrapperProps = props.meetingPasscodeWrapperProps || {};
  const { class: cls, style, ...rest } = wrapperProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const meetingPasscodeWrapperClassNames = computed(() => 
  joinClassNames('mediasfu-share-event__meeting-passcode', meetingPasscodeWrapperAttrs.value.className)
);

const meetingPasscodeWrapperStyle = computed<CSSProperties>(() => ({
  marginBottom: '10px',
  ...meetingPasscodeWrapperAttrs.value.style,
}));

const isHost = computed(() => props.islevel === '2');

const defaultMeetingPasscode = computed(() => {
  if (!isHost.value) return null;
  
  return h(
    'div',
    {
      class: meetingPasscodeWrapperClassNames.value,
      style: meetingPasscodeWrapperStyle.value,
      ...meetingPasscodeWrapperAttrs.value.rest,
    },
    [
      h(MeetingPasscodeComponent, {
        meetingPasscode: props.adminPasscode,
        ...props.meetingPasscodeComponentProps,
      })
    ]
  );
});

const meetingPasscodeNode = computed(() => {
  if (!isHost.value) return null;
  
  if (props.renderMeetingPasscode) {
    return props.renderMeetingPasscode({
      defaultMeetingPasscode: defaultMeetingPasscode.value!,
      adminPasscode: props.adminPasscode,
      isHost: isHost.value,
    });
  }
  return defaultMeetingPasscode.value;
});

// Meeting ID component
const meetingIdWrapperAttrs = computed(() => {
  const wrapperProps = props.meetingIdWrapperProps || {};
  const { class: cls, style, ...rest } = wrapperProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const meetingIdWrapperClassNames = computed(() => 
  joinClassNames('mediasfu-share-event__meeting-id', meetingIdWrapperAttrs.value.className)
);

const meetingIdWrapperStyle = computed<CSSProperties>(() => ({
  marginBottom: '10px',
  ...meetingIdWrapperAttrs.value.style,
}));

const defaultMeetingId = computed(() => 
  h(
    'div',
    {
      class: meetingIdWrapperClassNames.value,
      style: meetingIdWrapperStyle.value,
      ...meetingIdWrapperAttrs.value.rest,
    },
    [
      h(MeetingIdComponent, {
        meetingID: props.roomName,
        ...props.meetingIdComponentProps,
      })
    ]
  )
);

const meetingIdNode = computed(() => {
  if (props.renderMeetingId) {
    return props.renderMeetingId({
      defaultMeetingId: defaultMeetingId.value,
      roomName: props.roomName,
    });
  }
  return defaultMeetingId.value;
});

// Share Buttons component
const shareButtonsWrapperAttrs = computed(() => {
  const wrapperProps = props.shareButtonsWrapperProps || {};
  const { class: cls, style, ...rest } = wrapperProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const shareButtonsWrapperClassNames = computed(() => 
  joinClassNames('mediasfu-share-event__share-buttons', shareButtonsWrapperAttrs.value.className)
);

const shareButtonsWrapperStyle = computed<CSSProperties>(() => ({
  marginBottom: '10px',
  ...shareButtonsWrapperAttrs.value.style,
}));

const defaultShareButtons = computed(() => {
  if (!props.shareButtons) return null;
  
  return h(
    'div',
    {
      class: shareButtonsWrapperClassNames.value,
      style: shareButtonsWrapperStyle.value,
      ...shareButtonsWrapperAttrs.value.rest,
    },
    [
      h(ShareButtonsComponent, {
        meetingID: props.roomName,
        eventType: props.eventType,
        localLink: props.localLink,
        ...props.shareButtonsComponentProps,
      })
    ]
  );
});

const shareButtonsNode = computed(() => {
  if (!props.shareButtons) return null;
  
  if (props.renderShareButtons) {
    return props.renderShareButtons({
      defaultShareButtons: defaultShareButtons.value!,
      hasShareButtons: props.shareButtons,
    });
  }
  return defaultShareButtons.value;
});

// Build body node
const defaultBody = computed(() => 
  h(
    'div',
    {
      class: bodyClassNames.value,
      style: bodyStyle.value,
      ...bodyAttrs.value.rest,
    },
    [
      meetingPasscodeNode.value,
      meetingIdNode.value,
      shareButtonsNode.value,
    ].filter(Boolean)
  )
);

const bodyNode = computed(() => {
  if (props.renderBody) {
    return props.renderBody({
      defaultBody: defaultBody.value,
      meetingPasscode: meetingPasscodeNode.value,
      meetingId: meetingIdNode.value,
      shareButtons: shareButtonsNode.value,
    });
  }
  return defaultBody.value;
});

// Build content node
const defaultContent = computed(() => 
  h(
    'div',
    {
      class: contentClassNames.value,
      style: contentStyle.value,
      ...contentAttrs.value.rest,
    },
    [
      headerNode.value,
      dividerNode.value,
      bodyNode.value,
    ]
  )
);

const contentNode = computed(() => {
  if (props.renderContent) {
    return props.renderContent({ defaultContent: defaultContent.value });
  }
  return defaultContent.value;
});

// Build overlay node
const overlayNode = computed<VNodeChild>(() => {
  return h(
    'div',
    {
      class: overlayClassNames.value,
      style: overlayStyle.value,
      ...overlayAttrs.value.rest,
    },
    [contentNode.value]
  );
});
</script>
