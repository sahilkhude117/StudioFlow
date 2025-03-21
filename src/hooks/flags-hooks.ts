import { useSuspenseQuery } from '@tanstack/react-query';

import { ApFlagId } from '../../shared/src/';

import { flagsApi } from '../lib/flags-api';

type WebsiteBrand = {
  websiteName: string;
  logos: {
    fullLogoUrl: string;
    favIconUrl: string;
    logoIconUrl: string;
  };
  colors: {
    primary: {
      default: string;
      dark: string;
      light: string;
    };
  };
};

export const flagsHooks = {
  useFlags: () => {
    return useSuspenseQuery({
      queryKey: ['flags'],
      queryFn: () => flagsApi.getAll().then((res) => res.data), // Extract `data` from response
      staleTime: Infinity,
    });
  },

  useWebsiteBranding: () => {
    const { data: theme } = flagsHooks.useFlag<WebsiteBrand>(ApFlagId.THEME);
    return theme!;
  },

  useFlag: <T>(flagId: ApFlagId) => {
    const { data } = useSuspenseQuery({
      queryKey: ['flags'],
      queryFn: () => flagsApi.getAll().then((res) => res.data),
      staleTime: Infinity,
    });

    return {
      data: data?.[flagId] as T | null,
    };
  },
};
