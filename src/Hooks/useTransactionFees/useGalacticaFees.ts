import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { GasPriceCoefficient } from "~Constants"
import { useThorClient } from "~Hooks/useThorClient"
import { ethFeeHistory } from "@vechain/sdk-network"
import { HexUInt } from "@vechain/sdk-core"
import { BigNutils } from "~Utils"
import { EstimateGasResult } from "~Model"

type Props = {
    isGalactica: boolean
    blockId?: string
    gas: EstimateGasResult | undefined
}

const average = (values: string[]) =>
    BigNutils(values.reduce((acc, v) => acc + HexUInt.of(v).bi, 0n).toString()).div(values.length).toBigInt

type FeeHistoryResponse = Awaited<ReturnType<typeof ethFeeHistory>>
/**
 *
 * @param res History response
 * @param offset Offset from the length of the array (defaults to -1)
 * @returns
 */
const calculateFeeOfBlock = (res: FeeHistoryResponse, offset: number = 1) => {
    //It should never happen
    if (!res.reward) return
    const blockRewards = res.reward[res.reward.length - offset]
    const baseFee = HexUInt.of(res.baseFeePerGas[res.baseFeePerGas.length - offset]).bi

    const rewardRegular = HexUInt.of(blockRewards[0]).bi
    const rewardMedium = HexUInt.of(blockRewards[1]).bi
    const rewardHigh = HexUInt.of(blockRewards[2]).bi

    const baseFeeRegular = BigNutils(baseFee.toString()).multiply(1.02).toBigInt
    const baseFeeMedium = BigNutils(baseFee.toString()).multiply(1.03).toBigInt
    const baseFeeHigh = BigNutils(baseFee.toString()).multiply(1.046).toBigInt

    return {
        [GasPriceCoefficient.REGULAR]: {
            estimatedFee: BigNutils((baseFee + rewardRegular).toString()),
            maxFee: BigNutils((baseFeeRegular + rewardRegular).toString()),
            priorityFee: BigNutils(rewardRegular.toString()),
        },
        [GasPriceCoefficient.MEDIUM]: {
            estimatedFee: BigNutils((baseFee + rewardMedium).toString()),
            maxFee: BigNutils((baseFeeMedium + rewardMedium).toString()),
            priorityFee: BigNutils(rewardMedium.toString()),
        },
        [GasPriceCoefficient.HIGH]: {
            estimatedFee: BigNutils((baseFee + rewardHigh).toString()),
            maxFee: BigNutils((baseFeeHigh + rewardHigh).toString()),
            priorityFee: BigNutils(rewardHigh.toString()),
        },
    }
}

const calculateFeeBlockDelta = (res: ReturnType<typeof calculateFeeOfBlock>) => {
    if (!res) return BigNutils("0")
    const fast = res[GasPriceCoefficient.HIGH].maxFee.clone()
    const slow = res[GasPriceCoefficient.REGULAR].maxFee.clone()

    return fast.minus(slow.toString).div(slow.toString)
}

const calculateFeeHistory = (res: FeeHistoryResponse) => {
    //It should never happen
    if (!res.reward) return
    const latestBlockRewards = res.reward[res.reward.length - 1]
    const equalRewardsOnLastBlock = new Set(latestBlockRewards).size === 3
    const latestBaseFee = HexUInt.of(res.baseFeePerGas[res.baseFeePerGas.length - 1]).bi

    const rewardRegular = equalRewardsOnLastBlock
        ? HexUInt.of(latestBlockRewards[0]).bi
        : average(res.reward.map(rewards => rewards[0]))
    const rewardMedium = equalRewardsOnLastBlock
        ? HexUInt.of(latestBlockRewards[1]).bi
        : average(res.reward.map(rewards => rewards[1]))
    const rewardHigh = equalRewardsOnLastBlock
        ? HexUInt.of(latestBlockRewards[2]).bi
        : average(res.reward.map(rewards => rewards[2]))

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

export const useGalacticaFees = ({ isGalactica, blockId, gas }: Props) => {
    const thorClient = useThorClient()

    const {
        isFetching: isLoadingMaxPriorityFeePerGas,
        data: maxPriorityFee,
        dataUpdatedAt,
    } = useQuery({
        queryKey: ["MaxPriorityFeePerGas", blockId],
        queryFn: () => thorClient.gas.getMaxPriorityFeePerGas(),
        enabled: isGalactica,
        placeholderData: keepPreviousData,
    })

    const { isFetching: isLoadingFeeHistory, data: feeHistory } = useQuery({
        queryKey: ["FeeHistory", blockId],
        queryFn: () =>
            thorClient.gas.getFeeHistory({
                blockCount: 5,
                newestBlock: "best",
                rewardPercentiles: [20, 40, 75],
            }),
        enabled: isGalactica,
        placeholderData: keepPreviousData,
    })

    const isLoading = useMemo(
        () => isLoadingMaxPriorityFeePerGas || isLoadingFeeHistory,
        [isLoadingFeeHistory, isLoadingMaxPriorityFeePerGas],
    )

    const options = useMemo(() => {
        if (typeof feeHistory === "undefined" || typeof maxPriorityFee === "undefined") return
        return calculateFeeHistory(feeHistory)
    }, [feeHistory, maxPriorityFee])

    const txOptions = useMemo(() => {
        if (!options) return
        return {
            [GasPriceCoefficient.REGULAR]: {
                maxFeePerGas: options[GasPriceCoefficient.REGULAR].maxFee.toString,
                maxPriorityFeePerGas: options[GasPriceCoefficient.REGULAR].priorityFee.toString,
            },
            [GasPriceCoefficient.MEDIUM]: {
                maxFeePerGas: options[GasPriceCoefficient.MEDIUM].maxFee.toString,
                maxPriorityFeePerGas: options[GasPriceCoefficient.MEDIUM].priorityFee.toString,
            },
            [GasPriceCoefficient.HIGH]: {
                maxFeePerGas: options[GasPriceCoefficient.HIGH].maxFee.toString,
                maxPriorityFeePerGas: options[GasPriceCoefficient.HIGH].priorityFee.toString,
            },
        }
    }, [options])

    const gasOptions = useMemo(() => {
        if (!options) return
        return {
            [GasPriceCoefficient.REGULAR]: {
                estimatedFee: options[GasPriceCoefficient.REGULAR].estimatedFee.multiply(gas?.gas ?? 0),
                maxFee: options[GasPriceCoefficient.REGULAR].maxFee.multiply(gas?.gas ?? 0),
                priorityFee: options[GasPriceCoefficient.REGULAR].priorityFee.multiply(gas?.gas ?? 0),
            },
            [GasPriceCoefficient.MEDIUM]: {
                estimatedFee: options[GasPriceCoefficient.MEDIUM].estimatedFee.multiply(gas?.gas ?? 0),
                maxFee: options[GasPriceCoefficient.MEDIUM].maxFee.multiply(gas?.gas ?? 0),
                priorityFee: options[GasPriceCoefficient.MEDIUM].priorityFee.multiply(gas?.gas ?? 0),
            },
            [GasPriceCoefficient.HIGH]: {
                estimatedFee: options[GasPriceCoefficient.HIGH].estimatedFee.multiply(gas?.gas ?? 0),
                maxFee: options[GasPriceCoefficient.HIGH].maxFee.multiply(gas?.gas ?? 0),
                priorityFee: options[GasPriceCoefficient.HIGH].priorityFee.multiply(gas?.gas ?? 0),
            },
        }
    }, [gas?.gas, options])

    const isBaseFeeRampingUp = useMemo(() => {
        if (typeof feeHistory === "undefined") return false
        const baseFees = feeHistory.baseFeePerGas.map(bFee => HexUInt.of(bFee).bi)
        return BigNutils((baseFees[baseFees.length - 1] - baseFees[0]).toString())
            .div(baseFees[0].toString())
            .isBiggerThan("0.05")
    }, [feeHistory])

    const speedChangeEnabled = useMemo(() => {
        if (typeof feeHistory === "undefined") return false
        const [lastBlockDelta, secondLastBlockDelta, thirdLastBlockDelta] = [
            calculateFeeBlockDelta(calculateFeeOfBlock(feeHistory, 1)),
            calculateFeeBlockDelta(calculateFeeOfBlock(feeHistory, 2)),
            calculateFeeBlockDelta(calculateFeeOfBlock(feeHistory, 3)),
        ]
        if (lastBlockDelta.isBiggerThan("0.05")) return true
        if (secondLastBlockDelta.isLessThan("0.05") && thirdLastBlockDelta.isLessThan("0.05")) return false
        return true
    }, [feeHistory])

    const memoized = useMemo(
        () => ({
            isLoading,
            options: gasOptions,
            txOptions: txOptions,
            maxPriorityFee: maxPriorityFee ? BigNutils(HexUInt.of(maxPriorityFee).bi.toString()) : BigNutils("0"),
            dataUpdatedAt,
            isBaseFeeRampingUp,
            speedChangeEnabled,
        }),
        [dataUpdatedAt, gasOptions, isBaseFeeRampingUp, isLoading, maxPriorityFee, speedChangeEnabled, txOptions],
    )

    return memoized
}
