import {from, map, mergeMap} from "rxjs";

/**
 * An operator that consumes a Plex stream and maps each data event into an object with metadata.
 *
 * @constant
 * @type {OperatorFunction<Object, Object>}
 *
 * @param {Object} stream - The Plex stream to be consumed.
 * @returns {Observable<Object>} - An Observable that emits objects containing the data,
 * stream reference, stream ID, and protocol metadata.
 *
 * @example
 * source$.pipe(consumePlexStream).subscribe(event => {
 *   console.log("Received data:", event.data);
 *   console.log("Stream ID:", event.id);
 *   console.log("Protocol:", event.protocol);
 * });
 */
export const consumePlexStream = mergeMap(stream =>
    from(stream).pipe(
        map(
            data => ({data, stream, id: stream.id, protocol: stream.protocol})
        )
    )
);