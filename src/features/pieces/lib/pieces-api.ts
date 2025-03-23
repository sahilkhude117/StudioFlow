import { api } from "@/lib/api";
import { PieceMetadataModel, PieceMetadataSummary } from "../../../../pieces/community/framework/src";
import { Action, ActionType, GetPieceRequestParams, GetPieceRequestQuery, spreadIfDefined, Trigger, TriggerType } from "../../../../shared/src";
import { PieceStepMetadata, StepMetadata } from "./types";

export const CORE_STEP_METADATA: Record<
  Exclude<ActionType, ActionType.PIECE> | TriggerType.EMPTY,
  StepMetadata
> = {
  [ActionType.CODE]: {
    displayName: ('Code'),
    logoUrl: 'https://cdn.activepieces.com/pieces/code.svg',
    description: ('Powerful Node.js & TypeScript code with npm'),
    type: ActionType.CODE as const,
  },
  [ActionType.LOOP_ON_ITEMS]: {
    displayName: ('Loop on Items'),
    logoUrl: 'https://cdn.activepieces.com/pieces/loop.svg',
    description: 'Iterate over a list of items',
    type: ActionType.LOOP_ON_ITEMS as const,
  },
  [ActionType.ROUTER]: {
    displayName: 'Router',
    logoUrl: 'https://cdn.activepieces.com/pieces/branch.svg',
    description: ('Split your flow into branches depending on condition(s)'),
    type: ActionType.ROUTER,
  },
  [TriggerType.EMPTY]: {
    displayName: ('Empty Trigger'),
    logoUrl: 'https://cdn.activepieces.com/pieces/empty-trigger.svg',
    description: ('Empty Trigger'),
    type: TriggerType.EMPTY as const,
  },
};


export const piecesApi = {
    get(
        request: GetPieceRequestParams & GetPieceRequestQuery,
    ): Promise<PieceMetadataModel> {
        return api.get<PieceMetadataModel>(`/v1/pieces/${request.name}`, {
            version: request.version ?? undefined,
        });
    },
    mapToMetadata(
        type: 'action' | 'trigger',
        piece: PieceMetadataSummary | PieceMetadataModel,
    ): PieceStepMetadata {
        return {
            displayName: piece.displayName,
            logoUrl: piece.logoUrl,
            description: piece.description,
            type: type === 'action' ? ActionType.PIECE : TriggerType.PIECE,
            //@ts-ignore
            pieceType: piece.pieceType,
            pieceName: piece.name,
            pieceVersion: piece.version,
            categories: piece.categories ?? [],
            //@ts-ignore
            packageType: piece.packageType,
            auth: piece.auth,
        };
    },
    async getMetadata(step: Action | Trigger): Promise<StepMetadata> {
        const customLogoUrl = 
            'customLogoUrl' in step ? step.customLogoUrl : undefined;
        switch (step.type) {
            case ActionType.ROUTER:
            case ActionType.LOOP_ON_ITEMS:
            case ActionType.CODE:
            case TriggerType.EMPTY:
                return {
                    ...CORE_STEP_METADATA[step.type],
                    ...spreadIfDefined('logoUrl', customLogoUrl),
                };
            case ActionType.PIECE:
            case TriggerType.PIECE: {
                const { pieceName, pieceVersion } = step.settings;
                const piece = await piecesApi.get({
                    name: pieceName,
                    version: pieceVersion
                });
                const metadata = await piecesApi.mapToMetadata(
                    step.type === ActionType.PIECE ? 'action' : 'trigger',
                    piece,
                );
                return {
                    ...metadata,
                    ...spreadIfDefined('logoUrl', customLogoUrl),
                };
            }
        }
    },
}