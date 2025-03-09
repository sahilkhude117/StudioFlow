import Flow from "../models/flow";
import globalVariable from "../helpers/global-variable";
import EarlyExitError from "../errors/early-exit";
import AlreadyProcessedError from "../errors/already-processed";
import HttpError from "../errors/http";
import logger from "../helpers/logger";

export const processFlow = async (options:any) => {
    const { testRun, flowId } = options;
    const flow = await Flow.query().findById(flowId).throwIfNotFound();
    //@ts-ignore
    const triggerStep = await flow.getTriggerStep();
    const triggerCommand = await triggerStep.getTriggerCommand();

    const $ = await globalVariable({
        flow,
        connection: await triggerStep.$relatedQuery('connection'),
        app: await triggerStep.getApp(),
        step: triggerStep,
        testRun,
    });

    try {
        //@ts-ignore
        if  (triggerCommand.type === 'webhook' && !flow.active) {
            await triggerCommand.testRun($);
        } else {
            await triggerCommand.run($);
        }
    } catch (error) {
        const shouldEarlyExit = error instanceof EarlyExitError;
        const shouldNotProcess = error instanceof AlreadyProcessedError;
        const shouldNotConsiderAsError = shouldEarlyExit || shouldNotProcess;

        if (!shouldNotConsiderAsError) {
            if (error instanceof HttpError) {
                //@ts-ignore
                $.triggerOutput.error = error.details;
            } else {
                try {
                    //@ts-ignore
                    $.triggerOutput.error = JSON.parse(error.message);
                } catch {
                    //@ts-ignore
                    $.triggerOutput.error = { error: error.message };
                }
            }

            logger.error(error);
        }
    }

    return $.triggerOutput;
}