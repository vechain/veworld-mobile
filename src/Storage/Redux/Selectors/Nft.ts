import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { NonFungibleToken } from "~Model"

const selectNftState = (state: RootState) => state.nft

export const selectNftCollections = createSelector(selectNftState, nfts => {
    return [...nfts]
})

export const selectCollectionWithContractAddres = createSelector(
    [
        selectNftCollections,
        (state: RootState, contractAddress: string) => contractAddress,
    ],
    (collections, contractAddress) => {
        return collections.find(
            collection => collection.address === contractAddress,
        )
    },
)

export const selectNFTWithAddressAndTokenId = createSelector(
    [
        selectNftCollections,
        (state: RootState, contractAddress: string) => contractAddress,
        (state: RootState, contractAddress: string, tokenId: string) => tokenId,
    ],
    (collections, contractAddress, tokenId) => {
        const foundColelction = collections.find(
            collection => collection.address === contractAddress,
        )

        let nft: NonFungibleToken | undefined
        if (foundColelction) {
            nft = foundColelction.nfts.find(_nft => _nft.tokenId === tokenId)
        }

        return nft
    },
)

/*


    export const getSuggestedMovie = createSelector(
    [
        (state: RootState) => state.moviesSlice.movies,
        (_, movieTitle) => movieTitle,
    ],
    (movies, movieTitle) => {
        let movie: IMovie | undefined
        if (movieTitle.length) {
            movie = movies.find((mv: IMovie) => mv.title.includes(movieTitle))
        }
        return movie
    },
)





  return collections.map(collection => {
            return collection.nfts.map(nft => {
                if (!nft.isHidden) {
                    return nft
                }
            })
        })

*/
