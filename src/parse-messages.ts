import type {Message} from './parse-message.js';

import {parseMessage} from './parse-message.js';
import {BufferReader} from 'd-bus-type-system';

export function parseMessages(messageData: ArrayBuffer): readonly Message[] {
  const messages: Message[] = [];

  let messageReader: BufferReader | undefined;

  while (true) {
    if (messageReader) {
      messageData = messageReader.buffer.slice(messageReader.byteOffset);
    }

    const endianness = String.fromCharCode(new Uint8Array(messageData)[0] ?? 0);

    if (endianness !== `l` && endianness !== `B`) {
      break;
    }

    messageReader = new BufferReader(messageData, {
      littleEndian: endianness === `l`,
    });

    messages.push(parseMessage(messageReader));
  }

  return messages;
}
