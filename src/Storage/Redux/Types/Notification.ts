import { Routes } from "~Navigation"

export type NotificationDeepLink = {
    route: (typeof Routes)[keyof typeof Routes]
    params: Record<string, any>
}

export interface NotificationState {
    permissionEnabled: boolean
    optedIn: boolean
    deeplink: NotificationDeepLink | null
}
