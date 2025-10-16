import type { EventType, ShowAlert } from "../../@types/types";

export interface MeetingTimeRemainingOptions {
  timeRemaining: number;
  showAlert?: ShowAlert;
  eventType: EventType;
}

// Export the type definition for the function
export type MeetingTimeRemainingType = (options: MeetingTimeRemainingOptions) => Promise<void>;

/**
 * Handles the remaining time for a meeting and shows an alert if the event type is not 'chat'.
 *
 * @param {MeetingTimeRemainingOptions} options - The options for the meeting time remaining.
 * @param {number} options.timeRemaining - The remaining time in milliseconds.
 * @param {Function} options.showAlert - The function to show an alert message.
 * @param {EventType} options.eventType - The type of the event.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 *
 * @example
 * ```typescript
 * const options = {
 *   timeRemaining: 450000, // 7 minutes and 30 seconds
 *   showAlert: (alert) => console.log(alert.message),
 *   eventType: "meeting",
 * };
 *
 * await meetingTimeRemaining(options);
 * // Output:
 * // "The event will end in 7:30 minutes."
 * ```
 */

export const meetingTimeRemaining = async ({
  timeRemaining,
  showAlert, eventType
}: MeetingTimeRemainingOptions): Promise<void> => {
  // Convert time from milliseconds to readable format of minutes and seconds
  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);
  const timeRemainingString = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  // Show alert with time remaining if eventType is not 'chat'
  if (eventType !== "chat") {
    showAlert?.({
      message: `The event will end in ${timeRemainingString} minutes.`,
      type: "success",
      duration: 3000,
    });
  }
};
