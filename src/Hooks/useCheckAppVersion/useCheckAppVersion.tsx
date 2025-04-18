import moment from "moment"
import { useMemo } from "react"
import { selectUpdatePromptStatus, useAppDispatch, useAppSelector, VersionUpdateSlice } from "~Storage/Redux"
import SemanticVersionUtils from "~Utils/SemanticVersionUtils"

const UPGRADE_PROMPT_DELAYS = {
    FIRST_PROMPT: 5,
    SECOND_PROMPT: 10,
    THIRD_PROMPT: 20,
}

export const useCheckAppVersion = () => {
    const versionUpdateStatus = useAppSelector(selectUpdatePromptStatus)
    const dispatch = useAppDispatch()

    const shouldShowUpdatePrompt = useMemo(() => {
        if (!versionUpdateStatus.advisedVersion || !versionUpdateStatus.installedVersion) {
            return false
        }

        if (versionUpdateStatus.isUpToDate) {
            return false
        }

        if (!SemanticVersionUtils.moreThan(versionUpdateStatus.advisedVersion, versionUpdateStatus.installedVersion)) {
            dispatch(VersionUpdateSlice.actions.setIsUpToDate(true))
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
    }, [versionUpdateStatus, dispatch])

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
