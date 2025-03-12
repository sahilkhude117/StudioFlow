
import { Router } from "express";
import { healthRouter } from "./healthcheck";
import webhooksRouter from "./webhooks";
import paddleRouter from './paddle.ee.js';

const router = Router();

router.use("/health", healthRouter);
router.use('/webhooks', webhooksRouter);
router.use('/paddle', paddleRouter);

export const mainRouter:Router = router;

