// import { useCallback, useEffect, useState } from "react"
// import { useNftContract } from "../useNftContract"
// import { useArweave } from "../useArweave"
// import { useIpfs } from "../useIpfs"

// import { error as logError } from "~Common/Logger"
// import { useI18nContext } from "~i18n"
// import { TokenMetadata } from "~Model/Nft/Nft"

// enum URIProtocol {
//     IPFS = "ipfs",
//     ARWEAVE = "ar",
// }

// /**
//  * Gets a token's image from the VeChain NFT API
//  * @param tokenAddress
//  * @param tokenId
//  */
// export const useTokenMetadata = (tokenAddress: string, tokenId: string) => {
//     const [error, setError] = useState<string | undefined>(undefined)
//     const [tokenMetadata, setTokenMetadata] = useState<
//         TokenMetadata | undefined
//     >(undefined)
//     const [tokenUri, setTokenUri] = useState<string | undefined>(undefined)
//     const [imageUrl, setImageUrl] = useState<string | undefined>()

//     const contract = useNftContract(tokenAddress)

//     const arweave = useArweave()
//     const ipfs = useIpfs()

//     const { LL } = useI18nContext()

//     const fetchTokenUri = useCallback(async () => {
//         try {
//             const _tokenUri = await contract.tokenURI(tokenId)
//             setTokenUri(_tokenUri)
//         } catch (e) {
//             logError(e)
//             setError(LL.ERROR_NFT_FAILED_TO_GET_URI_FROM_THOR())
//         }
//     }, [LL, contract, tokenId])

//     const getFromIPFS = useCallback(
//         async (uri: string) => {
//             try {
//                 const metadata = await ipfs.getTokenMetadata(uri)
//                 const _imageUrl = ipfs.getImageUrl(metadata.image)

//                 setTokenMetadata(metadata)
//                 setImageUrl(_imageUrl)
//             } catch (e) {
//                 logError(e)
//                 setError(LL.ERROR_NFT_FAILED_TO_GET_DATA_FROM_IPFS())
//             }
//         },
//         [LL, ipfs],
//     )

//     const getFromArweave = useCallback(
//         async (uri: string) => {
//             try {
//                 const metadata = await arweave.getTokenMetadata(uri)

//                 const _imageUrl = await arweave.getImageUrl(metadata.data.image)

//                 setTokenMetadata(metadata.data)
//                 setImageUrl(_imageUrl)
//             } catch (e) {
//                 logError(e)
//                 setError(LL.ERROR_NFT_FAILED_TO_GET_DATA_FROM_ARWEAVE())
//             }
//         },
//         [LL, arweave],
//     )

//     const fetchMetadata = useCallback(
//         async (uri: string) => {
//             try {
//                 const protocol = uri.split(":")[0]

//                 switch (protocol) {
//                     case URIProtocol.IPFS:
//                         await getFromIPFS(uri)
//                         break
//                     case URIProtocol.ARWEAVE:
//                         await getFromArweave(uri)
//                         break
//                     default:
//                         setError(
//                             LL.ERROR_NFT_TOKEN_URI_PROTOCOL_NOT_SUPPORTED({
//                                 protocol,
//                             }),
//                         )
//                 }
//             } catch (e) {
//                 logError(e)
//                 setError(LL.ERROR_NFT_FAILED_TO_GET_METADATA())
//             }
//         },
//         [LL, getFromArweave, getFromIPFS],
//     )

//     useEffect(() => {
//         fetchTokenUri()
//     }, [fetchTokenUri, tokenAddress, tokenId])

//     useEffect(() => {
//         if (tokenUri) fetchMetadata(tokenUri)
//     }, [fetchMetadata, tokenUri])

//     return { error, tokenMetadata, tokenUri, imageUrl }
// }

export {}
