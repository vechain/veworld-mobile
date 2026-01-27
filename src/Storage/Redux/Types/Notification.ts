import type { EntityState } from "@reduxjs/toolkit"
export interface Registration {
    address: string // normalized
    lastSuccessfulSync?: number
    registeredUrl?: string // The URL used for this registration
}

export interface NotificationState {
    feautureEnabled: boolean
    permissionEnabled: boolean | null
    optedIn: boolean | null
    dappVisitCounter: Record<string, number>
    userTags: Record<string, string>
    dappNotifications: boolean
    registrations: EntityState<Registration>
    disabledCategories: string[]
}
