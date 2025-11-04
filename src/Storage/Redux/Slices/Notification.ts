// notificationSlice.ts
import { createSlice, PayloadAction, createEntityAdapter, type EntityState } from "@reduxjs/toolkit"
import { NotificationState as BaseNotificationState, Registration } from "../Types"

// --- adapter keyed by address ---
const registrationsAdapter = createEntityAdapter<Registration>({
    selectId: r => r.address,
    sortComparer: false,
})

// Recompose your state: everything except `registrations` + nested EntityState
type NotificationState = Omit<BaseNotificationState, "registrations"> & {
    registrations: EntityState<Registration>
}

// --- initial state ---
export const initialNotificationState: NotificationState = {
    feautureEnabled: false,
    permissionEnabled: null,
    optedIn: null,
    dappVisitCounter: {},
    userTags: {},
    dappNotifications: true,
    registrations: registrationsAdapter.getInitialState(),
}

export const Notification = createSlice({
    name: "notification",
    initialState: initialNotificationState,
    reducers: {
        // flags / misc
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
            const cur = state.dappVisitCounter[id] ?? 0
            if (cur < 2) state.dappVisitCounter[id] = cur + 1
        },
        setDappVisitCounter: (state, action: PayloadAction<{ dappId: string; counter: number }>) => {
            state.dappVisitCounter[action.payload.dappId] = action.payload.counter
        },
        removeDappVisitCounter: (state, action: PayloadAction<{ dappId: string }>) => {
            if (state.dappVisitCounter[action.payload.dappId] != null) {
                delete state.dappVisitCounter[action.payload.dappId]
            }
        },
        setDappNotifications: (state, action: PayloadAction<boolean>) => {
            state.dappNotifications = action.payload
        },

        // registrations via adapter (all O(1))
        setRegistrations: (state, action) => {
            registrationsAdapter.setAll(state.registrations, action.payload)
        },
        upsertRegistrations: (state, action) => {
            registrationsAdapter.upsertMany(state.registrations, action.payload)
        },
        removeRegistrations: (state, action) => {
            registrationsAdapter.removeMany(state.registrations, action.payload)
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

    setRegistrations,
    upsertRegistrations,
    removeRegistrations,
} = Notification.actions

// --- selectors ---
// Get the selectors that work directly on NotificationState
export const registrationSelectors = registrationsAdapter.getSelectors(
    (state: NotificationState) => state.registrations,
)

// Example usage in app code:
// import { registrationSelectors } from '~Storage/Redux/Slices/Notification'
// const reg = useSelector((s: RootState) => registrationSelectors.selectById(s.notification, address))
// const allRegs = useSelector((s: RootState) => registrationSelectors.selectAll(s.notification))
