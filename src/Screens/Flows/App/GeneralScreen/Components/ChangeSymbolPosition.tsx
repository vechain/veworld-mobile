import React, { useCallback, useMemo } from "react"
import { BaseTabs } from "~Components/Base/BaseTabs"
import { SYMBOL_POSITIONS, symbolPositions } from "~Constants"
import { useFormatFiat } from "~Hooks/useFormatFiat"
import { BaseButtonGroupHorizontalType } from "~Model"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { setSymbolPosition } from "~Storage/Redux/Actions"
import { selectSymbolPosition } from "~Storage/Redux/Selectors"

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
        async (currency: string) => {
            dispatch(setSymbolPosition(currency as SYMBOL_POSITIONS))
        },
        [dispatch],
    )

    return (
        <BaseTabs
            keys={positions.map(p => p.id)}
            labels={positions.map(p => p.label)}
            selectedKey={symbolPosition}
            setSelectedKey={handleSelectCurrency}
        />
    )
}
