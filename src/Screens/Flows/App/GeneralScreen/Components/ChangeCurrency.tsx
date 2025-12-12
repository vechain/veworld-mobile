import React, { useCallback } from "react"
import { BaseTabs } from "~Components/Base/BaseTabs"
import { CURRENCY } from "~Constants"
import { currencyConfig } from "~Constants/Constants"
import { BaseButtonGroupHorizontalType } from "~Model"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { setCurrency } from "~Storage/Redux/Actions"
import { selectCurrency } from "~Storage/Redux/Selectors"

const currencies: Array<BaseButtonGroupHorizontalType> = currencyConfig.map(currency => ({
    id: currency.currency,
    label: `${currency.symbol} ${currency.currency}`,
}))

export const ChangeCurrency: React.FC = () => {
    const selectedCurrency = useAppSelector(selectCurrency)

    const dispatch = useAppDispatch()

    const handleSelectCurrency = useCallback(
        async (currency: string) => {
            dispatch(setCurrency(currency as CURRENCY))
        },
        [dispatch],
    )

    return (
        <BaseTabs
            keys={currencies.map(curr => curr.id)}
            labels={currencies.map(curr => curr.label)}
            selectedKey={selectedCurrency}
            setSelectedKey={handleSelectCurrency}
        />
    )
}
