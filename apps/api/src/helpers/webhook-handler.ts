import { isEmpty } from "lodash";

import Flow from "../models/flow";
import { processTrigger } from "../services/trigger";
import triggerQueue from "../queues/trigger";
import globalVariable from "./global-variable";
import QuotaExceededError from "../errors/quota-exceeded";
import {
    REMOVE_AFTER_30_DAYS_OR_150_JOBS,
    REMOVE_AFTER_7_DAYS_OR_50_JOBS,
} from './remove-job-configuration.js';
//@ts-ignore
export default async (flowId, request, response) => {
    const flow = await Flow.query().findById(flowId).throwIfNotFound();
    const user = await flow.$relatedQuery('user');
    //@ts-ignore
    const testRun = !flow.active;//@ts-ignore
    const quotaExceeded = !testRun && !(await user.isAllowedToRunFlows());
  
    if (quotaExceeded) {
      throw new QuotaExceededError();
    }
  
    const triggerStep = await flow.getTriggerStep();//@ts-ignore
    const app = await triggerStep.getApp();
    const isWebhookApp = app.key === 'webhook';
  
    if (testRun && !isWebhookApp) {
      return response.status(404);
    }
    //@ts-ignore
    const connection = await triggerStep.$relatedQuery('connection');
  
    const $ = await globalVariable({
      flow,
      connection,
      app,
      step: triggerStep,
      testRun,
      request,
    });
    //@ts-ignore
    const triggerCommand = await triggerStep.getTriggerCommand();
    await triggerCommand.run($);
  
    const reversedTriggerItems = $.triggerOutput.data.reverse();
  
    // This is the case when we filter out the incoming data
    // in the run method of the webhook trigger.
    // In this case, we don't want to process anything.
    if (isEmpty(reversedTriggerItems)) {
      return response.status(204);
    }
  
    for (const triggerItem of reversedTriggerItems) {
      if (testRun) {
        await processTrigger({
          flowId,//@ts-ignore
          stepId: triggerStep.id,
          triggerItem,
          testRun,
        });
  
        continue;
      }
      //@ts-ignore
      const jobName = `${triggerStep.id}-${triggerItem.meta.internalId}`;
  
      const jobOptions = {
        removeOnComplete: REMOVE_AFTER_7_DAYS_OR_50_JOBS,
        removeOnFail: REMOVE_AFTER_30_DAYS_OR_150_JOBS,
      };
  
      const jobPayload = {
        flowId,//@ts-ignore
        stepId: triggerStep.id,
        triggerItem,
      };
  
      await triggerQueue.add(jobName, jobPayload, jobOptions);
    }
  
    return response.status(204);
};