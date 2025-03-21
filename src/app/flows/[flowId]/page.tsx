'use client'
import { ReactFlowProvider } from '@xyflow/react'
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation"
import { PopulatedFlow } from "../../../../shared/src";
import { flowsApi } from "@/features/flows/lib/flows-api";
import { sampleDataHooks } from "@/features/flows/lib/sample-data-hooks";
import { LoadingSpinner } from "@/components/ui/spinner";

export default function FlowBuilderPage() {
    const { flowId } = useParams();
    const router = useRouter();

    const {
        data: flow,
        isLoading,
        isError,
    } = useQuery<PopulatedFlow, Error>({
        queryKey: ['flow', flowId, "authenticationSession.getProjectId()"],
        queryFn: () => flowsApi.get(flowId! as string),
        gcTime: 0,
        retry: false,
        refetchOnWindowFocus: false,
    });

    const { data: sampleData, isLoading: isSampleDataLoading} = 
        sampleDataHooks.useSampleDataForFlow(flow?.version, flow?.projectId)

    const { data: sampleDataInput, isLoading: isSampleDataInputLoading} =
        sampleDataHooks.useSampleDataInputForFlow(flow?.version, flow?.projectId);

    if (isError) {
        console.error("error fetching flow");
        return router.push('/sign-in')
    }

    if (isLoading || isSampleDataLoading || isSampleDataInputLoading) {
        return (
          <div className="bg-background flex h-screen w-screen items-center justify-center ">
            <LoadingSpinner size={50}></LoadingSpinner>
          </div>
        );
    }
    
    return (
        <ReactFlowProvider>
            xf
        </ReactFlowProvider>
    )
}