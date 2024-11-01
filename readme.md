# Plex Utilities

This library provides utilities for working with Plex-based connections and streams, enabling functionalities like encoding configuration, multiplexing, event handling, and data transmission.

## Installation

```bash
    npm i rxprotoplex
```

## Overview of Functions

### `asPlex`

Wraps a given stream in a `Protoplex` instance if it is not already multiplexed.

```javascript
const plexStream = asPlex(stream, { someConfig: true });
console.log(plexStream); // Outputs either the original multiplexed stream or a new Protoplex instance
```

### `connect$`

Creates an Observable that connects to a specified Plex instance with a given ID and configuration.

```javascript
connect$(plexInstance, "channelId").subscribe({
  next: connection => console.log("Connected to Plex:", connection),
  error: err => console.error("Connection error:", err)
});
```

### `connectAndRead$`

Connects to a specified Plex instance and begins reading from its stream.

```javascript
connectAndRead$(plexInstance, "channelId").subscribe(data => {
  console.log("Data from Plex:", data);
});
```

### `connectAndSend`

Establishes a one-time connection to a specified Plex channel, sends data, and closes the connection.

```javascript
const sendData = connectAndSend(plexInstance, "channelId", { encoding: "utf-8" });
sendData("Hello, World!");
```

### `consumePlexStream`

An operator that consumes a Plex stream, transforming each data event into an object with metadata.

```javascript
source$.pipe(consumePlexStream).subscribe(event => {
  console.log("Received data:", event.data);
  console.log("Stream ID:", event.id);
  console.log("Protocol:", event.protocol);
});
```

### `createPlexPair`

Creates a pair of Plex instances using the provided configuration.

```javascript
const plexPair = createPlexPair({ bits: 256, keyPair: myKeyPair });
console.log("Plex Pair:", plexPair); // Array of two connected Plex instances
```

### `listenAndConnection$`

Listens for incoming connections on a specified channel and returns an Observable for connection events.

```javascript
listenAndConnection$(plexInstance, "channelId", { protocol: "myProtocol" }).subscribe(connection => {
  console.log("New connection:", connection);
});
```

### `listenAndConnectionAndRead$`

Listens for incoming connections on a specified channel and consumes the connection stream.

```javascript
listenAndConnectionAndRead$(plexInstance, "channelId", { protocol: "myProtocol" }).subscribe(event => {
  console.log("Received data:", event.data);
  console.log("Stream ID:", event.id);
  console.log("Protocol:", event.protocol);
});
```

### `ofChannel`

Creates an RxJS operator that filters Plex streams based on a specified channel ID and protocol, logging matching streams.

```javascript
source$.pipe(ofChannel({ id: "myChannel", protocol: "myProtocol" })).subscribe(filteredStream => {
  console.log("Filtered stream:", filteredStream);
});
```

### `onConnection$`

Creates an Observable that listens for connection events on a specified Plex instance and optionally filters connections based on channel ID and protocol.

```javascript
onConnection$(plexInstance, "channelId", { protocol: "myProtocol" }).subscribe(connection => {
  console.log("New connection event:", connection);
});
```

### `onConnectionAndRead$`

Creates an Observable that listens for connection events on a specified Plex instance, filters connections based on channel ID and protocol if specified, and consumes the stream data.

```javascript
onConnectionAndRead$(plexInstance, "channelId", { protocol: "myProtocol" }).subscribe(event => {
  console.log("Received data:", event.data);
  console.log("Stream ID:", event.id);
  console.log("Protocol:", event.protocol);
});
```

### `tapSend`

Creates an operator that sends data to a specified Plex channel as a side effect and passes the data through.

```javascript
source$.pipe(tapSend(plexInstance, "myChannel", { encoding: "utf-8" })).subscribe();
```

### `withEncoding`

Creates a new configuration object with specified encoding, merging it with an existing Plex configuration.

```javascript
const config = withEncoding("utf-8", { protocol: "myProtocol" });
console.log(config); // { protocol: "myProtocol", encoding: <resolved utf-8 encoding> }
```

### `withHandshake`

Merges handshake-related configuration properties into an existing Plex configuration.

```javascript
const config = withHandshake({ handshake: "init", handshakeEncoding: "utf-8" }, { protocol: "myProtocol" });
console.log(config); // { protocol: "myProtocol", handshake: "init", handshakeEncoding: <resolved utf-8 encoding> }
```

### `withPlex`

Temporarily sets the current Plex instance for the duration of an asynchronous callback, restoring the previous instance afterward.

```javascript
await withPlex(newPlexInstance, async () => {
  // Perform actions with newPlexInstance as the current Plex
});
```

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
