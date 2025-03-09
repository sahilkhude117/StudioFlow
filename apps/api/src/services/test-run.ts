import Step from "../models/step";
import { processTrigger } from "./trigger";
import { processFlow } from "./flow";
import { processAction } from "./action";

const testRun = async (options:any) => {
    const untilStep = await Step.query()
        .findById(options.stepId)
        .throwIfNotFound();

    const flow = await untilStep.$relatedQuery('flow');
    //@ts-ignore
    const [triggerStep, ...actionSteps] = await flow.$relatedQuery('steps').withGraphFetched('connection').orderBy('position', 'asc');

    //@ts-ignore
    const { data, error: triggerError } = await processFlow({
        //@ts-ignore
        flowId: flow.id,
        testRun: true,
    })

    if (triggerError) {
        const { executionStep: triggerExecutionStepWithError } = 
            await processTrigger({
                //@ts-ignore
                flowId: flow.id,
                stepId: triggerStep.id,
                error: triggerError,
                testRun: true,
            });
        
        return { executionStep: triggerExecutionStepWithError };
    }

    const firstTriggerItem = data[0];

    const { executionId, executionStep: triggerExecutionStep } =
        await processTrigger({
            //@ts-ignore
            flowId: flow.id,
            stepId: triggerStep.id,
            triggerItem: firstTriggerItem,
            testRun: true,
        });
    //@ts-ignore
    if (triggerStep.id === untilStep.id) {
        return { executionStep: triggerExecutionStep };
    }

    for (const actionStep of actionSteps) {
        const { executionStep: actionExecutionStep } = await processAction({
            //@ts-ignore
            flowId: flow.id,
            stepId: actionStep.id,
            executionId,
        });
        
        //@ts-ignore
        if (actionStep.id === untilStep.id || actionExecutionStep.isFailed) {
            return { executionStep: actionExecutionStep };
        }
    }
};

export default testRun;
