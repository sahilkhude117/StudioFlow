import { QueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { PlatformWithoutSensitiveData } from "../../shared/src";
import { platformApi } from "@/lib/platfroms-api";

export const platformHooks = {
    useCurrentPlatform: () => {
        const currentPlatformId = "bkRM3FkkyIvFkBnPHxTez";
        const query = useSuspenseQuery({
            queryKey: ['platform', currentPlatformId],
            queryFn: platformApi.getCurrentPlatform,
            staleTime: Infinity,
        });
        return {
            platform: query.data,
            refetch: async () => {
                await query.refetch();
            },
            setCurrentPlatform: (
                queryClient: QueryClient,
                platform: PlatformWithoutSensitiveData,
            ) => {
                queryClient.setQueryData(['platform', currentPlatformId], platform);
            },
        };
    },
}