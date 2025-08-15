import React from "react"
import { BaseIcon, BaseText, BaseView } from "~Components/Base"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"

export const LedgerDeviceAlert = () => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    return (
        <BaseView
            flexDirection="row"
            alignItems="center"
            bg={theme.colors.warningAlert.background}
            gap={12}
            py={8}
            px={12}
            borderRadius={6}
            mt={8}
            testID="LEDGER_DEVICE_ALERT">
            <BaseIcon size={16} color={theme.colors.warningAlert.icon} name="icon-alert-triangle" />
            <BaseText typographyFont="body" color={theme.colors.warningAlert.text} flex={1} flexDirection="row">
                {LL.LEDGER_DEVICE_ALERT()}
            </BaseText>
        </BaseView>
    )
}
