import React, { useCallback } from "react"
import { COLORS, CURRENCY } from "~Constants"
import { currencyConfig } from "~Constants/Constants"
import { BaseButtonGroupHorizontal } from "~Components"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { selectCurrency } from "~Storage/Redux/Selectors"
import { setCurrency } from "~Storage/Redux/Actions"
import { BaseButtonGroupHorizontalType } from "~Model"
import { useTheme } from "~Hooks"

const currencies: Array<BaseButtonGroupHorizontalType> = currencyConfig.map(currency => ({
    id: currency.currency,
    label: `${currency.symbol} ${currency.currency}`,
}))

export const ChangeCurrency: React.FC = () => {
    const theme = useTheme()
    const selectedCurrency = useAppSelector(selectCurrency)

    const dispatch = useAppDispatch()

    const handleSelectCurrency = useCallback(
        async (button: BaseButtonGroupHorizontalType) => {
            dispatch(setCurrency(button.id as CURRENCY))
        },
        [dispatch],
    )

    return (
        <BaseButtonGroupHorizontal
            typographyFont="captionMedium"
            selectedButtonIds={[selectedCurrency || ""]}
            buttons={currencies}
            action={handleSelectCurrency}
            color={theme.isDark ? COLORS.WHITE : COLORS.GREY_600}
            selectedColor={theme.isDark ? COLORS.WHITE : COLORS.GREY_700}
            selectedBackgroundColor={theme.isDark ? COLORS.DARK_PURPLE : COLORS.GREY_100}
            showBorder
        />
    )
}
