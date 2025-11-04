import moment from "moment"
import { useMemo } from "react"
import { selectUpdatePromptStatus, useAppSelector } from "~Storage/Redux"
import SemanticVersionUtils from "~Utils/SemanticVersionUtils"

const UPGRADE_PROMPT_DELAY_DAYS = {
    FIRST_PROMPT: 5,
    SECOND_PROMPT: 10,
    THIRD_PROMPT: 20,
}

interface UseVersionUpdatePromptOptions {
    versionCheckComplete: boolean
}

export const useVersionUpdatePrompt = ({ versionCheckComplete }: UseVersionUpdatePromptOptions) => {
    const versionUpdateStatus = useAppSelector(selectUpdatePromptStatus)
    const shouldShowUpdatePrompt = useMemo(() => {
        if (!versionUpdateStatus.majorVersion || !versionUpdateStatus.installedVersion || !versionCheckComplete) {
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
    }, [versionCheckComplete, versionUpdateStatus])

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
