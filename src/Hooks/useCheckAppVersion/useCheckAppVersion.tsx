import moment from "moment"
import { useEffect, useMemo } from "react"
import DeviceInfo from "react-native-device-info"
import { selectUpdatePromptStatus, useAppDispatch, useAppSelector, VersionUpdateSlice } from "~Storage/Redux"
import { PlatformUtils } from "~Utils"
import SemanticVersionUtils from "~Utils/SemanticVersionUtils"

const UPGRADE_PROMPT_DELAYS = {
    FIRST_PROMPT: 5,
    SECOND_PROMPT: 10,
    THIRD_PROMPT: 20,
}

interface VersionInfo {
    updated: string
    version: string
    description: {
        changes: string[]
    }
}

const S3_BASE_URL = "UPDATE_S3_BASE_URL"

const fetchVersionInfo = async (): Promise<VersionInfo | null> => {
    try {
        const platform = PlatformUtils.isIOS() ? "ios" : "android"
        const url = `${S3_BASE_URL}/${platform}/latest`

        const response = await fetch(url)
        const data = await response.json()
        return data as VersionInfo
    } catch (error) {
        throw new Error(`Failed to fetch version info: ${error}`)
    }
}

export const useCheckAppVersion = () => {
    const versionUpdateStatus = useAppSelector(selectUpdatePromptStatus)
    const dispatch = useAppDispatch()

    useEffect(() => {
        const checkVersion = async () => {
            const versionInfo = await fetchVersionInfo()
            if (versionInfo) {
                const installedVersion = DeviceInfo.getVersion()
                dispatch(VersionUpdateSlice.actions.setAdvisedVersion("10"))
                dispatch(VersionUpdateSlice.actions.setInstalledVersion(installedVersion))
                const needsUpdate = SemanticVersionUtils.moreThan("10", installedVersion)
                dispatch(VersionUpdateSlice.actions.setIsUpToDate(!needsUpdate))
            }
        }

        checkVersion()
    }, [dispatch])

    const shouldShowUpdatePrompt = useMemo(() => {
        if (!versionUpdateStatus.advisedVersion || !versionUpdateStatus.installedVersion) {
            return false
        }

        if (versionUpdateStatus.isUpToDate) {
            return false
        }

        if (versionUpdateStatus.updateRequest.dismissCount > 3) {
            return false
        }

        if (versionUpdateStatus.updateRequest.dismissCount === 0) {
            return true
        }

        if (!versionUpdateStatus.updateRequest.lastDismissedDate) {
            return false
        }

        const daysSinceLastDismiss = moment().diff(moment(versionUpdateStatus.updateRequest.lastDismissedDate), "days")

        switch (versionUpdateStatus.updateRequest.dismissCount) {
            case 1:
                return daysSinceLastDismiss >= UPGRADE_PROMPT_DELAYS.FIRST_PROMPT
            case 2:
                return daysSinceLastDismiss >= UPGRADE_PROMPT_DELAYS.SECOND_PROMPT
            case 3:
                return daysSinceLastDismiss >= UPGRADE_PROMPT_DELAYS.THIRD_PROMPT
            default:
                return false
        }
    }, [versionUpdateStatus])

    const hasPermanentlyDismissed = useMemo(() => {
        return (
            versionUpdateStatus.updateRequest.dismissCount > 3 &&
            !!versionUpdateStatus.advisedVersion &&
            !!versionUpdateStatus.installedVersion &&
            SemanticVersionUtils.moreThan(versionUpdateStatus.advisedVersion, versionUpdateStatus.installedVersion)
        )
    }, [versionUpdateStatus])

    return {
        shouldShowUpdatePrompt,
        hasPermanentlyDismissed,
    }
}
