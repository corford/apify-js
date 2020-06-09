"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("apify-client/build/utils");
const utils_log_1 = require("../utils_log");
class Job {
    constructor() {
        this.lastRunAt = null;
        this.runs = 0;
    }
    run() {
        this.lastRunAt = new Date();
        return ++this.runs;
    }
    finish() {
        this.durationMillis = new Date() - this.lastRunAt;
        return this.durationMillis;
    }
    retryCount() {
        return Math.max(0, this.runs - 1);
    }
}
/**
 * The statistics class provides an interface to collecting and logging run
 * statistics of arbitrary jobs. Currently it provides the following information:
 *
 *  - Average run time of successful jobs
 *  - Number of successful jobs per minute
 *  - Total number of successful jobs
 *  - Total number of failed jobs
 *  - A histogram of retry counts = Number of jobs that finished after N retries.
 *
 * @ignore
 */
class Statistics {
    constructor(options = {}) {
        const { logIntervalSecs = 60, logMessage = 'Statistics', } = options;
        utils_1.checkParamOrThrow(logIntervalSecs, 'options.logIntervalSecs', 'Number');
        utils_1.checkParamOrThrow(logMessage, 'options.logMessage', 'String');
        this.logIntervalMillis = logIntervalSecs * 1000;
        this.logMessage = logMessage;
        this.jobRetryHistogram = [];
        this.finishedJobs = 0;
        this.failedJobs = 0;
        this.jobsInProgress = new Map();
        this.minJobDurationMillis = Infinity;
        this.maxJobDurationMillis = 0;
        this.totalJobDurationMillis = 0;
        this.startedAt = null;
        this.logInterval = null;
    }
    startJob(id) {
        if (!this.startedAt)
            this.startedAt = new Date();
        let job = this.jobsInProgress.get(id);
        if (!job)
            job = new Job();
        job.run();
        this.jobsInProgress.set(id, job);
    }
    finishJob(id) {
        const job = this.jobsInProgress.get(id);
        if (!job)
            return;
        const jobDurationMillis = job.finish();
        this.finishedJobs++;
        this.totalJobDurationMillis += jobDurationMillis;
        this._saveRetryCountForJob(job);
        if (jobDurationMillis < this.minJobDurationMillis)
            this.minJobDurationMillis = jobDurationMillis;
        if (jobDurationMillis > this.maxJobDurationMillis)
            this.maxJobDurationMillis = jobDurationMillis;
        this.jobsInProgress.delete(id);
    }
    failJob(id) {
        const job = this.jobsInProgress.get(id);
        if (!job)
            return;
        this.failedJobs++;
        this._saveRetryCountForJob(job);
        this.jobsInProgress.delete(id);
    }
    getCurrent() {
        const totalMillis = new Date() - this.startedAt;
        const totalMinutes = totalMillis / 1000 / 60;
        return {
            avgDurationMillis: Math.round(this.totalJobDurationMillis / this.finishedJobs) || Infinity,
            perMinute: Math.round(this.finishedJobs / totalMinutes),
            finished: this.finishedJobs,
            failed: this.failedJobs,
            retryHistogram: [...this.jobRetryHistogram],
        };
    }
    startLogging() {
        this.logInterval = setInterval(() => {
            utils_log_1.default.info(this.logMessage, this.getCurrent());
        }, this.logIntervalMillis);
    }
    stopLogging() {
        clearInterval(this.logInterval);
    }
    _saveRetryCountForJob(job) {
        const retryCount = job.retryCount();
        this.jobRetryHistogram[retryCount] = this.jobRetryHistogram[retryCount]
            ? this.jobRetryHistogram[retryCount] + 1
            : 1;
    }
}
exports.default = Statistics;
