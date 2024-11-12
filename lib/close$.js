import {fromEvent, ReplaySubject, take} from "rxjs";
import {destroy} from "./destroy.js";

/**
 * Returns an observable that emits a single event when the "close" event is triggered on the plex instance.
 *
 * @param {Object} plex - The plex instance to listen for the "close" event.
 * @returns {Observable} - An observable that emits once when the "close" event occurs and then completes.
 */
export const close$ = (plex) => {
    if (plex.close$) return plex.close$;
    const _plex = plex;
    const subject = new ReplaySubject(1);
    let errorHandled = false; // Track if an error has been handled

    // Listen for close events emitted by Plex and notify the subject
    fromEvent(_plex.mux.stream, "close").pipe(take(1)).subscribe(() => {
        subject.next();
        subject.complete(); // Complete when the stream is closed
    });

    // Listen for errors emitted by Plex and handle them appropriately
    fromEvent(_plex.mux.stream, 'error').pipe(take(1)).subscribe(error => {
        if (!errorHandled) {
            errorHandled = true;
            subject.error(error); // Propagate the error to the RxJS stream
        }
    });

    // Trigger closing the Plex and optionally pass an error through the subject
    subject.pipe(take(1)).subscribe({
        error: (error) => {
            // Empty error handler to prevent unhandled errors
        },
        next: (value) => {
            if (value && typeof value === 'object' && 'message' in value) {
                if (!errorHandled) {
                    errorHandled = true; // Set flag to indicate error has been handled

                    // Safely destroy the stream with error handling
                    if (!_plex.mux.stream.destroyed) {
                        _plex.mux.stream.destroy(value);
                    }
                }
                subject.error(value); // Propagate error to any subscribers
            } else {
                // Safely destroy the stream normally
                if (!_plex.mux.stream.destroyed) {
                    destroy(plex, value); // Use the destroy function to handle closure normally
                }
            }
        }
    });

    return subject.pipe(take(1));
};



/**
 * @deprecated Use `close$` instead.
 *
 * Returns an observable that emits a single event when the "close" event is triggered on the plex instance.
 *
 * @param {Object} plex - The plex instance to listen for the "close" event.
 * @returns {Observable} - An observable that emits once when the "close" event occurs and then completes.
 */
export const close = close$;