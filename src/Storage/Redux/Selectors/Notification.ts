import { RootState } from "../Types"

export const selectNotificationPermissionEnabled = (state: RootState) => state.notification.permissionEnabled
export const selectNotificationOptedIn = (state: RootState) => state.notification.optedIn
export const selectDappVisitCounter = (state: RootState) => state.notification.dappVisitCounter
export const selectNotificationFeautureEnabled = (state: RootState) => state.notification.feautureEnabled
export const selectDappNotifications = (state: RootState) => state.notification.dappNotifications
export const selectWalletRegistrations = (state: RootState) => state.notification.walletRegistrations
export const selectLastFullRegistration = (state: RootState) => state.notification.lastFullRegistration
export const selectLastSubscriptionId = (state: RootState) => state.notification.lastSubscriptionId
export const selectWalletsPending = (state: RootState) => state.notification.walletsPending
export const selectPendingRegistrations = (state: RootState) =>
    state.notification.walletsPending.filter(w => w.status === "REGISTER")
export const selectPendingUnregistrations = (state: RootState) =>
    state.notification.walletsPending.filter(w => w.status === "UNREGISTER")

// Backward compatibility selector for old hooks (will be deprecated)
export const selectUnregistrationAttempts = (state: RootState) => {
    const unregisterWallets = state.notification.walletsPending.filter(w => w.status === "UNREGISTER")
    return unregisterWallets.reduce((acc, wallet) => {
        acc[wallet.address] = wallet.attempts
        return acc
    }, {} as Record<string, number>)
}
