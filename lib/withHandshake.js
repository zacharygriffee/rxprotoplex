import {encodingFrom} from "./encodingFrom.js";

/**
 * Merges handshake-related configuration properties into an existing Plex configuration.
 *
 * @function
 * @param {Object} [handshakeConfig={}] - Configuration object for handshake options.
 * @param {Function} [handshakeConfig.onhandshake] - Callback function to be executed on handshake events.
 * @param {*} [handshakeConfig.handshake] - Data or parameters to initiate the handshake.
 * @param {string|Object} [handshakeConfig.handshakeEncoding] - Encoding format for the handshake, resolved if provided.
 * @param {Object} [plexConfig={}] - Existing Plex configuration to merge with the handshake configuration.
 * @returns {Object} - A new configuration object that includes handshake properties and the resolved encoding.
 *
 * @example
 * const config = withHandshake({ handshake: "init", handshakeEncoding: "utf-8" }, { protocol: "myProtocol" });
 * console.log(config); // { protocol: "myProtocol", handshake: "init", handshakeEncoding: <resolved utf-8 encoding> }
 */
export const withHandshake = ({onhandshake, handshake, handshakeEncoding} = {}, plexConfig = {}) => {
    return Object.assign({}, plexConfig, {
        handshake,
        handshakeEncoding: encodingFrom(handshakeEncoding),
        onhandshake
    });
};
