// asPlex.js
import {Subject, throwError} from 'rxjs';
import Protoplex from '@zacharygriffee/protoplex';
import {share, tap, catchError} from 'rxjs/operators';

/**
 * Wraps a stream into a Protoplex instance and attaches a close$ observable.
 *
 * @param {Duplex} stream - The stream to be wrapped and managed.
 * @param {Object} [config={}] - Optional configuration for Protoplex.
 * @returns {Protoplex} - The wrapped Plex instance with a close$ observable.
 */
export const asPlex = (stream, config) => {
    // Error handler to manage stream errors and avoid unhandled errors
    const errorHandler = (err) => {
        if (
            stream &&
            typeof stream.destroy === 'function' &&
            !(stream.destroying || stream.destroyed)) {
            stream.destroy(err); // Explicitly destroy the stream on error to prevent further events
        }
    };

    const attachClose$ = (plex) => {
        plex.close$ = createClose$(plex).pipe(
            share(),
            tap({
                complete: () => {
                    if (plex.mux.stream &&
                        typeof plex.mux.stream.destroy === 'function' &&
                        !(stream.destroying || stream.destroyed)) {
                        plex.mux.stream.destroy();
                    }
                },
                error: (err) => {
                    if (plex.mux.stream &&
                        typeof plex.mux.stream.destroy === 'function' &&
                        !(stream.destroying || stream.destroyed)) {
                        plex.mux.stream.destroy(err);
                    }
                }
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

/**
 * Creates a close$ Subject for a Plex instance that can be used to manually close the stream or emit errors.
 *
 * @param {Object} plex - The Plex instance to manage.
 * @returns {Subject} - A Subject that manages closure and errors.
 */
export const createClose$ = (plex) => {
    if (plex.close$) return plex.close$;

    const subject = new Subject();
    const stream = plex.mux.stream;

    // Attach event listeners to the stream
    const errorHandler = (error) => {
        if (!subject.closed) {
            subject.error(error);
        }
    };

    const closeHandler = () => {
        if (!subject.closed) {
            subject.complete();
        }
    };

    plex.mux.stream.on('error', errorHandler);
    plex.mux.stream.on('close', closeHandler);

    // Override subject's next and error methods to destroy the stream accordingly
    const originalNext = subject.next.bind(subject);
    const originalError = subject.error.bind(subject);

    subject.next = (value) => {
        if (!subject.closed) {
            if (value instanceof Error) {
                if (!(stream.destroying || stream.destroyed)) plex.mux.stream.destroy(value);
                originalError(value); // Emit error to subscribers
            } else {
                if (!(stream.destroying || stream.destroyed)) plex.mux.stream.destroy(value);
                originalNext(value); // Emit next to indicate normal closure
                subject.complete();
            }
        }
    };

    subject.error = (err) => {
        if (!subject.closed) {
            if (!(stream.destroying || stream.destroyed)) plex.mux.stream.destroy(err);
            originalError(err);
        }
    };

    // Cleanup event listeners when the Subject is unsubscribed or closed
    const cleanup = () => {
        plex.mux.stream.off('error', errorHandler);
        plex.mux.stream.off('close', closeHandler);
    };

    subject.subscribe({
        complete: cleanup,
        error: cleanup,
    });

    plex.close$ = subject;

    return plex.close$;
};
