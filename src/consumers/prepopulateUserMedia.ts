/**
 * Vue-native prepopulateUserMedia - adapted from React version
 * Populates the main grid with video/audio cards based on participant state
 */

import VideoCard from '../components/displayComponents/VideoCard.vue';
import AudioCard from '../components/displayComponents/AudioCard.vue';
import MiniCard from '../components/displayComponents/MiniCard.vue';
import type { RenderableComponent } from '../types/renderable-component';
import type { 
  Participant, 
  Stream, 
  EventType,
} from 'mediasfu-shared';

export interface PrepopulateUserMediaParameters {
  participants: Participant[];
  allVideoStreams: (Stream | Participant)[];
  islevel: string;
  member: string;
  shared: boolean;
  shareScreenStarted: boolean;
  eventType: EventType;
  screenId?: string;
  forceFullDisplay: boolean;
  updateMainWindow: boolean;
  mainScreenFilled: boolean;
  adminOnMainScreen: boolean;
  mainScreenPerson: string;
  videoAlreadyOn: boolean;
  audioAlreadyOn: boolean;
  oldAllStreams: (Stream | Participant)[];
  checkOrientation: () => string;
  screenForceFullDisplay: boolean;
  localStreamScreen: MediaStream | null;
  remoteScreenStream: Stream[];
  localStreamVideo: MediaStream | null;
  mainHeightWidth: number;
  isWideScreen: boolean;
  localUIMode: boolean;
  whiteboardStarted: boolean;
  whiteboardEnded: boolean;
  virtualStream: MediaStream | null;
  keepBackground: boolean;
  annotateScreenStream: boolean;
  updateMainScreenPerson: (person: string) => void;
  updateMainScreenFilled: (filled: boolean) => void;
  updateAdminOnMainScreen: (admin: boolean) => void;
  updateMainHeightWidth: (heightWidth: number) => void;
  updateScreenForceFullDisplay: (force: boolean) => void;
  updateUpdateMainWindow: (update: boolean) => void;
  updateMainGridStream: (components: RenderableComponent[]) => void;
  customVideoCard?: unknown;
  customAudioCard?: unknown;
  customMiniCard?: unknown;
  isDarkModeValue?: boolean;
  
  // Override-provided component references
  videoCardComponent?: typeof VideoCard;
  audioCardComponent?: typeof AudioCard;
  miniCardComponent?: typeof MiniCard;
  
  getUpdatedAllParams: () => PrepopulateUserMediaParameters;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface PrepopulateUserMediaOptions {
  name: string;
  parameters: PrepopulateUserMediaParameters;
}

export type PrepopulateUserMediaType = (options: PrepopulateUserMediaOptions) => Promise<RenderableComponent[] | void>;

/**
 * Prepopulates the user media for Vue - creates RenderableComponent array
 * @param {PrepopulateUserMediaOptions} options - Configuration options
 * @returns {Promise<RenderableComponent[] | void>} Array of Vue component descriptors
 */
export const prepopulateUserMedia = async ({
  name,
  parameters,
}: PrepopulateUserMediaOptions): Promise<RenderableComponent[] | void> => {
  try {
    parameters = parameters.getUpdatedAllParams();

    const {
      participants,
      allVideoStreams,
      islevel,
      member,
      shared,
      shareScreenStarted,
      eventType,
      screenId,
      forceFullDisplay,
      videoAlreadyOn,
      audioAlreadyOn,
      oldAllStreams,
      checkOrientation,
      localStreamScreen,
      remoteScreenStream,
      localStreamVideo,
      mainHeightWidth,
      isWideScreen,
      localUIMode,
      whiteboardStarted,
      whiteboardEnded,
      virtualStream,
      keepBackground,
      annotateScreenStream,
      updateMainScreenPerson,
      updateMainScreenFilled,
      updateAdminOnMainScreen,
      updateMainHeightWidth,
      updateScreenForceFullDisplay,
      updateUpdateMainWindow,
      updateMainGridStream,
      customVideoCard,
      customAudioCard,
      customMiniCard,
      videoCardComponent,
      audioCardComponent,
      miniCardComponent,
    } = parameters;

    const VideoCardComponentOverride = videoCardComponent ?? VideoCard;
    const AudioCardComponentOverride = audioCardComponent ?? AudioCard;
    const MiniCardComponentOverride = miniCardComponent ?? MiniCard;

    let {
      updateMainWindow,
      mainScreenFilled,
      adminOnMainScreen,
      mainScreenPerson,
      screenForceFullDisplay,
    } = parameters;

    const newComponents: RenderableComponent[] = [];
    const textColorThemed = 'var(--ms-modern-text-primary)';
    const themedBorder =
      eventType !== 'broadcast'
        ? '2px solid var(--ms-modern-panel-border)'
        : '0px solid transparent';
    const themeSuffix = parameters.isDarkModeValue === false ? '-light' : '-dark';
    const withThemeSuffix = (key: string) => `${key}${themeSuffix}`;

    if (eventType === 'chat') {
      return;
    }

    let host: Participant | null = null;
    let hostStream: MediaStream | Stream | null = null;

    if (shareScreenStarted || shared) {
      if (eventType === 'conference') {
        if ((shared || shareScreenStarted) && mainHeightWidth === 0) {
          updateMainHeightWidth(84);
        } else if (!shared && !shareScreenStarted && mainHeightWidth !== 0) {
          updateMainHeightWidth(0);
        }
      }

      screenForceFullDisplay = forceFullDisplay;
      updateScreenForceFullDisplay(screenForceFullDisplay);

      const orientation = checkOrientation();
      if ((orientation === 'portrait' || !isWideScreen) && (shareScreenStarted || shared)) {
        screenForceFullDisplay = false;
        updateScreenForceFullDisplay(screenForceFullDisplay);
      }

      if (shared) {
        host = { name: member, audioID: '', videoID: '' };
        hostStream = localStreamScreen;
        adminOnMainScreen = islevel === '2';
        updateAdminOnMainScreen(adminOnMainScreen);
        mainScreenPerson = host.name ?? '';
        updateMainScreenPerson(mainScreenPerson);
      } else {
        host =
          participants.find(
            (participant) => participant.ScreenID === screenId && participant.ScreenOn === true
          ) ?? null;

        if (whiteboardStarted && !whiteboardEnded) {
          host = { name: 'WhiteboardActive', islevel: '2', audioID: '', videoID: '' };
          hostStream = { producerId: 'WhiteboardActive' } as unknown as Stream;
        }

        if (!host) {
          host = participants.find((participant) => participant.ScreenOn === true) ?? null;
        }

        if (host && !host.name?.includes('WhiteboardActive')) {
          hostStream =
            remoteScreenStream.length === 0
              ? (allVideoStreams.find(
                  (stream) => (stream as Stream).producerId === host?.ScreenID
                ) as Stream | undefined) ?? null
              : remoteScreenStream[0] ?? null;
        }

        adminOnMainScreen = (host && host.islevel === '2') ?? false;
        updateAdminOnMainScreen(adminOnMainScreen);
        mainScreenPerson = host?.name ?? '';
        updateMainScreenPerson(mainScreenPerson);
      }

      if (host && hostStream) {
        const resolveScreenShareStream = (
          streamCandidate: MediaStream | Stream | null,
          producerId?: string,
        ): MediaStream | null => {
          if (!streamCandidate) {
            return null;
          }

          if (shared) {
            return localStreamScreen;
          }

          if (typeof (streamCandidate as MediaStream).getTracks === 'function') {
            return streamCandidate as MediaStream;
          }

          const streamRecord = streamCandidate as Stream;
          if (streamRecord.stream) {
            return streamRecord.stream;
          }

          const candidateProducerIds = [producerId, streamRecord.producerId].filter(
            (value): value is string => Boolean(value)
          );

          for (const candidateProducerId of candidateProducerIds) {
            const remoteMatch = remoteScreenStream.find(
              (stream) => stream.producerId === candidateProducerId
            )?.stream;
            if (remoteMatch) {
              return remoteMatch;
            }

            const allVideoMatch = (
              allVideoStreams.find(
                (stream) => (stream as Stream).producerId === candidateProducerId
              ) as Stream | undefined
            )?.stream;
            if (allVideoMatch) {
              return allVideoMatch;
            }
          }

          return remoteScreenStream.find((stream) => Boolean(stream.stream))?.stream ?? null;
        };

        const effectiveStream = resolveScreenShareStream(hostStream, host.ScreenID);
        if (!effectiveStream) {
          return newComponents;
        }

        if (customVideoCard) {
          newComponents.push({
            component: customVideoCard,
            props: {
              participant: host,
              stream: effectiveStream,
              width: mainHeightWidth,
              height: mainHeightWidth,
              showControls: false,
              showInfo: true,
              name: host.name || '',
              backgroundColor: 'transparent',
              parameters,
            },
            key: withThemeSuffix(host.ScreenID || `custom-video-${host.name ?? Date.now()}`),
          });
        } else {
          newComponents.push({
            component: VideoCardComponentOverride,
            props: {
              videoStream: effectiveStream,
              remoteProducerId: host.ScreenID ?? '',
              eventType,
              forceFullDisplay: annotateScreenStream && shared ? false : screenForceFullDisplay,
              customStyle: {
                border: themedBorder,
              },
              participant: host,
              backgroundColor: 'transparent',
              showControls: false,
              showInfo: true,
              name: host.name || '',
              parameters,
            },
            key: withThemeSuffix(host.ScreenID || `screen-${host.name ?? Date.now()}`),
          });
        }

        updateMainGridStream(newComponents);
        mainScreenFilled = true;
        updateMainScreenFilled(mainScreenFilled);
        adminOnMainScreen = host.islevel === '2';
        updateAdminOnMainScreen(adminOnMainScreen);
        mainScreenPerson = host.name ?? '';
        updateMainScreenPerson(mainScreenPerson);

        updateMainWindow = false;
        updateUpdateMainWindow(updateMainWindow);

        return newComponents;
      }
    } else {
      if (eventType === 'conference') {
        return;
      }

      host = participants.find((participant) => participant.islevel === '2') ?? null;
      mainScreenPerson = host?.name ?? '';
      updateMainScreenPerson(mainScreenPerson);
    }

    if (!host) {
      newComponents.push({
        component: customMiniCard ?? MiniCardComponentOverride,
        props: customMiniCard
          ? {
              initials: name,
              fontSize: 20,
              customStyle: {
                backgroundColor: 'transparent',
                border: themedBorder,
              },
            }
          : {
              initials: name,
              fontSize: 20,
              customStyle: {
                backgroundColor: 'transparent',
                border: themedBorder,
              },
            },
        key: `mini-${name}-${Date.now()}`,
      });

      updateMainGridStream(newComponents);
      mainScreenFilled = false;
      adminOnMainScreen = false;
      mainScreenPerson = '';
      updateMainScreenFilled(mainScreenFilled);
      updateAdminOnMainScreen(adminOnMainScreen);
      updateMainScreenPerson(mainScreenPerson);

      updateMainWindow = false;
      updateUpdateMainWindow(updateMainWindow);

      return newComponents;
    }

    const videoIsOff =
      (islevel !== '2' && !host.videoOn) ||
      (islevel === '2' && (!host.videoOn || !videoAlreadyOn)) ||
      localUIMode === true;

    if (videoIsOff) {
      if (islevel === '2' && videoAlreadyOn) {
        const stream = keepBackground && virtualStream ? virtualStream : localStreamVideo;
        if (stream) {
          if (customVideoCard) {
            newComponents.push({
              component: customVideoCard,
              props: {
                participant: host,
                stream,
                width: mainHeightWidth,
                height: mainHeightWidth,
                showControls: false,
                showInfo: true,
                name: host.name || '',
                backgroundColor: 'transparent',
                parameters,
              },
              key: withThemeSuffix(host.videoID || `custom-video-${host.name ?? Date.now()}`),
            });
          } else {
            newComponents.push({
              component: VideoCardComponentOverride,
              props: {
                videoStream: stream,
                remoteProducerId: host.videoID || '',
                eventType,
                forceFullDisplay,
                customStyle: {
                  border: themedBorder,
                },
                participant: host,
                backgroundColor: 'transparent',
                showControls: false,
                showInfo: true,
                name: host.name || '',
                doMirror: true,
                parameters,
              },
              key: withThemeSuffix(host.videoID || `video-${host.name ?? Date.now()}`),
            });
          }

          updateMainGridStream(newComponents);
          mainScreenFilled = true;
          updateMainScreenFilled(mainScreenFilled);
          adminOnMainScreen = true;
          updateAdminOnMainScreen(adminOnMainScreen);
          mainScreenPerson = host.name ?? '';
          updateMainScreenPerson(mainScreenPerson);
        }
      } else {
        let audOn = false;
        if (islevel === '2' && audioAlreadyOn) {
          audOn = true;
        } else if (islevel !== '2') {
          audOn = host.muted === false;
        }

        if (audOn) {
          if (customAudioCard) {
            newComponents.push({
              component: customAudioCard,
              props: {
                name: host.name || '',
                barColor: 'red',
                textColor: textColorThemed,
                customStyle: {
                  backgroundColor: 'transparent',
                  border: themedBorder,
                },
                controlsPosition: 'topLeft',
                infoPosition: 'topRight',
                roundedImage: true,
                parameters,
                backgroundColor: 'transparent',
                showControls: true,
                participant: host,
              },
              key: withThemeSuffix(`custom-audio-${host.name ?? Date.now()}`),
            });
          } else {
            newComponents.push({
              component: AudioCardComponentOverride,
              props: {
                name: host.name || '',
                barColor: 'red',
                textColor: textColorThemed,
                customStyle: {
                  backgroundColor: 'transparent',
                  border: themedBorder,
                },
                controlsPosition: 'topLeft',
                infoPosition: 'topRight',
                showWaveform: true,
                roundedImage: true,
                parameters,
                participant: host,
              },
              key: withThemeSuffix(`audio-${host.name ?? Date.now()}`),
            });
          }

          updateMainGridStream(newComponents);
          mainScreenFilled = false;
          updateMainScreenFilled(mainScreenFilled);
          adminOnMainScreen = host.islevel === '2';
          updateAdminOnMainScreen(adminOnMainScreen);
          mainScreenPerson = host.name ?? '';
          updateMainScreenPerson(mainScreenPerson);
        } else {
          newComponents.push({
            component: customMiniCard ?? MiniCardComponentOverride,
            props: customMiniCard
              ? {
                  initials: name,
                  fontSize: 20,
                  customStyle: {
                    backgroundColor: 'transparent',
                    border: themedBorder,
                  },
                }
              : {
                  initials: name,
                  fontSize: 20,
                  customStyle: {
                    backgroundColor: 'transparent',
                    border: themedBorder,
                  },
                },
            key: `mini-${name}-${Date.now()}`,
          });

          updateMainGridStream(newComponents);
          mainScreenFilled = false;
          updateMainScreenFilled(mainScreenFilled);
          adminOnMainScreen = false;
          updateAdminOnMainScreen(adminOnMainScreen);
          mainScreenPerson = '';
          updateMainScreenPerson(mainScreenPerson);
        }
      }
    } else {
      if (shareScreenStarted || shared) {
        // Already handled earlier; fall through to avoid duplicate rendering when no stream
      } else {
        let resolvedStream: MediaStream | null = null;
        if (islevel === '2') {
          resolvedStream = (keepBackground && virtualStream) ? virtualStream : localStreamVideo;
        } else {
          const match = oldAllStreams.find(
            (item) => (item as Stream).producerId === host?.videoID
          ) as Stream | undefined;
          resolvedStream = match?.stream ?? null;
        }

        if (resolvedStream) {
          if (customVideoCard) {
            newComponents.push({
              component: customVideoCard,
              props: {
                participant: host,
                stream: resolvedStream,
                width: mainHeightWidth,
                height: mainHeightWidth,
                showControls: false,
                showInfo: true,
                name: host.name || '',
                backgroundColor: 'transparent',
                parameters,
              },
              key: withThemeSuffix(host.videoID || `custom-video-${host.name ?? Date.now()}`),
            });
          } else {
            newComponents.push({
              component: VideoCardComponentOverride,
              props: {
                videoStream: resolvedStream,
                remoteProducerId: host.videoID || '',
                eventType,
                forceFullDisplay,
                customStyle: {
                  border: themedBorder,
                },
                participant: host,
                backgroundColor: 'transparent',
                showControls: false,
                showInfo: true,
                name: host.name || '',
                doMirror: member === host.name,
                parameters,
              },
              key: withThemeSuffix(host.videoID || `video-${host.name ?? Date.now()}`),
            });
          }

          updateMainGridStream(newComponents);
          mainScreenFilled = true;
          adminOnMainScreen = host.islevel === '2';
          mainScreenPerson = host.name ?? '';
        } else {
          newComponents.push({
            component: customMiniCard ?? MiniCardComponentOverride,
            props: customMiniCard
              ? {
                  initials: name,
                  fontSize: 20,
                  customStyle: {
                    backgroundColor: 'transparent',
                    border: themedBorder,
                  },
                }
              : {
                  initials: name,
                  fontSize: 20,
                  customStyle: {
                    backgroundColor: 'transparent',
                    border: themedBorder,
                  },
                },
            key: `mini-${name}-${Date.now()}`,
          });

          updateMainGridStream(newComponents);
          mainScreenFilled = false;
          adminOnMainScreen = islevel === '2';
          mainScreenPerson = host.name ?? '';
        }

        updateMainScreenFilled(mainScreenFilled);
        updateAdminOnMainScreen(adminOnMainScreen);
        updateMainScreenPerson(mainScreenPerson);
      }
    }

    updateMainWindow = false;
    updateUpdateMainWindow(updateMainWindow);

    return newComponents;
  } catch (error) {
    console.error('Error in prepopulateUserMedia:', error);
    return [];
  }
};
