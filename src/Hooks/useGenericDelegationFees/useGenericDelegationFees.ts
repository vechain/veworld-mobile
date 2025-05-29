import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { TransactionClause } from "@vechain/sdk-core"
import { useMemo } from "react"
import { B3TR, GasPriceCoefficient, VET, VTHO } from "~Constants"
import { EstimateGasResult } from "~Model"
import { estimateGenericDelegatorFees, isValidGenericDelegatorNetwork } from "~Networking/GenericDelegator"
import { useAppSelector, selectSelectedNetwork } from "~Storage/Redux"
import { BigNutils } from "~Utils"

type Args = {
    clauses: TransactionClause[]
    signer: string
    gas: EstimateGasResult | undefined
    /**
     * Selected delegation token. Technically it should only be: VET, VTHO, B3TR
     */
    token: string
}

const mapTokenToResponseElement = (token: string) => {
    switch (token) {
        case VTHO.symbol:
            return "usingVtho"
        case VET.symbol:
            return "usingVet"
        case B3TR.symbol:
            return "usingB3tr"
        default:
            throw new Error("[GENERIC DELEGATOR]: Invalid token")
    }
}

export const useGenericDelegationFees = ({ clauses, signer, token, gas }: Args) => {
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const { data, isFetching: isLoading } = useQuery({
        queryKey: ["GenericDelegatorEstimate", clauses, signer],
        queryFn: () => estimateGenericDelegatorFees({ clauses, signer, networkType: selectedNetwork.type }),
        enabled: isValidGenericDelegatorNetwork(selectedNetwork.type),
        refetchInterval: 10000,
        placeholderData: keepPreviousData,
    })

    const options = useMemo(() => {
        if (typeof data === "undefined") return
        return {
            [GasPriceCoefficient.REGULAR]: {
                estimatedFee: BigNutils(data.transactionCost.regular[mapTokenToResponseElement(token)]).multiply(
                    gas?.gas ?? 0,
                ),
                maxFee: BigNutils(data.transactionCost.regular[mapTokenToResponseElement(token)]).multiply(
                    gas?.gas ?? 0,
                ),
                priorityFee: BigNutils("0"),
            },
            [GasPriceCoefficient.MEDIUM]: {
                estimatedFee: BigNutils(data.transactionCost.medium[mapTokenToResponseElement(token)]).multiply(
                    gas?.gas ?? 0,
                ),
                maxFee: BigNutils(data.transactionCost.medium[mapTokenToResponseElement(token)]).multiply(
                    gas?.gas ?? 0,
                ),
                priorityFee: BigNutils("0"),
            },
            [GasPriceCoefficient.HIGH]: {
                estimatedFee: BigNutils(data.transactionCost.high[mapTokenToResponseElement(token)]).multiply(
                    gas?.gas ?? 0,
                ),
                maxFee: BigNutils(data.transactionCost.high[mapTokenToResponseElement(token)]).multiply(gas?.gas ?? 0),
                priorityFee: BigNutils("0"),
            },
        }
    }, [data, gas?.gas, token])

    const memoized = useMemo(() => ({ isLoading, options }), [isLoading, options])

    return memoized
}
