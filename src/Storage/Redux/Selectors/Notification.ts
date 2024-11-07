import { RootState } from "../Types"

export const selectNotificationPermissionEnabled = (state: RootState) => state.notification.permissionEnabled
export const selectNotificationOptedIn = (state: RootState) => state.notification.optedIn
