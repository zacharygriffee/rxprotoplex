import Protoplex from "@zacharygriffee/protoplex";

/**
 * Wraps a given stream in a Protoplex instance if it is not already multiplexed.
 *
 * @function
 * @param {Object} stream - The stream to be wrapped or returned as is if already multiplexed.
 * @param {Object} config - Configuration options for creating a Protoplex instance.
 * @returns {Object} - The original stream if already multiplexed, otherwise a new Protoplex instance.
 *
 * @example
 * const plexStream = asPlex(stream, { someConfig: true });
 * console.log(plexStream); // Outputs either the original multiplexed stream or a new Protoplex instance.
 */
export const asPlex = (stream, config) => {
    if (stream.mux) return stream;
    return Protoplex.from(stream, config);
};
