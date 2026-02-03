import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { TransactionClause } from "@vechain/sdk-core"
import { ethers } from "ethers"
import { useMemo } from "react"
import { B3TR, GasPriceCoefficient, VET, VTHO } from "~Constants"
import {
    estimateGenericDelegatorFees,
    EstimateGenericDelegatorFeesResponse,
    EstimateGenericDelegatorFeesResponseObject,
    isValidGenericDelegatorNetwork,
} from "~Networking/GenericDelegator"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { DEVICE_TYPE } from "../../Model"
import { useGenericDelegatorRates } from "../useGenericDelegatorRates"
import { useSmartWallet } from "../useSmartWallet"
import { estimateSmartAccountFees, GasPrices } from "./estimateSmartAccountFees"

const MAX_FEE_MULTIPLIER_NUMERATOR = 5
const MAX_FEE_MULTIPLIER_DENOMINATOR = 4 // 5/4 = 1.25x

export type DelegationToken = "VET" | "VTHO" | "B3TR"

type UseGenericDelegationFeesArgs = {
    clauses: TransactionClause[]
    signer: string
    /**
     * Selected delegation token
     */
    token: DelegationToken
    isGalactica: boolean
    deviceType?: DEVICE_TYPE
    /**
     * Gas prices for each speed tier (in wei). Used for smart account fee calculation.
     */
    gasPrices?: GasPrices
}

/**
 * Calculate estimated and max fee from a base value
 */
const calculateFeeWithMax = (baseValue: number) => {
    const weiMultiplier = ethers.utils.parseEther("1").toString()
    const estimatedFee = BigNutils(baseValue).multiply(weiMultiplier)
    const maxFee = estimatedFee.multiply(MAX_FEE_MULTIPLIER_NUMERATOR).idiv(MAX_FEE_MULTIPLIER_DENOMINATOR)
    return { estimatedFee, maxFee, priorityFee: BigNutils("0") }
}

/**
 * Build transaction cost object
 * @param data Data from server API
 * @param keys Keys in order: first element = regular, second = medium, third = high
 * @param token Token to use
 * @returns The transaction cost per token per speed
 */
const buildTransactionCost = (
    data: EstimateGenericDelegatorFeesResponse | undefined,
    keys: (keyof EstimateGenericDelegatorFeesResponseObject)[],
    token: DelegationToken,
) => {
    if (!data || keys.length !== 3) return undefined
    const lowerCaseToken = token.toLowerCase()
    const transactionCost = data.transactionCost

    const tiers = [GasPriceCoefficient.REGULAR, GasPriceCoefficient.MEDIUM, GasPriceCoefficient.HIGH] as const

    return Object.fromEntries(
        tiers.map((tier, i) => [tier, calculateFeeWithMax(transactionCost[keys[i]][lowerCaseToken])]),
    ) as Record<
        GasPriceCoefficient,
        {
            estimatedFee: ReturnType<typeof BigNutils>
            maxFee: ReturnType<typeof BigNutils>
            priorityFee: ReturnType<typeof BigNutils>
        }
    >
}

const ALLOWED_TOKENS: DelegationToken[] = [VET.symbol, B3TR.symbol, VTHO.symbol] as DelegationToken[]

export const useGenericDelegationFees = ({
    clauses,
    signer,
    token,
    isGalactica,
    deviceType,
    gasPrices,
}: UseGenericDelegationFeesArgs) => {
    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const { rate, serviceFee, isLoading: isLoadingRates } = useGenericDelegatorRates()
    const { ownerAddress, smartAccountConfig, estimateGas } = useSmartWallet()

    const isSmartWallet = deviceType === DEVICE_TYPE.SMART_WALLET

    // Determine if we can run the query
    const canRunSmartWalletQuery =
        isSmartWallet &&
        smartAccountConfig !== null &&
        !isLoadingRates &&
        rate !== undefined &&
        serviceFee !== undefined &&
        clauses.length > 0

    const canRunServiceQuery =
        !isSmartWallet && isValidGenericDelegatorNetwork(selectedNetwork.type) && clauses.length > 0

    const {
        data,
        isFetching: isLoading,
        isLoading: isFirstTimeLoading,
    } = useQuery({
        queryKey: ["GenericDelegatorEstimate", clauses, signer, isSmartWallet ? "smart" : "service", gasPrices],
        queryFn: async () => {
            if (isSmartWallet && smartAccountConfig && rate && serviceFee !== undefined) {
                return estimateSmartAccountFees({
                    clauses,
                    estimateGasFn: estimateGas,
                    ownerAddress,
                    rate,
                    serviceFee,
                    gasPrices,
                })
            }
            return estimateGenericDelegatorFees({ clauses, signer, networkType: selectedNetwork.type })
        },
        enabled: canRunSmartWalletQuery || canRunServiceQuery,
        refetchInterval: 10000,
        gcTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
    })

    const { options, allOptions } = useMemo(() => {
        if (data === undefined) {
            return { options: undefined, allOptions: undefined }
        }

        const keys = isGalactica ? (["regular", "medium", "high"] as const) : (["legacy", "legacy", "legacy"] as const)

        const allOpts = Object.fromEntries(ALLOWED_TOKENS.map(tk => [tk, buildTransactionCost(data, [...keys], tk)!]))

        return { options: allOpts[token], allOptions: allOpts }
    }, [data, isGalactica, token])

    return useMemo(
        () => ({ isLoading, options, allOptions, isFirstTimeLoading }),
        [allOptions, isFirstTimeLoading, isLoading, options],
    )
}
