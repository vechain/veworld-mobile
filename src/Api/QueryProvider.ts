import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { QueryClient } from "@tanstack/react-query"
import moment from "moment"
import { MMKV } from "react-native-mmkv"

const storage = new MMKV()

const clientStorage = {
    setItem: (key: string, value: string) => {
        storage.set(key, value)
    },
    getItem: (key: string) => {
        const value = storage.getString(key)
        return value === undefined ? null : value
    },
    removeItem: (key: string) => {
        storage.delete(key)
    },
}

export const clientPersister = createSyncStoragePersister({
    storage: clientStorage,
})

/**
 * 7 days cache max age
 */
export const RQ_CACHE_MAX_AGE = moment.duration(7, "days").asMilliseconds()

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
            gcTime: Infinity,
            networkMode: "offlineFirst",
        },
    },
})
