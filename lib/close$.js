// close$.js
import { Subject } from 'rxjs';

/**
 * Creates a close$ Subject for a Plex instance that can be used to manually close the stream or emit errors.
 *
 * @param {Object} plex - The Plex instance to manage.
 * @returns {Subject} - A Subject that manages closure and errors.
 */
export const close$ = (plex) => {
    if (plex.close$) return plex.close$;

    const subject = new Subject();

    // Attach event listeners to the stream
    const errorHandler = (error) => {
        if (!subject.closed) {
            subject.error(error);
        }
    };

    const closeHandler = () => {
        if (!subject.closed) {
            subject.next(); // Emit next to indicate normal closure
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
                plex.mux.stream.destroy(value);
                originalError(value); // Emit error to subscribers
            } else {
                plex.mux.stream.destroy();
                originalNext(value); // Emit next to indicate normal closure
                subject.complete();
            }
        }
    };

    subject.error = (err) => {
        if (!subject.closed) {
            plex.mux.stream.destroy(err);
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
