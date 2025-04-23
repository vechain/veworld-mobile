export interface AppVersion {
    installedVersion: string
    advisedVersion: string
    isUpToDate: boolean | null
    updateRequest: {
        dismissCount: number
        lastDismissedDate: string
    }
}
