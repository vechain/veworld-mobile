import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { FungibleToken, NETWORK_TYPE } from "~Model"

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
