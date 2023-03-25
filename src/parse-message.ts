import type {BufferReader, CompleteType} from 'd-bus-type-system';
import {
  arrayType,
  assertType,
  parseTypes,
  structType,
  uint32Type,
  uint8Type,
  unmarshal,
  variantType,
} from 'd-bus-type-system';
import {HeaderFieldCode, getHeaderField} from './get-header-field.js';

export type Message =
  | MethodCallMessage
  | MethodReturnMessage
  | ErrorMessage
  | SignalMessage;

export interface MethodCallMessage extends AbstractMessage {
  readonly messageType: MessageType.MethodCall;
  readonly objectPath: string;
  readonly interfaceName?: string;
  readonly memberName: string;
}

export interface MethodReturnMessage extends AbstractMessage {
  readonly messageType: MessageType.MethodReturn;
  readonly replySerial: number;
}

export interface ErrorMessage extends AbstractMessage {
  readonly messageType: MessageType.Error;
  readonly errorName: string;
  readonly replySerial: number;
}

export interface SignalMessage extends AbstractMessage {
  readonly messageType: MessageType.Signal;
  readonly objectPath: string;
  readonly interfaceName: string;
  readonly memberName: string;
}

export interface AbstractMessage {
  readonly serial: number;
  readonly noReplyExpected?: boolean;
  readonly noAutoStart?: boolean;
  readonly allowInteractiveAuthorization?: boolean;
  readonly destination?: string;
  readonly sender?: string;
  readonly types?: readonly [CompleteType, ...CompleteType[]];
  readonly unixFds?: number;
  readonly args?: readonly [unknown, ...unknown[]];
}

export enum MessageType {
  MethodCall = 1,
  MethodReturn = 2,
  Error = 3,
  Signal = 4,
}

export enum Flag {
  NoReplyExpected = 1,
  NoAutoStart = 2,
  AllowInteractiveAuthorization = 4,
}

export function parseMessage(messageReader: BufferReader): Message {
  const headerFieldsType = arrayType(structType(uint8Type, variantType));

  unmarshal(messageReader, uint8Type);

  const messageType = unmarshal(messageReader, uint8Type);
  const flags = unmarshal(messageReader, uint8Type);
  const version = unmarshal(messageReader, uint8Type);
  const bodyByteLength = unmarshal(messageReader, uint32Type);
  const serial = unmarshal(messageReader, uint32Type);
  const headerFields = unmarshal(messageReader, headerFieldsType);

  assertType(uint8Type, messageType);
  assertType(uint8Type, flags);
  assertType(uint8Type, version);
  assertType(uint32Type, bodyByteLength);
  assertType(uint32Type, serial);
  assertType(headerFieldsType, headerFields);

  if (version !== 1) {
    throw new Error(`Incompatible major protocol version.`);
  }

  const signature = getHeaderField(
    headerFields,
    HeaderFieldCode.Signature,
    false,
  );

  if (bodyByteLength > 0) {
    messageReader.align(8);
  }

  const {byteOffset} = messageReader;
  const types = signature ? parseTypes(signature) : undefined;
  const args = types?.map((type) => unmarshal(messageReader, type));

  if (bodyByteLength !== messageReader.byteOffset - byteOffset) {
    throw new Error(`Invalid length in bytes of the message body.`);
  }

  const message: AbstractMessage = {
    serial,
    noReplyExpected: Boolean(flags & Flag.NoReplyExpected),
    noAutoStart: Boolean(flags & Flag.NoAutoStart),
    allowInteractiveAuthorization: Boolean(
      flags & Flag.AllowInteractiveAuthorization,
    ),
    destination: getHeaderField(
      headerFields,
      HeaderFieldCode.Destination,
      false,
    ),
    sender: getHeaderField(headerFields, HeaderFieldCode.Sender, false),
    types,
    unixFds: getHeaderField(headerFields, HeaderFieldCode.UnixFds, false),
    args: args as any,
  };

  switch (messageType) {
    case MessageType.MethodCall: {
      return {
        ...message,
        messageType,
        objectPath: getHeaderField(
          headerFields,
          HeaderFieldCode.ObjectPath,
          true,
        ),
        interfaceName: getHeaderField(
          headerFields,
          HeaderFieldCode.InterfaceName,
          false,
        ),
        memberName: getHeaderField(
          headerFields,
          HeaderFieldCode.MemberName,
          true,
        ),
      };
    }
    case MessageType.MethodReturn: {
      return {
        ...message,
        messageType,
        replySerial: getHeaderField(
          headerFields,
          HeaderFieldCode.ReplySerial,
          true,
        ),
      };
    }
    case MessageType.Error: {
      return {
        ...message,
        messageType,
        errorName: getHeaderField(
          headerFields,
          HeaderFieldCode.ErrorName,
          true,
        ),
        replySerial: getHeaderField(
          headerFields,
          HeaderFieldCode.ReplySerial,
          true,
        ),
      };
    }
    case MessageType.Signal: {
      return {
        ...message,
        messageType,
        objectPath: getHeaderField(
          headerFields,
          HeaderFieldCode.ObjectPath,
          true,
        ),
        interfaceName: getHeaderField(
          headerFields,
          HeaderFieldCode.InterfaceName,
          true,
        ),
        memberName: getHeaderField(
          headerFields,
          HeaderFieldCode.MemberName,
          true,
        ),
      };
    }
  }

  throw new Error(`Invalid message type.`);
}
