import { useQuery } from "@tanstack/react-query"
import moment from "moment"
import { useEffect, useMemo } from "react"
import DeviceInfo from "react-native-device-info"
import { VersionManifest } from "~Model/AppVersion"
import { selectUpdatePromptStatus, useAppDispatch, useAppSelector, VersionUpdateSlice } from "~Storage/Redux"
import { PlatformUtils } from "~Utils"
import SemanticVersionUtils from "~Utils/SemanticVersionUtils"

const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24

const UPGRADE_PROMPT_DELAY_DAYS = {
    FIRST_PROMPT: 5,
    SECOND_PROMPT: 10,
    THIRD_PROMPT: 20,
}

const VERSION_INFO_URL = __DEV__
    ? process.env.REACT_APP_VERSIONINFO_DEV_URL
    : process.env.REACT_APP_VERSIONINFO_PROD_URL

const fetchVersionInfo = async (): Promise<VersionManifest> => {
    const platform = PlatformUtils.isIOS() ? "ios" : "android"
    const url = `${VERSION_INFO_URL}/releases/${platform}/manifest.json`
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`Manifest fetch failed (status ${response.status})`)
    }

    return await response.json()
}

export const useCheckAppVersion = () => {
    const versionUpdateStatus = useAppSelector(selectUpdatePromptStatus)
    const dispatch = useAppDispatch()

    const { data: majorVersion } = useQuery({
        queryKey: ["versionManifest"],
        queryFn: fetchVersionInfo,
        select: data => data.major,
        staleTime: TWENTY_FOUR_HOURS,
        gcTime: TWENTY_FOUR_HOURS,
        retry: 3,
    })

    useEffect(() => {
        if (majorVersion) {
            const installedVersion = DeviceInfo.getVersion()

            if (installedVersion !== versionUpdateStatus.installedVersion) {
                dispatch(VersionUpdateSlice.actions.setInstalledVersion(installedVersion))
            }

            const needsUpdate = SemanticVersionUtils.moreThan(majorVersion, installedVersion)
            dispatch(VersionUpdateSlice.actions.setIsUpToDate(!needsUpdate))

            if (needsUpdate && majorVersion !== versionUpdateStatus.majorVersion) {
                dispatch(VersionUpdateSlice.actions.setMajorVersion(majorVersion))
            }
        }
    }, [dispatch, majorVersion, versionUpdateStatus.installedVersion, versionUpdateStatus.majorVersion])

    const shouldShowUpdatePrompt = useMemo(() => {
        if (!versionUpdateStatus.majorVersion || !versionUpdateStatus.installedVersion) {
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
            !!versionUpdateStatus.majorVersion &&
            !!versionUpdateStatus.installedVersion &&
            SemanticVersionUtils.moreThan(versionUpdateStatus.majorVersion, versionUpdateStatus.installedVersion)
        )
    }, [versionUpdateStatus])

    return {
        shouldShowUpdatePrompt,
        hasPermanentlyDismissed,
    }
}
