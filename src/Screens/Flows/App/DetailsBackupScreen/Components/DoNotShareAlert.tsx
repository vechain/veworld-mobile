import React, { memo } from "react"
import { AlertCard } from "~Components"
import { useI18nContext } from "~i18n"

type DoNotShareAlertProps = {
    backupDetails: string[] | string
}

export const DoNotShareAlert = memo(({ backupDetails }: DoNotShareAlertProps) => {
    const { LL } = useI18nContext()
    const isMnemonic = Array.isArray(backupDetails)

    return (
        <AlertCard
            title={LL.ALERT_TITLE_IMPORTANT()}
            message={isMnemonic ? LL.BD_MNEMONIC_WARMNING() : LL.BD_PRIVATE_KEY_WARMNING()}
            status="error"
        />
    )
})
