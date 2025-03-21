import { FlowOperationType, StepLocationRelativeToParent } from "../../../../shared/src";

export type PieceSelectorOperation = 
|   {
        type: FlowOperationType.ADD_ACTION;
        actionLocation: {
            branchIndex: number;
            parentStep: string;
            stepLocationRelativeToParent: StepLocationRelativeToParent.INSIDE_BRANCH;
        };
    }
|   {
        type: FlowOperationType.ADD_ACTION,
        actionLocation: {
            parentStep: string;
            stepLocationRaltiveToParent: Exclude<
                StepLocationRelativeToParent,
                StepLocationRelativeToParent.INSIDE_BRANCH
            >;
        };
    }
|   { type: FlowOperationType.UPDATE_TRIGGER }
|    {
    type: FlowOperationType.UPDATE_ACTION;
    stepName: string
};

export type AskAiButtonOperations = Exclude<
    PieceSelectorOperation,
    { type: FlowOperationType.UPDATE_TRIGGER}
>;