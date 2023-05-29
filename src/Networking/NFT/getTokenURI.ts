import { abis } from "~Common/Constant/Thor/ThorConstants"

export const getTokenURI = async (
    tokenId: number,
    contractAddress: string,
    thor: Connex.Thor,
) => {
    const res = await thor
        .account(contractAddress)
        .method(abis.VIP181.tokenURI)
        .call(tokenId)
    return res.decoded[0]
}
