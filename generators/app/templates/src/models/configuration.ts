import { LogLevel } from "./logging";

export interface IConfiguration {
    logLevel: LogLevel
    port: any;
    publicPaths: string[]
}

export const defaultConfiguration: IConfiguration = {
    logLevel: process.env.LOG_LEVEL as LogLevel || LogLevel.silly,
    port: 4200,
    publicPaths: [
        "/callback.html",
        "/login",
        "/status"
    ]
};