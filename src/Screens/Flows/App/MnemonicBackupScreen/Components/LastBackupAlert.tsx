import React, { memo } from "react"
import { AlertInline } from "~Components"
import { useI18nContext } from "~i18n"
import { LocalDevice } from "~Model"

export const LastBackupAlert = memo(({ deviceToBackup }: { deviceToBackup?: LocalDevice }) => {
    const { LL } = useI18nContext()

    return (
        <AlertInline
            message={LL.ALERT_MSG_LAST_BACKUP_DATE({ date: deviceToBackup?.lastBackupDate ?? "" })}
            status="success"
        />
    )
})
