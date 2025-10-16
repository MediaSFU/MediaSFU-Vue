<!--
/**
 * @fileoverview ScreenboardModal - Modal for managing screenboard canvas annotations
 * @component ScreenboardModal
 * @module components/screenboardComponents/ScreenboardModal
 * 
 * @description
 * A modal that controls the screenboard annotation system during screen sharing sessions.
 * Manages canvas overlay, annotation toggle, and integrates with MediaSoup transport for
 * streaming annotated screen content. Provides a simple interface with annotation toggle
 * button and canvas preview.
 * 
 * This component is the **control interface** for the Screenboard component. It allows
 * hosts to enable/disable annotation mode and handles the canvas-to-stream pipeline for
 * broadcasting annotated screen shares to all participants.
 * 
 * Key Features:
 * - Toggle annotation mode on/off
 * - Canvas preview display
 * - MediaSoup transport integration
 * - Processed stream management (original screen + annotations)
 * - Automatic cleanup on close
 * - Customizable positioning and styling
 * - Close button to exit annotation mode
 * 
 * Technical Details:
 * - Creates canvas element for annotation overlay
 * - Captures canvas stream via captureStream()
 * - Merges screen stream with canvas stream
 * - Streams combined result via MediaSoup transport
 * - Stores processed stream in processedScreenStream
 * 
 * Workflow:
 * 1. User starts screen sharing → screen stream active
 * 2. Host opens ScreenboardModal from menu or annotation button
 * 3. Modal displays canvas preview and toggle button
 * 4. Host enables annotations → canvas overlay activates
 * 5. Screenboard component renders annotation tools
 * 6. Annotations drawn on canvas → combined with screen stream
 * 7. Processed stream (screen + annotations) sent to all participants
 * 8. Host closes modal → annotations disabled, streams cleaned up
 * 
 * @example Basic Usage
 * // <ScreenboardModal
 *   // :isVisible="isScreenboardModalVisible"
 *   // :parameters="{
 *     localStreamScreen: screenStream,
 *     shared: isScreenSharing,
 *     hostLabel: 'Host',
 *     annotateScreenStream: isAnnotating,
 *     processedScreenStream: processedStream,
 *     mainScreenCanvas: canvasElement,
 *     canvasScreenboard: screenboardCanvas,
 *     transportCreated: isTransportReady,
 *     screenProducer: screenProducerInstance,
 *     updateLocalStreamScreen: setLocalStreamScreen,
 *     updateProcessedScreenStream: setProcessedStream,
 *     updateMainScreenCanvas: setMainCanvas,
 *     sleep: sleepFunction,
 *     createSendTransport: createTransport,
 *     disconnectSendTransportScreen: disconnectTransport,
 *     connectSendTransportScreen: connectTransport,
 *     stopShareScreen: stopScreen,
 *     prepopulateUserMedia: prepopulateMedia,
 *     getUpdatedAllParams: getAllParams
 *   }"
 *   // :onClose="() => setIsScreenboardModalVisible(false)"
 *   // position="topRight"
 *   // backgroundColor="#83c0e9"
 * // />
 * 
 * @remarks
 * This component manages the annotation control interface, not the annotation canvas itself.
 * The actual drawing tools are in the Screenboard component. ScreenboardModal handles the
 * stream processing pipeline: screen stream → canvas overlay → combined stream → MediaSoup.
 * Closing the modal automatically stops annotation mode and cleans up streams.
 * 
 * @see {@link Screenboard} - Annotation canvas component with drawing tools
 */
-->
<template>
  <RenderVNode :node="overlayNode" />
</template>

<script setup lang="ts">
import { ref, computed, watch, defineOptions, onUnmounted, defineComponent, h, isVNode, type PropType, type VNodeChild, type HTMLAttributes, type StyleValue } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import type { Producer } from 'mediasoup-client';
import type {
  ConnectSendTransportScreenType,
  CreateSendTransportType,
  DisconnectSendTransportScreenType,
  PrepopulateUserMediaType,
  StopShareScreenType,
  SleepType,
  ConnectSendTransportScreenParameters,
  CreateSendTransportParameters,
  DisconnectSendTransportScreenParameters,
  PrepopulateUserMediaParameters,
  StopShareScreenParameters,
} from 'mediasfu-shared';

/**
 * Parameters interface for ScreenboardModal
 * @interface ScreenboardModalParameters
 * 
 * @property {MediaStream|null} localStreamScreen - Original screen share stream
 * @property {boolean} shared - Whether screen is currently being shared
 * @property {string} hostLabel - Label for host user
 * @property {boolean} annotateScreenStream - Whether annotation mode is enabled
 * @property {MediaStream|null} processedScreenStream - Combined screen+annotation stream
 * @property {HTMLCanvasElement|null} mainScreenCanvas - Main screen canvas element
 * @property {HTMLCanvasElement|null} canvasScreenboard - Screenboard annotation canvas
 * @property {boolean} transportCreated - Whether MediaSoup transport is ready
 * @property {Producer|null} screenProducer - MediaSoup producer for screen stream
 * @property {function} updateLocalStreamScreen - Update local screen stream
 * @property {function} updateProcessedScreenStream - Update processed stream
 * @property {function} updateMainScreenCanvas - Update main canvas reference
 * @property {function} sleep - Sleep/delay utility function
 * @property {function} createSendTransport - Create MediaSoup send transport
 * @property {function} disconnectSendTransportScreen - Disconnect screen transport
 * @property {function} connectSendTransportScreen - Connect screen transport
 * @property {function} stopShareScreen - Stop screen sharing
 * @property {function} prepopulateUserMedia - Setup user media
 * @property {function} getUpdatedAllParams - Get latest parameters
 */
export interface ScreenboardModalParameters
  extends ConnectSendTransportScreenParameters,
    CreateSendTransportParameters,
    DisconnectSendTransportScreenParameters,
    PrepopulateUserMediaParameters,
    StopShareScreenParameters {
  localStreamScreen: MediaStream | null;
  shared: boolean;
  hostLabel: string;
  annotateScreenStream: boolean;
  processedScreenStream: MediaStream | null;
  mainScreenCanvas: HTMLCanvasElement | null;
  canvasScreenboard: HTMLCanvasElement | null;
  transportCreated: boolean;
  screenProducer: Producer | null;

  updateLocalStreamScreen: (stream: MediaStream | null) => void;
  updateProcessedScreenStream: (stream: MediaStream | null) => void;
  updateMainScreenCanvas: (canvas: HTMLCanvasElement | null) => void;

  sleep: SleepType;
  createSendTransport: CreateSendTransportType;
  disconnectSendTransportScreen: DisconnectSendTransportScreenType;
  connectSendTransportScreen: ConnectSendTransportScreenType;
  stopShareScreen: StopShareScreenType;
  prepopulateUserMedia: PrepopulateUserMediaType;

  getUpdatedAllParams: () => ScreenboardModalParameters;
  [key: string]: unknown;
};

export interface ScreenboardModalProps {
  parameters: ScreenboardModalParameters;
  isVisible: boolean;
  onClose: () => void;
  position?: string;
  backgroundColor?: string;
  
  // UI override props
  overlayProps?: HTMLAttributes;
  contentProps?: HTMLAttributes;
  headerProps?: HTMLAttributes;
  titleProps?: HTMLAttributes;
  closeButtonProps?: HTMLAttributes;
  dividerProps?: HTMLAttributes;
  videoContainerProps?: HTMLAttributes;
  videoProps?: HTMLAttributes;
  canvasProps?: HTMLAttributes;
  
  // Label customization
  title?: VNodeChild;
  
  // Icon customization
  closeIconComponent?: VNodeChild;
  
  // Render hooks
  renderHeader?: (props: {
    title: VNodeChild;
    closeButton: VNodeChild;
  }) => VNodeChild;
  renderContent?: (props: {
    header: VNodeChild;
    divider: VNodeChild;
    videoContainer: VNodeChild;
  }) => VNodeChild;
}

const props = withDefaults(defineProps<ScreenboardModalProps>(), {
  position: 'topRight',
  backgroundColor: '#83c0e9',
  overlayProps: undefined,
  contentProps: undefined,
  headerProps: undefined,
  titleProps: undefined,
  closeButtonProps: undefined,
  dividerProps: undefined,
  videoContainerProps: undefined,
  videoProps: undefined,
  canvasProps: undefined,
  title: undefined,
  closeIconComponent: undefined,
  renderHeader: undefined,
  renderContent: undefined,
});

defineOptions({
  components: { FontAwesomeIcon },
});

const annotationInterval = ref<number | null>(null);
const clonedStreamScreen = ref<MediaStream | null>(null);
const screenVideoRef = ref<HTMLVideoElement | null>(null);
const screenCanvasRef = ref<HTMLCanvasElement | null>(null);

let params = props.parameters.getUpdatedAllParams();

const showModal = async () => {
  params = props.parameters.getUpdatedAllParams();
  let {
    annotateScreenStream,
    shared,
    createSendTransport,
    connectSendTransportScreen,
    prepopulateUserMedia,
    hostLabel,
    sleep,
    transportCreated,
    processedScreenStream,
  } = params;

  const screenVideo = screenVideoRef.value;

  try {
    if (annotateScreenStream && shared) {
      screenVideo?.classList.remove('d-none');
      annotatationPreview();
      setTimeout(async () => {
        params = props.parameters.getUpdatedAllParams();
        transportCreated = params.transportCreated;
        createSendTransport = params.createSendTransport;
        connectSendTransportScreen = params.connectSendTransportScreen;
        prepopulateUserMedia = params.prepopulateUserMedia;
        hostLabel = params.hostLabel;
        sleep = params.sleep;
        processedScreenStream = params.processedScreenStream;

        if (!transportCreated) {
          await createSendTransport({ option: 'screen', parameters: params });
        } else {
          try {
            await handleScreenTransport();
            await sleep({ ms: 250 });
          } catch (error) {
            console.error(error);
          }
          params = props.parameters.getUpdatedAllParams();
          processedScreenStream = params.processedScreenStream;
          connectSendTransportScreen = params.connectSendTransportScreen;

          if (processedScreenStream) {
            await connectSendTransportScreen({
              stream: processedScreenStream,
              parameters: params,
            });
          }
        }
        params = props.parameters.getUpdatedAllParams();
        prepopulateUserMedia = params.prepopulateUserMedia;
        hostLabel = params.hostLabel;
        await prepopulateUserMedia({ name: hostLabel, parameters: params });
      }, 100);
    } else {
      screenVideo?.classList.add('d-none');
    }
  } catch (error) {
    console.error(error);
  }
};

const hideModal = async () => {
  params = props.parameters.getUpdatedAllParams();
  let {
    annotateScreenStream,
    shared,
    createSendTransport,
    disconnectSendTransportScreen,
    connectSendTransportScreen,
    prepopulateUserMedia,
    hostLabel,
    sleep,
    transportCreated,
    localStreamScreen,
    updateLocalStreamScreen,
  } = params;

  const screenVideo = screenVideoRef.value;

  try {
    if (!annotateScreenStream) {
      try {
        await stopAnnotation();
      } catch {
        // Handle error
      }

      if (shared) {
        if (!transportCreated) {
          await createSendTransport({ option: 'screen', parameters: params });
        } else {
          try {
            await disconnectSendTransportScreen({ parameters: params });
            await sleep({ ms: 500 });
          } catch (error) {
            console.error(error);
          }

          params = props.parameters.getUpdatedAllParams();
          localStreamScreen = params.localStreamScreen;
          updateLocalStreamScreen = params.updateLocalStreamScreen;

          const localVideoTrack = localStreamScreen?.getVideoTracks()[0];
          if (
            localStreamScreen &&
            localStreamScreen.getVideoTracks().length > 0 &&
            localVideoTrack &&
            localVideoTrack.readyState === 'ended'
          ) {
            localStreamScreen.removeTrack(localVideoTrack);
            const clonedVideoTrack = clonedStreamScreen.value?.getVideoTracks()[0];
            if (clonedVideoTrack) {
              localStreamScreen.addTrack(clonedVideoTrack.clone());
            }
            updateLocalStreamScreen(localStreamScreen);
          }

          const clonedVideoTrack = clonedStreamScreen.value?.getVideoTracks()[0];
          if (clonedVideoTrack) {
            clonedVideoTrack.onended = async () => {
              params = props.parameters.getUpdatedAllParams();
              await disconnectSendTransportScreen({ parameters: params });
              await params.stopShareScreen({ parameters: params });
            };
          }

          params = props.parameters.getUpdatedAllParams();
          connectSendTransportScreen = params.connectSendTransportScreen;
          localStreamScreen = params.localStreamScreen;

          await connectSendTransportScreen({
            stream: localStreamScreen!,
            parameters: params,
          });
        }
      } else {
        await stopAllTracks();
      }

      params = props.parameters.getUpdatedAllParams();
      prepopulateUserMedia = params.prepopulateUserMedia;
      hostLabel = params.hostLabel;
      await prepopulateUserMedia({ name: hostLabel, parameters: params });
    }

    screenVideo?.classList.add('d-none');
    if (params.mainScreenCanvas) {
      screenCanvasRef.value?.classList.add('d-none');
    }
  } catch (error) {
    console.error(error, 'Error stopping the video stream');
  }
};

watch(
  () => props.isVisible,
  (newVal) => {
    if (newVal) {
      showModal();
    } else {
      hideModal();
    }
  },
  { immediate: true }
);

watch(
  () => props.parameters,
  () => {
    params = props.parameters.getUpdatedAllParams();
  },
  { deep: true }
);

onUnmounted(async () => {
  try {
   await stopAnnotation();
   await stopAllTracks();
  } catch {
    //console.error(error);
  }
});

const annotatationPreview = () => {
  params = props.parameters.getUpdatedAllParams();
  const {
    annotateScreenStream,
    localStreamScreen,
    mainScreenCanvas,
    updateMainScreenCanvas,
    canvasScreenboard,
    updateProcessedScreenStream,
  } = params;

  const screenVideo = screenVideoRef.value;

  let canvas: HTMLCanvasElement | null = mainScreenCanvas;
  if (!canvas) {
    canvas = screenCanvasRef.value!;
    updateMainScreenCanvas(canvas!);
  }

  const clonedVideoTrack = clonedStreamScreen.value?.getVideoTracks()[0];
  if (
    annotateScreenStream &&
    (!clonedStreamScreen.value ||
      (clonedStreamScreen.value &&
        clonedStreamScreen.value.getVideoTracks().length > 0 &&
        clonedVideoTrack &&
        clonedVideoTrack.readyState === 'ended'))
  ) {
    const originalTrack = localStreamScreen?.getVideoTracks()[0];
    if (!originalTrack) return;
    
    const originalSettings = originalTrack.getSettings();
    const cloned = originalTrack.clone();
    cloned.applyConstraints({
      width: originalSettings.width,
      height: originalSettings.height,
      frameRate: originalSettings.frameRate,
      aspectRatio: originalSettings.aspectRatio,
    });
    clonedStreamScreen.value = new MediaStream([cloned]);
  }

  const localVideoTrack2 = localStreamScreen?.getVideoTracks()[0];
  if (
    clonedStreamScreen.value &&
    localStreamScreen &&
    localStreamScreen.getVideoTracks().length > 0 &&
    localVideoTrack2 &&
    localVideoTrack2.readyState === 'ended'
  ) {
    localStreamScreen.removeTrack(localVideoTrack2);
    const clonedTrack = clonedStreamScreen.value.getVideoTracks()[0];
    if (clonedTrack) {
      localStreamScreen.addTrack(clonedTrack.clone());
    }
  }

  if (clonedStreamScreen.value) {
    const clonedTrack = clonedStreamScreen.value.getVideoTracks()[0];
    if (clonedTrack) {
      clonedTrack.onended = async () => {
        await params.disconnectSendTransportScreen({ parameters: params });
        await params.stopShareScreen({ parameters: params });
      };
    }
  }

  const mediaCanvas = canvas!;
  const ctx = mediaCanvas!.getContext('2d')!;
  const localVideoTrackSettings = localStreamScreen?.getVideoTracks()[0];
  if (!localVideoTrackSettings) return;
  
  mediaCanvas!.width = localVideoTrackSettings.getSettings().width!;
  mediaCanvas!.height = localVideoTrackSettings.getSettings().height!;

  if (!annotateScreenStream) {
    updateProcessedScreenStream(null);
  }

  const annotateVideo = clonedStreamScreen.value;
  if (annotateVideo && annotateScreenStream) {
    const annotateVideoTrack = annotateVideo.getVideoTracks()[0];
    if (!annotateVideoTrack) return;
    
    screenVideo!.style.width = `${annotateVideoTrack.getSettings().width}px`;
    screenVideo!.style.height = `${annotateVideoTrack.getSettings().height}px`;
    screenVideo!.srcObject = annotateVideo;
    annotateImage();
  }

  const canvasElement = canvasScreenboard;
  canvasElement!.width = mediaCanvas!.width;
  canvasElement!.height = mediaCanvas!.height;

  function drawCombined() {
    ctx.clearRect(0, 0, canvasElement!.width, canvasElement!.height);
    ctx.drawImage(screenVideo!, 0, 0, canvasElement!.width, canvasElement!.height);
    ctx.drawImage(canvasElement!, 0, 0, canvasElement!.width, canvasElement!.height);
    ctx.restore();
  }

  async function captureStream() {
    const stream = mediaCanvas!.captureStream(30);
    annotationInterval.value = window.setInterval(() => {
      drawCombined();
    }, 30);
    return stream;
  }

  async function annotateImage() {
    const stream = await captureStream();
    updateProcessedScreenStream(stream);
    params.processedScreenStream = stream;
  }
};

const handleScreenTransport = async () => {
  params = props.parameters.getUpdatedAllParams();
  const {
    localStreamScreen,
    screenProducer,
    disconnectSendTransportScreen,
  } = params;

  const localVideoTrack = localStreamScreen?.getVideoTracks()[0];
  if (
    localStreamScreen &&
    localStreamScreen.getVideoTracks().length > 0 &&
    localVideoTrack &&
    localVideoTrack.id === screenProducer?.track?.id
  ) {
    const clonedVideoTrack = clonedStreamScreen.value?.getVideoTracks()[0];
    if (
      clonedStreamScreen.value &&
      clonedStreamScreen.value.getVideoTracks().length > 0 &&
      clonedVideoTrack &&
      clonedVideoTrack.readyState === 'ended'
    ) {
      clonedStreamScreen.value.removeTrack(clonedVideoTrack);
      const localTrackClone = localVideoTrack.clone();
      clonedStreamScreen.value.addTrack(localTrackClone);
    }

    localStreamScreen.removeTrack(localVideoTrack);
    const clonedTrack = clonedStreamScreen.value?.getVideoTracks()[0];
    if (clonedTrack) {
      localStreamScreen.addTrack(clonedTrack.clone());
    }
  }

  await disconnectSendTransportScreen({ parameters: params });
};

const stopAnnotation = async () => {
  if (annotationInterval.value) {
    clearInterval(annotationInterval.value);
    annotationInterval.value = null;
  }

  params = props.parameters.getUpdatedAllParams();
  const { processedScreenStream, updateProcessedScreenStream, mainScreenCanvas } = params;

  if (processedScreenStream) {
    processedScreenStream.getTracks().forEach((track) => track.stop());
    updateProcessedScreenStream(null);
  }

  if (mainScreenCanvas) {
    mainScreenCanvas
      .getContext('2d')
      ?.clearRect(0, 0, mainScreenCanvas.width, mainScreenCanvas.height);
  }
};

const stopAllTracks = async () => {
  params = props.parameters.getUpdatedAllParams();
  const {
    localStreamScreen,
    updateLocalStreamScreen,
    processedScreenStream,
    updateProcessedScreenStream,
  } = params;

  try {
    if (localStreamScreen && localStreamScreen.getVideoTracks().length > 0) {
      localStreamScreen.getVideoTracks().forEach((track) => track.stop());
      updateLocalStreamScreen(null);
    }
  } catch {
    //console.error(error);
  }

  try {
    if (
      clonedStreamScreen.value &&
      clonedStreamScreen.value.getVideoTracks().length > 0
    ) {
      clonedStreamScreen.value.getVideoTracks().forEach((track) => track.stop());
    }
  } catch {
    // console.error(error);
  }

  try {
    if (processedScreenStream) {
      processedScreenStream.getTracks().forEach((track) => track.stop());
      updateProcessedScreenStream(null);
    }
  } catch {
    // console.error(error);
  }

  clonedStreamScreen.value = null;
};

// Inline RenderVNode component
const RenderVNode = defineComponent({
  name: 'RenderVNode',
  props: {
    node: {
      type: [Object, String, Number, Function] as PropType<VNodeChild>,
      default: null
    }
  },
  setup(props) {
    return () => {
      const node = props.node
      if (isVNode(node)) {
        return node
      } else if (typeof node === 'function') {
        return (node as () => VNodeChild)()
      } else {
        return node
      }
    }
  }
})

// Helper functions
const joinClassNames = (...classes: (string | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ')
}

const safeSpreadStyle = (style: StyleValue | undefined) => {
  return style && typeof style === 'object' ? style : {}
}

// Computed properties for styles
const defaultOverlayWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.8, 500) : 500

const overlayStyle = computed(() => ({
  position: 'fixed' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: props.isVisible ? 'block' : 'none',
  zIndex: 999,
  ...safeSpreadStyle(props.overlayProps?.style)
}))

const overlayClassName = computed(() =>
  joinClassNames('screenboard-modal', props.overlayProps?.class as string)
)

const contentStyle = computed(() => ({
  position: 'fixed' as const,
  backgroundColor: props.backgroundColor,
  borderRadius: '10px',
  padding: '10px',
  width: `${defaultOverlayWidth}px`,
  maxWidth: `${defaultOverlayWidth}px`,
  maxHeight: '75%',
  overflowY: 'auto' as const,
  overflowX: 'hidden' as const,
  top: props.position.includes('top') ? '10px' : 'auto',
  bottom: props.position.includes('bottom') ? '10px' : 'auto',
  left: props.position.includes('Left') ? '10px' : 'auto',
  right: props.position.includes('Right') ? '10px' : 'auto',
  ...safeSpreadStyle(props.contentProps?.style)
}))

const contentClassName = computed(() =>
  joinClassNames('screenboard-modal__content', props.contentProps?.class as string)
)

// Main overlay node
const overlayNode = computed(() => {
  const defaultCloseIcon = props.closeIconComponent ?? h(FontAwesomeIcon, { icon: faTimes, size: 'xl' })
  
  const defaultTitleNode = h('div', {
    class: joinClassNames('modal-title', props.titleProps?.class as string),
    style: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: 'black',
      ...safeSpreadStyle(props.titleProps?.style)
    },
    ...(props.titleProps ? Object.fromEntries(
      Object.entries(props.titleProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, props.title ?? 'Screen Annotation')
  
  const defaultCloseButtonNode = h('div', {
    class: joinClassNames('btn-close-screenboard', props.closeButtonProps?.class as string),
    style: {
      padding: '5px',
      cursor: 'pointer',
      ...safeSpreadStyle(props.closeButtonProps?.style)
    },
    onClick: (event: MouseEvent) => {
      if (props.closeButtonProps?.onClick) {
        (props.closeButtonProps.onClick as (event: MouseEvent) => void)(event)
      }
      if (!event.defaultPrevented) {
        props.onClose()
      }
    },
    ...(props.closeButtonProps ? Object.fromEntries(
      Object.entries(props.closeButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
    ) : {})
  }, [defaultCloseIcon])
  
  const defaultHeaderNode = h('div', {
    class: joinClassNames('modal-header', props.headerProps?.class as string),
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
      ...safeSpreadStyle(props.headerProps?.style)
    },
    ...(props.headerProps ? Object.fromEntries(
      Object.entries(props.headerProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [defaultTitleNode, defaultCloseButtonNode])
  
  const headerNode = props.renderHeader
    ? props.renderHeader({
        title: defaultTitleNode,
        closeButton: defaultCloseButtonNode
      })
    : defaultHeaderNode
  
  // Divider
  const dividerNode = h('hr', {
    class: joinClassNames('screenboard-divider', props.dividerProps?.class as string),
    style: {
      height: '1px',
      backgroundColor: 'black',
      marginTop: '5px',
      marginBottom: '5px',
      ...safeSpreadStyle(props.dividerProps?.style)
    },
    ...(props.dividerProps ? Object.fromEntries(
      Object.entries(props.dividerProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  })
  
  // Video element
  const videoNode = h('video', {
    ref: screenVideoRef,
    class: joinClassNames('d-none', props.videoProps?.class as string),
    autoplay: true,
    muted: true,
    style: safeSpreadStyle(props.videoProps?.style),
    ...(props.videoProps ? Object.fromEntries(
      Object.entries(props.videoProps).filter(([key]) => !['class', 'style', 'ref', 'autoplay', 'muted'].includes(key))
    ) : {})
  })
  
  // Canvas element
  const canvasNode = h('canvas', {
    ref: screenCanvasRef,
    id: 'screenCanvas',
    class: props.canvasProps?.class as string,
    style: safeSpreadStyle(props.canvasProps?.style),
    ...(props.canvasProps ? Object.fromEntries(
      Object.entries(props.canvasProps).filter(([key]) => !['class', 'style', 'ref', 'id'].includes(key))
    ) : {})
  })
  
  // Video container
  const defaultVideoContainerNode = h('div', {
    class: joinClassNames('video-container', props.videoContainerProps?.class as string),
    style: {
      flex: 1,
      ...safeSpreadStyle(props.videoContainerProps?.style)
    },
    ...(props.videoContainerProps ? Object.fromEntries(
      Object.entries(props.videoContainerProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [videoNode, canvasNode])
  
  // Content node
  const defaultContentNode = h('div', {
    class: contentClassName.value,
    style: contentStyle.value
  }, [
    headerNode,
    dividerNode,
    defaultVideoContainerNode
  ])
  
  const contentNode = props.renderContent
    ? props.renderContent({
        header: headerNode,
        divider: dividerNode,
        videoContainer: defaultVideoContainerNode
      })
    : defaultContentNode
  
  // Overlay node
  return h('div', {
    class: overlayClassName.value,
    style: overlayStyle.value
  }, [contentNode])
})

</script>

<style scoped>
.d-none {
  display: none;
}
</style>
