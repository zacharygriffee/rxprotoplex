import {plexIdConfigOrganizeArguments} from "./plexIdConfigOrganizeArguments.js";
import {finalize, fromEvent, takeUntil, tap} from "rxjs";
import {ofChannel} from "./ofChannel.js";
import {asPlex} from "./asPlex.js";

/**
 * Listens for incoming connections on a specified channel and returns an Observable for connection events.
 *
 * @constant
 * @type {Function}
 *
 * @param {Object} plex - The Plex instance to listen on.
 * @param {string|number} id - The identifier of the channel to listen for connections.
 * @param {Object} [config={}] - Configuration options for the connection.
 * @param {string} [config.protocol] - Protocol name to associate with the channel, if any.
 * @returns {Observable} - An Observable that emits connection events on the specified channel.
 *
 * @example
 * listenAndConnection$(plexInstance, "myChannel", { protocol: "myProtocol" }).subscribe(connection => {
 *   console.log("New connection:", connection);
 * });
 */
export const listenAndConnection$ = plexIdConfigOrganizeArguments((plex, id, { protocol, ...config } = {}) => {
    const _plex = asPlex(plex);
    const listenArgs = { id, protocol, ...config };

    // Use the existing close$ Observable on the Plex instance
    const close$ = _plex.close$.pipe(tap(() => console.log("Closed")));

    // Set up the listener for incoming connections
    _plex.listen(listenArgs.id, listenArgs);

    // Create connection$ Observable
    // Merge connection$ and error$ into a single Observable
    return fromEvent(_plex, "connection").pipe(
        ofChannel(listenArgs), // Filter events based on channel ID and protocol
        takeUntil(close$),     // Clean up when close$ emits
        finalize(() => {
            _plex.unlisten(listenArgs);
        })
    );
});
