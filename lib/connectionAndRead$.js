import {plexIdConfigOrganizeArguments} from "./plexIdConfigOrganizeArguments.js";
import {consumePlexStream} from "./consumePlexStream.js";
import {connection$} from "./connection$.js";

/**
 * Creates an Observable that listens for connection events on a specified Plex instance,
 * filters connections based on channel ID and protocol if specified, and consumes the stream data.
 * Closes when the "close" event is triggered.
 *
 * @constant
 * @type {Function}
 *
 * @param {Object} plex - The Plex instance to monitor for connections.
 * @param {string|number} [id] - The optional identifier of the channel to filter connections.
 * @param {Object} [config={}] - Configuration options for the connection.
 * @param {string} [config.protocol] - Protocol name to filter the connection events.
 * @returns {Observable<Object>} - An Observable that emits data objects from the connected Plex stream,
 * including metadata such as `data`, `stream`, `id`, and `protocol`, and completes when the "close" event occurs.
 *
 * @example
 * connectionAndRead$(plexInstance, "myChannel", { protocol: "myProtocol" }).subscribe(event => {
 *   console.log("Received data:", event.data);
 *   console.log("Stream ID:", event.id);
 *   console.log("Protocol:", event.protocol);
 * });
 */
export const connectionAndRead$ = plexIdConfigOrganizeArguments((plex, id, config = {}) => {
    return connection$(plex, id, config).pipe(consumePlexStream);
});


/**
 * @deprecated Use `connectionAndRead$` instead.
 *
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
export const onConnectionAndRead$ = connectionAndRead$;
