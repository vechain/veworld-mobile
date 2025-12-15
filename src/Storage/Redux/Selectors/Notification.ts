import { RootState } from "../Types"
import { registrationsAdapter } from "../Slices/Notification"

export const selectNotificationPermissionEnabled = (state: RootState) => state.notification.permissionEnabled
export const selectNotificationOptedIn = (state: RootState) => state.notification.optedIn
export const selectDappVisitCounter = (state: RootState) => state.notification.dappVisitCounter
export const selectNotificationFeautureEnabled = (state: RootState) => state.notification.feautureEnabled
export const selectDappNotifications = (state: RootState) => state.notification.dappNotifications
export const selectRegistrations = (state: RootState) => state.notification.registrations

export const registrationSelectors = registrationsAdapter.getSelectors(
    (state: RootState) => state.notification.registrations,
)
