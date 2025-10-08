import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useState } from "react"
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
    const queryClient = useQueryClient()
    const [versionCheckComplete, setVersionCheckComplete] = useState(false)

    const installedVersion = DeviceInfo.getVersion()
    const versionChanged = installedVersion !== versionUpdateStatus.installedVersion

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

    const invalidateManifestForNewVersion = useCallback(async () => {
        if (versionChanged && versionInfo) {
            const isVersionInManifest = versionInfo.history?.some(v => v.version === installedVersion)

            if (!isVersionInManifest) {
                await queryClient.invalidateQueries({ queryKey: ["versionManifest"] })
            }
        }
    }, [versionChanged, versionInfo, installedVersion, queryClient])

    const updateVersionState = useCallback(() => {
        if (!versionInfo) return
        if (versionChanged) {
            dispatch(VersionUpdateSlice.actions.setInstalledVersion(installedVersion))
            dispatch(VersionUpdateSlice.actions.resetDismissCount())
        }

        const needsUpdate = SemanticVersionUtils.moreThan(versionInfo.major, installedVersion)
        dispatch(VersionUpdateSlice.actions.setIsUpToDate(!needsUpdate))

        if (needsUpdate && versionInfo.major !== versionUpdateStatus.majorVersion) {
            dispatch(VersionUpdateSlice.actions.setMajorVersion(versionInfo.major))
        }

        if (versionInfo.latest !== versionUpdateStatus.latestVersion) {
            dispatch(VersionUpdateSlice.actions.setLatestVersion(versionInfo.latest))
        }

        setVersionCheckComplete(true)
    }, [
        versionInfo,
        versionChanged,
        installedVersion,
        dispatch,
        versionUpdateStatus.majorVersion,
        versionUpdateStatus.latestVersion,
    ])

    useEffect(() => {
        invalidateManifestForNewVersion()
        updateVersionState()
    }, [invalidateManifestForNewVersion, updateVersionState])

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
