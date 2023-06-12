// import { useEffect } from "react"
// import { NonFungibleTokenCollection, NonFungibleToken } from "~Model/Nft/Nft"
// import {
//     selectNftCollections,
//     useAppDispatch,
//     useAppSelector,
// } from "../../../Storage/Redux"
// import { NFTPlaceholder } from "~Assets"
// import { isEmpty } from "lodash"
// import { fetchMetadata } from "./fetchMeta"

// export const useNFTs = () => {
//     const disptach = useAppDispatch()
//     const nftCollections = useAppSelector(selectNftCollections)

//     useEffect(() => {
//         const init = async () => {
//             let _collectionFinal: NonFungibleTokenCollection[] = []

//             for (const collection of nftCollections) {
//                 let _nftFinal: NonFungibleToken[] = []

//                 for (const nft of collection.nfts) {
//                     if (nft.tokenURI) {
//                         const nftMeta = await fetchMetadata(nft.tokenURI)
//                         const _nft = {
//                             ...nft,
//                             ...nftMeta?.tokenMetadata,
//                             image: nftMeta?.imageUrl ?? NFTPlaceholder,
//                         }

//                         _nftFinal.push(_nft)

//                         if (isEmpty(collection.icon))
//                             collection.icon =
//                                 nftMeta?.imageUrl ?? NFTPlaceholder
//                     }
//                 }

//                 const col = {
//                     ...collection,
//                     nfts: _nftFinal,
//                 }

//                 _collectionFinal.push(col)
//             }

//             // console.log("_collectionFinal", _collectionFinal)

//             // todo.vas -> this should fail if there is an error any time on the flow if getting nfts
//             // disptach(setNfts(_collectionFinal))
//         }

//         init()
//     }, [disptach, nftCollections])
// }

export {}
