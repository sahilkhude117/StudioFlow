import { ActionType, isNil, LoopStepOutput, StepOutput, StepOutputStatus } from "../../../../shared/src";

export const flowRunUtils = {
    findFailedStepInOutput,
}

function findFailedStepInOutput(
    steps: Record<string, StepOutput>,
): string | null {
    return Object.entries(steps).reduce((res, [stepName, step]) => {
        if (step.status === StepOutputStatus.FAILED) {
            return stepName;
        }
        if (step.type === ActionType.LOOP_ON_ITEMS && step.output && isNil(res)) {
            return findFailedStepInLoop(step as LoopStepOutput);
        }
        return res;
    }, null as null | string);
}

function findFailedStepInLoop(loopStepResult: LoopStepOutput): string | null {
    if (!loopStepResult.output) {
        return null;
    }
    for (const iteration of loopStepResult.output.iterations) {
        const failedStep = findFailedStepInOutput(iteration);
        if (failedStep) return failedStep;
    }
    return null;
}