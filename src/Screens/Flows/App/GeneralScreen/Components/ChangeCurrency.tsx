import React, { useCallback } from "react"
import { CURRENCY } from "~Common/Enums"
import CurrencyConfig from "~Common/Constant/CurrencyConfig/CurrencyConfig"
import { BaseButtonGroupHorizontal } from "~Components"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { selectCoinGeckoTokens, selectCurrency } from "~Storage/Redux/Selectors"
import { fetchExchangeRates, setCurrency } from "~Storage/Redux/Actions"
import { BaseButtonGroupHorizontalType } from "~Model"

const currencies: Array<BaseButtonGroupHorizontalType> = CurrencyConfig.map(
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
        (button: BaseButtonGroupHorizontalType) => {
            dispatch(setCurrency(button.id as CURRENCY))
            dispatch(fetchExchangeRates({ coinGeckoTokens }))
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
