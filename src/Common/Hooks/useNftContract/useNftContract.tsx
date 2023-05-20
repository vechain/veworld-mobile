import axios from "axios"
import { useCallback } from "react"
import {
    NFTS_OWNED_PER_CONTRACT,
    NFT_CONTRACTS_FOR_ADDRESS,
} from "~Common/Constant"
import { abis } from "~Common/Constant/Thor/ThorConstants"
import { error, info } from "~Common/Logger"
import { useThor } from "~Components"
// import { NonFungibleToken, TokenMetadata } from "~Model/Nft/Nft"

const allSettled = require("promise.allsettled")

export const useNftContract = () => {
    const thor = useThor()

    const getName = useCallback(
        async (contractAddress: string): Promise<string | undefined> => {
            try {
                const name = await thor
                    .account(contractAddress)
                    .method(abis.vip181.name)
                    .call()
                return name.decoded[0]
            } catch (e) {
                error(e)
            }
        },
        [thor],
    )

    const getSymbol = useCallback(
        async (contractAddress: string): Promise<string | undefined> => {
            try {
                const symbol = await thor
                    .account(contractAddress)
                    .method(abis.vip181.symbol)
                    .call()
                return symbol.decoded[0]
            } catch (e) {
                error(e)
            }
        },
        [thor],
    )

    const getOwnerOf = useCallback(
        async (
            tokenId: number,
            contractAddress: string,
        ): Promise<string | undefined> => {
            const res = await thor
                .account(contractAddress)
                .method(abis.vip181.ownerOf)
                .call(tokenId)
            return res.decoded[0]
        },
        [thor],
    )

    const getBalanceOf = useCallback(
        async (ownerAddress: string, contractAddress: string) => {
            const res = await thor
                .account(contractAddress)
                .method(abis.vip181.balanceOf)
                .call(ownerAddress)
            return res.decoded[0]
        },
        [thor],
    )

    const getTokenURI = useCallback(
        async (tokenId: number, contractAddress: string) => {
            const res = await thor
                .account(contractAddress)
                .method(abis.vip181.tokenURI)
                .call(tokenId)
            return res.decoded[0]
        },
        [thor],
    )

    const getNFTsFor = useCallback(
        async (ownerAddress: string) => {
            try {
                const contractAddresses = await getContractAddresses(
                    ownerAddress,
                )

                const nftPromises: Promise<NftForContractResponse[]>[] = []
                for (const contractAddress of contractAddresses) {
                    const nfts = getNftsForContract(
                        contractAddress,
                        ownerAddress,
                    )
                    nftPromises.push(nfts)
                }

                const nftResults = await allSettled(nftPromises)

                const nftData: NftForContractResponse[][] = nftResults.map(
                    (result: PromiseSettledResult<NftForContractResponse>) => {
                        if (result.status === "fulfilled") {
                            return result.value
                        }
                    },
                )

                for (const collection of nftData) {
                    for (const item of collection) {
                        const collectionSymbol = await getSymbol(
                            item.contractAddress,
                        )

                        const collectionName = await getName(
                            item.contractAddress,
                        )

                        const ownerOf = await await getOwnerOf(
                            item.tokenId,
                            item.contractAddress,
                        )

                        const balanceOf = await getBalanceOf(
                            ownerOf ?? ownerAddress,
                            item.contractAddress,
                        )

                        const tokenURI = await getTokenURI(
                            item.tokenId,
                            item.contractAddress,
                        )

                        info("collectionName", collectionName)
                        info("collectionSymbol", collectionSymbol)
                        info("ownerOf", ownerOf)
                        info("balanceOf", balanceOf)

                        // todo.vas -> VeAce return a JSON with description "meta" and token uri
                        info("tokenURI", tokenURI)
                    }
                }
            } catch (e) {
                error(e)
                throw e
            }
        },
        [getBalanceOf, getName, getOwnerOf, getSymbol, getTokenURI],
    )

    return {
        getNFTsFor,
    }
}

export const getContractAddresses = async (ownerAddress: string) => {
    const response = await axios.get<string[]>(
        NFT_CONTRACTS_FOR_ADDRESS(ownerAddress),
    )
    return response.data
}

type NftForContractResponse = {
    id: "string"
    tokenId: 0
    contractAddress: "string"
    owner: "string"
    txId: "string"
    blockNumber: 0
    blockId: "string"
}

export const getNftsForContract = async (
    contractAddress: string,
    ownerAddress: string,
): Promise<NftForContractResponse[]> => {
    const response = await axios.get(
        NFTS_OWNED_PER_CONTRACT(ownerAddress, contractAddress),
    )
    return response.data
}
