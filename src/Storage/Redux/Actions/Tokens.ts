import { error } from "~Utils"
import { FungibleToken, Network, NETWORK_TYPE } from "~Model"
import { addOfficialTokens, setSuggestedTokens } from "../Slices"
import { AppThunkDispatch } from "../Types"
import { fetchOfficialTokensOwned, getTokensFromGithub } from "~Networking"
import { ERROR_EVENTS, VeDelegate } from "~Constants"

/**
 * Update official tokens from Github
 */
export const updateOfficialTokens = (network: Network) => async (dispatch: AppThunkDispatch) => {
    const tokens = await getTokensFromGithub({
        network,
    })

    // Add VeDelegate to the list of official tokens on mainnet
    // This is because VeDelegate is not really a ERC20 token
    if (network.type === NETWORK_TYPE.MAIN && !tokens.find(token => token.symbol === VeDelegate.symbol)) {
        tokens.push(VeDelegate)
    }

    dispatch(addOfficialTokens({ network: network.type, tokens }))
}

/**
 * Update suggested tokens
 * @param accountAddress
 * @param officialTokens
 * @param network
 */
export const updateSuggestedTokens =
    (accountAddress: string, officialTokens: FungibleToken[], network: Network) =>
    async (dispatch: AppThunkDispatch) => {
        try {
            const tokenAddresses = await fetchOfficialTokensOwned(accountAddress, network)

            const suggestedTokens = tokenAddresses.filter(
                tokenAddress => officialTokens.findIndex(t => t.address === tokenAddress) !== -1,
            )

            if (suggestedTokens.length === 0) return

            dispatch(
                setSuggestedTokens({
                    network: network.type,
                    tokens: suggestedTokens,
                }),
            )
        } catch (e) {
            error(ERROR_EVENTS.TOKENS, e)
        }
    }
