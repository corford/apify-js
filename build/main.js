"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utils = exports.Session = exports.LiveViewServer = exports.createProxyConfiguration = exports.openSessionPool = exports.openRequestQueue = exports.openRequestList = exports.RequestList = exports.Request = exports.PseudoUrl = exports.PuppeteerCrawler = exports.PuppeteerPool = exports.launchPuppeteer = exports.openKeyValueStore = exports.getInput = exports.setValue = exports.getValue = exports.stopEvents = exports.initializeEvents = exports.events = exports.openDataset = exports.pushData = exports.CheerioCrawler = exports.BasicCrawler = exports.AutoscaledPool = exports.addWebhook = exports.client = exports.isAtHome = exports.getMemoryInfo = exports.metamorph = exports.callTask = exports.call = exports.getEnv = exports.main = void 0;
const events_1 = require("events");
const utils_log_1 = require("./utils_log");
const actor_1 = require("./actor");
Object.defineProperty(exports, "main", { enumerable: true, get: function () { return actor_1.main; } });
Object.defineProperty(exports, "getEnv", { enumerable: true, get: function () { return actor_1.getEnv; } });
Object.defineProperty(exports, "call", { enumerable: true, get: function () { return actor_1.call; } });
Object.defineProperty(exports, "callTask", { enumerable: true, get: function () { return actor_1.callTask; } });
Object.defineProperty(exports, "metamorph", { enumerable: true, get: function () { return actor_1.metamorph; } });
Object.defineProperty(exports, "addWebhook", { enumerable: true, get: function () { return actor_1.addWebhook; } });
const autoscaled_pool_1 = require("./autoscaling/autoscaled_pool");
exports.AutoscaledPool = autoscaled_pool_1.default;
const basic_crawler_1 = require("./crawlers/basic_crawler");
exports.BasicCrawler = basic_crawler_1.default;
const cheerio_crawler_1 = require("./crawlers/cheerio_crawler");
exports.CheerioCrawler = cheerio_crawler_1.default;
const dataset_1 = require("./dataset");
Object.defineProperty(exports, "pushData", { enumerable: true, get: function () { return dataset_1.pushData; } });
Object.defineProperty(exports, "openDataset", { enumerable: true, get: function () { return dataset_1.openDataset; } });
const events_2 = require("./events");
exports.events = events_2.default;
Object.defineProperty(exports, "initializeEvents", { enumerable: true, get: function () { return events_2.initializeEvents; } });
Object.defineProperty(exports, "stopEvents", { enumerable: true, get: function () { return events_2.stopEvents; } });
const key_value_store_1 = require("./key_value_store");
Object.defineProperty(exports, "getValue", { enumerable: true, get: function () { return key_value_store_1.getValue; } });
Object.defineProperty(exports, "setValue", { enumerable: true, get: function () { return key_value_store_1.setValue; } });
Object.defineProperty(exports, "getInput", { enumerable: true, get: function () { return key_value_store_1.getInput; } });
Object.defineProperty(exports, "openKeyValueStore", { enumerable: true, get: function () { return key_value_store_1.openKeyValueStore; } });
const puppeteer_1 = require("./puppeteer");
Object.defineProperty(exports, "launchPuppeteer", { enumerable: true, get: function () { return puppeteer_1.launchPuppeteer; } });
const puppeteer_crawler_1 = require("./crawlers/puppeteer_crawler");
exports.PuppeteerCrawler = puppeteer_crawler_1.default;
const puppeteer_pool_1 = require("./puppeteer_pool");
exports.PuppeteerPool = puppeteer_pool_1.default;
const request_1 = require("./request");
exports.Request = request_1.default;
const request_list_1 = require("./request_list");
Object.defineProperty(exports, "RequestList", { enumerable: true, get: function () { return request_list_1.RequestList; } });
Object.defineProperty(exports, "openRequestList", { enumerable: true, get: function () { return request_list_1.openRequestList; } });
const proxy_configuration_1 = require("./proxy_configuration");
Object.defineProperty(exports, "createProxyConfiguration", { enumerable: true, get: function () { return proxy_configuration_1.createProxyConfiguration; } });
const request_queue_1 = require("./request_queue");
Object.defineProperty(exports, "openRequestQueue", { enumerable: true, get: function () { return request_queue_1.openRequestQueue; } });
const utils_1 = require("./utils");
Object.defineProperty(exports, "client", { enumerable: true, get: function () { return utils_1.apifyClient; } });
Object.defineProperty(exports, "getMemoryInfo", { enumerable: true, get: function () { return utils_1.getMemoryInfo; } });
Object.defineProperty(exports, "isAtHome", { enumerable: true, get: function () { return utils_1.isAtHome; } });
const puppeteer_utils_1 = require("./puppeteer_utils");
const utils_social_1 = require("./utils_social");
const enqueue_links_1 = require("./enqueue_links/enqueue_links");
const pseudo_url_1 = require("./pseudo_url");
exports.PseudoUrl = pseudo_url_1.default;
const live_view_server_1 = require("./live_view/live_view_server");
exports.LiveViewServer = live_view_server_1.default;
const utils_request_1 = require("./utils_request");
const session_pool_1 = require("./session_pool/session_pool");
Object.defineProperty(exports, "openSessionPool", { enumerable: true, get: function () { return session_pool_1.openSessionPool; } });
const session_1 = require("./session_pool/session");
Object.defineProperty(exports, "Session", { enumerable: true, get: function () { return session_1.Session; } });
// Increase the global limit for event emitter memory leak warnings.
events_1.EventEmitter.defaultMaxListeners = 50;
const exportedUtils = Object.assign(utils_1.publicUtils, {
    puppeteer: puppeteer_utils_1.puppeteerUtils,
    social: utils_social_1.socialUtils,
    log: utils_log_1.default,
    enqueueLinks: enqueue_links_1.enqueueLinks,
    requestAsBrowser: utils_request_1.requestAsBrowser,
});
exports.utils = exportedUtils;
