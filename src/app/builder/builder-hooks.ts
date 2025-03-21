import { AskAiButtonOperations } from "@/features/pieces/lib/types";
import { FlowOperationRequest, FlowRun, FlowVersion, PopulatedFlow } from "../../../shared/src";

export enum LeftSideBarType {
    RUNS = 'runs',
    VERSIONS = 'versions',
    RUN_DETAILS = 'run-details',
    AI_COPILOT = 'chat',
    NONE = 'none',
}
  
export enum RightSideBarType {
    NONE = 'none',
    PIECE_SETTINGS = 'piece-settings',
}

type InsertMentionHandler = (propertyPath: string) => void;

export type BuilderState = {
    flow: PopulatedFlow;
    flowVersion: FlowVersion;
    readonly: boolean;
    sampleData: Record<string, unknown>;
    sampleDataInput: Record<string, unknown>;
    loopsIndexes: Record<string, number>;
    run: FlowRun | null;
    leftSidebar: LeftSideBarType;
    rightSidebar: RightSideBarType;
    selectedStep: string | null;
    canExitRun: boolean;
    activeDraggingStep: string | null;
    saving: boolean;
    refreshStepFormatSettingsToggle: boolean;
    selectedBranchIndex: number | null;
    refreshSettings: () => void;
    setSelectedBranchIndex: (index: number | null) => void,
    exitRun: (userHasPermissionToEditFlow: boolean) => void;
    exitStepSettings: () => void;
    renameFlowClientSide: (newName: string) => void;
    moveToFolderClientSide: (folderId: string) => void;
    setRun: (run: FlowRun, flowVersion: FlowVersion) => void;
    setLeftSidebar: (leftSidebar: LeftSideBarType) => void;
    setRightSidebar: (rightSidebar: RightSideBarType) => void;
    applyOperation: (operation: FlowOperationRequest) => void;
    removeStepSelection: () => void;
    selectStepByName: (stepName: string) => void;
    startSaving: () => void;
    setActiveDraggingStep: (stepName: string | null) => void;
    setFlow: (flow: PopulatedFlow) => void;
    setSampleData: (stepName: string, payload: unknown) => void;
    setSampleDataInput: (stepName: string, payload: unknown) => void;
    exitPieceSelector: () => void;
    setVersion: (flowVersion: FlowVersion) => void;
    insertMention: InsertMentionHandler | null;
    setReadOnly: (readOnly: boolean) => void;
    setLoopIndex: (stepName: string, index: number) => void;
    operationListeners: Array<
        (flowVersion: FlowVersion, operation: FlowOperationRequest) => void
    >;
    addOperationListener: (
        listener: (
          flowVersion: FlowVersion,
          operation: FlowOperationRequest,
        ) => void,
    ) => void;
    removeOperationListener: (
        listener: (
            flowVersion: FlowVersion,
            operation: FlowOperationRequest,
        ) => void,
    ) => void;
    askAiButtonProps: AskAiButtonOperations | null;
    setAskAiButtonProps: (props: AskAiButtonOperations | null) => void;
    selectedNodes: string[];
    setSelectedNodes: (nodes: string[]) => void;
    panningMode: 'grab' | 'pan';
    setPanningMode: (mode: 'grab' | 'pan') => void;
    pieceSelectorStep: string | null;
    setPieceSelectorStep: (step: string | null) => void;
    isFocusInsideListMapperModeInput: boolean;
    setIsFocusInsideListMapperModeInput: (
        isFocusInsideListMapperModeInput: boolean,
    ) => void;
}

export type BuilderInitialState = Pick<
    BuilderState,
    | 'flow'
    | 'flowVersion'
    | 'readonly'
    | 'run'
    | 'canExitRun'
    | 'sampleData'
    | 'sampleDataInput'
>;