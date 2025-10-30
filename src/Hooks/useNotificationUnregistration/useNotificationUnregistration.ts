import { useMutation } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { OneSignal } from "react-native-onesignal"
import { NETWORK_TYPE } from "~Model"
import { unregisterPushNotification } from "~Networking/NotificationCenter/NotificationCenterAPI"
import {
    addPendingUnregistrations,
    incrementUnregistrationAttempts,
    removePendingUnregistrations,
    removeFromWalletRegistrations,
    selectAccounts,
    selectPendingUnregistrations,
    selectUnregistrationAttempts,
    selectWalletRegistrations,
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

const BATCH_SIZE = 5
const MAX_RETRIES = 10
const NOTIFICATION_CENTER_EVENT = ERROR_EVENTS.NOTIFICATION_CENTER

export const useNotificationUnregistration = ({ enabled = true }: { enabled?: boolean } = {}) => {
    const dispatch = useAppDispatch()
    const accounts = useAppSelector(selectAccounts)
    const walletRegistrations = useAppSelector(selectWalletRegistrations)
    const pendingUnregistrations = useAppSelector(selectPendingUnregistrations)
    const unregistrationAttempts = useAppSelector(selectUnregistrationAttempts)

    // Track previous wallet addresses to detect removals
    const prevWalletAddressesRef = useRef<string[]>([])

    const currentWalletAddresses = useMemo(
        () => accounts.filter(account => !AccountUtils.isObservedAccount(account)).map(account => account.address),
        [accounts],
    )

    const { mutateAsync } = useMutation({
        mutationFn: async (params: { subscriptionId: string | null; addresses: string[] }) => {
            const networkType = __DEV__ ? NETWORK_TYPE.TEST : NETWORK_TYPE.MAIN

            await unregisterPushNotification({
                networkType,
                walletAddresses: params.addresses,
                subscriptionId: params.subscriptionId,
            })

            return { success: true }
        },
        retry: (failureCount, err) => {
            if (failureCount >= MAX_RETRIES) {
                error(NOTIFICATION_CENTER_EVENT, "Push unregistration failed, max retries reached")
                return false
            }

            // Only retry on 5xx errors or network errors
            return isRetryableError(err)
        },
        retryDelay: attemptIndex => {
            // Exponential backoff: 1s, 2s, 4s, 8s...
            const delayMs = 1000 * Math.pow(2, attemptIndex)
            info(
                NOTIFICATION_CENTER_EVENT,
                `Push unregistration failed, retrying in ${delayMs}ms (attempt ${attemptIndex + 1}/${MAX_RETRIES})`,
            )
            return delayMs
        },
        onError: (err: any) => {
            error(ERROR_EVENTS.NOTIFICATION_CENTER, err)
        },
    })

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
                dispatch(addPendingUnregistrations(registeredRemovedAddresses))

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

    // Process pending unregistrations
    useEffect(() => {
        if (!enabled || pendingUnregistrations.length === 0) {
            return
        }

        const processUnregistrations = async () => {
            try {
                const subId = await OneSignal.User.pushSubscription.getIdAsync()

                // Filter out addresses that have exceeded max retries
                const addressesToProcess = pendingUnregistrations
                    .filter(wallet => wallet.attempts < MAX_RETRIES)
                    .map(wallet => wallet.address)

                if (addressesToProcess.length === 0) {
                    info(NOTIFICATION_CENTER_EVENT, "No pending unregistrations to process (all exceeded max retries)")
                    // Clean up addresses that exceeded max retries
                    const exceededAddresses = pendingUnregistrations
                        .filter(wallet => wallet.attempts >= MAX_RETRIES)
                        .map(wallet => wallet.address)
                    if (exceededAddresses.length > 0) {
                        dispatch(removePendingUnregistrations(exceededAddresses))
                        error(
                            NOTIFICATION_CENTER_EVENT,
                            `Removed ${exceededAddresses.length} addresses from queue after exceeding max retries`,
                        )
                    }
                    return
                }

                // Split into batches of 5
                const batches = chunkArray(addressesToProcess, BATCH_SIZE)

                info(
                    NOTIFICATION_CENTER_EVENT,
                    `Processing ${batches.length} unregistration batch(es) of up to ${BATCH_SIZE} wallets`,
                )

                // Send batches sequentially
                for (let i = 0; i < batches.length; i++) {
                    const batch = batches[i]
                    info(
                        NOTIFICATION_CENTER_EVENT,
                        `Sending unregistration batch ${i + 1}/${batches.length} with ${batch.length} wallet(s)`,
                    )

                    // Increment attempt count for each address in batch
                    for (const addr of batch) {
                        dispatch(incrementUnregistrationAttempts(addr))
                    }

                    try {
                        await mutateAsync({ subscriptionId: subId, addresses: batch })

                        // On success, remove from pending queue
                        dispatch(removePendingUnregistrations(batch))

                        info(
                            NOTIFICATION_CENTER_EVENT,
                            `Successfully unregistered batch ${i + 1}/${batches.length}, removed from queue`,
                        )
                    } catch (err) {
                        error(
                            NOTIFICATION_CENTER_EVENT,
                            `Failed to unregister batch ${i + 1}/${batches.length}`,
                            err,
                        )
                        // Don't remove from queue on failure - will retry on next effect run
                    }
                }

                info(NOTIFICATION_CENTER_EVENT, "All unregistration batches processed")
            } catch (err) {
                error(ERROR_EVENTS.NOTIFICATION_CENTER, err)
            }
        }

        processUnregistrations()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, pendingUnregistrations.length]) // Only re-run when queue length changes

    return {}
}
