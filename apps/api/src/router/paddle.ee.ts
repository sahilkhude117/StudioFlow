import { Router } from "express";
import webhooksHandler from "../controllers/paddle/webhooks.ee";

const router:Router = Router();

router.post('/webhooks', webhooksHandler);

export default router;