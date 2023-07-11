// import React, { useMemo } from "react"
// import { getCurrentAccount } from "popup/caches/AccountCache"
// import { getCurrentNetwork } from "popup/caches/NetworkCache"
// import useWebSocket from "react-use-websocket"
// import { debug, error, info } from "common/logging/Logger"
// import { updateNodeError } from "popup/caches/NodeStatus/NodeStatus"
// import URLUtils from "common/utils/URLUtils/URLUtils"
// import Web3 from "web3"
// import NFTService from "popup/services/NFTService"
// import useThor from "popup/hooks/useThor"
// import { toast } from "react-toastify"
// import { useI18nContext } from "i18n"
// import FormattingUtils from "common/utils/FormattingUtils"
// import { VET } from "common/constants/Token/TokenConstants"
// import { abis } from "common/constants/Thor/ThorConstants"
// import BalanceService from "popup/services/BalanceService"
// import {
//     selectSelectedAccount,
//     selectSelectedNetwork,
//     useAppDispatch,
//     useAppSelector,
// } from "~Storage/Redux"

// const web3 = new Web3()

// const transferSignature =
//     "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

// const BlockListener: React.FC = () => {
//     const dispatch = useAppDispatch()
//     const network = useAppSelector(selectSelectedNetwork)
//     const currentAccount = useAppSelector(selectSelectedAccount)
//     // const thor = useThor()
//     // const { LL } = useI18nContext()

//     const updateBalances = () => {
//         if (currentAccount?.address) {
//             dispatch(
//                 BalanceService.updateAllForAccount(currentAccount?.address),
//             )
//         }
//     }

//     const fungibleAndNFTWsUrl = useMemo(() => {
//         if (!currentAccount) throw Error("No current account")

//         const paddedAddress = web3.utils.padLeft(currentAccount?.address, 64)

//         return URLUtils.toWebsocketURL(
//             network.currentUrl,
//             `/subscriptions/event?t0=${transferSignature}&t2=${paddedAddress}`,
//         )
//     }, [currentAccount, network.currentUrl])

//     // used for NFTs and fungible tokens
//     const onFungibleAndNFTMessage = async (ev: WebSocketMessageEvent) => {
//         const transfer = JSON.parse(ev.data) as TransferEvent

//         //from the padding from transfer.topic[1]
//         const from = web3.eth.abi.decodeParameter("address", transfer.topics[1])
//         const to = web3.eth.abi.decodeParameter("address", transfer.topics[2])

//         if (transfer.topics.length === 4) {
//             // if NFT
//             const tokenId = web3.eth.abi.decodeParameter(
//                 "uint256",
//                 transfer.topics[3],
//             )

//             debug(`NFT Transfer of token ${tokenId} from ${from} to ${to}`)
//             setTimeout(() => {
//                 dispatch(NFTService.updateNFTContractsFromIndexer(thor))
//                 toast.success(LL.NOTIFICATION_FOUND_NFT_TRANSFER())
//             }, 4000)
//         } else if (transfer.topics.length === 3) {
//             // if fungible
//             const amount = web3.eth.abi.decodeParameter(
//                 "uint256",
//                 transfer.data,
//             ) as unknown as string

//             const resSymbols = await thor
//                 .account(transfer.address)
//                 .method(abis.vip180.symbol)
//                 .call()

//             const symbol = resSymbols.decoded[0]

//             const resDecimals = await thor
//                 .account(transfer.address)
//                 .method(abis.vip180.decimals)
//                 .call()

//             const decimals = resDecimals.decoded[0]
//             debug(
//                 `Fungible Transfer of ${amount} ${symbol} from ${from} to ${to} with decimals ${decimals}`,
//             )

//             updateBalances()

//             if (symbol && decimals) {
//                 toast.success(
//                     LL.NOTIFICATION_received_token_transfer({
//                         symbol,
//                         amount: FormattingUtils.scaleNumberDown(
//                             amount,
//                             decimals,
//                         ),
//                     }),
//                 )
//             } else {
//                 toast.success(LL.NOTIFICATION_found_token_transfer())
//             }
//         }
//     }

//     useWebSocket(fungibleAndNFTWsUrl, {
//         onMessage: onFungibleAndNFTMessage,
//         onOpen: ev => {
//             info("Beat WS open on: ", ev.currentTarget)
//             dispatch(updateNodeError(false))
//         },
//         onError: ev => {
//             error(ev)
//         },
//         onClose: ev => info(ev),
//         shouldReconnect: () => true,
//         retryOnError: true,
//         reconnectAttempts: 10_000,
//         reconnectInterval: 1_000,
//     })

//     const vetWsUrl = useMemo(() => {
//         if (!currentAccount) throw Error("No current account")

//         return URLUtils.toWebsocketURL(
//             network.currentUrl,
//             `/subscriptions/transfer?recipient=${currentAccount?.address}`,
//         )
//     }, [currentAccount, network.currentUrl])

//     const onVETMessage = async (ev: WebSocketMessageEvent) => {
//         const transfer = JSON.parse(ev.data) as VetTransferEvent
//         updateBalances()

//         toast.success(
//             LL.NOTIFICATION_received_token_transfer({
//                 amount: FormattingUtils.scaleNumberDown(
//                     transfer.amount,
//                     VET.decimals,
//                 ),
//                 symbol: VET.symbol,
//             }),
//         )
//     }

//     useWebSocket(vetWsUrl, {
//         onMessage: onVETMessage,
//         onOpen: ev => {
//             info("Beat WS open on: ", ev.currentTarget)
//             dispatch(updateNodeError(false))
//         },
//         onError: ev => {
//             error(ev)
//         },
//         onClose: ev => info(ev),
//         shouldReconnect: () => true,
//         retryOnError: true,
//         reconnectAttempts: 10_000,
//         reconnectInterval: 1_000,
//     })

//     return <></>
// }

// interface TransferEvent {
//     address: string
//     topics: string[]
//     data: string
//     meta: {
//         blockID: string
//         blockNumber: number
//         blockTimestamp: number
//         txID: string
//         txOrigin: string
//         clauseIndex: number
//     }
//     obsolete: boolean
// }

// interface VetTransferEvent {
//     amount: string
//     meta: {
//         blockID: string
//         blockNumber: number
//         blockTimestamp: number
//         clauseIndex: number
//         txID: string
//         txOrigin: string
//     }
//     recipient: string
//     sender: string
// }

// export default BlockListener
