import React from "react"
import { BaseView, Layout } from "~Components"
import { useI18nContext } from "~i18n"
import { IndexerSettings } from "./Components/IndexerSettings"
import { NotificationCenterSettings } from "./Components/NotificationCenterSettings"

export const DeveloperSettingsScreen = () => {
    const { LL } = useI18nContext()

    return (
        <Layout
            title={LL.TITLE_DEVELOPER_SETTINGS()}
            body={
                <BaseView flexGrow={1} gap={8}>
                    <NotificationCenterSettings />
                    <IndexerSettings />
                </BaseView>
            }
        />
    )
}
