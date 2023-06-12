import { error } from "~Utils"
import { address } from "thor-devkit"
import { Network } from "~Model"
import { abis } from "~Constants"

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
        const contract = thorClient.account(addr)

        const tokenName = await contract.method(abis.VIP180.name).call()
        const tokenSymbol = await contract.method(abis.VIP180.symbol).call()
        const decimals = await contract.method(abis.VIP180.decimals).call()

        return {
            genesisId: network.genesis.id,
            address: addr,
            decimals: decimals.decoded[0],
            name: tokenName.decoded[0],
            symbol: tokenSymbol.decoded[0],
            custom: true,
            icon: "",
        }
    } catch (e) {
        error(e)
    }
}
