<!--
/**
 * @fileoverview BackgroundModal - Virtual background selection and configuration modal
 * @component BackgroundModal
 * @module components/backgroundComponents/BackgroundModal
 * 
 * @description
 * A sophisticated modal for selecting and applying virtual backgrounds to video streams.
 * Uses MediaPipe Selfie Segmentation for real-time person segmentation and background
 * replacement. Supports default backgrounds, custom image uploads, and "no background" mode.
 * Provides real-time preview and apply/save workflow.
 * 
 * Key Features:
 * - MediaPipe-powered person segmentation
 * - Default background image gallery (6 presets)
 * - Custom image upload support
 * - Real-time video preview with applied background
 * - "No background" option (removes segmentation)
 * - Resolution-aware image loading (thumbnail/small/large/full)
 * - Two-step workflow: Preview → Apply → Save
 * - Background state persistence
 * - Loading indicators during processing
 * - Canvas-based rendering pipeline
 * - MediaStream API integration
 * 
 * Workflow:
 * 1. User selects background (default or custom upload)
 * 2. Click "Preview Background" to see effect
 * 3. Click "Apply Background" to apply to video stream
 * 4. Click "Save Background" to persist settings
 * 5. Background is applied to outgoing video stream
 * 
 * Technical Details:
 * - Uses SelfieSegmentation from @mediapipe/selfie_segmentation
 * - Creates virtual MediaStream with segmented video + background
 * - Replaces original video track with processed track
 * - Canvas-based compositing (person mask + background image)
 * - Frame-by-frame processing in requestAnimationFrame loop
 * - Resolution-adaptive (thumbnail preview, full quality for HD)
 * 
 * @example Basic Usage
 * // <BackgroundModal
 *   // :isVisible="isBackgroundModalVisible"
 *   // :onClose="() => updateIsBackgroundModalVisible(false)"
 *   // :parameters="allParameters"
 * // />
 * 
 * @example Custom Positioning and Styling
 * // <BackgroundModal
 *   // :isVisible="showBackgroundSettings"
 *   // :onClose="closeBackgroundModal"
 *   // :parameters="backgroundParameters"
 *   // position="topRight"
 *   // backgroundColor="#2c3e50"
 *   // title="Choose Your Background"
 * // />
 * 
 * @example With Custom Button Labels
 * // <BackgroundModal
 *   // :isVisible="backgroundModalOpen"
 *   // :onClose="closeModal"
 *   // :parameters="parameters"
 *   // applyButtonLabel="Test Background"
 *   // applyButtonAppliedLabel="Use This Background"
 *   // saveButtonLabel="Confirm & Save"
 * // />
 * 
 * @example Custom Render Functions
 * // <script setup>
 * const renderCustomHeader = ({ defaultHeader, onClose }) => {
 *   // return h('div', { style: { background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' } }, [
 *     h('h3', { style: { color: 'white', padding: '15px' } }, 'Virtual Backgrounds'),
 *     h('button', { onClick: onClose, style: { color: 'white' } }, 'Close')
 *   ]);
 * };
 * 
 * const renderCustomButtons = ({ defaultButtons, applyButtonRef, saveButtonRef }) => {
 *   // return h('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center' } }, [
 *     h('button', {
 *       ref: applyButtonRef,
 *       class: 'btn btn-primary',
 *       style: { minWidth: '150px' }
 *     }, 'Preview'),
 *     h('button', {
 *       ref: saveButtonRef,
 *       class: 'btn btn-success d-none',
 *       style: { minWidth: '150px' }
 *     }, 'Confirm')
 *   ]);
 * };
 * </script>
 * 
 * // <template>
 *   <BackgroundModal
 *     :isVisible="modalVisible"
 *     :onClose="closeModal"
 *     :parameters="params"
 *     :renderHeader="renderCustomHeader"
 *     :renderButtons="renderCustomButtons"
 *   />
 * </template>
 * 
 * @example Programmatic Background Control
 * // <script setup>
 * const backgroundSettings = reactive({
 *   // selectedImage: '',
 *   // customImage: '',
 *   // keepBackground: false,
 *   // appliedBackground: false
 * });
 * 
 * const openBackgroundModal = () => {
 *   // updateIsBackgroundModalVisible(true);
 * };
 * 
 * const closeBackgroundModal = () => {
 *   // updateIsBackgroundModalVisible(false);
 *   // if (backgroundSettings.appliedBackground) {
 *     console.log('Background applied:', backgroundSettings.selectedImage);
 *   }
 * };
 * 
 * // Auto-apply background on room join
 * onMounted(() => {
 *   // if (backgroundSettings.selectedImage) {
 *     backgroundSettings.autoClickBackground = true;
 *   }
 * });
 * </script>
 * 
 * // <template>
 *   <div>
 *     <button @click="openBackgroundModal">Change Background</button>
 *     <BackgroundModal
 *       :isVisible="isBackgroundModalVisible"
 *       :onClose="closeBackgroundModal"
 *       :parameters="backgroundParameters"
 *     />
 *   </div>
 * </template>
 * 
 * @see {@link BackgroundModalParameters} for parameter configuration
 * @see {@link https://google.github.io/mediapipe/solutions/selfie_segmentation.html} for MediaPipe Selfie Segmentation
 * @see {@link SelfieSegmentation} for segmentation API
 */
-->
<script setup lang="ts">
import { computed, defineComponent, defineOptions, h, isVNode, nextTick, onMounted, ref, shallowRef, toRaw, watch } from 'vue'
import type { CSSProperties, PropType, VNodeChild } from 'vue'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation'
import type { BackgroundModalProps } from '../../types/background'

interface SegmentationResults {
  segmentationMask: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement | ImageBitmap
  image: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement | ImageBitmap
}

const props = withDefaults(defineProps<BackgroundModalProps>(), {
  position: 'topLeft',
  backgroundColor: '#f5f5f5',
  title: 'Background Settings',
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
  uploadLabel: 'Upload Custom Image',
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
  applyButtonLabel: 'Preview Background',
  applyButtonAppliedLabel: 'Apply Background',
  saveButtonLabel: 'Save Background',
  renderHeader: undefined,
  renderButtons: undefined,
  renderBody: undefined,
  renderContent: undefined,
})

defineOptions({
  components: { FontAwesomeIcon },
})

const customImage = ref(props.parameters.customImage ?? '')
const selectedImage = ref(props.parameters.selectedImage ?? '')
const segmentVideo = ref<MediaStream | null>(props.parameters.segmentVideo ?? null)
const selfieSegmentation = shallowRef<SelfieSegmentation | null>(props.parameters.selfieSegmentation ?? null)
const pauseSegmentation = ref(props.parameters.pauseSegmentation ?? false)
const processedStream = ref<MediaStream | null>(props.parameters.processedStream ?? null)
const keepBackground = ref(props.parameters.keepBackground ?? false)
const backgroundHasChanged = ref(props.parameters.backgroundHasChanged ?? false)
const virtualStream = ref<MediaStream | null>(props.parameters.virtualStream ?? null)
const prevKeepBackground = ref(props.parameters.prevKeepBackground ?? false)
const appliedBackground = ref(props.parameters.appliedBackground ?? false)
const autoClickBackground = ref(props.parameters.autoClickBackground ?? false)

watch(
  () => props.parameters.customImage,
  (value) => {
    customImage.value = value ?? ''
  }
)

watch(
  () => props.parameters.selectedImage,
  (value) => {
    selectedImage.value = value ?? ''
  }
)

watch(
  () => props.parameters.segmentVideo,
  (value) => {
    segmentVideo.value = value ?? null
  }
)

watch(
  () => props.parameters.selfieSegmentation,
  (value) => {
    selfieSegmentation.value = value ? toRaw(value) : null
  }
)

watch(
  () => props.parameters.pauseSegmentation,
  (value) => {
    pauseSegmentation.value = value ?? false
  }
)

watch(
  () => props.parameters.processedStream,
  (value) => {
    processedStream.value = value ?? null
  }
)

watch(
  () => props.parameters.keepBackground,
  (value) => {
    keepBackground.value = value ?? false
  }
)

watch(
  () => props.parameters.backgroundHasChanged,
  (value) => {
    backgroundHasChanged.value = value ?? false
  }
)

watch(
  () => props.parameters.virtualStream,
  (value) => {
    virtualStream.value = value ?? null
  }
)

watch(
  () => props.parameters.prevKeepBackground,
  (value) => {
    prevKeepBackground.value = value ?? false
  }
)

watch(
  () => props.parameters.appliedBackground,
  (value) => {
    appliedBackground.value = value ?? false
  }
)

watch(
  () => props.parameters.autoClickBackground,
  (value) => {
    autoClickBackground.value = value ?? false
  }
)

const defaultImagesContainerRef = ref<HTMLDivElement | null>(null)
const uploadImageInputRef = ref<HTMLInputElement | null>(null)
const backgroundCanvasRef = ref<HTMLCanvasElement | null>(null)
const videoPreviewRef = ref<HTMLVideoElement | null>(null)
const captureVideoRef = ref<HTMLVideoElement | null>(null)
const loadingOverlayRef = ref<HTMLDivElement | null>(null)
const applyBackgroundButtonRef = ref<HTMLButtonElement | null>(null)
const saveBackgroundButtonRef = ref<HTMLButtonElement | null>(null)
const mainCanvasRef = ref<HTMLCanvasElement | null>(null)

const clonedStream = ref<MediaStream | null>(null)
const clonedTrack = ref<MediaStreamTrack | null>(null)

const showLoading = () => {
  loadingOverlayRef.value?.classList.remove('d-none')
}

const hideLoading = () => {
  loadingOverlayRef.value?.classList.add('d-none')
}

const clearCanvas = () => {
  const ctx = backgroundCanvasRef.value?.getContext('2d')
  if (!ctx || !backgroundCanvasRef.value) return

  ctx.clearRect(0, 0, backgroundCanvasRef.value.width, backgroundCanvasRef.value.height)
  ctx.font = '30px Arial'
  ctx.fillStyle = '#000'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(
    'No Background',
    backgroundCanvasRef.value.width / 2,
    backgroundCanvasRef.value.height / 2
  )

  saveBackgroundButtonRef.value?.classList.add('d-none')
  if (saveBackgroundButtonRef.value) {
    saveBackgroundButtonRef.value.disabled = true
  }
  applyBackgroundButtonRef.value?.classList.remove('d-none')
  if (applyBackgroundButtonRef.value) {
    applyBackgroundButtonRef.value.disabled = false
    if (
      processedStream.value &&
      prevKeepBackground.value === keepBackground.value &&
      keepBackground.value &&
      appliedBackground.value
    ) {
      applyBackgroundButtonRef.value.innerText = 'Apply Background'
    } else {
      applyBackgroundButtonRef.value.innerText = 'Preview Background'
    }
  }
}

const renderDefaultImages = () => {
  const defaultImages = ['wall', 'wall2', 'shelf', 'clock', 'desert', 'flower']
  const container = defaultImagesContainerRef.value
  if (!container) return

  container.innerHTML = ''

  defaultImages.forEach((baseName) => {
    const thumb = `https://mediasfu.com/images/backgrounds/${baseName}_thumbnail.jpg`
    const small = `https://mediasfu.com/images/backgrounds/${baseName}_small.jpg`
    const large = `https://mediasfu.com/images/backgrounds/${baseName}_large.jpg`
    const full = `https://mediasfu.com/images/backgrounds/${baseName}.jpg`
    const img = document.createElement('img')
    img.src = thumb
    img.classList.add('img-thumbnail', 'm-1')
    img.style.width = '80px'
    img.style.cursor = 'pointer'
    img.addEventListener('click', async () => {
      if (props.parameters.targetResolution === 'fhd' || props.parameters.targetResolution === 'qhd') {
        await loadImageToCanvas(small, large)
      } else {
        await loadImageToCanvas(small, full)
      }
    })
    container.appendChild(img)
  })

  const noBackground = document.createElement('div')
  noBackground.classList.add('img-thumbnail', 'm-1', 'd-flex', 'align-items-center', 'justify-content-center')
  noBackground.style.width = '76px'
  noBackground.style.minHeight = '60px'
  noBackground.style.cursor = 'pointer'
  noBackground.style.backgroundColor = '#f8f9fa'
  noBackground.style.border = '1px solid #dee2e6'
  noBackground.style.position = 'relative'
  noBackground.innerHTML = '<span style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:#000;">None</span>'
  noBackground.addEventListener('click', () => {
    selectedImage.value = ''
    props.parameters.updateSelectedImage?.('')
    customImage.value = ''
    props.parameters.updateCustomImage?.('')
    showLoading()
    videoPreviewRef.value?.classList.add('d-none')
    backgroundCanvasRef.value?.classList.remove('d-none')
    clearCanvas()
    hideLoading()
  })
  container.appendChild(noBackground)

  if (customImage.value) {
    const customImg = document.createElement('img')
    customImg.src = customImage.value
    customImg.classList.add('img-thumbnail', 'm-1')
    customImg.style.width = '80px'
    customImg.style.cursor = 'pointer'
    customImg.addEventListener('click', () => {
      if (customImage.value) {
        void loadImageToCanvas(customImage.value, customImage.value)
      }
    })
    container.appendChild(customImg)
  }
}

const handleImageUpload = (event: Event) => {
  try {
    const input = event.target as HTMLInputElement | null
    const file = input?.files?.[0]
    if (!file) return

    if (file.size > 2048 * 2048) {
      props.parameters.showAlert?.({
        message: 'File size must be less than 2MB.',
        type: 'danger',
      })
      return
    }

    let minWidth = 1280
    let minHeight = 1280
    const maxWidth = 2560
    const maxHeight = 2560

    if (props.parameters.targetResolution === 'fhd') {
      minWidth = 1920
      minHeight = 1920
    } else if (props.parameters.targetResolution === 'qhd') {
      minWidth = 2560
      minHeight = 2560
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
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
        })
        return
      }

      customImage.value = img.src
      props.parameters.updateCustomImage?.(customImage.value)
      void loadImageToCanvas(img.src, img.src)
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        img.src = e.target.result
      }
    }
    reader.readAsDataURL(file)
  } catch {
    // Handle error silently
  }
}

const loadImageToCanvas = async (src: string, fullSrc: string) => {
  showLoading()
  backgroundCanvasRef.value?.classList.remove('d-none')
  videoPreviewRef.value?.classList.add('d-none')

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = async () => {
    const ctx = backgroundCanvasRef.value?.getContext('2d')
    if (!ctx || !backgroundCanvasRef.value) return
    backgroundCanvasRef.value.width = img.width
    backgroundCanvasRef.value.height = img.height
    ctx.drawImage(img, 0, 0)
    removeBackground(img)
    hideLoading()
  }
  img.src = src
  selectedImage.value = fullSrc
  props.parameters.updateSelectedImage?.(selectedImage.value)

  saveBackgroundButtonRef.value?.classList.add('d-none')
  if (saveBackgroundButtonRef.value) {
    saveBackgroundButtonRef.value.disabled = true
  }
  applyBackgroundButtonRef.value?.classList.remove('d-none')
  if (applyBackgroundButtonRef.value) {
    applyBackgroundButtonRef.value.disabled = false
    if (
      processedStream.value &&
      prevKeepBackground.value === keepBackground.value &&
      keepBackground.value &&
      appliedBackground.value
    ) {
      applyBackgroundButtonRef.value.innerText = 'Apply Background'
    } else {
      applyBackgroundButtonRef.value.innerText = 'Preview Background'
    }
  }
}

const removeBackground = (img: HTMLImageElement) => {
  const ctx = backgroundCanvasRef.value?.getContext('2d')
  if (!ctx || !backgroundCanvasRef.value) return
  ctx.clearRect(0, 0, backgroundCanvasRef.value.width, backgroundCanvasRef.value.height)
  ctx.drawImage(img, 0, 0)
}

const preloadModel = async () => {
  const segmentation = new SelfieSegmentation({
    locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
  })

  segmentation.setOptions({
    modelSelection: 1,
    selfieMode: false,
  })

  await segmentation.initialize()
  selfieSegmentation.value = segmentation
  props.parameters.updateSelfieSegmentation?.(segmentation)
}

const selfieSegmentationPreview = async (doSegmentation: boolean) => {
  const refVideo = captureVideoRef.value
  const previewVideo = videoPreviewRef.value
  const virtualImage = new Image()
  virtualImage.crossOrigin = 'anonymous'
  virtualImage.src = selectedImage.value || ''

  const mainCanvasFromProps = props.parameters.mainCanvas ?? null
  let mainCanvas: HTMLCanvasElement | null = mainCanvasFromProps
  if (!mainCanvas) {
    mainCanvas = mainCanvasRef.value
  }

  if (!mainCanvas || !refVideo || !previewVideo) return

  const mediaCanvas = mainCanvas
  mediaCanvas.width = refVideo.videoWidth
  mediaCanvas.height = refVideo.videoHeight
  let ctx = mediaCanvas.getContext('2d')

  backgroundHasChanged.value = true
  props.parameters.updateBackgroundHasChanged?.(true)
  prevKeepBackground.value = keepBackground.value
  props.parameters.updatePrevKeepBackground?.(keepBackground.value)

  if (!doSegmentation) {
    processedStream.value?.getVideoTracks().forEach((track: MediaStreamTrack) => track.stop())
    processedStream.value = null
    props.parameters.updateProcessedStream?.(null)
    keepBackground.value = false
    props.parameters.updateKeepBackground?.(false)
    previewVideo.classList.remove('d-none')
  }

  const segmentImage = async (videoElement: HTMLVideoElement) => {
    try {
      const processFrame = () => {
        if (
          !selfieSegmentation.value ||
          pauseSegmentation.value ||
          !videoElement ||
          videoElement.videoWidth === 0 ||
          videoElement.videoHeight === 0
        ) {
          return
        }

        selfieSegmentation.value.send({ image: videoElement })
        requestAnimationFrame(processFrame)
      }

      videoElement.onloadeddata = () => {
        processFrame()
      }

      setTimeout(async () => {
        processedStream.value = mediaCanvas.captureStream(props.parameters.frameRate || 5)
        previewVideo.srcObject = processedStream.value
        props.parameters.updateProcessedStream?.(processedStream.value)
        previewVideo.classList.remove('d-none')
        keepBackground.value = true
        props.parameters.updateKeepBackground?.(keepBackground.value)

        if (previewVideo.paused) {
          try {
            await previewVideo.play()
          } catch {
            // Handle play error silently
          }
        }
      }, 100)
    } catch {
      // Handle segmentation error silently
    }
  }

  if (props.parameters.videoAlreadyOn) {
    const localStreamVideo = props.parameters.localStreamVideo
    if (
      clonedTrack.value &&
      clonedTrack.value.readyState === 'live' &&
      localStreamVideo?.getVideoTracks()[0]?.label === clonedTrack.value.label
    ) {
      // Reuse cloned track
    } else {
      const localTrack = localStreamVideo?.getVideoTracks()[0]
      if (localTrack) {
        clonedTrack.value = localTrack.clone()
        if (clonedTrack.value) {
          clonedStream.value = new MediaStream([clonedTrack.value])
        }
        segmentVideo.value = clonedStream.value
        props.parameters.updateSegmentVideo?.(segmentVideo.value)
      }
    }

    refVideo.srcObject = segmentVideo.value ?? null
    if (refVideo.paused) {
      refVideo.play().catch(() => {})
    }

    const currentSegmentVideo = segmentVideo.value
    refVideo.width = currentSegmentVideo?.getVideoTracks()[0]?.getSettings().width || 0
    refVideo.height = currentSegmentVideo?.getVideoTracks()[0]?.getSettings().height || 0
    mediaCanvas.width = refVideo.width
    mediaCanvas.height = refVideo.height
    ctx = mediaCanvas.getContext('2d')

    try {
      if (doSegmentation) {
        await segmentImage(refVideo)
      } else {
        previewVideo.srcObject = clonedStream.value || localStreamVideo || null
      }
    } catch (error) {
      console.log('Error segmenting image:', error)
    }
  } else {
    if (
      segmentVideo.value &&
      segmentVideo.value.getVideoTracks()[0]?.readyState === 'live'
    ) {
      // Reuse existing segment stream
    } else {
      const mediaDevices = props.parameters.mediaDevices ?? navigator.mediaDevices
      if (!mediaDevices) {
        console.log('MediaDevices API not available')
        return
      }

      try {
        const stream = await mediaDevices.getUserMedia({
          video: { ...props.parameters.vidCons, frameRate: { ideal: props.parameters.frameRate } },
          audio: false,
        })
        segmentVideo.value = stream
        props.parameters.updateSegmentVideo?.(segmentVideo.value)
        refVideo.srcObject = segmentVideo.value
        if (refVideo.paused) {
          refVideo.play().catch(() => {})
        }
      } catch {
        try {
          const stream = await mediaDevices.getUserMedia({
            video: { ...props.parameters.vidCons },
            audio: false,
          })
          segmentVideo.value = stream
          props.parameters.updateSegmentVideo?.(segmentVideo.value)
          refVideo.srcObject = segmentVideo.value
          if (refVideo.paused) {
            refVideo.play().catch(() => {})
          }
        } catch (error) {
          console.log('Error getting user media:', error)
        }
      }
    }

    const currentSegmentVideo = segmentVideo.value
    refVideo.width = currentSegmentVideo?.getVideoTracks()[0]?.getSettings().width || 0
    refVideo.height = currentSegmentVideo?.getVideoTracks()[0]?.getSettings().height || 0
    mediaCanvas.width = refVideo.width
    mediaCanvas.height = refVideo.height
    ctx = mediaCanvas.getContext('2d')

    try {
      if (doSegmentation) {
        await segmentImage(refVideo)
      } else {
        previewVideo.srcObject = refVideo.srcObject
      }
    } catch {
      // Handle error silently
    }
  }

  let repeatMode: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat' = 'no-repeat'
  try {
    if (virtualImage.width < mediaCanvas.width || virtualImage.height < mediaCanvas.height) {
      repeatMode = 'repeat'
    }
  } catch {
    // Handle error silently
  }

  const onResults = (results: SegmentationResults) => {
    try {
      if (
        !pauseSegmentation.value &&
        mediaCanvas &&
        mediaCanvas.width > 0 &&
        mediaCanvas.height > 0 &&
        virtualImage &&
        virtualImage.width > 0 &&
        virtualImage.height > 0
      ) {
        ctx?.save()
        ctx?.clearRect(0, 0, mediaCanvas.width, mediaCanvas.height)
        ctx?.drawImage(results.segmentationMask, 0, 0, mediaCanvas.width, mediaCanvas.height)

        if (ctx) {
          ctx.globalCompositeOperation = 'source-out'
          const pattern = ctx.createPattern(virtualImage, repeatMode)
          if (pattern) {
            ctx.fillStyle = pattern
          } else {
            ctx.fillStyle = ''
          }
          ctx.fillRect(0, 0, mediaCanvas.width, mediaCanvas.height)

          ctx.globalCompositeOperation = 'destination-atop'
          ctx.drawImage(results.image, 0, 0, mediaCanvas.width, mediaCanvas.height)

          ctx.restore()
        }
      }
    } catch (error) {
      console.log('Error applying background:', error)
    }
  }

  if (!selfieSegmentation.value) {
    try {
      await preloadModel()
    } catch {
      console.log('Error preloading model:')
    }
  }

  try {
    selfieSegmentation.value?.onResults(onResults)
  } catch {
    // Handle error silently
  }
}

const applyBackground = async () => {
  if (props.parameters.audioOnlyRoom) {
    props.parameters.showAlert?.({
      message: 'You cannot use a background in an audio only event.',
      type: 'danger',
    })
    return
  }

  showLoading()

  videoPreviewRef.value?.classList.remove('d-none')
  backgroundCanvasRef.value?.classList.add('d-none')

  const doSegmentation = !!selectedImage.value
  pauseSegmentation.value = false
  props.parameters.updatePauseSegmentation?.(false)
  await selfieSegmentationPreview(doSegmentation)
  hideLoading()

  applyBackgroundButtonRef.value?.classList.add('d-none')
  if (applyBackgroundButtonRef.value) {
    applyBackgroundButtonRef.value.disabled = true
  }

  if (
    processedStream.value &&
    prevKeepBackground.value === keepBackground.value &&
    keepBackground.value &&
    appliedBackground.value
  ) {
    saveBackgroundButtonRef.value?.classList.add('d-none')
    if (saveBackgroundButtonRef.value) {
      saveBackgroundButtonRef.value.disabled = true
    }
  } else {
    saveBackgroundButtonRef.value?.classList.remove('d-none')
    if (saveBackgroundButtonRef.value) {
      saveBackgroundButtonRef.value.disabled = false
    }
  }
}

const saveBackground = async () => {
  if (props.parameters.audioOnlyRoom) {
    props.parameters.showAlert?.({
      message: 'You cannot use a background in an audio only event.',
      type: 'danger',
    })
    return
  }

  if (backgroundHasChanged.value) {
    if (props.parameters.videoAlreadyOn) {
      if (
        props.parameters.islevel === '2' &&
        (props.parameters.recordStarted || props.parameters.recordResumed)
      ) {
        if (!(props.parameters.recordPaused || props.parameters.recordStopped)) {
          if (props.parameters.recordingMediaOptions === 'video') {
            props.parameters.showAlert?.({
              message: 'Please pause the recording before changing the background.',
              type: 'danger',
            })
            return
          }
        }
      }

      let videoParams = props.parameters.videoParams

      if (keepBackground.value && selectedImage.value && processedStream.value) {
        virtualStream.value = processedStream.value
        props.parameters.updateVirtualStream?.(virtualStream.value)
        videoParams = { track: virtualStream.value.getVideoTracks()[0] }
        props.parameters.updateVideoParams?.(videoParams)
      } else {
        if (
          props.parameters.localStreamVideo &&
          props.parameters.localStreamVideo.getVideoTracks()[0]?.readyState === 'live'
        ) {
          videoParams = { track: props.parameters.localStreamVideo.getVideoTracks()[0] }
          props.parameters.updateVideoParams?.(videoParams)
        } else {
          try {
            if (
              props.parameters.localStreamVideo &&
              props.parameters.localStreamVideo.getVideoTracks()[0]?.readyState !== 'live'
            ) {
              const localStreamVideo = props.parameters.localStreamVideo
              const originalTrack = localStreamVideo?.getVideoTracks()[0]
              if (localStreamVideo && originalTrack) {
                localStreamVideo.removeTrack(originalTrack)
              }
              const clonedTrackVal = segmentVideo.value?.getVideoTracks()[0]?.clone()
              if (localStreamVideo && clonedTrackVal) {
                localStreamVideo.addTrack(clonedTrackVal)
              }
            }
          } catch (error) {
            console.log('Error handling local stream video:', error)
          }

          videoParams = {
            track: clonedStream.value?.getVideoTracks()[0] || undefined,
          }
          props.parameters.updateVideoParams?.(videoParams)
        }
      }

      if (keepBackground.value) {
        appliedBackground.value = true
        props.parameters.updateAppliedBackground?.(true)
      } else {
        appliedBackground.value = false
        props.parameters.updateAppliedBackground?.(false)
      }

      if (!props.parameters.transportCreated) {
        await props.parameters.createSendTransport?.({
          option: 'video',
          parameters: { ...props.parameters, videoParams },
        })
      } else {
        try {
          if (props.parameters.videoProducer?.id) {
            const videoParamsTrackId = (videoParams as { track?: { id?: string } }).track?.id;
            if (props.parameters.videoProducer.track?.id !== videoParamsTrackId) {
              await props.parameters.disconnectSendTransportVideo?.({ parameters: props.parameters })
              await props.parameters.sleep?.({ ms: 500 })
            }
          }
          await props.parameters.connectSendTransportVideo?.({ videoParams, parameters: props.parameters })
        } catch {
          // Handle error silently
        }
      }
      await props.parameters.onScreenChanges?.({ changed: true, parameters: props.parameters })
    }
  }

  if (keepBackground.value) {
    appliedBackground.value = true
    props.parameters.updateAppliedBackground?.(true)
  } else {
    appliedBackground.value = false
    props.parameters.updateAppliedBackground?.(false)
  }

  saveBackgroundButtonRef.value?.classList.add('d-none')
  if (saveBackgroundButtonRef.value) {
    saveBackgroundButtonRef.value.disabled = true
  }
}

const handleAutoClickBackground = async () => {
  if (!autoClickBackground.value || !props.isVisible) return
  try {
    await applyBackground()
    await saveBackground()
  } finally {
    autoClickBackground.value = false
    props.parameters.updateAutoClickBackground?.(false)
  }
}

watch(
  () => props.isVisible,
  async (visible) => {
    await nextTick()
    if (visible) {
      if (!selfieSegmentation.value) {
        try {
          await preloadModel()
        } catch {
          console.log('Error preloading model:')
        }
      }
      renderDefaultImages()
      if (selectedImage.value) {
        await loadImageToCanvas(selectedImage.value, selectedImage.value)
      } else {
        clearCanvas()
      }

      saveBackgroundButtonRef.value?.classList.add('d-none')
      if (saveBackgroundButtonRef.value) {
        saveBackgroundButtonRef.value.disabled = true
      }
      applyBackgroundButtonRef.value?.classList.remove('d-none')
      if (applyBackgroundButtonRef.value) {
        applyBackgroundButtonRef.value.disabled = false
        if (
          processedStream.value &&
          prevKeepBackground.value === keepBackground.value &&
          keepBackground.value &&
          appliedBackground.value
        ) {
          applyBackgroundButtonRef.value.innerText = 'Apply Background'
        } else {
          applyBackgroundButtonRef.value.innerText = 'Preview Background'
        }
      }

      await handleAutoClickBackground()
    } else {
      try {
        const refVideo = captureVideoRef.value
        if (
          !appliedBackground.value ||
          (appliedBackground.value && !keepBackground.value) ||
          (appliedBackground.value && !props.parameters.videoAlreadyOn)
        ) {
          pauseSegmentation.value = true
          props.parameters.updatePauseSegmentation?.(true)
          if (!props.parameters.videoAlreadyOn) {
            try {
              if (refVideo) {
                if (refVideo.srcObject instanceof MediaStream) {
                  refVideo.srcObject.getTracks().forEach((track) => track.stop())
                }
                refVideo.srcObject = null
              }

              if (segmentVideo.value) {
                segmentVideo.value.getTracks().forEach((track) => track.stop())
                segmentVideo.value = null
                props.parameters.updateSegmentVideo?.(null)
              }

              if (virtualStream.value) {
                virtualStream.value.getTracks().forEach((track) => track.stop())
                virtualStream.value = null
                props.parameters.updateVirtualStream?.(null)
              }
            } catch {
              // Handle cleanup error silently
            }
          }
        }

        videoPreviewRef.value?.classList.add('d-none')
        backgroundCanvasRef.value?.classList.remove('d-none')
      } catch {
        // Handle error silently
      }
    }
  }
)

onMounted(() => {
  if (props.isVisible) {
    void handleAutoClickBackground()
  }
})

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

// Helper function
const joinClassNames = (classes: (string | undefined)[]): string | undefined => {
  const filtered = classes.filter(Boolean)
  return filtered.length > 0 ? filtered.join(' ').trim() : undefined
}

// Computed properties for styles
const defaultOverlayWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.8, 500) : 360

const overlayStyle = computed((): CSSProperties => ({
  position: 'fixed' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: props.isVisible ? 'block' : 'none',
  zIndex: 999,
  ...(props.overlayProps?.style as CSSProperties || {})
}))

const overlayClassName = computed(() => 
  joinClassNames(['mediasfu-background-modal', props.overlayProps?.class as string])
)

const contentStyle = computed((): CSSProperties => ({
  position: 'fixed' as const,
  backgroundColor: props.backgroundColor,
  borderRadius: '10px',
  padding: '16px',
  width: `${defaultOverlayWidth}px`,
  maxWidth: `${defaultOverlayWidth}px`,
  maxHeight: '75%',
  overflow: 'hidden' as const,
  top: props.position.includes('top') ? '10px' : 'auto',
  bottom: props.position.includes('bottom') ? '10px' : 'auto',
  left: props.position.includes('Left') ? '10px' : 'auto',
  right: props.position.includes('Right') ? '10px' : 'auto',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '12px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
  ...(props.contentProps?.style as CSSProperties || {})
}))

const contentClassName = computed(() => 
  joinClassNames(['mediasfu-background-modal__content', props.contentProps?.class as string])
)

// Main overlay node
const overlayNode = computed(() => {
  const defaultCloseIcon = props.closeIconComponent ?? h(FontAwesomeIcon, { icon: faTimes, size: 'xl' })
  
  const defaultTitleNode = h('div', {
    class: joinClassNames(['modal-title', props.titleProps?.class as string]),
    style: {
      margin: 0,
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: 'black',
      ...(props.titleProps?.style as CSSProperties || {})
    },
    ...(props.titleProps ? Object.fromEntries(
      Object.entries(props.titleProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, typeof props.title === 'string' || typeof props.title === 'number' ? [props.title] : (props.title || []))
  
  const defaultHeaderNode = h('div', {
    class: joinClassNames(['modal-header', props.headerProps?.class as string]),
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '12px',
      ...(props.headerProps?.style as CSSProperties || {})
    },
    ...(props.headerProps ? Object.fromEntries(
      Object.entries(props.headerProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    defaultTitleNode,
    h('button', {
      class: joinClassNames(['btn-close-background', props.closeButtonProps?.class as string]),
      style: {
        background: 'none',
        border: 'none',
        padding: '4px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'black',
        ...(props.closeButtonProps?.style as CSSProperties || {})
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
  ])
  
  const headerNode = props.renderHeader
    ? props.renderHeader({ defaultHeader: defaultHeaderNode, onClose: props.onClose })
    : defaultHeaderNode
  
  const dividerNode = h('hr', {
    style: {
      height: '1px',
      backgroundColor: 'black',
      marginTop: '5px',
      marginBottom: '5px',
      ...(props.headerDividerProps?.style as CSSProperties || {})
    },
    ...(props.headerDividerProps ? Object.fromEntries(
      Object.entries(props.headerDividerProps).filter(([key]) => !['style'].includes(key))
    ) : {})
  })
  
  // Default images container
  const defaultImagesNode = h('div', {
    id: 'defaultImages',
    ref: defaultImagesContainerRef,
    ...(props.defaultImagesContainerProps || {})
  })
  
  // Upload section
  const uploadSectionNode = h('div', {
    class: joinClassNames(['form-group', props.uploadWrapperProps?.class as string]),
    style: {
      maxWidth: '70%',
      overflowX: 'auto',
      ...(props.uploadWrapperProps?.style as CSSProperties || {})
    },
    ...(props.uploadWrapperProps ? Object.fromEntries(
      Object.entries(props.uploadWrapperProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    h('label', {
      for: 'uploadImage',
      ...(props.uploadLabelProps || {})
    }, typeof props.uploadLabel === 'string' || typeof props.uploadLabel === 'number' 
      ? [props.uploadLabel] 
      : (props.uploadLabel || [])
    ),
    h('input', {
      id: 'uploadImage',
      ref: uploadImageInputRef,
      type: 'file',
      class: 'form-control',
      onChange: handleImageUpload,
      ...(props.uploadInputProps || {})
    })
  ])
  
  // Canvas elements (hidden)
  const mainCanvasNode = h('canvas', {
    id: 'mainCanvas',
    ref: mainCanvasRef,
    class: 'd-none',
    ...(props.mainCanvasProps || {})
  })
  
  const backgroundCanvasNode = h('canvas', {
    id: 'backgroundCanvas',
    ref: backgroundCanvasRef,
    class: 'd-none',
    style: {
      width: '100%',
      maxHeight: '500px',
      ...(props.backgroundCanvasProps?.style as CSSProperties || {})
    },
    ...(props.backgroundCanvasProps ? Object.fromEntries(
      Object.entries(props.backgroundCanvasProps).filter(([key]) => !['style'].includes(key))
    ) : {})
  })
  
  // Video elements (hidden)
  const captureVideoNode = h('video', {
    id: 'captureVideo',
    ref: captureVideoRef,
    class: 'd-none',
    muted: true,
    autoplay: true,
    playsinline: true,
    ...(props.captureVideoProps || {})
  })
  
  const previewVideoNode = h('video', {
    id: 'previewVideo',
    ref: videoPreviewRef,
    class: 'd-none',
    muted: true,
    autoplay: true,
    playsinline: true,
    style: {
      width: '100%',
      maxHeight: '500px',
      ...(props.previewVideoProps?.style as CSSProperties || {})
    },
    ...(props.previewVideoProps ? Object.fromEntries(
      Object.entries(props.previewVideoProps).filter(([key]) => !['style'].includes(key))
    ) : {})
  })
  
  // Loading overlay
  const defaultLoadingSpinner = props.loadingSpinner ?? h('div', {
    style: {
      width: '50px',
      height: '50px',
      border: '5px solid #f3f3f3',
      borderTop: '5px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }
  })
  
  const loadingOverlayNode = h('div', {
    id: 'loadingOverlay',
    ref: loadingOverlayRef,
    class: 'd-none',
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'none',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
      ...(props.loadingOverlayProps?.style as CSSProperties || {})
    },
    ...(props.loadingOverlayProps ? Object.fromEntries(
      Object.entries(props.loadingOverlayProps).filter(([key]) => !['style'].includes(key))
    ) : {})
  }, [defaultLoadingSpinner])
  
  // Buttons
  const defaultButtonsNode = h('div', {
    style: {
      display: 'flex',
      gap: '8px',
      ...(props.buttonsWrapperProps?.style as CSSProperties || {})
    },
    ...(props.buttonsWrapperProps ? Object.fromEntries(
      Object.entries(props.buttonsWrapperProps).filter(([key]) => !['style'].includes(key))
    ) : {})
  }, [
    h('button', {
      id: 'applyBackgroundButton',
      ref: applyBackgroundButtonRef,
      class: joinClassNames(['btn btn-primary', props.applyButtonProps?.class as string]),
      type: 'button',
      style: { ...(props.applyButtonProps?.style as CSSProperties || {}) },
      onClick: (event: MouseEvent) => {
        if (props.applyButtonProps?.onClick) {
          (props.applyButtonProps.onClick as (event: MouseEvent) => void)(event)
        }
        if (!event.defaultPrevented) {
          void applyBackground()
        }
      },
      ...(props.applyButtonProps ? Object.fromEntries(
        Object.entries(props.applyButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
      ) : {})
    }, typeof props.applyButtonLabel === 'string' || typeof props.applyButtonLabel === 'number'
      ? [props.applyButtonLabel]
      : (props.applyButtonLabel || [])
    ),
    h('button', {
      id: 'saveBackgroundButton',
      ref: saveBackgroundButtonRef,
      class: joinClassNames(['btn btn-success d-none', props.saveButtonProps?.class as string]),
      type: 'button',
      style: { ...(props.saveButtonProps?.style as CSSProperties || {}) },
      onClick: (event: MouseEvent) => {
        if (props.saveButtonProps?.onClick) {
          (props.saveButtonProps.onClick as (event: MouseEvent) => void)(event)
        }
        if (!event.defaultPrevented) {
          void saveBackground()
        }
      },
      ...(props.saveButtonProps ? Object.fromEntries(
        Object.entries(props.saveButtonProps).filter(([key]) => !['class', 'style', 'onClick'].includes(key))
      ) : {})
    }, typeof props.saveButtonLabel === 'string' || typeof props.saveButtonLabel === 'number'
      ? [props.saveButtonLabel]
      : (props.saveButtonLabel || [])
    )
  ])
  
  const buttonsNode = props.renderButtons
    ? props.renderButtons({ 
        defaultButtons: defaultButtonsNode,
        applyButtonRef: applyBackgroundButtonRef,
        saveButtonRef: saveBackgroundButtonRef
      })
    : defaultButtonsNode
  
  // Body content
  const defaultBodyNode = h('div', {
    style: {
      maxWidth: '95%',
      overflowX: 'auto',
      ...(props.bodyProps?.style as CSSProperties || {})
    },
    ...(props.bodyProps ? Object.fromEntries(
      Object.entries(props.bodyProps).filter(([key]) => !['style'].includes(key))
    ) : {})
  }, [
    defaultImagesNode,
    uploadSectionNode,
    mainCanvasNode,
    backgroundCanvasNode,
    captureVideoNode,
    previewVideoNode,
    loadingOverlayNode,
    h('br'),
    buttonsNode
  ])
  
  const bodyNode = props.renderBody
    ? props.renderBody({ defaultBody: defaultBodyNode })
    : defaultBodyNode
  
  // Content
  const defaultContentNode = h('div', {
    class: contentClassName.value,
    style: contentStyle.value,
    ...(props.contentProps ? Object.fromEntries(
      Object.entries(props.contentProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [
    headerNode,
    dividerNode,
    bodyNode
  ])
  
  const contentNode = props.renderContent
    ? props.renderContent({ defaultContent: defaultContentNode })
    : defaultContentNode
  
  return h('div', {
    class: overlayClassName.value,
    style: overlayStyle.value,
    ...(props.overlayProps ? Object.fromEntries(
      Object.entries(props.overlayProps).filter(([key]) => !['class', 'style'].includes(key))
    ) : {})
  }, [contentNode])
})
</script>

<template>
  <Teleport to="body">
    <RenderVNode :node="overlayNode" />
  </Teleport>
</template>

<style scoped>
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.d-none {
  display: none !important;
}
</style>