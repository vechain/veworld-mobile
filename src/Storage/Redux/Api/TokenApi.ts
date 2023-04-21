import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import axios from "axios"
import { COINGECKO_TOKEN_ENDPOINT, EXCHANGE_CLIENT_AXIOS_OPTS } from "~Common"
import { FungibleToken, NETWORK_TYPE } from "~Model"
import { TokenInfoResponse } from "../Types"

const TOKEN_URL = "https://vechain.github.io/token-registry/"

export const TokenApi = createApi({
    reducerPath: "tokenApi",
    baseQuery: fetchBaseQuery({ baseUrl: TOKEN_URL }),
    endpoints: builder => ({
        getTokensFromGithub: builder.query<
            FungibleToken[],
            { networkGenesisId: string; networkType: NETWORK_TYPE }
        >({
            query: ({ networkType }) =>
                `${networkType === NETWORK_TYPE.MAIN ? "main" : "test"}.json`,
            transformResponse: (
                rawTokens: FungibleToken[],
                _,
                { networkGenesisId },
            ) => {
                return rawTokens.map(rawToken => ({
                    ...rawToken,
                    genesisId: networkGenesisId,
                    icon: `https://vechain.github.io/token-registry/assets/${rawToken.icon}`,
                    custom: false,
                }))
            },
        }),
    }),
})

export const { useGetTokensFromGithubQuery } = TokenApi

export const getTokenInfo = async (tokenId: string) => {
    const response = await axios.get<TokenInfoResponse>(
        COINGECKO_TOKEN_ENDPOINT(tokenId),
        {
            ...EXCHANGE_CLIENT_AXIOS_OPTS,
            params: {
                days: 1,
            },
        },
    )
    return response.data
}
