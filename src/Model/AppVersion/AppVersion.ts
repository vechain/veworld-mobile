export interface VersionInfo {
    version: string
    key: string
    major: boolean
}

export interface AppVersion {
    installedVersion: string
    majorVersion: string
    latestVersion: string
    isUpToDate: boolean | null
    lastManifestCheck: number | null
    shouldShowChangelog: boolean
    changelogKey: string | null
    changelogDismissed: boolean
    updateRequest: {
        dismissCount: number
        lastDismissedDate: number | null
    }
}

export interface VersionManifest {
    major: string
    latest: string
    history: VersionInfo[]
}
