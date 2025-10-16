import type { ProducerCodecOptions, RtpEncodingParameters } from "mediasoup-client";

export type VParamsType = {
  encodings: RtpEncodingParameters[];
  codecOptions?: ProducerCodecOptions;
};
/**
 * Video parameters configuration object.
 * 
 * @type {VParamsType}
 * @property {Array<Object>} encodings - Array of encoding settings.
 * @property {string} encodings[].rid - The RTP stream identifier.
 * @property {number} encodings[].maxBitrate - Maximum bitrate for the encoding.
 * @property {string} encodings[].scalabilityMode - Scalability mode for the encoding.
 * @property {string} encodings[].networkPriority - Network priority for the encoding.
 * @property {string} encodings[].priority - Priority for the encoding.
 * @property {number} [encodings[].scaleResolutionDownBy] - Factor by which to scale down the resolution.
 * @property {Object} codecOptions - Codec options for the video.
 * @property {number} codecOptions.videoGoogleStartBitrate - Initial bitrate for the video codec.
 */
export const vParams: VParamsType = {
  encodings: [
    {
      rid: "r3",
      maxBitrate: 200000,
      scalabilityMode: "L1T3",
      scaleResolutionDownBy: 4.0,
    },
    {
      rid: "r4",
      maxBitrate: 400000,
      scalabilityMode: "L1T3",
      scaleResolutionDownBy: 2.0,
    },
    {
      rid: "r5",
      maxBitrate: 800000,
      scalabilityMode: "L1T3",
    },
  ],

  codecOptions: {
    videoGoogleStartBitrate: 320,
  },
};
