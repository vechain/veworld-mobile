import { useMutation } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo } from "react"
import { OneSignal } from "react-native-onesignal"
import { NETWORK_TYPE } from "~Model"
import { registerPushNotification } from "~Networking/NotificationCenter/NotificationCenterAPI"
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
import { AccountUtils, error, info } from "~Utils"
import HexUtils from "~Utils/HexUtils"
import { ERROR_EVENTS } from "../../Constants"

const chunkArray = <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size))
    }
    return chunks
}

const isRetryableError = (err: any): boolean => {
    if (err?.response) {
        const status = err.response.status
        return status >= 500 && status < 600
    }
    return err?.message?.toLowerCase().includes("network") || err?.code === "ECONNABORTED" || !err?.response
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
const MAX_RETRIES = 3
const BATCH_SIZE = 5

const NOTIFICATION_CENTER_EVENT = ERROR_EVENTS.NOTIFICATION_CENTER

const getRegistrationTimestamp = (
    walletRegistrations: Record<string, number> | null,
    address: string,
): number | undefined => {
    if (!walletRegistrations) return undefined

    // Addresses are stored normalized, so normalize the lookup key
    const normalizedAddress = HexUtils.normalize(address)
    return walletRegistrations[normalizedAddress]
}

export const useNotificationRegistration = ({ enabled = true }: { enabled?: boolean } = {}) => {
    const dispatch = useAppDispatch()
    const accounts = useAppSelector(selectAccounts)

    const walletRegistrations = useAppSelector(selectWalletRegistrations)
    const lastFullRegistration = useAppSelector(selectLastFullRegistration)
    const lastSubscriptionId = useAppSelector(selectLastSubscriptionId)

    const walletAddresses = useMemo(
        () => accounts.filter(account => !AccountUtils.isObservedAccount(account)).map(account => account.address),
        [accounts],
    )

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

    const { mutateAsync } = useMutation({
        mutationFn: async (params: { subscriptionId: string | null; addresses: string[] }) => {
            const networkType = __DEV__ ? NETWORK_TYPE.TEST : NETWORK_TYPE.MAIN

            await registerPushNotification({
                networkType,
                walletAddresses: params.addresses,
                subscriptionId: params.subscriptionId,
            })

            // Update Redux state on success
            const now = Date.now()
            dispatch(updateWalletRegistrations({ addresses: params.addresses, timestamp: now }))
            dispatch(updateLastSubscriptionId(params.subscriptionId))

            return now
        },
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
