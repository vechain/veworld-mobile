import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { QueryClient } from "@tanstack/react-query"
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
            cacheTime: 60000,
        },
    },
})
