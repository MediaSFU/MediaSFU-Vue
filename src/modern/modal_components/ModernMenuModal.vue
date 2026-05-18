<template>
  <ClassicMenuModal v-bind="mergedProps">
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
  </ClassicMenuModal>
</template>

<script setup lang="ts">
import { computed, h, useSlots, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type VNodeChild } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import ClassicMenuModal from '../../components/menuComponents/MenuModal.vue';
import type { MenuModalProps } from '../../components/menuComponents/MenuModal.vue';
import CustomButtons from '../../components/menuComponents/CustomButtons.vue';
import MeetingIdComponent from '../../components/menuComponents/MeetingIDComponent.vue';
import MeetingPasscodeComponent from '../../components/menuComponents/MeetingPasscodeComponent.vue';
import ShareButtonsComponent from '../../components/menuComponents/ShareButtonsComponent.vue';
import { mergeAttrObjects } from '../display_components/styleUtils';

type ModernMenuRenderMode = 'modal' | 'sidebar' | 'inline';

interface ModernMenuModalProps extends MenuModalProps {
  renderMode?: ModernMenuRenderMode;
  isDarkMode?: boolean;
  onToggleTheme?: (isDarkMode: boolean) => void;
}

const props = withDefaults(defineProps<ModernMenuModalProps>(), {
  renderMode: 'modal',
  shareButtons: true,
  isDarkMode: undefined,
  onToggleTheme: undefined,
});
const slots = useSlots();

const resolvedRenderMode = computed<ModernMenuRenderMode>(() => props.renderMode ?? 'modal');

const isEmbeddedMode = computed(() =>
  resolvedRenderMode.value === 'sidebar' || resolvedRenderMode.value === 'inline'
);

const contentModeClass = computed(() => `ms-modern-menu-modal__content--${resolvedRenderMode.value}`);

const panelGradientBackground =
  'linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-panel-surface) 100%)';

const defaultOverlayProps = computed<HTMLAttributes>(() => ({
  class: `ms-modern-menu-modal ms-modern-menu-modal--${resolvedRenderMode.value}`,
  style: isEmbeddedMode.value
    ? {
        position: 'relative',
        inset: 'auto',
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        zIndex: 'auto',
      } as CSSProperties
    : {
        backgroundColor: 'var(--ms-modern-overlay-scrim)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        display: props.isVisible ? 'flex' : 'none',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        padding: '16px',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        boxSizing: 'border-box',
      } as CSSProperties,
}));

const defaultContentProps = computed<HTMLAttributes>(() => ({
  class: `ms-modern-menu-modal__content ${contentModeClass.value}`,
  style: {
    position: 'relative',
    background: panelGradientBackground,
    border: '1px solid var(--ms-modern-panel-border)',
    borderRadius: '16px',
    boxShadow: 'var(--ms-modern-shadow-floating)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    overflow: 'hidden',
    color: 'var(--ms-modern-text-primary)',
    width: isEmbeddedMode.value ? '100%' : 'min(400px, calc(100vw - 32px))',
    height: isEmbeddedMode.value ? '100%' : 'min(calc(100dvh - 32px), 760px)',
    maxHeight: isEmbeddedMode.value ? '100%' : 'calc(100dvh - 32px)',
    top: 'auto',
    right: 'auto',
    bottom: 'auto',
    left: 'auto',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  } satisfies CSSProperties,
}));

const defaultHeaderProps: HTMLAttributes = {
  style: {
    padding: '20px 22px 16px',
    margin: 0,
    borderBottom: '1px solid var(--ms-modern-panel-border)',
    background: panelGradientBackground,
  },
};

const defaultTitleWrapperProps: HTMLAttributes = {
  style: {
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontWeight: 700,
    letterSpacing: '0.01em',
  },
};

const defaultBadgeWrapperProps: HTMLAttributes = {
  style: {
    borderRadius: '9999px',
    border: '1px solid var(--ms-modern-panel-border)',
    background: 'var(--ms-modern-field-background)',
    color: 'var(--ms-modern-text-secondary)',
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
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    minHeight: 0,
    overflow: 'hidden',
  },
};

const defaultScrollWrapperProps = computed<HTMLAttributes>(() => ({
  class: 'ms-modern-menu-modal__scroll',
  style: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    minHeight: 0,
    maxHeight: 'none',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    overscrollBehavior: 'contain',
    paddingRight: '3px',
  } satisfies CSSProperties,
}));

const defaultSectionProps: HTMLAttributes = {
  style: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: 0,
    borderRadius: 0,
    border: 'none',
    background: 'transparent',
  },
};

const withSectionClass = (sectionClass: string): HTMLAttributes =>
  mergeAttrObjects(defaultSectionProps, { class: sectionClass });

const renderThemeToggle = (): VNodeChild | null => {
  if (!props.onToggleTheme) {
    return null;
  }

  return h(
    'div',
    {
      class: 'ms-modern-menu-modal__theme-toggle',
    },
    [
      h('span', { class: 'ms-modern-menu-modal__theme-label' }, 'Theme'),
      h(
        'button',
        {
          type: 'button',
          class: 'ms-modern-menu-modal__theme-button',
          'aria-pressed': props.isDarkMode ?? true,
          onClick: () => props.onToggleTheme?.(!(props.isDarkMode ?? true)),
        },
        props.isDarkMode ?? true ? 'Dark' : 'Light',
      ),
    ],
  );
};

const renderActionsSection = () => {
  const visibleButtons = (props.customButtons ?? []).filter((button) => button.show !== false);
  if (visibleButtons.length === 0) {
    return null;
  }

  const defaultCustomButtons = h(CustomButtons, { buttons: props.customButtons });
  const actionsNode = props.renderCustomButtons
    ? props.renderCustomButtons({ defaultCustomButtons, buttons: props.customButtons })
    : defaultCustomButtons;

  return h('section', { class: 'ms-modern-menu-modal__actions-card' }, [
    h('p', { class: 'ms-modern-menu-modal__section-label' }, 'Actions'),
    actionsNode,
  ]);
};

const renderMeetingIdSection = () => {
  const defaultMeetingId = h(MeetingIdComponent, { meetingID: props.roomName });
  const meetingIdNode = props.renderMeetingId
    ? props.renderMeetingId({ defaultMeetingId, roomName: props.roomName })
    : defaultMeetingId;

  return h('section', { class: 'ms-modern-menu-modal__info-card' }, [meetingIdNode]);
};

const renderPasscodeSection = () => {
  const isHost = props.islevel === '2';
  if (!isHost) {
    return null;
  }

  const defaultMeetingPasscode = h(MeetingPasscodeComponent, { meetingPasscode: props.adminPasscode });
  const passcodeNode = props.renderMeetingPasscode
    ? props.renderMeetingPasscode({
        defaultMeetingPasscode,
        adminPasscode: props.adminPasscode,
        isHost,
      })
    : defaultMeetingPasscode;

  return h('section', { class: 'ms-modern-menu-modal__info-card' }, [
    passcodeNode,
    h(
      'p',
      { class: 'ms-modern-menu-modal__section-copy' },
      'Others with this passcode can join as host with full privileges.',
    ),
  ]);
};

const renderShareSection = () => {
  const hasShareButtons = props.shareButtons ?? true;
  if (!hasShareButtons) {
    return null;
  }

  const defaultShareButtons = h(ShareButtonsComponent, {
    meetingID: props.roomName,
    eventType: props.eventType,
    localLink: props.localLink,
  });
  const shareButtonsNode = props.renderShareButtons
    ? props.renderShareButtons({ defaultShareButtons, hasShareButtons })
    : defaultShareButtons;

  return h('section', { class: 'ms-modern-menu-modal__share-card' }, [
    h('p', { class: 'ms-modern-menu-modal__section-label' }, 'Share Meeting'),
    shareButtonsNode,
  ]);
};

const renderModernBody = () => {
  const sections = [
    renderMeetingIdSection(),
    renderPasscodeSection(),
    renderShareSection(),
    renderActionsSection(),
  ].filter(Boolean);

  const bodyWithTheme = h(
    'div',
    {
      class: 'ms-modern-menu-modal__body-shell',
    },
    [
      renderThemeToggle(),
      h(
        'div',
        {
          class: 'ms-modern-menu-modal__scroll',
        },
        sections,
      ),
    ],
  );

  return props.renderBody ? props.renderBody({ defaultBody: bodyWithTheme }) : bodyWithTheme;
};

const renderModernHeader = (options: { defaultHeader: VNodeChild; onClose: () => void }) => {
  const heading = 'Menu';

  const defaultHeader = h(
    'div',
    { class: 'ms-modern-menu-modal__modern-header' },
    [
      h('div', { class: 'ms-modern-menu-modal__modern-heading' }, [
        h('h2', { class: 'ms-modern-menu-modal__modern-title' }, [
          h(FontAwesomeIcon, { icon: faBars }),
          h('span', heading),
        ]),
      ]),
      h(
        'button',
        {
          type: 'button',
          class: 'ms-modern-menu-modal__modern-close',
          'aria-label': 'Close menu',
          onClick: options.onClose,
        },
        '×',
      ),
    ],
  );

  return props.renderHeader ? props.renderHeader({ ...options, defaultHeader }) : defaultHeader;
};

const mergedProps = computed(() => ({
  ...props,
  backgroundColor: props.backgroundColor ?? 'var(--ms-modern-panel-surface-elevated)',
  overlayProps: mergeAttrObjects(defaultOverlayProps.value, props.overlayProps),
  contentProps: mergeAttrObjects(defaultContentProps.value, props.contentProps),
  headerProps: mergeAttrObjects(defaultHeaderProps, props.headerProps),
  titleWrapperProps: mergeAttrObjects(defaultTitleWrapperProps, props.titleWrapperProps),
  badgeWrapperProps: mergeAttrObjects(defaultBadgeWrapperProps, props.badgeWrapperProps),
  closeButtonProps: mergeAttrObjects(defaultCloseButtonProps, props.closeButtonProps),
  dividerProps: mergeAttrObjects(defaultDividerProps, props.dividerProps),
  bodyProps: mergeAttrObjects(defaultBodyProps, props.bodyProps),
  scrollWrapperProps: mergeAttrObjects(defaultScrollWrapperProps.value, props.scrollWrapperProps),
  customButtonsWrapperProps: mergeAttrObjects(
    withSectionClass('ms-modern-menu-modal__actions-section'),
    props.customButtonsWrapperProps,
  ),
  meetingPasscodeWrapperProps: mergeAttrObjects(
    withSectionClass('ms-modern-menu-modal__passcode-section'),
    props.meetingPasscodeWrapperProps,
  ),
  meetingIdWrapperProps: mergeAttrObjects(
    withSectionClass('ms-modern-menu-modal__meeting-id-section'),
    props.meetingIdWrapperProps,
  ),
  shareButtonsWrapperProps: mergeAttrObjects(
    withSectionClass('ms-modern-menu-modal__share-section'),
    props.shareButtonsWrapperProps,
  ),
  sectionsDividerProps: mergeAttrObjects(
    { ...defaultDividerProps, class: 'ms-modern-menu-modal__sections-divider' },
    props.sectionsDividerProps,
  ),
  renderHeader: renderModernHeader,
  renderBody: renderModernBody,
}));
</script>

<style scoped>
:deep(.ms-modern-menu-modal__content) {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.35) transparent;
}

:deep(.ms-modern-menu-modal__content::-webkit-scrollbar) {
  width: 8px;
}

:deep(.ms-modern-menu-modal__content::-webkit-scrollbar-thumb) {
  background: rgba(148, 163, 184, 0.32);
  border-radius: 999px;
}

:deep(.ms-modern-menu-modal__content .mediasfu-customButtonsContainer) {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: stretch;
  justify-content: flex-start;
  flex-wrap: nowrap;
}

:deep(.ms-modern-menu-modal__content .ms-modern-menu-modal__scroll) {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  gap: 16px;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding-right: 3px;
  padding-bottom: 18px;
}

:deep(.ms-modern-menu-modal__body-shell) {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  padding: 16px;
  overflow: hidden;
}

:deep(.ms-modern-menu-modal__info-card),
:deep(.ms-modern-menu-modal__share-card),
:deep(.ms-modern-menu-modal__actions-card) {
  display: grid;
  gap: 10px;
}

:deep(.ms-modern-menu-modal__section-label) {
  margin: 0;
  color: var(--ms-modern-text-secondary);
  font-family: var(--ms-modern-font-family);
  font-size: 12px;
  font-weight: 700;
}

:deep(.ms-modern-menu-modal__section-copy) {
  margin: -2px 0 0;
  color: var(--ms-modern-text-secondary);
  font-family: var(--ms-modern-font-family);
  font-size: 11px;
  line-height: 1.45;
}

:deep(.ms-modern-menu-modal__modern-header) {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 16px 14px;
  border-bottom: 1px solid var(--ms-modern-panel-border);
  background: linear-gradient(180deg, var(--ms-modern-panel-surface-elevated), transparent);
}

:deep(.ms-modern-menu-modal__modern-heading) {
  min-width: 0;
}

:deep(.ms-modern-menu-modal__modern-eyebrow) {
  display: block;
  color: var(--ms-modern-text-muted);
  font-family: var(--ms-modern-font-family);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  line-height: 1.2;
  text-transform: uppercase;
}

:deep(.ms-modern-menu-modal__modern-title) {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: 20px;
  font-weight: 800;
  line-height: 1.12;
}

:deep(.ms-modern-menu-modal__modern-subtitle) {
  margin: 7px 0 0;
  color: var(--ms-modern-text-secondary);
  font-family: var(--ms-modern-font-family);
  font-size: 12px;
  font-weight: 550;
  line-height: 1.35;
}

:deep(.ms-modern-menu-modal__modern-close) {
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  border: 1px solid var(--ms-sidebar-button-border, rgba(148, 163, 184, 0.14));
  border-radius: 12px;
  background: var(--ms-sidebar-button-bg, rgba(255, 255, 255, 0.1));
  color: var(--ms-sidebar-button-text, var(--ms-modern-text-primary));
  cursor: pointer;
  font-family: var(--ms-modern-font-family);
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
}

:deep(.ms-modern-menu-modal__modern-close:hover) {
  background: rgba(148, 163, 184, 0.16);
}

:deep(.ms-modern-menu-modal.ms-modern-menu-modal--modal) {
  overscroll-behavior: contain;
}

:deep(.ms-modern-menu-modal__theme-toggle) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.055);
}

:deep(.ms-modern-menu-modal__theme-label) {
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: 12px;
  font-weight: 700;
}

:deep(.ms-modern-menu-modal__theme-button) {
  min-width: 68px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid rgba(99, 102, 241, 0.32);
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.18);
  color: #c7d2fe;
  font-family: var(--ms-modern-font-family);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

:deep(.ms-modern-menu-modal__content .ms-modern-menu-modal__actions-section) {
  order: 2;
}

:deep(.ms-modern-menu-modal__content .ms-modern-menu-modal__meeting-id-section) {
  order: 3;
}

:deep(.ms-modern-menu-modal__content .ms-modern-menu-modal__passcode-section) {
  order: 4;
}

:deep(.ms-modern-menu-modal__content .ms-modern-menu-modal__share-section) {
  order: 5;
}

:deep(.ms-modern-menu-modal__content .ms-modern-menu-modal__sections-divider) {
  display: none !important;
}

:deep(.ms-modern-menu-modal__content .customButton) {
  width: 100% !important;
  min-height: 44px !important;
  padding: 9px 10px !important;
  margin: 0 !important;
  border-radius: 10px !important;
  border: 1px solid rgba(148, 163, 184, 0.14) !important;
  background: rgba(255, 255, 255, 0.055) !important;
  color: var(--ms-modern-text-primary) !important;
  box-shadow: none !important;
  transition: background-color var(--ms-modern-motion-fast) var(--ms-modern-motion-easing), border-color var(--ms-modern-motion-fast) var(--ms-modern-motion-easing), transform var(--ms-modern-motion-fast) var(--ms-modern-motion-easing);
}

:deep(.ms-modern-menu-modal__content .customButton:hover) {
  background: rgba(255, 255, 255, 0.09) !important;
  border-color: rgba(148, 163, 184, 0.24) !important;
  transform: translateY(-1px);
}

:deep(.ms-modern-menu-modal__content .buttonContent) {
  gap: 8px;
  justify-content: flex-start !important;
  width: 100%;
}

:deep(.ms-modern-menu-modal__content .buttonContent svg) {
  color: #c7d2fe !important;
}

:deep(.ms-modern-menu-modal__content .customButtonText) {
  color: var(--ms-modern-text-primary) !important;
  font-family: var(--ms-modern-font-family) !important;
  font-size: 12px !important;
  font-weight: 650 !important;
  line-height: 1.2 !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.ms-modern-menu-modal__content .form-group) {
  display: grid;
  gap: 8px;
  margin: 0 !important;
}

:deep(.ms-modern-menu-modal__content .label) {
  color: var(--ms-modern-text-muted) !important;
  font-family: var(--ms-modern-font-family) !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  letter-spacing: 0 !important;
  margin: 0 !important;
  text-transform: uppercase;
}

:deep(.ms-modern-menu-modal__content .input-container) {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

:deep(.ms-modern-menu-modal__content .disabled-input) {
  min-width: 0 !important;
  height: 40px !important;
  border: 1px solid var(--ms-modern-panel-border) !important;
  border-radius: 10px !important;
  background: var(--ms-modern-field-background) !important;
  color: var(--ms-modern-text-primary) !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
  font-size: 12px !important;
  font-weight: 650 !important;
  letter-spacing: 0 !important;
  padding: 0 10px !important;
  box-shadow: none !important;
}

:deep(.ms-modern-menu-modal__content .copy-button) {
  width: 40px !important;
  min-width: 40px !important;
  height: 40px !important;
  border: 1px solid rgba(99, 102, 241, 0.35) !important;
  border-radius: 10px !important;
  background: rgba(99, 102, 241, 0.18) !important;
  color: #c7d2fe !important;
}

:deep(.ms-modern-menu-modal__content .copy-button:hover) {
  background: rgba(99, 102, 241, 0.28) !important;
}

:deep(.ms-modern-menu-modal__content .share-buttons-container) {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 8px;
}

:deep(.ms-modern-menu-modal__content .share-button) {
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  border: 1px solid rgba(148, 163, 184, 0.14) !important;
  border-radius: 10px !important;
  box-shadow: none !important;
}

@media (max-width: 520px) {
  :deep(.ms-modern-menu-modal__content) {
    width: calc(100vw - 16px) !important;
    height: calc(100dvh - 16px) !important;
    max-height: calc(100dvh - 16px) !important;
    top: 8px !important;
    right: 8px !important;
    bottom: auto !important;
  }

  :deep(.ms-modern-menu-modal__content .ms-modern-menu-modal__scroll) {
    max-height: none !important;
  }
}
</style>