import { abis } from "~Constants"

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
    const res = await thor
        .account(contractAddress)
        .method(abis.VIP180.symbol)
        .call()

    return res.decoded[0]
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
    const res = await thor
        .account(contractAddress)
        .method(abis.VIP180.decimals)
        .call()

    return res.decoded[0]
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
    const res = await thor
        .account(contractAddress)
        .method(abis.VIP180.name)
        .call()

    return res.decoded[0]
}
