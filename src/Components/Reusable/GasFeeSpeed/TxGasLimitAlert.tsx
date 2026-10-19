import { default as React } from "react"
import { BaseIcon, BaseText, BaseView } from "~Components/Base"
import { MAX_TX_GAS_LIMIT } from "~Constants"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { GasUtils } from "~Utils"

type Props = {
    exceedsTxGasLimit: boolean
    estimatedGas?: number
}

/** Shown when the estimate (or a dApp's own gas) is over thor's per-transaction cap. */
export const TxGasLimitAlert = ({ exceedsTxGasLimit, estimatedGas }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    if (!exceedsTxGasLimit) return null

    return (
        <BaseView px={16} pt={12} testID="TX_GAS_LIMIT_ALERT">
            <BaseView
                flexDirection="row"
                bg={theme.colors.errorAlert.background}
                gap={12}
                borderRadius={6}
                px={12}
                py={8}>
                <BaseIcon size={16} color={theme.colors.errorAlert.icon} name="icon-alert-triangle" />
                <BaseText typographyFont="caption" color={theme.colors.errorAlert.text} flexDirection="row" flex={1}>
                    {LL.TRANSACTION_EXCEEDS_GAS_LIMIT({
                        needed: GasUtils.formatGasMillions(estimatedGas ?? 0),
                        limit: GasUtils.formatGasMillions(MAX_TX_GAS_LIMIT),
                    })}
                </BaseText>
            </BaseView>
        </BaseView>
    )
}
