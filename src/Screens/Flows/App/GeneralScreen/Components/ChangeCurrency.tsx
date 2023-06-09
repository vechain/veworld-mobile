import React, { useCallback } from "react"
import { CURRENCY, currencyConfig } from "~Constants"
import { BaseButtonGroupHorizontal } from "~Components"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { selectCoinGeckoTokens, selectCurrency } from "~Storage/Redux/Selectors"
import { fetchExchangeRates, setCurrency } from "~Storage/Redux/Actions"
import { BaseButtonGroupHorizontalType } from "~Model"

const currencies: Array<BaseButtonGroupHorizontalType> = currencyConfig.map(
    currency => ({
        id: currency.currency,
        label: currency.currency,
        icon: currency.iconName,
    }),
)

export const ChangeCurrency: React.FC = () => {
    const coinGeckoTokens = useAppSelector(selectCoinGeckoTokens)
    const selectedCurrency = useAppSelector(selectCurrency)

    const dispatch = useAppDispatch()

    const handleSelectCurrency = useCallback(
        async (button: BaseButtonGroupHorizontalType) => {
            dispatch(setCurrency(button.id as CURRENCY))
            await dispatch(fetchExchangeRates({ coinGeckoTokens }))
        },
        [coinGeckoTokens, dispatch],
    )

    return (
        <BaseButtonGroupHorizontal
            selectedButtonIds={[selectedCurrency || ""]}
            buttons={currencies}
            action={handleSelectCurrency}
        />
    )
}
