import { Socket } from "socket.io-client";
import { Participant, AutoAdjustType, ScreenState, EventType } from "../@types/types";

export interface TriggerParameters {
  socket: Socket;
  localSocket?: Socket;
  roomName: string;
  screenStates: ScreenState[];
  participants: Participant[];
  updateDateState?: number | null;
  lastUpdate: number | null;
  nForReadjust: number | null;
  eventType: EventType;
  shared: boolean;
  shareScreenStarted: boolean;
  whiteboardStarted: boolean;
  whiteboardEnded: boolean;
  updateUpdateDateState: (timestamp: number | null) => void;
  updateLastUpdate: (lastUpdate: number | null) => void;
  updateNForReadjust: (nForReadjust: number) => void;


  // mediasfu functions
  autoAdjust: AutoAdjustType;

  getUpdatedAllParams: () => TriggerParameters;
  [key: string]: any;
}

export interface TriggerOptions {
  ref_ActiveNames: string[];
  parameters: TriggerParameters;
}

// Export the type definition for the function
export type TriggerType = (options: TriggerOptions) => Promise<void>;

/**
 * Triggers an update to the screen client based on the provided parameters.
 *
 * @param {TriggerOptions} options - The options for triggering the update.
 * @param {string[]} options.ref_ActiveNames - Reference to the active names.
 * @param {TriggerParameters} options.parameters - The parameters for the trigger.
 * 
 * @returns {Promise<void>} A promise that resolves when the trigger is complete.
 *
 * @throws Will throw an error if the updateScreenClient operation fails.
 *
 * @remarks
 * This function handles various conditions to determine the main screen person,
 * adjusts the screen states, and emits an update to the screen client via socket.
 *
 * @example
 * ```typescript
 * await trigger({
 *   ref_ActiveNames: ["user1", "user2"],
 *   parameters: {
 *     socket: socketInstance,
 *     localSocket: localSocketInstance,
 *     roomName: "room1",
 *     screenStates: [{ mainScreenPerson: "user1", mainScreenFilled: true, adminOnMainScreen: false }],
 *     participants: [{ name: "admin", islevel: "2" }],
 *     updateDateState: 0,
 *     lastUpdate: null,
 *     nForReadjust: 0,
 *     eventType: "conference",
 *     shared: false,
 *     shareScreenStarted: false,
 *     whiteboardStarted: false,
 *     whiteboardEnded: false,
 *     updateUpdateDateState: (date) => {},
 *     updateLastUpdate: (date) => {},
 *     updateNForReadjust: (n) => {},
 *     autoAdjust: async ({ n, parameters }) => [n, 0],
 *   },
 * });
 * ```
 */

export async function trigger({
  ref_ActiveNames,
  parameters,
}: TriggerOptions): Promise<void> {
  try {
    parameters = parameters.getUpdatedAllParams();

    let {
      socket,
      localSocket,
      roomName,
      screenStates,
      participants,
      updateDateState,
      lastUpdate,
      nForReadjust,
      eventType,
      shared,
      shareScreenStarted,
      whiteboardStarted,
      whiteboardEnded,
      updateUpdateDateState,
      updateLastUpdate,
      updateNForReadjust,

      //mediasfu functions
      autoAdjust,
    } = parameters;

    let socketRef = socket;
    if (localSocket && localSocket.id) {
      socketRef = localSocket;
    }

    let personOnMainScreen = screenStates[0].mainScreenPerson;
    let adminName = "";
    const admin = participants.filter(
      (participant) => participant.islevel == "2"
    );
    if (admin.length > 0) {
      adminName = admin[0].name || "";
    }

    if (personOnMainScreen === "WhiteboardActive") {
      personOnMainScreen = adminName;
    }

    let mainfilled = screenStates[0].mainScreenFilled;
    let adminOnMain = screenStates[0].adminOnMainScreen;
    let nForReadjust_: number;
    let val1: number;

    let noww = new Date().getTime();
    //get now in seconds
    let timestamp = Math.floor(noww / 1000);

    let eventPass = false;

    if (eventType == "conference" && !(shared || shareScreenStarted)) {
      eventPass = true;
      personOnMainScreen = adminName;

      if (!ref_ActiveNames.includes(adminName)) {
        ref_ActiveNames.unshift(adminName);
      }
    }

    if ((mainfilled && personOnMainScreen != null && adminOnMain) || eventPass) {
      if (eventType == "conference") {
        nForReadjust = nForReadjust! + 1;
        updateNForReadjust(nForReadjust);
      }

      if (!ref_ActiveNames.includes(adminName) && whiteboardStarted && !whiteboardEnded) {
        ref_ActiveNames.unshift(adminName);
      }

      nForReadjust_ = ref_ActiveNames.length;

      if (nForReadjust_ == 0 && eventType == "webinar") {
        val1 = 0;
      } else {
        const [val11, ] = await autoAdjust({
          n: nForReadjust_,
          eventType,
          shared,
          shareScreenStarted,
        });
        val1 = val11;
      }

      let calc1 = Math.floor((val1 / 12) * 100);
      let calc2 = (100) - calc1;

      //check if lastUpdate is not null and at least same seconds
      if (lastUpdate == null || updateDateState != timestamp) {
        let now = new Date();

        socketRef.emit(
          "updateScreenClient",
          {
            roomName,
            names: ref_ActiveNames,
            mainPercent: calc2,
            mainScreenPerson: personOnMainScreen,
            viewType: eventType,
          },
          ({ success, reason }: { success: boolean; reason: string; }) => {
            updateDateState = timestamp;
            updateUpdateDateState(updateDateState);
            lastUpdate = Math.floor(now.getTime() / 1000);
            updateLastUpdate(lastUpdate);
            if (!success) {
              console.log(reason, "updateScreenClient failed");
            }
          }
        );
      }
    } else if (mainfilled && personOnMainScreen != null && !adminOnMain) {
      //check if the person on main screen is still in the room
      // ss = true

      nForReadjust_ = ref_ActiveNames.length;

      if (!ref_ActiveNames.includes(adminName)) {
        ref_ActiveNames.unshift(adminName);
      }

      const [val11, ] = await autoAdjust({
        n: nForReadjust_,
        eventType,
        shared,
        shareScreenStarted,
      });
      val1 = val11;

      const calc1 = Math.floor((val1 / 12) * 100);
      const calc2 = 100 - calc1;

      if (lastUpdate == null || updateDateState !== timestamp) {
        let now = new Date();

        socketRef.emit(
          "updateScreenClient",
          {
            roomName,
            names: ref_ActiveNames,
            mainPercent: calc2,
            mainScreenPerson: personOnMainScreen,
            viewType: eventType,
          },
          ({ success, reason }: { success: boolean; reason: string; }) => {
            updateDateState = timestamp;
            updateUpdateDateState(updateDateState);
            lastUpdate = Math.floor(now.getTime() / 1000);
            updateLastUpdate(lastUpdate);
            if (!success) {
              console.log(reason, "updateScreenClient failed");
            }
          }
        );
      }
    } else {
      //stop recording
      console.log("trigger stopRecording");
    }
  } catch (error) {
    console.log("Error triggering updateScreen:", error);
  }
}

