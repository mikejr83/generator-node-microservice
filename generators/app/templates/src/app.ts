import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as session from "express-session";
import * as jwt from "jwt-express";
import * as morgan from "morgan";
import * as path from "path";
import * as url from "url";
import * as uuid from "uuid";

import { configureOidc, corsHandler } from "./middleware";
import {
    mockApiRouter
} from "./routers";
import { IConfiguration } from "./models/configuration";

/**
 * Represents the running application.
 * 
 * Note, this isn't the server instasnce, but an instance of ExpressJS.
 * 
 * @class App
 */
class App {
    /**
     * The ExpressJS Application instance.
     * 
     * @type {express.Application}
     * @memberof App
     */
    public express: express.Application;

    constructor(private configuration: IConfiguration) {
        this.express = express();

        // Configure basic ExpressJS values
        this.configureExpress();
        // Configure the middleware for the instance
        this.middleware();
        // Setup the routing
        this.routes();

        // Configure an error handler.
        this.express.use(this.errorHandler.bind(this));
    }

    private configureExpress(): void {
        this.express.set("port", this.configuration.port);
    }

    /**
     * Configure the middleware for the ExpressJS application.
     * 
     * @private
     * @memberof App
     */
    private middleware(): void {
        // remember that the middleware is processed in order

        // place the logger/morgan first
        this.express.use(morgan("tiny"));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(cookieParser());
        this.express.use(session({
            genid: uuid,
            name: 'polaris-session',
            secret: process.env.SESSION_SECRET || 'identity-oidc-expressjs-secret',
            resave: false,
            saveUninitialized: true
        }));
        this.express.use(jwt.init("Secret", {
            cookie: "polaris-jwt-session",
            cookieOptions: {
                httpOnly: false
            }
        }));
        this.express.use(corsHandler);

        // Configure the oidc handling.
        configureOidc(this.express);
    }

    /**
     * Setup the application routing
     * 
     * @private
     * @memberof App
     */
    private routes(): void {
        // Serve the content for the application.
        // THIS SHOULD BE CHANGED FOR DEV!
        this.express.use("/", express.static(path.join(__dirname, "../../ui/dist")));
        
        // Health check endpoint
        this.express.use("/status", (req: express.Request, res: express.Response) => {
            res.setHeader("Cache-Control", "no-cache");
            res.send("OK")
        });

        // Setup the mock api route. This shouldn't be loaded in production!
        this.express.use("/api", mockApiRouter);
    }

    /**
     * Handles errors within ExpressJS
     * 
     * @private
     * @param {*} err 
     * @param {express.Request} req 
     * @param {express.Response} res 
     * @param {express.NextFunction} next 
     * @memberof App
     */
    private errorHandler(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
    }
}

let app: App;

/**
 * Create an instance of the application.
 * 
 * The instance represents a fully configured ExpressJS application.
 * 
 * @export
 * @param {IConfiguration} configuration 
 * @returns {express.Application} 
 */
export function createApp(configuration: IConfiguration): express.Application {
    app = new App(configuration);

    return app.express;
}

export default app;

