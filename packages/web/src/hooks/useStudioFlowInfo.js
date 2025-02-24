import { useQuery } from '@tanstack/react-query';
import api from 'helpers/api';

export default function useStudioFlowInfo() {
  const query = useQuery({
    staleTime: Infinity,
    queryKey: ['automatisch', 'info'],
    queryFn: async ({ signal }) => {
      const { data } = await api.get('/v1/automatisch/info', { signal });

      return data;
    },
  });

  return query;
}
