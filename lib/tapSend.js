import {plexIdConfigOrganizeArguments} from "./plexIdConfigOrganizeArguments.js";
import {encodingFrom} from "./encodingFrom.js";
import {tap} from "rxjs";

import {connectAndSend} from "./connectAndSend.js";

/**
 * Creates an operator that sends data to a specified Plex channel as a side effect and passes the data through.
 *
 * @constant
 * @type {Function}
 *
 * @param {Object} plex - The Plex instance to connect to.
 * @param {string|number} id - The identifier of the channel to send data to.
 * @param {Object} [config={}] - Configuration options for the connection.
 * @param {string|Object} [config.encoding="binary"] - Encoding format for the data, defaulting to "binary".
 * @returns {OperatorFunction} - An RxJS operator that sends data to the channel as a side effect while allowing the original data to continue in the Observable pipeline.
 *
 * @example
 * source$.pipe(tapSend(plexInstance, "myChannel", { encoding: "utf-8" })).subscribe();
 */
export const tapSend = plexIdConfigOrganizeArguments((plex, id, config = {}) => {
    config.encoding = encodingFrom(config.encoding || "binary");
    const sender = connectAndSend(plex, id, config);
    return tap(data => {
        if (data?.data && data.id && data.stream && data.protocol) data = data.data;
        return sender(data);
    });
});
