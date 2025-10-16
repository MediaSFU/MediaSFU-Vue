 
import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faReply } from "@fortawesome/free-solid-svg-icons";
import { SendMessageOptions } from "../../methods/messageMethods/sendMessage";
import {
  CoHostResponsibility,
  EventType,
  Message,
  Participant,
  ShowAlert,
} from "../../@types/types";
import { Socket } from "socket.io-client";

// Define props for the MessagePanel component
export interface MessagePanelOptions {
  messages: Message[];
  messagesLength: number;
  type: "direct" | "group";
  username: string;
  onSendMessagePress: (options: SendMessageOptions) => Promise<void>;
  backgroundColor?: string;
  focusedInput: boolean;
  showAlert?: ShowAlert;
  eventType: EventType;
  member: string;
  islevel: string;
  startDirectMessage: boolean;
  updateStartDirectMessage: (start: boolean) => void;
  directMessageDetails: Participant | null;
  updateDirectMessageDetails: (participant: Participant | null) => void;
  coHostResponsibility: CoHostResponsibility[];
  coHost: string;
  roomName: string;
  socket: Socket;
  chatSetting: string;
}

export type MessagePanelType = (options: MessagePanelOptions) => React.JSX.Element;

/**
 * MessagePanel component renders a panel for displaying and sending messages.
 *
 * @component
 * @param {MessagePanelOptions} props - The properties for the MessagePanel component.
 * @param {Message[]} props.messages - The list of messages to display.
 * @param {number} props.messagesLength - The total number of messages.
 * @param {"direct" | "group"} props.type - The type of message panel, either "direct" or "group".
 * @param {string} props.username - The username of the current user.
 * @param {(options: SendMessageOptions) => Promise<void>} props.onSendMessagePress - Function to call when the send button is pressed.
 * @param {string} [props.backgroundColor="#f5f5f5"] - Background color of the message panel.
 * @param {boolean} props.focusedInput - Whether the input is focused.
 * @param {ShowAlert} [props.showAlert] - Function to show an alert message.
 * @param {EventType} props.eventType - The type of event.
 * @param {string} props.member - The member associated with the messages.
 * @param {string} props.islevel - The level of the user.
 * @param {boolean} props.startDirectMessage - Determines if a direct message should be started.
 * @param {(start: boolean) => void} props.updateStartDirectMessage - Function to update the start direct message state.
 * @param {Participant | null} props.directMessageDetails - Details of the participant for direct messages.
 * @param {(participant: Participant | null) => void} props.updateDirectMessageDetails - Function to update direct message details.
 * @param {CoHostResponsibility[]} props.coHostResponsibility - Array of co-host responsibilities.
 * @param {string} props.coHost - The co-host's name.
 * @param {string} props.roomName - The name of the room.
 * @param {Socket} props.socket - The socket for real-time communication.
 * @param {string} props.chatSetting - Chat settings for the message panel.
 *
 * @returns {React.JSX.Element} The rendered MessagePanel component.
 * 
 * @example
 * ```tsx
 * import React from 'react';
 * import { MessagePanel } from 'mediasfu-reactjs';
 * import { io } from 'socket.io-client';
 * 
 * const messages = [
 *   { message: "Hello, how are you?", sender: "user1", receivers: ["user2"], timestamp: "12:00 PM", group: false },
 *   { message: "I'm good, thank you!", sender: "user2", receivers: ["user1"], timestamp: "12:01 PM", group: false },
 * ];
 * 
 * const App = () => {
 *   const socket = io("http://localhost:3000");
 *   const handleSendMessage = async (options) => console.log("Message sent", options);
 *   const handleShowAlert = (options) => console.log("Alert", options);
 * 
 *   return (
 *     <MessagePanel
 *       messages={messages}
 *       messagesLength={messages.length}
 *       type="direct"
 *       username="user1"
 *       onSendMessagePress={handleSendMessage}
 *       backgroundColor="#f5f5f5"
 *       focusedInput={true}
 *       showAlert={handleShowAlert}
 *       eventType="chat"
 *       member="user2"
 *       islevel="2"
 *       startDirectMessage={true}
 *       updateStartDirectMessage={(start) => console.log("Start direct message:", start)}
 *       directMessageDetails={{ name: "user2" }}
 *       updateDirectMessageDetails={(participant) => console.log("Direct message details updated:", participant)}
 *       coHostResponsibility={[]}
 *       coHost="user1"
 *       roomName="room1"
 *       socket={socket}
 *       chatSetting="chat"
 *     />
 *   );
 * };
 * 
 * export default App;
 * ```
 */

const MessagePanel: React.FC<MessagePanelOptions> = ({
  messages,
  messagesLength,
  type,
  username,
  onSendMessagePress,
  backgroundColor = "#f5f5f5",
  focusedInput,
  showAlert,
  eventType,
  member,
  islevel,
  startDirectMessage,
  updateStartDirectMessage,
  directMessageDetails,
  updateDirectMessageDetails,
  coHostResponsibility,
  coHost,
  roomName,
  socket,
  chatSetting,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [replyInfo, setReplyInfo] = useState<{
    text: string;
    username: string;
  } | null>(null);
  const [senderId, setSenderId] = useState<string | null>(null);
  const [directMessageText, setDirectMessageText] = useState<string>("");
  const [groupMessageText, setGroupMessageText] = useState<string>("");

  const handleTextInputChange = (text: string) => {
    if (type === "direct") {
      setDirectMessageText(text);
    } else {
      setGroupMessageText(text);
    }
  };

  const openReplyInput = (senderId: string) => {
    const replyInfoContainer = {
      text: "Replying to: ",
      username: senderId,
    };

    setReplyInfo(replyInfoContainer);
    setSenderId(senderId);
  };

  const handleSendButton = async () => {
    const message = type === "direct" ? directMessageText : groupMessageText;

    if (!message) {
      showAlert?.({
        message: "Please enter a message",
        type: "danger",
        duration: 3000,
      });
      return;
    }

    if (message.length > 350) {
      showAlert?.({
        message: "Message is too long",
        type: "danger",
        duration: 3000,
      });
      return;
    }

    if (message.trim() === "") {
      showAlert?.({
        message: "Message is not valid.",
        type: "danger",
        duration: 3000,
      });
      return;
    }

    if (type === "direct" && !senderId && islevel === "2") {
      showAlert?.({
        message: "Please select a message to reply to",
        type: "danger",
        duration: 3000,
      });
      return;
    }

    await onSendMessagePress({
      message,
      receivers: type === "direct" ? [senderId!] : [],
      group: type === "group" ? true : false,
      messagesLength,
      member,
      sender: username,
      islevel,
      showAlert,
      coHostResponsibility,
      coHost,
      roomName,
      socket,
      chatSetting,
    });

    if (type === "direct") {
      setDirectMessageText("");
    } else {
      setGroupMessageText("");
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    if (replyInfo) {
      setReplyInfo(null);
      setSenderId(null);
    }

    if (focusedInput) {
      updateDirectMessageDetails(null);
      updateStartDirectMessage(false);
    }
  };

  useEffect(() => {
    if (startDirectMessage && directMessageDetails && focusedInput) {
      inputRef.current?.focus();
      const replyInfoContainer = {
        text: "Replying to: ",
        username: directMessageDetails.name,
      };
      setReplyInfo(replyInfoContainer);
      setSenderId(directMessageDetails.name);
    } else {
      setReplyInfo(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }, [directMessageDetails, focusedInput, startDirectMessage]);

  // Define CSS styles
  const styles = {
    inputContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
      marginTop: "auto",
    },
    input: {
      flex: 1,
      minHeight: 40,
      maxHeight: 80,
      resize: "vertical" as const,
      border: "1px solid gray",
      borderRadius: 5,
      padding: 10,
      overflowY: "auto" as const,
    },
    sendButton: {
      backgroundColor: "#83c0e9",
      padding: 10,
      borderRadius: 5,
      display: "flex",
      alignItems: "center",
    },
  };

  return (
    <div style={{ maxHeight: "100%", backgroundColor, overflowY: "auto" }}>
      {/* Message rendering logic */}
      {messages &&
        messages.map((message, index) => (
          <div key={index} style={{ marginBottom: 10 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems:
                  message.sender === username ? "flex-end" : "flex-start",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 3,
                }}
              >
                {message.sender === username && !message.group && (
                  <span
                    style={{
                      fontWeight: "bold",
                      color: "black",
                      fontSize: 8,
                      marginLeft: 6,
                    }}
                  >
                    To: {message.receivers.join(", ")}
                  </span>
                )}
                <span
                  style={{
                    fontWeight: "bold",
                    color: "black",
                    fontSize: 8,
                    marginRight: 10,
                  }}
                >
                  {message.sender === username ? "" : message.sender}
                </span>
                <span style={{ fontSize: 8, color: "#999999" }}>
                  {message.timestamp}
                </span>
                {message.sender !== username && !message.group && (
                  <div
                    style={{
                      padding: 1,
                      marginLeft: 5,
                      borderRadius: 2,
                      backgroundColor: "transparent",
                      cursor: "pointer",
                    }}
                    onClick={() => openReplyInput(message.sender)}
                  >
                    <FontAwesomeIcon icon={faReply} size="xs" color="black" />
                  </div>
                )}
              </div>
              <div
                style={{
                  backgroundColor:
                    message.sender === member ? "#DCF8C6" : "#1ce5c7",
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                <span style={{ color: "black" }}>{message.message}</span>
              </div>
            </div>
          </div>
        ))}

      {/* Reply info */}
      {replyInfo && (
        <div
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 2,
            backgroundColor: "#e6e6e6",
            borderRadius: 5,
            marginBottom: 1,
          }}
        >
          <span style={{ fontWeight: "bold", marginRight: 2, fontSize: 8 }}>
            Replying to:{" "}
          </span>
          <span style={{ color: "red", fontSize: 8 }}>
            {replyInfo.username}
          </span>
        </div>
      )}

      {/* Input area */}
      <div style={styles.inputContainer}>
        <input
          ref={
            focusedInput && startDirectMessage && directMessageDetails
              ? inputRef
              : null
          }
          type="text"
          style={styles.input}
          placeholder={
            type === "direct"
              ? focusedInput && startDirectMessage && directMessageDetails
                ? "Send a direct message to " + directMessageDetails.name
                : "Select a message to reply to"
              : eventType === "chat"
              ? "Send a message"
              : "Send a message to everyone"
          }
          maxLength={350}
          onChange={(e) => handleTextInputChange(e.target.value)}
          value={type === "direct" ? directMessageText : groupMessageText}
        />
        <button style={styles.sendButton} onClick={handleSendButton}>
          <FontAwesomeIcon icon={faPaperPlane} size="sm" color="white" />
        </button>
      </div>
    </div>
  );
};

export default MessagePanel;
