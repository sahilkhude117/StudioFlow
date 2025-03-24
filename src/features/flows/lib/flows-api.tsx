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
    },
    update(
        flowId: string,
        request: FlowOperationRequest,
        showErrorToast = false,
    ) {
        return api
            .post<PopulatedFlow>(`/v1/flows/${flowId}`, request)
            .catch((error) => {
                if (showErrorToast) {
                  const errorCode: ErrorCode | undefined = (
                    error.response?.data as { code: ErrorCode }
                  )?.code;
                  if (errorCode === ErrorCode.FLOW_IN_USE) {
                    toast({
                      title: ('Flow Is In Use'),
                      description: (
                        'Flow is being used by another user, please try again later.'
                      ),
                      duration: Infinity,
                      action: (
                        <Button
                          onClick={() => window.location.reload()}
                          size={'sm'}
                          variant={'outline'}
                        >
                          {('Refresh')}
                        </Button>
                      ),
                    });
                  } else {
                    toast(UNSAVED_CHANGES_TOAST);
                  }
                }
                throw error;
            });
    }
}


