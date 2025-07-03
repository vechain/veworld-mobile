import { default as React } from "react"
import { BaseIcon, BaseText, BaseView } from "~Components/Base"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"

type Props = {
    isEnoughBalance: boolean
}

export const NoTokensAvailableForFee = ({ isEnoughBalance }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    if (isEnoughBalance) return null

    return (
        <BaseView flexDirection="row" bg={theme.colors.errorAlert.background} gap={12} borderRadius={6} px={12} py={8}>
            <BaseIcon size={16} color={theme.colors.errorAlert.icon} name="icon-alert-triangle" />
            <BaseText typographyFont="body" color={theme.colors.errorAlert.text}>
                {LL.NO_TOKENS_AVAILABLE_FOR_FEE()}
            </BaseText>
        </BaseView>
    )
}
