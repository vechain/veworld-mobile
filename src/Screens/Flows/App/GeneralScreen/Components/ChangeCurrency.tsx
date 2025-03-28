import React, { useCallback } from "react"
import { CURRENCY } from "~Constants"
import { currencyConfig } from "~Constants/Constants"
import { BaseButtonGroupHorizontal } from "~Components"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { selectCurrency } from "~Storage/Redux/Selectors"
import { setCurrency } from "~Storage/Redux/Actions"
import { BaseButtonGroupHorizontalType } from "~Model"

const currencies: Array<BaseButtonGroupHorizontalType> = currencyConfig.map(currency => ({
    id: currency.currency,
    label: currency.currency,
    icon: currency.iconName,
}))

export const ChangeCurrency: React.FC = () => {
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
            selectedButtonIds={[selectedCurrency || ""]}
            buttons={currencies}
            action={handleSelectCurrency}
        />
    )
}
