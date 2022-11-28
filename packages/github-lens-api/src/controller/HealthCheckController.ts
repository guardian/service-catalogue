import type {Router} from "express";
import type express from "express";

export const getHealthCheckHandler = (router: Router) => {
    return (req: express.Request, res: express.Response) => {
        res.status(200).json({ status: 'OK', stage: 'INFRA' });
    };
};
