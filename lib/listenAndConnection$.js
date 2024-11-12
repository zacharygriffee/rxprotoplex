import { plexIdConfigOrganizeArguments } from "./plexIdConfigOrganizeArguments.js";
import { fromEvent, merge, takeUntil, tap, finalize, map } from "rxjs";
import { ofChannel } from "./ofChannel.js";
import { asPlex } from "./asPlex.js";
import { close$ } from "./close$.js";

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
    const connection$ = fromEvent(_plex, "connection").pipe(
        ofChannel(listenArgs), // Filter events based on channel ID and protocol
        takeUntil(close$),     // Clean up when close$ emits
        finalize(() => {
            _plex.unlisten(listenArgs);
        })
    );

    // Create error$ Observable for errors from the stream
    const error$ = fromEvent(_plex.mux.stream, 'error').pipe(
        takeUntil(close$), // Clean up when close$ emits
    );

    // Merge connection$ and error$ into a single Observable
    return merge(
        connection$.pipe(map(connection => ({ type: 'connection', connection }))),
        error$.pipe(map(error => ({ type: 'error', error })))
    ).pipe(
        takeUntil(close$), // Complete on close$
        tap(event => {
            // Handle error events
            if (event.type === 'error') {
                throw event.error; // Propagate error to any subscribers
            }
        }),
        map(event => {
            // Return the connection if it's a connection event
            if (event.type === 'connection') {
                return event.connection;
            }
        })
    );
});
