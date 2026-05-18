<template>
  <RenderVNode :node="rootNode" />
</template>

<script setup lang="ts">
import {
  computed,
  defineComponent,
  h,
  isVNode,
  onBeforeUnmount,
  ref,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEventHandler,
  type PropType,
  type VNodeChild,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faCheck,
  faCircle,
  faCog,
  faPlay,
  faTimes,
  faVideo,
} from '@fortawesome/free-solid-svg-icons';
import ModernStandardPanelComponent from '../recording_components/ModernStandardPanelComponent.vue';
import ModernAdvancedPanelComponent from '../recording_components/ModernAdvancedPanelComponent.vue';
import type {
  RecordingModalParameters,
  RecordingModalProps,
} from '../../components/recordingComponents/RecordingModal.vue';

type ModernRecordingRenderMode = 'modal' | 'sidebar' | 'inline';
type RecordingTab = 'standard' | 'advanced';
type RecordingDisplayAdviceParameters = {
  meetingDisplayType?: string;
  breakOutRoomStarted?: boolean;
  breakOutRoomEnded?: boolean;
  recordingVideoParticipantsFullRoomSupport?: boolean;
  recordingVideoOptions?: string;
  recordingMediaOptions?: string;
};

type ModernRecordingModalProps = RecordingModalProps & {
  renderMode?: ModernRecordingRenderMode;
};

const props = defineProps<ModernRecordingModalProps>();

const RenderVNode = defineComponent({
  name: 'RenderVNode',
  props: {
    node: {
      type: [Object, String, Number, Function] as PropType<VNodeChild>,
      default: null,
    },
  },
  setup(renderProps) {
    return () => {
      const node = renderProps.node;

      if (isVNode(node)) {
        return node;
      }

      if (typeof node === 'function') {
        return (node as () => VNodeChild)();
      }

      return node;
    };
  },
});

const renderMode = computed<ModernRecordingRenderMode>(() => props.renderMode ?? 'modal');
const isEmbedded = computed(() => renderMode.value === 'sidebar' || renderMode.value === 'inline');
const isCompactViewport = computed(
  () => !isEmbedded.value && typeof window !== 'undefined' && window.innerWidth <= 640,
);
const shouldRender = computed(() => isEmbedded.value || props.isRecordingModalVisible);
const parameters = computed<RecordingModalParameters>(
  () => props.parameters.getUpdatedAllParams?.() ?? props.parameters,
);
const recordPaused = computed(() => parameters.value.recordPaused);
const recordingDisplayAdvice = computed(() => getRecordingDisplayAdvice(parameters.value));
const activeTab = ref<RecordingTab>('standard');
const confirmSuccess = ref(false);

let confirmResetTimer: ReturnType<typeof setTimeout> | undefined;

onBeforeUnmount(() => {
  if (confirmResetTimer) {
    clearTimeout(confirmResetTimer);
  }
});

const getAttrsWithoutKeys = (
  attrs?: HTMLAttributes | ButtonHTMLAttributes,
  keysToRemove: string[] = [],
) => {
  if (!attrs) {
    return {};
  }

  return Object.fromEntries(Object.entries(attrs).filter(([key]) => !keysToRemove.includes(key)));
};

const getStyleValue = (style?: unknown): CSSProperties =>
  style && typeof style === 'object' ? (style as CSSProperties) : {};

const joinClassNames = (...classNames: Array<string | undefined>) => {
  const filtered = classNames.filter(Boolean);
  return filtered.length > 0 ? filtered.join(' ').trim() : undefined;
};

const resolveLabel = (label: VNodeChild | undefined, fallback: VNodeChild) =>
  label === false || label == null ? fallback : label;

const resolveOptionalNode = (value: VNodeChild | undefined, fallback: VNodeChild) =>
  value === false || value == null || value === '' || (Array.isArray(value) && value.length === 0)
    ? fallback
    : value;

const getRecordingDisplayAdvice = (parameters: RecordingDisplayAdviceParameters | undefined) => {
  if (!parameters) {
    return null;
  }

  const normalizedRecordingMediaOptions =
    parameters.recordingMediaOptions === 'all' ? 'video' : parameters.recordingMediaOptions;

  if (
    !parameters.recordingVideoParticipantsFullRoomSupport &&
    parameters.recordingVideoOptions === 'all' &&
    normalizedRecordingMediaOptions === 'video' &&
    parameters.meetingDisplayType === 'all' &&
    !(parameters.breakOutRoomStarted && !parameters.breakOutRoomEnded)
  ) {
    return 'Meeting display is set to All. This recording setup may be blocked. Switch the meeting display to Media before confirming so only participants with active media are included.';
  }

  return null;
};

const panelGradientBackground =
  'linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-panel-surface) 100%)';

const panelBackground = computed(
  () =>
    props.backgroundColor ??
    panelGradientBackground,
);

const overlayStyle = computed<CSSProperties>(() => ({
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(2, 8, 23, 0.42)',
  backdropFilter: 'blur(3px)',
  WebkitBackdropFilter: 'blur(3px)',
  zIndex: 1200,
  ...getStyleValue(props.overlayProps?.style),
}));

const overlayClassName = computed(() =>
  joinClassNames('mediasfu-recording-modal', props.overlayProps?.class as string | undefined),
);

const modalPositionStyle = computed<CSSProperties>(() => {
  const position = props.position ?? 'topRight';
  const inset = isCompactViewport.value ? '10px' : '24px';

  switch (position) {
    case 'topLeft':
      return { top: inset, left: inset };
    case 'bottomRight':
      return { right: inset, bottom: inset };
    case 'bottomLeft':
      return { left: inset, bottom: inset };
    case 'center':
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    case 'topRight':
    default:
      return { top: inset, right: inset };
  }
});

const contentBaseStyle = computed<CSSProperties>(() => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  color: 'var(--ms-modern-text-primary)',
  fontFamily: 'var(--ms-modern-font-family)',
  background: panelBackground.value,
  border: '1px solid var(--ms-modern-panel-border)',
  boxShadow: 'var(--ms-modern-shadow-elevated)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  overflow: 'hidden',
  ...getStyleValue(props.contentProps?.style),
}));

const contentStyle = computed<CSSProperties>(() => {
  if (isEmbedded.value) {
    return {
      ...contentBaseStyle.value,
      position: 'relative',
      width: '100%',
      height: '100%',
      borderRadius: renderMode.value === 'inline' ? '24px' : 0,
      borderLeft:
        renderMode.value === 'sidebar' ? '1px solid var(--ms-modern-panel-border)' : contentBaseStyle.value.border,
    };
  }

  return {
    ...contentBaseStyle.value,
    position: 'fixed',
    width: isCompactViewport.value ? 'calc(100vw - 20px)' : 'min(540px, calc(100vw - 32px))',
    maxHeight: isCompactViewport.value ? 'calc(100vh - 20px)' : 'calc(100vh - 48px)',
    borderRadius: isCompactViewport.value ? '24px' : '28px',
    zIndex: 1201,
    ...modalPositionStyle.value,
  };
});

const contentClassName = computed(() =>
  joinClassNames('mediasfu-recording-modal__content', props.contentProps?.class as string | undefined),
);

const headerStyle = computed<CSSProperties>(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: isCompactViewport.value ? '12px' : '16px',
  padding: isCompactViewport.value ? '16px 16px 12px' : '20px 22px 16px',
  background: panelGradientBackground,
  ...getStyleValue(props.headerProps?.style),
}));

const headerClassName = computed(() =>
  joinClassNames('modal-header', props.headerProps?.class as string | undefined),
);

const titleStyle = computed<CSSProperties>(() => ({
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: isCompactViewport.value ? '8px' : '10px',
  color: 'var(--ms-modern-text-primary)',
  fontFamily: 'var(--ms-modern-font-family)',
  fontSize: isCompactViewport.value ? '0.96rem' : '1rem',
  fontWeight: 700,
  letterSpacing: '0.01em',
  ...getStyleValue(props.titleProps?.style),
}));

const titleClassName = computed(() =>
  joinClassNames('modal-title', props.titleProps?.class as string | undefined),
);

const closeButtonStyle = computed<CSSProperties>(() => ({
  width: isCompactViewport.value ? '34px' : '38px',
  height: isCompactViewport.value ? '34px' : '38px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '9999px',
  border: '1px solid var(--ms-modern-panel-border)',
  background: 'var(--ms-modern-field-background)',
  color: 'var(--ms-modern-text-primary)',
  cursor: 'pointer',
  ...getStyleValue(props.closeButtonProps?.style),
}));

const closeButtonClassName = computed(() =>
  joinClassNames('btn-close-recording', props.closeButtonProps?.class as string | undefined),
);

const headerDividerStyle = computed<CSSProperties>(() => ({
  height: '1px',
  margin: 0,
  border: 'none',
  backgroundColor: 'rgba(148, 163, 184, 0.14)',
  ...getStyleValue(props.headerDividerProps?.style),
}));

const bodyStyle = computed<CSSProperties>(() => ({
  flex: 1,
  minHeight: 0,
  padding: isCompactViewport.value ? '14px 16px 0' : '18px 22px 0',
  display: 'flex',
  flexDirection: 'column',
  gap: isCompactViewport.value ? '12px' : '16px',
  ...getStyleValue(props.bodyProps?.style),
}));

const bodyClassName = computed(() =>
  joinClassNames('modal-body', props.bodyProps?.class as string | undefined),
);

const panelsWrapperStyle = computed<CSSProperties>(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: isCompactViewport.value ? '12px' : '14px',
  flex: 1,
  minHeight: 0,
  ...getStyleValue(props.panelsWrapperProps?.style),
}));

const panelsWrapperClassName = computed(() =>
  joinClassNames('recording-modal__panels-wrapper', props.panelsWrapperProps?.class as string | undefined),
);

const tabsStyle = computed<CSSProperties>(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '6px',
  padding: '4px',
  border: '1px solid var(--ms-modern-panel-border)',
  borderRadius: isCompactViewport.value ? '16px' : '18px',
  background: 'var(--ms-modern-field-background)',
  boxShadow: 'inset 0 1px 2px rgba(2, 6, 23, 0.08)',
}));

const getTabButtonStyle = (tab: RecordingTab): CSSProperties => ({
  minHeight: isCompactViewport.value ? '40px' : '44px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: isCompactViewport.value ? '6px' : '8px',
  border: 'none',
  borderRadius: '14px',
  padding: isCompactViewport.value ? '0 10px' : '0 14px',
  cursor: 'pointer',
  fontFamily: 'var(--ms-modern-font-family)',
  fontSize: isCompactViewport.value ? '0.88rem' : '0.92rem',
  fontWeight: activeTab.value === tab ? 700 : 600,
  color:
    activeTab.value === tab
      ? 'var(--ms-modern-text-primary)'
      : 'var(--ms-modern-text-secondary)',
  background:
    activeTab.value === tab
      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(59, 130, 246, 0.14) 55%, rgba(6, 182, 212, 0.16) 100%)'
      : 'transparent',
  boxShadow:
    activeTab.value === tab
      ? '0 10px 24px rgba(59, 130, 246, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
      : 'none',
});

const panelsScrollStyle = computed<CSSProperties>(() => ({
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  padding: isCompactViewport.value ? 0 : '2px',
  ...getStyleValue(props.panelsScrollProps?.style),
}));

const panelsScrollClassName = computed(() =>
  joinClassNames('recording-modal__panels-scroll', props.panelsScrollProps?.class as string | undefined),
);

const panelsContainerStyle = computed<CSSProperties>(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: isCompactViewport.value ? '10px' : '12px',
  padding: isCompactViewport.value ? '12px' : '16px',
  borderRadius: isCompactViewport.value ? '18px' : '22px',
  border: '1px solid var(--ms-modern-panel-border)',
  background: 'var(--ms-modern-panel-surface)',
  ...getStyleValue(props.panelsContainerProps?.style),
}));

const panelsContainerClassName = computed(() =>
  joinClassNames('recording-modal__panels', props.panelsContainerProps?.class as string | undefined),
);

const panelsActionsDividerStyle = computed<CSSProperties>(() => ({
  height: '1px',
  margin: 0,
  border: 'none',
  backgroundColor: 'rgba(148, 163, 184, 0.14)',
  ...getStyleValue(props.panelsActionsDividerProps?.style),
}));

const panelsActionsDividerClassName = computed(() =>
  joinClassNames(
    'recording-modal__divider',
    props.panelsActionsDividerProps?.class as string | undefined,
  ),
);

const actionsWrapperStyle = computed<CSSProperties>(() => ({
  display: 'grid',
  gridTemplateColumns: recordPaused.value ? '1fr' : 'repeat(2, minmax(0, 1fr))',
  gap: isCompactViewport.value ? '10px' : '12px',
  padding: isCompactViewport.value ? '14px 16px 16px' : '18px 22px 22px',
  background: 'linear-gradient(180deg, transparent 0%, var(--ms-modern-page-background-accent) 100%)',
  ...getStyleValue(props.actionsWrapperProps?.style),
}));

const actionsWrapperClassName = computed(() =>
  joinClassNames('recording-modal__actions', props.actionsWrapperProps?.class as string | undefined),
);

const recordingAdviceStyle = computed<CSSProperties>(() => ({
  gridColumn: '1 / -1',
  padding: isCompactViewport.value ? '11px 12px' : '12px 14px',
  borderRadius: '16px',
  border: '1px solid rgba(245, 158, 11, 0.28)',
  background: 'rgba(245, 158, 11, 0.14)',
  color: 'var(--ms-modern-text-primary)',
  fontFamily: 'var(--ms-modern-font-family)',
  fontSize: isCompactViewport.value ? '0.8rem' : '0.84rem',
  fontWeight: 600,
  lineHeight: 1.5,
}));

const confirmButtonStyle = computed<CSSProperties>(() => ({
  minHeight: isCompactViewport.value ? '44px' : '48px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: isCompactViewport.value ? '8px' : '10px',
  borderRadius: '9999px',
  border: confirmSuccess.value ? 'none' : '1px solid var(--ms-modern-panel-border)',
  background: confirmSuccess.value
    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.92) 0%, rgba(22, 163, 74, 0.92) 100%)'
    : 'var(--ms-modern-field-background)',
  color: 'var(--ms-modern-text-primary)',
  cursor: 'pointer',
  fontFamily: 'var(--ms-modern-font-family)',
  fontSize: isCompactViewport.value ? '0.9rem' : '0.94rem',
  fontWeight: 700,
  ...getStyleValue(props.confirmButtonProps?.style),
}));

const confirmButtonClassName = computed(() =>
  joinClassNames('recording-modal__confirm', props.confirmButtonProps?.class as string | undefined),
);

const startButtonStyle = computed<CSSProperties>(() => ({
  minHeight: isCompactViewport.value ? '44px' : '48px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: isCompactViewport.value ? '8px' : '10px',
  borderRadius: '9999px',
  border: 'none',
  background:
    'linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 55%, var(--ms-modern-accent) 100%)',
  boxShadow: 'var(--ms-modern-shadow-soft)',
  color: 'var(--ms-modern-text-primary)',
  cursor: 'pointer',
  fontFamily: 'var(--ms-modern-font-family)',
  fontSize: isCompactViewport.value ? '0.9rem' : '0.94rem',
  fontWeight: 700,
  ...getStyleValue(props.startButtonProps?.style),
}));

const startButtonClassName = computed(() =>
  joinClassNames('recording-modal__start', props.startButtonProps?.class as string | undefined),
);

const handleClose = () => {
  props.onClose();
};

const handleConfirm = async () => {
  await props.confirmRecording({ parameters: parameters.value });
  confirmSuccess.value = true;

  if (confirmResetTimer) {
    clearTimeout(confirmResetTimer);
  }

  confirmResetTimer = setTimeout(() => {
    confirmSuccess.value = false;
  }, 1800);
};

const handleStart = async () => {
  await props.startRecording({ parameters: parameters.value });
  props.onClose();
};

const handleCloseClick: MouseEventHandler = async (event) => {
  if (typeof props.closeButtonProps?.onClick === 'function') {
    await (props.closeButtonProps.onClick as MouseEventHandler)(event);
  }

  if (!event.defaultPrevented) {
    handleClose();
  }
};

const handleConfirmClick: MouseEventHandler = async (event) => {
  if (typeof props.confirmButtonProps?.onClick === 'function') {
    await (props.confirmButtonProps.onClick as MouseEventHandler)(event);
  }

  if (!event.defaultPrevented) {
    await handleConfirm();
  }
};

const handleStartClick: MouseEventHandler = async (event) => {
  if (typeof props.startButtonProps?.onClick === 'function') {
    await (props.startButtonProps.onClick as MouseEventHandler)(event);
  }

  if (!event.defaultPrevented) {
    await handleStart();
  }
};

const renderTabButton = (tab: RecordingTab, label: string, icon: typeof faVideo) =>
  h(
    'button',
    {
      type: 'button',
      style: getTabButtonStyle(tab),
      onClick: () => {
        activeTab.value = tab;
      },
    },
    [
      h(FontAwesomeIcon, { icon, fixedWidth: true }),
      label,
    ],
  );

const defaultHeaderNode = computed(() => {
  const title = resolveLabel(props.title, 'Recording Settings');
  const closeIcon = resolveOptionalNode(
    props.closeIconComponent,
    h('span', { 'aria-hidden': 'true', style: { fontSize: '1.18rem', lineHeight: 1 } }, '×'),
  );

  return h(
    'div',
    {
      class: headerClassName.value,
      style: headerStyle.value,
      ...getAttrsWithoutKeys(props.headerProps, ['class', 'style']),
    },
    [
      h(
        'h2',
        {
          class: titleClassName.value,
          style: titleStyle.value,
          ...getAttrsWithoutKeys(props.titleProps, ['class', 'style']),
        },
        [
          h(FontAwesomeIcon, { icon: faCircle, fixedWidth: true }),
          title,
        ],
      ),
      h(
        'button',
        {
          type: 'button',
          class: closeButtonClassName.value,
          style: closeButtonStyle.value,
          onClick: handleCloseClick,
          ...getAttrsWithoutKeys(props.closeButtonProps, ['class', 'style', 'onClick']),
        },
        [closeIcon],
      ),
    ],
  );
});

const defaultPanelsNode = computed(() => {
  const activePanel =
    activeTab.value === 'standard'
      ? h(ModernStandardPanelComponent, { parameters: parameters.value })
      : h(ModernAdvancedPanelComponent, { parameters: parameters.value });

  return h(
    'div',
    {
      class: panelsWrapperClassName.value,
      style: panelsWrapperStyle.value,
      ...getAttrsWithoutKeys(props.panelsWrapperProps, ['class', 'style']),
    },
    [
      h('div', { style: tabsStyle.value }, [
        renderTabButton('standard', 'Standard', faVideo),
        renderTabButton('advanced', 'Advanced', faCog),
      ]),
      h(
        'div',
        {
          class: panelsScrollClassName.value,
          style: panelsScrollStyle.value,
          ...getAttrsWithoutKeys(props.panelsScrollProps, ['class', 'style']),
        },
        [
          h(
            'div',
            {
              class: panelsContainerClassName.value,
              style: panelsContainerStyle.value,
              ...getAttrsWithoutKeys(props.panelsContainerProps, ['class', 'style']),
            },
            [activePanel],
          ),
        ],
      ),
    ],
  );
});

const defaultActionsNode = computed(() => {
  const confirmLabel = resolveLabel(
    props.confirmButtonLabel,
    [h(FontAwesomeIcon, { icon: faCheck, fixedWidth: true }), confirmSuccess.value ? 'Confirmed!' : 'Confirm'],
  );
  const startLabel = resolveLabel(
    props.startButtonLabel,
    [h(FontAwesomeIcon, { icon: faPlay, fixedWidth: true }), 'Start Recording'],
  );

  return h(
    'div',
    {
      class: actionsWrapperClassName.value,
      style: actionsWrapperStyle.value,
      ...getAttrsWithoutKeys(props.actionsWrapperProps, ['class', 'style']),
    },
    [
      recordingDisplayAdvice.value
        ? h(
            'div',
            {
              class: 'recording-modal__advice',
              style: recordingAdviceStyle.value,
            },
            recordingDisplayAdvice.value,
          )
        : null,
      h(
        'button',
        {
          type: 'button',
          class: confirmButtonClassName.value,
          style: confirmButtonStyle.value,
          onClick: handleConfirmClick,
          ...getAttrsWithoutKeys(props.confirmButtonProps, ['class', 'style', 'onClick']),
        },
        Array.isArray(confirmLabel) ? confirmLabel : [confirmLabel],
      ),
      !recordPaused.value
        ? h(
            'button',
            {
              type: 'button',
              class: startButtonClassName.value,
              style: startButtonStyle.value,
              onClick: handleStartClick,
              ...getAttrsWithoutKeys(props.startButtonProps, ['class', 'style', 'onClick']),
            },
            Array.isArray(startLabel) ? startLabel : [startLabel],
          )
        : null,
    ].filter(Boolean),
  );
});

const defaultBodyNode = computed(() => {
  const panelsNode = props.renderPanels
    ? props.renderPanels({ defaultPanels: defaultPanelsNode.value, parameters: parameters.value })
    : defaultPanelsNode.value;

  return h(
    'div',
    {
      class: bodyClassName.value,
      style: bodyStyle.value,
      ...getAttrsWithoutKeys(props.bodyProps, ['class', 'style']),
    },
    [
      panelsNode,
      h('hr', {
        class: panelsActionsDividerClassName.value,
        style: panelsActionsDividerStyle.value,
        ...getAttrsWithoutKeys(props.panelsActionsDividerProps, ['class', 'style']),
      }),
    ],
  );
});

const buildContentNode = () => {
  const headerNode = props.renderHeader
    ? props.renderHeader({ defaultHeader: defaultHeaderNode.value, onClose: props.onClose })
    : defaultHeaderNode.value;
  const bodyNode = props.renderBody
    ? props.renderBody({ defaultBody: defaultBodyNode.value })
    : defaultBodyNode.value;
  const actionsNode = props.renderActions
    ? props.renderActions({
        defaultActions: defaultActionsNode.value,
        recordPaused: recordPaused.value,
        handleConfirm: () => {
          void handleConfirm();
        },
        handleStart: () => {
          void handleStart();
        },
      })
    : defaultActionsNode.value;

  return h(
    'div',
    {
      class: contentClassName.value,
      style: contentStyle.value,
      ...getAttrsWithoutKeys(props.contentProps, ['class', 'style']),
    },
    [
      headerNode,
      h('hr', {
        style: headerDividerStyle.value,
        ...getAttrsWithoutKeys(props.headerDividerProps, ['style']),
      }),
      bodyNode,
      actionsNode,
    ],
  );
};

const rootNode = computed(() => {
  if (!shouldRender.value) {
    return null;
  }

  const defaultContent = buildContentNode();
  const contentNode = props.renderContent
    ? props.renderContent({ defaultContent })
    : defaultContent;

  if (isEmbedded.value) {
    return contentNode;
  }

  return h('div', null, [
    h('div', {
      class: overlayClassName.value,
      style: overlayStyle.value,
      ...getAttrsWithoutKeys(props.overlayProps, ['class', 'style']),
    }),
    contentNode,
  ]);
});
</script>

<style scoped>
.recording-modal__panels-scroll {
  scrollbar-color: rgba(148, 163, 184, 0.36) transparent;
}

.recording-modal__panels :deep(.ms-modern-recording-panel) {
  min-width: 0;
}
</style>