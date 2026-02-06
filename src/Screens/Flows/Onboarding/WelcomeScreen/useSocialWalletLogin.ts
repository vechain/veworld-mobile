import { useCallback, useEffect, useState } from "react"
import { useSmartWallet } from "~Hooks/useSmartWallet"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
import { useI18nContext } from "~i18n"

type SocialProvider = "google" | "apple"

type UseSocialWalletLoginParams = {
    onCreateSmartWallet: (params: { address: string; name?: string }) => void
    onSmartWalletPinSuccess: (params: { pin: string; address: string; name?: string }) => void
}

export const useSocialWalletLogin = ({ onCreateSmartWallet, onSmartWalletPinSuccess }: UseSocialWalletLoginParams) => {
    const { LL } = useI18nContext()
    const { login, isAuthenticated, smartAccountAddress, userDisplayName } = useSmartWallet()

    const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null)
    const [pendingSmartAccountAddress, setPendingSmartAccountAddress] = useState<string | null>(null)

    const handleLogin = useCallback(
        async (provider: SocialProvider) => {
            // Guard against duplicate login triggers while pending
            if (pendingProvider) return

            setPendingProvider(provider)
            try {
                // SmartWalletProvider.login() handles all cases:
                // - Not authenticated → runs OAuth flow
                // - Authenticated with same provider → no-op
                // - Authenticated with different provider → logout + re-login
                await login({ provider, oauthRedirectUri: "/auth/callback" })
                // After login resolves, wait for useEffect to detect
                // smartAccountAddress is populated by privy
            } catch (error) {
                setPendingProvider(null)
                Feedback.show({
                    severity: FeedbackSeverity.ERROR,
                    type: FeedbackType.ALERT,
                    message: LL.COMMON_BTN_TRY_AGAIN(),
                    icon: "icon-alert-circle",
                })
            }
        },
        [LL, login, pendingProvider],
    )

    // Wait for smartAccountAddress to be populated after OAuth login.
    // Guard with !pendingSmartAccountAddress to prevent duplicate calls if
    // userDisplayName updates in a later render cycle.
    useEffect(() => {
        if (pendingProvider && isAuthenticated && smartAccountAddress && !pendingSmartAccountAddress) {
            setPendingSmartAccountAddress(smartAccountAddress)
            onCreateSmartWallet({ address: smartAccountAddress, name: userDisplayName ?? undefined })
        }
    }, [
        pendingProvider,
        isAuthenticated,
        smartAccountAddress,
        userDisplayName,
        onCreateSmartWallet,
        pendingSmartAccountAddress,
    ])

    const handlePinSuccess = useCallback(
        (pin: string) => {
            if (pendingSmartAccountAddress) {
                onSmartWalletPinSuccess({
                    pin,
                    address: pendingSmartAccountAddress,
                    name: userDisplayName ?? undefined,
                })
                setPendingSmartAccountAddress(null)
                setPendingProvider(null)
            }
        },
        [onSmartWalletPinSuccess, pendingSmartAccountAddress, userDisplayName],
    )

    const clearPendingState = useCallback(() => {
        setPendingSmartAccountAddress(null)
        setPendingProvider(null)
    }, [])

    return {
        handleLogin,
        isLoginPending: pendingProvider !== null,
        pendingProvider,
        pendingAddress: pendingSmartAccountAddress,
        handlePinSuccess,
        clearPendingState,
    }
}
