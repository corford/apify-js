"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractUrlsFromCheerio = exports.extractUrlsFromPage = exports.enqueueLinks = void 0;
const url_1 = require("url");
const utils_1 = require("apify-client/build/utils");
const utilities_1 = require("apify-shared/utilities");
const utils_log_1 = require("../utils_log");
/* eslint-disable import/no-duplicates */
const request_queue_1 = require("../request_queue");
const shared_1 = require("./shared");
/* eslint-enable no-unused-vars,import/named,import/no-duplicates,import/order */
/**
 * The function finds elements matching a specific CSS selector (HTML anchor (`<a>`) by default)
 * either in a Puppeteer page, or in a Cheerio object (parsed HTML),
 * and enqueues the URLs in their `href` attributes to the provided {@link RequestQueue}.
 * If you're looking to find URLs in JavaScript heavy pages where links are not available
 * in `href` elements, but rather navigations are triggered in click handlers
 * see {@link puppeteer#enqueueLinksByClickingElements}.
 *
 * Optionally, the function allows you to filter the target links' URLs using an array of {@link PseudoUrl} objects
 * and override settings of the enqueued {@link Request} objects.
 *
 * **Example usage**
 *
 * ```javascript
 * const Apify = require('apify');
 *
 * const browser = await Apify.launchPuppeteer();
 * const page = await browser.goto('https://www.example.com');
 * const requestQueue = await Apify.openRequestQueue();
 *
 * await Apify.utils.enqueueLinks({
 *   page,
 *   requestQueue,
 *   selector: 'a.product-detail',
 *   pseudoUrls: [
 *       'https://www.example.com/handbags/[.*]',
 *       'https://www.example.com/purses/[.*]'
 *   ],
 * });
 * ```
 *
 * @param {Object} options
 *   All `enqueueLinks()` parameters are passed
 *   via an options object with the following keys:
 * @param {Page} [options.page]
 *   Puppeteer [`Page`](https://pptr.dev/#?product=Puppeteer&show=api-class-page) object.
 *   Either `page` or `$` option must be provided.
 * @param {Number} [options.limit]
 *   Limit the count of actually enqueued URLs to this number. Useful for testing across the entire crawling scope.
 * @param {CheerioStatic} [options.$]
 *   [`Cheerio`](https://github.com/cheeriojs/cheerio) function with loaded HTML.
 *   Either `page` or `$` option must be provided.
 * @param {RequestQueue} options.requestQueue
 *   A request queue to which the URLs will be enqueued.
 * @param {string} [options.selector='a']
 *   A CSS selector matching links to be enqueued.
 * @param {string} [options.baseUrl]
 *   A base URL that will be used to resolve relative URLs when using Cheerio. Ignored when using Puppeteer,
 *   since the relative URL resolution is done inside the browser automatically.
 * @param {Array<Object>|Array<string>} [options.pseudoUrls]
 *   An array of {@link PseudoUrl}s matching the URLs to be enqueued,
 *   or an array of strings or RegExps or plain Objects from which the {@link PseudoUrl}s can be constructed.
 *
 *   The plain objects must include at least the `purl` property, which holds the pseudo-URL string or RegExp.
 *   All remaining keys will be used as the `requestTemplate` argument of the {@link PseudoUrl} constructor,
 *   which lets you specify special properties for the enqueued {@link Request} objects.
 *
 *   If `pseudoUrls` is an empty array, `null` or `undefined`, then the function
 *   enqueues all links found on the page.
 * @param {RequestTransform} [options.transformRequestFunction]
 *   Just before a new {@link Request} is constructed and enqueued to the {@link RequestQueue}, this function can be used
 *   to remove it or modify its contents such as `userData`, `payload` or, most importantly `uniqueKey`. This is useful
 *   when you need to enqueue multiple `Requests` to the queue that share the same URL, but differ in methods or payloads,
 *   or to dynamically update or create `userData`.
 *
 *   For example: by adding `keepUrlFragment: true` to the `request` object, URL fragments will not be removed
 *   when `uniqueKey` is computed.
 *
 *   **Example:**
 *   ```javascript
 *   {
 *       transformRequestFunction: (request) => {
 *           request.userData.foo = 'bar';
 *           request.keepUrlFragment = true;
 *           return request;
 *       }
 *   }
 *   ```
 * @return {Promise<Array<QueueOperationInfo>>}
 *   Promise that resolves to an array of {@link QueueOperationInfo} objects.
 * @memberOf utils
 * @name enqueueLinks
 * @function
 */
async function enqueueLinks(options = {}) {
    const { page, $, limit, selector = 'a', requestQueue, baseUrl, pseudoUrls, userData, // TODO DEPRECATED 2019/06/27
    transformRequestFunction, } = options;
    if (userData) {
        utils_log_1.default.deprecated('options.userData of Apify.utils.enqueueLinks() is deprecated. Use options.transformRequestFunction instead.');
    }
    utils_1.checkParamOrThrow(page, 'page', 'Maybe Object');
    utils_1.checkParamOrThrow($, '$', 'Maybe Function');
    if (!page && !$) {
        throw new Error('One of the parameters "options.page" or "options.$" must be provided!');
    }
    if (page && $) {
        throw new Error('Only one of the parameters "options.page" or "options.$" must be provided!');
    }
    utils_1.checkParamOrThrow(limit, 'limit', 'Maybe Number');
    utils_1.checkParamOrThrow(selector, 'selector', 'String');
    utilities_1.checkParamPrototypeOrThrow(requestQueue, 'requestQueue', [request_queue_1.RequestQueue, request_queue_1.RequestQueueLocal], 'Apify.RequestQueue');
    utils_1.checkParamOrThrow(baseUrl, 'baseUrl', 'Maybe String');
    if (baseUrl && page)
        utils_log_1.default.warning('The parameter options.baseUrl can only be used when parsing a Cheerio object. It will be ignored.');
    utils_1.checkParamOrThrow(pseudoUrls, 'pseudoUrls', 'Maybe Array');
    utils_1.checkParamOrThrow(userData, 'userData', 'Maybe Object');
    utils_1.checkParamOrThrow(transformRequestFunction, 'transformRequestFunction', 'Maybe Function');
    // Construct pseudoUrls from input where necessary.
    const pseudoUrlInstances = shared_1.constructPseudoUrlInstances(pseudoUrls || []);
    const urls = page ? await extractUrlsFromPage(page, selector) : extractUrlsFromCheerio($, selector, baseUrl);
    let requestOptions = shared_1.createRequestOptions(urls, userData);
    if (transformRequestFunction) {
        requestOptions = requestOptions.map(transformRequestFunction).filter(r => !!r);
    }
    let requests = shared_1.createRequests(requestOptions, pseudoUrlInstances);
    if (limit)
        requests = requests.slice(0, limit);
    return shared_1.addRequestsToQueueInBatches(requests, requestQueue);
}
exports.enqueueLinks = enqueueLinks;
/**
 * Extracts URLs from a given Puppeteer Page.
 *
 * @param {Page} page
 * @param {string} selector
 * @return {Promise<Array<string>>}
 * @ignore
 */
async function extractUrlsFromPage(page, selector) {
    /* istanbul ignore next */
    return page.$$eval(selector, linkEls => linkEls.map(link => link.href).filter(href => !!href));
}
exports.extractUrlsFromPage = extractUrlsFromPage;
/**
 * Extracts URLs from a given Cheerio object.
 *
 * @param {CheerioStatic} $
 * @param {string} selector
 * @param {string} baseUrl
 * @return {string[]}
 * @ignore
 */
function extractUrlsFromCheerio($, selector, baseUrl) {
    return $(selector)
        .map((i, el) => $(el).attr('href'))
        .get()
        .filter(href => !!href)
        .map((href) => {
        // Throw a meaningful error when only a relative URL would be extracted instead of waiting for the Request to fail later.
        const isHrefAbsolute = /^[a-z][a-z0-9+.-]*:/.test(href); // Grabbed this in 'is-absolute-url' package.
        if (!isHrefAbsolute && !baseUrl) {
            throw new Error(`An extracted URL: ${href} is relative and options.baseUrl is not set. `
                + 'Use options.baseUrl in utils.enqueueLinks() to automatically resolve relative URLs.');
        }
        return baseUrl
            ? (new url_1.URL(href, baseUrl)).href
            : href;
    });
}
exports.extractUrlsFromCheerio = extractUrlsFromCheerio;
