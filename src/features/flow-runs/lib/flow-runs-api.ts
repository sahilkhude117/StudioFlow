import { api } from "@/lib/api"
import { FlowRun } from "../../../../shared/src"

export const flowRunsApi = {
    getPopulated(id: string): Promise<FlowRun> {
        return api.get<FlowRun>(`/v1/flow-runs/${id}`)
    }
}