export interface NotificationState {
    feautureEnabled: boolean
    permissionEnabled: boolean | null
    optedIn: boolean | null
    dappVisitCounter: Record<string, number>
    userTags: Record<string, string>
    dappNotifications: boolean
    walletRegistrations: Record<string, number> | null // address -> timestamp
    lastFullRegistration: number | null // last complete re-registration of all wallets
    lastSubscriptionId: string | null
}
