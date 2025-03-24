import { api } from "@/lib/api"
import { Folder } from "../../../../shared/src"

export const foldersApi = {
    get(folderId: string) {
        return api.get<Folder>(`/v1/folders/${folderId}`)
    }
}