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

//TODO: Check if we need to use BigInts here
const average = (values: string[]) => Math.floor(values.reduce((acc, v) => acc + HexUInt.of(v).n, 0) / values.length)

const calculateFeeHistory = (res: Awaited<ReturnType<typeof ethFeeHistory>>) => {
    //It should never happen
    if (!res.reward) return
    const latestBlockRewards = res.reward[res.reward.length - 1]
    const equalRewardsOnLastBlock = new Set(latestBlockRewards).size === 3
    const latestBaseFee = HexUInt.of(res.baseFeePerGas[res.baseFeePerGas.length - 1]).bi

    const rewardRegular = equalRewardsOnLastBlock
        ? HexUInt.of(latestBlockRewards[0]).bi
        : BigInt(average(res.reward.map(rewards => rewards[0])))
    const rewardMedium = equalRewardsOnLastBlock
        ? HexUInt.of(latestBlockRewards[1]).bi
        : BigInt(average(res.reward.map(rewards => rewards[1])))
    const rewardHigh = equalRewardsOnLastBlock
        ? HexUInt.of(latestBlockRewards[2]).bi
        : BigInt(average(res.reward.map(rewards => rewards[2])))

    const baseFeeRegular = latestBaseFee
    const baseFeeMedium = BigNutils(latestBaseFee.toString()).multiply(1.026).toBigInt
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
        isLoading: isLoadingMaxPriorityFeePerGas,
        data: maxPriorityFee,
        dataUpdatedAt,
    } = useQuery({
        queryKey: ["MaxPriorityFeePerGas", blockId],
        queryFn: () => thorClient.gas.getMaxPriorityFeePerGas(),
        enabled: isGalactica,
        placeholderData: keepPreviousData,
    })

    const { isLoading: isLoadingFeeHistory, data: feeHistory } = useQuery({
        queryKey: ["FeeHistory", blockId],
        queryFn: () =>
            thorClient.gas.getFeeHistory({
                blockCount: 5,
                newestBlock: "next",
                rewardPercentiles: [10, 40, 75],
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

    const memoized = useMemo(
        () => ({
            isLoading,
            options: gasOptions,
            txOptions: txOptions,
            maxPriorityFee: maxPriorityFee ? BigNutils(HexUInt.of(maxPriorityFee).bi.toString()) : BigNutils("0"),
            dataUpdatedAt,
        }),
        [dataUpdatedAt, gasOptions, isLoading, maxPriorityFee, txOptions],
    )

    return memoized
}
