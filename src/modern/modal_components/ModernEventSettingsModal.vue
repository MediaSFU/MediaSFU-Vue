<template>
  <ClassicEventSettingsModal v-bind="mergedProps">
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
  </ClassicEventSettingsModal>
</template>

<script setup lang="ts">
import {
  computed,
  h,
  useSlots,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type LabelHTMLAttributes,
  type SelectHTMLAttributes,
  type VNodeChild,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faCog,
  faBan,
  faCheckCircle,
  faComments,
  faDesktop,
  faLock,
  faMicrophone,
  faTimes,
  faVideo,
} from '@fortawesome/free-solid-svg-icons';
import ClassicEventSettingsModal from '../../components/eventSettingsComponents/EventSettingsModal.vue';
import type { EventSettingsModalProps } from '../../components/eventSettingsComponents/EventSettingsModal.vue';
import { mergeAttrObjects } from '../display_components/styleUtils';

type ModernEventSettingsRenderMode = 'modal' | 'sidebar' | 'inline';

export interface ModernEventSettingsModalProps extends EventSettingsModalProps {
  renderMode?: ModernEventSettingsRenderMode;
}

const props = defineProps<ModernEventSettingsModalProps>();
const slots = useSlots();
const isEmbedded = computed(() => props.renderMode === 'sidebar' || props.renderMode === 'inline');
const isCompactViewport = computed(
  () => !isEmbedded.value && typeof window !== 'undefined' && window.innerWidth <= 640,
);

const sectionIcons = {
  audio: faMicrophone,
  video: faVideo,
  screenshare: faDesktop,
  chat: faComments,
} as const;

const optionIcons = {
  allow: faCheckCircle,
  approval: faLock,
  disallow: faBan,
} as const;

const optionTitles = {
  allow: 'Allow',
  approval: 'Approval',
  disallow: 'Disallow',
} as const;

const sectionTitles = {
  audio: 'Audio',
  video: 'Video',
  screenshare: 'Screen Share',
  chat: 'Chat',
} as const;

const normalizeTitle = (value: VNodeChild, fallback: string) => {
  if (typeof value === 'string') {
    const cleaned = value.replace(/^user\s+/i, '').replace(/:$/, '').trim();
    return cleaned.length > 0
      ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
      : fallback;
  }

  return fallback;
};

const renderNodeChildren = (value: VNodeChild | undefined, fallback: string) => {
  const resolved = value === false || value == null ? fallback : value;
  return Array.isArray(resolved) ? resolved : [resolved];
};

const resolveOptionalNode = (value: VNodeChild | undefined, fallback: VNodeChild) =>
  value === false || value == null || value === '' || (Array.isArray(value) && value.length === 0)
    ? fallback
    : value;

const renderModernHeader = () => {
  const defaultHeader = h('div', { class: 'ms-modern-event-settings__modal-header' }, [
    h('h2', { class: 'ms-modern-event-settings__modal-title' }, [
      h(FontAwesomeIcon, { icon: faCog }),
      ...renderNodeChildren(props.title, 'Event Settings'),
    ]),
    h(
      'button',
      {
        type: 'button',
        class: 'ms-modern-event-settings__modal-close',
        onClick: props.onEventSettingsClose,
        'aria-label': 'Close event settings',
      },
      [
        resolveOptionalNode(
          props.closeIconComponent,
          h('span', { 'aria-hidden': 'true', style: { fontSize: '1.18rem', lineHeight: 1 } }, '×'),
        ),
      ],
    ),
  ]);

  return props.renderHeader ? props.renderHeader({ defaultHeader }) : defaultHeader;
};

const renderSettingSection = ({ section, index, onChange }: Parameters<NonNullable<EventSettingsModalProps['renderSettingSection']>>[0]) => {
  const sectionKey = section.key as keyof typeof sectionTitles;
  const icon = sectionIcons[sectionKey] ?? faMicrophone;
  const title = sectionTitles[sectionKey] ?? normalizeTitle(section.label, 'Setting');

  return h(
    'section',
    {
      class: 'ms-modern-event-settings__section',
      style: {
        marginBottom: index < 3 ? '12px' : undefined,
      },
    },
    [
      h('div', { class: 'ms-modern-event-settings__section-header' }, [
        h('span', { class: 'ms-modern-event-settings__section-icon' }, [
          h(FontAwesomeIcon, { icon }),
        ]),
        h('span', { class: 'ms-modern-event-settings__section-title' }, title),
      ]),
      h(
        'div',
        { class: 'ms-modern-event-settings__options' },
        section.options.map((option) => {
          const optionIcon = optionIcons[option.value as keyof typeof optionIcons] ?? faCheckCircle;
          const optionTitle = optionTitles[option.value as keyof typeof optionTitles] ?? option.value;

          return h(
            'button',
            {
              key: `${section.key}-${option.value}`,
              type: 'button',
              class: [
                'ms-modern-event-settings__option',
                section.value === option.value ? 'ms-modern-event-settings__option--active' : undefined,
              ].filter(Boolean).join(' '),
              onClick: () => {
                onChange(option.value);
              },
            },
            [
              h(FontAwesomeIcon, {
                icon: optionIcon,
                class: 'ms-modern-event-settings__option-icon',
              }),
              h('span', { class: 'ms-modern-event-settings__option-label' }, renderNodeChildren(optionTitle, option.value)),
            ],
          );
        }),
      ),
    ],
  );
};

const panelGradientBackground =
  'linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-panel-surface) 100%)';

const defaultContentProps = computed<HTMLAttributes>(() => ({
  style: {
    background: panelGradientBackground,
    border: '1px solid var(--ms-modern-panel-border)',
    borderRadius: isCompactViewport.value ? '24px' : '28px',
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

const defaultBodyProps = computed<HTMLAttributes>(() => ({
  style: {
    padding: isCompactViewport.value ? '0 16px 16px' : '0 22px 22px',
    display: 'grid',
    gap: isCompactViewport.value ? '12px' : '14px',
  },
}));

const defaultFieldProps = computed<HTMLAttributes>(() => ({
  style: {
    display: 'grid',
    gap: isCompactViewport.value ? '6px' : '8px',
    padding: isCompactViewport.value ? '12px' : '14px',
    borderRadius: isCompactViewport.value ? '16px' : '18px',
    border: '1px solid var(--ms-modern-panel-border)',
    background: 'var(--ms-modern-panel-surface)',
  },
}));

const defaultLabelProps: LabelHTMLAttributes = {
  style: {
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontSize: '0.82rem',
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
};

const defaultSelectProps: SelectHTMLAttributes = {
  style: {
    width: '100%',
    minHeight: '46px',
    padding: '0 14px',
    borderRadius: '14px',
    border: '1px solid var(--ms-modern-field-border)',
    background: 'var(--ms-modern-field-background)',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    outline: 'none',
  },
};

const defaultFooterProps = computed<HTMLAttributes>(() => ({
  style: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: isCompactViewport.value ? '2px' : '6px',
  },
}));

const defaultSaveButtonProps = computed<ButtonHTMLAttributes>(() => ({
  style: {
    minHeight: isCompactViewport.value ? '44px' : '46px',
    width: isCompactViewport.value ? '100%' : undefined,
    borderRadius: '9999px',
    border: 'none',
    paddingInline: '18px',
    background:
      'linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 55%, var(--ms-modern-accent) 100%)',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontWeight: 700,
    boxShadow: 'var(--ms-modern-shadow-soft)',
    cursor: 'pointer',
  },
}));

const mergedProps = computed(() => ({
  ...props,
  isEventSettingsModalVisible: isEmbedded.value ? true : props.isEventSettingsModalVisible,
  backgroundColor: props.backgroundColor ?? 'var(--ms-modern-panel-surface-elevated)',
  approvalOptionLabel: props.approvalOptionLabel ?? 'Approval',
  audioOptions: props.audioOptions ?? [
    { value: 'allow', label: props.allowOptionLabel ?? 'Allow' },
    { value: 'approval', label: props.approvalOptionLabel ?? 'Approval' },
    { value: 'disallow', label: props.disallowOptionLabel ?? 'Disallow' },
  ],
  videoOptions: props.videoOptions ?? [
    { value: 'allow', label: props.allowOptionLabel ?? 'Allow' },
    { value: 'approval', label: props.approvalOptionLabel ?? 'Approval' },
    { value: 'disallow', label: props.disallowOptionLabel ?? 'Disallow' },
  ],
  screenshareOptions: props.screenshareOptions ?? [
    { value: 'allow', label: props.allowOptionLabel ?? 'Allow' },
    { value: 'approval', label: props.approvalOptionLabel ?? 'Approval' },
    { value: 'disallow', label: props.disallowOptionLabel ?? 'Disallow' },
  ],
  chatOptions: props.chatOptions ?? [
    { value: 'allow', label: props.allowOptionLabel ?? 'Allow' },
    { value: 'approval', label: props.approvalOptionLabel ?? 'Approval' },
    { value: 'disallow', label: props.chatDisallowOptionLabel ?? 'Disallow' },
  ],
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
  bodyProps: mergeAttrObjects(defaultBodyProps.value, props.bodyProps),
  settingFieldProps: mergeAttrObjects(defaultFieldProps.value, props.settingFieldProps),
  audioFieldProps: mergeAttrObjects(defaultFieldProps.value, props.audioFieldProps),
  videoFieldProps: mergeAttrObjects(defaultFieldProps.value, props.videoFieldProps),
  screenshareFieldProps: mergeAttrObjects(defaultFieldProps.value, props.screenshareFieldProps),
  chatFieldProps: mergeAttrObjects(defaultFieldProps.value, props.chatFieldProps),
  settingLabelProps: mergeAttrObjects(defaultLabelProps, props.settingLabelProps),
  audioLabelProps: mergeAttrObjects(defaultLabelProps, props.audioLabelProps),
  videoLabelProps: mergeAttrObjects(defaultLabelProps, props.videoLabelProps),
  screenshareLabelProps: mergeAttrObjects(defaultLabelProps, props.screenshareLabelProps),
  chatLabelProps: mergeAttrObjects(defaultLabelProps, props.chatLabelProps),
  settingSelectProps: mergeAttrObjects(defaultSelectProps, props.settingSelectProps),
  audioSelectProps: mergeAttrObjects(defaultSelectProps, props.audioSelectProps),
  videoSelectProps: mergeAttrObjects(defaultSelectProps, props.videoSelectProps),
  screenshareSelectProps: mergeAttrObjects(defaultSelectProps, props.screenshareSelectProps),
  chatSelectProps: mergeAttrObjects(defaultSelectProps, props.chatSelectProps),
  separatorProps: mergeAttrObjects({ style: { display: 'none' } }, props.separatorProps),
  footerProps: mergeAttrObjects(defaultFooterProps.value, props.footerProps),
  saveButtonProps: mergeAttrObjects(defaultSaveButtonProps.value, props.saveButtonProps),
  saveButtonLabel: props.saveButtonLabel === false || props.saveButtonLabel == null
    ? 'Save Settings'
    : props.saveButtonLabel,
  renderHeader: props.renderHeader ?? renderModernHeader,
  renderSettingSection: props.renderSettingSection ?? renderSettingSection,
}));
</script>

<style scoped>
:deep(.ms-modern-event-settings__modal-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 18px 14px;
  border-bottom: 1px solid var(--ms-modern-panel-border);
  background: linear-gradient(180deg, var(--ms-modern-panel-surface-elevated), transparent);
}

:deep(.ms-modern-event-settings__modal-title) {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.1;
}

:deep(.ms-modern-event-settings__modal-close) {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 12px;
  background: var(--ms-modern-field-background);
  color: var(--ms-modern-text-primary);
  cursor: pointer;
}

:deep(.ms-modern-event-settings__section) {
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 18px;
  background: var(--ms-modern-panel-surface);
}

:deep(.ms-modern-event-settings__section-header) {
  display: flex;
  align-items: center;
  gap: 10px;
}

:deep(.ms-modern-event-settings__section-icon) {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: color-mix(in srgb, var(--ms-modern-brand-primary) 16%, transparent);
  color: var(--ms-modern-brand-primary);
}

:deep(.ms-modern-event-settings__section-title) {
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: 0.9rem;
  font-weight: 800;
}

:deep(.ms-modern-event-settings__options) {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

:deep(.ms-modern-event-settings__option) {
  min-height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 14px;
  background: var(--ms-modern-field-background);
  color: var(--ms-modern-text-secondary);
  cursor: pointer;
  font-family: var(--ms-modern-font-family);
  text-transform: none;
  transition: transform 140ms ease, border-color 140ms ease, background-color 140ms ease, color 140ms ease;
}

:deep(.ms-modern-event-settings__option:hover) {
  transform: translateY(-1px);
  color: var(--ms-modern-text-primary);
}

:deep(.ms-modern-event-settings__option--active) {
  border-color: color-mix(in srgb, var(--ms-modern-brand-primary) 55%, var(--ms-modern-panel-border));
  background: color-mix(in srgb, var(--ms-modern-brand-primary) 12%, var(--ms-modern-field-background));
  color: var(--ms-modern-text-primary);
}

:deep(.ms-modern-event-settings__option-icon) {
  font-size: 0.95rem;
}

:deep(.ms-modern-event-settings__option-label) {
  font-size: 0.76rem;
  font-weight: 700;
  text-align: center;
  line-height: 1.2;
  text-transform: none;
}

@media (max-width: 640px) {
  :deep(.ms-modern-event-settings__modal-header) {
    gap: 10px;
    padding: 16px 16px 12px;
  }

  :deep(.ms-modern-event-settings__modal-title) {
    gap: 8px;
    font-size: 0.96rem;
  }

  :deep(.ms-modern-event-settings__modal-close) {
    width: 34px;
    height: 34px;
  }

  :deep(.ms-modern-event-settings__section) {
    gap: 10px;
    padding: 12px;
  }

  :deep(.ms-modern-event-settings__options) {
    gap: 6px;
  }

  :deep(.ms-modern-event-settings__option) {
    min-height: 64px;
    gap: 6px;
  }

  :deep(.ms-modern-event-settings__option-label) {
    font-size: 0.72rem;
  }
}
</style>