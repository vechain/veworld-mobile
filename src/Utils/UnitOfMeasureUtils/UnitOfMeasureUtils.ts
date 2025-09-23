import { getNumberFormatter } from "~Constants"
import BigNutils from "~Utils/BigNumberUtils"
import { UnitOfMeasureRecord } from "./constants"

export const formatValue = <TUnits extends UnitOfMeasureRecord>(
    value: number,
    {
        minUnit,
        availableUnits,
        locale,
    }: { minUnit: TUnits[keyof TUnits]; availableUnits: TUnits; locale: Intl.LocalesArgument },
) => {
    const minUnitDecimals = parseInt(Object.entries(availableUnits).find(([_, unit]) => unit === minUnit)![0], 10)
    const valueDecimals = Math.log10(value)
    if (valueDecimals < minUnitDecimals)
        return {
            value: getNumberFormatter({ locale, precision: 2, style: "decimal", useGrouping: false }).format(
                BigNutils(value).div(BigNutils(10).toBN.pow(minUnitDecimals)).toNumber,
            ),
            unit: minUnit,
        }

    const target = Object.entries(availableUnits)
        .map(([decimals, unit]) => [parseInt(decimals, 10), unit] as const)
        .sort(([dec1], [dec2]) => dec1 - dec2)
        .reverse()
        .find(([decimals]) => decimals <= valueDecimals)!

    return {
        value: getNumberFormatter({ locale, precision: 0, style: "decimal", useGrouping: false }).format(
            Math.floor(BigNutils(value).div(BigNutils(10).toBN.pow(target[0])).toNumber),
        ),
        unit: target[1],
    }
}
