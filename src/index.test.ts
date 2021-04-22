import {stringType} from 'd-bus-type-system';
import {TextDecoder, TextEncoder} from 'util';
import {Message, MessageType, parseMessages, serializeMessage} from '.';

global.TextDecoder = TextDecoder as any;
global.TextEncoder = TextEncoder;

function toBuffer(...bytes: string[]): ArrayBuffer {
  const array: number[] = [];

  for (const byte of bytes.join(' ').split(' ')) {
    if (byte.trim()) {
      array.push(parseInt(byte, 16));
    }
  }

  return new Uint8Array(array).buffer;
}

test('parse messages of all types', () => {
  expect(parseMessages(toBuffer())).toEqual([]);

  expect(
    parseMessages(
      toBuffer(
        '6c 01 00 01  00 00 00 00  01 00 00 00  6d 00 00 00',
        '01 01 6f 00  15 00 00 00  2f 6f 72 67  2f 66 72 65',
        '65 64 65 73  6b 74 6f 70  2f 44 42 75  73 00 00 00',
        '02 01 73 00  14 00 00 00  6f 72 67 2e  66 72 65 65',
        '64 65 73 6b  74 6f 70 2e  44 42 75 73  00 00 00 00',
        '03 01 73 00  05 00 00 00  48 65 6c 6c  6f 00 00 00',
        '06 01 73 00  14 00 00 00  6f 72 67 2e  66 72 65 65',
        '64 65 73 6b  74 6f 70 2e  44 42 75 73  00 00 00 00'
      )
    )
  ).toEqual([
    {
      messageType: MessageType.MethodCall,
      objectPath: '/org/freedesktop/DBus',
      interfaceName: 'org.freedesktop.DBus',
      memberName: 'Hello',
      serial: 1,
      noReplyExpected: false,
      noAutoStart: false,
      allowInteractiveAuthorization: false,
      destination: 'org.freedesktop.DBus',
    },
  ]);

  expect(
    parseMessages(
      toBuffer(
        '6c 02 01 01  0b 00 00 00  01 00 00 00  3d 00 00 00',
        '06 01 73 00  06 00 00 00  3a 31 2e 32  35 39 00 00',
        '05 01 75 00  01 00 00 00  08 01 67 00  01 73 00 00',
        '07 01 73 00  14 00 00 00  6f 72 67 2e  66 72 65 65',
        '64 65 73 6b  74 6f 70 2e  44 42 75 73  00 00 00 00',
        '06 00 00 00  3a 31 2e 32  35 39 00 6c  04 01 01 0b',
        '00 00 00 02  00 00 00 8d  00 00 00 01  01 6f 00 15',
        '00 00 00 2f  6f 72 67 2f  66 72 65 65  64 65 73 6b',
        '74 6f 70 2f  44 42 75 73  00 00 00 02  01 73 00 14',
        '00 00 00 6f  72 67 2e 66  72 65 65 64  65 73 6b 74',
        '6f 70 2e 44  42 75 73 00  00 00 00 03  01 73 00 0c',
        '00 00 00 4e  61 6d 65 41  63 71 75 69  72 65 64 00',
        '00 00 00 06  01 73 00 06  00 00 00 3a  31 2e 32 35',
        '39 00 00 08  01 67 00 01  73 00 00 07  01 73 00 14',
        '00 00 00 6f  72 67 2e 66  72 65 65 64  65 73 6b 74',
        '6f 70 2e 44  42 75 73 00  00 00 00 06  00 00 00 3a',
        '31 2e 32 35  39 00'
      )
    )
  ).toEqual([
    {
      messageType: MessageType.MethodReturn,
      replySerial: 1,
      serial: 1,
      noReplyExpected: true,
      noAutoStart: false,
      allowInteractiveAuthorization: false,
      destination: ':1.259',
      sender: 'org.freedesktop.DBus',
      types: [stringType],
      body: [':1.259'],
    },
    {
      messageType: MessageType.Signal,
      objectPath: '/org/freedesktop/DBus',
      interfaceName: 'org.freedesktop.DBus',
      memberName: 'NameAcquired',
      serial: 2,
      noReplyExpected: true,
      noAutoStart: false,
      allowInteractiveAuthorization: false,
      destination: ':1.259',
      sender: 'org.freedesktop.DBus',
      types: [stringType],
      body: [':1.259'],
    },
  ]);

  expect(
    parseMessages(
      toBuffer(
        '6c 03 01 01  4d 00 00 00  01 00 00 00  75 00 00 00',
        '06 01 73 00  0f 00 00 00  3a 6e 6f 74  2e 61 63 74',
        '69 76 65 2e  79 65 74 00  04 01 73 00  27 00 00 00',
        '6f 72 67 2e  66 72 65 65  64 65 73 6b  74 6f 70 2e',
        '44 42 75 73  2e 45 72 72  6f 72 2e 41  63 63 65 73',
        '73 44 65 6e  69 65 64 00  05 01 75 00  01 00 00 00',
        '08 01 67 00  01 73 00 00  07 01 73 00  14 00 00 00',
        '6f 72 67 2e  66 72 65 65  64 65 73 6b  74 6f 70 2e',
        '44 42 75 73  00 00 00 00  48 00 00 00  43 6c 69 65',
        '6e 74 20 74  72 69 65 64  20 74 6f 20  73 65 6e 64',
        '20 61 20 6d  65 73 73 61  67 65 20 6f  74 68 65 72',
        '20 74 68 61  6e 20 48 65  6c 6c 6f 20  77 69 74 68',
        '6f 75 74 20  62 65 69 6e  67 20 72 65  67 69 73 74',
        '65 72 65 64  00'
      )
    )
  ).toEqual([
    {
      messageType: MessageType.Error,
      errorName: 'org.freedesktop.DBus.Error.AccessDenied',
      replySerial: 1,
      serial: 1,
      noReplyExpected: true,
      noAutoStart: false,
      allowInteractiveAuthorization: false,
      destination: ':not.active.yet',
      sender: 'org.freedesktop.DBus',
      types: [stringType],
      body: ['Client tried to send a message other than Hello without being registered'],
    },
  ]);
});

test('serialize messages of all types and parse them again', () => {
  const messages: readonly Message[] = [
    {messageType: MessageType.MethodCall, objectPath: '/', memberName: 'foo', serial: 42},
    {messageType: MessageType.MethodCall, objectPath: '/', memberName: 'foo', serial: 42, noReplyExpected: true},
    {messageType: MessageType.MethodCall, objectPath: '/', memberName: 'foo', serial: 42, noAutoStart: true},
    {messageType: MessageType.MethodCall, objectPath: '/', memberName: 'foo', serial: 42, allowInteractiveAuthorization: true},
    {
      messageType: MessageType.MethodCall,
      objectPath: '/',
      interfaceName: 'foo',
      memberName: 'bar',
      serial: 42,
      noReplyExpected: true,
      noAutoStart: true,
      allowInteractiveAuthorization: true,
      destination: 'baz',
      sender: 'qux',
      types: [stringType, stringType],
      unixFds: 123,
      body: ['hello', 'world'],
    },
    {messageType: MessageType.MethodReturn, replySerial: 42, serial: 85},
    {
      messageType: MessageType.MethodReturn,
      replySerial: 42,
      serial: 85,
      noReplyExpected: true,
      noAutoStart: true,
      allowInteractiveAuthorization: true,
      destination: 'foo',
      sender: 'bar',
      types: [stringType, stringType],
      unixFds: 123,
      body: ['hello', 'world'],
    },
    {messageType: MessageType.Error, errorName: 'foo', replySerial: 42, serial: 85},
    {
      messageType: MessageType.Error,
      errorName: 'foo',
      replySerial: 42,
      serial: 85,
      noReplyExpected: true,
      noAutoStart: true,
      allowInteractiveAuthorization: true,
      destination: 'foo',
      sender: 'bar',
      types: [stringType, stringType],
      unixFds: 123,
      body: ['hello', 'world'],
    },
    {messageType: MessageType.Signal, objectPath: '/', interfaceName: 'foo', memberName: 'bar', serial: 42},
    {
      messageType: MessageType.Signal,
      objectPath: '/',
      interfaceName: 'foo',
      memberName: 'bar',
      serial: 42,
      noReplyExpected: true,
      noAutoStart: true,
      allowInteractiveAuthorization: true,
      destination: 'baz',
      sender: 'qux',
      types: [stringType, stringType],
      unixFds: 123,
      body: ['hello', 'world'],
    },
  ];

  for (const message of messages) {
    expect(parseMessages(serializeMessage(message))).toEqual([
      {
        noReplyExpected: false,
        noAutoStart: false,
        allowInteractiveAuthorization: false,
        ...message,
      },
    ]);
  }
});

test('various message parsing errors', () => {
  expect(() =>
    parseMessages(
      toBuffer(
        '6c 01 00 02  00 00 00 00  2a 00 00 00  1c 00 00 00',
        '01 01 6f 00  01 00 00 00  2f 00 00 00  00 00 00 00',
        '03 01 73 00  03 00 00 00  66 6f 6f 00  00 00 00 00'
      )
    )
  ).toThrow(new Error('Incompatible major protocol version.'));

  expect(() =>
    parseMessages(
      toBuffer(
        '6c 01 00 01  09 00 00 00  2a 00 00 00  24 00 00 00',
        '08 01 67 00  01 73 00 00  01 01 6f 00  01 00 00 00',
        '2f 00 00 00  00 00 00 00  03 01 73 00  03 00 00 00',
        '66 6f 6f 00  00 00 00 00  05 00 00 00  68 65 6c 6c',
        '6f 00'
      )
    )
  ).toThrow(new Error('Invalid length in bytes of the message body.'));

  expect(() =>
    parseMessages(
      toBuffer(
        '6c 00 00 01  00 00 00 00  2a 00 00 00  1c 00 00 00',
        '01 01 6f 00  01 00 00 00  2f 00 00 00  00 00 00 00',
        '03 01 73 00  03 00 00 00  66 6f 6f 00  00 00 00 00'
      )
    )
  ).toThrow(new Error('Invalid message type.'));

  expect(() =>
    parseMessages(toBuffer('6c 01 00 01  00 00 00 00  2a 00 00 00  0c 00 00 00', '03 01 73 00  03 00 00 00  66 6f 6f 00  00 00 00 00'))
  ).toThrow(new Error('Required header field with code 1 is missing.'));
});
