
import * as http from "http";
import * as normalizePort from "normalize-port";
import * as process from "process";

import { createApp } from "./app";
import defaultConfiguration from "./configuration";
import logger, { resetLogger } from "./logger";
import { IServiceConfiguration } from "./models";

class ServerInstance {
    private server: http.Server;

    constructor(private configuration: IServiceConfiguration) { }

    public setup() {
        const expressApp = createApp(this.configuration);

        this.server = http.createServer(expressApp);
        this.server.listen(this.configuration.port);

        this.server.on("error", this.onError.bind(this));
    }

    private onError(error: NodeJS.ErrnoException): void {
        if (error.syscall !== "listen") { throw error; }
        const bind = (typeof this.configuration.port === "string") ? "Pipe " + this.configuration.port : "Port " + this.configuration.port;
        switch (error.code) {
            case "EACCES":
                console.error(`${bind} requires elevated privileges`); // tslint:disable-line
                process.exit(1);
                break;
            case "EADDRINUSE":
                console.error(`${bind} is already in use`); // tslint:disable-line
                process.exit(1);
                break;
            default:
                throw error;
        }
    }
}

async function main() {
    await defaultConfiguration.load("express-config.json");
    resetLogger(defaultConfiguration);

    logger.silly("Logger configured!");

    const instance = new ServerInstance(defaultConfiguration);
    instance.setup();
}

process.on("unhandledRejection", (error) => {
    // Will print "unhandledRejection err is not defined"
    console.error("unhandledRejection", error.message); // tslint:disable-line
});

main().catch((err) => {
    console.error("There was an issue with bootstrapping the server!", err); // tslint:disable-line
});
