<!--
/**
 * @fileoverview RenderRequestComponent - Individual request item renderer
 * @component RenderRequestComponent
 * @module components/requestsComponents/RenderRequestComponent
 * 
 * @description
 * A simple row component that displays a single media permission request with
 * approve and reject buttons. Shows participant name, request type icon (audio/video/
 * screenshare), and action buttons. Used within RequestsModal to render each request
 * item in the list.
 * 
 * Features:
 * - Participant name display
 * - Request type icon (microphone, video, desktop, comments)
 * - Approve button (green checkmark)
 * - Reject button (red X)
 * - Flex layout with responsive sizing
 * - Icon mapping via keyMap
 * 
 * Request Icon Mapping:
 * - **fa-microphone**: Audio/microphone request
 * - **fa-video**: Video/camera request
 * - **fa-desktop**: Screenshare request
 * - **fa-comments**: Chat/message request
 * 
 * @example Basic Usage (Within RequestsModal)
 * // <RenderRequestComponent
 *   // :request="{ id: '123', name: 'John Doe', icon: 'fa-microphone' }"
 *   // :onRequestItemPress="respondToRequests"
 *   // :requestList="requestList"
 *   // :updateRequestList="updateRequestList"
 *   // roomName="my-room"
 *   // :socket="socket"
 * // />
 * 
 * @example Audio Request
 * // <RenderRequestComponent
 *   // :request="{ id: '1', name: 'Jane Smith', icon: 'fa-microphone' }"
 *   // :onRequestItemPress="handleRequest"
 *   // :requestList="allRequests"
 *   // :updateRequestList="setAllRequests"
 *   // roomName="conference-room"
 *   // :socket="socket"
 * // />
 * 
 * @example Video Request
 * // <RenderRequestComponent
 *   // :request="{ id: '2', name: 'Bob Johnson', icon: 'fa-video' }"
 *   // :onRequestItemPress="handleRequest"
 *   // :requestList="allRequests"
 *   // :updateRequestList="setAllRequests"
 *   // roomName="meeting-room"
 *   // :socket="socket"
 * // />
 * 
 * @remarks
 * This component is a pure renderer with no internal state. All logic is handled
 * via the onRequestItemPress callback which receives the request, action ('accepted'
 * or 'rejected'), and necessary context. The component automatically removes itself
 * from the list after action is taken.
 * 
 * Workflow:
 * 1. Component receives request data and callbacks
 * 2. Displays participant name and request type icon
 * 3. User clicks approve (green check) or reject (red X)
 * 4. Calls handleRequestAction with 'accepted' or 'rejected'
 * 5. onRequestItemPress handles Socket.io emission and list update
 * 6. Request is removed from list via updateRequestList
 * 
 * @see {@link RequestsModal} - Parent container that uses this component
 * @see {@link RespondToRequestsType} - Handler for approve/reject actions
 */
-->
<template>
  <div
    :key="request.id"
    :style="{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      margin: '10px 0',
      paddingBottom: '5px',
    }"
  >
    <div :style="{ flex: 5 }">
      <span>{{ request.name }}</span>
    </div>
    <div :style="{ flex: 2, alignItems: 'center' }">
      <font-awesome-icon
        :icon="keyMap[request.icon]"
        size="lg"
        color="black"
      />
    </div>
    <div :style="{ flex: 2, alignItems: 'center', paddingRight: '10px' }">
      <button
        :style="{ background: 'none', border: 'none', cursor: 'pointer' }"
        @click="handleRequestAction('accepted')"
      >
        <font-awesome-icon
          :icon="faCheck"
          size="lg"
          color="green"
        />
      </button>
    </div>
    <div :style="{ flex: 2, alignItems: 'center' }">
      <button
        :style="{ background: 'none', border: 'none', cursor: 'pointer' }"
        @click="handleRequestAction('rejected')"
      >
        <font-awesome-icon
          :icon="faTimes"
          size="lg"
          color="red"
        />
      </button>
    </div>
    <div :style="{ flex: 1, marginBottom: '2px' }"></div>
  </div>
</template>

<script setup lang="ts">
import { defineOptions } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faMicrophone,
  faDesktop,
  faVideo,
  faComments,
  faCheck,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

defineOptions({
  name: 'RenderRequestComponent'
});
import type { MediaSFUSocket } from '../../types/socket';
import type { Request } from '../../../../SharedTypes';
import type { RespondToRequestsType } from 'mediasfu-shared';

/**
 * Props for the RenderRequestComponent
 * @interface RenderRequestComponentProps
 * 
 * @property {Request} request - The request object with id, name, and icon
 * @property {RespondToRequestsType} onRequestItemPress - Handler for approve/reject actions
 * @property {Request[]} requestList - Full list of current requests
 * @property {function} updateRequestList - Callback to update the request list
 * @property {string} roomName - The name of the room/event
 * @property {MediaSFUSocket} socket - Socket.io instance for server communication
 * 
 * @example
 * ```typescript
 * // <RenderRequestComponent
 *   // :request="{ id: '123', name: 'John', icon: 'fa-microphone' }"
 *   // :onRequestItemPress="respondToRequests"
 *   // :requestList="allRequests"
 *   // :updateRequestList="setRequests"
 *   // roomName="my-room"
 *   // :socket="socket"
 * // />
 * ```
 */
export interface RenderRequestComponentProps {
  request: Request;
  onRequestItemPress: RespondToRequestsType;
  requestList: Request[];
  updateRequestList: (newRequestList: Request[]) => void;
  roomName: string;
  socket: MediaSFUSocket;
}

const props = defineProps<RenderRequestComponentProps>();

const keyMap: { [key: string]: any } = {
  'fa-microphone': faMicrophone,
  'fa-desktop': faDesktop,
  'fa-video': faVideo,
  'fa-comments': faComments,
};

const handleRequestAction = (action: string) => {
  props.onRequestItemPress({
    request: props.request,
    updateRequestList: props.updateRequestList,
    requestList: props.requestList,
    action,
    roomName: props.roomName,
    socket: props.socket,
  });
};

</script>
