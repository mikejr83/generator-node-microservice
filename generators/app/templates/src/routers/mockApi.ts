import * as express from "express";
import * as proxy from "http-proxy-middleware";
import * as url from "url";

import logger from "../logger";

const router = express.Router();

router.use("/local/administration", proxy({ target: "http://localhost:15289" }));
router.use("/local", proxy({ target: "http://localhost:1405" }));
router.use("/polaris", proxy({ target: "https://dev.aws.greenwayhealth.com:443", protocolRewrite: "https", changeOrigin: true }));
router.use("/api", proxy({ target: "http://localhost:3071" }));

export const mockApiRouter = router;
