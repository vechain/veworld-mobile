export enum RegistrationState {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    PENDING_REREGISTER = "PENDING_REREGISTER",
    PENDING_UNREGISTER = "PENDING_UNREGISTER",
}

export interface Registration {
    address: string // normalized
    state: RegistrationState
    stateTransitionedTime: number
    lastSuccessfulSync?: number
    consecutiveFailures: number
    lastError?: string
}

export interface NotificationState {
    feautureEnabled: boolean
    permissionEnabled: boolean | null
    optedIn: boolean | null
    dappVisitCounter: Record<string, number>
    userTags: Record<string, string>
    dappNotifications: boolean
    registrations: Registration[]
    lastSubscriptionId: string | null
}
