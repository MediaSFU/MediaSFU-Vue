export interface RecordUpdateTimerOptions {
  recordElapsedTime: number;
  recordStartTime: number;
  updateRecordElapsedTime: (elapsedTime: number) => void;
  updateRecordingProgressTime: (formattedTime: string) => void;
}

// Export the type definition for the function
export type RecordUpdateTimerType = (options: RecordUpdateTimerOptions) => void;

/**
 * Updates the recording timer and progress time.
 * @function
 * @param {RecordUpdateTimerOptions} options - The options object containing necessary variables and functions.
 */
/**
 * Updates the recording timer by calculating the elapsed time since the recording started
 * and formatting it in HH:MM:SS format.
 *
 * @param {Object} options - The options object.
 * @param {number} options.recordElapsedTime - The elapsed recording time in seconds.
 * @param {number} options.recordStartTime - The timestamp when the recording started.
 * @param {Function} options.updateRecordElapsedTime - Callback to update the elapsed recording time.
 * @param {Function} options.updateRecordingProgressTime - Callback to update the formatted recording time.
 * @returns {void}
 * 
 * @example
 * ```typescript
 * recordUpdateTimer({
 *   recordElapsedTime: 0,
 *   recordStartTime: Date.now(),
 *   updateRecordElapsedTime: (elapsedTime) => console.log("Elapsed Time:", elapsedTime),
 *   updateRecordingProgressTime: (formattedTime) => console.log("Recording Progress:", formattedTime),
 * });
 * ```
 */

export function recordUpdateTimer({
  recordElapsedTime,
  recordStartTime,
  updateRecordElapsedTime,
  updateRecordingProgressTime,
}: RecordUpdateTimerOptions): void {

  /**
   * Utility function to pad single-digit numbers with leading zeros.
   * @param {number} number - The number to pad.
   * @returns {string} The padded number as a string.
   */
  function padNumber(number: number): string {
    return number.toString().padStart(2, "0");
  }

  const currentTime = new Date().getTime(); // Get the current timestamp
  recordElapsedTime = Math.floor((currentTime - recordStartTime) / 1000); // Calculate the elapsed time in seconds
  updateRecordElapsedTime(recordElapsedTime);

  // Format the time in HH:MM:SS format
  const hours = Math.floor(recordElapsedTime / 3600);
  const minutes = Math.floor((recordElapsedTime % 3600) / 60);
  const seconds = recordElapsedTime % 60;
  const formattedTime =
    padNumber(hours) + ":" + padNumber(minutes) + ":" + padNumber(seconds);

  updateRecordingProgressTime(formattedTime);
}
