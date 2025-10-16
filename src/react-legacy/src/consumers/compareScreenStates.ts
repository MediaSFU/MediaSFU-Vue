import { ScreenState, TriggerType, TriggerParameters } from '../@types/types';

export interface CompareScreenStatesParameters extends TriggerParameters {
  recordingDisplayType: 'video' | 'media' | 'all';
  recordingVideoOptimized: boolean;
  screenStates: ScreenState[];
  prevScreenStates: ScreenState[];
  activeNames: string[];

  // mediasfu functions
  trigger: TriggerType;
  getUpdatedAllParams: () => CompareScreenStatesParameters;
  [key: string]: any;
}

export interface CompareScreenStatesOptions {
  restart?: boolean;
  parameters: CompareScreenStatesParameters;
}

// Export the type definition for the function
export type CompareScreenStatesType = (options: CompareScreenStatesOptions) => Promise<void>;

/**
 * Compares the current screen states with the previous screen states and triggers actions based on changes.
 *
 * @param {CompareScreenStatesOptions} options - The options for comparing screen states.
 * @param {boolean} [options.restart=false] - Whether to restart the comparison process.
 * @param {CompareScreenStatesParameters} options.parameters - The parameters for the comparison.
 * @param {Function} options.parameters.getUpdatedAllParams - Function to get updated parameters.
 * @param {string} options.parameters.recordingDisplayType - The type of display being recorded.
 * @param {boolean} options.parameters.recordingVideoOptimized - Whether the recording is optimized for video.
 * @param {Array<ScreenState>} options.parameters.screenStates - The current screen states.
 * @param {Array<ScreenState>} options.parameters.prevScreenStates - The previous screen states.
 * @param {Array<string>} options.parameters.activeNames - The active names in the current context.
 * @param {Function} options.parameters.trigger - Function to trigger actions based on changes.
 *
 * @returns {Promise<void>} A promise that resolves when the comparison and any triggered actions are complete.
 *
 * @throws Will log an error message if an error occurs during the comparison process.
 * 
 * @example
 * const options = {
 *   restart: false,
 *   parameters: {
 *     getUpdatedAllParams: getUpdatedAllParamsFunction,
 *     recordingDisplayType: 'video',
 *     recordingVideoOptimized: true,
 *     screenStates: [{ key1: 'value1' }, { key2: 'value2' }],
 *     prevScreenStates: [{ key1: 'value1' }, { key2: 'value2' }],
 *     activeNames: ['name1', 'name2'],
 *     trigger: triggerFunction,
 *   },
 * };
 * 
 * compareScreenStates(options)
 *   .then(() => {
 *     console.log('Screen states compared successfully');
 *   });
 */

export async function compareScreenStates({
  restart = false,
  parameters,
}: CompareScreenStatesOptions): Promise<void> {
  try {
    const { getUpdatedAllParams } = parameters;
    parameters = getUpdatedAllParams();

    const {
      recordingDisplayType,
      recordingVideoOptimized,
      screenStates,
      prevScreenStates,
      activeNames,

      //mediasfu functions
      trigger,
    } = parameters;

    // Restart the comparison if needed
    if (restart) {
      // Perform necessary actions on restart
      return;
    }

    // Compare each key-value pair in the screenStates objects
    for (let i = 0; i < screenStates.length; i++) {
      const currentScreenState = screenStates[i];
      const prevScreenState = prevScreenStates[i];

      // Check if any value has changed
      const hasChanged = (Object.keys(currentScreenState) as (keyof ScreenState)[]).some(
        (key) => currentScreenState[key] !== prevScreenState[key]
      );

      // Signal change if any value has changed
      if (hasChanged) {
        // Perform actions or trigger events based on the change
        if (recordingDisplayType === 'video') {
          if (recordingVideoOptimized) {
            await trigger({
              ref_ActiveNames: activeNames,
              parameters,
            });
            break;
          }
        }
        await trigger({ ref_ActiveNames: activeNames, parameters });
        break;
      }
    }
  } catch (error) {
    console.log('compareScreenStates error', error);
    // Optionally re-throw the error for further handling
  }
}
