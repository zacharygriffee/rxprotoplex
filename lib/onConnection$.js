import {plexIdConfigOrganizeArguments} from "./plexIdConfigOrganizeArguments.js";
import {fromEvent} from "rxjs";
import {asPlex} from "./asPlex.js";
import {ofChannel} from "./ofChannel.js";

/**
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
export const onConnection$ = plexIdConfigOrganizeArguments((plex, id, config = {}) => {
    const connection$ = fromEvent(asPlex(plex), "connection");
    return ((id || config?.protocol) ?
        connection$.pipe(ofChannel({id, protocol: config.protocol})) : connection$);
});
