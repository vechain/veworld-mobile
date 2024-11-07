import React, { memo } from "react"
import { AlertCard } from "~Components"
import { useI18nContext } from "~i18n"

export const DoNotShareAlert = memo(() => {
    const { LL } = useI18nContext()

    return <AlertCard title={LL.ALERT_TITLE_IMPORTANT()} message={LL.BD_MNEMONIC_WARMNING()} status="error" />
})
