<template>
  <ClassicParticipantsModal v-bind="mergedProps">
    <template
      v-for="(_, slotName) in slots"
      :key="slotName"
      #[slotName]="slotProps"
    >
      <slot
        :name="slotName"
        v-bind="slotProps ?? {}"
      />
    </template>
  </ClassicParticipantsModal>
</template>

<script setup lang="ts">
import {
  computed,
  h,
  ref,
  useSlots,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type VNodeChild,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faComment,
  faCrown,
  faMicrophone,
  faMicrophoneSlash,
  faSearch,
  faTimes,
  faUserMinus,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import ClassicParticipantsModal from '../../components/participantsComponents/ParticipantsModal.vue';
import type { ParticipantsModalProps } from '../../components/participantsComponents/ParticipantsModal.vue';
import type { Participant } from '../../SharedTypes';
import { mergeAttrObjects } from '../display_components/styleUtils';
import ModernTooltip from '../primitives/ModernTooltip.vue';
import {
  messageParticipants,
  muteParticipants,
  removeParticipants,
} from 'mediasfu-shared';

type ModernParticipantsRenderMode = 'modal' | 'sidebar' | 'inline';

export interface ModernParticipantsModalProps extends ParticipantsModalProps {
  renderMode?: ModernParticipantsRenderMode;
}

const props = defineProps<ModernParticipantsModalProps>();
const slots = useSlots();
const isEmbedded = computed(() => props.renderMode === 'sidebar' || props.renderMode === 'inline');

const panelGradientBackground =
  'linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-panel-surface) 100%)';

const defaultContentProps = computed<HTMLAttributes>(() => ({
  class: 'ms-modern-participants-modal__content',
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
  class: 'ms-modern-participants-modal__content ms-modern-participants-modal__content--embedded',
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
    minWidth: 0,
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

const defaultBadgeWrapperProps: HTMLAttributes = {
  style: {
    padding: '3px',
    borderRadius: '9999px',
    background:
      'linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 55%, var(--ms-modern-accent) 100%)',
    boxShadow: 'var(--ms-modern-shadow-soft)',
  },
};

const defaultBadgeProps: HTMLAttributes = {
  style: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '36px',
    minHeight: '32px',
    paddingInline: '12px',
    borderRadius: '9999px',
    border: '1px solid var(--ms-modern-panel-border)',
    background: 'var(--ms-modern-field-background)',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontSize: '0.8rem',
    fontWeight: 700,
  },
};

const defaultCloseButtonProps: ButtonHTMLAttributes = {
  style: {
    width: '38px',
    height: '38px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    lineHeight: 1,
    flexShrink: 0,
    borderRadius: '9999px',
    border: '1px solid var(--ms-modern-panel-border-strong)',
    background: 'linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-field-background) 100%)',
    color: 'var(--ms-modern-text-primary)',
    boxShadow: 'var(--ms-modern-shadow-soft)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    cursor: 'pointer',
  },
};

const defaultBodyProps: HTMLAttributes = {
  style: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '0 22px 22px',
    color: 'var(--ms-modern-text-secondary)',
  },
};

const defaultSearchWrapperProps: HTMLAttributes = {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    borderRadius: '18px',
    border: '1px solid var(--ms-modern-field-border)',
    background: 'var(--ms-modern-field-background)',
    marginBottom: '16px',
  },
};

const defaultSearchInputProps: InputHTMLAttributes = {
  style: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontSize: '0.95rem',
  },
};

const defaultListsWrapperProps: HTMLAttributes = {
  style: {
    flex: 1,
    minHeight: 0,
    display: 'grid',
    gap: '14px',
    overflowY: 'auto',
    paddingRight: '2px',
  },
};

const defaultListProps: HTMLAttributes = {
  style: {
    padding: '12px',
    borderRadius: '20px',
    border: '1px solid var(--ms-modern-panel-border)',
    background: 'var(--ms-modern-panel-surface)',
  },
};

const searchValue = ref('');

const currentParameters = computed(() => props.parameters?.getUpdatedAllParams?.() ?? props.parameters);

const allParticipants = computed<Participant[]>(() => currentParameters.value?.participants ?? []);

const participantPermission = computed(() =>
  (currentParameters.value?.coHostResponsibility ?? []).some(
    (item) => item.name === 'participants' && item.value,
  ),
);

const canModerateParticipants = computed(() => {
  const params = currentParameters.value;
  if (!params) {
    return false;
  }

  return (
    (allParticipants.value.length > 0 && params.islevel === '2')
    || (params.coHost === params.member && participantPermission.value)
  );
});

const visibleParticipants = computed<Participant[]>(() => {
  const trimmedQuery = searchValue.value.trim().toLowerCase();
  if (!trimmedQuery) {
    return allParticipants.value;
  }

  return allParticipants.value.filter((participant) =>
    participant.name?.toLowerCase().includes(trimmedQuery),
  );
});

const isBroadcastEvent = computed(() => currentParameters.value?.eventType === 'broadcast');

const isDarkModeValue = computed(() => {
  const params = currentParameters.value as { isDarkMode?: boolean; modernMenuDarkMode?: boolean } | undefined;
  return params?.isDarkMode ?? params?.modernMenuDarkMode ?? true;
});

const resolvedOverlayProps = computed(() =>
  mergeAttrObjects(
    isEmbedded.value ? embeddedOverlayProps.value : { style: { backgroundColor: 'transparent' } },
    props.overlayProps,
  ),
);

const resolvedContentProps = computed(() =>
  mergeAttrObjects(
    isEmbedded.value ? embeddedContentProps.value : defaultContentProps.value,
    props.contentProps,
  ),
);

const resolvedHeaderProps = computed(() => mergeAttrObjects(defaultHeaderProps, props.headerProps));
const resolvedTitleProps = computed(() => mergeAttrObjects(defaultTitleProps, props.titleProps));
const resolvedBadgeWrapperProps = computed(() => mergeAttrObjects(defaultBadgeWrapperProps, props.badgeWrapperProps));
const resolvedBadgeProps = computed(() => mergeAttrObjects(defaultBadgeProps, props.badgeProps));
const resolvedCloseButtonProps = computed(() => mergeAttrObjects(defaultCloseButtonProps, props.closeButtonProps));
const resolvedBodyProps = computed(() => mergeAttrObjects(defaultBodyProps, props.bodyProps));
const resolvedSearchWrapperProps = computed(() => mergeAttrObjects(defaultSearchWrapperProps, props.searchWrapperProps));
const resolvedSearchInputProps = computed(() => mergeAttrObjects(defaultSearchInputProps, props.searchInputProps));
const resolvedListsWrapperProps = computed(() => mergeAttrObjects(defaultListsWrapperProps, props.listsWrapperProps));

const resolvedCloseIconComponent = computed<VNodeChild>(() => {
  const closeIcon = props.closeIconComponent as unknown;
  return closeIcon === false || closeIcon == null
    ? h(FontAwesomeIcon, {
        icon: faTimes,
        style: {
          display: 'block',
          color: 'var(--ms-modern-text-primary)',
          fontSize: '1rem',
          lineHeight: 1,
        } satisfies CSSProperties,
      })
    : props.closeIconComponent;
});

const getParticipantInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || '?';

const isHostParticipant = (participant: Participant) =>
  participant.islevel === '2' || participant.isHost === true || participant.isAdmin === true;

const isCurrentMember = (participant: Participant) => participant.name === currentParameters.value?.member;

const canShowRowActions = (participant: Participant) =>
  canModerateParticipants.value && !isHostParticipant(participant) && !isCurrentMember(participant);

const canShowMuteAction = (participant: Participant) =>
  canShowRowActions(participant) && !isBroadcastEvent.value;

const canShowMessageAction = (participant: Participant) =>
  canShowRowActions(participant) && !isBroadcastEvent.value;

const canShowRemoveAction = (participant: Participant) => canShowRowActions(participant);

const canShowMuteStatusIndicator = (participant: Participant) =>
  !isBroadcastEvent.value && !isHostParticipant(participant);

const resolveMutedLabel = (participant: Participant) =>
  participant.muted ? 'Already muted' : 'Mute';

const resolveStatusText = (participant: Participant) => {
  if (isHostParticipant(participant)) {
    return 'Host';
  }

  return participant.muted ? 'Muted' : 'Live audio';
};

const shouldShowStatusText = (participant: Participant) =>
  !isBroadcastEvent.value || isHostParticipant(participant);

const invokeHandler = (value: unknown, event: Event | MouseEvent) => {
  if (typeof value === 'function') {
    (value as (event: Event | MouseEvent) => void)(event);
  }
};

const handleSearchInput = (event: Event) => {
  invokeHandler(resolvedSearchInputProps.value.onInput, event);
  const target = event.target as HTMLInputElement | null;
  const nextValue = target?.value ?? '';
  searchValue.value = nextValue;
  props.onParticipantsFilterChange(nextValue);
};

const handleClose = (event: MouseEvent) => {
  invokeHandler(resolvedCloseButtonProps.value.onClick, event);
  if (!event.defaultPrevented) {
    props.onParticipantsClose();
  }
};

const handleMuteParticipant = async (participant: Participant) => {
  if (!canShowRowActions(participant) || participant.muted) {
    return;
  }

  const params = currentParameters.value;
  if (!params?.socket) {
    return;
  }

  const muteHandler = props.onMuteParticipants ?? muteParticipants;
  await muteHandler({
    socket: params.socket,
    coHostResponsibility: params.coHostResponsibility ?? [],
    participant,
    member: params.member,
    islevel: params.islevel,
    showAlert: params.showAlert,
    coHost: params.coHost,
    roomName: params.roomName,
  });
};

const handleMessageParticipant = async (participant: Participant) => {
  if (!canShowRowActions(participant)) {
    return;
  }

  const params = currentParameters.value;
  if (!params) {
    return;
  }

  const messageHandler = props.onMessageParticipants ?? messageParticipants;
  await messageHandler({
    coHostResponsibility: params.coHostResponsibility ?? [],
    participant,
    member: params.member,
    islevel: params.islevel,
    showAlert: params.showAlert,
    coHost: params.coHost,
    updateIsMessagesModalVisible: params.updateIsMessagesModalVisible,
    updateDirectMessageDetails: params.updateDirectMessageDetails,
    updateStartDirectMessage: params.updateStartDirectMessage,
  });
};

const handleRemoveParticipant = async (participant: Participant) => {
  if (!canShowRowActions(participant)) {
    return;
  }

  const params = currentParameters.value;
  if (!params?.socket) {
    return;
  }

  const removeHandler = props.onRemoveParticipants ?? removeParticipants;
  await removeHandler({
    coHostResponsibility: params.coHostResponsibility ?? [],
    participant,
    member: params.member,
    islevel: params.islevel,
    showAlert: params.showAlert,
    coHost: params.coHost,
    participants: allParticipants.value,
    socket: params.socket,
    roomName: params.roomName,
    updateParticipants: params.updateParticipants,
  });
};

const renderEmbeddedActionButton = (
  label: string,
  icon: typeof faMicrophone,
  onClick: () => void,
  disabled: boolean,
  tone: 'primary' | 'danger' | 'muted' = 'primary',
) => {
  const backgroundColor = tone === 'danger'
    ? 'rgba(239, 68, 68, 0.12)'
    : tone === 'muted'
      ? 'rgba(148, 163, 184, 0.16)'
      : 'rgba(59, 130, 246, 0.12)';
  const borderColor = tone === 'danger'
    ? 'rgba(239, 68, 68, 0.28)'
    : tone === 'muted'
      ? 'rgba(148, 163, 184, 0.22)'
      : 'rgba(59, 130, 246, 0.2)';
  const textColor = tone === 'danger'
    ? '#ef4444'
    : tone === 'muted'
      ? 'var(--ms-modern-text-secondary)'
      : 'var(--ms-modern-text-primary)';

  return h(ModernTooltip, {
    message: label,
    isDarkMode: isDarkModeValue.value,
    position: 'top',
    usePortal: true,
  }, {
    default: () => h('button', {
      type: 'button',
      'aria-label': label,
      title: label,
      disabled,
      onClick,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '34px',
        height: '34px',
        minWidth: '34px',
        borderRadius: '999px',
        border: `1px solid ${borderColor}`,
        background: backgroundColor,
        color: textColor,
        fontFamily: 'var(--ms-modern-font-family)',
        fontSize: '0.84rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        flexShrink: 0,
      } satisfies CSSProperties,
    }, [
      h(FontAwesomeIcon, { icon }),
    ]),
  });
};

const renderMuteStatusIndicator = (participant: Participant) => h('span', {
  'aria-hidden': 'true',
  style: {
    width: '8px',
    height: '8px',
    borderRadius: '999px',
    background: participant.muted ? '#ef4444' : '#10b981',
    display: 'inline-block',
    flexShrink: 0,
  } satisfies CSSProperties,
});

const renderEmbeddedParticipantRow = (participant: Participant) => {
  const mutedActionDisabled = !canShowMuteAction(participant) || Boolean(participant.muted);
  const statusColor = isHostParticipant(participant)
    ? '#f59e0b'
    : participant.muted
      ? '#ef4444'
      : '#10b981';
  const actionNodes: VNodeChild[] = [];

  if (canShowMuteStatusIndicator(participant)) {
    actionNodes.push(renderMuteStatusIndicator(participant));
  }

  if (canShowMuteAction(participant)) {
    actionNodes.push(renderEmbeddedActionButton(
      participant.muted ? 'Already muted (cannot unmute remotely)' : 'Mute',
      participant.muted ? faMicrophoneSlash : faMicrophone,
      () => void handleMuteParticipant(participant),
      mutedActionDisabled,
      participant.muted ? 'muted' : 'primary',
    ));
  }

  if (canShowMessageAction(participant)) {
    actionNodes.push(renderEmbeddedActionButton(
      'Direct Message',
      faComment,
      () => void handleMessageParticipant(participant),
      false,
      'primary',
    ));
  }

  if (canShowRemoveAction(participant)) {
    actionNodes.push(renderEmbeddedActionButton(
      'Remove from room',
      faUserMinus,
      () => void handleRemoveParticipant(participant),
      false,
      'danger',
    ));
  }

  const hasActionNodes = actionNodes.length > 0;

  return h('article', {
    key: participant.id ?? participant.name,
    style: {
      display: 'grid',
      gridTemplateColumns: hasActionNodes ? 'minmax(0, 1fr) auto' : 'minmax(0, 1fr)',
      alignItems: 'center',
      gap: '12px',
      padding: '14px 16px',
      borderRadius: '18px',
      border: '1px solid var(--ms-modern-panel-border)',
      background: 'var(--ms-modern-panel-surface)',
    } satisfies CSSProperties,
  }, [
    h('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: 0,
      } satisfies CSSProperties,
    }, [
      h('div', {
        style: {
          width: '38px',
          height: '38px',
          borderRadius: '999px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(14, 165, 233, 0.18) 100%)',
          color: 'var(--ms-modern-text-primary)',
          fontFamily: 'var(--ms-modern-font-family)',
          fontWeight: 700,
          fontSize: '0.84rem',
          flexShrink: 0,
        } satisfies CSSProperties,
      }, getParticipantInitials(participant.name)),
      h('div', {
        style: {
          minWidth: 0,
          display: 'grid',
          gap: '4px',
        } satisfies CSSProperties,
      }, [
        h('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: 0,
          } satisfies CSSProperties,
        }, [
          h('strong', {
            style: {
              color: 'var(--ms-modern-text-primary)',
              fontFamily: 'var(--ms-modern-font-family)',
              fontSize: '0.92rem',
              overflowWrap: 'anywhere',
            } satisfies CSSProperties,
          }, isHostParticipant(participant) ? `${participant.name} (host)` : participant.name),
          isHostParticipant(participant)
            ? h(FontAwesomeIcon, {
                icon: faCrown,
                style: { color: '#f59e0b', fontSize: '0.82rem' },
              })
            : null,
        ]),
        shouldShowStatusText(participant)
          ? h('span', {
              style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--ms-modern-text-secondary)',
                fontFamily: 'var(--ms-modern-font-family)',
                fontSize: '0.76rem',
              } satisfies CSSProperties,
            }, [
              h('span', {
                style: {
                  width: '8px',
                  height: '8px',
                  borderRadius: '999px',
                  background: statusColor,
                  display: 'inline-block',
                  flexShrink: 0,
                } satisfies CSSProperties,
              }),
              resolveStatusText(participant),
            ])
          : null,
      ]),
    ]),
    hasActionNodes
      ? h('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
          } satisfies CSSProperties,
        }, actionNodes)
      : null,
  ]);
};

const renderEmbeddedEmptyState = () => {
  const fallbackEmptyState = typeof props.emptyState === 'function'
    ? props.emptyState({ counter: visibleParticipants.value.length })
    : (props.emptyState ?? 'No participants found.');

  return h('div', {
    class: 'empty-state',
    style: {
      padding: '24px 20px',
      borderRadius: '18px',
      border: '1px dashed var(--ms-modern-panel-border)',
      color: 'var(--ms-modern-text-secondary)',
      textAlign: 'center',
      fontFamily: 'var(--ms-modern-font-family)',
      fontSize: '0.86rem',
    } satisfies CSSProperties,
  }, fallbackEmptyState);
};

const renderEmbeddedContent = (_options: { defaultContent: VNodeChild; counter: number }) => {
  const count = visibleParticipants.value.length;

  return h('section', {
    ...resolvedContentProps.value,
  }, [
    h('div', {
      ...resolvedHeaderProps.value,
      style: {
        ...((resolvedHeaderProps.value.style as CSSProperties | undefined) ?? {}),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexShrink: 0,
      } satisfies CSSProperties,
    }, [
      h('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: 0,
        } satisfies CSSProperties,
      }, [
        h('div', {
          style: {
            width: '38px',
            height: '38px',
            borderRadius: '999px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(59, 130, 246, 0.12)',
            color: 'var(--ms-modern-brand-primary)',
            flexShrink: 0,
          } satisfies CSSProperties,
        }, [h(FontAwesomeIcon, { icon: faUsers })]),
        h('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: 0,
          } satisfies CSSProperties,
        }, [
          h('h2', {
            ...resolvedTitleProps.value,
            style: {
              ...((resolvedTitleProps.value.style as CSSProperties | undefined) ?? {}),
              margin: 0,
              minWidth: 0,
            } satisfies CSSProperties,
          }, props.title === false || props.title == null ? 'Participants' : props.title),
          h('div', {
            ...resolvedBadgeWrapperProps.value,
          }, [
            h('span', {
              ...resolvedBadgeProps.value,
            }, String(count)),
          ]),
        ]),
      ]),
      h('button', {
        ...resolvedCloseButtonProps.value,
        type: 'button',
        onClick: handleClose,
      }, [resolvedCloseIconComponent.value]),
    ]),
    h('div', {
      ...resolvedBodyProps.value,
      style: {
        ...((resolvedBodyProps.value.style as CSSProperties | undefined) ?? {}),
        overflow: 'hidden',
      } satisfies CSSProperties,
    }, [
      h('div', {
        ...resolvedSearchWrapperProps.value,
        style: {
          ...((resolvedSearchWrapperProps.value.style as CSSProperties | undefined) ?? {}),
          marginBottom: 0,
          justifyContent: 'flex-start',
          flexShrink: 0,
        } satisfies CSSProperties,
      }, [
        h('div', {
          style: {
            color: 'var(--ms-modern-text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          } satisfies CSSProperties,
        }, [h(FontAwesomeIcon, { icon: faSearch })]),
        h('input', {
          ...resolvedSearchInputProps.value,
          value: searchValue.value,
          type: 'text',
          placeholder: 'Search participants...',
          onInput: handleSearchInput,
          style: {
            ...((resolvedSearchInputProps.value.style as CSSProperties | undefined) ?? {}),
            width: '100%',
            maxWidth: 'none',
            border: 'none',
            padding: 0,
          } satisfies CSSProperties,
        }),
      ]),
      h('div', {
        ...resolvedListsWrapperProps.value,
        style: {
          ...((resolvedListsWrapperProps.value.style as CSSProperties | undefined) ?? {}),
          paddingRight: 0,
        } satisfies CSSProperties,
      }, visibleParticipants.value.length > 0
        ? visibleParticipants.value.map((participant) => renderEmbeddedParticipantRow(participant))
        : [renderEmbeddedEmptyState()]),
    ]),
  ]);
};

const mergedProps = computed(() => ({
  ...props,
  isParticipantsModalVisible: isEmbedded.value ? true : props.isParticipantsModalVisible,
  backgroundColor: props.backgroundColor ?? 'var(--ms-modern-panel-surface-elevated)',
  overlayProps: resolvedOverlayProps.value,
  contentProps: resolvedContentProps.value,
  headerProps: resolvedHeaderProps.value,
  titleProps: resolvedTitleProps.value,
  badgeWrapperProps: resolvedBadgeWrapperProps.value,
  badgeProps: resolvedBadgeProps.value,
  closeButtonProps: resolvedCloseButtonProps.value,
  closeIconComponent: resolvedCloseIconComponent.value,
  bodyProps: resolvedBodyProps.value,
  searchWrapperProps: resolvedSearchWrapperProps.value,
  searchInputProps: resolvedSearchInputProps.value,
  listsWrapperProps: resolvedListsWrapperProps.value,
  moderatorListProps: mergeAttrObjects(defaultListProps, props.moderatorListProps),
  attendeeListProps: mergeAttrObjects(defaultListProps, props.attendeeListProps),
  renderContent: isEmbedded.value ? (props.renderContent ?? renderEmbeddedContent) : props.renderContent,
}));
</script>

<style scoped>
:deep(.ms-modern-participants-modal__content--embedded .modal-body) {
  min-height: 0;
  padding: 16px !important;
  overflow: hidden;
}

:deep(.ms-modern-participants-modal__content--embedded .modal-header) {
  flex-shrink: 0;
}

:deep(.ms-modern-participants-modal__content--embedded .modal-title) {
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: 1rem;
  font-weight: 700;
}

:deep(.ms-modern-participants-modal__content--embedded .participants-counter) {
  background: linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 100%) !important;
  color: #fff !important;
  border-radius: 999px !important;
}

:deep(.ms-modern-participants-modal__content--embedded .btn-close-participants) {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 1;
  border: 1px solid var(--ms-modern-panel-border-strong) !important;
  border-radius: 999px !important;
  background: linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-field-background) 100%) !important;
  color: var(--ms-modern-text-primary) !important;
  box-shadow: var(--ms-modern-shadow-soft);
}

:deep(.ms-modern-participants-modal__content--embedded .btn-close-participants svg),
:deep(.btn-close-participants svg) {
  display: block;
  margin: auto;
  color: var(--ms-modern-text-primary) !important;
}

:deep(.ms-modern-participants-modal__content--embedded .search-wrapper) {
  flex-shrink: 0;
  margin-bottom: 0 !important;
}

:deep(.ms-modern-participants-modal__content--embedded .form-control) {
  width: 100% !important;
  max-width: none !important;
  border: 1px solid var(--ms-modern-field-border) !important;
  border-radius: 16px !important;
  background: var(--ms-modern-field-background) !important;
  color: var(--ms-modern-text-primary) !important;
  font-family: var(--ms-modern-font-family);
}

:deep(.ms-modern-participants-modal__content--embedded .lists-wrapper) {
  min-height: 0;
  overflow-y: auto;
  scrollbar-color: rgba(148, 163, 184, 0.36) transparent;
}

:deep(.ms-modern-participants-modal__content--embedded .lists-wrapper > div),
:deep(.ms-modern-participants-modal__content--embedded .lists-wrapper .container) {
  min-width: 0;
}

:deep(.ms-modern-participants-modal__content--embedded .container) {
  padding: 10px 12px;
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 16px;
  background: var(--ms-modern-panel-surface);
  color: var(--ms-modern-text-primary);
  box-sizing: border-box;
}

:deep(.ms-modern-participants-modal__content--embedded .nameText),
:deep(.ms-modern-participants-modal__content--embedded .name-text) {
  color: var(--ms-modern-text-primary) !important;
  font-family: var(--ms-modern-font-family);
  font-size: 0.94rem !important;
  overflow-wrap: anywhere;
}

:deep(.ms-modern-participants-modal__content--embedded .separator) {
  height: 1px;
  margin: 10px 0;
  border: 0;
  background: var(--ms-modern-panel-border);
}

:deep(.ms-modern-participants-modal__content--embedded .buttonContainer button) {
  width: 34px;
  height: 34px;
  border-radius: 999px !important;
}

:deep(.ms-modern-participants-modal__content--embedded .empty-state) {
  color: var(--ms-modern-text-secondary) !important;
}
</style>