import { Linking } from "react-native"
import { showErrorToast, showSuccessToast } from "~Components"
import { defaultMainNetwork, VET } from "~Constants"
import { Network } from "~Model"
import { BigNutils, AddressUtils } from "~Utils"
import * as i18n from "~i18n"
import { isEmpty } from "lodash"
import { IncomingTransferResponse } from "~Networking"

// ~ NFT - INCOMING
type InformUserForIncomingNFTProps = {
    collectionName: string
    alias: string
    from: string
    transfer: IncomingTransferResponse
    informUser: (params: { accountAddress: string; txId?: string }) => void
}

export const informUserForIncomingNFT = ({
    collectionName,
    alias,
    from,
    transfer,
    informUser,
}: InformUserForIncomingNFTProps) => {
    const locale = i18n.detectLocale()

    const formattedFrom = AddressUtils.humanAddress(from, 4, 5)

    showSuccessToast({
        text1: i18n.i18n()[locale].NOTIFICATION_INCOMING_NFT_TITLE(),
        text2: i18n.i18n()[locale].NOTIFICATION_INCOMING_NFT_BODY({
            alias,
            collectionName: isEmpty(collectionName) ? "" : collectionName + "!",
            from: formattedFrom,
        }),
        textLink: i18n.i18n()[locale].NOTIFICATION_SEE_TRANSACTION_DETAILS_ACTION(),
        onPress: () => informUser({ accountAddress: transfer.to }),
        visibilityTime: 10000,
        testID: "informUserForIncomingNFTSuccessToast",
    })
}

// ~ NFT - OUTGOING
type InformUserForOutgoingNFTProps = {
    txId: string
    to: string
    from: string
    collectionName: string
    informUser: (params: { accountAddress: string; txId?: string }) => void
}

export const informUserForOutgoingNFT = ({
    txId,
    to,
    from,
    collectionName,
    informUser,
}: InformUserForOutgoingNFTProps) => {
    const locale = i18n.detectLocale()

    const formattedTo = AddressUtils.humanAddress(to, 4, 5)

    showSuccessToast({
        addresses: {
            sender: from,
            recipient: to,
        },
        text1: i18n.i18n()[locale].NOTIFICATION_OUTGOING_NFT_TITLE(),
        text2: i18n.i18n()[locale].NOTIFICATION_OUTGOING_NFT_BODY({
            collectionName,
            to: formattedTo,
        }),
        textLink: i18n.i18n()[locale].NOTIFICATION_SEE_TRANSACTION_DETAILS_ACTION(),
        onPress: () => informUser({ txId, accountAddress: from }),
        visibilityTime: 10000,
        testID: "informUserForOutgoingNFTSuccessToast",
    })
}

// ~TOKEN - INCOMING
type InformUserForIncomingTokenProps = {
    amount: string
    symbol: string
    decimals: number
    transfer: IncomingTransferResponse
    informUser: (params: { accountAddress: string; txId?: string }) => void
}

export const InformUserForIncomingToken = ({
    amount,
    symbol,
    decimals,
    transfer,
    informUser,
}: InformUserForIncomingTokenProps) => {
    const locale = i18n.detectLocale()

    const formattedAmmount = BigNutils(amount).toHuman(decimals).toTokenFormat_string(2)

    showSuccessToast({
        addresses: {
            sender: transfer.from,
            recipient: transfer.to,
        },
        text1: i18n.i18n()[locale].NOTIFICATION_received_token_transfer({
            token: symbol,
            amount: formattedAmmount,
        }),
        textLink: i18n.i18n()[locale].NOTIFICATION_SEE_TRANSACTION_DETAILS_ACTION(),
        onPress: () => informUser({ accountAddress: transfer.to, txId: transfer.txId }),
        visibilityTime: 7000,
        testID: "informUserForIncomingTokenSuccessToast",
    })
}

// ~TOKEN - OUTGOING
type InformUserForOutgoingTokenProps = {
    txId: string
    amount: string
    decimals: number
    transfer: IncomingTransferResponse
    informUser: (params: { accountAddress: string; txId?: string }) => void
    symbol: string
}

export const InformUserForOutgoingToken = ({
    txId,
    amount,
    decimals,
    transfer,
    informUser,
    symbol,
}: InformUserForOutgoingTokenProps) => {
    const locale = i18n.detectLocale()

    const formattedAmmount = BigNutils(amount).toHuman(decimals).toTokenFormat_string(2)

    showSuccessToast({
        addresses: {
            sender: transfer.from,
            recipient: transfer.to,
        },
        text1: i18n.i18n()[locale].NOTIFICATION_sent_token_transfer({
            token: symbol,
            amount: formattedAmmount,
        }),
        textLink: i18n.i18n()[locale].NOTIFICATION_SEE_TRANSACTION_DETAILS_ACTION(),
        onPress: () => informUser({ accountAddress: transfer.from, txId }),
        visibilityTime: 7000,
        testID: "informUserForOutgoingTokenSuccessToast",
    })
}

// ~VET - INCOMING
type InformUserForIncomingVETProps = {
    amount: string
    from: string
    to: string
    txId: string
    informUser: (params: { accountAddress: string; txId?: string }) => void
}

export const InformUserForIncomingVET = ({ amount, from, to, txId, informUser }: InformUserForIncomingVETProps) => {
    const locale = i18n.detectLocale()

    const formattedAmount = BigNutils(amount).toHuman(VET.decimals).toTokenFormat_string(2)

    showSuccessToast({
        addresses: {
            sender: from,
            recipient: to,
        },
        text1: i18n.i18n()[locale].NOTIFICATION_received_token_transfer({
            token: VET.symbol,
            amount: formattedAmount,
        }),
        textLink: i18n.i18n()[locale].NOTIFICATION_SEE_TRANSACTION_DETAILS_ACTION(),
        onPress: () => informUser({ accountAddress: to, txId }),
        visibilityTime: 7000,
        testID: "informUserForIncomingVETSuccessToast",
    })
}

// ~VET - OUTGOING
type InformUserForOutgoingTokenVET = {
    txId: string
    amount: string
    to: string
    from: string
    informUser: (params: { accountAddress: string; txId?: string }) => void
}

export const InformUserForOutgoingVET = ({ txId, amount, to, from, informUser }: InformUserForOutgoingTokenVET) => {
    const locale = i18n.detectLocale()

    const formattedAmount = BigNutils(amount).toHuman(VET.decimals).toTokenFormat_string(2)

    showSuccessToast({
        addresses: {
            sender: from,
            recipient: to,
        },
        text1: i18n.i18n()[locale].NOTIFICATION_sent_token_transfer({
            token: VET.symbol,
            amount: formattedAmount,
        }),
        textLink: i18n.i18n()[locale].NOTIFICATION_SEE_TRANSACTION_DETAILS_ACTION(),
        onPress: () => informUser({ accountAddress: from, txId }),
        visibilityTime: 7000,
        testID: "InformUserForOutgoingVETSuccessToast",
    })
}

// ~ REVERTED TRANSACTION
export const informUserforRevertedTransaction = ({ txId, network }: { txId: string; network: Network }) => {
    const locale = i18n.detectLocale()
    const formattedTxId = AddressUtils.humanAddress(txId, 4, 5)

    showErrorToast({
        text1: i18n.i18n()[locale].ERROR(),
        text2: i18n.i18n()[locale].NOTIFICATION_transaction_reverted({
            txId: formattedTxId,
        }),
        textLink: i18n.i18n()[locale].NOTIFICATION_SEE_TRANSACTION_DETAILS_ACTION(),
        onPress: () => {
            Linking.openURL(`${network.explorerUrl ?? defaultMainNetwork.explorerUrl}/transactions/${txId}`)
        },
    })
}
