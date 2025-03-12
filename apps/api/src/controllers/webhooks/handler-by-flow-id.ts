import Flow from "../../models/flow";
import logger from "../../helpers/logger";
import handler from '../../helpers/webhook-handler'
//@ts-ignore
export default async (request, response) => {
    const computedRequestPayload = {
        headers: request.headers,
        body: request.body,
        query: request.query,
        params: request.params,
    };

    logger.debug(`Handling incoming webhook request at ${request.originalUrl}.`);
    logger.debug(JSON.stringify(computedRequestPayload, null, 2));

    const flowId = request.params.flowId;

    const flow = await Flow.query().findById(flowId).throwIfNotFound();
    const triggerStep = await flow.getTriggerStep();
    //@ts-ignore
    if (triggerStep.appKey !== 'webhook') {//@ts-ignore
        const connection = await triggerStep.$relatedQuery('connection');
        //@ts-ignore
        if (!(await connection.verifyWebhook(request))) {
            return response.sendStatus(401);
        }
    }

    await handler(flowId, request, response);

    response.sendStatus(204);
}