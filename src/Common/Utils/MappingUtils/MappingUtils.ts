// import {
//     ActivityStatus,
//     FungibleTokenActivity,
//     ActivityType,
//     Network,
//     TransferLogItem,
// } from "~Model"

// /**
//  * Map a transferLog to a FungibleTokenActivity
//  * @param tl the transaction log
//  * @param network the network of the transaction log
//  * @returns the mapped FungibleActivity
//  */
// export function transferLogToFungibleTokenActivity(
//     tl: TransferLogItem,
//     network: Network,
// ): FungibleTokenActivity {
//     return {
//         isTransaction: true,
//         amount: tl.amount,
//         token: tl.token,
//         from: tl.sender,
//         to: [tl.recipient],
//         id: tl.meta.txID,
//         timestamp: tl.timestamp,
//         networkId: network.id,
//         status: ActivityStatus.SUCCESS,
//         type: ActivityType.FUNGIBLE_TOKEN,
//         finality: true,
//         direction: tl.direction,
//     }
// }
