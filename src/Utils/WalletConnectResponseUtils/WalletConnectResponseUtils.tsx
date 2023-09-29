import { PendingRequestTypes } from "@walletconnect/types"
import { getSdkError } from "@walletconnect/utils"
import { IWeb3Wallet } from "@walletconnect/web3wallet"
import { Certificate } from "thor-devkit"
import { showErrorToast, showSuccessToast } from "~Components"
import HexUtils from "~Utils/HexUtils"
import { error } from "~Utils/Logger"
import WalletConnectUtils from "~Utils/WalletConnectUtils"
import { TranslationFunctions } from "~i18n"

type BaseProps = {
    request: PendingRequestTypes.Struct
    web3Wallet: IWeb3Wallet | undefined
    LL: TranslationFunctions
}

const RCP_INTERNAL_ERROR = -32603

/**
 * Success responses
 */

export const transactionRequestSuccessResponse = async (
    { request, web3Wallet, LL }: BaseProps,
    transactionId: string,
    signer: string,
) => {
    try {
        await web3Wallet?.respondSessionRequest({
            topic: request.topic,
            response: {
                id: request.id,
                jsonrpc: "2.0",
                result: {
                    txid: transactionId,
                    signer: signer,
                },
            },
        })
    } catch (e) {
        showErrorToast({
            text1: LL.NOTIFICATION_wallet_connect_transaction_broadcasted_with_communication_error(),
        })
    }
}

export const signMessageRequestSuccessResponse = async (
    { request, web3Wallet, LL }: BaseProps,
    signature: Buffer,
    cert: Certificate,
) => {
    try {
        await web3Wallet?.respondSessionRequest({
            topic: request.topic,
            response: {
                id: request.id,
                jsonrpc: "2.0",
                result: {
                    annex: {
                        timestamp: cert.timestamp,
                        domain: cert.domain,
                        signer: cert.signer,
                    },
                    signature: HexUtils.addPrefix(signature.toString("hex")),
                },
            },
        })
        showSuccessToast({
            text1: LL.NOTIFICATION_wallet_connect_sign_success(),
        })
    } catch (err: unknown) {
        error("signMessageRequestSuccessResponse", err)
        showErrorToast({
            text1: LL.NOTIFICATION_wallet_connect_matching_error(),
        })
    }
}

/**
 *
 * Error responses
 */

export const transactionRequestFailedResponse = async ({
    request,
    web3Wallet,
    LL,
}: BaseProps) => {
    const response = WalletConnectUtils.formatJsonRpcError(request.id, {
        message: LL.NOTIFICATION_wallet_connect_error_on_transaction(),
        code: RCP_INTERNAL_ERROR,
    })

    try {
        await web3Wallet?.respondSessionRequest({
            topic: request.topic,
            response,
        })
    } catch {
        showErrorToast({
            text1: LL.NOTIFICATION_wallet_connect_matching_error(),
        })
    } finally {
        showErrorToast({
            text1: LL.NOTIFICATION_wallet_connect_error_on_transaction(),
        })
    }
}

export const sponsorSignRequestFailedResponse = async ({
    request,
    web3Wallet,
    LL,
}: BaseProps) => {
    try {
        const formattedResponse = WalletConnectUtils.formatJsonRpcError(
            request.id,
            {
                message:
                    LL.NOTIFICATION_wallet_connect_error_delegating_transaction(),
                code: RCP_INTERNAL_ERROR,
            },
        )

        await web3Wallet?.respondSessionRequest({
            topic: request.topic,
            response: formattedResponse,
        })
    } catch {
        showErrorToast({
            text1: LL.NOTIFICATION_wallet_connect_matching_error(),
        })
    }
}

export const userRejectedMethodsResponse = async ({
    request,
    web3Wallet,
    LL,
}: BaseProps) => {
    try {
        const response = WalletConnectUtils.formatJsonRpcError(
            request.id,
            getSdkError("USER_REJECTED_METHODS"),
        )

        await web3Wallet?.respondSessionRequest({
            topic: request.topic,
            response,
        })
    } catch {
        showErrorToast({
            text1: LL.NOTIFICATION_wallet_connect_matching_error(),
        })
    }
}

export const signMessageRequestErrorResponse = async ({
    request,
    web3Wallet,
    LL,
}: BaseProps) => {
    try {
        const response = WalletConnectUtils.formatJsonRpcError(request.id, {
            message: LL.NOTIFICATION_wallet_connect_error_during_signing(),
            code: RCP_INTERNAL_ERROR,
        })

        await web3Wallet?.respondSessionRequest({
            topic: request.topic,
            response,
        })
    } catch {
        showErrorToast({
            text1: LL.NOTIFICATION_wallet_connect_matching_error(),
        })
    }
}
