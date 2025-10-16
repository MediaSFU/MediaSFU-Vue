/**
 * Vue-native addVideosGrid - adapted from React version
 * Adds participants to the main and alternate video grids
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

export interface UpdateMiniCardsGridParameters {
  getUpdatedAllParams: () => AddVideosGridParameters;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface AddVideosGridParameters extends UpdateMiniCardsGridParameters {
  eventType: EventType;
  updateAddAltGrid: (addAltGrid: boolean) => void;
  ref_participants: Participant[];
  islevel: string;
  videoAlreadyOn: boolean;
  localStreamVideo: MediaStream | null;
  keepBackground: boolean;
  virtualStream: MediaStream | null;
  forceFullDisplay: boolean;
  otherGridStreams: RenderableComponent[][];
  updateOtherGridStreams: (otherGridStreams: RenderableComponent[][]) => void;
  updateMiniCardsGrid: (options: {
    rows: number;
    cols: number;
    defal: boolean;
    actualRows: number;
    parameters: AddVideosGridParameters;
  }) => Promise<void>;

  // Custom component builders
  customVideoCard?: unknown;
  customAudioCard?: unknown;
  customMiniCard?: unknown;

  // Override-provided components
  videoCardComponent?: typeof VideoCard;
  audioCardComponent?: typeof AudioCard;
  miniCardComponent?: typeof MiniCard;

  getUpdatedAllParams: () => AddVideosGridParameters;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface AddVideosGridOptions {
  mainGridStreams: (Stream | Participant)[];
  altGridStreams: (Stream | Participant)[];
  numtoadd: number;
  numRows: number;
  numCols: number;
  actualRows: number;
  lastrowcols: number;
  removeAltGrid: boolean;
  parameters: AddVideosGridParameters;
}

export type AddVideosGridType = (options: AddVideosGridOptions) => Promise<void>;

/**
 * Adds participants to the main and alternate video grids based on the provided parameters.
 * @param {AddVideosGridOptions} options - The options for adding videos to the grid.
 * @returns {Promise<void>} A promise that resolves when the grid has been updated successfully.
 */
export async function addVideosGrid({
  mainGridStreams,
  altGridStreams,
  numtoadd,
  numRows,
  numCols,
  actualRows,
  lastrowcols,
  removeAltGrid,
  parameters,
}: AddVideosGridOptions): Promise<void> {
  const { getUpdatedAllParams } = parameters;
  parameters = getUpdatedAllParams();

  const {
    eventType,
    updateAddAltGrid,
    ref_participants,
    islevel,
    videoAlreadyOn,
    localStreamVideo,
    keepBackground,
    virtualStream,
    forceFullDisplay,
    otherGridStreams,
    updateOtherGridStreams,
    updateMiniCardsGrid,
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

  const newComponents: RenderableComponent[][] = [[], []];
  let remoteProducerId: string = '';

  numtoadd = mainGridStreams.length;

  if (removeAltGrid) {
    updateAddAltGrid(false);
  }

  // Add participants to the main grid
  for (let i = 0; i < numtoadd; i++) {
    const participant = mainGridStreams[i];
    if (!participant) continue;
    remoteProducerId = (participant as Participant).producerId || '';

    const pseudoName = !remoteProducerId || remoteProducerId === '';

    if (pseudoName) {
      remoteProducerId = (participant as Participant).name || '';

      if ((participant as Participant).audioID) {
        const audioCardComponent: RenderableComponent = customAudioCard
          ? {
              component: customAudioCard,
              props: {
                name: (participant as Participant).name || '',
                barColor: 'red',
                textColor: 'white',
                customStyle: {
                  backgroundColor: 'transparent',
                  border: eventType !== 'broadcast' ? '2px solid black' : '0px solid black',
                },
                controlsPosition: 'topLeft',
                infoPosition: 'topRight',
                roundedImage: true,
                parameters: parameters,
                backgroundColor: 'transparent',
                showControls: eventType !== 'chat',
                participant: participant,
              },
              key: `audio-${(participant as Participant).id}`,
            }
          : {
              component: AudioCardComponentOverride,
              props: {
                name: (participant as Participant).name || '',
                barColor: 'red',
                textColor: 'white',
                customStyle: {
                  backgroundColor: 'transparent',
                  border: eventType !== 'broadcast' ? '2px solid black' : '0px solid black',
                },
                controlsPosition: 'topLeft',
                infoPosition: 'topRight',
                roundedImage: true,
                parameters: parameters,
                backgroundColor: 'transparent',
                showControls: eventType !== 'chat',
                participant: participant,
              },
              key: `audio-${(participant as Participant).id}`,
            };

        newComponents[0]!.push(audioCardComponent);
      } else {
        const miniCardComponent: RenderableComponent = customMiniCard
          ? {
              component: customMiniCard,
              props: {
                initials: (participant as Participant).name,
                fontSize: 20,
                customStyle: {
                  backgroundColor: 'transparent',
                  border: eventType !== 'broadcast' ? '2px solid black' : '0px solid black',
                },
              },
              key: `mini-${(participant as Participant).id}`,
            }
          : {
              component: MiniCardComponentOverride,
              props: {
                initials: (participant as Participant).name,
                fontSize: 20,
                customStyle: {
                  backgroundColor: 'transparent',
                  border: eventType !== 'broadcast' ? '2px solid black' : '0px solid black',
                },
              },
              key: `mini-${(participant as Participant).id}`,
            };

        newComponents[0]!.push(miniCardComponent);
      }
    } else {
      if (remoteProducerId === 'youyou' || remoteProducerId === 'youyouyou') {
        let name = 'You';
        if (islevel === '2' && eventType !== 'chat') {
          name = 'You (Host)';
        }

        if (!videoAlreadyOn) {
          const miniCardComponent: RenderableComponent = customMiniCard
            ? {
                component: customMiniCard,
                props: {
                  initials: name,
                  fontSize: 20,
                  customStyle: {
                    backgroundColor: 'transparent',
                    border: eventType !== 'broadcast' ? '2px solid black' : '0px solid black',
                  },
                },
                key: 'mini-you',
              }
            : {
                component: MiniCardComponentOverride,
                props: {
                  initials: name,
                  fontSize: 20,
                  customStyle: {
                    backgroundColor: 'transparent',
                    border: eventType !== 'broadcast' ? '2px solid black' : '0px solid black',
                  },
                },
                key: 'mini-you',
              };

          newComponents[0]!.push(miniCardComponent);
        } else {
          const videoParticipant = {
            id: 'youyouyou',
            stream: keepBackground && virtualStream ? virtualStream : localStreamVideo,
            name: 'youyouyou',
          };

          const videoCardComponent: RenderableComponent = customVideoCard
            ? {
                component: customVideoCard,
                props: {
                  participant: videoParticipant,
                  stream: videoParticipant.stream || new MediaStream(),
                  width: 0,
                  height: 0,
                  showControls: false,
                  showInfo: false,
                  name: videoParticipant.name,
                  backgroundColor: 'transparent',
                  parameters: parameters,
                },
                key: 'video-you',
              }
            : {
                component: VideoCardComponentOverride,
                props: {
                  videoStream: videoParticipant.stream || new MediaStream(),
                  remoteProducerId: videoParticipant.stream?.id || '',
                  eventType: eventType,
                  forceFullDisplay: eventType === 'webinar' ? false : forceFullDisplay,
                  customStyle: {
                    border: eventType !== 'broadcast' ? '2px solid black' : '0px solid black',
                  },
                  participant: videoParticipant,
                  backgroundColor: 'transparent',
                  showControls: false,
                  showInfo: false,
                  name: videoParticipant.name,
                  doMirror: true,
                  parameters: parameters,
                },
                key: 'video-you',
              };

          newComponents[0]!.push(videoCardComponent);
        }
      } else {
        const participant_ = ref_participants.find(
          (obj: Participant) => obj.videoID === remoteProducerId
        );
        if (participant_) {
          const videoCardComponent: RenderableComponent = customVideoCard
            ? {
                component: customVideoCard,
                props: {
                  participant: participant_,
                  stream: (participant as Stream).stream || new MediaStream(),
                  width: 0,
                  height: 0,
                  showControls: eventType !== 'chat',
                  showInfo: true,
                  name: participant_.name || '',
                  backgroundColor: 'transparent',
                  parameters: parameters,
                },
                key: `video-${participant_.id}`,
              }
            : {
                component: VideoCardComponentOverride,
                props: {
                  videoStream: (participant as Stream).stream || new MediaStream(),
                  remoteProducerId: remoteProducerId || '',
                  eventType: eventType,
                  forceFullDisplay: forceFullDisplay,
                  customStyle: {
                    border: eventType !== 'broadcast' ? '2px solid black' : '0px solid black',
                  },
                  participant: participant_,
                  backgroundColor: 'transparent',
                  showControls: eventType !== 'chat',
                  showInfo: true,
                  name: participant_.name || '',
                  doMirror: false,
                  parameters: parameters,
                },
                key: `video-${participant_.id}`,
              };

          newComponents[0]!.push(videoCardComponent);
        }
      }
    }

    if (i === numtoadd - 1) {
      otherGridStreams[0] = newComponents[0]!;

      await updateMiniCardsGrid({
        rows: numRows,
        cols: numCols,
        defal: true,
        actualRows: actualRows,
        parameters,
      });

      updateOtherGridStreams(otherGridStreams);

      await updateMiniCardsGrid({
        rows: numRows,
        cols: numCols,
        defal: true,
        actualRows: actualRows,
        parameters,
      });
    }
  }

  // Handle the alternate grid streams
  if (!removeAltGrid) {
    for (let i = 0; i < altGridStreams.length; i++) {
      const participant = altGridStreams[i];
      if (!participant) continue;

      remoteProducerId = (participant as Participant).producerId || '';

      const pseudoName = !remoteProducerId || remoteProducerId === '';

      if (pseudoName) {
        if ((participant as Participant).audioID) {
          const audioCardComponent: RenderableComponent = customAudioCard
            ? {
                component: customAudioCard,
                props: {
                  name: (participant as Participant).name,
                  barColor: 'red',
                  textColor: 'white',
                  customStyle: {
                    backgroundColor: 'transparent',
                    border: eventType !== 'broadcast' ? '2px solid black' : '0px solid black',
                  },
                  controlsPosition: 'topLeft',
                  infoPosition: 'topRight',
                  roundedImage: true,
                  parameters: parameters,
                  backgroundColor: 'transparent',
                  showControls: eventType !== 'chat',
                  participant: participant,
                },
                key: `audio-alt-${(participant as Participant).id}`,
              }
            : {
                component: AudioCardComponentOverride,
                props: {
                  name: (participant as Participant).name,
                  barColor: 'red',
                  textColor: 'white',
                  customStyle: {
                    backgroundColor: 'transparent',
                    border: eventType !== 'broadcast' ? '2px solid black' : '0px solid black',
                  },
                  controlsPosition: 'topLeft',
                  infoPosition: 'topRight',
                  roundedImage: true,
                  parameters: parameters,
                  backgroundColor: 'transparent',
                  showControls: eventType !== 'chat',
                  participant: participant,
                },
                key: `audio-alt-${(participant as Participant).id}`,
              };

          newComponents[1]!.push(audioCardComponent);
        } else {
          const miniCardComponent: RenderableComponent = customMiniCard
            ? {
                component: customMiniCard,
                props: {
                  initials: (participant as Participant).name,
                  fontSize: 20,
                  customStyle: {
                    backgroundColor: 'transparent',
                    border: eventType !== 'broadcast' ? '2px solid black' : '0px solid black',
                  },
                },
                key: `mini-alt-${(participant as Participant).id}`,
              }
            : {
                component: MiniCardComponentOverride,
                props: {
                  initials: (participant as Participant).name,
                  fontSize: 20,
                  customStyle: {
                    backgroundColor: 'transparent',
                    border: eventType !== 'broadcast' ? '2px solid black' : '0px solid black',
                  },
                },
                key: `mini-alt-${(participant as Participant).id}`,
              };

          newComponents[1]!.push(miniCardComponent);
        }
      } else {
        const participant_ = ref_participants.find(
          (obj: Participant) => obj.videoID === remoteProducerId
        );
        if (participant_) {
          const videoCardComponent: RenderableComponent = customVideoCard
            ? {
                component: customVideoCard,
                props: {
                  participant: participant_,
                  stream: (participant as Stream).stream || new MediaStream(),
                  width: 0,
                  height: 0,
                  showControls: eventType !== 'chat',
                  showInfo: true,
                  name: (participant as Participant).name,
                  backgroundColor: 'transparent',
                  parameters: parameters,
                },
                key: `video-alt-${participant_.id}`,
              }
            : {
                component: VideoCardComponentOverride,
                props: {
                  videoStream: (participant as Stream).stream || new MediaStream(),
                  remoteProducerId: remoteProducerId || '',
                  eventType: eventType,
                  forceFullDisplay: forceFullDisplay,
                  customStyle: {
                    border: eventType !== 'broadcast' ? '2px solid black' : '0px solid black',
                  },
                  participant: participant_,
                  backgroundColor: 'transparent',
                  showControls: eventType !== 'chat',
                  showInfo: true,
                  name: (participant as Participant).name,
                  doMirror: false,
                  parameters: parameters,
                },
                key: `video-alt-${participant_.id}`,
              };

          newComponents[1]!.push(videoCardComponent);
        }
      }

      if (i === altGridStreams.length - 1) {
        otherGridStreams[1] = newComponents[1]!;

        await updateMiniCardsGrid({
          rows: 1,
          cols: lastrowcols,
          defal: false,
          actualRows: actualRows,
          parameters,
        });

        updateOtherGridStreams(otherGridStreams);

        await updateMiniCardsGrid({
          rows: numRows,
          cols: numCols,
          defal: true,
          actualRows: actualRows,
          parameters,
        });
      }
    }
  } else {
    updateAddAltGrid(false);
    otherGridStreams[1] = [];

    await updateMiniCardsGrid({
      rows: 0,
      cols: 0,
      defal: false,
      actualRows: actualRows,
      parameters,
    });

    updateOtherGridStreams(otherGridStreams);

    await updateMiniCardsGrid({
      rows: numRows,
      cols: numCols,
      defal: true,
      actualRows: actualRows,
      parameters,
    });
  }
}
