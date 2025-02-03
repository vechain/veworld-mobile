import React, { memo } from "react"
import { AlertCard } from "~Components"
import { useI18nContext } from "~i18n"

type DoNotShareAlertProps = {
    credential: string[] | string
}
export const DoNotShareAlert = memo(({ credential }: DoNotShareAlertProps) => {
    const { LL } = useI18nContext()
    const isMnemonic = Array.isArray(credential)
    return (
        <AlertCard
            title={LL.ALERT_TITLE_IMPORTANT()}
            message={isMnemonic ? LL.BD_MNEMONIC_WARMNING() : LL.BD_PRIVATE_KEY_WARMNING()}
            status="error"
        />
    )
})
