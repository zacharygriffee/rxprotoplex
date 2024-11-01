import {consumePlexStream} from "./consumePlexStream.js";
import {listenAndConnection$} from "./listenAndConnection$.js";

/**
 * Listens for incoming connections on a specified channel and consumes the connection stream,
 * returning an Observable that emits data events with metadata.
 *
 * @function
 * @param {Object} plex - The Plex instance to listen on.
 * @param {string|number} id - The identifier of the channel to listen for connections.
 * @param {Object} [config={}] - Configuration options for the connection.
 * @param {string} [config.protocol] - Protocol name to associate with the channel, if any.
 * @returns {Observable} - An Observable that emits data objects from the connected Plex stream,
 * including `data`, `stream`, `id`, and `protocol` metadata.
 *
 * @example
 * listenAndConnectionAndRead$(plexInstance, "myChannel", { protocol: "myProtocol" }).subscribe(event => {
 *   console.log("Received data:", event.data);
 *   console.log("Stream ID:", event.id);
 *   console.log("Protocol:", event.protocol);
 * });
 */
export const listenAndConnectionAndRead$ = (plex, id, config) => {
    return listenAndConnection$(plex, id, config).pipe(consumePlexStream);
}
