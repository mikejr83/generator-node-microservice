import * as statusRoute from "./status";

export const routes = {
    status: {
        prefix: "/",
        router: statusRoute.router
    }
}
