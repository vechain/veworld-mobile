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
    pendingUnregistrations: [],
    unregistrationAttempts: {},
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
        addPendingUnregistrations: (state, action: PayloadAction<string[]>) => {
            // Add addresses to pending unregistrations, avoiding duplicates
            const normalized = action.payload.map(addr => HexUtils.normalize(addr))
            const uniqueAddresses = normalized.filter(addr => !state.pendingUnregistrations.includes(addr))
            state.pendingUnregistrations.push(...uniqueAddresses)
        },
        removePendingUnregistrations: (state, action: PayloadAction<string[]>) => {
            // Remove addresses from pending unregistrations
            const normalized = action.payload.map(addr => HexUtils.normalize(addr))
            state.pendingUnregistrations = state.pendingUnregistrations.filter(addr => !normalized.includes(addr))

            // Also clear their attempt counts
            for (const addr of normalized) {
                delete state.unregistrationAttempts[addr]
            }
        },
        incrementUnregistrationAttempts: (state, action: PayloadAction<string>) => {
            const normalizedAddress = HexUtils.normalize(action.payload)
            if (!state.unregistrationAttempts[normalizedAddress]) {
                state.unregistrationAttempts[normalizedAddress] = 0
            }
            state.unregistrationAttempts[normalizedAddress] += 1
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
    addPendingUnregistrations,
    removePendingUnregistrations,
    incrementUnregistrationAttempts,
    removeFromWalletRegistrations,
} = Notification.actions
