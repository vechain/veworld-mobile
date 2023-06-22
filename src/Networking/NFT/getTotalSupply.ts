import { abis } from "~Constants"

export const getTokenTotalSupply = async (
    address: string,
    thor: Connex.Thor,
) => {
    const res = await thor
        .account(address)
        .method(abis.VIP181.totalSupply)
        .call()
    return res.decoded[0]
}
