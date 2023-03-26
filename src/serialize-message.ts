import type {Message} from './parse-message.js';
import type {VariantValue} from 'd-bus-type-system';

import {HeaderFieldCode} from './get-header-field.js';
import {Flag, MessageType} from './parse-message.js';
import {
  BufferWriter,
  arrayType,
  marshal,
  objectPathType,
  serializeType,
  signatureType,
  stringType,
  structType,
  uint32Type,
  uint8Type,
  variantType,
} from 'd-bus-type-system';

export function serializeMessage(message: Message): ArrayBuffer {
  const {
    messageType,
    serial,
    noReplyExpected,
    noAutoStart,
    allowInteractiveAuthorization,
    destination,
    sender,
    types,
    unixFds,
    args,
  } = message;

  const messageWriter = new BufferWriter({littleEndian: true});

  const flags =
    (noReplyExpected ? Flag.NoReplyExpected : 0) |
    (noAutoStart ? Flag.NoAutoStart : 0) |
    (allowInteractiveAuthorization ? Flag.AllowInteractiveAuthorization : 0);

  const bodyWriter = new BufferWriter({littleEndian: true});

  types?.forEach((type, index) => marshal(bodyWriter, type, args?.[index]));

  const headerFields: [number, VariantValue][] = [];

  if (destination !== undefined) {
    headerFields.push([HeaderFieldCode.Destination, [stringType, destination]]);
  }

  if (sender !== undefined) {
    headerFields.push([HeaderFieldCode.Sender, [stringType, sender]]);
  }

  if (types !== undefined) {
    headerFields.push([
      HeaderFieldCode.Signature,
      [signatureType, types.map(serializeType).join(``)],
    ]);
  }

  if (unixFds !== undefined) {
    headerFields.push([HeaderFieldCode.UnixFds, [uint32Type, unixFds]]);
  }

  switch (message.messageType) {
    case MessageType.MethodCall:
    case MessageType.Signal: {
      headerFields.push([
        HeaderFieldCode.ObjectPath,
        [objectPathType, message.objectPath],
      ]);

      if (message.interfaceName !== undefined) {
        headerFields.push([
          HeaderFieldCode.InterfaceName,
          [stringType, message.interfaceName],
        ]);
      }

      headerFields.push([
        HeaderFieldCode.MemberName,
        [stringType, message.memberName],
      ]);

      break;
    }
    case MessageType.MethodReturn: {
      headerFields.push([
        HeaderFieldCode.ReplySerial,
        [uint32Type, message.replySerial],
      ]);

      break;
    }
    case MessageType.Error: {
      headerFields.push([
        HeaderFieldCode.ErrorName,
        [stringType, message.errorName],
      ]);

      headerFields.push([
        HeaderFieldCode.ReplySerial,
        [uint32Type, message.replySerial],
      ]);

      break;
    }
  }

  marshal(
    messageWriter,
    structType(
      uint8Type,
      uint8Type,
      uint8Type,
      uint8Type,
      uint32Type,
      uint32Type,
      arrayType(structType(uint8Type, variantType)),
    ),
    [
      `l`.charCodeAt(0),
      messageType,
      flags,
      1,
      bodyWriter.buffer.byteLength,
      serial,
      headerFields,
    ],
  );

  messageWriter.align(8);
  messageWriter.writeBytes(bodyWriter.buffer);

  return messageWriter.buffer;
}
