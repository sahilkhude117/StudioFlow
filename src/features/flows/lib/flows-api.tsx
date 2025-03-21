import { Button } from "@/components/ui/button";
import { toast, UNSAVED_CHANGES_TOAST } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import {
    CreateFlowRequest,
    ErrorCode,
    FlowOperationRequest,
    FlowTemplate,
    FlowVersion,
    FlowVersionMetadata,
    GetFlowQueryParamsRequest,
    GetFlowTemplateRequestQuery,
    ListFlowVersionRequest,
    ListFlowsRequest,
    PopulatedFlow,
    SeekPage,
} from '../../../../shared/src';

export const flowsApi = {
    get(
        flowId: string,
        request?:GetFlowQueryParamsRequest,
    ): Promise<PopulatedFlow> {
        return api.get<PopulatedFlow>(`/v1/flows/${flowId}`, request)
    }
}


