export type WalletPendingStatus = "REGISTER" | "UNREGISTER"

export interface PendingWallet {
    address: string
    status: WalletPendingStatus
    attempts: number
    addedAt: number // timestamp
}

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
    walletsPending: PendingWallet[] // unified queue for registrations and unregistrations
}
