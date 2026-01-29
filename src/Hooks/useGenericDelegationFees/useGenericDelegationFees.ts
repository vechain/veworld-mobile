import { useQuery } from "@tanstack/react-query"
import { TransactionClause } from "@vechain/sdk-core"
import { ethers } from "ethers"
import { useMemo } from "react"
import { B3TR, GasPriceCoefficient, VET } from "~Constants"
import {
    estimateGenericDelegatorFees,
    EstimateGenericDelegatorFeesResponse,
    EstimateGenericDelegatorFeesResponseObject,
    isValidGenericDelegatorNetwork,
} from "~Networking/GenericDelegator"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"

type Args = {
    clauses: TransactionClause[]
    signer: string
    /**
     * Selected delegation token. Technically it should only be: VET, VTHO, B3TR
     */
    token: string
    isGalactica: boolean
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
    if (!data || keys.length !== 3) return undefined
    const lowerCaseToken = token.toLowerCase()

    // Helper to get cost value - handles both number and object response formats
    const getCostValue = (keyIndex: number): number => {
        const { transactionCost } = data
        if (typeof transactionCost === "number") {
            return transactionCost
        }
        return transactionCost[keys[keyIndex]][lowerCaseToken]
    }

    //Values returned from the endpoint are in WEI, they're in Ether. So, in order to be compliant with our interface, we should multiply the numbers by 1 ETH (10^18 WEI)
    return {
        [GasPriceCoefficient.REGULAR]: {
            estimatedFee: BigNutils(getCostValue(0)).multiply(ethers.utils.parseEther("1").toString()),
            // Add 25% to the max fee given wrong estimation from the delegation
            maxFee: BigNutils(getCostValue(0)).multiply(ethers.utils.parseEther("1").toString()).multiply(5).idiv(4),
            priorityFee: BigNutils("0"),
        },
        [GasPriceCoefficient.MEDIUM]: {
            estimatedFee: BigNutils(getCostValue(1)).multiply(ethers.utils.parseEther("1").toString()),
            // Add 25% to the max fee given wrong estimation from the delegation
            maxFee: BigNutils(getCostValue(1)).multiply(ethers.utils.parseEther("1").toString()).multiply(5).idiv(4),
            priorityFee: BigNutils("0"),
        },
        [GasPriceCoefficient.HIGH]: {
            estimatedFee: BigNutils(getCostValue(2)).multiply(ethers.utils.parseEther("1").toString()),
            // Add 25% to the max fee given wrong estimation from the delegation
            maxFee: BigNutils(getCostValue(2)).multiply(ethers.utils.parseEther("1").toString()).multiply(5).idiv(4),
            priorityFee: BigNutils("0"),
        },
    }
}

const ALL_DELEGATION_TOKENS = [VET.symbol, B3TR.symbol]

export const useGenericDelegationFees = ({ clauses, signer, token, isGalactica }: Args) => {
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const {
        data,
        isFetching: isLoading,
        isLoading: isFirstTimeLoading,
    } = useQuery({
        queryKey: ["GenericDelegatorEstimate", clauses, signer, token],
        queryFn: () => estimateGenericDelegatorFees({ clauses, signer, networkType: selectedNetwork.type, token }),
        enabled: isValidGenericDelegatorNetwork(selectedNetwork.type),
        refetchInterval: 10000,
        // put cache back
        gcTime: 0,
    })

    // When transactionCost is a number (smart account), only build options for the requested token
    // When it's an object, we have prices for all tokens
    const allowedTokens = useMemo(() => {
        if (data === undefined) return ALL_DELEGATION_TOKENS
        return typeof data.transactionCost === "number" ? [token] : ALL_DELEGATION_TOKENS
    }, [data, token])

    const allLegacyOptions = useMemo(() => {
        if (data === undefined) return undefined
        return Object.fromEntries(
            allowedTokens.map(tk => [tk, buildTransactionCost(data, ["legacy", "legacy", "legacy"], tk)!]),
        )
    }, [data, allowedTokens])

    const allGalacticaOptions = useMemo(() => {
        if (data === undefined) return undefined
        return Object.fromEntries(
            allowedTokens.map(tk => [tk, buildTransactionCost(data, ["regular", "medium", "high"], tk)!]),
        )
    }, [data, allowedTokens])

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
