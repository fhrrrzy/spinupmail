import { useQuery } from "@tanstack/react-query";
import { getAuthConfig } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

/**
 * Deployment-level auth capabilities. Google is only offered when the Worker
 * has `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` configured.
 */
export const useAuthConfigQuery = () =>
  useQuery({
    queryKey: queryKeys.authConfig,
    queryFn: ({ signal }) => getAuthConfig({ signal }),
    staleTime: 5 * 60 * 1000,
  });
