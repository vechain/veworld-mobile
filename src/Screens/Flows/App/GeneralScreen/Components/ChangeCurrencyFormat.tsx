import React, { useMemo } from "react"
import { BaseButtonGroupHorizontal } from "~Components"
import { CURRENCY_FORMATS } from "~Constants"
import { useI18nContext } from "~i18n"
import { BaseButtonGroupHorizontalType } from "~Model"
import { selectCurrencyFormat, setCurrencyFormat, useAppDispatch, useAppSelector } from "~Storage/Redux"

export const ChangeCurrencyFormat = () => {
    const { LL } = useI18nContext()
    const currencyFormat = useAppSelector(selectCurrencyFormat)

    const dispatch = useAppDispatch()
    const separators = useMemo<BaseButtonGroupHorizontalType[]>(() => {
        return [
            {
                id: CURRENCY_FORMATS.COMMA,
                label: LL.BD_CURRENCY_FORMAT_OPTION_comma(),
            },
            {
                id: CURRENCY_FORMATS.DOT,
                label: LL.BD_CURRENCY_FORMAT_OPTION_dot(),
            },
            {
                id: CURRENCY_FORMATS.SYSTEM,
                label: LL.BD_CURRENCY_FORMAT_OPTION_system(),
            },
        ]
    }, [LL])

    return (
        <BaseButtonGroupHorizontal
            action={value => {
                dispatch(setCurrencyFormat(value.id as CURRENCY_FORMATS))
            }}
            buttons={separators}
            selectedButtonIds={[currencyFormat]}
        />
    )
}
