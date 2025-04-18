export interface AppVersion {
    installedVersion: string
    advisedVersion: string
    isUpToDate: boolean
    updateRequest: {
        dismissCount: number
        lastDismissedDate: string
    }
}
