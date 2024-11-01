import {consumePlexStream} from "./consumePlexStream.js";

import {connect$} from "./connect$.js";

/**
 * Connects to a specified Plex instance and begins reading from its stream.
 *
 * @function
 * @param {Object} plex - The Plex instance to connect to.
 * @param {string|number} id - The unique identifier for the connection within the Plex instance.
 * @param {Object} config - Configuration options for the connection.
 * @returns {Observable} - An Observable that emits data from the connected Plex stream.
 *
 * @example
 * connectAndRead$(plexInstance, 1, { autoConnect: true }).subscribe(data => {
 *   console.log("Data from Plex:", data);
 * });
 */
export const connectAndRead$ = (plex, id, config) => connect$(plex, id, config).pipe(consumePlexStream);
