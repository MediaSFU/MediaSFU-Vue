<template>
  <Teleport to="body">
    <RenderVNode :node="overlayNode" />
  </Teleport>
</template>

<script setup lang="ts">
import {
  computed,
  defineComponent,
  h,
  isVNode,
  nextTick,
  onUnmounted,
  ref,
  shallowRef,
  toRaw,
  watch,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type CanvasHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type PropType,
  type VNodeChild,
  type VideoHTMLAttributes,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import type { BackgroundModalProps, BackgroundModalPosition } from '../../types/background';
import { mergeAttrObjects, mergeStyleObjects } from '../display_components/styleUtils';

const props = withDefaults(defineProps<BackgroundModalProps>(), {
  position: 'topLeft',
  backgroundColor: undefined,
  title: () => 'Background Settings',
  overlayProps: undefined,
  contentProps: undefined,
  headerProps: undefined,
  titleProps: undefined,
  closeButtonProps: undefined,
  closeIconComponent: undefined,
  headerDividerProps: undefined,
  bodyProps: undefined,
  defaultImagesContainerProps: undefined,
  uploadWrapperProps: undefined,
  uploadLabelProps: undefined,
  uploadLabel: () => 'Upload Custom Image',
  uploadInputProps: undefined,
  mainCanvasProps: undefined,
  backgroundCanvasProps: undefined,
  captureVideoProps: undefined,
  previewVideoProps: undefined,
  loadingOverlayProps: undefined,
  loadingSpinner: undefined,
  buttonsWrapperProps: undefined,
  applyButtonProps: undefined,
  saveButtonProps: undefined,
  applyButtonLabel: () => 'Preview Background',
  applyButtonAppliedLabel: () => 'Apply Background',
  saveButtonLabel: () => 'Save Background',
  renderHeader: undefined,
  renderButtons: undefined,
  renderBody: undefined,
  renderContent: undefined,
});

const RenderVNode = defineComponent({
  name: 'RenderVNode',
  props: {
    node: {
      type: [Object, String, Number, Boolean, Array, Function] as PropType<VNodeChild>,
      default: null,
    },
  },
  render() {
    if (!this.node) return null;
    if (isVNode(this.node)) return this.node;
    if (typeof this.node === 'function') {
      const result = (this.node as () => VNodeChild)();
      return isVNode(result) ? result : String(result);
    }
    return this.node as VNodeChild;
  },
});

const panelGradientBackground =
  'linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-panel-surface) 100%)';

const customImage = ref('');
const selectedImage = ref('');
const segmentVideo = ref<MediaStream | null>(null);
const selfieSegmentation = shallowRef<SelfieSegmentation | null>(null);
const pauseSegmentation = ref(false);
const processedStream = ref<MediaStream | null>(null);
const keepBackground = ref(false);
const backgroundHasChanged = ref(false);
const virtualStream = ref<MediaStream | null>(null);
const prevKeepBackground = ref(false);
const appliedBackground = ref(false);
const autoClickBackground = ref(false);

const backgroundCanvasRef = ref<HTMLCanvasElement | null>(null);
const videoPreviewRef = ref<HTMLVideoElement | null>(null);
const captureVideoRef = ref<HTMLVideoElement | null>(null);
const applyBackgroundButtonRef = ref<HTMLButtonElement | null>(null);
const saveBackgroundButtonRef = ref<HTMLButtonElement | null>(null);
const mainCanvasRef = ref<HTMLCanvasElement | null>(null);

const clonedStream = ref<MediaStream | null>(null);
const clonedTrack = ref<MediaStreamTrack | null>(null);

const isLoading = ref(false);
const showPreviewVideo = ref(false);
const showBackgroundCanvas = ref(true);
const isApplyButtonVisible = ref(true);
const isApplyButtonDisabled = ref(false);
const isSaveButtonVisible = ref(false);
const isSaveButtonDisabled = ref(true);
const shouldShowAppliedLabel = ref(false);

const getCurrentParameters = () => props.parameters.getUpdatedAllParams?.() ?? props.parameters;

const defaultBackgroundEntries = [
  { id: 'wall', thumb: 'wall_thumbnail.jpg', preview: 'wall_small.jpg', full: 'wall.jpg', large: 'wall_large.jpg' },
  { id: 'wall2', thumb: 'wall2_thumbnail.jpg', preview: 'wall2_small.jpg', full: 'wall2.jpg', large: 'wall2_large.jpg' },
  { id: 'shelf', thumb: 'shelf_thumbnail.jpg', preview: 'shelf_small.jpg', full: 'shelf.jpg', large: 'shelf_large.jpg' },
  { id: 'clock', thumb: 'clock_thumbnail.jpg', preview: 'clock_small.jpg', full: 'clock.jpg', large: 'clock_large.jpg' },
  { id: 'desert', thumb: 'desert_thumbnail.jpg', preview: 'desert_small.jpg', full: 'desert.jpg', large: 'desert_large.jpg' },
  { id: 'flower', thumb: 'flower_thumbnail.jpg', preview: 'flower_small.jpg', full: 'flower.jpg', large: 'flower_large.jpg' },
] as const;

watch(
  () => props.parameters,
  (parameters) => {
    customImage.value = parameters.customImage ?? '';
    selectedImage.value = parameters.selectedImage ?? '';
    segmentVideo.value = parameters.segmentVideo ?? null;
    selfieSegmentation.value = parameters.selfieSegmentation ? toRaw(parameters.selfieSegmentation) : null;
    pauseSegmentation.value = parameters.pauseSegmentation ?? false;
    processedStream.value = parameters.processedStream ?? null;
    keepBackground.value = parameters.keepBackground ?? false;
    backgroundHasChanged.value = parameters.backgroundHasChanged ?? false;
    virtualStream.value = parameters.virtualStream ?? null;
    prevKeepBackground.value = parameters.prevKeepBackground ?? false;
    appliedBackground.value = parameters.appliedBackground ?? false;
    autoClickBackground.value = parameters.autoClickBackground ?? false;
  },
  { deep: true, immediate: true },
);

const normalizedTitle = computed<VNodeChild>(() => {
  const title = props.title as unknown;
  return title === false || title == null ? 'Background Settings' : props.title;
});

const normalizedUploadLabel = computed<VNodeChild>(() => {
  const label = props.uploadLabel as unknown;
  return label === false || label == null ? 'Upload Custom Image' : props.uploadLabel;
});

const normalizedPreviewLabel = computed<VNodeChild>(() => {
  const label = props.applyButtonLabel as unknown;
  return label === false || label == null ? 'Preview Background' : props.applyButtonLabel;
});

const normalizedAppliedLabel = computed<VNodeChild>(() => {
  const label = props.applyButtonAppliedLabel as unknown;
  return label === false || label == null ? 'Apply Background' : props.applyButtonAppliedLabel;
});

const normalizedSaveLabel = computed<VNodeChild>(() => {
  const label = props.saveButtonLabel as unknown;
  return label === false || label == null ? 'Save Background' : props.saveButtonLabel;
});

const toRenderableChildren = (
  value: VNodeChild,
): Exclude<VNodeChild, null | undefined | boolean | void> | undefined => {
  if (value == null || value === false) {
    return undefined;
  }

  return value as Exclude<VNodeChild, null | undefined | boolean | void>;
};

const applyButtonLabelNode = computed<VNodeChild>(() =>
  shouldShowAppliedLabel.value ? normalizedAppliedLabel.value : normalizedPreviewLabel.value,
);

const isExistingProcessedState = () =>
  Boolean(
    processedStream.value &&
      prevKeepBackground.value === keepBackground.value &&
      keepBackground.value &&
      appliedBackground.value,
  );

const resetActionButtons = () => {
  isApplyButtonVisible.value = true;
  isApplyButtonDisabled.value = false;
  isSaveButtonVisible.value = false;
  isSaveButtonDisabled.value = true;
  shouldShowAppliedLabel.value = isExistingProcessedState();
};

const showLoading = () => {
  isLoading.value = true;
};

const hideLoading = () => {
  isLoading.value = false;
};

const clearCanvas = () => {
  const canvas = backgroundCanvasRef.value;
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;

  canvas.width = 640;
  canvas.height = 360;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '30px Arial';
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('No Background', canvas.width / 2, canvas.height / 2);

  showPreviewVideo.value = false;
  showBackgroundCanvas.value = true;
  resetActionButtons();
};

const handleNoBackground = () => {
  selectedImage.value = '';
  customImage.value = '';
  props.parameters.updateSelectedImage?.('');
  props.parameters.updateCustomImage?.('');
  showLoading();
  clearCanvas();
  hideLoading();
};

const chooseResolutionSource = (entry: (typeof defaultBackgroundEntries)[number]) => {
  const parameters = getCurrentParameters();
  if (parameters.targetResolution === 'fhd' || parameters.targetResolution === 'qhd') {
    return {
      previewSrc: `https://mediasfu.com/images/backgrounds/${entry.preview}`,
      fullSrc: `https://mediasfu.com/images/backgrounds/${entry.large}`,
    };
  }

  return {
    previewSrc: `https://mediasfu.com/images/backgrounds/${entry.preview}`,
    fullSrc: `https://mediasfu.com/images/backgrounds/${entry.full}`,
  };
};

const loadImageToCanvas = async (src: string, fullSrc: string) => {
  showLoading();
  showBackgroundCanvas.value = true;
  showPreviewVideo.value = false;

  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Image failed to load.'));
    img.src = src;
  }).catch(() => undefined);

  const canvas = backgroundCanvasRef.value;
  const ctx = canvas?.getContext('2d');
  if (canvas && ctx && img.width > 0 && img.height > 0) {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  }

  selectedImage.value = fullSrc;
  props.parameters.updateSelectedImage?.(fullSrc);

  hideLoading();
  resetActionButtons();
};

const handleImageUpload = (event: Event) => {
  (props.uploadInputProps?.onChange as ((event: Event) => void) | undefined)?.(event);

  try {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;

    if (file.size > 2048 * 2048) {
      props.parameters.showAlert?.({
        message: 'File size must be less than 2MB.',
        type: 'danger',
      });
      return;
    }

    let minWidth = 1280;
    let minHeight = 1280;
    const maxWidth = 2560;
    const maxHeight = 2560;

    const parameters = getCurrentParameters();
    if (parameters.targetResolution === 'fhd') {
      minWidth = 1920;
      minHeight = 1920;
    } else if (parameters.targetResolution === 'qhd') {
      minWidth = 2560;
      minHeight = 2560;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (
        img.width < minWidth ||
        img.height < minHeight ||
        img.width > maxWidth ||
        img.height > maxHeight
      ) {
        props.parameters.showAlert?.({
          message: `Image dimensions must be at least ${minWidth}x${minHeight}.`,
          type: 'danger',
        });
        return;
      }

      customImage.value = img.src;
      props.parameters.updateCustomImage?.(customImage.value);
      void loadImageToCanvas(img.src, img.src);
    };

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      if (typeof loadEvent.target?.result === 'string') {
        img.src = loadEvent.target.result;
      }
    };
    reader.readAsDataURL(file);
  } catch {
    // Ignore upload errors.
  }
};

const preloadModel = async () => {
  const segmentation = new SelfieSegmentation({
    locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
  });

  segmentation.setOptions({
    modelSelection: 1,
    selfieMode: false,
  });

  await segmentation.initialize();
  selfieSegmentation.value = segmentation;
  props.parameters.updateSelfieSegmentation?.(segmentation);
};

const selfieSegmentationPreview = async (doSegmentation: boolean) => {
  const parameters = getCurrentParameters();
  const refVideo = captureVideoRef.value;
  const previewVideo = videoPreviewRef.value;
  const mainCanvas = parameters.mainCanvas ?? mainCanvasRef.value;

  if (!mainCanvas || !refVideo || !previewVideo) {
    return;
  }

  const virtualImage = new Image();
  virtualImage.crossOrigin = 'anonymous';
  virtualImage.src = selectedImage.value || '';

  const mediaCanvas = mainCanvas;
  mediaCanvas.width = refVideo.videoWidth;
  mediaCanvas.height = refVideo.videoHeight;
  const ctx = mediaCanvas.getContext('2d');

  backgroundHasChanged.value = true;
  props.parameters.updateBackgroundHasChanged?.(true);
  prevKeepBackground.value = keepBackground.value;
  props.parameters.updatePrevKeepBackground?.(keepBackground.value);

  if (!doSegmentation) {
    processedStream.value?.getVideoTracks().forEach((track) => track.stop());
    processedStream.value = null;
    props.parameters.updateProcessedStream?.(null);
    keepBackground.value = false;
    props.parameters.updateKeepBackground?.(false);
    previewVideo.srcObject = clonedStream.value || parameters.localStreamVideo || refVideo.srcObject;
    showPreviewVideo.value = true;
    showBackgroundCanvas.value = false;
  }

  const segmentImage = async (videoElement: HTMLVideoElement) => {
    const processFrame = () => {
      if (
        !selfieSegmentation.value ||
        pauseSegmentation.value ||
        videoElement.videoWidth === 0 ||
        videoElement.videoHeight === 0
      ) {
        return;
      }

      void selfieSegmentation.value.send({ image: videoElement });
      requestAnimationFrame(processFrame);
    };

    videoElement.onloadeddata = () => {
      processFrame();
    };

    setTimeout(async () => {
      processedStream.value = mediaCanvas.captureStream(parameters.frameRate || 5);
      previewVideo.srcObject = processedStream.value;
      props.parameters.updateProcessedStream?.(processedStream.value);
      keepBackground.value = true;
      props.parameters.updateKeepBackground?.(true);
      showPreviewVideo.value = true;
      showBackgroundCanvas.value = false;

      if (previewVideo.paused) {
        try {
          await previewVideo.play();
        } catch {
          // Ignore play errors.
        }
      }
    }, 100);
  };

  if (parameters.videoAlreadyOn) {
    if (
      clonedTrack.value &&
      clonedTrack.value.readyState === 'live' &&
      parameters.localStreamVideo?.getVideoTracks()[0]?.label === clonedTrack.value.label
    ) {
      // Reuse existing cloned track.
    } else {
      const localTrack = parameters.localStreamVideo?.getVideoTracks()[0];
      if (localTrack) {
        clonedTrack.value = localTrack.clone();
        clonedStream.value = new MediaStream([clonedTrack.value]);
        segmentVideo.value = clonedStream.value;
        props.parameters.updateSegmentVideo?.(segmentVideo.value);
      }
    }

    refVideo.srcObject = segmentVideo.value;
    if (refVideo.paused) {
      void refVideo.play().catch(() => undefined);
    }

    refVideo.width = segmentVideo.value?.getVideoTracks()[0]?.getSettings().width || 0;
    refVideo.height = segmentVideo.value?.getVideoTracks()[0]?.getSettings().height || 0;
    mediaCanvas.width = refVideo.width;
    mediaCanvas.height = refVideo.height;

    try {
      if (doSegmentation) {
        await segmentImage(refVideo);
      } else {
        previewVideo.srcObject = clonedStream.value || parameters.localStreamVideo || null;
      }
    } catch (error) {
      console.log('Error segmenting image:', error);
    }
  } else {
    if (!segmentVideo.value || segmentVideo.value.getVideoTracks()[0]?.readyState !== 'live') {
      const mediaDevices = parameters.mediaDevices ?? navigator.mediaDevices;
      if (!mediaDevices) {
        console.log('MediaDevices API not available');
        return;
      }

      try {
        segmentVideo.value = await mediaDevices.getUserMedia({
          video: { ...(parameters.vidCons ?? {}), frameRate: { ideal: parameters.frameRate } },
          audio: false,
        });
      } catch {
        try {
          segmentVideo.value = await mediaDevices.getUserMedia({
            video: { ...(parameters.vidCons ?? {}) },
            audio: false,
          });
        } catch (error) {
          console.log('Error getting user media:', error);
          return;
        }
      }

      props.parameters.updateSegmentVideo?.(segmentVideo.value);
      refVideo.srcObject = segmentVideo.value;
      if (refVideo.paused) {
        void refVideo.play().catch(() => undefined);
      }
    }

    refVideo.width = segmentVideo.value?.getVideoTracks()[0]?.getSettings().width || 0;
    refVideo.height = segmentVideo.value?.getVideoTracks()[0]?.getSettings().height || 0;
    mediaCanvas.width = refVideo.width;
    mediaCanvas.height = refVideo.height;

    try {
      if (doSegmentation) {
        await segmentImage(refVideo);
      } else {
        previewVideo.srcObject = refVideo.srcObject;
      }
    } catch {
      // Ignore preview errors.
    }
  }

  let repeatMode: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat' = 'no-repeat';
  try {
    if (virtualImage.width < mediaCanvas.width || virtualImage.height < mediaCanvas.height) {
      repeatMode = 'repeat';
    }
  } catch {
    // Ignore pattern sizing issues.
  }

  const onResults = (results: {
    segmentationMask: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement | ImageBitmap;
    image: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement | ImageBitmap;
  }) => {
    try {
      if (
        pauseSegmentation.value ||
        !ctx ||
        mediaCanvas.width <= 0 ||
        mediaCanvas.height <= 0 ||
        virtualImage.width <= 0 ||
        virtualImage.height <= 0
      ) {
        return;
      }

      ctx.save();
      ctx.clearRect(0, 0, mediaCanvas.width, mediaCanvas.height);
      ctx.drawImage(results.segmentationMask, 0, 0, mediaCanvas.width, mediaCanvas.height);
      ctx.globalCompositeOperation = 'source-out';

      const pattern = ctx.createPattern(virtualImage, repeatMode);
      if (pattern) {
        ctx.fillStyle = pattern;
      }
      ctx.fillRect(0, 0, mediaCanvas.width, mediaCanvas.height);

      ctx.globalCompositeOperation = 'destination-atop';
      ctx.drawImage(results.image, 0, 0, mediaCanvas.width, mediaCanvas.height);
      ctx.restore();
    } catch (error) {
      console.log('Error applying background:', error);
    }
  };

  if (!selfieSegmentation.value) {
    try {
      await preloadModel();
    } catch {
      console.log('Error preloading model:');
    }
  }

  try {
    selfieSegmentation.value?.onResults(onResults);
  } catch {
    // Ignore results binding errors.
  }
};

const waitForProcessedStream = async () => {
  let attempts = 0;
  while (!processedStream.value && attempts < 30) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    processedStream.value = getCurrentParameters().processedStream ?? processedStream.value ?? null;
    attempts += 1;
  }
};

const applyBackground = async () => {
  const parameters = getCurrentParameters();
  if (parameters.audioOnlyRoom) {
    parameters.showAlert?.({
      message: 'You cannot use a background in an audio only event.',
      type: 'danger',
    });
    return;
  }

  showLoading();
  showPreviewVideo.value = true;
  showBackgroundCanvas.value = false;

  const doSegmentation = Boolean(selectedImage.value);
  pauseSegmentation.value = false;
  props.parameters.updatePauseSegmentation?.(false);
  await selfieSegmentationPreview(doSegmentation);

  if (doSegmentation) {
    await waitForProcessedStream();
  }

  hideLoading();
  isApplyButtonVisible.value = false;
  isApplyButtonDisabled.value = true;

  if (isExistingProcessedState()) {
    isSaveButtonVisible.value = false;
    isSaveButtonDisabled.value = true;
  } else {
    isSaveButtonVisible.value = true;
    isSaveButtonDisabled.value = false;
  }
};

const saveBackground = async () => {
  const parameters = getCurrentParameters();
  if (parameters.audioOnlyRoom) {
    parameters.showAlert?.({
      message: 'You cannot use a background in an audio only event.',
      type: 'danger',
    });
    return;
  }

  if (backgroundHasChanged.value && parameters.videoAlreadyOn) {
    if (
      parameters.islevel === '2' &&
      (parameters.recordStarted || parameters.recordResumed) &&
      !(parameters.recordPaused || parameters.recordStopped) &&
      parameters.recordingMediaOptions === 'video'
    ) {
      parameters.showAlert?.({
        message: 'Please pause the recording before changing the background.',
        type: 'danger',
      });
      return;
    }

    let videoParams = parameters.videoParams ?? {};

    if (keepBackground.value && selectedImage.value && processedStream.value) {
      virtualStream.value = processedStream.value;
      props.parameters.updateVirtualStream?.(virtualStream.value);
      videoParams = { track: virtualStream.value.getVideoTracks()[0] };
      props.parameters.updateVideoParams?.(videoParams);
    } else if (parameters.localStreamVideo?.getVideoTracks()[0]?.readyState === 'live') {
      videoParams = { track: parameters.localStreamVideo.getVideoTracks()[0] };
      props.parameters.updateVideoParams?.(videoParams);
    } else {
      try {
        if (parameters.localStreamVideo && parameters.localStreamVideo.getVideoTracks()[0]?.readyState !== 'live') {
          const originalTrack = parameters.localStreamVideo.getVideoTracks()[0];
          if (originalTrack) {
            parameters.localStreamVideo.removeTrack(originalTrack);
          }
          const clonedTrackValue = segmentVideo.value?.getVideoTracks()[0]?.clone();
          if (clonedTrackValue) {
            parameters.localStreamVideo.addTrack(clonedTrackValue);
          }
        }
      } catch (error) {
        console.log('Error handling local stream video:', error);
      }

      videoParams = {
        track: clonedStream.value?.getVideoTracks()[0],
      };
      props.parameters.updateVideoParams?.(videoParams);
    }

    const nextTrack = (videoParams as { track?: MediaStreamTrack }).track;

    if (keepBackground.value) {
      appliedBackground.value = true;
      props.parameters.updateAppliedBackground?.(true);
    } else {
      appliedBackground.value = false;
      props.parameters.updateAppliedBackground?.(false);
    }

    if (!parameters.transportCreated) {
      await parameters.createSendTransport?.({
        option: 'video',
        parameters: { ...parameters, videoParams },
      });
    } else {
      try {
        if (parameters.videoProducer?.id && parameters.videoProducer.track?.id !== nextTrack?.id) {
          await parameters.disconnectSendTransportVideo?.({ parameters });
          await parameters.sleep?.({ ms: 500 });
        }
        await parameters.connectSendTransportVideo?.({ videoParams, parameters });
      } catch {
        // Ignore transport reconnect errors.
      }
    }

    await parameters.onScreenChanges?.({ changed: true, parameters });
  }

  if (keepBackground.value) {
    appliedBackground.value = true;
    props.parameters.updateAppliedBackground?.(true);
  } else {
    appliedBackground.value = false;
    props.parameters.updateAppliedBackground?.(false);
  }

  isSaveButtonVisible.value = false;
  isSaveButtonDisabled.value = true;
  resetActionButtons();
};

const handleAutoClickBackground = async () => {
  if (!autoClickBackground.value || !props.isVisible) {
    return;
  }

  try {
    await applyBackground();
    await saveBackground();
  } finally {
    autoClickBackground.value = false;
    props.parameters.updateAutoClickBackground?.(false);
  }
};

watch(
  () => props.isVisible,
  async (visible) => {
    await nextTick();

    if (visible) {
      if (!selfieSegmentation.value) {
        try {
          await preloadModel();
        } catch {
          console.log('Error preloading model:');
        }
      }

      if (selectedImage.value) {
        await loadImageToCanvas(selectedImage.value, selectedImage.value);
      } else {
        clearCanvas();
      }

      resetActionButtons();
      await handleAutoClickBackground();
      return;
    }

    try {
      const parameters = getCurrentParameters();
      const refVideo = captureVideoRef.value;

      if (
        !appliedBackground.value ||
        (appliedBackground.value && !keepBackground.value) ||
        (appliedBackground.value && !parameters.videoAlreadyOn)
      ) {
        pauseSegmentation.value = true;
        props.parameters.updatePauseSegmentation?.(true);

        if (!parameters.videoAlreadyOn) {
          if (refVideo?.srcObject instanceof MediaStream) {
            refVideo.srcObject.getTracks().forEach((track) => track.stop());
          }
          if (refVideo) {
            refVideo.srcObject = null;
          }

          segmentVideo.value?.getTracks().forEach((track) => track.stop());
          segmentVideo.value = null;
          props.parameters.updateSegmentVideo?.(null);

          virtualStream.value?.getTracks().forEach((track) => track.stop());
          virtualStream.value = null;
          props.parameters.updateVirtualStream?.(null);
        }
      }
    } catch {
      // Ignore cleanup errors.
    }

    showPreviewVideo.value = false;
    showBackgroundCanvas.value = true;
    hideLoading();
    resetActionButtons();
  },
  { immediate: true },
);

onUnmounted(() => {
  try {
    segmentVideo.value?.getTracks().forEach((track) => track.stop());
    virtualStream.value?.getTracks().forEach((track) => track.stop());
    clonedStream.value?.getTracks().forEach((track) => track.stop());
  } catch {
    // Ignore cleanup errors.
  }
});

const modalWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.82, 540) : 520;

const getPositionStyles = (position: BackgroundModalPosition): CSSProperties => ({
  top: position.includes('top') ? '16px' : 'auto',
  bottom: position.includes('bottom') ? '16px' : 'auto',
  left: position.includes('Left') ? '16px' : 'auto',
  right: position.includes('Right') ? '16px' : 'auto',
});

const defaultOverlayProps = computed<HTMLAttributes>(() => ({
  class: 'ms-modern-background-modal',
  style: {
    position: 'fixed',
    inset: 0,
    background: 'var(--ms-modern-overlay-backdrop)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    display: props.isVisible ? 'block' : 'none',
    zIndex: 999,
  },
}));

const overlayNodeProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(defaultOverlayProps.value, props.overlayProps),
);

const defaultContentProps = computed<HTMLAttributes>(() => ({
  class: 'ms-modern-background-modal__content',
  style: {
    position: 'fixed',
    width: `${modalWidth}px`,
    maxWidth: `min(${modalWidth}px, calc(100vw - 32px))`,
    maxHeight: 'calc(100vh - 32px)',
    overflow: 'hidden',
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    gap: 0,
    borderRadius: '28px',
    border: '1px solid var(--ms-modern-panel-border)',
    background: props.backgroundColor ?? panelGradientBackground,
    boxShadow: 'var(--ms-modern-shadow-elevated)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    color: 'var(--ms-modern-text-primary)',
    ...getPositionStyles(props.position),
  } satisfies CSSProperties,
}));

const contentNodeProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(defaultContentProps.value, props.contentProps),
);

const defaultHeaderProps = computed<HTMLAttributes>(() => ({
  class: 'ms-modern-background-modal__header',
  style: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '20px 22px 16px',
    borderBottom: '1px solid var(--ms-modern-panel-border)',
    background: panelGradientBackground,
  } satisfies CSSProperties,
}));

const headerNodeProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(defaultHeaderProps.value, props.headerProps),
);

const defaultTitleProps = computed<HTMLAttributes>(() => ({
  class: 'ms-modern-background-modal__title',
  style: {
    margin: 0,
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '0.01em',
  } satisfies CSSProperties,
}));

const titleNodeProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(defaultTitleProps.value, props.titleProps),
);

const defaultCloseButtonProps = computed<ButtonHTMLAttributes>(() => ({
  class: 'ms-modern-background-modal__close',
  style: {
    width: '38px',
    height: '38px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '9999px',
    border: '1px solid var(--ms-modern-panel-border)',
    background: 'var(--ms-modern-field-background)',
    color: 'var(--ms-modern-text-primary)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    cursor: 'pointer',
  } satisfies CSSProperties,
}));

const closeButtonNodeProps = computed<ButtonHTMLAttributes>(() =>
  mergeAttrObjects(defaultCloseButtonProps.value, props.closeButtonProps),
);

const defaultDividerProps = computed<HTMLAttributes>(() => ({
  style: {
    display: 'none',
    borderColor: 'var(--ms-modern-panel-border)',
  } satisfies CSSProperties,
}));

const dividerNodeProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(defaultDividerProps.value, props.headerDividerProps),
);

const defaultBodyProps = computed<HTMLAttributes>(() => ({
  class: 'ms-modern-background-modal__body',
  style: {
    padding: '18px 22px 22px',
    display: 'grid',
    gap: '16px',
    overflowY: 'auto',
  } satisfies CSSProperties,
}));

const bodyNodeProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(defaultBodyProps.value, props.bodyProps),
);

const defaultImagesContainerNodeProps = computed<HTMLAttributes>(() => ({
  class: 'ms-modern-background-modal__thumbs',
  style: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    padding: '14px',
    borderRadius: '20px',
    border: '1px solid var(--ms-modern-panel-border)',
    background: 'var(--ms-modern-panel-surface)',
  } satisfies CSSProperties,
}));

const imagesContainerNodeProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(defaultImagesContainerNodeProps.value, props.defaultImagesContainerProps),
);

const defaultUploadWrapperProps = computed<HTMLAttributes>(() => ({
  class: 'ms-modern-background-modal__upload',
  style: {
    display: 'grid',
    gap: '8px',
    padding: '14px',
    borderRadius: '20px',
    border: '1px dashed var(--ms-modern-panel-border)',
    background: 'var(--ms-modern-panel-surface)',
  } satisfies CSSProperties,
}));

const uploadWrapperNodeProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(defaultUploadWrapperProps.value, props.uploadWrapperProps),
);

const defaultUploadLabelProps = computed<LabelHTMLAttributes>(() => ({
  class: 'ms-modern-background-modal__upload-label',
  style: {
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontSize: '0.86rem',
    fontWeight: 700,
  } satisfies CSSProperties,
}));

const uploadLabelNodeProps = computed<LabelHTMLAttributes>(() =>
  mergeAttrObjects(defaultUploadLabelProps.value, props.uploadLabelProps),
);

const defaultUploadInputProps = computed<InputHTMLAttributes>(() => ({
  class: 'ms-modern-background-modal__upload-input',
  style: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '14px',
    border: '1px solid var(--ms-modern-field-border)',
    background: 'var(--ms-modern-field-background)',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
  } satisfies CSSProperties,
}));

const uploadInputNodeProps = computed<InputHTMLAttributes>(() =>
  mergeAttrObjects(defaultUploadInputProps.value, props.uploadInputProps),
);

const hiddenCanvasStyle = { display: 'none' } satisfies CSSProperties;

const defaultMainCanvasProps = computed<CanvasHTMLAttributes>(() => ({
  class: 'ms-modern-background-modal__main-canvas',
  style: hiddenCanvasStyle,
}));

const mainCanvasNodeProps = computed<CanvasHTMLAttributes>(() =>
  mergeAttrObjects(defaultMainCanvasProps.value, props.mainCanvasProps),
);

const defaultBackgroundCanvasProps = computed<CanvasHTMLAttributes>(() => ({
  class: 'ms-modern-background-modal__background-canvas',
  style: {
    width: '100%',
    maxHeight: '360px',
    borderRadius: '18px',
    background: 'var(--ms-modern-field-background)',
    boxShadow: 'var(--ms-modern-shadow-soft)',
    display: showBackgroundCanvas.value ? 'block' : 'none',
  } satisfies CSSProperties,
}));

const backgroundCanvasNodeProps = computed<CanvasHTMLAttributes>(() => {
  const merged = mergeAttrObjects(defaultBackgroundCanvasProps.value, props.backgroundCanvasProps);
  return {
    ...merged,
    style: mergeStyleObjects(
      typeof merged.style === 'object' ? (merged.style as CSSProperties) : undefined,
      { display: showBackgroundCanvas.value ? 'block' : 'none' },
    ),
  };
});

const defaultCaptureVideoProps = computed<VideoHTMLAttributes>(() => ({
  class: 'ms-modern-background-modal__capture-video',
  muted: true,
  autoplay: true,
  playsinline: true,
  style: hiddenCanvasStyle,
}));

const captureVideoNodeProps = computed<VideoHTMLAttributes>(() =>
  mergeAttrObjects(defaultCaptureVideoProps.value, props.captureVideoProps),
);

const defaultPreviewVideoProps = computed<VideoHTMLAttributes>(() => ({
  class: 'ms-modern-background-modal__preview-video',
  muted: true,
  autoplay: true,
  playsinline: true,
  style: {
    width: '100%',
    maxHeight: '360px',
    borderRadius: '18px',
    background: 'var(--ms-modern-field-background)',
    boxShadow: 'var(--ms-modern-shadow-soft)',
    display: showPreviewVideo.value ? 'block' : 'none',
  } satisfies CSSProperties,
}));

const previewVideoNodeProps = computed<VideoHTMLAttributes>(() => {
  const merged = mergeAttrObjects(defaultPreviewVideoProps.value, props.previewVideoProps);
  return {
    ...merged,
    style: mergeStyleObjects(
      typeof merged.style === 'object' ? (merged.style as CSSProperties) : undefined,
      { display: showPreviewVideo.value ? 'block' : 'none' },
    ),
  };
});

const defaultLoadingOverlayProps = computed<HTMLAttributes>(() => ({
  class: 'ms-modern-background-modal__loading',
  style: {
    position: 'absolute',
    inset: 0,
    display: isLoading.value ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '18px',
    background: 'var(--ms-modern-overlay-backdrop)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  } satisfies CSSProperties,
}));

const loadingOverlayNodeProps = computed<HTMLAttributes>(() => {
  const merged = mergeAttrObjects(defaultLoadingOverlayProps.value, props.loadingOverlayProps);
  return {
    ...merged,
    style: mergeStyleObjects(
      typeof merged.style === 'object' ? (merged.style as CSSProperties) : undefined,
      { display: isLoading.value ? 'flex' : 'none' },
    ),
  };
});

const defaultButtonsWrapperProps = computed<HTMLAttributes>(() => ({
  class: 'ms-modern-background-modal__actions',
  style: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  } satisfies CSSProperties,
}));

const buttonsWrapperNodeProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(defaultButtonsWrapperProps.value, props.buttonsWrapperProps),
);

const defaultApplyButtonProps = computed<ButtonHTMLAttributes>(() => ({
  class: 'ms-modern-background-modal__apply',
  style: {
    minHeight: '44px',
    minWidth: '180px',
    borderRadius: '9999px',
    border: '1px solid var(--ms-modern-panel-border)',
    paddingInline: '16px',
    background: 'var(--ms-modern-field-background)',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontWeight: 700,
    boxShadow: 'var(--ms-modern-shadow-soft)',
    cursor: 'pointer',
  } satisfies CSSProperties,
}));

const applyButtonNodeProps = computed<ButtonHTMLAttributes>(() => {
  const merged = mergeAttrObjects(defaultApplyButtonProps.value, props.applyButtonProps);
  return {
    ...merged,
    style: mergeStyleObjects(
      typeof merged.style === 'object' ? (merged.style as CSSProperties) : undefined,
      { display: isApplyButtonVisible.value ? 'inline-flex' : 'none' },
    ),
  };
});

const defaultSaveButtonProps = computed<ButtonHTMLAttributes>(() => ({
  class: 'ms-modern-background-modal__save',
  style: {
    minHeight: '44px',
    minWidth: '180px',
    borderRadius: '9999px',
    border: 'none',
    paddingInline: '16px',
    background:
      'linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 55%, var(--ms-modern-accent) 100%)',
    color: '#ffffff',
    fontFamily: 'var(--ms-modern-font-family)',
    fontWeight: 700,
    boxShadow: 'var(--ms-modern-shadow-soft)',
    cursor: 'pointer',
  } satisfies CSSProperties,
}));

const saveButtonNodeProps = computed<ButtonHTMLAttributes>(() => {
  const merged = mergeAttrObjects(defaultSaveButtonProps.value, props.saveButtonProps);
  return {
    ...merged,
    style: mergeStyleObjects(
      typeof merged.style === 'object' ? (merged.style as CSSProperties) : undefined,
      { display: isSaveButtonVisible.value ? 'inline-flex' : 'none' },
    ),
  };
});

const defaultLoadingSpinner = computed<VNodeChild>(() =>
  props.loadingSpinner ??
  h('div', {
    class: 'ms-modern-background-modal__spinner',
    style: {
      width: '46px',
      height: '46px',
      borderRadius: '9999px',
      border: '4px solid rgba(255, 255, 255, 0.18)',
      borderTopColor: 'var(--ms-modern-brand-primary)',
      animation: 'spin 1s linear infinite',
    },
  }),
);

const thumbnailContainerStyle = computed<CSSProperties>(() => ({
  display: 'grid',
  gap: '10px',
}));

const sectionEyebrowStyle = {
  margin: 0,
  fontFamily: 'var(--ms-modern-font-family)',
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--ms-modern-text-muted, #94a3b8)',
} satisfies CSSProperties;

const previewStageStyle = {
  position: 'relative',
  display: 'grid',
  gap: '12px',
  padding: '14px',
  borderRadius: '20px',
  border: '1px solid var(--ms-modern-panel-border)',
  background: 'var(--ms-modern-panel-surface)',
} satisfies CSSProperties;

const thumbnailButtonStyle = (active: boolean, isNone = false): CSSProperties => ({
  width: '88px',
  minHeight: '64px',
  padding: 0,
  borderRadius: '16px',
  border: active ? '2px solid var(--ms-modern-brand-primary)' : '1px solid var(--ms-modern-panel-border)',
  background: isNone ? 'var(--ms-modern-field-background)' : 'var(--ms-modern-panel-surface)',
  boxShadow: active ? '0 0 0 3px color-mix(in srgb, var(--ms-modern-brand-primary) 20%, transparent)' : 'none',
  overflow: 'hidden',
  cursor: 'pointer',
});

const handleCloseClick = (event: MouseEvent) => {
  (props.closeButtonProps?.onClick as ((event: MouseEvent) => void) | undefined)?.(event);
  if (!event.defaultPrevented) {
    props.onClose();
  }
};

const handleApplyClick = (event: MouseEvent) => {
  (props.applyButtonProps?.onClick as ((event: MouseEvent) => void) | undefined)?.(event);
  if (!event.defaultPrevented) {
    void applyBackground();
  }
};

const handleSaveClick = (event: MouseEvent) => {
  (props.saveButtonProps?.onClick as ((event: MouseEvent) => void) | undefined)?.(event);
  if (!event.defaultPrevented) {
    void saveBackground();
  }
};

const thumbnailNodes = computed(() => {
  const nodes = defaultBackgroundEntries.map((entry) => {
    const thumbnailSrc = `https://mediasfu.com/images/backgrounds/${entry.thumb}`;
    const { previewSrc, fullSrc } = chooseResolutionSource(entry);
    const isActive = selectedImage.value.includes(entry.id);

    return h(
      'button',
      {
        type: 'button',
        style: thumbnailButtonStyle(isActive),
        onClick: () => {
          void loadImageToCanvas(previewSrc, fullSrc);
        },
      },
      [
        h('img', {
          src: thumbnailSrc,
          alt: entry.id,
          style: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          } satisfies CSSProperties,
        }),
      ],
    );
  });

  nodes.push(
    h(
      'button',
      {
        type: 'button',
        style: thumbnailButtonStyle(!selectedImage.value, true),
        onClick: handleNoBackground,
      },
      h(
        'span',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            fontFamily: 'var(--ms-modern-font-family)',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--ms-modern-text-secondary)',
          } satisfies CSSProperties,
        },
        'None',
      ),
    ),
  );

  if (customImage.value) {
    nodes.push(
      h(
        'button',
        {
          type: 'button',
          style: thumbnailButtonStyle(selectedImage.value === customImage.value),
          onClick: () => {
            void loadImageToCanvas(customImage.value, customImage.value);
          },
        },
        [
          h('img', {
            src: customImage.value,
            alt: 'Custom background',
            style: {
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            } satisfies CSSProperties,
          }),
        ],
      ),
    );
  }

  return nodes;
});

const defaultHeaderNode = computed(() => {
  const defaultCloseIcon = props.closeIconComponent ?? h(FontAwesomeIcon, { icon: faTimes });

  return h(headerNodeProps.value, [
    h('h2', titleNodeProps.value, toRenderableChildren(normalizedTitle.value)),
    h(
      'button',
      {
        ...closeButtonNodeProps.value,
        type: 'button',
        onClick: handleCloseClick,
      },
      defaultCloseIcon,
    ),
  ]);
});

const headerNode = computed<VNodeChild>(() =>
  props.renderHeader
    ? props.renderHeader({ defaultHeader: defaultHeaderNode.value, onClose: props.onClose })
    : defaultHeaderNode.value,
);

const defaultButtonsNode = computed(() =>
  h(buttonsWrapperNodeProps.value, [
    h(
      'button',
      {
        ...applyButtonNodeProps.value,
        id: 'applyBackgroundButton',
        ref: applyBackgroundButtonRef,
        type: 'button',
        disabled: isApplyButtonDisabled.value,
        onClick: handleApplyClick,
      },
        toRenderableChildren(applyButtonLabelNode.value),
    ),
    h(
      'button',
      {
        ...saveButtonNodeProps.value,
        id: 'saveBackgroundButton',
        ref: saveBackgroundButtonRef,
        type: 'button',
        disabled: isSaveButtonDisabled.value,
        onClick: handleSaveClick,
      },
        toRenderableChildren(normalizedSaveLabel.value),
    ),
  ]),
);

const buttonsNode = computed<VNodeChild>(() =>
  props.renderButtons
    ? props.renderButtons({
        defaultButtons: defaultButtonsNode.value,
        applyButtonRef: applyBackgroundButtonRef,
        saveButtonRef: saveBackgroundButtonRef,
      })
    : defaultButtonsNode.value,
);

const defaultBodyNode = computed(() =>
  h(bodyNodeProps.value, [
    h('div', { style: thumbnailContainerStyle.value }, [
      h('p', { style: sectionEyebrowStyle }, 'Built-in backgrounds'),
      h(imagesContainerNodeProps.value, thumbnailNodes.value),
    ]),
    h(uploadWrapperNodeProps.value, [
      h(
        'label',
        { ...uploadLabelNodeProps.value, for: 'ms-modern-background-upload' },
        toRenderableChildren(normalizedUploadLabel.value),
      ),
      h('input', {
        ...uploadInputNodeProps.value,
        id: 'ms-modern-background-upload',
        type: 'file',
        onChange: handleImageUpload,
      }),
    ]),
    h('div', { style: thumbnailContainerStyle.value }, [
      h('p', { style: sectionEyebrowStyle }, 'Preview'),
      h('div', { style: previewStageStyle }, [
        h('canvas', {
          ...mainCanvasNodeProps.value,
          id: 'mainCanvas',
          ref: mainCanvasRef,
        }),
        h('canvas', {
          ...backgroundCanvasNodeProps.value,
          id: 'backgroundCanvas',
          ref: backgroundCanvasRef,
        }),
        h('video', {
          ...captureVideoNodeProps.value,
          id: 'captureVideo',
          ref: captureVideoRef,
        }),
        h('video', {
          ...previewVideoNodeProps.value,
          id: 'previewVideo',
          ref: videoPreviewRef,
        }),
        h('div', loadingOverlayNodeProps.value, [defaultLoadingSpinner.value]),
      ]),
    ]),
    buttonsNode.value,
  ]),
);

const bodyNode = computed<VNodeChild>(() =>
  props.renderBody ? props.renderBody({ defaultBody: defaultBodyNode.value }) : defaultBodyNode.value,
);

const defaultContentNode = computed(() =>
  h(contentNodeProps.value, [
    headerNode.value,
    h('hr', dividerNodeProps.value),
    bodyNode.value,
  ]),
);

const contentNode = computed<VNodeChild>(() =>
  props.renderContent
    ? props.renderContent({ defaultContent: defaultContentNode.value })
    : defaultContentNode.value,
);

const overlayNode = computed<VNodeChild>(() => {
  if (!props.isVisible) {
    return null;
  }

  return h('div', overlayNodeProps.value, [contentNode.value]);
});
</script>

<style scoped>
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>