"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCookiesFromResponse = void 0;
/* eslint-enable no-unused-vars */
const tough_cookie_1 = require("tough-cookie");
const errors_1 = require("./errors");
/**
 * @param {(IncomingMessage|PuppeteerResponse)} response
 * @return {undefined|Array<*>}
 */
exports.getCookiesFromResponse = (response) => {
    const headers = typeof response.headers === 'function' ? response.headers() : response.headers;
    const cookieHeader = headers['set-cookie'] || '';
    try {
        return Array.isArray(cookieHeader) ? cookieHeader.map(tough_cookie_1.Cookie.parse) : [tough_cookie_1.Cookie.parse(cookieHeader)];
    }
    catch (e) {
        throw new errors_1.CookieParseError(cookieHeader);
    }
};
