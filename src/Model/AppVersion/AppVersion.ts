export interface AppVersion {
    installedVersion: string
    majorVersion: string
    latestVersion: string
    isUpToDate: boolean | null
    lastManifestCheck: number | null
    updateRequest: {
        dismissCount: number
        lastDismissedDate: number | null
    }
}

export interface VersionManifest {
    major: string
    latest: string
    history: string[]
}
