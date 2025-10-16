
 
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './CoHostModal.css'; // Import your custom CSS for styling
import 'bootstrap/dist/css/bootstrap.min.css';
import { modifyCoHostSettings } from '../../methods/coHostMethods/modifyCoHostSettings';
import { CoHostResponsibility, Participant, ModifyCoHostSettingsOptions, ShowAlert } from '../../@types/types';
import { Socket } from 'socket.io-client';
export interface CoHostModalOptions {
  isCoHostModalVisible: boolean;
  currentCohost?: string;
  participants: Participant[];
  coHostResponsibility: CoHostResponsibility[];
  position?: string;
  backgroundColor?: string;
  roomName: string;
  showAlert?: ShowAlert;
  updateCoHostResponsibility: (coHostResponsibility: CoHostResponsibility[]) => void;
  updateCoHost: (coHost: string) => void;
  updateIsCoHostModalVisible: (isCoHostModalVisible: boolean) => void;
  socket: Socket
  onCoHostClose: () => void;
  onModifyEventSettings?: (settings: ModifyCoHostSettingsOptions) => void;
}

export type CoHostModalType = (options: CoHostModalOptions) => React.JSX.Element;



/**
 * CoHostModal component allows managing co-host settings for an event.
 *
 * This component displays a modal that enables users to select a new co-host from the list of participants,
 * assign responsibilities, and save the updated settings. Real-time communication is facilitated using a
 * Socket instance, and it includes customizable options for modal appearance and position.
 *
 * @component
 * @param {boolean} isCoHostModalVisible - Determines if the co-host modal is visible.
 * @param {() => void} onCoHostClose - Function to close the co-host modal.
 * @param {Function} [onModifyEventSettings=modifyCoHostSettings] - Function to modify event settings, defaulting to `modifyCoHostSettings`.
 * @param {string} [currentCohost='No coHost'] - The name of the current co-host.
 * @param {Participant[]} participants - List of participants.
 * @param {CoHostResponsibility[]} coHostResponsibility - Array of co-host responsibilities.
 * @param {string} [position='topRight'] - Position of the modal within the viewport.
 * @param {string} [backgroundColor='#83c0e9'] - Background color of the modal.
 * @param {string} roomName - Name of the room.
 * @param {ShowAlert} [showAlert] - Function to display an alert.
 * @param {Function} updateCoHostResponsibility - Function to update the array of co-host responsibilities.
 * @param {Function} updateCoHost - Function to update the current co-host.
 * @param {Function} updateIsCoHostModalVisible - Function to control the visibility of the co-host modal.
 * @param {Socket} socket - Socket instance for real-time communication.
 *
 * @returns {React.JSX.Element} The CoHostModal component.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { CoHostModal } from 'mediasfu-reactjs';
 * import { io } from 'socket.io-client';
 *
 * function App() {
 *   const isCoHostModalVisible = true;
 *   const onCoHostClose = () => console.log('Co-host modal closed');
 *   const onModifyEventSettings = (settings) => console.log('Settings modified', settings);
 *   const currentCohost = 'John Doe';
 *   const participants = [
 *     { name: 'John Doe', islevel: '1' },
 *     { name: 'Jane Doe', islevel: '0' }
 *   ];
 *   const coHostResponsibility = [
 *     { name: 'manageParticipants', value: true, dedicated: false }
 *   ];
 *   const position = 'topRight';
 *   const backgroundColor = '#83c0e9';
 *   const roomName = 'Room 1';
 *   const showAlert = ({ message, type }) => console.log('Alert:', message, type);
 *   const updateCoHostResponsibility = (responsibilities) => console.log('Co-host responsibilities updated', responsibilities);
 *   const updateCoHost = (coHost) => console.log('Co-host updated', coHost);
 *   const updateIsCoHostModalVisible = (visible) => console.log('Co-host modal visibility:', visible);
 *   const socket = io('http://localhost:3000');
 *
 *   return (
 *     <CoHostModal
 *       isCoHostModalVisible={isCoHostModalVisible}
 *       onCoHostClose={onCoHostClose}
 *       onModifyEventSettings={onModifyEventSettings}
 *       currentCohost={currentCohost}
 *       participants={participants}
 *       coHostResponsibility={coHostResponsibility}
 *       position={position}
 *       backgroundColor={backgroundColor}
 *       roomName={roomName}
 *       showAlert={showAlert}
 *       updateCoHostResponsibility={updateCoHostResponsibility}
 *       updateCoHost={updateCoHost}
 *       updateIsCoHostModalVisible={updateIsCoHostModalVisible}
 *       socket={socket}
 *     />
 *   );
 * }
 *
 * export default App;
 * ```
 */

const CoHostModal: React.FC<CoHostModalOptions> = ({
  isCoHostModalVisible,
  onCoHostClose,
  onModifyEventSettings = modifyCoHostSettings,
  currentCohost = 'No coHost',
  participants,
  coHostResponsibility,
  position = 'topRight',
  backgroundColor = '#83c0e9',
  roomName,
  showAlert,
  updateCoHostResponsibility,
  updateCoHost,
  updateIsCoHostModalVisible,
  socket,
}) => {
  const screenWidth = window.innerWidth;
  let modalWidth = 0.8 * screenWidth;
  if (modalWidth > 400) {
    modalWidth = 400;
  }

  const modalContainerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: isCoHostModalVisible ? 'block' : 'none',
    zIndex: 999,
  };

  const modalContentStyle: React.CSSProperties = {
    position: 'fixed',
    backgroundColor: backgroundColor,
    borderRadius: 10,
    padding: 10,
    width: modalWidth,
    maxHeight: '65%',
    maxWidth: modalWidth,
    overflowX: 'hidden',
    overflowY: 'auto',
    top: position.includes('top') ? 10 : 'auto',
    bottom: position.includes('bottom') ? 10 : 'auto',
    left: position.includes('Left') ? 10 : 'auto',
    right: position.includes('Right') ? 10 : 'auto',
  };

  const [selectedCohost, setSelectedCohost] = useState<string>(currentCohost);
  const [CoHostResponsibilityCopy, setCoHostResponsibilityCopy] = useState<CoHostResponsibility[]>([...coHostResponsibility]);
  const [CoHostResponsibilityCopyAlt, setCoHostResponsibilityCopyAlt] = useState<CoHostResponsibility[]>([...coHostResponsibility]);

  const initialResponsibilities = CoHostResponsibilityCopyAlt.reduce<Record<string, boolean>>((acc, item) => {
    const str2 = item.name.charAt(0).toUpperCase() + item.name.slice(1);
    const keyed = `manage${str2}`;
    acc[keyed] = item.value;
    acc[`dedicateTo${keyed}`] = item.dedicated;
    return acc;
  }, {});

  const [responsibilities, setResponsibilities] = useState<Record<string, boolean>>(initialResponsibilities);

  const responsibilityItems = [
    { name: 'manageParticipants', label: 'Manage Participants' },
    { name: 'manageMedia', label: 'Manage Media' },
    { name: 'manageWaiting', label: 'Manage Waiting Room' },
    { name: 'manageChat', label: 'Manage Chat' },
  ];

  // Filter out the current co-host from the list of participants and any participant with islevel '2'
  const filteredParticipants = participants?.filter((participant) => participant.name !== currentCohost && participant.islevel !== '2');

  const handleToggleSwitch = (responsibility: string) => {
    setResponsibilities((prevResponsibilities) => ({
      ...prevResponsibilities,
      [responsibility]: !prevResponsibilities[responsibility],
    }));

    // Update the coHostResponsibilityCopy
    if (responsibility.startsWith('dedicateTo')) {
      const responsibilityName = responsibility.replace('dedicateTomanage', '').toLowerCase();
      const responsibilityDedicated = CoHostResponsibilityCopy.find((item) => item.name === responsibilityName)?.dedicated;
      if (responsibilityDedicated !== undefined) {
        CoHostResponsibilityCopy.find((item) => item.name === responsibilityName)!.dedicated = !responsibilityDedicated;
      }
      setCoHostResponsibilityCopy([...CoHostResponsibilityCopy]);
    } else if (responsibility.startsWith('manage')) {
      const responsibilityName = responsibility.replace('manage', '').toLowerCase();
      const responsibilityValue = CoHostResponsibilityCopy.find((item) => item.name === responsibilityName)?.value;
      if (responsibilityValue !== undefined) {
        CoHostResponsibilityCopy.find((item) => item.name === responsibilityName)!.value = !responsibilityValue;
      }
      setCoHostResponsibilityCopy([...CoHostResponsibilityCopy]);
    }
  };

  useEffect(() => {
    const populateResponsibilities = () => {
      setCoHostResponsibilityCopyAlt([...coHostResponsibility]);
      setCoHostResponsibilityCopy([...coHostResponsibility]);
      const responsibilities = CoHostResponsibilityCopyAlt.reduce<Record<string, boolean>>((acc, item) => {
        const str2 = item.name.charAt(0).toUpperCase() + item.name.slice(1);
        const keyed = `manage${str2}`;
        acc[keyed] = item.value;
        acc[`dedicateTo${keyed}`] = item.dedicated;
        return acc;
      }, {});
      setResponsibilities(responsibilities);
    };

    if (isCoHostModalVisible) {
      populateResponsibilities();
    }
  }, [isCoHostModalVisible, coHostResponsibility]);

  return (
    <div style={modalContainerStyle} className='mediasfu-cohost-modal'>
      <div style={modalContentStyle}>
        <div className="modal-header">
          <div className="modal-title">Manage Co-Host</div>
          <div className="btn-close-settings" onClick={onCoHostClose}>
            <FontAwesomeIcon icon={faTimes} className="icon" />
          </div>
        </div>
        <hr className="hr" />
        <div className="modal-body">
          <div className="form-group">
            <label className="font-weight-bold">Current Co-host:</label>
            <input className="form-control" value={currentCohost} readOnly />
          </div>
          <div className="form-group">
            <label className="font-weight-bold">Select New Co-host:</label>
            <select className="form-control" value={selectedCohost} onChange={(e) => setSelectedCohost(e.target.value)}>
              <option value="">Select a participant</option>
              {filteredParticipants.map((participant) => (
                <option key={participant.name} value={participant.name}>
                  {participant.name}
                </option>
              ))}
            </select>
          </div>
          <div className="row">
            <div className="col-5">
              <label style={{ fontWeight: 'bold' }}>Responsibility</label>
            </div>
            <div className="col-3">
              <label style={{ fontWeight: 'bold' }}>Select</label>
            </div>
            <div className="col-4">
              <label style={{ fontWeight: 'bold' }}>Dedicated</label>
            </div>
          </div>
          {responsibilityItems &&
            responsibilityItems.map((item) => (
              <div className="row" key={item.name} style={{ marginBottom: 10 }}>
                <div className="col-5" style={{ fontWeight: 'bold' }}>
                  {item.label}
                </div>
                <div className="col-3">
                  <input
                    type="checkbox"
                    checked={responsibilities[item.name]}
                    onChange={() => handleToggleSwitch(item.name)}
                  />
                </div>
                <div className="col-4">
                  <input
                    type="checkbox"
                    checked={responsibilities[item.name] && responsibilities[`dedicateTo${item.name}`]}
                    onChange={() => handleToggleSwitch(`dedicateTo${item.name}`)}
                    disabled={!responsibilities[item.name]}
                  />
                </div>
              </div>
            ))}
        </div>
        <div className="modal-footer">
          <button
            className="btn-apply-settings"
            onClick={() =>
              onModifyEventSettings({
                  roomName: roomName,
                  showAlert: showAlert,
                  selectedParticipant: selectedCohost,
                  coHost: currentCohost,
                  coHostResponsibility: CoHostResponsibilityCopy,
                  updateCoHostResponsibility: updateCoHostResponsibility,
                  updateCoHost: updateCoHost,
                  updateIsCoHostModalVisible: updateIsCoHostModalVisible,
                  socket: socket,
              })
            }
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoHostModal;
