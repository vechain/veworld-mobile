import { warn } from "~Utils"
import { Network } from "~Model"
import { getTokenDecimals, getTokenName, getTokenSymbol } from "~Networking"
import { ERROR_EVENTS } from "~Constants"

export const getCustomTokenInfo = async ({
    tokenAddress,
    thorClient,
    network,
}: {
    tokenAddress: string
    thorClient: Connex.Thor
    network: Network
}) => {
    try {
        const tokenName = await getTokenName(tokenAddress, thorClient)
        const tokenSymbol = await getTokenSymbol(tokenAddress, thorClient)
        const decimals = await getTokenDecimals(tokenAddress, thorClient)

        return {
            genesisId: network.genesis.id,
            address: tokenAddress,
            decimals,
            name: tokenName,
            symbol: tokenSymbol,
            custom: true,
            icon: "",
        }
    } catch (e) {
        warn(ERROR_EVENTS.TOKENS, e)
    }
}
