import { Linking } from "react-native"
import { showErrorToast, showSuccessToast } from "~Components"
import { VET, defaultMainNetwork } from "~Constants"
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

    showSuccessToast(
        i18n.i18n()[locale].NOTIFICATION_INCOMING_NFT_TITLE(),
        i18n.i18n()[locale].NOTIFICATION_INCOMING_NFT_BODY({
            alias,
            collectionName: isEmpty(collectionName) ? "" : collectionName + "!",
            from: formattedFrom,
        }),
        i18n.i18n()[locale].NOTIFIACTION_INCOMING_NFT_ACTION(),
        () => informUser({ accountAddress: transfer.to }),
    )
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

    showSuccessToast(
        i18n.i18n()[locale].NOTIFICATION_OUTGOING_NFT_TITLE(),
        i18n.i18n()[locale].NOTIFICATION_OUTGOING_NFT_BODY({
            collectionName,
            to: formattedTo,
        }),
        i18n.i18n()[locale].SUCCESS_GENERIC_VIEW_DETAIL_LINK(),
        () => informUser({ txId, accountAddress: from }),
    )
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
        symbol,
    )

    showSuccessToast(
        i18n.i18n()[locale].NOTIFICATION_INCOMING_NFT_TITLE(),
        i18n.i18n()[locale].NOTIFICATION_found_token_transfer({
            token: symbol,
            amount: formattedAmmount,
            alias,
        }),
        i18n.i18n()[locale].NOTIFICATION_VIEW_ACCOUNT(),
        () => informUser({ accountAddress: transfer.to }),
    )
}

// ~TOKEN - OUTGOING
type InformUserForOutgoingTokenProps = {
    txId: string
    amount: string
    symbol: string
    decimals: number
    transfer: IncomingTransferResponse
    to: string
    informUser: (params: { accountAddress: string; txId?: string }) => void
}

export const InformUserForOutgoingToken = ({
    txId,
    amount,
    symbol,
    decimals,
    to,
    transfer,
    informUser,
}: InformUserForOutgoingTokenProps) => {
    const locale = i18n.detectLocale()

    const formattedTo = ""

    FormattingUtils.humanAddress(to, 4, 5)

    const formattedAmmount = FormattingUtils.humanNumber(
        FormattingUtils.scaleNumberDown(
            amount,
            decimals,
            FormattingUtils.ROUND_DECIMAL_DEFAULT,
        ),
        amount,
        symbol,
    )

    showSuccessToast(
        i18n.i18n()[locale].SUCCESS_GENERIC(),
        i18n.i18n()[locale].NOTIFIACTION_OUTGOING_TOKEN_BODY({
            amount: formattedAmmount,
            to: formattedTo,
        }),
        i18n.i18n()[locale].SUCCESS_GENERIC_VIEW_DETAIL_LINK(),
        () => informUser({ accountAddress: transfer.from, txId }),
    )
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

    const formattedAmmount = FormattingUtils.scaleNumberDown(
        amount,
        VET.decimals,
    )

    showSuccessToast(
        i18n.i18n()[locale].NOTIFICATION_INCOMING_NFT_TITLE(),
        i18n.i18n()[locale].NOTIFICATION_found_token_transfer({
            token: VET.symbol,
            amount: formattedAmmount,
            alias,
        }),
        i18n.i18n()[locale].NOTIFICATION_VIEW_ACCOUNT(),
        () => informUser({ accountAddress: to }),
    )
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
    const formattedAmmount = FormattingUtils.scaleNumberDown(
        amount,
        VET.decimals,
    )

    showSuccessToast(
        i18n.i18n()[locale].SUCCESS_GENERIC(),
        i18n.i18n()[locale].NOTIFIACTION_OUTGOING_TOKEN_BODY({
            amount: formattedAmmount,
            to: fomattedTo,
        }),
        i18n.i18n()[locale].SUCCESS_GENERIC_VIEW_DETAIL_LINK(),
        () => informUser({ accountAddress: from, txId }),
    )
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

    showErrorToast(
        i18n.i18n()[locale].ERROR(),
        i18n.i18n()[locale].NOTIFICATION_transaction_reverted({
            txId: formattedTxId,
        }),
        i18n.i18n()[locale].SUCCESS_GENERIC_VIEW_DETAIL_LINK(),
        () => {
            Linking.openURL(
                `${
                    network.explorerUrl ?? defaultMainNetwork.explorerUrl
                }/transactions/${txId}`,
            )
        },
    )
}
