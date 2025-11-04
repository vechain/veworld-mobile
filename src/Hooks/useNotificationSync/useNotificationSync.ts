// useNotificationSync.ts
import { useEffect, useMemo } from "react"
import { OneSignal } from "react-native-onesignal"
import {
    removeRegistrations,
    upsertRegistrations,
    selectAccounts,
    selectRegistrations,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { Registration, RegistrationState } from "~Storage/Redux/Types"
import { AccountUtils, error, info } from "~Utils"
import HexUtils from "~Utils/HexUtils"
import { ERROR_EVENTS } from "../../Constants"
import { NotificationRegistrationClient } from "../../Networking/NotificationCenter/NotificationRegistrationClient"
interface RegistrationPlan {
    toRegister: Registration[]
    toUnregister: Registration[]
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
const BATCH_SIZE = 5

const NOTIFICATION_CENTER_EVENT = ERROR_EVENTS.NOTIFICATION_CENTER

const createRegistration = (address: string, state: RegistrationState, lastSuccessfulSync?: number): Registration => {
    return {
        address,
        state,
        stateTransitionedTime: Date.now(),
        lastSuccessfulSync,
    }
}
const buildRegistrationPlan = (
    currentWalletAddresses: string[],
    existingRegistrations: Registration[],
): RegistrationPlan => {
    const now = Date.now()
    const oldAddressSet = new Set(existingRegistrations.map(r => r.address))
    const newAddressSet = new Set(currentWalletAddresses)

    const isDueReregister = (reg: Registration): boolean =>
        newAddressSet.has(reg.address) &&
        reg.state === RegistrationState.ACTIVE &&
        reg.lastSuccessfulSync !== undefined &&
        now - reg.lastSuccessfulSync >= THIRTY_DAYS_MS

    const toUnregister: Registration[] = []
    const toRegister: Registration[] = []

    for (const reg of existingRegistrations) {
        // Unregistrations
        if (!newAddressSet.has(reg.address)) {
            const unreg = createRegistration(
                reg.address,
                RegistrationState.PENDING_UNREGISTER,
                reg.lastSuccessfulSync ?? now,
            )
            toUnregister.push(unreg)
        }
        // New registrations
        else if (!oldAddressSet.has(reg.address)) {
            toRegister.push(createRegistration(reg.address, RegistrationState.PENDING))
        }
        // Stale re-register
        else if (isDueReregister(reg)) {
            const rereg = createRegistration(
                reg.address,
                RegistrationState.PENDING_REREGISTER,
                reg.lastSuccessfulSync ?? now,
            )
            toRegister.push(rereg)
        }
    }

    info(NOTIFICATION_CENTER_EVENT, `Plan: ${toRegister.length} to register, ${toUnregister.length} to unregister`)

    return { toRegister, toUnregister }
}

export const useNotificationSync = ({ enabled = true }: { enabled?: boolean } = {}) => {
    const dispatch = useAppDispatch()
    const accounts = useAppSelector(selectAccounts)
    const registrations = useAppSelector(selectRegistrations)

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

                const gateway = new NotificationRegistrationClient(BATCH_SIZE)

                if (plan.toRegister.length) {
                    const registerResults = await gateway.registerAddresses(
                        plan.toRegister.map(r => r.address),
                        subscriptionId,
                    )

                    const successfulAddresses = registerResults.filter(r => r.success)

                    const successfulRegistrations = successfulAddresses.map(r => ({
                        address: r.address,
                        state: RegistrationState.ACTIVE,
                        stateTransitionedTime: r.timestamp,
                        lastSuccessfulSync: r.timestamp,
                    }))

                    dispatch(upsertRegistrations(successfulRegistrations))
                }

                if (plan.toUnregister.length) {
                    const unregisterResults = await gateway.unregisterAddresses(
                        plan.toUnregister.map(r => r.address),
                        subscriptionId,
                    )
                    const successfulAddresses = unregisterResults.filter(r => r.success).map(r => r.address)

                    dispatch(removeRegistrations(successfulAddresses))
                }
            } catch (err) {
                error(NOTIFICATION_CENTER_EVENT, "Error during notification registration/unregistration sync", err)
            }
        }

        // Fire-and-forget; UI doesn’t care about state
        run()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, currentWalletAddresses])

    return {}
}
