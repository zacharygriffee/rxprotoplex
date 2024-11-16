import {duplexThrough} from "duplex-through-with-error-handling";
import NSS from "not-secret-stream";
import {asPlex} from "./asPlex.js";

/**
 * Creates a pair of Plex instances using the provided configuration.
 *
 * @function
 * @param {Object} [config={}] - Configuration options for creating the Plex pair.
 * @param {number} [config.bits] - Bit length for the security key generation, if required.
 * @param {Object} [config.keyPair] - An optional key pair object for cryptographic operations.
 * @param {Object} [config.plexConfig] - Additional configuration options for the Plex instances.
 * @returns {Array<Plex>} - An array containing two connected Plex instances.
 *
 * @example
 * const plexPair = createPlexPair({ bits: 256, keyPair: myKeyPair, plexConfig: { someOption: true } });
 * console.log("Plex Pair:", plexPair); // Array of two connected Plex instances
 */
export const createPlexPair = (config = {}) => {
    const {bits, keyPair, ...plexConfig} = config;
    return duplexThrough()
        .map(d => new NSS(d, {bits, keyPair}))
        .map(f => asPlex(f, plexConfig));
};
