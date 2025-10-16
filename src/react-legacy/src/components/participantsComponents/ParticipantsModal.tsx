
import React, { useEffect, useState } from "react";
import ParticipantList from "./ParticipantList";
import ParticipantListOthers from "./ParticipantListOthers";
import { muteParticipants } from "../../methods/participantsMethods/muteParticipants";
import { messageParticipants } from "../../methods/participantsMethods/messageParticipants";
import { removeParticipants } from "../../methods/participantsMethods/removeParticipants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import {
  CoHostResponsibility,
  EventType,
  Participant,
  ShowAlert,
} from "../../@types/types";
import { Socket } from "socket.io-client";

export interface ParticipantsModalParameters {
  position?: string;
  backgroundColor?: string;
  coHostResponsibility: CoHostResponsibility[];
  coHost: string;
  member: string;
  islevel: string;
  participants: Participant[];
  eventType: EventType;
  filteredParticipants: Participant[];
  socket: Socket;
  showAlert?: ShowAlert;
  roomName: string;
  updateIsMessagesModalVisible: (isVisible: boolean) => void;
  updateDirectMessageDetails: (participant: Participant | null) => void;
  updateStartDirectMessage: (start: boolean) => void;
  updateParticipants: (participants: Participant[]) => void;

  //mediasfu functions
  getUpdatedAllParams: () => ParticipantsModalParameters;
  [key: string]: any;
}

export interface ParticipantsModalOptions {
  isParticipantsModalVisible: boolean;
  onParticipantsClose: () => void;
  onParticipantsFilterChange: (filter: string) => void;
  participantsCounter: number;
  onMuteParticipants?: typeof muteParticipants;
  onMessageParticipants?: typeof messageParticipants;
  onRemoveParticipants?: typeof removeParticipants;
  RenderParticipantList?: React.ComponentType<any>;
  RenderParticipantListOthers?: React.ComponentType<any>;
  parameters: ParticipantsModalParameters;
  backgroundColor?: string;
  position?: string;
}

export type ParticipantsModalType = (options: ParticipantsModalOptions) => React.JSX.Element;

/**
 * ParticipantsModal - A React component that displays a modal for managing participants in an event.
 *
 * @param {ParticipantsModalOptions} props - Properties for the ParticipantsModal component.
 * @param {boolean} props.isParticipantsModalVisible - Flag to control the visibility of the modal.
 * @param {() => void} props.onParticipantsClose - Function to handle modal close.
 * @param {(filter: string) => void} props.onParticipantsFilterChange - Callback to filter participants.
 * @param {number} props.participantsCounter - Number of participants to display.
 * @param {typeof muteParticipants} [props.onMuteParticipants=muteParticipants] - Function for muting participants.
 * @param {typeof messageParticipants} [props.onMessageParticipants=messageParticipants] - Function for messaging participants.
 * @param {typeof removeParticipants} [props.onRemoveParticipants=removeParticipants] - Function for removing participants.
 * @param {React.ComponentType<any>} [props.RenderParticipantList=ParticipantList] - Component for listing participants with controls.
 * @param {React.ComponentType<any>} [props.RenderParticipantListOthers=ParticipantListOthers] - Component for listing basic participant information.
 * @param {string} [props.position="topRight"] - Position of the modal.
 * @param {string} [props.backgroundColor="#83c0e9"] - Background color of the modal.
 * @param {ParticipantsModalParameters} props.parameters - Modal-specific parameters.
 *
 * @returns {React.JSX.Element} ParticipantsModal component.
 * 
 * @example
 * ```tsx
 * import React from 'react';
 * import { ParticipantsModal } from 'mediasfu-reactjs';
 * import { io } from 'socket.io-client';
 * 
 * const parameters = {
 *   coHostResponsibility: [{ name: "participants", value: true }],
 *   coHost: "John Doe",
 *   member: "Jane Smith",
 *   islevel: "2",
 *   participants: [{ id: "1", name: "Participant 1", muted: false, videoOn: true }],
 *   eventType: "meeting",
 *   socket: io("http://localhost:3000"),
 *   showAlert: (message) => console.log(message),
 *   roomName: "Room 1",
 *   updateIsMessagesModalVisible: (isVisible) => console.log("Messages modal:", isVisible),
 *   updateDirectMessageDetails: (participant) => console.log("Direct message details:", participant),
 *   updateStartDirectMessage: (start) => console.log("Direct message started:", start),
 *   updateParticipants: (participants) => console.log("Updated participants:", participants),
 *   getUpdatedAllParams: () => ({ filteredParticipants: [{ id: "1", name: "Participant 1", muted: false, videoOn: true }] }),
 * };
 * 
 * <ParticipantsModal
 *   isParticipantsModalVisible={true}
 *   onParticipantsClose={() => console.log("Participants modal closed")}
 *   onParticipantsFilterChange={(filter) => console.log("Filter:", filter)}
 *   participantsCounter={2}
 *   onMuteParticipants={muteParticipants}
 *   onMessageParticipants={messageParticipants}
 *   onRemoveParticipants={removeParticipants}
 *   RenderParticipantList={ParticipantList}
 *   RenderParticipantListOthers={ParticipantListOthers}
 *   position="topRight"
 *   backgroundColor="#83c0e9"
 *   parameters={parameters}
 * />
 * ```
 */

const ParticipantsModal: React.FC<ParticipantsModalOptions> = ({
  isParticipantsModalVisible,
  onParticipantsClose,
  onParticipantsFilterChange,
  participantsCounter,
  onMuteParticipants = muteParticipants,
  onMessageParticipants = messageParticipants,
  onRemoveParticipants = removeParticipants,
  RenderParticipantList = ParticipantList,
  RenderParticipantListOthers = ParticipantListOthers,
  position = "topRight",
  backgroundColor = "#83c0e9",
  parameters,
}) => {
  const {
    coHostResponsibility,
    coHost,
    member,
    islevel,
    participants,
    eventType,
    socket,
    showAlert,
    roomName,
    updateIsMessagesModalVisible,
    updateDirectMessageDetails,
    updateStartDirectMessage,
    updateParticipants,
  } = parameters;
  const [participant_s, setParticipant_s] = useState(participants);
  const [participantsCounter_s, setParticipantsCounter_s] =
    useState(participantsCounter);
  const [reRender, setReRender] = useState(false);

  const screenWidth = window.innerWidth;
  let modalWidth = 0.8 * screenWidth;
  if (modalWidth > 400) {
    modalWidth = 400;
  }

  const modalContainerStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: isParticipantsModalVisible ? "block" : "none",
    zIndex: 999,
  };

  const modalContentStyle: React.CSSProperties = {
    position: "fixed",
    backgroundColor: backgroundColor,
    borderRadius: 10,
    padding: 10,
    width: modalWidth,
    maxHeight: "75%",
    overflowY: "auto",
    top: position.includes("top") ? 10 : "auto",
    bottom: position.includes("bottom") ? 10 : "auto",
    left: position.includes("Left") ? 10 : "auto",
    right: position.includes("Right") ? 10 : "auto",
  };

  const inputStyle: React.CSSProperties = {
    width: "90%",
    padding: 10,
    borderRadius: 5,
    border: "1px solid #000",
    fontSize: 16,
    marginBottom: 10,
  };

  let participantsValue = false;
  try {
    participantsValue =
      coHostResponsibility?.find(
        (item: { name: string; value: boolean }) => item.name === "participants"
      )?.value ?? false;
  } catch {
     // do nothing
  }

  useEffect(() => {
    const { getUpdatedAllParams } = parameters;
    const updatedParams = getUpdatedAllParams();
    setParticipant_s(updatedParams.filteredParticipants);
    setParticipantsCounter_s(updatedParams.filteredParticipants.length);
  }, [participants, reRender]);

  return (
    <div style={modalContainerStyle}>
      <div style={modalContentStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            Participants{" "}
            <span
              style={{
                backgroundColor: "#fff",
                color: "#000",
                borderRadius: 10,
                padding: 5,
              }}
              className="badge"
            >
              {participantsCounter_s}
            </span>
          </div>
          <div onClick={onParticipantsClose} style={{ padding: 5 }}>
            <FontAwesomeIcon icon={faTimes} className="icon" size="xl" />
          </div>
        </div>

        <div>
          {/* Filter input */}
          <input
            type="text"
            style={inputStyle}
            placeholder="Search ..."
            onChange={(e) => {
              onParticipantsFilterChange(e.target.value);
              setReRender(!reRender);
            }}
          />
        </div>
        <div>
          {/* RenderParticipantList and RenderParticipantListOthers components */}
          {(participants && islevel === "2") ||
          (coHost === member && participantsValue === true) ? (
            <RenderParticipantList
              participants={participant_s}
              isBroadcast={eventType === "broadcast"}
              onMuteParticipants={onMuteParticipants}
              onMessageParticipants={onMessageParticipants}
              onRemoveParticipants={onRemoveParticipants}
              socket={socket}
              coHostResponsibility={coHostResponsibility}
              member={member}
              islevel={islevel}
              showAlert={showAlert}
              coHost={coHost}
              roomName={roomName}
              updateIsMessagesModalVisible={updateIsMessagesModalVisible}
              updateDirectMessageDetails={updateDirectMessageDetails}
              updateStartDirectMessage={updateStartDirectMessage}
              updateParticipants={updateParticipants}
            />
          ) : participants ? (
            <RenderParticipantListOthers
              participants={participant_s}
              coHost={coHost}
              member={member}
            />
          ) : (
            <div>No participants</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantsModal;
