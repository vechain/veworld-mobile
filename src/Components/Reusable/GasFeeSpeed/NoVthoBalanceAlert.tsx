import { default as React } from "react"
import { BaseIcon, BaseText, BaseView } from "~Components/Base"
import { VTHO } from "~Constants"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"

type Props = {
    delegationToken: string
    isEnoughBalance: boolean
}

export const NoVthoBalanceAlert = ({ delegationToken, isEnoughBalance }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    if (delegationToken !== VTHO.symbol) return null
    if (isEnoughBalance) return null

    return (
        <BaseView px={16}>
            <BaseView
                flexDirection="row"
                bg={theme.colors.errorAlert.background}
                gap={12}
                borderRadius={6}
                px={12}
                py={8}>
                <BaseIcon size={16} color={theme.colors.errorAlert.icon} name="icon-alert-triangle" />
                <BaseText typographyFont="body" color={theme.colors.errorAlert.text}>
                    {LL.NO_VTHO_BALANCE()}
                </BaseText>
            </BaseView>
        </BaseView>
    )
}
