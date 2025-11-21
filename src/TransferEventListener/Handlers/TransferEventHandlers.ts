import { uniq } from "lodash"
import { findFirstInvolvedAccount } from "../Helpers"
import { NFTTransferHandlerProps, TokenTransferHandlerProps, VETTransferHandlerProps } from "./index"

export const handleNFTTransfers = async ({
    visibleAccounts,
    transfers,
    network,
    updateNFTs,
}: NFTTransferHandlerProps) => {
    if (transfers.length === 0) return

    // Update NFTs for accounts that have been changed
    const changedAccounts = uniq([...transfers.map(t => t.to), ...transfers.map(t => t.from)])
    changedAccounts.forEach(accountAddress => updateNFTs({ network: network.type, accountAddress }))

    // Send one message. Only one will be displayed on screen so don't send multiple messages
    const transfer = transfers[0]
    const foundAccount = findFirstInvolvedAccount(visibleAccounts, transfer)
    if (!foundAccount) return
}

export const handleTokenTransfers = async ({
    visibleAccounts,
    transfers,
    updateBalances,
}: TokenTransferHandlerProps) => {
    if (transfers.length === 0) return

    // Update Balances for accounts that have been changed
    const changedAccounts = uniq([...transfers.map(t => t.to), ...transfers.map(t => t.from)])

    changedAccounts.forEach(accountAddress => updateBalances({ accountAddress }))

    // Send one message. Only one will be displayed on screen so don't send multiple messages
    const transfer = transfers[0]
    const foundAccount = findFirstInvolvedAccount(visibleAccounts, transfer)
    if (!foundAccount) return
}

export const handleVETTransfers = ({ transfers, visibleAccounts, updateBalances }: VETTransferHandlerProps) => {
    if (transfers.length === 0) return

    // Update Balances for accounts that have been changed
    const changedAccounts = uniq([...transfers.map(t => t.to), ...transfers.map(t => t.from)])

    changedAccounts.forEach(accountAddress => updateBalances({ accountAddress }))

    // Send one message. Only one will be displayed on screen so don't send multiple messages
    const transfer = transfers[0]
    const foundAccount = findFirstInvolvedAccount(visibleAccounts, transfer)
    if (!foundAccount) return
}

export default { handleNFTTransfers, handleTokenTransfers, handleVETTransfers }
