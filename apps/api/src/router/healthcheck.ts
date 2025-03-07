import { Router } from "express";
import indexAction from '../controllers/healthcheck/index'
const router:Router = Router();

router.get('/',indexAction);

export const healthRouter:Router = router;