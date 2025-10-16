<!--
/**
 * @fileoverview CoHostModal - Co-host assignment and permissions management modal
 * @component CoHostModal
 * @module components/coHostComponents/CoHostModal
 * 
 * @description
 * A host-only modal for assigning co-host privileges and managing co-host responsibilities.
 * Allows the host to select a participant as co-host and configure granular permissions for
 * various event management tasks. Each responsibility can be toggled and set as "dedicated"
 * (co-host only) or shared (host and co-host). Socket integration ensures real-time updates.
 * 
 * Key Features:
 * - Co-host selection from participant dropdown
 * - Current co-host display (read-only)
 * - Granular responsibility management (8 categories)
 * - Toggle responsibility on/off
 * - Set responsibilities as dedicated (co-host exclusive)
 * - Real-time Socket.io updates
 * - Host-only access control
 * - Responsive positioning (top/bottom, left/right)
 * - Custom responsibility labels
 * - Render function support for all sections
 * 
 * Responsibilities:
 * 1. **Media Control** - Manage participant audio/video
 * 2. **Participants** - View and manage participant list
 * 3. **Chat** - Access messaging and chat features
 * 4. **Waiting Room** - Manage waiting room participants
 * 5. **Settings** - Access event settings
 * 6. **Recording** - Control recording start/stop/pause
 * 7. **Requests** - Handle participant media requests
 * 8. **Screen Share** - Approve screenshare requests
 * 
 * Permission Modes:
 * - **Selected**: Co-host has this permission
 * - **Not Selected**: Co-host does not have this permission
 * - **Dedicated**: Only co-host has permission (host cannot use)
 * - **Shared**: Both host and co-host have permission
 * 
 * @example Basic Usage
 * // <CoHostModal
 *   // :isCoHostModalVisible="isCoHostModalVisible"
 *   // :onCoHostClose="() => updateIsCoHostModalVisible(false)"
 *   // :coHostResponsibility="coHostResponsibility"
 *   // :participants="participants"
 *   // :currentCohost="coHost"
 *   // roomName="my-room"
 *   // :showAlert="showAlert"
 *   // :updateCoHostResponsibility="updateCoHostResponsibility"
 *   // :updateCoHost="updateCoHost"
 *   // :updateIsCoHostModalVisible="updateIsCoHostModalVisible"
 *   // :socket="socket"
 * // />
 * 
 * @example With Custom Position and Background
 * // <CoHostModal
 *   // :isCoHostModalVisible="showCoHostModal"
 *   // :onCoHostClose="closeCoHostModal"
 *   // :coHostResponsibility="responsibilities"
 *   // :participants="participantsList"
 *   // :currentCohost="currentCoHost"
 *   // roomName="conference-123"
 *   // :showAlert="showAlert"
 *   // :updateCoHostResponsibility="updateResponsibilities"
 *   // :updateCoHost="setCoHost"
 *   // :updateIsCoHostModalVisible="setModalVisibility"
 *   // :socket="socketConnection"
 *   // position="topLeft"
 *   // backgroundColor="#2c3e50"
 * // />
 * 
 * @example Custom Responsibility Labels
 * // <script setup>
 * const customResponsibilityItems = [
 *   { name: 'media', label: '🎤 Media Management' },
 *   { name: 'participants', label: '👥 Participant Control' },
 *   { name: 'chat', label: '💬 Chat Moderation' },
 *   { name: 'waiting', label: '⏱️ Waiting Room' },
 *   { name: 'settings', label: '⚙️ Event Settings' },
 *   { name: 'recording', label: '⏺️ Recording Control' },
 *   { name: 'requests', label: '✋ Media Requests' },
 *   { name: 'screenshare', label: '🖥️ Screen Share Approval' }
 * ];
 * </script>
 * 
 * // <template>
 *   <CoHostModal
 *     :isCoHostModalVisible="modalOpen"
 *     :onCoHostClose="closeModal"
 *     :coHostResponsibility="responsibilities"
 *     :participants="participants"
 *     :currentCohost="coHost"
 *     roomName="room"
 *     :showAlert="showAlert"
 *     :updateCoHostResponsibility="updateResp"
 *     :updateCoHost="updateCoHost"
 *     :updateIsCoHostModalVisible="updateVisibility"
 *     :socket="socket"
 *     :responsibilityItems="customResponsibilityItems"
 *   />
 * </template>
 * 
 * @example Custom Responsibility Renderer
 * // <script setup>
 * const renderCustomResponsibilityRow = ({ item, isSelected, isDedicated, toggleSelect, toggleDedicated }) => {
 *   // return h('div', {
 *     style: {
 *       display: 'flex',
 *       justifyContent: 'space-between',
 *       alignItems: 'center',
 *       padding: '12px',
 *       backgroundColor: isSelected ? '#e8f5e9' : '#f8f9fa',
 *       borderRadius: '8px',
 *       marginBottom: '8px',
 *       border: isDedicated ? '2px solid #4caf50' : '1px solid #dee2e6'
 *     }
 *   }, [
 *     h('span', { style: { fontWeight: isSelected ? 'bold' : 'normal' } }, item.label),
 *     h('div', { style: { display: 'flex', gap: '15px' } }, [
 *       h('label', { style: { display: 'flex', alignItems: 'center', gap: '5px' } }, [
 *         h('input', { type: 'checkbox', checked: isSelected, onChange: toggleSelect }),
 *         h('span', 'Enable')
 *       ]),
 *       h('label', {
 *         style: {
 *           display: 'flex',
 *           alignItems: 'center',
 *           gap: '5px',
 *           opacity: isSelected ? 1 : 0.5
 *         }
 *       }, [
 *         h('input', {
 *           type: 'checkbox',
 *           checked: isDedicated,
 *           disabled: !isSelected,
 *           onChange: toggleDedicated
 *         }),
 *         h('span', 'Exclusive')
 *       ])
 *     ])
 *   ]);
 * };
 * </script>
 * 
 * // <template>
 *   <CoHostModal
 *     :isCoHostModalVisible="visible"
 *     :onCoHostClose="close"
 *     :coHostResponsibility="resp"
 *     :participants="parts"
 *     :currentCohost="cohost"
 *     roomName="room"
 *     :showAlert="alert"
 *     :updateCoHostResponsibility="updateResp"
 *     :updateCoHost="updateHost"
 *     :updateIsCoHostModalVisible="updateVis"
 *     :socket="socket"
 *     :renderResponsibilityRow="renderCustomResponsibilityRow"
 *   />
 * </template>
 * 
 * @example Programmatic Co-Host Management
 * // <script setup>
 * const assignCoHost = (participantName: string) => {
 *   // updateCoHost(participantName);
 *   // updateIsCoHostModalVisible(false);
 *   // showAlert({ message: `${participantName} is now co-host`, type: 'success', duration: 3000 });
 * };
 * 
 * const grantAllPermissions = () => {
 *   // const allEnabled = coHostResponsibility.map(r => ({
 *     ...r,
 *     value: true,
 *     dedicated: false
 *   }));
 *   // updateCoHostResponsibility(allEnabled);
 * };
 * 
 * const revokeAllPermissions = () => {
 *   // const allDisabled = coHostResponsibility.map(r => ({
 *     ...r,
 *     value: false,
 *     dedicated: false
 *   }));
 *   // updateCoHostResponsibility(allDisabled);
 * };
 * </script>
 * 
 * // <template>
 *   <div>
 *     <button @click="() => updateIsCoHostModalVisible(true)">Manage Co-Host</button>
 *     <CoHostModal
 *       :isCoHostModalVisible="isCoHostModalVisible"
 *       :onCoHostClose="() => updateIsCoHostModalVisible(false)"
 *       :coHostResponsibility="coHostResponsibility"
 *       :participants="participants"
 *       :currentCohost="coHost"
 *       roomName="room"
 *       :showAlert="showAlert"
 *       :updateCoHostResponsibility="updateCoHostResponsibility"
 *       :updateCoHost="updateCoHost"
 *       :updateIsCoHostModalVisible="updateIsCoHostModalVisible"
 *       :socket="socket"
 *     />
 *   </div>
 * </template>
 * 
 * @see {@link modifyCoHostSettings} for server update logic
 * @see {@link CoHostResponsibility} for responsibility data structure
 * @see {@link Socket} for Socket.io integration
 */
-->
<template>
  <RenderVNode :node="overlayNode" />
</template>

<script setup lang="ts">
import { ref, computed, watch, h, isVNode, defineComponent } from 'vue';
import type { PropType, VNodeChild, HTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, LabelHTMLAttributes, CSSProperties } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { modifyCoHostSettings } from 'mediasfu-shared';
import type { Socket } from 'socket.io-client';

// Helper function
function joinClassNames(...classes: Array<string | undefined | null | false>): string | undefined {
  const result = classes.filter(Boolean).join(' ').trim();
  return result || undefined;
}

export interface CoHostResponsibility {
  name: string;
  value: boolean;
  dedicated: boolean;
}

export interface Participant {
  name: string;
  islevel?: string;
  [key: string]: unknown;
}

export type ShowAlert = (alert: { message: string; type: 'success' | 'danger'; duration?: number }) => void;

export interface ModifyCoHostSettingsOptions {
  roomName: string;
  showAlert?: ShowAlert;
  selectedParticipant: string;
  coHost: string;
  coHostResponsibility: CoHostResponsibility[];
  updateCoHostResponsibility: (coHostResponsibility: CoHostResponsibility[]) => void;
  updateCoHost: (coHost: string) => void;
  updateIsCoHostModalVisible: (isCoHostModalVisible: boolean) => void;
  socket: Socket;
}

export interface CoHostModalProps {
  isCoHostModalVisible: boolean;
  currentCohost?: string;
  participants: Participant[];
  coHostResponsibility: CoHostResponsibility[];
  position?: string;
  backgroundColor?: string;
  roomName: string;
  showAlert?: ShowAlert;
  updateCoHostResponsibility: (coHostResponsibility: CoHostResponsibility[]) => void;
  updateCoHost: (coHost: string) => void;
  updateIsCoHostModalVisible: (isCoHostModalVisible: boolean) => void;
  socket: Socket;
  onCoHostClose: () => void;
  onModifyEventSettings?: (settings: ModifyCoHostSettingsOptions) => void;
  title?: VNodeChild;
  overlayProps?: HTMLAttributes;
  contentProps?: HTMLAttributes;
  headerProps?: HTMLAttributes;
  titleProps?: HTMLAttributes;
  closeButtonProps?: ButtonHTMLAttributes;
  closeIconComponent?: VNodeChild;
  headerDividerProps?: HTMLAttributes;
  bodyProps?: HTMLAttributes;
  currentCoHostFieldProps?: HTMLAttributes;
  currentCoHostLabelProps?: LabelHTMLAttributes;
  currentCoHostInputProps?: InputHTMLAttributes;
  selectCoHostFieldProps?: HTMLAttributes;
  selectCoHostLabelProps?: LabelHTMLAttributes;
  selectCoHostSelectProps?: SelectHTMLAttributes;
  responsibilitiesWrapperProps?: HTMLAttributes;
  responsibilitiesHeaderRowProps?: HTMLAttributes;
  responsibilityHeaderLabelProps?: LabelHTMLAttributes;
  responsibilitySelectHeaderProps?: LabelHTMLAttributes;
  responsibilityDedicatedHeaderProps?: LabelHTMLAttributes;
  responsibilityRowProps?: HTMLAttributes;
  responsibilityNameProps?: HTMLAttributes;
  responsibilitySelectProps?: HTMLAttributes;
  responsibilityDedicatedProps?: HTMLAttributes;
  responsibilitySelectCheckboxProps?: InputHTMLAttributes;
  responsibilityDedicatedCheckboxProps?: InputHTMLAttributes;
  footerProps?: HTMLAttributes;
  saveButtonProps?: ButtonHTMLAttributes;
  currentCoHostLabel?: VNodeChild;
  selectCoHostLabel?: VNodeChild;
  responsibilityHeaderLabel?: VNodeChild;
  responsibilitySelectLabel?: VNodeChild;
  responsibilityDedicatedLabel?: VNodeChild;
  saveButtonLabel?: VNodeChild;
  responsibilityItems?: { name: string; label: VNodeChild }[];
  renderHeader?: (options: { defaultHeader: VNodeChild }) => VNodeChild;
  renderBody?: (options: { defaultBody: VNodeChild }) => VNodeChild;
  renderResponsibilities?: (options: {
    defaultResponsibilities: VNodeChild;
    items: { name: string; label: VNodeChild }[];
    responsibilities: Record<string, boolean>;
    toggleSelect: (name: string) => void;
    toggleDedicated: (name: string) => void;
  }) => VNodeChild;
  renderResponsibilityRow?: (options: {
    defaultRow: VNodeChild;
    item: { name: string; label: VNodeChild };
    index: number;
    isSelected: boolean;
    isDedicated: boolean;
    toggleSelect: () => void;
    toggleDedicated: () => void;
  }) => VNodeChild;
  renderFooter?: (options: { defaultFooter: VNodeChild }) => VNodeChild;
  renderContent?: (options: { defaultContent: VNodeChild }) => VNodeChild;
}

const props = withDefaults(defineProps<CoHostModalProps>(), {
  currentCohost: 'No coHost',
  position: 'topRight',
  backgroundColor: '#83c0e9',
  showAlert: undefined,
  onModifyEventSettings: undefined,
  title: 'Manage Co-Host',
  overlayProps: undefined,
  contentProps: undefined,
  headerProps: undefined,
  titleProps: undefined,
  closeButtonProps: undefined,
  closeIconComponent: undefined,
  headerDividerProps: undefined,
  bodyProps: undefined,
  currentCoHostFieldProps: undefined,
  currentCoHostLabelProps: undefined,
  currentCoHostInputProps: undefined,
  selectCoHostFieldProps: undefined,
  selectCoHostLabelProps: undefined,
  selectCoHostSelectProps: undefined,
  responsibilitiesWrapperProps: undefined,
  responsibilitiesHeaderRowProps: undefined,
  responsibilityHeaderLabelProps: undefined,
  responsibilitySelectHeaderProps: undefined,
  responsibilityDedicatedHeaderProps: undefined,
  responsibilityRowProps: undefined,
  responsibilityNameProps: undefined,
  responsibilitySelectProps: undefined,
  responsibilityDedicatedProps: undefined,
  responsibilitySelectCheckboxProps: undefined,
  responsibilityDedicatedCheckboxProps: undefined,
  footerProps: undefined,
  saveButtonProps: undefined,
  currentCoHostLabel: 'Current Co-host:',
  selectCoHostLabel: 'Select New Co-host:',
  responsibilityHeaderLabel: 'Responsibility',
  responsibilitySelectLabel: 'Select',
  responsibilityDedicatedLabel: 'Dedicated',
  saveButtonLabel: 'Save',
  responsibilityItems: undefined,
  renderHeader: undefined,
  renderBody: undefined,
  renderResponsibilities: undefined,
  renderResponsibilityRow: undefined,
  renderFooter: undefined,
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
const selectedCohost = ref<string>(props.currentCohost || '');
const CoHostResponsibilityCopy = ref<CoHostResponsibility[]>([...props.coHostResponsibility]);
const CoHostResponsibilityCopyAlt = ref<CoHostResponsibility[]>([...props.coHostResponsibility]);
const responsibilities = ref<Record<string, boolean>>({});

// Responsibility items list
const defaultResponsibilityItems = [
  { name: 'manageParticipants', label: 'Manage Participants' },
  { name: 'manageMedia', label: 'Manage Media' },
  { name: 'manageWaiting', label: 'Manage Waiting Room' },
  { name: 'manageChat', label: 'Manage Chat' },
];

const responsibilityItemsList = computed(() => props.responsibilityItems ?? defaultResponsibilityItems);

// Filtered participants (exclude current co-host and level '2' participants)
const filteredParticipants = computed(() => {
  return props.participants?.filter(
    (participant) => participant.name !== props.currentCohost && participant.islevel !== '2'
  );
});

// Initialize responsibilities
const populateResponsibilities = () => {
  CoHostResponsibilityCopyAlt.value = [...props.coHostResponsibility];
  CoHostResponsibilityCopy.value = [...props.coHostResponsibility];
  
  const initialResponsibilities = CoHostResponsibilityCopyAlt.value.reduce<Record<string, boolean>>(
    (acc, item) => {
      const str2 = item.name.charAt(0).toUpperCase() + item.name.slice(1);
      const keyed = `manage${str2}`;
      acc[keyed] = item.value;
      acc[`dedicateTo${keyed}`] = item.dedicated;
      return acc;
    },
    {}
  );
  
  responsibilities.value = initialResponsibilities;
};

// Handle toggle
const handleToggleSwitch = (responsibility: string) => {
  responsibilities.value[responsibility] = !responsibilities.value[responsibility];

  if (responsibility.startsWith('dedicateTo')) {
    const responsibilityName = responsibility.replace('dedicateTomanage', '').toLowerCase();
    const item = CoHostResponsibilityCopy.value.find((item) => item.name === responsibilityName);
    if (item) {
      item.dedicated = !item.dedicated;
    }
  } else if (responsibility.startsWith('manage')) {
    const responsibilityName = responsibility.replace('manage', '').toLowerCase();
    const item = CoHostResponsibilityCopy.value.find((item) => item.name === responsibilityName);
    if (item) {
      item.value = !item.value;
    }
  }
};

// Handle save
const handleSave = () => {
  const modifyFunction = props.onModifyEventSettings || modifyCoHostSettings;
  modifyFunction({
    roomName: props.roomName,
    showAlert: props.showAlert,
    selectedParticipant: selectedCohost.value,
    coHost: props.currentCohost || 'No coHost',
    coHostResponsibility: CoHostResponsibilityCopy.value,
    updateCoHostResponsibility: props.updateCoHostResponsibility,
    updateCoHost: props.updateCoHost,
    updateIsCoHostModalVisible: props.updateIsCoHostModalVisible,
    socket: props.socket,
  });
};

// Watchers
watch(
  () => props.isCoHostModalVisible,
  (isVisible) => {
    if (isVisible) {
      populateResponsibilities();
    }
  },
  { immediate: true }
);

watch(
  () => props.coHostResponsibility,
  () => {
    if (props.isCoHostModalVisible) {
      populateResponsibilities();
    }
  },
  { deep: true }
);

// Styles computation
const defaultOverlayWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.8, 400) : 320;

const overlayStyle = computed<CSSProperties>(() => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: props.isCoHostModalVisible ? 'block' : 'none',
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
  maxWidth: `${defaultOverlayWidth}px`,
  overflow: 'hidden',
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
const handleCloseClick = (event: Event) => {
  const clickHandler = props.closeButtonProps?.onClick;
  if (clickHandler) {
    clickHandler(event as unknown as PointerEvent);
  }
  if (!(event as Event & { defaultPrevented?: boolean }).defaultPrevented) {
    props.onCoHostClose();
  }
};

const handleSaveClick = (event: Event) => {
  const clickHandler = props.saveButtonProps?.onClick;
  if (clickHandler) {
    clickHandler(event as unknown as PointerEvent);
  }
  if (!(event as Event & { defaultPrevented?: boolean }).defaultPrevented) {
    handleSave();
  }
};

// Build overlayNode
const overlayNode = computed(() => {
  const { class: overlayClassName, ...restOverlayProps } = props.overlayProps ?? {};
  const { class: contentClassName, ...restContentProps } = props.contentProps ?? {};
  const { class: headerClassName, style: headerStyleOverrides, ...restHeaderProps } = props.headerProps ?? {};
  const { class: titleClassName, style: titleStyleOverrides, ...restTitleProps } = props.titleProps ?? {};
  const { class: closeButtonClassName, style: closeButtonStyleOverrides, onClick: _closeButtonOnClick, ...restCloseButtonProps } = props.closeButtonProps ?? {};
  const { style: headerDividerStyleOverrides, ...restHeaderDividerProps } = props.headerDividerProps ?? {};
  const { class: bodyClassName, style: bodyStyleOverrides, ...restBodyProps } = props.bodyProps ?? {};
  
  // Styles
  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    ...(headerStyleOverrides as CSSProperties ?? {}),
  };

  const titleStyle: CSSProperties = {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'black',
    ...(titleStyleOverrides as CSSProperties ?? {}),
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

  const headerDividerStyle: CSSProperties = {
    height: '1px',
    backgroundColor: 'black',
    marginTop: '5px',
    marginBottom: '5px',
    border: 'none',
    ...(headerDividerStyleOverrides as CSSProperties ?? {}),
  };

  const bodyStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto',
    ...(bodyStyleOverrides as CSSProperties ?? {}),
  };

  const defaultCloseIcon = props.closeIconComponent ?? h(FontAwesomeIcon, { icon: faTimes, class: 'icon' });

  const defaultHeader = h(
    'div',
    {
      class: joinClassNames('modal-header', headerClassName as string | undefined),
      style: headerStyle,
      ...restHeaderProps,
    },
    [
      h(
        'div',
        {
          class: joinClassNames('modal-title', titleClassName as string | undefined),
          style: titleStyle,
          ...restTitleProps,
        },
        [props.title]
      ),
      h(
        'button',
        {
          type: 'button',
          class: joinClassNames('btn-close-settings', closeButtonClassName as string | undefined),
          style: closeButtonStyle,
          onClick: handleCloseClick,
          ...restCloseButtonProps,
        },
        [defaultCloseIcon]
      ),
    ]
  );

  const headerNode = props.renderHeader
    ? props.renderHeader({ defaultHeader })
    : defaultHeader;

  // Body fields and responsibilities
  const { class: currentCoHostFieldClassName, style: currentCoHostFieldStyleOverrides, ...restCurrentCoHostFieldProps } = props.currentCoHostFieldProps ?? {};
  const { class: currentCoHostLabelClassName, style: currentCoHostLabelStyleOverrides, ...restCurrentCoHostLabelProps } = props.currentCoHostLabelProps ?? {};
  const { class: currentCoHostInputClassName, style: currentCoHostInputStyleOverrides, ...restCurrentCoHostInputProps } = props.currentCoHostInputProps ?? {};
  const { class: selectCoHostFieldClassName, style: selectCoHostFieldStyleOverrides, ...restSelectCoHostFieldProps } = props.selectCoHostFieldProps ?? {};
  const { class: selectCoHostLabelClassName, style: selectCoHostLabelStyleOverrides, ...restSelectCoHostLabelProps } = props.selectCoHostLabelProps ?? {};
  const { class: selectCoHostSelectClassName, style: selectCoHostSelectStyleOverrides, ...restSelectCoHostSelectProps } = props.selectCoHostSelectProps ?? {};

  const currentCoHostField = h(
    'div',
    {
      class: joinClassNames('form-group', currentCoHostFieldClassName as string | undefined),
      style: currentCoHostFieldStyleOverrides as CSSProperties ?? {},
      ...restCurrentCoHostFieldProps,
    },
    [
      h(
        'label',
        {
          class: joinClassNames('font-weight-bold', currentCoHostLabelClassName as string | undefined),
          style: currentCoHostLabelStyleOverrides as CSSProperties ?? {},
          ...restCurrentCoHostLabelProps,
        },
        [props.currentCoHostLabel]
      ),
      h('input', {
        class: joinClassNames('form-control', currentCoHostInputClassName as string | undefined),
        style: currentCoHostInputStyleOverrides as CSSProperties ?? {},
        value: props.currentCohost,
        readonly: true,
        ...restCurrentCoHostInputProps,
      }),
    ]
  );

  const handleSelectChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    selectedCohost.value = target.value;
  };

  const selectCoHostField = h(
    'div',
    {
      class: joinClassNames('form-group', selectCoHostFieldClassName as string | undefined),
      style: selectCoHostFieldStyleOverrides as CSSProperties ?? {},
      ...restSelectCoHostFieldProps,
    },
    [
      h(
        'label',
        {
          class: joinClassNames('font-weight-bold', selectCoHostLabelClassName as string | undefined),
          style: selectCoHostLabelStyleOverrides as CSSProperties ?? {},
          ...restSelectCoHostLabelProps,
        },
        [props.selectCoHostLabel]
      ),
      h(
        'select',
        {
          class: joinClassNames('form-control', selectCoHostSelectClassName as string | undefined),
          style: selectCoHostSelectStyleOverrides as CSSProperties ?? {},
          onChange: handleSelectChange,
          ...restSelectCoHostSelectProps,
        },
        [
          h('option', { value: '' }, 'Select a participant'),
          ...(filteredParticipants.value?.map((participant: Participant) =>
            h('option', { value: participant.name, key: participant.name }, participant.name)
          ) ?? []),
        ]
      ),
    ]
  );

  // Responsibilities rendering
  const renderResponsibilitiesContent = () => {
    const { class: responsibilitiesWrapperClassName, style: responsibilitiesWrapperStyleOverrides, ...restResponsibilitiesWrapperProps } = props.responsibilitiesWrapperProps ?? {};
    const { class: responsibilitiesHeaderRowClassName, style: responsibilitiesHeaderRowStyleOverrides, ...restResponsibilitiesHeaderRowProps } = props.responsibilitiesHeaderRowProps ?? {};
    
    const responsibilitiesHeader = h(
      'div',
      {
        class: joinClassNames('responsibility-header', responsibilitiesHeaderRowClassName as string | undefined),
        style: {
          display: 'flex',
          alignItems: 'center',
          marginBottom: '10px',
          borderBottom: '1px solid #ccc',
          paddingBottom: '5px',
          ...(responsibilitiesHeaderRowStyleOverrides as CSSProperties ?? {}),
        },
        ...restResponsibilitiesHeaderRowProps,
      },
      [
        h('div', { class: 'col-5', style: { width: '41.67%' } }, [
          h('label', { class: 'font-weight-bold' }, [props.responsibilityHeaderLabel]),
        ]),
        h('div', { class: 'col-3', style: { width: '25%', justifyContent: 'center', display: 'flex' } }, [
          h('label', { class: 'font-weight-bold' }, [props.responsibilitySelectLabel]),
        ]),
        h('div', { class: 'col-4', style: { width: '33.33%', justifyContent: 'center', display: 'flex' } }, [
          h('label', { class: 'font-weight-bold' }, [props.responsibilityDedicatedLabel]),
        ]),
      ]
    );

    const responsibilityRows = responsibilityItemsList.value.map((item, index) => {
      const isSelected = responsibilities.value[item.name] ?? false;
      const isDedicated = (responsibilities.value[item.name] && responsibilities.value[`dedicateTo${item.name}`]) ?? false;
      
      const toggleSelect = () => handleToggleSwitch(item.name);
      const toggleDedicated = () => handleToggleSwitch(`dedicateTo${item.name}`);

      const defaultRow = h(
        'div',
        {
          key: item.name,
          class: 'responsibility-row',
          style: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px',
          },
        },
        [
          h('div', { class: 'col-5 font-weight-bold', style: { width: '41.67%' } }, [item.label]),
          h('div', { class: 'col-3', style: { width: '25%', justifyContent: 'center', display: 'flex' } }, [
            h('input', {
              type: 'checkbox',
              checked: isSelected,
              onChange: toggleSelect,
              style: { width: '18px', height: '18px', cursor: 'pointer' },
            }),
          ]),
          h('div', { class: 'col-4', style: { width: '33.33%', justifyContent: 'center', display: 'flex' } }, [
            h('input', {
              type: 'checkbox',
              checked: isDedicated,
              disabled: !isSelected,
              onChange: toggleDedicated,
              style: { width: '18px', height: '18px', cursor: !isSelected ? 'not-allowed' : 'pointer', opacity: !isSelected ? 0.5 : 1 },
            }),
          ]),
        ]
      );

      if (props.renderResponsibilityRow) {
        return props.renderResponsibilityRow({
          defaultRow,
          item,
          index,
          isSelected,
          isDedicated,
          toggleSelect,
          toggleDedicated,
        });
      }

      return defaultRow;
    });

    const defaultResponsibilities = h(
      'div',
      {
        class: joinClassNames('responsibilities-wrapper', responsibilitiesWrapperClassName as string | undefined),
        style: responsibilitiesWrapperStyleOverrides as CSSProperties ?? {},
        ...restResponsibilitiesWrapperProps,
      },
      [responsibilitiesHeader, ...responsibilityRows]
    );

    if (props.renderResponsibilities) {
      return props.renderResponsibilities({
        defaultResponsibilities,
        items: responsibilityItemsList.value,
        responsibilities: responsibilities.value,
        toggleSelect: handleToggleSwitch,
        toggleDedicated: (name: string) => handleToggleSwitch(`dedicateTo${name}`),
      });
    }

    return defaultResponsibilities;
  };

  const defaultBody = h(
    'div',
    {
      class: joinClassNames('modal-body', bodyClassName as string | undefined),
      style: bodyStyle,
      ...restBodyProps,
    },
    [currentCoHostField, selectCoHostField, renderResponsibilitiesContent()]
  );

  const bodyNode = props.renderBody
    ? props.renderBody({ defaultBody })
    : defaultBody;

  // Footer
  const { class: footerClassName, style: footerStyleOverrides, ...restFooterProps } = props.footerProps ?? {};
  const { class: saveButtonClassName, style: saveButtonStyleOverrides, onClick: _saveButtonOnClick, ...restSaveButtonProps } = props.saveButtonProps ?? {};

  const footerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    ...(footerStyleOverrides as CSSProperties ?? {}),
  };

  const saveButtonStyle: CSSProperties = {
    ...(saveButtonStyleOverrides as CSSProperties ?? {}),
  };

  const defaultFooter = h(
    'div',
    {
      class: joinClassNames('modal-footer', footerClassName as string | undefined),
      style: footerStyle,
      ...restFooterProps,
    },
    [
      h(
        'button',
        {
          class: joinClassNames('btn-apply-settings', saveButtonClassName as string | undefined),
          style: saveButtonStyle,
          onClick: handleSaveClick,
          ...restSaveButtonProps,
        },
        [props.saveButtonLabel]
      ),
    ]
  );

  const footerNode = props.renderFooter
    ? props.renderFooter({ defaultFooter })
    : defaultFooter;

  const defaultContent = h(
    'div',
    {
      class: joinClassNames('mediasfu-cohost-modal__content', contentClassName as string | undefined),
      style: contentStyle.value,
      ...restContentProps,
    },
    [
      headerNode,
      h('hr', { style: headerDividerStyle, ...restHeaderDividerProps }),
      bodyNode,
      footerNode,
    ]
  );

  const contentNode = props.renderContent
    ? props.renderContent({ defaultContent })
    : defaultContent;

  return h(
    'div',
    {
      class: joinClassNames('mediasfu-cohost-modal', overlayClassName as string | undefined),
      style: overlayStyle.value,
      ...restOverlayProps,
    },
    [contentNode]
  );
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-container {
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: black;
}

.btn-close {
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  color: black;
  font-size: 1.2rem;
}

.btn-close:hover {
  opacity: 0.7;
}

.divider {
  height: 1px;
  background-color: black;
  border: none;
  margin: 10px 0;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 0.95rem;
}

.font-weight-bold {
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
}

.form-control:read-only {
  background-color: #e9ecef;
}

.responsibility-header,
.responsibility-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.responsibility-header {
  border-bottom: 1px solid #ccc;
  padding-bottom: 5px;
}

.col-3,
.col-4,
.col-5 {
  display: flex;
  align-items: center;
}

.col-3 {
  width: 25%;
  justify-content: center;
}

.col-4 {
  width: 33.33%;
  justify-content: center;
}

.col-5 {
  width: 41.67%;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #ccc;
}

.btn-save {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.btn-save:hover {
  background-color: #0056b3;
}

input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

input[type='checkbox']:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
