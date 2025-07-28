import { RootState } from "../Types"

export const selectNotificationPermissionEnabled = (state: RootState) => state.notification.permissionEnabled
export const selectNotificationOptedIn = (state: RootState) => state.notification.optedIn
export const selectDappVisitCounter = (state: RootState) => state.notification.dappVisitCounter
export const selectNotificationFeautureEnabled = (state: RootState) => state.notification.feautureEnabled
export const selectDappNotifications = (state: RootState) => state.notification.dappNotifications
