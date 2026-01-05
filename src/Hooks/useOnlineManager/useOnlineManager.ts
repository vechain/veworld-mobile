import NetInfo from "@react-native-community/netinfo"
import { onlineManager } from "@tanstack/react-query"
import { useEffect } from "react"

/**
 * Hook to be placed at the root in order to sync network status with React Query
 */
export function useOnlineManager() {
    useEffect(() => {
        return NetInfo.addEventListener(state => {
            onlineManager.setOnline(
                state.isConnected != null && state.isConnected && Boolean(state.isInternetReachable),
            )
        })
    }, [])
}
