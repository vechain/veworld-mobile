import React, { useCallback, useMemo, useState } from "react"
import { BaseButtonGroupHorizontal } from "~Components"
import { Button } from "~Components/Base/BaseButtonGroupHorizontal"
import { getUserPreferences, useRealm } from "~Storage"

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
    const { store } = useRealm()

    const userPref = getUserPreferences(store)

    const currencyPref = useMemo(() => userPref?.currency, [userPref])

    const [selectedCurrency, setSelectedCurrency] =
        useState<string>(currencyPref)

    const handleSelectCurrency = useCallback(
        (button: Button) => {
            setSelectedCurrency(button.id)

            // update realm userPref currency
            store.write(() => {
                if (userPref) {
                    userPref.currency = button.id
                }
            })
        },
        [store, userPref],
    )

    return (
        <BaseButtonGroupHorizontal
            selectedButtonIds={[selectedCurrency || ""]}
            buttons={currencies}
            action={handleSelectCurrency}
        />
    )
}
