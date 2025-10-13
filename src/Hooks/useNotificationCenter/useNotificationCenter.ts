import { useMutation } from "@tanstack/react-query"
import { useCallback, useMemo, useRef } from "react"
import { OneSignal } from "react-native-onesignal"
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
import { AddressUtils, error, info } from "~Utils"
import { ERROR_EVENTS } from "../../Constants"

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
const MAX_RETRIES = 3

const NOTIFICATION_CENTER_EVENT = ERROR_EVENTS.NOTIFICATION_CENTER

interface RegistrationPayload {
    walletAddresses: string[]
    provider: string
    providerDetails: {
        appId: string
        subscriptionId: string | null
    }
}

const isRetryableError = (err: any): boolean => {
    if (err?.response) {
        const status = err.response.status
        return status >= 500 && status < 600
    }
    return err?.message?.toLowerCase().includes("network") || err?.code === "ECONNABORTED" || !err?.response
}

export const useNotificationCenter = () => {
    const dispatch = useAppDispatch()
    const accounts = useAppSelector(selectAccounts)

    const lastSuccessfulRegistration = useAppSelector(selectLastSuccessfulRegistration)
    const lastSubscriptionId = useAppSelector(selectLastSubscriptionId)
    const lastWalletAddresses = useAppSelector(selectLastWalletAddresses)

    const walletAddresses = useMemo(() => accounts.map(account => account.address), [accounts])
    const sortedWalletAddresses = useMemo(() => [...walletAddresses].sort(), [walletAddresses])
    const sortedLastWalletAddresses = useMemo(() => [...(lastWalletAddresses ?? [])].sort(), [lastWalletAddresses])

    const isRegistering = useRef(false)

    const shouldRegister = useCallback(
        (currentSubscriptionId: string | null): boolean => {
            if (!lastSuccessfulRegistration) {
                info(NOTIFICATION_CENTER_EVENT, "Should register: never registered before")
                return true
            }

            const timeSinceLastSuccess = Date.now() - lastSuccessfulRegistration
            if (timeSinceLastSuccess >= THIRTY_DAYS_MS) {
                info(NOTIFICATION_CENTER_EVENT, "Should register: more than 30 days since last success")
                return true
            }

            if (currentSubscriptionId !== lastSubscriptionId) {
                info(
                    NOTIFICATION_CENTER_EVENT,
                    "Should register: subscription ID changed",
                    lastSubscriptionId,
                    "->",
                    currentSubscriptionId,
                )
                return true
            }

            // Check if wallet addresses have changed
            if (
                sortedWalletAddresses.length !== sortedLastWalletAddresses.length ||
                !sortedWalletAddresses.every((addr, idx) =>
                    AddressUtils.compareAddresses(addr, sortedLastWalletAddresses[idx]),
                )
            ) {
                info(NOTIFICATION_CENTER_EVENT, "Should register: wallet addresses changed")
                return true
            }

            info(
                NOTIFICATION_CENTER_EVENT,
                "Should NOT register: recent successful registration with same subscription ID and wallet addresses",
            )
            return false
        },
        [lastSuccessfulRegistration, lastSubscriptionId, sortedLastWalletAddresses, sortedWalletAddresses],
    )

    const sendRegistration = useCallback(
        async (subscriptionId: string | null) => {
            const registerBaseUrl = __DEV__
                ? process.env.NOTIFICATION_CENTER_REGISTER_DEV
                : process.env.NOTIFICATION_CENTER_REGISTER_PROD

            if (!registerBaseUrl) {
                throw new Error("Notification center base URL is not configured")
            }

            const registerUrl = registerBaseUrl + "/api/v1/push-registrations"
            const appId = __DEV__ ? process.env.ONE_SIGNAL_APP_ID : process.env.ONE_SIGNAL_APP_ID_PROD

            if (!appId) {
                throw new Error("OneSignal app ID is not configured")
            }

            if (walletAddresses.length === 0) {
                info(NOTIFICATION_CENTER_EVENT, "No wallet addresses available, skipping registration")
                return null
            }

            const payload: RegistrationPayload = {
                walletAddresses,
                provider: "onesignal",
                providerDetails: {
                    appId,
                    subscriptionId,
                },
            }

            info(NOTIFICATION_CENTER_EVENT, "Registering push notification", {
                walletCount: walletAddresses.length,
                registerUrl,
            })

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

            info(NOTIFICATION_CENTER_EVENT, "Push registration successful at", new Date(now).toISOString())
            return response
        },
        [dispatch, walletAddresses],
    )

    const { mutateAsync } = useMutation({
        mutationFn: sendRegistration,
        retry: (failureCount, err) => {
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
                NOTIFICATION_CENTER_EVENT,
                `Push registration failed, retrying in ${delayMs}ms (attempt ${attemptIndex + 1}/${MAX_RETRIES})`,
            )
            return delayMs
        },
        onError: (err: any) => {
            error(ERROR_EVENTS.NOTIFICATION_CENTER, err)
        },
    })

    // Wrapper function that handles all pre-flight checks and locking
    const register = useCallback(async () => {
        if (isRegistering.current) {
            info(NOTIFICATION_CENTER_EVENT, "Registration already in progress, skipping duplicate call")
            return
        }

        if (walletAddresses.length === 0) {
            info(NOTIFICATION_CENTER_EVENT, "No wallet addresses available, skipping registration")
            return
        }

        // Set lock
        isRegistering.current = true

        try {
            const subId = await OneSignal.User.pushSubscription.getIdAsync()

            if (!shouldRegister(subId)) {
                info(NOTIFICATION_CENTER_EVENT, "Registration skipped - conditions not met")
                return null
            }
            info(NOTIFICATION_CENTER_EVENT, "Attempting push notification registration")
            await mutateAsync(subId)
        } catch (err) {
            error(ERROR_EVENTS.ONE_SIGNAL, err)
        } finally {
            isRegistering.current = false
        }
    }, [mutateAsync, walletAddresses.length, shouldRegister])

    return {
        register,
    }
}
