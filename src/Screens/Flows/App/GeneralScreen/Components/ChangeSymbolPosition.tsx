import React, { useCallback, useMemo } from "react"
import { SYMBOL_POSITIONS, symbolPositions } from "~Constants"
import { BaseButtonGroupHorizontal } from "~Components"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { selectSymbolPosition } from "~Storage/Redux/Selectors"
import { setSymbolPosition } from "~Storage/Redux/Actions"
import { BaseButtonGroupHorizontalType } from "~Model"
import { useI18nContext } from "~i18n"
import { useFormatFiat } from "~Hooks/useFormatFiat"

export const ChangeSymbolPosition: React.FC = () => {
    const symbolPosition = useAppSelector(selectSymbolPosition)
    const { LL } = useI18nContext()
    const { formatFiat } = useFormatFiat()

    const dispatch = useAppDispatch()

    const positions: Array<BaseButtonGroupHorizontalType> = useMemo(
        () =>
            symbolPositions.map(pos => ({
                id: pos,
                label: `${LL[`BD_SYMBOL_POSITION_OPTION_${pos}`]()} \n(${formatFiat({
                    amount: 100,
                    symbolPosition: pos,
                })})`,
            })),
        [LL, formatFiat],
    )

    const handleSelectCurrency = useCallback(
        async (button: BaseButtonGroupHorizontalType) => {
            dispatch(setSymbolPosition(button.id as SYMBOL_POSITIONS))
        },
        [dispatch],
    )

    return (
        <BaseButtonGroupHorizontal
            selectedButtonIds={[symbolPosition || ""]}
            buttons={positions}
            action={handleSelectCurrency}
        />
    )
}
