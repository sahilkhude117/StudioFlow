import Step from "../models/step";
import Flow from "../models/flow";
import Execution from "../models/execution";
import ExecutionStep from "../models/execution-step";
import computeParameters from "../helpers/compute-parameters";
import globalVariable from "../helpers/global-variable";
import logger from "../helpers/logger";
import HttpError from "../errors/http";
import EarlyExitError from "../errors/early-exit";
import AlreadyProcessedError from "../errors/already-processed";

export const processAction = async (options:any) => {
    const { flowId, stepId, executionId } = options;

    const flow = await Flow.query().findById(flowId).throwIfNotFound();
    const execution = await Execution.query()
        .findById(executionId)
        .throwIfNotFound();

    const step = await Step.query().findById(stepId).throwIfNotFound();

    const $ = await globalVariable({
        flow,
        //@ts-ignore
        app: await step.getApp(),
        step: step,
        connection: await step.$relatedQuery('connection'),
        execution,
    });

    const priorExecutionSteps = await ExecutionStep.query().where({
        execution_id: $.execution.id,
    });
    //@ts-ignore
    const stepSetupAndDynamicFields = await step.getSetupAndDynamicFields();

    const computedParameters = computeParameters(
        $.step.parameters,
        stepSetupAndDynamicFields,
        priorExecutionSteps
    );
    //@ts-ignore
    const actionCommand = await step.getActionCommand();

    $.step.parameters = computeParameters;

    try {
        await actionCommand.run($);
    } catch (error) {
        const shouldEarlyExit = error instanceof EarlyExitError;
        const shouldNotProcess = error instanceof AlreadyProcessedError;
        const shouldNotConsiderAsError = shouldEarlyExit || shouldNotProcess;

        if (!shouldNotConsiderAsError) {
            if (error instanceof HttpError) {
                //@ts-ignore
                $.actionOutput.error = error.details;
            } else {
                try {
                    //@ts-ignore
                    $.actionOutput.error = JSON.parse(error.message);
                } catch {
                    //@ts-ignore
                    $.actionOutput.error = { error: error.message };
                }
            }

            logger.error(error);
        }
    }

    const executionStep = await execution
        .$relatedQuery('executionSteps')
        .insertAndFetch({
            stepId: $.step.id,
            //@ts-ignore
            status: $.actionOutput.error ? 'failure' : 'success',
            dataIn: computeParameters,
            //@ts-ignore
            dataOut: $.actionOutput.error ? null : $.actionOutput.data?.raw,
            //@ts-ignore
            errorDetails: $.actionOutput.error ? $.actionOutput.error : null,
        });

    return { flowId, stepId, executionId, executionStep, computedParameters }
}