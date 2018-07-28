import * as moment from 'moment';

import { IError } from './error';
import { LogLevel } from './levels';

/**
 * Structured log message.
 *
 * @export
 * @interface ILogMessage
 */
export interface ILogMessage {
    /**
     * Additional data to capture for the log message.
     *
     * @type {{ [key: string]: any }}
     * @memberof ILogMessage
     */
    data?: { [key: string]: any };
    /**
     * The level of the log message.
     *
     * @type {LogLevel}
     * @memberof ILogMessage
     */
    level: LogLevel;
    /**
     * Textual log message
     *
     * @type {string}
     * @memberof ILogMessage
     */
    message: string;
    /**
     * When the message was created. This should be set when the message is created by the system.
     *
     * Note, this is not when the message was recorded.
     *
     * @type {Date}
     * @memberof ILogMessage
     */
    timestamp: Date;

    error?: IError;
}

/**
 * Log message
 *
 * @export
 * @class LogMessage
 * @implements {ILogMessage}
 */
export class LogMessage implements ILogMessage {
    /**
     * Additional data to capture for the log message.
     *
     * @type {{ [key: string]: any }}
     * @memberof ILogMessage
     */
    public data?: { [key: string]: any };
    /**
     * The level of the log message.
     *
     * @type {LogLevel}
     * @memberof ILogMessage
     */
    public level: LogLevel;
    /**
     * Textual log message
     *
     * @type {string}
     * @memberof ILogMessage
     */
    public message: string;
    /**
     * When the message was created. This should be set when the message is created by the system.
     *
     * Note, this is not when the message was recorded.
     *
     * @type {Date}
     * @memberof ILogMessage
     */
    public timestamp: Date;
    /**
     * Error which generated this message.
     *
     * @type {IError}
     * @memberof LogMessage
     */
    public error?: IError;

    /**
     * Creates an instance of LogMessage.
     * @param {LogLevel} level
     * @param {string} message
     * @memberof LogMessage
     */
    constructor(level: LogLevel, message: string);
    constructor(level: LogLevel, message: string, error?: Error) {
        this.level = level;
        this.message = message;
        this.timestamp = moment().utc().toDate();

        if (error !== undefined) {
            this.addError(error);
        }
    }

    /**
     * Add error information to this log message.
     *
     * @param {Error} error
     * @memberof LogMessage
     */
    public addError(error: Error): void {
        this.error = {
            message: error.message,
            name: error.name,
            stackTrace: error.stack
        };
    }
}
