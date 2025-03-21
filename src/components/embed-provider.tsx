'use client';

import React, { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type EmbeddingState = {
  isEmbedded: boolean;
  hideSideNav: boolean;
  prefix: string;
  hideLogoInBuilder: boolean;
  disableNavigationInBuilder: boolean;
  hideFolders: boolean;
  hideFlowNameInBuilder: boolean;
  sdkVersion?: string;
  predefinedConnectionName?: string;
  fontUrl?: string;
  fontFamily?: string;
  useDarkBackground: boolean;
};

const defaultState: EmbeddingState = {
  isEmbedded: false,
  hideSideNav: false,
  hideLogoInBuilder: false,
  prefix: '',
  disableNavigationInBuilder: false,
  hideFolders: false,
  hideFlowNameInBuilder: false,
  useDarkBackground: typeof window !== 'undefined' && window.opener !== null,
};

const EmbeddingContext = createContext<{
  embedState: EmbeddingState;
  setEmbedState: React.Dispatch<React.SetStateAction<EmbeddingState>>;
}>(
  {
    embedState: defaultState,
    setEmbedState: () => {},
  }
);

export const useEmbedding = () => useContext(EmbeddingContext);

export const useNewWindow = () => {
  const { embedState } = useEmbedding();
  const router = useRouter();
  
  return (route: string, searchParams?: string) => {
    if (embedState.isEmbedded) {
      router.push(`${route}${searchParams ? '?' + searchParams : ''}`);
    } else {
      window.open(
        `${route}${searchParams ? '?' + searchParams : ''}`,
        '_blank',
        'noopener noreferrer'
      );
    }
  };
};

type EmbeddingProviderProps = {
  children: React.ReactNode;
};

const EmbeddingProvider = ({ children }: EmbeddingProviderProps) => {
  const [state, setState] = useState<EmbeddingState>(defaultState);

  return (
    <EmbeddingContext.Provider value={{ embedState: state, setEmbedState: setState }}>
      <div
        className={cn({
          'bg-black/80 h-screen w-screen': state.useDarkBackground,
        })}
      >
        {children}
      </div>
    </EmbeddingContext.Provider>
  );
};

EmbeddingProvider.displayName = 'EmbeddingProvider';

export { EmbeddingProvider };