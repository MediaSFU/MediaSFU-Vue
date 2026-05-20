<template>
  <ClassicMediaSettingsModal v-bind="mergedProps">
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
  </ClassicMediaSettingsModal>
</template>

<script setup lang="ts">
import {
  computed,
  h,
  ref,
  useSlots,
  watch,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type LabelHTMLAttributes,
  type SelectHTMLAttributes,
  type VNodeChild,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCamera, faCheck, faMicrophone, faPhotoFilm, faSyncAlt, faVideo } from '@fortawesome/free-solid-svg-icons';
import { switchAudio, switchVideo, switchVideoAlt } from 'mediasfu-shared';
import ClassicMediaSettingsModal from '../../components/mediaSettingsComponents/MediaSettingsModal.vue';
import type { MediaSettingsModalProps } from '../../components/mediaSettingsComponents/MediaSettingsModal.vue';
import { mergeAttrObjects } from '../display_components/styleUtils';

type ModernMediaSettingsRenderMode = 'modal' | 'sidebar' | 'inline';
type MediaSettingsSection = 'video' | 'audio';

export interface ModernMediaSettingsModalProps extends MediaSettingsModalProps {
  renderMode?: ModernMediaSettingsRenderMode;
  onOpenBackgroundSidebar?: () => void;
}

const props = defineProps<ModernMediaSettingsModalProps>();
const slots = useSlots();
const isEmbedded = computed(() => props.renderMode === 'sidebar' || props.renderMode === 'inline');

const panelGradientBackground =
  'linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-panel-surface) 100%)';

const liveParameters = computed(() => props.parameters.getUpdatedAllParams?.() ?? props.parameters);
const videoInputs = computed(() => liveParameters.value.videoInputs ?? []);
const audioInputs = computed(() => liveParameters.value.audioInputs ?? []);
const selectedVideoInput = computed(() => liveParameters.value.userDefaultVideoInputDevice || videoInputs.value[0]?.deviceId || '');
const selectedAudioInput = computed(() => liveParameters.value.userDefaultAudioInputDevice || audioInputs.value[0]?.deviceId || '');
const videoAlreadyOn = computed(() => {
  const params = liveParameters.value as Record<string, unknown>;
  return params.videoAlreadyOn === true;
});
const activeSection = ref<MediaSettingsSection>('video');

watch(
  () => props.isMediaSettingsModalVisible,
  (isVisible) => {
    if (isVisible) {
      activeSection.value = 'video';
    }
  },
);

const getDeviceLabel = (device: MediaDeviceInfo, fallback: string, index: number) => {
  const label = device.label?.trim();
  if (label) return label;
  if (device.deviceId?.trim()) return `${fallback} ${index + 1}`;
  return `${fallback} ${index + 1}`;
};

const getSectionDescription = (baseDescription: string, inputs: MediaDeviceInfo[]) => {
  if (inputs.length > 0 && inputs.every((device) => !device.label?.trim())) {
    return `${baseDescription} Device names appear after camera and microphone access is granted.`;
  }

  return baseDescription;
};

const handleVideoDevice = async (deviceId: string) => {
  if (!deviceId || deviceId === selectedVideoInput.value) return;
  await (props.switchVideoOnPress ?? switchVideo)({
    videoPreference: deviceId,
    parameters: liveParameters.value,
  });
};

const handleAudioDevice = async (deviceId: string) => {
  if (!deviceId || deviceId === selectedAudioInput.value) return;
  await (props.switchAudioOnPress ?? switchAudio)({
    audioPreference: deviceId,
    parameters: liveParameters.value,
  });
};

const handleSwitchCamera = async () => {
  await (props.switchCameraOnPress ?? switchVideoAlt)({ parameters: liveParameters.value });
};

const handleVirtualBackground = () => {
  if (props.onOpenBackgroundSidebar) {
    props.onOpenBackgroundSidebar();
    return;
  }

  liveParameters.value.updateIsBackgroundModalVisible(true);
  props.onMediaSettingsClose?.();
};

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

const defaultFieldProps: HTMLAttributes = {
  style: {
    display: 'grid',
    gap: '8px',
    padding: '14px',
    borderRadius: '18px',
    border: '1px solid var(--ms-modern-panel-border)',
    background: 'var(--ms-modern-panel-surface)',
  },
};

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

const defaultPrimaryButtonProps: ButtonHTMLAttributes = {
  style: {
    minHeight: '46px',
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
};

const defaultSecondaryButtonProps: ButtonHTMLAttributes = {
  style: {
    minHeight: '46px',
    borderRadius: '9999px',
    border: '1px solid var(--ms-modern-panel-border)',
    paddingInline: '18px',
    background: 'var(--ms-modern-field-background)',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

const renderNodeChildren = (value: VNodeChild | undefined, fallback: string) => {
  const resolved = value === false || value == null ? fallback : value;
  return Array.isArray(resolved) ? resolved : [resolved];
};

const resolveOptionalNode = (value: VNodeChild | undefined, fallback: VNodeChild) =>
  value === false || value == null || value === '' || (Array.isArray(value) && value.length === 0)
    ? fallback
    : value;

const renderModernHeader = (options: { defaultHeader: VNodeChild; onClose: () => void }) => {
  const defaultHeader = h('div', { class: 'ms-modern-media-settings__header' }, [
    h('div', { class: 'ms-modern-media-settings__heading' }, [
      h('h2', { class: 'ms-modern-media-settings__title' }, [
        h(FontAwesomeIcon, { icon: faVideo }),
        ...renderNodeChildren(props.title, 'Media Settings'),
      ]),
    ]),
    h(
      'button',
      {
        type: 'button',
        class: 'ms-modern-media-settings__close',
        onClick: options.onClose,
        'aria-label': 'Close media settings',
      },
      [
        resolveOptionalNode(
          props.closeIconComponent,
          h('span', { 'aria-hidden': 'true', style: { fontSize: '1.18rem', lineHeight: 1 } }, '×'),
        ),
      ],
    ),
  ]);

  return props.renderHeader ? props.renderHeader({ ...options, defaultHeader }) : defaultHeader;
};

const renderTabButton = (
  section: MediaSettingsSection,
  label: string,
  icon: unknown,
) =>
  h(
    'button',
    {
      type: 'button',
      class: [
        'ms-modern-media-settings__tab',
        activeSection.value === section ? 'ms-modern-media-settings__tab--active' : undefined,
      ].filter(Boolean).join(' '),
      onClick: () => {
        activeSection.value = section;
      },
    },
    [h(FontAwesomeIcon, { icon }), h('span', label)],
  );

const renderActionButton = ({
  label,
  description,
  icon,
  variant,
  onClick,
}: {
  label: string;
  description: string;
  icon: unknown;
  variant: 'primary' | 'secondary';
  onClick: () => void;
}) =>
  h('div', { class: 'ms-modern-media-settings__action-card' }, [
    h(
      'button',
      {
        type: 'button',
        class: `ms-modern-media-settings__action ms-modern-media-settings__action--${variant}`,
        onClick,
      },
      [h(FontAwesomeIcon, { icon }), h('span', label)],
    ),
    h('p', { class: 'ms-modern-media-settings__action-description' }, description),
  ]);

const renderDeviceSection = ({
  title,
  description,
  emptyTitle,
  emptyDescription,
  icon,
  inputs,
  selectedId,
  fallback,
  onSelect,
}: {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  icon: unknown;
  inputs: MediaDeviceInfo[];
  selectedId: string;
  fallback: string;
  onSelect: (deviceId: string) => void;
}) =>
  h('section', { class: 'ms-modern-media-settings__section' }, [
    h('div', { class: 'ms-modern-media-settings__section-heading' }, [
      h('div', { class: 'ms-modern-media-settings__section-title' }, [
        h(FontAwesomeIcon, { icon }),
        h('span', title),
      ]),
      h('p', { class: 'ms-modern-media-settings__section-description' }, description),
    ]),
    inputs.length > 0
      ? h(
          'div',
          { class: 'ms-modern-media-settings__device-list' },
          inputs.map((device, index) => {
            const active = device.deviceId === selectedId;
            return h(
              'button',
              {
                key: device.deviceId || `${fallback}-${index}`,
                type: 'button',
                class: [
                  'ms-modern-media-settings__device',
                  active ? 'ms-modern-media-settings__device--active' : undefined,
                ].filter(Boolean).join(' '),
                onClick: () => onSelect(device.deviceId),
              },
              [
                h('span', { class: 'ms-modern-media-settings__device-name' }, getDeviceLabel(device, fallback, index)),
                active ? h(FontAwesomeIcon, { icon: faCheck, class: 'ms-modern-media-settings__device-check' }) : null,
              ],
            );
          }),
        )
      : h('div', { class: 'ms-modern-media-settings__empty' }, [
          h('strong', emptyTitle),
          h('span', emptyDescription),
        ]),
  ]);

const renderModernBody = (options: { defaultBody: VNodeChild }) => {
  const currentSection = activeSection.value === 'video'
    ? renderDeviceSection({
        title: 'Video Input',
        description: getSectionDescription('Select the camera used for this room.', videoInputs.value),
        emptyTitle: 'No cameras detected',
        emptyDescription: 'Grant camera permission or connect a camera, then reopen media settings.',
        icon: faCamera,
        inputs: videoInputs.value,
        selectedId: selectedVideoInput.value,
        fallback: 'Camera',
        onSelect: (deviceId) => { void handleVideoDevice(deviceId); },
      })
    : renderDeviceSection({
        title: 'Audio Input',
        description: getSectionDescription('Select the microphone used for this room.', audioInputs.value),
        emptyTitle: 'No microphones detected',
        emptyDescription: 'Grant microphone permission or connect an input device, then reopen media settings.',
        icon: faMicrophone,
        inputs: audioInputs.value,
        selectedId: selectedAudioInput.value,
        fallback: 'Microphone',
        onSelect: (deviceId) => { void handleAudioDevice(deviceId); },
      });

  const statusCard = !videoAlreadyOn.value && activeSection.value === 'video'
    ? h('div', { class: 'ms-modern-media-settings__status-card' }, [
        h(FontAwesomeIcon, { icon: faCamera, class: 'ms-modern-media-settings__status-icon' }),
        h('div', { class: 'ms-modern-media-settings__status-copy' }, [
          h('strong', 'Camera is currently off'),
          h('span', 'You can still choose a background now. It will be applied automatically when you turn on your camera.'),
        ]),
      ])
    : null;

  const actionStack = activeSection.value === 'video'
    ? h('div', { class: 'ms-modern-media-settings__actions' }, [
        renderActionButton({
          label: 'Switch Camera',
          description: 'Toggle between front, rear, or any connected cameras.',
          icon: faSyncAlt,
          variant: 'secondary',
          onClick: () => { void handleSwitchCamera(); },
        }),
        renderActionButton({
          label: 'Virtual Background',
          description: 'Open the background controls for blur or custom scenes.',
          icon: faPhotoFilm,
          variant: 'primary',
          onClick: handleVirtualBackground,
        }),
      ])
    : null;

  const defaultBody = h('div', { class: 'ms-modern-media-settings__body' }, [
    h('div', { class: 'ms-modern-media-settings__tabs' }, [
      renderTabButton('video', 'Video', faCamera),
      renderTabButton('audio', 'Audio', faMicrophone),
    ]),
    currentSection,
    statusCard,
    actionStack,
  ].filter(Boolean));

  return props.renderBody ? props.renderBody({ ...options, defaultBody }) : defaultBody;
};

const mergedProps = computed(() => ({
  ...props,
  isMediaSettingsModalVisible: isEmbedded.value ? true : props.isMediaSettingsModalVisible,
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
  cameraFieldProps: mergeAttrObjects(defaultFieldProps, props.cameraFieldProps),
  cameraLabelProps: mergeAttrObjects(defaultLabelProps, props.cameraLabelProps),
  cameraSelectProps: mergeAttrObjects(defaultSelectProps, props.cameraSelectProps),
  microphoneFieldProps: mergeAttrObjects(defaultFieldProps, props.microphoneFieldProps),
  microphoneLabelProps: mergeAttrObjects(defaultLabelProps, props.microphoneLabelProps),
  microphoneSelectProps: mergeAttrObjects(defaultSelectProps, props.microphoneSelectProps),
  switchCameraButtonProps: mergeAttrObjects(defaultPrimaryButtonProps, props.switchCameraButtonProps),
  middleDividerProps: mergeAttrObjects(defaultDividerProps, props.middleDividerProps),
  virtualBackgroundButtonProps: mergeAttrObjects(
    defaultSecondaryButtonProps,
    props.virtualBackgroundButtonProps,
  ),
  renderHeader: renderModernHeader,
  renderBody: renderModernBody,
}));
</script>

<style scoped>
:deep(.ms-modern-media-settings__header) {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 16px 14px;
  border-bottom: 1px solid var(--ms-modern-panel-border);
  background: linear-gradient(180deg, var(--ms-modern-panel-surface-elevated), transparent);
}

:deep(.ms-modern-media-settings__heading) {
  min-width: 0;
}

:deep(.ms-modern-media-settings__tabs) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

:deep(.ms-modern-media-settings__tab) {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 14px;
  background: var(--ms-modern-field-background);
  color: var(--ms-modern-text-secondary);
  font-family: var(--ms-modern-font-family);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

:deep(.ms-modern-media-settings__tab--active) {
  border-color: color-mix(in srgb, var(--ms-modern-brand-primary) 55%, var(--ms-modern-panel-border));
  background: color-mix(in srgb, var(--ms-modern-brand-primary) 12%, var(--ms-modern-field-background));
  color: var(--ms-modern-text-primary);
}

:deep(.ms-modern-media-settings__eyebrow) {
  display: block;
  color: var(--ms-modern-text-muted);
  font-family: var(--ms-modern-font-family);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  line-height: 1.2;
  text-transform: uppercase;
}

:deep(.ms-modern-media-settings__title) {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 5px 0 0;
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: 20px;
  font-weight: 800;
  line-height: 1.12;
}

:deep(.ms-modern-media-settings__subtitle) {
  margin: 7px 0 0;
  color: var(--ms-modern-text-secondary);
  font-family: var(--ms-modern-font-family);
  font-size: 12px;
  font-weight: 550;
  line-height: 1.35;
}

:deep(.ms-modern-media-settings__close) {
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 12px;
  background: var(--ms-modern-field-background);
  color: var(--ms-modern-text-primary);
  cursor: pointer;
}

:deep(.ms-modern-media-settings__body) {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  overflow-y: auto;
}

:deep(.ms-modern-media-settings__actions) {
  display: grid;
  gap: 10px;
}

:deep(.ms-modern-media-settings__action-card) {
  display: grid;
  gap: 6px;
}

:deep(.ms-modern-media-settings__action) {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: 100%;
  border-radius: 999px;
  padding: 0 14px;
  cursor: pointer;
  font-family: var(--ms-modern-font-family);
  font-size: 13px;
  font-weight: 800;
}

:deep(.ms-modern-media-settings__action-description) {
  margin: 0;
  color: var(--ms-modern-text-muted);
  font-family: var(--ms-modern-font-family);
  font-size: 11px;
  font-weight: 550;
  line-height: 1.35;
}

:deep(.ms-modern-media-settings__action--primary) {
  border: none;
  background: linear-gradient(135deg, var(--ms-modern-brand-primary), var(--ms-modern-brand-secondary), var(--ms-modern-accent));
  color: var(--ms-modern-text-primary);
  box-shadow: var(--ms-modern-shadow-soft);
}

:deep(.ms-modern-media-settings__action--secondary) {
  border: 1px solid var(--ms-modern-panel-border);
  background: var(--ms-modern-panel-surface);
  color: var(--ms-modern-text-primary);
}

:deep(.ms-modern-media-settings__section) {
  display: grid;
  gap: 10px;
  padding: 13px;
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 16px;
  background: var(--ms-modern-panel-surface);
}

:deep(.ms-modern-media-settings__section-title) {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: 13px;
  font-weight: 800;
}

:deep(.ms-modern-media-settings__section-description) {
  margin: 4px 0 0;
  color: var(--ms-modern-text-muted);
  font-family: var(--ms-modern-font-family);
  font-size: 11px;
  font-weight: 550;
  line-height: 1.35;
}

:deep(.ms-modern-media-settings__device-list) {
  display: grid;
  gap: 8px;
}

:deep(.ms-modern-media-settings__device) {
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 12px;
  background: var(--ms-modern-panel-surface-elevated);
  color: var(--ms-modern-text-secondary);
  cursor: pointer;
  padding: 0 12px;
  text-align: left;
}

:deep(.ms-modern-media-settings__device--active) {
  border-color: color-mix(in srgb, var(--ms-modern-brand-primary) 55%, var(--ms-modern-panel-border));
  color: var(--ms-modern-text-primary);
}

:deep(.ms-modern-media-settings__device-name) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--ms-modern-font-family);
  font-size: 12px;
  font-weight: 700;
}

:deep(.ms-modern-media-settings__device-check) {
  color: var(--ms-modern-brand-primary);
}

:deep(.ms-modern-media-settings__empty) {
  display: grid;
  gap: 4px;
  padding: 12px;
  border: 1px dashed var(--ms-modern-panel-border);
  border-radius: 12px;
  color: var(--ms-modern-text-secondary);
  font-family: var(--ms-modern-font-family);
  font-size: 12px;
  line-height: 1.35;
}

:deep(.ms-modern-media-settings__empty strong) {
  color: var(--ms-modern-text-primary);
}

:deep(.ms-modern-media-settings__status-card) {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 13px;
  border: 1px solid color-mix(in srgb, var(--ms-modern-brand-primary) 28%, var(--ms-modern-panel-border));
  border-radius: 16px;
  background: color-mix(in srgb, var(--ms-modern-brand-primary) 10%, var(--ms-modern-panel-surface));
}

:deep(.ms-modern-media-settings__status-icon) {
  margin-top: 2px;
  color: var(--ms-modern-brand-primary);
}

:deep(.ms-modern-media-settings__status-copy) {
  display: grid;
  gap: 4px;
  min-width: 0;
  color: var(--ms-modern-text-secondary);
  font-family: var(--ms-modern-font-family);
  font-size: 12px;
  line-height: 1.4;
}

:deep(.ms-modern-media-settings__status-copy strong) {
  color: var(--ms-modern-text-primary);
  font-size: 13px;
}

@media (max-width: 640px) {
  :deep(.ms-modern-media-settings__header) {
    gap: 10px;
    padding: 16px 16px 12px;
  }

  :deep(.ms-modern-media-settings__title) {
    margin-top: 0;
    font-size: 18px;
  }

  :deep(.ms-modern-media-settings__close) {
    width: 34px;
    height: 34px;
  }

  :deep(.ms-modern-media-settings__body) {
    gap: 12px;
    padding: 14px;
  }

  :deep(.ms-modern-media-settings__section) {
    gap: 8px;
    padding: 12px;
  }

  :deep(.ms-modern-media-settings__actions) {
    gap: 8px;
  }

  :deep(.ms-modern-media-settings__action-card) {
    gap: 0;
  }

  :deep(.ms-modern-media-settings__action) {
    min-height: 42px;
    font-size: 12px;
  }

  :deep(.ms-modern-media-settings__action-description) {
    display: none;
  }

  :deep(.ms-modern-media-settings__status-card) {
    padding: 10px 12px;
  }
}
</style>