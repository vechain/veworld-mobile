import { uniq } from "lodash"
import { findFirstInvolvedAccount } from "../Helpers"
import { NFTTransferHandlerProps, TokenTransferHandlerProps } from "./index"
import AddressUtils from "~Utils/AddressUtils"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"
import { NAVIGATION_REF, Routes } from "~Navigation"
import { TranslationFunctions } from "~i18n"

export const handleNFTTransfers = async (
    { visibleAccounts, transfers, selectedAccount, network, updateNFTs }: NFTTransferHandlerProps,
    LL: TranslationFunctions,
) => {
    if (transfers.length === 0) return

    // Update NFTs for accounts that have been changed
    const changedAccounts = uniq([...transfers.map(t => t.to), ...transfers.map(t => t.from)])
    changedAccounts.forEach(accountAddress => updateNFTs({ network, accountAddress }))

    // Send one message. Only one will be displayed on screen so don't send multiple messages
    const transfer = transfers[0]
    const foundAccount = findFirstInvolvedAccount(visibleAccounts, transfer)
    if (!foundAccount) return

    // Send one message. Only one will be displayed on screen so don't send multiple messages for the selected account
    const selectedAccountTransfers = transfers.filter(t => AddressUtils.compareAddresses(t.to, selectedAccount.address))

    if (selectedAccountTransfers.length > 0) {
        Feedback.show({
            message:
                selectedAccountTransfers.length > 1
                    ? LL.FEEDBACK_N_TRANSFERS_RECEIVED({ count: selectedAccountTransfers.length })
                    : LL.FEEDBACK_TRANSFER_RECEIVED(),
            severity: FeedbackSeverity.SUCCESS,
            type: FeedbackType.ALERT,
            icon: "icon-arrow-down",
            onPress: () => {
                NAVIGATION_REF.navigate(Routes.HISTORY_STACK, {
                    screen: Routes.HISTORY,
                    params: {
                        screen: Routes.ACTIVITY_ALL,
                    },
                })
            },
        })
    }
}

export const handleTokenTransfers = (
    { transfers, selectedAccount, updateBalances }: TokenTransferHandlerProps,
    LL: TranslationFunctions,
) => {
    if (transfers.length === 0) return

    // Update Balances for accounts that have been changed
    const changedAccounts = uniq([...transfers.map(t => t.to), ...transfers.map(t => t.from)])

    changedAccounts.forEach(accountAddress => updateBalances({ accountAddress }))

    // Send one message. Only one will be displayed on screen so don't send multiple messages for the selected account
    const selectedAccountTransfers = transfers.filter(t => AddressUtils.compareAddresses(t.to, selectedAccount.address))

    if (selectedAccountTransfers.length > 0) {
        Feedback.show({
            message:
                selectedAccountTransfers.length > 1
                    ? LL.FEEDBACK_N_TRANSFERS_RECEIVED({ count: selectedAccountTransfers.length })
                    : LL.FEEDBACK_TRANSFER_RECEIVED(),
            severity: FeedbackSeverity.SUCCESS,
            type: FeedbackType.ALERT,
            icon: "icon-arrow-down",
            onPress: () => {
                NAVIGATION_REF.navigate(Routes.HISTORY_STACK, {
                    screen: Routes.HISTORY,
                    params: {
                        screen: Routes.ACTIVITY_ALL,
                    },
                })
            },
        })
    }
}

export default { handleNFTTransfers, handleTokenTransfers }
