import { abis } from "~Constants"

export const getTokenURI = async (
    tokenId: string,
    contractAddress: string,
    thor: Connex.Thor,
) => {
    const res = await thor
        .account(contractAddress)
        .method(abis.VIP181.tokenURI)
        .call(tokenId)
    return res.decoded[0]
}
