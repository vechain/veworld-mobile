import { useMutation } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { OneSignal } from "react-native-onesignal"
import { NETWORK_TYPE } from "~Model"
import {
    registerPushNotification,
    unregisterPushNotification,
} from "~Networking/NotificationCenter/NotificationCenterAPI"
import { selectAccounts, selectRegistrations, setRegistrations, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { Registration, RegistrationState } from "~Storage/Redux/Types"
import { AccountUtils, error, info } from "~Utils"
import HexUtils from "~Utils/HexUtils"
import { ERROR_EVENTS } from "../../Constants"

type NotificationOperation = "REGISTER" | "UNREGISTER"

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
const BATCH_SIZE = 5
const MAX_RETRIES = 3

const NOTIFICATION_CENTER_EVENT = ERROR_EVENTS.NOTIFICATION_CENTER

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

/**
 * Process removed addresses - mark for unregistration
 */
const processRemovedAddresses = (
    existingRegistrations: Registration[],
    currentAddressSet: Set<string>,
    now: number,
): Registration[] => {
    return existingRegistrations
        .filter(reg => !currentAddressSet.has(reg.address))
        .map(reg => {
            if (reg.state !== RegistrationState.PENDING_UNREGISTER) {
                info(NOTIFICATION_CENTER_EVENT, `Marking address for unregistration: ${reg.address}`)
                return {
                    ...reg,
                    state: RegistrationState.PENDING_UNREGISTER,
                    stateTransitionedTime: now,
                    consecutiveFailures: 0, // Reset on app restart
                }
            } else {
                // Already pending unregister, just reset failures
                return {
                    ...reg,
                    consecutiveFailures: 0,
                }
            }
        })
}

/**
 * Process existing addresses - check for 30-day re-registration
 */
const processExistingAddresses = (
    existingRegistrations: Registration[],
    currentAddressSet: Set<string>,
    now: number,
): Registration[] => {
    return existingRegistrations
        .filter(reg => currentAddressSet.has(reg.address))
        .map(reg => {
            // Check for 30-day re-registration
            if (reg.state === RegistrationState.ACTIVE && reg.lastSuccessfulSync) {
                const timeSinceSync = now - reg.lastSuccessfulSync
                if (timeSinceSync >= THIRTY_DAYS_MS) {
                    info(NOTIFICATION_CENTER_EVENT, `30 days passed for ${reg.address}, marking for re-registration`)
                    return {
                        ...reg,
                        state: RegistrationState.PENDING_REREGISTER,
                        stateTransitionedTime: now,
                        consecutiveFailures: 0, // Reset failures on app restart
                    }
                }
            }

            // No changes needed, just reset failures
            return {
                ...reg,
                consecutiveFailures: 0, // Reset failures on app restart
            }
        })
}

/**
 * Find and create registrations for new addresses
 */
const processNewAddresses = (
    existingRegistrations: Registration[],
    currentAddresses: string[],
    now: number,
): Registration[] => {
    const existingAddressSet = new Set(existingRegistrations.map(r => r.address))
    const newAddresses = currentAddresses.filter(addr => !existingAddressSet.has(addr))

    return newAddresses.map(address => {
        info(NOTIFICATION_CENTER_EVENT, `New address detected, adding as PENDING: ${address}`)
        return {
            address,
            state: RegistrationState.PENDING,
            stateTransitionedTime: now,
            consecutiveFailures: 0,
        }
    })
}

/**
 * Compute updated registrations based on current state
 * This handles all business logic for state transitions
 */
const computeUpdatedRegistrations = (
    currentWalletAddresses: string[],
    existingRegistrations: Registration[],
): Registration[] => {
    const now = Date.now()
    const currentAddressSet = new Set(currentWalletAddresses)

    // Process removed, existing, and new addresses
    const removedUpdated = processRemovedAddresses(existingRegistrations, currentAddressSet, now)
    const existingUpdated = processExistingAddresses(existingRegistrations, currentAddressSet, now)
    const newRegistrations = processNewAddresses(existingRegistrations, currentWalletAddresses, now)

    return [...removedUpdated, ...existingUpdated, ...newRegistrations]
}

export const useNotificationSync = ({ enabled = true }: { enabled?: boolean } = {}) => {
    const dispatch = useAppDispatch()
    const accounts = useAppSelector(selectAccounts)
    const registrations = useAppSelector(selectRegistrations)

    const isProcessingRef = useRef(false)

    const currentWalletAddresses = useMemo(
        () =>
            accounts
                .filter(account => !AccountUtils.isObservedAccount(account))
                .map(account => HexUtils.normalize(account.address)),
        [accounts],
    )

    /**
     * Mutation for API calls
     */
    const { mutateAsync } = useMutation({
        mutationFn: async (params: {
            subscriptionId: string | null
            addresses: string[]
            operation: NotificationOperation
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
            if (failureCount >= MAX_RETRIES) {
                error(
                    NOTIFICATION_CENTER_EVENT,
                    `Push notification operation failed, max retries (${MAX_RETRIES}) reached`,
                )
                return false
            }
            return isRetryableError(err)
        },
        retryDelay: attemptIndex => {
            const delayMs = 1000 * Math.pow(2, attemptIndex)
            info(NOTIFICATION_CENTER_EVENT, `Retrying in ${delayMs}ms (attempt ${attemptIndex + 1}/${MAX_RETRIES})`)
            return delayMs
        },
        onError: (err: any) => {
            error(ERROR_EVENTS.NOTIFICATION_CENTER, err)
        },
    })

    /**
     * Process a batch of registrations
     */
    const processBatch = useCallback(
        async (regs: Registration[], operation: NotificationOperation, subscriptionId: string | null) => {
            const addresses = regs.map(r => r.address)
            const batches = chunkArray(addresses, BATCH_SIZE)

            info(
                NOTIFICATION_CENTER_EVENT,
                `Processing ${batches.length} ${operation.toLowerCase()} batch(es) of up to ${BATCH_SIZE} wallets`,
            )

            for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
                const batch = batches[batchIndex]
                info(
                    NOTIFICATION_CENTER_EVENT,
                    `Sending ${operation.toLowerCase()} batch ${batchIndex + 1}/${batches.length} with ${
                        batch.length
                    } wallet(s)`,
                )

                try {
                    await mutateAsync({ subscriptionId, addresses: batch, operation })

                    // Success - update registrations
                    const now = Date.now()
                    const updatedRegistrations = registrations.map(reg => {
                        if (batch.includes(reg.address)) {
                            if (operation === "UNREGISTER") {
                                // Don't include in updated array (remove it)
                                return null
                            } else {
                                // REGISTER or REREGISTER - mark as ACTIVE
                                return {
                                    ...reg,
                                    state: RegistrationState.ACTIVE,
                                    stateTransitionedTime: now,
                                    lastSuccessfulSync: now,
                                    consecutiveFailures: 0,
                                    lastError: undefined,
                                }
                            }
                        }
                        return reg
                    })

                    // Filter out nulls (unregistered addresses)
                    const filteredRegistrations = updatedRegistrations.filter((r): r is Registration => r !== null)
                    dispatch(setRegistrations(filteredRegistrations))

                    info(
                        NOTIFICATION_CENTER_EVENT,
                        `Successfully ${operation.toLowerCase()}ed batch ${batchIndex + 1}/${batches.length}`,
                    )
                } catch (err: any) {
                    // Failure - increment consecutive failures
                    const updatedRegistrations = registrations.map(reg => {
                        if (batch.includes(reg.address)) {
                            const newFailureCount = reg.consecutiveFailures + 1
                            return {
                                ...reg,
                                consecutiveFailures: newFailureCount,
                                lastError: err?.message || "Unknown error",
                            }
                        }
                        return reg
                    })

                    dispatch(setRegistrations(updatedRegistrations))

                    error(
                        NOTIFICATION_CENTER_EVENT,
                        `Failed to ${operation.toLowerCase()} batch ${batchIndex + 1}/${batches.length}`,
                        err,
                    )
                }
            }
        },
        [dispatch, mutateAsync, registrations],
    )

    /**
     * Process all pending registrations/unregistrations
     */
    const processAllRegistrations = useCallback(
        async (regsToProcess: Registration[], subscriptionId: string | null) => {
            if (isProcessingRef.current) {
                info(NOTIFICATION_CENTER_EVENT, "Already processing registrations, skipping")
                return
            }

            isProcessingRef.current = true

            try {
                // Filter registrations that need processing (exclude those that exceeded retries)
                const pendingRegister = regsToProcess.filter(
                    r =>
                        (r.state === RegistrationState.PENDING || r.state === RegistrationState.PENDING_REREGISTER) &&
                        r.consecutiveFailures < MAX_RETRIES,
                )
                const pendingUnregister = regsToProcess.filter(
                    r => r.state === RegistrationState.PENDING_UNREGISTER && r.consecutiveFailures < MAX_RETRIES,
                )

                // Log any that exceeded max retries
                const exceededRetries = regsToProcess.filter(r => r.consecutiveFailures >= MAX_RETRIES)
                if (exceededRetries.length > 0) {
                    for (const reg of exceededRetries) {
                        const errorMsg =
                            `Registration for ${reg.address} exceeded ${MAX_RETRIES} consecutive failures. ` +
                            `Last error: ${reg.lastError}`
                        error(NOTIFICATION_CENTER_EVENT, errorMsg)
                    }
                }

                // Process registrations first, then unregistrations
                if (pendingRegister.length > 0) {
                    await processBatch(pendingRegister, "REGISTER", subscriptionId)
                }

                if (pendingUnregister.length > 0) {
                    await processBatch(pendingUnregister, "UNREGISTER", subscriptionId)
                }
            } finally {
                isProcessingRef.current = false
            }
        },
        [processBatch],
    )

    /**
     * Effect: Sync and process on mount and when accounts change
     */
    useEffect(() => {
        if (!enabled) {
            return
        }

        const syncAndProcess = async () => {
            try {
                const subscriptionId = await OneSignal.User.pushSubscription.getIdAsync()

                // First, sync states (detect new/removed addresses, check 30 days, etc.)
                const updatedRegistrations = computeUpdatedRegistrations(currentWalletAddresses, registrations)
                dispatch(setRegistrations(updatedRegistrations))

                // Then, process any pending operations
                await processAllRegistrations(updatedRegistrations, subscriptionId)
            } catch (err) {
                error(ERROR_EVENTS.NOTIFICATION_CENTER, err)
            }
        }

        syncAndProcess()
    }, [enabled, currentWalletAddresses, registrations, dispatch, processAllRegistrations])

    return {}
}
