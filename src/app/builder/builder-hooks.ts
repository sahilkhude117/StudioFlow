'use client'
import { AskAiButtonOperations } from "@/features/pieces/lib/types";
import { FlowOperationRequest, FlowRun, flowStructureUtil, FlowVersion, FlowVersionState, PopulatedFlow, TriggerType } from "../../../shared/src";
import { flowRunUtils } from "@/features/flow-runs/lib/flow-run-utils";
import { PromiseQueue } from "@/lib/promise-queue";
import { createContext, useCallback, useContext } from "react";
import { create, useStore } from 'zustand';
import { useMutation } from "@tanstack/react-query";
import { flowsApi } from "@/features/flows/lib/flows-api";
import { INTERNAL_ERROR_TOAST, toast } from "@/components/ui/use-toast";

const flowUpdatesQueue = new PromiseQueue();

export const BuilderStateContext = createContext<BuilderStore | null>(null);

export function useBuilderStateContext<T>(
    selector: (state: BuilderState) => T,
): T {
    const store = useContext(BuilderStateContext);
    if (!store) 
        throw new Error("Missing BuilderStateContext.Provider in the tree");
    return useStore(store, useCallback(selector, []));
}


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

export type BuilderStore = ReturnType<typeof createBuilderStore>;

function determineInitiallySelectedStep(
    failedStepInRun: string | null,
    flowVersion: FlowVersion,
): string | null {
    if (failedStepInRun) {
        return failedStepInRun;
    }
    if (flowVersion.state === FlowVersionState.LOCKED) {
        return null;
    }
    return (
        flowStructureUtil.getAllSteps(flowVersion.trigger).find((s) => !s.valid)
            ?.name ?? 'trigger'
    );
}

export const createBuilderStore = (
    initialState: BuilderInitialState,
    newFlow: boolean,
) => //@ts-ignore
    create<BuilderState>((set) => {
        const failedStepInRun = initialState.run?.steps
            ? flowRunUtils.findFailedStepInOutput(initialState.run.steps)
            : null;
        const initiallySelectedStep = newFlow
            ? null
            : determineInitiallySelectedStep(
                failedStepInRun,
                initialState.flowVersion,
              );
        
        return {
            loopsIndexes:
                initialState.run && initialState.run.steps
                ? flowRunUtils.findLoopsState(
                    initialState.flowVersion,
                    initialState.run,
                    {},
                    )
                : {},
            sampleData: initialState.sampleData,
            sampleDataInput: initialState.sampleDataInput,
            flow: initialState.flow,
            flowVersion: initialState.flowVersion,
            leftSidebar: initialState.run
                ? LeftSideBarType.RUN_DETAILS
                : LeftSideBarType.NONE,
            readonly: initialState.readonly,
            run: initialState.run,
            saving: false,
            selectedStep: initiallySelectedStep,
            canExitRun: initialState.canExitRun,
            rightSidebar:
                initiallySelectedStep && 
                (initiallySelectedStep !== 'trigger' ||
                    initialState.flowVersion.trigger.type !== TriggerType.EMPTY)
                    ? RightSideBarType.PIECE_SETTINGS
                    : RightSideBarType.NONE,
            refreshStepFormSettingsToggle: false,

            setRun: async (run: FlowRun, flowVersion: FlowVersion) => 
                set((state) => {
                    const newSelectedStep = run.steps
                        ? flowRunUtils.findFailedStepInOutput(run.steps) ??
                        state.selectedStep ??
                        'trigger'
                        : 'trigger';

                    // Prevent redundant updates
                    if (
                        state.run === run &&
                        state.flowVersion === flowVersion &&
                        state.selectedStep === newSelectedStep
                    ) {
                        return state;
                    }
                                
                    return {
                        loopsIndexes: flowRunUtils.findLoopsState(
                            flowVersion,
                            run,
                            state.loopsIndexes,
                        ),
                        run,
                        flowVersion, 
                        leftSidebar: LeftSideBarType.RUN_DETAILS,
                        rightSidebar: RightSideBarType.PIECE_SETTINGS,
                        selectedStep: newSelectedStep,
                        readonly: true,
                    };
                }),
            setFlow: (flow: PopulatedFlow) => set({ flow, selectedStep: null }),
            exitRun: (userHasPermissionToEditFlow: boolean) =>
                set({
                  run: null,
                  readonly: !userHasPermissionToEditFlow,
                  loopsIndexes: {},
                  leftSidebar: LeftSideBarType.NONE,
                  rightSidebar: RightSideBarType.NONE,
                  selectedBranchIndex: null,
                }),
            setVersion: (flowVersion: FlowVersion) => {
                set((state) => ({
                    flowVersion,
                    run: null,
                    selectedStep: null,
                    readonly:
                    state.flow.publishedVersionId !== flowVersion.id &&
                    flowVersion.state === FlowVersionState.LOCKED,
                    leftSidebar: LeftSideBarType.NONE,
                    rightSidebar: RightSideBarType.NONE,
                    selectedBranchIndex: null,
                }));
                },
        }
    })

export const useSwitchToDraft = () => {
    const flowVersion = useBuilderStateContext((state) => state.flowVersion);
    const setVersion = useBuilderStateContext((state) => state.setVersion);
    const exitRun = useBuilderStateContext((state) => state.exitRun);
    const setFlow = useBuilderStateContext((state) => state.setFlow);

    const checkAccess = true;
    const userHasPermissionToEditFlow = true; 
    const { mutate: switchToDraft, isPending: isSwitchingToDraftPending } =
        useMutation({
            mutationFn: async () => {
                const flow = await flowsApi.get(flowVersion.flowId)
                return flow;
            },
            onSuccess: (flow) => {
                setFlow(flow);
                setVersion(flow.version);
                exitRun(userHasPermissionToEditFlow)
            },
            onError: () => {
                toast(INTERNAL_ERROR_TOAST);
            },
        });
    return {
        switchToDraft,
        isSwitchingToDraftPending,
    };
};