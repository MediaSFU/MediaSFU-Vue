
import { SoundPlayer } from "../../methods/utils/SoundPlayer";
import type { EventType, UserRecordingParams } from "../../@types/types";

export interface RecordingNoticeParameters {
  islevel: string;
  userRecordingParams: UserRecordingParams;
  recordElapsedTime: number;
  recordStartTime: number;
  recordStarted: boolean;
  recordPaused: boolean;
  canLaunchRecord: boolean;
  stopLaunchRecord: boolean;
  recordStopped: boolean;
  isTimerRunning: boolean;
  canPauseResume: boolean;
  eventType: EventType;

  updateRecordingProgressTime: (time: string) => void;
  updateShowRecordButtons: (show: boolean) => void;
  updateUserRecordingParams: (params: UserRecordingParams) => void;
  updateRecordingMediaOptions: (options: string) => void;
  updateRecordingAudioOptions: (options: string) => void;
  updateRecordingVideoOptions: (options: string) => void;
  updateRecordingVideoType: (type: string) => void;
  updateRecordingVideoOptimized: (optimized: boolean) => void;
  updateRecordingDisplayType: (type: "video" | "media" | "all") => void;
  updateRecordingAddHLS: (addHLS: boolean) => void;
  updateRecordingNameTags: (nameTags: boolean) => void;
  updateRecordingBackgroundColor: (color: string) => void;
  updateRecordingNameTagsColor: (color: string) => void;
  updateRecordingOrientationVideo: (orientation: string) => void;
  updateRecordingAddText: (addText: boolean) => void;
  updateRecordingCustomText: (text: string) => void;
  updateRecordingCustomTextPosition: (position: string) => void;
  updateRecordingCustomTextColor: (color: string) => void;
  updatePauseRecordCount: (count: number) => void;
  updateRecordElapsedTime: (time: number) => void;
  updateRecordStarted: (started: boolean) => void;
  updateRecordPaused: (paused: boolean) => void;
  updateCanLaunchRecord: (canLaunch: boolean) => void;
  updateStopLaunchRecord: (stop: boolean) => void;
  updateRecordStopped: (stopped: boolean) => void;
  updateIsTimerRunning: (running: boolean) => void;
  updateCanPauseResume: (canPause: boolean) => void;
  updateRecordStartTime: (startTime: number) => void;
  updateRecordState: (state: string) => void;

  // mediasfu functions
  [key: string]: any;
}

export interface RecordingNoticeOptions {
  state: string;
  userRecordingParam: UserRecordingParams | null;
  pauseCount: number;
  timeDone: number;
  parameters: RecordingNoticeParameters;
}

// Export the type definition for the function
export type RecordingNoticeType = (options: RecordingNoticeOptions) => Promise<void>;

/**
 * Handles the recording notice state and updates various recording parameters accordingly.
 *
 * @param {RecordingNoticeOptions} options - The options object.
 * @param {string} options.state - The current state of the recording (e.g., "pause", "stop").
 * @param {UserRecordingParams | null} options.userRecordingParam - The user recording parameters.
 * @param {number} options.pauseCount - The count of pauses during the recording.
 * @param {number} options.timeDone - The elapsed time of the recording.
 * @param {Object} options.parameters - The parameters object containing various update functions and state variables.
 * @param {string} options.parameters.islevel - The level of the recording.
 * @param {Object} options.parameters.userRecordingParams - The user recording parameters.
 * @param {number} options.parameters.pauseRecordCount - The count of pauses during the recording.
 * @param {number} options.parameters.recordElapsedTime - The elapsed time of the recording.
 * @param {number} options.parameters.recordStartTime - The start time of the recording.
 * @param {boolean} options.parameters.recordStarted - Indicates if the recording has started.
 * @param {boolean} options.parameters.recordPaused - Indicates if the recording is paused.
 * @param {boolean} options.parameters.canLaunchRecord - Indicates if the recording can be launched.
 * @param {boolean} options.parameters.stopLaunchRecord - Indicates if the recording launch should be stopped.
 * @param {boolean} options.parameters.recordStopped - Indicates if the recording is stopped.
 * @param {boolean} options.parameters.isTimerRunning - Indicates if the timer is running.
 * @param {boolean} options.parameters.canPauseResume - Indicates if the recording can be paused or resumed.
 * @param {string} options.parameters.eventType - The type of event triggering the recording notice.
 * @param {Function} options.parameters.updateRecordingProgressTime - Function to update the recording progress time.
 * @param {Function} options.parameters.updateShowRecordButtons - Function to update the visibility of record buttons.
 * @param {Function} options.parameters.updateUserRecordingParams - Function to update user recording parameters.
 * @param {Function} options.parameters.updateRecordingMediaOptions - Function to update recording media options.
 * @param {Function} options.parameters.updateRecordingAudioOptions - Function to update recording audio options.
 * @param {Function} options.parameters.updateRecordingVideoOptions - Function to update recording video options.
 * @param {Function} options.parameters.updateRecordingVideoType - Function to update recording video type.
 * @param {Function} options.parameters.updateRecordingVideoOptimized - Function to update recording video optimization.
 * @param {Function} options.parameters.updateRecordingDisplayType - Function to update recording display type.
 * @param {Function} options.parameters.updateRecordingAddHLS - Function to update HLS addition in recording.
 * @param {Function} options.parameters.updateRecordingNameTags - Function to update recording name tags.
 * @param {Function} options.parameters.updateRecordingBackgroundColor - Function to update recording background color.
 * @param {Function} options.parameters.updateRecordingNameTagsColor - Function to update recording name tags color.
 * @param {Function} options.parameters.updateRecordingOrientationVideo - Function to update recording orientation video.
 * @param {Function} options.parameters.updateRecordingAddText - Function to update recording text addition.
 * @param {Function} options.parameters.updateRecordingCustomText - Function to update custom text in recording.
 * @param {Function} options.parameters.updateRecordingCustomTextPosition - Function to update custom text position.
 * @param {Function} options.parameters.updateRecordingCustomTextColor - Function to update custom text color.
 * @param {Function} options.parameters.updatePauseRecordCount - Function to update pause record count.
 * @param {Function} options.parameters.updateRecordElapsedTime - Function to update record elapsed time.
 * @param {Function} options.parameters.updateRecordStartTime - Function to update record start time.
 * @param {Function} options.parameters.updateRecordStarted - Function to update record started status.
 * @param {Function} options.parameters.updateRecordPaused - Function to update record paused status.
 * @param {Function} options.parameters.updateCanLaunchRecord - Function to update can launch record status.
 * @param {Function} options.parameters.updateStopLaunchRecord - Function to update stop launch record status.
 * @param {Function} options.parameters.updateRecordStopped - Function to update record stopped status.
 * @param {Function} options.parameters.updateIsTimerRunning - Function to update timer running status.
 * @param {Function} options.parameters.updateCanPauseResume - Function to update can pause/resume status.
 * @param {Function} options.parameters.updateRecordState - Function to update the record state.
 *
 * @returns {Promise<void>} A promise that resolves when the recording notice handling is complete.
 *
 * @example
 * ```typescript
 * const options = {
 *   state: "pause",
 *   userRecordingParam: {
 *     mainSpecs: { mediaOptions: "option1", audioOptions: "option2", videoOptions: "option3", videoType: "HD" },
 *     dispSpecs: { nameTags: true, backgroundColor: "blue", orientationVideo: "landscape" },
 *     textSpecs: { addText: true, customText: "Sample", customTextPosition: "top-right", customTextColor: "white" },
 *   },
 *   pauseCount: 2,
 *   timeDone: 3600,
 *   parameters: { 
 *     islevel: "2",
 *     userRecordingParams: { },
 *     recordElapsedTime: 0,
 *     recordStartTime: 0,
 *     // various other parameters and update functions here...
 *   },
 * };
 * await recordingNotice(options);
 * ```
 */

export const recordingNotice = async ({
  state,
  userRecordingParam,
  pauseCount,
  timeDone,
  parameters,
}: RecordingNoticeOptions): Promise<void> => {
  let {
    islevel,
    userRecordingParams,
    pauseRecordCount,
    recordElapsedTime,
    recordStartTime,
    recordStarted,
    recordPaused,
    canLaunchRecord,
    stopLaunchRecord,
    recordStopped,
    isTimerRunning,
    canPauseResume,
    eventType,

    updateRecordingProgressTime,
    updateShowRecordButtons,
    updateUserRecordingParams,
    updateRecordingMediaOptions,
    updateRecordingAudioOptions,
    updateRecordingVideoOptions,
    updateRecordingVideoType,
    updateRecordingVideoOptimized,
    updateRecordingDisplayType,
    updateRecordingAddHLS,
    updateRecordingNameTags,
    updateRecordingBackgroundColor,
    updateRecordingNameTagsColor,
    updateRecordingOrientationVideo,
    updateRecordingAddText,
    updateRecordingCustomText,
    updateRecordingCustomTextPosition,
    updateRecordingCustomTextColor,
    updatePauseRecordCount,
    updateRecordElapsedTime,
    updateRecordStartTime,
    updateRecordStarted,
    updateRecordPaused,
    updateCanLaunchRecord,
    updateStopLaunchRecord,
    updateRecordStopped,
    updateIsTimerRunning,
    updateCanPauseResume,
    updateRecordState,
  } = parameters;

  try {
    if (islevel !== "2") {
      if (state === "pause") {
        updateRecordStarted(true);
        updateRecordPaused(true);
        updateRecordState("yellow");
        if (eventType !== 'broadcast') {
          SoundPlayer({ soundUrl: "https://www.mediasfu.com/sounds/record-paused.mp3" });
        }
      } else if (state === "stop") {
        updateRecordStarted(true);
        updateRecordStopped(true);
        updateRecordState("green");
        if (eventType !== 'broadcast') {
          SoundPlayer({ soundUrl: "https://www.mediasfu.com/sounds/record-stopped.mp3" });
        }
      } else {
        updateRecordState("red");
        updateRecordStarted(true);
        updateRecordPaused(false);
        if (eventType !== 'broadcast') {
          SoundPlayer({ soundUrl: "https://www.mediasfu.com/sounds/record-progress.mp3" });
        }
      }
    } else {
      if (state === "pause") {
        updateRecordState("yellow");
        if (userRecordingParam) {
          userRecordingParams.mainSpecs = userRecordingParam.mainSpecs;
          userRecordingParams.dispSpecs = userRecordingParam.dispSpecs;
          userRecordingParams.textSpecs = userRecordingParam.textSpecs;

          updateUserRecordingParams(userRecordingParams);
          updateRecordingMediaOptions(userRecordingParams.mainSpecs.mediaOptions);
          updateRecordingAudioOptions(userRecordingParams.mainSpecs.audioOptions);
          updateRecordingVideoOptions(userRecordingParams.mainSpecs.videoOptions);
          updateRecordingVideoType(userRecordingParams.mainSpecs.videoType);
          updateRecordingVideoOptimized(userRecordingParams.mainSpecs.videoOptimized);
          updateRecordingDisplayType(userRecordingParams.mainSpecs.recordingDisplayType);
          updateRecordingAddHLS(userRecordingParams.mainSpecs.addHLS);
          updateRecordingNameTags(userRecordingParams.dispSpecs.nameTags);
          updateRecordingBackgroundColor(userRecordingParams.dispSpecs.backgroundColor);
          updateRecordingNameTagsColor(userRecordingParams.dispSpecs.nameTagsColor);
          updateRecordingOrientationVideo(userRecordingParams.dispSpecs.orientationVideo);
          updateRecordingAddText(userRecordingParams.textSpecs?.addText ?? false);
          updateRecordingCustomText(userRecordingParams.textSpecs?.customText ?? '');
          updateRecordingCustomTextPosition(userRecordingParams.textSpecs?.customTextPosition ?? '');
          updateRecordingCustomTextColor(userRecordingParams.textSpecs?.customTextColor ?? '');

          pauseRecordCount = pauseCount;
          updatePauseRecordCount(pauseRecordCount);

          recordElapsedTime = timeDone;
          recordElapsedTime = Math.floor(recordElapsedTime / 1000);
          recordStartTime = Math.floor(Date.now() / 1000) - recordElapsedTime;
          updateRecordStartTime(recordStartTime);
          updateRecordElapsedTime(recordElapsedTime);



          recordStarted = true;
          recordPaused = true;
          canLaunchRecord = false;
          recordStopped = false;

          updateRecordStarted(recordStarted);
          updateRecordPaused(recordPaused);
          updateCanLaunchRecord(canLaunchRecord);
          updateRecordStopped(recordStopped);
          updateShowRecordButtons(true);

          isTimerRunning = false;
          canPauseResume = true;

          updateIsTimerRunning(isTimerRunning);
          updateCanPauseResume(canPauseResume);

          const formattedTime = formatElapsedTime(recordElapsedTime);
          updateRecordingProgressTime(formattedTime);
        }
        SoundPlayer({ soundUrl: "https://www.mediasfu.com/sounds/record-paused.mp3" });
      } else if (state === "stop") {
        updateRecordStarted(true);
        updateRecordStopped(true);
        canLaunchRecord = false;
        stopLaunchRecord = true;

        updateRecordStarted(recordStarted);
        updateRecordStopped(recordStopped);
        updateCanLaunchRecord(canLaunchRecord);
        updateStopLaunchRecord(stopLaunchRecord);
        updateShowRecordButtons(false);

        updateRecordState("green");
        SoundPlayer({ soundUrl: "https://www.mediasfu.com/sounds/record-stopped.mp3" });
      } else {
        updateRecordState("red");
        updateRecordStarted(true);
        updateRecordPaused(false);
        SoundPlayer({ soundUrl: "https://www.mediasfu.com/sounds/record-progress.mp3" });
      }
    }
  } catch (error) {
    console.log("Error in RecordingNotice: ", error);
    // throw new Error("Failed to handle recording state and status.");
  }
};

const formatElapsedTime = (recordElapsedTime: number): string => {
  
  const hours = Math.floor(recordElapsedTime / 3600);
  const minutes = Math.floor((recordElapsedTime % 3600) / 60);
  const seconds = recordElapsedTime % 60;

  return `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(seconds)}`;
};

const padNumber = (number: number): string => {
  return number.toString().padStart(2, "0");
};
