import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { TransactionClause } from "@vechain/sdk-core"
import { ThorClient } from "@vechain/sdk-network"
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

const GAS_BUFFER = 0.05 // 5% buffer for gas estimation variance
const BASE_GAS_PRICE = BigInt("10000000000000") // 10^13 wei

type EstimateSmartAccountFeesArgs = {
    clauses: TransactionClause[]
    thor: ThorClient
    ownerAddress: string
    smartAccountConfig: SmartAccountTransactionConfig
    signTypedDataFn: TransactionSigningFunction
    rate: { vtho: number; vet: number; b3tr: number }
    serviceFee: number
}

/**
 * Estimate fees for smart account transactions locally without calling the delegator service.
 * Builds the smart account transaction, estimates gas, and calculates fees for each token.
 */
async function estimateSmartAccountFees({
    clauses,
    thor,
    ownerAddress,
    smartAccountConfig,
    signTypedDataFn,
    rate,
    serviceFee,
}: EstimateSmartAccountFeesArgs): Promise<EstimateGenericDelegatorFeesResponse> {
    // Get genesis block for chain ID
    const genesisBlock = await thor.blocks.getGenesisBlock()
    if (!genesisBlock) {
        throw new Error("Genesis block not found")
    }

    // Build smart account transaction clauses (without fee clause for estimation)
    const preClauses = await buildSmartAccountTransaction({
        txClauses: clauses,
        smartAccountConfig,
        chainId: genesisBlock.id,
        signTypedDataFn,
        ownerAddress,
    })

    // Estimate gas on the built clauses
    const gasResult = await thor.gas.estimateGas(preClauses, ownerAddress, {
        gasPadding: 1,
    })

    const gasUsed = BigInt(gasResult.totalGas)
    const vthoFeeWei = BASE_GAS_PRICE * gasUsed

    // Calculate fee for each token (returns value in ether format, not wei)
    // Using same approach as SmartWalletProvider for consistency
    const calculateTokenFee = (tokenRate: number): number => {
        // fee = vthoFeeWei * rate * (1 + serviceFee) * (1 + gasBuffer) / 1e18
        // The division by 1e18 converts from wei to ether to match service response format
        const feeWei = Number(vthoFeeWei) * tokenRate * (1 + serviceFee) * (1 + GAS_BUFFER)
        const feeEther = feeWei / 1e18
        return feeEther
    }

    const fees = {
        vet: calculateTokenFee(rate.vet),
        b3tr: calculateTokenFee(rate.b3tr),
        vtho: calculateTokenFee(rate.vtho),
    }
    console.log("Smart account fees", { gasUsed: gasUsed.toString(), vthoFeeWei: vthoFeeWei.toString(), rate, serviceFee, fees })

    // Return in same format as service (same fee for all speeds for smart accounts)
    return {
        transactionCost: {
            regular: fees,
            medium: fees,
            high: fees,
            legacy: fees,
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
    //Values returned from the endpoint are in WEI, they're in Ether. So, in order to be compliant with our interface, we should multiply the numbers by 1 ETH (10^18 WEI)
    return {
        [GasPriceCoefficient.REGULAR]: {
            estimatedFee: BigNutils(transactionCost[keys[0]][lowerCaseToken]).multiply(
                ethers.utils.parseEther("1").toString(),
            ),
            // Add 25% to the max fee given wrong estimation from the delegation
            maxFee: BigNutils(transactionCost[keys[0]][lowerCaseToken])
                .multiply(ethers.utils.parseEther("1").toString())
                .multiply(5)
                .idiv(4),
            priorityFee: BigNutils("0"),
        },
        [GasPriceCoefficient.MEDIUM]: {
            estimatedFee: BigNutils(transactionCost[keys[1]][lowerCaseToken]).multiply(
                ethers.utils.parseEther("1").toString(),
            ),
            // Add 25% to the max fee given wrong estimation from the delegation
            maxFee: BigNutils(transactionCost[keys[1]][lowerCaseToken])
                .multiply(ethers.utils.parseEther("1").toString())
                .multiply(5)
                .idiv(4),
            priorityFee: BigNutils("0"),
        },
        [GasPriceCoefficient.HIGH]: {
            estimatedFee: BigNutils(transactionCost[keys[2]][lowerCaseToken]).multiply(
                ethers.utils.parseEther("1").toString(),
            ),
            // Add 25% to the max fee given wrong estimation from the delegation
            maxFee: BigNutils(transactionCost[keys[2]][lowerCaseToken])
                .multiply(ethers.utils.parseEther("1").toString())
                .multiply(5)
                .idiv(4),
            priorityFee: BigNutils("0"),
        },
    }
}

const allowedTokens = [VET.symbol, B3TR.symbol, VTHO.symbol]

export const useGenericDelegationFees = ({ clauses, signer, token, isGalactica, deviceType }: Args) => {
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
        queryKey: ["GenericDelegatorEstimate", clauses, signer, isSmartWallet ? "smart" : "service"],
        queryFn: async () => {
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
