import { useVersionChangelog } from "./useVersionChangelog"
import { useVersionInfo } from "./useVersionInfo"
import { useVersionUpdatePrompt } from "./useVersionUpdatePrompt"

export const useCheckAppVersion = () => {
    const versionInfo = useVersionInfo()

    const changelogInfo = useVersionChangelog()

    const updatePromptInfo = useVersionUpdatePrompt({
        versionCheckComplete: versionInfo.versionCheckComplete,
    })

    return {
        versionCheckComplete: versionInfo.versionCheckComplete,
        installedVersion: versionInfo.installedVersion,
        majorVersion: versionInfo.majorVersion,
        latestVersion: versionInfo.latestVersion,
        isUpToDate: versionInfo.isUpToDate,
        shouldShowChangelog: changelogInfo.shouldShowChangelog,
        changelog: changelogInfo.changelog,
        shouldShowUpdatePrompt: updatePromptInfo.shouldShowUpdatePrompt,
        hasPermanentlyDismissed: updatePromptInfo.hasPermanentlyDismissed,
    }
}
