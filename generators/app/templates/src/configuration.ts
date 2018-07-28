import * as fs from "fs-extra";
import * as normalizePort from "normalize-port";
import * as process from "process";

import { defaultConfiguration, LogLevel, IServiceConfiguration } from "./models";

export class Configuration implements IServiceConfiguration {
    public logLevel: LogLevel;
    public port: any;
    public publicPaths: string[];

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
        });

        if (fileExists) {
            const fileConfig: IServiceConfiguration = await fs.readJson(filename);

            Object.assign(this, fileConfig);
        }
    }

    private envConfigFromEnv() {
        this.logLevel = process.env.LOG_LEVEL as LogLevel || this.logLevel;
        this.port = normalizePort(process.env.PORT || 4200);
    }
}

export default new Configuration();
