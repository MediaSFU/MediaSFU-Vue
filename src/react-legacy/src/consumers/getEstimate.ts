import { CalculateRowsAndColumnsType, EventType } from "../@types/types";

export interface GetEstimateParameters {
  fixedPageLimit: number;
  screenPageLimit: number;
  shareScreenStarted: boolean;
  shared?: boolean;
  eventType: EventType;
  removeAltGrid: boolean;
  isWideScreen: boolean;
  isMediumScreen: boolean;
  updateRemoveAltGrid: (value: boolean) => void;

  // mediaSfu functions
  calculateRowsAndColumns: CalculateRowsAndColumnsType;

  [key: string]: any;
}

export interface GetEstimateOptions {
  n: number;
  parameters: GetEstimateParameters;
}

// Export the type definition for the function
export type GetEstimateType = (options: GetEstimateOptions) => [number, number, number];

/**
 * Estimates the number of rows and columns for a given set of parameters.
 *
 * @param {GetEstimateOptions} options - The options for the estimation.
 * @param {number} options.n - The number of items to estimate for.
 * @param {GetEstimateParameters} options.parameters - The parameters for the estimation.
 * @param {number} options.parameters.fixedPageLimit - The fixed page limit.
 * @param {number} options.parameters.screenPageLimit - The screen page limit.
 * @param {boolean} options.parameters.shareScreenStarted - Indicates if screen sharing has started.
 * @param {boolean} [options.parameters.shared] - Indicates if sharing is active.
 * @param {string} options.parameters.eventType - The type of event (e.g., "chat", "conference").
 * @param {boolean} options.parameters.removeAltGrid - Indicates if the alternate grid should be removed.
 * @param {boolean} options.parameters.isWideScreen - Indicates if the screen is wide.
 * @param {boolean} options.parameters.isMediumScreen - Indicates if the screen is medium-sized.
 * @param {Function} options.parameters.updateRemoveAltGrid - Function to update the removeAltGrid parameter.
 * @param {Function} options.parameters.calculateRowsAndColumns - Function to calculate rows and columns.
 *
 * @returns {[number, number, number]} An array containing the estimated number of items, rows, and columns.
 *
 * @throws Will log an error message if an error occurs during estimation.
 *
 * @example
 * const options = {
 *   n: 10,
 *   parameters: {
 *     fixedPageLimit: 5,
 *     screenPageLimit: 8,
 *     shareScreenStarted: false,
 *     shared: false,
 *     eventType: 'conference',
 *     removeAltGrid: false,
 *     isWideScreen: true,
 *     isMediumScreen: false,
 *     updateRemoveAltGrid: (value) => console.log('Remove Alt Grid:', value),
 *     calculateRowsAndColumns: ({ n }) => [3, 4], // Example implementation
 *   },
 * };
 * 
 * const estimate = getEstimate(options);
 * console.log('Estimated:', estimate); // Output: Estimated: [10, 3, 4]
 */

export function getEstimate({ n, parameters }: GetEstimateOptions): [number, number, number] {
  try {
    // Destructure parameters
    let {
      fixedPageLimit,
      screenPageLimit,
      shareScreenStarted,
      shared,
      eventType,
      removeAltGrid,
      isWideScreen,
      isMediumScreen,
      updateRemoveAltGrid,

      //mediaSfu functions
      calculateRowsAndColumns,
    } = parameters;

    // Calculate rows and columns
    const [rows, cols] = calculateRowsAndColumns({ n });

    // Check conditions for removing alt grid
    if (
      n < fixedPageLimit ||
      ((shareScreenStarted || shared) && n < screenPageLimit + 1)
    ) {
      removeAltGrid = true;
      updateRemoveAltGrid(removeAltGrid);

      // Return estimated values based on screen width
      if (!(isMediumScreen || isWideScreen)) {
        return eventType === "chat" ||
          (eventType === "conference" && !(shareScreenStarted || shared))
          ? [n, n, 1]
          : [n, 1, n];
      } else {
        return eventType === "chat" ||
          (eventType === "conference" && !(shareScreenStarted || shared))
          ? [n, 1, n]
          : [n, n, 1];
      }
    }

    return [rows * cols, rows, cols];
  } catch (error) {
    // Handle errors during estimation
    if (error instanceof Error) {
      console.log("Error estimating rows and columns:", error.message);
    } else {
      console.log("Error estimating rows and columns:", error);
    }
    return [0, 0, 0];
    // throw error;
  }
}
