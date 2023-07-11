import { abis } from "~Constants"

export const getName = async (
    contractAddress: string,
    thor: Connex.Thor,
): Promise<string> => {
    const name = await thor
        .account(contractAddress)
        .method(abis.VIP181.name)
        .call()

    return name.decoded[0]
}
