import MiniAudioPlayer from '../methods/utils/MiniAudioPlayer/MiniAudioPlayer.vue';
import MiniAudio from '../components/displayComponents/MiniAudio.vue';
import type { RenderableComponent } from '../types/renderable-component';
import type { PrepopulateUserMediaType, PrepopulateUserMediaParameters } from './prepopulateUserMedia';
import type { Participant, Stream, EventType } from 'mediasfu-shared';
import type { Consumer } from 'mediasoup-client';
import type { Socket } from 'socket.io-client';

type ReorderStreamsOptions = {
  add?: boolean;
  screenChanged?: boolean;
  parameters: ConsumerResumeParameters;
  [key: string]: unknown;
};

export interface ConsumerResumeParameters extends PrepopulateUserMediaParameters {
  nStream: MediaStream | null;
  allAudioStreams: (Stream | Participant)[];
  streamNames: Stream[];
  audStreamNames: Stream[];
  updateMainWindow: boolean;
  meetingDisplayType: string;
  mainScreenFilled: boolean;
  first_round: boolean;
  lock_screen: boolean;
  audioOnlyStreams: RenderableComponent[];
  gotAllVids: boolean;
  defer_receive: boolean;
  firstAll: boolean;
  remoteScreenStream: Stream[];
  hostLabel: string;
  whiteboardStarted: boolean;
  whiteboardEnded: boolean;
  participants: Participant[];
  eventType: EventType;
  member: string;
  shareScreenStarted: boolean;
  shared: boolean;
  screenId?: string;
  updateUpdateMainWindow: (value: boolean) => void;
  updateAllAudioStreams: (streams: (Stream | Participant)[]) => void;
  updateAllVideoStreams: (streams: (Stream | Participant)[]) => void;
  updateStreamNames: (streams: Stream[]) => void;
  updateAudStreamNames: (streams: Stream[]) => void;
  updateNStream: (stream: MediaStream | null) => void;
  updateMainHeightWidth: (value: number) => void;
  updateLock_screen: (value: boolean) => void;
  updateFirstAll: (value: boolean) => void;
  updateRemoteScreenStream: (streams: Stream[]) => void;
  updateOldAllStreams: (streams: (Stream | Participant)[]) => void;
  updateAudioOnlyStreams: (components: RenderableComponent[]) => void;
  updateShareScreenStarted: (value: boolean) => void;
  updateGotAllVids: (value: boolean) => void;
  updateScreenId: (value: string) => void;
  updateDefer_receive: (value: boolean) => void;
  reorderStreams: (options: ReorderStreamsOptions) => Promise<void>;
  prepopulateUserMedia: PrepopulateUserMediaType;
  
  // Component overrides
  miniAudioComponent?: typeof MiniAudio;
  miniAudioPlayerComponent?: typeof MiniAudioPlayer;
  
  getUpdatedAllParams: () => ConsumerResumeParameters;
}

interface ResumeParams {
  id: string;
  producerId: string;
  kind: string;
  rtpParameters: unknown;
}

export interface ConsumerResumeOptions {
  track: MediaStreamTrack;
  kind: string;
  remoteProducerId: string;
  params: ResumeParams;
  parameters: ConsumerResumeParameters;
  nsock: Socket;
  consumer: Consumer;
}

export type ConsumerResumeType = (
  options: ConsumerResumeOptions
) => Promise<void>;

export const consumerResume: ConsumerResumeType = async ({
  track,
  remoteProducerId,
  parameters,
  nsock,
  consumer,
}: ConsumerResumeOptions): Promise<void> => {
  try {
    parameters = parameters.getUpdatedAllParams();

    const {
      shared,
      participants = [],
      eventType,
      meetingDisplayType,
      mainScreenFilled,
      first_round,
      mainHeightWidth,
      member,
      hostLabel,
      whiteboardStarted,
      whiteboardEnded,
      reorderStreams,
      prepopulateUserMedia,
      miniAudioComponent,
      miniAudioPlayerComponent,
      updateUpdateMainWindow,
      updateAllAudioStreams,
      updateAllVideoStreams,
      updateStreamNames,
      updateAudStreamNames,
      updateNStream,
      updateMainHeightWidth,
      updateLock_screen,
      updateFirstAll,
      updateRemoteScreenStream,
      updateOldAllStreams,
      updateAudioOnlyStreams,
      updateShareScreenStarted,
      updateGotAllVids,
      updateScreenId,
      updateDefer_receive,
    } = parameters;

    const MiniAudioComponentToUse = miniAudioComponent ?? MiniAudio;
    const MiniAudioPlayerComponentToUse = miniAudioPlayerComponent ?? MiniAudioPlayer;

    let {
      nStream,
      allAudioStreams,
      allVideoStreams,
      streamNames,
      audStreamNames,
      updateMainWindow,
      shareScreenStarted,
      screenId,
      lock_screen,
      oldAllStreams,
      audioOnlyStreams,
      gotAllVids,
      defer_receive,
      firstAll,
      remoteScreenStream,
    } = parameters;

    if (!track) {
      return;
    }

    if (parameters.meetingDisplayType === undefined) {
      parameters.meetingDisplayType = meetingDisplayType;
    }

    if (parameters.allVideoStreams === undefined) {
      parameters.allVideoStreams = allVideoStreams;
    }

    if (parameters.participants === undefined) {
      parameters.participants = participants;
    }

    if (parameters.remoteScreenStream === undefined) {
      parameters.remoteScreenStream = remoteScreenStream;
    }

    if (parameters.audStreamNames === undefined) {
      parameters.audStreamNames = audStreamNames;
    }

    if (parameters.allAudioStreams === undefined) {
      parameters.allAudioStreams = allAudioStreams;
    }

    if (parameters.audioOnlyStreams === undefined) {
      parameters.audioOnlyStreams = audioOnlyStreams;
    }

    const participantByAudio = participants.filter(
      (participant) => participant.audioID === remoteProducerId
    );

    if (track.kind === 'audio') {
      const firstAudioParticipant = participantByAudio[0];
      const participantName = firstAudioParticipant?.name ?? '';

      if (participantName === member) {
        return;
      }

      const activeScreenParticipants = participants.filter(
        (participant) =>
          participant.ScreenID != null &&
          participant.ScreenOn === true &&
          participant.ScreenID !== ''
      );

      if (activeScreenParticipants.length > 0) {
        const firstScreenParticipant = activeScreenParticipants[0];
        screenId = firstScreenParticipant?.ScreenID ?? '';
        updateScreenId(screenId);
        if (!shared) {
          shareScreenStarted = true;
          updateShareScreenStarted(shareScreenStarted);
        }
      } else if (!(whiteboardStarted && !whiteboardEnded)) {
        screenId = '';
        updateScreenId(screenId);
        updateShareScreenStarted(false);
      }

      nStream = new MediaStream([track]);
      updateNStream(nStream);

      const miniAudioComponent: RenderableComponent = {
        component: MiniAudioPlayerComponentToUse,
        props: {
          stream: nStream,
          remoteProducerId,
          parameters,
          consumer,
          miniAudioComponent: MiniAudioComponentToUse,
          miniAudioProps: {
            customStyle: { backgroundColor: 'gray' },
            name: participantName,
            showWaveform: true,
            overlayPosition: 'topRight',
            barColor: 'white',
            textColor: 'white',
            imageSource: 'https://mediasfu.com/images/logo192.png',
            roundedImage: true,
            imageStyle: {},
          },
        },
        key: `audio-${remoteProducerId}`,
      };

      audioOnlyStreams = [...audioOnlyStreams, miniAudioComponent];
      updateAudioOnlyStreams(audioOnlyStreams);

      allAudioStreams = [
        ...allAudioStreams,
        { producerId: remoteProducerId, stream: nStream },
      ];
      updateAllAudioStreams(allAudioStreams);

      if (!participantName) {
        return;
      }

      audStreamNames = [
        ...audStreamNames,
        { producerId: remoteProducerId, name: participantName } as Stream,
      ];
      updateAudStreamNames(audStreamNames);

      if (!mainScreenFilled && firstAudioParticipant?.islevel === '2') {
        updateMainWindow = true;
        updateUpdateMainWindow(updateMainWindow);
        await prepopulateUserMedia({
          name: hostLabel,
          parameters: { ...parameters, audStreamNames, allAudioStreams },
        });
        updateMainWindow = false;
        updateUpdateMainWindow(updateMainWindow);
      }

      const hasVideo =
        meetingDisplayType === 'video'
          ? firstAudioParticipant?.videoID != null &&
            firstAudioParticipant?.videoID !== '' &&
            firstAudioParticipant?.videoID !== undefined
          : true;

      const altChecker = meetingDisplayType !== 'video';

      if (hasVideo) {
        if (shareScreenStarted || shared) {
          if (!altChecker) {
            await reorderStreams({
              parameters: { ...parameters, audStreamNames, allAudioStreams },
            });
          }
        } else if (altChecker) {
          await reorderStreams({
            add: false,
            screenChanged: true,
            parameters: { ...parameters, audStreamNames, allAudioStreams },
          });
        }
      }

      return;
    }

    nStream = new MediaStream([track]);
    updateNStream(nStream);

    const activeScreenParticipants = participants.filter(
      (participant) =>
        participant.ScreenID != null &&
        participant.ScreenOn === true &&
        participant.ScreenID !== ''
    );

    if (activeScreenParticipants.length > 0) {
      const firstScreenParticipant = activeScreenParticipants[0];
      screenId = firstScreenParticipant?.ScreenID ?? '';
      updateScreenId(screenId);
      if (!shared) {
        shareScreenStarted = true;
        updateShareScreenStarted(shareScreenStarted);
      }
    } else if (!(whiteboardStarted && !whiteboardEnded)) {
      screenId = '';
      updateScreenId(screenId ?? '');
      updateShareScreenStarted(false);
    }

    if (remoteProducerId === screenId) {
      updateMainWindow = true;
      updateUpdateMainWindow(updateMainWindow);
      remoteScreenStream = [{ producerId: remoteProducerId, stream: nStream } as Stream];
      updateRemoteScreenStream(remoteScreenStream);

      if (eventType === 'conference') {
        if (shared || shareScreenStarted) {
          if (mainHeightWidth === 0) {
            updateMainHeightWidth(84);
          }
        } else if (mainHeightWidth > 0) {
          updateMainHeightWidth(0);
        }
      }

      if (!lock_screen) {
        await prepopulateUserMedia({ name: hostLabel, parameters });
        await reorderStreams({
          add: false,
          screenChanged: true,
          parameters: { ...parameters, remoteScreenStream, allVideoStreams },
        });
      } else if (!first_round) {
        await prepopulateUserMedia({
          name: hostLabel,
          parameters: { ...parameters, remoteScreenStream, allVideoStreams },
        });
        await reorderStreams({
          add: false,
          screenChanged: true,
          parameters: { ...parameters, remoteScreenStream, allVideoStreams },
        });
      }

      lock_screen = true;
      updateLock_screen(lock_screen);
      firstAll = true;
      updateFirstAll(firstAll);
      return;
    }

    parameters = parameters.getUpdatedAllParams();

    const participantByVideo = participants.filter(
      (participant) => participant.videoID === remoteProducerId
    );
    const firstVideoParticipant = participantByVideo[0];

    if (
      firstVideoParticipant &&
      firstVideoParticipant.name &&
      firstVideoParticipant.name !== member
    ) {
      allVideoStreams = [
        ...allVideoStreams,
        { producerId: remoteProducerId, stream: nStream, socket_: nsock } as Stream,
      ];
      updateAllVideoStreams(allVideoStreams);
    }

    if (firstVideoParticipant) {
      const name = firstVideoParticipant.name ?? '';
      streamNames = [
        ...streamNames,
        { producerId: remoteProducerId, name } as Stream,
      ];
      updateStreamNames(streamNames);
    }

    if (!shareScreenStarted) {
      const hostParticipants = participants.filter(
        (participant) =>
          (participant.isAdmin === true || participant.isHost === true) &&
          participant.islevel === '2'
      );

      const firstHostParticipant = hostParticipants[0];

      if (firstHostParticipant) {
        const hostVideoId = firstHostParticipant.videoID;

        if (hostVideoId) {
          const previousHostStreams = oldAllStreams.length > 0 ? oldAllStreams : [];

          oldAllStreams = allVideoStreams.filter(
            (stream) => (stream as Stream).producerId === hostVideoId
          );
          updateOldAllStreams(oldAllStreams);

          if (oldAllStreams.length < 1) {
            oldAllStreams = previousHostStreams;
            updateOldAllStreams(oldAllStreams);
          }

          allVideoStreams = allVideoStreams.filter(
            (stream) => (stream as Stream).producerId !== hostVideoId
          );
          updateAllVideoStreams(allVideoStreams);

          if (remoteProducerId === hostVideoId) {
            updateMainWindow = true;
          }
        }

        gotAllVids = true;
        updateGotAllVids(gotAllVids);
      }
    } else {
      const screenParticipant = participants.filter(
        (participant) => participant.ScreenID === screenId
      );

      const screenParticipantVideoId = screenParticipant[0]?.videoID;

      if (screenParticipantVideoId) {
        await reorderStreams({
          parameters: { ...parameters, allVideoStreams },
        });
        return;
      }
    }

    if (lock_screen || shared) {
      defer_receive = true;
      updateDefer_receive(defer_receive);

      if (!first_round) {
        await reorderStreams({
          add: false,
          screenChanged: true,
          parameters: { ...parameters, allVideoStreams },
        });
      }
    } else {
      await reorderStreams({
        add: false,
        screenChanged: true,
        parameters: { ...parameters, allVideoStreams },
      });
    }
  } catch (error) {
    console.log('consumerResume error', error);
  }
};
