import React, { useCallback } from "react"
import { CURRENCY } from "~Common"
import CurrencyConfig from "~Common/Constant/CurrencyConfig/CurrencyConfig"
import { BaseButtonGroupHorizontal } from "~Components"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { selectCurrency } from "~Storage/Redux/Selectors"
import { setCurrency } from "~Storage/Redux/Actions"
import { BaseButtonGroupHorizontalTpye } from "~Model"

const currencies: Array<BaseButtonGroupHorizontalTpye> = CurrencyConfig.map(
    currency => ({
        id: currency.currency,
        label: currency.currency,
        icon: currency.iconName,
    }),
)

export const ChangeCurrency: React.FC = () => {
    const selectedCurrency = useAppSelector(selectCurrency)

    const dispatch = useAppDispatch()

    const handleSelectCurrency = useCallback(
        (button: BaseButtonGroupHorizontalTpye) => {
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
