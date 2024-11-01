import {plexIdConfigOrganizeArguments} from "./plexIdConfigOrganizeArguments.js";
import {fromEventPattern} from "rxjs";
import {ofChannel} from "./ofChannel.js";

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
export const listenAndConnection$ = plexIdConfigOrganizeArguments(
    (plex, id, config = {}) => {
        return fromEventPattern(
            handler => {
                console.log(`Listening on channel ${id}`);
                return plex.listen(id, config).on("connection", handler);
            },
            handler => {
                try {
                    console.log(`Unlistening on channel ${id}`);
                    plex.unlisten({id, ...config});
                    plex.off("connection", handler);
                } catch (e) {
                    debugger;
                }
            }
        ).pipe(ofChannel({id, protocol: config.protocol}));
    }
);
