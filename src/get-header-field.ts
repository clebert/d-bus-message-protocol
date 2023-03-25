import type {VariantValue} from 'd-bus-type-system';
import {
  assertType,
  objectPathType,
  signatureType,
  stringType,
  uint32Type,
} from 'd-bus-type-system';

export enum HeaderFieldCode {
  ObjectPath = 1,
  InterfaceName = 2,
  MemberName = 3,
  ErrorName = 4,
  ReplySerial = 5,
  Destination = 6,
  Sender = 7,
  Signature = 8,
  UnixFds = 9,
}

export function getHeaderField<
  THeaderFieldCode extends HeaderFieldCode,
  TRequired extends boolean,
>(
  headerFields: readonly [number, VariantValue][],
  headerFieldCode: THeaderFieldCode,
  required: TRequired,
): THeaderFieldCode extends
  | HeaderFieldCode.ObjectPath
  | HeaderFieldCode.InterfaceName
  | HeaderFieldCode.MemberName
  | HeaderFieldCode.ErrorName
  | HeaderFieldCode.Destination
  | HeaderFieldCode.Sender
  | HeaderFieldCode.Signature
  ? TRequired extends true
    ? string
    : string | undefined
  : THeaderFieldCode extends
      | HeaderFieldCode.ReplySerial
      | HeaderFieldCode.UnixFds
  ? TRequired extends true
    ? number
    : number | undefined
  : never;

export function getHeaderField(
  headerFields: readonly [number, VariantValue][],
  headerFieldCode: HeaderFieldCode,
  required: boolean,
): unknown {
  const headerField = headerFields.find(
    (otherHeaderField) => otherHeaderField[0] === headerFieldCode,
  );

  if (!headerField) {
    if (required) {
      throw new Error(
        `Required header field with code ${headerFieldCode} is missing.`,
      );
    }

    return undefined;
  }

  const value = headerField[1][1];

  switch (headerFieldCode) {
    case HeaderFieldCode.ObjectPath: {
      assertType(objectPathType, value);

      return value;
    }
    case HeaderFieldCode.InterfaceName:
    case HeaderFieldCode.MemberName:
    case HeaderFieldCode.ErrorName:
    case HeaderFieldCode.Destination:
    case HeaderFieldCode.Sender: {
      assertType(stringType, value);

      return value;
    }
    case HeaderFieldCode.Signature: {
      assertType(signatureType, value);

      return value;
    }
    case HeaderFieldCode.ReplySerial:
    case HeaderFieldCode.UnixFds: {
      assertType(uint32Type, value);

      return value;
    }
  }
}
