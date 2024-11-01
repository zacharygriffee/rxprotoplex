import {current_plex} from "./withPlex.js";
import b4a from "b4a";
import {encodingFrom} from "./encodingFrom.js";

export function plexIdConfigOrganizeArguments(cb) {
    return (plex, id, config) => {
        // Step 1: Default `plex` to `current_plex` if `plex` is not provided and `current_plex` is valid
        if (!plex && typeof current_plex !== 'undefined' && current_plex.mux) {
            plex = current_plex;
        }

        // Step 2: Handle cases where `plex` is actually `id` or `config`
        if (plex && !plex.mux && (b4a.isBuffer(plex) || typeof plex === 'string')) {
            // If `plex` is actually `id`, shift arguments
            config = id;
            id = plex;
            plex = current_plex; // Use `current_plex` as `plex`
        } else if (plex && !plex.mux && typeof plex === 'object') {
            // If `plex` is actually `config`, shift arguments
            config = plex;
            plex = current_plex; // Use `current_plex` as `plex`
            id = undefined;
        }

        // Step 3: Check if `id` is actually `config` by seeing if it’s an object and not a buffer or string
        if (id && typeof id === 'object' && !b4a.isBuffer(id) && typeof id !== 'string') {
            config = id;
            id = undefined; // Clear `id` since it’s actually `config`
        }

        // Step 4: Ensure `config` is a plain object if not provided
        if (!config || typeof config !== 'object') {
            config = {};
        }

        // Step 5: Validate or convert `id` if it’s present
        if (typeof id === 'string') {
            id = b4a.from(id); // Convert `id` to buffer if it's a string
        } else if (id && !b4a.isBuffer(id)) {
            throw new Error("`id` must be a buffer or a string if provided.");
        }

        // Step 6: Set `config.id` to `id` if `id` is provided
        if (id) {
            config.id = id;
        } else {
            config.id = b4a.from([]);
        }

        // Apply any encoding conversion if specified in `config`
        if (config.encoding) {
            config.encoding = encodingFrom(config.encoding);
        }

        // Execute callback with resolved `plex`, `id`, and `config`
        return cb(plex, config.id, config);
    };
}
