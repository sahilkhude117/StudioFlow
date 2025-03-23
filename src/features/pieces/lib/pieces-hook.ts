import { useQuery } from "@tanstack/react-query";
import { Action, ActionType, flowPieceUtil, Step, Trigger, TriggerType } from "../../../../shared/src";
import { PieceMetadataModel } from "../../../../pieces/community/framework/src";
import { piecesApi } from "./pieces-api";
import { StepMetadata } from "./types";

type UsePieceAndMostRecentPatchProps = {
    name: string;
    version: string | undefined;
    enabled?: boolean;
};

type UsePieceProps = {
    name: string;
    version?: string;
    enabled?: boolean;
};

type UseStepMetadata = {
    step: Action | Trigger;
    enabled?: boolean;
};

export const piecesHooks = {
    usePiece: ({ name, version, enabled = true}: UsePieceProps) => {
        const query = useQuery<PieceMetadataModel, Error>({
            queryKey: ['piece', name, version],
            queryFn: () => piecesApi.get({ name, version }),
            staleTime: Infinity,
            enabled,
        });
        return {
            pieceModel: query.data,
            isLoading: query.isLoading,
            isSuccess: query.isSuccess,
            refetch: query.refetch,
        };
    },
    useMostRecentAndExactPieceVersion: ({
        name,
        version,
        enabled = true,
    }: UsePieceAndMostRecentPatchProps) => {
        const exactVersion = version    
            ? flowPieceUtil.getExactVersion(version)
            : undefined;
        const latestPatchVersion = exactVersion
            ? flowPieceUtil.getNextVersion(exactVersion)
            : undefined;
        const pieceQuery = piecesHooks.usePiece({
            name,
            version: exactVersion,
            enabled,
        });
        const latestPatchQuery = piecesHooks.usePiece({
            name,
            version: latestPatchVersion,
            enabled,
        });
        return {
            versions: {
                [exactVersion as string]: pieceQuery.pieceModel,
                [latestPatchVersion as string]: latestPatchQuery.pieceModel,
            },
            isLoading: pieceQuery.isLoading || latestPatchQuery.isLoading,
            isSuccess: pieceQuery.isSuccess && latestPatchQuery.isSuccess,
            refetch: () => {
                pieceQuery.refetch();
                latestPatchQuery.refetch();
            },
        }
    },
    useStepMetadata: ({ step, enabled = true }: UseStepMetadata ) => {
        const query = useQuery<StepMetadata, Error>({
            ...stepMetadataQueryBuilder(step),
            enabled,
        });
        return {
            stepMetadata: query.data,
            isLoading: query.isLoading,
        };
    },
}

function stepMetadataQueryBuilder(step: Step) {
    const isPieceStep =
        step.type === ActionType.PIECE || step.type === TriggerType.PIECE;
    const pieceName = isPieceStep ? step.settings.pieceName : undefined;
    const pieceVersion = isPieceStep ? step.settings.pieceVersion : undefined;
    const customLogoUrl = 
        'customLogoUrl' in step ? step.customLogoUrl : undefined;

    return {
        queryKey: ['piece', step.type, pieceName, pieceVersion, customLogoUrl],
        queryFn: () => piecesApi.getMetadata(step),
        staleTime: Infinity,
    };
}