import React from "react"
import { BaseButton, BaseView } from "~Components"
import { BaseAccordionV2 } from "~Components/Base/BaseAccordionV2"
import { useSmartWallet } from "~Hooks"
import { useI18nContext } from "~i18n"

export const SmartWalletSettings = () => {
    const { LL } = useI18nContext()
    const { logout } = useSmartWallet()

    return (
        <BaseAccordionV2>
            <BaseAccordionV2.Header>
                <BaseAccordionV2.HeaderText>{LL.DEVELOPER_SETTING_SMART_WALLET_TITLE()}</BaseAccordionV2.HeaderText>
                <BaseAccordionV2.HeaderIcon />
            </BaseAccordionV2.Header>
            <BaseAccordionV2.Content>
                <BaseView flexDirection="column" gap={8}>
                    <BaseAccordionV2.ContentDescription>
                        {LL.DEVELOPER_SETTING_SMART_WALLET_DESCRIPTION()}
                    </BaseAccordionV2.ContentDescription>
                    <BaseButton title={LL.COMMON_BTN_SIGN_OUT()} action={logout} />
                </BaseView>
            </BaseAccordionV2.Content>
        </BaseAccordionV2>
    )
}
