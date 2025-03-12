
import { Router } from "express";
import { healthRouter } from "./healthcheck";
import webhooksRouter from "./webhooks";

const router = Router();

router.use("/health", healthRouter);
router.use('/webhooks', webhooksRouter);

export const mainRouter:Router = router;

