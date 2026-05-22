import type { SendMessageOptions } from 'mediasfu-shared';

export const sendMessage = async ({
  message,
  receivers,
  group,
  messagesLength,
  member,
  sender,
  islevel,
  showAlert,
  coHostResponsibility,
  coHost,
  roomName,
  socket,
  chatSetting,
}: SendMessageOptions): Promise<void> => {
  let chatValue = false;
  const normalizedReceivers = (receivers ?? []).filter(
    (receiver): receiver is string => typeof receiver === 'string' && receiver.trim().length > 0,
  );

  if (
    (messagesLength > 100 && roomName.startsWith('d')) ||
    (messagesLength > 500 && roomName.startsWith('s')) ||
    (messagesLength > 100000 && roomName.startsWith('p'))
  ) {
    showAlert?.({
      message: 'You have reached the maximum number of messages allowed.',
      type: 'danger',
      duration: 3000,
    });
    return;
  }

  if (!message || message === '') {
    showAlert?.({
      message: 'Message is not valid.',
      type: 'danger',
      duration: 3000,
    });
    return;
  }

  if (normalizedReceivers.length < 1 && group === false && islevel === '2') {
    showAlert?.({
      message: 'Please select a message to reply to',
      type: 'danger',
      duration: 3000,
    });
    return;
  }

  const messageObject = {
    sender: sender ? sender : member,
    receivers: normalizedReceivers,
    message,
    timestamp: new Date().toLocaleTimeString(),
    group: group !== undefined && group !== null ? group : false,
  };

  try {
    chatValue = coHostResponsibility.find((item) => item.name === 'chat')?.value ?? false;
  } catch (error) {
    console.error(error);
  }

  if (!(islevel === '2' || (coHost === member && chatValue === true)) && !chatSetting) {
    showAlert?.({
      message: 'You are not allowed to send a message in this event room',
      type: 'danger',
      duration: 3000,
    });
    return;
  }

  socket.emit('sendMessage', {
    messageObject,
    roomName,
  });
};

export type { SendMessageOptions } from 'mediasfu-shared';