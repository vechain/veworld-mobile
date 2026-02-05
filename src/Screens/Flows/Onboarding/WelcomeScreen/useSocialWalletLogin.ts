import { useCallback, useEffect, useState } from "react"
import { useSmartWallet } from "~Hooks/useSmartWallet"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
import { useI18nContext } from "~i18n"

type SocialProvider = "google" | "apple"

type UseSocialWalletLoginParams = {
    onCreateSmartWallet: (params: { address: string }) => void
    onSmartWalletPinSuccess: (params: { pin: string; address: string }) => void
}

export const useSocialWalletLogin = ({ onCreateSmartWallet, onSmartWalletPinSuccess }: UseSocialWalletLoginParams) => {
    const { LL } = useI18nContext()
    const { login, isAuthenticated, smartAccountAddress } = useSmartWallet()

    const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null)
    const [pendingSmartAccountAddress, setPendingSmartAccountAddress] = useState<string | null>(null)

    const handleLogin = useCallback(
        async (provider: SocialProvider) => {
            // Guard against duplicate login triggers while pending
            if (pendingProvider) return

            // Privy stores its own access/refresh tokens in the keychain under its
            // own domain path so when we uninstall the app it does not get wiped. Thus
            // there is a case where on a fresh install we have a privy login and don't need to
            // login again.
            if (!isAuthenticated) {
                setPendingProvider(provider)
                try {
                    await login({ provider, oauthRedirectUri: "/auth/callback" })
                    // Don't proceed here - wait for useEffect to detect smartAccountAddress is populated
                } catch (error) {
                    setPendingProvider(null)
                    Feedback.show({
                        severity: FeedbackSeverity.ERROR,
                        type: FeedbackType.ALERT,
                        message: LL.COMMON_BTN_TRY_AGAIN(),
                        icon: "icon-alert-circle",
                    })
                }
            } else if (smartAccountAddress) {
                // Already authenticated with address available
                setPendingProvider(provider)
                setPendingSmartAccountAddress(smartAccountAddress)
                onCreateSmartWallet({ address: smartAccountAddress })
            } else {
                // Authenticated but address still loading - wait for useEffect to trigger
                setPendingProvider(provider)
            }
        },
        [LL, isAuthenticated, login, onCreateSmartWallet, pendingProvider, smartAccountAddress],
    )

    // Wait for smartAccountAddress to be populated after OAuth login
    useEffect(() => {
        if (pendingProvider && isAuthenticated && smartAccountAddress) {
            setPendingSmartAccountAddress(smartAccountAddress)
            onCreateSmartWallet({ address: smartAccountAddress })
        }
    }, [pendingProvider, isAuthenticated, smartAccountAddress, onCreateSmartWallet])

    const handlePinSuccess = useCallback(
        (pin: string) => {
            if (pendingSmartAccountAddress) {
                onSmartWalletPinSuccess({
                    pin,
                    address: pendingSmartAccountAddress,
                })
                setPendingSmartAccountAddress(null)
                setPendingProvider(null)
            }
        },
        [onSmartWalletPinSuccess, pendingSmartAccountAddress],
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
