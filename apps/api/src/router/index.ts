
import { Router } from "express";
import { healthRouter } from "./healthcheck";

const router = Router();

router.use("/health", healthRouter);

export const mainRouter:Router = router;

