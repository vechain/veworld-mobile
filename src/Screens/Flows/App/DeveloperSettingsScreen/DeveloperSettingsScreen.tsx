import React from "react"
import { BaseView, Layout } from "~Components"
import { useI18nContext } from "~i18n"
import { DEVICE_TYPE } from "~Model"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { IndexerSettings } from "./Components/IndexerSettings"
import { NotificationCenterSettings } from "./Components/NotificationCenterSettings"
import { SmartWalletSettings } from "./Components/SmartWalletSettings"

export const DeveloperSettingsScreen = () => {
    const { LL } = useI18nContext()
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const hasSelectedSmartWallet = selectedAccount?.device?.type === DEVICE_TYPE.SMART_WALLET

    return (
        <Layout
            title={LL.TITLE_DEVELOPER_SETTINGS()}
            body={
                <BaseView flexGrow={1} gap={8}>
                    <NotificationCenterSettings />
                    <IndexerSettings />
                    {hasSelectedSmartWallet && <SmartWalletSettings />}
                </BaseView>
            }
        />
    )
}
