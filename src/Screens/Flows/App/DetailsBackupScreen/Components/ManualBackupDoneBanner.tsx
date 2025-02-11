import React, { memo } from "react"
import { AlertInline } from "~Components"
import { useI18nContext } from "~i18n"

export const ManualBackupDoneBanner = memo(() => {
    const { LL } = useI18nContext()

    return <AlertInline message={LL.ALERT_MSG_MANUAL_BACKUP_DONE()} status="success" variant="banner" />
})
