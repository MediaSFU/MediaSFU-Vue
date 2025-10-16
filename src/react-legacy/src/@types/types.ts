import type { CSSProperties, FC, ReactElement } from 'react';

// //consumers/socketReceiveMethods
export * from '../consumers/socketReceiveMethods/joinConsumeRoom';
export * from '../consumers/socketReceiveMethods/producerClosed';
export * from '../consumers/socketReceiveMethods/newPipeProducer';

// consumers
export * from '../consumers/addVideosGrid';
export * from '../consumers/autoAdjust';
export * from '../consumers/calculateRowsAndColumns';
export * from '../consumers/changeVids';
export * from '../consumers/checkGrid';
export * from '../consumers/checkPermission';
export * from '../consumers/checkScreenShare';
export * from '../consumers/closeAndResize';
export * from '../consumers/compareActiveNames';
export * from '../consumers/compareScreenStates';
export * from '../consumers/connectIps';
export * from '../consumers/connectLocalIps';
export * from '../consumers/connectRecvTransport';
export * from '../consumers/connectSendTransport';
export * from '../consumers/connectSendTransportAudio';
export * from '../consumers/connectSendTransportScreen';
export * from '../consumers/connectSendTransportVideo';
export * from '../consumers/consumerResume';
export * from '../consumers/controlMedia';
export * from '../consumers/createSendTransport';
export * from '../consumers/disconnectSendTransportAudio';
export * from '../consumers/disconnectSendTransportVideo';
export * from '../consumers/disconnectSendTransportScreen';
export * from '../consumers/dispStreams';
export * from '../consumers/generatePageContent';
export * from '../consumers/getEstimate';
export * from '../consumers/getPipedProducersAlt';
export * from '../consumers/getProducersPiped';
export * from '../consumers/getVideos';
export * from '../consumers/mixStreams';
export * from '../consumers/onScreenChanges';
export * from '../consumers/prepopulateUserMedia';
export * from '../consumers/processConsumerTransports';
export * from '../consumers/processConsumerTransportsAudio';
export * from '../consumers/readjust';
export * from '../consumers/receiveAllPipedTransports';
export * from '../consumers/reorderStreams';
export * from '../consumers/rePort';
export * from '../consumers/requestScreenShare';
export * from '../consumers/resumePauseAudioStreams';
export * from '../consumers/resumePauseStreams';
export * from '../consumers/resumeSendTransportAudio';
export * from '../consumers/reUpdateInter';
export * from '../consumers/signalNewConsumerTransport';
export * from '../consumers/startShareScreen';
export * from '../consumers/stopShareScreen';
export * from '../consumers/streamSuccessAudio';
export * from '../consumers/streamSuccessAudioSwitch';
export * from '../consumers/streamSuccessScreen';
export * from '../consumers/streamSuccessVideo';
export * from '../consumers/switchUserAudio';
export * from '../consumers/switchUserVideo';
export * from '../consumers/switchUserVideoAlt';
export * from '../consumers/trigger';
export * from '../consumers/updateMiniCardsGrid';
export * from '../consumers/updateParticipantAudioDecibels';

// Utils
export * from '../methods/utils/producer/aParams';
export * from '../methods/utils/producer/hParams';
export * from '../methods/utils/producer/screenParams';
export * from '../methods/utils/producer/vParams';
export * from '../methods/utils/joinRoomOnMediaSFU';
export * from '../methods/utils/meetingTimer/startMeetingProgressTimer';
export * from '../methods/utils/MiniAudioPlayer/MiniAudioPlayer';
export * from '../methods/utils/formatNumber';
export * from '../methods/utils/generateRandomMessages';
export * from '../methods/utils/generateRandomParticipants';
export * from '../methods/utils/generateRandomPolls';
export * from '../methods/utils/generateRandomRequestList';
export * from '../methods/utils/generateRandomWaitingRoomList';
export * from '../methods/utils/getModalPosition';
export * from '../methods/utils/getOverlayPosition';
export * from '../methods/utils/sleep';
export * from '../methods/utils/validateAlphanumeric';

// Background Methods
export * from '../methods/backgroundMethods/launchBackground';

// Breakout Rooms Methods
export * from '../methods/breakoutRoomsMethods/launchBreakoutRooms';
export * from '../methods/breakoutRoomsMethods/breakoutRoomUpdated';

// Co-Host Methods
export * from '../methods/coHostMethods/launchCoHost';
export * from '../methods/coHostMethods/modifyCoHostSettings';

// Display Settings Methods
export * from '../methods/displaySettingsMethods/launchDisplaySettings';
export * from '../methods/displaySettingsMethods/modifyDisplaySettings';

// Exit Methods
export * from '../methods/exitMethods/launchConfirmExit';
export * from '../methods/exitMethods/confirmExit';

// Media Settings Methods
export * from '../methods/mediaSettingsMethods/launchMediaSettings';

// Menu Methods
export * from '../methods/menuMethods/launchMenuModal';

// Message Methods
export * from '../methods/messageMethods/launchMessages';
export * from '../methods/messageMethods/sendMessage';

// Participants Methods
export * from '../methods/participantsMethods/launchParticipants';
export * from '../methods/participantsMethods/messageParticipants';
export * from '../methods/participantsMethods/muteParticipants';
export * from '../methods/participantsMethods/removeParticipants';

// Polls Methods
export * from '../methods/pollsMethods/handleCreatePoll';
export * from '../methods/pollsMethods/handleEndPoll';
export * from '../methods/pollsMethods/handleVotePoll';
export * from '../methods/pollsMethods/launchPoll';
export * from '../methods/pollsMethods/pollUpdated';

// Recording Methods
export * from '../methods/recordingMethods/checkPauseState';
export * from '../methods/recordingMethods/checkResumeState';
export * from '../methods/recordingMethods/confirmRecording';
export * from '../methods/recordingMethods/launchRecording';
export * from '../methods/recordingMethods/recordPauseTimer';
export * from '../methods/recordingMethods/recordResumeTimer';
export * from '../methods/recordingMethods/recordStartTimer';
export * from '../methods/recordingMethods/recordUpdateTimer';
export * from '../methods/recordingMethods/startRecording';
export * from '../methods/recordingMethods/stopRecording';
export * from '../methods/recordingMethods/updateRecording';

// Requests Methods
export * from '../methods/requestsMethods/launchRequests';
export * from '../methods/requestsMethods/respondToRequests';

// Settings Methods
export * from '../methods/settingsMethods/launchSettings';
export * from '../methods/settingsMethods/modifySettings';

// Stream Methods
export * from '../methods/streamMethods/clickAudio';
export * from '../methods/streamMethods/clickChat';
export * from '../methods/streamMethods/clickScreenShare';
export * from '../methods/streamMethods/clickVideo';
export * from '../methods/streamMethods/switchAudio';
export * from '../methods/streamMethods/switchVideo';
export * from '../methods/streamMethods/switchVideoAlt';

export * from '../methods/utils/meetingTimer/startMeetingProgressTimer';
export * from '../methods/utils/MiniAudioPlayer/MiniAudioPlayer';
export * from '../methods/utils/formatNumber';
export * from '../methods/utils/generateRandomMessages';
export * from '../methods/utils/generateRandomParticipants';
export * from '../methods/utils/generateRandomPolls';
export * from '../methods/utils/generateRandomRequestList';
export * from '../methods/utils/generateRandomWaitingRoomList';
export * from '../methods/utils/getModalPosition';
export * from '../methods/utils/getOverlayPosition';
export * from '../methods/utils/sleep';
export * from '../methods/utils/validateAlphanumeric';

export * from '../methods/waitingMethods/launchWaiting';
export * from '../methods/waitingMethods/respondToWaiting';
export * from '../methods/whiteboardMethods/launchConfigureWhiteboard';
export * from '../methods/whiteboardMethods/captureCanvasStream';


// Producer Client Emits
export * from '../ProducerClient/producerClientEmits/createDeviceClient';
export * from '../ProducerClient/producerClientEmits/joinRoomClient';
export * from '../ProducerClient/producerClientEmits/updateRoomParametersClient';

// Producers Emits
export * from '../producers/producerEmits/joinConRoom';
export * from '../producers/producerEmits/joinRoom';
export * from '../producers/producerEmits/joinLocalRoom';

// Socket Receive Methods
export * from '../producers/socketReceiveMethods/allMembers';
export * from '../producers/socketReceiveMethods/allMembersRest';
export * from '../producers/socketReceiveMethods/allWaitingRoomMembers';
export * from '../producers/socketReceiveMethods/banParticipant';
export * from '../producers/socketReceiveMethods/controlMediaHost';
export * from '../producers/socketReceiveMethods/disconnect';
export * from '../producers/socketReceiveMethods/disconnectUserSelf';
export * from '../producers/socketReceiveMethods/getDomains';
export * from '../producers/socketReceiveMethods/hostRequestResponse';
export * from '../producers/socketReceiveMethods/meetingEnded';
export * from '../producers/socketReceiveMethods/meetingStillThere';
export * from '../producers/socketReceiveMethods/meetingTimeRemaining';
export * from '../producers/socketReceiveMethods/participantRequested';
export * from '../producers/socketReceiveMethods/personJoined';
export * from '../producers/socketReceiveMethods/producerMediaClosed';
export * from '../producers/socketReceiveMethods/producerMediaPaused';
export * from '../producers/socketReceiveMethods/producerMediaResumed';
export * from '../producers/socketReceiveMethods/reInitiateRecording';
export * from '../producers/socketReceiveMethods/receiveMessage';
export * from '../producers/socketReceiveMethods/recordingNotice';
export * from '../producers/socketReceiveMethods/roomRecordParams';
export * from '../producers/socketReceiveMethods/screenProducerId';
export * from '../producers/socketReceiveMethods/startRecords';
export * from '../producers/socketReceiveMethods/stoppedRecording';
export * from '../producers/socketReceiveMethods/timeLeftRecording';
export * from '../producers/socketReceiveMethods/updateConsumingDomains';
export * from '../producers/socketReceiveMethods/updateMediaSettings';
export * from '../producers/socketReceiveMethods/updatedCoHost';
export * from '../producers/socketReceiveMethods/userWaiting';
export * from '../sockets/SocketManager';

// Components
export * from '../components/backgroundComponents/BackgroundModal';
export * from '../components/breakoutComponents/BreakoutRoomsModal';
export * from '../components/coHostComponents/CoHostModal';
export * from '../components/displayComponents/AlertComponent';
export * from '../components/displayComponents/AudioCard';
export * from '../components/displayComponents/AudioGrid';
export * from '../components/displayComponents/CardVideoDisplay';
export * from '../components/displayComponents/ControlButtonsComponent';
export * from '../components/displayComponents/ControlButtonsAltComponent';
export * from '../components/displayComponents/ControlButtonsComponentTouch';
export * from '../components/displayComponents/FlexibleGrid';
export * from '../components/displayComponents/FlexibleVideo';
export * from '../components/displayComponents/LoadingModal';
export * from '../components/displayComponents/MainAspectComponent';
export * from '../components/displayComponents/MainContainerComponent';
export * from '../components/displayComponents/MainGridComponent';
export * from '../components/displayComponents/MainScreenComponent';
export * from '../components/displayComponents/MeetingProgressTimer';
export * from '../components/displayComponents/MiniAudio';
export * from '../components/displayComponents/MiniCard';
export * from '../components/displayComponents/MiniCardAudio';
export * from '../components/displayComponents/OtherGridComponent';
export * from '../components/displayComponents/Pagination';
export * from '../components/displayComponents/SubAspectComponent';
export * from '../components/displayComponents/VideoCard';
export * from '../components/displaySettingsComponents/DisplaySettingsModal';
export * from '../components/eventSettingsComponents/EventSettingsModal';
export * from '../components/exitComponents/ConfirmExitModal';
export * from '../components/mediaSettingsComponents/MediaSettingsModal';
export * from '../components/menuComponents/MenuModal';
export * from '../components/messageComponents/MessagesModal';
export * from '../components/miscComponents/ConfirmHereModal';
export * from '../components/miscComponents/PreJoinPage';
export * from '../components/miscComponents/ShareEventModal';
export * from '../components/miscComponents/WelcomePage';
export * from '../components/participantsComponents/ParticipantsModal';
export * from '../components/pollsComponents/PollModal';
export * from '../components/recordingComponents/RecordingModal';
export * from '../components/requestsComponents/RequestsModal';
export * from '../components/screenboardComponents/Screenboard';
export * from '../components/screenboardComponents/ScreenboardModal';
export * from '../components/waitingComponents/WaitingModal';
export * from '../components/whiteboardComponents/ConfigureWhiteboardModal';
export * from '../components/whiteboardComponents/Whiteboard';
export * from '../components/menuComponents/CustomButtons';

export * from 'mediasfu-shared';
export type { RecordingImageData as ImageData } from 'mediasfu-shared';


// Custom Component Builder Types
import type {
  CustomAudioCardOptions as SharedCustomAudioCardOptions,
  CustomMiniCardOptions as SharedCustomMiniCardOptions,
  CustomPreJoinPageOptions as SharedCustomPreJoinPageOptions,
  CustomRenderer,
  CustomVideoCardOptions as SharedCustomVideoCardOptions,
} from 'mediasfu-shared';

export type CustomVideoCardOptions = SharedCustomVideoCardOptions;

export type CustomAudioCardOptions = SharedCustomAudioCardOptions & {
  imageStyle?: CSSProperties;
};

export type CustomMiniCardOptions = SharedCustomMiniCardOptions & {
  imageStyle?: CSSProperties;
};

export type CustomPreJoinPageOptions = SharedCustomPreJoinPageOptions;

// Custom Component Builder Function Types
export type CustomVideoCardType = CustomRenderer<ReactElement, CustomVideoCardOptions>;
export type CustomAudioCardType = CustomRenderer<ReactElement, CustomAudioCardOptions>;
export type CustomMiniCardType = CustomRenderer<ReactElement, CustomMiniCardOptions>;
export type CustomPreJoinPageType = CustomRenderer<ReactElement, CustomPreJoinPageOptions>;

// Custom Full UI Component Type
export type CustomComponentType = FC<{ parameters: any }>;


