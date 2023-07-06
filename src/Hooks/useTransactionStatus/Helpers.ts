import { Linking } from "react-native"
import { ToastType, showErrorToast, showSuccessToast } from "~Components"
import { defaultMainNetwork } from "~Constants"
import { Network, TransactionOrigin } from "~Model"
import * as i18n from "~i18n"

// todo - fix translation based on type and origin
export const getTranslation = (
    txOrigin: TransactionOrigin,
    amount?: string,
) => {
    const locale = i18n.detectLocale()

    // todo - convert ammount to human number

    // todo
    /*
        - I can show a tost saying (you received NFT from other(adddress) to your account(address))
        - If selected account is not included in transfer data, I can still show the toast and on tap of toast I can switch selected account?
        - If selected account is included in transfer data, I can show the toast and on tap of toast I can go to nft tab and refresh by calling the indexer from the begining
    */

    switch (txOrigin) {
        case TransactionOrigin.FROM: {
            return [
                i18n.i18n()[locale].SUCCESS_GENERIC(),
                amount
                    ? i18n.i18n()[locale].NOTIFICATION_found_token_transfer({
                          token: "PLaceholder",
                          amount,
                      })
                    : i18n.i18n()[locale].SUCCESS_GENERIC_OPERATION(),
                i18n.i18n()[locale].SUCCESS_GENERIC_VIEW_DETAIL_LINK(),
            ]
        }

        case TransactionOrigin.TO: {
            return [
                i18n.i18n()[locale].SUCCESS_GENERIC(),
                amount
                    ? i18n.i18n()[locale].NOTIFICATION_found_token_transfer({
                          token: "PLaceholder",
                          amount,
                      })
                    : i18n.i18n()[locale].SUCCESS_GENERIC_OPERATION(),
                i18n.i18n()[locale].SUCCESS_GENERIC_VIEW_DETAIL_LINK(),
            ]
        }

        default: {
            return [
                i18n.i18n()[locale].SUCCESS_GENERIC(),
                i18n.i18n()[locale].SUCCESS_GENERIC_OPERATION(),
                i18n.i18n()[locale].SUCCESS_GENERIC_VIEW_DETAIL_LINK(),
            ]
        }
    }
}

// todo - fix toast info and text based on type and origin
export const informUser = ({
    txId,
    originType,
    toastType,
    network,
    amount,
}: {
    txId: string
    originType: TransactionOrigin
    toastType: ToastType
    network: Network
    amount?: string
}) => {
    const translationKeys = getTranslation(originType, amount)

    if (toastType === ToastType.Error) {
        showErrorToast(
            translationKeys[0], // text 1
            translationKeys[1], // text 2
            translationKeys[2], // link
            async () => {
                await Linking.openURL(
                    `${
                        network.explorerUrl ?? defaultMainNetwork.explorerUrl
                    }/transactions/${txId}`,
                )
            },
        )
    }

    if (toastType === ToastType.Success) {
        showSuccessToast(
            translationKeys[0],
            translationKeys[1],
            translationKeys[2],
            async () => {
                await Linking.openURL(
                    `${
                        network.explorerUrl ?? defaultMainNetwork.explorerUrl
                    }/transactions/${txId}`,
                )
            },
            "transactionSuccessToast",
        )
    }
}
