"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeserialize = exports.deserializeArray = exports.serializeArray = void 0;
const utils_1 = require("apify-client/build/utils");
const stream = require("stream"); // eslint-disable-line import/no-duplicates
const StreamArray = require("stream-json/streamers/StreamArray");
const util = require("util");
const zlib = require("zlib");
// eslint-enable-line import/no-duplicates
const pipeline = util.promisify(stream.pipeline);
/**
 * Transforms an array of items to a JSON in a streaming
 * fashion to save memory. It operates in batches to speed
 * up the process.
 * @ignore
 */
class ArrayToJson extends stream.Readable {
    constructor(data, options = {}) {
        super(options);
        const { batchSize = 10000, } = options;
        this.offset = 0;
        this.batchSize = batchSize;
        this.data = data;
        this.push('[');
    }
    _read() {
        try {
            const items = this.data.slice(this.offset, this.offset + this.batchSize);
            if (items.length) {
                const json = JSON.stringify(items);
                // Strip brackets to flatten the batch.
                const itemString = json.substring(1, json.length - 1);
                if (this.offset > 0)
                    this.push(',', 'utf8');
                this.push(itemString, 'utf8');
                this.offset += this.batchSize;
            }
            else {
                this.push(']');
                this.push(null);
                this.destroy();
            }
        }
        catch (err) {
            this.destroy(err);
        }
    }
}
/**
 * Uses Gzip compression to take an array of values, which can be anything
 * from entries in a Dataset to Requests in a RequestList and compresses
 * them to a Buffer in a memory-efficient way (streaming one by one). Ideally,
 * the largest chunk of memory consumed will be the final compressed Buffer.
 * This could be further improved by outputting a Stream, if and when
 * apify-client supports streams.
 *
 * @param {Array} data
 * @returns {Promise<Buffer>}
 * @ignore
 */
exports.serializeArray = async (data) => {
    utils_1.checkParamOrThrow(data, 'data', 'Array');
    const { chunks, collector } = createChunkCollector();
    await pipeline(new ArrayToJson(data), zlib.createGzip(), collector);
    return Buffer.concat(chunks);
};
/**
 * Decompresses a Buffer previously created with compressData (technically,
 * any JSON that is an Array) and collects it into an Array of values
 * in a memory-efficient way (streaming the array items one by one instead
 * of creating a fully decompressed buffer -> full JSON -> full Array all
 * in memory at once. Could be further optimized to ingest a Stream if and
 * when apify-client supports streams.
 *
 * @param {Buffer} compressedData
 * @returns {Promise<Array>}
 * @ignore
 */
exports.deserializeArray = async (compressedData) => {
    utils_1.checkParamOrThrow(compressedData, 'compressedData', 'Buffer');
    const { chunks, collector } = createChunkCollector({ fromValuesStream: true });
    await pipeline(stream.Readable.from([compressedData]), zlib.createGunzip(), StreamArray.withParser(), collector);
    return chunks;
};
/**
 * Creates a stream that decompresses a Buffer previously created with
 * compressData (technically, any JSON that is an Array) and collects it
 * into an Array of values in a memory-efficient way (streaming the array
 * items one by one instead of creating a fully decompressed buffer
 * -> full JSON -> full Array all in memory at once. Could be further
 * optimized to ingest a Stream if and when apify-client supports streams.
 * @param compressedData
 * @returns {Readable}
 * @ignore
 */
exports.createDeserialize = (compressedData) => {
    utils_1.checkParamOrThrow(compressedData, 'compressedData', 'Buffer');
    const streamArray = StreamArray.withParser();
    const destination = pluckValue(streamArray);
    stream.pipeline(stream.Readable.from([compressedData]), zlib.createGunzip(), destination, err => destination.emit(err));
    return destination;
};
/**
 * @return {{chunks: Array<string|Buffer>, collector: module:stream.internal.Writable}}
 */
function createChunkCollector(options = {}) {
    const { fromValuesStream = false } = options;
    const chunks = [];
    const collector = new stream.Writable({
        decodeStrings: false,
        objectMode: fromValuesStream,
        write(chunk, nil, callback) {
            chunks.push(fromValuesStream ? chunk.value : chunk);
            callback();
        },
        writev(chunkObjects, callback) {
            const buffers = chunkObjects.map(({ chunk }) => {
                return fromValuesStream ? chunk.value : chunk;
            });
            chunkObjects.push(...buffers);
            callback();
        },
    });
    return { collector, chunks };
}
function pluckValue(streamArray) {
    const realPush = streamArray.push.bind(streamArray);
    streamArray.push = obj => realPush(obj && obj.value);
    return streamArray;
}
