import { Linking } from "react-native"
import { showErrorToast, showSuccessToast } from "~Components"
import { VET, defaultMainNetwork } from "~Constants"
import { Network } from "~Model"
import { FormattingUtils } from "~Utils"
import * as i18n from "~i18n"
import { isEmpty } from "lodash"

// todo
/*
        - If selected account is not included in transfer data, I can still show the toast and on tap of toast I can switch selected account?
        - If selected account is included in transfer data, I can show the toast and on tap of toast I can go to nft tab and refresh by calling the indexer from the begining
*/

type InformUserForIncomingNFTProps = {
    collectionName: string
    alias: string
    from: string
    action: () => void
}

export const informUSerForIncomingNFT = ({
    collectionName,
    alias,
    from,
    action,
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
        async () => action(), // todo.vas -> GO TO NFT TAB -> CHECK IF accountAddress IS CURRENT ACCOUNT -> IF NOT, SWITCH TO THAT ACCOUNT -> REFRESH NFTS
    )
}

type InformUserForOutgoingNFTProps = {
    txId: string
    to: string
    collectionName: string
    network: Network
}

export const informUserForOutgoingNFT = ({
    txId,
    to,
    collectionName,
    network,
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
        async () => {
            await Linking.openURL(
                `${
                    network.explorerUrl ?? defaultMainNetwork.explorerUrl
                }/transactions/${txId}`,
            )
        },
    )
}

type InformUserForIncomingTokenProps = {
    amount: string
    symbol: string
    decimals: number
    alias: string
    action: () => void
}

export const InformUserForIncomingToken = ({
    amount,
    symbol,
    decimals,
    alias,
    action,
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
        async () => action(), // todo.vas -> CHECK IF accountAddress IS CURRENT ACCOUNT -> IF NOT, SWITCH TO THAT ACCOUNT
    )
}

type InformUserForOutgoingTokenProps = {
    txId: string
    amount: string
    symbol: string
    decimals: number
    network: Network
    to: string
}

export const InformUserForOutgoingToken = ({
    txId,
    amount,
    symbol,
    decimals,
    network,
    to,
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
        async () => {
            await Linking.openURL(
                `${
                    network.explorerUrl ?? defaultMainNetwork.explorerUrl
                }/transactions/${txId}`,
            )
        },
    )
}

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
        async () => {
            await Linking.openURL(
                `${
                    network.explorerUrl ?? defaultMainNetwork.explorerUrl
                }/transactions/${txId}`,
            )
        },
    )
}

type InformUserForIncomingVETProps = {
    amount: string
    alias: string
    action: () => void
}

export const InformUserForIncomingVET = ({
    amount,
    alias,
    action,
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
        async () => action(), // todo.vas -> CHECK IF accountAddress IS CURRENT ACCOUNT -> IF NOT, SWITCH TO THAT ACCOUNT
    )
}

type InformUserForOutgoingTokenVET = {
    txId: string
    amount: string
    network: Network
    to: string
}

export const InformUserForOutgoingVET = ({
    txId,
    amount,
    network,
    to,
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
        async () => {
            await Linking.openURL(
                `${
                    network.explorerUrl ?? defaultMainNetwork.explorerUrl
                }/transactions/${txId}`,
            )
        },
    )
}
