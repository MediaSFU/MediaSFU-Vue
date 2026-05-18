<template>
  <RenderVNode
    v-if="isEmbedded"
    :node="embeddedContentNode"
  />
  <Teleport to="body">
    <div
      v-if="showModal"
      v-bind="modalOverlayProps"
      @click.self="props.onConfigureWhiteboardClose"
    >
      <div v-bind="modalContentProps">
        <RenderVNode :node="modalBodyNode" />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  computed,
  defineComponent,
  h,
  isVNode,
  ref,
  watch,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type PropType,
  type VNodeChild,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faChalkboard,
  faCheck,
  faPlay,
  faSearch,
  faSpinner,
  faStop,
  faSyncAlt,
  faTimes,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { handleStartWhiteboard, handleStopWhiteboard } from 'mediasfu-shared';
import type {
  ConfigureWhiteboardModalParameters,
  ConfigureWhiteboardModalProps,
  Participant,
  WhiteboardUser,
} from '../../components/whiteboardComponents/ConfigureWhiteboardModal.vue';
import { mergeAttrObjects } from '../display_components/styleUtils';

type ModernConfigureWhiteboardRenderMode = 'modal' | 'sidebar' | 'inline';

export interface ModernConfigureWhiteboardModalProps extends ConfigureWhiteboardModalProps {
  renderMode?: ModernConfigureWhiteboardRenderMode;
}

const props = defineProps<ModernConfigureWhiteboardModalProps>();
const isEmbedded = computed(() => props.renderMode === 'sidebar' || props.renderMode === 'inline');
const showModal = computed(() => !isEmbedded.value && props.isVisible);
const searchText = ref('');
const selectedUsers = ref<WhiteboardUser[]>([]);
const isLoading = ref(false);

const RenderVNode = defineComponent({
  name: 'RenderVNode',
  props: {
    node: {
      type: [Object, String, Number, Function] as PropType<VNodeChild>,
      required: true,
    },
  },
  setup(renderProps) {
    return () => {
      const node = renderProps.node;
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

const panelGradientBackground =
  'linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-panel-surface) 100%)';

const getLatestParameters = (): ConfigureWhiteboardModalParameters =>
  props.parameters.getUpdatedAllParams?.() ?? props.parameters;

const getCurrentWhiteboardUsers = () => {
  const params = getLatestParameters();
  return Array.isArray(params.whiteboardUsers)
    ? ([...(params.whiteboardUsers as WhiteboardUser[])].filter(
        (user) => typeof user?.name === 'string' && user.name.trim().length > 0,
      ) as WhiteboardUser[])
    : [];
};

const getParticipantName = (participant: Participant | WhiteboardUser | null | undefined) =>
  typeof participant?.name === 'string' ? participant.name.trim() : '';

const syncSelectedUsers = () => {
  selectedUsers.value = getCurrentWhiteboardUsers();
};

watch(
  () => props.isVisible,
  (isVisible) => {
    if (isVisible || isEmbedded.value) {
      searchText.value = '';
      syncSelectedUsers();
    }
  },
  { immediate: true },
);

const whiteboardLimit = computed(() => getLatestParameters().itemPageLimit ?? 10);
const otherParticipantLimit = computed(() => Math.max(0, whiteboardLimit.value - 1));

const eligibleParticipants = computed(() => {
  const participants = getLatestParameters().participants ?? [];
  return participants.filter(
    (participant: Participant) =>
      String(participant.islevel) !== '2'
      && !participant.isBanned
      && getParticipantName(participant).length > 0,
  );
});

const filteredParticipants = computed(() => {
  const normalizedSearch = searchText.value.trim().toLowerCase();
  if (!normalizedSearch) {
    return eligibleParticipants.value;
  }

  return eligibleParticipants.value.filter((participant) => {
    const participantName = getParticipantName(participant);
    return participantName.toLowerCase().includes(normalizedSearch);
  });
});

const isParticipantSelected = (participant: Participant) =>
  selectedUsers.value.some((user) => user.name === getParticipantName(participant));

const toggleEmbeddedParticipant = (participant: Participant) => {
  if (isLoading.value) {
    return;
  }

  const participantName = getParticipantName(participant);
  if (!participantName) {
    return;
  }

  if (isParticipantSelected(participant)) {
    selectedUsers.value = selectedUsers.value.filter((user) => user.name !== participantName);
    return;
  }

  if (selectedUsers.value.length >= otherParticipantLimit.value) {
    getLatestParameters().showAlert?.({
      message: `Participant limit exceeded - you can only add ${otherParticipantLimit.value} other participants`,
      type: 'danger',
    });
    return;
  }

  selectedUsers.value = [...selectedUsers.value, { name: participantName, useBoard: true }];
};

const validateEmbeddedSelection = () => {
  if (selectedUsers.value.length > whiteboardLimit.value) {
    getLatestParameters().showAlert?.({
      message: `Participant limit exceeded - you can only add ${whiteboardLimit.value} participants`,
      type: 'danger',
    });
    return false;
  }

  return true;
};

const handleEmbeddedStart = async () => {
  if (isLoading.value) {
    return;
  }

  const params = getLatestParameters();
  const whiteboardStarted = Boolean(params.whiteboardStarted && !params.whiteboardEnded);

  if ((params.shareScreenStarted || params.shared) && !whiteboardStarted) {
    params.showAlert?.({
      message: 'You cannot start whiteboard while screen sharing is active',
      type: 'danger',
    });
    return;
  }

  if (params.breakOutRoomStarted && !params.breakOutRoomEnded) {
    params.showAlert?.({
      message: 'You cannot start whiteboard while breakout rooms are active',
      type: 'danger',
    });
    return;
  }

  if (!validateEmbeddedSelection()) {
    return;
  }

  if (!params.socket) {
    params.showAlert?.({ message: 'Connection not ready. Please try again in a moment.', type: 'danger' });
    return;
  }

  isLoading.value = true;
  const whiteboardUsers = selectedUsers.value.map((user) => ({ name: user.name, useBoard: true }));

  try {
    const startSucceeded = await handleStartWhiteboard({
      socket: params.socket,
      whiteboardUsers,
      roomName: params.roomName,
      whiteboardStarted: params.whiteboardStarted,
      whiteboardEnded: params.whiteboardEnded,
      showAlert: params.showAlert,
      updateWhiteboardStarted: params.updateWhiteboardStarted,
      updateWhiteboardEnded: params.updateWhiteboardEnded,
      updateIsConfigureWhiteboardModalVisible: params.updateIsConfigureWhiteboardModalVisible,
    });

    if (!startSucceeded) {
      return;
    }

    params.updateWhiteboardUsers?.(whiteboardUsers);
    params.updateCanStartWhiteboard?.(false);
    props.onConfigureWhiteboardClose();
  } finally {
    isLoading.value = false;
  }
};

const handleEmbeddedStop = async () => {
  if (isLoading.value) {
    return;
  }

  const params = getLatestParameters();

  if (!params.socket) {
    params.showAlert?.({ message: 'Connection not ready. Please try again in a moment.', type: 'danger' });
    return;
  }

  isLoading.value = true;

  try {
    const stopSucceeded = await handleStopWhiteboard({
      socket: params.socket,
      roomName: params.roomName,
      showAlert: params.showAlert,
      updateWhiteboardStarted: params.updateWhiteboardStarted,
      updateWhiteboardEnded: params.updateWhiteboardEnded,
      updateIsConfigureWhiteboardModalVisible: params.updateIsConfigureWhiteboardModalVisible,
    });

    if (!stopSucceeded) {
      return;
    }

    params.updateWhiteboardUsers?.([]);
    params.updateCanStartWhiteboard?.(true);
    props.onConfigureWhiteboardClose();
  } finally {
    isLoading.value = false;
  }
};

const renderEmbeddedWhiteboardBody = () => {
  const params = getLatestParameters();
  const isStarted = Boolean(params.whiteboardStarted && !params.whiteboardEnded);
  const showCloseButton = !isEmbedded.value;

  const titleStyle: CSSProperties = {
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontSize: '1rem',
    fontWeight: 700,
  };

  const closeButtonStyle: CSSProperties = {
    width: '38px',
    height: '38px',
    borderRadius: '9999px',
    border: '1px solid var(--ms-modern-panel-border)',
    background: 'var(--ms-modern-field-background)',
    color: 'var(--ms-modern-text-primary)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const controlButtonStyle: CSSProperties = {
    minHeight: '46px',
    borderRadius: '9999px',
    border: 'none',
    paddingInline: '16px',
    background:
      'linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 55%, var(--ms-modern-accent) 100%)',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontWeight: 700,
    cursor: isLoading.value ? 'progress' : 'pointer',
    opacity: isLoading.value ? 0.72 : 1,
  };

  const participantRows = filteredParticipants.value.map((participant) => {
    const participantName = getParticipantName(participant);
    const selected = isParticipantSelected(participant);
    const participantKey =
      typeof participant.id === 'string' && participant.id.trim().length > 0
        ? participant.id
        : participantName;

    return h('button', {
      key: participantKey,
      type: 'button',
      style: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '12px 14px',
        borderRadius: '16px',
        border: selected
          ? '1px solid var(--ms-modern-brand-primary)'
          : '1px solid var(--ms-modern-panel-border)',
        background: selected
          ? 'rgba(59, 130, 246, 0.14)'
          : 'var(--ms-modern-panel-surface)',
        color: 'var(--ms-modern-text-primary)',
        cursor: 'pointer',
      } as CSSProperties,
      onClick: () => toggleEmbeddedParticipant(participant),
    }, [
      h('span', {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          minWidth: 0,
          overflowWrap: 'anywhere',
        } as CSSProperties,
      }, [
        h(FontAwesomeIcon, { icon: faUser }),
        participantName,
      ]),
      h('span', {
        style: {
          width: '22px',
          height: '22px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          border: selected ? 'none' : '2px solid var(--ms-modern-field-border)',
          background: selected ? '#22c55e' : 'transparent',
          flex: '0 0 auto',
        } as CSSProperties,
      }, selected ? [h(FontAwesomeIcon, { icon: faCheck, size: 'xs', color: '#fff' })] : []),
    ]);
  });

  const emptyState = h('div', {
    style: {
      padding: '28px 16px',
      textAlign: 'center',
      color: 'var(--ms-modern-text-secondary)',
      fontFamily: 'var(--ms-modern-font-family)',
      fontSize: '0.9rem',
    } as CSSProperties,
  }, searchText.value.trim()
    ? 'No participants match your search'
    : 'No other participants available. Host can start alone.');

  return h('div', {
    class: 'mediasfu-whiteboard-sidebar-body',
    style: {
      height: '100%',
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      color: 'var(--ms-modern-text-primary)',
      fontFamily: 'var(--ms-modern-font-family)',
      overflow: 'hidden',
    } as CSSProperties,
  }, [
    h('div', {
      style: {
        padding: '20px 22px 14px',
        borderBottom: '1px solid var(--ms-modern-panel-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      } as CSSProperties,
    }, [
      h('h2', { style: titleStyle }, [
        h(FontAwesomeIcon, { icon: faChalkboard }),
        'Whiteboard',
      ]),
      ...(showCloseButton
        ? [
            h('button', {
              type: 'button',
              style: closeButtonStyle,
              onClick: props.onConfigureWhiteboardClose,
            }, [h(FontAwesomeIcon, { icon: faTimes })]),
          ]
        : []),
    ]),
    h('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 22px',
        color: 'var(--ms-modern-text-secondary)',
        fontSize: '0.84rem',
      } as CSSProperties,
    }, [
      h(FontAwesomeIcon, { icon: faUser }),
      `Limit ${whiteboardLimit.value}; add up to ${otherParticipantLimit.value} other participants`,
    ]),
    h('label', {
      style: {
        position: 'relative',
        display: 'block',
        padding: '0 22px 14px',
      } as CSSProperties,
    }, [
      h(FontAwesomeIcon, {
        icon: faSearch,
        style: {
          position: 'absolute',
          left: '36px',
          top: '50%',
          transform: 'translateY(-60%)',
          color: 'var(--ms-modern-text-muted)',
        } as CSSProperties,
      }),
      h('input', {
        value: searchText.value,
        placeholder: 'Search participants...',
        style: {
          width: '100%',
          minHeight: '44px',
          padding: '0 14px 0 40px',
          borderRadius: '16px',
          border: '1px solid var(--ms-modern-field-border)',
          background: 'var(--ms-modern-field-background)',
          color: 'var(--ms-modern-text-primary)',
          outline: 'none',
        } as CSSProperties,
        onInput: (event: Event) => {
          searchText.value = (event.target as HTMLInputElement).value;
        },
      }),
    ]),
    h('div', {
      style: {
        margin: '0 22px 14px',
        padding: '10px 12px',
        borderRadius: '14px',
        border: isStarted ? '1px solid rgba(16, 185, 129, 0.32)' : '1px solid var(--ms-modern-panel-border)',
        background: isStarted ? 'rgba(16, 185, 129, 0.12)' : 'var(--ms-modern-panel-surface)',
        color: isStarted ? '#10b981' : 'var(--ms-modern-text-secondary)',
        textAlign: 'center',
        fontSize: '0.86rem',
        fontWeight: 600,
      } as CSSProperties,
    }, isStarted ? 'Whiteboard is active' : 'Select participants who can use the whiteboard'),
    h('div', {
      style: {
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        display: 'grid',
        gap: '10px',
        padding: '0 22px 16px',
      } as CSSProperties,
    }, participantRows.length > 0 ? participantRows : [emptyState]),
    h('div', {
      style: {
        display: 'flex',
        gap: '10px',
        padding: '16px 22px 22px',
        borderTop: '1px solid var(--ms-modern-panel-border)',
      } as CSSProperties,
    }, isStarted
      ? [
          h('button', {
            type: 'button',
            disabled: isLoading.value,
            style: { ...controlButtonStyle, flex: 1 } as CSSProperties,
            onClick: handleEmbeddedStart,
          }, [
            h(FontAwesomeIcon, { icon: isLoading.value ? faSpinner : faSyncAlt, spin: isLoading.value, style: { marginRight: '8px' } }),
            isLoading.value ? 'Updating...' : 'Update',
          ]),
          h('button', {
            type: 'button',
            disabled: isLoading.value,
            style: {
              ...controlButtonStyle,
              flex: 1,
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            } as CSSProperties,
            onClick: handleEmbeddedStop,
          }, [
            h(FontAwesomeIcon, { icon: isLoading.value ? faSpinner : faStop, spin: isLoading.value, style: { marginRight: '8px' } }),
            isLoading.value ? 'Stopping...' : 'Stop',
          ]),
        ]
      : [
          h('button', {
            type: 'button',
            disabled: isLoading.value,
            style: { ...controlButtonStyle, width: '100%' } as CSSProperties,
            onClick: handleEmbeddedStart,
          }, [
            h(FontAwesomeIcon, { icon: isLoading.value ? faSpinner : faPlay, spin: isLoading.value, style: { marginRight: '8px' } }),
            isLoading.value ? 'Starting...' : 'Start Whiteboard',
          ]),
        ]),
  ]);
};

const embeddedContentNode = computed<VNodeChild>(() =>
  h(
    'div',
    {
      ...(mergedProps.value.overlayProps ?? {}),
    },
    [
      h(
        'div',
        {
          ...(mergedProps.value.contentProps ?? {}),
        },
        [renderEmbeddedWhiteboardBody()],
      ),
    ],
  ),
);

const modalBodyNode = computed<VNodeChild>(() => renderEmbeddedWhiteboardBody());

const defaultContentProps = computed<HTMLAttributes>(() => ({
  style: {
    background: panelGradientBackground,
    border: '1px solid var(--ms-modern-panel-border)',
    borderRadius: '28px',
    boxShadow: 'var(--ms-modern-shadow-elevated)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    overflow: 'hidden',
    color: 'var(--ms-modern-text-primary)',
  },
}));

const embeddedOverlayProps = computed<HTMLAttributes>(() => ({
  style: {
    position: 'static',
    top: 'auto',
    right: 'auto',
    bottom: 'auto',
    left: 'auto',
    width: '100%',
    height: '100%',
    minHeight: 0,
    backgroundColor: 'transparent',
    display: 'block',
    zIndex: 'auto',
  },
}));

const embeddedContentProps = computed<HTMLAttributes>(() => ({
  style: {
    position: 'relative',
    top: 'auto',
    right: 'auto',
    bottom: 'auto',
    left: 'auto',
    width: '100%',
    maxWidth: 'none',
    maxHeight: 'none',
    height: '100%',
    margin: 0,
    padding: 0,
    background: panelGradientBackground,
    border: '1px solid var(--ms-modern-panel-border)',
    borderRadius: '24px',
    boxShadow: 'var(--ms-modern-shadow-elevated)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    overflow: 'hidden',
    color: 'var(--ms-modern-text-primary)',
    boxSizing: 'border-box',
  },
}));

const defaultHeaderProps: HTMLAttributes = {
  style: {
    padding: '20px 22px 16px',
    borderBottom: '1px solid var(--ms-modern-panel-border)',
    background: panelGradientBackground,
  },
};

const defaultTitleProps: HTMLAttributes = {
  style: {
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '0.01em',
  },
};

const defaultCloseButtonProps: ButtonHTMLAttributes = {
  style: {
    width: '38px',
    height: '38px',
    borderRadius: '9999px',
    border: '1px solid var(--ms-modern-panel-border)',
    background: 'var(--ms-modern-field-background)',
    color: 'var(--ms-modern-text-primary)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    cursor: 'pointer',
  },
};

const defaultDividerProps: HTMLAttributes = {
  style: {
    borderColor: 'var(--ms-modern-panel-border)',
  },
};

const defaultBodyProps: HTMLAttributes = {
  style: {
    padding: '0 22px 22px',
    display: 'grid',
    gap: '14px',
  },
};

const defaultListShellProps: HTMLAttributes = {
  style: {
    padding: '14px',
    borderRadius: '20px',
    border: '1px solid var(--ms-modern-panel-border)',
    background: 'var(--ms-modern-panel-surface)',
  },
};

const defaultListTitleProps: HTMLAttributes = {
  style: {
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontSize: '0.86rem',
    fontWeight: 700,
    marginBottom: '10px',
  },
};

const defaultItemProps: LiHTMLAttributes = {
  style: {
    padding: '10px 0',
    borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
  },
};

const defaultPrimaryButtonProps: ButtonHTMLAttributes = {
  style: {
    minHeight: '44px',
    borderRadius: '9999px',
    border: 'none',
    paddingInline: '16px',
    background:
      'linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 55%, var(--ms-modern-accent) 100%)',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontWeight: 700,
    boxShadow: 'var(--ms-modern-shadow-soft)',
    cursor: 'pointer',
  },
};

const defaultSecondaryButtonProps: ButtonHTMLAttributes = {
  style: {
    minHeight: '44px',
    borderRadius: '9999px',
    border: '1px solid var(--ms-modern-panel-border)',
    paddingInline: '16px',
    background: 'var(--ms-modern-field-background)',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

const mergedProps = computed(() => ({
  ...props,
  isVisible: isEmbedded.value ? true : props.isVisible,
  backgroundColor: props.backgroundColor ?? 'var(--ms-modern-panel-surface-elevated)',
  overlayProps: mergeAttrObjects(
    isEmbedded.value ? embeddedOverlayProps.value : { style: { backgroundColor: 'transparent' } },
    props.overlayProps,
  ),
  contentProps: mergeAttrObjects(
    isEmbedded.value ? embeddedContentProps.value : defaultContentProps.value,
    props.contentProps,
  ),
  headerProps: mergeAttrObjects(defaultHeaderProps, props.headerProps),
  titleProps: mergeAttrObjects(defaultTitleProps, props.titleProps),
  closeButtonProps: mergeAttrObjects(defaultCloseButtonProps, props.closeButtonProps),
  headerDividerProps: mergeAttrObjects(defaultDividerProps, props.headerDividerProps),
  bodyProps: mergeAttrObjects(defaultBodyProps, props.bodyProps),
  renderBody: props.renderBody,
  listsWrapperProps: mergeAttrObjects({ style: { display: 'grid', gap: '14px' } }, props.listsWrapperProps),
  assignedSectionProps: mergeAttrObjects(defaultListShellProps, props.assignedSectionProps),
  pendingSectionProps: mergeAttrObjects(defaultListShellProps, props.pendingSectionProps),
  assignedTitleProps: mergeAttrObjects(defaultListTitleProps, props.assignedTitleProps),
  pendingTitleProps: mergeAttrObjects(defaultListTitleProps, props.pendingTitleProps),
  assignedListProps: mergeAttrObjects({ style: { display: 'grid', gap: '8px' } }, props.assignedListProps),
  pendingListProps: mergeAttrObjects({ style: { display: 'grid', gap: '8px' } }, props.pendingListProps),
  assignedItemProps: mergeAttrObjects(defaultItemProps, props.assignedItemProps),
  pendingItemProps: mergeAttrObjects(defaultItemProps, props.pendingItemProps),
  assignedActionButtonProps: mergeAttrObjects(defaultSecondaryButtonProps, props.assignedActionButtonProps),
  pendingActionButtonProps: mergeAttrObjects(defaultPrimaryButtonProps, props.pendingActionButtonProps),
  footerProps: mergeAttrObjects({ style: { paddingTop: '6px' } }, props.footerProps),
  saveButtonProps: mergeAttrObjects(defaultPrimaryButtonProps, props.saveButtonProps),
  actionsWrapperProps: mergeAttrObjects(
    { style: { display: 'flex', gap: '12px', justifyContent: 'flex-end' } },
    props.actionsWrapperProps,
  ),
  startButtonProps: mergeAttrObjects(defaultPrimaryButtonProps, props.startButtonProps),
  updateButtonProps: mergeAttrObjects(defaultSecondaryButtonProps, props.updateButtonProps),
  stopButtonProps: mergeAttrObjects(defaultSecondaryButtonProps, props.stopButtonProps),
  sectionDividerProps: mergeAttrObjects(defaultDividerProps, props.sectionDividerProps),
}));

const modalOverlayProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(
    {
      class: 'ms-modern-whiteboard-dialog__overlay',
      style: {
        position: 'fixed',
        inset: 0,
        display: 'block',
        background: 'var(--ms-modern-overlay-backdrop)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 999,
      },
    },
    props.overlayProps,
  ),
);

const modalPositionStyles = computed(() => {
  const position = props.position ?? 'topRight';
  return {
    top: position.includes('top') ? '16px' : 'auto',
    bottom: position.includes('bottom') ? '16px' : 'auto',
    left: position.includes('Left') ? '16px' : 'auto',
    right: position.includes('Right') ? '16px' : 'auto',
  };
});

const modalContentProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(
    {
      class: 'ms-modern-whiteboard-dialog__panel',
      style: {
        position: 'fixed',
        width: 'min(420px, calc(100vw - 32px))',
        maxHeight: 'min(550px, calc(100vh - 32px))',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '28px',
        border: '1px solid var(--ms-modern-panel-border)',
        background: panelGradientBackground,
        boxShadow: 'var(--ms-modern-shadow-elevated)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        color: 'var(--ms-modern-text-primary)',
        ...modalPositionStyles.value,
      },
    },
    mergedProps.value.contentProps,
  ),
);
</script>