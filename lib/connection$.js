import {plexIdConfigOrganizeArguments} from "./plexIdConfigOrganizeArguments.js";
import {fromEvent, take, takeUntil} from "rxjs";
import {asPlex} from "./asPlex.js";
import {ofChannel} from "./ofChannel.js";

/**
 * Creates an Observable that listens for connection events on a specified Plex instance
 * and optionally filters connections based on channel ID and protocol. Closes when the "close" event is triggered.
 *
 * @constant
 * @type {Function}
 *
 * @param {Object} plex - The Plex instance to monitor for connections.
 * @param {string|number} [id] - The optional identifier of the channel to filter connections.
 * @param {Object} [config={}] - Configuration options for the connection.
 * @param {string} [config.protocol] - Protocol name to filter the connection events.
 * @returns {Observable} - An Observable that emits connection events from the Plex instance,
 * optionally filtered by the specified ID and protocol, and completes when the "close" event occurs.
 *
 * @example
 * connection$(plexInstance, "myChannel", { protocol: "myProtocol" }).subscribe(connection => {
 *   console.log("New connection event:", connection);
 * });
 */
export const connection$ = plexIdConfigOrganizeArguments((plex, id, config = {}) => {
    const connection$ = fromEvent(asPlex(plex), "connection");
    const close$ = fromEvent(plex, "close").pipe(take(1));

    return ((id || config?.protocol) ?
            connection$.pipe(ofChannel({ id, protocol: config.protocol }), takeUntil(close$)) :
            connection$.pipe(takeUntil(close$))
    );
});


/**
 * @deprecated Use `connection$` instead.
 *
 * Creates an Observable that listens for connection events on a specified Plex instance
 * and optionally filters connections based on channel ID and protocol.
 *
 * @constant
 * @type {Function}
 *
 * @param {Object} plex - The Plex instance to monitor for connections.
 * @param {string|number} [id] - The optional identifier of the channel to filter connections.
 * @param {Object} [config={}] - Configuration options for the connection.
 * @param {string} [config.protocol] - Protocol name to filter the connection events.
 * @returns {Observable} - An Observable that emits connection events from the Plex instance,
 * optionally filtered by the specified ID and protocol.
 *
 * @example
 * onConnection$(plexInstance, "myChannel", { protocol: "myProtocol" }).subscribe(connection => {
 *   console.log("New connection event:", connection);
 * });
 */
export const onConnection$ = connection$;
