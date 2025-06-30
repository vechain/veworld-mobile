import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { TransactionClause } from "@vechain/sdk-core"
import { ethers } from "ethers"
import { useMemo } from "react"
import { GasPriceCoefficient } from "~Constants"
import { estimateGenericDelegatorFees, isValidGenericDelegatorNetwork } from "~Networking/GenericDelegator"
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

export const useGenericDelegationFees = ({ clauses, signer, token, isGalactica }: Args) => {
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const { data, isFetching: isLoading } = useQuery({
        queryKey: ["GenericDelegatorEstimate", clauses, signer],
        queryFn: () => estimateGenericDelegatorFees({ clauses, signer, networkType: selectedNetwork.type }),
        enabled: isValidGenericDelegatorNetwork(selectedNetwork.type),
        refetchInterval: 10000,
        placeholderData: keepPreviousData,
    })

    const legacyOptions = useMemo(() => {
        if (typeof data === "undefined") return undefined
        return {
            [GasPriceCoefficient.REGULAR]: {
                estimatedFee: BigNutils(data.transactionCost.legacy[token.toLowerCase()]).multiply(
                    ethers.utils.parseEther("1").toString(),
                ),
                maxFee: BigNutils(data.transactionCost.legacy[token.toLowerCase()]).multiply(
                    ethers.utils.parseEther("1").toString(),
                ),
                priorityFee: BigNutils("0"),
            },
            [GasPriceCoefficient.MEDIUM]: {
                estimatedFee: BigNutils(data.transactionCost.legacy[token.toLowerCase()]).multiply(
                    ethers.utils.parseEther("1").toString(),
                ),
                maxFee: BigNutils(data.transactionCost.legacy[token.toLowerCase()]).multiply(
                    ethers.utils.parseEther("1").toString(),
                ),
                priorityFee: BigNutils("0"),
            },
            [GasPriceCoefficient.HIGH]: {
                estimatedFee: BigNutils(data.transactionCost.legacy[token.toLowerCase()]).multiply(
                    ethers.utils.parseEther("1").toString(),
                ),
                maxFee: BigNutils(data.transactionCost.legacy[token.toLowerCase()]).multiply(
                    ethers.utils.parseEther("1").toString(),
                ),
                priorityFee: BigNutils("0"),
            },
        }
    }, [data, token])

    const galacticaOptions = useMemo(() => {
        if (typeof data === "undefined") return undefined
        //Values returned from the endpoint are in WEI, they're in Ether. So, in order to be compliant with our interface, we should multiply the numbers by 1 ETH (10^18 WEI)
        return {
            [GasPriceCoefficient.REGULAR]: {
                estimatedFee: BigNutils(data.transactionCost.regular[token.toLowerCase()]).multiply(
                    ethers.utils.parseEther("1").toString(),
                ),
                maxFee: BigNutils(data.transactionCost.regular[token.toLowerCase()]).multiply(
                    ethers.utils.parseEther("1").toString(),
                ),
                priorityFee: BigNutils("0"),
            },
            [GasPriceCoefficient.MEDIUM]: {
                estimatedFee: BigNutils(data.transactionCost.medium[token.toLowerCase()]).multiply(
                    ethers.utils.parseEther("1").toString(),
                ),
                maxFee: BigNutils(data.transactionCost.medium[token.toLowerCase()]).multiply(
                    ethers.utils.parseEther("1").toString(),
                ),
                priorityFee: BigNutils("0"),
            },
            [GasPriceCoefficient.HIGH]: {
                estimatedFee: BigNutils(data.transactionCost.high[token.toLowerCase()]).multiply(
                    ethers.utils.parseEther("1").toString(),
                ),
                maxFee: BigNutils(data.transactionCost.high[token.toLowerCase()]).multiply(
                    ethers.utils.parseEther("1").toString(),
                ),
                priorityFee: BigNutils("0"),
            },
        }
    }, [data, token])

    const options = useMemo(
        () => (isGalactica ? galacticaOptions : legacyOptions),
        [galacticaOptions, isGalactica, legacyOptions],
    )

    const memoized = useMemo(() => ({ isLoading, options }), [isLoading, options])

    return memoized
}
