import { Check, FileQuestion, PauseIcon, Timer, X } from "lucide-react";
import { ActionType, FlowRun, FlowRunStatus, flowStructureUtil, FlowVersion, isNil, LoopStepOutput, StepOutput, StepOutputStatus } from "../../../../shared/src";

export const flowRunUtils = {
    findFailedStepInOutput,
    findLoopsState,
    getStatusIcon(status: FlowRunStatus): {
        variant: 'default' | 'success' | 'error';
        Icon: typeof Timer | typeof Check | typeof PauseIcon | typeof X;
    } {
        switch (status) {
            case FlowRunStatus.RUNNING:
              return {
                variant: 'default',
                Icon: Timer,
              };
            case FlowRunStatus.SUCCEEDED:
              return {
                variant: 'success',
                Icon: Check,
              };
            case FlowRunStatus.STOPPED:
              return {
                variant: 'success',
                Icon: Check,
              };
            case FlowRunStatus.FAILED:
              return {
                variant: 'error',
                Icon: X,
              };
            case FlowRunStatus.PAUSED:
              return {
                variant: 'default',
                Icon: PauseIcon,
              };
            case FlowRunStatus.MEMORY_LIMIT_EXCEEDED:
              return {
                variant: 'error',
                Icon: X,
              };
            case FlowRunStatus.QUOTA_EXCEEDED:
              return {
                variant: 'error',
                Icon: X,
              };
            case FlowRunStatus.INTERNAL_ERROR:
              return {
                variant: 'error',
                Icon: X,
              };
            case FlowRunStatus.TIMEOUT:
              return {
                variant: 'error',
                Icon: X,
              };
            default:
              return {
                variant: 'default',
                Icon: FileQuestion,
              }
        }
    },
};

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

function findLoopsState(
    flowVersion: FlowVersion,
    run: FlowRun,
    currentLoopsState: Record<string, number>,
) {
    const loops = flowStructureUtil
        .getAllSteps(flowVersion.trigger)
        .filter((s) => s.type === ActionType.LOOP_ON_ITEMS);
    const failedStep = run.steps ? findFailedStepInOutput(run.steps) : null;

    return loops.reduce(
        (res, step) => ({
            ...res,
            [step.name]:
                failedStep && flowStructureUtil.isChildOf(step, failedStep)
                    ? Number.MAX_SAFE_INTEGER
                    : currentLoopsState[step.name] ?? 0,
        }),
        currentLoopsState,
    );
}