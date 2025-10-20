import { useMutation } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo } from "react"
import { OneSignal } from "react-native-onesignal"
import {
    selectAccounts,
    selectLastFullRegistration,
    selectLastSubscriptionId,
    selectWalletRegistrations,
    updateLastFullRegistration,
    updateLastSubscriptionId,
    updateWalletRegistrations,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { error, info } from "~Utils"
import HexUtils from "~Utils/HexUtils"
import { ERROR_EVENTS } from "../../Constants"

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
const MAX_RETRIES = 3
const BATCH_SIZE = 5
const REQUEST_TIMEOUT_MS = 15000 // 15 seconds

const NOTIFICATION_CENTER_EVENT = ERROR_EVENTS.NOTIFICATION_CENTER

const chunkArray = <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size))
    }
    return chunks
}

const getRegistrationTimestamp = (
    walletRegistrations: Record<string, number> | null,
    address: string,
): number | undefined => {
    if (!walletRegistrations) return undefined

    // Addresses are stored normalized, so normalize the lookup key
    const normalizedAddress = HexUtils.normalize(address)
    return walletRegistrations[normalizedAddress]
}

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

export const useNotificationCenter = ({ enabled = true }: { enabled?: boolean } = {}) => {
    const dispatch = useAppDispatch()
    const accounts = useAppSelector(selectAccounts)

    const walletRegistrations = useAppSelector(selectWalletRegistrations)
    const lastFullRegistration = useAppSelector(selectLastFullRegistration)
    const lastSubscriptionId = useAppSelector(selectLastSubscriptionId)

    const walletAddresses = useMemo(() => accounts.map(account => account.address), [accounts])

    const getWalletsNeedingRegistration = useCallback(
        (currentSubscriptionId: string | null): string[] => {
            const now = Date.now()

            // If subscription ID changed, re-register all wallets
            if (currentSubscriptionId !== lastSubscriptionId) {
                info(
                    NOTIFICATION_CENTER_EVENT,
                    "Re-registering all wallets: subscription ID changed",
                    lastSubscriptionId,
                    "->",
                    currentSubscriptionId,
                )
                return walletAddresses
            }

            // If no full registration has happened, register all
            if (!lastFullRegistration) {
                info(NOTIFICATION_CENTER_EVENT, "Registering all wallets: no previous full registration")
                return walletAddresses
            }

            // If last full registration was >30 days ago, re-register all
            const timeSinceFullRegistration = now - lastFullRegistration
            if (timeSinceFullRegistration >= THIRTY_DAYS_MS) {
                info(NOTIFICATION_CENTER_EVENT, "Re-registering all wallets: 30 days since last full registration")
                return walletAddresses
            }

            // Otherwise, only register wallets that are new or haven't been registered in 30 days
            return walletAddresses.filter(address => {
                const lastRegistered = getRegistrationTimestamp(walletRegistrations, address)
                if (!lastRegistered) {
                    return true // New wallet
                }
                const timeSinceRegistration = now - lastRegistered
                return timeSinceRegistration >= THIRTY_DAYS_MS
            })
        },
        [lastFullRegistration, lastSubscriptionId, walletAddresses, walletRegistrations],
    )

    const sendRegistration = useCallback(
        async (subscriptionId: string | null, addressesToRegister: string[]) => {
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

            if (addressesToRegister.length === 0) {
                info(NOTIFICATION_CENTER_EVENT, "No wallet addresses to register, skipping")
                return null
            }

            const payload: RegistrationPayload = {
                walletAddresses: addressesToRegister,
                provider: "onesignal",
                providerDetails: {
                    appId,
                    subscriptionId,
                },
            }

            info(NOTIFICATION_CENTER_EVENT, "Registering push notification", {
                walletCount: addressesToRegister.length,
                registerUrl,
                addressesToRegister,
            })

            const httpTimeoutController = new AbortController()
            const timeoutId = setTimeout(() => httpTimeoutController.abort(), REQUEST_TIMEOUT_MS)

            try {
                const response = await fetch(registerUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                    signal: httpTimeoutController.signal,
                })

                clearTimeout(timeoutId)

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}))
                    const err = new Error(`Push registration failed with status ${response.status}`)
                    ;(err as any).response = { status: response.status, data: errorData }
                    throw err
                }

                const now = Date.now()
                dispatch(updateWalletRegistrations({ addresses: addressesToRegister, timestamp: now }))
                dispatch(updateLastSubscriptionId(subscriptionId))

                info(NOTIFICATION_CENTER_EVENT, "Push registration successful at", new Date(now).toISOString())
                return response
            } catch (err) {
                clearTimeout(timeoutId)
                if ((err as Error).name === "AbortError") {
                    throw new Error("Push registration request timed out")
                }
                throw err
            }
        },
        [dispatch],
    )

    const { mutateAsync } = useMutation({
        mutationFn: (params: { subscriptionId: string | null; addresses: string[] }) =>
            sendRegistration(params.subscriptionId, params.addresses),
        retry: (failureCount, err) => {
            if (failureCount >= MAX_RETRIES) {
                error(NOTIFICATION_CENTER_EVENT, "Push registration failed, max retries reached")
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

    // Automatically register when wallet addresses change and hook is enabled
    useEffect(() => {
        if (!enabled || walletAddresses.length === 0) {
            return
        }

        const register = async () => {
            try {
                const subId = await OneSignal.User.pushSubscription.getIdAsync()

                const walletsToRegister = getWalletsNeedingRegistration(subId)
                if (walletsToRegister.length === 0) {
                    info(NOTIFICATION_CENTER_EVENT, "Registration skipped - no wallets need registration")
                    return
                }

                // Split into batches of 5
                const batches = chunkArray(walletsToRegister, BATCH_SIZE)
                const isFullRegistration = walletsToRegister.length === walletAddresses.length

                info(NOTIFICATION_CENTER_EVENT, `Sending ${batches.length} batch(es) of up to ${BATCH_SIZE} wallets`)

                // Send batches sequentially
                for (let i = 0; i < batches.length; i++) {
                    const batch = batches[i]
                    info(
                        NOTIFICATION_CENTER_EVENT,
                        `Sending batch ${i + 1}/${batches.length} with ${batch.length} wallet(s)`,
                    )

                    await mutateAsync({ subscriptionId: subId, addresses: batch })
                }

                // If we registered all wallets, update lastFullRegistration
                if (isFullRegistration) {
                    const now = Date.now()
                    dispatch(updateLastFullRegistration(now))
                    info(NOTIFICATION_CENTER_EVENT, "Full registration completed at", new Date(now).toISOString())
                }

                info(NOTIFICATION_CENTER_EVENT, "All batches registered successfully")
            } catch (err) {
                error(ERROR_EVENTS.NOTIFICATION_CENTER, err)
            }
        }

        register()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, walletAddresses])

    // Return nothing - hook is fully self-contained
    return {}
}
