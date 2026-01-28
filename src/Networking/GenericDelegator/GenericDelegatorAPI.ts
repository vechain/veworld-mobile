import { TransactionClause } from "@vechain/sdk-core"
import { NETWORK_TYPE } from "~Model"
import { fetchFromEndpoint, requestFromEndpoint } from "~Networking/API"
import { URIUtils } from "~Utils"

export const GENERIC_DELEGATOR_BASE_URL = {
    [NETWORK_TYPE.MAIN]: "http://192.168.86.25:3000",
    [NETWORK_TYPE.TEST]: process.env.REACT_APP_GENERIC_DELEGATOR_TESTNET_URL,
}

export const isValidGenericDelegatorNetwork = (
    value: NETWORK_TYPE,
): value is Extract<NETWORK_TYPE.MAIN, NETWORK_TYPE.TEST> => [NETWORK_TYPE.MAIN, NETWORK_TYPE.TEST].includes(value)

export const isGenericDelegatorUrl = (url: string) =>
    Boolean(Object.values(GENERIC_DELEGATOR_BASE_URL).find(delUrl => URIUtils.compareURLs(delUrl, url)))

const executeIfValidNetwork = <TReturnType>(
    networkType: NETWORK_TYPE,
    path: string,
    cb: (url: string) => TReturnType,
): TReturnType => {
    const url = `${GENERIC_DELEGATOR_BASE_URL[networkType]}${path}`
    console.log("executeIfValidNetwork", url)
    if (isValidGenericDelegatorNetwork(networkType)) return cb(`${GENERIC_DELEGATOR_BASE_URL[networkType]}${path}`)
    throw new Error("[GENERIC DELEGATOR]: Invalid Network")
}

type GetGenericDelegatorCoinsRequest = {
    networkType: NETWORK_TYPE
}

export const getGenericDelegatorCoins = ({ networkType }: GetGenericDelegatorCoinsRequest) =>
    executeIfValidNetwork(networkType, "/api/v1/deposit/tokens", url =>
        fetchFromEndpoint<string[]>(url).then(res => res.map(token => token.toUpperCase())),
    )

type EstimateGenericDelegatorFeesRequest = {
    networkType: NETWORK_TYPE
    clauses: TransactionClause[]
    signer: string
    token?: string
}

export type EstimateGenericDelegatorFeesResponseItem = {
    [token: string]: number
}

export type EstimateGenericDelegatorFeesResponseObject = {
    regular: EstimateGenericDelegatorFeesResponseItem
    medium: EstimateGenericDelegatorFeesResponseItem
    high: EstimateGenericDelegatorFeesResponseItem
    legacy: EstimateGenericDelegatorFeesResponseItem
}

export type EstimateGenericDelegatorFeesResponse = {
    transactionCost: number | EstimateGenericDelegatorFeesResponseObject
}

export const estimateGenericDelegatorFees = ({
    networkType,
    clauses,
    signer,
    token,
}: EstimateGenericDelegatorFeesRequest) => {
    console.log("estimating generic delegator fees", { networkType, clauses, signer, token })
    return executeIfValidNetwork(
        networkType,
        token ? `/api/v1/estimate/clauses/${token}` : "/api/v1/estimate/clauses/,",
        url =>
            requestFromEndpoint<EstimateGenericDelegatorFeesResponse>({
                url: url,
                data: {
                    signer,
                    clauses: clauses.map(({ to, data, value }) => ({ to, data, value })),
                },
                method: "POST",
            }),
    )
}

export const delegateGenericDelegator = ({
    raw,
    origin,
    token,
    networkType,
}: {
    raw: string
    origin: string
    token: string
    networkType: NETWORK_TYPE
}) =>
    executeIfValidNetwork(networkType, `/api/v1/sign/transaction/${token.toLowerCase()}`, url =>
        requestFromEndpoint<{ signature: string; address: string; raw: string; origin: string }>({
            url: url,
            data: {
                raw,
                origin,
            },
            method: "POST",
        }),
    )

export const delegateGenericDelegatorSmartAccount = ({
    raw,
    origin,
    token,
    networkType,
}: {
    raw: string
    origin: string
    token: string
    networkType: NETWORK_TYPE
}) =>
    executeIfValidNetwork(networkType, `/api/v1/sign/transaction/authorized/${token.toLowerCase()}`, url =>
        requestFromEndpoint<{ signature: string; address: string; raw: string; origin: string }>({
            url: url,
            data: {
                raw,
                origin,
            },
            method: "POST",
        }),
    )

export const getDelegatorDepositAddress = ({ networkType }: { networkType: NETWORK_TYPE }) =>
    executeIfValidNetwork(networkType, "/api/v1/deposit/account", url =>
        fetchFromEndpoint<{ depositAccount: string }>(url),
    )
