
import { Socket } from "socket.io-client";
import { GetPipedProducersAltType, GetPipedProducersAltParameters } from "../@types/types";

export interface ReceiveAllPipedTransportsParameters extends GetPipedProducersAltParameters {
  roomName: string;
  member: string;

  // mediasfu functions
  getPipedProducersAlt: GetPipedProducersAltType;
  [key: string]: any;
}

export interface ReceiveAllPipedTransportsOptions {
  nsock: Socket;
  community?: boolean;
  parameters: ReceiveAllPipedTransportsParameters;
}

// Export the type definition for the function
export type ReceiveAllPipedTransportsType = (options: ReceiveAllPipedTransportsOptions) => Promise<void>;

/**
 * Receives all piped transports by emitting an event to the server and processing the response.
 *
 * @param {ReceiveAllPipedTransportsOptions} options - The options for receiving all piped transports.
 * @param {Socket} options.nsock - The socket instance used for communication.
 * @param {boolean} options.community - Whether the room is a community edition room.
 * @param {ReceiveAllPipedTransportsParameters} options.parameters - The parameters for the operation.
 * @param {string} options.parameters.roomName - The name of the room.
 * @param {string} options.parameters.member - The member identifier.
 * @param {Function} options.parameters.getPipedProducersAlt - The function to get piped producers for a given level.
 *
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 *
 * @throws Will log an error message if the operation fails.
 *
 * @example
 * ```typescript
 * await receiveAllPipedTransports({
 *   nsock: socketInstance,
 *   community: false,
 *   parameters: {
 *     roomName: 'Room1',
 *     member: 'Member1',
 *     getPipedProducersAlt: getPipedProducersAltFunction,
 *   },
 * });
 * ```
 */

export const receiveAllPipedTransports = async ({ nsock, community=false, parameters }: ReceiveAllPipedTransportsOptions): Promise<void> => {
  try {
    // Destructure parameters
    const { roomName, member, getPipedProducersAlt } = parameters;
    const emitName = community ? "createReceiveAllTransports" : "createReceiveAllTransportsPiped";
    const emitData = community ? { islevel:'0' } : { roomName, member };
    // Emit createReceiveAllTransportsPiped event to the server
    await nsock.emit(
      emitName,
      emitData,
      async ({ producersExist }: { producersExist: boolean }) => {
        // Array of options representing different levels
        const options = ["0", "1", "2"];

        // If producers exist, loop through each level and get producers
        if (producersExist) {
          for (const islevel of options) {
            await getPipedProducersAlt({ nsock, community, islevel, parameters });
          }
        }
      }
    );
  } catch (error) {
    console.log("receiveAllPipedTransports error", error);
  }
};
