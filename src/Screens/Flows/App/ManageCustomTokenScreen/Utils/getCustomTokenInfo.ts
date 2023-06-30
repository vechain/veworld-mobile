import { error } from "~Utils"
import { address } from "thor-devkit"
import { Network } from "~Model"
import { getTokenDecimals, getTokenName, getTokenSymbol } from "~Networking"

export const getCustomTokenInfo = async ({
    tokenAddress,
    thorClient,
    network,
}: {
    tokenAddress: string
    thorClient: Connex.Thor
    network: Network
}) => {
    // info("Get custom token infos")

    try {
        const addr = address.toChecksumed(tokenAddress)

        const tokenName = await getTokenName(tokenAddress, thorClient)
        const tokenSymbol = await getTokenSymbol(tokenAddress, thorClient)
        const decimals = await getTokenDecimals(tokenAddress, thorClient)

        return {
            genesisId: network.genesis.id,
            address: addr,
            decimals,
            name: tokenName,
            symbol: tokenSymbol,
            custom: true,
            icon: "",
        }
    } catch (e) {
        error(e)
    }
}
