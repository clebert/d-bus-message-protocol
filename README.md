# D-Bus message protocol

[![][ci-badge]][ci-link] [![][version-badge]][version-link]
[![][license-badge]][license-link] [![][types-badge]][types-link]

[ci-badge]:
  https://github.com/clebert/d-bus-message-protocol/workflows/CI/badge.svg
[ci-link]: https://github.com/clebert/d-bus-message-protocol
[version-badge]: https://badgen.net/npm/v/d-bus-message-protocol
[version-link]: https://www.npmjs.com/package/d-bus-message-protocol
[license-badge]: https://badgen.net/npm/license/d-bus-message-protocol
[license-link]:
  https://github.com/clebert/d-bus-message-protocol/blob/master/LICENSE
[types-badge]: https://badgen.net/npm/types/d-bus-message-protocol
[types-link]: https://github.com/clebert/d-bus-message-protocol

> A TypeScript implementation of the D-Bus message protocol.

## Installation

```
npm install d-bus-message-protocol d-bus-type-system
```

## Features

- Designed from the ground up with TypeScript.
- 100% test coverage.
- Depends solely on
  [d-bus-type-system](https://github.com/clebert/d-bus-type-system).
- Runs in any ES2020 environment. Uses `ArrayBuffer` and `bigint` under the
  hood.
- Accurate implementation of the
  [D-Bus specification](https://dbus.freedesktop.org/doc/dbus-specification.html#message-protocol).

## Usage example

### Serialize a hello message

```js
import {MessageType, serializeMessage} from 'd-bus-message-protocol';

const messageData = serializeMessage({
  messageType: MessageType.MethodCall,
  objectPath: '/org/freedesktop/DBus',
  interfaceName: 'org.freedesktop.DBus',
  memberName: 'Hello',
  serial: 1,
  destination: 'org.freedesktop.DBus',
});

console.log(messageData);
```

```
6c 01 00 01  00 00 00 00  01 00 00 00  6e 00 00 00
06 01 73 00  14 00 00 00  6f 72 67 2e  66 72 65 65
64 65 73 6b  74 6f 70 2e  44 42 75 73  00 00 00 00
01 01 6f 00  15 00 00 00  2f 6f 72 67  2f 66 72 65
65 64 65 73  6b 74 6f 70  2f 44 42 75  73 00 00 00
02 01 73 00  14 00 00 00  6f 72 67 2e  66 72 65 65
64 65 73 6b  74 6f 70 2e  44 42 75 73  00 00 00 00
03 01 73 00  05 00 00 00  48 65 6c 6c  6f 00 00 00
```

### Parse a hello message

```js
import {parseMessages} from 'd-bus-message-protocol';

const messages = parseMessages(messageData);

console.log(JSON.stringify(messages));
```

```json
[
  {
    "messageType": 1,
    "objectPath": "/org/freedesktop/DBus",
    "interfaceName": "org.freedesktop.DBus",
    "memberName": "Hello",
    "serial": 1,
    "noReplyExpected": false,
    "noAutoStart": false,
    "allowInteractiveAuthorization": false,
    "destination": "org.freedesktop.DBus"
  }
]
```

---

Copyright (c) 2021, Clemens Akens. Released under the terms of the
[MIT License](https://github.com/clebert/d-bus-message-protocol/blob/master/LICENSE).
