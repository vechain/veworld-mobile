import { error } from "~Utils"
import { FungibleToken, Network } from "~Model"
import { addOfficialTokens, setSuggestedTokens } from "../Slices"
import { AppThunkDispatch } from "../Types"
import { fetchOfficialTokensOwned, getTokensFromGithub } from "~Networking"
import { ERROR_EVENTS } from "~Constants"

/**
 * Update official tokens from Github
 */
export const updateOfficialTokens = (network: Network) => async (dispatch: AppThunkDispatch) => {
    const tokens = await getTokensFromGithub({
        network,
    })

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
