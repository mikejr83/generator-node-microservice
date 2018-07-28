import * as process from "process";
import * as winston from "winston";
import { Logger } from "winston";

import { IServiceConfiguration, LogLevel } from "./models";

let theLogger = new Logger({
    level: process.env.LOG_LEVEL || LogLevel.silly,
    transports: [
        new (winston.transports.Console)()
    ],
});

function buildLogger(logLevel: LogLevel): winston.LoggerInstance {
    return new Logger({
        level: logLevel,
        transports: [
            new (winston.transports.Console)()
        ],
    });
}

export function resetLogger(configuration: IServiceConfiguration) {
    theLogger = buildLogger(configuration.logLevel);
    theLogger.silly("Logger reset");
}

export default theLogger;
