<!--
/**
 * @fileoverview Pagination - Page navigation component for multi-page grid views
 * @component Pagination
 * @module components/displayComponents/Pagination
 * 
 * @description
 * Pagination control for navigating between pages in multi-page participant grid layouts.
 * Displays page numbers with visual indicators for the current page, home page (main room),
 * and breakout rooms. Supports horizontal and vertical orientations.
 * 
 * Features:
 * - Numbered page buttons with active state styling
 * - Home page indicator (star icon for main room)
 * - Breakout room indicator (lock icon)
 * - Horizontal and vertical layout modes
 * - Flexible positioning (left, middle, right / top, middle, bottom)
 * - Custom page change handler
 * - Accessible button labels
 * - Custom render functions for full customization
 * 
 * @example Basic Pagination
 * // <Pagination
 *   // :totalPages="5"
 *   // :currentUserPage="2"
 *   // :parameters="parameters"
 * // />
 * 
 * @example Vertical Pagination
 * // <Pagination
 *   // :totalPages="10"
 *   // :currentUserPage="3"
 *   // direction="vertical"
 *   // position="right"
 *   // location="middle"
 *   // :parameters="parameters"
 * // />
 * 
 * @example Custom Styled
 * // <Pagination
 *   // :totalPages="8"
 *   // :currentUserPage="4"
 *   // :parameters="parameters"
 *   // :activePageStyle="{ backgroundColor: '#22c55e', color: '#fff' }"
 *   // :inactivePageStyle="{ backgroundColor: '#f3f4f6', color: '#374151' }"
 *   // :paginationHeight="50"
 * // />
 * 
 * @example With Custom Page Button Renderer
 * // <Pagination
 *   // :totalPages="6"
 *   // :currentUserPage="2"
 *   // :parameters="parameters"
 *   // :renderPageButton="({ defaultButton, page, isActive, onSelect }) =>
 *     h('button', {
 *       class: ['custom-page-btn', { active: isActive }],
 *       onClick: onSelect
 *     }, `Page ${page}`)
 *   "
 * // />
 */
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
  type CSSProperties,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  type PropType,
  type VNode,
  type VNodeChild,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faStar, faLock } from '@fortawesome/free-solid-svg-icons';
import {
  generatePageContent,
  type GeneratePageContentOptions,
} from '@legacy/consumers/generatePageContent';
import type { Socket } from 'socket.io-client';
import type { ShowAlert, BreakoutParticipant } from '../../../../SharedTypes';

/**
 * Parameters object for Pagination component
 * @interface PaginationParameters
 */
export interface PaginationParameters {
  /** Number of main rooms/pages */
  mainRoomsLength: number;
  /** Current user's room/page number */
  memberRoom: number;
  /** Whether breakout rooms have started */
  breakOutRoomStarted: boolean;
  /** Whether breakout rooms have ended */
  breakOutRoomEnded: boolean;
  /** Current user's identifier */
  member: string;
  /** Array of breakout room participants */
  breakoutRooms: BreakoutParticipant[][];
  /** Host's new room number */
  hostNewRoom: number;
  /** Name of the current room */
  roomName: string;
  /** User level ('0' = regular, '1' = admin, '2' = host) */
  islevel: string;
  /** Alert display function */
  showAlert?: ShowAlert;
  /** Socket.io connection */
  socket: Socket;
  /** Function to get updated parameters */
  getUpdatedAllParams: () => PaginationParameters;
  /** Additional parameters */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Options passed to renderContainer function
 * @interface RenderContainerOptions
 */
interface RenderContainerOptions {
  /** The default container with all page buttons */
  defaultContainer: VNode;
  /** Array of page numbers */
  pages: number[];
}

/**
 * Context for page button props function
 * @interface PageContext
 */
interface PageContext {
  /** Page number */
  page: number;
  /** Whether this is the active/current page */
  isActive: boolean;
  /** Whether this is the home/main room page */
  isHomePage: boolean;
}

/**
 * Options passed to renderPageButton function
 * @interface RenderPageButtonOptions
 */
interface RenderPageButtonOptions {
  /** The default button VNode */
  defaultButton: VNode;
  /** Page number */
  page: number;
  /** Whether this is the active page */
  isActive: boolean;
  /** Whether this is the home page */
  isHomePage: boolean;
  /** Function to handle page selection */
  onSelect: () => Promise<void>;
  /** The page label content (with icons) */
  label: VNodeChild;
}

/**
 * Options passed to renderPageContent function
 * @interface RenderPageContentOptions
 */
interface RenderPageContentOptions {
  /** The default content VNode */
  defaultContent: VNodeChild;
  /** Page number */
  page: number;
  /** Whether this is the active page */
  isActive: boolean;
  /** Whether this is the home page */
  isHomePage: boolean;
  /** The page label content */
  label: VNodeChild;
}

/**
 * Props for the Pagination component
 * @interface PaginationProps
 */
export interface PaginationProps {
  /**
   * Total number of pages
   * @example 5
   */
  totalPages: number;
  
  /**
   * Current user's active page (0-based)
   * @example 2
   */
  currentUserPage: number;
  
  /**
   * Custom handler for page changes
   * @default generatePageContent
   */
  handlePageChange?: (options: GeneratePageContentOptions) => Promise<void>;
  
  /**
   * Horizontal position of pagination controls
   * @default "middle"
   */
  position?: 'left' | 'middle' | 'right';
  
  /**
   * Vertical position of pagination controls
   * @default "middle"
   */
  location?: 'top' | 'middle' | 'bottom';
  
  /**
   * Layout direction
   * @default "horizontal"
   */
  direction?: 'horizontal' | 'vertical';
  
  /**
   * Custom CSS styles for the buttons container
   */
  buttonsContainerStyle?: CSSProperties;
  
  /**
   * Styles for the active page button
   * @default { backgroundColor: '#2c678f' }
   */
  activePageStyle?: CSSProperties;
  
  /**
   * Styles for inactive page buttons
   */
  inactivePageStyle?: CSSProperties;
  
  /**
   * Background color for buttons
   * @default "#ffffff"
   */
  backgroundColor?: string;
  
  /**
   * Height of pagination controls in pixels
   * @default 40
   */
  paginationHeight?: number;
  
  /**
   * Whether to show the pagination controls
   * @default true
   */
  showAspect?: boolean;
  
  /**
   * MediaSFU parameters object
   */
  parameters: PaginationParameters;
  
  /**
   * HTML attributes for the outer container
   */
  containerProps?: HTMLAttributes;
  
  /**
   * Function to generate per-page button attributes
   * @param context - Page context (page number, isActive, isHomePage)
   * @returns Button HTML attributes
   */
  pageButtonProps?: (context: PageContext) => ButtonHTMLAttributes | undefined;
  
  /**
   * Custom renderer for the pagination container
   */
  renderContainer?: (options: RenderContainerOptions) => VNodeChild;
  
  /**
   * Custom renderer for individual page buttons
   */
  renderPageButton?: (options: RenderPageButtonOptions) => VNodeChild;
  
  /**
   * Custom renderer for page button content (label)
   */
  renderPageContent?: (options: RenderPageContentOptions) => VNodeChild;
}

const props = withDefaults(defineProps<PaginationProps>(), {
  handlePageChange: generatePageContent,
  position: 'middle',
  location: 'middle',
  direction: 'horizontal',
  buttonsContainerStyle: undefined,
  activePageStyle: () => ({ backgroundColor: '#2c678f' }),
  inactivePageStyle: undefined,
  backgroundColor: '#ffffff',
  paginationHeight: 40,
  showAspect: true,
  containerProps: () => ({}),
  pageButtonProps: undefined,
  renderContainer: undefined,
  renderPageButton: undefined,
  renderPageContent: undefined,
});

// Wrapper component for flexible VNodeChild rendering
const RenderVNode = defineComponent({
  name: 'RenderVNode',
  props: {
    node: {
      type: [Object, String, Number, Boolean, Array] as PropType<VNodeChild>,
      default: undefined,
    },
  },
  render() {
    if (isVNode(this.node)) {
      return this.node;
    }
    if (typeof this.node === 'string' || typeof this.node === 'number') {
      return String(this.node);
    }
    return null;
  },
});

// Helper to join class names
function joinClassNames(...classes: (string | string[] | undefined)[]): string[] {
  const result: string[] = [];
  classes.forEach((cls) => {
    if (!cls) return;
    if (Array.isArray(cls)) {
      result.push(...cls);
    } else {
      result.push(cls);
    }
  });
  return result;
}

const pages = computed(() => Array.from({ length: props.totalPages + 1 }, (_, index) => index));

const params = computed(() => props.parameters.getUpdatedAllParams());

const mainRoomsLength = computed(() => props.parameters.mainRoomsLength);
const memberRoom = computed(() => props.parameters.memberRoom);
const breakOutRoomStarted = computed(() => props.parameters.breakOutRoomStarted);
const breakOutRoomEnded = computed(() => props.parameters.breakOutRoomEnded);
const member = computed(() => props.parameters.member);
const breakoutRooms = computed(() => props.parameters.breakoutRooms);
const hostNewRoom = computed(() => props.parameters.hostNewRoom);
const roomName = computed(() => props.parameters.roomName);
const islevel = computed(() => props.parameters.islevel);
const showAlert = computed(() => props.parameters.showAlert);
const socket = computed(() => props.parameters.socket);

const getDisplayContent = (item: number) => {
  const roomNumber = item - (mainRoomsLength.value - 1);
  const targetPage = memberRoom.value;
  const isLocked = targetPage + 1 !== roomNumber && islevel.value !== '2';
  return { roomNumber, isLocked };
};

const handleClick = async (page: number, offSet?: number) => {
  if (page === props.currentUserPage) {
    return;
  }

  const updatedParams = params.value;
  const effectiveOffset = offSet ?? mainRoomsLength.value;

  if (breakOutRoomStarted.value && !breakOutRoomEnded.value && page !== 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roomMember = breakoutRooms.value.find((r: any) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      r.find((p: any) => p.name === member.value)
    );
    const pageInt = page - effectiveOffset;
    let memberBreakRoom = -1;
    if (roomMember) {
      memberBreakRoom = breakoutRooms.value.indexOf(roomMember);
    }

    if ((memberBreakRoom === -1 || memberBreakRoom !== pageInt) && pageInt >= 0) {
      if (islevel.value !== '2') {
        if (showAlert.value) {
          showAlert.value({
            message: `You are not part of the breakout room ${pageInt + 1}.`,
            type: 'danger',
          });
        }
        return;
      }

      await props.handlePageChange!({
        page,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parameters: updatedParams as any,
        breakRoom: pageInt,
        inBreakRoom: true,
      });
      if (hostNewRoom.value !== pageInt) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (socket.value as any).emit(
          'updateHostBreakout',
          { newRoom: pageInt, roomName: roomName.value },
          () => {}
        );
      }
    } else {
      await props.handlePageChange!({
        page,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parameters: updatedParams as any,
        breakRoom: pageInt,
        inBreakRoom: pageInt >= 0,
      });
      if (islevel.value === '2' && hostNewRoom.value !== -1) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (socket.value as any).emit(
          'updateHostBreakout',
          { prevRoom: hostNewRoom.value, newRoom: -1, roomName: roomName.value },
          () => {}
        );
      }
    }
  } else {
    await props.handlePageChange!({
      page,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parameters: updatedParams as any,
      breakRoom: 0,
      inBreakRoom: false,
    });
    if (islevel.value === '2' && hostNewRoom.value !== -1) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (socket.value as any).emit(
        'updateHostBreakout',
        { prevRoom: hostNewRoom.value, newRoom: -1, roomName: roomName.value },
        () => {}
      );
    }
  }
};

// =========================
// Container Props Merging
// =========================
const containerRestAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = props.containerProps || {};
  return rest;
});

const containerClassNames = computed(() =>
  joinClassNames('mediasfu-pagination', props.containerProps?.class).join(' ').trim() || undefined
);

const containerStyle = computed(() => ({
  backgroundColor: props.backgroundColor,
  justifyContent:
    props.position === 'middle'
      ? 'space-evenly'
      : props.position === 'left'
        ? 'flex-start'
        : 'flex-end',
  alignItems:
    props.location === 'middle'
      ? 'center'
      : props.location === 'top'
        ? 'flex-start'
        : 'flex-end',
  padding: 0,
  margin: 0,
  width: props.direction === 'horizontal' ? '100%' : `${props.paginationHeight}px`,
  height: props.direction === 'horizontal' ? `${props.paginationHeight}px` : '100%',
  display: props.showAspect ? 'flex' : 'none',
  maxHeight: props.direction === 'horizontal' ? `${props.paginationHeight}px` : '100%',
  maxWidth: props.direction === 'horizontal' ? '100%' : `${props.paginationHeight}px`,
  flexDirection: props.direction === 'vertical' ? ('column' as const) : ('row' as const),
  ...(typeof props.containerProps?.style === 'object' ? props.containerProps.style : {}),
} as CSSProperties));

// =========================
// Render Page Item
// =========================
const renderPageItem = (item: number): VNode => {
  const isActive = item === props.currentUserPage;
  const isHomePage = item === 0;

  // Determine the display content
  let displayItem: VNodeChild = item;
  if (
    breakOutRoomStarted.value &&
    !breakOutRoomEnded.value &&
    item >= mainRoomsLength.value
  ) {
    const { roomNumber, isLocked } = getDisplayContent(item);
    if (isLocked) {
      displayItem = [
        `Room ${roomNumber} `,
        h(FontAwesomeIcon, { icon: faLock, key: 'lock-icon' }),
      ];
    } else {
      displayItem = `Room ${roomNumber}`;
    }
  }

  // Base content (icon for home, text for others)
  const baseContent = isHomePage
    ? h(FontAwesomeIcon, { icon: faStar, size: 'lg', color: isActive ? 'yellow' : 'gray' })
    : h(
        'span',
        { class: 'pageText', style: { color: isActive ? '#ffffff' : '#000000' } },
        displayItem
      );

  const resolvedContent = props.renderPageContent
    ? props.renderPageContent({
        defaultContent: baseContent,
        page: item,
        isActive,
        isHomePage,
        label: displayItem,
      })
    : baseContent;

  // Get provided button props
  const providedButtonProps = props.pageButtonProps?.({ page: item, isActive, isHomePage });
  const {
    onClick: customOnClick,
    class: buttonClass,
    style: buttonStyleOverrides,
    ...restButtonProps
  } = providedButtonProps ?? {};

  const baseButtonClassName = joinClassNames('pageButton', isActive ? 'active' : undefined, buttonClass)
    .join(' ')
    .trim() || undefined;

  const combinedButtonStyle = {
    ...(props.buttonsContainerStyle ?? {}),
    ...(isActive ? props.activePageStyle : props.inactivePageStyle),
    ...(typeof buttonStyleOverrides === 'object' ? buttonStyleOverrides : {}),
  } as CSSProperties;

  const handleButtonClick = async (event: MouseEvent) => {
    if (customOnClick) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await Promise.resolve(customOnClick(event as any));
    }
    if (!event.defaultPrevented) {
      await handleClick(item);
    }
  };

  const defaultButton = h(
    'button',
    {
      type: 'button',
      key: item,
      class: baseButtonClassName,
      style: combinedButtonStyle,
      onClick: handleButtonClick,
      ...restButtonProps,
    },
    [resolvedContent]
  );

  return props.renderPageButton
    ? (props.renderPageButton({
        defaultButton,
        page: item,
        isActive,
        isHomePage,
        onSelect: () => handleClick(item),
        label: displayItem,
      }) as VNode) ?? defaultButton
    : defaultButton;
};

// =========================
// Container Node
// =========================
const containerNode = computed<VNode>(() => {
  const defaultContainer = h(
    'div',
    {
      class: containerClassNames.value,
      style: containerStyle.value,
      ...containerRestAttrs.value,
    },
    pages.value.map((item) => renderPageItem(item))
  );

  if (props.renderContainer) {
    const result = props.renderContainer({
      defaultContainer,
      pages: pages.value,
    });
    if (isVNode(result)) return result;
  }
  return defaultContainer;
});

</script>

<style scoped>
@import './Pagination.css';
</style>
