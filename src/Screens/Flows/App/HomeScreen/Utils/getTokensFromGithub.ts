// TODO: when redux will be ready move it there to initialize the store

import axios from "axios"
import { FungibleToken, Network, NETWORK_TYPE } from "~Model"

/**
 * Call out to our github repo and return the tokens for the given network
 * @param network
 * @returns
 */
export const getTokensFromGithub = async (
    network: Network,
): Promise<FungibleToken[]> => {
    if (
        network.type === NETWORK_TYPE.MAIN ||
        network.type === NETWORK_TYPE.TEST
    ) {
        const { data } = await axios.get(
            `https://vechain.github.io/token-registry/${
                network.type === NETWORK_TYPE.MAIN ? "main" : "test"
            }.json`,
            {
                transformResponse: res => res,
                timeout: 30 * 1000,
            },
        )

        const tokensFromGithub = JSON.parse(data) as FungibleToken[]
        return tokensFromGithub.map(token => {
            return {
                ...token,
                genesisId: network.genesis.id,
                icon: `https://vechain.github.io/token-registry/assets/${token.icon}`,
                custom: false,
            }
        })
    }

    return []
}
