import { PieceAuthProperty } from "../../../../pieces/community/framework/src";
import { ActionType, FlowOperationType, PackageType, PieceType, StepLocationRelativeToParent, TriggerType } from "../../../../shared/src";

type BaseStepMetadata = {
    displayName: string;
    logoUrl: string;
    description: string;
};

export type PieceStepMetadata = BaseStepMetadata & {
    type: ActionType.PIECE | TriggerType.PIECE;
    pieceName: string;
    pieceVersion: string;
    categories: string[];
    packageType: PackageType;
    pieceType: PieceType;
    auth: PieceAuthProperty | undefined;
};

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

type PrimitiveStepMetadata = BaseStepMetadata & {
    type:
      | ActionType.CODE
      | ActionType.LOOP_ON_ITEMS
      | ActionType.ROUTER
      | TriggerType.EMPTY;
};

export type StepMetadata = PieceStepMetadata | PrimitiveStepMetadata;

export type AskAiButtonOperations = Exclude<
    PieceSelectorOperation,
    { type: FlowOperationType.UPDATE_TRIGGER}
>;