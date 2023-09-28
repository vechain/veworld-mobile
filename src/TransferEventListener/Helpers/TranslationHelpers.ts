import { Linking } from "react-native"
import { showErrorToast, showSuccessToast } from "~Components"
import { defaultMainNetwork, VET } from "~Constants"
import { Network } from "~Model"
import { FormattingUtils } from "~Utils"
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

    const formattedFrom = FormattingUtils.humanAddress(from, 4, 5)

    showSuccessToast({
        text1: i18n.i18n()[locale].NOTIFICATION_INCOMING_NFT_TITLE(),
        text2: i18n.i18n()[locale].NOTIFICATION_INCOMING_NFT_BODY({
            alias,
            collectionName: isEmpty(collectionName) ? "" : collectionName + "!",
            from: formattedFrom,
        }),
        textLink: i18n.i18n()[locale].NOTIFIACTION_INCOMING_NFT_ACTION(),
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

    const formattedTo = FormattingUtils.humanAddress(to, 4, 5)

    showSuccessToast({
        text1: i18n.i18n()[locale].NOTIFICATION_OUTGOING_NFT_TITLE(),
        text2: i18n.i18n()[locale].NOTIFICATION_OUTGOING_NFT_BODY({
            collectionName,
            to: formattedTo,
        }),
        textLink: i18n.i18n()[locale].SUCCESS_GENERIC_VIEW_DETAIL_LINK(),
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
    alias: string
    transfer: IncomingTransferResponse
    informUser: (params: { accountAddress: string; txId?: string }) => void
}

export const InformUserForIncomingToken = ({
    amount,
    symbol,
    decimals,
    alias,
    transfer,
    informUser,
}: InformUserForIncomingTokenProps) => {
    const locale = i18n.detectLocale()

    const formattedAmmount = FormattingUtils.humanNumber(
        FormattingUtils.scaleNumberDown(
            amount,
            decimals,
            FormattingUtils.ROUND_DECIMAL_DEFAULT,
        ),
        amount,
    )

    showSuccessToast({
        text1: i18n.i18n()[locale].NOTIFICATION_INCOMING_NFT_TITLE(),
        text2: i18n.i18n()[locale].NOTIFICATION_found_token_transfer({
            token: symbol,
            amount: formattedAmmount,
            alias,
        }),
        textLink: i18n.i18n()[locale].NOTIFICATION_VIEW_ACCOUNT(),
        onPress: () => informUser({ accountAddress: transfer.to }),
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
}

export const InformUserForOutgoingToken = ({
    txId,
    amount,
    decimals,
    transfer,
    informUser,
}: InformUserForOutgoingTokenProps) => {
    const locale = i18n.detectLocale()

    const formattedTo = ""

    const formattedAmmount = FormattingUtils.humanNumber(
        FormattingUtils.scaleNumberDown(
            amount,
            decimals,
            FormattingUtils.ROUND_DECIMAL_DEFAULT,
        ),
        amount,
    )

    showSuccessToast({
        text1: i18n.i18n()[locale].SUCCESS_GENERIC(),
        text2: i18n.i18n()[locale].NOTIFIACTION_OUTGOING_TOKEN_BODY({
            amount: formattedAmmount,
            to: formattedTo,
        }),
        textLink: i18n.i18n()[locale].SUCCESS_GENERIC_VIEW_DETAIL_LINK(),
        onPress: () => informUser({ accountAddress: transfer.from, txId }),
        visibilityTime: 7000,
        testID: "informUserForOutgoingTokenSuccessToast",
    })
}

// ~VET - INCOMING
type InformUserForIncomingVETProps = {
    amount: string
    alias: string
    to: string
    informUser: (params: { accountAddress: string; txId?: string }) => void
}

export const InformUserForIncomingVET = ({
    amount,
    alias,
    to,
    informUser,
}: InformUserForIncomingVETProps) => {
    const locale = i18n.detectLocale()

    const formattedAmount = FormattingUtils.humanNumber(
        FormattingUtils.scaleNumberDown(
            amount,
            VET.decimals,
            FormattingUtils.ROUND_DECIMAL_DEFAULT,
        ),
        amount,
    )

    showSuccessToast({
        text1: i18n.i18n()[locale].NOTIFICATION_INCOMING_NFT_TITLE(),
        text2: i18n.i18n()[locale].NOTIFICATION_found_token_transfer({
            token: VET.symbol,
            amount: formattedAmount,
            alias,
        }),
        textLink: i18n.i18n()[locale].NOTIFICATION_VIEW_ACCOUNT(),
        onPress: () => informUser({ accountAddress: to }),
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

export const InformUserForOutgoingVET = ({
    txId,
    amount,
    to,
    from,
    informUser,
}: InformUserForOutgoingTokenVET) => {
    const locale = i18n.detectLocale()

    const fomattedTo = FormattingUtils.humanAddress(to, 4, 5)
    const formattedAmount = FormattingUtils.humanNumber(
        FormattingUtils.scaleNumberDown(
            amount,
            VET.decimals,
            FormattingUtils.ROUND_DECIMAL_DEFAULT,
        ),
        amount,
    )

    showSuccessToast({
        text1: i18n.i18n()[locale].SUCCESS_GENERIC(),
        text2: i18n.i18n()[locale].NOTIFIACTION_OUTGOING_TOKEN_BODY({
            amount: formattedAmount,
            to: fomattedTo,
        }),
        textLink: i18n.i18n()[locale].SUCCESS_GENERIC_VIEW_DETAIL_LINK(),
        onPress: () => informUser({ accountAddress: from, txId }),
        visibilityTime: 7000,
        testID: "InformUserForOutgoingVETSuccessToast",
    })
}

// ~ REVERTED TRANSACTION
export const informUserforRevertedTransaction = ({
    txId,
    network,
}: {
    txId: string
    network: Network
}) => {
    const locale = i18n.detectLocale()
    const formattedTxId = FormattingUtils.humanAddress(txId, 4, 5)

    showErrorToast({
        text1: i18n.i18n()[locale].ERROR(),
        text2: i18n.i18n()[locale].NOTIFICATION_transaction_reverted({
            txId: formattedTxId,
        }),
        textLink: i18n.i18n()[locale].SUCCESS_GENERIC_VIEW_DETAIL_LINK(),
        onPress: () => {
            Linking.openURL(
                `${
                    network.explorerUrl ?? defaultMainNetwork.explorerUrl
                }/transactions/${txId}`,
            )
        },
    })
}
