import { QueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { authenticationSession } from '@/lib/authentication-session';
import { userApi } from '@/lib/user-api';
import { UserWithMetaInformationAndProject } from '../../shared/src';

export const userHooks = {
  useCurrentUser: () => {
    const userId = authenticationSession.getCurrentUserId();
    const token = authenticationSession.getToken();
    const expired = authenticationSession.isJwtExpired(token!);

    return useSuspenseQuery<UserWithMetaInformationAndProject | null, Error>({
      queryKey: ['currentUser', userId],
      queryFn: async () => {
        if (!userId || expired) {
          return null;
        }
        const result = await userApi.getCurrentUser(); // Await the API response
        return result.data; // Extract data from the response
      },
      staleTime: Infinity,
    });
  },

  invalidateCurrentUser: (queryClient: QueryClient) => {
    const userId = authenticationSession.getCurrentUserId();
    queryClient.invalidateQueries({ queryKey: ['currentUser', userId] });
  },

  getCurrentUserPlatformRole: () => {
    const { data: user } = userHooks.useCurrentUser();
    return user?.platformRole;
  },
};
