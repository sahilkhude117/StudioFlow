import { PlatformRole, UserStatus, UserWithMetaInformationAndProject } from '../../shared/src/index';
import { api } from './api';

export const userApi = {
  getCurrentUser(): Promise<{ data: UserWithMetaInformationAndProject }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            id: "1FtjkqDCcdpG1qpCuJp6z",
            email: "sahilkhude11@gmail.com",
            firstName: "sahil",
            lastName: "khude",
            status: UserStatus.ACTIVE,
            platformRole: PlatformRole.ADMIN,
            created: "2025-03-15T06:15:54.822Z",
            updated: "2025-03-15T06:15:54.884Z",
            projectId: "xrUEh4rDSAtit1zjqdqCd",
            trackEvents: true,
            newsLetter: false,
            verified: true,
            externalId: null,
            platformId: "bkRM3FkkyIvFkBnPHxTez"
          }
        });
      }, 500); // Simulating API response delay (500ms)
    });
  },
};
