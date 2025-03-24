import { useQuery } from "@tanstack/react-query"
import { foldersApi } from "./folders-api"

export const foldersHooks = {
    useFolder: (folderId: string) => {
        return useQuery({
            queryKey: ['folder', folderId],
            queryFn: () => foldersApi.get(folderId),
            enabled: folderId !== 'NULL'
        })
    }
}