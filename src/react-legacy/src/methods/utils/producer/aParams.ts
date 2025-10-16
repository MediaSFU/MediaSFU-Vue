import type { RtpEncodingParameters } from "mediasoup-client";
import type { ProducerCodecOptions } from "mediasoup-client";

// Export the type definition for the function
export type AParamsType = {
  encodings: RtpEncodingParameters[];
  codecOptions?: ProducerCodecOptions;
};
/**
 * AParamsType object containing encoding parameters.
 * 
 * @constant
 * @type {AParamsType}
 * @property {Array<Object>} encodings - Array of encoding configurations.
 * @property {string} encodings[].rid - The RTP stream identifier.
 * @property {number} encodings[].maxBitrate - The maximum bitrate for the encoding.
 */
export const aParams: AParamsType = {

  encodings: [
    {
      rid: "r0",
      maxBitrate: 64000,
    },
  ],
};
