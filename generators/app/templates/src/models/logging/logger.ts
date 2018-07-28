import * as moment from 'moment';

import { LogLevel } from './levels';
import { ILogMessage, LogMessage } from './message';

function noop() { } // tslint:disable-line

/**
 * Provides the blueprint for any logging service
 *
 * @export
 * @abstract
 * @class Logger
 */
export abstract class Logger { // tslint:disable-line
    protected logLevel: LogLevel = LogLevel.silly;

    constructor(logLevel: LogLevel) {
        // define the base constructor for any logger.
        this.logLevel = logLevel;
    }

    /**
     * Log a message at the 'silly' level.
     *
     * @abstract
     * @param {*} [message]
     * @param {...any[]} optionalParams
     * @returns {Promise<void>}
     * @memberof Logger
     */
    public abstract async silly(message?: any, ...optionalParams: any[]): Promise<void>;
    /**
     * Log a message at the 'debug' level.
     *
     * @abstract
     * @param {*} [message]
     * @param {...any[]} optionalParams
     * @returns {Promise<void>}
     * @memberof Logger
     */
    public abstract async debug(message?: any, ...optionalParams: any[]): Promise<void>;
    /**
     * Log an informational message.
     *
     * @type {*}
     * @memberof Logger
     */
    public abstract async info(message?: any, ...optionalParams: any[]): Promise<void>;
    /**
     * Log a warning.
     *
     * @type {*}
     * @memberof Logger
     */
    public abstract async warn(message?: any, ...optionalParams: any[]): Promise<void>;
    /**
     * Log an error!
     *
     * @type {*}
     * @memberof Logger
     */
    public abstract async error(message?: any, ...optionalParams: any[]): Promise<void>;

    protected findLevel(): number {
        switch (this.logLevel) {
            case LogLevel.debug:
                return 1;
            case LogLevel.error:
                return 4;
            case LogLevel.info:
                return 2;
            case LogLevel.silly:
                return 0;
            case LogLevel.warn:
                return 3;
            default:
                return 1;
        }
    }

    /**
     * Buids a standarized log message.
     *
     * @protected
     * @param {LogLevels} level
     * @param {*} [message]
     * @param {...any[]} optionalParams
     * @returns {ILogMessage}
     * @memberof Logger
     */
    protected buildMessage(level: LogLevel, message?: any, ...optionalParams: any[]): ILogMessage {
        const logMessage: LogMessage = new LogMessage(level, message);

        if (optionalParams && optionalParams.length >= 1) {
            let dataParams;
            if (optionalParams[0] instanceof Error) {
                logMessage.addError(optionalParams[0] as Error);

                if (optionalParams.length > 1) {
                    dataParams = optionalParams.slice(1);
                }
            } else {
                dataParams = optionalParams;
            }

            if (dataParams !== undefined) {
                if (logMessage.data === undefined) {
                    logMessage.data = {};
                }

                logMessage.data.parameters = dataParams;
            }
        }

        return logMessage;
    }
}
