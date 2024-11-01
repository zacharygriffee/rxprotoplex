import {get} from "./get.js";
import c from "compact-encoding";

/**
 * Resolves and returns an encoding format based on the provided encoding descriptor.
 * This function supports resolving codec and compact-encoding formats as well.
 *
 * @function
 * @param {string|Object} encoding - The encoding descriptor, either as a string name, codec, or compact-encoding object.
 * @returns {Object} - An encoding object corresponding to the provided encoding descriptor.
 * @throws {TypeError} - Throws a TypeError if a string encoding is provided but is invalid.
 *
 * @example
 * const encoding = encodingFrom("utf-8");
 * console.log("Resolved Encoding:", encoding);
 *
 * @example
 * const encoding = encodingFrom(customEncodingObject);
 * console.log("Custom Encoding:", encoding);
 */
export function encodingFrom(encoding) {
    let enc = encoding;
    if (typeof encoding === "string") {
        enc = get(c, encoding);
        if (!enc) throw new TypeError(`${encoding} is not a valid string encoding`);
    }
    return c.from(enc);
}
