import moment from "moment"
import { useMemo } from "react"
import { GasPriceCoefficient } from "~Constants"
import { EstimateGasResult } from "~Model"
import { BigNumberUtils } from "~Utils"
import { useGalacticaFees } from "./useGalacticaFees"
import { useLegacyFees } from "./useLegacyFees"

type Props = {
    coefficient: GasPriceCoefficient
    gas: EstimateGasResult | undefined
    isGalactica: boolean
}

export type TransactionFeesResult = Record<
    GasPriceCoefficient,
    {
        estimatedFee: BigNumberUtils
        maxFee: BigNumberUtils
        priorityFee: BigNumberUtils
    }
>

export const useTransactionFees = ({ gas, coefficient, isGalactica }: Props) => {
    const {
        isLoading: isGalacticaFeesLoading,
        options: galacticaOptions,
        txOptions: galacticaTxOptions,
        maxPriorityFee: galacticaMaxPriorityFee,
        dataUpdatedAt,
        isBaseFeeRampingUp: galacticaBaseFeeRampingUp,
        speedChangeEnabled,
        isFirstTimeLoading: isFirstTimeLoadingGalactica,
    } = useGalacticaFees({ isGalactica, gas })

    const {
        isLoading: isLegacyFeesLoading,
        options: legacyOptions,
        txOptions: legacyTxOptions,
        isFirstTimeLoading: isFirstTimeLoadingLegacy,
    } = useLegacyFees({ gas })

    const options = useMemo(() => {
        return isGalactica && galacticaOptions ? galacticaOptions! : legacyOptions
    }, [galacticaOptions, isGalactica, legacyOptions])

    const txOptions = useMemo(() => {
        return isGalactica && galacticaTxOptions ? galacticaTxOptions! : legacyTxOptions
    }, [galacticaTxOptions, isGalactica, legacyTxOptions])

    const result = useMemo(() => {
        return {
            estimatedFee: options[coefficient].estimatedFee,
            maxFee: options[coefficient].maxFee,
            txOptions: txOptions,
        }
    }, [options, coefficient, txOptions])

    const isBaseFeeRampingUp = useMemo(() => {
        return isGalactica ? galacticaBaseFeeRampingUp : false
    }, [galacticaBaseFeeRampingUp, isGalactica])

    const memoized = useMemo(
        () => ({
            ...result,
            options,
            isLoading: isLegacyFeesLoading || isGalacticaFeesLoading,
            dataUpdatedAt: dataUpdatedAt ?? moment().valueOf(),
            maxPriorityFee: galacticaMaxPriorityFee,
            isBaseFeeRampingUp,
            speedChangeEnabled,
            isFirstTimeLoading: isFirstTimeLoadingGalactica || isFirstTimeLoadingLegacy,
        }),
        [
            result,
            options,
            isLegacyFeesLoading,
            isGalacticaFeesLoading,
            dataUpdatedAt,
            galacticaMaxPriorityFee,
            isBaseFeeRampingUp,
            speedChangeEnabled,
            isFirstTimeLoadingGalactica,
            isFirstTimeLoadingLegacy,
        ],
    )

    return memoized
}
