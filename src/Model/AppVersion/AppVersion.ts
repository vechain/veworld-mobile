export interface AppVersion {
    installedVersion: string
    breakingVersion: string
    isUpToDate: boolean | null
    lastManifestCheck: number | null
    updateRequest: {
        dismissCount: number
        lastDismissedDate: number | null
    }
}

export interface VersionManifest {
    lastBreaking: string
    latest: string
    history: string[]
}
