declare module '@mediapipe/selfie_segmentation' {
  export interface SelfieSegmentationInput {
    image: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement
  }

  export interface SelfieSegmentationResults {
    segmentationMask: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement
    image: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement
  }

  export class SelfieSegmentation {
    constructor(options?: Record<string, unknown>)
    setOptions(options: Record<string, unknown>): void
    initialize(): Promise<void>
    onResults(callback: (results: SelfieSegmentationResults) => void): void
    send(input: SelfieSegmentationInput): Promise<void>
  }
}
