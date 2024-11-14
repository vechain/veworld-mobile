export interface NotificationState {
    permissionEnabled: boolean
    optedIn: boolean
    dappVisitCounter: Record<string, number>
    userTags: Record<string, string>
}
