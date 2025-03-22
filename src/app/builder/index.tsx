'use client'
import { platformHooks } from "@/hooks/platform-hooks";
import { LeftSideBarType, RightSideBarType, useBuilderStateContext, useSwitchToDraft } from "./builder-hooks";
import { ActionType, flowStructureUtil, isNil, PieceTrigger, TriggerType, WebsocketClientEvent } from "../../../shared/src";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useElementSize } from "@/lib/utils";
import { ImperativePanelHandle } from 'react-resizable-panels';
import { piecesHooks } from "@/features/pieces/lib/pieces-hook";
import { flowRunsApi } from "@/features/flow-runs/lib/flow-runs-api";
import { useMutation } from "@tanstack/react-query";
import { useSocket } from "../components/socket-provider";

const minWidthOfSidebar = 'min-w-[max(20vw,400px)]';
const animateResizeClassName = `transition-all duration-200`;

const useAnimateSidebar = (
    sidebarValue: LeftSideBarType | RightSideBarType,
) => {
    const handleRef = useRef<ImperativePanelHandle>(null);
    const sidebarClosed = [LeftSideBarType.NONE, RightSideBarType.NONE].includes(
        sidebarValue,
    );
    useEffect(() => {
        const sidebarSize = handleRef.current?.getSize() ?? 0;
        if (sidebarClosed) {
            handleRef.current?.resize(0);
        } else if (sidebarSize === 0) {
            handleRef.current?.resize(25);
        }
    }, [handleRef, sidebarValue, sidebarClosed]);
    return handleRef;
}

const constructContainerKey = (
    flowId: string,
    stepName: string,
    triggerOrActionName?: string,
) => {
    return flowId + stepName + (triggerOrActionName ?? "");
}

const BuilderPage = () => {
    const { platform } = platformHooks.useCurrentPlatform();

    const setRun = useBuilderStateContext((state) => state.setRun);
    const flowVersion = useBuilderStateContext((state) => state.flowVersion);
    const leftSidebar = useBuilderStateContext((state) => state.leftSidebar);
    const rightSidebar = useBuilderStateContext((state) => state.rightSidebar);
    const run = useBuilderStateContext((state) => state.run);
    const canExitRun = useBuilderStateContext((state) => state.canExitRun);
    const selectedStep = useBuilderStateContext((state) => state.selectedStep);
    
    const memorizedSelectedStep = useBuilderStateContext(
        useCallback((state) => {
          const flowVersion = state.flowVersion;
          if (isNil(state.selectedStep) || isNil(flowVersion)) {
            return undefined;
          }
          return flowStructureUtil.getStep(state.selectedStep, flowVersion.trigger);
        }, [])
    );
      
    const containerKey = useBuilderStateContext(
        useCallback((state) => {
          const flowVersion = state.flowVersion;
          if (isNil(state.selectedStep) || isNil(flowVersion)) {
            return undefined;
          }
          const step = flowStructureUtil.getStep(state.selectedStep, flowVersion.trigger);
          const triggerOrActionName =
            step?.type === TriggerType.PIECE
              ? (step as PieceTrigger).settings.triggerName
              : step?.settings.actionName;
      
          return constructContainerKey(state.flow.id, state.selectedStep, triggerOrActionName);
        }, [])
    );      

    const middlePanelRef = useRef<HTMLDivElement>(null);//@ts-ignore
    const middlePanelSize = useElementSize(middlePanelRef);
    const [isDraggingHandle, setIsDraggingHandle] = useState(false);
    const rightHandleRef = useAnimateSidebar(rightSidebar);
    const leftHandleRef = useAnimateSidebar(leftSidebar);
    const leftSidePanelRef = useRef<HTMLDivElement>(null);
    const rightSidePanelRef = useRef<HTMLDivElement>(null);

    const { versions, refetch: refetchPiece } =
        piecesHooks.useMostRecentAndExactPieceVersion({
        name: memorizedSelectedStep?.settings.pieceName,
        version: memorizedSelectedStep?.settings.pieceVersion,
        enabled:
            memorizedSelectedStep?.type === ActionType.PIECE ||
            memorizedSelectedStep?.type === TriggerType.PIECE,
        });

    const pieceModel = versions
        ? versions[memorizedSelectedStep?.settings.pieceVersion || '']
        : undefined;

    const socket = useSocket();

    const { mutate: fetchAndUpdateRun } = useMutation({
        mutationFn: flowRunsApi.getPopulated,
    });

    useEffect(() => {
        const interval = setInterval(() => {
            fetchAndUpdateRun("runId", {
                onSuccess: (newRun) => {
                    setRun(newRun, flowVersion);
                },
            });
        }, 50000); // Fetch every 5 seconds
    
        return () => clearInterval(interval); // Cleanup when component unmounts
    }, ["runId", fetchAndUpdateRun]);

    const { switchToDraft, isSwitchingToDraftPending } = useSwitchToDraft();
    const [hasCanvasBeenInitialised, setHasCanvasBeenInitialised] =
        useState(false);
        
    return (
        <div className="flex h-screen w-screen flex-col relative">
            {run && (
                <div>Run Details Bar</div>
            )}
            
        </div>
    )
}

export { BuilderPage };