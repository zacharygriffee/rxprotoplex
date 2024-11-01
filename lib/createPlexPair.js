import duplexThrough from "duplex-through";
import NSS from "not-secret-stream";
import Protoplex from "@zacharygriffee/protoplex";

/**
 * Creates a pair of Plex instances using the provided configuration.
 *
 * @function
 * @param {Object} [config={}] - Configuration options for creating the Plex pair.
 * @param {number} [config.bits] - Bit length for the security key generation, if required.
 * @param {Object} [config.keyPair] - An optional key pair object for cryptographic operations.
 * @returns {Array} - An array containing two Plex instances.
 *
 * @example
 * const plexPair = createPlexPair({ bits: 256, keyPair: myKeyPair });
 * console.log("Plex Pair:", plexPair); // Array of two connected Plex instances
 */
export const createPlexPair = (config = {}) => {
    const {bits, keyPair} = config;
    return duplexThrough()
        .map(d => new NSS(d, {bits, keyPair}))
        .map(f => Protoplex.from(f));
};
