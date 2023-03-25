import {MessageType, parseMessages, serializeMessage} from './lib/index.js';

const messageData = serializeMessage({
  messageType: MessageType.MethodCall,
  objectPath: `/org/freedesktop/DBus`,
  interfaceName: `org.freedesktop.DBus`,
  memberName: `Hello`,
  serial: 1,
  destination: `org.freedesktop.DBus`,
});

console.log(parseMessages(messageData));
