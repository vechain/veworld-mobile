import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { TransactionClause } from "@vechain/sdk-core"
import { ethers } from "ethers"
import { useMemo } from "react"
import { B3TR, GasPriceCoefficient, VET } from "~Constants"
import {
    estimateGenericDelegatorFees,
    EstimateGenericDelegatorFeesResponse,
    getDelegatorDepositAddress,
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
    console.log("data", data, keys, token)
    if (!data || keys.length !== 3) return undefined
    let tokenToUse = token
    if (!token.includes("WithSmartAccount")) {
        tokenToUse = token.toLowerCase()
    }

    console.log(
        "data.transactionCost[keys[0]][lowerCaseToken]",
        data.transactionCost[keys[0]][tokenToUse],
        BigNutils(data.transactionCost[keys[0]][tokenToUse]).multiply(ethers.utils.parseEther("1").toString()),
    )
    console.log(
        "data.transactionCost[keys[1]][lowerCaseToken]",
        data.transactionCost[keys[1]][tokenToUse],
        BigNutils(data.transactionCost[keys[1]][tokenToUse]).multiply(ethers.utils.parseEther("1").toString()),
    )
    console.log(
        "data.transactionCost[keys[2]][lowerCaseToken]",
        data.transactionCost[keys[2]][tokenToUse],
        BigNutils(data.transactionCost[keys[2]][tokenToUse]).multiply(ethers.utils.parseEther("1").toString()),
    )
    //Values returned from the endpoint are in WEI, they're in Ether. So, in order to be compliant with our interface, we should multiply the numbers by 1 ETH (10^18 WEI)
    return {
        [GasPriceCoefficient.REGULAR]: {
            estimatedFee: BigNutils(data.transactionCost[keys[0]][tokenToUse]).multiply(
                ethers.utils.parseEther("1").toString(),
            ),
            maxFee: BigNutils(data.transactionCost[keys[0]][tokenToUse]).multiply(
                ethers.utils.parseEther("1").toString(),
            ),
            priorityFee: BigNutils("0"),
        },
        [GasPriceCoefficient.MEDIUM]: {
            estimatedFee: BigNutils(data.transactionCost[keys[1]][tokenToUse]).multiply(
                ethers.utils.parseEther("1").toString(),
            ),
            maxFee: BigNutils(data.transactionCost[keys[1]][tokenToUse]).multiply(
                ethers.utils.parseEther("1").toString(),
            ),
            priorityFee: BigNutils("0"),
        },
        [GasPriceCoefficient.HIGH]: {
            estimatedFee: BigNutils(data.transactionCost[keys[2]][tokenToUse]).multiply(
                ethers.utils.parseEther("1").toString(),
            ),
            maxFee: BigNutils(data.transactionCost[keys[2]][tokenToUse]).multiply(
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
        isFetching: isFeesLoading,
        isLoading: isFeesFirstTimeLoading,
    } = useQuery({
        queryKey: ["GenericDelegatorEstimate", clauses, signer],
        queryFn: () => estimateGenericDelegatorFees({ clauses, signer, networkType: selectedNetwork.type }),
        enabled: isValidGenericDelegatorNetwork(selectedNetwork.type),
        refetchInterval: 10000,
        placeholderData: keepPreviousData,
    })

    const {
        data: delegatorAddressResponse,
        isFetching: isDelegatorLoading,
        isLoading: isDelegatorFirstTimeLoading,
    } = useQuery({
        queryKey: ["GenericDelegatorDepositAddress", selectedNetwork.type],
        queryFn: () => getDelegatorDepositAddress({ networkType: selectedNetwork.type }),
        enabled: isValidGenericDelegatorNetwork(selectedNetwork.type),
        placeholderData: keepPreviousData,
        refetchInterval: 5 * 60 * 1000,
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

    const delegatorAddress = useMemo(() => {
        if (delegatorAddressResponse === undefined) return undefined
        return (delegatorAddressResponse as unknown as { depositAccount: string }).depositAccount
    }, [delegatorAddressResponse])

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

    const isLoading = isFeesLoading || isDelegatorLoading
    const isFirstTimeLoading = isFeesFirstTimeLoading || isDelegatorFirstTimeLoading

    const memoized = useMemo(
        () => ({ isLoading, options, allOptions, isFirstTimeLoading, delegatorAddress }),
        [allOptions, isFirstTimeLoading, isLoading, options, delegatorAddress],
    )

    return memoized
}
