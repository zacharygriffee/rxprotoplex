import {filter, pipe, tap} from "rxjs";
import b4a from "b4a";

/**
 * Creates an operator that filters Plex streams based on a specified channel ID and protocol, logging matching streams.
 *
 * @function
 * @param {Object} options - The configuration options for the channel.
 * @param {string|number} options.id - The identifier of the channel to filter on.
 * @param {string} [options.protocol="protoplex/zacharygriffee"] - The protocol to filter on, if specified.
 * @returns {OperatorFunction} - An RxJS operator function that logs and filters streams based on the given ID and protocol.
 *
 * @example
 * source$.pipe(ofChannel({ id: "myChannel", protocol: "myProtocol" })).subscribe(filteredStream => {
 *   console.log("Filtered stream:", filteredStream);
 * });
 */
export const ofChannel = ({id, protocol}) => pipe(
    filter(subject => {
            if (protocol && subject.protocol !== protocol) return false;
            return b4a.equals(b4a.from(id), b4a.from(subject.id));
        }
    ));
