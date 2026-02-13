import React from "react"
import { BaseButton, BaseView, Layout } from "~Components"
import { useSmartWallet } from "~Hooks"
import { useI18nContext } from "~i18n"
import { DEVICE_TYPE } from "~Model"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { IndexerSettings } from "./Components/IndexerSettings"
import { NotificationCenterSettings } from "./Components/NotificationCenterSettings"

export const DeveloperSettingsScreen = () => {
    const { LL } = useI18nContext()
    const { logout } = useSmartWallet()
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const hasSelectedSmartWallet = selectedAccount?.device?.type === DEVICE_TYPE.SMART_WALLET

    return (
        <Layout
            title={LL.TITLE_DEVELOPER_SETTINGS()}
            body={
                <BaseView flexGrow={1} gap={8}>
                    <NotificationCenterSettings />
                    <IndexerSettings />
                    {hasSelectedSmartWallet && <BaseButton title={LL.COMMON_BTN_SIGN_OUT()} action={logout} />}
                </BaseView>
            }
        />
    )
}
