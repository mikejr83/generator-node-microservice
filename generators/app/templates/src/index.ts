
import * as http from "http";
import * as normalizePort from "normalize-port";

import { createApp } from "./app";
import configuration from "./configuration";
import logger, { resetLogger } from "./logger";
import { IConfiguration } from "./models/configuration";

class ServerInstance {
    private server: http.Server;

    constructor(private configuration: IConfiguration) { }

    public setup() {
        const expressApp = createApp(configuration);

        this.server = http.createServer(expressApp);
        this.server.listen(configuration.port);

        this.server.on("error", this.onError.bind(this));
    }

    private onError(error: NodeJS.ErrnoException): void {
        if (error.syscall !== 'listen') throw error;
        let bind = (typeof this.configuration.port === 'string') ? 'Pipe ' + this.configuration.port : 'Port ' + this.configuration.port;
        switch (error.code) {
            case 'EACCES':
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }
}

async function main() {
    await configuration.load("express-config.json");
    resetLogger(configuration);

    logger.silly("Logger configured!");

    const instance = new ServerInstance(configuration);
    instance.setup();
}

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.error('unhandledRejection', error.message);
});

main().catch((err) => {
  console.error("There was an issue with bootstrapping the server!", err);  
});

