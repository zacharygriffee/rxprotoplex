import {plexIdConfigOrganizeArguments} from "./plexIdConfigOrganizeArguments.js";
import {of} from "rxjs";
import {asPlex} from "./asPlex.js";

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
export const connect$ = plexIdConfigOrganizeArguments(
    (plex, id, config) => of(asPlex(plex).connect(id, config))
);