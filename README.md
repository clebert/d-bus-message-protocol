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
npm install d-bus-message-protocol
```

## Features

- Designed from the ground up with TypeScript.
- 100% test coverage.
- Depends solely on
  [`d-bus-type-system`](https://github.com/clebert/d-bus-type-system).
- Runs in any ES2020 environment. Uses `ArrayBuffer` and `bigint` under the
  hood.
- Accurate implementation of the
  [D-Bus specification](https://dbus.freedesktop.org/doc/dbus-specification.html#message-protocol).

## Usage example

### Serialize a hello message

```js
import {MessageType, serializeMessage} from 'd-bus-message-protocol';
import {stringType} from 'd-bus-type-system';

const messageData = serializeMessage({
  messageType: MessageType.MethodCall,
  path: '/com/example/DBus',
  member: 'Hello',
  serial: 42,
  type: stringType,
  body: 'hello',
});

console.log(messageData);
```

```
6c 01 00 01  0a 00 00 00  2a 00 00 00  36 00 00 00
08 01 67 00  01 73 00 00  01 01 6f 00  11 00 00 00
2f 63 6f 6d  2f 65 78 61  6d 70 6c 65  2f 44 42 75
73 00 00 00  00 00 00 00  03 01 73 00  05 00 00 00
48 65 6c 6c  6f 00 00 00  05 00 00 00  68 65 6c 6c
6f 00
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
    "path": "/com/example/DBus",
    "member": "Hello",
    "serial": 42,
    "noReplyExpected": false,
    "noAutoStart": false,
    "allowInteractiveAuthorization": false,
    "type": {"typeCode": "s", "bytePadding": 4},
    "body": "hello"
  }
]
```

---

Copyright (c) 2021, Clemens Akens. Released under the terms of the
[MIT License](https://github.com/clebert/d-bus-message-protocol/blob/master/LICENSE).
