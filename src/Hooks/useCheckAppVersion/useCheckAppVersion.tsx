import moment from "moment"
import { useEffect, useMemo } from "react"
import DeviceInfo from "react-native-device-info"
import { useQuery } from "@tanstack/react-query"
import { selectUpdatePromptStatus, useAppDispatch, useAppSelector, VersionUpdateSlice } from "~Storage/Redux"
import { PlatformUtils } from "~Utils"
import SemanticVersionUtils from "~Utils/SemanticVersionUtils"
import { VersionManifest } from "~Model/AppVersion"

const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24

const UPGRADE_PROMPT_DELAY_DAYS = {
    FIRST_PROMPT: 5,
    SECOND_PROMPT: 10,
    THIRD_PROMPT: 20,
}

const VERSION_INFO_URL = "https://versioninfo.dev.veworld.vechain.org/releases"

const fetchVersionInfo = async (): Promise<VersionManifest> => {
    const platform = PlatformUtils.isIOS() ? "ios" : "android"
    const url = `${VERSION_INFO_URL}/${platform}/manifest.json`
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`Manifest fetch failed (status ${response.status})`)
    }

    return response.json()
}

export const useCheckAppVersion = () => {
    const versionUpdateStatus = useAppSelector(selectUpdatePromptStatus)
    const dispatch = useAppDispatch()

    const { data: breakingVersion } = useQuery({
        queryKey: ["versionManifest"],
        queryFn: fetchVersionInfo,
        select: data => data.lastBreaking,
        staleTime: TWENTY_FOUR_HOURS,
        gcTime: TWENTY_FOUR_HOURS,
        retry: 3,
    })

    useEffect(() => {
        if (breakingVersion) {
            const installedVersion = DeviceInfo.getVersion()

            if (installedVersion !== versionUpdateStatus.installedVersion) {
                dispatch(VersionUpdateSlice.actions.setInstalledVersion(installedVersion))
            }

            const needsUpdate = SemanticVersionUtils.moreThan(breakingVersion, installedVersion)
            dispatch(VersionUpdateSlice.actions.setIsUpToDate(!needsUpdate))

            if (needsUpdate && breakingVersion !== versionUpdateStatus.breakingVersion) {
                dispatch(VersionUpdateSlice.actions.setBreakingVersion(breakingVersion))
            }
        }
    }, [dispatch, breakingVersion, versionUpdateStatus.installedVersion, versionUpdateStatus.breakingVersion])

    const shouldShowUpdatePrompt = useMemo(() => {
        if (!versionUpdateStatus.breakingVersion || !versionUpdateStatus.installedVersion) {
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

        const now = moment()
        const lastDismiss = moment.unix(versionUpdateStatus.updateRequest.lastDismissedDate)
        const daysSinceLastDismiss = now.diff(lastDismiss, "days")

        switch (versionUpdateStatus.updateRequest.dismissCount) {
            case 1:
                return daysSinceLastDismiss >= UPGRADE_PROMPT_DELAY_DAYS.FIRST_PROMPT
            case 2:
                return daysSinceLastDismiss >= UPGRADE_PROMPT_DELAY_DAYS.SECOND_PROMPT
            case 3:
                return daysSinceLastDismiss >= UPGRADE_PROMPT_DELAY_DAYS.THIRD_PROMPT
            default:
                return false
        }
    }, [versionUpdateStatus])

    const hasPermanentlyDismissed = useMemo(() => {
        return (
            versionUpdateStatus.updateRequest.dismissCount > 3 &&
            !!versionUpdateStatus.breakingVersion &&
            !!versionUpdateStatus.installedVersion &&
            SemanticVersionUtils.moreThan(versionUpdateStatus.breakingVersion, versionUpdateStatus.installedVersion)
        )
    }, [versionUpdateStatus])

    return {
        shouldShowUpdatePrompt,
        hasPermanentlyDismissed,
    }
}
