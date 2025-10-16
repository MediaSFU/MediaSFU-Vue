import { Socket } from "socket.io-client";
import { ShowAlert, StartShareScreenType, StartShareScreenParameters } from "../@types/types";

export interface RequestScreenShareParameters extends StartShareScreenParameters {
  socket: Socket;
  showAlert?: ShowAlert
  localUIMode: boolean;
  targetResolution?: string;
  targetResolutionHost?: string;
  

  // mediasfu functions
  startShareScreen: StartShareScreenType;
  getUpdatedAllParams : () => RequestScreenShareParameters;
  [key: string]: any;
}

export interface RequestScreenShareOptions {
  parameters: RequestScreenShareParameters;
}

// Export the type definition for the function
export type RequestScreenShareType = (options: RequestScreenShareOptions) => Promise<void>;

/**
 * Requests to start screen sharing.
 *
 * @param {RequestScreenShareOptions} options - The options for requesting screen share.
 * @param {Object} options.parameters - The parameters for the screen share request.
 * @param {Socket} options.parameters.socket - The socket instance to communicate with the server.
 * @param {Function} [options.parameters.showAlert] - Optional function to show alerts to the user.
 * @param {boolean} options.parameters.localUIMode - Indicates if the user is in local UI mode.
 * @param {string} [options.parameters.targetResolution] - The target resolution for screen sharing.
 * @param {string} [options.parameters.targetResolutionHost] - The target resolution for screen sharing for the host.
 * @param {Function} options.parameters.startShareScreen - Function to start screen sharing.
 *
 * @returns {Promise<void>} A promise that resolves when the screen share request is processed.
 *
 * @throws {Error} Throws an error if there is an issue during the screen share request process.
 *
 * @example
 * ```typescript
 * await requestScreenShare({
 *   parameters: {
 *     socket: socketInstance,
 *     localUIMode: false,
 *     targetResolution: 'fhd',
 *     startShareScreen: startShareScreenFunction,
 *     // other parameters...
 *   },
 * });
 * ```
 */

export async function requestScreenShare({ parameters }: RequestScreenShareOptions): Promise<void> {
  try {
    // Destructure parameters
    let {
      socket,
      showAlert,
      localUIMode,
      targetResolution = 'hd',
      targetResolutionHost = 'hd',

      //mediasfu functions
      startShareScreen,
    } = parameters;

    let targetWidth = 1280
    let targetHeight = 720

    if (targetResolution == 'qhd' || targetResolutionHost == 'qhd') {
      targetWidth = 2560
      targetHeight = 1440
    } else if (targetResolution == 'fhd' || targetResolutionHost == 'fhd') {
      targetWidth = 1920
      targetHeight = 1080
    } 

    // Check if the user is in local UI mode
    if (localUIMode === true) {
      await startShareScreen({ parameters });
      return;
    }

    socket.emit("requestScreenShare", async ({ allowScreenShare }: { allowScreenShare: boolean; }) => {
      if (!allowScreenShare) {
        // Send an alert to the user
        showAlert?.({
          message: "You are not allowed to share screen",
          type: "danger",
          duration: 3000,
        });
      } else {
        await startShareScreen({ parameters: { ...parameters, targetWidth, targetHeight } });
      }
    });
  } catch (error) {
    // Handle errors during the process of requesting screen share
    // throw new Error(`Error during requesting screen share: ${error.message}`);
    console.log("Error during requesting screen share: ", error);
  }
}
