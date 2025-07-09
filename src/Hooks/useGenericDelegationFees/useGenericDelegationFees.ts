import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { TransactionClause } from "@vechain/sdk-core"
import { ethers } from "ethers"
import { useMemo } from "react"
import { B3TR, GasPriceCoefficient, VET } from "~Constants"
import {
    estimateGenericDelegatorFees,
    EstimateGenericDelegatorFeesResponse,
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
    keys: (keyof EstimateGenericDelegatorFeesResponse["transactionCost"])[],
    token: string,
) => {
    if (!data || keys.length !== 3) return undefined
    const lowerCaseToken = token.toLowerCase()
    //Values returned from the endpoint are in WEI, they're in Ether. So, in order to be compliant with our interface, we should multiply the numbers by 1 ETH (10^18 WEI)
    return {
        [GasPriceCoefficient.REGULAR]: {
            estimatedFee: BigNutils(data.transactionCost[keys[0]][lowerCaseToken]).multiply(
                ethers.utils.parseEther("1").toString(),
            ),
            maxFee: BigNutils(data.transactionCost[keys[0]][lowerCaseToken]).multiply(
                ethers.utils.parseEther("1").toString(),
            ),
            priorityFee: BigNutils("0"),
        },
        [GasPriceCoefficient.MEDIUM]: {
            estimatedFee: BigNutils(data.transactionCost[keys[1]][lowerCaseToken]).multiply(
                ethers.utils.parseEther("1").toString(),
            ),
            maxFee: BigNutils(data.transactionCost[keys[1]][lowerCaseToken]).multiply(
                ethers.utils.parseEther("1").toString(),
            ),
            priorityFee: BigNutils("0"),
        },
        [GasPriceCoefficient.HIGH]: {
            estimatedFee: BigNutils(data.transactionCost[keys[2]][lowerCaseToken]).multiply(
                ethers.utils.parseEther("1").toString(),
            ),
            maxFee: BigNutils(data.transactionCost[keys[2]][lowerCaseToken]).multiply(
                ethers.utils.parseEther("1").toString(),
            ),
            priorityFee: BigNutils("0"),
        },
    }
}

const allowedTokens = [VET.symbol, B3TR.symbol, "vetWithSmartAccount", "b3trWithSmartAccount"]

export const useGenericDelegationFees = ({ clauses, signer, token, isGalactica }: Args) => {
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const {
        data,
        isFetching: isLoading,
        isLoading: isFirstTimeLoading,
    } = useQuery({
        queryKey: ["GenericDelegatorEstimate", clauses, signer],
        queryFn: () => estimateGenericDelegatorFees({ clauses, signer, networkType: selectedNetwork.type }),
        enabled: isValidGenericDelegatorNetwork(selectedNetwork.type),
        refetchInterval: 10000,
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
