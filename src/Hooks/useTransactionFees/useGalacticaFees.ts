import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { GasPriceCoefficient } from "~Constants"
import { useThorClient } from "~Hooks/useThorClient"
import { ethFeeHistory, ThorClient } from "@vechain/sdk-network"
import { HexUInt } from "@vechain/sdk-core"
import { BigNumberUtils, BigNutils } from "~Utils"
import { EstimateGasResult } from "~Model"

type Props = {
    isGalactica: boolean
    blockId?: string
    gas: EstimateGasResult | undefined
}

type FeeHistoryResponse = Awaited<ReturnType<typeof ethFeeHistory>>

const calculateFeeHistory = (res: FeeHistoryResponse, maxPriorityFee: string) => {
    //It should never happen
    if (!res.reward) return
    //Slicing because the last reward will always be 0, since it's targeting `next`
    const allRewards = res.reward.slice(0, -1)
    const latestBlockRewards = allRewards[allRewards.length - 1]
    const differentRewardsOnLastBlock = new Set(latestBlockRewards).size === 3
    //Base fees, on the other hand, are correct. The latest value is the value of the next block
    const latestBaseFee = HexUInt.of(res.baseFeePerGas[res.baseFeePerGas.length - 1]).bi

    const rewardRegular = BigNumberUtils.min(
        differentRewardsOnLastBlock
            ? HexUInt.of(latestBlockRewards[0]).bi
            : BigNumberUtils.average(allRewards.map(rewards => rewards[0])).toBigInt,
        HexUInt.of(maxPriorityFee).bi,
    ).toBigInt
    const rewardMedium = BigNumberUtils.min(
        differentRewardsOnLastBlock
            ? HexUInt.of(latestBlockRewards[1]).bi
            : BigNumberUtils.average(allRewards.map(rewards => rewards[1])).toBigInt,
        HexUInt.of(maxPriorityFee).bi,
    ).toBigInt
    const rewardHigh = BigNumberUtils.min(
        differentRewardsOnLastBlock
            ? HexUInt.of(latestBlockRewards[2]).bi
            : BigNumberUtils.average(allRewards.map(rewards => rewards[2])).toBigInt,
        HexUInt.of(maxPriorityFee).bi,
    ).toBigInt

    const baseFeeRegular = BigNutils(latestBaseFee.toString()).multiply(1.02).toBigInt
    const baseFeeMedium = BigNutils(latestBaseFee.toString()).multiply(1.03).toBigInt
    const baseFeeHigh = BigNutils(latestBaseFee.toString()).multiply(1.046).toBigInt

    return {
        [GasPriceCoefficient.REGULAR]: {
            estimatedFee: BigNutils((latestBaseFee + rewardRegular).toString()),
            maxFee: BigNutils((baseFeeRegular + rewardRegular).toString()),
            priorityFee: BigNutils(rewardRegular.toString()),
        },
        [GasPriceCoefficient.MEDIUM]: {
            estimatedFee: BigNutils((latestBaseFee + rewardMedium).toString()),
            maxFee: BigNutils((baseFeeMedium + rewardMedium).toString()),
            priorityFee: BigNutils(rewardMedium.toString()),
        },
        [GasPriceCoefficient.HIGH]: {
            estimatedFee: BigNutils((latestBaseFee + rewardHigh).toString()),
            maxFee: BigNutils((baseFeeHigh + rewardHigh).toString()),
            priorityFee: BigNutils(rewardHigh.toString()),
        },
    }
}

const getFees = async (thorClient: ThorClient) => {
    const [maxPriorityFee, feeHistory] = await Promise.all([
        thorClient.gas.getMaxPriorityFeePerGas(),
        thorClient.gas.getFeeHistory({
            blockCount: 9,
            newestBlock: "next",
            rewardPercentiles: [20, 40, 75],
        }),
    ])

    return {
        maxPriorityFee,
        feeHistory,
    }
}

export const useGalacticaFees = ({ isGalactica, gas }: Props) => {
    const thorClient = useThorClient()

    const {
        isFetching: isLoading,
        data: feesResponse,
        dataUpdatedAt,
        isLoading: isFirstTimeLoading,
    } = useQuery({
        queryKey: ["GalacticaFees"],
        queryFn: () => getFees(thorClient),
        enabled: isGalactica,
        placeholderData: keepPreviousData,
        refetchInterval: 10000,
    })

    const options = useMemo(() => {
        if (typeof feesResponse === "undefined") return
        return calculateFeeHistory(feesResponse.feeHistory, feesResponse.maxPriorityFee)
    }, [feesResponse])

    const txOptions = useMemo(() => {
        if (!options) return
        return {
            [GasPriceCoefficient.REGULAR]: {
                maxFeePerGas: options[GasPriceCoefficient.REGULAR].maxFee.clone().toString,
                maxPriorityFeePerGas: options[GasPriceCoefficient.REGULAR].priorityFee.clone().toString,
            },
            [GasPriceCoefficient.MEDIUM]: {
                maxFeePerGas: options[GasPriceCoefficient.MEDIUM].maxFee.clone().toString,
                maxPriorityFeePerGas: options[GasPriceCoefficient.MEDIUM].priorityFee.clone().toString,
            },
            [GasPriceCoefficient.HIGH]: {
                maxFeePerGas: options[GasPriceCoefficient.HIGH].maxFee.clone().toString,
                maxPriorityFeePerGas: options[GasPriceCoefficient.HIGH].priorityFee.clone().toString,
            },
        }
    }, [options])

    const gasOptions = useMemo(() => {
        if (!options) return
        return {
            [GasPriceCoefficient.REGULAR]: {
                estimatedFee: options[GasPriceCoefficient.REGULAR].estimatedFee.clone().multiply(gas?.gas ?? 0),
                maxFee: options[GasPriceCoefficient.REGULAR].maxFee.clone().multiply(gas?.gas ?? 0),
                priorityFee: options[GasPriceCoefficient.REGULAR].priorityFee.clone().multiply(gas?.gas ?? 0),
            },
            [GasPriceCoefficient.MEDIUM]: {
                estimatedFee: options[GasPriceCoefficient.MEDIUM].estimatedFee.clone().multiply(gas?.gas ?? 0),
                maxFee: options[GasPriceCoefficient.MEDIUM].maxFee.clone().multiply(gas?.gas ?? 0),
                priorityFee: options[GasPriceCoefficient.MEDIUM].priorityFee.clone().multiply(gas?.gas ?? 0),
            },
            [GasPriceCoefficient.HIGH]: {
                estimatedFee: options[GasPriceCoefficient.HIGH].estimatedFee.clone().multiply(gas?.gas ?? 0),
                maxFee: options[GasPriceCoefficient.HIGH].maxFee.clone().multiply(gas?.gas ?? 0),
                priorityFee: options[GasPriceCoefficient.HIGH].priorityFee.clone().multiply(gas?.gas ?? 0),
            },
        }
    }, [gas?.gas, options])

    const isBaseFeeRampingUp = useMemo(() => {
        if (typeof feesResponse === "undefined") return false
        const baseFees = feesResponse.feeHistory.baseFeePerGas.map(bFee => HexUInt.of(bFee).bi)
        return BigNutils((baseFees[baseFees.length - 1] - baseFees[3]).toString())
            .div(baseFees[3].toString())
            .isBiggerThan("0.05")
    }, [feesResponse])

    /**
     * Enable Speed Change modal only if there's at least 5% increase in the base fee over the last 5 blocks.
     * Disable Speed Change modal only if there's at least a 2% decrease in the base fee over the last 4 blocks.
     */
    const speedChangeEnabled = useMemo(() => {
        if (typeof feesResponse === "undefined") return false
        const baseFees = feesResponse.feeHistory.baseFeePerGas.map(bFee => HexUInt.of(bFee).bi)
        //If there's a ramp up, enable speed change
        if (
            BigNutils((baseFees[baseFees.length - 1] - baseFees[3]).toString())
                .div(baseFees[3].toString())
                .isBiggerThan("0.05")
        )
            return true
        const peakValue = BigNumberUtils.max(...baseFees)
        const minValue = BigNumberUtils.min(...baseFees)
        if (BigNutils(peakValue.toString).minus(minValue.toString).div(minValue.toString).isLessThan("0.01"))
            return false
        const peakIndex = baseFees.length - 1 - [...baseFees].reverse().findIndex(bFee => bFee === peakValue.toBigInt)
        //If the amount of blocks after the peak is less than 3, then we should keep the modal
        if (peakIndex >= 5) {
            const sliced = baseFees.slice(peakIndex - 4, peakIndex + 1)
            return BigNutils((sliced[sliced.length - 1] - sliced[0]).toString())
                .div(sliced[0].toString())
                .isBiggerThan("0.05")
        }
        const slicedFees = baseFees.slice(peakIndex + 1)
        const minimumValue = BigNumberUtils.min(...slicedFees).toBigInt
        if (
            BigNutils((peakValue.toBigInt - minimumValue).toString())
                .div(minimumValue.toString())
                .isBiggerThan("0.02")
        )
            return false
        return true
    }, [feesResponse])

    const memoized = useMemo(
        () => ({
            isLoading,
            options: gasOptions,
            txOptions: txOptions,
            maxPriorityFee: feesResponse?.maxPriorityFee
                ? BigNutils(HexUInt.of(feesResponse.maxPriorityFee).bi.toString())
                : BigNutils("0"),
            dataUpdatedAt,
            isBaseFeeRampingUp,
            speedChangeEnabled,
            isFirstTimeLoading,
        }),
        [
            dataUpdatedAt,
            feesResponse?.maxPriorityFee,
            gasOptions,
            isBaseFeeRampingUp,
            isFirstTimeLoading,
            isLoading,
            speedChangeEnabled,
            txOptions,
        ],
    )

    return memoized
}
