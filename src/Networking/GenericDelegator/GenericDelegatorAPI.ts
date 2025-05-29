import { TransactionClause } from "@vechain/sdk-core"
import { NETWORK_TYPE } from "~Model"
import { fetchFromEndpoint, requestFromEndpoint } from "~Networking/API"

const baseUrl = {
    [NETWORK_TYPE.MAIN]: process.env.REACT_APP_GENERIC_DELEGATOR_MAINNET_URL,
    [NETWORK_TYPE.TEST]: process.env.REACT_APP_GENERIC_DELEGATOR_TESTNET_URL,
}

export const isValidGenericDelegatorNetwork = (
    value: NETWORK_TYPE,
): value is Extract<NETWORK_TYPE.MAIN, NETWORK_TYPE.TEST> => [NETWORK_TYPE.MAIN, NETWORK_TYPE.TEST].includes(value)

const executeIfValidNetwork = <TReturnType>(
    networkType: NETWORK_TYPE,
    path: string,
    cb: (url: string) => TReturnType,
): TReturnType => {
    if (isValidGenericDelegatorNetwork(networkType)) return cb(`${baseUrl[networkType]}${path}`)
    throw new Error("[GENERIC DELEGATOR]: Invalid Network")
}

type GetGenericDelegatorCoinsRequest = {
    networkType: NETWORK_TYPE
}

export const getGenericDelegatorCoins = ({ networkType }: GetGenericDelegatorCoinsRequest) =>
    executeIfValidNetwork(networkType, "/delegator/coins", url => fetchFromEndpoint<string[]>(url))

type EstimateGenericDelegatorFeesRequest = {
    networkType: NETWORK_TYPE
    clauses: TransactionClause[]
    signer: string
}

export type EstimateGenericDelegatorFeesResponseItem = {
    usingVtho: number
    usingVet: number
    usingB3tr: number
    usingSmartAccount: number
}

export type EstimateGenericDelegatorFeesResponse = {
    transactionCost: {
        regular: EstimateGenericDelegatorFeesResponseItem
        medium: EstimateGenericDelegatorFeesResponseItem
        high: EstimateGenericDelegatorFeesResponseItem
    }
}

export const estimateGenericDelegatorFees = ({ networkType, clauses, signer }: EstimateGenericDelegatorFeesRequest) =>
    executeIfValidNetwork(networkType, "/delegator/estimate", url =>
        requestFromEndpoint<EstimateGenericDelegatorFeesResponse>({
            url: url,
            data: {
                signer,
                clauses: clauses.map(({ to, data, value }) => ({ to, data, value })),
            },
        }),
    )
