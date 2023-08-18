import axios from "axios"
import { abis } from "~Constants"
import { FungibleToken, NETWORK_TYPE, Network } from "~Model"

/**
 * Asynchronously retrieves the symbol of a given token using its contract address.
 *
 * @param {string} contractAddress The contract address of the token.
 * @param {Connex.Thor} thor The Thor instance used for making the request.
 * @returns {Promise<any>} A promise that resolves with the token's symbol.
 *
 * @example
 * const tokenSymbol = await getTokenSymbol(contractAddress, thor);
 */
export const getTokenSymbol = async (
    contractAddress: string,
    thor: Connex.Thor,
) => {
    try {
        const res = await thor
            .account(contractAddress)
            .method(abis.VIP180.symbol)
            .call()

        return res.decoded[0]
    } catch (e) {
        throw new Error("Failed to call or decode getTokenSymbol: " + e)
    }
}

/**
 * Asynchronously retrieves the number of decimals of a given token using its contract address.
 *
 * @param {string} contractAddress The contract address of the token.
 * @param {Connex.Thor} thor The Thor instance used for making the request.
 * @returns {Promise<number>} A promise that resolves with the number of decimals the token uses.
 *
 * @example
 * const tokenDecimals = await getTokenDecimals(contractAddress, thor);
 */
export const getTokenDecimals = async (
    contractAddress: string,
    thor: Connex.Thor,
) => {
    try {
        const res = await thor
            .account(contractAddress)
            .method(abis.VIP180.decimals)
            .call()

        return res.decoded[0]
    } catch (e) {
        throw new Error("Failed to call or decode getTokenDecimals: " + e)
    }
}

/**
 * Asynchronously retrieves the name of a given token using its contract address.
 *
 * @param {string} contractAddress The contract address of the token.
 * @param {Connex.Thor} thor The Thor instance used for making the request.
 * @returns {Promise<any>} A promise that resolves with the token's name.
 *
 * @example
 * const tokenName = await getTokenName(contractAddress, thor);
 */
export const getTokenName = async (
    contractAddress: string,
    thor: Connex.Thor,
) => {
    try {
        const res = await thor
            .account(contractAddress)
            .method(abis.VIP180.name)
            .call()

        return res.decoded[0]
    } catch (e) {
        throw new Error("Failed to call or decode getTokenName: " + e)
    }
}

const TOKEN_URL = "https://vechain.github.io/token-registry/"

/**
 * Call out to our github repo and return the tokens for the given network
 */
export const getTokensFromGithub = async ({
    network,
}: {
    network: Network
}): Promise<FungibleToken[]> => {
    let tokens: FungibleToken[] = []

    if (
        network.type === NETWORK_TYPE.MAIN ||
        network.type === NETWORK_TYPE.TEST
    ) {
        const rawTokens = await axios.get(
            `${TOKEN_URL}/${
                network.type === NETWORK_TYPE.MAIN ? "main" : "test"
            }.json`,
            {
                transformResponse: data => data,
                timeout: 30 * 1000,
            },
        )

        const tokensFromGithub = JSON.parse(rawTokens.data) as FungibleToken[]
        tokens = tokensFromGithub.map(token => {
            return {
                ...token,
                genesisId: network.genesis.id,
                icon: `${TOKEN_URL}/assets/${token.icon}`,
                custom: false,
            }
        })
    }

    return tokens
}
