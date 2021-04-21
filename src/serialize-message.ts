import {
  BufferWriter,
  VariantValue,
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
import {HeaderFieldCode} from './get-header-field';
import {Flag, Message, MessageType} from './parse-message';

export function serializeMessage(message: Message): ArrayBuffer {
  const {
    messageType,
    serial,
    noReplyExpected,
    noAutoStart,
    allowInteractiveAuthorization,
    destination,
    sender,
    type,
    unixFds,
    body,
  } = message;

  const messageWriter = new BufferWriter({littleEndian: true});

  const flags =
    (noReplyExpected ? Flag.NoReplyExpected : 0) |
    (noAutoStart ? Flag.NoAutoStart : 0) |
    (allowInteractiveAuthorization ? Flag.AllowInteractiveAuthorization : 0);

  const bodyWriter = new BufferWriter({littleEndian: true});

  if (type) {
    marshal(bodyWriter, type, body);
  }

  const headerFields: [number, VariantValue][] = [];

  if (destination !== undefined) {
    headerFields.push([
      HeaderFieldCode.Destination,
      [serializeType(stringType), destination],
    ]);
  }

  if (sender !== undefined) {
    headerFields.push([
      HeaderFieldCode.Sender,
      [serializeType(stringType), sender],
    ]);
  }

  if (type !== undefined) {
    headerFields.push([
      HeaderFieldCode.Signature,
      [serializeType(signatureType), serializeType(type)],
    ]);
  }

  if (unixFds !== undefined) {
    headerFields.push([
      HeaderFieldCode.UnixFds,
      [serializeType(uint32Type), unixFds],
    ]);
  }

  switch (message.messageType) {
    case MessageType.MethodCall:
    case MessageType.Signal: {
      headerFields.push([
        HeaderFieldCode.ObjectPath,
        [serializeType(objectPathType), message.objectPath],
      ]);

      if (message.interfaceName !== undefined) {
        headerFields.push([
          HeaderFieldCode.InterfaceName,
          [serializeType(stringType), message.interfaceName],
        ]);
      }

      headerFields.push([
        HeaderFieldCode.MemberName,
        [serializeType(stringType), message.memberName],
      ]);

      break;
    }
    case MessageType.MethodReturn: {
      headerFields.push([
        HeaderFieldCode.ReplySerial,
        [serializeType(uint32Type), message.replySerial],
      ]);

      break;
    }
    case MessageType.Error: {
      headerFields.push([
        HeaderFieldCode.ErrorName,
        [serializeType(stringType), message.errorName],
      ]);

      headerFields.push([
        HeaderFieldCode.ReplySerial,
        [serializeType(uint32Type), message.replySerial],
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
      arrayType(structType(uint8Type, variantType))
    ),
    [
      'l'.charCodeAt(0),
      messageType,
      flags,
      1,
      bodyWriter.buffer.byteLength,
      serial,
      headerFields,
    ]
  );

  messageWriter.align(8);

  if (type) {
    messageWriter.writeBytes(bodyWriter.buffer);
  }

  return messageWriter.buffer;
}
