import { useEffect, useMemo } from "react"
import { OneSignal } from "react-native-onesignal"
import {
    removeRegistrations,
    upsertRegistrations,
    selectAccounts,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { registrationSelectors } from "~Storage/Redux/Slices/Notification"
import { Registration } from "~Storage/Redux/Types"
import { AccountUtils, error, info } from "~Utils"
import HexUtils from "~Utils/HexUtils"
import { ERROR_EVENTS } from "../../Constants"
import { RegistrationClient } from "../../Networking/NotificationCenter/RegistrationClient"

interface RegistrationPlan {
    toRegister: string[]
    toUnregister: string[]
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

const NOTIFICATION_CENTER_EVENT = ERROR_EVENTS.NOTIFICATION_CENTER

const buildRegistrationPlan = (
    currentWalletAddresses: string[],
    existingRegistrations: Registration[],
): RegistrationPlan => {
    const now = Date.now()
    const oldAddressSet = new Set(existingRegistrations.map(r => r.address))
    const newAddressSet = new Set(currentWalletAddresses)

    const isDueReregister = (reg: Registration): boolean =>
        newAddressSet.has(reg.address) &&
        reg.lastSuccessfulSync !== undefined &&
        now - reg.lastSuccessfulSync >= THIRTY_DAYS_MS

    // removed addreses
    let removedAddresses = []
    for (const address of oldAddressSet) {
        if (!newAddressSet.has(address)) {
            removedAddresses.push(address)
        }
    }
    // New addresses
    let newAddresses = []
    for (const address of newAddressSet) {
        if (!oldAddressSet.has(address)) {
            newAddresses.push(address)
        }
    }
    // Re-register addresses that are due
    let reRegisterAddresses: string[] = []
    for (const registration of existingRegistrations) {
        if (isDueReregister(registration)) {
            reRegisterAddresses.push(registration.address)
        }
    }

    const toUnregister = removedAddresses
    const toRegister = [...newAddresses, ...reRegisterAddresses]
    info(NOTIFICATION_CENTER_EVENT, `Plan: ${toRegister.length} to register, ${toUnregister.length} to unregister`)

    return { toRegister, toUnregister }
}

export const useNotificationRegistration = ({ enabled = true }: { enabled?: boolean } = {}) => {
    const dispatch = useAppDispatch()
    const accounts = useAppSelector(selectAccounts)
    const registrations = useAppSelector(state => registrationSelectors.selectAll(state.notification))

    const currentWalletAddresses = useMemo(
        () => accounts.filter(a => !AccountUtils.isObservedAccount(a)).map(a => HexUtils.normalize(a.address)),
        [accounts],
    )

    useEffect(() => {
        if (!enabled) return

        const run = async () => {
            try {
                const subscriptionId = await OneSignal.User.pushSubscription.getIdAsync()

                const plan = buildRegistrationPlan(currentWalletAddresses, registrations)

                if (plan.toRegister.length) {
                    const registerResults = await RegistrationClient.registerAddresses(plan.toRegister, subscriptionId)

                    const successfulAddresses = registerResults.filter(r => r.success)

                    const successfulRegistrations = successfulAddresses.map(r => ({
                        address: r.address,
                        lastSuccessfulSync: r.timestamp,
                    }))

                    dispatch(upsertRegistrations(successfulRegistrations))
                }

                if (plan.toUnregister.length) {
                    const unregisterResults = await RegistrationClient.unregisterAddresses(
                        plan.toUnregister,
                        subscriptionId,
                    )

                    const successfulAddresses = unregisterResults.filter(r => r.success).map(r => r.address)

                    dispatch(removeRegistrations(successfulAddresses))
                }
            } catch (err) {
                error(NOTIFICATION_CENTER_EVENT, "Error during notification registration/unregistration sync", err)
            }
        }

        // Fire-and-forget; UI doesn't care about state
        run()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, currentWalletAddresses])

    return {}
}
