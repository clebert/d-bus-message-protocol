// @ts-check

const {MessageType, serializeMessage, parseMessages} = require('./lib/cjs');

const messageData = serializeMessage({
  messageType: MessageType.MethodCall,
  objectPath: '/org/freedesktop/DBus',
  interfaceName: 'org.freedesktop.DBus',
  memberName: 'Hello',
  serial: 1,
  destination: 'org.freedesktop.DBus',
});

parseMessages(messageData);
