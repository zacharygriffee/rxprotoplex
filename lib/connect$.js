import {plexIdConfigOrganizeArguments} from "./plexIdConfigOrganizeArguments.js";
import {catchError, fromEventPattern, of, takeUntil, tap} from "rxjs";
import {asPlex} from "./asPlex.js";
import {close$} from "./close$.js";

/**
 * Creates an Observable that connects to a specified Plex instance with a given ID and configuration.
 *
 * @constant
 * @type {Function}
 *
 * @param {Function} plexIdConfigOrganizeArguments - A higher-order function organizing arguments for connection.
 * @returns {Observable} - An Observable that emits the result of connecting to the Plex instance.
 *
 * @example
 * connect$.subscribe({
 *   next: connection => console.log("Connected to Plex:", connection),
 *   error: err => console.error("Connection error:", err)
 * });
 */

export const connect$ = plexIdConfigOrganizeArguments((plex, id, config) => {
    const _plex = asPlex(plex);
    const connection = _plex.connect(id, config);

    return fromEventPattern(
        handler => {
            // Attach a connection event listener
            connection.on('connect', () => handler(connection));

            return connection;
        },
        handler => {
            // Use the returned connection object to remove handlers correctly
            connection.off('connect', handler);
        }
    ).pipe(
        takeUntil(_plex.close$), // Clean up on close$
        tap(stream => {
            // Check if the value looks like an error object, and propagate it if true
            if (stream && typeof stream === 'object' && 'message' in stream) {
                throw stream; // Propagate the error
            }
        }),
        catchError(err => new Error(`Connection error: ${err.message}`))
    );
});
