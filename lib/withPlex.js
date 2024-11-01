export let current_plex;
/**
 * Temporarily sets the current Plex instance for the duration of a callback function, restoring the previous instance afterward.
 *
 * @async
 * @function
 * @param {Object} plex - The Plex instance to set temporarily.
 * @param {Function} cb - An asynchronous callback function to execute with the specified Plex instance.
 * @returns {Promise<void>} - Resolves when the callback function completes.
 *
 * @example
 * await withPlex(newPlexInstance, async () => {
 *   // Perform actions with newPlexInstance as the current Plex
 * });
 */
export const withPlex = async (plex, cb) => {
    const lastPlex = current_plex;
    current_plex = plex;
    await cb();
    current_plex = lastPlex;
};
