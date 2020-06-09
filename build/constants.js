"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATUS_CODES_BLOCKED = exports.COUNTRY_CODE_REGEX = exports.BASIC_CRAWLER_TIMEOUT_MULTIPLIER = exports.APIFY_API_BASE_URL = exports.ACTOR_EVENT_NAMES_EX = exports.EXIT_CODES = exports.DEFAULT_USER_AGENT = void 0;
const consts_1 = require("apify-shared/consts");
/**
 * The default user agent used by `Apify.launchPuppeteer`.
 * Last updated on 2020-05-22.
 */
exports.DEFAULT_USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36';
/**
 * Exit codes for the actor process.
 * The error codes must be in the range 1-128, to avoid collision with signal exits
 * and to ensure Docker will handle them correctly!
 */
exports.EXIT_CODES = {
    SUCCESS: 0,
    ERROR_USER_FUNCTION_THREW: 91,
    ERROR_UNKNOWN: 92,
};
/**
 * These events are just internal for Apify package, so we don't need them in apify-shared package.
 *
 * @type {{CPU_INFO: string, SYSTEM_INFO: string, MIGRATING: string, PERSIST_STATE: string}}
 */
exports.ACTOR_EVENT_NAMES_EX = Object.assign({}, consts_1.ACTOR_EVENT_NAMES, { PERSIST_STATE: 'persistState' });
/**
 * Base URL of Apify's API endpoints.
 * @type {string}
 */
exports.APIFY_API_BASE_URL = 'https://api.apify.com/v2';
/**
 * Multiplier used in CheerioCrawler and PuppeteerCrawler to set a reasonable
 * handleRequestTimeoutSecs in BasicCrawler that would not impare functionality.
 *
 * @type {number}
 */
exports.BASIC_CRAWLER_TIMEOUT_MULTIPLIER = 10;
exports.COUNTRY_CODE_REGEX = /^[A-Z]{2}$/;
exports.STATUS_CODES_BLOCKED = [401, 403, 429];
