import { BigNumberUtils } from "~Utils"

export enum GasPriceCoefficient {
    REGULAR = 0,
    MEDIUM = 127,
    HIGH = 255,
}

export interface GasFeeOption {
    gasFee: string
    gasRaw: BigNumberUtils
}
