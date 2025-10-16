<!--
 * ConfirmExitModal - Event exit confirmation modal
 *
 * @fileoverview
 * A confirmation modal for exiting/leaving the event. Provides different exit options
 * based on user role (host vs participant), with options to end event for all or just
 * leave personally. Includes optional ban functionality for removing problematic users.
 *
 * @component ConfirmExitModal
 * @module components/exitComponents/ConfirmExitModal
 *
 * @description
 * This modal provides exit confirmation with:
 * - Role-based exit options (host can end event for all, participants just leave)
 * - Customizable confirmation messages based on user level
 * - Optional ban parameter for removing users
 * - Socket.io integration for notifying server
 * - Customizable positioning and styling
 * - Fully customizable render functions for all sections
 * - Confirm/Cancel buttons with custom labels
 *
 * @example
 * // Basic exit confirmation - participant
 * // <ConfirmExitModal
 *   // :is-confirm-exit-modal-visible="showExitConfirm"
 *   // :on-confirm-exit-close="() => setShowExitConfirm(false)"
 *   // :member="currentUser"
 *   // :room-name="roomName"
 *   // :socket="socket"
 *   // islevel="2"
 * // />
 *
 * @example
 * // Host exit with custom message
 * // <ConfirmExitModal
 *   // :is-confirm-exit-modal-visible="showExitConfirm"
 *   // :on-confirm-exit-close="closeExitModal"
 *   // :member="hostName"
 *   // :room-name="roomName"
 *   // :socket="socket"
 *   // islevel="2"
 *   // :message="(context) => {
 *     return context.islevel === '2'
 *       ? 'Are you sure you want to end the event for everyone?'
 *       : 'Are you sure you want to leave the event?';
 *   }"
 * // />
 *
 * @example
 * // Custom exit handler with analytics
 * // <ConfirmExitModal
 *   // :is-confirm-exit-modal-visible="showExitConfirm"
 *   // :on-confirm-exit-close="closeExitModal"
 *   // :member="member"
 *   // :room-name="roomName"
 *   // :socket="socket"
 *   // :islevel="islevel"
 *   // :exit-event-on-confirm="async (options) => {
 *     // Track exit event
 *     await trackAnalytics('user_exit', { member: options.member });
 *     // Execute default exit
 *     await confirmExit(options);
 *   }"
 * // />
 *
 * @example
 * // Ban user (moderator action)
 * // <ConfirmExitModal
 *   // :is-confirm-exit-modal-visible="showBanConfirm"
 *   // :on-confirm-exit-close="closeBanModal"
 *   // :member="targetUser"
 *   // :room-name="roomName"
 *   // :socket="socket"
 *   // islevel="1"
 *   // :ban="true"
 *   // title="Ban User"
 *   // confirm-label="Ban & Remove"
 *   // :message="`Are you sure you want to ban ${targetUser}?`"
 * // />
 *
 * @example
 * // Custom render functions
 * // <ConfirmExitModal
 *   // :is-confirm-exit-modal-visible="showExitConfirm"
 *   // :on-confirm-exit-close="closeExitModal"
 *   // :member="member"
 *   // :room-name="roomName"
 *   // :socket="socket"
 *   // :islevel="islevel"
 *   // :render-footer="(options) => {
 *     const { onCancel, onConfirm } = options;
 *     return h('div', { class: 'custom-footer' }, [
 *       h('button', { onClick: onCancel, class: 'btn-cancel' }, 'Stay'),
 *       h('button', { onClick: onConfirm, class: 'btn-confirm-danger' }, 'Leave Event')
 *     ]);
 *   }"
 * // />
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
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type PropType,
  type VNodeChild,
} from 'vue';
import type { MediaSFUSocket } from '../../types/socket';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { confirmExit, type ConfirmExitOptions } from 'mediasfu-shared';

// Helper to join class names
function joinClassNames(...classes: Array<string | undefined | null | false>): string | undefined {
  const filtered = classes.filter(Boolean) as string[];
  return filtered.length > 0 ? filtered.join(' ').trim() : undefined;
}

/**
 * ConfirmExitModal props interface
 * 
 * @interface ConfirmExitModalProps
 * @property {boolean} isConfirmExitModalVisible - Whether modal is visible
 * @property {() => void} onConfirmExitClose - Function to close the modal
 * @property {'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft'} [position='topRight'] - Modal position
 * @default 'topRight'
 * @property {string} [backgroundColor='#83c0e9'] - Modal background color
 * @default '#83c0e9'
 * @property {(options: ConfirmExitOptions) => void} [exitEventOnConfirm=confirmExit] - Function to execute exit
 * @default confirmExit
 * @property {string} member - Member/user name exiting the event
 * @property {boolean} [ban=false] - Whether this is a ban action (removes user from event)
 * @default false
 * @property {string} roomName - Event room name/ID
 * @property {MediaSFUSocket} socket - Socket.io instance for server communication
 * @property {string} islevel - User permission level ('0'=host, '1'=co-host, '2'=participant)
 * @property {VNodeChild} [title='Confirm Exit'] - Modal title text or VNode
 * @default 'Confirm Exit'
 * @property {VNodeChild} [confirmLabel] - Confirm button label (auto-generated if not provided)
 * @property {VNodeChild} [cancelLabel='Cancel'] - Cancel button label
 * @default 'Cancel'
 * @property {VNodeChild | ((context: { islevel: string }) => VNodeChild)} [message] - Confirmation message (auto-generated if not provided)
 * @example
 * ```typescript
 * // Static message
 * message: "Are you sure you want to leave?"
 * 
 * // Dynamic message based on role
 * message: (context) => {
 *   // return context.islevel === '2' 
 *     ? 'End event for all?' 
 *     : 'Leave event?';
 * }
 * ```
 * @property {HTMLAttributes} [overlayProps] - HTML attributes for overlay backdrop
 * @property {HTMLAttributes} [contentProps] - HTML attributes for modal content container
 * @property {HTMLAttributes} [headerProps] - HTML attributes for header section
 * @property {HTMLAttributes} [titleProps] - HTML attributes for title element
 * @property {ButtonHTMLAttributes} [closeButtonProps] - HTML attributes for close button
 * @property {VNodeChild} [closeIconComponent] - Custom close icon component
 * @property {HTMLAttributes} [headerDividerProps] - HTML attributes for header divider
 * @property {HTMLAttributes} [bodyProps] - HTML attributes for modal body
 * @property {HTMLAttributes} [messageProps] - HTML attributes for message text
 * @property {HTMLAttributes} [footerProps] - HTML attributes for footer section
 * @property {ButtonHTMLAttributes} [cancelButtonProps] - HTML attributes for cancel button
 * @property {ButtonHTMLAttributes} [confirmButtonProps] - HTML attributes for confirm button
 * @property {HTMLAttributes} [bodyDividerProps] - HTML attributes for body divider
 * @property {(options: HeaderRenderOptions) => VNodeChild} [renderHeader] - Custom header renderer
 * @property {(options: BodyRenderOptions) => VNodeChild} [renderBody] - Custom body renderer
 * @property {(options: FooterRenderOptions) => VNodeChild} [renderFooter] - Custom footer renderer
 * @property {(options: DividerRenderOptions) => VNodeChild} [renderHeaderDivider] - Custom header divider renderer
 * @property {(options: DividerRenderOptions) => VNodeChild} [renderBodyDivider] - Custom body divider renderer
 * @property {(options: MessageRenderOptions) => VNodeChild} [renderMessage] - Custom message renderer
 * @property {(options: ContentRenderOptions) => VNodeChild} [renderContent] - Custom content renderer
 */
export interface ConfirmExitModalProps {
  isConfirmExitModalVisible: boolean;
  onConfirmExitClose: () => void;
  position?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';
  backgroundColor?: string;
  exitEventOnConfirm?: (options: ConfirmExitOptions) => void;
  member: string;
  ban?: boolean;
  roomName: string;
  socket: MediaSFUSocket;
  islevel: string;
  title?: VNodeChild;
  confirmLabel?: VNodeChild;
  cancelLabel?: VNodeChild;
  message?: VNodeChild | ((context: { islevel: string }) => VNodeChild);
  overlayProps?: HTMLAttributes;
  contentProps?: HTMLAttributes;
  headerProps?: HTMLAttributes;
  titleProps?: HTMLAttributes;
  closeButtonProps?: ButtonHTMLAttributes;
  closeIconComponent?: VNodeChild;
  headerDividerProps?: HTMLAttributes;
  bodyProps?: HTMLAttributes;
  messageProps?: HTMLAttributes;
  footerProps?: HTMLAttributes;
  cancelButtonProps?: ButtonHTMLAttributes;
  confirmButtonProps?: ButtonHTMLAttributes;
  bodyDividerProps?: HTMLAttributes;
  renderHeader?: (options: {
    defaultHeader: VNodeChild;
    title: VNodeChild;
    onClose: () => void;
  }) => VNodeChild;
  renderBody?: (options: {
    defaultBody: VNodeChild;
    message: VNodeChild;
  }) => VNodeChild;
  renderFooter?: (options: {
    defaultFooter: VNodeChild;
    onCancel: () => void;
    onConfirm: () => void;
  }) => VNodeChild;
  renderHeaderDivider?: (options: { defaultDivider: VNodeChild }) => VNodeChild;
  renderBodyDivider?: (options: { defaultDivider: VNodeChild }) => VNodeChild;
  renderMessage?: (options: {
    defaultMessage: VNodeChild;
    resolvedMessage: VNodeChild;
  }) => VNodeChild;
  renderContent?: (options: { defaultContent: VNodeChild }) => VNodeChild;
}

const props = withDefaults(defineProps<ConfirmExitModalProps>(), {
  position: 'topRight',
  backgroundColor: '#83c0e9',
  exitEventOnConfirm: confirmExit,
  title: 'Confirm Exit',
  confirmLabel: undefined,
  cancelLabel: 'Cancel',
  message: undefined,
  overlayProps: undefined,
  contentProps: undefined,
  headerProps: undefined,
  titleProps: undefined,
  closeButtonProps: undefined,
  closeIconComponent: undefined,
  headerDividerProps: undefined,
  bodyProps: undefined,
  messageProps: undefined,
  footerProps: undefined,
  cancelButtonProps: undefined,
  confirmButtonProps: undefined,
  bodyDividerProps: undefined,
  renderHeader: undefined,
  renderBody: undefined,
  renderFooter: undefined,
  renderHeaderDivider: undefined,
  renderBodyDivider: undefined,
  renderMessage: undefined,
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

// Default labels and message
const defaultConfirmLabel = computed(() => 
  props.confirmLabel ?? (props.islevel === '2' ? 'End Event' : 'Exit')
);

const defaultCancelLabel = computed(() => 
  props.cancelLabel ?? 'Cancel'
);

const resolvedMessage = computed(() => {
  if (typeof props.message === 'function') {
    return props.message({ islevel: props.islevel });
  }
  if (props.message !== undefined) {
    return props.message;
  }
  return props.islevel === '2'
    ? 'This will end the event for all. Confirm exit.'
    : 'Are you sure you want to exit?';
});

// Modal dimensions
const defaultModalWidth = typeof window !== 'undefined' ? window.innerWidth * 0.8 : 320;
const modalWidth = Math.min(defaultModalWidth, 350);

// Overlay props
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
  joinClassNames('mediasfu-confirm-exit__overlay', overlayAttrs.value.className)
);

const overlayStyle = computed<CSSProperties>(() => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: props.isConfirmExitModalVisible ? 'block' : 'none',
  zIndex: 999,
  ...overlayAttrs.value.style,
}));

// Content props
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
  joinClassNames('mediasfu-confirm-exit__content', contentAttrs.value.className)
);

const contentStyle = computed<CSSProperties>(() => ({
  position: 'fixed',
  backgroundColor: props.backgroundColor,
  borderRadius: '10px',
  padding: '10px',
  width: `${modalWidth}px`,
  maxHeight: '65%',
  overflowY: 'auto',
  top: props.position.includes('top') ? '10px' : 'auto',
  bottom: props.position.includes('bottom') ? '10px' : 'auto',
  left: props.position.includes('Left') ? '10px' : 'auto',
  right: props.position.includes('Right') ? '10px' : 'auto',
  ...contentAttrs.value.style,
}));

// Header props
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
  joinClassNames('mediasfu-confirm-exit__header', headerAttrs.value.className)
);

const headerStyle = computed<CSSProperties>(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  ...headerAttrs.value.style,
}));

// Title props
const titleAttrs = computed(() => {
  const titleProps = props.titleProps || {};
  const { class: cls, style, ...rest } = titleProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const titleClassNames = computed(() => 
  joinClassNames('mediasfu-confirm-exit__title', titleAttrs.value.className)
);

const titleStyle = computed<CSSProperties>(() => ({
  margin: 0,
  fontSize: '1.1rem',
  ...titleAttrs.value.style,
}));

// Close button props
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
  joinClassNames('mediasfu-confirm-exit__close', closeButtonAttrs.value.className)
);

const closeButtonStyle = computed<CSSProperties>(() => ({
  background: 'none',
  border: 'none',
  padding: '4px',
  cursor: 'pointer',
  color: 'black',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...closeButtonAttrs.value.style,
}));

const defaultCloseIcon = computed(() => 
  props.closeIconComponent ?? h(FontAwesomeIcon, { icon: faTimes, size: 'lg' })
);

const handleCloseClick = (event: MouseEvent) => {
  if (closeButtonAttrs.value.onClick) {
    closeButtonAttrs.value.onClick(event);
  }
  if (!event.defaultPrevented) {
    props.onConfirmExitClose();
  }
};

// Divider props (header)
const headerDividerAttrs = computed(() => {
  const dividerProps = props.headerDividerProps || {};
  const { class: cls, style, ...rest } = dividerProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const headerDividerClassNames = computed(() => 
  joinClassNames('mediasfu-confirm-exit__divider', headerDividerAttrs.value.className)
);

const headerDividerStyle = computed<CSSProperties>(() => ({
  margin: '6px 0',
  height: '1px',
  border: 'none',
  backgroundColor: 'rgba(0,0,0,0.15)',
  ...headerDividerAttrs.value.style,
}));

// Body props
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
  joinClassNames('mediasfu-confirm-exit__body', bodyAttrs.value.className)
);

const bodyStyle = computed<CSSProperties>(() => ({
  fontSize: '0.95rem',
  ...bodyAttrs.value.style,
}));

// Message props
const messageAttrs = computed(() => {
  const messageProps = props.messageProps || {};
  const { class: cls, style, ...rest } = messageProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const messageClassNames = computed(() => 
  joinClassNames('mediasfu-confirm-exit__message', messageAttrs.value.className)
);

const messageStyle = computed<CSSProperties>(() => ({
  margin: 0,
  ...messageAttrs.value.style,
}));

// Body divider props
const bodyDividerAttrs = computed(() => {
  const dividerProps = props.bodyDividerProps || {};
  const { class: cls, style, ...rest } = dividerProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const bodyDividerClassNames = computed(() => 
  joinClassNames('mediasfu-confirm-exit__divider', bodyDividerAttrs.value.className)
);

const bodyDividerStyle = computed<CSSProperties>(() => ({
  margin: '6px 0',
  height: '1px',
  border: 'none',
  backgroundColor: 'rgba(0,0,0,0.15)',
  ...bodyDividerAttrs.value.style,
}));

// Footer props
const footerAttrs = computed(() => {
  const footerProps = props.footerProps || {};
  const { class: cls, style, ...rest } = footerProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    rest,
  };
});

const footerClassNames = computed(() => 
  joinClassNames('mediasfu-confirm-exit__footer', footerAttrs.value.className)
);

const footerStyle = computed<CSSProperties>(() => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  flexWrap: 'wrap',
  ...footerAttrs.value.style,
}));

// Cancel button props
const cancelButtonAttrs = computed(() => {
  const cancelButtonProps = props.cancelButtonProps || {};
  const { class: cls, style, onClick, ...rest } = cancelButtonProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    onClick: onClick as ((event: MouseEvent) => void) | undefined,
    rest,
  };
});

const cancelButtonClassNames = computed(() => 
  joinClassNames('mediasfu-confirm-exit__cancel', cancelButtonAttrs.value.className)
);

const cancelButtonStyle = computed<CSSProperties>(() => ({
  borderRadius: '6px',
  backgroundColor: 'black',
  color: 'white',
  padding: '6px 14px',
  border: 'none',
  cursor: 'pointer',
  ...cancelButtonAttrs.value.style,
}));

const handleCancelClick = (event: MouseEvent) => {
  if (cancelButtonAttrs.value.onClick) {
    cancelButtonAttrs.value.onClick(event);
  }
  if (!event.defaultPrevented) {
    props.onConfirmExitClose();
  }
};

// Confirm button props
const confirmButtonAttrs = computed(() => {
  const confirmButtonProps = props.confirmButtonProps || {};
  const { class: cls, style, onClick, ...rest } = confirmButtonProps as Record<string, unknown>;
  return {
    className: cls as string | undefined,
    style: style as CSSProperties | undefined,
    onClick: onClick as ((event: MouseEvent) => void) | undefined,
    rest,
  };
});

const confirmButtonClassNames = computed(() => 
  joinClassNames('mediasfu-confirm-exit__confirm', confirmButtonAttrs.value.className)
);

const confirmButtonStyle = computed<CSSProperties>(() => ({
  borderRadius: '6px',
  backgroundColor: 'red',
  color: 'white',
  padding: '6px 14px',
  border: 'none',
  cursor: 'pointer',
  ...confirmButtonAttrs.value.style,
}));

const handleConfirmExit = () => {
  props.exitEventOnConfirm({
    socket: props.socket,
    member: props.member,
    roomName: props.roomName,
    ban: props.ban,
  });
  props.onConfirmExitClose();
};

const handleConfirmClick = (event: MouseEvent) => {
  if (confirmButtonAttrs.value.onClick) {
    confirmButtonAttrs.value.onClick(event);
  }
  if (event.defaultPrevented) {
    return;
  }
  handleConfirmExit();
};

// Build VNodes
const defaultHeader = computed(() => 
  h(
    'div',
    {
      class: headerClassNames.value,
      style: headerStyle.value,
      ...headerAttrs.value.rest,
    },
    [
      h(
        'h2',
        {
          class: titleClassNames.value,
          style: titleStyle.value,
          ...titleAttrs.value.rest,
        },
        isVNode(props.title) ? props.title : String(props.title)
      ),
      h(
        'button',
        {
          type: 'button',
          onClick: handleCloseClick,
          class: closeButtonClassNames.value,
          style: closeButtonStyle.value,
          'aria-label': 'Close confirm exit modal',
          ...closeButtonAttrs.value.rest,
        },
        [defaultCloseIcon.value]
      ),
    ]
  )
);

const headerNode = computed(() => {
  if (props.renderHeader) {
    return props.renderHeader({
      defaultHeader: defaultHeader.value,
      title: props.title,
      onClose: props.onConfirmExitClose,
    });
  }
  return defaultHeader.value;
});

const defaultMessageNode = computed(() => 
  h(
    'p',
    {
      class: messageClassNames.value,
      style: messageStyle.value,
      ...messageAttrs.value.rest,
    },
    isVNode(resolvedMessage.value) ? resolvedMessage.value : String(resolvedMessage.value)
  )
);

const messageNode = computed(() => {
  if (props.renderMessage) {
    return props.renderMessage({
      defaultMessage: defaultMessageNode.value,
      resolvedMessage: resolvedMessage.value,
    });
  }
  return defaultMessageNode.value;
});

const defaultBody = computed(() => 
  h(
    'div',
    {
      class: bodyClassNames.value,
      style: bodyStyle.value,
      ...bodyAttrs.value.rest,
    },
    [messageNode.value]
  )
);

const bodyNode = computed(() => {
  if (props.renderBody) {
    return props.renderBody({
      defaultBody: defaultBody.value,
      message: resolvedMessage.value,
    });
  }
  return defaultBody.value;
});

const defaultFooter = computed(() => 
  h(
    'div',
    {
      class: footerClassNames.value,
      style: footerStyle.value,
      ...footerAttrs.value.rest,
    },
    [
      h(
        'button',
        {
          type: 'button',
          onClick: handleCancelClick,
          class: cancelButtonClassNames.value,
          style: cancelButtonStyle.value,
          ...cancelButtonAttrs.value.rest,
        },
        isVNode(defaultCancelLabel.value) ? defaultCancelLabel.value : String(defaultCancelLabel.value)
      ),
      h(
        'button',
        {
          type: 'button',
          onClick: handleConfirmClick,
          class: confirmButtonClassNames.value,
          style: confirmButtonStyle.value,
          ...confirmButtonAttrs.value.rest,
        },
        isVNode(defaultConfirmLabel.value) ? defaultConfirmLabel.value : String(defaultConfirmLabel.value)
      ),
    ]
  )
);

const footerNode = computed(() => {
  if (props.renderFooter) {
    return props.renderFooter({
      defaultFooter: defaultFooter.value,
      onCancel: props.onConfirmExitClose,
      onConfirm: handleConfirmExit,
    });
  }
  return defaultFooter.value;
});

const defaultHeaderDivider = computed(() => 
  h('hr', {
    class: headerDividerClassNames.value,
    style: headerDividerStyle.value,
    ...headerDividerAttrs.value.rest,
  })
);

const headerDividerNode = computed(() => {
  if (props.renderHeaderDivider) {
    return props.renderHeaderDivider({ defaultDivider: defaultHeaderDivider.value });
  }
  return defaultHeaderDivider.value;
});

const defaultBodyDivider = computed(() => 
  h('hr', {
    class: bodyDividerClassNames.value,
    style: bodyDividerStyle.value,
    ...bodyDividerAttrs.value.rest,
  })
);

const bodyDividerNode = computed(() => {
  if (props.renderBodyDivider) {
    return props.renderBodyDivider({ defaultDivider: defaultBodyDivider.value });
  }
  return defaultBodyDivider.value;
});

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
      headerDividerNode.value,
      bodyNode.value,
      bodyDividerNode.value,
      footerNode.value,
    ]
  )
);

const contentNode = computed(() => {
  if (props.renderContent) {
    return props.renderContent({ defaultContent: defaultContent.value });
  }
  return defaultContent.value;
});

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
