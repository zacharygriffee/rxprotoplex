import {tap, timeout} from "rxjs";

/**
 * Adds a timeout to an observable, with customizable behavior on timeout.
 *
 * @function
 * @param {Observable} observable - The observable to apply the timeout to.
 * @param {number} duration - The duration in milliseconds before the timeout occurs.
 * @param {Function} [withFactory] - A factory function to handle timeout behavior.
 *                                    Defaults to throwing a timeout error.
 * @returns {Observable} - The observable wrapped with timeout functionality.
 *
 * @example
 * withTimeout(myObservable, 5000).subscribe({
 *   next: value => console.log("Received:", value),
 *   error: err => console.error("Error:", err.message)
 * });
 */
export const withTimeout = (observable, duration, withFactory) => {
    if (typeof duration !== 'number' || duration <= 0) {
        throw new Error("Duration must be a positive number");
    }

    // Default behavior: throw a timeout error with a message
    if (!withFactory) {
        withFactory = (duration) => {
            throw new Error(`Operation timed out after ${duration} ms`);
        };
    }

    return observable.pipe(
        timeout({
            each: duration,
            with: () => withFactory(duration)
        })
    );
};
