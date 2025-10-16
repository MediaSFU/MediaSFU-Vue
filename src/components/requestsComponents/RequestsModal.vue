<!--
/**
 * @fileoverview RequestsModal - Participant media requests management modal
 * @component RequestsModal
 * @module components/requestsComponents/RequestsModal
 * 
 * @description
 * A host/co-host modal for managing participant requests to enable audio, video, or
 * screenshare. Displays a list of pending requests with approve/reject actions. Used
 * when event settings require approval for media permissions (approval mode). Includes
 * search/filter functionality, real-time counter badge, and Socket.io integration.
 * 
 * Key Features:
 * - Participant media request list (audio/video/screenshare)
 * - Approve/reject actions for each request
 * - Search/filter functionality
 * - Real-time counter badge
 * - Socket.io integration for responses
 * - Host and co-host access (with permissions)
 * - Request type indicators (audio/video/screenshare icons)
 * - Responsive positioning (top/bottom, left/right)
 * - Empty state handling
 * - Custom request component rendering
 * - Render function support for all sections
 * 
 * Request Types:
 * - **Audio Request** - Participant wants to unmute microphone
 * - **Video Request** - Participant wants to turn on camera
 * - **Screenshare Request** - Participant wants to share screen
 * 
 * Workflow:
 * 1. Event settings set to "approval required" for audio/video/screenshare
 * 2. Participant clicks mic/camera/screenshare button
 * 3. Request sent to server, added to host's request list
 * 4. Host/co-host opens requests modal
 * 5. Host sees list of pending requests
 * 6. Host can search/filter requests
 * 7. Host clicks approve or reject
 * 8. Socket emits response to server
 * 9. Participant receives permission or denial
 * 10. Request removed from list
 * 
 * @example Basic Usage
 * // <RequestsModal
 *   // :isRequestsModalVisible="isRequestsModalVisible"
 *   // :onRequestClose="() => updateIsRequestsModalVisible(false)"
 *   // :requestCounter="requestCounter"
 *   // :onRequestFilterChange="onRequestFilterChange"
 *   // :requestList="filteredRequestList"
 *   // :updateRequestList="updateRequestList"
 *   // roomName="my-room"
 *   // :socket="socket"
 *   // :parameters="{ filteredRequestList, getUpdatedAllParams }"
 * // />
 * 
 * @example With Search and Custom Background
 * // <RequestsModal
 *   // :isRequestsModalVisible="showRequests"
 *   // :onRequestClose="closeRequests"
 *   // :requestCounter="requestCount"
 *   // :onRequestFilterChange="filterRequests"
 *   // :requestList="requests"
 *   // :updateRequestList="setRequests"
 *   // roomName="conference-123"
 *   // :socket="socketConnection"
 *   // :parameters="requestParameters"
 *   // position="topLeft"
 *   // backgroundColor="#2c3e50"
 * // />
 * 
 * @example Custom Empty State
 * // <script setup>
 * const customEmptyState = ({ counter }) => {
 *   // return h('div', {
 *     style: {
 *       textAlign: 'center',
 *       padding: '40px 20px',
 *       color: '#666'
 *     }
 *   }, [
 *     h('p', { style: { fontSize: '18px', marginBottom: '10px' } }, 'No pending requests'),
 *     h('p', { style: { fontSize: '14px' } }, 'Requests will appear here when participants need approval')
 *   ]);
 * };
 * </script>
 * 
 * // <template>
 *   <RequestsModal
 *     :isRequestsModalVisible="modalVisible"
 *     :onRequestClose="closeModal"
 *     :requestCounter="counter"
 *     :onRequestFilterChange="handleFilter"
 *     :requestList="list"
 *     :updateRequestList="updateList"
 *     roomName="room"
 *     :socket="socket"
 *     :parameters="params"
 *     :emptyState="customEmptyState"
 *   />
 * </template>
 * 
 * @example Custom Request Renderer
 * // <script setup>
 * const renderCustomRequest = ({ request, handleRespond }) => {
 *   // const getRequestIcon = (type) => {
 *     if (type === 'fa-microphone') return '🎤';
 *     if (type === 'fa-video') return '📹';
 *     if (type === 'fa-desktop') return '🖥️';
 *     return '📢';
 *   };
 * 
 *   // return h('div', {
 *     style: {
 *       display: 'flex',
 *       justifyContent: 'space-between',
 *       alignItems: 'center',
 *       padding: '12px',
 *       backgroundColor: '#f8f9fa',
 *       borderRadius: '8px',
 *       marginBottom: '8px'
 *     }
 *   }, [
 *     h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, [
 *       h('span', { style: { fontSize: '24px' } }, getRequestIcon(request.icon)),
 *       h('div', [
 *         h('strong', request.name),
 *         h('div', { style: { fontSize: '12px', color: '#666' } }, `Requesting ${request.icon.replace('fa-', '')}`)
 *       ])
 *     ]),
 *     h('div', { style: { display: 'flex', gap: '8px' } }, [
 *       h('button', {
 *         onClick: () => handleRespond('accepted'),
 *         class: 'btn btn-success btn-sm'
 *       }, 'Approve'),
 *       h('button', {
 *         onClick: () => handleRespond('rejected'),
 *         class: 'btn btn-danger btn-sm'
 *       }, 'Reject')
 *     ])
 *   ]);
 * };
 * </script>
 * 
 * // <template>
 *   <RequestsModal
 *     :isRequestsModalVisible="visible"
 *     :onRequestClose="close"
 *     :requestCounter="count"
 *     :onRequestFilterChange="filter"
 *     :requestList="list"
 *     :updateRequestList="update"
 *     roomName="room"
 *     :socket="socket"
 *     :parameters="params"
 *     :renderRequest="renderCustomRequest"
 *   />
 * </template>
 * 
 * @example Custom Header with Badge
 * // <script setup>
 * const renderCustomHeader = ({ counter, onClose }) => {
 *   // return h('div', {
 *     style: {
 *       display: 'flex',
 *       justifyContent: 'space-between',
 *       alignItems: 'center',
 *       padding: '15px',
 *       background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
 *       borderRadius: '10px 10px 0 0'
 *     }
 *   }, [
 *     h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, [
 *       h('h3', { style: { color: 'white', margin: 0 } }, 'Participant Requests'),
 *       counter > 0 && h('span', {
 *         style: {
 *           backgroundColor: 'white',
 *           color: '#f5576c',
 *           padding: '4px 12px',
 *           borderRadius: '12px',
 *           fontSize: '14px',
 *           fontWeight: 'bold'
 *         }
 *       }, counter)
 *     ]),
 *     h('button', { onClick: onClose, style: { background: 'none', border: 'none', color: 'white', cursor: 'pointer' } }, '✕')
 *   ]);
 * };
 * </script>
 * 
 * // <template>
 *   <RequestsModal
 *     :isRequestsModalVisible="open"
 *     :onRequestClose="close"
 *     :requestCounter="count"
 *     :onRequestFilterChange="filter"
 *     :requestList="list"
 *     :updateRequestList="update"
 *     roomName="room"
 *     :socket="socket"
 *     :parameters="params"
 *     :renderHeader="renderCustomHeader"
 *   />
 * </template>
 * 
 * @see {@link respondToRequests} for approve/reject logic
 * @see {@link Request} for request data structure
 * @see {@link RenderRequestComponent} for default request renderer
 * @see {@link Socket} for Socket.io integration
 */
-->
<template>
  <RenderVNode :node="overlayNode" />
</template>

<script setup lang="ts">
import { ref, computed, watch, h, isVNode, defineComponent } from 'vue';
import type { PropType, VNodeChild, HTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes, CSSProperties } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import RenderRequestComponent from './RenderRequestComponent.vue';
import { respondToRequests } from 'mediasfu-shared';
import type { Request } from '../../../../SharedTypes';
import type { MediaSFUSocket } from '../../types/socket';
import type { Component } from 'vue';

// Helper function
function joinClassNames(...classes: Array<string | undefined | null | false>): string | undefined {
  const result = classes.filter(Boolean).join(' ').trim();
  return result || undefined;
}

export interface RequestsModalParameters {
  getUpdatedAllParams?: () => { filteredRequestList: Request[] };
  filteredRequestList?: Request[];
  [key: string]: unknown;
}

/**
 * Props for the RequestsModal component
 * @interface RequestsModalProps
 * 
 * @property {boolean} isRequestsModalVisible - Controls modal visibility (true = visible, false = hidden)
 * @property {Function} onRequestClose - Callback when modal closes
 * @property {number} requestCounter - Number of pending requests (displayed in badge)
 * @property {Function} onRequestFilterChange - Callback when search filter changes
 *   // @param {string} text - Filter text entered by user
 * @property {Function} [onRequestItemPress=respondToRequests] - Custom function to handle approve/reject actions
 *   // @default respondToRequests from @react-shared/methods/requests
 * @property {Request[]} requestList - Array of pending media requests
 * @property {Function} updateRequestList - Updates request list state
 *   // @param {Request[]} newRequestList - New request list
 * @property {string} roomName - Room/meeting identifier for server updates
 * @property {MediaSFUSocket} socket - Socket.io connection for emitting approve/reject actions
 * @property {Component} [renderRequestComponent=RenderRequestComponent] - Custom component for rendering individual requests
 * @property {string} [backgroundColor='#83c0e9'] - Background color of the modal content
 * @property {string} [position='topRight'] - Modal position on screen
 *   - Options: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
 * @property {RequestsModalParameters} parameters - Request state and update functions
 * 
 * @property {VNodeChild} [title='Requests'] - Modal title content
 * @property {HTMLAttributes} [overlayProps] - Props for the overlay wrapper (backdrop)
 * @property {HTMLAttributes} [contentProps] - Props for the modal content container
 * @property {HTMLAttributes} [headerProps] - Props for the header section
 * @property {HTMLAttributes} [titleProps] - Props for the title element
 * @property {HTMLAttributes} [badgeWrapperProps] - Props for the counter badge wrapper
 * @property {HTMLAttributes} [badgeProps] - Props for the counter badge element
 * @property {ButtonHTMLAttributes} [closeButtonProps] - Props for the close button
 * @property {VNodeChild} [closeIconComponent] - Custom close icon (default: faTimes FontAwesome)
 * @property {HTMLAttributes} [bodyProps] - Props for the body section container
 * @property {HTMLAttributes} [searchWrapperProps] - Props for search input wrapper
 * @property {InputHTMLAttributes} [searchInputProps] - Props for search input element
 * @property {HTMLAttributes} [requestsWrapperProps] - Props for requests list container
 * @property {HTMLAttributes} [requestItemWrapperProps] - Props for individual request item wrapper
 * @property {VNodeChild | Function} [emptyState] - Custom empty state content or render function
 *   // @example
 *   ```ts
 *   ({ counter }) => h('p', 'No pending requests')
 *   ```
 * 
 * @property {Function} [renderHeader] - Custom render function for entire header section
 *   // @param {Object} options
 *   // @param {VNodeChild} options.defaultHeader - Default header VNode
 *   // @param {number} options.counter - Request counter
 *   // @param {Function} options.onClose - Close handler function
 *   // @returns {VNodeChild} Custom header VNode
 *   // @example
 *   ```ts
 *   ({ counter, onClose }) => {
 *     return h('div', { class: 'custom-header' }, [
 *       h('h2', `Requests (${counter})`),
 *       h('button', { onClick: onClose }, 'Close')
 *     ]);
 *   }
 *   ```
 * 
 * @property {Function} [renderSearch] - Custom render function for search input section
 *   // @param {Object} options
 *   // @param {VNodeChild} options.defaultSearch - Default search input VNode
 *   // @param {Function} options.onFilter - Filter handler function
 *   // @returns {VNodeChild} Custom search VNode
 * 
 * @property {Function} [renderRequest] - Custom render function for individual request item
 *   // @param {Object} options
 *   // @param {Request} options.request - Request data (contains id, name, icon, username)
 *   // @param {number} options.index - Item index
 *   // @param {VNodeChild} options.defaultRequest - Default request item VNode
 *   // @param {Function} options.handleRespond - Response handler function
 *     @param {'accepted' | 'rejected'} action - Approve or reject action
 *   // @returns {VNodeChild} Custom request item VNode
 *   // @example
 *   ```ts
 *   ({ request, handleRespond }) => {
 *     return h('div', { style: { display: 'flex', justifyContent: 'space-between' } }, [
 *       h('span', `${request.name} - ${request.icon}`),
 *       h('div', [
 *         h('button', { onClick: () => handleRespond('accepted') }, 'Approve'),
 *         h('button', { onClick: () => handleRespond('rejected') }, 'Reject')
 *       ])
 *     ]);
 *   }
 *   ```
 * 
 * @property {Function} [renderBody] - Custom render function for entire body section
 *   // @param {Object} options
 *   // @param {VNodeChild} options.defaultBody - Default body VNode
 *   // @param {number} options.counter - Request counter
 *   // @returns {VNodeChild} Custom body VNode
 * 
 * @property {Function} [renderContent] - Custom render function for entire modal content
 *   // @param {Object} options
 *   // @param {VNodeChild} options.defaultContent - Default content VNode
 *   // @param {number} options.counter - Request counter
 *   // @returns {VNodeChild} Custom content VNode
 */
export interface RequestsModalProps {
  isRequestsModalVisible: boolean;
  onRequestClose: () => void;
  requestCounter: number;
  onRequestFilterChange: (text: string) => void;
  onRequestItemPress?: typeof respondToRequests;
  requestList: Request[];
  updateRequestList: (newRequestList: Request[]) => void;
  roomName: string;
  socket: MediaSFUSocket;
  renderRequestComponent?: Component;
  backgroundColor?: string;
  position?: string;
  parameters: RequestsModalParameters;
  title?: VNodeChild;
  overlayProps?: HTMLAttributes;
  contentProps?: HTMLAttributes;
  headerProps?: HTMLAttributes;
  titleProps?: HTMLAttributes;
  badgeWrapperProps?: HTMLAttributes;
  badgeProps?: HTMLAttributes;
  closeButtonProps?: ButtonHTMLAttributes;
  closeIconComponent?: VNodeChild;
  bodyProps?: HTMLAttributes;
  searchWrapperProps?: HTMLAttributes;
  searchInputProps?: InputHTMLAttributes;
  requestsWrapperProps?: HTMLAttributes;
  requestItemWrapperProps?: HTMLAttributes;
  emptyState?: VNodeChild | ((context: { counter: number }) => VNodeChild);
  renderHeader?: (options: {
    defaultHeader: VNodeChild;
    counter: number;
    onClose: () => void;
  }) => VNodeChild;
  renderSearch?: (options: {
    defaultSearch: VNodeChild;
    onFilter: (value: string) => void;
  }) => VNodeChild;
  renderRequest?: (options: {
    request: Request;
    index: number;
    defaultRequest: VNodeChild;
    handleRespond: (action: 'accepted' | 'rejected') => void;
  }) => VNodeChild;
  renderBody?: (options: {
    defaultBody: VNodeChild;
    counter: number;
  }) => VNodeChild;
  renderContent?: (options: {
    defaultContent: VNodeChild;
    counter: number;
  }) => VNodeChild;
}

const props = withDefaults(defineProps<RequestsModalProps>(), {
  onRequestItemPress: () => respondToRequests,
  renderRequestComponent: () => RenderRequestComponent,
  backgroundColor: '#83c0e9',
  position: 'topRight',
  title: 'Requests',
  closeIconComponent: undefined,
  overlayProps: undefined,
  contentProps: undefined,
  headerProps: undefined,
  titleProps: undefined,
  badgeWrapperProps: undefined,
  badgeProps: undefined,
  closeButtonProps: undefined,
  bodyProps: undefined,
  searchWrapperProps: undefined,
  searchInputProps: undefined,
  requestsWrapperProps: undefined,
  requestItemWrapperProps: undefined,
  emptyState: undefined,
  renderHeader: undefined,
  renderSearch: undefined,
  renderRequest: undefined,
  renderBody: undefined,
  renderContent: undefined,
});

// RenderVNode component
const RenderVNode = defineComponent({
  name: 'RenderVNode',
  props: {
    node: {
      type: [Object, String, Number, Function] as PropType<VNodeChild>,
      required: true,
    },
  },
  setup(props) {
    return () => {
      const node = props.node;
      if (typeof node === 'function') {
        return (node as () => VNodeChild)();
      }
      if (isVNode(node)) {
        return node;
      }
      return node;
    };
  },
});

// State management
const initialList = computed(() => {
  if (props.parameters?.getUpdatedAllParams) {
    return props.parameters.getUpdatedAllParams().filteredRequestList;
  }
  if (props.parameters?.filteredRequestList) {
    return props.parameters.filteredRequestList;
  }
  return props.requestList;
});

const requestListState = ref<Request[]>(initialList.value);
const requestCounterState = ref<number>(
  props.parameters?.filteredRequestList?.length ?? props.requestCounter
);
const rerenderToggle = ref(false);

watch(
  () => [props.parameters, props.requestList, rerenderToggle.value],
  () => {
    if (props.parameters?.getUpdatedAllParams) {
      const updatedParams = props.parameters.getUpdatedAllParams();
      requestListState.value = updatedParams.filteredRequestList;
      requestCounterState.value = updatedParams.filteredRequestList.length;
      return;
    }
    if (props.parameters?.filteredRequestList) {
      requestListState.value = props.parameters.filteredRequestList;
      requestCounterState.value = props.parameters.filteredRequestList.length;
      return;
    }
    requestListState.value = props.requestList;
    requestCounterState.value = props.requestList.length;
  }
);

// Overlay styles
const defaultOverlayWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.8, 350) : 320;

const overlayStyle = computed<CSSProperties>(() => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: props.isRequestsModalVisible ? 'block' : 'none',
  zIndex: 999,
  ...(props.overlayProps?.style as CSSProperties ?? {}),
}));

const contentStyle = computed<CSSProperties>(() => ({
  position: 'fixed',
  backgroundColor: props.backgroundColor,
  borderRadius: '10px',
  padding: '16px',
  width: `${defaultOverlayWidth}px`,
  maxHeight: '65%',
  overflowY: 'auto',
  top: props.position.includes('top') ? '10px' : 'auto',
  bottom: props.position.includes('bottom') ? '10px' : 'auto',
  left: props.position.includes('Left') ? '10px' : 'auto',
  right: props.position.includes('Right') ? '10px' : 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
  ...(props.contentProps?.style as CSSProperties ?? {}),
}));

// Event handlers
const handleFilterChange = (event: Event) => {
  const changeHandler = props.searchInputProps?.onInput;
  if (changeHandler) {
    changeHandler(event as unknown as InputEvent);
  }
  if (!(event as Event & { defaultPrevented?: boolean }).defaultPrevented) {
    const target = event.target as HTMLInputElement;
    props.onRequestFilterChange(target.value);
    rerenderToggle.value = !rerenderToggle.value;
  }
};

const handleCloseClick = (event: Event) => {
  const clickHandler = props.closeButtonProps?.onClick;
  if (clickHandler) {
    clickHandler(event as unknown as PointerEvent);
  }
  if (!(event as Event & { defaultPrevented?: boolean }).defaultPrevented) {
    props.onRequestClose();
  }
};

// Build overlayNode
const overlayNode = computed(() => {
  const { class: overlayClassName, ...restOverlayProps } = props.overlayProps ?? {};
  const { class: contentClassName, ...restContentProps } = props.contentProps ?? {};
  const { class: headerClassName, style: headerStyleOverrides, ...restHeaderProps } = props.headerProps ?? {};
  const { class: titleClassName, style: titleStyleOverrides, ...restTitleProps } = props.titleProps ?? {};
  const { class: badgeWrapperClassName, style: badgeWrapperStyleOverrides, ...restBadgeWrapperProps } = props.badgeWrapperProps ?? {};
  const { class: badgeClassName, style: badgeStyleOverrides, ...restBadgeProps } = props.badgeProps ?? {};
  const { class: closeButtonClassName, style: closeButtonStyleOverrides, onClick: _closeButtonOnClick, ...restCloseButtonProps } = props.closeButtonProps ?? {};
  const { class: bodyClassName, style: bodyStyleOverrides, ...restBodyProps } = props.bodyProps ?? {};
  const { class: searchWrapperClassName, style: searchWrapperStyleOverrides, ...restSearchWrapperProps } = props.searchWrapperProps ?? {};
  const { class: searchInputClassName, style: searchInputStyleOverrides, onInput: _searchInputOnInput, ...restSearchInputProps } = props.searchInputProps ?? {};
  const { class: requestsWrapperClassName, style: requestsWrapperStyleOverrides, ...restRequestsWrapperProps } = props.requestsWrapperProps ?? {};
  const { class: requestItemWrapperClassName, style: requestItemWrapperStyleOverrides, ...restRequestItemWrapperProps } = props.requestItemWrapperProps ?? {};

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    ...(headerStyleOverrides as CSSProperties ?? {}),
  };

  const titleStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '0',
    ...(titleStyleOverrides as CSSProperties ?? {}),
  };

  const badgeWrapperStyle: CSSProperties = {
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: '10px',
    padding: '5px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...(badgeWrapperStyleOverrides as CSSProperties ?? {}),
  };

  const badgeStyle: CSSProperties = {
    ...(badgeStyleOverrides as CSSProperties ?? {}),
  };

  const closeButtonStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'black',
    ...(closeButtonStyleOverrides as CSSProperties ?? {}),
  };

  const bodyStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    ...(bodyStyleOverrides as CSSProperties ?? {}),
  };

  const searchWrapperStyle: CSSProperties = {
    ...(searchWrapperStyleOverrides as CSSProperties ?? {}),
  };

  const searchInputStyle: CSSProperties = {
    width: '90%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #000',
    fontSize: '16px',
    marginBottom: '10px',
    ...(searchInputStyleOverrides as CSSProperties ?? {}),
  };

  const requestsWrapperStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: 'calc(100% - 150px)',
    overflowY: 'auto',
    ...(requestsWrapperStyleOverrides as CSSProperties ?? {}),
  };

  const defaultCloseIcon = props.closeIconComponent ?? h(FontAwesomeIcon, { icon: faTimes, class: 'icon' });

  const defaultHeader = h(
    'div',
    {
      class: joinClassNames('modal-header', headerClassName),
      style: headerStyle,
      ...restHeaderProps,
    },
    [
      h(
        'div',
        {
          class: joinClassNames('modal-title', titleClassName),
          style: titleStyle,
          ...restTitleProps,
        },
        [
          props.title,
          h(
            'div',
            {
              class: joinClassNames('requests-counter', badgeWrapperClassName),
              style: badgeWrapperStyle,
              ...restBadgeWrapperProps,
            },
            [
              h(
                'span',
                {
                  class: joinClassNames('badge', badgeClassName),
                  style: badgeStyle,
                  ...restBadgeProps,
                },
                String(requestCounterState.value)
              ),
            ]
          ),
        ]
      ),
      h(
        'button',
        {
          type: 'button',
          class: joinClassNames('btn-close-requests', closeButtonClassName),
          style: closeButtonStyle,
          onClick: handleCloseClick,
          ...restCloseButtonProps,
        },
        [defaultCloseIcon]
      ),
    ]
  );

  const headerNode = props.renderHeader
    ? props.renderHeader({
        defaultHeader,
        counter: requestCounterState.value,
        onClose: props.onRequestClose,
      })
    : defaultHeader;

  const defaultSearchInput = h('input', {
    placeholder: 'Search ...',
    class: searchInputClassName,
    style: searchInputStyle,
    onInput: handleFilterChange,
    ...restSearchInputProps,
  });

  const searchNode = props.renderSearch
    ? props.renderSearch({
        defaultSearch: defaultSearchInput,
        onFilter: (value: string) => {
          props.onRequestFilterChange(value);
          rerenderToggle.value = !rerenderToggle.value;
        },
      })
    : defaultSearchInput;

  const renderRequestRow = (request: Request, index: number) => {
    const handleRespond = (action: 'accepted' | 'rejected') => {
      props.onRequestItemPress({
        request,
        updateRequestList: props.updateRequestList,
        requestList: requestListState.value,
        roomName: props.roomName,
        socket: props.socket,
        action,
      });
    };

    const RequestComponent = props.renderRequestComponent;
    const defaultRequest = h(
      'div',
      {
        class: joinClassNames('request-item-wrapper', requestItemWrapperClassName as string | undefined),
        style: { marginTop: '5px', ...(requestItemWrapperStyleOverrides as CSSProperties ?? {}) },
        ...restRequestItemWrapperProps,
      },
      [
        h(RequestComponent, {
          request,
          onRequestItemPress: props.onRequestItemPress,
          requestList: requestListState.value,
          updateRequestList: props.updateRequestList,
          roomName: props.roomName,
          socket: props.socket,
        }),
      ]
    );

    if (props.renderRequest) {
      return props.renderRequest({
        request,
        index,
        defaultRequest,
        handleRespond,
      });
    }

    return defaultRequest;
  };

  const requestsListContent =
    requestListState.value.length > 0
      ? requestListState.value.map((requestItem, index) => renderRequestRow(requestItem, index))
      : props.emptyState
      ? typeof props.emptyState === 'function'
        ? (props.emptyState as (context: { counter: number }) => VNodeChild)({ counter: requestCounterState.value })
        : props.emptyState
      : null;

  const defaultBody = h(
    'div',
    {
      class: joinClassNames('modal-body', bodyClassName),
      style: bodyStyle,
      ...restBodyProps,
    },
    [
      h(
        'div',
        {
          class: joinClassNames('form-group', searchWrapperClassName),
          style: searchWrapperStyle,
          ...restSearchWrapperProps,
        },
        [searchNode]
      ),
      h(
        'div',
        {
          class: joinClassNames('requests-list', requestsWrapperClassName),
          style: requestsWrapperStyle,
          ...restRequestsWrapperProps,
        },
        requestsListContent ? [requestsListContent] : []
      ),
    ]
  );

  const bodyNode = props.renderBody
    ? props.renderBody({
        defaultBody,
        counter: requestCounterState.value,
      })
    : defaultBody;

  const defaultContent = h(
    'div',
    {
      class: joinClassNames('mediasfu-requests-modal__content', contentClassName),
      style: contentStyle.value,
      ...restContentProps,
    },
    [headerNode, h('hr', { class: 'hr' }), bodyNode]
  );

  const contentNode = props.renderContent
    ? props.renderContent({
        defaultContent,
        counter: requestCounterState.value,
      })
    : defaultContent;

  return h(
    'div',
    {
      class: joinClassNames('mediasfu-requests-modal', overlayClassName),
      style: overlayStyle.value,
      ...restOverlayProps,
    },
    [contentNode]
  );
});
</script>
