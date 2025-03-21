'use client'
import { Suspense } from 'react';
import { LoadingScreen } from './loading-screen';
import { useEmbedding } from '@/components/embed-provider';

type SuspenseBoundryProps = {
  children: React.ReactNode;
};

export const SuspenseBoundry = ({ children }: SuspenseBoundryProps ) => {
  const { embedState } = useEmbedding();
  return (
    <Suspense
      fallback={
        <LoadingScreen brightSpinner={embedState.useDarkBackground}></LoadingScreen>
      }
    >
      {children}
    </Suspense>
  )
}