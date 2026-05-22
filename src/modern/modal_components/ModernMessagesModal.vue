<template>
  <ClassicMessagesModal v-bind="mergedProps">
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
  </ClassicMessagesModal>
</template>

<script setup lang="ts">
import { computed, h, ref, useSlots, watch, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type VNodeChild } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faComments,
  faPaperPlane,
  faTimes,
  faUser,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import ClassicMessagesModal from '../../components/messageComponents/MessagesModal.vue';
import type { MessagesModalProps } from '../../components/messageComponents/MessagesModal.vue';
import type { Message } from '../../SharedTypes';
import { mergeAttrObjects } from '../display_components/styleUtils';
import { sendMessage } from '../../services/sendMessage';

type ModernMessagesRenderMode = 'modal' | 'sidebar' | 'inline';

export interface ModernMessagesModalProps extends MessagesModalProps {
  renderMode?: ModernMessagesRenderMode;
}

const props = defineProps<ModernMessagesModalProps>();
const slots = useSlots();
const isEmbedded = computed(() => props.renderMode === 'sidebar' || props.renderMode === 'inline');

const panelGradientBackground =
  'linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-panel-surface) 100%)';

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

const defaultTabListProps: HTMLAttributes = {
  style: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '8px',
    padding: '4px',
    borderRadius: '9999px',
    background: 'var(--ms-modern-field-background)',
    border: '1px solid var(--ms-modern-panel-border)',
    marginBottom: '16px',
  },
};

const defaultTabButtonProps: ButtonHTMLAttributes = {
  style: {
    border: '1px solid transparent',
    borderRadius: '9999px',
    background: 'transparent',
    color: 'var(--ms-modern-text-secondary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 180ms ease, color 180ms ease, border-color 180ms ease',
  },
};

const defaultCloseButtonProps: ButtonHTMLAttributes = {
  style: {
    width: '38px',
    height: '38px',
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

const defaultPanelProps: HTMLAttributes = {
  style: {
    flex: 1,
    minHeight: 0,
    padding: '16px',
    borderRadius: '20px',
    border: '1px solid var(--ms-modern-panel-border)',
    background: 'var(--ms-modern-panel-surface)',
  },
};

const enableDirectTab = computed(() => props.eventType === 'webinar' || props.eventType === 'conference');
const activeEmbeddedTab = ref<'direct' | 'group'>(props.startDirectMessage && enableDirectTab.value ? 'direct' : 'group');
const directMessageText = ref('');
const groupMessageText = ref('');

watch(
  () => props.startDirectMessage,
  (startDirectMessage) => {
    if (startDirectMessage && enableDirectTab.value) {
      activeEmbeddedTab.value = 'direct';
      return;
    }

    activeEmbeddedTab.value = 'group';
  },
  { immediate: true },
);

watch(enableDirectTab, (directEnabled) => {
  if (!directEnabled) {
    activeEmbeddedTab.value = 'group';
  }
});

const directMessages = computed(() => {
  const memberName = props.member;
  const isHost = props.islevel === '2';
  const hasChatModerationPrivilege = (props.coHostResponsibility ?? []).some(
    (item) => item.name === 'chat' && item.value === true,
  );
  const isChatModerator = props.coHost === memberName && hasChatModerationPrivilege;

  return props.messages.filter((message) => {
    if (message.group) {
      return false;
    }

    const receivers = Array.isArray(message.receivers) ? message.receivers : [];
    const participantInvolved = message.sender === memberName || receivers.includes(memberName);
    return participantInvolved || isHost || isChatModerator;
  });
});

const groupMessages = computed(() => props.messages.filter((message) => message.group));

const visibleMessages = computed(() => (
  activeEmbeddedTab.value === 'direct' ? directMessages.value : groupMessages.value
));

const currentComposerValue = computed(() => (
  activeEmbeddedTab.value === 'direct' ? directMessageText.value : groupMessageText.value
));

const canSendMessage = computed(() => {
  if (!currentComposerValue.value.trim()) {
    return false;
  }

  if (activeEmbeddedTab.value === 'direct') {
    return Boolean(props.directMessageDetails?.name);
  }

  return true;
});

const resolvedCloseIconComponent = computed<VNodeChild>(() => {
  const closeIcon = props.closeIconComponent as unknown;
  return closeIcon === false || closeIcon == null
    ? h(FontAwesomeIcon, {
        icon: faTimes,
        style: {
          color: 'var(--ms-modern-text-primary)',
          fontSize: '1rem',
        } satisfies CSSProperties,
      })
    : props.closeIconComponent;
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
const resolvedTabListProps = computed(() => mergeAttrObjects(defaultTabListProps, props.tabListProps));
const resolvedTabButtonProps = computed(() => mergeAttrObjects(defaultTabButtonProps, props.tabButtonProps));
const resolvedCloseButtonProps = computed(() => mergeAttrObjects(defaultCloseButtonProps, props.closeButtonProps));
const resolvedBodyProps = computed(() => mergeAttrObjects(defaultBodyProps, props.bodyProps));
const resolvedDirectPanelProps = computed(() => mergeAttrObjects(defaultPanelProps, props.directPanelWrapperProps));
const resolvedGroupPanelProps = computed(() => mergeAttrObjects(defaultPanelProps, props.groupPanelWrapperProps));

const invokeHandler = (value: unknown, event: Event | MouseEvent) => {
  if (typeof value === 'function') {
    (value as (event: Event | MouseEvent) => void)(event);
  }
};

const handleClose = (event: MouseEvent) => {
  invokeHandler(resolvedCloseButtonProps.value.onClick, event);
  if (!event.defaultPrevented) {
    props.onMessagesClose();
  }
};

const setComposerValue = (value: string) => {
  if (activeEmbeddedTab.value === 'direct') {
    directMessageText.value = value;
    return;
  }

  groupMessageText.value = value;
};

const handleComposerInput = (event: Event) => {
  const target = event.target as HTMLInputElement | null;
  setComposerValue(target?.value ?? '');
};

const handleSendMessage = async () => {
  if (!canSendMessage.value) {
    return;
  }

  const sendHandler = props.onSendMessagePress ?? sendMessage;
  const message = currentComposerValue.value.trim();

  await sendHandler({
    message,
    receivers: activeEmbeddedTab.value === 'direct' && props.directMessageDetails?.name
      ? [props.directMessageDetails.name]
      : [],
    group: activeEmbeddedTab.value === 'group',
    messagesLength: props.messages.length,
    member: props.member,
    sender: props.member,
    islevel: props.islevel,
    showAlert: props.showAlert,
    coHostResponsibility: props.coHostResponsibility,
    coHost: props.coHost,
    roomName: props.roomName,
    socket: props.socket,
    chatSetting: props.chatSetting,
  });

  setComposerValue('');
};

const resolveEmptyState = () => {
  if (typeof props.emptyState === 'function') {
    const resolvedEmptyState = props.emptyState({ type: activeEmbeddedTab.value });
    if (resolvedEmptyState !== false && resolvedEmptyState != null && resolvedEmptyState !== '') {
      return resolvedEmptyState;
    }
  } else if (props.emptyState !== false && props.emptyState != null && props.emptyState !== '') {
    return props.emptyState;
  }

  return activeEmbeddedTab.value === 'direct'
    ? 'No direct messages yet.'
    : 'No group messages yet.';
};

const renderEmbeddedTabButton = (
  tab: 'direct' | 'group',
  label: string,
  icon: typeof faUser,
  count: number,
) => {
  const isActive = activeEmbeddedTab.value === tab;

  return h('button', {
    ...resolvedTabButtonProps.value,
    type: 'button',
    onClick: () => {
      activeEmbeddedTab.value = tab;
    },
    style: {
      ...((resolvedTabButtonProps.value.style as CSSProperties | undefined) ?? {}),
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      minHeight: '38px',
      background: isActive ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
      borderColor: isActive ? 'rgba(59, 130, 246, 0.18)' : 'transparent',
      color: isActive ? 'var(--ms-modern-brand-primary)' : 'var(--ms-modern-text-secondary)',
    } satisfies CSSProperties,
  }, [
    h(FontAwesomeIcon, { icon }),
    h('span', label),
    h('span', {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '20px',
        minHeight: '20px',
        padding: '0 6px',
        borderRadius: '999px',
        background: isActive ? 'var(--ms-modern-brand-primary)' : 'rgba(148, 163, 184, 0.18)',
        color: isActive ? '#fff' : 'var(--ms-modern-text-secondary)',
        fontSize: '0.72rem',
        fontWeight: 700,
      } satisfies CSSProperties,
    }, String(count)),
  ]);
};

const renderEmbeddedMessage = (message: Message) => h('article', {
  key: `${message.timestamp}-${message.sender}-${message.message}`,
  style: {
    display: 'grid',
    gap: '6px',
    padding: '12px 14px',
    borderRadius: '16px',
    background: 'var(--ms-modern-field-background)',
    border: '1px solid var(--ms-modern-panel-border)',
  } satisfies CSSProperties,
}, [
  h('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '8px',
      color: 'var(--ms-modern-text-secondary)',
      fontSize: '0.74rem',
      fontFamily: 'var(--ms-modern-font-family)',
    } satisfies CSSProperties,
  }, [
    h('span', message.timestamp),
    activeEmbeddedTab.value === 'direct'
      ? h('span', message.sender)
      : null,
  ]),
  h('p', {
    style: {
      margin: 0,
      color: 'var(--ms-modern-text-primary)',
      fontFamily: 'var(--ms-modern-font-family)',
      fontSize: '0.9rem',
      lineHeight: 1.5,
    } satisfies CSSProperties,
  }, message.message),
]);

const renderEmbeddedContent = (_options: { defaultContent: VNodeChild; activeTab: 'direct' | 'group' }) => {
  const targetLabel = activeEmbeddedTab.value === 'direct' && props.directMessageDetails?.name
    ? `Message ${props.directMessageDetails.name} directly`
    : 'Send a message to everyone';
  const panelProps = activeEmbeddedTab.value === 'direct'
    ? resolvedDirectPanelProps.value
    : resolvedGroupPanelProps.value;

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
        }, [h(FontAwesomeIcon, { icon: faComments })]),
        h('h2', {
          ...resolvedTitleProps.value,
          style: {
            ...((resolvedTitleProps.value.style as CSSProperties | undefined) ?? {}),
            margin: 0,
          } satisfies CSSProperties,
        }, props.title === false || props.title == null ? 'Messages' : props.title),
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
        ...resolvedTabListProps.value,
      }, [
        enableDirectTab.value
          ? renderEmbeddedTabButton('direct', 'Direct', faUser, directMessages.value.length)
          : null,
        renderEmbeddedTabButton('group', 'Group', faUsers, groupMessages.value.length),
      ]),
      h('div', {
        ...panelProps,
        style: {
          ...((panelProps.style as CSSProperties | undefined) ?? {}),
          overflowY: 'auto',
          display: 'grid',
          gap: '10px',
        } satisfies CSSProperties,
      }, visibleMessages.value.length > 0
        ? visibleMessages.value.map((message) => renderEmbeddedMessage(message))
        : [
            h('div', {
              style: {
                padding: '20px',
                borderRadius: '16px',
                border: '1px dashed var(--ms-modern-panel-border)',
                color: 'var(--ms-modern-text-secondary)',
                textAlign: 'center',
                fontFamily: 'var(--ms-modern-font-family)',
                fontSize: '0.86rem',
              } satisfies CSSProperties,
            }, resolveEmptyState() ?? ''),
          ]),
      h('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
        } satisfies CSSProperties,
      }, [
        h('input', {
          value: currentComposerValue.value,
          type: 'text',
          placeholder: targetLabel,
          onInput: handleComposerInput,
          style: {
            flex: 1,
            minHeight: '42px',
            padding: '0 14px',
            borderRadius: '14px',
            border: '1px solid var(--ms-modern-field-border)',
            background: 'var(--ms-modern-field-background)',
            color: 'var(--ms-modern-text-primary)',
            fontFamily: 'var(--ms-modern-font-family)',
            fontSize: '0.9rem',
          } satisfies CSSProperties,
        }),
        h('button', {
          type: 'button',
          'aria-label': 'Send message',
          title: 'Send message',
          disabled: !canSendMessage.value,
          onClick: () => void handleSendMessage(),
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            minWidth: '44px',
            minHeight: '40px',
            padding: 0,
            borderRadius: '14px',
            border: '1px solid transparent',
            background: canSendMessage.value ? 'var(--ms-modern-brand-primary)' : 'rgba(148, 163, 184, 0.18)',
            color: canSendMessage.value ? '#fff' : 'var(--ms-modern-text-secondary)',
            cursor: canSendMessage.value ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--ms-modern-font-family)',
            fontSize: '0.84rem',
            fontWeight: 600,
          } satisfies CSSProperties,
        }, [
          h(FontAwesomeIcon, { icon: faPaperPlane }),
        ]),
      ]),
    ]),
  ]);
};

const mergedProps = computed(() => ({
  ...props,
  isMessagesModalVisible: isEmbedded.value ? true : props.isMessagesModalVisible,
  backgroundColor: isEmbedded.value
    ? 'transparent'
    : (props.backgroundColor ?? 'var(--ms-modern-panel-surface-elevated)'),
  activeTabBackgroundColor: props.activeTabBackgroundColor ?? 'var(--ms-modern-accent)',
  overlayProps: resolvedOverlayProps.value,
  contentProps: resolvedContentProps.value,
  headerProps: resolvedHeaderProps.value,
  titleProps: resolvedTitleProps.value,
  tabListProps: resolvedTabListProps.value,
  tabButtonProps: resolvedTabButtonProps.value,
  closeButtonProps: resolvedCloseButtonProps.value,
  closeIconComponent: resolvedCloseIconComponent.value,
  bodyProps: resolvedBodyProps.value,
  directPanelWrapperProps: resolvedDirectPanelProps.value,
  groupPanelWrapperProps: resolvedGroupPanelProps.value,
  renderContent: isEmbedded.value ? (props.renderContent ?? renderEmbeddedContent) : props.renderContent,
}));
</script>

<style scoped>
:deep(.modal-body) {
  min-height: 0;
}

:deep(.btn-close-messages) {
  width: 38px;
  height: 38px;
  border: 1px solid var(--ms-modern-panel-border-strong) !important;
  border-radius: 999px !important;
  background: linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-field-background) 100%) !important;
  color: var(--ms-modern-text-primary) !important;
  box-shadow: var(--ms-modern-shadow-soft);
}

:deep(.btn-close-messages svg) {
  color: var(--ms-modern-text-primary) !important;
}

:deep(.tab-button) {
  min-height: 40px;
  color: var(--ms-modern-text-secondary) !important;
}

:deep(.tab-button-direct),
:deep(.tab-button-group) {
  border-radius: 999px !important;
}

:deep(.panels-wrapper) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

:deep(.direct-panel-wrapper),
:deep(.group-panel-wrapper) {
  flex: 1;
  min-height: 0;
}
</style>