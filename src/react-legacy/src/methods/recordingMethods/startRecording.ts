import { recordStartTimer } from "./recordStartTimer";
import { recordResumeTimer } from "./recordResumeTimer";
import type { RecordStartTimerParameters } from "./recordStartTimer";
import type { RecordResumeTimerParameters } from "./recordResumeTimer";
import type { Socket } from "socket.io-client";
import type {
  RePortType,
  UserRecordingParams,
  CaptureCanvasStreamType,
  CaptureCanvasStreamParameters,
  RePortParameters,
  ShowAlert,
} from "../../@types/types";

export interface StartRecordingParameters extends CaptureCanvasStreamParameters, RePortParameters, RecordStartTimerParameters, RecordResumeTimerParameters {
  roomName: string;
  userRecordingParams: UserRecordingParams;
  socket: Socket;
  localSocket?: Socket;
  updateIsRecordingModalVisible: (visible: boolean) => void;
  confirmedToRecord: boolean;
  showAlert?: ShowAlert;
  recordingMediaOptions: string;
  videoAlreadyOn: boolean;
  audioAlreadyOn: boolean;
  recordStarted: boolean;
  recordPaused: boolean;
  recordResumed: boolean;
  recordStopped: boolean;
  startReport: boolean;
  endReport: boolean;
  canRecord: boolean;
  updateClearedToRecord: (cleared: boolean) => void;
  updateRecordStarted: (started: boolean) => void;
  updateRecordPaused: (paused: boolean) => void;
  updateRecordResumed: (resumed: boolean) => void;
  updateStartReport: (started: boolean) => void;
  updateEndReport: (ended: boolean) => void;
  updateCanRecord: (canRecord: boolean) => void;
  whiteboardStarted: boolean;
  whiteboardEnded: boolean;

  // Mediasfu functions
  rePort: RePortType;
  captureCanvasStream: CaptureCanvasStreamType;

  getUpdatedAllParams: () => StartRecordingParameters;
  [key: string]: any;
}

export interface StartRecordingOptions {
  parameters: StartRecordingParameters;
}

// Export the type definition for the function
export type StartRecordingType = (options: StartRecordingOptions) => Promise<boolean | undefined>;

/**
 * Starts the recording process based on the provided parameters.
 * 
 * @param {StartRecordingOptions} options - The options for starting the recording.
 * @param {object} options.parameters - The parameters required for starting the recording.
 * @param {string} options.parameters.roomName - The name of the room where recording is to be started.
 * @param {object} options.parameters.userRecordingParams - User-specific recording parameters.
 * @param {object} options.parameters.socket - The socket instance for communication.
 * @param {object} options.parameters.localSocket - The local socket instance for communication.
 * @param {function} options.parameters.updateIsRecordingModalVisible - Function to update the visibility of the recording modal.
 * @param {boolean} options.parameters.confirmedToRecord - Flag indicating if the user has confirmed to record.
 * @param {function} options.parameters.showAlert - Function to show alerts.
 * @param {string} options.parameters.recordingMediaOptions - The media options for recording (e.g., "video", "audio").
 * @param {boolean} options.parameters.videoAlreadyOn - Flag indicating if the video is already on.
 * @param {boolean} options.parameters.audioAlreadyOn - Flag indicating if the audio is already on.
 * @param {boolean} options.parameters.recordStarted - Flag indicating if the recording has started.
 * @param {boolean} options.parameters.recordPaused - Flag indicating if the recording is paused.
 * @param {boolean} options.parameters.recordResumed - Flag indicating if the recording is resumed.
 * @param {boolean} options.parameters.recordStopped - Flag indicating if the recording is stopped.
 * @param {boolean} options.parameters.startReport - Flag indicating if the start report is active.
 * @param {boolean} options.parameters.endReport - Flag indicating if the end report is active.
 * @param {boolean} options.parameters.canRecord - Flag indicating if recording is allowed.
 * @param {function} options.parameters.updateClearedToRecord - Function to update the cleared to record status.
 * @param {function} options.parameters.updateRecordStarted - Function to update the record started status.
 * @param {function} options.parameters.updateRecordPaused - Function to update the record paused status.
 * @param {function} options.parameters.updateRecordResumed - Function to update the record resumed status.
 * @param {function} options.parameters.updateStartReport - Function to update the start report status.
 * @param {function} options.parameters.updateEndReport - Function to update the end report status.
 * @param {function} options.parameters.updateCanRecord - Function to update the can record status.
 * @param {boolean} options.parameters.whiteboardStarted - Flag indicating if the whiteboard has started.
 * @param {boolean} options.parameters.whiteboardEnded - Flag indicating if the whiteboard has ended.
 * @param {function} options.parameters.rePort - Function to report the recording status.
 * @param {function} options.parameters.captureCanvasStream - Function to capture the canvas stream.
 * 
 * @returns {Promise<boolean | undefined>} - A promise that resolves to a boolean indicating if the recording attempt was successful, or undefined if not applicable.
 *
 * @example
 * ```typescript
 * startRecording({
 *   parameters: {
 *     roomName: "Room101",
 *     userRecordingParams: myUserRecordingParams,
 *     socket: mySocket,
 *     localSocket: myLocalSocket,
 *     updateIsRecordingModalVisible: setIsRecordingModalVisible,
 *     confirmedToRecord: true,
 *     showAlert: myShowAlert,
 *     recordingMediaOptions: "video",
 *     videoAlreadyOn: true,
 *     audioAlreadyOn: true,
 *     recordStarted: false,
 *     recordPaused: false,
 *     recordResumed: false,
 *     recordStopped: false,
 *     startReport: false,
 *     endReport: false,
 *     canRecord: true,
 *     updateClearedToRecord: setClearedToRecord,
 *     updateRecordStarted: setRecordStarted,
 *     updateRecordPaused: setRecordPaused,
 *     updateRecordResumed: setRecordResumed,
 *     updateStartReport: setStartReport,
 *     updateEndReport: setEndReport,
 *     updateCanRecord: setCanRecord,
 *     whiteboardStarted: true,
 *     whiteboardEnded: false,
 *     rePort: myRePort,
 *     captureCanvasStream: myCaptureCanvasStream,
 *   },
 * });
 * ```
 */

export const startRecording = async ({
  parameters,
}: StartRecordingOptions): Promise<boolean | undefined> => {
  let {
    roomName,
    userRecordingParams,
    socket,
    localSocket,
    updateIsRecordingModalVisible,
    confirmedToRecord,
    showAlert,
    recordingMediaOptions,
    videoAlreadyOn,
    audioAlreadyOn,
    recordStarted,
    recordPaused,
    recordResumed,
    recordStopped,
    startReport,
    endReport,
    canRecord,
    updateClearedToRecord,
    updateRecordStarted,
    updateRecordPaused,
    updateRecordResumed,
    updateStartReport,
    updateEndReport,
    updateCanRecord,
    whiteboardStarted,
    whiteboardEnded,

    //mediasfu functions
    rePort,
    captureCanvasStream,
  } = parameters;

  // Check if recording is confirmed before starting
  if (!confirmedToRecord) {
    showAlert?.({
      message: "You must click confirm before you can start recording",
      type: "danger",
    });
    return false;
  }

  // Check for recordingMediaOptions for video
  if (recordingMediaOptions === "video" && !videoAlreadyOn) {
    showAlert?.({
      message: "You must turn on your video before you can start recording",
      type: "danger",
    });
    return false;
  }

  // Check for recordingMediaOptions for audio
  if (recordingMediaOptions === "audio" && !audioAlreadyOn) {
    showAlert?.({
      message: "You must turn on your audio before you can start recording",
      type: "danger",
    });
    return false;
  }

  // Set clearedToRecord to true
  updateClearedToRecord(true);

  let action = "startRecord";
  if (recordStarted && recordPaused && !recordResumed && !recordStopped) {
    action = "resumeRecord";
  }

  let recAttempt = false;
  let socketRef = localSocket && localSocket.connected ? localSocket : socket;

  await new Promise<void>((resolve) => {
    socketRef.emit(
      action,
      { roomName, userRecordingParams },
      async ({ success, reason }: { success: boolean; reason: string; }) => {
        if (success) {
          recordStarted = true;
          startReport = true;
          endReport = false;
          recordPaused = false;
          recAttempt = true;

          updateRecordStarted(recordStarted);
          updateStartReport(startReport);
          updateEndReport(endReport);
          updateRecordPaused(recordPaused);

          if (action === "startRecord") {
            await rePort({ parameters });
            await recordStartTimer({ parameters });
          } else {
            updateRecordResumed(true);
            await rePort({ restart: true, parameters });
            await recordResumeTimer({ parameters });
          }
        } else {
          showAlert?.({
            message: `Recording could not start - ${reason}`,
            type: "danger",
          });
          canRecord = true;
          startReport = false;
          endReport = true;
          recAttempt = false;

          updateCanRecord(canRecord);
          updateStartReport(startReport);
          updateEndReport(endReport);
        }

        resolve();
      }
    );
  });

  // Capture canvas stream if recording is successful and whiteboard is active
  try {
    if (recAttempt && whiteboardStarted && !whiteboardEnded && recordingMediaOptions === "video") {
      await captureCanvasStream({ parameters });
    }
  } catch (error) {
    console.error("Error capturing canvas stream:", error);
  }

  // Set isRecordingModalVisible to false
  updateIsRecordingModalVisible(false);

  return recAttempt;
};
