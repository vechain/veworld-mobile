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
    const latestBlockRewards = res.reward[res.reward.length - 1]
    const equalRewardsOnLastBlock = new Set(latestBlockRewards).size === 3
    const latestBaseFee = HexUInt.of(res.baseFeePerGas[res.baseFeePerGas.length - 1]).bi

    const rewardRegular = BigNumberUtils.min(
        equalRewardsOnLastBlock
            ? HexUInt.of(latestBlockRewards[0]).bi
            : BigNumberUtils.average(res.reward.map(rewards => rewards[0])).toBigInt,
        HexUInt.of(maxPriorityFee).bi,
    ).toBigInt
    const rewardMedium = BigNumberUtils.min(
        equalRewardsOnLastBlock
            ? HexUInt.of(latestBlockRewards[1]).bi
            : BigNumberUtils.average(res.reward.map(rewards => rewards[1])).toBigInt,
        HexUInt.of(maxPriorityFee).bi,
    ).toBigInt
    const rewardHigh = BigNumberUtils.min(
        equalRewardsOnLastBlock
            ? HexUInt.of(latestBlockRewards[2]).bi
            : BigNumberUtils.average(res.reward.map(rewards => rewards[2])).toBigInt,
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
            blockCount: 5,
            newestBlock: "best",
            rewardPercentiles: [20, 40, 75],
        }),
    ])

    return {
        maxPriorityFee,
        feeHistory,
    }
}

export const useGalacticaFees = ({ isGalactica, blockId, gas }: Props) => {
    const thorClient = useThorClient()

    const {
        isFetching: isLoading,
        data: feesResponse,
        dataUpdatedAt,
    } = useQuery({
        queryKey: ["GalacticaFees", blockId],
        queryFn: () => getFees(thorClient),
        enabled: isGalactica,
        placeholderData: keepPreviousData,
    })

    const options = useMemo(() => {
        if (typeof feesResponse === "undefined") return
        return calculateFeeHistory(feesResponse.feeHistory, feesResponse.maxPriorityFee)
    }, [feesResponse])

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
        if (typeof feesResponse === "undefined") return false
        const baseFees = feesResponse.feeHistory.baseFeePerGas.map(bFee => HexUInt.of(bFee).bi)
        return BigNutils((baseFees[baseFees.length - 1] - baseFees[0]).toString())
            .div(baseFees[0].toString())
            .isBiggerThan("0.05")
    }, [feesResponse])

    /**
     * Enable Speed Change modal only if there's at least 5% increase in the base fee over the last 5 blocks.
     * Disable Speed Change modal only if there's at least a 2% decrease in the base fee over the last 4 blocks.
     */
    const speedChangeEnabled = useMemo(() => {
        if (typeof feesResponse === "undefined") return false
        const baseFees = feesResponse.feeHistory.baseFeePerGas.map(bFee => HexUInt.of(bFee).bi)
        const last4Fees = baseFees.slice(-4)
        if (
            BigNutils((last4Fees[last4Fees.length - 1] - last4Fees[0]).toString())
                .div(last4Fees[0].toString())
                .isLessThan("-0.02")
        )
            return false
        return BigNutils((baseFees[baseFees.length - 1] - baseFees[0]).toString())
            .div(baseFees[0].toString())
            .isBiggerThan("0.05")
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
        }),
        [
            dataUpdatedAt,
            feesResponse?.maxPriorityFee,
            gasOptions,
            isBaseFeeRampingUp,
            isLoading,
            speedChangeEnabled,
            txOptions,
        ],
    )

    return memoized
}
