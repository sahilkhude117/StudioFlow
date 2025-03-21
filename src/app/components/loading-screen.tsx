import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '../../lib/utils';

export const LoadingScreen = ({ brightSpinner = false }: { brightSpinner?: boolean }) => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Skeleton
        className={cn(
          'h-12 w-12 rounded-full',
          brightSpinner ? 'bg-gray-200' : 'bg-gray-500'
        )}
      />
    </div>
  );
};