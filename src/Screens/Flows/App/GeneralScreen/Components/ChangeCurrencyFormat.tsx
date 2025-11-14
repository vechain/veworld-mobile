import React, { useMemo } from "react"
import { BaseButtonGroupHorizontal } from "~Components"
import { COLORS, CURRENCY_FORMATS } from "~Constants"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { BaseButtonGroupHorizontalType } from "~Model"
import { selectCurrencyFormat, setCurrencyFormat, useAppDispatch, useAppSelector } from "~Storage/Redux"

export const ChangeCurrencyFormat = () => {
    const { LL } = useI18nContext()
    const currencyFormat = useAppSelector(selectCurrencyFormat)
    const theme = useTheme()
    const dispatch = useAppDispatch()
    const separators = useMemo<BaseButtonGroupHorizontalType[]>(() => {
        return [
            {
                id: CURRENCY_FORMATS.COMMA,
                label: `${LL.BD_CURRENCY_FORMAT_OPTION_comma()} ,`,
            },
            {
                id: CURRENCY_FORMATS.DOT,
                label: `${LL.BD_CURRENCY_FORMAT_OPTION_dot()} .`,
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
            typographyFont="captionMedium"
            color={theme.isDark ? COLORS.WHITE : COLORS.GREY_600}
            selectedColor={theme.isDark ? COLORS.WHITE : COLORS.GREY_700}
            selectedBackgroundColor={theme.isDark ? COLORS.DARK_PURPLE : COLORS.GREY_100}
            showBorder
        />
    )
}
