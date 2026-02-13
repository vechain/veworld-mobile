import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { TransactionClause } from "@vechain/sdk-core"
import { ethers } from "ethers"
import { useMemo } from "react"
import { B3TR, GasPriceCoefficient, VET, VTHO } from "~Constants"
import {
    estimateGenericDelegatorFees,
    EstimateGenericDelegatorFeesResponse,
    isValidGenericDelegatorNetwork,
} from "~Networking/GenericDelegator"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { DEVICE_TYPE } from "../../Model"
import { useGenericDelegatorRates } from "../useGenericDelegatorRates"
import { useSmartWallet } from "../useSmartWallet"
import { estimateSmartAccountFees, GasPrices } from "./estimateSmartAccountFees"

// Add 25% to the max fee given wrong estimation from the delegation
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
 * @param baseValue The base fee value
 * @param skipPadding If true, maxFee equals estimatedFee (no 25% buffer)
 */
const calculateFeeWithMax = (baseValue: number, skipPadding = false) => {
    const weiMultiplier = ethers.utils.parseEther("1").toString()
    const estimatedFee = BigNutils(baseValue).multiply(weiMultiplier)
    const maxFee = skipPadding
        ? estimatedFee
        : estimatedFee.multiply(MAX_FEE_MULTIPLIER_NUMERATOR).idiv(MAX_FEE_MULTIPLIER_DENOMINATOR)
    return { estimatedFee, maxFee, priorityFee: BigNutils("0") }
}

/**
 * Build transaction cost object
 * @param data Data from server API
 * @param isGalactica Whether to use Galactica gas tiers or legacy
 * @param token Token to use
 * @param skipPadding If true, skip the 25% fee padding (used for smart wallet transactions where estimation is accurate)
 * @returns The transaction cost per token per speed
 */
const buildTransactionCost = (
    data: EstimateGenericDelegatorFeesResponse | undefined,
    isGalactica: boolean,
    token: DelegationToken,
    skipPadding = false,
) => {
    if (!data) return undefined

    const keys = isGalactica ? (["regular", "medium", "high"] as const) : (["legacy", "legacy", "legacy"] as const)

    const lowerCaseToken = token.toLowerCase()
    const transactionCost = data.transactionCost

    return {
        [GasPriceCoefficient.REGULAR]: calculateFeeWithMax(transactionCost[keys[0]][lowerCaseToken], skipPadding),
        [GasPriceCoefficient.MEDIUM]: calculateFeeWithMax(transactionCost[keys[1]][lowerCaseToken], skipPadding),
        [GasPriceCoefficient.HIGH]: calculateFeeWithMax(transactionCost[keys[2]][lowerCaseToken], skipPadding),
    }
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

    // Common prerequisites for any delegation query
    const canRunDelegationQuery = isValidGenericDelegatorNetwork(selectedNetwork.type) && clauses.length > 0

    // Smart wallet needs rates loaded and smart account configured
    const hasRatesLoaded = !isLoadingRates && rate !== undefined && serviceFee !== undefined

    const canRunSmartWalletQuery =
        isSmartWallet && canRunDelegationQuery && smartAccountConfig !== null && hasRatesLoaded

    const canRunServiceQuery = !isSmartWallet && canRunDelegationQuery

    // Smart wallet fee estimation query.  The estimate fee on the generic delegator does not work accuratley for smart accounts.
    // To simulate the TX the generic delegator would need the TX signed but it does not have that in the estimate phase.
    // We have the signature locally so we do our own estiamtion using the rates for the relevant payment tokens from the generic delegator
    const {
        data: smartWalletData,
        isFetching: isLoadingSmartWallet,
        isLoading: isFirstTimeLoadingSmartWallet,
    } = useQuery({
        queryKey: ["SmartAccountFeeEstimate", clauses, ownerAddress, gasPrices],
        queryFn: () =>
            estimateSmartAccountFees({
                clauses,
                estimateGasFn: estimateGas,
                ownerAddress,
                rate: rate!,
                serviceFee: serviceFee!,
                gasPrices,
                selectedNetworkId: selectedNetwork.id,
            }),
        enabled: canRunSmartWalletQuery,
        refetchInterval: 10000,
        gcTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
    })

    // Generic delegator fee estimation query (non-smart wallet)
    const {
        data: serviceData,
        isFetching: isLoadingService,
        isLoading: isFirstTimeLoadingService,
    } = useQuery({
        queryKey: ["GenericDelegatorEstimate", clauses, signer],
        queryFn: () => estimateGenericDelegatorFees({ clauses, signer, networkType: selectedNetwork.type }),
        enabled: canRunServiceQuery,
        refetchInterval: 10000,
        gcTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
    })

    // Combine results based on wallet type
    const data = isSmartWallet ? smartWalletData : serviceData
    const isLoading = isSmartWallet ? isLoadingSmartWallet : isLoadingService
    const isFirstTimeLoading = isSmartWallet ? isFirstTimeLoadingSmartWallet : isFirstTimeLoadingService

    const { options, allOptions } = useMemo(() => {
        if (data === undefined) {
            return { options: undefined, allOptions: undefined }
        }

        // Skip fee padding for smart wallet transactions since gas estimation is accurate
        const allOpts = Object.fromEntries(
            ALLOWED_TOKENS.map(tk => [tk, buildTransactionCost(data, isGalactica, tk, isSmartWallet)!]),
        )

        return { options: allOpts[token], allOptions: allOpts }
    }, [data, isGalactica, token, isSmartWallet])

    return useMemo(
        () => ({ isLoading, options, allOptions, isFirstTimeLoading, rate, serviceFee }),
        [allOptions, isFirstTimeLoading, isLoading, options, rate, serviceFee],
    )
}
