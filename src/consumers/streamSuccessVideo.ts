import type { Device, Producer, ProducerOptions, RtpCodecCapability } from 'mediasoup-client/lib/types';
import type { Socket } from 'socket.io-client';
import type {
  ConnectSendTransportVideoParameters,
  Participant,
  ShowAlert,
  CreateSendTransportParameters,
  ReorderStreamsParameters,
  SleepType,
  CreateSendTransportType,
  ConnectSendTransportVideoType,
  ReorderStreamsType,
  HParamsType,
  VParamsType,
} from 'mediasfu-shared';

export interface StreamSuccessVideoParameters
  extends CreateSendTransportParameters,
    ConnectSendTransportVideoParameters,
    ReorderStreamsParameters {
  socket: Socket;
  participants: Participant[];
  localStream: MediaStream | null;
  transportCreated: boolean;
  transportCreatedVideo: boolean;
  videoAlreadyOn: boolean;
  videoAction: boolean;
  videoParams: ProducerOptions;
  localStreamVideo: MediaStream | null;
  defVideoID: string;
  userDefaultVideoInputDevice: string;
  params: ProducerOptions;
  videoParamse?: ProducerOptions;
  islevel: string;
  member: string;
  updateMainWindow: boolean;
  lock_screen: boolean;
  shared: boolean;
  shareScreenStarted: boolean;
  vParams: VParamsType;
  hParams: HParamsType;
  allowed: boolean;
  currentFacingMode: string;
  device: Device | null;
  keepBackground: boolean;
  appliedBackground: boolean;
  videoProducer: Producer | null;
  removeSingleVideoEncoding?: boolean;

  updateTransportCreatedVideo: (created: boolean) => void;
  updateVideoAlreadyOn: (videoOn: boolean) => void;
  updateVideoAction: (videoAction: boolean) => void;
  updateLocalStream: (stream: MediaStream | null) => void;
  updateLocalStreamVideo: (stream: MediaStream | null) => void;
  updateUserDefaultVideoInputDevice: (device: string) => void;
  updateCurrentFacingMode: (mode: string) => void;
  updateDefVideoID: (id: string) => void;
  updateAllowed: (allowed: boolean) => void;
  updateUpdateMainWindow: (updateMainWindow: boolean) => void;
  updateParticipants: (participants: Participant[]) => void;
  updateVideoParams: (params: ProducerOptions) => void;
  updateIsBackgroundModalVisible: (isVisible: boolean) => void;
  updateAutoClickBackground: (autoClick: boolean) => void;

  showAlert?: ShowAlert;

  createSendTransport: CreateSendTransportType;
  connectSendTransportVideo: ConnectSendTransportVideoType;
  reorderStreams: ReorderStreamsType;
  sleep: SleepType;

  getUpdatedAllParams: () => StreamSuccessVideoParameters;
  [key: string]: any;
}

export interface StreamSuccessVideoOptions {
  stream: MediaStream;
  parameters: StreamSuccessVideoParameters;
}

export type StreamSuccessVideoType = (
  options: StreamSuccessVideoOptions,
) => Promise<void>;

export const streamSuccessVideo: StreamSuccessVideoType = async ({
  stream,
  parameters,
}: StreamSuccessVideoOptions): Promise<void> => {
  const { getUpdatedAllParams } = parameters;
  parameters = getUpdatedAllParams();

  try {
    let {
      socket,
      participants,
      localStream,
      transportCreated,
      transportCreatedVideo,
      videoAlreadyOn,
      videoAction,
      videoParams,
      localStreamVideo,
      defVideoID,
      userDefaultVideoInputDevice,
      params,
      videoParamse,
      islevel,
      member,
      updateMainWindow,
      lock_screen,
      shared,
      shareScreenStarted,
      vParams,
      hParams,
      allowed,
      currentFacingMode,
      device,
      keepBackground,
      appliedBackground,
      videoProducer,
      updateTransportCreatedVideo,
      updateVideoAlreadyOn,
      updateVideoAction,
      updateLocalStream,
      updateLocalStreamVideo,
      updateUserDefaultVideoInputDevice,
      updateCurrentFacingMode,
      updateDefVideoID,
      updateAllowed,
      updateUpdateMainWindow,
      updateParticipants,
      updateVideoParams,
      updateIsBackgroundModalVisible,
      updateAutoClickBackground,
      createSendTransport,
      connectSendTransportVideo,
      showAlert,
      reorderStreams,
      sleep,
    } = parameters;

    localStreamVideo = stream;
    updateLocalStreamVideo(localStreamVideo);

    if (localStream == null) {
      localStream = new MediaStream([localStreamVideo.getVideoTracks()[0]]);
      updateLocalStream(localStream);
    } else {
      localStream.getVideoTracks().forEach((track) => {
        localStream?.removeTrack(track);
      });
      localStream.addTrack(localStreamVideo.getVideoTracks()[0]);
      updateLocalStream(localStream);
    }

    const videoTracked = localStream.getVideoTracks()[0];
    defVideoID = videoTracked.getSettings().deviceId || '';
    userDefaultVideoInputDevice = defVideoID;
    currentFacingMode = videoTracked.getSettings().facingMode || 'user';

    if (defVideoID) {
      updateDefVideoID(defVideoID);
    }
    if (userDefaultVideoInputDevice) {
      updateUserDefaultVideoInputDevice(userDefaultVideoInputDevice);
    }
    if (currentFacingMode) {
      updateCurrentFacingMode(currentFacingMode);
    }

    allowed = true;
    updateAllowed(allowed);

    try {
      if (islevel === '2') {
        params = shared || shareScreenStarted ? vParams : hParams;
        videoParamse = { ...params };
      } else {
        params = vParams;
        videoParamse = { ...params };
      }

      const codec =
        device?.rtpCapabilities?.codecs?.filter(
          (codec: RtpCodecCapability) =>
            codec.mimeType.toLowerCase() !== 'video/vp9' && codec.kind === 'video',
        ) || [];

      if (
        parameters.removeSingleVideoEncoding &&
        videoParamse.encodings &&
        videoParamse.encodings.length <= 1
      ) {
        delete videoParamse.encodings;
      }

      videoParams = {
        track: localStream.getVideoTracks()[0],
        ...videoParamse,
        codec: codec[0],
      };
      updateVideoParams(videoParams);

      if (keepBackground && appliedBackground) {
        videoAlreadyOn = true;
        updateVideoAlreadyOn(videoAlreadyOn);

        updateAutoClickBackground(true);
        updateIsBackgroundModalVisible(true);
        await sleep({ ms: 500 });
      } else if (!transportCreated) {
        try {
          await createSendTransport({
            parameters: { ...parameters, videoParams },
            option: 'video',
          });
        } catch {
          // Handle error silently
        }
      } else {
        try {
          videoProducer?.close();
          await sleep({ ms: 500 });
        } catch {
          // Handle error silently
        }
        await connectSendTransportVideo({
          parameters,
          videoParams,
        });
      }
    } catch (error) {
      showAlert?.({
        message: (error as Error).message,
        type: 'danger',
        duration: 3000,
      });
    }

    videoAlreadyOn = true;
    updateVideoAlreadyOn(videoAlreadyOn);

    if (videoAction === true) {
      videoAction = false;
      updateVideoAction(videoAction);
    }

    if (islevel === '2') {
      updateMainWindow = true;
      updateUpdateMainWindow(updateMainWindow);
    }

    participants.forEach((participant) => {
      if (participant.socketId == socket.id && participant.name == member) {
        participant.videoOn = true;
      }
    });
    updateParticipants(participants);

    transportCreatedVideo = true;
    updateTransportCreatedVideo(transportCreatedVideo);

    if (lock_screen) {
      await reorderStreams({
        add: true,
        screenChanged: true,
        parameters: { ...parameters, videoAlreadyOn },
      });
    } else {
      try {
        await reorderStreams({
          add: false,
          screenChanged: true,
          parameters: { ...parameters, videoAlreadyOn },
        });
      } catch {
        // Handle error silently
      }
    }
  } catch (error) {
    console.log('Error in streamSuccessVideo:', error);
    parameters.showAlert?.({
      message: (error as Error).message,
      type: 'danger',
      duration: 3000,
    });
  }
};