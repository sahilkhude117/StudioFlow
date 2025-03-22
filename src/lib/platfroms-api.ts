import { PlatformWithoutSensitiveData } from "../../shared/src";
import { api } from "./api";

export const platformApi = {
    getCurrentPlatform() {
        const platformId = "bkRM3FkkyIvFkBnPHxTez"
        if (!platformId) {
            throw Error('No platform id found');
        }
        return api.get<PlatformWithoutSensitiveData>(`/v1/platforms/${platformId}`);
    }
}