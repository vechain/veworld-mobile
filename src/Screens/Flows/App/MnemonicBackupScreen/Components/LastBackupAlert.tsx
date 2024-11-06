import React from "react"
import { useI18nContext } from "~i18n"
import { LocalDevice } from "~Model"
import { AlertInline } from "~Components/Reusable/Alert"

export const LastBackupAlert = ({ deviceToBackup }: { deviceToBackup?: LocalDevice }) => {
    const { LL } = useI18nContext()

    if (!deviceToBackup) return null

    const message = deviceToBackup.isBackedUpOnCloud
        ? LL.ALERT_MSG_LAST_BACKUP_ICLOUD_DATE({
              date: deviceToBackup.lastCloudBackupDate ?? "",
          })
        : LL.ALERT_MSG_LAST_BACKUP_DATE({
              date: deviceToBackup.lastBackupDate ?? "",
          })

    return <AlertInline message={message} status="success" />
}
