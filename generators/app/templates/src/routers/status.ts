import * as express from "express";

import logger from "../logger";

export const router = express.Router();

router.use("/status", (req: express.Request, res: express.Response) => {
    res.setHeader("Cache-Control", "no-cache");
    res.send("OK");
});
