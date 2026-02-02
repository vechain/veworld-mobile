import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { TransactionClause } from "@vechain/sdk-core"
import { ThorClient } from "@vechain/sdk-network"
import BigNumber from "bignumber.js"
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
import { useThorClient } from "../useThorClient"
import {
    SmartAccountTransactionConfig,
    TransactionSigningFunction,
} from "../../VechainWalletKit/types/smartAccountTransaction"
import { buildSmartAccountTransaction } from "../../VechainWalletKit/utils/transactionBuilder"

const BASE_GAS_PRICE = BigInt("10000000000000") // 10^13 wei

type GasPrices = {
    regular?: string
    medium?: string
    high?: string
}

type EstimateSmartAccountFeesArgs = {
    clauses: TransactionClause[]
    thor: ThorClient
    ownerAddress: string
    smartAccountConfig: SmartAccountTransactionConfig
    signTypedDataFn: TransactionSigningFunction
    rate: { vtho: number; vet: number; b3tr: number }
    serviceFee: number
    gasPrices?: GasPrices
}

/**
 * Estimate fees for smart account transactions locally without calling the delegator service.
 * Uses iterative gas estimation like the backend:
 * 1. Build clauses with a mock transfer fee to get the structure
 * 2. Estimate gas on the full clauses (including transfer)
 * 3. Calculate the actual fee based on that gas estimate
 */
async function estimateSmartAccountFees({
    clauses,
    thor,
    ownerAddress,
    smartAccountConfig,
    signTypedDataFn,
    rate,
    serviceFee,
    gasPrices,
}: EstimateSmartAccountFeesArgs): Promise<EstimateGenericDelegatorFeesResponse> {
    // Get genesis block for chain ID
    const genesisBlock = await thor.blocks.getGenesisBlock()
    if (!genesisBlock) {
        throw new Error("Genesis block not found")
    }

    // Get gas prices for each tier, falling back to BASE_GAS_PRICE
    const gasPriceRegular = gasPrices?.regular ? BigInt(gasPrices.regular) : BASE_GAS_PRICE
    const gasPriceMedium = gasPrices?.medium ? BigInt(gasPrices.medium) : BASE_GAS_PRICE
    const gasPriceHigh = gasPrices?.high ? BigInt(gasPrices.high) : BASE_GAS_PRICE

    // Calculate fee for a given gas amount and price (returns value in ether format)
    const calculateTokenFeeWei = (gasUsed: bigint, gasPrice: bigint, tokenRate: number): bigint => {
        const vthoFeeWei = gasPrice * gasUsed
        // fee = vthoFeeWei * rate * (1 + serviceFee)
        const feeWei = new BigNumber(vthoFeeWei.toString())
            .times(tokenRate)
            .times(1 + serviceFee)
        return BigInt(feeWei.toFixed(0))
    }

    // Use VTHO for gas estimation since rate is 1 (simplest calculation)
    // We'll use the HIGH gas price to ensure the mock fee is large enough
    const MOCK_FEE_WEI = BigInt("1000000000000000000") // 1 token as mock fee

    console.log("=== Smart Account Fee Estimation (ITERATIVE) ===")
    console.log("Step 1: Build clauses WITH mock transfer clause for gas estimation")
    console.log("NOTE: Using VTHO for mock transfer (ERC20 transfer call)")
    console.log("INPUT clauses count:", clauses.length)
    console.log("INPUT clauses:", clauses.map((c, i) => ({
        index: i,
        to: c.to,
        value: String(c.value),
        dataLength: typeof c.data === "string" ? c.data.length : "object",
    })))
    console.log("smartAccountConfig.isDeployed:", smartAccountConfig.isDeployed)

    // Build smart account transaction clauses WITH a mock transfer fee
    // This gives us the full clause structure including the transfer
    const fullClauses = await buildSmartAccountTransaction({
        txClauses: clauses,
        smartAccountConfig,
        chainId: genesisBlock.id,
        signTypedDataFn,
        ownerAddress,
        genericDelgationDetails: {
            token: "VTHO", // Use VTHO for estimation (rate=1)
            tokenAddress: VTHO.address,
            depositAccount: ownerAddress, // Doesn't matter for gas estimation
            fee: BigNutils(MOCK_FEE_WEI.toString()),
            rates: { rate, serviceFee },
        },
    })

    console.log("OUTPUT fullClauses count:", fullClauses.length)
    console.log("OUTPUT fullClauses:", fullClauses.map((c, i) => ({
        index: i,
        to: c.to,
        value: String(c.value),
        dataLength: typeof c.data === "string" ? c.data.length : "object",
    })))

    // Estimate gas on the FULL clauses (including transfer clause)
    const gasResult = await thor.gas.estimateGas(fullClauses, ownerAddress, {
        gasPadding: 1,
    })
    const gasUsed = BigInt(gasResult.totalGas)

    console.log("Step 2: Gas estimation on full clauses (WITH transfer):", gasResult.totalGas)
    console.log("INPUTS:")
    console.log("  - gasUsed (WITH transfer clause):", gasResult.totalGas)
    console.log("  - gasPrices:", {
        regular: gasPriceRegular.toString(),
        medium: gasPriceMedium.toString(),
        high: gasPriceHigh.toString(),
    })
    console.log("  - rate:", rate)
    console.log("  - serviceFee:", serviceFee)

    // Calculate fees for each tier and token using the FULL gas estimate
    const calculateFeesForGasPrice = (gasPrice: bigint, tier: string) => {
        const vthoFeeWei = gasPrice * gasUsed
        const vetFeeWei = calculateTokenFeeWei(gasUsed, gasPrice, rate.vet)
        const b3trFeeWei = calculateTokenFeeWei(gasUsed, gasPrice, rate.b3tr)
        const vthoFee = calculateTokenFeeWei(gasUsed, gasPrice, rate.vtho)

        console.log(`TIER [${tier}]: gasPrice(${gasPrice.toString()}) * gasUsed(${gasUsed.toString()}) = ${vthoFeeWei.toString()} vthoFeeWei`)
        console.log(`  VET: ${vetFeeWei.toString()} wei (${new BigNumber(vetFeeWei.toString()).dividedBy(1e18).toString()} ether)`)
        console.log(`  B3TR: ${b3trFeeWei.toString()} wei (${new BigNumber(b3trFeeWei.toString()).dividedBy(1e18).toString()} ether)`)
        console.log(`  VTHO: ${vthoFee.toString()} wei (${new BigNumber(vthoFee.toString()).dividedBy(1e18).toString()} ether)`)

        return {
            vet: new BigNumber(vetFeeWei.toString()).dividedBy(1e18).toNumber(),
            b3tr: new BigNumber(b3trFeeWei.toString()).dividedBy(1e18).toNumber(),
            vtho: new BigNumber(vthoFee.toString()).dividedBy(1e18).toNumber(),
        }
    }

    const regularFees = calculateFeesForGasPrice(gasPriceRegular, "REGULAR")
    const mediumFees = calculateFeesForGasPrice(gasPriceMedium, "MEDIUM")
    const highFees = calculateFeesForGasPrice(gasPriceHigh, "HIGH")
    const legacyFees = calculateFeesForGasPrice(BASE_GAS_PRICE, "LEGACY")

    console.log("Step 3: Final fees (in ether format):")
    console.log("  - regular:", regularFees)
    console.log("  - medium:", mediumFees)
    console.log("  - high:", highFees)
    console.log("  - legacy:", legacyFees)
    console.log("=============================================================")

    // Return different fees for each speed tier
    return {
        transactionCost: {
            regular: regularFees,
            medium: mediumFees,
            high: highFees,
            legacy: legacyFees,
        },
    }
}

type Args = {
    clauses: TransactionClause[]
    signer: string
    /**
     * Selected delegation token. Technically it should only be: VET, VTHO, B3TR
     */
    token: string
    isGalactica: boolean
    deviceType?: DEVICE_TYPE
    /**
     * Gas prices for each speed tier (in wei). Used for smart account fee calculation.
     */
    gasPrices?: GasPrices
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
    token: string,
) => {
    if (!data || keys.length !== 3 || typeof data.transactionCost === "number") return undefined
    const lowerCaseToken = token.toLowerCase()
    const transactionCost = data.transactionCost

    // Log the input values (in ether format from estimateSmartAccountFees)
    console.log("=== buildTransactionCost ===")
    console.log("Token:", token)
    console.log("Keys (tiers):", keys)
    console.log("Input values (ether format from transactionCost):")
    console.log(`  - ${keys[0]} (REGULAR):`, transactionCost[keys[0]][lowerCaseToken])
    console.log(`  - ${keys[1]} (MEDIUM):`, transactionCost[keys[1]][lowerCaseToken])
    console.log(`  - ${keys[2]} (HIGH):`, transactionCost[keys[2]][lowerCaseToken])

    //Values returned from the endpoint are in WEI, they're in Ether. So, in order to be compliant with our interface, we should multiply the numbers by 1 ETH (10^18 WEI)
    const regularEstimatedFee = BigNutils(transactionCost[keys[0]][lowerCaseToken]).multiply(
        ethers.utils.parseEther("1").toString(),
    )
    const regularMaxFee = BigNutils(transactionCost[keys[0]][lowerCaseToken])
        .multiply(ethers.utils.parseEther("1").toString())
        .multiply(5)
        .idiv(4)
    const mediumEstimatedFee = BigNutils(transactionCost[keys[1]][lowerCaseToken]).multiply(
        ethers.utils.parseEther("1").toString(),
    )
    const mediumMaxFee = BigNutils(transactionCost[keys[1]][lowerCaseToken])
        .multiply(ethers.utils.parseEther("1").toString())
        .multiply(5)
        .idiv(4)
    const highEstimatedFee = BigNutils(transactionCost[keys[2]][lowerCaseToken]).multiply(
        ethers.utils.parseEther("1").toString(),
    )
    const highMaxFee = BigNutils(transactionCost[keys[2]][lowerCaseToken])
        .multiply(ethers.utils.parseEther("1").toString())
        .multiply(5)
        .idiv(4)

    console.log("Output values (wei format, multiplied by 1e18):")
    console.log("  - REGULAR: estimatedFee =", regularEstimatedFee.toString, "maxFee =", regularMaxFee.toString, "(+25%)")
    console.log("  - MEDIUM: estimatedFee =", mediumEstimatedFee.toString, "maxFee =", mediumMaxFee.toString, "(+25%)")
    console.log("  - HIGH: estimatedFee =", highEstimatedFee.toString, "maxFee =", highMaxFee.toString, "(+25%)")
    console.log("============================")

    return {
        [GasPriceCoefficient.REGULAR]: {
            estimatedFee: regularEstimatedFee,
            maxFee: regularMaxFee,
            priorityFee: BigNutils("0"),
        },
        [GasPriceCoefficient.MEDIUM]: {
            estimatedFee: mediumEstimatedFee,
            maxFee: mediumMaxFee,
            priorityFee: BigNutils("0"),
        },
        [GasPriceCoefficient.HIGH]: {
            estimatedFee: highEstimatedFee,
            maxFee: highMaxFee,
            priorityFee: BigNutils("0"),
        },
    }
}

const allowedTokens = [VET.symbol, B3TR.symbol, VTHO.symbol]

export const useGenericDelegationFees = ({ clauses, signer, token, isGalactica, deviceType, gasPrices }: Args) => {
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const thor = useThorClient()

    const { rate, serviceFee, isLoading: isLoadingRates } = useGenericDelegatorRates()
    const { ownerAddress, smartAccountConfig, signTypedData } = useSmartWallet()

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
            console.log("isSmartWallet", isSmartWallet)
            console.log("smartAccountConfig", smartAccountConfig)

            if (isSmartWallet && smartAccountConfig && rate && serviceFee !== undefined) {
                console.log("Smart wallet query")
                return estimateSmartAccountFees({
                    clauses,
                    thor,
                    ownerAddress,
                    smartAccountConfig,
                    signTypedDataFn: signTypedData,
                    rate,
                    serviceFee,
                    gasPrices,
                })
            }
            console.log("Service query")
            return estimateGenericDelegatorFees({ clauses, signer, networkType: selectedNetwork.type })
        },
        enabled: canRunSmartWalletQuery || canRunServiceQuery,
        refetchInterval: 10000,
        gcTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
    })

    const allLegacyOptions = useMemo(() => {
        if (data === undefined) return undefined
        return Object.fromEntries(
            allowedTokens.map(tk => [tk, buildTransactionCost(data, ["legacy", "legacy", "legacy"], tk)!]),
        )
    }, [data])

    const allGalacticaOptions = useMemo(() => {
        if (data === undefined) return undefined
        return Object.fromEntries(
            allowedTokens.map(tk => [tk, buildTransactionCost(data, ["regular", "medium", "high"], tk)!]),
        )
    }, [data])

    const legacyOptions = useMemo(() => {
        if (allLegacyOptions === undefined) return undefined
        return allLegacyOptions[token]
    }, [allLegacyOptions, token])

    const galacticaOptions = useMemo(() => {
        if (allGalacticaOptions === undefined) return undefined
        return allGalacticaOptions[token]
    }, [allGalacticaOptions, token])

    const options = useMemo(
        () => (isGalactica ? galacticaOptions : legacyOptions),
        [galacticaOptions, isGalactica, legacyOptions],
    )

    const allOptions = useMemo(
        () => (isGalactica ? allGalacticaOptions : allLegacyOptions),
        [allGalacticaOptions, allLegacyOptions, isGalactica],
    )

    const memoized = useMemo(
        () => ({ isLoading, options, allOptions, isFirstTimeLoading }),
        [allOptions, isFirstTimeLoading, isLoading, options],
    )

    return memoized
}
