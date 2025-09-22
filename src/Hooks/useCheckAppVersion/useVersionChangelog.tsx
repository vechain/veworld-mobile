import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import DeviceInfo from "react-native-device-info"
import {
    selectLanguage,
    selectUpdatePromptStatus,
    setChangelogToShow,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

const VERSION_INFO_URL = process.env.REACT_APP_VERSIONINFO_PROD_URL

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

    const data = await response.json()
    return data
}

interface UseVersionChangelogOptions {
    versionInfo?: {
        history: Array<{ version: string; key: string }>
    }
    versionCheckComplete: boolean
}

export const useVersionChangelog = ({ versionInfo, versionCheckComplete }: UseVersionChangelogOptions) => {
    const versionUpdateStatus = useAppSelector(selectUpdatePromptStatus)
    const language = useAppSelector(selectLanguage)
    const changelogDismissed = useAppSelector(state => state.versionUpdate.changelogDismissed)
    const storedVersion = useAppSelector(state => state.versionUpdate.installedVersion)
    const dispatch = useAppDispatch()

    const {
        data: changelog,
        isLoading: changelogLoading,
        error: changelogError,
        isFetching: changelogFetching,
    } = useQuery({
        queryKey: ["changelog", versionUpdateStatus.changelogKey],
        queryFn: () => fetchChangelog(versionUpdateStatus.changelogKey),
        enabled: !!versionUpdateStatus.changelogKey && versionUpdateStatus.shouldShowChangelog,
        select: data => {
            if (!data?.descriptions) {
                return []
            }

            return data.descriptions[language] ?? data.descriptions.en ?? []
        },
    })

    useEffect(() => {
        if (!versionInfo || !versionCheckComplete) return

        const installedVersion = DeviceInfo.getVersion()
        const versionChanged = storedVersion !== installedVersion

        if (!versionChanged && changelogDismissed) {
            return
        }

        const userVersionInfo = versionInfo.history.find(v => v.version === installedVersion)
        const isAlreadyShowing = versionUpdateStatus.shouldShowChangelog
        const isDifferentKey = versionUpdateStatus.changelogKey !== userVersionInfo?.key
        const isNotDismissed = !changelogDismissed

        const shouldTriggerChangelog = userVersionInfo?.key && !isAlreadyShowing && isDifferentKey && isNotDismissed

        if (shouldTriggerChangelog) {
            dispatch(
                setChangelogToShow({
                    shouldShow: true,
                    changelogKey: userVersionInfo.key,
                }),
            )
            return
        }

        if (isAlreadyShowing && versionUpdateStatus.changelogKey && !changelogLoading && !changelogFetching) {
            if (changelogError || (changelog && changelog.length === 0)) {
                dispatch(setChangelogToShow({ shouldShow: false, changelogKey: null }))
            }
        }
    }, [
        versionInfo,
        versionCheckComplete,
        storedVersion,
        changelogDismissed,
        versionUpdateStatus.shouldShowChangelog,
        versionUpdateStatus.changelogKey,
        changelogLoading,
        changelogFetching,
        changelogError,
        changelog,
        dispatch,
    ])

    return {
        shouldShowChangelog: versionUpdateStatus.shouldShowChangelog,
        changelog: changelog ?? [],
        changelogFetching,
    }
}
