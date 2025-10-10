import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import DeviceInfo from "react-native-device-info"
import { VersionManifest } from "~Model/AppVersion"
import { selectUpdatePromptStatus, useAppDispatch, useAppSelector, VersionUpdateSlice } from "~Storage/Redux"
import { PlatformUtils } from "~Utils"
import SemanticVersionUtils from "~Utils/SemanticVersionUtils"

const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24

const VERSION_INFO_URL = process.env.REACT_APP_VERSIONINFO_PROD_URL

const fetchVersionInfo = async (): Promise<VersionManifest> => {
    const platform = PlatformUtils.isIOS() ? "ios" : "android"
    const url = `${VERSION_INFO_URL}/releases/${platform}/manifest.json`

    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`Manifest fetch failed (status ${response.status})`)
    }

    const data = await response.json()
    return data
}

export const useVersionInfo = () => {
    const versionUpdateStatus = useAppSelector(selectUpdatePromptStatus)
    const dispatch = useAppDispatch()
    const [versionCheckComplete, setVersionCheckComplete] = useState(false)

    const {
        data: versionInfo,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["versionManifest"],
        queryFn: fetchVersionInfo,
        staleTime: TWENTY_FOUR_HOURS,
        gcTime: TWENTY_FOUR_HOURS,
        retry: 3,
    })

    useEffect(() => {
        if (versionInfo) {
            const installedVersion = DeviceInfo.getVersion()

            const needsUpdate = SemanticVersionUtils.moreThan(versionInfo.major, installedVersion)

            dispatch(VersionUpdateSlice.actions.setIsUpToDate(!needsUpdate))

            if (needsUpdate && versionInfo.major !== versionUpdateStatus.majorVersion) {
                dispatch(VersionUpdateSlice.actions.setMajorVersion(versionInfo.major))
            }

            if (versionInfo.latest !== versionUpdateStatus.latestVersion) {
                dispatch(VersionUpdateSlice.actions.setLatestVersion(versionInfo.latest))
            }

            setVersionCheckComplete(true)
        }
    }, [dispatch, versionInfo, versionUpdateStatus.majorVersion, versionUpdateStatus.latestVersion])

    return {
        versionInfo,
        versionCheckComplete,
        isLoading,
        error,
        installedVersion: versionUpdateStatus.installedVersion,
        majorVersion: versionUpdateStatus.majorVersion,
        latestVersion: versionUpdateStatus.latestVersion,
        isUpToDate: versionUpdateStatus.isUpToDate,
    }
}
