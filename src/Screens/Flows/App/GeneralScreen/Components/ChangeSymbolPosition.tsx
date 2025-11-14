import React, { useCallback, useMemo } from "react"
import { SYMBOL_POSITIONS, symbolPositions } from "~Constants"
import { BaseButtonGroupHorizontal } from "~Components"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { selectSymbolPosition } from "~Storage/Redux/Selectors"
import { setSymbolPosition } from "~Storage/Redux/Actions"
import { BaseButtonGroupHorizontalType } from "~Model"
import { useFormatFiat } from "~Hooks/useFormatFiat"

export const ChangeSymbolPosition: React.FC = () => {
    const symbolPosition = useAppSelector(selectSymbolPosition)
    const { formatFiat } = useFormatFiat()

    const dispatch = useAppDispatch()

    const positions: Array<BaseButtonGroupHorizontalType> = useMemo(
        () =>
            symbolPositions.map(pos => ({
                id: pos,
                label: formatFiat({
                    amount: 100,
                    decimals: 0,
                    symbolPosition: pos,
                }),
            })),
        [formatFiat],
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
