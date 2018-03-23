import * as crypto from "crypto";
import { Application, NextFunction, Request, Response } from "express";
import * as _ from "lodash";
import { Client, Issuer } from "openid-client";
import * as url from "url";

import configuration from "../configuration";
import logger from "../logger";
import { ISession, IUserInfo } from "../session";

const CLIENTS: { [sessionId: string]: Client } = {};
const TOKENS: { [sessionId: string]: any } = {};

function openidHandler(req: Request, res: Response, next: NextFunction) {
    logger.debug("Starting OIDC middleware...");

    const reqUrl = url.format({
        protocol: req.protocol,
        host: req.get('host'),
        pathname: req.originalUrl
    });

    const session: ISession = req.session;

    if (!session) {
        logger.warn("No session?!");
    }

    if ((req.originalUrl === "/callback.html" && session.oidc) || _.indexOf(configuration.publicPaths, req.originalUrl) >= 0 || session.userInfo ) {
        if (req.originalUrl === "/callback.html" && session.oidc) { logger.silly("Request is destined for auth callback..."); }
        else if (req.originalUrl === "/login") { logger.silly("Request is destined for login..."); }
        else if (session.userInfo) { logger.silly("User is logged in!"); }
    } else {
        res.redirect(302, "/login");
    }

    next();
}

function loginHandler(req: Request, res: Response, next: NextFunction) {
    const session: ISession = req.session;

    if (!session) {
        logger.warn("No session?!");
    }

    logger.silly("Discovering the issuer...");
    Issuer.discover("https://polaris-auth-token-server.dev.aws.greenwayhealth.com").then((issuer) => {
        logger.silly("Got an issuer. Creating the client!")
        const client = new issuer.Client({
            client_id: 'polaris'
        });

        CLIENTS[session.id] = client;

        session.oidc = {
            nonce: crypto.randomBytes(16).toString('hex'),
            state: crypto.randomBytes(16).toString('hex')
        }

        logger.debug("OIDC - State: " + session.oidc.state);
        logger.debug("OIDC - nonce: " + session.oidc.nonce)

        const cbUrl = url.format({
            protocol: req.protocol,
            host: req.get('host'),
            pathname: "/callback.html"
        });

        const authParams = {
            redirect_uri: cbUrl,
            response_type: "id_token token",
            response_mode: "form_post",
            scope: "openid polaris_id polaris_api",
            state: session.oidc.state,
            nonce: session.oidc.nonce
        };

        logger.silly("authParams to build authorization url:", authParams);

        const authz = client.authorizationUrl(authParams);

        logger.debug("oidc authorization url:", authz);

        res.redirect(authz);

        next();
    });
}

function callbackHandler(req: Request, res: Response, next: NextFunction) {
    logger.silly("Handling callback request...");

    const session: ISession = req.session;

    if (!session) {
        logger.warn("No session?!");
    }

    const state = session.oidc.state;
    const nonce = session.oidc.nonce;

    delete session.oidc;

    logger.debug("OIDC - State: " + state);
    logger.debug("OIDC - nonce: " + nonce);

    const client = CLIENTS[session.id];

    if (!client) {
        logger.warn("There was no client for the callback to handle!!!", session.id);
    }

    const params = client.callbackParams(req);

    logger.silly("Callback params:", params);

    const cbUrl = url.format({
        protocol: req.protocol,
        host: req.hostname,
        pathname: "/callback.html"
    });

    var reqObj = url.parse(req.originalUrl);
    reqObj.protocol = req.protocol;
    reqObj.host = req.hostname;


    client.authorizationCallback(reqObj.toString(), params, { state, nonce }).then((tokens) => {
        logger.silly("authorizationCallback completed!", tokens);
        TOKENS[req.session.id] = tokens;

        // const context = {
        //     tokens,
        //     userinfo: undefined,
        //     id_token: tokens.id_token ? tokens.claims : undefined,
        //     session: session,
        //     introspections: {},
        //     //issuer,
        // };

        const promises = [];

        // TODO: figure out introspection

        // for (let key in tokens) {
        //     const value = tokens[key];
        //     if (key.endsWith('token') && key !== 'id_token') {
        //         logger.debug("Introspect", value, key);
        //         const p = client.introspect(value, key)
        //             .then((result) => {
        //                 context.introspections[key] = result;
        //             })
        //             .catch((err) => {
        //                 logger.error("Error during introspect", err);
        //             });
        //         promises.push(p);
        //     }
        // }

        if (tokens.access_token) {
            logger.silly("tokens, access_token...", tokens.access_token);

            const p = client.userinfo(tokens)
                .then(userinfo => client.fetchDistributedClaims(userinfo))
                .then(userinfo => client.unpackAggregatedClaims(userinfo))
                .then((result) => {
                    logger.debug("User info:", result);
                    session.userInfo = result as IUserInfo;
                })
                .catch((err) => {
                    logger.error("Error during user stuff", err);
                    res.sendStatus(500);
                });
            promises.push(p);
        }

        Promise.all(promises).then((results) => {
            const jwtPayload: any = {
                ...session.userInfo,
            };
            jwtPayload.access_token = tokens.access_token;
            delete jwtPayload.legacy_password;
            (res as any).jwt(jwtPayload);
            next();
            res.redirect(302, "/");
        });
    }).catch((err) => {
        logger.error("Error in authorizationCallback", err);
        res.sendStatus(500);
        next();
    });
}

export function configureOidc(app: Application) {
    app.use(openidHandler);

    app.get("/login", loginHandler);

    app.get("/callback.html", callbackHandler);
    app.post("/callback.html", callbackHandler);
}