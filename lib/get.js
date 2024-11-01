/**
 * Safely retrieves a value from a nested object based on a given path, with an optional fallback value.
 *
 * @function
 * @param {Object} obj - The object to retrieve the value from.
 * @param {string|string[]} path - The path to the desired property, either as a dot-separated string or an array of keys.
 * @param {*} [fallback] - A fallback value to return if the specified path does not resolve to a defined value.
 * @returns {*} - The value at the specified path in the object, or the fallback value if the path is invalid or undefined.
 *
 * @example
 * const obj = { a: { b: { c: 42 } } };
 * const value = get(obj, "a.b.c", "default"); // Returns 42
 *
 * @example
 * const value = get(obj, ["a", "b", "d"], "default"); // Returns "default"
 */
export const get = (obj, path, fallback) => {
    if (!obj || !path) return fallback;
    const paths = Array.isArray(path) ? path : path.split(".");
    let results = obj;
    let i = 0;

    while (i < paths.length && results !== undefined && results !== null) {
        results = results[paths[i]];
        i++;
    }

    if (i === paths.length) {
        return results !== undefined ? results : fallback;
    }

    return results !== undefined && results !== null ? results : fallback;
};
