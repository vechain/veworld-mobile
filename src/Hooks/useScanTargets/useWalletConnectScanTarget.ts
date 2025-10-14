import { useCallback } from "react"
import { useWalletConnect } from "~Components"
import HapticsService from "~Services/HapticsService"

export const useWalletConnectScanTarget = () => {
    const { onPair } = useWalletConnect()
    return useCallback(
        (data: string) => {
            HapticsService.triggerImpact({ level: "Light" })
            onPair(data)
        },
        [onPair],
    )
}
