import {asPlex} from "./asPlex.js";

/**
 * Destroys the multiplexed stream associated with the given plex.
 *
 * @param {Object} plex - The plex instance containing the multiplexed stream.
 * @param {Error} [error] - Optional error object to emit when destroying the stream.
 * @returns {void}
 */
export const destroy = (plex, error) => {
    const stream = plex.mux.stream;
    if (!stream.destroyed) {
        if (error) stream.emit("error", error);
        else stream.emit("close");
        stream.destroy(error);
    }
};