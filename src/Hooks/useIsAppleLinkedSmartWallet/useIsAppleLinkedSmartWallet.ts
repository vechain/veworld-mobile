import { useMemo } from "react"
import { DEVICE_TYPE, SmartWalletDevice } from "~Model"
import { useAppSelector } from "~Storage/Redux/Hooks"
import { selectDevices } from "~Storage/Redux/Selectors"
import { PlatformUtils } from "~Utils"

/**
 * Whether the user owns ANY Apple-linked smart wallet, not just the currently selected account:
 * a user browsing with a self-custody account selected is still affected by the Apple migration.
 *
 * "Has Apple linked" is intentionally broader than "authenticated via Apple this session" - every
 * Apple-linked user gets logged out by the migration.
 */
export const useIsAppleLinkedSmartWallet = () => {
    const smartDevices = useAppSelector(state => selectDevices(state, DEVICE_TYPE.SMART_WALLET))

    return useMemo(
        () =>
            smartDevices.some(device => {
                const linkedProviders = (device as SmartWalletDevice).linkedProviders ?? []
                // Empty-list fallback mirrors SmartWalletAuthGate: providers may not have synced yet
                // and a false negative would hide a critical warning. iOS only, as on Android there
                // is no Apple login at all.
                return linkedProviders.includes("apple") || (linkedProviders.length === 0 && PlatformUtils.isIOS())
            }),
        [smartDevices],
    )
}
