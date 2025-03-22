import { useQuery } from "@tanstack/react-query";
import { flowPieceUtil } from "../../../../shared/src";
import { PieceMetadataModel } from "../../../../pieces/community/framework/src";
import { piecesApi } from "./pieces-api";

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
    }
}