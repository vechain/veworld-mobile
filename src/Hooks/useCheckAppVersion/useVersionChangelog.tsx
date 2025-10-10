import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"
import DeviceInfo from "react-native-device-info"
import { selectLanguage, useAppSelector, useAppDispatch, setInstalledVersion } from "~Storage/Redux"
import { PlatformUtils } from "~Utils"

const VERSION_INFO_URL = process.env.REACT_APP_VERSIONINFO_PROD_URL

const fetchChangelog = async (): Promise<{
    version: string
    major: boolean
    descriptions: Record<string, string[]>
}> => {
    const system = PlatformUtils.isIOS() ? "ios" : "android"
    const version = DeviceInfo.getVersion()
    const url = `${VERSION_INFO_URL}/releases/${system}/versions/${version}.json`

    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Changelog fetch failed (status ${response.status})`)
    }

    const data = await response.json()
    return data
}

export const useVersionChangelog = () => {
    const language = useAppSelector(selectLanguage)
    const storedVersion = useAppSelector(state => state.versionUpdate.installedVersion)
    const dispatch = useAppDispatch()

    const deviceVersion = DeviceInfo.getVersion()
    const versionChanged = storedVersion !== deviceVersion

    const {
        data: changelog,
        isLoading: changelogLoading,
        error: changelogError,
        isFetching: changelogFetching,
    } = useQuery({
        queryKey: ["changelog", deviceVersion],
        queryFn: fetchChangelog,
        enabled: versionChanged,
        select: data => {
            if (!data?.descriptions) {
                return []
            }

            return data.descriptions[language] ?? data.descriptions.en ?? []
        },
    })

    useEffect(() => {
        if (versionChanged && !changelogLoading && !changelogFetching) {
            if (changelogError || !changelog || changelog.length === 0) {
                dispatch(setInstalledVersion(deviceVersion))
            }
        }
    }, [versionChanged, changelogLoading, changelogFetching, changelogError, changelog, deviceVersion, dispatch])

    const shouldShowChangelog = useMemo(() => {
        if (!versionChanged) {
            return false
        }

        if (changelogLoading || changelogFetching) {
            return false
        }

        if (changelogError || !changelog || changelog.length === 0) {
            return false
        }

        return true
    }, [versionChanged, changelogLoading, changelogFetching, changelogError, changelog])

    return {
        shouldShowChangelog,
        changelog: changelog ?? [],
        changelogFetching,
    }
}
