import { useNetInfo } from "@react-native-community/netinfo"

/**
 * Returns whether the app is considered "online".
 *
 * IMPORTANT: This mirrors the logic used by `useOnlineManager` / React Query's `onlineManager`.
 * We intentionally require both:
 * - `isConnected` (network link exists)
 * - `isInternetReachable` (actual internet reachability)
 *
 * Note: Both values start as `null` on initial mount. We treat `null` as "online"
 * to avoid a flash of offline UI before the network state is determined.
 */
export function useIsOnline(): boolean {
    const { isConnected, isInternetReachable } = useNetInfo()

    if (isConnected === null || isInternetReachable === null) {
        return true
    }

    return isConnected && isInternetReachable
}
