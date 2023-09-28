import { TransactionOrigin } from "~Model"
import {
    NFTTransferHandlerProps,
    TokenTransferHandlerProps,
    VETTransferHandlerProps,
} from "./index"
import { getName } from "~Networking"
import {
    InformUserForIncomingToken,
    InformUserForIncomingVET,
    InformUserForOutgoingToken,
    InformUserForOutgoingVET,
    findFirstInvolvedAccount,
    informUserForIncomingNFT,
    informUserForOutgoingNFT,
} from "../Helpers"
import { uniq } from "lodash"

export const handleNFTTransfers = async ({
    visibleAccounts,
    transfers,
    network,
    thorClient,
    updateNFTs,
    informUser,
}: NFTTransferHandlerProps) => {
    if (transfers.length === 0) return

    // Update NFTs for accounts that have been changed
    const changedAccounts = uniq([
        ...transfers.map(t => t.to),
        ...transfers.map(t => t.from),
    ])
    changedAccounts.forEach(accountAddress =>
        updateNFTs({ network: network.type, accountAddress }),
    )

    // Send one message. Only one will be displayed on screen so don't send multiple messages
    const transfer = transfers[0]
    const foundAccount = findFirstInvolvedAccount(visibleAccounts, transfer)
    if (!foundAccount) return

    const collectionName = await getName(transfer.tokenAddress, thorClient)

    if (foundAccount.origin === TransactionOrigin.TO) {
        // inform user for successful transfer
        informUserForIncomingNFT({
            collectionName,
            from: transfer.from,
            alias: foundAccount.account.alias, // this should be read by typescript as it is already checked on line 21
            transfer,
            informUser,
        })
    } else if (foundAccount.origin === TransactionOrigin.FROM) {
        // inform user for successful transfer
        informUserForOutgoingNFT({
            txId: transfer.txId,
            to: transfer.to,
            from: transfer.from,
            collectionName,
            informUser,
        })
    }
}

export const handleTokenTransfers = async ({
    visibleAccounts,
    transfers,
    fetchData,
    updateBalances,
    informUser,
}: TokenTransferHandlerProps) => {
    if (transfers.length === 0) return

    // Update Balances for accounts that have been changed
    const changedAccounts = uniq([
        ...transfers.map(t => t.to),
        ...transfers.map(t => t.from),
    ])

    changedAccounts.forEach(accountAddress =>
        updateBalances({ accountAddress }),
    )

    // Send one message. Only one will be displayed on screen so don't send multiple messages
    const transfer = transfers[0]
    const foundAccount = findFirstInvolvedAccount(visibleAccounts, transfer)
    if (!foundAccount) return

    const { symbol, decimals } = await fetchData(transfer.tokenAddress)

    // User received token
    if (foundAccount.origin === TransactionOrigin.TO) {
        // inform user for successful transfer
        InformUserForIncomingToken({
            amount: transfer.value || "0",
            symbol,
            decimals,
            alias: foundAccount.account.alias,
            transfer,
            informUser,
        })
    }
    // User send token
    else if (foundAccount.origin === TransactionOrigin.FROM) {
        // inform user of successful transfer
        InformUserForOutgoingToken({
            txId: transfer.txId,
            amount: transfer.value ?? "0",
            decimals,
            transfer,
            informUser,
        })
    }
}

export const handleVETTransfers = ({
    transfers,
    visibleAccounts,
    updateBalances,
    informUser,
}: VETTransferHandlerProps) => {
    if (transfers.length === 0) return

    // Update Balances for accounts that have been changed
    const changedAccounts = uniq([
        ...transfers.map(t => t.to),
        ...transfers.map(t => t.from),
    ])

    changedAccounts.forEach(accountAddress =>
        updateBalances({ accountAddress }),
    )

    // Send one message. Only one will be displayed on screen so don't send multiple messages
    const transfer = transfers[0]
    const foundAccount = findFirstInvolvedAccount(visibleAccounts, transfer)
    if (!foundAccount) return

    // User received token
    if (foundAccount.origin === TransactionOrigin.TO) {
        // inform user for successful transfer
        InformUserForIncomingVET({
            alias: foundAccount.account.alias,
            amount: transfer.value,
            to: transfer.to,
            informUser,
        })
    }

    // User send token
    else if (foundAccount.origin === TransactionOrigin.FROM) {
        // inform usr for successful transfer
        InformUserForOutgoingVET({
            txId: transfer.txId,
            amount: transfer.value,
            to: transfer.to,
            from: transfer.from,
            informUser,
        })
    }
}

export default { handleNFTTransfers, handleTokenTransfers, handleVETTransfers }
