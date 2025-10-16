import { StopShareScreenType, StopShareScreenParameters, RequestScreenShareType, RequestScreenShareParameters, ShowAlert } from "../@types/types";
export interface CheckScreenShareParameters extends StopShareScreenParameters, RequestScreenShareParameters {
  shared: boolean;
  whiteboardStarted: boolean;
  whiteboardEnded: boolean;
  breakOutRoomStarted: boolean;
  breakOutRoomEnded: boolean;
  showAlert?: ShowAlert;

  // Mediasfu functions
  stopShareScreen: StopShareScreenType;
  requestScreenShare: RequestScreenShareType;
  
  getUpdatedAllParams : () => CheckScreenShareParameters;
  [key: string]: any;
}

export interface CheckScreenShareOptions {
  parameters: CheckScreenShareParameters;
}

// Export the type definition for the function
export type CheckScreenShareType = (options: CheckScreenShareOptions) => Promise<void>;

/**
 * Checks the current screen sharing status and either stops or requests screen sharing based on the provided parameters.
 * 
 * @param {CheckScreenShareOptions} options - The options for checking screen share.
 * @param {Object} options.parameters - The parameters for screen sharing.
 * @param {boolean} options.parameters.shared - Indicates if the screen is currently being shared.
 * @param {Function} [options.parameters.showAlert] - Function to show alerts.
 * @param {boolean} options.parameters.whiteboardStarted - Indicates if the whiteboard session has started.
 * @param {boolean} options.parameters.whiteboardEnded - Indicates if the whiteboard session has ended.
 * @param {boolean} options.parameters.breakOutRoomStarted - Indicates if the breakout room session has started.
 * @param {boolean} options.parameters.breakOutRoomEnded - Indicates if the breakout room session has ended.
 * @param {Function} options.parameters.stopShareScreen - Function to stop screen sharing.
 * @param {Function} options.parameters.requestScreenShare - Function to request screen sharing.
 * 
 * @returns {Promise<void>} A promise that resolves when the screen sharing status has been checked and the appropriate action has been taken.
 * 
 * @throws Will log an error message if an error occurs during the process.
 * 
 * @example
 * const options = {
 *   parameters: {
 *     shared: false,
 *     showAlert: showAlertFunction,
 *     whiteboardStarted: false,
 *     whiteboardEnded: false,
 *     breakOutRoomStarted: false,
 *     breakOutRoomEnded: false,
 *     stopShareScreen: stopShareScreenFunction,
 *     requestScreenShare: requestScreenShareFunction,
 *   },
 * };
 * 
 * checkScreenShare(options)
 *   .then(() => {
 *     console.log('Screen share checked successfully');
 *   })
 *   .catch((error) => {
 *     console.error('Error checking screen share:', error);
 *   });
 */

export async function checkScreenShare({ parameters }: CheckScreenShareOptions): Promise<void> {
  try {
    const {
      shared,
      showAlert,
      whiteboardStarted,
      whiteboardEnded,
      breakOutRoomStarted,
      breakOutRoomEnded,

      //mediasfu functions
      stopShareScreen,
      requestScreenShare,
    } = parameters;

    // Stop screen share if already shared or request screen share if not shared
    if (shared) {
      if (whiteboardStarted && !whiteboardEnded) {
        showAlert?.({
          message: "Screen share is not allowed when whiteboard is active",
          type: "danger",
        });
        return;
      }
      await stopShareScreen({ parameters });
    } else {
      // Can't share if breakout room is active
      if (breakOutRoomStarted && !breakOutRoomEnded) {
        showAlert?.({
          message: "Screen share is not allowed when breakout room is active",
          type: "danger",
        });
        return;
      }

      if (whiteboardStarted && !whiteboardEnded) {
        showAlert?.({
          message: "Screen share is not allowed when whiteboard is active",
          type: "danger",
        });
        return;
      }
      await requestScreenShare({ parameters });
    }
  } catch (error) {
    console.log("checkScreenShare error", error);
    // throw error;
  }
}
