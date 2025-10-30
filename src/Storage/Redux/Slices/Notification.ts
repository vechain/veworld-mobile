import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import HexUtils from "~Utils/HexUtils"
import { NotificationState } from "../Types"

export const initialNotificationState: NotificationState = {
    feautureEnabled: false,
    permissionEnabled: null,
    optedIn: null,
    dappVisitCounter: {},
    userTags: {},
    dappNotifications: true,
    walletRegistrations: null,
    lastFullRegistration: null,
    lastSubscriptionId: null,
    walletsPending: [],
}

export const Notification = createSlice({
    name: "notification",
    initialState: initialNotificationState,
    reducers: {
        updateNotificationFeatureFlag: (state, action: PayloadAction<boolean>) => {
            state.feautureEnabled = action.payload
        },
        updateNotificationPermission: (state, action: PayloadAction<boolean>) => {
            state.permissionEnabled = action.payload
        },
        updateNotificationOptedIn: (state, action: PayloadAction<boolean>) => {
            state.optedIn = action.payload
        },
        increaseDappVisitCounter: (state, action: PayloadAction<{ dappId: string }>) => {
            const id = action.payload.dappId

            if (state.dappVisitCounter[id]) {
                if (state.dappVisitCounter[id] < 2) {
                    state.dappVisitCounter[id] = state.dappVisitCounter[id] + 1
                }
            } else {
                state.dappVisitCounter[id] = 1
            }
        },
        setDappVisitCounter: (state, action: PayloadAction<{ dappId: string; counter: number }>) => {
            state.dappVisitCounter[action.payload.dappId] = action.payload.counter
        },
        removeDappVisitCounter: (state, action: PayloadAction<{ dappId: string }>) => {
            if (state.dappVisitCounter[action.payload.dappId]) {
                delete state.dappVisitCounter[action.payload.dappId]
            }
        },
        setDappNotifications: (state, action: PayloadAction<boolean>) => {
            state.dappNotifications = action.payload
        },
        updateWalletRegistrations: (state, action: PayloadAction<{ addresses: string[]; timestamp: number }>) => {
            if (!state.walletRegistrations) {
                state.walletRegistrations = {}
            }
            for (const address of action.payload.addresses) {
                // Normalize address for consistent storage
                const normalizedAddress = HexUtils.normalize(address)
                state.walletRegistrations![normalizedAddress] = action.payload.timestamp
            }
        },
        updateLastFullRegistration: (state, action: PayloadAction<number>) => {
            state.lastFullRegistration = action.payload
        },
        updateLastSubscriptionId: (state, action: PayloadAction<string | null>) => {
            state.lastSubscriptionId = action.payload
        },
        addPendingWallets: (
            state,
            action: PayloadAction<{ addresses: string[]; status: "REGISTER" | "UNREGISTER" }>,
        ) => {
            const { addresses, status } = action.payload
            const normalized = addresses.map(addr => HexUtils.normalize(addr))
            const now = Date.now()

            // Add addresses to pending queue, avoiding duplicates with same status
            for (const address of normalized) {
                const existingIndex = state.walletsPending.findIndex(
                    w => w.address === address && w.status === status,
                )
                if (existingIndex === -1) {
                    state.walletsPending.push({
                        address,
                        status,
                        attempts: 0,
                        addedAt: now,
                    })
                }
            }
        },
        removePendingWallets: (state, action: PayloadAction<{ addresses: string[]; status: "REGISTER" | "UNREGISTER" }>) => {
            const { addresses, status } = action.payload
            const normalized = addresses.map(addr => HexUtils.normalize(addr))

            // Remove addresses from pending queue
            state.walletsPending = state.walletsPending.filter(
                w => !(normalized.includes(w.address) && w.status === status),
            )
        },
        incrementPendingWalletAttempts: (
            state,
            action: PayloadAction<{ address: string; status: "REGISTER" | "UNREGISTER" }>,
        ) => {
            const { address, status } = action.payload
            const normalizedAddress = HexUtils.normalize(address)

            const wallet = state.walletsPending.find(w => w.address === normalizedAddress && w.status === status)
            if (wallet) {
                wallet.attempts += 1
            }
        },
        removeFromWalletRegistrations: (state, action: PayloadAction<string[]>) => {
            // Remove addresses from walletRegistrations immediately when deletion is attempted
            if (!state.walletRegistrations) return

            for (const address of action.payload) {
                const normalizedAddress = HexUtils.normalize(address)
                delete state.walletRegistrations[normalizedAddress]
            }
        },
    },
})

export const {
    updateNotificationFeatureFlag,
    updateNotificationPermission,
    updateNotificationOptedIn,
    increaseDappVisitCounter,
    setDappVisitCounter,
    setDappNotifications,
    removeDappVisitCounter,
    updateWalletRegistrations,
    updateLastFullRegistration,
    updateLastSubscriptionId,
    addPendingWallets,
    removePendingWallets,
    incrementPendingWalletAttempts,
    removeFromWalletRegistrations,
} = Notification.actions

// Backward compatibility aliases for old hooks (will be deprecated)
export const addPendingUnregistrations = (addresses: string[]) =>
    addPendingWallets({ addresses, status: "UNREGISTER" })

export const removePendingUnregistrations = (addresses: string[]) =>
    removePendingWallets({ addresses, status: "UNREGISTER" })

export const incrementUnregistrationAttempts = (address: string) =>
    incrementPendingWalletAttempts({ address, status: "UNREGISTER" })
