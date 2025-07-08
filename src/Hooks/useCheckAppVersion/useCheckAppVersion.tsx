import { useQuery } from "@tanstack/react-query"
import moment from "moment"
import { useEffect, useMemo } from "react"
import DeviceInfo from "react-native-device-info"
import { VersionManifest } from "~Model/AppVersion"
import {
    selectInstalledAppVersion,
    selectLanguage,
    selectUpdatePromptStatus,
    setChangelogToShow,
    useAppDispatch,
    useAppSelector,
    VersionUpdateSlice,
} from "~Storage/Redux"
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

const fetchChangelog = async (
    changelogKey: string | null,
): Promise<{
    version: string
    major: boolean
    descriptions: Record<string, string[]>
}> => {
    const url = `${VERSION_INFO_URL}/${changelogKey}.json`
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Changelog fetch failed (status ${response.status})`)
    }
    return await response.json()
}

export const useCheckAppVersion = () => {
    const versionUpdateStatus = useAppSelector(selectUpdatePromptStatus)
    const installedVersion = useAppSelector(selectInstalledAppVersion)
    const language = useAppSelector(selectLanguage)
    const dispatch = useAppDispatch()
    const deviceVersion = DeviceInfo.getVersion()

    const { data: versionInfo } = useQuery({
        queryKey: ["versionManifest"],
        queryFn: fetchVersionInfo,
        select: data => ({
            major: data.major,
            latest: data.latest,
            changelogKey: data.history.find(v => v.version === data.major)?.key ?? null,
        }),
        staleTime: TWENTY_FOUR_HOURS,
        gcTime: TWENTY_FOUR_HOURS,
        retry: 3,
    })
    const { data: changelog } = useQuery({
        queryKey: ["changelog", versionUpdateStatus.changelogKey],
        queryFn: () => fetchChangelog(versionUpdateStatus.changelogKey),
        enabled: !!versionUpdateStatus.changelogKey && versionUpdateStatus.shouldShowChangelog,
        select: data => data.descriptions[language] ?? data.descriptions.en ?? [],
    })

    useEffect(() => {
        if (versionInfo) {
            const needsUpdate = SemanticVersionUtils.moreThan(versionInfo.major, deviceVersion)

            if (installedVersion && deviceVersion !== installedVersion) {
                dispatch(
                    setChangelogToShow({
                        shouldShow: true,
                        changelogKey: versionInfo.changelogKey,
                    }),
                )
                dispatch(VersionUpdateSlice.actions.setInstalledVersion(deviceVersion))
            } else if (!installedVersion) {
                dispatch(VersionUpdateSlice.actions.setInstalledVersion(deviceVersion))
            }
            dispatch(VersionUpdateSlice.actions.setIsUpToDate(!needsUpdate))

            if (needsUpdate && versionInfo.major !== versionUpdateStatus.majorVersion) {
                dispatch(VersionUpdateSlice.actions.setMajorVersion(versionInfo.major))
            }

            if (versionInfo.latest !== versionUpdateStatus.latestVersion) {
                dispatch(VersionUpdateSlice.actions.setLatestVersion(versionInfo.latest))
            }
        }
    }, [
        dispatch,
        versionInfo,
        versionUpdateStatus.majorVersion,
        versionUpdateStatus.latestVersion,
        installedVersion,
        deviceVersion,
    ])

    const shouldShowUpdatePrompt = useMemo(() => {
        if (!versionUpdateStatus.majorVersion || !deviceVersion) {
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
        const lastDismiss = moment(versionUpdateStatus.updateRequest.lastDismissedDate)
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
    }, [
        deviceVersion,
        versionUpdateStatus.isUpToDate,
        versionUpdateStatus.majorVersion,
        versionUpdateStatus.updateRequest.dismissCount,
        versionUpdateStatus.updateRequest.lastDismissedDate,
    ])

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
        shouldShowChangelog: versionUpdateStatus.shouldShowChangelog,
        changelog: changelog || [],
    }
}
