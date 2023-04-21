import {
    ROUND_DECIMAL_DEFAULT,
    humanNumber,
    scaleNumberDown,
} from "~Common/Utils/FormattingUtils/FormattingUtils"
import { showErrorToast, showSuccessToast } from "~Components"
import { FungibleToken } from "~Model"
import { useI18nContext } from "~i18n"

/**
 * Hook to show common translated toast notifications
 */
export const useToastNotification = () => {
    const { LL } = useI18nContext()

    /**
     *  Show found token transfer notification
     * @param token  - Token to show
     * @param amount  - Amount to show
     */
    const showFoundTokenTransfer = (token: FungibleToken, amount: string) => {
        showSuccessToast(
            LL.NOTIFICATION_found_token_transfer({
                token: token.symbol.toUpperCase(),
                amount: humanNumber(
                    scaleNumberDown(
                        amount,
                        token.decimals,
                        ROUND_DECIMAL_DEFAULT,
                    ),
                    amount,
                    token.symbol,
                ),
            }),
        )
    }

    /**
     *  Show transaction reverted notification
     * @param txId  - Transaction ID
     */

    const showTransactionReverted = (txId: string) => {
        const message = LL.NOTIFICATION_transaction_reverted({ txId })
        showErrorToast(message)
    }

    return { showFoundTokenTransfer, showTransactionReverted }
}
