"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CookieParseError = void 0;
class CookieParseError extends Error {
    /**
     * @param {string} cookieHeaderString
     */
    constructor(cookieHeaderString) {
        super(`Could not parse cookie header string: ${cookieHeaderString}`);
        this.cookieHeaderString = cookieHeaderString;
        Error.captureStackTrace(this, CookieParseError);
    }
}
exports.CookieParseError = CookieParseError;
