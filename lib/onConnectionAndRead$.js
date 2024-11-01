import {plexIdConfigOrganizeArguments} from "./plexIdConfigOrganizeArguments.js";
import {fromEvent} from "rxjs";
import {asPlex} from "./asPlex.js";
import {ofChannel} from "./ofChannel.js";
import {consumePlexStream} from "./consumePlexStream.js";

/**
 * Creates an Observable that listens for connection events on a specified Plex instance,
 * filters connections based on channel ID and protocol if specified, and consumes the stream data.
 *
 * @constant
 * @type {Function}
 *
 * @param {Object} plex - The Plex instance to monitor for connections.
 * @param {string|number} [id] - The optional identifier of the channel to filter connections.
 * @param {Object} [config={}] - Configuration options for the connection.
 * @param {string} [config.protocol] - Protocol name to filter the connection events.
 * @returns {Observable<Object>} - An Observable that emits data objects from the connected Plex stream,
 * including metadata such as `data`, `stream`, `id`, and `protocol`.
 *
 * @example
 * onConnectionAndRead$(plexInstance, "myChannel", { protocol: "myProtocol" }).subscribe(event => {
 *   console.log("Received data:", event.data);
 *   console.log("Stream ID:", event.id);
 *   console.log("Protocol:", event.protocol);
 * });
 */
export const onConnectionAndRead$ = plexIdConfigOrganizeArguments((plex, id, config = {}) => {
    const connection$ = fromEvent(asPlex(plex), "connection");
    return ((id || config?.protocol) ?
        connection$.pipe(ofChannel({id, protocol: config.protocol})) : connection$)
        .pipe(consumePlexStream);
});
