import express, { Router } from 'express';
import multer from 'multer';

import appConfig from '../config/app';
import webhookHandlerByFlowId from '../controllers/webhooks/handler-by-flow-id';
import webhookHandlerSyncByFlowId from '../controllers/webhooks/handler-sync-by-flow-id';
//@ts-ignore
const router:Router = Router();
const upload = multer();

router.use(upload.none());

router.use(
    express.text({
        limit: appConfig.requestBodySizeLimit,
        verify(req, res, buf){//@ts-ignore
            req.rawBody = buf;
        },
    })
);
//@ts-ignore
const exposeError = (handler) => async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (err) {
      next(err);
    }
};
//@ts-ignore
function createRouteHandler(path, handler) {
    const wrappedHandler = exposeError(handler);
  
    router
      .route(path)
      .get(wrappedHandler)
      .put(wrappedHandler)
      .patch(wrappedHandler)
      .post(wrappedHandler);
}

createRouteHandler('/flows/:flowId/sync', webhookHandlerSyncByFlowId);
createRouteHandler('/flows/:flowId', webhookHandlerByFlowId);
createRouteHandler('/:flowId', webhookHandlerByFlowId);

export default router;
