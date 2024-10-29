import React, { memo } from "react"
import { useI18nContext } from "~i18n"
import { AlertCard } from "~Components/Reusable/Alert"

export const DoNotShareAlert = memo(() => {
    const { LL } = useI18nContext()

    return <AlertCard title={LL.ALERT_TITLE_IMPORTANT()} message={LL.BD_MNEMONIC_WARMNING()} status="error" />
})
