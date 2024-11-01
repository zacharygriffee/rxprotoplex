import {plexIdConfigOrganizeArguments} from "./plexIdConfigOrganizeArguments.js";
import {encodingFrom} from "./encodingFrom.js";
import {asPlex} from "./asPlex.js";

/**
 * Establishes a connection to a specified Plex channel and sends data, closing the connection immediately after.
 *
 * @constant
 * @type {Function}
 *
 * @param {Object} plex - The Plex instance to connect to.
 * @param {string|number} id - The identifier of the channel to connect and send data to.
 * @param {Object} [config={}] - Configuration options for the connection.
 * @param {string|Object} [config.encoding] - Optional encoding format for the data, resolved if provided.
 * @returns {Function} - A function that takes `data` as an argument and sends it over the connection.
 *
 * @example
 * const sendData = connectAndSend(plexInstance, "myChannel", { encoding: "utf-8" });
 * sendData("Hello, World!");
 */
export const connectAndSend = plexIdConfigOrganizeArguments((plex, id, config = {}) => {
    if (config.encoding) config.encoding = encodingFrom(config.encoding);
    return data => asPlex(plex).connect(id, config).end(data);
});

export const sendOnce = connectAndSend;