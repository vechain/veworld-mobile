export interface NotificationState {
    feautureEnabled: boolean
    permissionEnabled: boolean | null
    optedIn: boolean | null
    dappVisitCounter: Record<string, number>
    userTags: Record<string, string>
    dappNotifications: boolean
    lastSuccessfulRegistration: number | null
    lastSubscriptionId: string | null
    lastWalletAddresses: string[] | null
}
