"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeoutError = exports.ApifyCallError = exports.APIFY_CALL_ERROR_NAME = void 0;
exports.APIFY_CALL_ERROR_NAME = 'ApifyCallError';
/**
 * The class represents exceptions thrown
 * by the {@link Apify#call} function.
 *
 * @property {string} message
 *   Error message
 * @property {ActorRun} run
 *   Object representing the failed actor run.
 * @property {string} name
 *   Contains `"ApifyCallError"`
 */
class ApifyCallError extends Error {
    /**
     * @param {ActorRun} run
     * @param {string} [message]
     */
    constructor(run, message = 'The actor invoked by Apify.call() did not succeed') {
        super(`${message} (run ID: ${run.id})`);
        this.name = exports.APIFY_CALL_ERROR_NAME;
        this.run = run;
        Error.captureStackTrace(this, ApifyCallError);
    }
}
exports.ApifyCallError = ApifyCallError;
/**
 * TimeoutError class.
 * This error should be thrown after request timeout from `requestAsBrowser`.
 * @ignore
 */
class TimeoutError extends Error {
}
exports.TimeoutError = TimeoutError;
