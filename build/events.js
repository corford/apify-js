"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopEvents = exports.initializeEvents = void 0;
const events_1 = require("events");
const WebSocket = require("ws");
const consts_1 = require("apify-shared/consts");
const constants_1 = require("./constants");
const utils_log_1 = require("./utils_log");
// NOTE: This value is mentioned below in docs, if you update it here, update it there too.
const PERSIST_STATE_INTERVAL_MILLIS = 60 * 1000;
/**
 * Event emitter providing events from underlying Actor infrastructure and Apify package.
 * @ignore
 */
const events = new events_1.EventEmitter();
/**
 * Websocket connection to actor events.
 * @ignore
 */
let eventsWs = null;
/**
 * Interval that emits persist state events.
 * @ignore
 */
let persistStateInterval = null;
/**
 * Gets an instance of a Node.js'
 * [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter)
 * class that emits various events from the SDK or the Apify platform.
 * The event emitter is initialized by calling the {@link Apify#main} function.
 *
 * **Example usage:**
 *
 * ```javascript
 * Apify.events.on('cpuInfo', (data) => {
 *   if (data.isCpuOverloaded) console.log('Oh no, the CPU is overloaded!');
 * });
 * ```
 *
 * The following events are emitted:
 *
 * - `cpuInfo`: `{ "isCpuOverloaded": Boolean }`
 *   The event is emitted approximately every second
 *   and it indicates whether the actor is using the maximum of available CPU resources.
 *   If that's the case, the actor should not add more workload.
 *   For example, this event is used by the {@link AutoscaledPool} class.
 * - `migrating`: `void`
 *   Emitted when the actor running on the Apify platform is going to be migrated to another worker server soon.
 *   You can use it to persist the state of the actor and abort the run, to speed up migration.
 *   For example, this is used by the {@link RequestList} class.
 * - `persistState`: `{ "isMigrating": Boolean }`
 *   Emitted in regular intervals (by default 60 seconds) to notify all components of Apify SDK that it is time to persist
 *   their state, in order to avoid repeating all work when the actor restarts.
 *   This event is automatically emitted together with the `migrating` event,
 *   in which case the `isMigrating` flag is set to `true`. Otherwise the flag is `false`.
 *   Note that the `persistState` event is provided merely for user convenience,
 *   you can achieve the same effect using `setInterval()` and listening for the `migrating` event.
 *
 * @memberof module:Apify
 * @name events
 */
exports.default = events;
/**
 * Emits event telling all components that they should persist their state at regular intervals and also when an actor is being
 * migrated to another worker.
 *
 * @ignore
 */
const emitPersistStateEvent = (isMigrating = false) => {
    events.emit(constants_1.ACTOR_EVENT_NAMES_EX.PERSIST_STATE, { isMigrating });
};
/**
 * Initializes `Apify.events` event emitter by creating a connection to a websocket that provides them.
 * This is an internal function that is automatically called by `Apify.main()`.
 *
 * @memberof module:Apify
 * @name initializeEvents
 * @function
 * @ignore
 */
exports.initializeEvents = () => {
    if (eventsWs)
        return;
    const log = utils_log_1.default.child({ prefix: 'Events' });
    if (!persistStateInterval) {
        // This is overridable only to enable unit testing.
        const intervalMillis = process.env.APIFY_TEST_PERSIST_INTERVAL_MILLIS || PERSIST_STATE_INTERVAL_MILLIS;
        persistStateInterval = setInterval(() => emitPersistStateEvent(), intervalMillis);
    }
    const eventsWsUrl = process.env[consts_1.ENV_VARS.ACTOR_EVENTS_WS_URL];
    // Locally there is no web socket to connect, so just print a log message.
    if (!eventsWsUrl) {
        log.debug(`Environment variable ${consts_1.ENV_VARS.ACTOR_EVENTS_WS_URL} is not set, no events from Apify platform will be emitted.`);
        return;
    }
    eventsWs = new WebSocket(eventsWsUrl);
    eventsWs.on('message', (message) => {
        if (!message)
            return;
        try {
            const { name, data } = JSON.parse(message);
            events.emit(name, data);
            if (name === consts_1.ACTOR_EVENT_NAMES.MIGRATING) {
                clearInterval(persistStateInterval); // Don't send any other persist state event.
                emitPersistStateEvent(true);
            }
        }
        catch (err) {
            log.exception(err, 'Cannot parse actor event');
        }
    });
    eventsWs.on('error', (err) => {
        // Don't print this error as this happens in the case of very short Apify.main().
        if (err.message === 'WebSocket was closed before the connection was established')
            return;
        log.exception(err, 'web socket connection failed');
    });
    eventsWs.on('close', () => {
        log.warning('web socket has been closed');
        eventsWs = null;
    });
};
/**
 * Closes websocket providing events from Actor infrastructure and also stops sending internal events
 * of Apify package such as `persistState`.
 * This is automatically called at the end of `Apify.main()`.
 *
 * @memberof module:Apify
 * @name stopEvents
 * @function
 * @ignore
 */
exports.stopEvents = () => {
    if (eventsWs)
        eventsWs.close();
    clearInterval(persistStateInterval);
    persistStateInterval = null;
};
