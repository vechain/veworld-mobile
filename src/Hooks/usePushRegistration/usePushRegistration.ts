import { useMutation } from "@tanstack/react-query"
import { useCallback } from "react"
import {
    selectAccounts,
    selectLastSubscriptionId,
    selectLastSuccessfulRegistration,
    selectLastWalletAddresses,
    updateLastSubscriptionId,
    updateLastSuccessfulRegistration,
    updateLastWalletAddresses,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { error, info } from "~Utils"
import { ERROR_EVENTS } from "../../Constants"

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
const MAX_RETRIES = 3

interface PushRegistrationPayload {
    walletAddresses: string[]
    provider: string
    providerDetails: {
        appId: string
        subscriptionId: string | null
    }
}

interface PushRegistrationParams {
    subscriptionId: string | null
    oneSignalId: string
}

const isRetryableError = (err: any): boolean => {
    if (err?.response) {
        const status = err.response.status
        return status >= 500 && status < 600
    }
    return err?.message?.toLowerCase().includes("network") || err?.code === "ECONNABORTED" || !err?.response
}

export const usePushRegistration = () => {
    const dispatch = useAppDispatch()
    const accounts = useAppSelector(selectAccounts)
    const lastSuccessfulRegistration = useAppSelector(selectLastSuccessfulRegistration)
    const lastSubscriptionId = useAppSelector(selectLastSubscriptionId)
    const lastWalletAddresses = useAppSelector(selectLastWalletAddresses)

    const registerPush = useCallback(
        async ({ subscriptionId }: PushRegistrationParams) => {
            const registerBaseUrl = __DEV__
                ? process.env.NOTIFICATION_CENTER_REGISTER_DEV
                : process.env.NOTIFICATION_CENTER_REGISTER_PROD

            const registerUrl = registerBaseUrl + "/api/v1/push-registrations"
            const appId = __DEV__ ? process.env.ONE_SIGNAL_APP_ID : process.env.ONE_SIGNAL_APP_ID_PROD

            if (!registerUrl) {
                throw new Error("Notification center URL is not configured")
            }

            const walletAddresses = accounts.map(account => account.address)

            if (walletAddresses.length === 0) {
                throw new Error("No wallet addresses available")
            }

            const payload: PushRegistrationPayload = {
                walletAddresses,
                provider: "onesignal",
                providerDetails: {
                    appId: appId as string,
                    subscriptionId,
                },
            }

            const response = await fetch(registerUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                const err = new Error(`Push registration failed with status ${response.status}`)
                ;(err as any).response = { status: response.status, data: errorData }
                throw err
            }

            const now = Date.now()
            dispatch(updateLastSuccessfulRegistration(now))
            dispatch(updateLastSubscriptionId(subscriptionId))
            dispatch(updateLastWalletAddresses(walletAddresses))

            info("APP", "Push registration successful at", new Date(now).toISOString())
            return response
        },
        [accounts, dispatch],
    )

    const mutation = useMutation({
        mutationFn: registerPush,
        retry: (failureCount, err) => {
            // Stop retrying after MAX_RETRIES attempts
            if (failureCount >= MAX_RETRIES) {
                return false
            }
            // Only retry on 5xx errors or network errors
            return isRetryableError(err)
        },
        retryDelay: attemptIndex => {
            // Exponential backoff: 1s, 2s, 4s
            const delayMs = 1000 * Math.pow(2, attemptIndex)
            info(
                "APP",
                `Push registration failed, retrying in ${delayMs}ms (attempt ${attemptIndex + 1}/${MAX_RETRIES})`,
            )
            return delayMs
        },
        onError: (err: any) => {
            error(ERROR_EVENTS.NOTIFICATION_CENTER, err)
        },
    })

    const shouldRegister = useCallback(
        (currentSubscriptionId: string | null): boolean => {
            if (!lastSuccessfulRegistration) {
                info("APP", "Should register: never registered before")
                return true
            }

            const timeSinceLastSuccess = Date.now() - lastSuccessfulRegistration
            if (timeSinceLastSuccess >= THIRTY_DAYS_MS) {
                info("APP", "Should register: more than 30 days since last success")
                return true
            }

            if (currentSubscriptionId !== lastSubscriptionId) {
                info("APP", "Should register: subscription ID changed", lastSubscriptionId, "->", currentSubscriptionId)
                return true
            }

            // Check if wallet addresses have changed
            const currentWalletAddresses = accounts.map(account => account.address).sort()
            const previousWalletAddresses = lastWalletAddresses?.slice().sort() || []

            if (
                currentWalletAddresses.length !== previousWalletAddresses.length ||
                !currentWalletAddresses.every((addr, idx) => addr === previousWalletAddresses[idx])
            ) {
                info("APP", "Should register: wallet addresses changed")
                return true
            }

            info(
                "APP",
                "Should NOT register: recent successful registration with same subscription ID and wallet addresses",
            )
            return false
        },
        [lastSuccessfulRegistration, lastSubscriptionId, lastWalletAddresses, accounts],
    )

    return {
        register: mutation.mutate,
        registerAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        shouldRegister,
    }
}
