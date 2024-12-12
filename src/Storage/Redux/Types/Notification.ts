export interface NotificationState {
    feautureEnabled: boolean
    permissionEnabled: boolean
    optedIn: boolean
    dappVisitCounter: Record<string, number>
    userTags: Record<string, string>
}
