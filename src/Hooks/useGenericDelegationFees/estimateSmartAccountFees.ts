import { TransactionClause } from "@vechain/sdk-core"
import BigNumber from "bignumber.js"
import { VTHO } from "~Constants"
import { EstimateGenericDelegatorFeesResponse } from "~Networking/GenericDelegator"
import { BigNutils } from "~Utils"
import { GenericDelegationDetails } from "../../VechainWalletKit/types/transaction"

const BASE_GAS_PRICE = BigInt("10000000000000") // 10^13 wei
const MOCK_FEE_WEI = BigInt("1000000000000000000") // 1 token as mock fee

// Cache for gas estimations to avoid redundant calls
const gasEstimationCache = new Map<string, number>()

/**
 * Clear the gas estimation cache - useful for testing
 */
export const clearGasEstimationCache = (): void => {
    gasEstimationCache.clear()
}

/**
 * Generate a cache key from clauses and network ID
 */
const getCacheKey = (clauses: TransactionClause[], selectedNetworkId: string): string => {
    return JSON.stringify({ clauses, selectedNetworkId })
}

export type GasPrices = {
    regular?: string
    medium?: string
    high?: string
}

export type TokenRates = {
    vtho: number
    vet: number
    b3tr: number
}

export type EstimateGasFn = (
    clauses: TransactionClause[],
    genericDelegation?: GenericDelegationDetails,
) => Promise<number>

type EstimateSmartAccountFeesArgs = {
    clauses: TransactionClause[]
    estimateGasFn: EstimateGasFn
    ownerAddress: string
    rate: TokenRates
    serviceFee: number
    gasPrices?: GasPrices
    selectedNetworkId: string
}

/**
 * Calculate fee in wei for a given gas amount, price, and token rate
 */
const calculateTokenFeeWei = (gasUsed: bigint, gasPrice: bigint, tokenRate: number, serviceFee: number): bigint => {
    const vthoFeeWei = gasPrice * gasUsed
    const feeWei = new BigNumber(vthoFeeWei.toString()).times(tokenRate).times(1 + serviceFee)
    return BigInt(feeWei.toFixed(0))
}

/**
 * Calculate fees for all tokens at a given gas price
 */
const calculateFeesForGasPrice = (gasUsed: bigint, gasPrice: bigint, rate: TokenRates, serviceFee: number) => {
    const vetFeeWei = calculateTokenFeeWei(gasUsed, gasPrice, rate.vet, serviceFee)
    const b3trFeeWei = calculateTokenFeeWei(gasUsed, gasPrice, rate.b3tr, serviceFee)
    const vthoFeeWei = calculateTokenFeeWei(gasUsed, gasPrice, rate.vtho, serviceFee)

    return {
        vet: new BigNumber(vetFeeWei.toString()).dividedBy(1e18).toNumber(),
        b3tr: new BigNumber(b3trFeeWei.toString()).dividedBy(1e18).toNumber(),
        vtho: new BigNumber(vthoFeeWei.toString()).dividedBy(1e18).toNumber(),
    }
}

/**
 * Estimate fees for smart account transactions using the provider's estimateGas method.
 * 1. Call estimateGas with mock delegation details to get total gas
 * 2. Calculate fees for each tier and token based on gas estimate
 */
export async function estimateSmartAccountFees({
    clauses,
    estimateGasFn,
    ownerAddress,
    rate,
    serviceFee,
    gasPrices,
    selectedNetworkId,
}: EstimateSmartAccountFeesArgs): Promise<EstimateGenericDelegatorFeesResponse> {
    // Get gas prices for each tier, falling back to BASE_GAS_PRICE
    const gasPriceRegular = gasPrices?.regular ? BigInt(gasPrices.regular) : BASE_GAS_PRICE
    const gasPriceMedium = gasPrices?.medium ? BigInt(gasPrices.medium) : BASE_GAS_PRICE
    const gasPriceHigh = gasPrices?.high ? BigInt(gasPrices.high) : BASE_GAS_PRICE

    // Cache to reduce provider calls to privy (estimation requires signing, called every 10s)
    const cacheKey = getCacheKey(clauses, selectedNetworkId)
    let totalGas = gasEstimationCache.get(cacheKey)

    if (totalGas === undefined) {
        // Use provider's estimateGas with mock transfer details to generic delegator
        totalGas = await estimateGasFn(clauses, {
            token: "VTHO", // Use VTHO for estimation (rate=1)
            tokenAddress: VTHO.address,
            depositAccount: ownerAddress, // Doesn't matter for gas estimation
            fee: BigNutils(MOCK_FEE_WEI.toString()),
        })
        gasEstimationCache.set(cacheKey, totalGas)
    }

    const gasUsed = BigInt(totalGas)

    // Calculate fees for each tier
    const regularFees = calculateFeesForGasPrice(gasUsed, gasPriceRegular, rate, serviceFee)
    const mediumFees = calculateFeesForGasPrice(gasUsed, gasPriceMedium, rate, serviceFee)
    const highFees = calculateFeesForGasPrice(gasUsed, gasPriceHigh, rate, serviceFee)
    const legacyFees = calculateFeesForGasPrice(gasUsed, BASE_GAS_PRICE, rate, serviceFee)

    return {
        transactionCost: {
            regular: regularFees,
            medium: mediumFees,
            high: highFees,
            legacy: legacyFees,
        },
    }
}
