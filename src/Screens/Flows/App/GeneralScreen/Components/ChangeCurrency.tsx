import React, { useCallback } from "react"
import { CURRENCY } from "~Common"
import CurrencyConfig from "~Common/Constant/CurrencyConfig/CurrencyConfig"
import { BaseButtonGroupHorizontal } from "~Components"
import { Button } from "~Components/Base/BaseButtonGroupHorizontal"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { selectCurrency } from "~Storage/Redux/Selectors"
import { setCurrency } from "~Storage/Redux/Actions"

const currencies: Array<Button> = CurrencyConfig.map(currency => ({
    id: currency.currency,
    label: currency.currency,
    icon: currency.iconName,
}))

export const ChangeCurrency: React.FC = () => {
    const selectedCurrency = useAppSelector(selectCurrency)

    const dispatch = useAppDispatch()

    const handleSelectCurrency = useCallback(
        (button: Button) => {
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
