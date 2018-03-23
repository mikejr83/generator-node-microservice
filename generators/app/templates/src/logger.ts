import * as winston from "winston";
import { Logger } from "winston";

import { IConfiguration } from "./models/configuration";
import { LogLevel } from "./models/logging";

let theLogger = new Logger({
    transports: [
        new (winston.transports.Console)()
    ],
    level: process.env.LOG_LEVEL || LogLevel.silly
});

function buildLogger(logLevel: LogLevel): winston.LoggerInstance {
    return new Logger({
        transports: [
            new (winston.transports.Console)()
        ],
        level: logLevel
    });
}

export function resetLogger(configuration: IConfiguration) {
    theLogger = buildLogger(configuration.logLevel);
    theLogger.silly("Logger reset");
}

export default theLogger;



