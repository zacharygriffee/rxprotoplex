import Protoplex from "@zacharygriffee/protoplex";
import { share, tap, catchError } from "rxjs";
import { close$ as createClose$ } from "./close$.js";

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
    // Error handler to manage stream errors and avoid unhandled errors
    const errorHandler = (err) => {
        // console.error(`Stream emitted error: ${err.message}`);
        if (stream && typeof stream.destroy === 'function') {
            stream.destroy(); // Explicitly destroy the stream on error to prevent further events
        }
    };

    const attachClose$ = (plex) => {
        plex.close$ = createClose$(plex).pipe(
            share(),
            tap({
                next: () => {}, // Handle successful closures
                complete: () => {
                    // Explicitly destroy the stream when closing
                    if (plex.mux.stream && typeof plex.mux.stream.destroy === 'function') {
                        plex.mux.stream.destroy();
                    }
                },
                error: (err) => {
                    // console.error(`Stream error: ${err.message}`);
                    if (plex.mux.stream && typeof plex.mux.stream.destroy === 'function') {
                        plex.mux.stream.destroy();
                    }
                }
            }),
            catchError((err) => {
                // console.error(`Caught error in close$: ${err.message}`);
                return []; // Return an empty observable to suppress further emissions
            })
        );
    };

    // If the stream is already a Protoplex instance, return it as is
    if (stream.isProtoplex) {
        // Ensure close$ is attached even if asPlex is called multiple times
        if (!stream.close$) {
            attachClose$(stream);
        }
        return stream;
    }

    // Wrap the stream into a Protoplex instance
    const plex = Protoplex.from(stream, config);

    // Add the error handler to prevent unhandled error warnings
    plex.mux.stream.on('error', errorHandler);

    // Attach the close$ observable for the newly created Plex instance
    attachClose$(plex);

    return plex;
};
