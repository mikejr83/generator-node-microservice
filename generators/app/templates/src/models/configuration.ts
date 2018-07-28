import * as process from "process";

import { LogLevel } from './logging';


export interface IConfiguration {
    logLevel: LogLevel;
}


export interface IServiceConfiguration extends IConfiguration {
    logLevel: LogLevel;
    port: any;
    publicPaths: string[];
}

export const defaultConfiguration: IServiceConfiguration = {
    logLevel: process.env.LOG_LEVEL as LogLevel || LogLevel.silly,
    port: 3000,
    publicPaths: [
        "/callback.html",
        "/login",
        "/status"
    ]
};
