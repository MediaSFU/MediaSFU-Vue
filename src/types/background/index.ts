import type { ShowAlert, VidCons } from '../../../../SharedTypes'
import type { Producer } from 'mediasoup-client'
import type { SelfieSegmentation } from '@mediapipe/selfie_segmentation'
import type { Ref, VNodeChild, HTMLAttributes, ButtonHTMLAttributes, LabelHTMLAttributes, InputHTMLAttributes, CanvasHTMLAttributes, VideoHTMLAttributes } from 'vue'

export type BackgroundModalPosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'

export interface BackgroundModalParameters {
  // Image and Background State
  customImage?: string
  selectedImage?: string
  segmentVideo?: MediaStream | null
  selfieSegmentation?: SelfieSegmentation | null
  pauseSegmentation?: boolean
  processedStream?: MediaStream | null
  keepBackground?: boolean
  backgroundHasChanged?: boolean
  virtualStream?: MediaStream | null
  mainCanvas?: HTMLCanvasElement | null
  prevKeepBackground?: boolean
  appliedBackground?: boolean
  autoClickBackground?: boolean
  
  // Video and Room State
  videoAlreadyOn?: boolean
  audioOnlyRoom?: boolean
  islevel?: string
  localStreamVideo?: MediaStream | null
  
  // Recording State
  recordStarted?: boolean
  recordResumed?: boolean
  recordPaused?: boolean
  recordStopped?: boolean
  recordingMediaOptions?: string
  
  // Media Configuration
  mediaDevices?: MediaDevices
  vidCons?: VidCons
  frameRate?: number
  targetResolution?: string
  videoProducer?: Producer | null
  transportCreated?: boolean
  videoParams?: Record<string, unknown>
  
  // Alert and Update Functions
  showAlert?: ShowAlert
  updateCustomImage?: (image: string) => void
  updateSelectedImage?: (image: string) => void
  updateSegmentVideo?: (stream: MediaStream | null) => void
  updateSelfieSegmentation?: (segmentation: SelfieSegmentation | null) => void
  updatePauseSegmentation?: (pause: boolean) => void
  updateProcessedStream?: (stream: MediaStream | null) => void
  updateKeepBackground?: (keep: boolean) => void
  updateBackgroundHasChanged?: (changed: boolean) => void
  updateVirtualStream?: (stream: MediaStream | null) => void
  updatePrevKeepBackground?: (prev: boolean) => void
  updateAppliedBackground?: (applied: boolean) => void
  updateVideoParams?: (params: Record<string, unknown>) => void
  updateAutoClickBackground?: (auto: boolean) => void
  
  // Transport and Media Functions
  createSendTransport?: (options: Record<string, unknown>) => Promise<void>
  connectSendTransportVideo?: (options: Record<string, unknown>) => Promise<void>
  disconnectSendTransportVideo?: (options: Record<string, unknown>) => Promise<void>
  onScreenChanges?: (options: Record<string, unknown>) => Promise<void>
  sleep?: (options: { ms: number }) => Promise<void>
  
  // Updated Parameters Getter
  getUpdatedAllParams?: () => BackgroundModalParameters
  
  [key: string]: unknown
}

/**
 * Props for the BackgroundModal component
 * @interface BackgroundModalProps
 * 
 * @property {boolean} isVisible - Controls modal visibility (true = visible, false = hidden)
 * @property {Function} onClose - Callback when modal closes (user clicks close button or backdrop)
 * @property {BackgroundModalParameters} parameters - Background configuration and state parameters
 * @property {BackgroundModalPosition} [position='topLeft'] - Modal position on screen
 *   - Options: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
 * @property {string} [backgroundColor='#f5f5f5'] - Background color of the modal content
 * @property {VNodeChild} [title='Background Settings'] - Modal title content (can be string or VNode)
 * 
 * @property {HTMLAttributes} [overlayProps] - Props for the overlay wrapper (backdrop)
 * @property {HTMLAttributes} [contentProps] - Props for the modal content container
 * @property {HTMLAttributes} [headerProps] - Props for the header section
 * @property {HTMLAttributes} [titleProps] - Props for the title element
 * @property {ButtonHTMLAttributes} [closeButtonProps] - Props for the close button
 * @property {VNodeChild} [closeIconComponent] - Custom close icon (default: faTimes FontAwesome)
 * @property {HTMLAttributes} [headerDividerProps] - Props for divider after header
 * @property {HTMLAttributes} [bodyProps] - Props for the body section container
 * @property {HTMLAttributes} [defaultImagesContainerProps] - Props for default background gallery container
 * @property {HTMLAttributes} [uploadWrapperProps] - Props for custom upload section wrapper
 * @property {LabelHTMLAttributes} [uploadLabelProps] - Props for upload label element
 * @property {VNodeChild} [uploadLabel='Upload Custom Image'] - Label text for upload section
 * @property {InputHTMLAttributes} [uploadInputProps] - Props for file input element
 * @property {CanvasHTMLAttributes} [mainCanvasProps] - Props for main canvas element
 * @property {CanvasHTMLAttributes} [backgroundCanvasProps] - Props for background preview canvas
 * @property {VideoHTMLAttributes} [captureVideoProps] - Props for capture video element (source)
 * @property {VideoHTMLAttributes} [previewVideoProps] - Props for preview video element (processed)
 * @property {HTMLAttributes} [loadingOverlayProps] - Props for loading overlay div
 * @property {VNodeChild} [loadingSpinner] - Custom loading spinner (default: Bootstrap spinner)
 * @property {HTMLAttributes} [buttonsWrapperProps] - Props for buttons container
 * @property {ButtonHTMLAttributes} [applyButtonProps] - Props for preview/apply button
 * @property {ButtonHTMLAttributes} [saveButtonProps] - Props for save button
 * @property {VNodeChild} [applyButtonLabel='Preview Background'] - Initial apply button label
 * @property {VNodeChild} [applyButtonAppliedLabel='Apply Background'] - Apply button label after preview
 * @property {VNodeChild} [saveButtonLabel='Save Background'] - Save button label
 * 
 * @property {Function} [renderHeader] - Custom render function for entire header section
 *   @param {Object} options
 *   @param {VNodeChild} options.defaultHeader - Default header VNode
 *   @param {Function} options.onClose - Close handler function
 *   @returns {VNodeChild} Custom header VNode
 *   @example
 *   ```ts
 *   ({ defaultHeader, onClose }) => {
 *     return h('div', { class: 'custom-header' }, [
 *       h('h2', 'Choose Background'),
 *       h('button', { onClick: onClose }, 'X')
 *     ]);
 *   }
 *   ```
 * 
 * @property {Function} [renderButtons] - Custom render function for action buttons
 *   @param {Object} options
 *   @param {VNodeChild} options.defaultButtons - Default buttons VNode
 *   @param {Ref<HTMLButtonElement | null>} options.applyButtonRef - Ref to apply button element
 *   @param {Ref<HTMLButtonElement | null>} options.saveButtonRef - Ref to save button element
 *   @returns {VNodeChild} Custom buttons VNode
 *   @example
 *   ```ts
 *   ({ applyButtonRef, saveButtonRef }) => {
 *     return h('div', { style: { display: 'flex', gap: '10px' } }, [
 *       h('button', { ref: applyButtonRef, class: 'btn-primary' }, 'Preview'),
 *       h('button', { ref: saveButtonRef, class: 'btn-success d-none' }, 'Save')
 *     ]);
 *   }
 *   ```
 * 
 * @property {Function} [renderBody] - Custom render function for entire body section
 *   @param {Object} options
 *   @param {VNodeChild} options.defaultBody - Default body VNode
 *   @returns {VNodeChild} Custom body VNode
 * 
 * @property {Function} [renderContent] - Custom render function for entire modal content
 *   @param {Object} options
 *   @param {VNodeChild} options.defaultContent - Default content VNode
 *   @returns {VNodeChild} Custom content VNode
 */
export interface BackgroundModalProps {
  isVisible: boolean
  onClose: () => void
  parameters: BackgroundModalParameters
  position?: BackgroundModalPosition
  backgroundColor?: string
  title?: VNodeChild
  overlayProps?: HTMLAttributes
  contentProps?: HTMLAttributes
  headerProps?: HTMLAttributes
  titleProps?: HTMLAttributes
  closeButtonProps?: ButtonHTMLAttributes
  closeIconComponent?: VNodeChild
  headerDividerProps?: HTMLAttributes
  bodyProps?: HTMLAttributes
  defaultImagesContainerProps?: HTMLAttributes
  uploadWrapperProps?: HTMLAttributes
  uploadLabelProps?: LabelHTMLAttributes
  uploadLabel?: VNodeChild
  uploadInputProps?: InputHTMLAttributes
  mainCanvasProps?: CanvasHTMLAttributes
  backgroundCanvasProps?: CanvasHTMLAttributes
  captureVideoProps?: VideoHTMLAttributes
  previewVideoProps?: VideoHTMLAttributes
  loadingOverlayProps?: HTMLAttributes
  loadingSpinner?: VNodeChild
  buttonsWrapperProps?: HTMLAttributes
  applyButtonProps?: ButtonHTMLAttributes
  saveButtonProps?: ButtonHTMLAttributes
  applyButtonLabel?: VNodeChild
  applyButtonAppliedLabel?: VNodeChild
  saveButtonLabel?: VNodeChild
  renderHeader?: (options: {
    defaultHeader: VNodeChild
    onClose: () => void
  }) => VNodeChild
  renderButtons?: (options: {
    defaultButtons: VNodeChild
    applyButtonRef: Ref<HTMLButtonElement | null>
    saveButtonRef: Ref<HTMLButtonElement | null>
  }) => VNodeChild
  renderBody?: (options: {
    defaultBody: VNodeChild
  }) => VNodeChild
  renderContent?: (options: {
    defaultContent: VNodeChild
  }) => VNodeChild
}
