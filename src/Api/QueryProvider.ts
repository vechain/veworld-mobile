import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 0,
            staleTime: 30000,
            refetchOnWindowFocus: true,
            refetchOnMount: true,
            refetchOnReconnect: true,
            refetchInterval: false,
            refetchIntervalInBackground: false,
        },
    },
})
