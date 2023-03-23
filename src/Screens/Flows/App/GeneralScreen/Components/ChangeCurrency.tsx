import React, { useCallback, useState } from "react"
import { BaseButtonGroupHorizontal } from "~Components"
import { Button } from "~Components/Base/BaseButtonGroupHorizontal"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { selectCurrency } from "~Storage/Redux/Selectors"
import { setCurrency } from "~Storage/Redux/Slices/UserPreferences"

const currencies: Array<Button> = [
    {
        id: "euro",
        label: "EUR",
        icon: "currency-eur",
    },
    {
        id: "usd",
        label: "USD",
        icon: "currency-usd",
    },
]

export const ChangeCurrency: React.FC = () => {
    const currencyPref = useAppSelector(selectCurrency)

    const [selectedCurrency, setSelectedCurrency] =
        useState<string>(currencyPref)

    const dispatch = useAppDispatch()

    const handleSelectCurrency = useCallback(
        (button: Button) => {
            setSelectedCurrency(button.id)

            // update redux store
            dispatch(setCurrency(button.id))
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
