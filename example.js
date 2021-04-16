// @ts-check

const {stringType} = require('d-bus-type-system');
const {MessageType, serializeMessage, parseMessages} = require('./lib/cjs');

const messageData = serializeMessage({
  messageType: MessageType.MethodCall,
  path: '/com/example/DBus',
  member: 'Hello',
  serial: 42,
  type: stringType,
  body: 'hello',
});

console.log(messageData);

const messages = parseMessages(messageData);

console.log(JSON.stringify(messages));
