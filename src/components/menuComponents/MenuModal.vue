<!--
/**
 * @fileoverview MenuModal - Main menu modal for MediaSFU room navigation and settings
 * @component MenuModal
 * @module components/menuComponents/MenuModal
 * 
 * @description
 * A comprehensive dropdown menu that provides access to essential room information and
 * actions. This is the central navigation hub displayed when users click the menu button.
 * The modal includes customizable action buttons, displays room credentials, and offers
 * quick sharing options for inviting participants.
 * 
 * Key Features:
 * - Custom action buttons with icons and labels
 * - Room ID display with copy-to-clipboard functionality
 * - Admin passcode display (host only)
 * - Social media sharing buttons (optional)
 * - Flexible positioning (top/bottom, left/right)
 * - Customizable background and styling
 * - Scroll support for long button lists
 * - Render function support for all sections
 * - Role-based visibility controls
 * 
 * Sections:
 * 1. Header - Title with menu icon and close button
 * 2. Custom buttons - Configurable action buttons (screen share, recording, etc.)
 * 3. Meeting passcode - Admin credentials display (host only)
 * 4. Meeting ID - Room identifier with copy function
 * 5. Share buttons - Social media and email sharing (optional)
 * 
 * @example Basic Usage
 * // <MenuModal
 *   // :isVisible="isMenuModalVisible"
 *   // :onClose="() => updateIsMenuModalVisible(false)"
 *   // :customButtons="customMenuButtons"
 *   // roomName="room123"
 *   // adminPasscode="admin456"
 *   // islevel="2"
 *   // eventType="conference"
 * // />
 * 
 * @example With Custom Buttons
 * // <script setup>
 * import { ref, computed } from 'vue';
 * import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
 * import { faDesktop, faRecordVinyl, faCog } from '@fortawesome/free-solid-svg-icons';
 * 
 * const customButtons = computed(() => [
 *   {
 *     icon: h(FontAwesomeIcon, { icon: faDesktop }),
 *     text: 'Share Screen',
 *     action: () => launchScreenShare()
 *   },
 *   {
 *     icon: h(FontAwesomeIcon, { icon: faRecordVinyl }),
 *     text: 'Start Recording',
 *     action: () => launchRecording(),
 *     show: islevel.value === '2'
 *   },
 *   {
 *     icon: h(FontAwesomeIcon, { icon: faCog }),
 *     text: 'Settings',
 *     action: () => launchSettings()
 *   }
 * ]);
 * </script>
 * 
 * // <template>
 *   <MenuModal
 *     :isVisible="isMenuVisible"
 *     :onClose="closeMenu"
 *     :customButtons="customButtons"
 *     roomName="my-conference"
 *     adminPasscode="secure123"
 *     islevel="2"
 *     eventType="conference"
 *     backgroundColor="#2c3e50"
 *   />
 * </template>
 * 
 * @example Custom Position and No Sharing
 * // <MenuModal
 *   // :isVisible="showMenu"
 *   // :onClose="hideMenu"
 *   // :customButtons="menuActions"
 *   // roomName="webinar-room"
 *   // adminPasscode="host789"
 *   // islevel="2"
 *   // eventType="webinar"
 *   // position="topLeft"
 *   // :shareButtons="false"
 *   // backgroundColor="#34495e"
 * // />
 * 
 * @example Custom Render Functions
 * // <script setup>
 * const renderCustomTitle = ({ defaultTitle, menuIcon, titleContent }) => {
 *   // return h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, [
 *     menuIcon,
 *     h('span', { style: { fontSize: '20px', fontWeight: 'bold' } }, titleContent),
 *     h('span', { style: { fontSize: '12px', color: '#888' } }, '(Live)')
 *   ]);
 * };
 * 
 * const renderCustomMeetingId = ({ defaultMeetingId, roomName }) => {
 *   // return h('div', { style: { padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' } }, [
 *     h('strong', 'Room Code: '),
 *     h('code', { style: { fontSize: '16px', letterSpacing: '2px' } }, roomName)
 *   ]);
 * };
 * </script>
 * 
 * // <template>
 *   <MenuModal
 *     :isVisible="menuOpen"
 *     :onClose="closeMenu"
 *     :customButtons="buttons"
 *     roomName="ABC123"
 *     adminPasscode="host456"
 *     islevel="2"
 *     eventType="conference"
 *     :renderTitle="renderCustomTitle"
 *     :renderMeetingId="renderCustomMeetingId"
 *   />
 * </template>
 * 
 * @example Programmatic Control
 * // <script setup>
 * const isMenuOpen = ref(false);
 * 
 * const openMenu = () => {
 *   // isMenuOpen.value = true;
 * };
 * 
 * const closeMenu = () => {
 *   // isMenuOpen.value = false;
 *   // console.log('Menu closed');
 * };
 * 
 * const menuButtons = [
 *   { icon: exitIcon, text: 'Leave Meeting', action: () => confirmExit() },
 *   { icon: settingsIcon, text: 'Settings', action: () => openSettings() }
 * ];
 * </script>
 * 
 * // <template>
 *   <div>
 *     <button @click="openMenu">Open Menu</button>
 *     <MenuModal
 *       :isVisible="isMenuOpen"
 *       :onClose="closeMenu"
 *       :customButtons="menuButtons"
 *       roomName="meeting-xyz"
 *       adminPasscode="admin"
 *       islevel="2"
 *       eventType="conference"
 *     />
 *   </div>
 * </template>
 * 
 * @see {@link CustomButton} for button configuration
 * @see {@link MeetingIDComponent} for room ID display
 * @see {@link MeetingPasscodeComponent} for passcode display
 * @see {@link ShareButtonsComponent} for sharing functionality
 */
-->
<template>
  <RenderVNode :node="overlayNode" />
</template>

<script setup lang="ts">
import { computed, h, isVNode, defineComponent, type CSSProperties, type PropType, type VNodeChild, type HTMLAttributes, type ButtonHTMLAttributes } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons'
import MeetingIdComponent from './MeetingIDComponent.vue'
import MeetingPasscodeComponent from './MeetingPasscodeComponent.vue'
import ShareButtonsComponent from './ShareButtonsComponent.vue'
import CustomButtons from './CustomButtons.vue'
import type { EventType } from '../../../../SharedTypes'
import type { CustomButton } from './CustomButtons.vue'

/**
 * Props for the MenuModal component
 * @interface MenuModalProps
 * 
 * @property {string} [backgroundColor='#83c0e9'] - Background color of the modal content
 * @property {boolean} isVisible - Controls modal visibility (true = visible, false = hidden)
 * @property {Function} onClose - Callback when modal should close (user clicks close button or outside modal)
 * @property {CustomButton[]} [customButtons=[]] - Array of custom action buttons to display
 *   // @example
 *   ```ts
 *   [
 *     { icon: screenIcon, text: 'Share Screen', action: () => startScreenShare() },
 *     { icon: recordIcon, text: 'Record', action: () => startRecording(), show: isHost }
 *   ]
 *   ```
 * @property {boolean} [shareButtons=true] - Whether to display social media share buttons
 * @property {string} [position='bottomRight'] - Modal position on screen
 *   - Options: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
 * @property {string} roomName - Meeting/room identifier (displayed as Meeting ID)
 * @property {string} adminPasscode - Host passcode (only shown when islevel === '2')
 * @property {string} islevel - User's privilege level
 *   - '2' = Host (sees admin passcode)
 *   - Other values = Regular participant
 * @property {EventType} eventType - Type of MediaSFU event (conference, webinar, broadcast, chat)
 * @property {string} [localLink] - Local server URL for self-hosted deployments (used in share buttons)
 * 
 * @property {VNodeChild} [title='Menu'] - Custom title content (can be string or VNode)
 * @property {VNodeChild} [menuIcon] - Custom menu icon (default: faBars FontAwesome icon)
 * @property {VNodeChild} [closeIcon] - Custom close button icon (default: faTimes FontAwesome icon)
 * 
 * @property {HTMLAttributes} [overlayProps] - Props for the overlay wrapper (backdrop)
 * @property {HTMLAttributes} [contentProps] - Props for the modal content container
 * @property {HTMLAttributes} [headerProps] - Props for the header section
 * @property {HTMLAttributes} [titleWrapperProps] - Props for the title wrapper div
 * @property {HTMLAttributes} [badgeWrapperProps] - Props for badge wrapper (if applicable)
 * @property {ButtonHTMLAttributes} [closeButtonProps] - Props for the close button element
 * @property {HTMLAttributes} [dividerProps] - Props for horizontal divider after header
 * @property {HTMLAttributes} [bodyProps] - Props for the body section container
 * @property {HTMLAttributes} [scrollWrapperProps] - Props for the scrollable content wrapper
 * @property {HTMLAttributes} [customButtonsWrapperProps] - Props for custom buttons section wrapper
 * @property {HTMLAttributes} [meetingPasscodeWrapperProps] - Props for meeting passcode section wrapper
 * @property {HTMLAttributes} [meetingIdWrapperProps] - Props for meeting ID section wrapper
 * @property {HTMLAttributes} [shareButtonsWrapperProps] - Props for share buttons section wrapper
 * @property {HTMLAttributes} [sectionsDividerProps] - Props for dividers between sections
 * 
 * @property {Function} [renderHeader] - Custom render function for entire header section
 *   // @param {Object} options
 *   // @param {VNodeChild} options.defaultHeader - Default header VNode
 *   // @param {Function} options.onClose - Close handler function
 *   // @returns {VNodeChild} Custom header VNode
 *   // @example
 *   ```ts
 *   ({ defaultHeader, onClose }) => {
 *     return h('div', { class: 'custom-header' }, [
 *       h('h2', 'My Custom Menu'),
 *       h('button', { onClick: onClose }, 'X')
 *     ]);
 *   }
 *   ```
 * 
 * @property {Function} [renderTitle] - Custom render function for title section
 *   // @param {Object} options
 *   // @param {VNodeChild} options.defaultTitle - Default title VNode
 *   // @param {VNodeChild} options.menuIcon - Menu icon VNode
 *   // @param {VNodeChild} options.titleContent - Title text/content
 *   // @returns {VNodeChild} Custom title VNode
 * 
 * @property {Function} [renderCustomButtons] - Custom render function for custom buttons section
 *   // @param {Object} options
 *   // @param {VNodeChild} options.defaultCustomButtons - Default buttons VNode
 *   // @param {CustomButton[]} options.buttons - Array of button configurations
 *   // @returns {VNodeChild} Custom buttons VNode
 * 
 * @property {Function} [renderMeetingPasscode] - Custom render function for meeting passcode section
 *   // @param {Object} options
 *   // @param {VNodeChild} options.defaultMeetingPasscode - Default passcode display VNode
 *   // @param {string} options.adminPasscode - The admin passcode string
 *   // @param {boolean} options.isHost - Whether current user is host (islevel === '2')
 *   // @returns {VNodeChild} Custom passcode VNode
 * 
 * @property {Function} [renderMeetingId] - Custom render function for meeting ID section
 *   // @param {Object} options
 *   // @param {VNodeChild} options.defaultMeetingId - Default meeting ID display VNode
 *   // @param {string} options.roomName - The room name/ID string
 *   // @returns {VNodeChild} Custom meeting ID VNode
 * 
 * @property {Function} [renderShareButtons] - Custom render function for share buttons section
 *   // @param {Object} options
 *   // @param {VNodeChild} options.defaultShareButtons - Default share buttons VNode
 *   // @param {boolean} options.hasShareButtons - Whether share buttons are enabled
 *   // @returns {VNodeChild} Custom share buttons VNode
 * 
 * @property {Function} [renderBody] - Custom render function for entire body section
 *   // @param {Object} options
 *   // @param {VNodeChild} options.defaultBody - Default body VNode
 *   // @returns {VNodeChild} Custom body VNode
 * 
 * @property {Function} [renderContent] - Custom render function for entire modal content
 *   // @param {Object} options
 *   // @param {VNodeChild} options.defaultContent - Default content VNode
 *   // @returns {VNodeChild} Custom content VNode
 */
export interface MenuModalProps {
  backgroundColor?: string
  isVisible: boolean
  onClose: () => void
  customButtons?: CustomButton[]
  shareButtons?: boolean
  position?: string
  roomName: string
  adminPasscode: string
  islevel: string
  eventType: EventType
  localLink?: string
  
  // UI override props
  title?: VNodeChild
  menuIcon?: VNodeChild
  closeIcon?: VNodeChild
  overlayProps?: HTMLAttributes
  contentProps?: HTMLAttributes
  headerProps?: HTMLAttributes
  titleWrapperProps?: HTMLAttributes
  badgeWrapperProps?: HTMLAttributes
  closeButtonProps?: ButtonHTMLAttributes
  dividerProps?: HTMLAttributes
  bodyProps?: HTMLAttributes
  scrollWrapperProps?: HTMLAttributes
  customButtonsWrapperProps?: HTMLAttributes
  meetingPasscodeWrapperProps?: HTMLAttributes
  meetingIdWrapperProps?: HTMLAttributes
  shareButtonsWrapperProps?: HTMLAttributes
  sectionsDividerProps?: HTMLAttributes
  renderHeader?: (options: {
    defaultHeader: VNodeChild
    onClose: () => void
  }) => VNodeChild
  renderTitle?: (options: {
    defaultTitle: VNodeChild
    menuIcon: VNodeChild
    titleContent: VNodeChild
  }) => VNodeChild
  renderCustomButtons?: (options: {
    defaultCustomButtons: VNodeChild
    buttons: CustomButton[]
  }) => VNodeChild
  renderMeetingPasscode?: (options: {
    defaultMeetingPasscode: VNodeChild
    adminPasscode: string
    isHost: boolean
  }) => VNodeChild
  renderMeetingId?: (options: {
    defaultMeetingId: VNodeChild
    roomName: string
  }) => VNodeChild
  renderShareButtons?: (options: {
    defaultShareButtons: VNodeChild
    hasShareButtons: boolean
  }) => VNodeChild
  renderBody?: (options: { defaultBody: VNodeChild }) => VNodeChild
  renderContent?: (options: { defaultContent: VNodeChild }) => VNodeChild
}

const props = withDefaults(defineProps<MenuModalProps>(), {
  backgroundColor: '#83c0e9',
  customButtons: () => [],
  shareButtons: true,
  position: 'bottomRight',
  title: () => 'Menu',
  localLink: undefined,
  overlayProps: undefined,
  contentProps: undefined,
  headerProps: undefined,
  titleWrapperProps: undefined,
  badgeWrapperProps: undefined,
  closeButtonProps: undefined,
  dividerProps: undefined,
  bodyProps: undefined,
  scrollWrapperProps: undefined,
  customButtonsWrapperProps: undefined,
  meetingPasscodeWrapperProps: undefined,
  meetingIdWrapperProps: undefined,
  shareButtonsWrapperProps: undefined,
  sectionsDividerProps: undefined,
  menuIcon: undefined,
  closeIcon: undefined,
  renderHeader: undefined,
  renderTitle: undefined,
  renderCustomButtons: undefined,
  renderMeetingPasscode: undefined,
  renderMeetingId: undefined,
  renderShareButtons: undefined,
  renderBody: undefined,
  renderContent: undefined
})

// Inline RenderVNode component
const RenderVNode = defineComponent({
  name: 'RenderVNode',
  props: {
    node: {
      type: [Object, String, Number, Function] as PropType<VNodeChild>,
      default: null
    }
  },
  setup(props) {
    return () => {
      const node = props.node
      if (isVNode(node)) {
        return node
      } else if (typeof node === 'function') {
        return (node as () => VNodeChild)()
      } else {
        return node
      }
    }
  }
})

// Helper function
const joinClassNames = (classes: (string | undefined)[]): string | undefined => {
  const filtered = classes.filter(Boolean)
  return filtered.length > 0 ? filtered.join(' ').trim() : undefined
}

// Computed properties
const overlayWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.7, 400) : 320

// Overlay styles
const overlayStyle = computed((): CSSProperties => ({
  position: 'fixed' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: props.isVisible ? 'block' : 'none',
  zIndex: 999,
  ...(props.overlayProps?.style as CSSProperties || {})
}))

const overlayClassName = computed(() => 
  joinClassNames(['mediasfu-menu-modal', props.overlayProps?.class as string])
)

// Content styles
const contentStyle = computed((): CSSProperties => ({
  position: 'fixed' as const,
  backgroundColor: props.backgroundColor,
  borderRadius: '10px',
  padding: '10px',
  width: `${overlayWidth}px`,
  maxHeight: '85%',
  overflowY: 'auto' as const,
  top: props.position.includes('top') ? '10px' : 'auto',
  bottom: props.position.includes('bottom') ? '10px' : 'auto',
  left: props.position.includes('Left') ? '10px' : 'auto',
  right: props.position.includes('Right') ? '10px' : 'auto',
  ...(props.contentProps?.style as CSSProperties || {})
}))

const contentClassName = computed(() => 
  joinClassNames(['mediasfu-menu-modal__content', props.contentProps?.class as string])
)

// Header styles
const headerStyle = computed((): CSSProperties => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px',
  ...(props.headerProps?.style as CSSProperties || {})
}))

const headerClassName = computed(() => 
  joinClassNames(['menu-modal__header', props.headerProps?.class as string])
)

// Title wrapper styles
const titleWrapperStyle = computed((): CSSProperties => ({
  fontSize: '18px',
  fontWeight: 'bold',
  color: 'black',
  ...(props.titleWrapperProps?.style as CSSProperties || {})
}))

const titleWrapperClassName = computed(() => 
  joinClassNames(['menu-modal__title-wrapper', props.titleWrapperProps?.class as string])
)

// Close button styles
const closeButtonStyle = computed((): CSSProperties => ({
  padding: '5px',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  ...(props.closeButtonProps?.style as CSSProperties || {})
}))

const closeButtonClassName = computed(() => 
  joinClassNames(['btn-close-menu', props.closeButtonProps?.class as string])
)

// Divider styles
const dividerStyle = computed((): CSSProperties => ({
  height: '1px',
  backgroundColor: 'black',
  marginTop: '5px',
  marginBottom: '5px',
  border: 'none',
  ...(props.dividerProps?.style as CSSProperties || {})
}))

// Body styles
const bodyStyle = computed((): CSSProperties => ({
  flex: 1,
  ...(props.bodyProps?.style as CSSProperties || {})
}))

const bodyClassName = computed(() => 
  joinClassNames(['menu-modal__body', props.bodyProps?.class as string])
)

// Scroll wrapper styles
const scrollWrapperStyle = computed((): CSSProperties => ({
  maxHeight: 'calc(70% - 70px)',
  overflowY: 'auto' as const,
  ...(props.scrollWrapperProps?.style as CSSProperties || {})
}))

const scrollWrapperClassName = computed(() => 
  joinClassNames(['menu-modal__scroll', props.scrollWrapperProps?.class as string])
)

// Sections divider styles
const sectionsDividerStyle = computed((): CSSProperties => ({
  height: '1px',
  backgroundColor: '#ffffff',
  marginTop: '10px',
  marginBottom: '10px',
  ...(props.sectionsDividerProps?.style as CSSProperties || {})
}))

// Event handlers
const handleCloseClick = (event: MouseEvent) => {
  if (props.closeButtonProps?.onClick) {
    (props.closeButtonProps.onClick as (event: MouseEvent) => void)(event)
  }
  if (!event.defaultPrevented) {
    props.onClose()
  }
}

// Main overlay node
const overlayNode = computed(() => {
  const defaultMenuIcon = props.menuIcon ?? h(FontAwesomeIcon, { 
    icon: faBars, 
    style: { fontSize: '20px', color: 'black' } 
  })
  
  const defaultCloseIcon = props.closeIcon ?? h(FontAwesomeIcon, { 
    icon: faTimes, 
    style: { fontSize: '20px', color: 'black' } 
  })
  
  const titleContent = typeof props.title === 'string' || typeof props.title === 'number' ? props.title : (props.title || '')
  
  const defaultTitleNode = h('div', {
    class: titleWrapperClassName.value,
    style: titleWrapperStyle.value,
    ...(props.titleWrapperProps ? Object.fromEntries(
      Object.entries(props.titleWrapperProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    defaultMenuIcon,
    ' ',
    titleContent
  ])
  
  const titleNode = props.renderTitle
    ? props.renderTitle({
        defaultTitle: defaultTitleNode,
        menuIcon: defaultMenuIcon,
        titleContent: props.title
      })
    : defaultTitleNode
  
  const defaultHeaderNode = h('div', {
    class: headerClassName.value,
    style: headerStyle.value,
    ...(props.headerProps ? Object.fromEntries(
      Object.entries(props.headerProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    titleNode,
    h('button', {
      class: closeButtonClassName.value,
      style: closeButtonStyle.value,
      onClick: handleCloseClick,
      ...(props.closeButtonProps ? Object.fromEntries(
        Object.entries(props.closeButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
      ) : {})
    }, [defaultCloseIcon])
  ])
  
  const headerNode = props.renderHeader
    ? props.renderHeader({ defaultHeader: defaultHeaderNode, onClose: props.onClose })
    : defaultHeaderNode
  
  const dividerNode = h('hr', {
    style: dividerStyle.value,
    ...(props.dividerProps ? Object.fromEntries(
      Object.entries(props.dividerProps).filter(([key]) => key !== 'style')
    ) : {})
  })
  
  const defaultCustomButtonsNode = h('div', {
    class: props.customButtonsWrapperProps?.class,
    style: props.customButtonsWrapperProps?.style,
    ...(props.customButtonsWrapperProps ? Object.fromEntries(
      Object.entries(props.customButtonsWrapperProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    h(CustomButtons, { buttons: props.customButtons })
  ])
  
  const customButtonsNode = props.renderCustomButtons
    ? props.renderCustomButtons({
        defaultCustomButtons: defaultCustomButtonsNode,
        buttons: props.customButtons
      })
    : defaultCustomButtonsNode
  
  const sectionsDividerNode = h('div', {
    style: sectionsDividerStyle.value,
    ...(props.sectionsDividerProps ? Object.fromEntries(
      Object.entries(props.sectionsDividerProps).filter(([key]) => key !== 'style')
    ) : {})
  })
  
  const isHost = props.islevel === '2'
  
  const defaultMeetingPasscodeNode = isHost ? h('div', {
    class: props.meetingPasscodeWrapperProps?.class,
    style: props.meetingPasscodeWrapperProps?.style,
    ...(props.meetingPasscodeWrapperProps ? Object.fromEntries(
      Object.entries(props.meetingPasscodeWrapperProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    h(MeetingPasscodeComponent, { meetingPasscode: props.adminPasscode })
  ]) : null
  
  const meetingPasscodeNode = props.renderMeetingPasscode
    ? props.renderMeetingPasscode({
        defaultMeetingPasscode: defaultMeetingPasscodeNode,
        adminPasscode: props.adminPasscode,
        isHost
      })
    : defaultMeetingPasscodeNode
  
  const defaultMeetingIdNode = h('div', {
    class: props.meetingIdWrapperProps?.class,
    style: { marginBottom: '10px', ...(props.meetingIdWrapperProps?.style as CSSProperties || {}) },
    ...(props.meetingIdWrapperProps ? Object.fromEntries(
      Object.entries(props.meetingIdWrapperProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    h(MeetingIdComponent, { meetingID: props.roomName })
  ])
  
  const meetingIdNode = props.renderMeetingId
    ? props.renderMeetingId({
        defaultMeetingId: defaultMeetingIdNode,
        roomName: props.roomName
      })
    : defaultMeetingIdNode
  
  const defaultShareButtonsNode = props.shareButtons ? h('div', {
    class: props.shareButtonsWrapperProps?.class,
    style: props.shareButtonsWrapperProps?.style,
    ...(props.shareButtonsWrapperProps ? Object.fromEntries(
      Object.entries(props.shareButtonsWrapperProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    h(ShareButtonsComponent, {
      meetingID: props.roomName,
      eventType: props.eventType,
      localLink: props.localLink
    })
  ]) : null
  
  const shareButtonsNode = props.renderShareButtons
    ? props.renderShareButtons({
        defaultShareButtons: defaultShareButtonsNode,
        hasShareButtons: props.shareButtons
      })
    : defaultShareButtonsNode
  
  const defaultBodyNode = h('div', {
    class: bodyClassName.value,
    style: bodyStyle.value,
    ...(props.bodyProps ? Object.fromEntries(
      Object.entries(props.bodyProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    h('div', {
      class: scrollWrapperClassName.value,
      style: scrollWrapperStyle.value,
      ...(props.scrollWrapperProps ? Object.fromEntries(
        Object.entries(props.scrollWrapperProps).filter(([key]) => !['class', 'style'].includes(key))
      ) : {})
    }, [
      h('div', { style: { margin: 0, padding: 0 } }, [
        customButtonsNode,
        sectionsDividerNode,
        meetingPasscodeNode,
        meetingIdNode,
        shareButtonsNode
      ].filter(Boolean))
    ])
  ])
  
  const bodyNode = props.renderBody
    ? props.renderBody({ defaultBody: defaultBodyNode })
    : defaultBodyNode
  
  const defaultContentNode = h('div', {
    class: contentClassName.value,
    style: contentStyle.value,
    ...(props.contentProps ? Object.fromEntries(
      Object.entries(props.contentProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    headerNode,
    dividerNode,
    bodyNode
  ])
  
  const contentNode = props.renderContent
    ? props.renderContent({ defaultContent: defaultContentNode })
    : defaultContentNode
  
  return h('div', {
    class: overlayClassName.value,
    style: overlayStyle.value,
    ...(props.overlayProps ? Object.fromEntries(
      Object.entries(props.overlayProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [contentNode])
})
</script>


