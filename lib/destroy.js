import {asPlex} from "./asPlex.js";

/**
 * Destroys the multiplexed stream associated with the given plex.
 *
 * @param {Object} plex - The plex instance containing the multiplexed stream.
 * @param {Error} [e] - Optional error object to emit when destroying the stream.
 * @returns {void}
 */
export const destroy = (plex, e) => {
    return asPlex(plex).mux.stream.destroy(e);
};