// @ts-check

const {MessageType, serializeMessage, parseMessages} = require('./lib/cjs');

const messageData = serializeMessage({
  messageType: MessageType.MethodCall,
  path: '/org/freedesktop/DBus',
  interfaceName: 'org.freedesktop.DBus',
  memberName: 'Hello',
  serial: 1,
  destination: 'org.freedesktop.DBus',
});

console.log(messageData);

const messages = parseMessages(messageData);

console.log(JSON.stringify(messages));
