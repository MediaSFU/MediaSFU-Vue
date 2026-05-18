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
  watch,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type PropType,
  type VNode,
  type VNodeChild,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faHome,
  faLock,
  faStar,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import type { PaginationParameters, PaginationProps } from '../../components/displayComponents/Pagination.vue';

export type ModernPaginationProps = PaginationProps & {
  isDarkMode?: boolean;
  enableGlassmorphism?: boolean;
  enableGlow?: boolean;
  maxVisiblePages?: number;
  buttonSize?: number;
};

const props = withDefaults(defineProps<ModernPaginationProps>(), {
  position: 'middle',
  location: 'middle',
  direction: 'horizontal',
  paginationHeight: 40,
  showAspect: true,
  enableGlassmorphism: true,
  enableGlow: false,
  maxVisiblePages: 5,
  buttonSize: 36,
});

const isMounted = ref(false);
const hoverIndex = ref<number | null>(null);
const windowStart = ref(1);

onMounted(() => {
  requestAnimationFrame(() => {
    isMounted.value = true;
  });
});

const RenderVNode = defineComponent({
  name: 'RenderVNode',
  props: {
    node: {
      type: Object as PropType<VNode>,
      default: undefined,
    },
  },
  render() {
    return this.node ?? null;
  },
});

const getLatestParameters = (): PaginationParameters => {
  try {
    return props.parameters.getUpdatedAllParams?.() ?? props.parameters;
  } catch {
    return props.parameters;
  }
};

const params = computed(() => getLatestParameters());
const resolvedIsDarkMode = computed(() => props.isDarkMode ?? params.value.isDarkModeValue ?? true);
const isBreakout = computed(() => params.value.breakOutRoomStarted && !params.value.breakOutRoomEnded);
const maxVisiblePages = computed(() => Math.max(1, props.maxVisiblePages));

const clampWindowStart = (value: number) => {
  const maxStart = Math.max(1, props.totalPages - maxVisiblePages.value + 1);
  windowStart.value = Math.min(Math.max(value, 1), maxStart);
};

watch(
  [() => props.totalPages, maxVisiblePages],
  () => {
    if (props.totalPages <= maxVisiblePages.value + 1) {
      windowStart.value = 1;
      return;
    }

    clampWindowStart(windowStart.value);
  },
  { immediate: true },
);

watch(
  [() => props.currentUserPage, isBreakout, () => params.value.memberRoom, () => params.value.mainRoomsLength],
  () => {
    if (isBreakout.value) {
      const userRoom = params.value.memberRoom + params.value.mainRoomsLength;
      const halfWindow = Math.floor(maxVisiblePages.value / 2);
      clampWindowStart(userRoom - halfWindow);
      return;
    }

    if (props.currentUserPage === 0) {
      clampWindowStart(1);
      return;
    }

    const windowEnd = windowStart.value + maxVisiblePages.value - 1;
    if (props.currentUserPage < windowStart.value || props.currentUserPage > windowEnd) {
      const halfWindow = Math.floor(maxVisiblePages.value / 2);
      clampWindowStart(props.currentUserPage - halfWindow);
    }
  },
  { immediate: true },
);

const canGoBack = computed(() => windowStart.value > 1);
const canGoForward = computed(() => windowStart.value + maxVisiblePages.value <= props.totalPages);
const needsArrows = computed(() => props.totalPages > maxVisiblePages.value + 1);

const shiftWindowBack = () => {
  clampWindowStart(windowStart.value - 3);
};

const shiftWindowForward = () => {
  clampWindowStart(windowStart.value + 3);
};

const visiblePages = computed(() => {
  const pages: number[] = [0];

  if (props.totalPages <= maxVisiblePages.value + 1) {
    for (let page = 1; page <= props.totalPages; page += 1) {
      pages.push(page);
    }
    return pages;
  }

  const windowEnd = Math.min(windowStart.value + maxVisiblePages.value - 1, props.totalPages);
  for (let page = windowStart.value; page <= windowEnd; page += 1) {
    pages.push(page);
  }

  return pages;
});

const getBreakoutNavigationState = (page: number, paginationParams: PaginationParameters) => {
  const breakoutActive = paginationParams.breakOutRoomStarted && !paginationParams.breakOutRoomEnded;
  const isBreakoutPage = breakoutActive && page !== 0 && page >= paginationParams.mainRoomsLength;
  const pageInt = isBreakoutPage ? page - paginationParams.mainRoomsLength : -1;

  if (!isBreakoutPage) {
    return {
      breakoutActive,
      isBreakoutPage,
      pageInt,
      memberBreakRoom: -1,
      isRestrictedForMember: false,
    };
  }

  const roomMember = paginationParams.breakoutRooms.find((room) =>
    room.find((participant) => participant.name === paginationParams.member),
  );
  const memberBreakRoom = roomMember ? paginationParams.breakoutRooms.indexOf(roomMember) : -1;
  const isRestrictedForMember =
    paginationParams.islevel !== '2' &&
    pageInt >= 0 &&
    (memberBreakRoom === -1 || memberBreakRoom !== pageInt);

  return {
    breakoutActive,
    isBreakoutPage,
    pageInt,
    memberBreakRoom,
    isRestrictedForMember,
  };
};

const onPageChange = async (page: number) => {
  if (page === props.currentUserPage) {
    return;
  }

  const updatedParams = getLatestParameters();
  const navigationState = getBreakoutNavigationState(page, updatedParams);

  if (navigationState.breakoutActive && page !== 0) {
    if (navigationState.isRestrictedForMember) {
      updatedParams.showAlert?.({
        message: `You are not part of the breakout room ${navigationState.pageInt + 1}.`,
        type: 'danger',
      });
      return;
    }

    if (navigationState.isBreakoutPage && navigationState.memberBreakRoom !== navigationState.pageInt) {
      await props.handlePageChange?.({
        page,
        parameters: updatedParams,
        breakRoom: navigationState.pageInt,
        inBreakRoom: true,
      });

      if (updatedParams.islevel === '2' && updatedParams.hostNewRoom !== navigationState.pageInt) {
        updatedParams.socket.emit(
          'updateHostBreakout',
          { newRoom: navigationState.pageInt, roomName: updatedParams.roomName },
          () => {},
        );
      }
      return;
    }

    await props.handlePageChange?.({
      page,
      parameters: updatedParams,
      breakRoom: navigationState.pageInt,
      inBreakRoom: navigationState.pageInt >= 0,
    });

    if (updatedParams.islevel === '2' && updatedParams.hostNewRoom !== -1) {
      updatedParams.socket.emit(
        'updateHostBreakout',
        { prevRoom: updatedParams.hostNewRoom, newRoom: -1, roomName: updatedParams.roomName },
        () => {},
      );
    }
    return;
  }

  await props.handlePageChange?.({
    page,
    parameters: updatedParams,
    breakRoom: 0,
    inBreakRoom: false,
  });

  if (updatedParams.islevel === '2' && updatedParams.hostNewRoom !== -1) {
    updatedParams.socket.emit(
      'updateHostBreakout',
      { prevRoom: updatedParams.hostNewRoom, newRoom: -1, roomName: updatedParams.roomName },
      () => {},
    );
  }
};

const isRestrictedBreakoutPage = (page: number): boolean => {
  const navigationState = getBreakoutNavigationState(page, params.value);
  return navigationState.isRestrictedForMember;
};

const getPageLabel = (page: number): VNodeChild => {
  if (page === 0) {
    return h(FontAwesomeIcon, { icon: faHome, size: 'sm' });
  }

  if (isBreakout.value && page >= params.value.mainRoomsLength) {
    const roomIndex = page - params.value.mainRoomsLength;
    const isUserRoom = roomIndex === params.value.memberRoom;
    const isHostRoom = roomIndex === params.value.hostNewRoom;

    return h(
      'span',
      {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
        },
      },
      [
        h(FontAwesomeIcon, { icon: faUsers, size: 'xs' }),
        h('span', roomIndex + 1),
        isUserRoom ? h(FontAwesomeIcon, { icon: faStar, size: 'xs' }) : null,
        isHostRoom ? h(FontAwesomeIcon, { icon: faLock, size: 'xs' }) : null,
      ],
    );
  }

  return h('span', page);
};

const containerStyle = computed<CSSProperties>(() => ({
  display: 'flex',
  flexDirection: props.direction === 'horizontal' ? 'row' : 'column',
  alignItems: 'center',
  justifyContent:
    props.position === 'left' ? 'flex-start' : props.position === 'right' ? 'flex-end' : 'center',
  gap: '4px',
  padding: '4px 8px',
  height: `${props.paginationHeight}px`,
  width: 'fit-content',
  maxWidth: '100%',
  background:
    props.backgroundColor ??
    (props.enableGlassmorphism
      ? resolvedIsDarkMode.value
        ? 'rgba(15, 23, 42, 0.7)'
        : 'rgba(255, 255, 255, 0.68)'
      : resolvedIsDarkMode.value
        ? 'rgba(15, 23, 42, 0.9)'
        : 'rgba(255, 255, 255, 0.9)'),
  backdropFilter: props.enableGlassmorphism ? 'blur(12px)' : 'none',
  WebkitBackdropFilter: props.enableGlassmorphism ? 'blur(12px)' : 'none',
  borderRadius: '12px',
  border: props.enableGlassmorphism
    ? `1px solid ${resolvedIsDarkMode.value ? 'rgba(148, 163, 184, 0.18)' : 'rgba(148, 163, 184, 0.26)'}`
    : 'none',
  boxShadow: props.enableGlow
    ? resolvedIsDarkMode.value
      ? '0 8px 20px rgba(59, 130, 246, 0.16)'
      : '0 6px 16px rgba(59, 130, 246, 0.14)'
    : resolvedIsDarkMode.value
      ? '0 8px 20px rgba(2, 6, 23, 0.28)'
      : '0 6px 16px rgba(15, 23, 42, 0.1)',
  opacity: isMounted.value ? 1 : 0,
  transform: isMounted.value ? 'translateY(0)' : 'translateY(10px)',
  transition: 'all 280ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  ...(props.buttonsContainerStyle ?? {}),
  ...(typeof props.containerProps?.style === 'object' ? props.containerProps.style : {}),
}));

const arrowButtonStyle = (disabled: boolean): CSSProperties => ({
  width: `${props.buttonSize}px`,
  height: `${props.buttonSize}px`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '8px',
  border: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  background: 'transparent',
  color: disabled
    ? resolvedIsDarkMode.value
      ? 'rgba(255, 255, 255, 0.3)'
      : 'rgba(15, 23, 42, 0.3)'
    : resolvedIsDarkMode.value
      ? 'rgba(255, 255, 255, 0.8)'
      : 'rgba(15, 23, 42, 0.8)',
  opacity: disabled ? 0.5 : 1,
  transition: 'all 180ms ease',
});

const getPageButtonStyle = (
  page: number,
  isActive: boolean,
  isHovered: boolean,
  isRestricted: boolean,
): CSSProperties => {
  const providedButtonStyle = props.pageButtonProps?.({
    page,
    isActive,
    isHomePage: page === 0,
  })?.style;

  const baseStyle: CSSProperties = {
    minWidth: `${props.buttonSize}px`,
    height: `${props.buttonSize}px`,
    padding: '0 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    border: 'none',
    cursor: isRestricted ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--ms-modern-font-family)',
    fontSize: '0.82rem',
    fontWeight: isActive ? 700 : 500,
    lineHeight: 1,
    opacity: isRestricted && !isActive ? 0.82 : 1,
    transition: 'all 180ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  };

  if (isActive) {
    return {
      ...baseStyle,
      background: resolvedIsDarkMode.value ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.1)',
      color: '#FFFFFF',
      boxShadow: '0 1px 3px rgba(0,0,0,0.22)',
      transform: 'scale(1.03)',
      ...(props.activePageStyle ?? {}),
      ...(typeof providedButtonStyle === 'object' ? providedButtonStyle : {}),
    };
  }

  return {
    ...baseStyle,
    background: isHovered
      ? resolvedIsDarkMode.value
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(0, 0, 0, 0.15)'
      : resolvedIsDarkMode.value
        ? 'transparent'
        : 'rgba(0, 0, 0, 0.05)',
    color: resolvedIsDarkMode.value ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.9)',
    transform: isHovered ? 'scale(1.01)' : 'scale(1)',
    ...(props.inactivePageStyle ?? {}),
    ...(typeof providedButtonStyle === 'object' ? providedButtonStyle : {}),
  };
};

const renderArrowButton = (direction: 'back' | 'forward'): VNode => {
  const disabled = direction === 'back' ? !canGoBack.value : !canGoForward.value;
  const icon =
    props.direction === 'vertical'
      ? direction === 'back'
        ? faChevronUp
        : faChevronDown
      : direction === 'back'
        ? faChevronLeft
        : faChevronRight;

  return h(
    'button',
    {
      type: 'button',
      style: arrowButtonStyle(disabled),
      disabled,
      'aria-label': direction === 'back' ? 'Previous pages' : 'Next pages',
      onClick: direction === 'back' ? shiftWindowBack : shiftWindowForward,
    },
    [h(FontAwesomeIcon, { icon, size: 'sm' })],
  );
};

const renderPageButtonNode = (page: number): VNodeChild => {
  const isActive = page === props.currentUserPage;
  const isHomePage = page === 0;
  const isRestricted = isRestrictedBreakoutPage(page);
  const label = getPageLabel(page);
  const providedButtonProps = props.pageButtonProps?.({ page, isActive, isHomePage });
  const { onClick: customOnClick, class: buttonClass, style: _buttonStyle, ...restButtonProps } =
    providedButtonProps ?? {};

  const content = props.renderPageContent
    ? props.renderPageContent({
        defaultContent: label,
        page,
        isActive,
        isHomePage,
        label,
      })
    : label;

  const defaultButton = h(
    'button',
    {
      type: 'button',
      style: getPageButtonStyle(page, isActive, hoverIndex.value === page, isRestricted),
      class: buttonClass,
      'aria-disabled': isRestricted ? 'true' : undefined,
      onMouseenter: () => {
        hoverIndex.value = page;
      },
      onMouseleave: () => {
        if (hoverIndex.value === page) {
          hoverIndex.value = null;
        }
      },
      onClick: async (event: MouseEvent) => {
        if (customOnClick) {
          await Promise.resolve(customOnClick(event as unknown as Event));
        }

        if (!event.defaultPrevented) {
          await onPageChange(page);
        }
      },
      ...(restButtonProps as ButtonHTMLAttributes),
    },
    [content],
  );

  if (props.renderPageButton) {
    return props.renderPageButton({
      defaultButton,
      page,
      isActive,
      isHomePage,
      onSelect: () => onPageChange(page),
      label,
    });
  }

  return defaultButton;
};

const containerNode = computed<VNode>(() => {
  const { style: _containerStyle, ...restContainerProps } = props.containerProps ?? {};
  const defaultContainer = h(
    'div',
    {
      class: ['ms-modern-pagination', props.containerProps?.class],
      style: containerStyle.value,
      ...(restContainerProps as HTMLAttributes),
    },
    [
      ...(needsArrows.value ? [renderArrowButton('back')] : []),
      ...visiblePages.value.map((page) => renderPageButtonNode(page)),
      ...(needsArrows.value ? [renderArrowButton('forward')] : []),
    ],
  );

  if (props.renderContainer) {
    const rendered = props.renderContainer({
      defaultContainer,
      pages: visiblePages.value,
    });

    if (isVNode(rendered)) {
      return rendered;
    }
  }

  return defaultContainer;
});
</script>
