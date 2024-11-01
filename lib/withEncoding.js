import {encodingFrom} from "./encodingFrom.js";

/**
 * Creates a new configuration object with specified encoding, merging it with an existing Plex configuration.
 *
 * @function
 * @param {string|Object} encoding - The desired encoding, either as a string or an encoding object.
 * @param {Object} [plexConfig={}] - Existing Plex configuration to merge with the specified encoding.
 * @returns {Object} - A new configuration object that includes the resolved encoding.
 *
 * @example
 * const config = withEncoding("utf-8", { protocol: "myProtocol" });
 * console.log(config); // { protocol: "myProtocol", encoding: <resolved utf-8 encoding> }
 */
export const withEncoding = (encoding, plexConfig = {}) =>
    Object.assign({}, plexConfig, {encoding: encodingFrom(encoding || "raw")});
