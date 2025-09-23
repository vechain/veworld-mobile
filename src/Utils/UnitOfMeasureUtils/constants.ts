export type UnitOfMeasureRecord = {
    [key: number]: string
}

export const GRAMS_UNITS = {
    3: "Kg",
    6: "Mg",
    9: "Gg",
    12: "Tg",
} as const satisfies UnitOfMeasureRecord

export const LITERS_UNITS = {
    3: "L",
    6: "KL",
    9: "ML",
    12: "TL",
} as const satisfies UnitOfMeasureRecord

export const WATT_UNITS = {
    3: "KWh",
    6: "MWh",
    9: "GWh",
    12: "TWh",
} as const satisfies UnitOfMeasureRecord
