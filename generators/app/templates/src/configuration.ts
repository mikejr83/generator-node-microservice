import * as fs from "fs-extra";
import * as normalizePort from "normalize-port";

import { IConfiguration, defaultConfiguration } from "./models/configuration";
import { LogLevel } from "./models/logging";


export class Configuration implements IConfiguration {
    logLevel: LogLevel;
    port: any;
    publicPaths: string[];

    constructor() {
        this.load();
    }

    public async load(configFilename?: string) {
        // do default assignment
        Object.assign(this, defaultConfiguration);

        if (configFilename !== undefined) {
            this.loadFromFile(configFilename);
        }

        this.envConfigFromEnv();
    }

    private async loadFromFile(filename: string) {
        const fileExists = await new Promise<boolean>((resolve, reject) => {
            fs.exists(filename, (exists) => {
                resolve(exists);
            });
        })

        if (fileExists) {
            const fileConfig: IConfiguration = await fs.readJson(filename);

            Object.assign(this, fileConfig);
        }
    }

    private envConfigFromEnv() {
        this.logLevel = process.env.LOG_LEVEL as LogLevel || this.logLevel;
        this.port = normalizePort(process.env.PORT || 4200);
    }
}


export default new Configuration();