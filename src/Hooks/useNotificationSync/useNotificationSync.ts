import { useMutation } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { OneSignal } from "react-native-onesignal"
import { NETWORK_TYPE } from "~Model"
import { registerPushNotification, unregisterPushNotification } from "~Networking/NotificationCenter/NotificationCenterAPI"
import {
    addPendingWallets,
    incrementPendingWalletAttempts,
    removePendingWallets,
    removeFromWalletRegistrations,
    selectAccounts,
    selectLastFullRegistration,
    selectLastSubscriptionId,
    selectWalletRegistrations,
    selectWalletsPending,
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
const MAX_RETRIES_REGISTER = 3
const MAX_RETRIES_UNREGISTER = 10
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

export const useNotificationSync = ({ enabled = true }: { enabled?: boolean } = {}) => {
    const dispatch = useAppDispatch()
    const accounts = useAppSelector(selectAccounts)

    const walletRegistrations = useAppSelector(selectWalletRegistrations)
    const lastFullRegistration = useAppSelector(selectLastFullRegistration)
    const lastSubscriptionId = useAppSelector(selectLastSubscriptionId)
    const walletsPending = useAppSelector(selectWalletsPending)

    // Track previous wallet addresses to detect removals
    const prevWalletAddressesRef = useRef<string[]>([])

    const currentWalletAddresses = useMemo(
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
                return currentWalletAddresses
            }

            // If no full registration has happened, register all
            if (!lastFullRegistration) {
                info(NOTIFICATION_CENTER_EVENT, "Registering all wallets: no previous full registration")
                return currentWalletAddresses
            }

            // If last full registration was >30 days ago, re-register all
            const timeSinceFullRegistration = now - lastFullRegistration
            if (timeSinceFullRegistration >= THIRTY_DAYS_MS) {
                info(NOTIFICATION_CENTER_EVENT, "Re-registering all wallets: 30 days since last full registration")
                return currentWalletAddresses
            }

            // Otherwise, only register wallets that are new or haven't been registered in 30 days
            return currentWalletAddresses.filter(address => {
                const lastRegistered = getRegistrationTimestamp(walletRegistrations, address)
                if (!lastRegistered) {
                    return true // New wallet
                }
                const timeSinceRegistration = now - lastRegistered
                return timeSinceRegistration >= THIRTY_DAYS_MS
            })
        },
        [lastFullRegistration, lastSubscriptionId, currentWalletAddresses, walletRegistrations],
    )

    // Unified mutation for both register and unregister
    const { mutateAsync } = useMutation({
        mutationFn: async (params: {
            subscriptionId: string | null
            addresses: string[]
            operation: "REGISTER" | "UNREGISTER"
        }) => {
            const networkType = __DEV__ ? NETWORK_TYPE.TEST : NETWORK_TYPE.MAIN
            const apiCall = params.operation === "REGISTER" ? registerPushNotification : unregisterPushNotification

            await apiCall({
                networkType,
                walletAddresses: params.addresses,
                subscriptionId: params.subscriptionId,
            })

            return { operation: params.operation, addresses: params.addresses }
        },
        retry: (failureCount, err) => {
            // Use max of both retry limits - the batch processing will handle per-operation logic
            const maxRetries = Math.max(MAX_RETRIES_REGISTER, MAX_RETRIES_UNREGISTER)

            if (failureCount >= maxRetries) {
                error(NOTIFICATION_CENTER_EVENT, `Push notification operation failed, max retries (${maxRetries}) reached`)
                return false
            }

            // Only retry on 5xx errors or network errors
            return isRetryableError(err)
        },
        retryDelay: attemptIndex => {
            // Exponential backoff: 1s, 2s, 4s, 8s...
            const delayMs = 1000 * Math.pow(2, attemptIndex)
            info(NOTIFICATION_CENTER_EVENT, `Retrying in ${delayMs}ms (attempt ${attemptIndex + 1})`)
            return delayMs
        },
        onError: (err: any) => {
            error(ERROR_EVENTS.NOTIFICATION_CENTER, err)
        },
    })

    // Process pending queue (both registrations and unregistrations)
    useEffect(() => {
        if (!enabled || walletsPending.length === 0) {
            return
        }

        const processQueue = async () => {
            try {
                const subId = await OneSignal.User.pushSubscription.getIdAsync()

                // Group by operation type
                const toRegister = walletsPending.filter(w => w.status === "REGISTER")
                const toUnregister = walletsPending.filter(w => w.status === "UNREGISTER")

                // Process unregistrations first
                if (toUnregister.length > 0) {
                    await processBatches(toUnregister, "UNREGISTER", subId)
                }

                // Process registrations
                if (toRegister.length > 0) {
                    await processBatches(toRegister, "REGISTER", subId)
                }
            } catch (err) {
                error(ERROR_EVENTS.NOTIFICATION_CENTER, err)
            }
        }

        const processBatches = async (
            wallets: typeof walletsPending,
            operation: "REGISTER" | "UNREGISTER",
            subscriptionId: string | null,
        ) => {
            const maxRetries = operation === "REGISTER" ? MAX_RETRIES_REGISTER : MAX_RETRIES_UNREGISTER

            // Filter out addresses that have exceeded max retries
            const addressesToProcess = wallets
                .filter(w => w.attempts < maxRetries)
                .map(w => w.address)

            if (addressesToProcess.length === 0) {
                info(NOTIFICATION_CENTER_EVENT, `No pending ${operation.toLowerCase()}s to process (all exceeded max retries)`)
                // Clean up addresses that exceeded max retries
                const exceededAddresses = wallets
                    .filter(w => w.attempts >= maxRetries)
                    .map(w => w.address)

                if (exceededAddresses.length > 0) {
                    dispatch(removePendingWallets({ addresses: exceededAddresses, status: operation }))
                    error(
                        NOTIFICATION_CENTER_EVENT,
                        `Removed ${exceededAddresses.length} addresses from ${operation.toLowerCase()} queue after exceeding max retries`,
                    )
                }
                return
            }

            // Split into batches of 5
            const batches = chunkArray(addressesToProcess, BATCH_SIZE)

            info(
                NOTIFICATION_CENTER_EVENT,
                `Processing ${batches.length} ${operation.toLowerCase()} batch(es) of up to ${BATCH_SIZE} wallets`,
            )

            // Send batches sequentially
            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i]
                info(
                    NOTIFICATION_CENTER_EVENT,
                    `Sending ${operation.toLowerCase()} batch ${i + 1}/${batches.length} with ${batch.length} wallet(s)`,
                )

                // Increment attempt count for each address in batch
                for (const addr of batch) {
                    dispatch(incrementPendingWalletAttempts({ address: addr, status: operation }))
                }

                try {
                    const result = await mutateAsync({ subscriptionId, addresses: batch, operation })

                    // On success, handle based on operation type
                    if (operation === "REGISTER") {
                        const now = Date.now()
                        dispatch(updateWalletRegistrations({ addresses: batch, timestamp: now }))
                        dispatch(updateLastSubscriptionId(subscriptionId))
                    }

                    // Remove from pending queue
                    dispatch(removePendingWallets({ addresses: batch, status: operation }))

                    info(
                        NOTIFICATION_CENTER_EVENT,
                        `Successfully ${operation.toLowerCase()}ed batch ${i + 1}/${batches.length}, removed from queue`,
                    )
                } catch (err) {
                    error(
                        NOTIFICATION_CENTER_EVENT,
                        `Failed to ${operation.toLowerCase()} batch ${i + 1}/${batches.length}`,
                        err,
                    )
                    // Don't remove from queue on failure - will retry on next effect run
                }
            }

            info(NOTIFICATION_CENTER_EVENT, `All ${operation.toLowerCase()} batches processed`)
        }

        processQueue()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, walletsPending.length]) // Only re-run when queue length changes

    // Detect wallet additions and trigger registration
    useEffect(() => {
        if (!enabled || currentWalletAddresses.length === 0) {
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

                const isFullRegistration = walletsToRegister.length === currentWalletAddresses.length

                info(NOTIFICATION_CENTER_EVENT, `Adding ${walletsToRegister.length} wallet(s) to registration queue`)

                // Add to pending queue
                dispatch(addPendingWallets({ addresses: walletsToRegister, status: "REGISTER" }))

                // If we're registering all wallets, update lastFullRegistration after success
                // This will be handled in the queue processing logic
                if (isFullRegistration) {
                    const now = Date.now()
                    dispatch(updateLastFullRegistration(now))
                    info(NOTIFICATION_CENTER_EVENT, "Full registration scheduled at", new Date(now).toISOString())
                }
            } catch (err) {
                error(ERROR_EVENTS.NOTIFICATION_CENTER, err)
            }
        }

        register()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, currentWalletAddresses])

    // Detect removed wallet addresses
    useEffect(() => {
        if (!enabled) return

        const prevAddresses = prevWalletAddressesRef.current
        const currentAddresses = currentWalletAddresses

        // Find addresses that were removed
        const removedAddresses = prevAddresses.filter(
            addr => !currentAddresses.includes(addr) && !currentAddresses.includes(HexUtils.normalize(addr)),
        )

        if (removedAddresses.length > 0) {
            info(NOTIFICATION_CENTER_EVENT, `Detected ${removedAddresses.length} removed wallet(s)`, removedAddresses)

            // Only add addresses that were actually registered
            const registeredRemovedAddresses = removedAddresses.filter(addr => {
                if (!walletRegistrations) return false
                const normalizedAddr = HexUtils.normalize(addr)
                return normalizedAddr in walletRegistrations
            })

            if (registeredRemovedAddresses.length > 0) {
                // Add to pending unregistrations queue
                dispatch(addPendingWallets({ addresses: registeredRemovedAddresses, status: "UNREGISTER" }))

                // Remove from wallet registrations immediately
                dispatch(removeFromWalletRegistrations(registeredRemovedAddresses))

                info(
                    NOTIFICATION_CENTER_EVENT,
                    `Added ${registeredRemovedAddresses.length} wallet(s) to unregistration queue`,
                )
            }
        }

        // Update ref for next comparison
        prevWalletAddressesRef.current = currentAddresses
    }, [currentWalletAddresses, enabled, dispatch, walletRegistrations])

    // Return nothing - hook is fully self-contained
    return {}
}
