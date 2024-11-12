import {fromEvent, take} from "rxjs";

/**
 * Returns an observable that emits a single event when the "close" event is triggered on the plex instance.
 *
 * @param {Object} plex - The plex instance to listen for the "close" event.
 * @returns {Observable} - An observable that emits once when the "close" event occurs and then completes.
 */
export const close$ = (plex) => {
    return fromEvent(plex, "close").pipe(take(1));
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