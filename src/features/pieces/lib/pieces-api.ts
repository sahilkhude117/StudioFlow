import { api } from "@/lib/api";
import { PieceMetadataModel } from "../../../../pieces/community/framework/src";
import { GetPieceRequestParams, GetPieceRequestQuery } from "../../../../shared/src";

export const piecesApi = {
    get(
        request: GetPieceRequestParams & GetPieceRequestQuery,
    ): Promise<PieceMetadataModel> {
        return api.get<PieceMetadataModel>(`/v1/pieces/${request.name}`, {
            version: request.version ?? undefined,
        });
    },
}