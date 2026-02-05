import { useCallback, useEffect, useState } from "react"
import { useSmartWallet } from "~Hooks/useSmartWallet"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
import { useI18nContext } from "~i18n"

type OAuthProvider = "google" | "apple"

type UseOAuthWalletLoginParams = {
    provider: OAuthProvider
    onCreateSmartWallet: (params: { address: string }) => void
    onSmartWalletPinSuccess: (params: { pin: string; address: string }) => void
}

export const useOAuthWalletLogin = ({
    provider,
    onCreateSmartWallet,
    onSmartWalletPinSuccess,
}: UseOAuthWalletLoginParams) => {
    const { LL } = useI18nContext()
    const { login, isAuthenticated, smartAccountAddress } = useSmartWallet()

    const [pendingLogin, setPendingLogin] = useState(false)
    const [pendingSmartAccountAddress, setPendingSmartAccountAddress] = useState<string | null>(null)

    const handleLogin = useCallback(async () => {
        // Guard against duplicate login triggers while pending
        if (pendingLogin) return

        // Privy stores its own access/refresh tokens in the keychain under its
        // own domain path so when we uninstall the app it does not get wiped. Thus
        // there is a case where on a fresh install we have a privy login and don't need to
        // login again.
        if (!isAuthenticated) {
            setPendingLogin(true)
            try {
                await login({ provider, oauthRedirectUri: "/auth/callback" })
                // Don't proceed here - wait for useEffect to detect smartAccountAddress is populated
            } catch (error) {
                setPendingLogin(false)
                Feedback.show({
                    severity: FeedbackSeverity.ERROR,
                    type: FeedbackType.ALERT,
                    message: LL.COMMON_BTN_TRY_AGAIN(),
                    icon: "icon-alert-circle",
                })
            }
        } else if (smartAccountAddress) {
            // Already authenticated with address available
            setPendingSmartAccountAddress(smartAccountAddress)
            onCreateSmartWallet({ address: smartAccountAddress })
        } else {
            // Authenticated but address still loading - wait for useEffect to trigger
            setPendingLogin(true)
        }
    }, [LL, isAuthenticated, login, onCreateSmartWallet, pendingLogin, provider, smartAccountAddress])

    // Wait for smartAccountAddress to be populated after OAuth login
    useEffect(() => {
        if (pendingLogin && isAuthenticated && smartAccountAddress) {
            setPendingLogin(false)
            setPendingSmartAccountAddress(smartAccountAddress)
            onCreateSmartWallet({ address: smartAccountAddress })
        }
    }, [pendingLogin, isAuthenticated, smartAccountAddress, onCreateSmartWallet])

    const handlePinSuccess = useCallback(
        (pin: string) => {
            if (pendingSmartAccountAddress) {
                onSmartWalletPinSuccess({
                    pin,
                    address: pendingSmartAccountAddress,
                })
                setPendingSmartAccountAddress(null)
                return true
            }
            return false
        },
        [onSmartWalletPinSuccess, pendingSmartAccountAddress],
    )

    const clearPendingState = useCallback(() => {
        setPendingSmartAccountAddress(null)
        setPendingLogin(false)
    }, [])

    return {
        handleLogin,
        isLoginPending: pendingLogin,
        pendingAddress: pendingSmartAccountAddress,
        handlePinSuccess,
        clearPendingState,
    }
}
