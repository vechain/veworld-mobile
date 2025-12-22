import { useNetInfo } from "@react-native-community/netinfo"
import { useMemo } from "react"

/**
 * Returns whether the app is considered "online".
 *
 * IMPORTANT: This mirrors the logic used by `useOnlineManager` / React Query's `onlineManager`.
 * We intentionally require both:
 * - `isConnected` (network link exists)
 * - `isInternetReachable` (actual internet reachability)
 */
export function useIsOnline(): boolean {
    const { isConnected, isInternetReachable } = useNetInfo()

    return useMemo(() => {
        return Boolean(isConnected) && Boolean(isInternetReachable)
    }, [isConnected, isInternetReachable])
}
